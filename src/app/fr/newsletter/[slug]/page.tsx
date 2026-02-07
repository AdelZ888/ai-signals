import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostToc } from "@/components/post-toc";
import { ReadingProgress } from "@/components/reading-progress";
import { ShareSnippet } from "@/components/share-snippet";
import { getAllNewslettersMeta, getNewsletter } from "@/lib/newsletters";
import { buildOgUrl } from "@/lib/og";
import { getSiteUrl } from "@/lib/site-url";

type Params = {
  params: Promise<{ slug: string }>;
};

function formatDate(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateIso;
  }
}

export async function generateStaticParams() {
  const issues = await getAllNewslettersMeta("fr");
  return issues.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  try {
    const issue = await getNewsletter(slug, "fr");
    const ogUrl = buildOgUrl({
      title: issue.title,
      subtitle: issue.excerpt,
      locale: "fr",
      kind: "newsletter",
      kicker: "Newsletter",
    });
    return {
      title: issue.title,
      description: issue.excerpt,
      alternates: {
        canonical: `/fr/newsletter/${issue.slug}`,
        languages: {
          "en-US": `/newsletter/${issue.slug}`,
          "fr-FR": `/fr/newsletter/${issue.slug}`,
        },
      },
      openGraph: {
        type: "article",
        title: issue.title,
        description: issue.excerpt,
        url: `/fr/newsletter/${issue.slug}`,
        images: [{ url: ogUrl, width: 1200, height: 630, alt: issue.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: issue.title,
        description: issue.excerpt,
        images: [ogUrl],
      },
    };
  } catch {
    return { title: "Edition introuvable" };
  }
}

export default async function NewsletterIssuePageFr({ params }: Params) {
  const { slug } = await params;

  let issue;
  try {
    issue = await getNewsletter(slug, "fr");
  } catch {
    notFound();
  }

  const canonicalUrl = `${getSiteUrl()}/fr/newsletter/${issue.slug}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <ReadingProgress />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="article-shell motion-enter">
          <header className="article-hero motion-enter motion-delay-1">
            <p className="article-kicker">AI Signals Hebdo</p>
            <h1 className="article-title">{issue.title}</h1>
            <p className="article-excerpt">{issue.excerpt}</p>

            <div className="article-meta">
              <span className="article-chip">{formatDate(issue.date)}</span>
              {issue.issueNumber ? <span className="article-chip">Edition #{issue.issueNumber}</span> : null}
              <span className="article-chip">{issue.readingTimeMinutes} min</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link className="article-action" href="/fr/newsletter">
                Toutes les editions
              </Link>
              <Link className="article-action" href="/fr/news">
                Actualites IA
              </Link>
              <a className="article-action" href="/fr/rss.xml">
                RSS
              </a>
            </div>
          </header>

          <div className="article-content motion-enter motion-delay-2" dangerouslySetInnerHTML={{ __html: issue.contentHtml }} />

          <ShareSnippet title={issue.title} excerpt={issue.excerpt} url={canonicalUrl} locale="fr" />

          <section className="article-section motion-enter motion-delay-3">
            <NewsletterCta locale="fr" variant="inline" />
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <PostToc toc={issue.toc} locale="fr" />
        </aside>
      </div>
    </main>
  );
}
