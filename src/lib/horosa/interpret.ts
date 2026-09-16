/** Local, deterministic chart readings. No network, no model. */

const SIGNS: Record<string, { el: string; mode: string; note: string }> = {
  白羊: { el: "火", mode: "本位", note: "起势、直给、先动手" },
  金牛: { el: "土", mode: "固定", note: "占有、感官、慢慢长" },
  双子: { el: "风", mode: "变动", note: "分流、话术、两边跑" },
  巨蟹: { el: "水", mode: "本位", note: "护窝、记仇也记恩" },
  狮子: { el: "火", mode: "固定", note: "舞台、体面、要被看见" },
  处女: { el: "土", mode: "变动", note: "拆解、修正、怕脏乱" },
  天秤: { el: "风", mode: "本位", note: "对位、审美、议和" },
  天蝎: { el: "水", mode: "固定", note: "深潜、把柄、不轻放" },
  射手: { el: "火", mode: "变动", note: "远方、信念、留退路" },
  摩羯: { el: "土", mode: "本位", note: "台阶、名分、扛责任" },
  水瓶: { el: "风", mode: "固定", note: "旁观、实验、不入圈" },
  双鱼: { el: "水", mode: "变动", note: "渗透、梦、边界薄" },
};

const HOUSE: Record<string, string> = {
  "1": "身体与开端",
  "2": "财物与价值",
  "3": "近处、文书、口舌",
  "4": "家、根、田宅",
  "5": "子女、恋爱、创作",
  "6": "日常、疾、役",
  "7": "配偶、对手、契约",
  "8": "共享、债、转化",
  "9": "远行、法、学",
  "10": "官禄、名声、事业",
  "11": "朋友、愿景、团体",
  "12": "隐、损耗、潜意识",
};

const SHISHEN: Record<string, string> = {
  比肩: "同行、自立、分财也分压",
  劫财: "争、抢节奏、钱来得快也走得快",
  食神: "吐出来、手艺、偏福",
  伤官: "顶嘴、才情、不服管",
  偏财: "横财、社交场、流动的利",
  正财: "工资、妻财、可记账的收获",
  七杀: "压力、权威、逼你成形",
  正官: "名分、规矩、考核",
  偏印: "偏门学问、孤独的庇护",
  正印: "母亲、文凭、被托住",
  日主: "自身",
};

const WX_NOTE: Record<string, string> = {
  木: "生发、肝胆、条达则顺",
  火: "礼、心神、过旺易躁",
  土: "信、脾胃、厚则能载",
  金: "义、肺、太刚易折",
  水: "智、肾、多则泛",
};

const ZIWEI: Record<string, string> = {
  紫微: "尊、中宫、要被拥戴",
  天机: "机变、谋、坐不住",
  太阳: "贵、公开、照人也耗己",
  武曲: "财、刚、决策干脆",
  天同: "福、懒、要被善待",
  廉贞: "桃花、是非、二次权威",
  天府: "库、稳、能守",
  太阴: "内财、夜性、细",
  贪狼: "欲、社交、门路多",
  巨门: "口舌、暗、要把话说透",
  天相: "印、辅助、形象管理",
  天梁: "荫、长辈、清高",
  七杀: "将星、孤克、能开疆",
  破军: "耗、改革、先破后立",
};

