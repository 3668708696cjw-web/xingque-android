import { lunarOf } from "./calendar";
import { computeLiuyaoTime } from "./liuyao";
import { GAN, ZHI, type BirthInput } from "./types";

const ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const GAN_HE = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
const ZHI_HE = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
const PALM = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export type ShuShuResult = {
  huangji: { yuan: string; hui: string; yun: string; shi: string; gua: string };
  meihua: { name: string; changeName: string; method: string };
  yanqin: { year: string; month: string; day: string; hour: string; note: string };
  tieban: { no: number; note: string; ci: string };
  heluo: { xiantian: number; houtian: number; note: string; he: string };
  yizhang: { palm: string; note: string };
  shenyi: { number: number; gua: string; note: string };
};

export function computeShushu(b: BirthInput): ShuShuResult {
  const y = b.year;
  const from = y + 2697;
  const yuan = Math.floor(from / 129600) + 1;
  const rem = from % 129600;
  const hui = Math.floor(rem / 10800) + 1;
  const rem2 = rem % 10800;
  const yun = Math.floor(rem2 / 360) + 1;
  const shi = (rem2 % 360) + 1;
  const guaNames = ["复", "颐", "既济", "家人", "益", "屯", "颐", "随"];
  const huangji = {
    yuan: `第${yuan}元`,
    hui: `第${hui}会`,
    yun: `第${yun}运`,
    shi: `第${shi}世`,
    gua: guaNames[(yun - 1) % guaNames.length],
  };
  const meihua = computeLiuyaoTime(b);
  const lunar = lunarOf(b);
  const yz = lunar.getYearInGanZhi();
  const gz = yz[0];
  const zz = yz[1];
  const yanqin = {
    year: ANIMALS[ZHI.indexOf(zz as (typeof ZHI)[number])] ?? "",
    month: ANIMALS[(b.month + 1) % 12],
    day: ANIMALS[(b.day + 1) % 12],
    hour: ANIMALS[ZHI.indexOf(lunar.getTimeZhi() as (typeof ZHI)[number])] ?? "",
    note: "年禽为主，日禽为用，时禽为变。",
  };
  const n = (b.year * 12 + b.month + b.day + b.hour) % 120;
  const gi = Math.max(0, GAN.indexOf(gz as (typeof GAN)[number]));
  const zi = Math.max(0, ZHI.indexOf(zz as (typeof ZHI)[number]));
  const xiantian = GAN_HE[gi] + ZHI_HE[zi];
  const houtian = ((xiantian + b.hour) % 10) + 1;
  return {
    huangji,
    meihua: { name: meihua.name, changeName: meihua.changeName, method: meihua.method },
    yanqin,
    tieban: {
      no: n + 1,
      note: `铁板定数第 ${n + 1}。一百二十数，托名邵雍，是皇极的民间简化。`,
      ci: TIEBAN[n],
    },
    heluo: {
      xiantian,
      houtian,
      note: "河洛以先天数为体、后天数为用，和子平共用四柱。",
      he: HELUO_HE[xiantian % HELUO_HE.length],
    },
    yizhang: {
      palm: PALM[zi % 8],
      note: `年支落${PALM[zi % 8]}宫。一掌经是把干支收到手上的口诀。`,
    },
    shenyi: {
      number: (b.year + b.month + b.day + b.hour) % 64 || 64,
      gua: GUA64[(b.year + b.month + b.day + b.hour) % 64],
      note: "神易数以年月日时积数入卦，看体用与动爻。",
    },
  };
}

const HELUO_HE = ["一六共宗", "二七同道", "三八为朋", "四九为友", "五十居中"];

const GUA64 = [
  "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履", "泰", "否",
  "同人", "大有", "谦", "豫", "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复",
  "无妄", "大畜", "颐", "大过", "坎", "离", "咸", "恒", "遁", "大壮", "晋", "明夷",
  "家人", "睽", "蹇", "解", "损", "益", "夬", "姤", "萃", "升", "困", "井",
  "革", "鼎", "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节",
  "中孚", "小过", "既济", "未济",
];

