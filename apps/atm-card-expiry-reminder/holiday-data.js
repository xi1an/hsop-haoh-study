export const STATE_COUNCIL_2026_SOURCE = {
  name: "国务院办公厅关于2026年部分节假日安排的通知",
  url: "https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm?sourcefrom=aladdin",
};

export const HOLIDAY_APIS = [
  {
    name: "APISBO 节假日 API",
    url: "https://apisbo.com/",
    yearUrl(year) {
      return `https://api.apisbo.com/holidays/year/${year}`;
    },
  },
  {
    name: "JiejiariAPI",
    url: "https://www.jiejiariapi.com/",
    yearUrl(year) {
      return `https://api.jiejiariapi.com/v1/holidays/${year}`;
    },
  },
];

export const HOLIDAY_API = HOLIDAY_APIS[0];

export const BUILT_IN_HOLIDAY_YEARS = {
  2026: {
    year: 2026,
    source: "内置 2026 兜底数据",
    sourceUrl: STATE_COUNCIL_2026_SOURCE.url,
    fetchedAt: "2026-06-07T00:00:00+08:00",
    days: {
      "2026-01-01": { name: "元旦", isOffDay: true },
      "2026-01-02": { name: "元旦", isOffDay: true },
      "2026-01-03": { name: "元旦", isOffDay: true },
      "2026-01-04": { name: "元旦调休上班", isOffDay: false },
      "2026-02-14": { name: "春节调休上班", isOffDay: false },
      "2026-02-15": { name: "春节", isOffDay: true },
      "2026-02-16": { name: "除夕", isOffDay: true },
      "2026-02-17": { name: "春节", isOffDay: true },
      "2026-02-18": { name: "春节", isOffDay: true },
      "2026-02-19": { name: "春节", isOffDay: true },
      "2026-02-20": { name: "春节", isOffDay: true },
      "2026-02-21": { name: "春节", isOffDay: true },
      "2026-02-22": { name: "春节", isOffDay: true },
      "2026-02-23": { name: "春节", isOffDay: true },
      "2026-02-28": { name: "春节调休上班", isOffDay: false },
      "2026-04-04": { name: "清明节", isOffDay: true },
      "2026-04-05": { name: "清明节", isOffDay: true },
      "2026-04-06": { name: "清明节", isOffDay: true },
      "2026-05-01": { name: "劳动节", isOffDay: true },
      "2026-05-02": { name: "劳动节", isOffDay: true },
      "2026-05-03": { name: "劳动节", isOffDay: true },
      "2026-05-04": { name: "劳动节", isOffDay: true },
      "2026-05-05": { name: "劳动节", isOffDay: true },
      "2026-05-09": { name: "劳动节调休上班", isOffDay: false },
      "2026-06-19": { name: "端午节", isOffDay: true },
      "2026-06-20": { name: "端午节", isOffDay: true },
      "2026-06-21": { name: "端午节", isOffDay: true },
      "2026-09-20": { name: "国庆节调休上班", isOffDay: false },
      "2026-09-25": { name: "中秋节", isOffDay: true },
      "2026-09-26": { name: "中秋节", isOffDay: true },
      "2026-09-27": { name: "中秋节", isOffDay: true },
      "2026-10-01": { name: "国庆节", isOffDay: true },
      "2026-10-02": { name: "国庆节", isOffDay: true },
      "2026-10-03": { name: "国庆节", isOffDay: true },
      "2026-10-04": { name: "国庆节", isOffDay: true },
      "2026-10-05": { name: "国庆节", isOffDay: true },
      "2026-10-06": { name: "国庆节", isOffDay: true },
      "2026-10-07": { name: "国庆节", isOffDay: true },
      "2026-10-10": { name: "国庆节调休上班", isOffDay: false },
    },
  },
};
