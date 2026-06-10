import {
  calculateExpiry,
  dateStatus,
  formatIsoDate,
  getYear,
  loadHolidayYear,
  parseIsoDate,
  yearsNeededForEstimate,
} from "./date-engine.js";
import { buildCalendarText, formatDateWithWeek } from "./calendar-export.js";
import { HOLIDAY_API, HOLIDAY_APIS, STATE_COUNCIL_2026_SOURCE } from "./holiday-data.js";

const state = {
  unit: "workday",
  includeStart: false,
  holidayYears: {},
  currentResult: null,
  calendarMonth: null,
};

function remoteAtmConfig() {
  return typeof window !== "undefined" && window.HSOP_ATM_CONFIG && typeof window.HSOP_ATM_CONFIG === "object"
    ? window.HSOP_ATM_CONFIG
    : {};
}

const el = {
  form: document.querySelector("#expiryForm"),
  cardNumber: document.querySelector("#cardNumber"),
  startDate: document.querySelector("#startDate"),
  limitDays: document.querySelector("#limitDays"),
  unitButtons: document.querySelectorAll("[data-unit]"),
  includeStartSwitch: document.querySelector("#includeStartSwitch"),
  includeStartCopy: document.querySelector("#includeStartCopy"),
  message: document.querySelector("#message"),
  resultPanel: document.querySelector("#resultPanel"),
  deadlineText: document.querySelector("#deadlineText"),
  voidDateText: document.querySelector("#voidDateText"),
  sourceStatus: document.querySelector("#sourceStatus"),
  sourceDetail: document.querySelector("#sourceDetail"),
  refreshHolidays: document.querySelector("#refreshHolidays"),
  manualRefresh: document.querySelector("#manualRefresh"),
  calendarTitle: document.querySelector("#calendarTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  basisList: document.querySelector("#basisList"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  calendarToday: document.querySelector("#calendarToday"),
  downloadCurrentCalendar: document.querySelector("#downloadCurrentCalendar"),
};

function localTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showMessage(text, type = "info") {
  el.message.textContent = text;
  el.message.className = `message show ${type}`;
}

function hideMessage() {
  el.message.textContent = "";
  el.message.className = "message";
}

function cleanCardNumber(value) {
  return (value || "").replace(/\s+/g, "");
}

function maskCardNumber(value) {
  const clean = cleanCardNumber(value);
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}

function setUnit(unit) {
  state.unit = unit === "natural" ? "natural" : "workday";
  el.unitButtons.forEach((button) => button.classList.toggle("active", button.dataset.unit === state.unit));
}

function setIncludeStart(value) {
  state.includeStart = Boolean(value);
  el.includeStartSwitch.setAttribute("aria-pressed", String(state.includeStart));
  el.includeStartSwitch.querySelector(".switch").classList.toggle("active", state.includeStart);
  el.includeStartCopy.textContent = state.includeStart ? "当天算第 1 天" : "从次日开始";
}

function sourceLabel(loadMode) {
  const labels = {
    network: "联网更新",
    "remote-content": "远程资料包",
    cache: "本地缓存",
    "built-in": "内置兜底",
    missing: "缺少数据",
  };
  return labels[loadMode] || loadMode || "未知";
}

function renderSourceStatus() {
  const years = Object.values(state.holidayYears);
  if (!years.length) {
    el.sourceStatus.textContent = "等待数据";
    el.sourceStatus.className = "status-dot warn";
    el.sourceDetail.textContent = "节假日数据用于判断工作日、节假日和调休上班日。";
    return;
  }

  const hasMissing = years.some((item) => item.missing);
  const hasWarning = years.some((item) => item.warning);
  el.sourceStatus.className = `status-dot ${hasMissing ? "missing" : hasWarning ? "warn" : ""}`.trim();
  el.sourceStatus.textContent = hasMissing ? "缺少年度数据" : hasWarning ? "使用兜底/缓存" : "数据已更新";

  const detail = years
    .map((item) => {
      const fetched = item.fetchedAt ? `，更新时间 ${new Date(item.fetchedAt).toLocaleString("zh-CN", { hour12: false })}` : "";
      const warning = item.warning ? `，联网提示：${item.warning}` : "";
      return `${item.year}：${sourceLabel(item.loadMode)}，来源 ${item.source}${fetched}${warning}`;
    })
    .join("；");

  const apiLinks = HOLIDAY_APIS.map((api) => `<a href="${api.url}" target="_blank" rel="noreferrer">${api.name}</a>`).join("、");
  el.sourceDetail.innerHTML = `${detail}。<br />第三方接口：${apiLinks}；2026 兜底对照：<a href="${STATE_COUNCIL_2026_SOURCE.url}" target="_blank" rel="noreferrer">国务院通知</a>。`;
}

async function loadHolidaysForCurrentInput(force = false) {
  const years = yearsNeededForEstimate(el.startDate.value, el.limitDays.value, state.unit);
  if (!years.length) return [];

  const loaded = [];
  for (const year of years) {
    const remoteYear = remoteAtmConfig().holidayYears?.[year];
    const data = !force && remoteYear
      ? { ...remoteYear, loadMode: "remote-content" }
      : await loadHolidayYear(year, { force });
    state.holidayYears[year] = data;
    loaded.push(data);
  }
  renderSourceStatus();
  return loaded;
}

async function calculateCurrent(forceRefresh = false) {
  const cardNumber = cleanCardNumber(el.cardNumber.value);
  if (!cardNumber) throw new Error("请输入银行卡号");
  if (!/^\d{12,30}$/.test(cardNumber)) throw new Error("银行卡号请填写 12-30 位数字");

  if (state.unit === "workday") {
    await loadHolidaysForCurrentInput(forceRefresh);
  } else {
    await loadHolidaysForCurrentInput(false);
  }

  const result = calculateExpiry(
    {
      startDate: el.startDate.value,
      limit: Number(el.limitDays.value),
      unit: state.unit,
      includeStart: state.includeStart,
    },
    state.holidayYears
  );

  const finalYears = yearsNeededForEstimate(result.startDate, result.limit + 10, state.unit);
  const missingYear = finalYears.find((year) => !state.holidayYears[year] && state.unit === "workday");
  if (missingYear) {
    state.holidayYears[missingYear] = await loadHolidayYear(missingYear, { force: forceRefresh });
  }

  return {
    ...result,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    cardNumber,
    cardNumberMasked: maskCardNumber(cardNumber),
    createdAt: new Date().toISOString(),
    sourceSummary: Object.values(state.holidayYears)
      .map((item) => `${item.year}:${sourceLabel(item.loadMode)}:${item.source}`)
      .join("; "),
  };
}

function renderResult(result) {
  state.currentResult = result;
  el.resultPanel.classList.add("show");
  el.deadlineText.textContent = formatDateWithWeek(result.deadline);
  el.voidDateText.textContent = formatDateWithWeek(result.voidDate);
  state.calendarMonth = result.deadline.slice(0, 7);
  renderCalendar();
  renderBasis(result);
}

function renderBasis(result) {
  const lines = [];
  const unitText = result.unit === "workday" ? "工作日" : "自然日";
  lines.push(`起算：${formatDateWithWeek(result.startDate)}，${result.includeStart ? "包含当天" : "不包含当天，从次日开始"}。`);
  lines.push(`期限：超过 ${result.limit} 个${unitText}；最后可处理日为 ${formatDateWithWeek(result.deadline)}，作废日为 ${formatDateWithWeek(result.voidDate)}。`);
  result.skipped.slice(0, 6).forEach((item) => lines.push(`${formatDateWithWeek(item.iso)}：${item.reason}。`));
  if (result.skipped.length > 6) lines.push(`还有 ${result.skipped.length - 6} 天因周末或节假日未计入。`);
  lines.push(`第 ${result.counted.length} 个计入日：${formatDateWithWeek(result.deadline)}。`);
  el.basisList.innerHTML = lines.map((line) => `<li>${line}</li>`).join("");
}

function calendarCellClass(iso, result) {
  if (!result) return "";
  if (iso === result.voidDate) return "void";
  if (iso === result.deadline) return "deadline";
  if (result.counted.some((item) => item.iso === iso)) return "counted";
  const skipped = result.skipped.find((item) => item.iso === iso);
  if (skipped) return skipped.type;
  const date = parseIsoDate(iso);
  if (!date) return "";
  const status = dateStatus(date, state.holidayYears);
  return status.type === "workday" ? "" : status.type;
}

function calendarMark(iso, result) {
  if (!result) return "";
  if (iso === result.voidDate) return "作废";
  if (iso === result.deadline) return "截止";
  const counted = result.counted.find((item) => item.iso === iso);
  if (counted) return `第${counted.sequence}天`;
  const skipped = result.skipped.find((item) => item.iso === iso);
  if (skipped?.type === "holiday") return "休";
  if (skipped?.type === "weekend") return "周末";
  if (skipped?.type === "makeup") return "调休";
  const date = parseIsoDate(iso);
  if (!date) return "";
  const status = dateStatus(date, state.holidayYears);
  if (status.type === "holiday") return "休";
  if (status.type === "weekend") return "周末";
  if (status.type === "makeup") return "调休";
  return "";
}

function renderCalendar() {
  const month = state.calendarMonth || localTodayIso().slice(0, 7);
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = first.getUTCDay();
  const prevMonthDays = new Date(Date.UTC(year, monthNumber - 1, 0)).getUTCDate();

  el.calendarTitle.textContent = `${year}年${monthNumber}月`;
  const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"].map((item) => `<div class="weekday">${item}</div>`);
  const totalCells = 42;
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstWeekday + 1;
    const date = new Date(Date.UTC(year, monthNumber - 1, dayOffset));
    const iso = formatIsoDate(date);
    const isOutside = date.getUTCMonth() !== monthNumber - 1;
    const displayDay = isOutside && dayOffset < 1 ? prevMonthDays + dayOffset : date.getUTCDate();
    const cls = calendarCellClass(iso, state.currentResult);
    const mark = calendarMark(iso, state.currentResult);
    return `<div class="day-cell ${isOutside ? "outside" : ""} ${cls}"><span class="day-number">${displayDay}</span><span class="day-mark">${mark}</span></div>`;
  });
  el.calendarGrid.innerHTML = [...weekdayLabels, ...cells].join("");
}

