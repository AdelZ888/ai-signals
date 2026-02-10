import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostToc } from "@/components/post-toc";
import { ReadingProgress } from "@/components/reading-progress";
import { RelatedPosts } from "@/components/related-posts";
import { ShareSnippet } from "@/components/share-snippet";
import { CodeCopyEnhancer } from "@/components/code-copy";
import {
  formatTagForPath,
  getAllPostsMeta,
  getCategoryLabel,
  getDifficultyLabel,
  getPostBySlug,
  getRegionLabel,
  getRelatedPosts,
  getSeriesLabel,
} from "@/lib/posts";
import { buildOgUrl } from "@/lib/og";
import { getSiteUrl } from "@/lib/site-url";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPostsMeta("fr");
  const limit = Math.max(40, Math.min(400, Number(process.env.STATIC_POST_PARAMS_LIMIT || 140)));
  return posts.slice(0, limit).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug, "fr");
    const ogFallback = buildOgUrl({
      title: post.title,
      subtitle: post.excerpt,
      locale: "fr",
      kind: "post",
      kicker: post.category,
    });
    const ogUrl = post.coverImage || ogFallback;
    const ogImageUrl = ogUrl.startsWith("http") ? ogUrl : `${getSiteUrl()}${ogUrl}`;
    const canonicalUrl = `${getSiteUrl()}/fr/posts/${post.slug}`;
    return {
      title: post.title,
      description: post.excerpt,
      alternates: {
        canonical: `/fr/posts/${post.slug}`,
        languages: {
          "en-US": `/posts/${post.slug}`,
          "fr-FR": `/fr/posts/${post.slug}`,
        },
      },
      openGraph: {
        type: "article",
        title: post.title,
        description: post.excerpt,
        url: canonicalUrl,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: "Article introuvable",
    };
  }
}

export default async function PostFrPage({ params }: Params) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug, "fr");
  } catch {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug, 3, "fr");
  const shareText = encodeURIComponent(post.title);
  const canonicalUrl = `${getSiteUrl()}/fr/posts/${post.slug}`;
  const shareUrl = encodeURIComponent(canonicalUrl);
  const publishedIso = (() => {
    const dt = new Date(post.date);
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : post.date;
  })();
  const coverFallback = buildOgUrl({
    title: post.title,
    subtitle: post.excerpt,
    locale: "fr",
    kind: "post",
    kicker: post.category,
  });
  const coverUrl = post.coverImage || coverFallback;
  const ogImageUrl = coverUrl.startsWith("http") ? coverUrl : `${getSiteUrl()}${coverUrl}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: publishedIso,
    dateModified: publishedIso,
    inLanguage: "fr-FR",
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: { "@type": "Organization", name: "AI Signals" },
    publisher: { "@type": "Organization", name: "AI Signals" },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    image: ogImageUrl,
    isAccessibleForFree: true,
  };
  const showSeries = typeof post.series === "string" && post.series.trim().length > 0;
  const showDifficulty = !!post.difficulty;
  const showTime = typeof post.timeToImplementMinutes === "number" && Number.isFinite(post.timeToImplementMinutes);
  const visibleTags = post.tags.slice(0, 8);
  const hiddenTags = post.tags.slice(8);
  const moreLabel = `+${hiddenTags.length} de plus`;
  const contentId = `article-content-${slug}`;
  const coverStyle = { ["--cover-image" as never]: `url("${coverUrl}")` } as unknown as CSSProperties;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="article-shell motion-enter">
          <header className="article-hero motion-enter motion-delay-1">
            <p className="article-kicker">Briefing AI Signals</p>
            <h1 className="article-title">{post.title}</h1>
            <p className="article-excerpt">{post.excerpt}</p>
            <div className="article-cover" style={coverStyle} data-has-image="true" aria-hidden="true" />

            <div className="article-meta">
              <span className="article-chip">{post.date}</span>
              <span className="article-chip">{getRegionLabel(post.region, "fr")}</span>
              <span className="article-chip">{getCategoryLabel(post.category, "fr")}</span>
              {showSeries ? <span className="article-chip">{getSeriesLabel(post.series!, "fr")}</span> : null}
              {showDifficulty ? <span className="article-chip">{getDifficultyLabel(post.difficulty!, "fr")}</span> : null}
              {showTime ? <span className="article-chip">{Math.max(5, Math.round(post.timeToImplementMinutes!))} min build</span> : null}
              <span className="article-chip">{post.readingTimeMinutes} min de lecture</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <Link key={`${post.slug}-${tag}`} href={`/fr/tags/${formatTagForPath(tag)}`} className="article-tag">
                  {tag}
                </Link>
              ))}

              {hiddenTags.length > 0 ? (
                <details className="tag-more">
                  <summary className="tag-more-summary">{moreLabel}</summary>
                  <div className="tag-more-panel">
                    {hiddenTags.map((tag) => (
                      <Link key={`${post.slug}-${tag}-hidden`} href={`/fr/tags/${formatTagForPath(tag)}`} className="article-tag">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a
                className="article-action"
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                Partager sur X
              </a>
              <a
                className="article-action"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                Partager sur LinkedIn
              </a>
            </div>
          </header>

          <div id={contentId} className="article-content motion-enter motion-delay-2" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          <CodeCopyEnhancer contentId={contentId} locale="fr" />

          <ShareSnippet title={post.title} excerpt={post.excerpt} url={canonicalUrl} locale="fr" />

          {post.sources.length > 0 ? (
            <section className="article-section motion-enter motion-delay-3">
              <h2 className="article-section-title">Sources</h2>
              <ul className="mt-4 grid gap-3">
                {post.sources.map((source, index) => (
                  <li key={source}>
                    <a className="article-source-link" href={source} target="_blank" rel="noreferrer">
                      <span className="article-source-index">{index + 1}</span>
                      <span className="break-all">{source}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="article-section motion-enter motion-delay-4">
            <NewsletterCta locale="fr" variant="inline" />
          </section>

          <section className="article-section motion-enter motion-delay-5">
            <RelatedPosts posts={relatedPosts} locale="fr" />
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <PostToc toc={post.toc} locale="fr" />
          <NewsletterCta locale="fr" variant="compact" />
        </aside>
      </div>
    </main>
  );
}
