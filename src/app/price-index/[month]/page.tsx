import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { StatGrid } from "@/components/stat-grid";
import { getSiteUrl } from "@/lib/site-url";
import { findModel, getPriceIndex, labName } from "@/lib/site/catalog";
import { fmtPct, fmtUsd } from "@/lib/site/format";
import { compareSnapshots, floorsOf, isReconstructed, labChanges, monthLabel, monthsAround, publishedOn, type IndexRow } from "@/lib/site/price-index";
import { alternatesFor, clampDescription, fitTitle } from "@/lib/site/seo";
import { modelUrl, ogImageUrl, priceIndexUrl } from "@/lib/site/urls";

type Params = { month: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getPriceIndex().series.map((p) => ({ month: p.month }));
}

function describe(month: string): string | null {
  const p = getPriceIndex().series.find((x) => x.month === month);
  if (!p) return null;
  const change = p.momPct === null ? "" : `, ${fmtPct(p.momPct)} on the previous month`;
  return `In ${monthLabel(month)}, the median AI model cost ${fmtUsd(p.median)} per 1M tokens on labs' own APIs${change}. ${p.added} models added, ${p.retired} retired, ${p.repriced} repriced.`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { month } = await params;
  const description = describe(month);
  if (!description) return {};
  const title = `AI Price Index, ${monthLabel(month)}: LLM API Prices`;
  return {
    title: fitTitle(title),
    description: clampDescription(description),
    alternates: alternatesFor(priceIndexUrl(month)),
    openGraph: { type: "article", title, description: clampDescription(description), images: [{ url: ogImageUrl("AI Price Index", monthLabel(month)), width: 1200, height: 630 }] },
  };
}

function ModelName({ row }: { row: IndexRow }) {
  return findModel(row.lab, row.slug) ? <Link href={modelUrl(row)}>{row.name}</Link> : <>{row.name}</>;
}

