import { DEFAULT_DATA_DIR, readMeta } from "../../src/lib/data/store.ts";
import { staleness } from "./staleness.ts";

const result = staleness(readMeta(DEFAULT_DATA_DIR), new Date());
if (result.stale) {
  console.error(`[staleness] data is stale: last successful refresh ${result.hours ?? "unknown"} hours ago (limit 72)`);
  process.exit(1);
}
console.log(`[staleness] ok: last successful refresh ${result.hours} hours ago`);
process.exit(0);
