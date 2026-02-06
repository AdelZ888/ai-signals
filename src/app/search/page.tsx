import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI Signals articles by keyword.",
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
