export type Gender = "male" | "female";

export type BirthInput = {
  name: string;
  gender: Gender;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  cityId: string;
};

export type SavedChart = BirthInput & {
  id: string;
  createdAt: number;
};

export const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const WUXING = ["木", "火", "土", "金", "水"] as const;

export const GAN_WX: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const ZHI_WX: Record<string, string> = {
  子: "水",
  亥: "水",
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  申: "金",
  酉: "金",
  辰: "土",
  戌: "土",
  丑: "土",
  未: "土",
};

export const SIGNS = [
  { name: "白羊", en: "Aries", glyph: "♈", element: "火", mode: "本位" },
  { name: "金牛", en: "Taurus", glyph: "♉", element: "土", mode: "固定" },
  { name: "双子", en: "Gemini", glyph: "♊", element: "风", mode: "变动" },
  { name: "巨蟹", en: "Cancer", glyph: "♋", element: "水", mode: "本位" },
  { name: "狮子", en: "Leo", glyph: "♌", element: "火", mode: "固定" },
  { name: "处女", en: "Virgo", glyph: "♍", element: "土", mode: "变动" },
  { name: "天秤", en: "Libra", glyph: "♎", element: "风", mode: "本位" },
  { name: "天蝎", en: "Scorpio", glyph: "♏", element: "水", mode: "固定" },
  { name: "射手", en: "Sagittarius", glyph: "♐", element: "火", mode: "变动" },
  { name: "摩羯", en: "Capricorn", glyph: "♑", element: "土", mode: "本位" },
  { name: "水瓶", en: "Aquarius", glyph: "♒", element: "风", mode: "固定" },
  { name: "双鱼", en: "Pisces", glyph: "♓", element: "水", mode: "变动" },
] as const;

export function signOf(lon: number) {
  const i = Math.floor((((lon % 360) + 360) % 360) / 30);
  return { index: i, ...SIGNS[i], deg: ((lon % 360) + 360) % 360 };
}

export function formatDMS(lon: number) {
  const n = ((lon % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(n / 30)];
  const within = n % 30;
  const d = Math.floor(within);
  const m = Math.floor((within - d) * 60);
  return `${sign.name} ${d}°${String(m).padStart(2, "0")}′`;
}

export function formatDeg(lon: number) {
  const n = ((lon % 360) + 360) % 360;
  const within = n % 30;
  const d = Math.floor(within);
  const m = Math.floor((within - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
}

export function hourZhi(hour: number) {
  return ZHI[Math.floor(((hour + 1) % 24) / 2)];
}

export function timeIndexFromHour(hour: number) {
  return Math.floor(((hour + 1) % 24) / 2);
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function birthLabel(b: BirthInput) {
  return `${b.year}-${pad2(b.month)}-${pad2(b.day)} ${pad2(b.hour)}:${pad2(b.minute)}`;
}

export function ganzhiOfYear(year: number) {
  const i = ((year - 1984) % 60 + 60) % 60;
  return `${GAN[i % 10]}${ZHI[i % 12]}`;
}

export function shiShen(dayGan: string, other: string) {
  const di = GAN.indexOf(dayGan as (typeof GAN)[number]);
  const oi = GAN.indexOf(other as (typeof GAN)[number]);
  if (di < 0 || oi < 0) return "";
  const diff = (oi - di + 10) % 10;
  const same = di % 2 === oi % 2;
  const names = same
    ? ["比肩", "食神", "偏财", "七杀", "偏印"]
    : ["劫财", "伤官", "正财", "正官", "正印"];
  return names[Math.floor(diff / 2)];
}

export function wxClass(wx: string) {
  if (wx === "木") return "text-wood";
  if (wx === "火") return "text-fire";
  if (wx === "土") return "text-earth";
  if (wx === "金") return "text-metal";
  if (wx === "水") return "text-water";
  return "text-muted";
}
