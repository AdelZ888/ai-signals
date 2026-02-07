import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostCard } from "@/components/post-card";
import { formatTagForPath, PRIMARY_REGIONS, getAllPostsMeta, getAllTags, getRegionLabel, regionCodeToPath } from "@/lib/posts";
import { buildOgUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Home",
  description: "Daily AI news and tutorials with explainers for models, agents, and tools.",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "fr-FR": "/fr",
    },
  },
  openGraph: {
    type: "website",
    title: "AI Signals",
    description: "Daily AI news and tutorials with explainers for models, agents, and tools.",
    url: "/",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "AI Signals",
          subtitle: "Daily signal, less noise.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Signals",
    description: "Daily AI news and tutorials with explainers for models, agents, and tools.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "AI Signals",
        subtitle: "Daily signal, less noise.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function Home() {
  const posts = await getAllPostsMeta();
  const tags = await getAllTags();
  const featured = posts[0];
  const rest = posts.slice(1, 13);
  const visibleTags = tags.slice(0, 6);
  const hiddenTags = tags.slice(6, 18);
  const latestNews = posts.filter((post) => post.category.toLowerCase() === "news").slice(0, 3);
  const latestTutorials = posts.filter((post) => post.category.toLowerCase() === "tutorials").slice(0, 3);
  const featuredCoverUrl =
    featured?.coverImage ||
    (featured
      ? buildOgUrl({
          title: featured.title,
          subtitle: featured.excerpt,
          locale: "en",
          kind: "post",
          kicker: featured.category,
        })
      : "");
  const featuredCoverStyle = featuredCoverUrl
    ? ({ ["--featured-cover" as never]: `url("${featuredCoverUrl}")` } as unknown as CSSProperties)
    : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <section className="hero-shell motion-enter">
        <div className="hero-grid">
          <p className="hero-kicker">Independent AI Publication</p>
          <h1 className="hero-title">Daily signal, less noise</h1>
          <p className="hero-subtitle">
            Builder-grade coverage across US, UK, and France: model releases, agent workflows, tutorials, and market shifts.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/news" className="hero-cta hero-cta-primary">
              Read the news
            </Link>
            <Link href="/tutorials" className="hero-cta hero-cta-secondary">
              Browse tutorials
            </Link>
            <Link href="/#newsletter" className="hero-cta hero-cta-tertiary">
              Subscribe
            </Link>
          </div>

          <div className="mt-7">
            <p className="hero-group-label">Regions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRIMARY_REGIONS.map((region, index) => (
                <Link
                  key={region}
                  href={`/regions/${regionCodeToPath(region)}`}
                  className={`hero-chip motion-enter motion-delay-${Math.min(index + 1, 8)}`}
                >
                  {getRegionLabel(region)}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="hero-group-label">Topics</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibleTags.map((tag, index) => (
                <Link
                  key={tag}
                  href={`/tags/${formatTagForPath(tag)}`}
                  className={`hero-tag motion-enter motion-delay-${Math.min(index + 2, 8)}`}
                >
                  {tag}
                </Link>
              ))}
              {hiddenTags.length > 0 ? (
                <details className="tag-more">
                  <summary className="tag-more-summary">+{hiddenTags.length} more</summary>
                  <div className="tag-more-panel">
                    {hiddenTags.map((tag) => (
                      <Link key={`hero-${tag}`} href={`/tags/${formatTagForPath(tag)}`} className="hero-tag">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Latest</p>
              <h2 className="section-title">Fresh posts</h2>
            </div>
            <Link className="section-link" href="/news">
              See news
            </Link>
          </div>

          {featured ? (
            <div className="card-frame motion-card motion-enter motion-delay-2">
              <article className="featured-card rounded-2xl border theme-border theme-surface">
                <Link href={`/posts/${featured.slug}`} className="featured-cover motion-link" style={featuredCoverStyle} aria-label={featured.title}>
                  <div className="featured-cover-badges">
                    <span className="post-card-badge">Featured</span>
                    <span className="post-card-badge post-card-badge-soft">{featured.category}</span>
                  </div>
                </Link>
                <div className="p-6">
                  <h3 className="text-3xl font-black tracking-tight">
                    <Link href={`/posts/${featured.slug}`} className="motion-link hover:text-cyan-300">
                      {featured.title}
                    </Link>
                  </h3>
                  <p className="mt-3 card-excerpt">{featured.excerpt}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/posts/${featured.slug}`} className="hero-cta hero-cta-primary">
                      Read
                    </Link>
                    <Link href="/news" className="hero-cta hero-cta-secondary">
                      News
                    </Link>
                    <Link href="/tutorials" className="hero-cta hero-cta-tertiary">
                      Tutorials
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((post, index) => (
              <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 3, 8)}`} />
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div id="newsletter" className="scroll-mt-28">
            <NewsletterCta locale="en" variant="sidebar" />
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-4">
            <p className="section-kicker">Browse</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="footer-link" href="/news">
                AI News
              </Link>
              <Link className="footer-link" href="/tutorials">
                Tutorials
              </Link>
              <Link className="footer-link" href="/regions">
                Regions
              </Link>
              <Link className="footer-link" href="/search">
                Search
              </Link>
              <a className="footer-link" href="/rss.xml">
                RSS
              </a>
            </div>
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-5">
            <p className="section-kicker">Today</p>
            <div className="mt-3 grid gap-4 text-sm">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] theme-text-faint">Latest news</p>
                <div className="mt-2 grid gap-2">
                  {latestNews.length > 0 ? (
                    latestNews.map((post) => (
                      <Link key={`home-news-${post.slug}`} href={`/posts/${post.slug}`} className="footer-link">
                        {post.title}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm theme-text-faint">No news yet.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] theme-text-faint">Latest tutorials</p>
                <div className="mt-2 grid gap-2">
                  {latestTutorials.length > 0 ? (
                    latestTutorials.map((post) => (
                      <Link key={`home-tutorial-${post.slug}`} href={`/posts/${post.slug}`} className="footer-link">
                        {post.title}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm theme-text-faint">No tutorials yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