function shiftCalendarMonth(delta) {
  const month = state.calendarMonth || localTodayIso().slice(0, 7);
  const [year, monthNumber] = month.split("-").map(Number);
  const next = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  state.calendarMonth = formatIsoDate(next).slice(0, 7);
  renderCalendar();
}

function downloadCalendar(record) {
  const ics = buildCalendarText(record);

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `吞卡作废提醒-${record.voidDate}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function downloadCurrentCalendar() {
  if (!state.currentResult) {
    showMessage("请先计算日期", "error");
    return;
  }
  downloadCalendar(state.currentResult);
}

async function handleSubmit(event) {
  event.preventDefault();
  hideMessage();
  try {
    const result = await calculateCurrent(false);
    renderResult(result);
    el.cardNumber.value = "";
    showMessage("已计算，本页面不会保存银行卡号或历史记录。", "info");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function refreshAndRecalculate() {
  hideMessage();
  try {
    await loadHolidaysForCurrentInput(true);
    const record = await calculateCurrent(false);
    renderResult(record);
    showMessage("节假日数据已刷新，并重新计算当前表单。", "info");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function bindEvents() {
  el.unitButtons.forEach((button) => button.addEventListener("click", () => setUnit(button.dataset.unit)));
  el.includeStartSwitch.addEventListener("click", () => setIncludeStart(!state.includeStart));
  el.form.addEventListener("submit", handleSubmit);
  el.refreshHolidays.addEventListener("click", refreshAndRecalculate);
  el.manualRefresh.addEventListener("click", refreshAndRecalculate);
  el.downloadCurrentCalendar.addEventListener("click", downloadCurrentCalendar);
  el.prevMonth.addEventListener("click", () => shiftCalendarMonth(-1));
  el.nextMonth.addEventListener("click", () => shiftCalendarMonth(1));
  el.calendarToday.addEventListener("click", () => {
    state.calendarMonth = state.currentResult?.deadline.slice(0, 7) || localTodayIso().slice(0, 7);
    renderCalendar();
  });
  window.addEventListener("atm-remote-content-updated", () => {
    showMessage("远程资料已更新，下一次计算会使用最新资料。", "success");
    const config = remoteAtmConfig();
    if (!state.currentResult && config.defaultLimit) {
      el.limitDays.value = String(config.defaultLimit);
    }
    if (!state.currentResult && config.defaultUnit) {
      setUnit(config.defaultUnit);
    }
    if (!state.currentResult && typeof config.includeStart === "boolean") {
      setIncludeStart(config.includeStart);
    }
  });
}

function seedDefaults() {
  const config = remoteAtmConfig();
  el.startDate.value = localTodayIso();
  el.limitDays.value = String(config.defaultLimit || el.limitDays.value || 10);
  setUnit(config.defaultUnit || "workday");
  setIncludeStart(Boolean(config.includeStart));
  state.calendarMonth = localTodayIso().slice(0, 7);
}

async function init() {
  seedDefaults();
  bindEvents();
  renderCalendar();
  renderSourceStatus();
  try {
    await loadHolidaysForCurrentInput(false);
  } catch {
    renderSourceStatus();
  }
}

init();
