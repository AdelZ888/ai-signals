import { test } from "node:test";
import assert from "node:assert/strict";

import { crossCheck, type GenaiProvider } from "./crosscheck.ts";
import { makeModel } from "./testing.ts";

const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", price: { input: 0.1, output: 0.5 } }),
  makeModel({ id: "openai/gpt-6.1-sol", price: { input: 2, output: 10 } }),
  makeModel({ id: "google/gemma-4-31b-it", priceSource: "deepinfra", price: { input: 0.12, output: 0.4 } }),
];

const genai: GenaiProvider[] = [
  { id: "anthropic", models: [{ id: "claude-haiku-5.5", prices: { input_mtok: 0.1, output_mtok: 0.55 } }] },
  {
    id: "openai",
    models: [{
      id: "gpt-6.1-sol",
      prices: [
        { constraint: { start_date: "2026-01-01" }, prices: { input_mtok: 1, output_mtok: 10 } },
        { prices: { input_mtok: 2.04, output_mtok: { base: 10 } } },
      ],
    }],
  },
  { id: "google", models: [{ id: "gemma-4-31b-it", prices: { input_mtok: 9, output_mtok: 9 } }] },
];

test("warns only on first-party prices that differ by more than 5%", () => {
  const warnings = crossCheck(models, genai);
  assert.deepEqual(warnings, [
    "anthropic/claude-haiku-5-5 output_mtok: models.dev=0.5 genai-prices=0.55 (10.0%)",
  ]);
});
