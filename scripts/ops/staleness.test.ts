import { test } from "node:test";
import assert from "node:assert/strict";

import { staleness } from "./staleness.ts";

const now = new Date("2026-10-11T12:00:00Z");

test("fresh, stale, missing and broken metadata", () => {
  assert.deepEqual(staleness({ lastSuccessAt: "2026-10-11T06:00:00Z" }, now), { stale: false, hours: 6 });
  assert.deepEqual(staleness({ lastSuccessAt: "2026-10-08T06:00:00Z" }, now), { stale: true, hours: 78 });
  assert.deepEqual(staleness(null, now), { stale: true, hours: null });
  assert.equal(staleness({ lastSuccessAt: "garbage" }, now).stale, true);
});
