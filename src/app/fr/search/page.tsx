import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher des articles AI Signals en francais.",
  alternates: {
    canonical: "/fr/search",
    languages: {
      "en-US": "/search",
      "fr-FR": "/fr/search",
    },
  },
  openGraph: {
    type: "website",
    title: "Recherche",
    description: "Rechercher des articles AI Signals en francais.",
    url: "/fr/search",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Recherche",
          subtitle: "Trouver modeles, agents, tutoriels.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Recherche | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recherche",
    description: "Rechercher des articles AI Signals en francais.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Recherche",
        subtitle: "Trouver modeles, agents, tutoriels.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchFrPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();
  const posts = await getAllPostsMeta("fr");

  const filtered = query
    ? posts.filter((post) => {
        const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.category}`.toLowerCase();
        return haystack.includes(query);
      })
    : posts;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Recherche</h1>
      </div>
      <form className="mt-5 motion-enter motion-delay-1" action="/fr/search" method="get">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Rechercher modeles, agents, tutoriels..."
          className="w-full rounded-xl border theme-border-soft theme-surface px-4 py-3 outline-none ring-cyan-300 transition focus:ring"
        />
      </form>
      <p className="mt-4 text-sm theme-text-faint motion-enter motion-delay-2">{filtered.length} resultat(s)</p>

      <section className="mt-6 grid gap-4">
        {filtered.map((post, index) => (
          <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 3, 8)}`} />
        ))}
      </section>
    </main>
  );
}
