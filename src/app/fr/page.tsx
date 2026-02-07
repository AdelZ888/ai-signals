import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostCard } from "@/components/post-card";
import { formatTagForPath, PRIMARY_REGIONS, getAllPostsMeta, getAllTags, getRegionLabel, regionCodeToPath } from "@/lib/posts";
import { buildOgUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Accueil",
  description: "Actualités IA quotidiennes et tutoriels pratiques pour US, UK et France.",
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
    description: "Actualités IA quotidiennes et tutoriels pratiques pour US, UK et France.",
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
    description: "Actualités IA quotidiennes et tutoriels pratiques pour US, UK et France.",
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
          locale: "fr",
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
          <p className="hero-kicker">Publication IA Indépendante</p>
          <h1 className="hero-title">Le bon signal, moins de bruit</h1>
          <p className="hero-subtitle">
            Une couverture builder-grade pour US, UK et France: sorties de modèles, workflows d&apos;agents, tutoriels et changements du marché.
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

          <div className="mt-7">
            <p className="hero-group-label">Régions</p>
            <div className="mt-2 flex flex-wrap gap-2">
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
          </div>

          <div className="mt-5">
            <p className="hero-group-label">Thèmes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibleTags.map((tag, index) => (
                <Link
                  key={tag}
                  href={`/fr/tags/${formatTagForPath(tag)}`}
                  className={`hero-tag motion-enter motion-delay-${Math.min(index + 2, 8)}`}
                >
                  {tag}
                </Link>
              ))}
              {hiddenTags.length > 0 ? (
                <details className="tag-more">
                  <summary className="tag-more-summary">+{hiddenTags.length} de plus</summary>
                  <div className="tag-more-panel">
                    {hiddenTags.map((tag) => (
                      <Link key={`hero-fr-${tag}`} href={`/fr/tags/${formatTagForPath(tag)}`} className="hero-tag">
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
              <p className="section-kicker">Derniers articles</p>
              <h2 className="section-title">Nouveautés</h2>
            </div>
            <Link className="section-link" href="/fr/news">
              Voir les actus
            </Link>
          </div>

          {featured ? (
            <div className="card-frame motion-card motion-enter motion-delay-2">
              <article className="featured-card rounded-2xl border theme-border theme-surface">
                <Link href={`/fr/posts/${featured.slug}`} className="featured-cover motion-link" style={featuredCoverStyle} aria-label={featured.title}>
                  <div className="featured-cover-badges">
                    <span className="post-card-badge">À la une</span>
                    <span className="post-card-badge post-card-badge-soft">{featured.category}</span>
                  </div>
                </Link>
                <div className="p-6">
                  <h3 className="text-3xl font-black tracking-tight">
                    <Link href={`/fr/posts/${featured.slug}`} className="motion-link hover:text-cyan-300">
                      {featured.title}
                    </Link>
                  </h3>
                  <p className="mt-3 card-excerpt">{featured.excerpt}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/fr/posts/${featured.slug}`} className="hero-cta hero-cta-primary">
                      Lire
                    </Link>
                    <Link href="/fr/news" className="hero-cta hero-cta-secondary">
                      Actus
                    </Link>
                    <Link href="/fr/tutorials" className="hero-cta hero-cta-tertiary">
                      Tutoriels
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                Actualités IA
              </Link>
              <Link className="footer-link" href="/fr/tutorials">
                Tutoriels
              </Link>
              <Link className="footer-link" href="/fr/regions">
                Régions
              </Link>
              <Link className="footer-link" href="/fr/search">
                Recherche
              </Link>
              <a className="footer-link" href="/fr/rss.xml">
                RSS
              </a>
            </div>
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-5">
            <p className="section-kicker">Aujourd&apos;hui</p>
            <div className="mt-3 grid gap-4 text-sm">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] theme-text-faint">Actus</p>
                <div className="mt-2 grid gap-2">
                  {latestNews.length > 0 ? (
                    latestNews.map((post) => (
                      <Link key={`home-fr-news-${post.slug}`} href={`/fr/posts/${post.slug}`} className="footer-link">
                        {post.title}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm theme-text-faint">Aucune actu pour le moment.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] theme-text-faint">Tutoriels</p>
                <div className="mt-2 grid gap-2">
                  {latestTutorials.length > 0 ? (
                    latestTutorials.map((post) => (
                      <Link key={`home-fr-tutorial-${post.slug}`} href={`/fr/posts/${post.slug}`} className="footer-link">
                        {post.title}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm theme-text-faint">Aucun tutoriel pour le moment.</p>
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
