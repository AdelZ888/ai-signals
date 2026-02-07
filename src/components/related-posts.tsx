import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { localePrefix } from "@/lib/i18n";
import type { PostMeta } from "@/lib/posts";

type RelatedPostsProps = {
  posts: PostMeta[];
  locale?: Locale;
};

export function RelatedPosts({ posts, locale = "en" }: RelatedPostsProps) {
  if (posts.length === 0) return null;
  const prefix = localePrefix(locale);
  const title = locale === "fr" ? "Articles similaires" : "Related posts";
  const subtitle = locale === "fr" ? "Pour continuer la lecture" : "Keep reading";
  const minuteLabel = locale === "fr" ? "min de lecture" : "min read";

  return (
    <section className="motion-enter motion-delay-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{subtitle}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {posts.map((post, index) => (
          <div key={post.slug} className={`card-frame motion-card motion-enter motion-delay-${Math.min(index + 2, 8)}`}>
            <article className="article-related-card">
              <p className="text-xs theme-text-faint">
                {post.date} · {post.readingTimeMinutes} {minuteLabel}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                <Link className="motion-link hover:text-cyan-300" href={`${prefix}/posts/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm card-excerpt">{post.excerpt}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
