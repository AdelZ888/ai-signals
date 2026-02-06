import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tutoriels",
  description: "Tutoriels IA pas a pas pour builders et equipes produit.",
  alternates: {
    canonical: "/fr/tutorials",
    languages: {
      "en-US": "/tutorials",
      "fr-FR": "/fr/tutorials",
    },
  },
  openGraph: {
    type: "website",
    title: "Tutoriels",
    description: "Tutoriels IA pas a pas pour builders et equipes produit.",
    url: "/fr/tutorials",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Tutoriels",
          subtitle: "Guides pratiques pour mettre l'IA en production.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Tutoriels | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutoriels",
    description: "Tutoriels IA pas a pas pour builders et equipes produit.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Tutoriels",
        subtitle: "Guides pratiques pour mettre l'IA en production.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function TutorialsFrPage() {
  const posts = await getPostsByCategory("Tutorials", "fr");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Tutoriels</h1>
        <p className="mt-2 theme-text-muted">Guides pratiques pour mettre l&apos;IA en production.</p>
      </div>
      <section className="mt-8 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
          ))
        ) : (
          <p className="motion-enter motion-delay-2">Aucun tutoriel pour le moment.</p>
        )}
      </section>
    </main>
  );
}
