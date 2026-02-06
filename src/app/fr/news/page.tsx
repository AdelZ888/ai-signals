import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Actualites",
  description: "Actualites IA et analyses de changements du secteur.",
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
