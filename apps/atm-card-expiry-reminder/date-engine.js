import { BUILT_IN_HOLIDAY_YEARS, HOLIDAY_API, HOLIDAY_APIS } from "./holiday-data.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "atm-card-expiry:holiday:";

function safeStorage(storage) {
  if (storage) return storage;
  return typeof window !== "undefined" ? window.localStorage : null;
}

export function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

export function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function getYear(date) {
  return date.getUTCFullYear();
}

export function formatCnDate(value) {
  const date = typeof value === "string" ? parseIsoDate(value) : value;
  if (!date) return "";
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

export function weekdayName(date) {
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getUTCDay()];
}

export function normalizeHolidayPayload(year, payload, sourceName = HOLIDAY_API.name, sourceUrl = HOLIDAY_API.url) {
  if (!payload || typeof payload !== "object") return null;
  const sourceDays = payload.holiday && typeof payload.holiday === "object" ? payload.holiday : payload.data || payload;
  const days = {};

  Object.entries(sourceDays).forEach(([key, item]) => {
    if (!item || typeof item !== "object") return;
    const date = item.date || (/^\d{4}-\d{2}-\d{2}$/.test(key) ? key : `${year}-${key}`);
    if (!parseIsoDate(date)) return;
    let isOffDay = typeof item.isOffDay === "boolean" ? item.isOffDay : item.holiday;
    if (typeof item.type === "string") {
      if (item.type === "holiday") isOffDay = true;
      if (item.type === "workday") isOffDay = false;
    }
    if (typeof isOffDay !== "boolean") return;
    days[date] = {
      name: item.name || item.extra_info || (isOffDay ? "节假日" : "调休上班"),
      isOffDay,
    };
  });

  if (!Object.keys(days).length) return null;

  return {
    year,
    source: sourceName,
    sourceUrl,
    fetchedAt: new Date().toISOString(),
    days,
  };
}

