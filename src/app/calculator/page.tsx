import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CostCalculator } from "@/components/cost-calculator";
import { getCatalog } from "@/lib/site/catalog";
import { isActive, isIndexable } from "@/lib/site/selection";
import { modelUrl } from "@/lib/site/urls";
import { alternatesFor } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "AI API Cost Calculator: Compare Monthly LLM Costs",
  description: "Enter your monthly input and output tokens and compare the cost of every tracked AI model API, cheapest first.",
  alternates: alternatesFor("/calculator"),
};

export default function CalculatorPage() {
  const { models } = getCatalog();
  const rows = models
    .filter((m) => isActive(m) && isIndexable(m))
    .map((m) => ({ id: m.id, name: m.name, href: modelUrl(m), input: m.price.input, output: m.price.output }));
  return (
    <>
      <Breadcrumbs items={[{ href: "/calculator", label: "calculator" }]} />
      <h1>AI API cost calculator</h1>
      <p className="sub">Monthly cost at list price for {rows.length} models, cheapest first.</p>
      <Box title="cost calculator">
        <CostCalculator rows={rows} searchable />
      </Box>
    </>
  );
}
