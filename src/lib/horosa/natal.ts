import * as Astronomy from "astronomy-engine";
import { cityOf, localToUtc } from "./cities";
import { SIGNS, formatDMS, formatDeg, signOf, type BirthInput } from "./types";

export type PlanetKey =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto"
  | "Node"
  | "SNode"
  | "Lilith"
  | "Chiron"
  | "Ceres"
  | "Pallas"
  | "Juno"
  | "Vesta"
  | "Pholus";

export type HouseSystem = "placidus" | "equal" | "whole" | "koch" | "regio" | "campanus" | "alcabitius";
export type Dignity = "庙" | "旺" | "陷" | "落" | "";

export type PlanetPos = {
  key: PlanetKey;
  name: string;
  glyph: string;
  lon: number;
  lat: number;
  speed: number;
  sign: string;
  signGlyph: string;
  element: string;
  mode: string;
  dms: string;
  deg: string;
  house: number;
  retro: boolean;
  dignity: Dignity;
  modern: boolean;
};

export type AspectHit = {
  a: PlanetKey;
  b: PlanetKey;
  type: string;
  typeZh: string;
  angle: number;
  orb: number;
  applying: boolean;
};

export type NatalChart = {
  datetime: string;
  city: string;
  lat: number;
  lon: number;
  ramc: number;
  obliquity: number;
  ayanamsa: number;
  asc: number;
  mc: number;
  dsc: number;
  ic: number;
  houses: number[];
  houseSystem: HouseSystem;
  planets: PlanetPos[];
  aspects: AspectHit[];
  sidereal: boolean;
  elements: Record<string, number>;
  modes: Record<string, number>;
  engine: "swiss" | "astronomy";
};

const PLANETS: {
  key: PlanetKey;
  body?: Astronomy.Body;
  name: string;
  glyph: string;
  modern?: boolean;
}[] = [
  { key: "Sun", body: Astronomy.Body.Sun, name: "太阳", glyph: "☉" },
  { key: "Moon", body: Astronomy.Body.Moon, name: "月亮", glyph: "☽" },
  { key: "Mercury", body: Astronomy.Body.Mercury, name: "水星", glyph: "☿" },
  { key: "Venus", body: Astronomy.Body.Venus, name: "金星", glyph: "♀" },
  { key: "Mars", body: Astronomy.Body.Mars, name: "火星", glyph: "♂" },
  { key: "Jupiter", body: Astronomy.Body.Jupiter, name: "木星", glyph: "♃" },
  { key: "Saturn", body: Astronomy.Body.Saturn, name: "土星", glyph: "♄" },
  { key: "Uranus", body: Astronomy.Body.Uranus, name: "天王", glyph: "♅", modern: true },
  { key: "Neptune", body: Astronomy.Body.Neptune, name: "海王", glyph: "♆", modern: true },
  { key: "Pluto", body: Astronomy.Body.Pluto, name: "冥王", glyph: "♇", modern: true },
  { key: "Node", name: "北交", glyph: "☊" },
  { key: "SNode", name: "南交", glyph: "☋" },
  { key: "Lilith", name: "月黎", glyph: "⚸", modern: true },
  { key: "Chiron", name: "凯龙", glyph: "⚷", modern: true },
];

const ASPECTS = [
  { angle: 0, type: "conjunction", typeZh: "合", orb: 8 },
  { angle: 60, type: "sextile", typeZh: "六合", orb: 4 },
  { angle: 90, type: "square", typeZh: "刑", orb: 6 },
  { angle: 120, type: "trine", typeZh: "三合", orb: 6 },
  { angle: 180, type: "opposition", typeZh: "冲", orb: 8 },
];

const RULER: Record<string, PlanetKey[]> = {
  白羊: ["Mars"],
  金牛: ["Venus"],
  双子: ["Mercury"],
  巨蟹: ["Moon"],
  狮子: ["Sun"],
  处女: ["Mercury"],
  天秤: ["Venus"],
  天蝎: ["Mars", "Pluto"],
  射手: ["Jupiter"],
  摩羯: ["Saturn"],
  水瓶: ["Saturn", "Uranus"],
  双鱼: ["Jupiter", "Neptune"],
};

const EXALT: Record<string, PlanetKey> = {
  白羊: "Sun",
  金牛: "Moon",
  处女: "Mercury",
  天秤: "Saturn",
  摩羯: "Mars",
  巨蟹: "Jupiter",
  双鱼: "Venus",
};

const DETRIMENT: Record<string, PlanetKey[]> = {
  白羊: ["Venus"],
  金牛: ["Mars", "Pluto"],
  双子: ["Jupiter"],
  巨蟹: ["Saturn"],
  狮子: ["Saturn", "Uranus"],
  处女: ["Jupiter", "Neptune"],
  天秤: ["Mars"],
  天蝎: ["Venus"],
  射手: ["Mercury"],
  摩羯: ["Moon"],
  水瓶: ["Sun"],
  双鱼: ["Mercury"],
};

