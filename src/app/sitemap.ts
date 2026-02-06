import type { MetadataRoute } from "next";

import { PRIMARY_REGIONS, getAllPostsMeta, regionCodeToPath } from "@/lib/posts";
import { getAllNewslettersMeta } from "@/lib/newsletters";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const postsEn = await getAllPostsMeta("en");
  const postsFr = await getAllPostsMeta("fr");
  const newslettersEn = await getAllNewslettersMeta("en");
  const newslettersFr = await getAllNewslettersMeta("fr");

  const staticEnRoutes = ["", "/start-here", "/about", "/news", "/tutorials", "/search", "/regions", "/newsletter"];
  const staticFrRoutes = [
    "/fr",
    "/fr/start-here",
    "/fr/about",
    "/fr/news",
    "/fr/tutorials",
    "/fr/search",
    "/fr/regions",
    "/fr/newsletter",
  ];

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

  const newsletterRoutesEn: MetadataRoute.Sitemap = newslettersEn.map((issue) => ({
    url: `${baseUrl}/newsletter/${issue.slug}`,
    lastModified: new Date(issue.date),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const newsletterRoutesFr: MetadataRoute.Sitemap = newslettersFr.map((issue) => ({
    url: `${baseUrl}/fr/newsletter/${issue.slug}`,
    lastModified: new Date(issue.date),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...regionRoutes, ...postRoutesEn, ...postRoutesFr, ...newsletterRoutesEn, ...newsletterRoutesFr];
}
