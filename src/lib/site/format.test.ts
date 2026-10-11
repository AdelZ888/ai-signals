import { test } from "node:test";
import assert from "node:assert/strict";

import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost, monthYear } from "./format.ts";
import { modelUrl, ogImageUrl } from "./urls.ts";

test("fmtUsd keeps small values precise", () => {
  assert.equal(fmtUsd(0.1), "$0.10");
  assert.equal(fmtUsd(2), "$2.00");
  assert.equal(fmtUsd(0.0375), "$0.0375");
  assert.equal(fmtUsd(0.01), "$0.01");
  assert.equal(fmtUsd(0.012345), "$0.0123");
  assert.equal(fmtUsd(0), "$0");
  assert.equal(fmtUsd(Number.NaN), "—");
});

test("fmtUsdCost rounds large monthly costs", () => {
  assert.equal(fmtUsdCost(10), "$10.00");
  assert.equal(fmtUsdCost(0.5), "$0.50");
  assert.equal(fmtUsdCost(1234.56), "$1,235");
});

test("fmtTokens uses K and M", () => {
  assert.equal(fmtTokens(1_000_000), "1M");
  assert.equal(fmtTokens(1_048_576), "1.05M");
  assert.equal(fmtTokens(128_000), "128K");
  assert.equal(fmtTokens(65_536), "65.5K");
  assert.equal(fmtTokens(512), "512");
  assert.equal(fmtTokens(null), "—");
  assert.equal(fmtTokens(0), "—");
});

test("fmtPct and monthYear", () => {
  assert.equal(fmtPct(-20), "−20%");
  assert.equal(fmtPct(5), "+5%");
  assert.equal(fmtPct(0), "0%");
  assert.equal(monthYear("2026-10-11"), "Oct 2026");
});

test("urls", () => {
  assert.equal(modelUrl({ lab: "openai", slug: "gpt-6.1-sol" }), "/models/openai/gpt-6.1-sol");
  assert.equal(ogImageUrl("A & B", "x"), "/api/og?title=A+%26+B&subtitle=x");
});
