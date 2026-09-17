/** 星阙技法体系：命 / 卜 / 工具。
 * 每门 = 路径 + 主盘 BoardKind + 子技法 views[]。
 * 页面合同：Screen + Workbench；中间画布按 views 切盘，已声明的 view 不得只写在侧栏文字里。
 * 不含 AI、3D、直播、管理。
 */

export type BoardKind =
  | "wheel"
  | "palace12"
  | "palace9"
  | "ring"
  | "palm"
  | "siwei"
  | "hexagram"
  | "pillars"
  | "shield"
  | "cards"
  | "dial"
  | "luopan"
  | "sky"
  | "map"
  | "timeline"
  | "bagua"
  | "list";

export type Technique = {
  path: string;
  name: string;
  blurb: string;
  mark: string;
  group: "ming" | "bu" | "tools";
  board: BoardKind;
  views: string[];
};

export const TECHNIQUES: Technique[] = [
  {
    path: "/natal",
    name: "占星",
    blurb: "本命、宫制、相位、五种盘貌",
    mark: "星",
    group: "ming",
    board: "wheel",
    views: ["圆盘", "希腊", "中世纪", "北印", "南印", "东印", "古典/现代", "宫制"],
  },
  {
    path: "/transits",
    name: "星运",
    blurb: "过运、返照、法达、黄道星释、十年",
    mark: "运",
    group: "ming",
    board: "wheel",
    views: ["过运双轮", "日返", "月返", "推进", "小限", "法达", "十年", "黄道星释", "太阳弧"],
  },
  {
    path: "/bazi",
    name: "八字",
    blurb: "四柱、大运流年、神煞、用神",
    mark: "八",
    group: "ming",
    board: "pillars",
    views: ["四柱", "藏干", "大运", "流年", "神煞", "格局"],
  },
  {
    path: "/ziwei",
    name: "紫微",
    blurb: "十二宫、四化、大限、流年",
    mark: "紫",
    group: "ming",
    board: "palace12",
    views: ["本命方盘", "四化", "辅星", "大限", "流年宫"],
  },
  {
    path: "/qizheng",
    name: "七政",
    blurb: "七政四余、果老星宗",
    mark: "政",
    group: "ming",
    board: "palace12",
    views: ["果老十二宫", "宿盘", "西盘", "四余", "命身"],
  },
  {
    path: "/xiu",
    name: "宿盘",
    blurb: "二十八宿、距星、入宿度",
    mark: "宿",
    group: "ming",
    board: "ring",
    views: ["二十八宿环", "四象", "入宿"],
  },
  {
    path: "/vedic",
    name: "印占",
    blurb: "北南西印、九分盘、月宿、达沙",
    mark: "印",
    group: "ming",
    board: "palace12",
    views: ["北印", "南印", "东印", "D9 九分", "月宿", "达沙"],
  },
  {
    path: "/parts",
    name: "辅盘",
    blurb: "阿拉伯点、界限、谐波、龙盘、卜卦、ACG",
    mark: "辅",
    group: "ming",
    board: "wheel",
    views: ["福点", "埃及界限", "谐波", "龙盘", "卜卦", "ACG 地图", "骰子"],
  },
  {
    path: "/synastry",
    name: "合盘",
    blurb: "比较、组合、时空中点、影响、马克斯",
    mark: "合",
    group: "ming",
    board: "wheel",
    views: ["比较", "组合", "时空中点", "影响盘", "马克斯"],
  },
  {
    path: "/asteroids",
    name: "小行星",
    blurb: "谷神智神婚神灶神、编号星历",
    mark: "小",
    group: "ming",
    board: "ring",
    views: ["黄道环", "谷神族", "星历包"],
  },
  {
    path: "/uranian",
    name: "汉堡",
    blurb: "中点、九十度盘、八颗天王星",
    mark: "汉",
    group: "ming",
    board: "dial",
    views: ["九十度盘", "本命", "中点", "天王星"],
  },
  {
    path: "/directions",
    name: "主限",
    blurb: "托勒密、奈博、主限弧",
    mark: "限",
    group: "ming",
    board: "wheel",
    views: ["奈博", "托勒密", "近限"],
  },
  {
    path: "/shushu",
    name: "数算",
    blurb: "皇极、铁板、河洛、神易、梅花",
    mark: "数",
    group: "ming",
    board: "hexagram",
    views: ["皇极元会运世", "梅花", "河洛洛书", "铁板", "神易", "演禽"],
  },
  {
    path: "/mingother",
    name: "演禽",
    blurb: "演禽、一掌经、策天飞星",
    mark: "禽",
    group: "ming",
    board: "ring",
    views: ["十二禽", "一掌经", "策天十二宫"],
  },
  {
    path: "/sanshi",
    name: "三式",
    blurb: "太乙、六壬、奇门同参",
    mark: "三",
    group: "bu",
    board: "palace9",
    views: ["太乙", "六壬", "遁甲"],
  },
  {
    path: "/tongshe",
    name: "统摄",
    blurb: "三式合一断、值使三传文昌",
    mark: "统",
    group: "bu",
    board: "palace9",
    views: ["同参", "吉凶票"],
  },
  {
    path: "/liuren",
    name: "六壬",
    blurb: "天地盘、四课三传、涉害",
    mark: "壬",
    group: "bu",
    board: "ring",
    views: ["天地盘", "四课", "三传"],
  },
  {
    path: "/qimen",
    name: "遁甲",
    blurb: "时家转盘飞盘、拆补置闰",
    mark: "奇",
    group: "bu",
    board: "palace9",
    views: ["九宫", "值符值使", "格局"],
  },
  {
    path: "/liuyao",
    name: "六爻",
    blurb: "纳甲、世应、伏神",
    mark: "爻",
    group: "bu",
    board: "hexagram",
    views: ["本卦", "变卦", "世应", "六神"],
  },
  {
    path: "/taiyi",
    name: "太乙",
    blurb: "积年入局、十六神、计神",
    mark: "乙",
    group: "bu",
    board: "palace9",
    views: ["九宫", "十六神", "积年"],
  },
  {
    path: "/jieqi",
    name: "分至",
    blurb: "春分夏至秋分冬至盘",
    mark: "至",
    group: "bu",
    board: "wheel",
    views: ["春分", "夏至", "秋分", "冬至"],
  },
  {
    path: "/fengshui",
    name: "风水",
    blurb: "八宅、玄空紫白、大游年",
    mark: "风",
    group: "bu",
    board: "luopan",
    views: ["飞星九宫", "罗盘", "八宅", "大游年"],
  },
  {
    path: "/tarot",
    name: "塔罗",
    blurb: "伟特、雷诺曼",
    mark: "塔",
    group: "bu",
    board: "cards",
    views: ["伟特", "雷诺曼", "三张", "五张"],
  },
  {
    path: "/jinkou",
    name: "金口",
    blurb: "四位、人元遁干",
    mark: "金",
    group: "bu",
    board: "siwei",
    views: ["四位", "月将", "口诀"],
  },
  {
    path: "/taixuan",
    name: "太玄",
    blurb: "八十一首、灵棋同参",
    mark: "玄",
    group: "bu",
    board: "hexagram",
    views: ["四画", "赞", "灵棋"],
  },
  {
    path: "/geomancy",
    name: "地占",
    blurb: "十六图形盾牌",
    mark: "地",
    group: "bu",
    board: "shield",
    views: ["四母", "四女", "四甥", "判官"],
  },
  {
    path: "/wuzhao",
    name: "五兆",
    blurb: "雨霁蒙济中",
    mark: "兆",
    group: "bu",
    board: "list",
    views: ["五兆"],
  },
  {
    path: "/jingjue",
    name: "荆诀",
    blurb: "荆州诀、时间起卦",
    mark: "荆",
    group: "bu",
    board: "hexagram",
    views: ["卦画"],
  },
  {
    path: "/xiaoliuren",
    name: "小六壬",
    blurb: "大安留连速喜赤口小吉空亡",
    mark: "小",
    group: "bu",
    board: "palm",
    views: ["掌诀"],
  },
  {
    path: "/feigong",
    name: "飞宫",
    blurb: "飞宫小奇门",
    mark: "飞",
    group: "bu",
    board: "palace9",
    views: ["九宫"],
  },
  {
    path: "/xiaocheng",
    name: "小成图",
    blurb: "八卦小成、体用",
    mark: "成",
    group: "bu",
    board: "bagua",
    views: ["体用互"],
  },
  {
    path: "/lingqi",
    name: "灵棋",
    blurb: "灵棋经十二棋",
    mark: "棋",
    group: "bu",
    board: "list",
    views: ["三才"],
  },
  {
    path: "/history",
    name: "玄学史",
    blurb: "人物、编年、天象、词条、地图",
    mark: "史",
    group: "tools",
    board: "list",
    views: ["人物", "编年", "地图", "词条"],
  },
  {
    path: "/almanac",
    name: "黄历",
    blurb: "宜忌、建除、时辰",
    mark: "历",
    group: "tools",
    board: "list",
    views: ["通书", "时辰"],
  },
  {
    path: "/zeri",
    name: "择日",
    blurb: "十技法：黄历天星奇门八字太乙紫微",
    mark: "择",
    group: "tools",
    board: "timeline",
    views: ["黄历", "天星", "奇门", "八字", "太乙", "紫微", "六壬", "三式", "七政", "印占"],
  },
  {
    path: "/sky",
    name: "天文馆",
    blurb: "此刻星空、二十八宿、恒星表",
    mark: "天",
    group: "tools",
    board: "sky",
    views: ["地平", "二十八宿"],
  },
  {
    path: "/reference",
    name: "辅助",
    blurb: "卦象、宫位、十神、规则",
    mark: "辅",
    group: "tools",
    board: "list",
    views: ["卦", "宫", "十神"],
  },
  {
    path: "/celebs",
    name: "数据库",
    blurb: "一万五千条 Rodden AA 生时",
    mark: "库",
    group: "tools",
    board: "list",
    views: ["检索", "入盘"],
  },
];

export const MING = TECHNIQUES.filter((t) => t.group === "ming");
export const BU = TECHNIQUES.filter((t) => t.group === "bu");
export const TOOLS = TECHNIQUES.filter((t) => t.group === "tools");
export const ALL_TECHNIQUES = TECHNIQUES;

export const SECTIONS: { key: string; title: string; items: Technique[] }[] = [
  { key: "ming", title: "命", items: MING },
  { key: "bu", title: "卜", items: BU },
  { key: "tools", title: "工具", items: TOOLS },
];

export function techniqueOf(path: string) {
  return TECHNIQUES.find((t) => t.path === path);
}

export function viewsOf(path: string): string[] {
  return techniqueOf(path)?.views ?? [];
}

export const BOARD_LABEL: Record<BoardKind, string> = {
  wheel: "轮盘",
  palace12: "十二宫",
  palace9: "九宫",
  ring: "环盘",
  palm: "掌诀",
  siwei: "四位",
  hexagram: "卦画",
  pillars: "四柱",
  shield: "盾牌",
  cards: "牌阵",
  dial: "度盘",
  luopan: "罗盘",
  sky: "星空",
  map: "地图",
  timeline: "年表",
  bagua: "八卦",
  list: "通览",
};
