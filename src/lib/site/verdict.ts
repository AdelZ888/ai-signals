import { pct } from "../data/diff.ts";
import type { Model } from "../data/types.ts";
import { fmtTokens } from "./format.ts";

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
