import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsletterCta } from "@/components/newsletter-cta";
import { PostToc } from "@/components/post-toc";
import { ReadingProgress } from "@/components/reading-progress";
import { ShareSnippet } from "@/components/share-snippet";
import { getAllNewslettersMeta, getNewsletter } from "@/lib/newsletters";

type Params = {
  params: Promise<{ slug: string }>;
};

function formatDate(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateIso;
  }
}

export async function generateStaticParams() {
  const issues = await getAllNewslettersMeta("en");
  return issues.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  try {
    const issue = await getNewsletter(slug, "en");
    const ogUrl = `/api/og?${new URLSearchParams({
      title: issue.title,
      subtitle: issue.excerpt,
      locale: "en",
      kind: "newsletter",
      kicker: "Newsletter",
    }).toString()}`;
    return {
      title: issue.title,
      description: issue.excerpt,
      alternates: {
        canonical: `/newsletter/${issue.slug}`,
        languages: {
          "en-US": `/newsletter/${issue.slug}`,
          "fr-FR": `/fr/newsletter/${issue.slug}`,
        },
      },
      openGraph: {
        type: "article",
        title: issue.title,
        description: issue.excerpt,
        url: `/newsletter/${issue.slug}`,
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
    return { title: "Issue not found" };
  }
}

export default async function NewsletterIssuePage({ params }: Params) {
  const { slug } = await params;

  let issue;
  try {
    issue = await getNewsletter(slug, "en");
  } catch {
    notFound();
  }

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/newsletter/${issue.slug}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <ReadingProgress />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="article-shell motion-enter">
          <header className="article-hero motion-enter motion-delay-1">
            <p className="article-kicker">AI Signals Weekly</p>
            <h1 className="article-title">{issue.title}</h1>
            <p className="article-excerpt">{issue.excerpt}</p>

            <div className="article-meta">
              <span className="article-chip">{formatDate(issue.date)}</span>
              {issue.issueNumber ? <span className="article-chip">Issue #{issue.issueNumber}</span> : null}
              <span className="article-chip">{issue.readingTimeMinutes} min read</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link className="article-action" href="/newsletter">
                All issues
              </Link>
              <Link className="article-action" href="/news">
                Latest AI news
              </Link>
              <a className="article-action" href="/rss.xml">
                RSS
              </a>
            </div>
          </header>

          <div className="article-content motion-enter motion-delay-2" dangerouslySetInnerHTML={{ __html: issue.contentHtml }} />

          <ShareSnippet title={issue.title} excerpt={issue.excerpt} url={canonicalUrl} locale="en" />

          <section className="article-section motion-enter motion-delay-3">
            <NewsletterCta locale="en" variant="inline" />
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <PostToc toc={issue.toc} locale="en" />
        </aside>
      </div>
    </main>
  );
}
