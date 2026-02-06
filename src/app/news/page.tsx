import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "News",
  description: "AI news and ecosystem updates.",
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
