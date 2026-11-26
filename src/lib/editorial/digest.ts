import { samePriceSource } from "../data/diff.ts";
import type { ModelEvent } from "../data/types.ts";
import { fmtPct, fmtProvider, fmtTokens, fmtUsd } from "../site/format.ts";
import { modelUrl } from "../site/urls.ts";
import { mdEscape } from "./markdown.ts";
import type { Article } from "./template.ts";

export type DigestRange = { start: string; end: string; weekId: string };

export const digestSlug = (weekId: string) => `weekly-ai-pricing-${weekId.toLowerCase()}`;

const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
const linkOf = (e: ModelEvent) => (e.type === "removed" ? mdEscape(e.name) : `[${mdEscape(e.name)}](${modelUrl(e)})`);

function inRange(events: ModelEvent[], range: DigestRange): ModelEvent[] {
  return events
    .filter((e) => e.date >= range.start && e.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

/** Facts given to the LLM for the intro; also used to ground it. */
function priceGroups(list: ModelEvent[]) {
  const rates = list.filter((e) => e.type === "price_change").sort((a, b) => (a.pctChange ?? 0) - (b.pctChange ?? 0));
  return {
    prices: rates.filter((e) => samePriceSource(e)),
    unknownPrices: rates.filter((e) => !samePriceSource(e)),
    switches: list.filter((e) => e.type === "provider_change"),
  };
}

export function digestFacts(events: ModelEvent[], range: DigestRange) {
  const list = inRange(events, range);
  const { prices, unknownPrices, switches } = priceGroups(list);
  const count = (t: ModelEvent["type"]) => list.filter((e) => e.type === t).length;
  return {
    ...range,
    total: list.length,
    newModels: count("new_model"),
    priceChanges: prices.length,
    unverifiedPriceComparisons: unknownPrices.length,
    providerSwitches: switches.length,
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
  const { prices, unknownPrices, switches } = priceGroups(list);
  const contexts = of("context_change");
  const gone = [...of("deprecated"), ...of("removed")];

  const lines = [
    intro?.trim() ||
      `${list.length} changes to AI model pricing between ${range.start} and ${range.end}: ${news.length} new models, ${prices.length} same-provider price changes, ${switches.length} provider switches${unknownPrices.length ? `, ${unknownPrices.length} price comparisons with no source recorded` : ""}, ${contexts.length} context window changes and ${gone.length} deprecations or removals.`,
  ];
  if (news.length > 0) {
    lines.push("", "## New models", "", row(["Model", "Date", "Input / 1M", "Output / 1M", "Context"]), row(["---", "---", "---", "---", "---"]));
    for (const e of news) lines.push(row([linkOf(e), e.date, fmtUsd(e.after?.input ?? 0), fmtUsd(e.after?.output ?? 0), fmtTokens(e.after?.context ?? null)]));
  }
  const usdDelta = (before: number | undefined, after: number | undefined) =>
    `${fmtUsd(before ?? NaN)} → ${fmtUsd(after ?? NaN)}`;
  for (const [heading, group] of [
    ["Price changes at the same provider", prices],
    ["Provider switches", switches],
    ["Price history with no source recorded", unknownPrices],
  ] as const) {
    if (group.length === 0) continue;
    const isSwitch = group === switches;
    const columns = ["Model", "Date", "Provider", "Input / 1M", "Output / 1M", isSwitch ? "Blended difference" : "Blended change"];
    if (isSwitch) columns.push("Context");
    lines.push("", `## ${heading}`, "", row(columns), row(columns.map(() => "---")));
    for (const e of group) {
      const { before, after } = e;
      const source = isSwitch
        ? `${fmtProvider(before?.priceSource)} → ${fmtProvider(after?.priceSource)}`
        : fmtProvider(samePriceSource(e));
      const cells = [linkOf(e), e.date, mdEscape(source), usdDelta(before?.input, after?.input),
        usdDelta(before?.output, after?.output), e.pctChange === undefined ? "—" : fmtPct(e.pctChange)];
      if (isSwitch) cells.push(`${fmtTokens(before?.context ?? null)} → ${fmtTokens(after?.context ?? null)}`);
      lines.push(row(cells));
    }
  }
  if (contexts.length > 0) {
    lines.push("", "## Context window changes", "", row(["Model", "Date", "Provider", "Before", "After"]), row(["---", "---", "---", "---", "---"]));
    for (const e of contexts) lines.push(row([linkOf(e), e.date, mdEscape(fmtProvider(samePriceSource(e))), fmtTokens(e.before?.context ?? null), fmtTokens(e.after?.context ?? null)]));
  }
  if (gone.length > 0) {
    lines.push("", "## Deprecated or removed", "", row(["Model", "Date", "Status"]), row(["---", "---", "---"]));
    for (const e of gone) lines.push(row([linkOf(e), e.date, e.type]));
  }
  lines.push("", "[Every change in the changelog](/changes) · [Compare costs in the calculator](/calculator)");

  return {
    slug: digestSlug(range.weekId),
    title: `AI Model Pricing This Week: ${list.length} Changes (${range.start} to ${range.end})`,
    description: `${news.length} new models, ${prices.length} same-provider price changes, ${switches.length} provider switches and ${unknownPrices.length + contexts.length + gone.length} other updates in AI model pricing, ${range.start} to ${range.end}.`,
    body: lines.join("\n"),
  };
}
