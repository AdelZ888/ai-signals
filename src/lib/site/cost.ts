export type Scenario = { id: string; label: string; inputTokens: number; outputTokens: number };

export const SCENARIOS: Scenario[] = [
  { id: "chatbot", label: "Chatbot", inputTokens: 10_000_000, outputTokens: 2_000_000 },
  { id: "rag", label: "RAG app", inputTokens: 50_000_000, outputTokens: 5_000_000 },
  { id: "agent", label: "Coding agent", inputTokens: 20_000_000, outputTokens: 10_000_000 },
];

/** Monthly USD cost at base-tier list price (prices are per 1M tokens). */
export function monthlyCost(price: { input: number; output: number }, inputTokens: number, outputTokens: number): number {
  return Math.round(((price.input * inputTokens + price.output * outputTokens) / 1_000_000) * 100) / 100;
}

/** Parses a "millions of tokens" field; garbage becomes 0, huge values are clamped. */
export function parseTokenInput(raw: string): number {
  const n = Number(String(raw).replace(/[,_\s]/gu, ""));
  if (!Number.isFinite(n) || n < 0) return n === Number.POSITIVE_INFINITY ? 1_000_000 : 0;
  return Math.min(n, 1_000_000);
}
