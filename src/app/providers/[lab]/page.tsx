import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EventFeed } from "@/components/event-feed";
import { ModelTable } from "@/components/model-table";
import { StatGrid } from "@/components/stat-grid";
import { getCatalog, labName, labSummaries, recentEvents } from "@/lib/site/catalog";
import { fmtUsd, monthYear } from "@/lib/site/format";
import { clampDescription, fitTitle } from "@/lib/site/seo";
import { modelRows } from "@/lib/site/rows";
import { modelUrl, providerUrl } from "@/lib/site/urls";

type Params = { lab: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return labSummaries(getCatalog().models).map((s) => ({ lab: s.lab }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lab } = await params;
  const summary = labSummaries(getCatalog().models).find((s) => s.lab === lab);
  if (!summary) return {};
  return {
    title: fitTitle(`${summary.name} API Pricing: All ${summary.models.length} Models (${monthYear(getCatalog().today)})`),
    description: clampDescription(`Every ${summary.name} model with input and output price per 1M tokens, context window and price history. Blended prices from ${fmtUsd(summary.minBlended)} to ${fmtUsd(summary.maxBlended)}.`),
    alternates: { canonical: providerUrl(lab) },
  };
}

export default async function ProviderPage({ params }: { params: Promise<Params> }) {
  const { lab } = await params;
  const { models, events } = getCatalog();
  const summary = labSummaries(models).find((s) => s.lab === lab);
  if (!summary) notFound();

  const all = models.filter((m) => m.lab === lab).sort((a, b) => a.blended - b.blended || a.id.localeCompare(b.id));
  const cheapest = summary.models.reduce((a, b) => (b.blended < a.blended ? b : a));
  const priciest = summary.models.reduce((a, b) => (b.blended > a.blended ? b : a));
  const releases = [...all].filter((m) => m.releaseDate).sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "")).slice(0, 15);

  return (
    <>
      <Breadcrumbs items={[{ href: "/providers", label: "providers" }, { href: providerUrl(lab), label: labName(lab) }]} />
      <h1>{summary.name} API pricing</h1>
      <p className="sub">{all.length} models tracked · USD per 1M tokens</p>
      <StatGrid
        stats={[
          { label: "active models", value: String(summary.models.length) },
          { label: "cheapest", value: fmtUsd(cheapest.blended), note: cheapest.name },
          { label: "most expensive", value: fmtUsd(priciest.blended), note: priciest.name },
          { label: "newest", value: releases[0]?.releaseDate ?? "n/a", note: releases[0]?.name },
        ]}
      />
      <Box title="models">
        <ModelTable rows={modelRows(all)} showLab={false} />
      </Box>
      <div className="grid-2">
        <Box title="release timeline">
          <ul className="feed">
            {releases.map((m) => <li key={m.id}><span className="dim">{m.releaseDate}</span> <Link href={modelUrl(m)}>{m.name}</Link></li>)}
          </ul>
        </Box>
        <Box title="recent changes">
          <EventFeed events={recentEvents(events.filter((e) => e.lab === lab), 20)} />
        </Box>
      </div>
    </>
  );
}
