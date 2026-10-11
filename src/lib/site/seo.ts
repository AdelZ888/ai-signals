import type { Model, ModelEvent } from "../data/types.ts";
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

export const SITEMAP_FILES = ["pages.xml", "models.xml", "compare.xml", "best.xml", "news.xml"] as const;

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
