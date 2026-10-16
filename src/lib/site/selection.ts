import { TIER1_LABS } from "../data/config.ts";
import { daysBetween } from "../data/dates.ts";
import type { Model } from "../data/types.ts";

export const NOTABLE_MAX_AGE_DAYS = 548;
export const NEW_MODEL_DAYS = 90;
export const PAIR_CAP = 300;
export const MIN_LIST_SIZE = 5;
const LIST_SIZE = 20;

export const isActive = (m: Model) => m.status === "active";
export const isIndexable = (m: Model) => m.context > 0 && (m.price.input > 0 || m.price.output > 0);

export function priceBand(blended: number): 0 | 1 | 2 {
  if (blended < 0.5) return 0;
  return blended <= 3 ? 1 : 2;
}

export function versionOf(slug: string): number | null {
  const m = slug.match(/(\d+)(?:[.-](\d+)(?!\d*[a-z]))?/iu);
  if (!m) return null;
  return Number(m[2] === undefined ? m[1] : `${m[1]}.${m[2]}`);
}

const ratioDistance = (a: number, b: number) => Math.abs(Math.log(Math.max(a, 1e-6)) - Math.log(Math.max(b, 1e-6)));
const byBlended = (a: Model, b: Model) => a.blended - b.blended || a.id.localeCompare(b.id);
const byNewest = (a: Model, b: Model) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") || a.id.localeCompare(b.id);
const listable = (models: Model[]) => models.filter((m) => isActive(m) && isIndexable(m));

export function alternatives(model: Model, models: Model[], n = 5): Model[] {
  return listable(models)
    .filter(
      (c) =>
        c.id !== model.id &&
        model.modalitiesIn.every((x) => c.modalitiesIn.includes(x)) &&
        (!model.capabilities.toolCall || c.capabilities.toolCall) &&
        (!model.capabilities.reasoning || c.capabilities.reasoning) &&
        c.context >= model.context * 0.5,
    )
    .sort(byBlended)
    .slice(0, n);
}

export function nearestCompetitors(model: Model, models: Model[], n = 3): Model[] {
  return listable(models)
    .filter((c) => c.lab !== model.lab && c.capabilities.toolCall === model.capabilities.toolCall)
    .sort((a, b) => ratioDistance(a.blended, model.blended) - ratioDistance(b.blended, model.blended) || a.id.localeCompare(b.id))
    .slice(0, n);
}

export function predecessor(model: Model, models: Model[]): Model | null {
  const release = model.releaseDate;
  if (!model.family || !release) return null;
  const older = models.filter(
    (m) => m.id !== model.id && m.lab === model.lab && m.family === model.family && m.releaseDate !== null && m.releaseDate < release && isIndexable(m),
  );
  return older.sort(byNewest)[0] ?? null;
}

export function notablePool(models: Model[], today: string, perFamily = 2): Model[] {
  const groups = new Map<string, Model[]>();
  for (const m of listable(models)) {
    if (m.releaseDate === null || daysBetween(m.releaseDate, today) > NOTABLE_MAX_AGE_DAYS) continue;
    const key = `${m.lab}:${m.family ?? m.id}`;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  return [...groups.values()].flatMap((list) => list.sort(byNewest).slice(0, perFamily)).sort((a, b) => a.id.localeCompare(b.id));
}

export type Pair = { key: string; a: Model; b: Model };

export function makePair(x: Model, y: Model): Pair {
  const [a, b] = x.slug < y.slug ? [x, y] : [y, x];
  return { key: `${a.slug}-vs-${b.slug}`, a, b };
}

export function comparisonPairs(models: Model[], today: string, cap = PAIR_CAP): Pair[] {
  const pool = notablePool(models, today);
  const out = new Map<string, Pair>();
  const add = (p: Pair) => {
    if (out.size < cap && p.a.id !== p.b.id && !out.has(p.key)) out.set(p.key, p);
  };

  const newest = pool.filter((m) => m.releaseDate !== null && daysBetween(m.releaseDate, today) <= NEW_MODEL_DAYS).sort(byNewest);
  for (const m of newest) {
    const pred = predecessor(m, models);
    if (pred) add(makePair(m, pred));
    for (const c of nearestCompetitors(m, pool, 3)) add(makePair(m, c));
  }

  const tier = (p: Pair) => Number(TIER1_LABS.has(p.a.lab)) + Number(TIER1_LABS.has(p.b.lab));
  const band: Pair[] = [];
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      if (pool[i].lab !== pool[j].lab && priceBand(pool[i].blended) === priceBand(pool[j].blended)) band.push(makePair(pool[i], pool[j]));
    }
  }
  band.sort((p, q) => tier(q) - tier(p) || ratioDistance(p.a.blended, p.b.blended) - ratioDistance(q.a.blended, q.b.blended) || p.key.localeCompare(q.key));
  for (const p of band) add(p);
  return [...out.values()];
}

