import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { localePrefix } from "@/lib/i18n";
import { formatTagForPath, getCategoryLabel, getDifficultyLabel, getRegionLabel, getSeriesLabel, type PostMeta } from "@/lib/posts";

type PostCardProps = {
  post: PostMeta;
  delayClass?: string;
  locale?: Locale;
};

export function PostCard({ post, delayClass, locale = "en" }: PostCardProps) {
  const prefix = localePrefix(locale);
  const minuteLabel = locale === "fr" ? "min de lecture" : "min read";
  const showSeries = typeof post.series === "string" && post.series.trim().length > 0;
  const showDifficulty = !!post.difficulty;
  const showTime = typeof post.timeToImplementMinutes === "number" && Number.isFinite(post.timeToImplementMinutes);
  const timeLabel = locale === "fr" ? "min build" : "min build";

  return (
    <div className={`card-frame motion-card motion-enter ${delayClass || ""}`}>
      <article className="rounded-2xl border theme-border theme-surface p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs theme-text-faint">
          <span>{post.date}</span>
          <span>•</span>
          <span>{getRegionLabel(post.region, locale)}</span>
          <span>•</span>
          <span>{getCategoryLabel(post.category, locale)}</span>
          {showSeries ? (
            <>
              <span>•</span>
              <span>{getSeriesLabel(post.series!, locale)}</span>
            </>
          ) : null}
          {showDifficulty ? (
            <>
              <span>•</span>
              <span>{getDifficultyLabel(post.difficulty!, locale)}</span>
            </>
          ) : null}
          {showTime ? (
            <>
              <span>•</span>
              <span>
                {Math.max(5, Math.round(post.timeToImplementMinutes!))} {timeLabel}
              </span>
            </>
          ) : null}
          <span>•</span>
          <span>
            {post.readingTimeMinutes} {minuteLabel}
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          <Link href={`${prefix}/posts/${post.slug}`} className="motion-link hover:text-cyan-300">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 theme-text-muted">{post.excerpt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={`${post.slug}-${tag}`}
              href={`${prefix}/tags/${formatTagForPath(tag)}`}
              className="rounded-full theme-pill px-3 py-1 text-xs theme-text-soft transition theme-pill-hover"
            >
              {tag}
            </Link>
          ))}
        </div>
      </article>
    </div>
  );
}
