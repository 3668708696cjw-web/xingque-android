import { computeNatal, type NatalChart } from "./natal";
import { nowAsBirth } from "./cities";
import { SIGNS, formatDMS, type BirthInput } from "./types";

const FIRDARIA_DAY = ["太阳", "金星", "水星", "月亮", "土星", "木星", "火星", "北交", "南交"];
const FIRDARIA_NIGHT = ["月亮", "土星", "木星", "火星", "北交", "南交", "太阳", "金星", "水星"];
const FIRDARIA_YEARS = [10, 8, 13, 9, 11, 12, 7, 3, 2];
const PROFECTION = ["1命", "2财", "3兄", "4家", "5子", "6病", "7偶", "8危", "9迁", "10业", "11福", "12隐"];

export type TransitHit = { natal: string; trans: string; type: string; orb: number };
export type Firdaria = { lord: string; fromAge: number; toAge: number; current: boolean };

export type TransitResult = {
  natal: NatalChart;
  now: NatalChart;
  hits: TransitHit[];
  solarReturn: NatalChart;
  solarArc: { name: string; lon: number; dms: string }[];
  progressed: NatalChart;
  firdaria: Firdaria[];
  profection: string;
  age: number;
  lunarReturn: NatalChart;
  releasing: ZrPeriod[];
  decennials: Decennial[];
  ephemeris: { day: number; sun: string; moon: string; mercury: string }[];
};

function ageYears(b: BirthInput, now = new Date()) {
  let age = now.getFullYear() - b.year;
  if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age -= 1;
  return Math.max(0, age);
}

function hitsOf(natal: NatalChart, moving: NatalChart, orbMax = 3): TransitHit[] {
  const hits: TransitHit[] = [];
  const aspects = [
    { a: 0, n: "合" },
    { a: 60, n: "六合" },
    { a: 90, n: "刑" },
    { a: 120, n: "三合" },
    { a: 180, n: "冲" },
  ];
  natal.planets.forEach((np) => {
    if (np.modern) return;
    moving.planets.forEach((tp) => {
      if (tp.modern) return;
      const d = Math.abs(np.lon - tp.lon);
      const sep = Math.min(d, 360 - d);
      for (const asp of aspects) {
        const orb = Math.abs(sep - asp.a);
        if (orb < orbMax) hits.push({ natal: np.name, trans: tp.name, type: asp.n, orb: Number(orb.toFixed(2)) });
      }
    });
  });
  return hits.sort((a, b) => a.orb - b.orb).slice(0, 24);
}

export function computeTransits(b: BirthInput): TransitResult {
  const natal = computeNatal(b);
  const nowBirth = nowAsBirth(b.cityId);
  const now = computeNatal(nowBirth);
  const hits = hitsOf(natal, now, 2.5);
  const sr: BirthInput = { ...b, year: nowBirth.year };
  const solarReturn = computeNatal(sr);
  const age = ageYears(b);
  const progressedBirth: BirthInput = { ...b };
  const base = new Date(b.year, b.month - 1, b.day);
  base.setDate(base.getDate() + age);
  progressedBirth.year = base.getFullYear();
  progressedBirth.month = base.getMonth() + 1;
  progressedBirth.day = base.getDate();
  const progressed = computeNatal(progressedBirth);
  const solarArc = natal.planets
    .filter((p) => !p.modern)
    .map((p) => {
      const lon = (p.lon + age) % 360;
      return { name: p.name, lon, dms: formatDMS(lon) };
    });
  const day = b.hour >= 6 && b.hour < 18;
  const seq = day ? FIRDARIA_DAY : FIRDARIA_NIGHT;
  let cursor = 0;
  const firdaria: Firdaria[] = seq.map((lord, i) => {
    const fromAge = cursor;
    cursor += FIRDARIA_YEARS[i];
    return { lord, fromAge, toAge: cursor, current: age >= fromAge && age < cursor };
  });
  const lunarReturn = lunarReturnOf(b, nowBirth);
  return {
    natal,
    now,
    hits,
    solarReturn,
    solarArc,
    progressed,
    firdaria,
    profection: PROFECTION[age % 12],
    age,
    lunarReturn,
    releasing: zodiacalReleasing(natal, age),
    decennials: computeDecennials(natal, b, age),
    ephemeris: monthEphemeris(nowBirth),
  };
}

function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}

