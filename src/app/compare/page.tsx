import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getPairs } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { compareUrl } from "@/lib/site/urls";
import { alternatesFor } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "AI Model Comparisons: Price & Specs Side by Side",
  description: "Head-to-head comparisons of popular AI models: input and output prices, context windows, capabilities and monthly cost.",
  alternates: alternatesFor("/compare"),
};

export default function CompareIndex() {
  const pairs = [...getPairs()].sort((p, q) => p.key.localeCompare(q.key));
  return (
    <>
      <Breadcrumbs items={[{ href: "/compare", label: "compare" }]} />
      <h1>AI model comparisons</h1>
      <p className="sub">{pairs.length} head-to-head pages · blended price = (3 × input + output) / 4</p>
      <Box title="comparisons">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">comparison</th><th scope="col">blended A</th><th scope="col">blended B</th></tr></thead>
            <tbody>
              {pairs.map((p) => (
                <tr key={p.key}>
                  <td><Link href={compareUrl(p.key)}>{p.a.name} vs {p.b.name}</Link></td>
                  <td>{fmtUsd(p.a.blended)}</td>
                  <td>{fmtUsd(p.b.blended)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
