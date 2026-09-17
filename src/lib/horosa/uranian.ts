import { computeNatal, type NatalChart } from "./natal";
import { formatDMS, type BirthInput } from "./types";

export type UranianBody = {
  key: string;
  name: string;
  glyph: string;
  lon: number;
  dms: string;
  dial: number;
};

export type MidpointHit = {
  a: string;
  b: string;
  mid: number;
  dms: string;
  hit: string;
  orb: number;
};

export type UranianResult = {
  natal: NatalChart;
  bodies: UranianBody[];
  midpoints: MidpointHit[];
};

/** Mean longitudes of Hamburg School TNPs (Witte / Sieggrün), deg/day from J2000. */
const TNP: { key: string; name: string; glyph: string; lon0: number; daily: number }[] = [
  { key: "Cupido", name: "丘比特", glyph: "♀", lon0: 272.5, daily: 0.00137 },
  { key: "Hades", name: "哈德斯", glyph: "♀", lon0: 176.8, daily: 0.00098 },
  { key: "Zeus", name: "宙斯", glyph: "♂", lon0: 72.4, daily: 0.00081 },
  { key: "Kronos", name: "克洛诺斯", glyph: "♔", lon0: 251.3, daily: 0.00062 },
  { key: "Apollon", name: "阿波罗", glyph: "☀", lon0: 114.6, daily: 0.00048 },
  { key: "Admetos", name: "阿德墨托斯", glyph: "⚓", lon0: 307.1, daily: 0.00041 },
  { key: "Vulkanus", name: "武尔坎努斯", glyph: "⚒", lon0: 23.9, daily: 0.00033 },
  { key: "Poseidon", name: "波塞冬", glyph: "♆", lon0: 338.7, daily: 0.00027 },
];

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

function dial90(lon: number) {
  return lon % 90;
}

export function computeUranian(b: BirthInput): UranianResult {
  const natal = computeNatal(b);
  const utc = Date.UTC(b.year, b.month - 1, b.day, b.hour, b.minute) / 86400000;
  const d = utc + 2440587.5 - 2451545.0;
  const planets = natal.planets.filter((p) => !p.modern || p.key === "Uranus");
  const bodies: UranianBody[] = [
    ...planets.map((p) => ({
      key: p.key,
      name: p.name,
      glyph: p.glyph,
      lon: p.lon,
      dms: p.dms,
      dial: dial90(p.lon),
    })),
    { key: "ASC", name: "升", glyph: "Asc", lon: natal.asc, dms: formatDMS(natal.asc), dial: dial90(natal.asc) },
    { key: "MC", name: "顶", glyph: "MC", lon: natal.mc, dms: formatDMS(natal.mc), dial: dial90(natal.mc) },
    ...TNP.map((t) => {
      const lon = norm(t.lon0 + t.daily * d);
      return { key: t.key, name: t.name, glyph: t.glyph, lon, dms: formatDMS(lon), dial: dial90(lon) };
    }),
  ];

  const core = bodies.filter((x) =>
    ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "ASC", "MC"].includes(x.key),
  );
  const midpoints: MidpointHit[] = [];
  for (let i = 0; i < core.length; i++) {
    for (let j = i + 1; j < core.length; j++) {
      const mid = norm((core[i].lon + core[j].lon) / 2);
      const alt = norm(mid + 180);
      let best: MidpointHit | null = null;
      for (const t of bodies) {
        if (t.key === core[i].key || t.key === core[j].key) continue;
        for (const m of [mid, alt]) {
          const dlt = Math.min(Math.abs(t.lon - m), 360 - Math.abs(t.lon - m));
          const dial = Math.min(Math.abs(dial90(t.lon) - dial90(m)), 90 - Math.abs(dial90(t.lon) - dial90(m)));
          const orb = Math.min(dlt, dial);
          if (orb < 1.2 && (!best || orb < best.orb)) {
            best = {
              a: core[i].name,
              b: core[j].name,
              mid,
              dms: formatDMS(mid),
              hit: t.name,
              orb: Number(orb.toFixed(2)),
            };
          }
        }
      }
      if (best) midpoints.push(best);
    }
  }
  midpoints.sort((a, b) => a.orb - b.orb);
  return { natal, bodies, midpoints: midpoints.slice(0, 36) };
}
