import { test } from "node:test";
import assert from "node:assert/strict";

import { buildLineChart, buildStepChart } from "./chart.ts";

test("builds a step path scaled to the box", () => {
  const g = buildStepChart([{ id: "input", points: [{ date: "2026-01-11", value: 2 }, { date: "2026-01-01", value: 1 }] }], 100, 50, 0);
  assert.deepEqual(g.paths, [{ id: "input", d: "M0 28.3H100V6.5" }]);
  assert.equal(g.yMax, 2.3);
  assert.equal(g.startDate, "2026-01-01");
  assert.equal(g.endDate, "2026-01-11");
});

test("a single point or empty input never yields NaN", () => {
  const one = buildStepChart([{ id: "x", points: [{ date: "2026-01-01", value: 0 }] }], 100, 50, 0);
  assert.doesNotMatch(one.paths[0].d, /NaN|Infinity/u);
  assert.deepEqual(buildStepChart([], 100, 50).paths, []);
});

test("invalid dates in the series are ignored instead of throwing", () => {
  const g = buildStepChart([{ id: "x", points: [{ date: "2025-13-01", value: 1 }, { date: "2026-01-01", value: 2 }] }], 100, 50, 0);
  assert.equal(g.startDate, "2026-01-01");
  assert.doesNotMatch(g.paths[0].d, /NaN/u);
});

test("buildLineChart spaces points evenly and scales to round ticks", () => {
  const g = buildLineChart([{ id: "a", values: [100, 110, 124] }], 300, 120, { top: 10, right: 10, bottom: 20, left: 30 });
  assert.equal(g.paths[0].d, "M30 100L160 70L290 28");
  assert.deepEqual(g.ticks.map((t) => t.value), [100, 110, 120, 130]);
  assert.deepEqual(g.xs, [30, 160, 290]);
});

test("buildLineChart shares one scale across series and survives edge cases", () => {
  const g = buildLineChart([{ id: "a", values: [90, 100] }, { id: "b", values: [100, 120] }], 300, 120);
  assert.equal(g.paths.length, 2);
  assert.ok(g.ticks[0].value <= 90 && g.ticks.at(-1)!.value >= 120);
  assert.deepEqual(buildLineChart([], 300, 120).paths, []);
  const flat = buildLineChart([{ id: "a", values: [100] }], 300, 120);
  assert.equal(flat.xs.length, 1);
  assert.ok(Number.isFinite(flat.ticks[0].y));
});
