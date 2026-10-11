import fs from "node:fs";
import path from "node:path";

import type { Meta, Model, ModelEvent } from "./types.ts";

export const DEFAULT_DATA_DIR = path.join(process.cwd(), "data", "models");
const MONTH_FILE = /^\d{4}-\d{2}\.jsonl$/u;

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function writeJsonAtomic(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

export const readLatest = (dir: string) => readJson<Model[]>(path.join(dir, "latest.json"));
export const writeLatest = (dir: string, models: Model[]) => writeJsonAtomic(path.join(dir, "latest.json"), models);
export const readMeta = (dir: string) => readJson<Meta>(path.join(dir, "meta.json"));
export const writeMeta = (dir: string, meta: Meta) => writeJsonAtomic(path.join(dir, "meta.json"), meta);

export function readEvents(dir: string): ModelEvent[] {
  const historyDir = path.join(dir, "history");
  let files: string[];
  try {
    files = fs.readdirSync(historyDir).filter((f) => MONTH_FILE.test(f)).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const events: ModelEvent[] = [];
  for (const file of files) {
    for (const line of fs.readFileSync(path.join(historyDir, file), "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        events.push(JSON.parse(trimmed) as ModelEvent);
      } catch {
        console.warn(`[store] skipped invalid line in ${file}`);
      }
    }
  }
  return events;
}

export function appendEvents(dir: string, events: ModelEvent[]): void {
  const historyDir = path.join(dir, "history");
  const byMonth = new Map<string, ModelEvent[]>();
  for (const e of events) byMonth.set(e.date.slice(0, 7), [...(byMonth.get(e.date.slice(0, 7)) ?? []), e]);
  fs.mkdirSync(historyDir, { recursive: true });
  for (const [month, list] of byMonth) {
    fs.appendFileSync(path.join(historyDir, `${month}.jsonl`), `${list.map((e) => JSON.stringify(e)).join("\n")}\n`);
  }
}

export function writeEvents(dir: string, events: ModelEvent[]): void {
  const historyDir = path.join(dir, "history");
  if (fs.existsSync(historyDir)) {
    for (const f of fs.readdirSync(historyDir)) if (MONTH_FILE.test(f)) fs.rmSync(path.join(historyDir, f));
  }
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id) || a.type.localeCompare(b.type));
  appendEvents(dir, sorted);
}
