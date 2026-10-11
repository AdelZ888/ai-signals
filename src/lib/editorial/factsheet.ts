import { LAB_NAMES, isLabId } from "../data/config.ts";
import { pct } from "../data/diff.ts";
import type { EventType, Model, PriceSnapshot } from "../data/types.ts";
import { SCENARIOS, monthlyCost } from "../site/cost.ts";
import { alternatives, nearestCompetitors } from "../site/selection.ts";
import { modelUrl } from "../site/urls.ts";
import type { ScoredEvent } from "./score.ts";

export type FactModel = {
  name: string; lab: string; url: string;
  input: number; output: number; blended: number; context: number; maxOutput: number | null;
  releaseDate: string | null; openWeights: boolean; reasoning: boolean; toolCall: boolean; vision: boolean;
  /** This model vs the subject, in % of blended price (positive = more expensive). */
  diffPctVsSubject: number;
  /** The subject vs this model, in % (negative = the subject is cheaper). */
  subjectVsThisPct: number;
};

export type FactSheet = {
  eventType: EventType;
  date: string;
  model: FactModel;
  before: PriceSnapshot | null;
  pctChange: number | null;
  rival: { name: string; url: string; blended: number; diffPctVsSubject: number; subjectVsThisPct: number } | null;
  competitors: FactModel[];
  scenarios: { label: string; inputTokensM: number; outputTokensM: number; cost: number; competitorCosts: { name: string; cost: number }[] }[];
  isCheapestInClass: boolean;
};

function factModel(m: Model, subject: Model): FactModel {
  return {
    name: m.name, lab: isLabId(m.lab) ? LAB_NAMES[m.lab] : m.lab, url: modelUrl(m),
    input: m.price.input, output: m.price.output, blended: m.blended, context: m.context, maxOutput: m.maxOutput,
    releaseDate: m.releaseDate, openWeights: m.openWeights, reasoning: m.capabilities.reasoning,
    toolCall: m.capabilities.toolCall, vision: m.modalitiesIn.includes("image"),
    diffPctVsSubject: pct(subject.blended, m.blended), subjectVsThisPct: pct(m.blended, subject.blended),
  };
}

/** Every number an article may use. The LLM never sees anything else. */
export function buildFactSheet(scored: ScoredEvent, models: Model[]): FactSheet {
  const { event, rival } = scored;
  const model = models.find((m) => m.id === event.id);
  if (!model) throw new Error(`model ${event.id} is not in the catalog`);
  const competitors = nearestCompetitors(model, models, 3);
  const cheaper = alternatives(model, models, 1)[0];
  return {
    eventType: event.type,
    date: event.date,
    model: factModel(model, model),
    before: event.before ?? null,
    pctChange: event.pctChange ?? null,
    rival: rival
      ? { name: rival.name, url: modelUrl(rival), blended: rival.blended, diffPctVsSubject: pct(model.blended, rival.blended), subjectVsThisPct: pct(rival.blended, model.blended) }
      : null,
    competitors: competitors.map((c) => factModel(c, model)),
    scenarios: SCENARIOS.map((s) => ({
      label: s.label,
      inputTokensM: s.inputTokens / 1_000_000,
      outputTokensM: s.outputTokens / 1_000_000,
      cost: monthlyCost(model.price, s.inputTokens, s.outputTokens),
      competitorCosts: competitors.map((c) => ({ name: c.name, cost: monthlyCost(c.price, s.inputTokens, s.outputTokens) })),
    })),
    isCheapestInClass: !cheaper || cheaper.blended >= model.blended,
  };
}
