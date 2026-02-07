import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Mission éditoriale et principes de qualité de AI Signals.",
  alternates: {
    canonical: "/fr/about",
    languages: {
      "en-US": "/about",
      "fr-FR": "/fr/about",
    },
  },
  openGraph: {
    type: "website",
    title: "À propos",
    description: "Mission éditoriale et principes de qualité de AI Signals.",
    url: "/fr/about",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "À propos",
          subtitle: "Mission et politique éditoriale.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "À propos | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos",
    description: "Mission éditoriale et principes de qualité de AI Signals.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "À propos",
        subtitle: "Mission et politique éditoriale.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default function AboutFrPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-black tracking-tight motion-enter">À propos de AI Signals</h1>
      <p className="mt-4 theme-text-muted motion-enter motion-delay-2">
        AI Signals est une publication automatisée axée sur la pratique: sorties de modèles, workflows d&apos;agents, tutoriels et analyses de marché.
      </p>

      <section className="mt-8 space-y-3 motion-enter motion-delay-4">
        <h2 className="text-2xl font-bold">Politique éditoriale</h2>
        <p className="theme-text-muted">Chaque article contient au moins une source. Les affirmations doivent être liées aux références citées.</p>
        <p className="theme-text-muted">Les articles sont mis à jour au fil des changements de l&apos;écosystème.</p>
      </section>
    </main>
  );
}
