import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { compareVerdict } from "./verdict.ts";

test("verdict states price, context and capability differences", () => {
  const a = makeModel({
    id: "openai/a", name: "A", price: { input: 1, output: 1 }, context: 128_000, modalitiesIn: ["text", "image"],
    capabilities: { reasoning: true, toolCall: true, structuredOutput: false },
  });
  const b = makeModel({ id: "google/b", name: "B", price: { input: 4, output: 4 }, context: 1_000_000 });
  assert.deepEqual(compareVerdict(a, b), [
    "A is 75% cheaper than B on a blended 3:1 input/output basis.",
    "B has the larger context window (1M vs 128K tokens).",
    "Only A supports built-in reasoning.",
    "Only A accepts image input.",
  ]);
});

test("identical models get a single neutral line", () => {
  const a = makeModel({ id: "openai/a", name: "A" });
  const b = makeModel({ id: "google/b", name: "B" });
  assert.deepEqual(compareVerdict(a, b), ["A and B have the same blended price."]);
});
