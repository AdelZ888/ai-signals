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
    return { title: "Région introuvable" };
  }

  const title = `Couverture ${getRegionLabel(regionCode, "fr")}`;
  const description = `Actualités et tutoriels IA adaptés au contexte ${getRegionLabel(regionCode, "fr")}.`;
  const ogUrl = `/api/og?${new URLSearchParams({
    title,
    subtitle: description,
    locale: "fr",
    kind: "page",
    kicker: "Région",
  }).toString()}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/fr/regions/${region}`,
      languages: {
        "en-US": `/regions/${region}`,
        "fr-FR": `/fr/regions/${region}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/fr/regions/${region}`,
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

export default async function RegionFrPage({ params }: Params) {
  const { region } = await params;
  const regionCode = regionPathToCode(region);

  if (!regionCode || regionCode === "GLOBAL") {
    notFound();
  }

  const posts = await getPostsByRegion(regionCode as RegionCode, "fr");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="motion-enter">
        <h1 className="text-4xl font-black tracking-tight">Couverture IA {getRegionLabel(regionCode as RegionCode, "fr")}</h1>
        <p className="mt-2 theme-text-muted">
          Articles régionaux et contenus globaux interprétés pour les lecteurs {getRegionLabel(regionCode as RegionCode, "fr")}.
        </p>
      </div>

      <section className="mt-8 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard key={post.slug} post={post} locale="fr" delayClass={`motion-delay-${Math.min(index + 2, 8)}`} />
          ))
        ) : (
          <p className="motion-enter motion-delay-2">Aucun article pour cette région.</p>
        )}
      </section>
    </main>
  );
}
