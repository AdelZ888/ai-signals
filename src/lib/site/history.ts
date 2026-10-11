import { addDays } from "../data/dates.ts";
import { pct } from "../data/diff.ts";
import { blendedPrice } from "../data/normalize.ts";
import type { Model, ModelEvent } from "../data/types.ts";

export type PricePoint = { date: string; input: number; output: number };

export function priceHistory(model: Model, events: ModelEvent[], today: string): PricePoint[] {
  const own = events
    .filter((e) => e.id === model.id && (e.type === "new_model" || e.type === "price_change"))
    .sort((a, b) => a.date.localeCompare(b.date));
  const release = model.releaseDate;
  const points: PricePoint[] = [];

  for (const e of own) {
    if (!e.after) continue;
    if (points.length === 0 && e.type === "price_change" && e.before) {
      points.push({ date: release && release < e.date ? release : e.date, input: e.before.input, output: e.before.output });
    }
    points.push({ date: e.date, input: e.after.input, output: e.after.output });
  }
  if (points.length === 0) {
    points.push({ date: release && release < today ? release : today, input: model.price.input, output: model.price.output });
  }
  points.push({ date: today, input: model.price.input, output: model.price.output });

  const out: PricePoint[] = [];
  for (const p of points) {
    if (out.length > 0 && out[out.length - 1].date === p.date) out[out.length - 1] = p;
    else out.push(p);
  }
  return out;
}

/** Percent change of the blended price over 30 days, or null when unknown or unchanged. */
export function change30d(model: Model, events: ModelEvent[], today: string): number | null {
  const cutoff = addDays(today, -30);
  const past = priceHistory(model, events, today).filter((p) => p.date <= cutoff).at(-1);
  if (!past) return null;
  const before = blendedPrice(past.input, past.output);
  return before === model.blended ? null : pct(before, model.blended);
}
