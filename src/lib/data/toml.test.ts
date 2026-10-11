import { test } from "node:test";
import assert from "node:assert/strict";

import { parseCostFromToml } from "./toml.ts";

test("reads the [cost] table and ignores tiers and experimental modes", () => {
  const text = `
base_model = "openai/gpt-6.1-sol"

[cost]
input = 2.00
output = 10.00 # list price
cache_read = 0.10

[[cost.tiers]]
tier = { type = "context", size = 272_000 }
input = 4.00
output = 15.00

[experimental.modes.fast]
cost = { input = 4.00, output = 20.00 }
`;
  assert.deepEqual(parseCostFromToml(text), { input: 2, output: 10 });
});

test("reads the legacy inline top-level cost", () => {
  assert.deepEqual(parseCostFromToml(`name = "x"\ncost = { input = 1_000, output = 0.5 }\n[limit]\ncontext = 8\n`), { input: 1000, output: 0.5 });
});

test("returns null without both prices", () => {
  assert.equal(parseCostFromToml(`[cost]\ninput = 1\n`), null);
  assert.equal(parseCostFromToml(`name = "x"`), null);
});
