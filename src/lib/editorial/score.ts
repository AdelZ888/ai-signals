import { TIER1_LABS } from "../data/config.ts";
import { daysBetween, isoWeek } from "../data/dates.ts";
import type { Model, ModelEvent } from "../data/types.ts";
import { priceBand, versionOf } from "../site/selection.ts";

export const FLASH_THRESHOLD = 60;
export const MAX_FLASH_PER_WEEK = 4;
const RELIST_MAX_AGE_DAYS = 60;
const SNAPSHOT = /-(\d{8}|\d{4}-\d{2}-\d{2}|\d{4})$/u;
const VARIANT = /(^|-)(free|exp|experimental|preview|batch)($|-)/u;

export type Rival = { id: string; name: string; lab: string; slug: string; blended: number };
export type ScoredEvent = { event: ModelEvent; score: number; reasons: string[]; eligible: boolean; rival: Rival | null };

const rejected = (event: ModelEvent, reason: string): ScoredEvent => ({ event, score: 0, reasons: [reason], eligible: false, rival: null });

/** Most recent tier-1 model from another lab, same price band, more expensive than `blended`. */
function findRival(model: Model, blended: number, models: Model[]): Rival | null {
  const r = models
    .filter(
      (m) =>
        m.lab !== model.lab && TIER1_LABS.has(m.lab) && m.status === "active" &&
        m.capabilities.toolCall === model.capabilities.toolCall &&
        priceBand(m.blended) === priceBand(blended) && m.blended > blended,
    )
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") || a.blended - b.blended || a.id.localeCompare(b.id))[0];
  return r ? { id: r.id, name: r.name, lab: r.lab, slug: r.slug, blended: r.blended } : null;
}

export function scoreEvent(event: ModelEvent, models: Model[], today: string): ScoredEvent {
  if (event.type === "removed") return rejected(event, "removals are digest-only");
  const model = models.find((m) => m.id === event.id);
  if (!model) return rejected(event, "model not in catalog");
  if (model.status === "beta") return rejected(event, "beta model");
  if (SNAPSHOT.test(model.slug) || VARIANT.test(model.slug)) return rejected(event, "snapshot or variant");

  const tier1 = TIER1_LABS.has(model.lab);
  let score = tier1 ? 40 : 15;
  const reasons = [tier1 ? "tier-1 lab +40" : "tier-2 lab +15"];

  if (event.type === "new_model") {
    if (model.releaseDate && daysBetween(model.releaseDate, today) > RELIST_MAX_AGE_DAYS) return rejected(event, "re-listed old model");
    const siblings = models.filter((m) => m.id !== model.id && m.lab === model.lab && model.family !== null && m.family === model.family);
    const version = versionOf(model.slug);
    const siblingMax = Math.max(Number.NEGATIVE_INFINITY, ...siblings.map((s) => versionOf(s.slug) ?? Number.NEGATIVE_INFINITY));
    if (siblings.length === 0 || (version !== null && version > siblingMax)) {
      score += 30;
      reasons.push("new generation +30");
    } else {
      score += 15;
      reasons.push("new variant +15");
    }
  } else if (event.type === "price_change") {
    const change = Math.abs(event.pctChange ?? 0);
    if (change < 10) return rejected(event, "price change under 10%");
    const points = change >= 50 ? 30 : change >= 20 ? 20 : 10;
    score += points;
    reasons.push(`price change ${change}% +${points}`);
  } else if (event.type === "context_change") {
    if (!event.before || !event.after || event.after.context < event.before.context * 2) return rejected(event, "context change under 2x");
    score += 10;
    reasons.push("context x2 +10");
  }

  let rival: Rival | null = null;
  const isCut = event.type === "price_change" && (event.pctChange ?? 0) < 0;
  if ((event.type === "new_model" || isCut) && event.after) {
    rival = findRival(model, event.after.blended, models);
    if (rival) {
      score += 15;
      reasons.push(`undercuts ${rival.name} +15`);
    }
  }
  return { event, score, reasons, eligible: score >= FLASH_THRESHOLD, rival };
}

export function pickFlashEvent(scored: ScoredEvent[], publishedDates: string[], today: string): ScoredEvent | null {
  if (publishedDates.includes(today)) return null;
  const week = isoWeek(today);
  if (publishedDates.filter((d) => isoWeek(d) === week).length >= MAX_FLASH_PER_WEEK) return null;
  return scored.filter((s) => s.eligible).sort((a, b) => b.score - a.score || a.event.id.localeCompare(b.event.id))[0] ?? null;
}