const GUA: Record<string, string> = {
  乾为天: "健行。问事宜进取，忌空转。",
  坤为地: "厚载。宜守成、承载，忌硬顶。",
  水雷屯: "始难。事情在发芽，强求易折。",
  山水蒙: "未明。先求教，再动手。",
  水天需: "等待。时机未到，备粮即可。",
  天水讼: "争。能和解则和解，硬讼两伤。",
  地水师: "众。要名分、纪律，忌私兵。",
  水地比: "亲附。找对主，勿滥交。",
  风天小畜: "小停。密云不雨，宜蓄不宜发。",
  天泽履: "践履。走在虎尾上，礼数要够。",
  地天泰: "通。上下交，可成事。",
  天地否: "塞。不交往、不勉强合作。",
  天火同人: "聚同道。门要开，私心要少。",
  火天大有: "丰。持盈，忌炫耀。",
  地山谦: "退一步。名利让出一点反而成。",
  雷地豫: "乐。可行动，忌荒。",
  泽雷随: "从。跟人走对时辰。",
  山风蛊: "蛊坏。该修的旧摊子，现在修。",
  地泽临: "临下。亲近、巡视，勿远控。",
  风地观: "观察。先看风气，再开口。",
  火雷噬嗑: "合。梗要咬断，法制可用。",
  山火贲: "饰。表面功夫有用，但别只有表面。",
  山地剥: "剥。能止则止，勿再耗底。",
  地雷复: "复。一阳来，宜回头。",
  天雷无妄: "无妄。正则吉，意外之财别碰。",
  山天大畜: "大蓄。停一停，养实力。",
  山雷颐: "养。慎言语、节饮食。",
  泽风大过: "过。栋桡，非常手段才过得去。",
  坎为水: "险。有实才过，无实则陷。",
  离为火: "明。依附正位，文明可成。",
  泽山咸: "感。先感应，再承诺。",
  雷风恒: "久。可长期，忌朝令夕改。",
  天山遁: "退。小人长，君子退。",
  雷天大壮: "壮。用礼，不用蛮。",
  火地晋: "进。白天之路，宜见公卿。",
  地火明夷: "明伤。韬晦，别在暗处硬刚。",
  风火家人: "家。内严外宽。",
  火泽睽: "睽。小事吉，大事各走各的。",
  水山蹇: "蹇。见险而止，求西南。",
  雷水解: "解。赦过、散结。",
  山泽损: "损下益上。有孚，可减。",
  风雷益: "益。可兴作，利有攸往。",
  泽天夬: "决。扬于王庭，勿存私。",
  天风姤: "遇。阴始生，慎交接。",
  泽地萃: "聚。有庙、有主才聚得住。",
  地风升: "升。积小成高。",
  泽水困: "困。口说无用，修德待时。",
  水风井: "井。改邑不改井，养人的结构别拆。",
  泽火革: "革。己日乃孚，改要改在信上。",
  火风鼎: "鼎。新命，正位凝命。",
  震为雷: "动。恐以致福，勿失节奏。",
  艮为山: "止。时止则止。",
  风山渐: "渐。女归吉，一步一阶。",
  雷泽归妹: "归妹。征凶，名分不正则勿往。",
  雷火丰: "丰。宜日中，过午则昃。",
  火山旅: "旅。琐琐则凶，持礼。",
  巽为风: "入。申命，反复叮咛。",
  兑为泽: "说。和兑吉，来兑凶。",
  风水涣: "散。王假有庙，散私以聚公。",
  水泽节: "节。苦节不可，中节可。",
  风泽中孚: "信。豚鱼吉，诚信及于微。",
  雷山小过: "小过。可小事，不可大事。",
  水火既济: "已成。初吉终乱，要收尾。",
  火水未济: "未成。犹可渡，辨位。",
};

const TAROT: Record<string, [string, string]> = {
  愚者: ["跃入未知，别带旧行李。", "鲁莽或卡住，先看脚下。"],
  魔术师: ["手里有资源，现在动手。", "分散、把戏，别信漂亮话。"],
  女祭司: ["不说的那一层才是答案。", "秘密在耗你，该揭一层。"],
  女皇: ["养、长、给身体时间。", "溺爱或停滞，该断奶。"],
  皇帝: ["立规矩、画边界。", "僵、控，权威在反噬。"],
  教皇: ["走传承、找老师。", "教条或假权威。"],
  恋人: ["选择要对齐价值。", "错配、诱惑。"],
  战车: ["意志推过去。", "两股力在对拉。"],
  力量: ["柔才能驯。", "蛮力或自我怀疑。"],
  隐者: ["独处、求一盏灯。", "孤立，拒绝被指。"],
  命运之轮: ["周期在转，顺势。", "抗拒变化。"],
  正义: ["称一称，别偏。", "否认责任。"],
  倒吊人: ["暂停，换角度看。", "无谓牺牲。"],
  死神: ["结束是必经。", "死撑旧壳。"],
  节制: ["调配，走中道。", "过犹不及。"],
  恶魔: ["看清契约再谈解脱。", "束缚松了，别立刻再签。"],
  塔: ["假结构要塌。", "延宕只会塌得更狠。"],
  星星: ["远处有光，慢慢走。", "信心不足。"],
  月亮: ["梦、雾、未明。", "恐惧在显形。"],
  太阳: ["明朗，可以见人。", "短暂的热。"],
  审判: ["该起来了。", "还在自我审判。"],
  世界: ["这一圈合上。", "还差一环。"],
};

const DOOR: Record<string, string> = {
  开门: "官贵、出路，可公开推进",
  休门: "休养、求医、求财偏稳",
  生门: "兴作、求田、求活路",
  伤门: "口舌、外科、出行有磕",
  杜门: "隐藏、研究、不宜张扬",
  景门: "文书、考试、体面事",
  死门: "旧事、丧吊、宜止",
  惊门: "惊扰、口舌、诉讼气",
};

