import { getSiteUrl } from "@/lib/site-url";
import { getCatalog, labSummaries } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { GUIDES_DIR, listArticles } from "@/lib/site/articles";
import { BEST_LISTS } from "@/lib/site/selection";
import { bestUrl, guideUrl, providerUrl } from "@/lib/site/urls";

export const dynamic = "force-static";

/** llms.txt (https://llmstxt.org): a map of the site for AI assistants and answer engines. */
export function GET() {
  const base = getSiteUrl();
  const { models, meta } = getCatalog();
  const labs = labSummaries(models);
  const lines = [
    "# AI Signals",
    "",
    `> Daily list prices (USD per 1M tokens), context windows and capabilities of ${models.length} AI model APIs from ${labs.length} labs, with comparisons, rankings and a cost calculator. Last refresh: ${meta?.lastSuccessAt ?? "n/a"}. Data derived from models.dev (MIT).`,
    "",
    "Blended price = (3 × input + output) / 4. Prices are base-tier list prices; always confirm with the provider.",
    "",
    "## Main pages",
    `- [All AI models](${base}/models): searchable table of every model's input/output price, context window and 30-day change`,
    `- [Cost calculator](${base}/calculator): monthly cost of any token volume across all models`,
    `- [Comparisons](${base}/compare): head-to-head pages (price, specs, monthly cost scenarios)`,
    `- [Changelog](${base}/changes): new models, price cuts and increases, deprecations`,
    `- [News](${base}/news): articles and the weekly pricing digest`,
    `- [Methodology](${base}/about): sources and how prices are normalized`,
    "",
    "## Guides",
    ...listArticles(GUIDES_DIR).map((g) => `- [${g.title}](${base}${guideUrl(g.slug)}): ${g.description}`),
    "",
    "## Rankings",
    ...BEST_LISTS.map((l) => `- [${l.title}](${base}${bestUrl(l.slug)}): ${l.description}`),
    "",
    "## Providers",
    ...labs.map((s) => `- [${s.name}](${base}${providerUrl(s.lab)}): ${s.models.length} models, blended ${fmtUsd(s.minBlended)} to ${fmtUsd(s.maxBlended)} per 1M tokens`),
    "",
    "## Data",
    `- [models.json](${base}/data/models.json): full dataset (JSON)`,
    `- [models.csv](${base}/data/models.csv): full dataset (CSV)`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
