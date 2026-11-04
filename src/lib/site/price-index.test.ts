import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import {
  buildSeries, closingDate, compareSnapshots, floorsOf, indexRows, labChanges, launchCohorts, leaveOneLabOut,
  monthLabel, monthToClose, monthsAround, percentile, previousMonth, publishedOn, trendWord, verdict, type IndexRow, type IndexSnapshot,
} from "./price-index.ts";

function row(id: string, blended: number, extra: Partial<IndexRow> = {}): IndexRow {
  const [lab, slug] = id.split("/");
  return {
    id, lab, slug, name: slug, input: blended, output: blended, blended, releaseDate: null, context: 200_000,
    status: "active", tools: true, reasoning: false, vision: false, ...extra,
  };
}

const snap = (month: string, rows: IndexRow[]): IndexSnapshot => ({ month, rows });

test("percentile interpolates between ranks", () => {
  assert.equal(percentile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(percentile([5], 0.9), 5);
  assert.equal(percentile([4, 1, 3, 2], 0), 1);
  assert.equal(percentile([4, 1, 3, 2], 1), 4);
});

test("indexRows keeps first-party, paid models only, sorted by id", () => {
  const rows = indexRows([
    makeModel({ id: "openai/b", lab: "openai", slug: "b", priceSource: "openai", blended: 2 }),
    makeModel({ id: "openai/a", lab: "openai", slug: "a", priceSource: "openai", blended: 1, modalitiesIn: ["text", "image/png"] }),
    makeModel({ id: "meta/hosted", lab: "meta", slug: "hosted", priceSource: "deepinfra", blended: 1 }),
    makeModel({ id: "openai/free", lab: "openai", slug: "free", priceSource: "openai", blended: 0 }),
    makeModel({ id: "zhipuai/glm", lab: "zhipuai", slug: "glm", priceSource: "zai", blended: 3 }),
  ]);
  assert.deepEqual(rows.map((r) => r.id), ["openai/a", "openai/b", "zhipuai/glm"]);
  assert.equal(rows[0].vision, true);
  assert.equal(rows[1].vision, false);
});

test("buildSeries rebases on the base month and computes month-over-month changes", () => {
  const series = buildSeries([
    snap("2025-12", [row("a/x", 1), row("a/y", 3)]),
    snap("2026-01", [row("a/x", 2), row("a/y", 2)]),
    snap("2026-02", [row("a/x", 2), row("b/y", 3)]),
  ], "2026-01");
  assert.deepEqual(series.map((p) => p.index), [100, 100, 125]);
  assert.deepEqual(series.map((p) => p.momPct), [null, 0, 25]);
  assert.deepEqual(series.map((p) => p.sinceBasePct), [0, 0, 25]);
  assert.deepEqual(series[2], {
    ...series[2], models: 2, labs: 2, median: 2.5, added: 1, retired: 1, repriced: 0,
  });
  assert.equal(series[1].repriced, 2);
});

test("buildSeries rebases on the first month when the base month is missing", () => {
  const series = buildSeries([snap("2026-03", [row("a/x", 2)]), snap("2026-04", [row("a/x", 3)])], "2026-01");
  assert.deepEqual(series.map((p) => p.index), [100, 150]);
});

test("compareSnapshots separates stayers, repriced, added and retired models", () => {
  const c = compareSnapshots(
    snap("2026-01", [row("a/same", 1), row("a/cut", 4), row("a/hike", 2), row("a/gone", 8)]),
    snap("2026-02", [row("a/same", 1), row("a/cut", 2), row("a/hike", 3), row("a/new", 6)]),
  );
  assert.equal(c.stayers, 3);
  assert.deepEqual(c.repriced.map((r) => [r.row.id, r.pct]), [["a/cut", -50], ["a/hike", 50]]);
  assert.deepEqual(c.added.map((r) => r.id), ["a/new"]);
  assert.deepEqual(c.retired.map((r) => r.id), ["a/gone"]);
  assert.equal(c.addedMedian, 6);
  assert.equal(c.retiredMedian, 8);
  assert.equal(c.stayerMedian, 2);
});

test("compareSnapshots counts a change on either side of the price, even if the blended price is equal", () => {
  const c = compareSnapshots(
    snap("2026-01", [row("a/x", 1, { input: 1, output: 1 })]),
    snap("2026-02", [row("a/x", 1, { input: 0.8, output: 1.6 })]),
  );
  assert.equal(c.repriced.length, 1);
  assert.equal(c.repriced[0].pct, 0);
});

test("compareSnapshots returns null medians for empty groups", () => {
  const c = compareSnapshots(snap("2026-01", [row("a/x", 1)]), snap("2026-02", [row("a/x", 1)]));
  assert.equal(c.addedMedian, null);
  assert.equal(c.retiredMedian, null);
});

test("labChanges compares each lab's median and handles labs that appear", () => {
  const changes = labChanges(
    snap("2026-01", [row("a/x", 1), row("a/y", 3)]),
    snap("2026-02", [row("a/x", 4), row("b/z", 1)]),
  );
  assert.deepEqual(changes, [
    { lab: "a", beforeCount: 2, before: 2, afterCount: 1, after: 4, pct: 100 },
    { lab: "b", beforeCount: 0, before: null, afterCount: 1, after: 1, pct: null },
  ]);
});

test("leaveOneLabOut reports the range of the change without each lab", () => {
  const a = snap("2026-01", [row("a/1", 1), row("a/2", 1), row("a/3", 1), row("b/1", 2), row("b/2", 2), row("b/3", 2)]);
  const b = snap("2026-02", [row("a/1", 1), row("a/2", 1), row("a/3", 1), row("b/1", 4), row("b/2", 4), row("b/3", 4)]);
  const range = leaveOneLabOut(a, b, 2);
  assert.deepEqual(range, { min: { lab: "b", pct: 0 }, max: { lab: "a", pct: 100 } });
});

test("launchCohorts uses each model's first observed price and flags the running quarter", () => {
  const cohorts = launchCohorts(
    [
      snap("2026-05", [
        row("a/1", 1, { releaseDate: "2026-04-10" }), row("a/2", 3, { releaseDate: "2026-05-01" }),
        row("a/old", 9, { releaseDate: "2024-01-01" }), row("a/none", 9),
      ]),
      snap("2026-07", [row("a/1", 100, { releaseDate: "2026-04-10" }), row("a/3", 5, { releaseDate: "2026-07-02" })]),
    ],
    { minCount: 1, fromQuarter: "2026-Q1" },
  );
  assert.deepEqual(cohorts, [
    { quarter: "2026-Q2", count: 2, median: 2, partial: false },
    { quarter: "2026-Q3", count: 1, median: 5, partial: true },
  ]);
});

test("floorsOf picks the cheapest live model for each capability", () => {
  const floors = floorsOf(snap("2026-01", [
    row("a/dead", 0.01, { status: "deprecated" }),
    row("a/basic", 0.1, { tools: false, context: 8_000 }),
    row("a/tools", 0.5, { context: 200_000 }),
    row("a/long", 0.7, { context: 2_000_000, reasoning: true }),
    row("a/eyes", 0.2, { tools: false, vision: true, context: 8_000 }),
  ]));
  assert.deepEqual(floors.map((f) => [f.id, f.row.id]), [
    ["tools", "a/tools"], ["reasoning", "a/long"], ["long-context", "a/long"], ["vision", "a/eyes"],
  ]);
});

test("floorsOf omits a capability no model offers", () => {
  assert.deepEqual(floorsOf(snap("2026-01", [row("a/x", 1, { tools: false, context: 1_000 })])), []);
});

test("month helpers", () => {
  assert.equal(previousMonth("2026-11-04"), "2026-10");
  assert.equal(previousMonth("2027-01-01"), "2026-12");
  assert.equal(closingDate("2026-10"), "2026-11-01");
  assert.equal(closingDate("2026-12"), "2027-01-01");
  assert.deepEqual(monthsAround(["2026-01", "2026-02", "2026-03"], "2026-02"), { prev: "2026-01", next: "2026-03" });
  assert.deepEqual(monthsAround(["2026-01"], "2026-01"), { prev: null, next: null });
});

test("publishedOn never backdates a rebuilt month", () => {
  assert.equal(publishedOn("2025-11"), "2026-11-04");
  assert.equal(publishedOn("2026-10"), "2026-11-04");
  assert.equal(publishedOn("2026-11"), "2026-12-01");
});

test("trendWord treats moves under one percent as flat", () => {
  assert.equal(trendWord(25.8), "up");
  assert.equal(trendWord(-3), "down");
  assert.equal(trendWord(0.9), "flat");
  assert.equal(trendWord(-0.9), "flat");
});

test("buildSeries splits list-price changes into cuts and increases", () => {
  const [, point] = buildSeries([
    snap("2026-01", [row("a/cut", 2), row("a/hike", 2), row("a/same", 2)]),
    snap("2026-02", [row("a/cut", 1), row("a/hike", 3), row("a/same", 2)]),
  ], "2026-01");
  assert.deepEqual([point.repriced, point.cuts, point.hikes], [2, 1, 1]);
});

test("monthLabel spells the month out", () => {
  assert.equal(monthLabel("2026-10"), "October 2026");
  assert.equal(monthLabel("2027-01"), "January 2027");
});

test("monthToClose returns last month until its snapshot exists", () => {
  assert.equal(monthToClose("2026-12-01", ["2026-10"]), "2026-11");
  assert.equal(monthToClose("2026-12-20", ["2026-10", "2026-11"]), null);
  assert.equal(monthToClose("2027-01-01", ["2026-11"]), "2026-12");
});

test("verdict only claims what the leave-one-lab-out range supports", () => {
  const range = (min: number, max: number) => ({ min: { lab: "a", pct: min }, max: { lab: "b", pct: max } });
  assert.equal(verdict(23.7, range(-0.6, 27.6)), "AI API list prices are not falling.");
  assert.equal(verdict(10, range(-8, 12)), "AI API list prices are up, but the result depends on which labs you count.");
  assert.equal(verdict(-12, range(-20, -5)), "AI API list prices are falling.");
  assert.equal(verdict(-4, range(-9, 3)), "AI API list prices are down, but the result depends on which labs you count.");
  assert.equal(verdict(0.4, range(-2, 3)), "AI API list prices are flat.");
  assert.equal(verdict(23.7, null), "AI API list prices are up.");
  assert.equal(verdict(-23.7, null), "AI API list prices are down.");
});
