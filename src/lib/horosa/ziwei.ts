import { astro } from "iztro";
import { timeIndexFromHour, type BirthInput } from "./types";

export type ZiweiStar = { name: string; brightness?: string; mutagen?: string };
export type ZiweiPalace = {
  name: string;
  stem: string;
  branch: string;
  isBody: boolean;
  isOrigin: boolean;
  majors: ZiweiStar[];
  minors: string[];
  adjectives: string[];
  changsheng: string;
  decadal: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
};

export type ZiweiResult = {
  solar: string;
  lunar: string;
  time: string;
  sign: string;
  zodiac: string;
  soul: string;
  body: string;
  five: string;
  soulBranch: string;
  bodyBranch: string;
  palaces: ZiweiPalace[];
  yearly: { stem: string; branch: string; mutagen: string[] };
};

export function computeZiwei(b: BirthInput): ZiweiResult {
  const gender = b.gender === "male" ? "男" : "女";
  const date = `${b.year}-${b.month}-${b.day}`;
  const a = astro.bySolar(date, timeIndexFromHour(b.hour), gender, true, "zh-CN");
  const h = a.horoscope();
  return {
    solar: a.solarDate,
    lunar: a.lunarDate,
    time: a.time,
    sign: a.sign,
    zodiac: a.zodiac,
    soul: a.soul,
    body: a.body,
    five: a.fiveElementsClass,
    soulBranch: a.earthlyBranchOfSoulPalace,
    bodyBranch: a.earthlyBranchOfBodyPalace,
    palaces: a.palaces.map((p) => ({
      name: p.name,
      stem: p.heavenlyStem,
      branch: p.earthlyBranch,
      isBody: p.isBodyPalace,
      isOrigin: p.isOriginalPalace,
      majors: p.majorStars.map((s) => ({
        name: s.name,
        brightness: s.brightness,
        mutagen: s.mutagen || undefined,
      })),
      minors: p.minorStars.map((s) => s.name),
      adjectives: p.adjectiveStars.map((s) => s.name),
      changsheng: p.changsheng12,
      decadal: p.decadal as ZiweiPalace["decadal"],
    })),
    yearly: {
      stem: String(h.yearly.heavenlyStem),
      branch: String(h.yearly.earthlyBranch),
      mutagen: (h.yearly.mutagen ?? []).map(String),
    },
  };
}

/** Display order: 巳午未申 / 辰    酉 / 卯    戌 / 寅丑子亥 — south-up. */
export const PALACE_GRID: (number | null)[][] = [
  [5, 6, 7, 8],
  [4, null, null, 9],
  [3, null, null, 10],
  [2, 1, 0, 11],
];
