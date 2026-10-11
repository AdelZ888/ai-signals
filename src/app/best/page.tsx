import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { BEST_LISTS } from "@/lib/site/selection";
import { bestUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "Best AI Models by Price: Rankings Updated Daily",
  description: "Rankings of the cheapest AI models by capability: vision, reasoning, long context, open weights, tool calling and more.",
  alternates: { canonical: "/best" },
};

export default function BestIndex() {
  const { models, today } = getCatalog();
  return (
    <>
      <Breadcrumbs items={[{ href: "/best", label: "best" }]} />
      <h1>AI model rankings</h1>
      <p className="sub">Rule-based rankings from list prices · verified {today}</p>
      <Box title="rankings">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">ranking</th><th scope="col">models</th><th scope="col">#1</th><th scope="col">#1 blended</th></tr></thead>
            <tbody>
              {BEST_LISTS.map((l) => {
                const entries = l.select(models, today);
                return (
                  <tr key={l.slug}>
                    <td><Link href={bestUrl(l.slug)}>{l.title}</Link></td>
                    <td>{entries.length}</td>
                    <td className="muted">{entries[0]?.name ?? "—"}</td>
                    <td>{entries[0] ? fmtUsd(entries[0].blended) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
