import {
  dignityOf,
  houseOfCusp,
  type HouseSystem,
  type NatalChart,
  type PlanetKey,
  type PlanetPos,
} from "./natal";
import { cityOf, localToUtc } from "./cities";
import { formatDMS, formatDeg, signOf, type BirthInput } from "./types";

type SweApi = {
  init: (wasmPath?: string) => Promise<void>;
  julianDay: (y: number, m: number, d: number, hour?: number) => number;
  loadEphemerisFiles: (files: Array<{ name: string; url: string }>) => Promise<void>;
  calculatePosition: (jd: number, body: number, flags?: number) => {
    longitude: number;
    latitude: number;
    longitudeSpeed: number;
    flags: number;
  };
  calculateHouses: (jd: number, lat: number, lon: number, sys?: string) => {
    cusps: number[];
    ascendant: number;
    mc: number;
    armc: number;
    vertex: number;
  };
  setSiderealMode: (mode: number) => void;
  getAyanamsa: (jd: number) => number;
  version: () => string;
};

const FLAG_SWISS = 2;
const FLAG_MOSHIER = 4;
const FLAG_SPEED = 256;
const FLAG_SIDEREAL = 65536;
const LAHIRI = 1;

const HOUSE_CODE: Record<HouseSystem, string> = {
  placidus: "P",
  equal: "A",
  whole: "W",
  koch: "K",
  regio: "R",
  campanus: "C",
  alcabitius: "B",
};

type BodySpec = {
  key: PlanetKey;
  body: number;
  name: string;
  glyph: string;
  modern?: boolean;
};

const BODIES: BodySpec[] = [
  { key: "Sun", body: 0, name: "太阳", glyph: "☉" },
  { key: "Moon", body: 1, name: "月亮", glyph: "☽" },
  { key: "Mercury", body: 2, name: "水星", glyph: "☿" },
  { key: "Venus", body: 3, name: "金星", glyph: "♀" },
  { key: "Mars", body: 4, name: "火星", glyph: "♂" },
  { key: "Jupiter", body: 5, name: "木星", glyph: "♃" },
  { key: "Saturn", body: 6, name: "土星", glyph: "♄" },
  { key: "Uranus", body: 7, name: "天王", glyph: "♅", modern: true },
  { key: "Neptune", body: 8, name: "海王", glyph: "♆", modern: true },
  { key: "Pluto", body: 9, name: "冥王", glyph: "♇", modern: true },
  { key: "Node", body: 11, name: "北交", glyph: "☊" },
  { key: "Lilith", body: 12, name: "月黎", glyph: "⚸", modern: true },
  { key: "Chiron", body: 15, name: "凯龙", glyph: "⚷", modern: true },
  { key: "Pholus", body: 16, name: "福禄", glyph: "⚷", modern: true },
  { key: "Ceres", body: 17, name: "谷神", glyph: "⚳", modern: true },
  { key: "Pallas", body: 18, name: "智神", glyph: "⚴", modern: true },
  { key: "Juno", body: 19, name: "婚神", glyph: "⚵", modern: true },
  { key: "Vesta", body: 20, name: "灶神", glyph: "⚶", modern: true },
];

const ASPECTS = [
  { angle: 0, type: "conjunction", typeZh: "合", orb: 8 },
  { angle: 60, type: "sextile", typeZh: "六合", orb: 4 },
  { angle: 90, type: "square", typeZh: "刑", orb: 6 },
  { angle: 120, type: "trine", typeZh: "三合", orb: 6 },
  { angle: 180, type: "opposition", typeZh: "冲", orb: 8 },
];

function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}

function seCentury(year: number): string {
  if (year >= 0) {
    const c = Math.floor(year / 600) * 6;
    return String(c).padStart(2, "0");
  }
  const c = Math.ceil(Math.abs(year) / 600) * 6;
  return `m${String(c).padStart(2, "0")}`;
}

function seFileNames(year: number): string[] {
  const c = seCentury(year);
  const stem = c.startsWith("m") ? `sepl${c}.se1` : `sepl_${c}.se1`;
  const moon = stem.replace("sepl", "semo");
  const ast = stem.replace("sepl", "seas");
  return [stem, moon, ast];
}

