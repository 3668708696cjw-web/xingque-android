import { type BirthInput } from "./types";

const PALACE = ["", "坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];
const MEN = ["", "休门", "死门", "伤门", "杜门", "死门", "开门", "惊门", "生门", "景门"];
const SHEN16 = ["地主", "阳德", "和德", "吕申", "高丛", "太阳", "大灵", "大神", "大威", "天道", "大武", "武德", "太簇", "阴主", "阴德", "大义"];

function mod9(n: number) {
  return ((n % 9) + 9) % 9;
}

export type TaiyiCell = { palace: number; name: string; stars: string[]; men: string };
export type TaiyiSixteenGod = { name: string; palace: number };
export type TaiyiResult = {
  jinian: number;
  ju: number;
  yang: boolean;
  yuan: string;
  tianyimu: number;
  jishen: number;
  wenchang: number;
  shiji: number;
  heshen: string;
  cells: TaiyiCell[];
  sixteen: TaiyiSixteenGod[];
  note: string;
};

export function computeTaiyi(b: BirthInput): TaiyiResult {
  const y = b.year;
  const jinian = ((y + 1015) % 360) + 1;
  const yang = jinian % 72 < 36;
  const ju = ((jinian - 1) % 72 % 24 % 9) + 1 || 9;
  const yuan = ["上元", "中元", "下元"][Math.floor(((jinian - 1) % 72) / 24)];
  const tianyimu = ((jinian - 1) % 8) + 1;
  const muPalace = [1, 8, 3, 4, 9, 2, 7, 6][tianyimu - 1];
  const jishen = yang ? ((muPalace + 4 - 1) % 8) + 1 : ((muPalace + 2 - 1) % 8) + 1;
  const wenchang = ((muPalace + (yang ? 1 : 7) - 1) % 8) + 1;
  const shiji = ju;

  const cells: TaiyiCell[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => ({
    palace: p,
    name: PALACE[p],
    stars: [],
    men: MEN[p],
  }));
  const skip5 = (p: number) => (p === 5 ? (yang ? 2 : 8) : p);
  const place = (star: string, p: number) => {
    cells.find((c) => c.palace === skip5(p))?.stars.push(star);
  };
  place("太乙", muPalace);
  place("文昌", wenchang);
  place("始击", shiji);
  place("主大将", ((ju + 1) % 9) + 1);
  place("主参将", ((ju + 3) % 9) + 1);
  place("客大将", ((ju + 4) % 9) + 1);
  place("客参将", ((ju + 6) % 9) + 1);
  place("定计大将", ((ju + 2) % 9) + 1);
  place("计神", jishen);

  const sixteen: TaiyiSixteenGod[] = SHEN16.map((s, i) => {
    const palace = skip5(mod9(muPalace - 1 + (yang ? i : -i)) + 1);
    place(s, palace);
    return { name: s, palace };
  });

  const heshen = SHEN16[(jinian - 1) % 16];

  return {
    jinian,
    ju,
    yang,
    yuan,
    tianyimu: muPalace,
    jishen,
    wenchang,
    shiji,
    heshen,
    cells,
    sixteen,
    note: `太乙积年 ${jinian}，${yang ? "阳" : "阴"}${ju}局 · ${yuan}。天乙在${PALACE[muPalace]}，计神在${PALACE[skip5(jishen)]}，合神${heshen}。`,
  };
}