const LIU_JIANG: Record<string, string> = {
  贵人: "贵、文书、贵引",
  腾蛇: "虚惊、缠、反复",
  朱雀: "口舌、文书是非",
  六合: "和、媒、私下成",
  勾陈: "田土、纠缠、官非黏",
  青龙: "喜、财、谋望",
  天空: "空、不实、僧道",
  白虎: "血光、道路、硬冲突",
  太常: "衣食、酒食、常道",
  玄武: "盗、暧昧、暗耗",
  太阴: "私、女人、隐蔽之利",
  天后: "恩、母、庇",
};

const FIRDARIA: Record<string, string> = {
  太阳: "显现、名、父性议题被照出来",
  月亮: "情绪潮、家、身体节律",
  水星: "学习、合同、两边跑的资讯",
  金星: "关系、审美、钱的舒服程度",
  火星: "点火、冲突、手术或竞争",
  木星: "扩张、贵人、学历信仰",
  土星: "收束、考核、骨与牙",
};

function pickSign(text: string): string | null {
  for (const s of Object.keys(SIGNS)) if (text.includes(s)) return s;
  return null;
}

function planetChunk(summary: string, name: string): string {
  const parts = summary.split(/[；;]/);
  return parts.find((p) => p.includes(name)) ?? "";
}

function houseOf(chunk: string): string | null {
  const m = chunk.match(/(\d+)\s*宫/) || chunk.match(/第(\d+)室/) || chunk.match(/(\d+)$/);
  return m ? m[1] : null;
}

function natal(summary: string): string[] {
  const sun = planetChunk(summary, "太阳");
  const moon = planetChunk(summary, "月亮");
  const sunSign = pickSign(sun);
  const moonSign = pickSign(moon);
  const sunH = houseOf(sun);
  const moonH = houseOf(moon);
  const asc = pickSign(planetChunk(summary, "ASC") || summary);
  const retro = /水星.*R|水星 R|水星R/.test(summary) ? "水星" : /金星.*R/.test(summary) ? "金星" : /火星.*R/.test(summary) ? "火星" : null;
  const out: string[] = [];
  if (sunSign) {
    const s = SIGNS[sunSign];
    out.push(
      `日在${sunSign}（${s.el}·${s.mode}）${sunH ? `落${sunH}宫（${HOUSE[sunH]}）` : ""}。生命力往「${s.note}」走，一年内可观察的是：你把精力投在哪里，哪里就显形。`,
    );
  }
  if (moonSign) {
    const s = SIGNS[moonSign];
    out.push(
      `月在${moonSign}${moonH ? `、${moonH}宫` : ""}。情绪底色是${s.note}。家里、夜里、身体的潮汐比你口头的计划更准。`,
    );
  }
  if (asc && SIGNS[asc] && asc !== sunSign) {
    out.push(`上升${asc}：别人先看见的是${SIGNS[asc].note}。开场、第一印象、身体姿态，都从这里起。`);
  }
  const fire = (summary.match(/白羊|狮子|射手/g) || []).length;
  const earth = (summary.match(/金牛|处女|摩羯/g) || []).length;
  const air = (summary.match(/双子|天秤|水瓶/g) || []).length;
  const water = (summary.match(/巨蟹|天蝎|双鱼/g) || []).length;
  const ranked = [
    ["火", fire],
    ["土", earth],
    ["风", air],
    ["水", water],
  ].sort((a, b) => Number(b[1]) - Number(a[1]));
  out.push(
    `四正元素里，${ranked[0][0]}最重、${ranked[ranked.length - 1][0]}最轻。过重的要节制，过轻的要补：不是性格标签，是你这盘能量的进出方向。`,
  );
  if (retro) out.push(`${retro}逆行：相关议题要返工，合同、零件、旧人，宜复核不宜新铺摊子。`);
  if (/刑|冲/.test(summary)) out.push("盘里有刑冲：压力是成形的工具，不是惩罚。把冲突落成时间表，比解释性格有用。");
  out.push("以上由本机规则根据日月宫位与元素统计写成，不作命运承诺。");
  return out;
}

