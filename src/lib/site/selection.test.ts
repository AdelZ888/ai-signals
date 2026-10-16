import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import {
  BEST_LISTS, alternatives, comparisonPairs, findBestList, isIndexable, makePair, nearestCompetitors,
  alternativesPageModels, notablePool, parsePairKey, predecessor, stablePairs, versionOf,
} from "./selection.ts";

const TODAY = "2026-10-11";
const vision = { modalitiesIn: ["text", "image"] };

test("versionOf reads model generations, not sizes", () => {
  assert.equal(versionOf("claude-haiku-5-5"), 5.5);
  assert.equal(versionOf("gpt-6.1-sol"), 6.1);
  assert.equal(versionOf("gemma-4-31b-it"), 4);
  assert.equal(versionOf("llama-4-scout"), 4);
  assert.equal(versionOf("qwen3.8-max"), 3.8);
  assert.equal(versionOf("gpt-4o"), 4);
  assert.equal(versionOf("command-r"), null);
});

test("isIndexable needs a price and a context", () => {
  assert.equal(isIndexable(makeModel({ id: "openai/x", context: 0 })), false);
  assert.equal(isIndexable(makeModel({ id: "openai/x" })), true);
});

test("alternatives keep capabilities and sort by blended price", () => {
  const target = makeModel({ id: "anthropic/t", ...vision, price: { input: 1, output: 5 }, context: 200_000 });
  const models = [
    target,
    makeModel({ id: "google/cheap-vision", ...vision, price: { input: 0.1, output: 0.4 } , context: 1_000_000 }),
    makeModel({ id: "openai/mid-vision", ...vision, price: { input: 0.5, output: 2 }, context: 200_000 }),
    makeModel({ id: "meta/text-only", price: { input: 0.05, output: 0.1 }, context: 200_000 }),
    makeModel({ id: "xai/deprecated", ...vision, status: "deprecated", price: { input: 0.01, output: 0.01 }, context: 200_000 }),
    makeModel({ id: "mistral/tiny-ctx", ...vision, price: { input: 0.02, output: 0.02 }, context: 32_000 }),
  ];
  assert.deepEqual(alternatives(target, models).map((m) => m.id), ["google/cheap-vision", "openai/mid-vision"]);
});

test("nearestCompetitors excludes the same lab and sorts by price ratio", () => {
  const target = makeModel({ id: "openai/t", price: { input: 1, output: 1 } });
  const models = [
    target,
    makeModel({ id: "openai/sibling", price: { input: 1, output: 1 } }),
    makeModel({ id: "anthropic/x2", price: { input: 2, output: 2 } }),
    makeModel({ id: "google/x10", price: { input: 10, output: 10 } }),
    makeModel({ id: "meta/half", price: { input: 0.6, output: 0.6 } }),
  ];
  assert.deepEqual(nearestCompetitors(target, models).map((m) => m.id), ["meta/half", "anthropic/x2", "google/x10"]);
});

test("notablePool keeps recent models, two per family", () => {
  const models = [
    makeModel({ id: "openai/gpt-6", family: "gpt", releaseDate: "2026-06-01" }),
    makeModel({ id: "openai/gpt-6.1", family: "gpt", releaseDate: "2026-09-01" }),
    makeModel({ id: "openai/gpt-5", family: "gpt", releaseDate: "2026-01-01" }),
    makeModel({ id: "openai/ancient", family: "old", releaseDate: "2023-01-01" }),
  ];
  assert.deepEqual(notablePool(models, TODAY).map((m) => m.id), ["openai/gpt-6", "openai/gpt-6.1"]);
});

