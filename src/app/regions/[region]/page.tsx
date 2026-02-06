import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import {
  PRIMARY_REGIONS,
  getPostsByRegion,
  getRegionLabel,
  regionCodeToPath,
  regionPathToCode,
  type RegionCode,
} from "@/lib/posts";

type Params = {
  params: Promise<{ region: string }>;
};

export async function generateStaticParams() {
  return PRIMARY_REGIONS.map((region) => ({ region: regionCodeToPath(region) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region } = await params;
  const regionCode = regionPathToCode(region);

  if (!regionCode || regionCode === "GLOBAL") {
    return { title: "Region not found" };
  }

  return {
    title: `${getRegionLabel(regionCode)} coverage`,
    description: `AI updates and tutorials curated for ${getRegionLabel(regionCode)} audience context.`,
  };
}

export default async function RegionPage({ params }: Params) {
  const { region } = await params;
  const regionCode = regionPathToCode(region);

  if (!regionCode || regionCode === "GLOBAL") {
    notFound();
  }

  const posts = await getPostsByRegion(regionCode as RegionCode);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">{getRegionLabel(regionCode as RegionCode)} AI coverage</h1>
        <p className="mt-2 theme-text-muted">
          Region-specific updates and globally relevant posts interpreted for {getRegionLabel(regionCode as RegionCode)} readers.
        </p>
      </div>

      <section className="mt-8 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post, index) => <PostCard key={post.slug} post={post} delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />)
        ) : (
          <p className="motion-enter motion-delay-2">No posts yet for this region.</p>
        )}
      </section>
    </main>
  );
}
