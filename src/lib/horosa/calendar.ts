import { Solar } from "lunar-javascript";
import type { BirthInput } from "./types";

export function solarOf(b: Pick<BirthInput, "year" | "month" | "day" | "hour" | "minute">) {
  return Solar.fromYmdHms(b.year, b.month, b.day, b.hour, b.minute, 0);
}

export function lunarOf(b: Pick<BirthInput, "year" | "month" | "day" | "hour" | "minute">) {
  return solarOf(b).getLunar();
}

export function eightCharOf(b: Pick<BirthInput, "year" | "month" | "day" | "hour" | "minute">) {
  return lunarOf(b).getEightChar();
}

export function ganzhiPack(b: Pick<BirthInput, "year" | "month" | "day" | "hour" | "minute">) {
  const lunar = lunarOf(b);
  return {
    lunarText: lunar.toString(),
    year: lunar.getYearInGanZhi(),
    month: lunar.getMonthInGanZhi(),
    day: lunar.getDayInGanZhi(),
    time: lunar.getTimeInGanZhi(),
    animal: lunar.getYearShengXiao(),
  };
}
