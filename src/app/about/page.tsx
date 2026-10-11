import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getCatalog, labSummaries } from "@/lib/site/catalog";

export const metadata: Metadata = {
  title: "About AI Signals: Methodology & Data Sources",
  description: "How AI Signals collects, normalizes and verifies AI model prices every day, and how its articles are written.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { models, events, meta } = getCatalog();
  const base = getSiteUrl();
  return (
    <>
      <Breadcrumbs items={[{ href: "/about", label: "about" }]} />
      <h1>About AI Signals</h1>
      <div className="prose">
        <p>AI Signals tracks the list price, context window and capabilities of {models.length} AI models from {labSummaries(models).length} labs, refreshed every day at 06:00 UTC.</p>
        <h2>Data sources</h2>
        <p>Model data comes from <a href="https://models.dev" rel="noopener">models.dev</a>, an open-source database released under the MIT license (copyright the models.dev contributors). Prices of major labs are cross-checked daily against <a href="https://github.com/pydantic/genai-prices" rel="noopener">pydantic/genai-prices</a> (MIT).</p>
        <h2 id="data">Methodology</h2>
        <ul>
          <li>Prices are base-tier list prices in USD per million tokens.</li>
          <li>The reference price is the lab&apos;s own API. Open-weights models without a first-party API use the cheapest tracked host.</li>
          <li>Blended price = (3 × input + output) / 4, a common way to compare models on a typical 3:1 input/output mix.</li>
          <li>Price history is built from our daily snapshots and, before launch, from the public git history of models.dev (since June 2025).</li>
          <li>A refresh is rejected automatically if the source looks broken (sudden model loss, absurd prices, mass changes).</li>
        </ul>
        <h2>How articles are written</h2>
        <p>News articles and the weekly digest are generated automatically from our own data. An AI model (GPT-6.1 Sol) writes the text, and every number it uses is checked against the data before publication. If the check fails, a plain data template is published instead.</p>
        <h2>Corrections</h2>
        <p>Spotted a wrong price? Email <a href="mailto:hello@aisignals.dev">hello@aisignals.dev</a>, or contribute the fix upstream to models.dev.</p>
      </div>
      <Box title="dataset">
        <p className="muted">{models.length} models · {events.length} recorded changes · last refresh {meta?.lastSuccessAt ?? "n/a"}</p>
      </Box>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "AI model API prices and specs",
          description: "Daily list prices (USD per 1M tokens), context windows and capabilities of AI model APIs, with price history.",
          url: `${base}/about#data`,
          isBasedOn: "https://models.dev",
          creator: { "@type": "Organization", name: "AI Signals", url: base },
          dateModified: meta?.lastSuccessAt,
          variableMeasured: ["input price per 1M tokens", "output price per 1M tokens", "context window"],
        }}
      />
    </>
  );
}
