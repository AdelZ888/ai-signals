import { getSiteUrl } from "@/lib/site-url";
import { listArticles } from "@/lib/site/articles";
import { getPriceIndex } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { LAST_RECONSTRUCTED_MONTH, monthLabel, publishedOn } from "@/lib/site/price-index";
import { buildRss } from "@/lib/site/seo";
import { newsUrl, priceIndexUrl } from "@/lib/site/urls";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const reports = getPriceIndex().series
    .filter((p) => p.month >= LAST_RECONSTRUCTED_MONTH)
    .map((p) => ({
      title: `AI Price Index, ${monthLabel(p.month)}`,
      link: `${base}${priceIndexUrl(p.month)}`,
      description: `Index ${p.index}: the median AI model cost ${fmtUsd(p.median)} per 1M tokens on labs' own APIs.`,
      date: publishedOn(p.month),
    }));
  const articles = listArticles().map((a) => ({ title: a.title, link: `${base}${newsUrl(a.slug)}`, description: a.description, date: a.date }));
  const xml = buildRss(
    { title: "AI Signals", link: base, description: "AI model launches, price changes and the weekly pricing digest." },
    [...reports, ...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
  );
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
