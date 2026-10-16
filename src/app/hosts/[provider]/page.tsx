import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { pct } from "@/lib/data/diff";
import { getSiteUrl } from "@/lib/site-url";
import { getCatalog, hostName, labName } from "@/lib/site/catalog";
import { fmtPct, fmtTokens, fmtUsd, monthYear } from "@/lib/site/format";
import { alternatesFor, clampDescription, fitTitle, itemListLd } from "@/lib/site/seo";
import { MIN_LIST_SIZE, hostSummaries } from "@/lib/site/selection";
import { hostUrl, modelUrl } from "@/lib/site/urls";

type Params = { provider: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return hostSummaries(getCatalog().models).map((h) => ({ provider: h.provider }));
}

const find = (provider: string) => hostSummaries(getCatalog().models).find((h) => h.provider === provider) ?? null;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const host = find((await params).provider);
  if (!host) return {};
  const name = hostName(host.provider);
  const cheapest = host.offers[0];
  return {
    title: fitTitle(`${name} API Pricing: ${host.offers.length} Models (${monthYear(getCatalog().today)})`),
    description: clampDescription(
      `${name} pricing for ${host.offers.length} AI models, from ${cheapest.model.name} at ${fmtUsd(cheapest.input)} input / ${fmtUsd(cheapest.output)} output per 1M tokens. Compare with other hosts.`,
    ),
    alternates: alternatesFor(hostUrl(host.provider)),
    robots: host.offers.length >= MIN_LIST_SIZE ? undefined : { index: false, follow: true },
  };
}

export default async function HostPage({ params }: { params: Promise<Params> }) {
  const host = find((await params).provider);
  if (!host) notFound();
  const name = hostName(host.provider);
  const cheapest = host.offers[0];
  const wins = host.offers.filter((o) => o.cheapestHost).length;
  const open = host.offers.filter((o) => o.model.openWeights).length;

  return (
    <>
      <Breadcrumbs items={[{ href: "/hosts", label: "hosts" }, { href: hostUrl(host.provider), label: name }]} />
      <h1>{name} API pricing</h1>
      <p className="sub">{host.offers.length} models · USD per 1M tokens · verified {getCatalog().today}</p>
      <div className="prose summary">
        <p>
          {name} serves {host.offers.length} of the models we track{open > 0 ? `, ${open} of them open-weights` : ""}. The cheapest is{" "}
          <Link href={modelUrl(cheapest.model)}>{cheapest.model.name}</Link> at {fmtUsd(cheapest.input)} input and {fmtUsd(cheapest.output)}{" "}
          output per million tokens. For {wins} of these models, {name} is the cheapest tracked host.
        </p>
      </div>
      <Box title={`models on ${name}`}>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">model</th><th scope="col">lab</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th>
                <th scope="col">ctx</th><th scope="col">vs best price</th>
              </tr>
            </thead>
            <tbody>
              {host.offers.map((o) => {
                const diff = pct(o.model.blended, o.blended);
                return (
                  <tr key={o.model.id}>
                    <td><Link href={modelUrl(o.model)}>{o.model.name}</Link>{o.cheapestHost ? <> <span className="tag">BEST</span></> : null}</td>
                    <td className="muted">{labName(o.model.lab)}</td>
                    <td>{fmtUsd(o.input)}</td>
                    <td>{fmtUsd(o.output)}</td>
                    <td>{fmtTokens(o.model.context)}</td>
                    <td className={diff > 0 ? "up" : "dn"}>{diff === 0 ? "best" : fmtPct(diff)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="how to read this page">
        <div className="prose">
          <p>
            Prices are {name}&apos;s base-tier list prices per million tokens. &quot;vs best price&quot; compares {name}&apos;s blended price
            (3 × input + output) / 4 with the lowest price we track for the same model, whether it comes from the lab&apos;s own API or another
            host. Open each model for its full price history and every host that serves it.
          </p>
        </div>
      </Box>
      <AdSlot />
      <JsonLd data={itemListLd(`${name} models`, host.offers.map((o) => ({ name: o.model.name, url: modelUrl(o.model) })), getSiteUrl())} />
    </>
  );
}
