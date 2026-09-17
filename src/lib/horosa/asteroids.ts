import { type BirthInput } from "./types";
import { calcAsteroid, julianOf, trySwissNatal } from "./sweph";
import { computeNatal } from "./natal";
import { formatDMS } from "./types";

export type PackedAsteroid = {
  n: number;
  name: string;
  packed: boolean;
};

export type AsteroidRow = PackedAsteroid & {
  lon: number;
  dms: string;
  sign: string;
  retro: boolean;
};

export type AsteroidCatalog = {
  count: number;
  bytes: number;
  packed: number[];
  names: Record<string, string>;
};

const FAMOUS: { n: number; name: string; zh: string }[] = [
  { n: 1, name: "Ceres", zh: "谷神星" },
  { n: 2, name: "Pallas", zh: "智神星" },
  { n: 3, name: "Juno", zh: "婚神星" },
  { n: 4, name: "Vesta", zh: "灶神星" },
  { n: 5, name: "Astraea", zh: "正义星" },
  { n: 6, name: "Hebe", zh: "青春星" },
  { n: 7, name: "Iris", zh: "彩虹星" },
  { n: 8, name: "Flora", zh: "花神星" },
  { n: 10, name: "Hygiea", zh: "卫生星" },
  { n: 16, name: "Psyche", zh: "灵神星" },
  { n: 433, name: "Eros", zh: "爱神星" },
  { n: 134340, name: "Pluto", zh: "冥王星" },
];

let catalogCache: AsteroidCatalog | null = null;

export async function loadAsteroidCatalog(): Promise<AsteroidCatalog> {
  if (catalogCache) return catalogCache;
  try {
    const r = await fetch("/asteroids.json");
    if (r.ok) {
      catalogCache = (await r.json()) as AsteroidCatalog;
      return catalogCache;
    }
  } catch {
    /* offline first-run without the json */
  }
  catalogCache = {
    count: 0,
    bytes: 0,
    packed: FAMOUS.map((f) => f.n).filter((n) => n < 10000),
    names: Object.fromEntries(FAMOUS.map((f) => [String(f.n), f.name])),
  };
  return catalogCache;
}

export function displayName(n: number, names: Record<string, string>) {
  const f = FAMOUS.find((x) => x.n === n);
  const en = names[String(n)] || f?.name || `SE ${n}`;
  return f ? `${f.zh} ${en}` : en;
}

export async function computeFamousAsteroids(b: BirthInput): Promise<AsteroidRow[]> {
  const cat = await loadAsteroidCatalog();
  const jd = await julianOf(b);
  const packed = new Set(cat.packed);
  const ids = FAMOUS.map((f) => f.n).filter((n) => n < 10000);
  if (jd == null) {
    const natal = computeNatal(b, false, "placidus");
    const map: Record<string, string> = { Ceres: "谷神", Pallas: "智神", Juno: "婚神", Vesta: "灶神", Chiron: "凯龙" };
    return natal.planets
      .filter((p) => map[p.key])
      .map((p, i) => ({
        n: i + 1,
        name: map[p.key],
        packed: true,
        lon: p.lon,
        dms: p.dms,
        sign: p.sign,
        retro: p.retro,
      }));
  }
  const rows: AsteroidRow[] = [];
  for (const n of ids) {
    const hit = await calcAsteroid(jd, n);
    if (!hit) continue;
    rows.push({
      n,
      name: displayName(n, cat.names),
      packed: packed.has(n) || n <= 4,
      lon: hit.lon,
      dms: hit.dms,
      sign: hit.sign,
      retro: hit.retro,
    });
  }
  if (!rows.length) {
    const swiss = await trySwissNatal(b);
    const src = swiss ?? computeNatal(b);
    for (const p of src.planets) {
      if (!["Ceres", "Pallas", "Juno", "Vesta", "Chiron"].includes(p.key)) continue;
      const nums: Record<string, number> = { Ceres: 1, Pallas: 2, Juno: 3, Vesta: 4, Chiron: 2060 };
      rows.push({
        n: nums[p.key] ?? 0,
        name: p.name,
        packed: true,
        lon: p.lon,
        dms: formatDMS(p.lon),
        sign: p.sign,
        retro: p.retro,
      });
    }
  }
  return rows;
}

export async function computeOneAsteroid(b: BirthInput, n: number): Promise<AsteroidRow | null> {
  const cat = await loadAsteroidCatalog();
  const jd = await julianOf(b);
  if (jd == null) return null;
  const hit = await calcAsteroid(jd, n);
  if (!hit) return null;
  return {
    n,
    name: displayName(n, cat.names),
    packed: cat.packed.includes(n) || n <= 4,
    lon: hit.lon,
    dms: hit.dms,
    sign: hit.sign,
    retro: hit.retro,
  };
}
