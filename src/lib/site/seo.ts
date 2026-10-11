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
