import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CostCalculator, type CalcRow } from "@/components/cost-calculator";
import { FaqList } from "@/components/faq-list";
import { ModelLayout } from "@/components/model-layout";
import { PriceChart } from "@/components/price-chart";
import { StatGrid } from "@/components/stat-grid";
import { pct } from "@/lib/data/diff";
import type { Model } from "@/lib/data/types";
import { findModel, getCatalog, hostName, isFirstPartyPrice, labName } from "@/lib/site/catalog";
import { monthlyCost } from "@/lib/site/cost";
import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost, yesNo } from "@/lib/site/format";
import { priceHistory } from "@/lib/site/history";
import { fitTitle, modelDescription, modelTitle } from "@/lib/site/seo";
import { alternatives, comparisonPairs, isIndexable, makePair } from "@/lib/site/selection";
import { compareUrl, modelUrl, ogImageUrl, providerUrl } from "@/lib/site/urls";

type Params = { lab: string; slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCatalog().models.map((m) => ({ lab: m.lab, slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lab, slug } = await params;
  const model = findModel(lab, slug);
  if (!model) return {};
  const url = modelUrl(model);
  return {
    title: fitTitle(modelTitle(model, getCatalog().today)),
    description: modelDescription(model, labName(model.lab)),
    alternates: { canonical: url },
    robots: isIndexable(model) ? undefined : { index: false, follow: true },
    openGraph: {
      url,
      images: [{ url: ogImageUrl(`${model.name} pricing`, `${fmtUsd(model.price.input)} in · ${fmtUsd(model.price.output)} out per 1M tokens`), width: 1200, height: 630 }],
    },
  };
}

const toCalcRow = (m: Model): CalcRow => ({ id: m.id, name: m.name, href: modelUrl(m), input: m.price.input, output: m.price.output });

function buildFaq(model: Model, alts: Model[], source: string | null): { q: string; a: string }[] {
  const p = model.price;
  const tiers = (p.tiers ?? []).map((t) => ` Prompts above ${fmtTokens(t.minContext)} tokens are billed at ${fmtUsd(t.input)} input and ${fmtUsd(t.output)} output.`).join("");
  const items = [
    {
      q: `How much does ${model.name} cost?`,
      a: `${model.name} costs ${fmtUsd(p.input)} per million input tokens and ${fmtUsd(p.output)} per million output tokens${source ? ` (cheapest tracked host: ${source})` : ""}. At 50M input and 10M output tokens per month that is about ${fmtUsdCost(monthlyCost(p, 50_000_000, 10_000_000))}.${tiers}`,
    },
    {
      q: `What is the context window of ${model.name}?`,
      a: `${fmtTokens(model.context)} tokens${model.maxOutput ? `, with up to ${fmtTokens(model.maxOutput)} output tokens per request` : ""}.`,
    },
  ];
  if (p.cacheRead !== undefined) {
    items.push({
      q: `Does ${model.name} support prompt caching?`,
      a: `Yes. Cached input tokens cost ${fmtUsd(p.cacheRead)} per million${p.cacheWrite !== undefined ? ` and cache writes cost ${fmtUsd(p.cacheWrite)} per million` : ""}.`,
    });
  }
  const cheaper = alts.filter((a) => a.blended < model.blended).slice(0, 3);
  if (cheaper.length > 0) {
    items.push({
      q: `What are cheaper alternatives to ${model.name}?`,
      a: `${cheaper.map((a) => `${a.name} (${fmtUsd(a.price.input)} in / ${fmtUsd(a.price.output)} out)`).join(", ")} offer the same input types and capabilities for less.`,
    });
  }
  if (model.openWeights) {
    const host = model.hosts[0];
    items.push({
      q: `Is ${model.name} open weights?`,
      a: `Yes.${host ? ` It is available from ${model.hosts.length} tracked hosts; the cheapest is ${hostName(host.provider)} at ${fmtUsd(host.input)} input and ${fmtUsd(host.output)} output per million tokens.` : ""}`,
    });
  }
  return items;
}

export default async function ModelPage({ params }: { params: Promise<Params> }) {
  const { lab, slug } = await params;
  const model = findModel(lab, slug);
  if (!model) notFound();

  const { models, events, meta, today } = getCatalog();
  const alts = alternatives(model, models, 5);
  const pairKeys = new Set(comparisonPairs(models, today).map((p) => p.key));
  const compareLinks = models
    .filter((m) => m.id !== model.id)
    .map((m) => makePair(model, m))
    .filter((p) => pairKeys.has(p.key))
    .slice(0, 6);
  const source = isFirstPartyPrice(model) ? null : hostName(model.priceSource);
  const verified = (meta?.lastSuccessAt ?? today).slice(0, 10);
  const p = model.price;

  return (
    <>
      <Breadcrumbs items={[{ href: "/models", label: "models" }, { href: providerUrl(model.lab), label: labName(model.lab) }, { href: modelUrl(model), label: model.name }]} />
      <h1>{model.name} pricing &amp; specs</h1>
      <p className="sub">
        <Link href={providerUrl(model.lab)}>{labName(model.lab)}</Link> · released {model.releaseDate ?? "n/a"} · <span className="ok">● verified {verified}</span>
        {model.status !== "active" ? <> · <span className="tag warn">{model.status}</span></> : null}
      </p>
      {model.status === "deprecated" && alts[0] ? (
        <p className="up">This model is deprecated. Cheapest compatible replacement: <Link href={modelUrl(alts[0])}>{alts[0].name}</Link>.</p>
      ) : null}
      <StatGrid
        stats={[
          { label: "input / 1M", value: fmtUsd(p.input), note: source ? `via ${source}` : undefined },
          { label: "output / 1M", value: fmtUsd(p.output), note: source ? `via ${source}` : undefined },
          { label: "context", value: fmtTokens(model.context) },
          { label: "max output", value: fmtTokens(model.maxOutput) },
        ]}
      />
      <ModelLayout
        main={
          <>
            <Box title="price history ($/1M tokens)" className="o-chart">
              <PriceChart points={priceHistory(model, events, today)} />
            </Box>
            <Box title="cheaper or similar alternatives" className="o-alt">
              {alts.length === 0 ? <p className="dim">No compatible alternative tracked.</p> : (
                <div className="table-wrap">
                  <table className="data">
                    <thead><tr><th scope="col">model</th><th scope="col">in</th><th scope="col">out</th><th scope="col">ctx</th><th scope="col">vs {model.name}</th></tr></thead>
                    <tbody>
                      {alts.map((a) => {
                        const diff = pct(model.blended, a.blended);
                        return (
                          <tr key={a.id}>
                            <td><Link href={modelUrl(a)}>{a.name}</Link></td>
                            <td>{fmtUsd(a.price.input)}</td>
                            <td>{fmtUsd(a.price.output)}</td>
                            <td>{fmtTokens(a.context)}</td>
                            <td className={diff < 0 ? "dn" : "muted"}>{fmtPct(diff)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {compareLinks.map((c) => (
                <Link key={c.key} className="btn" href={compareUrl(c.key)}>{c.a.name} vs {c.b.name} →</Link>
              ))}
            </Box>
            {model.hosts.length > 0 ? (
              <Box title="price by host" className="o-hosts">
                <table className="data">
                  <thead><tr><th scope="col">host</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th></tr></thead>
                  <tbody>
                    {model.hosts.map((h) => (
                      <tr key={h.provider}><td>{hostName(h.provider)}</td><td>{fmtUsd(h.input)}</td><td>{fmtUsd(h.output)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ) : null}
            <Box title="faq" className="o-faq">
              <FaqList items={buildFaq(model, alts, source)} />
            </Box>
          </>
        }
        side={
          <>
            <Box title="spec sheet" className="o-spec">
              <dl className="kv">
                <div><dt>input / 1M</dt><dd>{fmtUsd(p.input)}</dd></div>
                <div><dt>output / 1M</dt><dd>{fmtUsd(p.output)}</dd></div>
                {p.cacheRead !== undefined ? <div><dt>cache read / 1M</dt><dd>{fmtUsd(p.cacheRead)}</dd></div> : null}
                {p.cacheWrite !== undefined ? <div><dt>cache write / 1M</dt><dd>{fmtUsd(p.cacheWrite)}</dd></div> : null}
                {(p.tiers ?? []).map((t) => (
                  <div key={t.minContext}><dt>&gt; {fmtTokens(t.minContext)} ctx</dt><dd>{fmtUsd(t.input)} / {fmtUsd(t.output)}</dd></div>
                ))}
                <div><dt>blended (3:1)</dt><dd>{fmtUsd(model.blended)}</dd></div>
                <div><dt>context</dt><dd>{fmtTokens(model.context)}</dd></div>
                <div><dt>max output</dt><dd>{fmtTokens(model.maxOutput)}</dd></div>
                <div><dt>input types</dt><dd>{model.modalitiesIn.join(" · ")}</dd></div>
                <div><dt>reasoning</dt><dd>{yesNo(model.capabilities.reasoning)}</dd></div>
                <div><dt>tool calling</dt><dd>{yesNo(model.capabilities.toolCall)}</dd></div>
                <div><dt>structured output</dt><dd>{yesNo(model.capabilities.structuredOutput)}</dd></div>
                <div><dt>open weights</dt><dd>{yesNo(model.openWeights)}</dd></div>
                <div><dt>knowledge cutoff</dt><dd>{model.knowledgeCutoff ?? "n/a"}</dd></div>
                <div><dt>price source</dt><dd>{hostName(model.priceSource)}</dd></div>
                {model.aliases.length > 0 ? <div><dt>aliases</dt><dd>{model.aliases.join(", ")}</dd></div> : null}
              </dl>
              <p className="dim">
                <a href={`mailto:hello@aisignals.dev?subject=${encodeURIComponent(`Data error: ${model.name}`)}`}>report a data error</a>
              </p>
            </Box>
            <Box title="cost calculator" className="o-calc">
              <CostCalculator rows={[model, ...alts.slice(0, 3)].map(toCalcRow)} />
            </Box>
            <div className="o-ad"><AdSlot /></div>
          </>
        }
      />
    </>
  );
}
