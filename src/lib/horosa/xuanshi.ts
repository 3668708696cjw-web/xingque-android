import { CLASSICS } from "./classics";
import { DYNASTIES, EVENTS, LINEAGES, PEOPLE, STORIES, yearLabel, type EventItem, type Person } from "./history";

export const XS_PAGES = [
  { key: "overview", label: "总览" },
  { key: "events", label: "玄学事件" },
  { key: "celestial", label: "星象大典" },
  { key: "figures", label: "人物列传" },
  { key: "stories", label: "故事专题" },
  { key: "timeline", label: "朝代时间轴" },
  { key: "encyclopedia", label: "词条百科" },
  { key: "map", label: "玄学地图" },
  { key: "persons", label: "人物关系" },
  { key: "desk", label: "案头" },
] as const;

export type XsPage = (typeof XS_PAGES)[number]["key"];

export const CAPITALS: { id: string; name: string; dynasty: string; x: number; y: number; note: string }[] = [
  { id: "hao", name: "镐京", dynasty: "西周", x: 28, y: 48, note: "西周都城，分野起于关中。" },
  { id: "xianyang", name: "咸阳", dynasty: "秦", x: 29, y: 47, note: "秦都。日者、候星入太史。" },
  { id: "changan", name: "长安", dynasty: "西汉 / 隋唐", x: 30, y: 46, note: "太史令、浑仪、麟德历、大衍历。" },
  { id: "luoyang", name: "洛阳", dynasty: "东汉 / 魏晋", x: 38, y: 46, note: "灵台、张衡、陈卓三家星。" },
  { id: "jiankang", name: "建康", dynasty: "东晋 / 南朝", x: 62, y: 58, note: "南渡之后的星历与术数。" },
  { id: "kaifeng", name: "开封", dynasty: "北宋", x: 44, y: 44, note: "司天监、印本占书、子平写定。" },
  { id: "linan", name: "临安", dynasty: "南宋", x: 66, y: 62, note: "南渡术数、通书、选择。" },
  { id: "dadu", name: "大都 / 北京", dynasty: "元明清", x: 52, y: 30, note: "回回历、时宪历、钦天监。" },
];

export type Term = {
  id: string;
  name: string;
  cat: "technique" | "dynasty" | "celestial";
  sub?: string;
  one: string;
  body: string;
};

