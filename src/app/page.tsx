import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostCard } from "@/components/post-card";
import { formatTagForPath, PRIMARY_REGIONS, getAllPostsMeta, getAllTags, getRegionLabel, regionCodeToPath } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Home",
  description: "Daily AI news and tutorials with explainers for models, agents, and tools.",
};

export default async function Home() {
  const posts = await getAllPostsMeta();
  const tags = await getAllTags();
  const featured = posts[0];
  const rest = posts.slice(1, 9);

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

          <div className="mt-7 flex flex-wrap gap-2">
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

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag, index) => (
              <Link
                key={tag}
                href={`/tags/${formatTagForPath(tag)}`}
                className={`hero-tag motion-enter motion-delay-${Math.min(index + 2, 8)}`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
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
              <article className="rounded-2xl border theme-border theme-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Featured</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight">
                  <Link href={`/posts/${featured.slug}`} className="motion-link hover:text-cyan-300">
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-3 theme-text-muted">{featured.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/posts/${featured.slug}`} className="hero-cta hero-cta-secondary">
                    Open
                  </Link>
                  <Link href="/tutorials" className="hero-cta hero-cta-tertiary">
                    Tutorials
                  </Link>
                </div>
              </article>
            </div>
          ) : null}

          <div className="grid gap-4">
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
        </aside>
      </div>
    </main>
  );
}
