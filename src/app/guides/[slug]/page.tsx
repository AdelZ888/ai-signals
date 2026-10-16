import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { GUIDES_DIR, listArticles, renderMarkdown } from "@/lib/site/articles";
import { alternatesFor, clampDescription, fitTitle } from "@/lib/site/seo";
import { guideUrl, ogImageUrl } from "@/lib/site/urls";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return listArticles(GUIDES_DIR).map((g) => ({ slug: g.slug }));
}

const find = (slug: string) => listArticles(GUIDES_DIR).find((g) => g.slug === slug) ?? null;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const guide = find((await params).slug);
  if (!guide) return {};
  return {
    title: fitTitle(guide.title),
    description: clampDescription(guide.description),
    alternates: alternatesFor(guideUrl(guide.slug)),
    openGraph: { type: "article", images: [{ url: ogImageUrl(guide.title, "AI Signals guide"), width: 1200, height: 630 }] },
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const guide = find((await params).slug);
  if (!guide) notFound();
  const html = await renderMarkdown(guide.body);
  const base = getSiteUrl();
  const others = listArticles(GUIDES_DIR).filter((g) => g.slug !== guide.slug);

  return (
    <article>
      <Breadcrumbs items={[{ href: "/guides", label: "guides" }, { href: guideUrl(guide.slug), label: guide.title }]} />
      <h1>{guide.title}</h1>
      <p className="sub">Updated {guide.date} · AI Signals guide</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      <AdSlot />
      <Box title="more guides">
        <ul className="feed">
          {others.map((g) => <li key={g.slug}><Link href={guideUrl(g.slug)}>{g.title}</Link></li>)}
        </ul>
      </Box>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          datePublished: guide.date,
          dateModified: guide.date,
          mainEntityOfPage: `${base}${guideUrl(guide.slug)}`,
          image: `${base}${ogImageUrl(guide.title, "AI Signals guide")}`,
          author: { "@type": "Organization", name: "AI Signals", url: base },
          publisher: { "@type": "Organization", name: "AI Signals", url: base },
        }}
      />
    </article>
  );
}
