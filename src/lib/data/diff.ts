import type { Model, ModelEvent, PriceSnapshot } from "./types.ts";

export function pct(before: number, after: number): number {
  if (before === 0) return after === 0 ? 0 : 100;
  return Math.round(((after - before) / before) * 1000) / 10;
}

export function snapshotOf(m: Model): PriceSnapshot {
  return { input: m.price.input, output: m.price.output, blended: m.blended, context: m.context };
}

export function diffSnapshots(prev: Model[], next: Model[], date: string): ModelEvent[] {
  const prevById = new Map(prev.map((m) => [m.id, m]));
  const nextIds = new Set(next.map((m) => m.id));
  const head = (m: Model) => ({ date, id: m.id, lab: m.lab, slug: m.slug, name: m.name });
  const events: ModelEvent[] = [];

  for (const m of next) {
    const p = prevById.get(m.id);
    if (!p) {
      events.push({ ...head(m), type: "new_model", after: snapshotOf(m) });
      continue;
    }
    if (p.price.input !== m.price.input || p.price.output !== m.price.output) {
      events.push({ ...head(m), type: "price_change", before: snapshotOf(p), after: snapshotOf(m), pctChange: pct(p.blended, m.blended) });
    }
    if (p.context !== m.context) {
      events.push({ ...head(m), type: "context_change", before: snapshotOf(p), after: snapshotOf(m) });
    }
    if (p.status !== "deprecated" && m.status === "deprecated") {
      events.push({ ...head(m), type: "deprecated", before: snapshotOf(p), after: snapshotOf(m) });
    }
  }
  for (const p of prev) {
    if (!nextIds.has(p.id)) events.push({ ...head(p), type: "removed", before: snapshotOf(p) });
  }
  return events;
}