function bazi(summary: string): string[] {
  const day = summary.match(/日([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
  const month = summary.match(/月([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])\s*(\S+)/);
  const year = summary.match(/年([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
  const out: string[] = [];
  if (day) {
    const gan = day[1];
    const zhi = day[2];
    out.push(
      `日主${gan}${zhi}。日干${gan}属${stemWx(gan)}，${WX_NOTE[stemWx(gan)]}。日支${zhi}是你坐的地。看事先看日主能不能从月令里借到气。`,
    );
  }
  if (month) {
    const god = month[3] && SHISHEN[month[3]] ? month[3] : "";
    out.push(
      `月令${month[1]}${month[2]}${god ? `，透出${god}` : ""}。${god && SHISHEN[god] ? SHISHEN[god] + "。" : ""}月令是气候：它决定这盘喜什么、怕什么，比年柱的「属相故事」要紧。`,
    );
  }
  if (year) out.push(`年柱${year[1]}${year[2]}管早年、祖上、对外的第一层壳。`);
  const gods = Object.keys(SHISHEN).filter((g) => g !== "日主" && summary.includes(g));
  if (gods.length) {
    out.push(`盘面多见 ${gods.slice(0, 4).join("、")}。${gods.map((g) => SHISHEN[g]).slice(0, 2).join("；")}。用神是否得令，要比「缺水缺火」的口头禅具体。`);
  }
  out.push("大运是气候的搬家。运干与日主的生克，比流年故事先看一步。");
  out.push("八字解盘在本机完成，规则取月令、十神、日主，不上传四柱。");
  return out;
}

function stemWx(g: string): string {
  if ("甲乙".includes(g)) return "木";
  if ("丙丁".includes(g)) return "火";
  if ("戊己".includes(g)) return "土";
  if ("庚辛".includes(g)) return "金";
  return "水";
}

function ziwei(summary: string): string[] {
  const five = summary.match(/(水二|木三|金四|土五|火六)局/);
  const soul = summary.match(/命([紫微天机太阳武曲天同廉贞天府太阴贪狼巨门天相天梁七杀破军]{2})/);
  const stars = Object.keys(ZIWEI).filter((s) => summary.includes(s));
  const mingStars = (() => {
    const m = summary.match(/命宫:(\S*)/);
    return m ? m[1] : stars.slice(0, 3).join("");
  })();
  const out: string[] = [];
  if (five) out.push(`${five[1]}局：五行局管大限的步长与气数，不是性格标签。`);
  if (soul) out.push(`命主${soul[1]}：${ZIWEI[soul[1]] ?? "看宫干与亮度。"}`);
  const named = stars.slice(0, 4);
  if (named.length) {
    out.push(
      `命盘主星见 ${named.join("、")}。` +
        named.map((s) => `${s}：${ZIWEI[s]}`).join("。") +
        "。先读命宫，再读官禄、财帛、夫妻，三方四正比单星故事完整。",
    );
  }
  if (mingStars) out.push(`命宫星曜「${mingStars}」是这盘的提纲。亮度、四化会改语气：化禄喜、化权决、化科名、化忌卡。`);
  out.push("紫微在本机用 iztro 起盘，解盘只读宫干与主星，不送出命造。");
  return out;
}

function qimen(summary: string): string[] {
  const ju = summary.match(/(阳|阴)\s*(\d+)\s*局/);
  const fu = summary.match(/值符(\S+)/);
  const shi = summary.match(/值使(\S+)/);
  const out: string[] = [];
  if (ju) out.push(`${ju[1]}遁${ju[2]}局。${ju[1] === "阳" ? "阳遁宜进取、公开。" : "阴遁宜收藏、暗成。"}局数是入门钥匙，不是吉凶本身。`);
  if (fu) out.push(`值符${fu[1]}：用事的「谁在主持」。符落宫看贵人方向。`);
  if (shi) {
    const d = Object.keys(DOOR).find((x) => shi[1].includes(x));
    out.push(`值使${shi[1]}${d ? `（${DOOR[d]}）` : ""}。使门是行动的门：吉门可动，凶门改时或改方向。`);
  }
  const doors = Object.keys(DOOR).filter((d) => summary.includes(d));
  if (doors.length) out.push(`盘面出现 ${doors.join("、")}。开门、休门、生门为三吉；伤杜景死惊要看是否有奇仪来救。`);
  out.push("时家飞盘，本机排局。用时、用方，比用故事准确。");
  return out;
}

function liuren(summary: string): string[] {
  const method = summary.match(/(\S+课)/);
  const san = summary.match(/三传(\S{1,6})/);
  const yj = summary.match(/月将(\S)/);
  const out: string[] = [];
  if (method) out.push(`发用取${method[1]}。课体先定格局：贼克、比用、涉害、遥克，名字就是在说「谁先动手」。`);
  if (san) out.push(`三传 ${san[1].split("").join(" → ")}。初传是起，中传是过程，末传是收。末传比初传更接近结果。`);
  if (yj) out.push(`月将${yj[1]}：月将是太阳所躔，天盘由此翻起。`);
  const gods = Object.keys(LIU_JIANG).filter((g) => summary.includes(g));
  if (gods.length) out.push(`贵神见 ${gods.join("、")}。${gods.slice(0, 2).map((g) => LIU_JIANG[g]).join("；")}。`);
  out.push("六壬以四课三传为骨，本机起课，不外传。");
  return out;
}

function liuyao(summary: string): string[] {
  const name = Object.keys(GUA).find((g) => summary.includes(g));
  const change = summary.match(/之\s*(\S+)/);
  const dong = summary.match(/(\d)爻动/g) || [];
  const out: string[] = [];
  if (name) out.push(`本卦${name}。${GUA[name]}`);
  else out.push(`本卦「${summary.split(" ")[0] ?? "—"}」。看世爻坐的六亲，比看卦名故事更贴题。`);
  if (change) {
    const cn = Object.keys(GUA).find((g) => change[1].includes(g));
    out.push(`之卦${change[1]}。${cn ? GUA[cn] : "变卦是事情走完以后的屋子。"}动爻是过程，世应是问事的座位。`);
  }
  if (dong.length) out.push(`动爻：${dong.join("、")}。一爻动看单爻，多爻动看卦变，世爻静而应爻动，多是对方先动。`);
  out.push("纳甲六爻在本机摇卦或按时间起卦，断语只作提纲。");
  return out;
}

function tarot(summary: string): string[] {
  const bits = summary.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const b of bits) {
    const m = b.match(/([^:：]+?)[:：]([^\s]+?)(正|逆)?$/);
    const raw = m ? m[2] : b;
    const name = Object.keys(TAROT).find((n) => raw.includes(n));
    const pos = m ? m[1] : "";
    const rev = /逆/.test(b);
    if (name) {
      const pair = TAROT[name];
      out.push(`${pos ? pos + " · " : ""}${name}${rev ? "（逆）" : ""}：${rev ? pair[1] : pair[0]}`);
    }
  }
  if (!out.length) out.push("先看牌名与正逆。大阿卡纳是主题，小牌是场景。");
  out.push("牌阵在本机洗切，没有牌面离开这台设备。");
  return out;
}

function transits(summary: string): string[] {
  const age = summary.match(/年龄(\d+)/);
  const fir = summary.match(/法达(\S+)/);
  const out: string[] = [];
  if (age) out.push(`今年 ${age[1]} 岁。岁数本身不决定事，只决定法达与返照叠在哪一层。`);
  if (fir && FIRDARIA[fir[1]]) out.push(`法达主星${fir[1]}：${FIRDARIA[fir[1]]}。这一段的主题会重复出现，换景不换题。`);
  if (/合/.test(summary)) out.push("流年有合：议题被点亮，容易见面、签约、发病——同一根弦。");
  if (/冲|刑/.test(summary)) out.push("流年有冲刑：旧结构在受力。宜修缮、切割、完成，不宜同时铺三条新线。");
  out.push("过运只取外行星紧相位与法达，本机计算。");
  return out;
}

function vedic(summary: string): string[] {
  const sun = pickSign(planetChunk(summary, "太阳") || summary);
  const moon = pickSign(planetChunk(summary, "月亮") || summary);
  const out: string[] = [];
  out.push("北印习惯看月亮与上升室，恒星黄道（Lahiri）已在本机减去岁差。");
  if (moon) out.push(`月在${moon}：心智与日常节律。室位比星座故事更接近「这件事落在生活的哪一格」。`);
  if (sun) out.push(`日在${sun}：灵魂的方向、父亲与权威。`);
  out.push("整宫制：行星落入哪一室就读哪一室，不切宫。");
  return out;
}

function generic(kind: string, summary: string): string[] {
  const s = summary.replace(/\s+/g, " ").trim();
  return [
    `${kind}盘面：${s.slice(0, 80)}${s.length > 80 ? "…" : ""}。`,
    "结构已经在上面的盘里。解盘只是把宫、星、门、爻的关系说成人话，不增加新的判断材料。",
    "全部在本机完成。",
  ];
}

export function interpretLocal(kind: string, summary: string): string[] {
  switch (kind) {
    case "西洋本命":
      return natal(summary);
    case "八字":
      return bazi(summary);
    case "紫微斗数":
      return ziwei(summary);
    case "奇门遁甲":
      return qimen(summary);
    case "大六壬":
      return liuren(summary);
    case "六爻":
      return liuyao(summary);
    case "塔罗":
      return tarot(summary);
    case "推运":
      return transits(summary);
    case "吠陀占星":
      return vedic(summary);
    default:
      return generic(kind, summary);
  }
}
