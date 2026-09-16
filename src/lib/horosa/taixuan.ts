import { type BirthInput } from "./types";

/** 扬雄《太玄》八十一首，方州部家之序。 */
export const SHOU = [
  "中", "周", "礥", "闲", "少", "戾", "上", "干", "狩",
  "羡", "差", "童", "增", "锐", "达", "交", "耎", "徯",
  "从", "进", "释", "格", "夷", "乐", "争", "务", "事",
  "更", "断", "毅", "装", "众", "密", "亲", "敛", "强",
  "睟", "盛", "居", "法", "应", "迎", "遇", "灶", "大",
  "廓", "文", "礼", "逃", "唐", "常", "度", "昆", "减",
  "唫", "守", "翕", "闭", "成", "志", "沉", "内", "去",
  "晦", "瞢", "穷", "割", "止", "坚", "失", "剧", "驯",
  "将", "难", "勤", "养", "剧", "驯", "将", "难", "勤",
];

const CLASSIC = [
  "中", "周", "礥", "闲", "少", "戾", "上", "干", "狩",
  "羡", "差", "童", "增", "锐", "达", "交", "耎", "徯",
  "从", "进", "释", "格", "夷", "乐", "争", "务", "事",
  "更", "断", "毅", "装", "众", "密", "亲", "敛", "强",
  "睟", "盛", "居", "法", "应", "迎", "遇", "灶", "大",
  "廓", "文", "礼", "逃", "唐", "常", "度", "昆", "减",
  "唫", "守", "翕", "闭", "成", "志", "沉", "内", "去",
  "晦", "瞢", "穷", "割", "止", "坚", "失", "剧", "驯",
  "将", "难", "勤", "养", "格", "夷", "乐", "争", "务",
];

const PRAISE: Record<string, string> = {
  中: "阳气潜萌于黄宫，信无不在其中。",
  周: "阳气周神而反乎始，物继其汇。",
  礥: "阳气微动，动而礥礥，物生之难。",
  闲: "阳气闲于阴，物咸宜而闲。",
  少: "阳气少，物将潜动而未形。",
  戾: "阳气戾乎上，阴气戾乎下。",
  上: "阳气能上，物咸得其愿。",
  干: "阳气扶物而钻乎艰，物堪其困。",
  狩: "阳气南狩，物咸得其愿。",
};

export type TaiXuanResult = {
  index: number;
  name: string;
  lines: number[];
  praise: string;
  lingqi: { casts: [number, number, number]; name: string; note: string };
};

export function computeTaixuan(b: BirthInput): TaiXuanResult {
  const n = (b.year * 12 + b.month) * 30 + b.day + b.hour;
  const lines = [0, 1, 2, 3].map((i) => ((n + i * 17) % 3) + 1);
  const index = lines.reduce((a, c, i) => a + (c - 1) * 3 ** (3 - i), 0) % 81;
  const name = CLASSIC[index] ?? `第${index + 1}首`;
  const praise = PRAISE[name] ?? `太玄以三为数，四重为首。此首 ${name}（第 ${index + 1}），画为 ${lines.join("·")}。一为天，二为地，三为人。`;
  const casts: [number, number, number] = [(n % 5) || 5, (Math.floor(n / 5) % 5) || 5, (Math.floor(n / 25) % 5) || 5];
  const lingIndex = (casts[0] - 1) * 25 + (casts[1] - 1) * 5 + (casts[2] - 1);
  return {
    index,
    name,
    lines,
    praise,
    lingqi: {
      casts,
      name: `第 ${lingIndex + 1} 卦`,
      note: "灵棋十二子，上中下各四。一上一中一下为大通，四上四中四下为纯阴。凡一百二十五卦，旧题东方朔。",
    },
  };
}
