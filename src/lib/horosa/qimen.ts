import { lunarOf } from "./calendar";
import { GAN, ZHI, type BirthInput } from "./types";

const STARS = ["天蓬", "天芮", "天冲", "天辅", "天禽", "天心", "天柱", "天任", "天英"];
const DOORS = ["休门", "死门", "伤门", "杜门", "", "开门", "惊门", "生门", "景门"];
const GODS_YANG = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];
const GODS_YIN = ["值符", "九天", "九地", "玄武", "白虎", "六合", "太阴", "腾蛇"];
const PALACE_NAME = ["", "坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];
const PALACE_WX = ["", "水", "土", "木", "木", "土", "金", "金", "土", "火"];
const PALACE_ZHI: Record<number, string[]> = {
  1: ["子"],
  2: ["未", "申"],
  3: ["卯"],
  4: ["辰", "巳"],
  5: [],
  6: ["戌", "亥"],
  7: ["酉"],
  8: ["丑", "寅"],
  9: ["午"],
};
const DOOR_WX: Record<string, string> = {
  休门: "水",
  生门: "土",
  伤门: "木",
  杜门: "木",
  景门: "火",
  死门: "土",
  惊门: "金",
  开门: "金",
};
const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const YI = ["戊", "己", "庚", "辛", "壬", "癸"];
const QI = ["丁", "丙", "乙"];
const XUN_KONG: Record<string, string> = {
  甲子: "戌亥",
  甲戌: "申酉",
  甲申: "午未",
  甲午: "辰巳",
  甲辰: "寅卯",
  甲寅: "子丑",
};
const MA_PALACE: Record<string, number> = {
  申: 8,
  子: 8,
  辰: 8,
  寅: 2,
  午: 2,
  戌: 2,
  亥: 4,
  卯: 4,
  未: 4,
  巳: 6,
  酉: 6,
  丑: 6,
};

const YANG_JU: Record<string, [number, number, number]> = {
  冬至: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6],
  立春: [8, 5, 2], 雨水: [9, 6, 3], 惊蛰: [1, 7, 4],
  春分: [3, 9, 6], 清明: [4, 1, 7], 谷雨: [5, 2, 8],
  立夏: [4, 1, 7], 小满: [5, 2, 8], 芒种: [6, 3, 9],
};
const YIN_JU: Record<string, [number, number, number]> = {
  夏至: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4],
  立秋: [2, 5, 8], 处暑: [1, 4, 7], 白露: [9, 3, 6],
  秋分: [7, 1, 4], 寒露: [6, 9, 3], 霜降: [5, 8, 2],
  立冬: [6, 9, 3], 小雪: [5, 8, 2], 大雪: [4, 7, 1],
};

const EIGHT = [1, 2, 3, 4, 6, 7, 8, 9];
const GAN_CHONG: Record<string, string> = {
  甲: "庚", 庚: "甲", 乙: "辛", 辛: "乙", 丙: "壬", 壬: "丙", 丁: "癸", 癸: "丁",
};
const JI_DOORS = new Set(["开门", "休门", "生门"]);
const SANQI = new Set(["乙", "丙", "丁"]);

export type QimenCell = {
  palace: number;
  name: string;
  diGan: string;
  tianGan: string;
  star: string;
  door: string;
  god: string;
  zhi: string;
  wx: string;
  kong: boolean;
  ma: boolean;
  menpo: boolean;
  zhifu: boolean;
  zhishi: boolean;
  geju: string[];
};

export type QimenPattern = {
  name: string;
  palace: number;
  palaceName: string;
  note: string;
};

export type QimenResult = {
  yang: boolean;
  ju: number;
  yuan: string;
  jieqi: string;
  xunshou: string;
  kongwang: string;
  zhifu: string;
  zhishi: string;
  ganzhi: string;
  maPalace: number;
  mode: "转盘" | "飞盘";
  dingju: "拆补" | "置闰";
  cells: QimenCell[];
  patterns: QimenPattern[];
};

function seq(yang: boolean) {
  return yang ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 9, 8, 7, 6, 5, 4, 3, 2];
}

function xunShou(gan: string, zhi: string) {
  const gi = GAN.indexOf(gan as (typeof GAN)[number]);
  const zi = ZHI.indexOf(zhi as (typeof ZHI)[number]);
  const zg = ZHI[(zi - gi + 12) % 12];
  const yiMap: Record<string, string> = { 子: "戊", 戌: "己", 申: "庚", 午: "辛", 辰: "壬", 寅: "癸" };
  return { gan: "甲", zhi: zg, yi: yiMap[zg] ?? "戊" };
}

