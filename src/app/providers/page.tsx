import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog, labSummaries } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { providerUrl } from "@/lib/site/urls";
import { alternatesFor } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "AI Model Providers: API Pricing by Lab",
  description: "Every AI lab we track, with model count and blended price range per million tokens.",
  alternates: alternatesFor("/providers"),
};

export default function ProvidersPage() {
  const summaries = labSummaries(getCatalog().models);
  return (
    <>
      <Breadcrumbs items={[{ href: "/providers", label: "providers" }]} />
      <h1>AI model providers</h1>
      <p className="sub">Blended price = (3 × input + output) / 4, USD per 1M tokens.</p>
      <Box title="labs">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">lab</th><th scope="col">models</th><th scope="col">cheapest</th><th scope="col">most expensive</th></tr></thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.lab}>
                  <td><Link href={providerUrl(s.lab)}>{s.name}</Link></td>
                  <td>{s.models.length}</td>
                  <td>{fmtUsd(s.minBlended)}</td>
                  <td>{fmtUsd(s.maxBlended)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
