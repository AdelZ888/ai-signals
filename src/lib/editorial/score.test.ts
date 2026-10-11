import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import type { ModelEvent } from "../data/types.ts";
import { coveredKeys, eventKey, flashCandidates, pickFlashEvent, scoreEvent } from "./score.ts";

const TODAY = "2026-10-11";
const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", family: "claude-haiku", releaseDate: "2026-10-07", price: { input: 0.1, output: 0.5 } }),
  makeModel({ id: "anthropic/claude-haiku-5-mini", name: "Claude Haiku 5 Mini", family: "claude-haiku", releaseDate: "2026-10-08", price: { input: 0.8, output: 4 } }),
  makeModel({ id: "anthropic/claude-haiku-4-5", name: "Claude Haiku 4.5", family: "claude-haiku", releaseDate: "2025-10-15", price: { input: 1, output: 5 } }),
  makeModel({ id: "google/gemini-3-8-flash-lite", name: "Gemini 3.8 Flash Lite", family: "gemini-flash", releaseDate: "2026-09-01", price: { input: 0.25, output: 1 } }),
  makeModel({ id: "openai/gpt-4o-mini", name: "GPT-4o mini", releaseDate: "2024-07-18", price: { input: 0.15, output: 0.6 } }),
  makeModel({ id: "zhipuai/glm-5", name: "GLM-5", family: "glm", releaseDate: "2026-10-01", priceSource: "zai", price: { input: 1, output: 3.2 } }),
  makeModel({ id: "anthropic/claude-haiku-5-5-20261007", name: "snapshot", releaseDate: "2026-10-07" }),
  makeModel({ id: "xai/grok-6", name: "Grok 6", status: "beta", releaseDate: "2026-10-10" }),
];
const snap = (input: number, output: number, context = 128_000) => ({ input, output, blended: (3 * input + output) / 4, context });
const ev = (id: string, type: ModelEvent["type"], extra: Partial<ModelEvent> = {}): ModelEvent => {
  const [lab, slug] = id.split("/");
  return { date: TODAY, id, lab, slug, name: slug, type, ...extra };
};

test("new generation from a tier-1 lab that undercuts a rival is eligible", () => {
  const s = scoreEvent(ev("anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5) }), models, TODAY);
  assert.equal(s.score, 85);
  assert.equal(s.eligible, true);
  assert.equal(s.rival?.name, "Gemini 3.8 Flash Lite");
});

test("a new variant from a tier-1 lab alone is not enough", () => {
  const s = scoreEvent(ev("anthropic/claude-haiku-5-mini", "new_model", { after: snap(0.8, 4) }), models, TODAY);
  assert.equal(s.score, 55);
  assert.equal(s.eligible, false);
});

test("price changes: thresholds and tiers", () => {
  const cut20 = scoreEvent(ev("anthropic/claude-haiku-4-5", "price_change", { before: snap(1.25, 6.25), after: snap(1, 5), pctChange: -20 }), models, TODAY);
  assert.equal(cut20.score, 60);
  assert.equal(cut20.eligible, true);
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "price_change", { pctChange: -8, after: snap(1, 5) }), models, TODAY).eligible, false);
  // tier-2 15 + cut 20% 20 + undercuts Claude Haiku 4.5 15 = 50: still below the threshold
  const tier2 = scoreEvent(ev("zhipuai/glm-5", "price_change", { pctChange: -25, after: snap(1, 3.2) }), models, TODAY);
  assert.equal(tier2.score, 50);
  assert.equal(tier2.eligible, false);
});

test("context changes need at least 2x", () => {
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "context_change", { before: snap(1, 5, 200_000), after: snap(1, 5, 400_000) }), models, TODAY).score, 50);
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "context_change", { before: snap(1, 5, 200_000), after: snap(1, 5, 300_000) }), models, TODAY).eligible, false);
});

test("re-listed old model is not eligible", () => {
  const s = scoreEvent(ev("openai/gpt-4o-mini", "new_model", { after: snap(0.15, 0.6) }), models, TODAY);
  assert.equal(s.eligible, false);
  assert.deepEqual(s.reasons, ["re-listed old model"]);
});

test("snapshots, beta models and removals are never flash news", () => {
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-5-5-20261007", "new_model", { after: snap(1, 2) }), models, TODAY).eligible, false);
  assert.equal(scoreEvent(ev("xai/grok-6", "new_model", { after: snap(1, 2) }), models, TODAY).eligible, false);
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "removed"), models, TODAY).eligible, false);
});

test("pickFlashEvent enforces 1 per day and 4 per ISO week", () => {
  const best = scoreEvent(ev("anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5) }), models, TODAY);
  const other = scoreEvent(ev("anthropic/claude-haiku-4-5", "price_change", { before: snap(1.25, 6.25), after: snap(1, 5), pctChange: -20 }), models, TODAY);
  assert.equal(pickFlashEvent([other, best], [], TODAY)?.event.id, "anthropic/claude-haiku-5-5");
  assert.equal(pickFlashEvent([best], [TODAY], TODAY), null);
  assert.equal(pickFlashEvent([best], ["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"], TODAY), null);
  assert.equal(pickFlashEvent([best], ["2026-10-02", "2026-10-03", "2026-10-04"], TODAY)?.score, 85);
});

test("price changes of host-priced models are digest-only", () => {
  const hosted = [...models, makeModel({ id: "google/gemma-5", name: "Gemma 5", priceSource: "deepinfra", releaseDate: "2026-09-01", price: { input: 0.1, output: 0.2 } })];
  const s = scoreEvent(ev("google/gemma-5", "price_change", { before: snap(0.2, 0.4), after: snap(0.1, 0.2), pctChange: -50 }), hosted, TODAY);
  assert.equal(s.eligible, false);
  assert.deepEqual(s.reasons, ["host-priced change (digest only)"]);
});

test("flashCandidates publishes price changes only once the next refresh confirms them", () => {
  const yesterday = "2026-10-10";
  const confirmed = { ...ev("anthropic/claude-haiku-4-5", "price_change", { before: snap(1.25, 6.25), after: snap(1, 5), pctChange: -20 }), date: yesterday };
  const reverted = { ...ev("zhipuai/glm-5", "price_change", { before: snap(1, 3.2), after: snap(0.5, 1.6), pctChange: -50 }), date: yesterday };
  const todayPrice = ev("google/gemini-3-8-flash-lite", "price_change", { before: snap(0.5, 2), after: snap(0.25, 1), pctChange: -50 });
  const launch = ev("anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5) });
  const ids = flashCandidates([confirmed, reverted, todayPrice, launch], models, TODAY).map((e) => `${e.type}:${e.id}`);
  assert.deepEqual(ids, ["price_change:anthropic/claude-haiku-4-5", "new_model:anthropic/claude-haiku-5-5"]);
});

test("pickFlashEvent skips events already covered by a recent article", () => {
  const best = scoreEvent(ev("anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5) }), models, TODAY);
  assert.equal(eventKey(best.event), "anthropic/claude-haiku-5-5:pricing");
  const covered = coveredKeys(
    [
      { modelId: "anthropic/claude-haiku-5-5", slug: "2026-10-01-claude-haiku-5-5-pricing", date: "2026-10-01", kind: "flash" },
      { modelId: "openai/gpt-6.1-sol", slug: "2026-08-01-gpt-6-1-sol-pricing", date: "2026-08-01", kind: "flash" },
    ],
    TODAY,
  );
  assert.deepEqual([...covered], ["anthropic/claude-haiku-5-5:pricing"]);
  assert.equal(pickFlashEvent([best], [], TODAY, covered), null);
});
