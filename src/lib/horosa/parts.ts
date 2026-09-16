import { computeNatal, type NatalChart } from "./natal";
import { formatDMS, type BirthInput } from "./types";

export type Lot = { name: string; lon: number; dms: string };
export type Midpoint = { pair: string; lon: number; dms: string };

export type PartsResult = {
  natal: NatalChart;
  lots: Lot[];
  mids: Midpoint[];
};

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

export function computeParts(b: BirthInput): PartsResult {
  const natal = computeNatal(b);
  const p = (k: string) => natal.planets.find((x) => x.key === k)!.lon;
  const day = b.hour >= 6 && b.hour < 18;
  const fortune = day ? norm(natal.asc + p("Moon") - p("Sun")) : norm(natal.asc + p("Sun") - p("Moon"));
  const spirit = day ? norm(natal.asc + p("Sun") - p("Moon")) : norm(natal.asc + p("Moon") - p("Sun"));
  const necessity = norm(natal.asc + p("Mercury") - fortune);
  const eros = norm(natal.asc + p("Venus") - p("Sun"));
  const courage = norm(natal.asc + p("Mars") - fortune);
  const victory = norm(natal.asc + p("Jupiter") - p("Sun"));
  const nemesis = norm(natal.asc + p("Saturn") - fortune);
  const lots: Lot[] = [
    { name: "福点", lon: fortune, dms: formatDMS(fortune) },
    { name: "神点", lon: spirit, dms: formatDMS(spirit) },
    { name: "必然点", lon: necessity, dms: formatDMS(necessity) },
    { name: "爱点", lon: eros, dms: formatDMS(eros) },
    { name: "勇点", lon: courage, dms: formatDMS(courage) },
    { name: "胜点", lon: victory, dms: formatDMS(victory) },
    { name: "仇点", lon: nemesis, dms: formatDMS(nemesis) },
  ];

  const keys = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
  const names: Record<string, string> = {
    Sun: "日", Moon: "月", Mercury: "水", Venus: "金", Mars: "火", Jupiter: "木", Saturn: "土",
  };
  const mids: Midpoint[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const lon = norm((p(keys[i]) + p(keys[j])) / 2);
      mids.push({ pair: `${names[keys[i]]}/${names[keys[j]]}`, lon, dms: formatDMS(lon) });
    }
  }
  return { natal, lots, mids };
}
