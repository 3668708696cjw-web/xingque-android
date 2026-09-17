import { almanacOf } from "./almanac";
import { computeBazi } from "./bazi";
import { computeLiuren } from "./liuren";
import { computeNatal } from "./natal";
import { computeQimen } from "./qimen";
import { computeQizheng } from "./qizheng";
import { computeTaiyi } from "./taiyi";
import { computeVedic } from "./vedic";
import { computeZiwei } from "./ziwei";
import { type BirthInput } from "./types";

export type ZeriTech =
  | "黄历"
  | "天星"
  | "奇门"
  | "八字"
  | "太乙"
  | "紫微"
  | "六壬"
  | "三式"
  | "七政"
  | "印占";

export const ZERI_TECHS: ZeriTech[] = ["黄历", "天星", "奇门", "八字", "太乙", "紫微", "六壬", "三式", "七政", "印占"];

export type ZeriRow = {
  ymd: string;
  week: string;
  lunar: string;
  score: number;
  note: string;
  detail: string;
};

function clamp(n: number) {
  return Math.max(-4, Math.min(6, n));
}

function dayBirth(cityId: string, d: Date, hour = 12): BirthInput {
  return {
    name: "",
    gender: "male",
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour,
    minute: 0,
    cityId,
  };
}

export function computeZeriDesk(natal: BirthInput, tech: ZeriTech, from = new Date(), days = 21): ZeriRow[] {
  const out: ZeriRow[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const a = almanacOf(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const b = dayBirth(natal.cityId, d);
    let score = 0;
    let detail = "";
    if (tech === "黄历") {
      const good = ["除", "开", "成", "定"].includes(a.zhixing);
      const yiHit = a.yi.some((x) => /嫁娶|出行|开市|入宅|祈福/.test(x));
      const jiHit = a.ji.some((x) => /嫁娶|出行|开市/.test(x));
      score = (good ? 2 : 0) + (yiHit ? 2 : 0) - (jiHit ? 2 : 0) + (a.dao.includes("黄道") ? 1 : 0);
      detail = `${a.zhixing}日 宜${a.yi.slice(0, 2).join(" ")}`;
    } else if (tech === "天星") {
      const n = computeNatal(natal, false, "whole");
      const t = computeNatal(b, false, "whole");
      const jup = t.planets.find((p) => p.key === "Jupiter");
      const ven = t.planets.find((p) => p.key === "Venus");
      const mar = t.planets.find((p) => p.key === "Mars");
      const natalSun = n.planets.find((p) => p.key === "Sun")?.lon ?? 0;
      const soft = (x?: { lon: number }) => {
        if (!x) return 0;
        const sep = Math.min(Math.abs(x.lon - natalSun), 360 - Math.abs(x.lon - natalSun));
        return sep < 8 || Math.abs(sep - 120) < 6 ? 2 : 0;
      };
      score = soft(jup) + soft(ven) - (mar && Math.min(Math.abs(mar.lon - natalSun), 360 - Math.abs(mar.lon - natalSun)) < 8 ? 2 : 0);
      detail = `木 ${jup?.dms ?? ""} 金 ${ven?.dms ?? ""}`;
    } else if (tech === "奇门") {
      const q = computeQimen(b, { mode: "转盘", dingju: "拆补" });
      const door = q.zhishi;
      score = ["开门", "生门", "休门"].includes(door) ? 3 : ["死门", "惊门"].includes(door) ? -2 : 0;
      if (q.patterns.some((p) => /三奇|真诈|伏吟/.test(p.name))) score += 1;
      detail = `${q.yang ? "阳" : "阴"}${q.ju}局 值使${door}`;
    } else if (tech === "八字") {
      const n = computeBazi(natal);
      const t = computeBazi(b);
      const dayG = n.pillars[2].gan;
      const tg = t.pillars[2].gan;
      const he: Record<string, string> = { 甲: "己", 乙: "庚", 丙: "辛", 丁: "壬", 戊: "癸", 己: "甲", 庚: "乙", 辛: "丙", 壬: "丁", 癸: "戊" };
      score = he[dayG] === tg ? 3 : dayG === tg ? 1 : 0;
      detail = `本${n.pillars[2].gan}${n.pillars[2].zhi} 日${t.pillars[2].gan}${t.pillars[2].zhi}`;
    } else if (tech === "太乙") {
      const t = computeTaiyi(b);
      score = t.heshen.includes("始") || t.ju <= 3 ? 2 : t.ju >= 7 ? -1 : 1;
      detail = `${t.yang ? "阳" : "阴"}${t.ju}局 文昌宫${t.wenchang}`;
    } else if (tech === "紫微") {
      const z = computeZiwei(b);
      const lucky = z.palaces.some((p) => p.isOrigin && p.majors.some((s) => /紫微|天府|太阳|禄存/.test(s.name)));
      score = lucky ? 3 : z.five.includes("土") ? 1 : 0;
      detail = `命${z.soul} 五行${z.five}`;
    } else if (tech === "六壬") {
      const l = computeLiuren(b);
      const gods = Object.values(l.generals).join("");
      score = /青龙|太常|六合|天后/.test(gods) ? 2 : 0;
      detail = `月将${l.yuejiang} ${l.method}`;
    } else if (tech === "三式") {
      const q = computeQimen(b);
      const t = computeTaiyi(b);
      const l = computeLiuren(b);
      score = (["开门", "生门"].includes(q.zhishi) ? 2 : 0) + (t.ju <= 4 ? 1 : 0);
      detail = `奇门${q.zhishi} 太乙${t.ju}局 六壬${l.method}`;
    } else if (tech === "七政") {
      const q = computeQizheng(b);
      score = /角|房|心|奎|娄|壁/.test(q.mingdu.xiu) ? 2 : 0;
      detail = `命度 ${q.mingdu.dms} ${q.mingdu.xiu}`;
    } else {
      const v = computeVedic(b);
      const good = /Rohini|Pushya|Uttara|Revati|Hasta/.test(v.moonNak.en);
      score = good ? 3 : v.moonNak.pada === 1 ? 1 : 0;
      detail = `${v.moonNak.name} ${v.moonNak.en} 步${v.moonNak.pada}`;
    }
    score = clamp(score);
    out.push({
      ymd: a.ymd,
      week: a.week,
      lunar: a.lunar,
      score,
      note: score >= 3 ? "宜择" : score <= 0 ? "宜避" : "中平",
      detail,
    });
  }
  return out;
}
