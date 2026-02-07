import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { formatTagForPath, getAllTags, getPostsByTag } from "@/lib/posts";

type Props = {
  params: Promise<{ tag: string }>;
  searchParams?: { page?: string };
};

type Params = {
  params: Promise<{ tag: string }>;
};

async function resolveTagLabel(tagSlug: string) {
  const tags = await getAllTags();
  const normalized = formatTagForPath(tagSlug);
  const match = tags.find((tag) => formatTagForPath(tag) === normalized);
  return match || tagSlug;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: formatTagForPath(tag) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const label = await resolveTagLabel(tag);

  const title = `Tag: ${label}`;
  const description = `Posts tagged with ${label}.`;
  const ogUrl = `/api/og?${new URLSearchParams({
    title,
    subtitle: description,
    locale: "en",
    kind: "page",
    kicker: "Tag",
  }).toString()}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/tags/${tag}`,
      languages: {
        "en-US": `/tags/${tag}`,
        "fr-FR": `/fr/tags/${tag}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/tags/${tag}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const label = await resolveTagLabel(tag);
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  const PAGE_SIZE = 12;
  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const parsed = Number.parseInt(String(searchParams?.page || "1"), 10);
  const page = Number.isFinite(parsed) ? Math.min(pageCount, Math.max(1, parsed)) : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const base = `/tags/${tag}`;
  const prevHref = page <= 2 ? base : `${base}?page=${page - 1}`;
  const nextHref = `${base}?page=${page + 1}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Tag: {label}</h1>
        <p className="mt-3 text-sm theme-text-faint">
          Showing <span className="theme-text-soft">{start + 1}</span>-
          <span className="theme-text-soft">{Math.min(start + PAGE_SIZE, posts.length)}</span> of{" "}
          <span className="theme-text-soft">{posts.length}</span>
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {pagePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
        ))}
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
