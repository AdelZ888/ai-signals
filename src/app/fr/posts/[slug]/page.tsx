import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostToc } from "@/components/post-toc";
import { ReadingProgress } from "@/components/reading-progress";
import { RelatedPosts } from "@/components/related-posts";
import { ShareSnippet } from "@/components/share-snippet";
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

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPostsMeta("fr");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug, "fr");
    const ogUrl = `/api/og?${new URLSearchParams({
      title: post.title,
      subtitle: post.excerpt,
      locale: "fr",
      kind: "post",
      kicker: post.category,
    }).toString()}`;
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
        url: `/fr/posts/${post.slug}`,
        images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [ogUrl],
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
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/fr/posts/${post.slug}`;
  const shareUrl = encodeURIComponent(canonicalUrl);
  const showSeries = typeof post.series === "string" && post.series.trim().length > 0;
  const showDifficulty = !!post.difficulty;
  const showTime = typeof post.timeToImplementMinutes === "number" && Number.isFinite(post.timeToImplementMinutes);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <ReadingProgress />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="article-shell motion-enter">
          <header className="article-hero motion-enter motion-delay-1">
            <p className="article-kicker">Briefing AI Signals</p>
            <h1 className="article-title">{post.title}</h1>
            <p className="article-excerpt">{post.excerpt}</p>

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
              {post.tags.map((tag) => (
                <Link key={`${post.slug}-${tag}`} href={`/fr/tags/${formatTagForPath(tag)}`} className="article-tag">
                  {tag}
                </Link>
              ))}
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

          <div className="article-content motion-enter motion-delay-2" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

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
