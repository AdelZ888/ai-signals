import { GENAI_PRICES_URL, MODELS_DEV_URL } from "../../src/lib/data/config.ts";
import { crossCheck, type GenaiProvider } from "../../src/lib/data/crosscheck.ts";
import { diffSnapshots } from "../../src/lib/data/diff.ts";
import { normalizeModelsDev, type RawModelsDev } from "../../src/lib/data/normalize.ts";
import { DEFAULT_DATA_DIR, appendEvents, readLatest, readMeta, writeLatest, writeMeta } from "../../src/lib/data/store.ts";
import { validateSnapshot } from "../../src/lib/data/validate.ts";

const USER_AGENT = "aisignals-bot/2.0 (+https://aisignals.dev/about)";

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { "user-agent": USER_AGENT } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function main(): Promise<number> {
  const dir = process.env.DATA_DIR ?? DEFAULT_DATA_DIR;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const next = normalizeModelsDev((await fetchJson(MODELS_DEV_URL)) as RawModelsDev);
  const prev = readLatest(dir);
  const errors = validateSnapshot(prev, next);
  if (errors.length > 0) {
    console.error(`[refresh] guard failed, nothing written:\n${errors.slice(0, 20).join("\n")}`);
    return 1;
  }

  try {
    const genai = (await fetchJson(GENAI_PRICES_URL)) as GenaiProvider[];
    for (const warning of crossCheck(next, genai)) console.warn(`[refresh] crosscheck: ${warning}`);
  } catch (error) {
    console.warn(`[refresh] crosscheck skipped: ${(error as Error).message}`);
  }

  // First run only sets the baseline; history comes from the backfill.
  const events = prev ? diffSnapshots(prev, next, today) : [];
  writeLatest(dir, next);
  appendEvents(dir, events);
  writeMeta(dir, {
    lastSuccessAt: now,
    source: "models.dev",
    modelCount: next.length,
    lastChangeAt: events.length > 0 ? today : (readMeta(dir)?.lastChangeAt ?? null),
  });
  console.log(`[refresh] models=${next.length} events=${events.length}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[refresh] failed:", error);
    process.exit(1);
  },
);
