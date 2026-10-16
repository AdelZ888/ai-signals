import { getSiteUrl } from "@/lib/site-url";
import { getCatalog } from "@/lib/site/catalog";
import { DATA_LICENSE, datasetRows } from "@/lib/site/dataset";

export const dynamic = "force-static";

export function GET() {
  const { models, meta } = getCatalog();
  const rows = datasetRows(models, getSiteUrl());
  const body = {
    name: "AI model API prices and specs",
    description: "List prices (USD per 1M tokens), context windows and capabilities of AI model APIs, refreshed daily.",
    license: DATA_LICENSE,
    source: "https://models.dev",
    updated: meta?.lastSuccessAt ?? null,
    count: rows.length,
    models: rows,
  };
  return Response.json(body, { headers: { "cache-control": "public, max-age=3600" } });
}