let swe: SweApi | null = null;
let initTried = false;
let loaded = new Set<string>();
let swissFlag = FLAG_MOSHIER | FLAG_SPEED;
let versionStr = "";

export function swissVersion() {
  return versionStr;
}

export function swissReady() {
  return Boolean(swe);
}

async function getSwe(): Promise<SweApi | null> {
  if (typeof window === "undefined") return null;
  if (initTried) return swe;
  initTried = true;
  try {
    const mod = (await import("@swisseph/browser")) as {
      default?: new () => SweApi;
      SwissEphemeris?: new () => SweApi;
    };
    const Ctor = mod.SwissEphemeris ?? mod.default;
    if (!Ctor) return null;
    const inst = new Ctor();
    await inst.init("/swisseph.wasm");
    swe = inst;
    versionStr = inst.version?.() || "Swiss";
    return swe;
  } catch {
    swe = null;
    return null;
  }
}

async function ensureFiles(year: number) {
  if (!swe) return;
  const names = seFileNames(year).filter((n) => !loaded.has(n));
  if (!names.length) return;
  const files = names.map((name) => ({ name, url: `/ephe/${name}` }));
  try {
    await swe.loadEphemerisFiles(files);
    names.forEach((n) => loaded.add(n));
    swissFlag = FLAG_SWISS | FLAG_SPEED;
  } catch {
    /* keep Moshier; files may 404 in the web build without the GB pack */
  }
}

export async function loadAsteroidFile(n: number) {
  if (!swe) await getSwe();
  if (!swe) return false;
  const folder = `ast${Math.floor(n / 1000)}`;
  const name = `se${String(n).padStart(5, "0")}.se1`;
  const key = `${folder}/${name}`;
  if (loaded.has(key) || loaded.has(name)) return true;
  try {
    await swe.loadEphemerisFiles([
      { name, url: `/ephe/${folder}/${name}` },
    ]);
    loaded.add(name);
    loaded.add(key);
    return true;
  } catch {
    return false;
  }
}

export async function calcBody(jd: number, body: number, sidereal = false) {
  if (!swe) return null;
  const flags = swissFlag | (sidereal ? FLAG_SIDEREAL : 0);
  try {
    return swe.calculatePosition(jd, body, flags);
  } catch {
    try {
      return swe.calculatePosition(jd, body, FLAG_MOSHIER | FLAG_SPEED | (sidereal ? FLAG_SIDEREAL : 0));
    } catch {
      return null;
    }
  }
}

export type AsteroidHit = {
  n: number;
  name: string;
  lon: number;
  lat: number;
  speed: number;
  dms: string;
  sign: string;
  retro: boolean;
};

export async function calcAsteroid(jd: number, n: number, sidereal = false): Promise<AsteroidHit | null> {
  const known: Record<number, number> = { 1: 17, 2: 18, 3: 19, 4: 20 };
  const body = known[n] ?? 10000 + n;
  if (!known[n]) {
    const ok = await loadAsteroidFile(n);
    if (!ok && n > 20) return null;
  }
  const pos = await calcBody(jd, body, sidereal);
  if (!pos) return null;
  const lon = norm360(pos.longitude);
  const s = signOf(lon);
  return {
    n,
    name: String(n),
    lon,
    lat: pos.latitude,
    speed: pos.longitudeSpeed,
    dms: formatDMS(lon),
    sign: s.name,
    retro: pos.longitudeSpeed < 0,
  };
}

export async function julianOf(b: BirthInput): Promise<number | null> {
  const api = await getSwe();
  if (!api) return null;
  const city = cityOf(b);
  const utc = localToUtc(b.year, b.month, b.day, b.hour, b.minute, city.tz);
  const hour = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  return api.julianDay(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), hour);
}

