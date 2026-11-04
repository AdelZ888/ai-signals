import { DEFAULT_DATA_DIR, DEFAULT_INDEX_DIR, readIndexSnapshots, readLatest, writeIndexSnapshot } from "../../src/lib/data/store.ts";
import { indexRows, monthToClose } from "../../src/lib/site/price-index.ts";

/** Below this, something is wrong with the catalog: better to fail than to freeze a bad month forever. */
const MIN_ROWS = 100;

/** Runs before the daily refresh, so `latest.json` still holds the catalog as it stood at the end of the month. */
function main(): number {
  const today = process.env.INDEX_CLOSE_DATE ?? new Date().toISOString().slice(0, 10);
  const month = monthToClose(today, readIndexSnapshots(DEFAULT_INDEX_DIR).map((s) => s.month));
  if (!month) {
    console.log(`[price-index] nothing to close on ${today}`);
    return 0;
  }
  const rows = indexRows(readLatest(DEFAULT_DATA_DIR) ?? []);
  if (rows.length < MIN_ROWS) {
    console.error(`[price-index] refusing to freeze ${month}: only ${rows.length} rows`);
    return 1;
  }
  writeIndexSnapshot(DEFAULT_INDEX_DIR, { month, rows });
  console.log(`[price-index] froze ${month}: ${rows.length} models`);
  return 0;
}

process.exit(main());