const ZR_YEARS = [15, 8, 20, 25, 19, 20, 8, 15, 12, 27, 30, 12];
const ZR_SUM = ZR_YEARS.reduce((a, b) => a + b, 0);

export type ZrPeriod = {
  level: 1 | 2;
  sign: string;
  fromAge: number;
  toAge: number;
  current: boolean;
  peak: boolean;
};

function zodiacalReleasing(natal: NatalChart, age: number): ZrPeriod[] {
  const fortune = natal.planets.find((p) => p.key === "Moon");
  const sun = natal.planets.find((p) => p.key === "Sun");
  const day = (sun?.lon ?? 0) > 0;
  const lot = day
    ? norm360(natal.asc + (fortune?.lon ?? 0) - (sun?.lon ?? 0))
    : norm360(natal.asc + (sun?.lon ?? 0) - (fortune?.lon ?? 0));
  const start = Math.floor(lot / 30);
  const out: ZrPeriod[] = [];
  let cursor = 0;
  for (let i = 0; i < 12; i++) {
    const si = (start + i) % 12;
    const years = ZR_YEARS[si];
    const fromAge = cursor;
    const toAge = cursor + years;
    const current = age >= fromAge && age < toAge;
    out.push({
      level: 1,
      sign: SIGNS[si].name,
      fromAge,
      toAge,
      current,
      peak: si === start || (si + 6) % 12 === start,
    });
    if (current) {
      let sub = fromAge;
      for (let j = 0; j < 12; j++) {
        const sj = (si + j) % 12;
        const span = (ZR_YEARS[sj] / ZR_SUM) * years;
        const sFrom = sub;
        const sTo = sub + span;
        out.push({
          level: 2,
          sign: SIGNS[sj].name,
          fromAge: Number(sFrom.toFixed(2)),
          toAge: Number(sTo.toFixed(2)),
          current: age >= sFrom && age < sTo,
          peak: sj === si,
        });
        sub = sTo;
      }
    }
    cursor = toAge;
  }
  return out;
}

const CHALDEAN = ["太阳", "金星", "水星", "月亮", "土星", "木星", "火星"] as const;

export type Decennial = { lord: string; fromAge: number; toAge: number; current: boolean };

function computeDecennials(natal: NatalChart, b: BirthInput, age: number): Decennial[] {
  const sun = natal.planets.find((p) => p.key === "Sun");
  const day = b.hour >= 6 && b.hour < 18;
  const start = day ? 0 : 3;
  const span = 10 + 9 / 12;
  return Array.from({ length: 7 }, (_, i) => {
    const fromAge = i * span;
    const toAge = fromAge + span;
    return {
      lord: CHALDEAN[(start + i) % 7],
      fromAge: Number(fromAge.toFixed(2)),
      toAge: Number(toAge.toFixed(2)),
      current: age >= fromAge && age < toAge,
    };
  });
}

function monthEphemeris(now: BirthInput) {
  const days = 10;
  const out: { day: number; sun: string; moon: string; mercury: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now.year, now.month - 1, now.day + i, 12, 0, 0);
    const b: BirthInput = {
      ...now,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: 12,
      minute: 0,
    };
    const c = computeNatal(b, false, "whole");
    const p = (k: string) => c.planets.find((x) => x.key === k);
    out.push({
      day: b.day,
      sun: p("Sun")?.dms ?? "",
      moon: p("Moon")?.dms ?? "",
      mercury: p("Mercury")?.dms ?? "",
    });
  }
  return out;
}

function lunarReturnOf(b: BirthInput, nowBirth: BirthInput): NatalChart {
  const natal = computeNatal(b);
  const moon0 = natal.planets.find((p) => p.key === "Moon")?.lon ?? 0;
  let best = computeNatal({ ...nowBirth });
  let bestDiff = 180;
  for (let d = -2; d <= 2; d++) {
    const dt = new Date(nowBirth.year, nowBirth.month - 1, nowBirth.day + d, nowBirth.hour, nowBirth.minute);
    const probe: BirthInput = {
      ...nowBirth,
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
    };
    const c = computeNatal(probe);
    const moon = c.planets.find((p) => p.key === "Moon")?.lon ?? 0;
    const sep = Math.min(Math.abs(moon - moon0), 360 - Math.abs(moon - moon0));
    if (sep < bestDiff) {
      bestDiff = sep;
      best = c;
    }
  }
  return best;
}
