import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GUIDES_DIR, listArticles } from "@/lib/site/articles";
import { alternatesFor } from "@/lib/site/seo";
import { guideUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "LLM API Pricing Guides",
  description: "Practical guides to LLM API costs: how token pricing works, estimating your monthly bill, prompt caching, batch APIs, context windows and open-weights hosting.",
  alternates: alternatesFor("/guides"),
};

export default function GuidesIndex() {
  const guides = listArticles(GUIDES_DIR).sort((a, b) => a.title.localeCompare(b.title));
  return (
    <>
      <Breadcrumbs items={[{ href: "/guides", label: "guides" }]} />
      <h1>LLM API pricing guides</h1>
      <p className="prose">Evergreen guides to understand, estimate and reduce what you pay for AI model APIs. Live prices are on every model page.</p>
      <Box title="guides">
        <ul className="feed">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={guideUrl(g.slug)}>{g.title}</Link>
              <br />
              <span className="muted">{g.description}</span>
            </li>
          ))}
        </ul>
      </Box>
    </>
  );
}
