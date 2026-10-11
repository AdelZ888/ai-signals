export type PriceTier = { minContext: number; input: number; output: number };

/** USD per 1M tokens, base tier. */
export type Price = { input: number; output: number; cacheRead?: number; cacheWrite?: number; tiers?: PriceTier[] };

export type Host = { provider: string; input: number; output: number };

export type ModelStatus = "active" | "deprecated" | "beta";

export type Model = {
  /** Canonical id, e.g. "anthropic/claude-haiku-5-5". */
  id: string;
  /** URL segment, unique across the catalog. */
  slug: string;
  lab: string;
  name: string;
  family: string | null;
  /** ISO day (YYYY-MM-DD). */
  releaseDate: string | null;
  knowledgeCutoff: string | null;
  status: ModelStatus;
  openWeights: boolean;
  price: Price;
  blended: number;
  /** Provider whose price is the reference (first party, or the cheapest allow-listed host). */
  priceSource: string;
  context: number;
  maxOutput: number | null;
  modalitiesIn: string[];
  capabilities: { reasoning: boolean; toolCall: boolean; structuredOutput: boolean };
  hosts: Host[];
  aliases: string[];
};

export type PriceSnapshot = { input: number; output: number; blended: number; context: number };

export type EventType = "new_model" | "price_change" | "context_change" | "deprecated" | "removed";

export type ModelEvent = {
  date: string;
  id: string;
  lab: string;
  slug: string;
  name: string;
  type: EventType;
  before?: PriceSnapshot;
  after?: PriceSnapshot;
  /** For price_change: percent change of the blended price. */
  pctChange?: number;
};

export type Meta = { lastSuccessAt: string; source: string; modelCount: number; lastChangeAt: string | null };
