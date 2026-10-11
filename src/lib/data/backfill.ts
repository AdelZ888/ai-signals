import { daysBetween } from "./dates.ts";
import { pct } from "./diff.ts";
import { blendedPrice } from "./normalize.ts";
import type { Model, ModelEvent, PriceSnapshot } from "./types.ts";

export type CostPoint = { date: string; input: number; output: number };

/** A model added to models.dev more than this many days after release has no trustworthy launch price. */
const LAUNCH_WINDOW_DAYS = 14;

export function timelineToEvents(
  model: Pick<Model, "id" | "lab" | "slug" | "name" | "context" | "releaseDate">,
  points: CostPoint[],
): ModelEvent[] {
  const byDate: CostPoint[] = [];
  for (const p of [...points].sort((a, b) => a.date.localeCompare(b.date))) {
    if (byDate.length > 0 && byDate[byDate.length - 1].date === p.date) byDate[byDate.length - 1] = p;
    else byDate.push(p);
  }
  const clean = byDate.filter((p, i) => i === 0 || p.input !== byDate[i - 1].input || p.output !== byDate[i - 1].output);

  const snap = (p: CostPoint): PriceSnapshot => ({ input: p.input, output: p.output, blended: blendedPrice(p.input, p.output), context: model.context });
  const head = { id: model.id, lab: model.lab, slug: model.slug, name: model.name };
  const events: ModelEvent[] = [];

  clean.forEach((p, i) => {
    if (i === 0) {
      const nearLaunch = !model.releaseDate || daysBetween(model.releaseDate, p.date) <= LAUNCH_WINDOW_DAYS;
      if (nearLaunch) events.push({ ...head, date: p.date, type: "new_model", after: snap(p) });
      return;
    }
    const before = snap(clean[i - 1]);
    const after = snap(p);
    events.push({ ...head, date: p.date, type: "price_change", before, after, pctChange: pct(before.blended, after.blended) });
  });
  return events;
}