export async function fetchHolidayYear(year) {
  const errors = [];
  for (const api of HOLIDAY_APIS) {
    try {
      const response = await fetch(api.yearUrl(year), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`${api.name} 返回 ${response.status}`);
      }
      const payload = await response.json();
      const normalized = normalizeHolidayPayload(year, payload, api.name, api.url);
      if (!normalized) {
        throw new Error(`${api.name} 数据格式无法识别`);
      }
      saveHolidayCache(normalized);
      return { ...normalized, loadMode: "network" };
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error(errors.join("；") || "节假日接口不可用");
}

export function readHolidayCache(year, storage) {
  const targetStorage = safeStorage(storage);
  if (!targetStorage) return null;
  try {
    const raw = targetStorage.getItem(`${CACHE_PREFIX}${year}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || Number(cached.year) !== Number(year) || !cached.days) return null;
    return { ...cached, loadMode: "cache" };
  } catch {
    return null;
  }
}

export function saveHolidayCache(yearData, storage) {
  const targetStorage = safeStorage(storage);
  if (!targetStorage) return;
  try {
    targetStorage.setItem(`${CACHE_PREFIX}${yearData.year}`, JSON.stringify(yearData));
  } catch {
    // 本地缓存失败不应影响当前计算。
  }
}

export async function loadHolidayYear(year, options = {}) {
  const { force = false, storage } = options;

  try {
    const yearData = await fetchHolidayYear(year);
    return yearData;
  } catch (error) {
    const cached = readHolidayCache(year, storage);
    if (cached) return { ...cached, warning: error.message };
    const builtIn = BUILT_IN_HOLIDAY_YEARS[year];
    if (builtIn) return { ...builtIn, loadMode: "built-in", warning: error.message };
    return {
      year,
      source: "缺少数据",
      sourceUrl: "",
      fetchedAt: "",
      days: {},
      loadMode: "missing",
      warning: error.message,
      missing: true,
    };
  }
}

export function dateStatus(date, holidayYears) {
  const iso = formatIsoDate(date);
  const yearData = holidayYears[getYear(date)];
  const override = yearData?.days?.[iso];
  const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;

  if (override?.isOffDay === true) {
    return {
      iso,
      isWorkday: false,
      type: "holiday",
      label: override.name || "法定节假日",
      reason: `${override.name || "节假日"}，不计入工作日`,
    };
  }

  if (override?.isOffDay === false) {
    return {
      iso,
      isWorkday: true,
      type: isWeekend ? "makeup" : "workday",
      label: isWeekend ? "调休上班" : "工作日",
      reason: isWeekend ? `${override.name || "调休上班"}，计入工作日` : "普通工作日，计入工作日",
    };
  }

  if (isWeekend) {
    return {
      iso,
      isWorkday: false,
      type: "weekend",
      label: "周末",
      reason: `${weekdayName(date)}，不计入工作日`,
    };
  }

  return {
    iso,
    isWorkday: true,
    type: "workday",
    label: "工作日",
    reason: "普通工作日，计入工作日",
  };
}

export function calculateExpiry(input, holidayYears = {}) {
  const startDate = parseIsoDate(input.startDate);
  const limit = Number(input.limit);
  const unit = input.unit === "natural" ? "natural" : "workday";
  const includeStart = Boolean(input.includeStart);

  if (!startDate) throw new Error("请输入有效的吞卡领取日期");
  if (!Number.isInteger(limit) || limit < 1 || limit > 999) throw new Error("期限请输入 1-999 之间的整数");

  const counted = [];
  const skipped = [];
  let cursor = includeStart ? startDate : addDays(startDate, 1);
  let count = 0;

  if (unit === "natural") {
    while (count < limit) {
      counted.push({
        iso: formatIsoDate(cursor),
        sequence: count + 1,
        type: "natural",
        reason: "自然日计入",
      });
      count += 1;
      if (count === limit) break;
      cursor = addDays(cursor, 1);
    }
  } else {
    while (count < limit) {
      const year = getYear(cursor);
      if (!holidayYears[year] || holidayYears[year].missing) {
        throw new Error(`缺少 ${year} 年节假日/调休数据，无法准确计算工作日`);
      }

      const status = dateStatus(cursor, holidayYears);
      if (status.isWorkday) {
        counted.push({
          iso: status.iso,
          sequence: count + 1,
          type: status.type,
          reason: status.reason,
        });
        count += 1;
      } else {
        skipped.push({
          iso: status.iso,
          type: status.type,
          reason: status.reason,
        });
      }

      if (count === limit) break;
      cursor = addDays(cursor, 1);
    }
  }

  const deadline = cursor;
  const voidDate = addDays(deadline, 1);

  return {
    startDate: formatIsoDate(startDate),
    limit,
    unit,
    includeStart,
    deadline: formatIsoDate(deadline),
    voidDate: formatIsoDate(voidDate),
    counted,
    skipped,
  };
}

export function yearsNeededForEstimate(startDateValue, limit, unit) {
  const start = parseIsoDate(startDateValue);
  if (!start) return [];
  const numericLimit = Math.max(1, Number(limit) || 1);
  const estimateDays = unit === "natural" ? numericLimit + 3 : numericLimit * 2 + 90;
  const end = addDays(start, estimateDays);
  const years = [];
  for (let year = getYear(start); year <= getYear(end); year += 1) years.push(year);
  return years;
}

export function buildDateRange(startIso, endIso) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const dates = [];
  if (!start || !end) return dates;
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    dates.push(formatIsoDate(cursor));
  }
  return dates;
}

export function recordState(record, todayIso = formatIsoDate(new Date())) {
  const today = parseIsoDate(todayIso);
  const voidDate = parseIsoDate(record.voidDate);
  if (!today || !voidDate) return "active";
  if (record.voidDate === todayIso) return "today";
  if (voidDate < today) return "expired";
  const diff = Math.round((voidDate.getTime() - today.getTime()) / MS_PER_DAY);
  return diff <= 3 ? "soon" : "active";
}
