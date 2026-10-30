import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getCatalog, labName } from "@/lib/site/catalog";
import { fmtTokens, fmtUsd } from "@/lib/site/format";
import { alternatesFor, bestDescription, bestTitle, fitTitle, itemListLd } from "@/lib/site/seo";
import { BEST_LISTS, MIN_LIST_SIZE, findBestList } from "@/lib/site/selection";
import { bestUrl, modelUrl } from "@/lib/site/urls";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return BEST_LISTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const list = findBestList((await params).slug);
  if (!list) return {};
  const { models, today } = getCatalog();
  const entries = list.select(models, today);
  return {
    title: fitTitle(bestTitle(list, entries.length, today)),
    description: bestDescription(list, entries),
    alternates: alternatesFor(bestUrl(list.slug)),
    robots: entries.length >= MIN_LIST_SIZE ? undefined : { index: false, follow: true },
  };
}

export default async function BestPage({ params }: { params: Promise<Params> }) {
  const list = findBestList((await params).slug);
  if (!list) notFound();
  const { models, today } = getCatalog();
  const entries = list.select(models, today);
  const top = entries[0];

  return (
    <>
      <Breadcrumbs items={[{ href: "/best", label: "best" }, { href: bestUrl(list.slug), label: list.title }]} />
      <h1>{entries.length} {list.title}</h1>
      <p className="sub">{list.description} · verified {today}</p>
      {top ? (
        <p>
          #1 is <Link href={modelUrl(top)}>{top.name}</Link> at {fmtUsd(top.price.input)} input and {fmtUsd(top.price.output)} output per million tokens.
        </p>
      ) : null}
      <Box title="ranking">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">#</th><th scope="col">model</th><th scope="col">lab</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th><th scope="col">ctx</th></tr></thead>
            <tbody>
              {entries.map((m, i) => (
                <tr key={m.id}>
                  <td className="dim">{i + 1}</td>
                  <td><Link href={modelUrl(m)}>{m.name}</Link></td>
                  <td className="muted">{labName(m.lab)}</td>
                  <td>{fmtUsd(m.price.input)}</td>
                  <td>{fmtUsd(m.price.output)}</td>
                  <td>{fmtTokens(m.context)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="how this ranking works">
        <div className="prose">
          <p>
            {list.description} Only active models with a published price and context window are included. Prices are base-tier list
            prices in USD per million tokens; the blended price weights input and output 3:1, a typical mix for chat and RAG workloads.
            The data comes from models.dev and is refreshed every day, so this ranking changes as soon as a provider changes its prices.
          </p>
        </div>
      </Box>
      <AdSlot />
      <JsonLd data={itemListLd(list.title, entries.map((m) => ({ name: m.name, url: modelUrl(m) })), getSiteUrl())} />
      <Box title="other rankings">
        {BEST_LISTS.filter((l) => l.slug !== list.slug).map((l) => <Link key={l.slug} className="btn" href={bestUrl(l.slug)}>{l.title}</Link>)}
      </Box>
    </>
  );
}
