import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { bestTitle, clampDescription, fitTitle, itemListLd, buildRss, buildSitemapIndex, buildUrlset, compareTitle, lastModFor, modelDescription, modelTitle, xmlEscape } from "./seo.ts";

const haiku = makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 }, context: 1_000_000 });
const sol = makeModel({ id: "openai/gpt-6.1-sol", name: "GPT-6.1 Sol" });

test("titles match search intent and carry the month", () => {
  assert.equal(modelTitle(haiku, "2026-10-11"), "Claude Haiku 5.5 API Pricing & Specs (Oct 2026)");
  assert.equal(compareTitle(haiku, sol, "2026-10-11"), "Claude Haiku 5.5 vs GPT-6.1 Sol: Pricing Compared (Oct 2026)");
  assert.equal(bestTitle({ title: "Cheapest Vision Models" }, 20, "2026-10-11"), "20 Cheapest Vision Models (Oct 2026)");
});

test("model description uses real numbers", () => {
  assert.equal(
    modelDescription(haiku, "Anthropic"),
    "Claude Haiku 5.5 (Anthropic) costs $0.10 per 1M input and $0.50 per 1M output tokens, 1M context. Price history, cheaper alternatives, cost calculator.",
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

test("sitemaps", () => {
  assert.equal(
    buildUrlset([{ loc: "https://x.dev/a?b&c", lastmod: "2026-10-11" }, { loc: "https://x.dev/b" }]),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://x.dev/a?b&amp;c</loc><lastmod>2026-10-11</lastmod></url>\n<url><loc>https://x.dev/b</loc></url>\n</urlset>\n',
  );
  assert.match(buildSitemapIndex([{ loc: "https://x.dev/sitemaps/models.xml", lastmod: null }]), /<sitemapindex[^>]*>\n<sitemap><loc>https:\/\/x.dev\/sitemaps\/models.xml<\/loc><\/sitemap>\n<\/sitemapindex>/u);
});

test("lastModFor uses the latest event of the page's models", () => {
  const e = (date: string, id: string) => ({ date, id, lab: "l", slug: "s", name: "n", type: "price_change" as const });
  assert.equal(lastModFor(["a", "b"], [e("2026-01-01", "a"), e("2026-03-01", "b"), e("2026-09-01", "c")]), "2026-03-01");
  assert.equal(lastModFor(["z"], [e("2026-01-01", "a")]), null);
});

test("fitTitle keeps the brand suffix only when the whole title fits in 60 characters", () => {
  assert.equal(fitTitle("Claude Haiku 5.5 API Pricing & Specs (Oct 2026)"), "Claude Haiku 5.5 API Pricing & Specs (Oct 2026)");
  assert.deepEqual(fitTitle("Qwen Plus Character (Japanese) API Pricing & Specs (Oct 2026)"), { absolute: "Qwen Plus Character (Japanese) API Pricing & Specs (Oct 2026)" });
});

test("clampDescription cuts long descriptions at a word boundary", () => {
  const long = "word ".repeat(60).trim();
  const out = clampDescription(long);
  assert.ok(out.length <= 155 && out.endsWith("…"), out);
  assert.equal(clampDescription("short enough"), "short enough");
});

test("itemListLd builds a schema.org ItemList with absolute URLs", () => {
  assert.deepEqual(itemListLd("Top", [{ name: "A", url: "/models/x/a" }], "https://aisignals.dev"), {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top",
    numberOfItems: 1,
    itemListElement: [{ "@type": "ListItem", position: 1, name: "A", url: "https://aisignals.dev/models/x/a" }],
  });
});
