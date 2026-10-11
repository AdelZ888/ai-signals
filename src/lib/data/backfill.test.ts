import { test } from "node:test";
import assert from "node:assert/strict";

import { timelineToEvents } from "./backfill.ts";

const model = { id: "anthropic/claude-x", lab: "anthropic", slug: "claude-x", name: "Claude X", context: 200_000, releaseDate: "2026-01-10" };

test("first point is a new_model near release, then real price changes only", () => {
  const events = timelineToEvents(model, [
    { date: "2026-01-12", input: 1, output: 5 },
    { date: "2026-01-12", input: 1, output: 4 },
    { date: "2026-02-01", input: 1, output: 4 },
    { date: "2026-03-01", input: 0.5, output: 2 },
  ]);
  assert.deepEqual(events.map((e) => `${e.date}:${e.type}`), ["2026-01-12:new_model", "2026-03-01:price_change"]);
  assert.deepEqual(events[0].after, { input: 1, output: 4, blended: 1.75, context: 200_000 });
  assert.equal(events[1].pctChange, -50);
});

test("no new_model when the model was added to models.dev long after release", () => {
  const events = timelineToEvents({ ...model, releaseDate: "2024-03-01" }, [
    { date: "2025-06-04", input: 3, output: 15 },
    { date: "2025-09-01", input: 1, output: 5 },
  ]);
  assert.deepEqual(events.map((e) => e.type), ["price_change"]);
  assert.deepEqual(events[0].before, { input: 3, output: 15, blended: 6, context: 200_000 });
});

test("empty timeline gives no events", () => {
  assert.deepEqual(timelineToEvents(model, []), []);
});
