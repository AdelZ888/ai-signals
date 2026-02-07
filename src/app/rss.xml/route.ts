import { getAllPostsMeta } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-url";

function xmlEscape(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const posts = await getAllPostsMeta("en");

  const lastBuildDate = posts[0]?.date ? new Date(posts[0].date) : new Date();
  const selfUrl = `${siteUrl}/rss.xml`;

  const xmlItems = posts
    .map(
      (post) => {
        const url = `${siteUrl}/posts/${post.slug}`;
        const categories = [post.category, ...(post.tags || [])]
          .filter(Boolean)
          .map((value) => `<category><![CDATA[${value}]]></category>`)
          .join("\n        ");

        return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${xmlEscape(url)}</link>
        <guid isPermaLink="true">${xmlEscape(url)}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt}]]></description>
        <dc:creator><![CDATA[AI Signals]]></dc:creator>
        ${categories}
      </item>`;
      },
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />
    <title>AI Signals</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description><![CDATA[Daily AI news, tutorials, and model analysis.]]></description>
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <generator>AI Signals</generator>
    <ttl>60</ttl>
    ${xmlItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
