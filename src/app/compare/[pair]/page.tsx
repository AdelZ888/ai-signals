import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Model } from "@/lib/data/types";
import { getCatalog, labName } from "@/lib/site/catalog";
import { SCENARIOS, monthlyCost } from "@/lib/site/cost";
import { fmtTokens, fmtUsd, fmtUsdCost, yesNo } from "@/lib/site/format";
import { clampDescription, compareTitle, fitTitle } from "@/lib/site/seo";
import { comparisonPairs, type Pair } from "@/lib/site/selection";
import { compareUrl, modelUrl, ogImageUrl } from "@/lib/site/urls";
import { compareVerdict } from "@/lib/site/verdict";

type Params = { pair: string };

export const dynamicParams = true;

export function generateStaticParams(): Params[] {
  const { models, today } = getCatalog();
  return comparisonPairs(models, today).map((p) => ({ pair: p.key }));
}

function resolvePair(key: string): { pair: Pair; all: Pair[] } | { redirectTo: string } | null {
  const { models, today } = getCatalog();
  const all = comparisonPairs(models, today);
  const pair = all.find((p) => p.key === key);
  if (pair) return { pair, all };
  const parts = key.split("-vs-");
  const reversed = parts.length === 2 ? `${parts[1]}-vs-${parts[0]}` : "";
  return all.some((p) => p.key === reversed) ? { redirectTo: compareUrl(reversed) } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolvePair((await params).pair);
  if (!r || "redirectTo" in r) return {};
  const { a, b, key } = r.pair;
  return {
    title: fitTitle(compareTitle(a, b, getCatalog().today)),
    description: clampDescription(`${a.name} vs ${b.name}: ${fmtUsd(a.price.input)} vs ${fmtUsd(b.price.input)} per 1M input tokens, ${fmtTokens(a.context)} vs ${fmtTokens(b.context)} context. Side-by-side specs and monthly costs.`),
    alternates: { canonical: compareUrl(key) },
    openGraph: { images: [{ url: ogImageUrl(`${a.name} vs ${b.name}`, "price & specs compared"), width: 1200, height: 630 }] },
  };
}

type Row = { label: string; a: string; b: string; better?: "a" | "b" | null };

function lower(x: number, y: number): "a" | "b" | null {
  if (x === y) return null;
  return x < y ? "a" : "b";
}

function specRows(a: Model, b: Model): Row[] {
  return [
    { label: "input / 1M", a: fmtUsd(a.price.input), b: fmtUsd(b.price.input), better: lower(a.price.input, b.price.input) },
    { label: "output / 1M", a: fmtUsd(a.price.output), b: fmtUsd(b.price.output), better: lower(a.price.output, b.price.output) },
    { label: "blended (3:1)", a: fmtUsd(a.blended), b: fmtUsd(b.blended), better: lower(a.blended, b.blended) },
    { label: "cache read / 1M", a: a.price.cacheRead !== undefined ? fmtUsd(a.price.cacheRead) : "—", b: b.price.cacheRead !== undefined ? fmtUsd(b.price.cacheRead) : "—" },
    { label: "context", a: fmtTokens(a.context), b: fmtTokens(b.context), better: lower(b.context, a.context) },
    { label: "max output", a: fmtTokens(a.maxOutput), b: fmtTokens(b.maxOutput) },
    { label: "input types", a: a.modalitiesIn.join(" · "), b: b.modalitiesIn.join(" · ") },
    { label: "reasoning", a: yesNo(a.capabilities.reasoning), b: yesNo(b.capabilities.reasoning) },
    { label: "tool calling", a: yesNo(a.capabilities.toolCall), b: yesNo(b.capabilities.toolCall) },
    { label: "structured output", a: yesNo(a.capabilities.structuredOutput), b: yesNo(b.capabilities.structuredOutput) },
    { label: "open weights", a: yesNo(a.openWeights), b: yesNo(b.openWeights) },
    { label: "released", a: a.releaseDate ?? "n/a", b: b.releaseDate ?? "n/a" },
    { label: "knowledge cutoff", a: a.knowledgeCutoff ?? "n/a", b: b.knowledgeCutoff ?? "n/a" },
    { label: "lab", a: labName(a.lab), b: labName(b.lab) },
  ];
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const r = resolvePair((await params).pair);
  if (!r) notFound();
  if ("redirectTo" in r) permanentRedirect(r.redirectTo);
  const { a, b, key } = r.pair;
  const others = r.all.filter((p) => p.key !== key && (p.a.id === a.id || p.b.id === a.id || p.a.id === b.id || p.b.id === b.id)).slice(0, 8);

  return (
    <>
      <Breadcrumbs items={[{ href: "/compare", label: "compare" }, { href: compareUrl(key), label: `${a.name} vs ${b.name}` }]} />
      <h1>{a.name} vs {b.name}</h1>
      <p className="sub">Price and specs side by side · USD per 1M tokens · verified {getCatalog().today}</p>
      <Box title="side by side">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th scope="col">metric</th><th scope="col"><Link href={modelUrl(a)}>{a.name}</Link></th><th scope="col"><Link href={modelUrl(b)}>{b.name}</Link></th></tr>
            </thead>
            <tbody>
              {specRows(a, b).map((row) => (
                <tr key={row.label}>
                  <td className="muted">{row.label}</td>
                  <td className={row.better === "a" ? "dn" : undefined}>{row.a}</td>
                  <td className={row.better === "b" ? "dn" : undefined}>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="monthly cost scenarios">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">workload</th><th scope="col">tokens in / out</th><th scope="col">{a.name}</th><th scope="col">{b.name}</th></tr></thead>
            <tbody>
              {SCENARIOS.map((s) => {
                const ca = monthlyCost(a.price, s.inputTokens, s.outputTokens);
                const cb = monthlyCost(b.price, s.inputTokens, s.outputTokens);
                return (
                  <tr key={s.id}>
                    <td>{s.label}</td>
                    <td className="muted">{fmtTokens(s.inputTokens)} / {fmtTokens(s.outputTokens)}</td>
                    <td className={ca < cb ? "dn" : undefined}>{fmtUsdCost(ca)}</td>
                    <td className={cb < ca ? "dn" : undefined}>{fmtUsdCost(cb)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="verdict">
        <ul className="feed">{compareVerdict(a, b).map((line) => <li key={line}>{line}</li>)}</ul>
      </Box>
      <AdSlot />
      {others.length > 0 ? (
        <Box title="related comparisons">
          {others.map((p) => <Link key={p.key} className="btn" href={compareUrl(p.key)}>{p.a.name} vs {p.b.name}</Link>)}
        </Box>
      ) : null}
    </>
  );
}
