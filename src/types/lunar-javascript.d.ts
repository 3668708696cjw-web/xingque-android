declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    static fromYmdHms(y: number, m: number, d: number, h: number, min: number, s: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getWeek(): number;
    getXingZuo(): string;
    getLunar(): Lunar;
    toYmd(): string;
    subtract(solar: Solar): number;
  }

  export class JieQi {
    getName(): string;
    getSolar(): Solar;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getGanZhi(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getIndex(): number;
    getLiuNian(): LiuNian[];
  }

  export class LiuNian {
    getGanZhi(): string;
    getYear(): number;
    getAge(): number;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getYearXunKong(): string;
    getMonthXunKong(): string;
    getDayXunKong(): string;
    getTimeXunKong(): string;
    getTaiYuan(): string;
    getMingGong(): string;
    getShenGong(): string;
    getYun(gender: number, sect?: number): Yun;
    toString(): string;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toString(): string;
    getEightChar(): EightChar;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearShengXiao(): string;
    getDayShengXiao(): string;
    getTimeZhi(): string;
    getTimeGan(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getXiu(): string;
    getZheng(): string;
    getAnimal(): string;
    getZhiXing(): string;
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getDayPositionXi(): string;
    getDayPositionFu(): string;
    getDayPositionCai(): string;
    getDayPositionYangGui(): string;
    getDayPositionYinGui(): string;
    getDayPositionTai(): string;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getJieQi(): string;
    getJieQiTable(): Record<string, Solar>;
    getPrevJieQi(whole: boolean): JieQi;
    getNextJieQi(whole: boolean): JieQi;
    getPrevJieQiList?(): JieQi[];
  }

  export const SolarUtil: {
    getDaysOfMonth(year: number, month: number): number;
  };
}
