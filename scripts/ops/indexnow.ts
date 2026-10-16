import { listArticles } from "../../src/lib/site/articles.ts";
import { getCatalog, getPairs } from "../../src/lib/site/catalog.ts";
import { alternativesPageModels } from "../../src/lib/site/selection.ts";
import { changedUrls, indexNowPayload } from "./indexnow-urls.ts";

const BASE = (process.env.SITE_BASE ?? "https://aisignals.dev").replace(/\/+$/u, "");
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function text(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

/** Every URL listed in the live sitemaps (used for the initial full submission). */
async function sitemapUrls(): Promise<string[]> {
  const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]);
  const files = locs(await text(`${BASE}/sitemap.xml`));
  return (await Promise.all(files.map(async (f) => locs(await text(f))))).flat();
}

async function main(): Promise<number> {
  let urls: string[];
  if (process.argv.includes("--all")) {
    urls = await sitemapUrls();
  } else {
    const { models, events, today } = getCatalog();
    urls = changedUrls({
      base: BASE,
      today: process.env.INDEXNOW_DATE ?? today,
      events,
      articles: listArticles(),
      models,
      pairs: getPairs(),
      alternativesFor: new Set(alternativesPageModels(models, today).map((m) => m.id)),
    });
  }
  if (urls.length === 0) {
    console.log("[indexnow] nothing changed today");
    return 0;
  }
  if (process.env.DRY_RUN === "1") {
    console.log(`[indexnow] DRY RUN ${urls.length} urls\n${urls.slice(0, 20).join("\n")}`);
    return 0;
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(BASE, urls)),
    signal: AbortSignal.timeout(30_000),
  });
  console.log(`[indexnow] submitted ${urls.length} urls -> HTTP ${res.status}`);
  return res.status === 200 || res.status === 202 ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[indexnow] failed:", error);
    process.exit(1);
  },
);
