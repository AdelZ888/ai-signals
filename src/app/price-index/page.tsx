import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/faq-list";
import { IndexChart } from "@/components/index-chart";
import { JsonLd } from "@/components/json-ld";
import { StatGrid } from "@/components/stat-grid";
import { getSiteUrl } from "@/lib/site-url";
import { getPriceIndex, labName } from "@/lib/site/catalog";
import { fmtPct, fmtUsd } from "@/lib/site/format";
import {
  LAST_RECONSTRUCTED_MONTH, closingDate, compareSnapshots, floorsOf, labChanges, launchCohorts, leaveOneLabOut, monthLabel, publishedOn, verdict,
} from "@/lib/site/price-index";
import { alternatesFor, clampDescription, fitTitle } from "@/lib/site/seo";
import { ogImageUrl, priceIndexUrl } from "@/lib/site/urls";

const TITLE = "AI Price Index: LLM API Prices Month by Month";

export function generateMetadata(): Metadata {
  const { latest, base } = getPriceIndex();
  const description = latest && base
    ? `The median AI model costs ${fmtUsd(latest.median)} per 1M tokens, ${fmtPct(latest.sinceBasePct)} since ${monthLabel(base.month)}. Monthly index across ${latest.models} models and ${latest.labs} labs, with open data.`
    : "A monthly index of AI model API list prices, with open data and methodology.";
  return {
    title: fitTitle(TITLE),
    description: clampDescription(description),
    alternates: alternatesFor(priceIndexUrl()),
    openGraph: { type: "website", title: TITLE, description: clampDescription(description), images: [{ url: ogImageUrl("AI Price Index", latest ? `${monthLabel(latest.month)}: ${latest.index}` : "Monthly"), width: 1200, height: 630 }] },
  };
}

