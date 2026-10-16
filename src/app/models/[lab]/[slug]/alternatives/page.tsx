import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { pct } from "@/lib/data/diff";
import { getSiteUrl } from "@/lib/site-url";
import { findModel, getCatalog, getPairs, labName } from "@/lib/site/catalog";
import { SCENARIOS, monthlyCost } from "@/lib/site/cost";
import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost, monthYear } from "@/lib/site/format";
import { alternatesFor, clampDescription, fitTitle, itemListLd } from "@/lib/site/seo";
import { alternatives, alternativesPageModels, makePair } from "@/lib/site/selection";
import { alternativesUrl, compareUrl, modelUrl, providerUrl } from "@/lib/site/urls";

type Params = { lab: string; slug: string };

const LIMIT = 10;

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const { models, today } = getCatalog();
  return alternativesPageModels(models, today).map((m) => ({ lab: m.lab, slug: m.slug }));
}

function load(lab: string, slug: string) {
  const model = findModel(lab, slug);
  if (!model) return null;
  const { models, today } = getCatalog();
  if (!alternativesPageModels(models, today).some((m) => m.id === model.id)) return null;
  return { model, alts: alternatives(model, models, LIMIT), today };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lab, slug } = await params;
  const data = load(lab, slug);
  if (!data) return {};
  const { model, alts, today } = data;
  const cheaper = alts.filter((a) => a.blended < model.blended);
  return {
    title: fitTitle(`${model.name} Alternatives: ${alts.length} Options Compared (${monthYear(today)})`),
    description: clampDescription(
      `${alts.length} alternatives to ${model.name} with the same input types and capabilities${cheaper.length > 0 ? `, ${cheaper.length} of them cheaper` : ""}. Prices per 1M tokens, context windows and monthly costs.`,
    ),
    alternates: alternatesFor(alternativesUrl(model)),
  };
}

export default async function AlternativesPage({ params }: { params: Promise<Params> }) {
  const { lab, slug } = await params;
  const data = load(lab, slug);
  if (!data) notFound();
  const { model, alts } = data;
  const cheaper = alts.filter((a) => a.blended < model.blended);
  const best = cheaper[0];
  const pairKeys = new Set(getPairs().map((p) => p.key));
  const chat = SCENARIOS[0];

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/models", label: "models" },
          { href: providerUrl(model.lab), label: labName(model.lab) },
          { href: modelUrl(model), label: model.name },
          { href: alternativesUrl(model), label: "alternatives" },
        ]}
      />
      <h1>{model.name} alternatives</h1>
      <p className="sub">Same input types and capabilities, at least half the context window · USD per 1M tokens</p>
      <div className="prose summary">
        <p>
          We found {alts.length} models that can replace <Link href={modelUrl(model)}>{model.name}</Link> ({fmtUsd(model.price.input)} input /{" "}
          {fmtUsd(model.price.output)} output per million tokens).{" "}
          {best
            ? `${cheaper.length === 1 ? "One of them is" : `${cheaper.length} of them are`} cheaper. The cheapest, ${best.name}, costs ${Math.abs(pct(model.blended, best.blended))}% less on a blended 3:1 basis: ${fmtUsdCost(monthlyCost(best.price, chat.inputTokens, chat.outputTokens))} instead of ${fmtUsdCost(monthlyCost(model.price, chat.inputTokens, chat.outputTokens))} per month for a ${chat.label.toLowerCase()} workload (${fmtTokens(chat.inputTokens)} input / ${fmtTokens(chat.outputTokens)} output tokens).`
            : `${model.name} is already the cheapest option with these capabilities; the models below cost more but may offer other trade-offs.`}
        </p>
      </div>
      <Box title={`${alts.length} alternatives`}>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">model</th><th scope="col">lab</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th>
                <th scope="col">ctx</th><th scope="col">vs {model.name}</th><th scope="col">{chat.label.toLowerCase()} / mo</th>
              </tr>
            </thead>
            <tbody>
              {alts.map((a) => {
                const diff = pct(model.blended, a.blended);
                const pair = makePair(model, a);
                return (
                  <tr key={a.id}>
                    <td>
                      <Link href={modelUrl(a)}>{a.name}</Link>
                      {pairKeys.has(pair.key) ? <> · <Link className="dim" href={compareUrl(pair.key)}>compare</Link></> : null}
                    </td>
                    <td className="muted">{labName(a.lab)}</td>
                    <td>{fmtUsd(a.price.input)}</td>
                    <td>{fmtUsd(a.price.output)}</td>
                    <td>{fmtTokens(a.context)}</td>
                    <td className={diff < 0 ? "dn" : "up"}>{fmtPct(diff)}</td>
                    <td>{fmtUsdCost(monthlyCost(a.price, chat.inputTokens, chat.outputTokens))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="how we pick alternatives">
        <div className="prose">
          <p>
            An alternative must accept every input type {model.name} accepts ({model.modalitiesIn.join(", ")}), offer the same tool-calling and
            reasoning support, and have at least half of its {fmtTokens(model.context)}-token context window. Models are sorted by blended price
            (3 × input + output) / 4, using base-tier list prices refreshed daily.
          </p>
        </div>
      </Box>
      <AdSlot />
      <JsonLd data={itemListLd(`${model.name} alternatives`, alts.map((a) => ({ name: a.name, url: modelUrl(a) })), getSiteUrl())} />
    </>
  );
}
