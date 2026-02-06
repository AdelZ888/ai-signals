import type { MetadataRoute } from "next";

import { PRIMARY_REGIONS, getAllPostsMeta, regionCodeToPath } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postsEn = await getAllPostsMeta("en");
  const postsFr = await getAllPostsMeta("fr");

  const staticEnRoutes = ["", "/about", "/news", "/tutorials", "/search", "/regions"];
  const staticFrRoutes = ["/fr", "/fr/about", "/fr/news", "/fr/tutorials", "/fr/search", "/fr/regions"];

  const staticRoutes: MetadataRoute.Sitemap = [...staticEnRoutes, ...staticFrRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" || route === "/fr" ? 1 : 0.7,
  }));

  const regionRoutes: MetadataRoute.Sitemap = PRIMARY_REGIONS.flatMap((region) => {
    const pathValue = regionCodeToPath(region);
    return [
      {
        url: `${baseUrl}/regions/${pathValue}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/fr/regions/${pathValue}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ];
  });

  const postRoutesEn: MetadataRoute.Sitemap = postsEn.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postRoutesFr: MetadataRoute.Sitemap = postsFr.map((post) => ({
    url: `${baseUrl}/fr/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...regionRoutes, ...postRoutesEn, ...postRoutesFr];
}