export const CELESTIAL_TERMS: Term[] = [
  { id: "t-rixi", cat: "celestial", name: "日食", sub: "薄蚀", one: "日有食之。正史用以儆人君。", body: "《春秋》记日食，是中文编年里最硬的天象。食甚时刻、方位后来成为回推历法的标尺。占辞说「天子有忧」，观测本身却是仪器工作。" },
  { id: "t-yuexi", cat: "celestial", name: "月食", sub: "蔽于地", one: "月食地影。张衡已作光学解释。", body: "《灵宪》：月食，地之所蔽。从此月食不再只是灾异，也是浑天说的证据。术数仍占「大臣有黜」，天文志两边都写。" },
  { id: "t-huibo", cat: "celestial", name: "彗孛", sub: "星孛", one: "帚星与孛星。哈雷一类长周期彗星的文献名。", body: "孛于北斗、孛于大辰，是《春秋》以来的固定句式。孛偏光芒四出，彗偏有尾。明清通书把彗入灾异，近人用来回推哈雷。" },
  { id: "t-kexing", cat: "celestial", name: "客星", sub: "新星 / 超新星", one: "本来没有的星忽然来了。", body: "1054 年天关客星即蟹状星云前身。客星可「守」某宿，占辞与超新星、新星、亮变星混在同一栏目，要用现代对照才能分开。" },
  { id: "t-yinghuo", cat: "celestial", name: "荧惑守心", sub: "火星", one: "荧惑停留在心宿。占辞极重。", body: "心为明堂。荧惑守心，史书常接「大臣死」或「国有大丧」。实际是火星在天蝎附近的留。刘向以来反复书写，成为天象修辞。" },
  { id: "t-wuxing", cat: "celestial", name: "五星连珠", sub: "聚合", one: "五纬会于一方。祥瑞或兵象，看写法。", body: "水金火木土在黄道一段靠拢。汉人以为受命之符，宋人有时当兵象。现代轨道不难回推，文献难处在「连珠」口径不一。" },
  { id: "t-liuxing", cat: "celestial", name: "流星", sub: "奔星 / 飞星", one: "星陨如雨。可占兵，也可只是记录。", body: "流星雨在《天文志》里写成「星陨如雨」。流星、陨石、火流星共用一套词。真正落地的陨石另入五行志。" },
  { id: "t-ruixing", cat: "celestial", name: "瑞星", sub: "景星 / 含誉", one: "吉祥的非常之星。", body: "景星、含誉、格泽，名目多于实测。常与改元、封禅同时出现，史学价值在政治，不在光学。" },
  { id: "t-yaoxing", cat: "celestial", name: "妖星", sub: "蚩尤旗 / 天枪", one: "形状可怖的彗、流、极光一类。", body: "蚩尤旗、天枪、天棓，是形象分类。有的是彗尾扫地，有的是黄道光或极光。占家当兵象，今人当大气光学。" },
  { id: "t-yueyan", cat: "celestial", name: "月掩星", sub: "月犯", one: "月亮遮住恒星或行星。", body: "月掩、月犯是精确到时刻的记录，对回推历法和黄白交点有用。占辞说「其分有忧」，观测本身很干净。" },
  { id: "t-rier", cat: "celestial", name: "日珥 / 日晕", sub: "晕适背璚", one: "日旁气。气象光学入天文志。", body: "晕、珥、背、璚是日旁大气现象。术数占「有军」，王充已讥其应验驳杂。仍是通书里的常客。" },
  { id: "t-bo", cat: "celestial", name: "薄蚀", sub: "日食别名", one: "日食的另一套书面语。", body: "薄、蚀连言。乙巳占、开元占经把食分、起亏方位写成可操作的条目，是后来选择家的底本。" },
  { id: "t-suixing", cat: "celestial", name: "岁星超辰", sub: "木星", one: "木星十二年一周，有时「超辰」。", body: "岁星纪年的修正项。太岁、岁阴与实际木星位置对不上时，史官用超辰圆场。是中国岁星纪年的技术裂缝。" },
  { id: "t-taibai", cat: "celestial", name: "太白经天", sub: "金星", one: "金星白天可见，占兵。", body: "太白昼见、经天，是金星大距附近的现象。兵象几乎是固定搭配。观测不难，解释从不谦虚。" },
];

export const EXTRA_TECHS: Term[] = [
  { id: "tech-su", cat: "technique", name: "宿盘 / 二十八宿", sub: "天官", one: "以宿度为天的格子。", body: "二十八宿是中文天文学的赤道分区。七政四余、选择、禽星都从宿度说话，和黄道十二宫是两套网格。" },
  { id: "tech-tongshe", cat: "technique", name: "统摄法", sub: "占法", one: "用一套总法统摄诸占。", body: "明清选择、命理书里常见「统摄」：把神煞、贵人、月将收到几条总例上，避免条目互相打架。" },
  { id: "tech-wuzhao", cat: "technique", name: "五兆", sub: "卜法", one: "雨、霁、蒙、驿、克。龟兆的五种。", body: "《洪范》稽疑：雨、霁、蒙、驿、克。是龟卜的兆象分类，后来有时被术数书借来充当五行占的别名。" },
  { id: "tech-jingjue", cat: "technique", name: "荆诀", sub: "民间", one: "楚地一路的口诀占。", body: "以口诀传、以物象断。文献少、口头多。和金口、小六壬一样，是正统三式之外的快占。" },
  { id: "tech-shenyi", cat: "technique", name: "神易数", sub: "数理", one: "把易数做成可查的断语。", body: "近于皇极、河洛的民间形态：出生或一事化成数，再入卦或入断语表。托古者多，结构是查表。" },
  { id: "tech-yanqin", cat: "technique", name: "演禽", sub: "禽星", one: "二十八宿配禽，论人论宅。", body: "以宿禽、星度论命。和七政、选择交叠。明清坊间流行，正统星学家常视为旁支。" },
  { id: "tech-acg", cat: "technique", name: "星体地图", sub: "占星地理", one: "把本命轴线投到地球上。", body: "行星过 ASC/MC 的地理轨迹。二十世纪占星的空间化。星阙桌面版用等距投影；本机离线版以本命宫制与城市经纬承接。" },
  { id: "tech-firdaria", cat: "technique", name: "法达 / 小限 / 主限", sub: "推运", one: "把一生切成行星主事的段落。", body: "法达来自波斯—阿拉伯，小限、岁次、主限是希腊化推运。星运页用过运与返照承接其「把时间切开」的方法。" },
];