export default async function PriceIndexMonthPage({ params }: { params: Promise<Params> }) {
  const { month } = await params;
  const { snapshots, series } = getPriceIndex();
  const point = series.find((p) => p.month === month);
  const snapshot = snapshots.find((s) => s.month === month);
  if (!point || !snapshot) notFound();

  const { prev, next } = monthsAround(series.map((p) => p.month), month);
  const before = snapshots.find((s) => s.month === prev);
  const cmp = before ? compareSnapshots(before, snapshot) : null;
  const labs = before ? labChanges(before, snapshot).filter((l) => l.after !== null && l.pct !== 0).sort((a, b) => (b.pct ?? Infinity) - (a.pct ?? Infinity)) : [];
  const added = [...(cmp?.added ?? [])].sort((a, b) => b.blended - a.blended);
  const retired = [...(cmp?.retired ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const title = `AI Price Index: ${monthLabel(month)}`;
  const siteUrl = getSiteUrl();

  return (
    <article>
      <Breadcrumbs items={[{ href: priceIndexUrl(), label: "price index" }, { href: priceIndexUrl(month), label: monthLabel(month) }]} />
      <h1>{title}</h1>
      <p className="sub">
        {isReconstructed(month) ? `Rebuilt on ${publishedOn(month)} from the models.dev history` : `Published ${publishedOn(month)}`} · frozen, not revised afterwards · <Link href={priceIndexUrl()}>full index and methodology</Link>
      </p>
      <div className="prose"><p>{describe(month)}</p></div>
      <StatGrid
        stats={[
          { label: "index", value: String(point.index), note: "January 2026 = 100" },
          { label: "median price", value: fmtUsd(point.median), note: point.momPct === null ? "per 1M tokens, blended" : `${fmtPct(point.momPct)} vs last month` },
          { label: "budget / premium", value: `${fmtUsd(point.p10)} / ${fmtUsd(point.p90)}`, note: "10th / 90th percentile" },
          { label: "tracked", value: String(point.models), note: `models from ${point.labs} labs` },
        ]}
      />
      {cmp ? (
        <Box title="list price changes">
          {cmp.repriced.length === 0 ? (
            <p>No lab changed the list price of an existing model this month.</p>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th scope="col">model</th><th scope="col">lab</th><th scope="col">input $/1M</th><th scope="col">output $/1M</th><th scope="col">blended</th></tr></thead>
                <tbody>
                  {cmp.repriced.map((r) => (
                    <tr key={r.row.id}>
                      <td><ModelName row={r.row} /></td>
                      <td className="muted">{labName(r.row.lab)}</td>
                      <td>{fmtUsd(r.before.input)} → {fmtUsd(r.row.input)}</td>
                      <td>{fmtUsd(r.before.output)} → {fmtUsd(r.row.output)}</td>
                      <td className={r.pct === 0 ? "dim" : r.pct > 0 ? "up" : "dn"}>{fmtPct(r.pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Box>
      ) : null}
      {added.length > 0 ? (
        <Box title={`added this month (${added.length})`}>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">model</th><th scope="col">lab</th><th scope="col">input $/1M</th><th scope="col">output $/1M</th><th scope="col">blended</th></tr></thead>
              <tbody>
                {added.map((r) => (
                  <tr key={r.id}>
                    <td><ModelName row={r} /></td>
                    <td className="muted">{labName(r.lab)}</td>
                    <td>{fmtUsd(r.input)}</td>
                    <td>{fmtUsd(r.output)}</td>
                    <td>{fmtUsd(r.blended)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dim">New in the catalog this month, which can include renamed models or older models added late.</p>
        </Box>
      ) : null}
      {retired.length > 0 ? (
        <Box title={`retired this month (${retired.length})`}>
          <p className="muted">{retired.map((r) => `${r.name} (${fmtUsd(r.blended)})`).join(" · ")}</p>
        </Box>
      ) : null}
      {labs.length > 0 ? (
        <Box title="median price by lab, where it moved">
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">lab</th><th scope="col">{prev ? monthLabel(prev) : "before"}</th><th scope="col">{monthLabel(month)}</th><th scope="col">change</th></tr></thead>
              <tbody>
                {labs.map((l) => (
                  <tr key={l.lab}>
                    <td>{labName(l.lab)}</td>
                    <td>{l.before === null ? "—" : fmtUsd(l.before)}</td>
                    <td>{fmtUsd(l.after ?? 0)}</td>
                    <td className={l.pct === null ? "dim" : l.pct > 0 ? "up" : "dn"}>{l.pct === null ? "new" : fmtPct(l.pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      ) : null}
      <Box title="cheapest model by capability">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">capability</th><th scope="col">model</th><th scope="col">blended</th></tr></thead>
            <tbody>
              {floorsOf(snapshot).map((f) => (
                <tr key={f.id}>
                  <td>{f.label}</td>
                  <td><ModelName row={f.row} /></td>
                  <td>{fmtUsd(f.row.blended)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <p>
        {prev ? <Link className="btn" href={priceIndexUrl(prev)}>← {monthLabel(prev)}</Link> : null}
        {next ? <Link className="btn" href={priceIndexUrl(next)}>{monthLabel(next)} →</Link> : null}
        <Link className="btn" href={priceIndexUrl()}>full index</Link>
        <a className="btn" href={`/data/price-index/${month}.json`}>every model (json)</a>
      </p>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: describe(month),
          datePublished: publishedOn(month),
          dateModified: publishedOn(month),
          mainEntityOfPage: `${siteUrl}${priceIndexUrl(month)}`,
          image: `${siteUrl}${ogImageUrl("AI Price Index", monthLabel(month))}`,
          author: { "@type": "Organization", name: "AI Signals", url: siteUrl },
          publisher: { "@type": "Organization", name: "AI Signals", url: siteUrl },
        }}
      />
    </article>
  );
}
