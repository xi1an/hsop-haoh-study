import {
  calculateExpiry,
  dateStatus,
  formatIsoDate,
  getYear,
  loadHolidayYear,
  parseIsoDate,
  recordState,
  yearsNeededForEstimate,
} from "./date-engine.js";
import { buildCalendarText, formatDateWithWeek } from "./calendar-export.js";
import { HOLIDAY_API, HOLIDAY_APIS, STATE_COUNCIL_2026_SOURCE } from "./holiday-data.js";

const RECORD_KEY = "atm-card-expiry:records";

const state = {
  unit: "workday",
  includeStart: false,
  records: [],
  holidayYears: {},
  currentResult: null,
  calendarMonth: null,
  filter: "all",
};

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
  tabs: document.querySelectorAll("[data-filter]"),
  recordsList: document.querySelector("#recordsList"),
  clearDone: document.querySelector("#clearDone"),
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

function readRecords() {
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    state.records = raw ? JSON.parse(raw) : [];
  } catch {
    state.records = [];
  }
}

function saveRecords() {
  localStorage.setItem(RECORD_KEY, JSON.stringify(state.records));
}

function formatShortDate(iso) {
  const date = parseIsoDate(iso);
  if (!date) return "-";
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

function cleanCardNumber(value) {
  return (value || "").replace(/\s+/g, "");
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
    const data = await loadHolidayYear(year, { force });
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

function statusCopy(status) {
  return {
    soon: "临期",
    today: "今日作废",
    expired: "已作废",
    active: "未到期",
  }[status] || "未到期";
}

function filteredRecords() {
  const today = localTodayIso();
  return state.records.filter((record) => {
    const status = recordState(record, today);
    if (state.filter === "all") return true;
    if (state.filter === "soon") return status === "soon";
    return status === state.filter;
  });
}

function renderRecords() {
  const records = filteredRecords().sort((a, b) => a.voidDate.localeCompare(b.voidDate));
  if (!records.length) {
    el.recordsList.innerHTML = `<div class="empty-state">还没有符合当前筛选的记录。</div>`;
    return;
  }

  const today = localTodayIso();
  el.recordsList.innerHTML = records
    .map((record) => {
      const status = recordState(record, today);
      return `
        <article class="record-card">
          <div class="record-head">
            <div class="record-title">
              <div class="record-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"></path>
                  <path d="M4 10h16"></path>
                </svg>
              </div>
              <div>
                <strong>${record.cardNumber}</strong>
                <span>${record.limit} 个${record.unit === "workday" ? "工作日" : "自然日"}，${record.includeStart ? "含当天" : "不含当天"}</span>
              </div>
            </div>
            <span class="tag ${status}">${statusCopy(status)}</span>
          </div>
          <div class="record-meta">领取：${formatShortDate(record.startDate)}　截止：${formatShortDate(record.deadline)}　作废：${formatShortDate(record.voidDate)}</div>
          <div class="record-actions">
            <button class="secondary-button" type="button" data-action="calendar" data-id="${record.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><path d="M5 4h14a2 2 0 0 1 2 2v15H3V6a2 2 0 0 1 2-2Z"></path>
              </svg>
              加入日历
            </button>
            <button class="secondary-button" type="button" data-action="view" data-id="${record.id}">查看依据</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function downloadCalendar(record) {
  const ics = buildCalendarText(record);

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `吞卡作废提醒-${record.cardNumber}-${record.voidDate}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

async function handleSubmit(event) {
  event.preventDefault();
  hideMessage();
  try {
    const record = await calculateCurrent(false);
    const existingIndex = state.records.findIndex((item) => item.cardNumber === record.cardNumber && item.startDate === record.startDate);
    if (existingIndex >= 0) state.records[existingIndex] = record;
    else state.records.unshift(record);
    saveRecords();
    renderResult(record);
    renderRecords();
    showMessage("已计算并保存，可在记录里添加到手机日历。", "info");
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
  el.prevMonth.addEventListener("click", () => shiftCalendarMonth(-1));
  el.nextMonth.addEventListener("click", () => shiftCalendarMonth(1));
  el.calendarToday.addEventListener("click", () => {
    state.calendarMonth = state.currentResult?.deadline.slice(0, 7) || localTodayIso().slice(0, 7);
    renderCalendar();
  });
  el.tabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      el.tabs.forEach((tab) => tab.classList.toggle("active", tab === button));
      renderRecords();
    });
  });
  el.recordsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const record = state.records.find((item) => item.id === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === "calendar") downloadCalendar(record);
    if (button.dataset.action === "view") {
      renderResult(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  el.clearDone.addEventListener("click", () => {
    const today = localTodayIso();
    state.records = state.records.filter((record) => recordState(record, today) !== "expired");
    saveRecords();
    renderRecords();
  });
}

function seedDefaults() {
  el.startDate.value = localTodayIso();
  setUnit("workday");
  setIncludeStart(false);
  state.calendarMonth = localTodayIso().slice(0, 7);
}

async function init() {
  seedDefaults();
  readRecords();
  bindEvents();
  renderRecords();
  renderCalendar();
  renderSourceStatus();
  try {
    await loadHolidaysForCurrentInput(false);
  } catch {
    renderSourceStatus();
  }
}

init();
