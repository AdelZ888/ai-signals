import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { badgeSvg, badgeValue } from "./badge.ts";

test("badgeValue shows the live price per 1M tokens", () => {
  const m = makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 } });
  assert.equal(badgeValue(m), "Claude Haiku 5.5 · $0.10 in / $0.50 out per 1M");
});

test("badgeSvg is a valid, escaped SVG sized to its text", () => {
  const svg = badgeSvg("AI Signals", "A & <B>");
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="20"/u);
  assert.match(svg, /A &amp; &lt;B&gt;/u);
  assert.doesNotMatch(svg, /<B>/u);
  const short = Number(badgeSvg("x", "y").match(/width="(\d+)"/u)?.[1]);
  const long = Number(badgeSvg("x", "a much longer value").match(/width="(\d+)"/u)?.[1]);
  assert.ok(long > short);
});
