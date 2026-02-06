import Link from "next/link";

import type { Metadata } from "next";

import { NewsletterCta } from "@/components/newsletter-cta";
import { getAllNewslettersMeta } from "@/lib/newsletters";

export const metadata: Metadata = {
  title: "Newsletter | AI Signals",
  description: "Le digest hebdo AI Signals: sorties de modeles, patterns d'agents, tutoriels pratiques.",
  alternates: {
    canonical: "/fr/newsletter",
    languages: {
      "en-US": "/newsletter",
      "fr-FR": "/fr/newsletter",
    },
  },
  openGraph: {
    type: "website",
    title: "AI Signals Hebdo",
    description: "Le digest hebdo AI Signals: sorties de modeles, patterns d'agents, tutoriels pratiques.",
    url: "/fr/newsletter",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "AI Signals Hebdo",
          subtitle: "Digest hebdo: modeles, agents, tutoriels.",
          locale: "fr",
          kind: "newsletter",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "AI Signals Hebdo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Signals Hebdo",
    description: "Le digest hebdo AI Signals: sorties de modeles, patterns d'agents, tutoriels pratiques.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "AI Signals Hebdo",
        subtitle: "Digest hebdo: modeles, agents, tutoriels.",
        locale: "fr",
        kind: "newsletter",
      }).toString()}`,
    ],
  },
};

function formatDate(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateIso;
  }
}

export default async function NewsletterIndexPageFr() {
  const issues = await getAllNewslettersMeta("fr");

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="hero-shell motion-enter motion-delay-1">
        <div className="hero-grid">
          <p className="hero-kicker">Newsletter</p>
          <h1 className="hero-title">AI Signals Hebdo</h1>
          <p className="hero-subtitle">
            Le digest axe builders: sorties de modeles, patterns d&apos;agents, et details pratiques a shipper.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#signup">
              S&apos;abonner
            </a>
            <Link className="hero-cta hero-cta-secondary" href="/fr">
              Lire le blog
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Editions</p>
              <h2 className="section-title">Dernieres</h2>
            </div>
          </div>

          {issues.length === 0 ? (
            <div className="aside-card">
              <p className="theme-text-muted">Pas encore d&apos;editions. La premiere arrive bientot.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {issues.map((issue, index) => (
                <div key={issue.slug} className={`card-frame motion-card motion-enter motion-delay-${Math.min(index + 2, 8)}`}>
                  <article className="rounded-2xl border theme-border theme-surface p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs theme-text-faint">
                      <span>{formatDate(issue.date)}</span>
                      <span aria-hidden>•</span>
                      <span>{issue.readingTimeMinutes} min</span>
                      {issue.issueNumber ? (
                        <>
                          <span aria-hidden>•</span>
                          <span>Edition #{issue.issueNumber}</span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-2xl font-black tracking-tight">
                      <Link href={`/fr/newsletter/${issue.slug}`} className="motion-link hover:text-cyan-300">
                        {issue.title}
                      </Link>
                    </h3>
                    <p className="mt-3 theme-text-muted">{issue.excerpt}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/fr/newsletter/${issue.slug}`} className="hero-cta hero-cta-secondary">
                        Ouvrir
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
            <NewsletterCta locale="fr" variant="sidebar" />
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-6">
            <p className="section-kicker">Comment ca marche</p>
            <p className="mt-2 text-sm theme-text-muted">
              Les editions sont generees automatiquement a partir des meilleurs signaux de la semaine, puis publiees sur le
              site (et envoyees par email une fois l&apos;integration Beehiiv activee).
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
