import type { ModelEvent } from "../data/types.ts";
import { fmtPct, fmtTokens, fmtUsd } from "../site/format.ts";
import { modelUrl } from "../site/urls.ts";
import type { Article } from "./template.ts";

export type DigestRange = { start: string; end: string; weekId: string };

export const digestSlug = (weekId: string) => `weekly-ai-pricing-${weekId.toLowerCase()}`;

const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
const linkOf = (e: ModelEvent) => (e.type === "removed" ? e.name : `[${e.name}](${modelUrl(e)})`);

function inRange(events: ModelEvent[], range: DigestRange): ModelEvent[] {
  return events
    .filter((e) => e.date >= range.start && e.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

/** Facts given to the LLM for the intro; also used to ground it. */
export function digestFacts(events: ModelEvent[], range: DigestRange) {
  const list = inRange(events, range);
  const count = (t: ModelEvent["type"]) => list.filter((e) => e.type === t).length;
  return {
    ...range,
    total: list.length,
    newModels: count("new_model"),
    priceChanges: count("price_change"),
    contextChanges: count("context_change"),
    deprecatedOrRemoved: count("deprecated") + count("removed"),
    events: list.map((e) => ({ name: e.name, type: e.type, date: e.date, before: e.before ?? null, after: e.after ?? null, pctChange: e.pctChange ?? null })),
  };
}

export function buildDigest(events: ModelEvent[], range: DigestRange, intro: string | null = null): (Article & { slug: string }) | null {
  const list = inRange(events, range);
  if (list.length === 0) return null;
  const of = (t: ModelEvent["type"]) => list.filter((e) => e.type === t);
  const news = of("new_model");
  const prices = of("price_change").sort((a, b) => (a.pctChange ?? 0) - (b.pctChange ?? 0));
  const contexts = of("context_change");
  const gone = [...of("deprecated"), ...of("removed")];

  const lines = [
    intro?.trim() ||
      `${list.length} changes to AI model pricing between ${range.start} and ${range.end}: ${news.length} new models, ${prices.length} price changes, ${contexts.length} context window changes and ${gone.length} deprecations or removals.`,
  ];
  if (news.length > 0) {
    lines.push("", "## New models", "", row(["Model", "Date", "Input / 1M", "Output / 1M", "Context"]), row(["---", "---", "---", "---", "---"]));
    for (const e of news) lines.push(row([linkOf(e), e.date, fmtUsd(e.after?.input ?? 0), fmtUsd(e.after?.output ?? 0), fmtTokens(e.after?.context ?? null)]));
  }
  if (prices.length > 0) {
    lines.push("", "## Price changes", "", row(["Model", "Date", "Input / 1M", "Output / 1M", "Change"]), row(["---", "---", "---", "---", "---"]));
    for (const e of prices) {
      lines.push(row([linkOf(e), e.date, `${fmtUsd(e.before?.input ?? 0)} → ${fmtUsd(e.after?.input ?? 0)}`, `${fmtUsd(e.before?.output ?? 0)} → ${fmtUsd(e.after?.output ?? 0)}`, fmtPct(e.pctChange ?? 0)]));
    }
  }
  if (contexts.length > 0) {
    lines.push("", "## Context window changes", "", row(["Model", "Date", "Before", "After"]), row(["---", "---", "---", "---"]));
    for (const e of contexts) lines.push(row([linkOf(e), e.date, fmtTokens(e.before?.context ?? null), fmtTokens(e.after?.context ?? null)]));
  }
  if (gone.length > 0) {
    lines.push("", "## Deprecated or removed", "", row(["Model", "Date", "Status"]), row(["---", "---", "---"]));
    for (const e of gone) lines.push(row([linkOf(e), e.date, e.type]));
  }
  lines.push("", "[Every change in the changelog](/changes) · [Compare costs in the calculator](/calculator)");

  return {
    slug: digestSlug(range.weekId),
    title: `AI Model Pricing This Week: ${list.length} Changes (${range.start} to ${range.end})`,
    description: `${news.length} new models, ${prices.length} price changes and ${contexts.length + gone.length} other updates in AI model pricing, ${range.start} to ${range.end}.`,
    body: lines.join("\n"),
  };
}
