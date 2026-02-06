import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI Signals articles by keyword.",
  alternates: {
    canonical: "/search",
    languages: {
      "en-US": "/search",
      "fr-FR": "/fr/search",
    },
  },
  openGraph: {
    type: "website",
    title: "Search",
    description: "Search AI Signals articles by keyword.",
    url: "/search",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Search",
          subtitle: "Find models, agents, and tutorials.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Search | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search",
    description: "Search AI Signals articles by keyword.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Search",
        subtitle: "Find models, agents, and tutorials.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();
  const posts = await getAllPostsMeta();

  const filtered = query
    ? posts.filter((post) => {
        const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.category}`.toLowerCase();
        return haystack.includes(query);
      })
    : posts;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Search</h1>
      </div>
      <form className="mt-5 motion-enter motion-delay-1" action="/search" method="get">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search models, agents, tutorials..."
          className="w-full rounded-xl border theme-border-soft theme-surface px-4 py-3 outline-none ring-cyan-300 transition focus:ring"
        />
      </form>
      <p className="mt-4 text-sm theme-text-faint motion-enter motion-delay-2">{filtered.length} result(s)</p>

      <section className="mt-6 grid gap-4">
        {filtered.map((post, index) => (
          <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 3, 8)}`} />
        ))}
      </section>
    </main>
  );
}
