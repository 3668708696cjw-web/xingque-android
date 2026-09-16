import { lunarOf } from "./calendar";
import { GAN, ZHI, GAN_WX, ZHI_WX, type BirthInput } from "./types";

export const GUA64 = [
  "坤为地", "山地剥", "水地比", "风地观", "雷地豫", "火地晋", "泽地萃", "天地否",
  "地山谦", "艮为山", "水山蹇", "风山渐", "雷山小过", "火山旅", "泽山咸", "天山遁",
  "地水师", "山水蒙", "坎为水", "风水涣", "雷水解", "火水未济", "泽水困", "天水讼",
  "地风升", "山风蛊", "水风井", "巽为风", "雷风恒", "火风鼎", "泽风大过", "天风姤",
  "地雷复", "山雷颐", "水雷屯", "风雷益", "震为雷", "火雷噬嗑", "泽雷随", "天雷无妄",
  "地火明夷", "山火贲", "水火既济", "风火家人", "雷火丰", "离为火", "泽火革", "天火同人",
  "地泽临", "山泽损", "水泽节", "风泽中孚", "雷泽归妹", "火泽睽", "兑为泽", "天泽履",
  "地天泰", "山天大畜", "水天需", "风天小畜", "雷天大壮", "火天大有", "泽天夬", "乾为天",
];

const TRIGRAM = ["坤", "艮", "坎", "巽", "震", "离", "兑", "乾"];
const GONG_WX = ["土", "土", "水", "木", "木", "火", "金", "金"];
const NAIJIA: [string, string, string, string, string, string][] = [
  ["乙未", "乙巳", "乙卯", "乙丑", "乙亥", "乙酉"],
  ["丙寅", "丙子", "丙戌", "丙申", "丙午", "丙辰"],
  ["戊寅", "戊子", "戊戌", "戊申", "戊午", "戊辰"],
  ["辛未", "辛巳", "辛卯", "辛丑", "辛亥", "辛酉"],
  ["庚子", "庚寅", "庚辰", "庚午", "庚申", "庚戌"],
  ["己卯", "己丑", "己亥", "己酉", "己未", "己巳"],
  ["丁巳", "丁卯", "丁丑", "丁亥", "丁酉", "丁未"],
  ["甲子", "甲寅", "甲辰", "壬午", "壬申", "壬戌"],
];
const QIN: Record<string, Record<string, string>> = {
  木: { 木: "兄弟", 火: "子孙", 土: "妻财", 金: "官鬼", 水: "父母" },
  火: { 火: "兄弟", 土: "子孙", 金: "妻财", 水: "官鬼", 木: "父母" },
  土: { 土: "兄弟", 金: "子孙", 水: "妻财", 木: "官鬼", 火: "父母" },
  金: { 金: "兄弟", 水: "子孙", 木: "妻财", 火: "官鬼", 土: "父母" },
  水: { 水: "兄弟", 木: "子孙", 火: "妻财", 土: "官鬼", 金: "父母" },
};
const LIUSHEN = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"];
const SHEN_START: Record<string, number> = { 甲: 0, 乙: 0, 丙: 1, 丁: 1, 戊: 2, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };

export type YaoLine = {
  pos: number;
  yang: boolean;
  changing: boolean;
  najia: string;
  qin: string;
  shen: string;
  shi: boolean;
  ying: boolean;
  fu?: string;
  yuepo?: boolean;
  xunkong?: boolean;
};

export type LiuYaoResult = {
  name: string;
  changeName: string;
  huName: string;
  upper: string;
  lower: string;
  lines: YaoLine[];
  changeLines: YaoLine[];
  day: string;
  method: string;
  coins: number[];
};

function bitsToName(bits: number) {
  return GUA64[bits] ?? "未知";
}

function huBitsOf(bits: number) {
  const lower = (bits >> 1) & 7;
  const upper = (bits >> 2) & 7;
  return lower | (upper << 3);
}

function palGong(bits: number) {
  const lower = bits & 7;
  const upper = (bits >> 3) & 7;
  return { lower, upper, wx: GONG_WX[lower] };
}

function shiYing(bits: number): [number, number] {
  const lower = bits & 7;
  const upper = (bits >> 3) & 7;
  if (lower === upper) return [5, 2];
  let mask = lower ^ upper;
  let n = 0;
  while (mask) {
    n += mask & 1;
    mask >>= 1;
  }
  const shi = n === 0 ? 5 : (n - 1) % 6;
  return [shi, (shi + 3) % 6];
}

