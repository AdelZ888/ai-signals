import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { appendEvents, readEvents, readLatest, readMeta, writeEvents, writeLatest, writeMeta } from "./store.ts";
import { makeModel } from "./testing.ts";
import type { ModelEvent } from "./types.ts";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "ais-store-"));
const ev = (date: string, id: string): ModelEvent => ({ date, id, lab: "openai", slug: id, name: id, type: "new_model" });

test("latest and meta round-trip, missing files read as null", () => {
  const dir = tmp();
  assert.equal(readLatest(dir), null);
  assert.equal(readMeta(dir), null);
  const models = [makeModel({ id: "openai/a" })];
  writeLatest(dir, models);
  writeMeta(dir, { lastSuccessAt: "2026-10-11T06:00:00.000Z", source: "models.dev", modelCount: 1, lastChangeAt: null });
  assert.deepEqual(readLatest(dir), models);
  assert.equal(readMeta(dir)?.modelCount, 1);
});

test("events are grouped by month and read back in order", () => {
  const dir = tmp();
  appendEvents(dir, [ev("2026-09-30", "a"), ev("2026-10-01", "b")]);
  appendEvents(dir, [ev("2026-10-02", "c")]);
  assert.deepEqual(fs.readdirSync(path.join(dir, "history")).sort(), ["2026-09.jsonl", "2026-10.jsonl"]);
  assert.deepEqual(readEvents(dir).map((e) => e.id), ["a", "b", "c"]);
  assert.deepEqual(readEvents(tmp()), []);
});

test("readEvents skips invalid lines", () => {
  const dir = tmp();
  appendEvents(dir, [ev("2026-10-01", "a")]);
  fs.appendFileSync(path.join(dir, "history", "2026-10.jsonl"), "{not json\n\n");
  appendEvents(dir, [ev("2026-10-02", "b")]);
  assert.deepEqual(readEvents(dir).map((e) => e.id), ["a", "b"]);
});

test("writeEvents replaces the whole history", () => {
  const dir = tmp();
  appendEvents(dir, [ev("2025-01-01", "old")]);
  writeEvents(dir, [ev("2026-10-02", "y"), ev("2026-10-01", "x")]);
  assert.deepEqual(fs.readdirSync(path.join(dir, "history")), ["2026-10.jsonl"]);
  assert.deepEqual(readEvents(dir).map((e) => e.id), ["x", "y"]);
});
