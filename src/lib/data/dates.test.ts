import { test } from "node:test";
import assert from "node:assert/strict";

import { addDays, daysBetween, isoWeek, lastWeekRange, toIsoDay } from "./dates.ts";

test("normalizes partial release dates", () => {
  assert.equal(toIsoDay("2026-10-07"), "2026-10-07");
  assert.equal(toIsoDay("2026-09"), "2026-09-01");
  assert.equal(toIsoDay("2025"), "2025-01-01");
  assert.equal(toIsoDay(""), null);
  assert.equal(toIsoDay(undefined), null);
  assert.equal(toIsoDay("soon"), null);
});

test("day arithmetic is UTC-stable", () => {
  assert.equal(daysBetween("2026-10-01", "2026-10-11"), 10);
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("isoWeek follows ISO-8601", () => {
  assert.equal(isoWeek("2026-10-11"), "2026-W41"); // Sunday
  assert.equal(isoWeek("2026-10-12"), "2026-W42"); // Monday
  assert.equal(isoWeek("2026-01-01"), "2026-W01");
  assert.equal(isoWeek("2026-12-31"), "2026-W53");
});

test("lastWeekRange returns the previous Monday-Sunday", () => {
  assert.deepEqual(lastWeekRange("2026-10-12"), { start: "2026-10-05", end: "2026-10-11", weekId: "2026-W41" });
  assert.deepEqual(lastWeekRange("2026-10-14"), { start: "2026-10-05", end: "2026-10-11", weekId: "2026-W41" });
});
