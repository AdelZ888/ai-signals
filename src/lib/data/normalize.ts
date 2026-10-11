import { HOST_IDS, LAB_IDS, LAB_PROVIDER, isLabId, type LabId } from "./config.ts";
import { toIsoDay } from "./dates.ts";
import type { Host, Model, ModelStatus, Price, PriceTier } from "./types.ts";

type RawTier = { input?: number; output?: number; tier?: { type?: string; size?: number } };
type RawCost = {
  input?: number; output?: number; cache_read?: number; cache_write?: number;
  tiers?: RawTier[]; context_over_200k?: { input?: number; output?: number };
};
type RawModel = {
  id?: string; name?: string; family?: string; release_date?: string; knowledge?: string; status?: string;
  open_weights?: boolean; reasoning?: boolean; tool_call?: boolean; structured_output?: boolean;
  modalities?: { input?: string[]; output?: string[] }; limit?: { context?: number; output?: number };
  cost?: RawCost; canonical_model_id?: string;
};
export type RawModelsDev = Record<string, { id?: string; name?: string; models?: Record<string, RawModel> }>;

type Candidate = { providerId: string; key: string; raw: RawModel & { cost: { input: number; output: number } } };

const DATE_SUFFIX = /-(\d{8}|\d{4}-\d{2}-\d{2}|\d{4})$/u;
const PROVIDER_TO_LAB = new Map<string, LabId>(LAB_IDS.map((lab) => [LAB_PROVIDER[lab], lab]));
const HOSTS: ReadonlySet<string> = new Set(HOST_IDS);

