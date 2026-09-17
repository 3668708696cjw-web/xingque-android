import { computeNatal, type NatalChart, type PlanetPos } from "./natal";
import { formatDMS, type BirthInput } from "./types";

export const NAK = [
  "娄宿", "胃宿", "昴宿", "毕宿", "觜宿", "参宿", "井宿", "鬼宿", "柳宿",
  "星宿", "张宿", "翼宿", "轸宿", "角宿", "亢宿", "氐宿", "房宿", "心宿",
  "尾宿", "箕宿", "斗宿", "女宿", "虚宿", "危宿", "室宿", "壁宿", "奎宿",
];
export const NAK_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const LORDS = ["Ketu", "金", "日", "月", "火", "罗睺", "木", "土", "水"];
const YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

export type NakItem = { name: string; en: string; pada: number; lord: string };
export type Dasha = { lord: string; years: number; fromAge: number; toAge: number; current: boolean };

export type VedicResult = {
  natal: NatalChart;
  navamsa: NatalChart;
  nak: Record<string, NakItem>;
  dasha: Dasha[];
  moonNak: NakItem;
};

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

export function nakOf(lon: number): NakItem {
  const n = norm(lon);
  const span = 360 / 27;
  const i = Math.min(26, Math.floor(n / span));
  const pada = Math.min(4, Math.floor((n % span) / (span / 4)) + 1);
  return { name: NAK[i], en: NAK_EN[i], pada, lord: LORDS[i % 9] };
}

/** Navamsa (D9): each 3°20' pada maps to a sign; movable from itself, fixed from 9th, dual from 5th. */
export function navamsaLon(lon: number): number {
  const n = norm(lon);
  const sign = Math.floor(n / 30);
  const deg = n % 30;
  const pada = Math.min(8, Math.floor(deg / (10 / 3)));
  const frac = deg - pada * (10 / 3);
  const start = [0, 8, 4][sign % 3];
  return ((sign + start + pada) % 12) * 30 + frac * 9;
}

export function computeNavamsa(natal: NatalChart): NatalChart {
  const planets = natal.planets.map((p) => {
    const lon = navamsaLon(p.lon);
    return { ...p, lon, dms: formatDMS(lon) };
  });
  const asc = navamsaLon(natal.asc);
  const mc = navamsaLon(natal.mc);
  const ascSign = Math.floor(asc / 30);
  const houses = Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
  return {
    ...natal,
    asc,
    mc,
    dsc: (asc + 180) % 360,
    ic: (mc + 180) % 360,
    houses,
    houseSystem: "whole",
    planets: planets.map((p) => {
      const sign = Math.floor(norm(p.lon) / 30);
      return { ...p, house: ((sign - ascSign + 12) % 12) + 1 };
    }),
  };
}

export function computeVedic(b: BirthInput): VedicResult {
  const natal = computeNatal(b, true, "whole");
  const navamsa = computeNavamsa(natal);
  const nak: Record<string, NakItem> = {};
  natal.planets.forEach((p) => {
    nak[p.key] = nakOf(p.lon);
  });
  const moon = natal.planets.find((p) => p.key === "Moon")!;
  const moonNak = nakOf(moon.lon);
  const startLord = LORDS.indexOf(moonNak.lord);
  const span = 360 / 27;
  const used = (norm(moon.lon) % span) / span;
  const remain = YEARS[startLord] * (1 - used);
  const now = new Date();
  let age = now.getFullYear() - b.year;
  if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age -= 1;
  age = Math.max(0, age);
  const dasha: Dasha[] = [];
  let cursor = 0;
  dasha.push({
    lord: LORDS[startLord],
    years: Number(remain.toFixed(2)),
    fromAge: 0,
    toAge: remain,
    current: age < remain,
  });
  cursor = remain;
  for (let k = 1; k < 9; k++) {
    const i = (startLord + k) % 9;
    const fromAge = cursor;
    cursor += YEARS[i];
    dasha.push({
      lord: LORDS[i],
      years: YEARS[i],
      fromAge: Number(fromAge.toFixed(2)),
      toAge: Number(cursor.toFixed(2)),
      current: age >= fromAge && age < cursor,
    });
  }
  return { natal, navamsa, nak, dasha, moonNak };
}

export type { PlanetPos };
export { formatDMS };
