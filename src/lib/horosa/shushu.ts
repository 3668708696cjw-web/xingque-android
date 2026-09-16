import { lunarOf } from "./calendar";
import { computeLiuyaoTime } from "./liuyao";
import { GAN, ZHI, type BirthInput } from "./types";

const ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const GAN_HE = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
const ZHI_HE = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
const PALM = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export type ShuShuResult = {
  huangji: { yuan: string; hui: string; yun: string; shi: string; gua: string };
  meihua: { name: string; changeName: string; method: string };
  yanqin: { year: string; month: string; day: string; hour: string; note: string };
  tieban: { no: number; note: string };
  heluo: { xiantian: number; houtian: number; note: string };
  yizhang: { palm: string; note: string };
};

export function computeShushu(b: BirthInput): ShuShuResult {
  const y = b.year;
  const from = y + 2697;
  const yuan = Math.floor(from / 129600) + 1;
  const rem = from % 129600;
  const hui = Math.floor(rem / 10800) + 1;
  const rem2 = rem % 10800;
  const yun = Math.floor(rem2 / 360) + 1;
  const shi = (rem2 % 360) + 1;
  const guaNames = ["复", "颐", "既济", "家人", "益", "屯", "颐", "随"];
  const huangji = {
    yuan: `第${yuan}元`,
    hui: `第${hui}会`,
    yun: `第${yun}运`,
    shi: `第${shi}世`,
    gua: guaNames[(yun - 1) % guaNames.length],
  };
  const meihua = computeLiuyaoTime(b);
  const lunar = lunarOf(b);
  const yz = lunar.getYearInGanZhi();
  const gz = yz[0];
  const zz = yz[1];
  const yanqin = {
    year: ANIMALS[ZHI.indexOf(zz as (typeof ZHI)[number])] ?? "",
    month: ANIMALS[(b.month + 1) % 12],
    day: ANIMALS[(b.day + 1) % 12],
    hour: ANIMALS[ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number])] ?? "",
    note: "年禽为主，日禽为用，时禽为变。",
  };
  const n = (b.year * 12 + b.month + b.day + b.hour) % 120;
  const gi = Math.max(0, GAN.indexOf(gz as (typeof GAN)[number]));
  const zi = Math.max(0, ZHI.indexOf(zz as (typeof ZHI)[number]));
  const xiantian = GAN_HE[gi] + ZHI_HE[zi];
  const houtian = ((xiantian + b.hour) % 10) + 1;
  return {
    huangji,
    meihua: { name: meihua.name, changeName: meihua.changeName, method: meihua.method },
    yanqin,
    tieban: {
      no: n + 1,
      note: `铁板定数第 ${n + 1}。一百二十数，托名邵雍，是皇极的民间简化。`,
    },
    heluo: {
      xiantian,
      houtian,
      note: "河洛以先天数为体、后天数为用，和子平共用四柱。",
    },
    yizhang: {
      palm: PALM[zi % 8],
      note: `年支落${PALM[zi % 8]}宫。一掌经是把干支收到手上的口诀。`,
    },
  };
}
