import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { DATA_LICENSE, datasetRows, toCsv } from "./dataset.ts";

const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 }, modalitiesIn: ["text", "image"] }),
  makeModel({ id: "openai/x", name: 'Odd "name", with comma', status: "deprecated", context: 0 }),
];

test("datasetRows exposes public, indexable models with absolute URLs", () => {
  const rows = datasetRows(models, "https://aisignals.dev");
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", lab: "anthropic", status: "active",
    input_usd_per_1m: 0.1, output_usd_per_1m: 0.5, blended_usd_per_1m: 0.2, context_tokens: 128000, max_output_tokens: 8192,
    release_date: "2026-09-01", input_modalities: "text|image", reasoning: false, tool_calling: true, structured_output: false,
    open_weights: false, url: "https://aisignals.dev/models/anthropic/claude-haiku-5-5",
  });
  assert.match(DATA_LICENSE, /models\.dev/u);
});

test("toCsv quotes fields that need it", () => {
  assert.equal(toCsv([{ a: 1, b: 'x "y", z' }, { a: 2, b: null }]), 'a,b\n1,"x ""y"", z"\n2,\n');
});

test("toCsv neutralizes spreadsheet formulas in text cells", () => {
  assert.equal(toCsv([{ name: "=HYPERLINK(\"https://evil\")", n: -1 }]), 'name,n\n"\'=HYPERLINK(""https://evil"")",-1\n');
  assert.equal(toCsv([{ name: "+cmd", n: 1 }, { name: "a\rb", n: 2 }]), 'name,n\n"\'+cmd",1\n"a\rb",2\n');
});