/** Resolves "a-vs-b" (slugs may contain dashes) against the catalog. */
export function parsePairKey(key: string, bySlug: Map<string, Model>): Pair | null {
  let at = key.indexOf("-vs-");
  while (at !== -1) {
    const a = bySlug.get(key.slice(0, at));
    const b = bySlug.get(key.slice(at + 4));
    if (a && b && a.id !== b.id) return makePair(a, b);
    at = key.indexOf("-vs-", at + 1);
  }
  return null;
}

/**
 * Today's selection first, then every previously published pair whose two models still have a page:
 * a comparison URL never disappears just because the selection rules moved on.
 */
export function stablePairs(models: Model[], today: string, published: string[]): Pair[] {
  const out = new Map(comparisonPairs(models, today).map((p) => [p.key, p]));
  const bySlug = new Map(models.filter(isIndexable).map((m) => [m.slug, m]));
  for (const key of published) {
    const pair = parsePairKey(key, bySlug);
    if (pair && !out.has(pair.key)) out.set(pair.key, pair);
  }
  return [...out.values()];
}

export type BestList = { slug: string; title: string; description: string; select: (models: Model[], today: string) => Model[] };

const cheapest = (models: Model[]) => [...models].sort(byBlended).slice(0, LIST_SIZE);
const hasImage = (m: Model) => m.modalitiesIn.includes("image");

export const BEST_LISTS: BestList[] = [
  { slug: "cheapest-llm-api", title: "Cheapest LLM APIs", description: "The lowest blended price per million tokens across every tracked model.", select: (ms) => cheapest(listable(ms)) },
  { slug: "cheapest-vision-model", title: "Cheapest Vision Models", description: "Models that accept image input, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter(hasImage)) },
  { slug: "cheapest-reasoning-model", title: "Cheapest Reasoning Models", description: "Models with built-in reasoning, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.capabilities.reasoning)) },
  { slug: "longest-context-window", title: "AI Models With the Longest Context Window", description: "Models ranked by maximum context length, cheapest first on ties.", select: (ms) => listable(ms).sort((a, b) => b.context - a.context || byBlended(a, b)).slice(0, LIST_SIZE) },
  { slug: "cheapest-1m-context-model", title: "Cheapest Models With a 1M-Token Context", description: "Models with at least one million tokens of context, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.context >= 1_000_000)) },
  { slug: "best-open-weights-models", title: "Cheapest Open-Weights Models", description: "Open-weights models ranked by the cheapest tracked price.", select: (ms) => cheapest(listable(ms).filter((m) => m.openWeights)) },
  { slug: "cheapest-tool-calling-model", title: "Cheapest Models With Tool Calling", description: "Models that support function and tool calling, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.capabilities.toolCall)) },
  { slug: "cheapest-structured-output-model", title: "Cheapest Models With Structured Output", description: "Models with native JSON or schema output, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.capabilities.structuredOutput)) },
  { slug: "cheapest-gpt-alternative", title: "Cheapest GPT Alternatives", description: "Non-OpenAI models with tool calling, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.lab !== "openai" && m.capabilities.toolCall)) },
  { slug: "cheapest-claude-alternative", title: "Cheapest Claude Alternatives", description: "Non-Anthropic models with tool calling, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.lab !== "anthropic" && m.capabilities.toolCall)) },
  { slug: "cheapest-gemini-alternative", title: "Cheapest Gemini Alternatives", description: "Non-Google models with image input, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.lab !== "google" && hasImage(m))) },
  {
    slug: "newest-ai-models",
    title: "Newest AI Models",
    description: "Models released in the last 60 days, newest first.",
    select: (ms, today) =>
      listable(ms)
        .filter((m) => m.releaseDate !== null && daysBetween(m.releaseDate, today) >= 0 && daysBetween(m.releaseDate, today) <= 60)
        .sort(byNewest)
        .slice(0, LIST_SIZE),
  },
];

export function findBestList(slug: string): BestList | null {
  return BEST_LISTS.find((l) => l.slug === slug) ?? null;
}
