import type { Metadata } from "next";
import Link from "next/link";

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
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = (q || "").trim().toLowerCase();
  const posts = await getAllPostsMeta();

  const filtered = query
    ? posts.filter((post) => {
        const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.category}`.toLowerCase();
        return haystack.includes(query);
      })
    : posts;

  const PAGE_SIZE = 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const parsed = Number.parseInt(String(pageParam || "1"), 10);
  const page = Number.isFinite(parsed) ? Math.min(pageCount, Math.max(1, parsed)) : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = filtered.slice(start, start + PAGE_SIZE);

  const base = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
  const pageSep = base.includes("?") ? "&" : "?";
  const prevHref = page <= 2 ? base : `${base}${pageSep}page=${page - 1}`;
  const nextHref = `${base}${pageSep}page=${page + 1}`;

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
      <p className="mt-4 text-sm theme-text-faint motion-enter motion-delay-2">
        {filtered.length === 0 ? (
          "0 result(s)"
        ) : (
          <>
            Showing <span className="theme-text-soft">{start + 1}</span>-<span className="theme-text-soft">{Math.min(start + PAGE_SIZE, filtered.length)}</span> of{" "}
            <span className="theme-text-soft">{filtered.length}</span>
          </>
        )}
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pagePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 3, 8)}`} />
        ))}
        {filtered.length === 0 ? <p className="text-sm theme-text-faint">Try a different keyword.</p> : null}
      </section>

      {pageCount > 1 ? (
        <nav className="pager motion-enter motion-delay-3" aria-label="Pagination">
          <div className="flex flex-wrap items-center gap-2">
            {page > 1 ? (
              <Link className="pager-link" href={prevHref}>
                Previous
              </Link>
            ) : null}
            <span className="pager-meta">
              Page <span className="theme-text-soft">{page}</span> of <span className="theme-text-soft">{pageCount}</span>
            </span>
          </div>
          {page < pageCount ? (
            <Link className="pager-link pager-link-primary" href={nextHref}>
              Load more
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
