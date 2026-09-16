import { eightCharOf, lunarOf } from "./calendar";
import { GAN, GAN_WX, ZHI_WX, ganzhiOfYear, shiShen, type BirthInput } from "./types";

export type Pillar = {
  label: string;
  gan: string;
  zhi: string;
  hide: string[];
  nayin: string;
  shishenGan: string;
  shishenZhi: string[];
  dishi: string;
  xunkong: string;
  wxGan: string;
  wxZhi: string;
};

export type DaYunItem = {
  ganzhi: string;
  startYear: number;
  startAge: number;
  endAge: number;
  shishen: string;
  current: boolean;
};

export type LiuNianItem = {
  year: number;
  ganzhi: string;
  age: number;
  current: boolean;
};

export type PillarRel = {
  a: string;
  b: string;
  kind: "合" | "冲" | "刑" | "害" | "破" | "三合";
  label: string;
  on: "gan" | "zhi";
};

export type BaziResult = {
  lunar: string;
  animal: string;
  taiyuan: string;
  minggong: string;
  shengong: string;
  pillars: Pillar[];
  dayun: DaYunItem[];
  liunian: LiuNianItem[];
  yunStart: string;
  shensha: { name: string; at: string }[];
  scores: Record<string, number>;
  geju: string;
  dayMaster: string;
  dayWx: string;
  strength: "身旺" | "身弱" | "中和";
  yongshen: string;
  xishen: string;
  jishen: string;
  relations: PillarRel[];
};

const GUIREN: Record<string, string[]> = {
  甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
  乙: ["子", "申"], 己: ["子", "申"],
  丙: ["亥", "酉"], 丁: ["亥", "酉"],
  壬: ["巳", "卯"], 癸: ["巳", "卯"],
  辛: ["午", "寅"],
};
const TAOHUA: Record<string, string> = { 申: "酉", 子: "酉", 辰: "酉", 寅: "卯", 午: "卯", 戌: "卯", 亥: "子", 卯: "子", 未: "子", 巳: "午", 酉: "午", 丑: "午" };
const HUAGAI: Record<string, string> = { 申: "辰", 子: "辰", 辰: "辰", 寅: "戌", 午: "戌", 戌: "戌", 亥: "未", 卯: "未", 未: "未", 巳: "丑", 酉: "丑", 丑: "丑" };
const YIMA: Record<string, string> = { 申: "寅", 子: "寅", 辰: "寅", 寅: "申", 午: "申", 戌: "申", 亥: "巳", 卯: "巳", 未: "巳", 巳: "亥", 酉: "亥", 丑: "亥" };
const YANGREN: Record<string, string> = { 甲: "卯", 乙: "寅", 丙: "午", 丁: "巳", 戊: "午", 己: "巳", 庚: "酉", 辛: "申", 壬: "子", 癸: "亥" };

const TIANDE: Record<number, string> = { 1: "丁", 2: "申", 3: "壬", 4: "辛", 5: "亥", 6: "甲", 7: "癸", 8: "寅", 9: "丙", 10: "乙", 11: "巳", 12: "庚" };
const YUEDE: Record<number, string> = { 1: "丙", 2: "甲", 3: "壬", 4: "庚", 5: "丙", 6: "甲", 7: "壬", 8: "庚", 9: "丙", 10: "甲", 11: "壬", 12: "庚" };
const JIANGXING: Record<string, string> = { 申: "子", 子: "子", 辰: "子", 寅: "午", 午: "午", 戌: "午", 亥: "卯", 卯: "卯", 未: "卯", 巳: "酉", 酉: "酉", 丑: "酉" };
const WANGSHEN: Record<string, string> = { 申: "亥", 子: "亥", 辰: "亥", 寅: "巳", 午: "巳", 戌: "巳", 亥: "申", 卯: "申", 未: "申", 巳: "寅", 酉: "寅", 丑: "寅" };
const GUCHEN: Record<string, string> = { 亥: "寅", 子: "寅", 丑: "寅", 寅: "巳", 卯: "巳", 辰: "巳", 巳: "申", 午: "申", 未: "申", 申: "亥", 酉: "亥", 戌: "亥" };
const GUASU: Record<string, string> = { 亥: "戌", 子: "戌", 丑: "戌", 寅: "丑", 卯: "丑", 辰: "丑", 巳: "辰", 午: "辰", 未: "辰", 申: "未", 酉: "未", 戌: "未" };
const KUIGANG = new Set(["庚辰", "庚戌", "壬辰", "戊戌"]);