const FALL: Record<string, PlanetKey> = {
  天秤: "Sun",
  天蝎: "Moon",
  双鱼: "Mercury",
  白羊: "Saturn",
  巨蟹: "Mars",
  摩羯: "Jupiter",
  处女: "Venus",
};

export function dignityOf(key: PlanetKey, sign: string): Dignity {
  if (RULER[sign]?.includes(key)) return "庙";
  if (EXALT[sign] === key) return "旺";
  if (DETRIMENT[sign]?.includes(key)) return "陷";
  if (FALL[sign] === key) return "落";
  return "";
}

function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}

function rad(d: number) {
  return (d * Math.PI) / 180;
}

function meanNode(date: Date) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
  return norm360(125.04452 - 0.05295377 * d);
}

function meanLilith(date: Date) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
  return norm360(83.3535 + 0.111403528 * d);
}

function meanChiron(date: Date) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
  return norm360(209.07 + 0.019438 * d);
}

function eclipticOf(body: Astronomy.Body, date: Date) {
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true));
}

function bodySpeed(body: Astronomy.Body, date: Date) {
  const later = new Date(date.getTime() + 86400000);
  const a = eclipticOf(body, date).elon;
  const b = eclipticOf(body, later).elon;
  let delta = b - a;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function ascendant(ramcDeg: number, latDeg: number, epsDeg: number) {
  const ramc = rad(ramcDeg);
  const lat = rad(latDeg);
  const eps = rad(epsDeg);
  const y = Math.cos(ramc);
  const x = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps));
  return norm360((Math.atan2(y, x) * 180) / Math.PI);
}

function midheaven(ramcDeg: number, epsDeg: number) {
  const ramc = rad(ramcDeg);
  const eps = rad(epsDeg);
  return norm360((Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * 180) / Math.PI);
}

function lahiriAyanamsa(date: Date) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
  return 23.85 + (50.29 / 3600) * (d / 365.25);
}

function lonFromRA(raDeg: number, epsDeg: number) {
  const ra = rad(raDeg);
  const eps = rad(epsDeg);
  return norm360((Math.atan2(Math.sin(ra) * Math.cos(eps), Math.cos(ra)) * 180) / Math.PI);
}

function placidusFactor(ramc: number, lat: number, eps: number, factor: number): number | null {
  let ra = ramc + 90 * factor;
  for (let i = 0; i < 18; i++) {
    const lon = lonFromRA(ra, eps);
    const decl = (Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lon))) * 180) / Math.PI;
    const x = -Math.tan(rad(lat)) * Math.tan(rad(decl));
    if (Math.abs(x) >= 0.997) return null;
    const sa = (Math.acos(Math.max(-1, Math.min(1, x))) * 180) / Math.PI;
    const next = ramc + factor * sa;
    if (Math.abs(next - ra) < 1e-6) {
      ra = next;
      break;
    }
    ra = next;
  }
  return lonFromRA(ra, eps);
}

function placidusHouses(ramc: number, lat: number, eps: number): number[] | null {
  if (Math.abs(lat) > 66) return null;
  const h11 = placidusFactor(ramc, lat, eps, 1 / 3);
  const h12 = placidusFactor(ramc, lat, eps, 2 / 3);
  const h2raw = placidusFactor(ramc + 180, -lat, eps, 2 / 3);
  const h3raw = placidusFactor(ramc + 180, -lat, eps, 1 / 3);
  if (h11 == null || h12 == null || h2raw == null || h3raw == null) return null;
  const mc = midheaven(ramc, eps);
  const asc = ascendant(ramc, lat, eps);
  const h2 = norm360(h2raw + 180);
  const h3 = norm360(h3raw + 180);
  return [
    asc,
    h2,
    h3,
    norm360(mc + 180),
    norm360(h11 + 180),
    norm360(h12 + 180),
    norm360(asc + 180),
    norm360(h2 + 180),
    norm360(h3 + 180),
    mc,
    h11,
    h12,
  ];
}

function equalHouses(asc: number) {
  return Array.from({ length: 12 }, (_, i) => norm360(asc + i * 30));
}

function wholeHouses(asc: number) {
  const start = Math.floor(asc / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => norm360(start + i * 30));
}

export function houseOfCusp(lon: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = (b - a + 360) % 360;
    const d = (lon - a + 360) % 360;
    if (d < span || span < 1e-8) return i + 1;
  }
  return 12;
}

