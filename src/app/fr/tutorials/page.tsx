import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tutoriels",
  description: "Tutoriels IA pas a pas pour builders et equipes produit.",
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
