import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tutorials",
  description: "Hands-on AI tutorials and implementation guides.",
  alternates: {
    canonical: "/tutorials",
    languages: {
      "en-US": "/tutorials",
      "fr-FR": "/fr/tutorials",
    },
  },
  openGraph: {
    type: "website",
    title: "Tutorials",
    description: "Hands-on AI tutorials and implementation guides.",
    url: "/tutorials",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Tutorials",
          subtitle: "Step-by-step guides for AI builders and operators.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Tutorials | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutorials",
    description: "Hands-on AI tutorials and implementation guides.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Tutorials",
        subtitle: "Step-by-step guides for AI builders and operators.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default async function TutorialsPage() {
  const posts = await getPostsByCategory("Tutorials");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Tutorials</h1>
        <p className="mt-2 theme-text-muted">Step-by-step guides for AI builders and operators.</p>
      </div>
      <section className="mt-8 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post, index) => <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />)
        ) : (
          <p className="motion-enter motion-delay-2">No tutorials yet.</p>
        )}
      </section>
    </main>
  );
}
