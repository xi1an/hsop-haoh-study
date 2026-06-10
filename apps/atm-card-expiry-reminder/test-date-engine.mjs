import assert from "node:assert/strict";
import { calculateExpiry, dateStatus, normalizeHolidayPayload, parseIsoDate } from "./date-engine.js";
import { BUILT_IN_HOLIDAY_YEARS } from "./holiday-data.js";
import { buildCalendarText } from "./calendar-export.js";

const years = BUILT_IN_HOLIDAY_YEARS;

const apisboPayload = {
  code: 0,
  msg: "success",
  data: [
    { date: "2026-01-01", name: "元旦", type: "holiday" },
    { date: "2026-01-04", name: "元旦调休", type: "workday" },
  ],
};
const normalizedApisbo = normalizeHolidayPayload(2026, apisboPayload, "APISBO", "https://apisbo.com/");
assert.equal(normalizedApisbo.days["2026-01-01"].isOffDay, true);
assert.equal(normalizedApisbo.days["2026-01-04"].isOffDay, false);

function calc(input) {
  return calculateExpiry(input, years);
}

const naturalExclude = calc({ startDate: "2026-06-01", limit: 1, unit: "natural", includeStart: false });
assert.equal(naturalExclude.deadline, "2026-06-02");
assert.equal(naturalExclude.voidDate, "2026-06-03");

const naturalInclude = calc({ startDate: "2026-06-01", limit: 1, unit: "natural", includeStart: true });
assert.equal(naturalInclude.deadline, "2026-06-01");
assert.equal(naturalInclude.voidDate, "2026-06-02");

const springFestival = calc({ startDate: "2026-02-13", limit: 6, unit: "workday", includeStart: false });
assert.equal(springFestival.deadline, "2026-02-28");
assert.equal(springFestival.voidDate, "2026-03-01");
assert.ok(springFestival.counted.some((item) => item.iso === "2026-02-14" && item.type === "makeup"));
assert.ok(springFestival.counted.some((item) => item.iso === "2026-02-28" && item.type === "makeup"));

const laborDay = calc({ startDate: "2026-04-30", limit: 2, unit: "workday", includeStart: false });
assert.equal(laborDay.deadline, "2026-05-07");
assert.equal(laborDay.voidDate, "2026-05-08");
assert.ok(laborDay.skipped.some((item) => item.iso === "2026-05-01"));

const nationalDay = calc({ startDate: "2026-09-19", limit: 2, unit: "workday", includeStart: false });
assert.equal(nationalDay.deadline, "2026-09-21");
assert.equal(nationalDay.counted.some((item) => item.iso === "2026-09-20" && item.type === "makeup"), true);

const status = dateStatus(parseIsoDate("2026-10-10"), years);
assert.equal(status.isWorkday, true);
assert.equal(status.type, "makeup");

assert.throws(
  () => calculateExpiry({ startDate: "2027-01-01", limit: 1, unit: "workday", includeStart: true }, years),
  /缺少 2027 年/
);

const ics = buildCalendarText({
  id: "test-record",
  cardNumber: "6222000000001234567",
  cardNumberMasked: "6222 **** **** 4567",
  startDate: "2026-02-13",
  deadline: "2026-02-28",
  voidDate: "2026-03-01",
  limit: 6,
  unit: "workday",
  includeStart: false,
  sourceSummary: "2026:built-in:内置 2026 兜底数据",
});
assert.match(ics, /BEGIN:VCALENDAR/);
assert.match(ics, /DTSTART;TZID=Asia\/Shanghai:20260301T090000/);
assert.match(ics, /SUMMARY:吞卡作废提醒 6222 \*\*\*\* \*\*\*\* 4567/);
assert.doesNotMatch(ics, /6222000000001234567/);
assert.match(ics, /TRIGGER:-PT0M/);

console.log("date-engine tests passed");