test("comparisonPairs: predecessor and competitors first, canonical keys, no duplicates, capped", () => {
  const models = [
    makeModel({ id: "anthropic/claude-haiku-5-5", family: "claude-haiku", releaseDate: "2026-10-07", price: { input: 0.1, output: 0.5 } }),
    makeModel({ id: "anthropic/claude-haiku-4-5", family: "claude-haiku", releaseDate: "2025-10-15", price: { input: 1, output: 5 } }),
    makeModel({ id: "google/gemini-3-8-flash", family: "gemini-flash", releaseDate: "2026-08-01", price: { input: 0.15, output: 0.6 } }),
    makeModel({ id: "openai/gpt-6-1-mini", family: "gpt-mini", releaseDate: "2026-09-01", price: { input: 0.2, output: 0.8 } }),
    makeModel({ id: "meta/llama-5", family: "llama", releaseDate: "2026-05-01", price: { input: 0.1, output: 0.3 } }),
  ];
  const pairs = comparisonPairs(models, TODAY);
  assert.equal(pairs[0].key, "claude-haiku-4-5-vs-claude-haiku-5-5");
  assert.ok(pairs.every((p) => p.a.slug < p.b.slug && p.key === `${p.a.slug}-vs-${p.b.slug}`));
  assert.equal(new Set(pairs.map((p) => p.key)).size, pairs.length);
  assert.equal(comparisonPairs(models, TODAY, 2).length, 2);
  assert.equal(makePair(models[1], models[0]).key, makePair(models[0], models[1]).key);
  assert.equal(predecessor(models[0], models)?.id, "anthropic/claude-haiku-4-5");
});

test("best lists filter and rank", () => {
  const models = [
    makeModel({ id: "openai/a", ...vision, price: { input: 3, output: 3 }, releaseDate: "2026-10-01" }),
    makeModel({ id: "google/b", ...vision, price: { input: 1, output: 1 }, releaseDate: "2026-02-01" }),
    makeModel({ id: "meta/c", price: { input: 0.1, output: 0.1 }, releaseDate: "2026-09-20" }),
  ];
  const vis = findBestList("cheapest-vision-model");
  assert.deepEqual(vis?.select(models, TODAY).map((m) => m.id), ["google/b", "openai/a"]);
  const newest = findBestList("newest-ai-models");
  assert.deepEqual(newest?.select(models, TODAY).map((m) => m.id), ["openai/a", "meta/c"]);
  assert.equal(new Set(BEST_LISTS.map((l) => l.slug)).size, BEST_LISTS.length);
  assert.equal(findBestList("nope"), null);
});

test("stablePairs keeps previously published pairs so comparison URLs never disappear", () => {
  const a = makeModel({ id: "openai/a", releaseDate: "2026-09-01", price: { input: 1, output: 1 } });
  const b = makeModel({ id: "google/b", releaseDate: "2026-09-02", price: { input: 1.1, output: 1.1 } });
  const old = makeModel({ id: "meta/old", releaseDate: "2023-01-01", price: { input: 1, output: 1 } });
  const models = [a, b, old];
  const pairs = stablePairs(models, TODAY, ["a-vs-old", "gone-vs-a", "a-vs-b"]);
  const keys = pairs.map((p) => p.key);
  assert.equal(keys[0], "a-vs-b");
  assert.ok(keys.includes("a-vs-old"), "published pair kept even though no longer selected");
  assert.ok(!keys.some((k) => k.includes("gone")), "pairs whose model disappeared are dropped");
  assert.equal(new Set(keys).size, keys.length);
});

test("parsePairKey resolves slugs that contain dashes", () => {
  const bySlug = new Map([["gpt-6.1-sol", makeModel({ id: "openai/gpt-6.1-sol" })], ["claude-haiku-5-5", makeModel({ id: "anthropic/claude-haiku-5-5" })]]);
  assert.equal(parsePairKey("claude-haiku-5-5-vs-gpt-6.1-sol", bySlug)?.key, "claude-haiku-5-5-vs-gpt-6.1-sol");
  assert.equal(parsePairKey("nope-vs-gpt-6.1-sol", bySlug), null);
});

test("alternatives pages exist only for notable models with at least 5 compatible alternatives", () => {
  const many = Array.from({ length: 6 }, (_, i) => makeModel({ id: `google/alt-${i}`, family: `f${i}`, releaseDate: "2026-08-01", price: { input: 0.1 * (i + 1), output: 0.2 * (i + 1) } }));
  const star = makeModel({ id: "openai/star", family: "star", releaseDate: "2026-09-01", price: { input: 2, output: 8 } });
  const lonely = makeModel({ id: "openai/vision-only", family: "v", releaseDate: "2026-09-01", modalitiesIn: ["text", "image", "video"] });
  const ancient = makeModel({ id: "meta/ancient", family: "a", releaseDate: "2023-01-01" });
  const ids = alternativesPageModels([...many, star, lonely, ancient], TODAY).map((m) => m.id);
  assert.ok(ids.includes("openai/star"));
  assert.ok(!ids.includes("openai/vision-only"), "no page without 5 compatible alternatives");
  assert.ok(!ids.includes("meta/ancient"), "only notable (recent) models");
});
