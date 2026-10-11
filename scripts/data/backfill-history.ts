import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { timelineToEvents, type CostPoint } from "../../src/lib/data/backfill.ts";
import { LAB_PROVIDER, isLabId } from "../../src/lib/data/config.ts";
import { DEFAULT_DATA_DIR, readEvents, readLatest, readMeta, writeEvents, writeMeta } from "../../src/lib/data/store.ts";
import { parseCostFromToml } from "../../src/lib/data/toml.ts";
import type { ModelEvent } from "../../src/lib/data/types.ts";

const REPO_URL = "https://github.com/sst/models.dev.git";

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
}

function ensureRepo(): string {
  if (process.env.MODELS_DEV_REPO) return process.env.MODELS_DEV_REPO;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "modelsdev-"));
  console.log(`[backfill] cloning ${REPO_URL} into ${tmp}`);
  git(tmp, ["clone", "--quiet", REPO_URL, "repo"]);
  return path.join(tmp, "repo");
}

function main(): number {
  const dir = process.env.DATA_DIR ?? DEFAULT_DATA_DIR;
  const models = readLatest(dir);
  if (!models) {
    console.error("[backfill] data/models/latest.json missing: run `npm run refresh-data` first");
    return 1;
  }
  const repo = ensureRepo();
  const backfilled: ModelEvent[] = [];
  let withHistory = 0;

  for (const m of models) {
    if (!isLabId(m.lab) || m.priceSource !== LAB_PROVIDER[m.lab]) continue;
    const rel = `providers/${LAB_PROVIDER[m.lab]}/models/${m.id.slice(m.lab.length + 1)}.toml`;
    const log = git(repo, ["log", "--format=%H %cs", "--", rel]).trim();
    if (!log) continue;
    const points: CostPoint[] = [];
    for (const line of log.split("\n").reverse()) {
      const [sha, date] = line.split(" ");
      let text: string;
      try {
        text = git(repo, ["show", `${sha}:${rel}`]);
      } catch {
        continue; // file deleted in this commit
      }
      const cost = parseCostFromToml(text);
      if (cost) points.push({ date, ...cost });
    }
    const events = timelineToEvents(m, points);
    if (events.length > 0) withHistory += 1;
    backfilled.push(...events);
  }

  const live = readEvents(dir);
  const cutoff = live.length > 0 ? live.map((e) => e.date).sort()[0] : "9999-12-31";
  const merged = [...backfilled.filter((e) => e.date < cutoff), ...live];
  writeEvents(dir, merged);

  const meta = readMeta(dir);
  const lastChangeAt = merged.map((e) => e.date).sort().at(-1) ?? null;
  if (meta) writeMeta(dir, { ...meta, lastChangeAt });

  console.log(`[backfill] models with history=${withHistory} events=${backfilled.length} total=${merged.length}`);
  return 0;
}

try {
  process.exit(main());
} catch (error) {
  console.error("[backfill] failed:", error);
  process.exit(1);
}
