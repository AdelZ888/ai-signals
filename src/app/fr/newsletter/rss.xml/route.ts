import { getAllNewslettersMeta, getNewsletter } from "@/lib/newsletters";

function cdata(value: string) {
  return `<![CDATA[${String(value || "").replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function absolutizeRelativeLinks(html: string, siteUrl: string) {
  const safeBase = siteUrl.replace(/\/+$/u, "");
  return String(html || "")
    .replaceAll('href="/', `href="${safeBase}/`)
    .replaceAll("href='/", `href='${safeBase}/`)
    .replaceAll('src="/', `src="${safeBase}/`)
    .replaceAll("src='/", `src='${safeBase}/`);
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const issues = (await getAllNewslettersMeta("fr")).slice(0, 25);

  const items = await Promise.all(
    issues.map(async (issue) => {
      const full = await getNewsletter(issue.slug, "fr");
      const html = absolutizeRelativeLinks(full.contentHtml, siteUrl);
      const link = `${siteUrl}/fr/newsletter/${issue.slug}`;
      return `
      <item>
        <title>${cdata(issue.title)}</title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${new Date(issue.date).toUTCString()}</pubDate>
        <description>${cdata(issue.excerpt)}</description>
        <content:encoded>${cdata(html)}</content:encoded>
      </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>AI Signals Hebdo (FR)</title>
    <link>${siteUrl}/fr/newsletter</link>
    <description>Digest hebdo: sorties de modeles, patterns d'agents, et tutoriels pratiques.</description>
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

