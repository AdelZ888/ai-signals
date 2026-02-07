import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "News",
  description: "AI news and ecosystem updates.",
  alternates: {
    canonical: "/news",
    languages: {
      "en-US": "/news",
      "fr-FR": "/fr/news",
    },
  },
  openGraph: {
    type: "website",
    title: "AI News",
    description: "AI news and ecosystem updates.",
    url: "/news",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "AI News",
          subtitle: "Fresh updates and release breakdowns.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "AI News | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI News",
    description: "AI news and ecosystem updates.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "AI News",
        subtitle: "Fresh updates and release breakdowns.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

type Props = {
  searchParams?: { page?: string };
};

export default async function NewsPage({ searchParams }: Props) {
  const posts = await getPostsByCategory("News");
  const PAGE_SIZE = 12;
  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const parsed = Number.parseInt(String(searchParams?.page || "1"), 10);
  const page = Number.isFinite(parsed) ? Math.min(pageCount, Math.max(1, parsed)) : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const prevHref = page <= 2 ? "/news" : `/news?page=${page - 1}`;
  const nextHref = `/news?page=${page + 1}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">AI News</h1>
        <p className="mt-2 theme-text-muted">Fresh updates and release breakdowns.</p>
        {posts.length > 0 ? (
          <p className="mt-3 text-sm theme-text-faint">
            Showing <span className="theme-text-soft">{start + 1}</span>-
            <span className="theme-text-soft">{Math.min(start + PAGE_SIZE, posts.length)}</span> of{" "}
            <span className="theme-text-soft">{posts.length}</span>
          </p>
        ) : null}
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pagePosts.length > 0 ? (
          pagePosts.map((post, index) => (
            <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
          ))
        ) : (
          <p className="motion-enter motion-delay-2">No news posts yet.</p>
        )}
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
