import { test } from "node:test";
import assert from "node:assert/strict";

import { checkGrounding, checkLinks, extractNumbers, pickTitle } from "./guards.ts";
import type { FactSheet } from "./factsheet.ts";

const facts = {
  eventType: "price_change", date: "2026-10-09",
  model: { name: "Claude Haiku 5.5", lab: "Anthropic", url: "/models/anthropic/claude-haiku-5-5", input: 0.1, output: 0.5, blended: 0.2, context: 1_000_000, maxOutput: 128_000, releaseDate: "2026-10-07", openWeights: false, reasoning: true, toolCall: true, vision: true, diffPctVsSubject: 0, subjectVsThisPct: 0 },
  before: { input: 0.125, output: 0.625, blended: 0.25, context: 1_000_000 }, pctChange: -20,
  rival: { name: "Gemini 3.8 Flash Lite", url: "/models/google/gemini-3-8-flash-lite", blended: 0.4375, diffPctVsSubject: 118.8, subjectVsThisPct: -54.3 },
  competitors: [], scenarios: [{ label: "Chatbot", inputTokensM: 10, outputTokensM: 2, cost: 2, competitorCosts: [] }],
  isCheapestInClass: false,
} as unknown as FactSheet;

test("extractNumbers reads prices, percents, token counts and dates", () => {
  assert.deepEqual(extractNumbers("Costs $1,234.50 and 20% (10M/2M) on 2026-10-07"), [1234.5, 20, 10, 2, 2026, 10, 7]);
});

test("checkGrounding accepts numbers from the facts and rejects invented ones", () => {
  assert.deepEqual(checkGrounding("Claude Haiku 5.5 now costs $0.10 / $0.50, 54% cheaper than rivals, 1M context, from $0.13 before.", facts), { ok: true, unknown: [] });
  assert.deepEqual(checkGrounding("It scores 87.5 on MMLU and costs $0.10.", facts), { ok: false, unknown: [87.5] });
});

test("pickTitle filters hype, invented numbers, missing names and false superlatives", () => {
  const titles = [
    "Claude Haiku 5.5 Is INSANE!",
    "Anthropic cuts prices again",
    "Claude Haiku 5.5 Drops 35% Overnight",
    "Claude Haiku 5.5 Becomes the Cheapest Model Around",
    "Claude Haiku 5.5 Price Cut: 20% Lower",
    "Claude Haiku 5.5 Cuts Prices 20%, Now Cheaper Than Gemini 3.8 Flash Lite",
  ];
  assert.equal(pickTitle(titles, facts), "Claude Haiku 5.5 Cuts Prices 20%, Now Cheaper Than Gemini 3.8 Flash Lite");
  assert.equal(pickTitle(["nothing usable!"], facts), null);
});

test("checkLinks only allows internal links that exist in the facts", () => {
  assert.deepEqual(checkLinks("See [Claude Haiku 5.5](/models/anthropic/claude-haiku-5-5).", facts), { ok: true, bad: [] });
  assert.deepEqual(checkLinks("[phish](https://evil.example/login) and [x](/models/fake/one)", facts), { ok: false, bad: ["https://evil.example/login", "/models/fake/one"] });
  assert.deepEqual(checkLinks("Visit https://evil.example now", facts), { ok: false, bad: ["https://evil.example"] });
  assert.deepEqual(checkLinks("<img src=x onerror=alert(1)>", facts), { ok: false, bad: ["<img"] });
  assert.deepEqual(checkLinks("No links at all.", {}), { ok: true, bad: [] });
});
