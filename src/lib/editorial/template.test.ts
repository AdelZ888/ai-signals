import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import type { ModelEvent } from "../data/types.ts";
import { buildFactSheet } from "./factsheet.ts";
import { checkGrounding } from "./guards.ts";
import { scoreEvent } from "./score.ts";
import { articleSlug, renderTemplateArticle } from "./template.ts";

const TODAY = "2026-10-11";
const vision = { modalitiesIn: ["text", "image"] };
const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", family: "claude-haiku", releaseDate: "2026-10-07", price: { input: 0.1, output: 0.5 }, context: 1_000_000, ...vision }),
  makeModel({ id: "google/gemini-3-8-flash-lite", name: "Gemini 3.8 Flash Lite", releaseDate: "2026-09-01", price: { input: 0.25, output: 1 }, context: 1_048_576, ...vision }),
  makeModel({ id: "openai/gpt-6-1-mini", name: "GPT-6.1 Mini", releaseDate: "2026-09-29", price: { input: 0.0375, output: 0.3 }, context: 400_000, ...vision }),
  makeModel({ id: "meta/llama-5-scout", name: "Llama 5 Scout", releaseDate: "2026-06-01", price: { input: 0.12, output: 0.4 }, context: 262_144, openWeights: true }),
];
const snap = (input: number, output: number, context = 1_000_000) => ({ input, output, blended: (3 * input + output) / 4, context });
const head = { id: "anthropic/claude-haiku-5-5", lab: "anthropic", slug: "claude-haiku-5-5", name: "Claude Haiku 5.5" };

const cases: ModelEvent[] = [
  { ...head, date: TODAY, type: "new_model", after: snap(0.1, 0.5) },
  { ...head, date: TODAY, type: "price_change", before: snap(0.125, 0.625), after: snap(0.1, 0.5), pctChange: -20 },
  { ...head, date: TODAY, type: "context_change", before: snap(0.1, 0.5, 200_000), after: snap(0.1, 0.5) },
];

for (const event of cases) {
  test(`template article for ${event.type} is fully grounded`, () => {
    const facts = buildFactSheet(scoreEvent(event, models, TODAY), models);
    const article = renderTemplateArticle(facts);
    assert.ok(article.title.includes("Claude Haiku 5.5"));
    assert.match(article.body, /## What it costs in practice/u);
    assert.match(article.body, /\| Chatbot \| 10M \/ 2M \|/u);
    assert.deepEqual(checkGrounding(`${article.title}\n${article.body}\n${article.description}`, facts), { ok: true, unknown: [] });
  });
}

test("articleSlug is stable and URL-safe", () => {
  assert.equal(articleSlug(cases[1]), "2026-10-11-claude-haiku-5-5-price-cut");
  assert.equal(articleSlug({ ...cases[0], slug: "gpt-6.1-sol" }), "2026-10-11-gpt-6-1-sol-pricing");
});

test("untrusted competitor names are escaped in template tables", () => {
  const evil = makeModel({ id: "meta/evil", name: "Evil | [x](https://phish.io)", releaseDate: "2026-09-01", price: { input: 0.11, output: 0.45 }, context: 1_000_000, ...vision });
  const all = [...models, evil];
  const facts = buildFactSheet(scoreEvent(cases[0], all, TODAY), all);
  const body = renderTemplateArticle(facts).body;
  assert.ok(facts.competitors.some((c) => c.name.startsWith("Evil")));
  assert.doesNotMatch(body, /\]\(https:\/\/phish/u);
  assert.match(body, /Evil \\\| \\\[x\\\]/u);
});
