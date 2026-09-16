import { lunarOf } from "./calendar";
import { GAN, ZHI, type BirthInput } from "./types";

const JIANG_BY_JIE: Record<string, string> = {
  雨水: "亥", 惊蛰: "亥", 春分: "戌", 清明: "戌", 谷雨: "酉", 立夏: "酉",
  小满: "申", 芒种: "申", 夏至: "未", 小暑: "未", 大暑: "午", 立秋: "午",
  处暑: "巳", 白露: "巳", 秋分: "辰", 寒露: "辰", 霜降: "卯", 立冬: "卯",
  小雪: "寅", 大雪: "寅", 冬至: "丑", 小寒: "丑", 大寒: "子", 立春: "子",
};

const GAN_HOME: Record<string, string> = {
  甲: "寅", 乙: "辰", 丙: "巳", 丁: "未", 戊: "巳", 己: "未",
  庚: "申", 辛: "戌", 壬: "亥", 癸: "丑",
};

const GUI_DAY: Record<string, [string, string]> = {
  甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
  乙: ["子", "申"], 己: ["子", "申"],
  丙: ["亥", "酉"], 丁: ["亥", "酉"],
  壬: ["巳", "卯"], 癸: ["巳", "卯"],
  辛: ["午", "寅"],
};

const JIANGS = ["贵人", "腾蛇", "朱雀", "六合", "勾陈", "青龙", "天空", "白虎", "太常", "玄武", "太阴", "天后"];
const WX: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
  子: "水", 亥: "水", 寅: "木", 卯: "木", 巳: "火", 午: "火", 申: "金", 酉: "金", 辰: "土", 戌: "土", 丑: "土", 未: "土",
};
const KE = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" } as const;

function idx(z: string) {
  return ZHI.indexOf(z as (typeof ZHI)[number]);
}
function zhiAt(i: number) {
  return ZHI[((i % 12) + 12) % 12];
}
function skyOn(di: string, tianPan: Record<string, string>) {
  return tianPan[di];
}

export type LiuRenResult = {
  yuejiang: string;
  ganzhi: string;
  jieqi: string;
  tianpan: Record<string, string>;
  sik: { name: string; upper: string; lower: string }[];
  san: string[];
  method: string;
  generals: Record<string, string>;
};

export function computeLiuren(b: BirthInput): LiuRenResult {
  const lunar = lunarOf(b);
  const jie = lunar.getPrevJieQi(true).getName();
  const yuejiang = JIANG_BY_JIE[jie] ?? "亥";
  const hourZ = lunar.getTimeZhi();
  const dayG = lunar.getEightChar().getDayGan();
  const dayZ = lunar.getEightChar().getDayZhi();

  const tianpan: Record<string, string> = {};
  const shift = idx(yuejiang) - idx(hourZ);
  ZHI.forEach((z, i) => {
    tianpan[z] = zhiAt(i + shift);
  });

  const ganHome = GAN_HOME[dayG];
  const firstU = tianpan[ganHome];
  const secondU = tianpan[firstU];
  const thirdU = tianpan[dayZ];
  const fourthU = tianpan[thirdU];
  const sik = [
    { name: "一课", upper: firstU, lower: dayG },
    { name: "二课", upper: secondU, lower: firstU },
    { name: "三课", upper: thirdU, lower: dayZ },
    { name: "四课", upper: fourthU, lower: thirdU },
  ];

  const keList: { upper: string; lower: string; kind: "zei" | "ke" }[] = [];
  sik.forEach((k) => {
    const uw = WX[k.upper];
    const lw = WX[k.lower];
    if (KE[lw as keyof typeof KE] === uw) keList.push({ upper: k.upper, lower: k.lower, kind: "zei" });
    else if (KE[uw as keyof typeof KE] === lw) keList.push({ upper: k.upper, lower: k.lower, kind: "ke" });
  });

  let method = "贼克";
  let chu = sik[0].upper;
  if (keList.length === 1) {
    chu = keList[0].upper;
    method = keList[0].kind === "zei" ? "重审（下贼上）" : "元首（上克下）";
  } else if (keList.length > 1) {
    const zei = keList.filter((x) => x.kind === "zei");
    const pool = zei.length ? zei : keList;
    const dayYang = GAN.indexOf(dayG as (typeof GAN)[number]) % 2 === 0;
    const matched = pool.filter((x) => idx(x.upper) % 2 === (dayYang ? 0 : 1));
    if (matched.length <= 1) {
      chu = (matched[0] ?? pool[0]).upper;
      method = matched.length === 1 ? "比用" : "涉害";
    } else {
      const meng = new Set(["寅", "申", "巳", "亥"]);
      const scored = matched.map((x) => {
        let n = 0;
        let z = x.lower.length === 1 ? x.lower : dayZ;
        for (let k = 0; k < 12; k++) {
          z = zhiAt(idx(z) + 1);
          n++;
          if (meng.has(z) || z === x.upper) break;
        }
        return { x, n };
      });
      scored.sort((a, b) => b.n - a.n);
      chu = scored[0].x.upper;
      method = "涉害";
    }
  } else if (firstU === ganHome && thirdU === dayZ) {
    method = "伏吟";
    chu = firstU;
  } else if (idx(firstU) === (idx(ganHome) + 6) % 12) {
    method = "返吟";
    chu = firstU;
  } else {
    method = "遥克";
    chu = firstU;
  }

  const zhong = tianpan[chu];
  const mo = tianpan[zhong];
  const san = [chu, zhong, mo];

  const hour = b.hour;
  const dayGui = hour >= 6 && hour < 18 ? GUI_DAY[dayG]?.[0] : GUI_DAY[dayG]?.[1];
  const gui = dayGui ?? "丑";
  const guiOn = Object.keys(tianpan).find((d) => tianpan[d] === gui) ?? "丑";
  const yangTurn = idx(guiOn);
  const generals: Record<string, string> = {};
  ZHI.forEach((z, i) => {
    generals[z] = JIANGS[(i - yangTurn + 12) % 12];
  });

  return {
    yuejiang,
    ganzhi: `${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}时`,
    jieqi: jie,
    tianpan,
    sik,
    san,
    method,
    generals,
  };
}
