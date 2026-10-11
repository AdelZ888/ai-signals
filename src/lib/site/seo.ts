import type { Model } from "../data/types.ts";
import { fmtTokens, fmtUsd, monthYear } from "./format.ts";

export function modelTitle(m: Model, today: string): string {
  return `${m.name} Pricing, Context Window & Specs (${monthYear(today)})`;
}

export function modelDescription(m: Model, labName: string): string {
  return `${m.name} by ${labName}: ${fmtUsd(m.price.input)} per 1M input tokens, ${fmtUsd(m.price.output)} per 1M output tokens, ${fmtTokens(m.context)} context. Price history, cheaper alternatives and a cost calculator.`;
}

export function compareTitle(a: Model, b: Model, today: string): string {
  return `${a.name} vs ${b.name}: Price & Specs Compared (${monthYear(today)})`;
}

export function bestTitle(list: { title: string }, n: number, today: string): string {
  return `${n} ${list.title} (${monthYear(today)})`;
}
