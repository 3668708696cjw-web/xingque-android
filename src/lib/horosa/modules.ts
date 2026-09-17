import { Solar } from "lunar-javascript";
import { almanacOf } from "./almanac";
import { lunarOf } from "./calendar";
import { getCity } from "./cities";
import { computeNatal, type NatalChart } from "./natal";
import { computeQimen } from "./qimen";
import { GAN, ZHI, formatDMS, type BirthInput } from "./types";

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

const XL_PAL = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"] as const;
const XL_NOTE: Record<(typeof XL_PAL)[number], string> = {
  大安: "静、宜守、谋事可成而宜缓。",
  留连: "滞、反复、事体胶着。",
  速喜: "快、喜讯、宜动。",
  赤口: "口舌、争竞、防血光。",
  小吉: "小成、和合、宜人。",
  空亡: "虚、不实、宜止。",
};

export type XiaoLiurenResult = {
  month: string;
  day: string;
  hour: string;
  note: string;
  ganzhi: string;
};

export function computeXiaoLiuren(b: BirthInput): XiaoLiurenResult {
  const lunar = lunarOf(b);
  const month = Math.max(1, lunar.getMonth());
  const day = Math.max(1, lunar.getDay());
  const zi = ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number]);
  const hourN = zi < 0 ? 1 : zi + 1;
  const m = (month - 1) % 6;
  const d = (m + day - 1) % 6;
  const h = (d + hourN - 1) % 6;
  const hour = XL_PAL[h];
  return {
    month: XL_PAL[m],
    day: XL_PAL[d],
    hour,
    note: XL_NOTE[hour],
    ganzhi: `${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}时`,
  };
}

const FG_MEN = ["休", "生", "伤", "杜", "景", "死", "惊", "开"];
const FG_POS = [1, 8, 3, 4, 9, 2, 7, 6];

export type FeiGongCell = { palace: number; name: string; men: string; star: string };
export type FeiGongResult = {
  ju: string;
  cells: FeiGongCell[];
  zhiShi: string;
};

export function computeFeiGong(b: BirthInput): FeiGongResult {
  const q = computeQimen(b, { mode: "飞盘", dingju: "拆补" });
  const names = ["", "坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];
  const cells: FeiGongCell[] = FG_POS.map((p) => {
    const c = q.cells.find((x) => x.palace === p);
    return { palace: p, name: names[p], men: c?.door ?? FG_MEN[0], star: c?.star ?? "" };
  });
  return { ju: `${q.yang ? "阳" : "阴"}${q.ju}局`, cells, zhiShi: q.zhishi };
}

const XC_BAGUA = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export type XiaoChengResult = {
  ti: string;
  yong: string;
  hu: string;
  dong: number;
  note: string;
};

export function computeXiaoCheng(b: BirthInput): XiaoChengResult {
  const lunar = lunarOf(b);
  const yz = ZHI.indexOf(lunar.getYearInGanZhi().slice(1) as (typeof ZHI)[number]) + 1;
  const hz = ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number]) + 1;
  const tiN = (yz + b.month + b.day) % 8 || 8;
  const yongN = (yz + b.month + b.day + hz) % 8 || 8;
  const dong = (yz + b.month + b.day + hz) % 6 || 6;
  const ti = XC_BAGUA[tiN - 1];
  const yong = XC_BAGUA[yongN - 1];
  const hu = XC_BAGUA[(tiN + yongN - 1) % 8];
  return {
    ti,
    yong,
    hu,
    dong,
    note: `体${ti} 用${yong}，互${hu}，动第${dong}爻。体为主、用为客。`,
  };
}

const LINGQI: { a: number; b: number; c: number; name: string; ci: string }[] = [
  { a: 4, b: 4, c: 4, name: "大通", ci: "天地交泰，大事可举。" },
  { a: 4, b: 4, c: 3, name: "临官", ci: "得位得时，宜进取。" },
  { a: 4, b: 4, c: 2, name: "未济", ci: "功亏一篑，宜补缺。" },
  { a: 4, b: 4, c: 1, name: "孤虚", ci: "助力不足，防落空。" },
  { a: 4, b: 4, c: 0, name: "空亡", ci: "名实两虚，宜止。" },
  { a: 3, b: 3, c: 3, name: "中正", ci: "守中则吉，偏则败。" },
  { a: 2, b: 2, c: 2, name: "重复", ci: "事体反复，再议。" },
  { a: 1, b: 1, c: 1, name: "微阳", ci: "气尚弱，宜养。" },
  { a: 0, b: 0, c: 0, name: "纯阴", ci: "闭藏之时，勿妄动。" },
  { a: 4, b: 0, c: 0, name: "上达", ci: "上行有路，下无根基。" },
  { a: 0, b: 4, c: 0, name: "中立", ci: "可调和，不宜偏倚。" },
  { a: 0, b: 0, c: 4, name: "下济", ci: "基层可成，高位勿求。" },
];

