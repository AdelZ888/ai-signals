import { test } from "node:test";
import assert from "node:assert/strict";

import { buildStepChart } from "./chart.ts";

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
