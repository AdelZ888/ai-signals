import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { formatTagForPath, getAllTags, getPostsByTag, parseTagFromPath } from "@/lib/posts";

type Params = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: formatTagForPath(tag) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const label = parseTagFromPath(tag);

  return {
    title: `Tag: ${label}`,
    description: `Posts tagged with ${label}.`,
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const label = parseTagFromPath(tag);
  const posts = await getPostsByTag(label);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-black tracking-tight motion-enter">Tag: {label}</h1>
      <section className="mt-8 grid gap-4">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
        ))}
      </section>
    </main>
  );
}
