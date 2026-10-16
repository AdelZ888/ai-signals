import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../../src/lib/data/testing.ts";
import type { ModelEvent } from "../../src/lib/data/types.ts";
import { makePair } from "../../src/lib/site/selection.ts";
import { INDEXNOW_KEY, changedUrls, indexNowPayload } from "./indexnow-urls.ts";

const a = makeModel({ id: "anthropic/claude-haiku-5-5" });
const b = makeModel({ id: "openai/gpt-6.1-sol" });
const c = makeModel({ id: "google/gemini-x" });
const ev = (date: string, id: string): ModelEvent => ({ date, id, lab: id.split("/")[0], slug: id.split("/")[1], name: id, type: "price_change" });

test("changedUrls lists pages touched by today's events and articles", () => {
  const urls = changedUrls({
    base: "https://aisignals.dev",
    today: "2026-10-16",
    events: [ev("2026-10-16", a.id), ev("2026-10-15", c.id)],
    articles: [{ slug: "2026-10-16-x-pricing", date: "2026-10-16" }, { slug: "old", date: "2026-10-01" }],
    models: [a, b, c],
    pairs: [makePair(a, b), makePair(b, c)],
    alternativesFor: new Set([a.id]),
  });
  assert.deepEqual(urls, [
    "https://aisignals.dev/",
    "https://aisignals.dev/changes",
    "https://aisignals.dev/models",
    "https://aisignals.dev/news",
    "https://aisignals.dev/news/2026-10-16-x-pricing",
    "https://aisignals.dev/models/anthropic/claude-haiku-5-5",
    "https://aisignals.dev/providers/anthropic",
    "https://aisignals.dev/models/anthropic/claude-haiku-5-5/alternatives",
    "https://aisignals.dev/compare/claude-haiku-5-5-vs-gpt-6.1-sol",
  ]);
});

test("nothing changed means nothing to submit", () => {
  assert.deepEqual(changedUrls({ base: "https://x.dev", today: "2026-10-16", events: [], articles: [], models: [], pairs: [], alternativesFor: new Set() }), []);
});

test("indexNowPayload follows the protocol", () => {
  assert.deepEqual(indexNowPayload("https://aisignals.dev", ["https://aisignals.dev/"]), {
    host: "aisignals.dev",
    key: INDEXNOW_KEY,
    keyLocation: `https://aisignals.dev/${INDEXNOW_KEY}.txt`,
    urlList: ["https://aisignals.dev/"],
  });
});
