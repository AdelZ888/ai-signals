import { GUARDS } from "./config.ts";
import type { Model } from "./types.ts";

/** Returns a list of blocking problems; an empty list means the snapshot can be written. */
export function validateSnapshot(prev: Model[] | null, next: Model[]): string[] {
  if (next.length === 0) return ["snapshot is empty"];
  const errors: string[] = [];

  for (const m of next) {
    for (const [field, value] of [["input", m.price.input], ["output", m.price.output]] as const) {
      if (!Number.isFinite(value) || value < 0) errors.push(`${m.id}: invalid ${field} price ${value}`);
      else if (value > GUARDS.maxPricePerM) errors.push(`${m.id}: ${field} price ${value} exceeds ${GUARDS.maxPricePerM}`);
    }
  }

  if (prev && prev.length > 0) {
    const dropPct = ((prev.length - next.length) / prev.length) * 100;
    if (dropPct > GUARDS.maxCountDropPct) {
      errors.push(`model count dropped ${dropPct.toFixed(1)}% (${prev.length} -> ${next.length})`);
    }
    const prevById = new Map(prev.map((m) => [m.id, m]));
    const common = next.filter((m) => prevById.has(m.id));
    const changed = common.filter((m) => {
      const p = prevById.get(m.id);
      return p !== undefined && (p.price.input !== m.price.input || p.price.output !== m.price.output);
    });
    if (common.length >= GUARDS.minCommonForChangeCheck) {
      const changedPct = (changed.length / common.length) * 100;
      if (changedPct > GUARDS.maxChangedPct) errors.push(`${changedPct.toFixed(1)}% of models changed price in one run`);
    }
  }
  return errors;
}
