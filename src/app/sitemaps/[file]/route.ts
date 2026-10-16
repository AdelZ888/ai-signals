import { getSiteUrl } from "@/lib/site-url";
import { listArticles } from "@/lib/site/articles";
import { getCatalog, getPairs, labSummaries } from "@/lib/site/catalog";
import { SITEMAP_FILES, buildUrlset, lastModFor, type SitemapEntry } from "@/lib/site/seo";
import { BEST_LISTS, MIN_LIST_SIZE, alternatives, alternativesPageModels, isIndexable } from "@/lib/site/selection";
import { alternativesUrl, bestUrl, compareUrl, modelUrl, newsUrl, providerUrl } from "@/lib/site/urls";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SITEMAP_FILES.map((file) => ({ file }));
}

const STATIC_PAGES = ["/", "/models", "/providers", "/compare", "/best", "/calculator", "/changes", "/news", "/newsletter", "/about"];

function entriesFor(file: string, base: string): SitemapEntry[] | null {
  const { models, events, meta, today } = getCatalog();
  const siteLastmod = meta?.lastChangeAt ?? null;
  switch (file) {
    case "pages.xml":
      return [
        ...STATIC_PAGES.map((p) => ({ loc: `${base}${p}`, lastmod: siteLastmod })),
        ...labSummaries(models).map((s) => ({ loc: `${base}${providerUrl(s.lab)}`, lastmod: lastModFor(s.models.map((m) => m.id), events) })),
      ];
    case "models.xml":
      return models.filter(isIndexable).map((m) => ({ loc: `${base}${modelUrl(m)}`, lastmod: lastModFor([m.id], events) ?? m.releaseDate }));
    case "alternatives.xml":
      return alternativesPageModels(models, today).map((m) => ({
        loc: `${base}${alternativesUrl(m)}`,
        lastmod: lastModFor([m.id, ...alternatives(m, models, 10).map((a) => a.id)], events),
      }));
    case "compare.xml":
      return getPairs().map((p) => ({ loc: `${base}${compareUrl(p.key)}`, lastmod: lastModFor([p.a.id, p.b.id], events) }));
    case "best.xml":
      return BEST_LISTS.map((l) => ({ l, entries: l.select(models, today) }))
        .filter(({ entries }) => entries.length >= MIN_LIST_SIZE)
        .map(({ l, entries }) => ({ loc: `${base}${bestUrl(l.slug)}`, lastmod: lastModFor(entries.map((m) => m.id), events) ?? siteLastmod }));
    case "news.xml":
      return listArticles().map((a) => ({ loc: `${base}${newsUrl(a.slug)}`, lastmod: a.date }));
    default:
      return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const entries = entriesFor((await params).file, getSiteUrl());
  if (!entries) return new Response("Not found", { status: 404 });
  return new Response(buildUrlset(entries), { headers: { "content-type": "application/xml; charset=utf-8" } });
}
