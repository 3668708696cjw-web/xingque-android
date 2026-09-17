export type Technique = {
  path: string;
  name: string;
  blurb: string;
  mark: string;
};

/** 对照 Windows navigationPages：命 / 卜 / 工具。不含 AI、3D、直播、管理。 */
export const MING: Technique[] = [
  { path: "/natal", name: "占星", blurb: "本命、宫制、相位、希腊点", mark: "星" },
  { path: "/transits", name: "星运", blurb: "过运、返照、法达、太阳弧、小限", mark: "运" },
  { path: "/bazi", name: "八字", blurb: "四柱、大运流年、神煞", mark: "八" },
  { path: "/ziwei", name: "紫微", blurb: "十二宫、四化、大限", mark: "紫" },
  { path: "/qizheng", name: "七政", blurb: "七政四余、果老星宗", mark: "政" },
  { path: "/vedic", name: "印占", blurb: "北印盘、月宿、达沙", mark: "印" },
  { path: "/parts", name: "辅盘", blurb: "阿拉伯点、谐波、龙盘、卜卦、ACG", mark: "辅" },
  { path: "/synastry", name: "合盘", blurb: "比较盘、双轮", mark: "合" },
  { path: "/shushu", name: "数算", blurb: "皇极、铁板、河洛、梅花", mark: "数" },
  { path: "/mingother", name: "演禽", blurb: "演禽、一掌经、策天", mark: "禽" },
];

export const BU: Technique[] = [
  { path: "/sanshi", name: "三式", blurb: "太乙、六壬、奇门同参", mark: "三" },
  { path: "/liuren", name: "六壬", blurb: "天地盘、四课三传、涉害", mark: "壬" },
  { path: "/qimen", name: "遁甲", blurb: "时家转盘飞盘、拆补置闰", mark: "奇" },
  { path: "/liuyao", name: "六爻", blurb: "纳甲、世应、伏神", mark: "爻" },
  { path: "/taiyi", name: "太乙", blurb: "积年入局、计神", mark: "乙" },
  { path: "/jieqi", name: "分至", blurb: "春分夏至秋分冬至盘", mark: "至" },
  { path: "/fengshui", name: "风水", blurb: "八宅、玄空紫白、大游年", mark: "风" },
  { path: "/tarot", name: "塔罗", blurb: "伟特、马赛、雷诺曼", mark: "塔" },
  { path: "/jinkou", name: "金口", blurb: "四位、人元遁干", mark: "金" },
  { path: "/taixuan", name: "太玄", blurb: "八十一首、灵棋同参", mark: "玄" },
  { path: "/geomancy", name: "地占", blurb: "十六图形盾牌", mark: "地" },
  { path: "/wuzhao", name: "五兆", blurb: "雨霁蒙济中", mark: "兆" },
  { path: "/jingjue", name: "荆诀", blurb: "荆州诀、时间起卦", mark: "荆" },
  { path: "/xiaoliuren", name: "小六壬", blurb: "大安留连速喜赤口小吉空亡", mark: "小" },
  { path: "/feigong", name: "飞宫", blurb: "飞宫小奇门", mark: "飞" },
  { path: "/xiaocheng", name: "小成图", blurb: "八卦小成、体用", mark: "成" },
  { path: "/lingqi", name: "灵棋", blurb: "灵棋经十二棋", mark: "棋" },
];

export const TOOLS: Technique[] = [
  { path: "/history", name: "玄学史", blurb: "人物、编年、天象、词条、地图", mark: "史" },
  { path: "/almanac", name: "黄历", blurb: "宜忌、建除、时辰", mark: "历" },
  { path: "/zeri", name: "择日", blurb: "二十一日窗、吉门吉神", mark: "择" },
  { path: "/sky", name: "天文馆", blurb: "此刻星空、二十八宿", mark: "天" },
  { path: "/reference", name: "辅助", blurb: "卦象、宫位、十神、规则", mark: "辅" },
  { path: "/celebs", name: "数据库", blurb: "公开出生数据", mark: "库" },
];

export const ALL_TECHNIQUES = [...MING, ...BU, ...TOOLS];

export const SECTIONS: { key: string; title: string; items: Technique[] }[] = [
  { key: "ming", title: "命", items: MING },
  { key: "bu", title: "卜", items: BU },
  { key: "tools", title: "工具", items: TOOLS },
];
