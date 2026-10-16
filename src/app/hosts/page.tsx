import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog, hostName } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { alternatesFor } from "@/lib/site/seo";
import { hostSummaries } from "@/lib/site/selection";
import { hostUrl, modelUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "AI Inference Hosts: API Pricing by Provider",
  description: "Compare inference providers like Groq, Together AI, Fireworks, DeepInfra and Amazon Bedrock: which models they serve and at what price per 1M tokens.",
  alternates: alternatesFor("/hosts"),
};

export default function HostsIndex() {
  const hosts = hostSummaries(getCatalog().models);
  return (
    <>
      <Breadcrumbs items={[{ href: "/hosts", label: "hosts" }]} />
      <h1>AI inference hosts</h1>
      <p className="prose">
        Open-weights models like Llama, Qwen, Gemma or GLM are served by many inference providers at different prices. This page lists every
        host we track, how many models it serves, and its cheapest option. Prices are base-tier list prices in USD per million tokens.
      </p>
      <Box title="hosts">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">host</th><th scope="col">models</th><th scope="col">cheapest model</th><th scope="col">in / out $/1M</th><th scope="col">best price on</th></tr></thead>
            <tbody>
              {hosts.map((h) => (
                <tr key={h.provider}>
                  <td><Link href={hostUrl(h.provider)}>{hostName(h.provider)}</Link></td>
                  <td>{h.offers.length}</td>
                  <td><Link href={modelUrl(h.offers[0].model)}>{h.offers[0].model.name}</Link></td>
                  <td>{fmtUsd(h.offers[0].input)} / {fmtUsd(h.offers[0].output)}</td>
                  <td>{h.offers.filter((o) => o.cheapestHost).length} models</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