function pointLon(key: PlanetKey, utc: Date) {
  if (key === "Node") return meanNode(utc);
  if (key === "SNode") return norm360(meanNode(utc) + 180);
  if (key === "Lilith") return meanLilith(utc);
  if (key === "Chiron") return meanChiron(utc);
  return 0;
}

function pointSpeed(key: PlanetKey) {
  if (key === "Node" || key === "SNode") return -0.05295377;
  if (key === "Lilith") return 0.111403528;
  if (key === "Chiron") return 0.019438;
  return 0;
}

export function computeNatal(
  b: BirthInput,
  sidereal = false,
  houseSystem: HouseSystem = "placidus",
): NatalChart {
  const city = cityOf(b);
  const utc = localToUtc(b.year, b.month, b.day, b.hour, b.minute, city.tz);
  const time = Astronomy.MakeTime(utc);
  const gast = Astronomy.SiderealTime(time);
  const ramc = norm360((gast + city.lon / 15) * 15);
  const tilt = Astronomy.e_tilt(time);
  const eps = tilt.tobl;
  const ayan = sidereal ? lahiriAyanamsa(utc) : 0;
  const apply = (lon: number) => norm360(lon - ayan);

  const tropAsc = ascendant(ramc, city.lat, eps);
  const tropMc = midheaven(ramc, eps);
  const asc = apply(tropAsc);
  const mc = apply(tropMc);

  let usedSystem = houseSystem;
  let tropHouses: number[];
  if (houseSystem === "whole") tropHouses = wholeHouses(tropAsc);
  else if (houseSystem === "equal") tropHouses = equalHouses(tropAsc);
  else {
    const p = placidusHouses(ramc, city.lat, eps);
    if (p) tropHouses = p;
    else {
      tropHouses = equalHouses(tropAsc);
      usedSystem = "equal";
    }
  }

  const houses = tropHouses.map(apply);

  const planets: PlanetPos[] = PLANETS.map((p) => {
    let lon: number;
    let lat = 0;
    let speed = 0;
    if (p.body) {
      const ecl = eclipticOf(p.body, utc);
      lon = apply(ecl.elon);
      lat = ecl.elat;
      speed = bodySpeed(p.body, utc);
    } else {
      lon = apply(pointLon(p.key, utc));
      speed = pointSpeed(p.key);
    }
    const s = signOf(lon);
    const retro = p.body === Astronomy.Body.Sun || p.body === Astronomy.Body.Moon ? false : speed < 0;
    return {
      key: p.key,
      name: p.name,
      glyph: p.glyph,
      lon,
      lat,
      speed,
      sign: s.name,
      signGlyph: s.glyph,
      element: s.element,
      mode: s.mode,
      dms: formatDMS(lon),
      deg: formatDeg(lon),
      house: houseOfCusp(lon, houses),
      retro,
      dignity: dignityOf(p.key, s.name),
      modern: Boolean(p.modern),
    };
  });

  const aspects: AspectHit[] = [];
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

  return {
    datetime: `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")} ${String(b.hour).padStart(2, "0")}:${String(b.minute).padStart(2, "0")}`,
    city: city.name,
    lat: city.lat,
    lon: city.lon,
    ramc,
    obliquity: eps,
    ayanamsa: ayan,
    asc,
    mc,
    dsc: norm360(asc + 180),
    ic: norm360(mc + 180),
    houses,
    houseSystem: usedSystem,
    planets,
    aspects,
    sidereal,
    elements,
    modes,
    engine: "astronomy",
  };
}

export function planetByKey(chart: NatalChart, key: PlanetKey) {
  return chart.planets.find((p) => p.key === key);
}

const MINOR_KEYS = new Set(["Ceres", "Pallas", "Juno", "Vesta", "Pholus"]);

export function visiblePlanets(chart: NatalChart, modern = true, minors = true) {
  return chart.planets.filter((p) => (modern || !p.modern) && (minors || !MINOR_KEYS.has(p.key)));
}

export function aspectGrid(chart: NatalChart, modern = true) {
  const list = visiblePlanets(chart, modern);
  const map = new Map<string, AspectHit>();
  chart.aspects.forEach((a) => {
    map.set(`${a.a}|${a.b}`, a);
    map.set(`${a.b}|${a.a}`, a);
  });
  return { list, map };
}

export { SIGNS, formatDeg };

export async function computeNatalAsync(
  b: BirthInput,
  sidereal = false,
  houseSystem: HouseSystem = "placidus",
): Promise<NatalChart> {
  try {
    const { trySwissNatal } = await import("./sweph");
    const swiss = await trySwissNatal(b, sidereal, houseSystem);
    if (swiss) return swiss;
  } catch {
    /* fall through to astronomy-engine */
  }
  return computeNatal(b, sidereal, houseSystem);
}
