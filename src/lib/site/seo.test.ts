import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { bestTitle, buildRss, compareTitle, modelDescription, modelTitle, xmlEscape } from "./seo.ts";

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

test("xml escaping and RSS", () => {
  assert.equal(xmlEscape(`a & <b> "c" 'd'`), "a &amp; &lt;b&gt; &quot;c&quot; &apos;d&apos;");
  const rss = buildRss(
    { title: "AI Signals", link: "https://aisignals.dev", description: "d" },
    [{ title: "A & B", link: "https://aisignals.dev/news/a", description: "x", date: "2026-10-11" }],
  );
  assert.match(rss, /<item><title>A &amp; B<\/title><link>https:\/\/aisignals.dev\/news\/a<\/link>/u);
  assert.match(rss, /<pubDate>Sun, 11 Oct 2026 06:00:00 GMT<\/pubDate>/u);
});
