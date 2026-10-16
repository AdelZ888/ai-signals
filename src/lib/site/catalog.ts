import path from "node:path";

import { HOST_NAMES, LAB_NAMES, LAB_PROVIDER, isLabId } from "../data/config.ts";
import { readEvents, readLatest, readMeta, readPairs } from "../data/store.ts";
import type { Meta, Model, ModelEvent } from "../data/types.ts";
import { isActive, isIndexable, stablePairs, type Pair } from "./selection.ts";

export type Catalog = { models: Model[]; events: ModelEvent[]; meta: Meta | null; today: string; publishedPairs: string[] };

let cached: Catalog | null = null;

/** Reads data/models once per process. `today` is the last successful refresh, so builds are reproducible. */
export function getCatalog(): Catalog {
  if (cached) return cached;
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data", "models");
  const meta = readMeta(dir);
  cached = {
    models: readLatest(dir) ?? [],
    events: readEvents(dir),
    meta,
    today: (meta?.lastSuccessAt ?? new Date().toISOString()).slice(0, 10),
    publishedPairs: readPairs(dir),
  };
  return cached;
}

let pairsCache: Pair[] | null = null;

/** Comparison pages: today's selection plus every previously published pair (stable URLs). */
export function getPairs(): Pair[] {
  if (pairsCache) return pairsCache;
  const { models, today, publishedPairs } = getCatalog();
  pairsCache = stablePairs(models, today, publishedPairs);
  return pairsCache;
}

export function findModel(lab: string, slug: string): Model | null {
  return getCatalog().models.find((m) => m.lab === lab && m.slug === slug) ?? null;
}

export const labName = (lab: string) => (isLabId(lab) ? LAB_NAMES[lab] : lab);

const PROVIDER_LAB = new Map(Object.entries(LAB_PROVIDER).map(([lab, provider]) => [provider, lab]));
export function hostName(provider: string): string {
  return HOST_NAMES[provider] ?? labName(PROVIDER_LAB.get(provider) ?? provider);
}

export const isFirstPartyPrice = (m: Model) => isLabId(m.lab) && m.priceSource === LAB_PROVIDER[m.lab];

export function recentEvents(events: ModelEvent[], n: number): ModelEvent[] {
  return [...events].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)).slice(0, n);
}

export type LabSummary = { lab: string; name: string; models: Model[]; minBlended: number; maxBlended: number };

export function labSummaries(models: Model[]): LabSummary[] {
  const byLab = new Map<string, Model[]>();
  for (const m of models) if (isActive(m) && isIndexable(m)) byLab.set(m.lab, [...(byLab.get(m.lab) ?? []), m]);
  return [...byLab.entries()]
    .map(([lab, list]) => ({
      lab,
      name: labName(lab),
      models: list,
      minBlended: Math.min(...list.map((m) => m.blended)),
      maxBlended: Math.max(...list.map((m) => m.blended)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
