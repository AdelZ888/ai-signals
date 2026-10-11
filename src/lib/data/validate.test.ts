import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "./testing.ts";
import { validateSnapshot } from "./validate.ts";

const base = Array.from({ length: 10 }, (_, i) => makeModel({ id: `openai/m${i}` }));

test("accepts a sane snapshot", () => {
  assert.deepEqual(validateSnapshot(base, base), []);
  assert.deepEqual(validateSnapshot(null, base), []);
});

test("rejects an empty snapshot", () => {
  assert.deepEqual(validateSnapshot(base, []), ["snapshot is empty"]);
});

test("rejects invalid and absurd prices", () => {
  const errors = validateSnapshot(null, [
    makeModel({ id: "openai/neg", price: { input: -1, output: 2 } }),
    makeModel({ id: "openai/huge", price: { input: 1, output: 5000 } }),
    makeModel({ id: "openai/nan", price: { input: Number.NaN, output: 1 } }),
  ]);
  assert.equal(errors.length, 3);
  assert.match(errors[0], /openai\/neg: invalid input price -1/);
  assert.match(errors[1], /openai\/huge: output price 5000 exceeds 1000/);
  assert.match(errors[2], /openai\/nan: invalid input price NaN/);
});

test("rejects a large drop in model count", () => {
  assert.match(validateSnapshot(base, base.slice(0, 7)).join("\n"), /model count dropped 30\.0% \(10 -> 7\)/);
});

test("rejects mass price changes but allows a few", () => {
  const reprice = (n: number) => base.map((m, i) => (i < n ? makeModel({ id: m.id, price: { input: 9, output: 9 } }) : m));
  assert.match(validateSnapshot(base, reprice(4)).join("\n"), /40\.0% of models changed price/);
  assert.deepEqual(validateSnapshot(base, reprice(3)), []);
});
