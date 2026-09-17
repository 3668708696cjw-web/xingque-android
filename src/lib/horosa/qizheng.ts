import { computeNatal, type NatalChart } from "./natal";
import { formatDMS, SIGNS, type BirthInput } from "./types";
import { lunarOf } from "./calendar";
import { ZHI } from "./types";

export type QiZhengItem = { name: string; glyph: string; dms: string; lon: number; xiu: string; palace: string };

export const GUOLAO_PALACES = ["命宫", "财帛", "兄弟", "田宅", "男女", "奴仆", "夫妻", "疾厄", "迁移", "官禄", "福德", "相貌"] as const;

export type GuoLaoPalace = {
  name: string;
  branch: string;
  index: number;
  items: QiZhengItem[];
  isMing: boolean;
  isShen: boolean;
};

export type QiZhengResult = {
  natal: NatalChart;
  extras: QiZhengItem[];
  mingdu: { name: string; lon: number; dms: string; xiu: string; branch: string };
  shendu: { name: string; lon: number; dms: string; xiu: string; branch: string };
  list: QiZhengItem[];
  palaces: GuoLaoPalace[];
};

export const XIU = ["角", "亢", "氐", "房", "心", "尾", "箕", "斗", "牛", "女", "虚", "危", "室", "壁", "奎", "娄", "胃", "昴", "毕", "觜", "参", "井", "鬼", "柳", "星", "张", "翼", "轸"];
export const XIU_W = [12, 9, 16, 5, 6, 18, 10, 24, 7, 11, 10, 16, 17, 9, 16, 12, 15, 11, 16, 1, 9, 30, 2, 13, 6, 17, 19, 17];
const XIU_SUM = XIU_W.reduce((a, b) => a + b, 0);

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

export function xiuOf(lon: number) {
  const sid = norm(lon - 180);
  const scaled = (sid / 360) * XIU_SUM;
  let acc = 0;
  for (let i = 0; i < XIU.length; i++) {
    acc += XIU_W[i];
    if (scaled < acc) return XIU[i] + "宿";
  }
  return "轸宿";
}

export function xiuIndexOf(lon: number) {
  const sid = norm(lon - 180);
  const scaled = (sid / 360) * XIU_SUM;
  let acc = 0;
  for (let i = 0; i < XIU.length; i++) {
    acc += XIU_W[i];
    if (scaled < acc) return i;
  }
  return 27;
}

function palaceOf(lon: number) {
  return SIGNS[Math.floor(norm(lon) / 30)].name;
}

function item(name: string, glyph: string, lon: number): QiZhengItem {
  return { name, glyph, lon, dms: formatDMS(lon), xiu: xiuOf(lon), palace: palaceOf(lon) };
}

export function computeQizheng(b: BirthInput): QiZhengResult {
  const natal = computeNatal(b, true);
  const sun = natal.planets.find((p) => p.key === "Sun")!.lon;
  const moon = natal.planets.find((p) => p.key === "Moon")!.lon;
  const node = natal.planets.find((p) => p.key === "Node")!.lon;
  const ketu = norm(node + 180);
  const d = Date.UTC(b.year, b.month - 1, b.day) / 86400000;
  const ziqi = norm(3.22 + 0.111 * (d - 10957));
  const yuebo = norm(moon + 49 + (sun - moon) * 0.05);
  const extras: QiZhengItem[] = [
    item("罗睺", "☊", node),
    item("计都", "☋", ketu),
    item("紫气", "✧", ziqi),
    item("月孛", "☽", yuebo),
  ];

  const lunar = lunarOf(b);
  const month = lunar.getMonth();
  const hourZ = lunar.getTimeZhi();
  const monthPalace = (2 + (month - 1)) % 12;
  const hourIdx = ZHI.indexOf(hourZ as (typeof ZHI)[number]);
  const mingIdx = (monthPalace - hourIdx + 12) % 12;
  const shenIdx = (mingIdx + 6) % 12;
  const mingdu = {
    name: "命度",
    lon: mingIdx * 30 + 15,
    dms: formatDMS(mingIdx * 30 + 15),
    xiu: xiuOf(mingIdx * 30 + 15),
    branch: ZHI[mingIdx],
  };
  const shendu = {
    name: "身度",
    lon: shenIdx * 30 + 15,
    dms: formatDMS(shenIdx * 30 + 15),
    xiu: xiuOf(shenIdx * 30 + 15),
    branch: ZHI[shenIdx],
  };

  const classical = natal.planets
    .filter((p) => !p.modern && p.key !== "SNode")
    .map((p) => item(p.name, p.glyph, p.lon));

  const list = [...classical, ...extras];
  const palaces: GuoLaoPalace[] = ZHI.map((branch, i) => {
    const name = GUOLAO_PALACES[(i - mingIdx + 12) % 12];
    const items = list.filter((p) => Math.floor(norm(p.lon) / 30) === i);
    return {
      name,
      branch,
      index: i,
      items,
      isMing: i === mingIdx,
      isShen: i === shenIdx,
    };
  });

  return { natal, extras, mingdu, shendu, list, palaces };
}
