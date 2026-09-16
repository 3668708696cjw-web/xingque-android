export type Technique = {
  path: string;
  name: string;
  blurb: string;
  mark: string;
};

export const MING: Technique[] = [
  { path: "/natal", name: "占星", blurb: "本命、宫制、相位", mark: "星" },
  { path: "/transits", name: "星运", blurb: "过运、返照、法达", mark: "运" },
  { path: "/synastry", name: "合盘", blurb: "比较盘、双轮", mark: "合" },
  { path: "/parts", name: "辅盘", blurb: "阿拉伯点、中点", mark: "辅" },
  { path: "/vedic", name: "印占", blurb: "北印钻石盘", mark: "印" },
  { path: "/qizheng", name: "七政", blurb: "七政四余", mark: "政" },
  { path: "/bazi", name: "八字", blurb: "四柱、大运流年", mark: "八" },
  { path: "/ziwei", name: "紫微", blurb: "十二宫、四化、大限", mark: "紫" },
  { path: "/shushu", name: "数术", blurb: "皇极、铁板、河洛", mark: "数" },
];

export const BU: Technique[] = [
  { path: "/sanshi", name: "三式", blurb: "太乙、六壬、奇门同参", mark: "三" },
  { path: "/qimen", name: "奇门", blurb: "时家飞盘、空亡驿马", mark: "奇" },
  { path: "/liuren", name: "六壬", blurb: "天地盘、四课三传", mark: "壬" },
  { path: "/taiyi", name: "太乙", blurb: "积年入局", mark: "乙" },
  { path: "/liuyao", name: "六爻", blurb: "纳甲、世应、互卦", mark: "爻" },
  { path: "/fengshui", name: "风水", blurb: "八宅罗盘", mark: "风" },
  { path: "/tarot", name: "塔罗", blurb: "伟特牌阵", mark: "塔" },
  { path: "/geomancy", name: "地占", blurb: "十六图形盾牌", mark: "地" },
  { path: "/jinkou", name: "金口", blurb: "四位断法", mark: "金" },
  { path: "/taixuan", name: "太玄", blurb: "八十一首、灵棋", mark: "玄" },
];

export const TOOLS: Technique[] = [
  { path: "/history", name: "玄学史", blurb: "人物、编年、天象、词条", mark: "史" },
  { path: "/almanac", name: "黄历", blurb: "宜忌、建除、通书", mark: "历" },
  { path: "/sky", name: "天文馆", blurb: "此刻星空、二十八宿", mark: "天" },
  { path: "/reference", name: "类象", blurb: "卦象、宫位、十神", mark: "类" },
  { path: "/celebs", name: "名人", blurb: "公开出生数据", mark: "人" },
];

export const ALL_TECHNIQUES = [...MING, ...BU, ...TOOLS];

export const SECTIONS: { key: string; title: string; items: Technique[] }[] = [
  { key: "ming", title: "命", items: MING },
  { key: "bu", title: "卜", items: BU },
  { key: "tools", title: "工具", items: TOOLS },
];
