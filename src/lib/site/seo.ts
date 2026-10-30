import type { Model, ModelEvent } from "../data/types.ts";
import { fmtTokens, fmtUsd, monthYear } from "./format.ts";

const BRAND_SUFFIX = " | AI Signals";
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;

/** Google shows ~60 characters: keep the brand suffix only when the whole title fits. */
export function fitTitle(core: string): string | { absolute: string } {
  return core.length + BRAND_SUFFIX.length <= MAX_TITLE ? core : { absolute: core };
}

export function clampDescription(text: string, max = MAX_DESCRIPTION): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:]+$/u, "")}…`;
}

export function modelTitle(m: Model, today: string): string {
  const full = `${m.name} API Pricing & Specs (${monthYear(today)})`;
  return full.length <= MAX_TITLE ? full : `${m.name} API Pricing (${monthYear(today)})`;
}

export function modelDescription(m: Model, labName: string): string {
  return clampDescription(
    `${m.name} (${labName}) costs ${fmtUsd(m.price.input)} per 1M input and ${fmtUsd(m.price.output)} per 1M output tokens, ${fmtTokens(m.context)} context. Price history, cheaper alternatives, cost calculator.`,
  );
}

export function compareTitle(a: Model, b: Model, today: string): string {
  const full = `${a.name} vs ${b.name}: Pricing Compared (${monthYear(today)})`;
  if (full.length <= MAX_TITLE) return full;
  const dated = `${a.name} vs ${b.name} Pricing (${monthYear(today)})`;
  return dated.length <= MAX_TITLE ? dated : `${a.name} vs ${b.name} Pricing`;
}

/** Price searches ("opus 5.5 price") land on compare pages: show both input and output prices in the snippet. */
export function compareDescription(a: Model, b: Model): string {
  const [cheap, dear] = a.blended <= b.blended ? [a, b] : [b, a];
  const saving = Math.round((1 - cheap.blended / dear.blended) * 100);
  const verdict = saving === 0 ? "Same price per token." : `${cheap.name} is ${saving}% cheaper.`;
  return clampDescription(
    `${a.name} costs ${fmtUsd(a.price.input)} input / ${fmtUsd(a.price.output)} output per 1M tokens, ${b.name} ${fmtUsd(b.price.input)} / ${fmtUsd(b.price.output)}. ${verdict} Context: ${fmtTokens(a.context)} vs ${fmtTokens(b.context)}.`,
  );
}

/** Host queries mix "pricing" and "models list" (e.g. "groq api models list"). */
export function hostTitle(name: string, today: string): string {
  const full = `${name} API Pricing & Models List (${monthYear(today)})`;
  return full.length <= MAX_TITLE ? full : `${name} API Pricing (${monthYear(today)})`;
}

export function hostDescription(name: string, count: number, cheapest: { model: Model; input: number; output: number }, wins: number): string {
  const lead = wins > 0 ? ` Cheapest host for ${wins} of them.` : "";
  return clampDescription(
    `${count} AI models on ${name}, priced per 1M tokens: from ${cheapest.model.name} at ${fmtUsd(cheapest.input)} input / ${fmtUsd(cheapest.output)} output.${lead}`,
  );
}

export function bestTitle(list: { title: string }, n: number, today: string): string {
  return `${n} ${list.title} (${monthYear(today)})`;
}

export function bestDescription(list: { description: string }, entries: Model[]): string {
  const top = entries.slice(0, 3).map((m) => m.name);
  const picks = top.length > 0 ? ` Top ${top.length}: ${top.join(", ")}.` : "";
  return clampDescription(`${list.description}${picks} Updated daily from list prices.`);
}

export function xmlEscape(s: string): string {
  return s.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&apos;");
}

export type RssItem = { title: string; link: string; description: string; date: string };

export function buildRss(channel: { title: string; link: string; description: string }, items: RssItem[]): string {
  const pubDate = (day: string) => new Date(`${day}T06:00:00Z`).toUTCString();
  const body = items
    .map((i) => `<item><title>${xmlEscape(i.title)}</title><link>${xmlEscape(i.link)}</link><guid>${xmlEscape(i.link)}</guid><pubDate>${pubDate(i.date)}</pubDate><description>${xmlEscape(i.description)}</description></item>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xmlEscape(channel.title)}</title><link>${xmlEscape(channel.link)}</link><description>${xmlEscape(channel.description)}</description>${body}</channel></rss>\n`;
}

export const SITEMAP_FILES = ["pages.xml", "models.xml", "alternatives.xml", "compare.xml", "best.xml", "news.xml", "guides.xml"] as const;

export type SitemapEntry = { loc: string; lastmod?: string | null };

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';
const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
const entry = (tag: string, e: SitemapEntry) => `<${tag}><loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</${tag}>`;

export function buildUrlset(entries: SitemapEntry[]): string {
  return `${XML_HEAD}<urlset ${NS}>\n${entries.map((e) => entry("url", e)).join("\n")}\n</urlset>\n`;
}

export function buildSitemapIndex(entries: SitemapEntry[]): string {
  return `${XML_HEAD}<sitemapindex ${NS}>\n${entries.map((e) => entry("sitemap", e)).join("\n")}\n</sitemapindex>\n`;
}

/** Real last-change date of the models shown on a page (never the build date). */
export function lastModFor(ids: string[], events: ModelEvent[]): string | null {
  const wanted = new Set(ids);
  let max: string | null = null;
  for (const e of events) if (wanted.has(e.id) && (max === null || e.date > max)) max = e.date;
  return max;
}

export function itemListLd(name: string, items: { name: string; url: string }[], baseUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: `${baseUrl}${it.url}` })),
  };
}

const RSS_TYPES = { "application/rss+xml": [{ title: "AI Signals", url: "/rss.xml" }] };

/** Next.js replaces `alternates` per page: always carry the RSS feed with the canonical URL. */
export function alternatesFor(path: string): { canonical: string; types: typeof RSS_TYPES } {
  return { canonical: path, types: RSS_TYPES };
}

export function organizationLd(baseUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Signals",
    url: baseUrl,
    logo: `${baseUrl}/apple-icon`,
    description: "Daily AI model API prices, context windows and capabilities, with comparisons and a cost calculator.",
  };
}
