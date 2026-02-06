import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Actualites",
  description: "Actualites IA et analyses de changements du secteur.",
  alternates: {
    canonical: "/fr/news",
    languages: {
      "en-US": "/news",
      "fr-FR": "/fr/news",
    },
  },
  openGraph: {
    type: "website",
    title: "Actualites IA",
    description: "Actualites IA et analyses de changements du secteur.",
    url: "/fr/news",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Actualites IA",
          subtitle: "Les sorties importantes et leur impact concret.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Actualites IA | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Actualites IA",
    description: "Actualites IA et analyses de changements du secteur.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Actualites IA",
        subtitle: "Les sorties importantes et leur impact concret.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function NewsFrPage() {
  const posts = await getPostsByCategory("News", "fr");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Actualites IA</h1>
        <p className="mt-2 theme-text-muted">Les sorties importantes et leur impact concret.</p>
      </div>
      <section className="mt-8 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
          ))
        ) : (
          <p className="motion-enter motion-delay-2">Aucun article actualite pour le moment.</p>
        )}
      </section>
    </main>
  );
}
