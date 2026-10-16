import type { Model } from "../data/types.ts";
import { fmtTokens, fmtUsd } from "./format.ts";
import { BEST_LISTS, isActive, isIndexable } from "./selection.ts";

const listable = (models: Model[]) => models.filter((m) => isActive(m) && isIndexable(m));
const byBlended = (a: Model, b: Model) => a.blended - b.blended || a.id.localeCompare(b.id);

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const article = (word: string) => (/^[aeiouxAEIOUX]/u.test(word) ? "an" : "a");

export function priceRank(model: Model, models: Model[]): { rank: number; total: number; cheaperThanPct: number } {
  const pool = listable(models);
  const rank = pool.filter((m) => byBlended(m, model) < 0).length + 1;
  const pricier = pool.filter((m) => m.blended > model.blended).length;
  return { rank, total: pool.length, cheaperThanPct: pool.length ? Math.round((pricier / pool.length) * 100) : 0 };
}

export type Ranking = { slug: string; title: string; rank: number; size: number };

/** Rankings (BEST_LISTS) the model appears in, best rank first. */
export function modelRankings(model: Model, models: Model[], today: string): Ranking[] {
  const out: Ranking[] = [];
  for (const list of BEST_LISTS) {
    const entries = list.select(models, today);
    const idx = entries.findIndex((m) => m.id === model.id);
    if (idx >= 0) out.push({ slug: list.slug, title: list.title, rank: idx + 1, size: entries.length });
  }
  return out.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));
}

/** Data-driven summary sentences that make each model page unique and useful. */
export function modelSummary(model: Model, models: Model[], labName: string): string[] {
  const sentences = [
    model.releaseDate
      ? `${model.name} is ${article(labName)} ${labName} model released on ${model.releaseDate}.`
      : `${model.name} is ${article(labName)} ${labName} model.`,
  ];
  const { total, cheaperThanPct } = priceRank(model, models);
  const price = `At ${fmtUsd(model.price.input)} per million input tokens and ${fmtUsd(model.price.output)} per million output tokens, its blended price of ${fmtUsd(model.blended)} per 1M tokens`;
  sentences.push(
    cheaperThanPct > 0
      ? `${price} is lower than ${cheaperThanPct}% of the ${total} models we track.`
      : `${price} makes it one of the most expensive of the ${total} models we track.`,
  );
  const features = [`a ${fmtTokens(model.context)}-token context window`];
  if (model.capabilities.reasoning) features.push("built-in reasoning");
  if (model.capabilities.toolCall) features.push("tool calling");
  if (model.capabilities.structuredOutput) features.push("structured output");
  sentences.push(`It offers ${joinList(model.modalitiesIn)} input, ${joinList(features)}.`);
  if (model.openWeights) {
    sentences.push(
      model.hosts.length > 0
        ? `Its weights are open, and it is available from ${model.hosts.length} tracked hosting providers.`
        : "Its weights are open, so it can also be self-hosted.",
    );
  }
  return sentences;
}

export function providerSummary(labName: string, labModels: Model[]): string {
  const pool = listable(labModels).sort(byBlended);
  if (pool.length === 0) return `${labName} has no active, priced model in our dataset right now.`;
  const cheap = pool[0];
  const dear = pool[pool.length - 1];
  const images = pool.filter((m) => m.modalitiesIn.includes("image")).length;
  const reasoning = pool.filter((m) => m.capabilities.reasoning).length;
  const open = pool.filter((m) => m.openWeights).length;
  const newest = [...pool].filter((m) => m.releaseDate).sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))[0];
  const range =
    pool.length === 1
      ? `${labName} offers 1 model through its API: ${cheap.name} (${fmtUsd(cheap.blended)} blended per 1M tokens).`
      : `${labName} offers ${pool.length} models through its API, from ${cheap.name} (${fmtUsd(cheap.blended)} blended) to ${dear.name} (${fmtUsd(dear.blended)} blended) per 1M tokens.`;
  const caps = `${images} accept image input, ${reasoning} support built-in reasoning${open > 0 ? ` and ${open} have open weights` : ""}.`;
  return [range, caps, newest ? `Its newest is ${newest.name} (${newest.releaseDate}).` : ""].filter(Boolean).join(" ");
}
