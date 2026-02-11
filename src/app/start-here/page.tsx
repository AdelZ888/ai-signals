import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostCard } from "@/components/post-card";
import { ServicesCta } from "@/components/services-cta";
import { getAllPostsMeta, getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Start Here",
  description: "The quickest way to get value from AI Signals: what to read, what to build, and how to stay updated.",
  alternates: {
    canonical: "/start-here",
    languages: {
      "en-US": "/start-here",
      "fr-FR": "/fr/start-here",
    },
  },
  openGraph: {
    type: "website",
    title: "Start Here",
    description: "The quickest way to get value from AI Signals: what to read, what to build, and how to stay updated.",
    url: "/start-here",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Start Here",
          subtitle: "The builder's map for AI Signals.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Start Here | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Here",
    description: "The quickest way to get value from AI Signals: what to read, what to build, and how to stay updated.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Start Here",
        subtitle: "The builder's map for AI Signals.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function StartHerePage() {
  const [all, news, tutorials] = await Promise.all([
    getAllPostsMeta("en"),
    getPostsByCategory("News", "en"),
    getPostsByCategory("Tutorials", "en"),
  ]);

  const featured = all.slice(0, 6);
  const latestNews = news.slice(0, 3);
  const latestTutorials = tutorials.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="hero-shell motion-enter motion-delay-1">
        <div className="hero-grid">
          <p className="hero-kicker">Start here</p>
          <h1 className="hero-title">The builder’s map</h1>
          <p className="hero-subtitle">
            AI Signals is a practical, automated publication for devs, founders, and AI enthusiasts. The goal is simple:
            help you decide what matters, then ship the next step.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#newsletter">
              Subscribe
            </a>
            <Link className="hero-cta hero-cta-secondary" href="/news">
              Read news
            </Link>
            <Link className="hero-cta hero-cta-tertiary" href="/tutorials">
              Tutorials
            </Link>
            <Link className="hero-cta hero-cta-tertiary" href="/services">
              Services
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="hero-chip">US / UK / FR lens</span>
            <span className="hero-chip">Strict citations</span>
            <span className="hero-chip">Implementation-first</span>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8">
          <div className="motion-enter motion-delay-2">
            <p className="section-kicker">Quick paths</p>
            <h2 className="section-title">Pick a track</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Link href="/news" className="aside-card motion-card">
                <p className="text-lg font-extrabold tracking-tight">News</p>
                <p className="mt-2 text-sm theme-text-muted">What changed, why it matters, and what to do next.</p>
              </Link>
              <Link href="/tutorials" className="aside-card motion-card">
                <p className="text-lg font-extrabold tracking-tight">Tutorials</p>
                <p className="mt-2 text-sm theme-text-muted">Step-by-step builds: configs, gates, rollbacks.</p>
              </Link>
              <Link href="/regions" className="aside-card motion-card">
                <p className="text-lg font-extrabold tracking-tight">Regions</p>
                <p className="mt-2 text-sm theme-text-muted">US/UK/FR context for adoption, compliance, and GTM.</p>
              </Link>
            </div>
          </div>

          <div className="motion-enter motion-delay-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Best of</p>
                <h2 className="section-title">Latest posts</h2>
              </div>
              <Link className="section-link" href="/">
                Home →
              </Link>
            </div>
            <div className="mt-6 grid gap-4">
              {featured.map((post, index) => (
                <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
              ))}
            </div>
          </div>

          <div className="motion-enter motion-delay-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">For scanners</p>
                <h2 className="section-title">Top 3 news + tutorials</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="aside-card">
                <p className="text-sm font-extrabold tracking-tight">News</p>
                <div className="mt-3 grid gap-2">
                  {latestNews.map((post) => (
                    <Link key={`news-${post.slug}`} className="footer-link" href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="aside-card">
                <p className="text-sm font-extrabold tracking-tight">Tutorials</p>
                <div className="mt-3 grid gap-2">
                  {latestTutorials.map((post) => (
                    <Link key={`tutorial-${post.slug}`} className="footer-link" href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div id="newsletter" className="scroll-mt-28">
            <NewsletterCta locale="en" variant="sidebar" />
          </div>

          <ServicesCta locale="en" />

          <div className="aside-card motion-card motion-enter motion-delay-6">
            <p className="section-kicker">Rule</p>
            <p className="mt-2 text-sm theme-text-muted">
              If you only do one thing: treat every AI update as a product decision with measurable gates. Ship small,
              instrument everything, and keep rollbacks cheap.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
