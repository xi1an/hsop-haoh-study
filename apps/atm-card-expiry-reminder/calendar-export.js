import { formatCnDate, parseIsoDate, weekdayName } from "./date-engine.js";

export function formatDateWithWeek(iso) {
  const date = parseIsoDate(iso);
  if (!date) return "-";
  return `${formatCnDate(date)} ${weekdayName(date)}`;
}

export function makeIcsDateTime(iso) {
  return `${iso.replaceAll("-", "")}T090000`;
}

export function escapeIcs(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildCalendarText(record) {
  const title = `吞卡作废提醒 ${record.cardNumber}`;
  const description = [
    `银行卡号：${record.cardNumber}`,
    `吞卡领取日期：${formatDateWithWeek(record.startDate)}`,
    `最后可处理日：${formatDateWithWeek(record.deadline)}`,
    `作废日：${formatDateWithWeek(record.voidDate)}`,
    `规则：超过 ${record.limit} 个${record.unit === "workday" ? "工作日" : "自然日"}，${record.includeStart ? "包含" : "不包含"}起算当天`,
    `节假日数据：${record.sourceSummary || "自然日无需节假日数据"}`,
  ].join("\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ATM Card Expiry Reminder//CN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${record.id}@atm-card-expiry-reminder`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Shanghai:${makeIcsDateTime(record.voidDate)}`,
    `DTEND;TZID=Asia/Shanghai:${record.voidDate.replaceAll("-", "")}T100000`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT0M",
    `DESCRIPTION:${escapeIcs(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

