import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { bestTitle, compareTitle, modelDescription, modelTitle } from "./seo.ts";

const haiku = makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 }, context: 1_000_000 });
const sol = makeModel({ id: "openai/gpt-6.1-sol", name: "GPT-6.1 Sol" });

test("titles match search intent and carry the month", () => {
  assert.equal(modelTitle(haiku, "2026-10-11"), "Claude Haiku 5.5 Pricing, Context Window & Specs (Oct 2026)");
  assert.equal(compareTitle(haiku, sol, "2026-10-11"), "Claude Haiku 5.5 vs GPT-6.1 Sol: Price & Specs Compared (Oct 2026)");
  assert.equal(bestTitle({ title: "Cheapest Vision Models" }, 20, "2026-10-11"), "20 Cheapest Vision Models (Oct 2026)");
});

test("model description uses real numbers", () => {
  assert.equal(
    modelDescription(haiku, "Anthropic"),
    "Claude Haiku 5.5 by Anthropic: $0.10 per 1M input tokens, $0.50 per 1M output tokens, 1M context. Price history, cheaper alternatives and a cost calculator.",
  );
});
