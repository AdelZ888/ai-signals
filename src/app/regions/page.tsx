import type { Metadata } from "next";
import Link from "next/link";

import { PRIMARY_REGIONS, getAllPostsMeta, getRegionCounts, getRegionLabel, regionCodeToPath } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Regions",
  description: "Regional AI coverage for the US, UK, and France.",
};

export default async function RegionsPage() {
  const [counts, allPosts] = await Promise.all([getRegionCounts(), getAllPostsMeta()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Regional coverage</h1>
        <p className="mt-2 theme-text-muted">Browse AI signals by market context: US, UK, or France.</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {PRIMARY_REGIONS.map((region, index) => {
          const regionPosts = allPosts.filter((post) => post.region === region).slice(0, 2);
          return (
            <article
              key={region}
              className={`rounded-2xl border theme-border theme-surface p-5 motion-card motion-enter motion-delay-${Math.min(index + 2, 8)}`}
            >
              <h2 className="text-2xl font-bold tracking-tight">{getRegionLabel(region)}</h2>
              <p className="mt-1 text-sm theme-text-faint">{counts[region]} dedicated post(s)</p>
              <div className="mt-4 space-y-2">
                {regionPosts.length > 0 ? (
                  regionPosts.map((post) => (
                    <Link key={post.slug} href={`/posts/${post.slug}`} className="block text-sm motion-link theme-text-muted hover:text-cyan-300">
                      {post.title}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm theme-text-faint">No posts yet. New regional posts are generated automatically.</p>
                )}
              </div>
              <Link
                href={`/regions/${regionCodeToPath(region)}`}
                className="mt-5 inline-block rounded-lg border theme-border-soft px-3 py-2 text-sm theme-text-soft transition hover:border-cyan-300 hover:text-cyan-300"
              >
                Open {getRegionLabel(region)}
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
