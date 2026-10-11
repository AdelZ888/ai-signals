import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import type { ModelEvent } from "../data/types.ts";
import { change30d, priceHistory } from "./history.ts";

const model = makeModel({ id: "openai/a", price: { input: 0.5, output: 1 }, releaseDate: "2026-01-01" });
const snap = (input: number, output: number) => ({ input, output, blended: (3 * input + output) / 4, context: 128_000 });
const head = { id: "openai/a", lab: "openai", slug: "a", name: "a" };
const events: ModelEvent[] = [
  { ...head, date: "2026-01-05", type: "new_model", after: snap(1, 2) },
  { ...head, date: "2026-06-01", type: "price_change", before: snap(1, 2), after: snap(0.5, 1), pctChange: -50 },
];

test("history follows events and ends today", () => {
  assert.deepEqual(priceHistory(model, events, "2026-10-11"), [
    { date: "2026-01-05", input: 1, output: 2 },
    { date: "2026-06-01", input: 0.5, output: 1 },
    { date: "2026-10-11", input: 0.5, output: 1 },
  ]);
});

test("history without events is a flat line from release", () => {
  assert.deepEqual(priceHistory(model, [], "2026-10-11"), [
    { date: "2026-01-01", input: 0.5, output: 1 },
    { date: "2026-10-11", input: 0.5, output: 1 },
  ]);
});

test("a price change without new_model starts at release with the old price", () => {
  assert.deepEqual(priceHistory(model, [events[1]], "2026-10-11")[0], { date: "2026-01-01", input: 1, output: 2 });
});

test("change30d compares with the price 30 days ago", () => {
  assert.equal(change30d(model, events, "2026-06-20"), -50);
  assert.equal(change30d(model, events, "2026-10-11"), null);
  const fresh = makeModel({ id: "openai/a", releaseDate: "2026-10-01" });
  assert.equal(change30d(fresh, [], "2026-10-11"), null);
});