export function round(n: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function blendedPrice(input: number, output: number): number {
  return round((3 * input + output) / 4);
}

const NOT_CHAT = /(^|[-_/ ])(embed|embedding|rerank|reranker|realtime|live|image|tts|audio|transcribe|latest)([-_/ ]|\d|$)/iu;

/**
 * Chat/text LLMs only (spec §5.2): text-only output, billed output tokens, and not an embedding, reranker,
 * realtime/live, image, TTS/audio model or a moving "-latest" alias of another model.
 */
function isPaidText(m: RawModel): m is Candidate["raw"] {
  const c = m.cost;
  const output = m.modalities?.output ?? [];
  return (
    output.length > 0 && output.every((o) => o === "text") &&
    typeof c?.input === "number" && typeof c.output === "number" && c.output > 0 &&
    !NOT_CHAT.test(`${m.id ?? ""} ${m.name ?? ""} ${m.family ?? ""}`)
  );
}

function toTiers(cost: RawCost): PriceTier[] | undefined {
  const tiers: PriceTier[] = [];
  for (const t of cost.tiers ?? []) {
    if (t.tier?.type === "context" && typeof t.tier.size === "number" && typeof t.input === "number" && typeof t.output === "number") {
      tiers.push({ minContext: t.tier.size, input: t.input, output: t.output });
    }
  }
  const legacy = cost.context_over_200k;
  if (tiers.length === 0 && typeof legacy?.input === "number" && typeof legacy.output === "number") {
    tiers.push({ minContext: 200_000, input: legacy.input, output: legacy.output });
  }
  return tiers.length > 0 ? tiers.sort((a, b) => a.minContext - b.minContext) : undefined;
}

function toPrice(cost: RawCost & { input: number; output: number }): Price {
  const price: Price = { input: cost.input, output: cost.output };
  if (typeof cost.cache_read === "number") price.cacheRead = cost.cache_read;
  if (typeof cost.cache_write === "number") price.cacheWrite = cost.cache_write;
  const tiers = toTiers(cost);
  if (tiers) price.tiers = tiers;
  return price;
}

function toStatus(status: string | undefined): ModelStatus {
  if (status === "deprecated") return "deprecated";
  if (status === "beta" || status === "alpha") return "beta";
  return "active";
}

/** Third-party names end up in pages, Markdown and emails: anything URL-, email- or HTML-like falls back to the slug. */
const UNSAFE_NAME = /(https?:|www\.|@|<|>|\]\(|[\u0000-\u001f])/iu;

function displayName(raw: string, fallback: string): string {
  const name = raw.replace(/\s*\(latest\)\s*$/iu, "").trim();
  return !name || name.length > 80 || UNSAFE_NAME.test(name) ? fallback : name;
}

function slugFromId(id: string): string {
  return id.split("/").slice(1).join("-").toLowerCase().replace(/[^a-z0-9.-]+/gu, "-").replace(/^-+|-+$/gu, "");
}

function cheapest(cands: Candidate[]): Candidate {
  return [...cands].sort(
    (a, b) => blendedPrice(a.raw.cost.input, a.raw.cost.output) - blendedPrice(b.raw.cost.input, b.raw.cost.output) || a.providerId.localeCompare(b.providerId),
  )[0];
}

function toHosts(cands: Candidate[]): Host[] {
  const best = new Map<string, Host>();
  for (const c of cands) {
    const host: Host = { provider: c.providerId, input: c.raw.cost.input, output: c.raw.cost.output };
    const current = best.get(c.providerId);
    if (!current || blendedPrice(host.input, host.output) < blendedPrice(current.input, current.output)) best.set(c.providerId, host);
  }
  return [...best.values()].sort((a, b) => blendedPrice(a.input, a.output) - blendedPrice(b.input, b.output) || a.provider.localeCompare(b.provider));
}

export function normalizeModelsDev(raw: RawModelsDev): Model[] {
  const byId = new Map<string, { firstParty?: Candidate; hosts: Candidate[] }>();

  for (const [providerId, provider] of Object.entries(raw)) {
    const providerLab = PROVIDER_TO_LAB.get(providerId);
    const isHost = HOSTS.has(providerId);
    if (!providerLab && !isHost) continue;

    for (const [key, m] of Object.entries(provider.models ?? {})) {
      if (!isPaidText(m)) continue;
      let id = (m.canonical_model_id ?? "").trim();
      if (!id && providerLab) id = `${providerLab}/${m.id ?? key}`;
      const lab = id.split("/")[0];
      if (!id || !isLabId(lab)) continue;

      const entry = byId.get(id) ?? { hosts: [] };
      const cand: Candidate = { providerId, key, raw: m };
      if (providerLab === lab) entry.firstParty ??= cand;
      else if (isHost) entry.hosts.push(cand);
      else continue;
      byId.set(id, entry);
    }
  }

  const models: Model[] = [];
  for (const [id, entry] of byId) {
    const base = entry.firstParty ?? cheapest(entry.hosts);
    const m = base.raw;
    const price = toPrice(m.cost);
    models.push({
      id,
      slug: slugFromId(id),
      lab: id.split("/")[0],
      name: displayName(m.name ?? base.key, slugFromId(id)),
      family: m.family ?? null,
      releaseDate: toIsoDay(m.release_date),
      knowledgeCutoff: m.knowledge ?? null,
      status: toStatus(m.status),
      openWeights: Boolean(m.open_weights),
      price,
      blended: blendedPrice(price.input, price.output),
      priceSource: base.providerId,
      context: m.limit?.context ?? 0,
      maxOutput: m.limit?.output ? m.limit.output : null,
      modalitiesIn: m.modalities?.input ?? ["text"],
      capabilities: { reasoning: Boolean(m.reasoning), toolCall: Boolean(m.tool_call), structuredOutput: Boolean(m.structured_output) },
      hosts: toHosts(entry.hosts),
      aliases: [],
    });
  }

  // Merge dated snapshots into their base model when prices match.
  const index = new Map(models.map((m) => [m.id, m]));
  const merged: Model[] = [];
  for (const m of models) {
    const match = m.id.match(DATE_SUFFIX);
    const base = match ? index.get(m.id.slice(0, -match[0].length)) : undefined;
    if (base && base.price.input === m.price.input && base.price.output === m.price.output) {
      base.aliases.push(m.slug);
      continue;
    }
    merged.push(m);
  }

  merged.sort((a, b) => a.id.localeCompare(b.id));
  const seen = new Set<string>();
  for (const m of merged) {
    m.aliases.sort();
    if (seen.has(m.slug)) m.slug = `${m.slug}-${m.lab}`;
    seen.add(m.slug);
  }
  return merged;
}
