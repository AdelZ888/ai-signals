import { LAB_PROVIDER, isLabId } from "./config.ts";
import type { Model } from "./types.ts";

export type GenaiProvider = { id: string; models: { id: string; prices: unknown }[] };

const norm = (s: string) => s.toLowerCase().replace(/\./gu, "-");

function asNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof (v as { base?: unknown }).base === "number") return (v as { base: number }).base;
  return null;
}

/** genai-prices stores either one price object or a list of time-bounded ones (latest last). */
function latestPrices(prices: unknown): Record<string, unknown> | null {
  if (Array.isArray(prices)) {
    const last = prices[prices.length - 1] as { prices?: Record<string, unknown> } | undefined;
    return last?.prices ?? null;
  }
  return prices && typeof prices === "object" ? (prices as Record<string, unknown>) : null;
}

export function crossCheck(models: Model[], genai: GenaiProvider[], tolerancePct = 5): string[] {
  const byProvider = new Map(genai.map((p) => [p.id, new Map(p.models.map((m) => [norm(m.id), m]))]));
  const warnings: string[] = [];
  for (const m of models) {
    if (!isLabId(m.lab) || m.priceSource !== LAB_PROVIDER[m.lab]) continue;
    const match = byProvider.get(m.priceSource)?.get(norm(m.slug));
    const prices = match ? latestPrices(match.prices) : null;
    if (!prices) continue;
    for (const [key, ours] of [["input_mtok", m.price.input], ["output_mtok", m.price.output]] as const) {
      const theirs = asNumber(prices[key]);
      if (theirs === null || ours === 0) continue;
      const diff = (Math.abs(theirs - ours) / ours) * 100;
      if (diff > tolerancePct) warnings.push(`${m.id} ${key}: models.dev=${ours} genai-prices=${theirs} (${diff.toFixed(1)}%)`);
    }
  }
  return warnings;
}
