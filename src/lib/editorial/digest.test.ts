import { test } from "node:test";
import assert from "node:assert/strict";

import type { ModelEvent } from "../data/types.ts";
import { buildDigest, digestFacts, digestSlug } from "./digest.ts";
import { checkGrounding } from "./guards.ts";

const range = { start: "2026-10-05", end: "2026-10-11", weekId: "2026-W41" };
const snap = (input: number, output: number, context = 200_000) => ({ input, output, blended: (3 * input + output) / 4, context });
const e = (date: string, id: string, type: ModelEvent["type"], extra: Partial<ModelEvent> = {}): ModelEvent => {
  const [lab, slug] = id.split("/");
  return { date, id, lab, slug, name: `Model ${slug}`, type, ...extra };
};
const events: ModelEvent[] = [
  e("2026-10-04", "openai/too-early", "new_model", { after: snap(1, 2) }),
  e("2026-10-07", "anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5, 1_000_000) }),
  e("2026-10-09", "google/gemini-x", "price_change", { before: snap(0.5, 2), after: snap(0.25, 1), pctChange: -50 }),
  e("2026-10-10", "meta/llama-y", "context_change", { before: snap(0.1, 0.3, 128_000), after: snap(0.1, 0.3, 256_000) }),
  e("2026-10-11", "xai/grok-old", "removed", { before: snap(3, 15) }),
];

test("digest covers the week only, with one section per change type", () => {
  const d = buildDigest(events, range);
  assert.ok(d);
  assert.equal(d.slug, "weekly-ai-pricing-2026-w41");
  assert.equal(d.title, "AI Model Pricing This Week: 4 Changes (2026-10-05 to 2026-10-11)");
  assert.doesNotMatch(d.body, /too-early/u);
  for (const h of ["## New models", "## Price changes", "## Context window changes", "## Deprecated or removed"]) assert.match(d.body, new RegExp(h, "u"));
  assert.match(d.body, /\[Model claude-haiku-5-5\]\(\/models\/anthropic\/claude-haiku-5-5\)/u);
  assert.match(d.body, /\| Model grok-old \|/u);
});

test("an LLM intro replaces the default first line and must be grounded", () => {
  const facts = digestFacts(events, range);
  assert.equal(facts.total, 4);
  assert.equal(checkGrounding("4 changes this week, including a 50% price cut.", facts).ok, true);
  assert.equal(checkGrounding("12 changes this week.", facts).ok, false);
  assert.match(buildDigest(events, range, "Custom intro.")?.body ?? "", /^Custom intro\./u);
});

test("empty weeks produce no digest", () => {
  assert.equal(buildDigest([], range), null);
  assert.equal(digestSlug("2026-W01"), "weekly-ai-pricing-2026-w01");
});
