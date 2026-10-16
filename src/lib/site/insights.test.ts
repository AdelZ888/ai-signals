import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { modelRankings, modelSummary, priceRank, providerSummary } from "./insights.ts";

const TODAY = "2026-10-11";
const vision = { modalitiesIn: ["text", "image"] };
const target = makeModel({
  id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", releaseDate: "2026-10-07", context: 1_000_000, price: { input: 0.1, output: 0.5 }, ...vision,
  capabilities: { reasoning: true, toolCall: true, structuredOutput: true },
});
const models = [
  target,
  makeModel({ id: "google/flash", name: "Flash", price: { input: 0.05, output: 0.2 }, ...vision }),
  makeModel({ id: "openai/sol", name: "Sol", price: { input: 2, output: 10 }, ...vision, openWeights: false }),
  makeModel({ id: "meta/llama", name: "Llama", price: { input: 0.3, output: 0.6 }, openWeights: true }),
  makeModel({ id: "anthropic/opus", name: "Opus", price: { input: 5, output: 25 }, releaseDate: "2026-09-22", ...vision }),
];

test("priceRank places the model among active, indexable models by blended price", () => {
  assert.deepEqual(priceRank(target, models), { rank: 2, total: 5, cheaperThanPct: 60 });
});

test("modelRankings lists the rankings the model appears in, best rank first", () => {
  const r = modelRankings(target, models, TODAY);
  const vis = r.find((x) => x.slug === "cheapest-vision-model");
  assert.deepEqual(vis && { rank: vis.rank, size: vis.size }, { rank: 2, size: 4 });
  assert.ok(r.every((x, i) => i === 0 || r[i - 1].rank <= x.rank));
});

test("modelSummary states facts in plain sentences", () => {
  const s = modelSummary(target, models, "Anthropic");
  assert.equal(s[0], "Claude Haiku 5.5 is an Anthropic model released on 2026-10-07.");
  assert.match(s[1], /blended price of \$0\.20 per 1M tokens is lower than 60% of the 5 models we track/u);
  assert.match(s[2], /text and image input, a 1M-token context window, built-in reasoning, tool calling and structured output/u);
});

test("providerSummary describes the lab's lineup", () => {
  const s = providerSummary("Anthropic", models.filter((m) => m.lab === "anthropic"));
  assert.match(s, /^Anthropic offers 2 models through its API, from Claude Haiku 5\.5 \(\$0\.20 blended\) to Opus \(\$10\.00 blended\) per 1M tokens\./u);
  assert.match(s, /2 accept image input/u);
  assert.match(s, /newest is Claude Haiku 5\.5 \(2026-10-07\)/u);
});
