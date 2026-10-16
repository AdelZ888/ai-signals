import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CostCalculator } from "@/components/cost-calculator";
import { FaqList } from "@/components/faq-list";
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
      <Box title="how to estimate your token volume">
        <div className="prose">
          <p>
            LLM APIs bill input tokens (your prompt, system message, retrieved documents and chat history) and output tokens (the
            model&apos;s answer) separately, per million tokens. As a rule of thumb, one token is about three quarters of an English word,
            so 1M tokens is roughly 750,000 words.
          </p>
          <p>
            To size a workload, multiply requests per month by the average prompt and answer length. A support chatbot with 100,000
            conversations of 100 input and 20 output tokens per turn uses about 10M input and 2M output tokens a month. RAG apps are
            input-heavy because every query carries retrieved context; coding agents are output-heavy because they write long diffs.
          </p>
        </div>
      </Box>
      <Box title="faq">
        <FaqList
          items={[
            { q: "How is LLM API pricing calculated?", a: "Cost = input tokens × input price + output tokens × output price, with prices quoted per million tokens. This calculator uses each provider's base-tier list price." },
            { q: "Why is output more expensive than input?", a: "Generating tokens is slower and uses more compute than reading them, so most providers charge 3 to 5 times more for output tokens." },
            { q: "Are cached tokens and batch discounts included?", a: "No. Prompt caching and batch APIs can cut costs significantly; check each model page for cache prices." },
            { q: "How often are prices updated?", a: "Every day. Prices come from the open models.dev dataset and every change is logged in the changelog." },
          ]}
        />
      </Box>
    </>
  );
}
