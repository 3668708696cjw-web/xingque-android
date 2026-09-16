import { type BirthInput } from "./types";

const TRG = ["", "坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];
const EAST = new Set(["坎", "震", "巽", "离"]);
const DIRS: { name: string; gua: string; luoshu: number }[] = [
  { name: "北", gua: "坎", luoshu: 1 },
  { name: "东北", gua: "艮", luoshu: 8 },
  { name: "东", gua: "震", luoshu: 3 },
  { name: "东南", gua: "巽", luoshu: 4 },
  { name: "南", gua: "离", luoshu: 9 },
  { name: "西南", gua: "坤", luoshu: 2 },
  { name: "西", gua: "兑", luoshu: 7 },
  { name: "西北", gua: "乾", luoshu: 6 },
];
const BAZHAI_EAST = { 生气: "震", 天医: "离", 延年: "巽", 伏位: "坎", 五鬼: "艮", 六煞: "坤", 祸害: "兑", 绝命: "乾" };
const BAZHAI_WEST = { 生气: "兑", 天医: "坤", 延年: "乾", 伏位: "艮", 五鬼: "坎", 六煞: "离", 祸害: "震", 绝命: "巽" };

export type FengshuiResult = {
  mingGua: string;
  group: "东四命" | "西四命";
  yuan: string;
  yun: number;
  lucky: string[];
  unlucky: string[];
  sitting: { name: string; kind: string; note: string }[];
  feixing: { palace: string; star: number }[];
};

function digitSum(n: number) {
  let x = Math.abs(n);
  while (x > 9) x = String(x).split("").reduce((a, c) => a + Number(c), 0);
  return x === 0 ? 9 : x;
}

function mingFromYear(year: number, female: boolean) {
  const n = digitSum(year);
  let g = female ? 4 + n : 11 - n;
  if (g > 9) g -= 9;
  if (g <= 0) g += 9;
  if (g === 5) g = female ? 8 : 2;
  return TRG[g];
}

function currentYun(year: number) {
  if (year >= 2024) return { yuan: "下元九运", yun: 9 };
  if (year >= 2004) return { yuan: "下元八运", yun: 8 };
  if (year >= 1984) return { yuan: "下元七运", yun: 7 };
  if (year >= 1964) return { yuan: "中元六运", yun: 6 };
  return { yuan: "中元五运", yun: 5 };
}

export function computeFengshui(b: BirthInput): FengshuiResult {
  const mingGua = mingFromYear(b.year, b.gender === "female");
  const group = EAST.has(mingGua) ? "东四命" : "西四命";
  const { yuan, yun } = currentYun(b.year);
  const map = group === "东四命" ? BAZHAI_EAST : BAZHAI_WEST;
  const kindOf = (gua: string) => {
    const hit = Object.entries(map).find(([, g]) => g === gua);
    return hit?.[0] ?? "";
  };
  const luckyKinds = new Set(["生气", "天医", "延年", "伏位"]);
  const sitting = DIRS.map((d) => {
    const kind = kindOf(d.gua);
    return {
      name: d.name,
      kind,
      note: luckyKinds.has(kind) ? "宜门、卧、灶" : "少久住，宜化泄",
    };
  });
  const lucky = sitting.filter((s) => luckyKinds.has(s.kind)).map((s) => s.name);
  const unlucky = sitting.filter((s) => !luckyKinds.has(s.kind)).map((s) => s.name);
  const order = [5, 6, 7, 8, 9, 1, 2, 3, 4];
  const feixing = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((p, i) => ({
    palace: TRG[p],
    star: ((yun - 1 + i) % 9) + 1,
  }));
  void order;
  return { mingGua, group, yuan, yun, lucky, unlucky, sitting, feixing };
}
