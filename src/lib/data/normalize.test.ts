import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { blendedPrice, normalizeModelsDev, type RawModelsDev } from "./normalize.ts";

const raw = JSON.parse(
  readFileSync(new URL("./__fixtures__/modelsdev-mini.json", import.meta.url), "utf8"),
) as RawModelsDev;
const models = normalizeModelsDev(raw);
const byId = new Map(models.map((m) => [m.id, m]));

test("keeps only allow-listed labs, text output and paid models", () => {
  assert.deepEqual(
    models.map((m) => m.id),
    [
      "anthropic/claude-3-haiku",
      "anthropic/claude-haiku-5-5",
      "anthropic/claude-opus-4-5",
      "google/gemma-4-31b-it",
      "mistral/glm-5",
      "openai/gpt-6.1-sol",
      "zhipuai/glm-5",
    ],
  );
});

test("first-party price wins and aggregators are ignored", () => {
  const haiku = byId.get("anthropic/claude-haiku-5-5")!;
  assert.equal(haiku.priceSource, "anthropic");
  assert.deepEqual(haiku.price, {
    input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125,
    tiers: [{ minContext: 100000, input: 0.5, output: 2.5 }],
  });
  assert.equal(haiku.blended, 0.2);
  assert.deepEqual(haiku.hosts, []);
  assert.deepEqual(haiku.capabilities, { reasoning: true, toolCall: true, structuredOutput: true });
  assert.deepEqual(haiku.modalitiesIn, ["text", "image", "pdf"]);
  assert.equal(haiku.context, 1000000);
  assert.equal(haiku.maxOutput, 128000);
  assert.equal(haiku.knowledgeCutoff, "2026-06");
});

test("legacy context_over_200k becomes a tier", () => {
  assert.deepEqual(byId.get("openai/gpt-6.1-sol")!.price.tiers, [{ minContext: 200000, input: 4, output: 15 }]);
  assert.equal(byId.get("openai/gpt-6.1-sol")!.slug, "gpt-6.1-sol");
});

test("host-only models use the cheapest allow-listed host", () => {
  const gemma = byId.get("google/gemma-4-31b-it")!;
  assert.equal(gemma.priceSource, "deepinfra");
  assert.equal(gemma.name, "Gemma 4 31B");
  assert.equal(gemma.blended, 0.19);
  assert.deepEqual(gemma.hosts, [
    { provider: "deepinfra", input: 0.12, output: 0.4 },
    { provider: "togetherai", input: 0.2, output: 0.6 },
  ]);
});

test("zai provider maps to the zhipuai lab and keeps host prices", () => {
  const glm = byId.get("zhipuai/glm-5")!;
  assert.equal(glm.lab, "zhipuai");
  assert.equal(glm.priceSource, "zai");
  assert.deepEqual(glm.hosts, [{ provider: "togetherai", input: 1.1, output: 3.5 }]);
});

test("dated snapshots with identical prices become aliases", () => {
  assert.deepEqual(byId.get("anthropic/claude-opus-4-5")!.aliases, ["claude-opus-4-5-20251101"]);
  assert.equal(byId.has("anthropic/claude-opus-4-5-20251101"), false);
});

test("normalizes partial release dates and status", () => {
  const old = byId.get("anthropic/claude-3-haiku")!;
  assert.equal(old.releaseDate, "2024-03-01");
  assert.equal(old.status, "deprecated");
});

test("slug collisions get a lab suffix on the later id", () => {
  assert.equal(byId.get("mistral/glm-5")!.slug, "glm-5");
  assert.equal(byId.get("zhipuai/glm-5")!.slug, "glm-5-zhipuai");
  assert.equal(new Set(models.map((m) => m.slug)).size, models.length);
});

test("blendedPrice is 3:1 input:output", () => {
  assert.equal(blendedPrice(1, 2), 1.25);
  assert.equal(blendedPrice(0, 4), 1);
});
