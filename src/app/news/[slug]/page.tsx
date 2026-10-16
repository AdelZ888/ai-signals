import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { listArticles, renderMarkdown } from "@/lib/site/articles";
import { getCatalog } from "@/lib/site/catalog";
import { modelUrl, newsUrl, ogImageUrl } from "@/lib/site/urls";
import { alternatesFor } from "@/lib/site/seo";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return listArticles().map((a) => ({ slug: a.slug }));
}

const find = (slug: string) => listArticles().find((a) => a.slug === slug) ?? null;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const article = find((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: alternatesFor(newsUrl(article.slug)),
    openGraph: { type: "article", publishedTime: article.date, images: [{ url: ogImageUrl(article.title, article.date), width: 1200, height: 630 }] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const article = find((await params).slug);
  if (!article) notFound();
  const html = await renderMarkdown(article.body);
  const model = article.modelId ? getCatalog().models.find((m) => m.id === article.modelId) : undefined;
  const base = getSiteUrl();

  return (
    <article>
      <Breadcrumbs items={[{ href: "/news", label: "news" }, { href: newsUrl(article.slug), label: article.title }]} />
      <h1>{article.title}</h1>
      <p className="sub">{article.date} · {article.kind === "digest" ? "weekly digest" : "news"} · generated from AI Signals data, numbers verified automatically</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      {model ? <p><Link className="btn" href={modelUrl(model)}>{model.name}: live pricing →</Link></p> : null}
      <AdSlot />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          dateModified: article.date,
          mainEntityOfPage: `${base}${newsUrl(article.slug)}`,
          image: `${base}${ogImageUrl(article.title, article.date)}`,
          author: { "@type": "Organization", name: "AI Signals", url: base },
          publisher: { "@type": "Organization", name: "AI Signals", url: base },
        }}
      />
    </article>
  );
}
