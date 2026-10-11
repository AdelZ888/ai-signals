import { getSiteUrl } from "@/lib/site-url";
import { listArticles } from "@/lib/site/articles";
import { buildRss } from "@/lib/site/seo";
import { newsUrl } from "@/lib/site/urls";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const xml = buildRss(
    { title: "AI Signals", link: base, description: "AI model launches, price changes and the weekly pricing digest." },
    listArticles().slice(0, 30).map((a) => ({ title: a.title, link: `${base}${newsUrl(a.slug)}`, description: a.description, date: a.date })),
  );
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
