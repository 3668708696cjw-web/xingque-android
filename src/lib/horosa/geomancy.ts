export type GeoFig = { name: string; bits: number; planet: string; house: string };

const FIGS: GeoFig[] = [
  { name: "路 Via", bits: 0b1111, planet: "月", house: "旅行、路径" },
  { name: "众 Populus", bits: 0b0000, planet: "月", house: "群众、停滞" },
  { name: "合 Conjunctio", bits: 0b0110, planet: "水", house: "会合、文书" },
  { name: "得 Acquisitio", bits: 0b1010, planet: "木", house: "获得、财" },
  { name: "失 Amissio", bits: 0b0101, planet: "金", house: "损失、让出" },
  { name: "喜 Laetitia", bits: 0b1000, planet: "木", house: "喜悦、上升" },
  { name: "忧 Tristitia", bits: 0b0001, planet: "土", house: "忧思、沉降" },
  { name: "大吉 Fortuna Major", bits: 0b1100, planet: "日", house: "内在好运" },
  { name: "小吉 Fortuna Minor", bits: 0b0011, planet: "日", house: "外在好运" },
  { name: "大吉 Puella", bits: 0b1011, planet: "金", house: "少女、和谐" },
  { name: "武士 Puer", bits: 0b1101, planet: "火", house: "冲动、争" },
  { name: "龙尾 Cauda", bits: 0b0111, planet: "南交", house: "结束、离开" },
  { name: "龙头 Caput", bits: 0b1110, planet: "北交", house: "开始、进入" },
  { name: "牢 Carcer", bits: 0b1001, planet: "土", house: "束缚、成" },
  { name: "变 Albus", bits: 0b0100, planet: "水", house: "智慧、白" },
  { name: "赤 Rubeus", bits: 0b0010, planet: "火", house: "激情、险" },
];

function fig(bits: number) {
  return FIGS.find((f) => f.bits === (bits & 15)) ?? FIGS[0];
}

export type GeomancyResult = {
  mothers: GeoFig[];
  daughters: GeoFig[];
  nieces: GeoFig[];
  witnesses: GeoFig[];
  judge: GeoFig;
  recon: GeoFig;
};

function mix(a: number, b: number) {
  return a ^ b;
}

export function computeGeomancy(seed?: number): GeomancyResult {
  let s = (seed ?? Date.now()) >>> 0;
  const rnd = () => {
    s = Math.imul(s ^ (s >>> 15), 0x45d9f3b);
    return s >>> 0;
  };
  const mothers = [0, 1, 2, 3].map(() => fig(rnd() & 15));
  const daughters = [0, 1, 2, 3].map((row) => {
    let bits = 0;
    mothers.forEach((m, i) => {
      if ((m.bits >> row) & 1) bits |= 1 << i;
    });
    return fig(bits);
  });
  const nieces = [
    fig(mix(mothers[0].bits, mothers[1].bits)),
    fig(mix(mothers[2].bits, mothers[3].bits)),
    fig(mix(daughters[0].bits, daughters[1].bits)),
    fig(mix(daughters[2].bits, daughters[3].bits)),
  ];
  const witnesses = [fig(mix(nieces[0].bits, nieces[1].bits)), fig(mix(nieces[2].bits, nieces[3].bits))];
  const judge = fig(mix(witnesses[0].bits, witnesses[1].bits));
  const recon = fig(mix(judge.bits, mothers[0].bits));
  return { mothers, daughters, nieces, witnesses, judge, recon };
}