const TIEBAN = [
  "一数开基，名成于早，防满招损。", "二数并立，合作可成，忌争先。", "三数生发，文才外露，口舌难免。",
  "四数守成，田产可置，进退宜缓。", "五数居中，贵人暗助，勿投机。", "六数合局，婚姻家庭为用。",
  "七数肃杀，决断有功，防过刚。", "八数伏藏，晚成之象，宜积学。", "九数盛大，名利并至，戒骄。",
  "十数圆满，功成身退则吉。", "十一，孤单求名，远行有益。", "十二，阴私暗昧，防小人。",
  "十三，才气过人，官非需避。", "十四，破中有成，先难后易。", "十五，半月之光，名动一方。",
  "十六，禄马交驰，出行获利。", "十七，刚金得令，武职宜之。", "十八，树大招风，收敛锋芒。",
  "十九，残阳未尽，晚景可期。", "二十，重门深锁，机密莫泄。", "廿一，文昌入命，试场有名。",
  "廿二，桃花暗动，情感反复。", "廿三，刀兵之象，防血光。", "廿四，田园丰足，安土重迁。",
  "廿五，核心在握，权柄自来。", "廿六，合中带克，合伙宜慎。", "廿七，金火交战，变动频繁。",
  "廿八，土金相生，实业可立。", "廿九，水势汪洋，智慧有余。", "三十，月满则亏，见好就收。",
  "卅一，独立门户，早年分家。", "卅二，并肩同行，得友力。", "卅三，重重生发，子女缘深。",
  "卅四，房舍更替，迁居有利。", "卅五，中正得位，人望自高。", "卅六，坤道成器，内助得力。",
  "卅七，肃杀再逢，手术口舌。", "卅八，山高水深，隐逸可成。", "卅九，盛极将转，谨慎投资。",
  "四十，大数已过半，守成为上。", "四一，再起炉灶，中年发迹。", "四二，双星并照，名利各半。",
  "四三，口才为用，演说教学。", "四四，重重关隘，事倍功半。", "四五，中心再得，贵人重叠。",
  "四六，合局再成，婚姻二次。", "四七，金气肃清，法律军警。", "四八，伏而再起，晚年产业。",
  "四九，极数将尽，变化在即。", "五十，半百知命，收心养性。", "五一，晚学有成，著书立说。",
  "五二，伴侣相随，不可独断。", "五三，余火未熄，情绪宜平。", "五四，土厚载物，慈善积德。",
  "五五，两五相重，中而不倚。", "五六，水火既济，调和为贵。", "五七，金水相生，技艺传家。",
  "五八，山泽通气，风水宜修。", "五九，水天一色，远行得志。", "六十，甲子重周，再起一运。",
  "六一，循环再生，旧业可复。", "六二，比和再来，结社有功。", "六三，木数重逢，文教事业。",
  "六四，关隘再设，证件手续。", "六五，中心偏移，防信任危机。", "六六，大合之数，团体领袖。",
  "六七，金气过重，决断伤人。", "六八，隐中有财，不动声色。", "六九，水火未济，再等时机。",
  "七十，古稀之象，颐养天年。", "七一，余勇可贾，小试锋芒。", "七二，地天泰至，家和事兴。",
  "七三，雷水解事，讼则终凶。", "七四，山地剥落，产业须保。", "七五，五数三重，权责过重。",
  "七六，兑金再合，口舌成名。", "七七，重金肃杀，手术兵戈。", "七八，艮土止之，知止不殆。",
  "七九，离火光大，名誉广播。", "八十，土数成器，墓库收藏。", "八一，万数之始，重新布局。",
  "八二，坤德再载，地产房屋。", "八三，风雷益动，投资可试。", "八四，泽水困守，耐心等待。",
  "八五，火地晋升，名位渐进。", "八六，水泽节制，量入为出。", "八七，泽火革故，改行有利。",
  "八八，重山叠障，静中求进。", "八九，火风鼎新，技艺成名。", "九十，老阳之数，功成身退。",
  "九一，阳极生阴，让贤为吉。", "九二，地天再泰，家庭和睦。", "九三，乾金再健，体格宜养。",
  "九四，风地观望，不宜冒进。", "九五，飞龙在天，权位高峰。", "九六，亢龙有悔，急流勇退。",
  "九七，金火炼宝，晚成大器。", "九八，山水蒙昧，拜师求学。", "九九，重阳纯刚，防过满。",
  "一百，圆满之数，功德可计。", "百一，余绪未尽，传业后人。", "百二，并立收官，合作收场。",
  "百三，生发收束，文章传世。", "百四，守成收局，田产遗荫。", "百五，中正收功，清名可留。",
  "百六，六合收缘，亲眷团圆。", "百七，肃清收杀，旧怨宜解。", "百八，伏藏收山，归隐得安。",
  "百九，盛大收光，盛名之下。", "百十，十全十美，不可再贪。", "百十一，孤单收局，一脉单传。",
  "百十二，暗昧收场，是非宜了。", "百十三，才尽收笔，著作等身。", "百十四，破而后立，遗嘱产业。",
  "百十五，月盈则食，知足常乐。", "百十六，禄尽马停，安车代步。", "百十七，金气收兵，刀枪入库。",
  "百十八，风止树静，不必再争。", "百十九，残阳收照，晚霞满天。", "百二十，数尽复始，一岁一枯荣。",
];
