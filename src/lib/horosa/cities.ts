export type City = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  tz: number;
};

export const CITIES: City[] = [
  { id: "taipei", name: "台北", region: "台湾", lat: 25.033, lon: 121.565, tz: 8 },
  { id: "kaohsiung", name: "高雄", region: "台湾", lat: 22.627, lon: 120.301, tz: 8 },
  { id: "taichung", name: "台中", region: "台湾", lat: 24.148, lon: 120.674, tz: 8 },
  { id: "tainan", name: "台南", region: "台湾", lat: 22.999, lon: 120.227, tz: 8 },
  { id: "hk", name: "香港", region: "港澳", lat: 22.319, lon: 114.169, tz: 8 },
  { id: "macau", name: "澳门", region: "港澳", lat: 22.198, lon: 113.544, tz: 8 },
  { id: "beijing", name: "北京", region: "华北", lat: 39.904, lon: 116.407, tz: 8 },
  { id: "tianjin", name: "天津", region: "华北", lat: 39.343, lon: 117.362, tz: 8 },
  { id: "shijiazhuang", name: "石家庄", region: "华北", lat: 38.042, lon: 114.515, tz: 8 },
  { id: "taiyuan", name: "太原", region: "华北", lat: 37.87, lon: 112.549, tz: 8 },
  { id: "hohhot", name: "呼和浩特", region: "华北", lat: 40.842, lon: 111.749, tz: 8 },
  { id: "shanghai", name: "上海", region: "华东", lat: 31.23, lon: 121.474, tz: 8 },
  { id: "nanjing", name: "南京", region: "华东", lat: 32.061, lon: 118.798, tz: 8 },
  { id: "hangzhou", name: "杭州", region: "华东", lat: 30.274, lon: 120.155, tz: 8 },
  { id: "suzhou", name: "苏州", region: "华东", lat: 31.299, lon: 120.585, tz: 8 },
  { id: "hefei", name: "合肥", region: "华东", lat: 31.821, lon: 117.227, tz: 8 },
  { id: "jinan", name: "济南", region: "华东", lat: 36.651, lon: 117.12, tz: 8 },
  { id: "qingdao", name: "青岛", region: "华东", lat: 36.067, lon: 120.383, tz: 8 },
  { id: "fuzhou", name: "福州", region: "华东", lat: 26.074, lon: 119.296, tz: 8 },
  { id: "xiamen", name: "厦门", region: "华东", lat: 24.48, lon: 118.089, tz: 8 },
  { id: "nanchang", name: "南昌", region: "华东", lat: 28.683, lon: 115.858, tz: 8 },
  { id: "guangzhou", name: "广州", region: "华南", lat: 23.129, lon: 113.264, tz: 8 },
  { id: "shenzhen", name: "深圳", region: "华南", lat: 22.543, lon: 114.058, tz: 8 },
  { id: "nanning", name: "南宁", region: "华南", lat: 22.817, lon: 108.366, tz: 8 },
  { id: "haikou", name: "海口", region: "华南", lat: 20.044, lon: 110.199, tz: 8 },
  { id: "wuhan", name: "武汉", region: "华中", lat: 30.593, lon: 114.305, tz: 8 },
  { id: "changsha", name: "长沙", region: "华中", lat: 28.228, lon: 112.939, tz: 8 },
  { id: "zhengzhou", name: "郑州", region: "华中", lat: 34.747, lon: 113.625, tz: 8 },
  { id: "chengdu", name: "成都", region: "西南", lat: 30.572, lon: 104.066, tz: 8 },
  { id: "chongqing", name: "重庆", region: "西南", lat: 29.563, lon: 106.552, tz: 8 },
  { id: "kunming", name: "昆明", region: "西南", lat: 25.038, lon: 102.718, tz: 8 },
  { id: "guiyang", name: "贵阳", region: "西南", lat: 26.647, lon: 106.63, tz: 8 },
  { id: "lhasa", name: "拉萨", region: "西南", lat: 29.65, lon: 91.117, tz: 8 },
  { id: "xian", name: "西安", region: "西北", lat: 34.341, lon: 108.94, tz: 8 },
  { id: "lanzhou", name: "兰州", region: "西北", lat: 36.061, lon: 103.834, tz: 8 },
  { id: "xining", name: "西宁", region: "西北", lat: 36.617, lon: 101.778, tz: 8 },
  { id: "yinchuan", name: "银川", region: "西北", lat: 38.487, lon: 106.231, tz: 8 },
  { id: "urumqi", name: "乌鲁木齐", region: "西北", lat: 43.825, lon: 87.617, tz: 8 },
  { id: "shenyang", name: "沈阳", region: "东北", lat: 41.805, lon: 123.431, tz: 8 },
  { id: "dalian", name: "大连", region: "东北", lat: 38.914, lon: 121.615, tz: 8 },
  { id: "changchun", name: "长春", region: "东北", lat: 43.817, lon: 125.324, tz: 8 },
  { id: "harbin", name: "哈尔滨", region: "东北", lat: 45.803, lon: 126.535, tz: 8 },
  { id: "singapore", name: "新加坡", region: "海外", lat: 1.352, lon: 103.82, tz: 8 },
  { id: "tokyo", name: "东京", region: "海外", lat: 35.676, lon: 139.65, tz: 9 },
  { id: "seoul", name: "首尔", region: "海外", lat: 37.567, lon: 126.978, tz: 9 },
  { id: "bangkok", name: "曼谷", region: "海外", lat: 13.756, lon: 100.502, tz: 7 },
  { id: "kuala", name: "吉隆坡", region: "海外", lat: 3.139, lon: 101.687, tz: 8 },
  { id: "sydney", name: "悉尼", region: "海外", lat: 33.869, lon: 151.209, tz: 10 },
  { id: "london", name: "伦敦", region: "海外", lat: 51.507, lon: -0.128, tz: 0 },
  { id: "paris", name: "巴黎", region: "海外", lat: 48.857, lon: 2.352, tz: 1 },
  { id: "nyc", name: "纽约", region: "海外", lat: 40.713, lon: -74.006, tz: -5 },
  { id: "la", name: "洛杉矶", region: "海外", lat: 34.052, lon: -118.244, tz: -8 },
  { id: "sf", name: "旧金山", region: "海外", lat: 37.775, lon: -122.419, tz: -8 },
  { id: "vancouver", name: "温哥华", region: "海外", lat: 49.282, lon: -123.121, tz: -8 },
  { id: "toronto", name: "多伦多", region: "海外", lat: 43.653, lon: -79.383, tz: -5 },
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

export function getCity(id: string): City {
  return CITY_BY_ID[id] ?? CITY_BY_ID.taipei;
}

export function cityOf(b: {
  cityId: string;
  lat?: number;
  lon?: number;
  tz?: number;
  place?: string;
}): City {
  if (b.lat != null && b.lon != null && Number.isFinite(b.lat) && Number.isFinite(b.lon)) {
    return {
      id: b.cityId || "custom",
      name: b.place || "自定义",
      region: "",
      lat: b.lat,
      lon: b.lon,
      tz: b.tz ?? Math.round(b.lon / 15),
    };
  }
  return getCity(b.cityId);
}

export function localToUtc(year: number, month: number, day: number, hour: number, minute: number, tz: number) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - tz * 3600000);
}

export function nowAsBirth(cityId = "taipei") {
  const city = getCity(cityId);
  const now = new Date();
  return {
    name: "此刻",
    gender: "male" as const,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    cityId: city.id,
  };
}

export function wallClock(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