function buildLines(bits: number, changing: boolean[], dayGan: string, dayZhi?: string, xunkong?: string): YaoLine[] {
  const { lower, wx } = palGong(bits);
  const [shi, ying] = shiYing(bits);
  const start = SHEN_START[dayGan] ?? 0;
  const lines: YaoLine[] = [0, 1, 2, 3, 4, 5].map((i) => {
    const yang = ((bits >> i) & 1) === 1;
    const najia = NAIJIA[i < 3 ? lower : (bits >> 3) & 7][i];
    const zhi = najia.slice(1);
    const qin = QIN[wx]?.[ZHI_WX[zhi]] ?? "";
    const chong: Record<string, string> = { 子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅", 卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳" };
    return {
      pos: i + 1,
      yang,
      changing: changing[i] ?? false,
      najia,
      qin,
      shen: LIUSHEN[(start + i) % 6],
      shi: i === shi,
      ying: i === ying,
      yuepo: Boolean(dayZhi && chong[dayZhi] === zhi),
      xunkong: Boolean(xunkong && xunkong.includes(zhi)),
    };
  });
  const have = new Set(lines.map((l) => l.qin));
  const missing = ["兄弟", "子孙", "妻财", "官鬼", "父母"].filter((q) => !have.has(q));
  const home = NAIJIA[lower];
  missing.forEach((q) => {
    const hit = home.findIndex((nj) => QIN[wx]?.[ZHI_WX[nj.slice(1)]] === q);
    if (hit >= 0) lines[hit].fu = q;
  });
  return lines;
}

export function throwCoins(seed?: number) {
  const rnd = seed !== undefined ? mulberry(seed) : Math.random;
  return Array.from({ length: 6 }, () => {
    const n = (rnd() < 0.5 ? 2 : 3) + (rnd() < 0.5 ? 2 : 3) + (rnd() < 0.5 ? 2 : 3);
    return n;
  });
}

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function computeLiuyaoFromCoins(coins: number[], b: BirthInput): LiuYaoResult {
  const lunar = lunarOf(b);
  const dayG = lunar.getEightChar().getDayGan();
  const dayZ = lunar.getEightChar().getDayZhi();
  const gi = GAN.indexOf(dayG as (typeof GAN)[number]);
  const zi = ZHI.indexOf(dayZ as (typeof ZHI)[number]);
  const startZ = (zi - gi + 12) % 12;
  const xk = `${ZHI[(startZ + 10) % 12]}${ZHI[(startZ + 11) % 12]}`;
  let bits = 0;
  const changing: boolean[] = [];
  coins.forEach((c, i) => {
    const yang = c === 7 || c === 9;
    if (yang) bits |= 1 << i;
    changing[i] = c === 6 || c === 9;
  });
  let changeBits = bits;
  changing.forEach((ch, i) => {
    if (ch) changeBits ^= 1 << i;
  });
  return {
    name: bitsToName(bits),
    changeName: changing.some(Boolean) ? bitsToName(changeBits) : "无变卦",
    huName: bitsToName(huBitsOf(bits)),
    upper: TRIGRAM[(bits >> 3) & 7],
    lower: TRIGRAM[bits & 7],
    lines: buildLines(bits, changing, dayG, dayZ, String(xk)),
    changeLines: buildLines(changeBits, [false, false, false, false, false, false], dayG, dayZ, String(xk)),
    day: lunar.getDayInGanZhi(),
    method: "金钱卦",
    coins,
  };
}

export function computeLiuyaoTime(b: BirthInput): LiuYaoResult {
  const lunar = lunarOf(b);
  const yz = ZHI.indexOf(lunar.getYearInGanZhi().slice(1) as (typeof ZHI)[number]) + 1;
  const upperN = (yz + b.month + b.day) % 8 || 8;
  const hourZ = ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number]) + 1;
  const lowerN = (yz + b.month + b.day + hourZ) % 8 || 8;
  const moving = (yz + b.month + b.day + hourZ) % 6 || 6;
  const trigramToBits = [0, 4, 2, 6, 1, 5, 3, 7];
  const low = trigramToBits[lowerN - 1];
  const up = trigramToBits[upperN - 1];
  const bits = low | (up << 3);
  const coins = [0, 1, 2, 3, 4, 5].map((i) => {
    const yang = ((bits >> i) & 1) === 1;
    const ch = i + 1 === moving;
    if (yang && ch) return 9;
    if (!yang && ch) return 6;
    return yang ? 7 : 8;
  });
  const r = computeLiuyaoFromCoins(coins, b);
  r.method = "时间卦";
  return r;
}

export { GAN, GAN_WX };