const GAN_HE: [string, string, string][] = [
  ["甲", "己", "合土"],
  ["乙", "庚", "合金"],
  ["丙", "辛", "合水"],
  ["丁", "壬", "合木"],
  ["戊", "癸", "合火"],
];
const GAN_CHONG: [string, string][] = [
  ["甲", "庚"],
  ["乙", "辛"],
  ["丙", "壬"],
  ["丁", "癸"],
];
const ZHI_HE: [string, string, string][] = [
  ["子", "丑", "合土"],
  ["寅", "亥", "合木"],
  ["卯", "戌", "合火"],
  ["辰", "酉", "合金"],
  ["巳", "申", "合水"],
  ["午", "未", "合土"],
];
const ZHI_CHONG: [string, string][] = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];
const ZHI_HAI: [string, string][] = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "巳"],
  ["卯", "辰"],
  ["申", "亥"],
  ["酉", "戌"],
];
const ZHI_PO: [string, string][] = [
  ["子", "酉"],
  ["卯", "午"],
  ["辰", "丑"],
  ["未", "戌"],
  ["寅", "亥"],
  ["巳", "申"],
];
const ZHI_SANHE: [string, string, string, string][] = [
  ["申", "子", "辰", "水局"],
  ["亥", "卯", "未", "木局"],
  ["寅", "午", "戌", "火局"],
  ["巳", "酉", "丑", "金局"],
];
const XING_SAN: [string, string, string, string][] = [
  ["寅", "巳", "申", "无恩之刑"],
  ["丑", "戌", "未", "恃势之刑"],
];
const XING_PAIR: [string, string, string][] = [["子", "卯", "无礼之刑"]];
const ZIXING = new Set(["辰", "午", "酉", "亥"]);

const SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

type E = {
  getYearGan: () => string; getYearZhi: () => string; getYearHideGan: () => string[];
  getYearNaYin: () => string; getYearShiShenGan: () => string; getYearShiShenZhi: () => string[];
  getYearDiShi: () => string; getYearXunKong: () => string;
  getMonthGan: () => string; getMonthZhi: () => string; getMonthHideGan: () => string[];
  getMonthNaYin: () => string; getMonthShiShenGan: () => string; getMonthShiShenZhi: () => string[];
  getMonthDiShi: () => string; getMonthXunKong: () => string;
  getDayGan: () => string; getDayZhi: () => string; getDayHideGan: () => string[];
  getDayNaYin: () => string; getDayShiShenGan: () => string; getDayShiShenZhi: () => string[];
  getDayDiShi: () => string; getDayXunKong: () => string;
  getTimeGan: () => string; getTimeZhi: () => string; getTimeHideGan: () => string[];
  getTimeNaYin: () => string; getTimeShiShenGan: () => string; getTimeShiShenZhi: () => string[];
  getTimeDiShi: () => string; getTimeXunKong: () => string;
  getTaiYuan: () => string; getMingGong: () => string; getShenGong: () => string;
  getYun: (g: number) => { getStartYear: () => number; getStartMonth: () => number; getStartDay: () => number; getDaYun: () => { getGanZhi: () => string; getStartYear: () => number; getStartAge: () => number; getEndAge: () => number }[] };
};

function pillar(label: string, gan: string, zhi: string, hide: string[], nayin: string, sg: string, sz: string[], ds: string, xk: string): Pillar {
  return {
    label, gan, zhi, hide, nayin, shishenGan: sg, shishenZhi: sz, dishi: ds, xunkong: xk,
    wxGan: GAN_WX[gan] ?? "", wxZhi: ZHI_WX[zhi] ?? "",
  };
}

function pairHit(a: string, b: string, table: [string, string][] | [string, string, string][]) {
  return table.find((t) => (t[0] === a && t[1] === b) || (t[0] === b && t[1] === a));
}