export type LingqiResult = { upper: number; mid: number; lower: number; name: string; ci: string };

export function throwLingqi(seed?: number): LingqiResult {
  let s = (seed ?? Date.now()) >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const n = () => Math.floor(rnd() * 5);
  const upper = n();
  const mid = n();
  const lower = n();
  const hit =
    LINGQI.find((x) => x.a === upper && x.b === mid && x.c === lower) ??
    LINGQI.find((x) => x.a + x.b + x.c === upper + mid + lower) ??
    LINGQI[5];
  return { upper, mid, lower, name: hit.name, ci: hit.ci };
}

const WU_ZHAO = ["雨", "霁", "蒙", "济", "中"] as const;
const WU_NOTE: Record<(typeof WU_ZHAO)[number], string> = {
  雨: "阴盛、湿滞、事体未明，宜缓。",
  霁: "阴开、事明、宜决。",
  蒙: "雾覆、信息不真，防欺。",
  济: "得渡、有援、事可成。",
  中: "得中、勿过、守常则吉。",
};

export type WuZhaoResult = { name: (typeof WU_ZHAO)[number]; note: string; method: string };

export function computeWuZhao(b: BirthInput): WuZhaoResult {
  const lunar = lunarOf(b);
  const zi = ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number]);
  const gi = GAN.indexOf(lunar.getTimeGan() as (typeof GAN)[number]);
  const i = (Math.max(0, zi) + Math.max(0, gi) + b.day) % 5;
  const name = WU_ZHAO[i];
  return { name, note: WU_NOTE[name], method: "时辰五兆" };
}

export type JingJueResult = { name: string; lines: string[]; note: string };

export function computeJingJue(b: BirthInput): JingJueResult {
  const lunar = lunarOf(b);
  const yz = ZHI.indexOf(lunar.getYearInGanZhi().slice(1) as (typeof ZHI)[number]) + 1;
  const hz = ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number]) + 1;
  const bits = (yz + b.month + b.day + hz) % 64;
  const names = [
    "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履", "泰", "否",
    "同人", "大有", "谦", "豫", "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复",
    "无妄", "大畜", "颐", "大过", "坎", "离", "咸", "恒", "遁", "大壮", "晋", "明夷",
    "家人", "睽", "蹇", "解", "损", "益", "夬", "姤", "萃", "升", "困", "井",
    "革", "鼎", "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节",
    "中孚", "小过", "既济", "未济",
  ];
  const name = names[bits];
  const lines = [0, 1, 2, 3, 4, 5].map((i) => (((bits >> i) & 1) === 1 ? "— 阳" : "-- 阴"));
  return { name, lines, note: `荆州诀以时间入卦，得${name}。看动爻与世应，勿泥辞。` };
}

export type JieqiChart = { name: string; date: string; natal: NatalChart };

