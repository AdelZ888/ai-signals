import Link from "next/link";

import type { Metadata } from "next";

import { NewsletterCta } from "@/components/newsletter-cta";
import { getAllNewslettersMeta } from "@/lib/newsletters";

export const metadata: Metadata = {
  title: "Newsletter | AI Signals",
  description: "Weekly AI Signals digest: model launches, agent patterns, and practical tutorials.",
};

function formatDate(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateIso;
  }
}

export default async function NewsletterIndexPage() {
  const issues = await getAllNewslettersMeta("en");

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="hero-shell motion-enter motion-delay-1">
        <div className="hero-grid">
          <p className="hero-kicker">Newsletter</p>
          <h1 className="hero-title">AI Signals Weekly</h1>
          <p className="hero-subtitle">
            The builder-focused digest: model launches, agent patterns, and the practical details you can ship.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#signup">
              Subscribe
            </a>
            <Link className="hero-cta hero-cta-secondary" href="/">
              Read the blog
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Issues</p>
              <h2 className="section-title">Latest</h2>
            </div>
          </div>

          {issues.length === 0 ? (
            <div className="aside-card">
              <p className="theme-text-muted">No issues yet. The first one will land soon.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {issues.map((issue, index) => (
                <div key={issue.slug} className={`card-frame motion-card motion-enter motion-delay-${Math.min(index + 2, 8)}`}>
                  <article className="rounded-2xl border theme-border theme-surface p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs theme-text-faint">
                      <span>{formatDate(issue.date)}</span>
                      <span aria-hidden>•</span>
                      <span>{issue.readingTimeMinutes} min read</span>
                      {issue.issueNumber ? (
                        <>
                          <span aria-hidden>•</span>
                          <span>Issue #{issue.issueNumber}</span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-2xl font-black tracking-tight">
                      <Link href={`/newsletter/${issue.slug}`} className="motion-link hover:text-cyan-300">
                        {issue.title}
                      </Link>
                    </h3>
                    <p className="mt-3 theme-text-muted">{issue.excerpt}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/newsletter/${issue.slug}`} className="hero-cta hero-cta-secondary">
                        Open
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div id="signup" className="scroll-mt-28">
            <NewsletterCta locale="en" variant="sidebar" />
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-6">
            <p className="section-kicker">How it works</p>
            <p className="mt-2 text-sm theme-text-muted">
              Issues are generated automatically from the week&apos;s best signals: new models, agent patterns, and practical
              tutorials. Links are curated, and every issue points you to the full breakdown on the site.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
