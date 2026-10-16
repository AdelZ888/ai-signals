import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModelTable } from "@/components/model-table";
import { getCatalog } from "@/lib/site/catalog";
import { modelRows } from "@/lib/site/rows";

export const metadata: Metadata = {
  title: "LLM API Pricing Comparison: All AI Models",
  description: "Compare the API pricing of every major LLM: input and output price per 1M tokens, context window and 30-day price change. Updated daily.",
  alternates: { canonical: "/models" },
};

export default function ModelsPage() {
  const { models, meta } = getCatalog();
  const rows = modelRows([...models].sort((a, b) => a.blended - b.blended || a.id.localeCompare(b.id)));
  return (
    <>
      <Breadcrumbs items={[{ href: "/models", label: "models" }]} />
      <h1>All AI models: API pricing &amp; specs</h1>
      <p className="sub">{models.length} models · USD per 1M tokens · verified {meta?.lastSuccessAt.slice(0, 10) ?? "n/a"}</p>
      <Box title="models">
        <ModelTable rows={rows} searchable />
      </Box>
    </>
  );
}
