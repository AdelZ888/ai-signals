import { getPriceIndex } from "@/lib/site/catalog";

export const dynamic = "force-static";

const COLUMNS = ["month", "index", "median", "p10", "p90", "budgetIndex", "premiumIndex", "momPct", "sinceBasePct", "models", "labs", "added", "retired", "repriced", "cuts", "hikes"] as const;

export function GET() {
  const rows = getPriceIndex().series.map((p) => COLUMNS.map((c) => p[c] ?? "").join(","));
  return new Response(`${COLUMNS.join(",")}\n${rows.join("\n")}\n`, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'inline; filename="ai-price-index.csv"' },
  });
}
