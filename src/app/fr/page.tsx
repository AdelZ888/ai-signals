import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostCard } from "@/components/post-card";
import { formatTagForPath, PRIMARY_REGIONS, getAllPostsMeta, getAllTags, getRegionLabel, regionCodeToPath } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Accueil",
  description: "Actualites IA quotidiennes et tutoriels pratiques pour US, UK et France.",
  alternates: {
    canonical: "/fr",
    languages: {
      "en-US": "/",
      "fr-FR": "/fr",
    },
  },
  openGraph: {
    type: "website",
    title: "AI Signals (FR)",
    description: "Actualites IA quotidiennes et tutoriels pratiques pour US, UK et France.",
    url: "/fr",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "AI Signals",
          subtitle: "Le bon signal, moins de bruit.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "AI Signals (FR)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Signals (FR)",
    description: "Actualites IA quotidiennes et tutoriels pratiques pour US, UK et France.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "AI Signals",
        subtitle: "Le bon signal, moins de bruit.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function HomeFr() {
  const posts = await getAllPostsMeta("fr");
  const tags = await getAllTags("fr");
  const featured = posts[0];
  const rest = posts.slice(1, 9);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <section className="hero-shell motion-enter">
        <div className="hero-grid">
          <p className="hero-kicker">Publication IA Independante</p>
          <h1 className="hero-title">Le bon signal, moins de bruit</h1>
          <p className="hero-subtitle">
            Une couverture builder-grade pour US, UK et France: sorties de modeles, workflows d&apos;agents, tutoriels et changements du marche.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/fr/news" className="hero-cta hero-cta-primary">
              Lire les actus
            </Link>
            <Link href="/fr/tutorials" className="hero-cta hero-cta-secondary">
              Voir les tutoriels
            </Link>
            <Link href="/fr/#newsletter" className="hero-cta hero-cta-tertiary">
              S&apos;abonner
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {PRIMARY_REGIONS.map((region, index) => (
              <Link
                key={region}
                href={`/fr/regions/${regionCodeToPath(region)}`}
                className={`hero-chip motion-enter motion-delay-${Math.min(index + 1, 8)}`}
              >
                {getRegionLabel(region, "fr")}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag, index) => (
              <Link
                key={tag}
                href={`/fr/tags/${formatTagForPath(tag)}`}
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
              <p className="section-kicker">Derniers posts</p>
              <h2 className="section-title">Nouveautes</h2>
            </div>
            <Link className="section-link" href="/fr/news">
              Voir les actus
            </Link>
          </div>

          {featured ? (
            <div className="card-frame motion-card motion-enter motion-delay-2">
              <article className="rounded-2xl border theme-border theme-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">A la une</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight">
                  <Link href={`/fr/posts/${featured.slug}`} className="motion-link hover:text-cyan-300">
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-3 theme-text-muted">{featured.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/fr/posts/${featured.slug}`} className="hero-cta hero-cta-secondary">
                    Ouvrir
                  </Link>
                  <Link href="/fr/tutorials" className="hero-cta hero-cta-tertiary">
                    Tutoriels
                  </Link>
                </div>
              </article>
            </div>
          ) : null}

          <div className="grid gap-4">
            {rest.map((post, index) => (
              <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 3, 8)}`} />
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div id="newsletter" className="scroll-mt-28">
            <NewsletterCta locale="fr" variant="sidebar" />
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-4">
            <p className="section-kicker">Navigation</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="footer-link" href="/fr/news">
                Actualites IA
              </Link>
              <Link className="footer-link" href="/fr/tutorials">
                Tutoriels
              </Link>
              <Link className="footer-link" href="/fr/regions">
                Regions
              </Link>
              <Link className="footer-link" href="/fr/search">
                Recherche
              </Link>
              <a className="footer-link" href="/fr/rss.xml">
                RSS
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
