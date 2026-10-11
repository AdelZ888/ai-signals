import { getSiteUrl } from "@/lib/site-url";
import { getCatalog } from "@/lib/site/catalog";
import { SITEMAP_FILES, buildSitemapIndex } from "@/lib/site/seo";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const lastmod = getCatalog().meta?.lastChangeAt ?? null;
  const xml = buildSitemapIndex(SITEMAP_FILES.map((f) => ({ loc: `${base}/sitemaps/${f}`, lastmod })));
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
