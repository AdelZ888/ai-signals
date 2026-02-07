import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Actualités IA et analyses de changements du secteur.",
  alternates: {
    canonical: "/fr/news",
    languages: {
      "en-US": "/news",
      "fr-FR": "/fr/news",
    },
  },
  openGraph: {
    type: "website",
    title: "Actualités IA",
    description: "Actualités IA et analyses de changements du secteur.",
    url: "/fr/news",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Actualités IA",
          subtitle: "Les sorties importantes et leur impact concret.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Actualités IA | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Actualités IA",
    description: "Actualités IA et analyses de changements du secteur.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Actualités IA",
        subtitle: "Les sorties importantes et leur impact concret.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

type Props = {
  searchParams?: { page?: string };
};

export default async function NewsFrPage({ searchParams }: Props) {
  const posts = await getPostsByCategory("News", "fr");
  const PAGE_SIZE = 12;
  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const parsed = Number.parseInt(String(searchParams?.page || "1"), 10);
  const page = Number.isFinite(parsed) ? Math.min(pageCount, Math.max(1, parsed)) : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const prevHref = page <= 2 ? "/fr/news" : `/fr/news?page=${page - 1}`;
  const nextHref = `/fr/news?page=${page + 1}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Actualités IA</h1>
        <p className="mt-2 theme-text-muted">Les sorties importantes et leur impact concret.</p>
        {posts.length > 0 ? (
          <p className="mt-3 text-sm theme-text-faint">
            Affichage <span className="theme-text-soft">{start + 1}</span>-
            <span className="theme-text-soft">{Math.min(start + PAGE_SIZE, posts.length)}</span> sur{" "}
            <span className="theme-text-soft">{posts.length}</span>
          </p>
        ) : null}
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {pagePosts.length > 0 ? (
          pagePosts.map((post, index) => (
            <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
          ))
        ) : (
          <p className="motion-enter motion-delay-2">Aucun article d&apos;actualité pour le moment.</p>
        )}
      </section>

      {pageCount > 1 ? (
        <nav className="pager motion-enter motion-delay-3" aria-label="Pagination">
          <div className="flex flex-wrap items-center gap-2">
            {page > 1 ? (
              <Link className="pager-link" href={prevHref}>
                Precedent
              </Link>
            ) : null}
            <span className="pager-meta">
              Page <span className="theme-text-soft">{page}</span> / <span className="theme-text-soft">{pageCount}</span>
            </span>
          </div>
          {page < pageCount ? (
            <Link className="pager-link pager-link-primary" href={nextHref}>
              Charger plus
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
