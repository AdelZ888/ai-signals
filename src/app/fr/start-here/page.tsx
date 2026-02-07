import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostCard } from "@/components/post-card";
import { getAllPostsMeta, getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Commencer ici",
  description: "La meilleure porte d'entrée AI Signals: quoi lire, quoi construire, et comment rester à jour.",
  alternates: {
    canonical: "/fr/start-here",
    languages: {
      "en-US": "/start-here",
      "fr-FR": "/fr/start-here",
    },
  },
  openGraph: {
    type: "website",
    title: "Commencer ici",
    description: "La meilleure porte d'entrée AI Signals: quoi lire, quoi construire, et comment rester à jour.",
    url: "/fr/start-here",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Commencer ici",
          subtitle: "La carte pour builders sur AI Signals.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Commencer ici | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commencer ici",
    description: "La meilleure porte d'entrée AI Signals: quoi lire, quoi construire, et comment rester à jour.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Commencer ici",
        subtitle: "La carte pour builders sur AI Signals.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function StartHereFrPage() {
  const [all, news, tutorials] = await Promise.all([
    getAllPostsMeta("fr"),
    getPostsByCategory("News", "fr"),
    getPostsByCategory("Tutorials", "fr"),
  ]);

  const featured = all.slice(0, 6);
  const latestNews = news.slice(0, 3);
  const latestTutorials = tutorials.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="hero-shell motion-enter motion-delay-1">
        <div className="hero-grid">
          <p className="hero-kicker">Commencer ici</p>
          <h1 className="hero-title">La carte pour builders</h1>
          <p className="hero-subtitle">
            AI Signals est une publication automatisée, orientée pratique, pour devs, fondateurs et passionnés IA. Objectif: comprendre ce qui compte, puis shipper l&apos;étape suivante.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#newsletter">
              S&apos;abonner
            </a>
            <Link className="hero-cta hero-cta-secondary" href="/fr/news">
              Lire les actus
            </Link>
            <Link className="hero-cta hero-cta-tertiary" href="/fr/tutorials">
              Tutoriels
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="hero-chip">Angle US / UK / FR</span>
            <span className="hero-chip">Citations strictes</span>
            <span className="hero-chip">Implementation-first</span>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8">
          <div className="motion-enter motion-delay-2">
            <p className="section-kicker">Parcours rapides</p>
            <h2 className="section-title">Choisir une piste</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Link href="/fr/news" className="aside-card motion-card">
                <p className="text-lg font-extrabold tracking-tight">Actualités</p>
                <p className="mt-2 text-sm theme-text-muted">Ce qui change, pourquoi, et quoi faire ensuite.</p>
              </Link>
              <Link href="/fr/tutorials" className="aside-card motion-card">
                <p className="text-lg font-extrabold tracking-tight">Tutoriels</p>
                <p className="mt-2 text-sm theme-text-muted">Guides pas à pas: configs, gates, rollbacks.</p>
              </Link>
              <Link href="/fr/regions" className="aside-card motion-card">
                <p className="text-lg font-extrabold tracking-tight">Régions</p>
                <p className="mt-2 text-sm theme-text-muted">Contexte US/UK/FR: adoption, conformité, GTM.</p>
              </Link>
            </div>
          </div>

          <div className="motion-enter motion-delay-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">À lire</p>
                <h2 className="section-title">Derniers articles</h2>
              </div>
              <Link className="section-link" href="/fr">
                Accueil →
              </Link>
            </div>
            <div className="mt-6 grid gap-4">
              {featured.map((post, index) => (
                <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
              ))}
            </div>
          </div>

          <div className="motion-enter motion-delay-4">
            <p className="section-kicker">Pour aller vite</p>
            <h2 className="section-title">Top 3 actus + tutoriels</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="aside-card">
                <p className="text-sm font-extrabold tracking-tight">Actualités</p>
                <div className="mt-3 grid gap-2">
                  {latestNews.map((post) => (
                    <Link key={`news-${post.slug}`} className="footer-link" href={`/fr/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="aside-card">
                <p className="text-sm font-extrabold tracking-tight">Tutoriels</p>
                <div className="mt-3 grid gap-2">
                  {latestTutorials.map((post) => (
                    <Link key={`tutorial-${post.slug}`} className="footer-link" href={`/fr/posts/${post.slug}`}>
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
            <NewsletterCta locale="fr" variant="sidebar" />
          </div>

          <div className="aside-card motion-card motion-enter motion-delay-6">
            <p className="section-kicker">Regle</p>
            <p className="mt-2 text-sm theme-text-muted">
              Si vous ne faites qu&apos;une chose: traitez chaque update IA comme une decision produit avec gates mesurables.
              Shippez petit, instrumentez tout, et gardez le rollback bon marche.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