export function computeQimen(b: BirthInput, opts?: { mode?: "转盘" | "飞盘"; dingju?: "拆补" | "置闰" }): QimenResult {
  const lunar = lunarOf(b);
  const mode = opts?.mode ?? "转盘";
  const dingju = opts?.dingju ?? "拆补";
  const jie = lunar.getPrevJieQi(true);
  const jieName = jie.getName();
  const solar0 = jie.getSolar();
  const jieDays = Math.floor(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(solar0.getYear(), solar0.getMonth() - 1, solar0.getDay())) /
      86400000,
  );
  let yuanIdx = Math.min(2, Math.max(0, Math.floor(jieDays / 5)));
  if (dingju === "置闰" && (jieName === "芒种" || jieName === "大雪") && jieDays > 9) yuanIdx = 2;
  const yang = Boolean(YANG_JU[jieName]);
  const table = yang ? YANG_JU : YIN_JU;
  const ju = (table[jieName] ?? [1, 7, 4])[yuanIdx];
  const s = seq(yang);
  const start = s.indexOf(ju);
  const di: Record<number, string> = {};
  for (let i = 0; i < 6; i++) di[s[(start + i) % 9]] = YI[i];
  for (let i = 0; i < 3; i++) di[s[(start - 1 - i + 9) % 9]] = QI[i];

  const hourGan = lunar.getTimeGan();
  const hourZhi = lunar.getTimeZhi();
  const xs = xunShou(hourGan, hourZhi);
  let fuPalace = 5;
  for (const p of s) if (di[p] === xs.yi) fuPalace = p;

  const fly = yang ? EIGHT : [...EIGHT].reverse();
  const useGan = hourGan === "甲" ? xs.yi : hourGan;
  let ganPalace = 5;
  for (const p of s) if (di[p] === useGan) ganPalace = p;
  if (ganPalace === 5) ganPalace = yang ? 2 : 8;
  if (fuPalace === 5) fuPalace = yang ? 2 : 8;

  const fuStar = STARS[fuPalace - 1];
  const tianStar: Record<number, string> = { 5: "天禽" };
  const fuIdx = fly.indexOf(fuPalace);
  const destIdx = fly.indexOf(ganPalace);
  const shift = (destIdx - fuIdx + 8) % 8;
  fly.forEach((p, i) => {
    const originPalace = fly[(i - shift + 8) % 8];
    tianStar[p] = STARS[originPalace - 1];
  });
  if (mode === "飞盘") {
    const luo = yang ? [1, 8, 3, 4, 9, 2, 7, 6] : [1, 6, 7, 2, 9, 4, 3, 8];
    const fuLuo = Math.max(0, luo.indexOf(fuPalace === 5 ? (yang ? 2 : 8) : fuPalace));
    const ganLuo = Math.max(0, luo.indexOf(ganPalace === 5 ? (yang ? 2 : 8) : ganPalace));
    const flyShift = (ganLuo - fuLuo + 8) % 8;
    luo.forEach((p, i) => {
      const origin = luo[(i - flyShift + 8) % 8];
      tianStar[p] = STARS[origin - 1];
    });
  }
  if (fuStar === "天禽") tianStar[ganPalace] = "天禽";

  const doorHome: Record<number, string> = {};
  DOORS.forEach((d, i) => {
    if (d) doorHome[i + 1] = d;
  });
  const fuDoor = doorHome[fuPalace] || "休门";
  const tianDoor: Record<number, string> = {};
  fly.forEach((p, i) => {
    const originPalace = fly[(i - shift + 8) % 8];
    tianDoor[p] = doorHome[originPalace] || "";
  });

  const gods = yang ? GODS_YANG : GODS_YIN;
  const tianGod: Record<number, string> = {};
  const gStart = fly.indexOf(ganPalace);
  fly.forEach((p, i) => {
    tianGod[p] = gods[(i - gStart + 8) % 8];
  });

  const tianGan: Record<number, string> = {};
  fly.forEach((p) => {
    const star = tianStar[p];
    const home = STARS.indexOf(star) + 1;
    tianGan[p] = di[home] ?? "";
  });
  tianGan[5] = di[5] ?? "";
  tianStar[5] = tianStar[5] || "天禽";

  const xunKey = `甲${xs.zhi}`;
  const kongwang = XUN_KONG[xunKey] ?? "";
  const maPalace = MA_PALACE[hourZhi] ?? 0;
  const shiPalace = Object.entries(tianDoor).find(([, d]) => d === fuDoor)?.[0];

  const cells: QimenCell[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((palace) => {
    const door = tianDoor[palace] ?? "";
    const zhi = (PALACE_ZHI[palace] ?? []).join("");
    const wx = PALACE_WX[palace];
    const dwx = DOOR_WX[door];
    const kong = Boolean(zhi && [...zhi].some((z) => kongwang.includes(z)));
    const tian = tianGan[palace] ?? di[palace] ?? "";
    const diG = di[palace] ?? "";
    const geju: string[] = [];
    if (tian && diG && tian === diG) geju.push("伏吟");
    if (tian && diG && GAN_CHONG[tian] === diG) geju.push("反吟");
    if (tian === "戊" && diG === "丙") geju.push("青龙返首");
    if (tian === "丙" && diG === "戊") geju.push("飞鸟跌穴");
    if (SANQI.has(tian) && JI_DOORS.has(door)) geju.push("三奇得使");
    else if (SANQI.has(tian)) geju.push("三奇");
    if (Boolean(dwx && wx && KE[wx] === dwx)) geju.push("门迫");
    if (kong) geju.push("空亡");
    return {
      palace,
      name: PALACE_NAME[palace],
      diGan: diG,
      tianGan: tian,
      star: tianStar[palace] ?? STARS[palace - 1],
      door,
      god: tianGod[palace] ?? "",
      zhi,
      wx,
      kong,
      ma: palace === maPalace,
      menpo: Boolean(dwx && wx && KE[wx] === dwx),
      zhifu: tianStar[palace] === fuStar && palace !== 5,
      zhishi: String(palace) === String(shiPalace),
      geju,
    };
  });

  const patterns: QimenPattern[] = cells.flatMap((c) =>
    c.geju
      .filter((g) => g !== "空亡" && g !== "三奇")
      .map((name) => ({
        name,
        palace: c.palace,
        palaceName: c.name,
        note: `${c.name}宫 ${c.tianGan}/${c.diGan} ${c.door}`,
      })),
  );

  return {
    yang,
    ju,
    yuan: ["上元", "中元", "下元"][yuanIdx],
    jieqi: jieName,
    xunshou: xunKey,
    kongwang,
    zhifu: fuStar,
    zhishi: fuDoor,
    ganzhi: `${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${lunar.getDayInGanZhi()} ${lunar.getTimeInGanZhi()}`,
    maPalace,
    mode,
    dingju,
    cells,
    patterns,
  };
}

export const QIMEN_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];
