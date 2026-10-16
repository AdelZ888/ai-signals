import { pct } from "../data/diff.ts";
import type { Model } from "../data/types.ts";
import { SCENARIOS, monthlyCost } from "./cost.ts";
import { fmtTokens, fmtUsdCost } from "./format.ts";

const CAPABILITIES = [
  ["reasoning", "built-in reasoning"],
  ["toolCall", "tool calling"],
  ["structuredOutput", "structured output"],
] as const;

export function compareVerdict(a: Model, b: Model): string[] {
  const lines: string[] = [];
  if (a.blended === b.blended) {
    lines.push(`${a.name} and ${b.name} have the same blended price.`);
  } else {
    const [cheap, dear] = a.blended < b.blended ? [a, b] : [b, a];
    lines.push(`${cheap.name} is ${Math.abs(pct(dear.blended, cheap.blended))}% cheaper than ${dear.name} on a blended 3:1 input/output basis.`);
  }
  if (a.context !== b.context) {
    const [big, small] = a.context > b.context ? [a, b] : [b, a];
    lines.push(`${big.name} has the larger context window (${fmtTokens(big.context)} vs ${fmtTokens(small.context)} tokens).`);
  }
  for (const [key, label] of CAPABILITIES) {
    if (a.capabilities[key] !== b.capabilities[key]) lines.push(`Only ${(a.capabilities[key] ? a : b).name} supports ${label}.`);
  }
  const aImage = a.modalitiesIn.includes("image");
  if (aImage !== b.modalitiesIn.includes("image")) lines.push(`Only ${(aImage ? a : b).name} accepts image input.`);
  return lines;
}

/** Monthly cost difference on each standard workload. */
export function scenarioLines(a: Model, b: Model): string[] {
  return SCENARIOS.map((s) => {
    const label = `${s.label} (${fmtTokens(s.inputTokens)} input / ${fmtTokens(s.outputTokens)} output tokens per month)`;
    const ca = monthlyCost(a.price, s.inputTokens, s.outputTokens);
    const cb = monthlyCost(b.price, s.inputTokens, s.outputTokens);
    if (ca === cb) return `${label}: both cost ${fmtUsdCost(ca)} per month.`;
    const [cheap, cheapCost, dear, dearCost] = ca < cb ? [a, ca, b, cb] : [b, cb, a, ca];
    return `${label}: ${cheap.name} costs ${fmtUsdCost(cheapCost)} vs ${fmtUsdCost(dearCost)} for ${dear.name}, saving ${fmtUsdCost(Math.round((dearCost - cheapCost) * 100) / 100)} per month.`;
  });
}

/** "Which one should I pick?" guidance derived from the data. */
export function chooseLines(a: Model, b: Model): string[] {
  const lines: string[] = [];
  if (a.blended !== b.blended) lines.push(`Choose ${(a.blended < b.blended ? a : b).name} for cost-sensitive, high-volume workloads.`);
  if (a.context !== b.context) {
    const big = a.context > b.context ? a : b;
    lines.push(`Choose ${big.name} for long documents and large codebases (${fmtTokens(big.context)}-token context).`);
  }
  for (const [key, label] of CAPABILITIES) {
    if (a.capabilities[key] !== b.capabilities[key]) lines.push(`Choose ${(a.capabilities[key] ? a : b).name} if you need ${label}.`);
  }
  const aImage = a.modalitiesIn.includes("image");
  if (aImage !== b.modalitiesIn.includes("image")) lines.push(`Choose ${(aImage ? a : b).name} if you need image input.`);
  if (a.openWeights !== b.openWeights) lines.push(`Choose ${(a.openWeights ? a : b).name} if you want open weights you can self-host.`);
  return lines;
}
