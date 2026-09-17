import { computeNatal, type NatalChart, type PlanetPos } from "./natal";
import { formatDMS, type BirthInput } from "./types";

export type DirectedHit = {
  moved: string;
  natal: string;
  type: string;
  age: number;
  year: number;
  arc: number;
};

export type DirectionsResult = {
  natal: NatalChart;
  age: number;
  ptolemy: { name: string; lon: number; dms: string }[];
  naibod: { name: string; lon: number; dms: string }[];
  hits: DirectedHit[];
};

const NAIBOD = 0.985647358; // deg / year
const ASPECTS = [
  { a: 0, n: "合" },
  { a: 60, n: "六合" },
  { a: 90, n: "刑" },
  { a: 120, n: "三合" },
  { a: 180, n: "冲" },
];

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

function ageYears(b: BirthInput, now = new Date()) {
  let age = now.getFullYear() - b.year;
  if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age -= 1;
  return Math.max(0, age);
}

function dirList(planets: PlanetPos[], asc: number, mc: number, arc: number) {
  const pts = [
    { name: "升", lon: norm(asc + arc) },
    { name: "顶", lon: norm(mc + arc) },
    ...planets.filter((p) => !p.modern).map((p) => ({ name: p.name, lon: norm(p.lon + arc) })),
  ];
  return pts.map((p) => ({ ...p, dms: formatDMS(p.lon) }));
}

export function computeDirections(b: BirthInput): DirectionsResult {
  const natal = computeNatal(b);
  const age = ageYears(b);
  const ptolemy = dirList(natal.planets, natal.asc, natal.mc, age);
  const naibod = dirList(natal.planets, natal.asc, natal.mc, age * NAIBOD);
  const natalPts = [
    { name: "升", lon: natal.asc },
    { name: "顶", lon: natal.mc },
    ...natal.planets.filter((p) => !p.modern).map((p) => ({ name: p.name, lon: p.lon })),
  ];
  const hits: DirectedHit[] = [];
  for (let yr = 0; yr <= 90; yr++) {
    const arc = yr * NAIBOD;
    for (const moved of natalPts) {
      const lon = norm(moved.lon + arc);
      for (const np of natalPts) {
        if (moved.name === np.name) continue;
        const sep = Math.min(Math.abs(lon - np.lon), 360 - Math.abs(lon - np.lon));
        for (const asp of ASPECTS) {
          if (Math.abs(sep - asp.a) < 0.45) {
            hits.push({
              moved: moved.name,
              natal: np.name,
              type: asp.n,
              age: yr,
              year: b.year + yr,
              arc: Number(arc.toFixed(2)),
            });
          }
        }
      }
    }
  }
  const uniq: DirectedHit[] = [];
  const seen = new Set<string>();
  for (const h of hits) {
    const k = `${h.age}|${h.moved}|${h.type}|${h.natal}`;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(h);
  }
  const around = uniq.filter((h) => Math.abs(h.age - age) <= 12).slice(0, 40);
  return { natal, age, ptolemy, naibod, hits: around.length ? around : uniq.slice(0, 40) };
}
