import { Solar } from "lunar-javascript";

export type AlmanacDay = {
  ymd: string;
  week: string;
  lunar: string;
  ganzhi: string;
  animal: string;
  yi: string[];
  ji: string[];
  pengzu: string;
  chong: string;
  sha: string;
  xiu: string;
  zhixing: string;
  tianshen: string;
  dao: string;
  xi: string;
  fu: string;
  cai: string;
  tai: string;
  jieqi: string;
  nextJie: string;
  festivals: string[];
  xingzuo: string;
};

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

export function almanacOf(y: number, m: number, d: number, h = 12, min = 0): AlmanacDay {
  const solar = Solar.fromYmdHms(y, m, d, h, min, 0);
  const lunar = solar.getLunar();
  const jie = lunar.getJieQi();
  const next = lunar.getNextJieQi(true);
  return {
    ymd: solar.toYmd(),
    week: WEEK[solar.getWeek()],
    lunar: lunar.toString(),
    ganzhi: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}时`,
    animal: lunar.getYearShengXiao(),
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    pengzu: `${lunar.getPengZuGan()}；${lunar.getPengZuZhi()}`,
    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    xiu: `${lunar.getXiu()}（${lunar.getZheng()}宿·${lunar.getAnimal()}）`,
    zhixing: lunar.getZhiXing(),
    tianshen: `${lunar.getDayTianShen()} · ${lunar.getDayTianShenType()}`,
    dao: lunar.getDayTianShenType(),
    xi: lunar.getDayPositionXi(),
    fu: lunar.getDayPositionFu(),
    cai: lunar.getDayPositionCai(),
    tai: lunar.getDayPositionTai(),
    jieqi: jie || lunar.getPrevJieQi(true).getName(),
    nextJie: `${next.getName()} ${next.getSolar().toYmd()}`,
    festivals: [...lunar.getFestivals(), ...lunar.getOtherFestivals()],
    xingzuo: solar.getXingZuo(),
  };
}

export function monthGrid(y: number, m: number) {
  const first = Solar.fromYmd(y, m, 1);
  const startWeek = first.getWeek();
  const count = new Date(y, m, 0).getDate();
  const cells: ({ day: number; lunarDay: string; yi0: string } | null)[] = [];
  for (let i = 0; i < startWeek; i++) cells.push(null);
  for (let d = 1; d <= count; d++) {
    const s = Solar.fromYmd(y, m, d);
    const l = s.getLunar();
    const jie = l.getJieQi();
    cells.push({
      day: d,
      lunarDay: jie || String(l.toString()).replace(/^.*月/, ""),
      yi0: l.getDayYi()[0] ?? "",
    });
  }
  return cells;
}