export default function PriceIndexPage() {
  const { snapshots, series, latest, base } = getPriceIndex();
  const siteUrl = getSiteUrl();
  if (!latest || !base) return <h1>AI Price Index</h1>;

  const first = snapshots.find((s) => s.month === base.month)!;
  const last = snapshots.at(-1)!;
  const cmp = compareSnapshots(first, last);
  const range = leaveOneLabOut(first, last);
  const headline = verdict(latest.sinceBasePct, range);
  const cohorts = launchCohorts(snapshots);
  const labs = labChanges(first, last).filter((l) => l.after !== null).sort((a, b) => (b.after ?? 0) - (a.after ?? 0));
  const floorsThen = new Map(floorsOf(first).map((f) => [f.id, f.row]));
  const floorsNow = floorsOf(last);
  const changes = series.reduce((sum, p) => sum + p.repriced, 0);
  const cuts = series.reduce((sum, p) => sum + p.cuts, 0);
  const hikes = series.reduce((sum, p) => sum + p.hikes, 0);
  const repriceRate = Math.round((changes / series.reduce((sum, p) => sum + p.models, 0)) * 1000) / 10;
  const rangeText = range ? `Leaving out any single lab, the change ranges from ${fmtPct(range.min.pct)} (without ${labName(range.min.lab)}) to ${fmtPct(range.max.pct)} (without ${labName(range.max.lab)}), so read the direction, not the decimal.` : "";
  const monthly = `${siteUrl}${priceIndexUrl(latest.month)}`;
  const faq = [
    {
      q: "Are LLM API prices going down?",
      a: `${headline} The median model on labs' own APIs cost ${fmtUsd(base.median)} per million tokens in ${monthLabel(base.month)} and ${fmtUsd(latest.median)} in ${monthLabel(latest.month)}. ${rangeText} This index tracks list prices, not what a given level of capability costs, and the two can move in opposite directions.`,
    },
    {
      q: "Does a higher index mean AI got more expensive to use?",
      a: "Not necessarily. The index is not adjusted for quality or for usage: a model at the same price can be far more capable than one from a year earlier, and most teams can switch to a cheaper model. It measures what labs charge, not what you end up paying for a given result.",
    },
    {
      q: "What is the blended price?",
      a: "A single price per million tokens that weights input and output 3:1, (3 × input + output) / 4, a typical mix for chat and RAG workloads.",
    },
    {
      q: "How often is the AI Price Index updated?",
      a: "Once a month. Each month is frozen on the first day of the following month and is not revised afterwards; any correction is logged on this site's about page.",
    },
    {
      q: "Can I use this data?",
      a: "Yes. The series and the monthly snapshots are free to reuse under CC BY 4.0, with a link to this page as the attribution.",
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ href: priceIndexUrl(), label: "price index" }]} />
      <h1>AI Price Index</h1>
      <p className="sub">
        Monthly index of AI model API list prices · {monthLabel(base.month)} = 100 · latest: {monthLabel(latest.month)}
      </p>
      <div className="prose">
        <p>
          <b>{headline}</b> In {monthLabel(latest.month)}, the median chat model cost <b>{fmtUsd(latest.median)}</b> per million tokens
          on its maker&apos;s own API, {fmtPct(latest.sinceBasePct)} compared with {monthLabel(base.month)}. {rangeText}
        </p>
      </div>
      <StatGrid
        stats={[
          { label: "index", value: String(latest.index), note: latest.momPct === null ? `${monthLabel(base.month)} = 100` : `${fmtPct(latest.momPct)} vs last month` },
          { label: "median price", value: fmtUsd(latest.median), note: "per 1M tokens, blended" },
          { label: "budget / premium", value: `${fmtUsd(latest.p10)} / ${fmtUsd(latest.p90)}`, note: "10th / 90th percentile" },
          { label: "tracked", value: String(latest.models), note: `models from ${latest.labs} labs` },
        ]}
      />
      <Box title={`the index, ${monthLabel(base.month).toLowerCase()} = 100`}>
        <IndexChart series={series} />
      </Box>
      <Box title="what is behind the number">
        <div className="prose">
          <p>
            <b>{repriceRate < 2 ? "Labs rarely change the price of a model." : "Labs change list prices regularly."}</b> {cmp.stayers} models were on sale in both {monthLabel(base.month)} and {monthLabel(latest.month)};
            {" "}{cmp.repriced.length} of them {cmp.repriced.length === 1 ? "has" : "have"} a different list price today. Across the {series.length} months of the index
            we recorded {changes} list-price changes ({cuts} cuts, {hikes} increases), or about {repriceRate}% of models in a given month.
          </p>
          <p>
            <b>The catalog moves the median.</b> Since {monthLabel(base.month)}, {cmp.added.length} models were added at a median of {fmtUsd(cmp.addedMedian ?? 0)} and
            {" "}{cmp.retired.length} were retired at a median of {fmtUsd(cmp.retiredMedian ?? 0)}. The {cmp.stayers} that stayed have a median of {fmtUsd(cmp.stayerMedian ?? 0)}.
          </p>
          <p>
            <b>Both ends of the market moved.</b> The budget end (10th percentile) went from {fmtUsd(base.p10)} to {fmtUsd(latest.p10)}, the premium end (90th percentile)
            from {fmtUsd(base.p90)} to {fmtUsd(latest.p90)}.
          </p>
        </div>
      </Box>
      <Box title="month by month">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th scope="col">month</th><th scope="col">index</th><th scope="col">change</th><th scope="col">median</th><th scope="col">budget</th><th scope="col">premium</th><th scope="col">models</th><th scope="col">added</th><th scope="col">retired</th><th scope="col">repriced</th></tr>
            </thead>
            <tbody>
              {[...series].reverse().map((p) => (
                <tr key={p.month}>
                  <td><Link href={priceIndexUrl(p.month)}>{monthLabel(p.month)}</Link></td>
                  <td><b>{p.index}</b></td>
                  <td className={p.momPct === null || p.momPct === 0 ? "dim" : p.momPct > 0 ? "up" : "dn"}>{p.momPct === null ? "—" : fmtPct(p.momPct)}</td>
                  <td>{fmtUsd(p.median)}</td>
                  <td>{fmtUsd(p.p10)}</td>
                  <td>{fmtUsd(p.p90)}</td>
                  <td>{p.models}</td>
                  <td>{p.added}</td>
                  <td>{p.retired}</td>
                  <td>{p.repriced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <div className="grid-2 grid-even">
        <Box title="median launch price by quarter">
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">quarter</th><th scope="col">median</th><th scope="col">models</th></tr></thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.quarter}>
                    <td>{c.quarter.replace("-", " ")}{c.partial ? " (so far)" : ""}</td>
                    <td>{fmtUsd(c.median)}</td>
                    <td>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dim">Models by release date, at the first price we saw. Cohorts are small and swing with a single lab&apos;s launches: treat this as a direction, not a measurement.</p>
        </Box>
        <Box title="cheapest model by capability">
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">capability</th><th scope="col">{monthLabel(base.month)}</th><th scope="col">{monthLabel(latest.month)}</th></tr></thead>
              <tbody>
                {floorsNow.map((f) => (
                  <tr key={f.id}>
                    <td>{f.label}</td>
                    <td>{floorsThen.has(f.id) ? fmtUsd(floorsThen.get(f.id)!.blended) : "—"}</td>
                    <td>{fmtUsd(f.row.blended)} <span className="dim">{f.row.name}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dim">Blended list price on labs&apos; own APIs, models still on sale. Inference hosts can be cheaper: see <Link href="/hosts">hosts</Link>.</p>
        </Box>
      </div>
      <Box title={`median price by lab, ${monthLabel(base.month).toLowerCase()} vs ${monthLabel(latest.month).toLowerCase()}`}>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">lab</th><th scope="col">{monthLabel(base.month)}</th><th scope="col">{monthLabel(latest.month)}</th><th scope="col">change</th><th scope="col">models now</th></tr></thead>
            <tbody>
              {labs.map((l) => (
                <tr key={l.lab}>
                  <td>{labName(l.lab)}</td>
                  <td>{l.before === null ? "—" : fmtUsd(l.before)}</td>
                  <td>{fmtUsd(l.after ?? 0)}</td>
                  <td className={l.pct === null || l.pct === 0 ? "dim" : l.pct > 0 ? "up" : "dn"}>{l.pct === null ? "new" : fmtPct(l.pct)}</td>
                  <td>{l.afterCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="dim">A lab&apos;s median also moves when it adds or retires models, not only when it changes a price.</p>
      </Box>
      <Box title="methodology">
        <div className="prose">
          <p>
            <b>What it measures.</b> The median blended list price of every paid chat model that {latest.labs} labs sell on their own APIs, at the end of each month. Blended means (3 × input + output) / 4, in USD per million tokens. Each model counts once.
          </p>
          <p>
            <b>What it leaves out.</b> Inference hosts (their past prices are not reliably known), free tiers and promotions, batch, caching and volume discounts, long-context surcharges, and embedding, image, audio and realtime models.
          </p>
          <p>
            <b>What it cannot tell you.</b> It is not weighted by usage, because labs do not publish usage. It is not adjusted for quality, so it says nothing about the price of a given level of capability. The median also jumps between common price points, so a single month can move more than the underlying market did.
          </p>
          <p>
            <b>Where the data comes from.</b> <a href="https://models.dev" rel="noopener">models.dev</a>, a community-maintained catalog (MIT), which we cross-check daily against pydantic&apos;s genai-prices. Months up to {monthLabel(LAST_RECONSTRUCTED_MONTH)} were rebuilt from the models.dev git history, catalog by catalog, so models retired since then still count in the months they were on sale. Running that rebuild on the live data reproduced every price, context window and capability across all {last.rows.length} models. Later months are captured at month end.
          </p>
          <p>
            <b>Published months do not change.</b> Each month is frozen on the first day of the next one ({monthLabel(closingDate(latest.month).slice(0, 7))} closes on {closingDate(closingDate(latest.month).slice(0, 7))}). Corrections are logged on the <Link href="/about">about page</Link>.
          </p>
        </div>
      </Box>
      <Box title="use this data" id="use">
        <p>
          <a className="btn" href="/data/price-index.csv">series.csv</a>
          <a className="btn" href="/data/price-index.json">series.json</a>
          <a className="btn" href={`/data/price-index/${latest.month}.json`}>{latest.month}.json (every model)</a>
        </p>
        <p className="dim">Free to reuse under <a href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener">CC BY 4.0</a>, with a link to this page.</p>
        <h3 className="box-sub">cite it</h3>
        <pre className="snippet"><code>{`AI Signals. "AI Price Index, ${monthLabel(latest.month)}." ${monthly}`}</code></pre>
        <h3 className="box-sub">embed the chart</h3>
        <pre className="snippet"><code>{`<a href="${siteUrl}${priceIndexUrl()}"><img src="${siteUrl}/price-index/chart.svg" width="640" height="320" alt="AI Price Index: the median AI model costs ${fmtUsd(latest.median)} per 1M tokens"></a>`}</code></pre>
      </Box>
      <Box title="questions">
        <FaqList items={faq} />
      </Box>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "AI Price Index",
          description: `Monthly index of AI model API list prices, ${monthLabel(base.month)} = 100. Median blended price per million tokens across every paid chat model on labs' own APIs.`,
          url: `${siteUrl}${priceIndexUrl()}`,
          isBasedOn: "https://models.dev",
          creator: { "@type": "Organization", name: "AI Signals", url: siteUrl },
          license: "https://creativecommons.org/licenses/by/4.0/",
          temporalCoverage: `${series[0].month}/${latest.month}`,
          dateModified: publishedOn(latest.month),
          variableMeasured: ["AI Price Index", "median blended price per 1M tokens", "10th percentile price", "90th percentile price"],
          distribution: [
            { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${siteUrl}/data/price-index.csv` },
            { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${siteUrl}/data/price-index.json` },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