export function computeJieqi(b: BirthInput): JieqiChart[] {
  const want = ["春分", "夏至", "秋分", "冬至"];
  const out: JieqiChart[] = [];
  const solar = Solar.fromYmd(b.year, 1, 1);
  const table = solar.getLunar().getJieQiTable();
  want.forEach((name) => {
    const jq = table[name];
    let month = 3;
    let day = 21;
    if (jq) {
      month = jq.getMonth();
      day = jq.getDay();
    } else {
      const fallback: Record<string, [number, number]> = { 春分: [3, 21], 夏至: [6, 21], 秋分: [9, 23], 冬至: [12, 22] };
      [month, day] = fallback[name];
    }
    const natal = computeNatal({ ...b, month, day, hour: 12, minute: 0 });
    const date = `${b.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    out.push({ name, date, natal });
  });
  return out;
}

export type ZeriDay = {
  ymd: string;
  week: string;
  lunar: string;
  zhixing: string;
  yi: string;
  ji: string;
  score: number;
  note: string;
};

export function computeZeri(cityId: string, from = new Date(), days = 21): ZeriDay[] {
  void cityId;
  const out: ZeriDay[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const a = almanacOf(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const good = ["除", "开", "成", "定"].includes(a.zhixing);
    const yiHit = a.yi.some((x) => /嫁娶|出行|开市|入宅|祈福|会友/.test(x));
    const jiHit = a.ji.some((x) => /嫁娶|出行|开市/.test(x));
    let score = (good ? 2 : 0) + (yiHit ? 2 : 0) - (jiHit ? 2 : 0);
    if (a.dao.includes("黄道")) score += 1;
    out.push({
      ymd: a.ymd,
      week: a.week,
      lunar: a.lunar,
      zhixing: a.zhixing,
      yi: a.yi.slice(0, 3).join(" "),
      ji: a.ji.slice(0, 2).join(" "),
      score,
      note: score >= 3 ? "宜择" : score <= 0 ? "宜避" : "中平",
    });
  }
  return out;
}

export type HarmonicResult = { n: number; natal: NatalChart };

export function computeHarmonic(b: BirthInput, n: number): NatalChart {
  const natal = computeNatal(b);
  natal.planets = natal.planets.map((p) => {
    const lon = norm(p.lon * n);
    return { ...p, lon, dms: formatDMS(lon), deg: `${Math.floor(lon % 30)}°` };
  });
  return natal;
}

export function computeDraconic(b: BirthInput): NatalChart {
  const natal = computeNatal(b);
  const node = natal.planets.find((p) => p.key === "Node")?.lon ?? 0;
  natal.planets = natal.planets.map((p) => {
    const lon = norm(p.lon - node);
    return { ...p, lon, dms: formatDMS(lon) };
  });
  natal.asc = norm(natal.asc - node);
  natal.mc = norm(natal.mc - node);
  return natal;
}

export type AcgLine = { planet: string; lon: number; note: string };

export function computeAcg(b: BirthInput): AcgLine[] {
  const natal = computeNatal(b);
  const city = getCity(b.cityId);
  return natal.planets
    .filter((p) => !p.modern)
    .map((p) => {
      const geo = ((city.lon + (p.lon - natal.mc) + 540) % 360) - 180;
      return { planet: p.name, lon: Number(geo.toFixed(2)), note: `${p.name} MC 线约 ${geo.toFixed(1)}°` };
    });
}

export type DiceResult = { a: number; b: number; house: number; note: string };

export function throwDice(seed?: number): DiceResult {
  let s = (seed ?? Date.now()) >>> 0;
  const rnd = () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    return ((s >>> 0) % 12) + 1;
  };
  const a = rnd();
  const b = rnd();
  const house = ((a + b - 2) % 12) + 1;
  const notes = ["命", "财", "兄", "家", "子", "病", "偶", "危", "迁", "业", "福", "隐"];
  return { a, b, house, note: `落第${house}室（${notes[house - 1]}）` };
}

export type MingOtherResult = {
  yanqin: { year: string; month: string; day: string; hour: string };
  yizhang: { palace: string; gan: string; note: string };
  cetian: { star: string; note: string };
};

const ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const PALM = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];
const CETIAN = ["贪狼", "巨门", "禄存", "文曲", "廉贞", "武曲", "破军", "左辅", "右弼"];

export function computeMingOther(b: BirthInput): MingOtherResult {
  const lunar = lunarOf(b);
  const yz = lunar.getYearInGanZhi();
  const zz = yz[1];
  const zi = Math.max(0, ZHI.indexOf(zz as (typeof ZHI)[number]));
  return {
    yanqin: {
      year: ANIMALS[zi],
      month: ANIMALS[(b.month + 1) % 12],
      day: ANIMALS[(b.day + 1) % 12],
      hour: ANIMALS[ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number])] ?? "",
    },
    yizhang: {
      palace: PALM[zi % 8],
      gan: yz[0],
      note: `年干${yz[0]}落${PALM[zi % 8]}宫。一掌经把干支收到手上。`,
    },
    cetian: {
      star: CETIAN[zi % CETIAN.length],
      note: "策天飞星以年支入局，看飞宫与四化。",
    },
  };
}
