import type { Metadata } from "next";

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

export default async function NewsPage() {
  const posts = await getPostsByCategory("News");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">AI News</h1>
        <p className="mt-2 theme-text-muted">Fresh updates and release breakdowns.</p>
      </div>
      <section className="mt-8 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post, index) => <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />)
        ) : (
          <p className="motion-enter motion-delay-2">No news posts yet.</p>
        )}
      </section>
    </main>
  );
}
