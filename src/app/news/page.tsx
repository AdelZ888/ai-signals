import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { listArticles } from "@/lib/site/articles";
import { newsUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "AI Model Pricing News",
  description: "New AI models, price cuts and the weekly pricing digest, generated from our daily data.",
  alternates: { canonical: "/news" },
};

export default function NewsIndex() {
  const articles = listArticles();
  return (
    <>
      <Breadcrumbs items={[{ href: "/news", label: "news" }]} />
      <h1>AI model pricing news</h1>
      <p className="sub">Generated from our daily data · every number is checked against the dataset</p>
      <Box title="articles">
        {articles.length === 0 ? <p className="dim">No articles yet.</p> : (
          <ul className="feed">
            {articles.map((a) => (
              <li key={a.slug}>
                <span className="dim">{a.date} </span>
                <span className={a.kind === "digest" ? "tag price" : "tag"}>{a.kind === "digest" ? "WEEKLY" : "NEWS"}</span>
                <Link href={newsUrl(a.slug)}>{a.title}</Link>
                <br /><span className="muted">{a.description}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </>
  );
}
