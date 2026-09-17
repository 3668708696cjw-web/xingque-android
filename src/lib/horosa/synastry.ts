import { computeNatal, type NatalChart, visiblePlanets } from "./natal";
import { cityOf, localToUtc } from "./cities";
import { formatDMS, type BirthInput } from "./types";

function circMid(a: number, b: number) {
  const d = ((b - a + 540) % 360) - 180;
  return ((a + d / 2) % 360 + 360) % 360;
}

export type SynHit = { t: string; hard: boolean; orb: number };

export function synastryHits(a: NatalChart, b: NatalChart, orbMax = 4): SynHit[] {
  const out: SynHit[] = [];
  const pa = visiblePlanets(a, false);
  const pb = visiblePlanets(b, false);
  pa.forEach((p1) => {
    pb.forEach((p2) => {
      const d = Math.abs(p1.lon - p2.lon);
      const sep = Math.min(d, 360 - d);
      for (const [ang, name, hard] of [
        [0, "合", false],
        [60, "六合", false],
        [90, "刑", true],
        [120, "三合", false],
        [180, "冲", true],
      ] as const) {
        const orb = Math.abs(sep - ang);
        if (orb < orbMax) out.push({ t: `${p1.name} ${name} ${p2.name}`, hard, orb: Number(orb.toFixed(2)) });
      }
    });
  });
  return out.sort((x, y) => x.orb - y.orb).slice(0, 28);
}

export function computeComposite(a: NatalChart, b: NatalChart): NatalChart {
  const planets = a.planets.map((p) => {
    const q = b.planets.find((x) => x.key === p.key);
    const lon = q ? circMid(p.lon, q.lon) : p.lon;
    return { ...p, lon, dms: formatDMS(lon) };
  });
  const asc = circMid(a.asc, b.asc);
  const mc = circMid(a.mc, b.mc);
  return {
    ...a,
    datetime: `${a.datetime} ⊕ ${b.datetime}`,
    city: `${a.city}·${b.city}`,
    asc,
    mc,
    dsc: (asc + 180) % 360,
    ic: (mc + 180) % 360,
    planets,
    aspects: a.aspects,
  };
}

export function computeDavison(a: BirthInput, b: BirthInput): NatalChart {
  const ca = cityOf(a);
  const cb = cityOf(b);
  const ta = localToUtc(a.year, a.month, a.day, a.hour, a.minute, ca.tz).getTime();
  const tb = localToUtc(b.year, b.month, b.day, b.hour, b.minute, cb.tz).getTime();
  const utc = new Date((ta + tb) / 2);
  const tz = (ca.tz + cb.tz) / 2;
  const wall = new Date(utc.getTime() + tz * 3600000);
  const dlon = ((cb.lon - ca.lon + 540) % 360) - 180;
  const mid: BirthInput = {
    name: "时空中点",
    gender: a.gender,
    year: wall.getUTCFullYear(),
    month: wall.getUTCMonth() + 1,
    day: wall.getUTCDate(),
    hour: wall.getUTCHours(),
    minute: wall.getUTCMinutes(),
    cityId: a.cityId,
    lat: (ca.lat + cb.lat) / 2,
    lon: ca.lon + dlon / 2,
    tz,
    place: `${ca.name}·${cb.name}`,
  };
  return computeNatal(mid);
}

export function computeMidpointChart(a: NatalChart, b: NatalChart): NatalChart {
  return computeComposite(a, b);
}