export function encyclopedia(): Term[] {
  const techs: Term[] = LINEAGES.map((l) => ({
    id: l.id,
    cat: "technique" as const,
    name: l.name,
    sub: l.technique,
    one: l.chain[0] + " → " + l.chain[l.chain.length - 1],
    body: l.body + "\n\n源流：" + l.chain.join(" → "),
  }));
  const dyn: Term[] = DYNASTIES.filter((d) => d.id !== "west").map((d) => ({
    id: "dyn-" + d.id,
    cat: "dynasty" as const,
    name: d.name,
    sub: `${yearLabel(d.from)}–${yearLabel(d.to)}`,
    one: d.name + "的术数地层。",
    body: `${d.name}（${yearLabel(d.from)}–${yearLabel(d.to)}）。本馆所收人物、事件、文献均按此朝代条带归类，与正史《天文志》《方技传》对照阅读。`,
  }));
  return [...techs, ...EXTRA_TECHS, ...dyn, ...CELESTIAL_TERMS];
}

export function xsStats() {
  return {
    people: PEOPLE.length,
    events: EVENTS.length,
    sky: EVENTS.filter((e) => e.kind === "sky").length,
    stories: STORIES.length,
    classics: CLASSICS.length,
    lineages: LINEAGES.length,
    terms: encyclopedia().length,
  };
}

export function featured(n = 6): EventItem[] {
  return [...EVENTS].sort((a, b) => a.year - b.year).filter((e) => e.kind === "chronicle").slice(0, n);
}

export function featuredFigures(n = 8): Person[] {
  return PEOPLE.filter((p) => p.tags.length && p.body.length > 40).slice(0, n);
}

export function dailyPick(d = new Date()) {
  const i = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % PEOPLE.length;
  return PEOPLE[i];
}

export function timelineSeries() {
  return DYNASTIES.filter((d) => d.id !== "west").map((d) => {
    const events = EVENTS.filter((e) => e.dynasty === d.id);
    const people = PEOPLE.filter((p) => p.dynasty === d.id);
    return { ...d, events: events.length, people: people.length, total: events.length + people.length };
  });
}

export type Bookmark = { kind: string; id: string; title: string; ts: number };
const BM_KEY = "xingque.xs.bookmarks";
const HIST_KEY = "xingque.xs.search";

export function listBookmarks(): Bookmark[] {
  try {
    const v = JSON.parse(localStorage.getItem(BM_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(b: Omit<Bookmark, "ts">) {
  const cur = listBookmarks();
  const i = cur.findIndex((x) => x.kind === b.kind && x.id === b.id);
  const next = i >= 0 ? cur.filter((_, j) => j !== i) : [{ ...b, ts: Date.now() }, ...cur].slice(0, 40);
  localStorage.setItem(BM_KEY, JSON.stringify(next));
  return next;
}

export function isBookmarked(kind: string, id: string) {
  return listBookmarks().some((x) => x.kind === kind && x.id === id);
}

export function pushSearch(q: string) {
  const s = q.trim();
  if (!s) return;
  try {
    const cur = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    const list = Array.isArray(cur) ? cur.filter((x: { q: string }) => x.q !== s) : [];
    list.unshift({ q: s, ts: Date.now() });
    localStorage.setItem(HIST_KEY, JSON.stringify(list.slice(0, 16)));
  } catch {
    /* ignore */
  }
}

export function listSearches(): { q: string; ts: number }[] {
  try {
    const v = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function personGraph(limit = 28) {
  const ranked = [...PEOPLE].sort((a, b) => b.links.length - a.links.length).slice(0, limit);
  const ids = new Set(ranked.map((p) => p.id));
  const nodes = ranked.map((p, i) => {
    const ang = (i / ranked.length) * Math.PI * 2 - Math.PI / 2;
    return { ...p, x: 50 + 38 * Math.cos(ang), y: 50 + 38 * Math.sin(ang) };
  });
  const edges: { a: string; b: string }[] = [];
  for (const p of ranked) {
    for (const l of p.links) {
      if (ids.has(l) && p.id < l) edges.push({ a: p.id, b: l });
    }
  }
  return { nodes, edges };
}