export async function trySwissNatal(
  b: BirthInput,
  sidereal = false,
  houseSystem: HouseSystem = "placidus",
): Promise<NatalChart | null> {
  const api = await getSwe();
  if (!api) return null;
  await ensureFiles(b.year);
  if (sidereal) {
    try {
      api.setSiderealMode(LAHIRI);
    } catch {
      /* ignore */
    }
  }
  const city = cityOf(b);
  const utc = localToUtc(b.year, b.month, b.day, b.hour, b.minute, city.tz);
  const hour = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  const jd = api.julianDay(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), hour);
  const flags = swissFlag | (sidereal ? FLAG_SIDEREAL : 0);
  let houses;
  try {
    houses = api.calculateHouses(jd, city.lat, city.lon, HOUSE_CODE[houseSystem] ?? "P");
  } catch {
    return null;
  }
  const cuspsRaw = houses.cusps ?? [];
  const cusps = (cuspsRaw.length >= 13 ? cuspsRaw.slice(1, 13) : cuspsRaw.slice(0, 12)).map(norm360);
  if (cusps.length !== 12) return null;
  const ayan = sidereal ? api.getAyanamsa(jd) : 0;

  const planets: PlanetPos[] = [];
  for (const spec of BODIES) {
    let pos;
    try {
      pos = api.calculatePosition(jd, spec.body, flags);
    } catch {
      continue;
    }
    const lon = norm360(pos.longitude);
    const s = signOf(lon);
    planets.push({
      key: spec.key,
      name: spec.name,
      glyph: spec.glyph,
      lon,
      lat: pos.latitude,
      speed: pos.longitudeSpeed,
      sign: s.name,
      signGlyph: s.glyph,
      element: s.element,
      mode: s.mode,
      dms: formatDMS(lon),
      deg: formatDeg(lon),
      house: houseOfCusp(lon, cusps),
      retro: spec.key === "Sun" || spec.key === "Moon" ? false : pos.longitudeSpeed < 0,
      dignity: dignityOf(spec.key, s.name),
      modern: Boolean(spec.modern),
    });
  }
  const node = planets.find((p) => p.key === "Node");
  if (node && !planets.some((p) => p.key === "SNode")) {
    const lon = norm360(node.lon + 180);
    const s = signOf(lon);
    planets.push({
      key: "SNode",
      name: "南交",
      glyph: "☋",
      lon,
      lat: -node.lat,
      speed: node.speed,
      sign: s.name,
      signGlyph: s.glyph,
      element: s.element,
      mode: s.mode,
      dms: formatDMS(lon),
      deg: formatDeg(lon),
      house: houseOfCusp(lon, cusps),
      retro: true,
      dignity: "",
      modern: false,
    });
  }

  const aspects: NatalChart["aspects"] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const pa = planets[i];
      const pb = planets[j];
      const diff = Math.abs(pa.lon - pb.lon);
      const sep = Math.min(diff, 360 - diff);
      for (const asp of ASPECTS) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.orb) {
          const next = Math.abs(sep + (pa.speed - pb.speed) - asp.angle);
          aspects.push({
            a: pa.key,
            b: pb.key,
            type: asp.type,
            typeZh: asp.typeZh,
            angle: asp.angle,
            orb: Number(orb.toFixed(2)),
            applying: next < orb,
          });
          break;
        }
      }
    }
  }

  const elements: Record<string, number> = { 火: 0, 土: 0, 风: 0, 水: 0 };
  const modes: Record<string, number> = { 本位: 0, 固定: 0, 变动: 0 };
  planets
    .filter((p) => !p.modern && p.key !== "SNode")
    .forEach((p) => {
      elements[p.element] += 1;
      modes[p.mode] += 1;
    });

  const asc = norm360(houses.ascendant);
  const mc = norm360(houses.mc);
  return {
    datetime: `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")} ${String(b.hour).padStart(2, "0")}:${String(b.minute).padStart(2, "0")}`,
    city: city.name,
    lat: city.lat,
    lon: city.lon,
    ramc: norm360(houses.armc),
    obliquity: 23.4393,
    ayanamsa: ayan,
    asc,
    mc,
    dsc: norm360(asc + 180),
    ic: norm360(mc + 180),
    houses: cusps,
    houseSystem,
    planets,
    aspects,
    sidereal,
    elements,
    modes,
    engine: "swiss",
  };
}
