import { computeNatal, type NatalChart } from "./natal";
import { nowAsBirth } from "./cities";
import { formatDMS, type BirthInput } from "./types";

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
  };
}

export { formatDMS };
