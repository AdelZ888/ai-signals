import type { Model, ModelEvent } from "../../src/lib/data/types.ts";
import type { Pair } from "../../src/lib/site/selection.ts";
import { alternativesUrl, compareUrl, modelUrl, newsUrl, providerUrl } from "../../src/lib/site/urls.ts";

/** Public by design: IndexNow verifies ownership by fetching /<key>.txt from the site. */
export const INDEXNOW_KEY = "fc361257a7af3c32a78ccf4bcfd6db90";

export type ChangeInput = {
  base: string;
  today: string;
  events: ModelEvent[];
  articles: { slug: string; date: string }[];
  models: Model[];
  pairs: Pair[];
  alternativesFor: ReadonlySet<string>;
};

/** Absolute URLs whose content changed today (event pages, their hubs, new articles). */
export function changedUrls(input: ChangeInput): string[] {
  const { base, today } = input;
  const events = input.events.filter((e) => e.date === today);
  const articles = input.articles.filter((a) => a.date === today);
  if (events.length === 0 && articles.length === 0) return [];

  const paths: string[] = ["/", "/changes", "/models"];
  if (articles.length > 0) paths.push("/news", ...articles.map((a) => newsUrl(a.slug)));
  const ids = new Set(events.map((e) => e.id));
  const byId = new Map(input.models.map((m) => [m.id, m]));
  for (const id of ids) {
    const m = byId.get(id);
    if (!m) continue;
    paths.push(modelUrl(m), providerUrl(m.lab));
    if (input.alternativesFor.has(m.id)) paths.push(alternativesUrl(m));
  }
  for (const p of input.pairs) if (ids.has(p.a.id) || ids.has(p.b.id)) paths.push(compareUrl(p.key));
  return [...new Set(paths)].map((p) => `${base}${p}`);
}

export function indexNowPayload(base: string, urls: string[]) {
  return { host: new URL(base).host, key: INDEXNOW_KEY, keyLocation: `${base}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10_000) };
}