export function pillarRelations(pillars: Pillar[]): PillarRel[] {
  const out: PillarRel[] = [];
  const seen = new Set<string>();
  const push = (rel: PillarRel) => {
    const key = `${rel.on}:${rel.kind}:${[rel.a, rel.b].sort().join("")}:${rel.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(rel);
  };

  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const A = pillars[i];
      const B = pillars[j];
      const he = pairHit(A.gan, B.gan, GAN_HE);
      if (he) push({ a: A.label, b: B.label, kind: "合", label: `${A.gan}${B.gan}${(he as [string, string, string])[2]}`, on: "gan" });
      const gc = pairHit(A.gan, B.gan, GAN_CHONG);
      if (gc) push({ a: A.label, b: B.label, kind: "冲", label: `${A.gan}${B.gan}冲`, on: "gan" });
      const zh = pairHit(A.zhi, B.zhi, ZHI_HE);
      if (zh) push({ a: A.label, b: B.label, kind: "合", label: `${A.zhi}${B.zhi}${(zh as [string, string, string])[2]}`, on: "zhi" });
      const zc = pairHit(A.zhi, B.zhi, ZHI_CHONG);
      if (zc) push({ a: A.label, b: B.label, kind: "冲", label: `${A.zhi}${B.zhi}冲`, on: "zhi" });
      const hai = pairHit(A.zhi, B.zhi, ZHI_HAI);
      if (hai) push({ a: A.label, b: B.label, kind: "害", label: `${A.zhi}${B.zhi}害`, on: "zhi" });
      const po = pairHit(A.zhi, B.zhi, ZHI_PO);
      if (po) push({ a: A.label, b: B.label, kind: "破", label: `${A.zhi}${B.zhi}破`, on: "zhi" });
      const xp = pairHit(A.zhi, B.zhi, XING_PAIR);
      if (xp) push({ a: A.label, b: B.label, kind: "刑", label: `${A.zhi}${B.zhi}${(xp as [string, string, string])[2]}`, on: "zhi" });
    }
    if (ZIXING.has(pillars[i].zhi) && pillars.filter((p) => p.zhi === pillars[i].zhi).length >= 2 && i === pillars.findIndex((p) => p.zhi === pillars[i].zhi)) {
      const same = pillars.filter((p) => p.zhi === pillars[i].zhi);
      if (same.length >= 2) push({ a: same[0].label, b: same[1].label, kind: "刑", label: `${pillars[i].zhi}自刑`, on: "zhi" });
    }
  }

  for (const [x, y, z, name] of XING_SAN) {
    const hit = [x, y, z].map((b) => pillars.find((p) => p.zhi === b)).filter(Boolean) as Pillar[];
    if (hit.length >= 2) {
      push({ a: hit[0].label, b: hit[1].label, kind: "刑", label: `${hit.map((p) => p.zhi).join("")}${name}`, on: "zhi" });
    }
  }
  for (const [x, y, z, name] of ZHI_SANHE) {
    const hit = [x, y, z].map((b) => pillars.find((p) => p.zhi === b)).filter(Boolean) as Pillar[];
    if (hit.length >= 2) {
      push({ a: hit[0].label, b: hit[hit.length - 1].label, kind: "三合", label: `${hit.map((p) => p.zhi).join("")}${name}`, on: "zhi" });
    }
  }
  return out;
}

function yongFrom(dayWx: string, scores: Record<string, number>, total: number) {
  const self = scores[dayWx] ?? 0;
  const ratio = total <= 0 ? 0 : self / total;
  const strength: BaziResult["strength"] = ratio >= 0.32 ? "身旺" : ratio <= 0.18 ? "身弱" : "中和";
  const printWx = Object.entries(SHENG).find(([, v]) => v === dayWx)?.[0] ?? "";
  const officialWx = Object.entries(KE).find(([, v]) => v === dayWx)?.[0] ?? "";
  const outputWx = SHENG[dayWx] ?? "";
  const wealthWx = KE[dayWx] ?? "";
  const peerWx = dayWx;
  if (strength === "身旺") {
    const cand = [officialWx, outputWx, wealthWx].filter(Boolean);
    const yong = cand.sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0))[0] ?? officialWx;
    return { strength, yongshen: yong, xishen: cand.filter((x) => x !== yong)[0] ?? outputWx, jishen: peerWx };
  }
  if (strength === "身弱") {
    const cand = [printWx, peerWx].filter(Boolean);
    const yong = cand.sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0))[0] ?? printWx;
    return { strength, yongshen: yong, xishen: cand.filter((x) => x !== yong)[0] ?? peerWx, jishen: officialWx };
  }
  return { strength, yongshen: printWx || outputWx, xishen: outputWx, jishen: officialWx };
}

export function computeBazi(b: BirthInput): BaziResult {
  const e = eightCharOf(b) as unknown as E;
  const lunar = lunarOf(b);
  const pillars: Pillar[] = [
    pillar("年", e.getYearGan(), e.getYearZhi(), e.getYearHideGan(), e.getYearNaYin(), e.getYearShiShenGan(), e.getYearShiShenZhi(), e.getYearDiShi(), e.getYearXunKong()),
    pillar("月", e.getMonthGan(), e.getMonthZhi(), e.getMonthHideGan(), e.getMonthNaYin(), e.getMonthShiShenGan(), e.getMonthShiShenZhi(), e.getMonthDiShi(), e.getMonthXunKong()),
    pillar("日", e.getDayGan(), e.getDayZhi(), e.getDayHideGan(), e.getDayNaYin(), e.getDayShiShenGan(), e.getDayShiShenZhi(), e.getDayDiShi(), e.getDayXunKong()),
    pillar("时", e.getTimeGan(), e.getTimeZhi(), e.getTimeHideGan(), e.getTimeNaYin(), e.getTimeShiShenGan(), e.getTimeShiShenZhi(), e.getTimeDiShi(), e.getTimeXunKong()),
  ];
  const yun = e.getYun(b.gender === "male" ? 1 : 0);
  const dayGan = pillars[2].gan;
  const nowY = new Date().getFullYear();
  const dayun: DaYunItem[] = yun.getDaYun().slice(0, 8).map((d) => {
    const gz = d.getGanZhi() || "起运前";
    const startYear = d.getStartYear();
    const startAge = d.getStartAge();
    const endAge = d.getEndAge();
    const span = Math.max(1, endAge - startAge + 1);
    return {
      ganzhi: gz,
      startYear,
      startAge,
      endAge,
      shishen: gz.length >= 1 && GAN.includes(gz[0] as (typeof GAN)[number]) ? shiShen(dayGan, gz[0] ?? "") : "",
      current: startYear <= nowY && nowY < startYear + span,
    };
  });
  const liunian: LiuNianItem[] = Array.from({ length: 12 }, (_, i) => {
    const year = nowY - 4 + i;
    return {
      year,
      ganzhi: ganzhiOfYear(year),
      age: year - b.year,
      current: year === nowY,
    };
  }).filter((x) => x.age >= 0);
  const shensha: { name: string; at: string }[] = [];
  const gui = GUIREN[dayGan] ?? [];
  pillars.forEach((p) => {
    if (gui.includes(p.zhi)) shensha.push({ name: "天乙贵人", at: p.label });
    if (TAOHUA[pillars[2].zhi] === p.zhi) shensha.push({ name: "桃花", at: p.label });
    if (HUAGAI[pillars[2].zhi] === p.zhi) shensha.push({ name: "华盖", at: p.label });
    if (YIMA[pillars[2].zhi] === p.zhi) shensha.push({ name: "驿马", at: p.label });
    if (YANGREN[dayGan] === p.zhi) shensha.push({ name: "羊刃", at: p.label });
    if (JIANGXING[pillars[0].zhi] === p.zhi) shensha.push({ name: "将星", at: p.label });
    if (WANGSHEN[pillars[0].zhi] === p.zhi) shensha.push({ name: "亡神", at: p.label });
    if (GUCHEN[pillars[0].zhi] === p.zhi) shensha.push({ name: "孤辰", at: p.label });
    if (GUASU[pillars[0].zhi] === p.zhi) shensha.push({ name: "寡宿", at: p.label });
    if (KUIGANG.has(p.gan + p.zhi)) shensha.push({ name: "魁罡", at: p.label });
  });
  const monthNum = lunar.getMonth();
  pillars.forEach((p) => {
    if (TIANDE[monthNum] === p.gan || TIANDE[monthNum] === p.zhi) shensha.push({ name: "天德", at: p.label });
    if (YUEDE[monthNum] === p.gan) shensha.push({ name: "月德", at: p.label });
  });
  const scores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((p) => {
    scores[p.wxGan] += 12;
    scores[p.wxZhi] += 8;
    p.hide.forEach((h, i) => {
      const w = GAN_WX[h];
      if (w) scores[w] += i === 0 ? 5 : 2;
    });
  });
  const total = Object.values(scores).reduce((s, n) => s + n, 0);
  const dayWx = GAN_WX[dayGan] ?? "";
  const ys = yongFrom(dayWx, scores, total);
  const monthGod = pillars[1].shishenZhi[0] || pillars[1].shishenGan;
  const geju = monthGod && monthGod !== "日主" ? `${monthGod}格` : "建禄格";
  return {
    lunar: lunar.toString(),
    animal: lunar.getYearShengXiao(),
    taiyuan: e.getTaiYuan(),
    minggong: e.getMingGong(),
    shengong: e.getShenGong(),
    pillars,
    dayun,
    liunian,
    yunStart: `${yun.getStartYear()}年 ${yun.getStartMonth()}个月 ${yun.getStartDay()}天`,
    shensha,
    scores,
    geju,
    dayMaster: `${dayGan}${dayWx}`,
    dayWx,
    strength: ys.strength,
    yongshen: ys.yongshen,
    xishen: ys.xishen,
    jishen: ys.jishen,
    relations: pillarRelations(pillars),
  };
}
