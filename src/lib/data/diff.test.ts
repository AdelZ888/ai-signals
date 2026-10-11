import { test } from "node:test";
import assert from "node:assert/strict";

import { diffSnapshots, pct } from "./diff.ts";
import { makeModel } from "./testing.ts";

const prev = [
  makeModel({ id: "openai/a", price: { input: 1, output: 2 } }),
  makeModel({ id: "openai/b", context: 128_000 }),
  makeModel({ id: "openai/c" }),
  makeModel({ id: "openai/gone" }),
];
const next = [
  makeModel({ id: "openai/a", price: { input: 0.5, output: 1 } }),
  makeModel({ id: "openai/b", context: 256_000 }),
  makeModel({ id: "openai/c", status: "deprecated" }),
  makeModel({ id: "openai/new" }),
];

test("emits one event per change, in catalog order then removals", () => {
  const events = diffSnapshots(prev, next, "2026-10-11");
  assert.deepEqual(
    events.map((e) => `${e.type}:${e.id}`),
    ["price_change:openai/a", "context_change:openai/b", "deprecated:openai/c", "new_model:openai/new", "removed:openai/gone"],
  );
  const price = events[0];
  assert.equal(price.date, "2026-10-11");
  assert.equal(price.pctChange, -50);
  assert.deepEqual(price.before, { input: 1, output: 2, blended: 1.25, context: 128_000 });
  assert.deepEqual(price.after, { input: 0.5, output: 1, blended: 0.625, context: 128_000 });
  assert.equal(events[3].after?.blended, 1.25);
  assert.equal(events[4].before?.blended, 1.25);
  assert.equal(events[4].after, undefined);
});

test("unchanged snapshots produce no events", () => {
  assert.deepEqual(diffSnapshots(prev, prev, "2026-10-11"), []);
});

test("pct from zero never returns Infinity", () => {
  assert.equal(pct(0, 0), 0);
  assert.equal(pct(0, 2), 100);
  assert.equal(pct(4, 5), 25);
  assert.equal(pct(3, 1), -66.7);
});
