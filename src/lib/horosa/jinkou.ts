import { lunarOf } from "./calendar";
import { ZHI, GAN, type BirthInput } from "./types";

const JIANG = ["贵", "蛇", "朱", "合", "勾", "龙", "空", "虎", "常", "玄", "阴", "后"];
const GAN_HOME: Record<string, string> = {
  甲: "寅", 乙: "辰", 丙: "巳", 丁: "未", 戊: "巳", 己: "未", 庚: "申", 辛: "戌", 壬: "亥", 癸: "丑",
};
const GUI_YANG: Record<string, string> = {
  甲: "未", 乙: "申", 丙: "酉", 丁: "亥", 戊: "丑", 己: "子", 庚: "丑", 辛: "寅", 壬: "卯", 癸: "巳",
};
const YUEJIANG: Record<string, string> = {
  雨水: "亥", 惊蛰: "亥", 春分: "戌", 清明: "戌", 谷雨: "酉", 立夏: "酉",
  小满: "申", 芒种: "申", 夏至: "未", 小暑: "未", 大暑: "午", 立秋: "午",
  处暑: "巳", 白露: "巳", 秋分: "辰", 寒露: "辰", 霜降: "卯", 立冬: "卯",
  小雪: "寅", 大雪: "寅", 冬至: "丑", 小寒: "丑", 大寒: "子", 立春: "子",
};
const WU_SHU: Record<string, number> = { 甲: 0, 己: 0, 乙: 2, 庚: 2, 丙: 4, 辛: 4, 丁: 6, 壬: 6, 戊: 8, 癸: 8 };

export type JinKouResult = {
  difen: string;
  jiang: string;
  guishen: string;
  yuejiang: string;
  renyuan: string;
  notes: string[];
};

export function computeJinkou(b: BirthInput, placeZhi?: string): JinKouResult {
  const lunar = lunarOf(b);
  const difen = placeZhi ?? lunar.getTimeZhi();
  const dayG = lunar.getEightChar().getDayGan();
  const jie = lunar.getPrevJieQi(true).getName();
  const yuejiang = YUEJIANG[jie] ?? lunar.getMonthInGanZhi().slice(1);
  const guiHome = GUI_YANG[dayG] ?? GAN_HOME[dayG];
  const di = ZHI.indexOf(difen as (typeof ZHI)[number]);
  const yj = ZHI.indexOf(yuejiang as (typeof ZHI)[number]);
  const tianOnDi = ZHI[((yj - (ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number])) + di) % 12 + 12) % 12];
  const guiIdx = ZHI.indexOf(guiHome as (typeof ZHI)[number]);
  const guishen = JIANG[(di - guiIdx + 12) % 12];
  const jiang = JIANG[(ZHI.indexOf(tianOnDi) - guiIdx + 12) % 12];
  const start = WU_SHU[dayG] ?? 0;
  const renyuan = GAN[(start + di) % 10];
  const notes = [
    `地分 ${difen}：问事落宫，主方位与所属。`,
    `月将 ${yuejiang}：太阳过宫（${jie}后），加于时支得天盘。`,
    `人元 ${renyuan}：日干五鼠遁加地分，看天干旺衰。`,
    `贵神 ${guishen}：天乙贵人临地分，定尊卑。`,
    `将 ${jiang}：天盘将神加地分，合四位看生克。`,
  ];
  return { difen, jiang, guishen, yuejiang, renyuan, notes };
}

export { GAN };
