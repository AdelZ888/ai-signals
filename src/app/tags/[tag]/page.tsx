import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { formatTagForPath, getAllPostsMeta, getAllTags, getPostsByTag } from "@/lib/posts";

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

async function getTagLocaleAvailability(tagSlug: string) {
  const [enPosts, frPosts] = await Promise.all([getPostsByTag(tagSlug, "en"), getPostsByTag(tagSlug, "fr")]);
  return { en: enPosts.length > 0, fr: frPosts.length > 0 };
}

export async function generateStaticParams() {
  // Keep builds fast as the content corpus grows: pre-render only the most common tags.
  const limit = Math.max(80, Math.min(1200, Number(process.env.STATIC_TAG_PARAMS_LIMIT || 160)));
  const posts = await getAllPostsMeta();
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = formatTagForPath(tag);
      if (!slug) continue;
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => ({ tag }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const label = await resolveTagLabel(tag);
  const availability = await getTagLocaleAvailability(tag);

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
        ...(availability.en ? { "en-US": `/tags/${tag}` } : null),
        ...(availability.fr ? { "fr-FR": `/fr/tags/${tag}` } : null),
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
    const frPosts = await getPostsByTag(tag, "fr");
    if (frPosts.length > 0) {
      permanentRedirect(`/fr/tags/${tag}`);
    }
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

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
