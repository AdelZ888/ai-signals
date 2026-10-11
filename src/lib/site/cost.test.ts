import { test } from "node:test";
import assert from "node:assert/strict";

import { SCENARIOS, monthlyCost, parseTokenInput } from "./cost.ts";

test("monthlyCost uses USD per 1M tokens", () => {
  assert.equal(monthlyCost({ input: 0.1, output: 0.5 }, 50_000_000, 10_000_000), 10);
  assert.equal(monthlyCost({ input: 2, output: 10 }, 0, 0), 0);
  assert.equal(SCENARIOS.length, 3);
});

test("parseTokenInput clamps garbage", () => {
  assert.equal(parseTokenInput("50"), 50);
  assert.equal(parseTokenInput(" 2.5 "), 2.5);
  assert.equal(parseTokenInput("1,000"), 1000);
  assert.equal(parseTokenInput("abc"), 0);
  assert.equal(parseTokenInput("-5"), 0);
  assert.equal(parseTokenInput(""), 0);
  assert.equal(parseTokenInput("1e99"), 1_000_000);
});
