import { computeNatal, type NatalChart, type PlanetPos } from "./natal";
import { nowAsBirth } from "./cities";
import { SIGNS, formatDMS, type BirthInput } from "./types";

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

const RULER: Record<string, string> = {
  白羊: "火星",
  金牛: "金星",
  双子: "水星",
  巨蟹: "月亮",
  狮子: "太阳",
  处女: "水星",
  天秤: "金星",
  天蝎: "火星",
  射手: "木星",
  摩羯: "土星",
  水瓶: "土星",
  双鱼: "木星",
};

const HOUR_LORDS = ["土星", "木星", "火星", "太阳", "金星", "水星", "月亮"];

export type HoraryResult = {
  natal: NatalChart;
  radical: boolean;
  radicalNote: string;
  voc: boolean;
  vocNote: string;
  querent: string;
  moonNext: string;
  hourLord: string;
  considerations: string[];
};

function signName(lon: number) {
  return SIGNS[Math.floor(norm(lon) / 30)].name;
}

function lordOf(lon: number) {
  return RULER[signName(lon)] ?? "";
}

function planetByName(chart: NatalChart, name: string): PlanetPos | undefined {
  return chart.planets.find((p) => p.name === name);
}

export function computeHorary(cityId: string, matterHouse = 7): HoraryResult {
  const b: BirthInput = nowAsBirth(cityId);
  const natal = computeNatal(b, false, "regio");
  const ascDeg = natal.asc % 30;
  const lateOrEarly = ascDeg < 3 || ascDeg > 27;
  const radical = !lateOrEarly;
  const moon = natal.planets.find((p) => p.key === "Moon")!;
  const moonSignEnd = (Math.floor(moon.lon / 30) + 1) * 30;
  let next: { name: string; type: string; orb: number } | null = null;
  for (const p of natal.planets) {
    if (p.key === "Moon" || p.modern) continue;
    const d = norm(p.lon - moon.lon);
    const aspects = [0, 60, 90, 120, 180];
    const names = ["合", "六合", "刑", "三合", "冲"];
    for (let i = 0; i < aspects.length; i++) {
      const ang = aspects[i];
      const orb = Math.abs(((d - ang + 540) % 360) - 180);
      const applying = moon.speed > 0 && norm(p.lon) > moon.lon && moon.lon + orb < moonSignEnd;
      if (applying && orb < 12 && (!next || orb < next.orb)) {
        next = { name: p.name, type: names[i], orb: Number(orb.toFixed(1)) };
      }
    }
  }
  const hit = next;
  const voc = !hit;
  const querent = lordOf(natal.asc);
  const quesitedCusp = natal.houses[(matterHouse - 1) % 12] ?? natal.dsc;
  const quesited = lordOf(quesitedCusp);
  const weekday = new Date().getDay();
  const hourLord = HOUR_LORDS[(weekday + Math.floor((b.hour + 1) / 2)) % 7];
  const considerations: string[] = [];
  if (lateOrEarly) considerations.push(ascDeg < 3 ? "上升过早，事未成局。" : "上升过晚，事体已过。");
  const saturn = planetByName(natal, "土星");
  if (saturn && saturn.house === 7) considerations.push("土星在七宫，对造不利，或问事者另有所图。");
  if (moon.house === 12) considerations.push("月在十二，消息隔蔽。");
  if (hit) considerations.push(`月下一相：${hit.type}${hit.name}，看此为应期。`);
  else considerations.push("月空亡，事无结果，或等下一段。");
  considerations.push(`问象宫主 ${quesited}。`);
  return {
    natal,
    radical,
    radicalNote: radical ? "盘可看。" : "先看慎重条件，再论吉凶。",
    voc,
    vocNote: voc ? "月空亡" : `月 ${formatDMS(moon.lon)}`,
    querent,
    moonNext: hit ? `${hit.type} ${hit.name} ${hit.orb}°` : "无",
    hourLord,
    considerations,
  };
}
