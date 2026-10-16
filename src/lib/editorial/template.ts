import type { ModelEvent } from "../data/types.ts";
import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost } from "../site/format.ts";
import type { FactSheet } from "./factsheet.ts";
import { mdEscape } from "./markdown.ts";
import { eventKind } from "./score.ts";

export type Article = { title: string; description: string; body: string };

export function articleSlug(e: ModelEvent): string {
  return `${e.date}-${e.slug}-${eventKind(e)}`.replace(/\./gu, "-");
}

function headline(f: FactSheet): string {
  const m = f.model;
  const p = Math.abs(f.pctChange ?? 0);
  switch (f.eventType) {
    case "price_change":
      return (f.pctChange ?? 0) < 0
        ? `${m.name} Price Cut: ${p}% Lower, Now ${fmtUsd(m.input)} / ${fmtUsd(m.output)} per 1M Tokens`
        : `${m.name} Price Increase: Up ${p}% to ${fmtUsd(m.input)} / ${fmtUsd(m.output)} per 1M Tokens`;
    case "context_change":
      return `${m.name} Context Window Grows to ${fmtTokens(m.context)} Tokens`;
    case "deprecated":
      return `${m.name} Is Deprecated: Pricing and Cheapest Alternatives`;
    default:
      return `${m.name} Pricing: ${fmtUsd(m.input)} Input, ${fmtUsd(m.output)} Output per 1M Tokens`;
  }
}

function intro(f: FactSheet): string {
  const m = { ...f.model, name: mdEscape(f.model.name), lab: mdEscape(f.model.lab) };
  switch (f.eventType) {
    case "new_model":
      return `${m.lab} released ${m.name}${m.releaseDate ? ` on ${m.releaseDate}` : ""}. It costs ${fmtUsd(m.input)} per million input tokens and ${fmtUsd(m.output)} per million output tokens, with a ${fmtTokens(m.context)}-token context window.`;
    case "price_change":
      return f.before
        ? `${m.lab} changed the price of ${m.name} on ${f.date}: input goes from ${fmtUsd(f.before.input)} to ${fmtUsd(m.input)} and output from ${fmtUsd(f.before.output)} to ${fmtUsd(m.output)} per million tokens, a ${fmtPct(f.pctChange ?? 0)} change in blended price.`
        : `${m.lab} changed the price of ${m.name} on ${f.date}. It now costs ${fmtUsd(m.input)} input and ${fmtUsd(m.output)} output per million tokens.`;
    case "context_change":
      return `${m.name} now accepts ${fmtTokens(m.context)} tokens of context${f.before ? `, up from ${fmtTokens(f.before.context)}` : ""}. Pricing stays at ${fmtUsd(m.input)} input and ${fmtUsd(m.output)} output per million tokens.`;
    default:
      return `${m.lab} marked ${m.name} as deprecated. It still lists at ${fmtUsd(m.input)} input and ${fmtUsd(m.output)} output per million tokens, so plan a migration.`;
  }
}

function whoShouldCare(f: FactSheet): string[] {
  const m = f.model;
  const out: string[] = [];
  if (m.toolCall) out.push("- Teams building agents and tool-using workflows.");
  if (m.vision) out.push("- Products that read screenshots, documents or photos.");
  if (m.reasoning) out.push("- Workloads that need step-by-step reasoning.");
  if (m.openWeights) out.push("- Teams that want open weights and a choice of hosts.");
  if (f.isCheapestInClass) out.push("- Cost-sensitive teams: it is the cheapest compatible option we track.");
  if (out.length === 0) out.push("- Teams already running this model or its predecessors.");
  return out;
}

const row = (cells: string[]) => `| ${cells.join(" | ")} |`;

/** Deterministic, number-safe article used when the LLM is unavailable or fails grounding. */
export function renderTemplateArticle(f: FactSheet): Article {
  const m = { ...f.model, name: mdEscape(f.model.name) };
  const lines: string[] = [intro(f)];
  if (f.rival) {
    lines.push("", `That makes it cheaper than [${mdEscape(f.rival.name)}](${f.rival.url}) on a blended basis: ${fmtUsd(m.blended)} vs ${fmtUsd(f.rival.blended)} per million tokens.`);
  }
  lines.push("", "## What changed", "", row(["", "Input / 1M", "Output / 1M", "Context"]), row(["---", "---", "---", "---"]));
  if (f.before) lines.push(row(["Before", fmtUsd(f.before.input), fmtUsd(f.before.output), fmtTokens(f.before.context)]));
  lines.push(row([f.before ? "Now" : "Launch", fmtUsd(m.input), fmtUsd(m.output), fmtTokens(m.context)]));

  lines.push("", "## What it costs in practice", "", "Monthly cost at list price (base tier):", "");
  lines.push(row(["Workload", "Tokens in / out", m.name, ...f.competitors.map((c) => mdEscape(c.name))]));
  lines.push(row(["---", "---", "---", ...f.competitors.map(() => "---")]));
  for (const s of f.scenarios) {
    lines.push(row([s.label, `${s.inputTokensM}M / ${s.outputTokensM}M`, fmtUsdCost(s.cost), ...s.competitorCosts.map((c) => fmtUsdCost(c.cost))]));
  }

  if (f.competitors.length > 0) {
    lines.push("", "## How it compares", "", row(["Model", "Input / 1M", "Output / 1M", "Context", `vs ${m.name}`]), row(["---", "---", "---", "---", "---"]));
    for (const c of f.competitors) {
      const name = `[${mdEscape(c.name)}](${c.url})${c.compareUrl ? ` · [compare](${c.compareUrl})` : ""}`;
      lines.push(row([name, fmtUsd(c.input), fmtUsd(c.output), fmtTokens(c.context), fmtPct(c.diffPctVsSubject)]));
    }
  }

  lines.push("", "## Who should care", "", ...whoShouldCare(f), "", `[Full ${m.name} pricing, history and cost calculator](${m.url})`);
  // The description is plain text (front matter, meta tags): undo the Markdown escaping of intro().
  const first = intro(f).replace(/\\([\\`*_[\]()|<>])/gu, "$1");
  return { title: headline(f), description: first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first, body: lines.join("\n") };
}
