import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { localePrefix } from "@/lib/i18n";
import { formatTagForPath, getCategoryLabel, getDifficultyLabel, getRegionLabel, getSeriesLabel, type PostMeta } from "@/lib/posts";

type PostCardProps = {
  post: PostMeta;
  delayClass?: string;
  locale?: Locale;
};

function formatDisplayDate(value: string, locale: Locale) {
  const raw = String(value || "").trim();
  try {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    const lang = locale === "fr" ? "fr-FR" : "en-US";
    return new Intl.DateTimeFormat(lang, { year: "numeric", month: "short", day: "2-digit" }).format(date);
  } catch {
    return raw;
  }
}

function Icon({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <span className="meta-icon" aria-hidden="true" title={title}>
      {children}
    </span>
  );
}

function IconCalendar({ title }: { title: string }) {
  return (
    <Icon title={title}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 3v3M16 3v3" />
        <path d="M4 8h16" />
        <path d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      </svg>
    </Icon>
  );
}

function IconGlobe({ title }: { title: string }) {
  return (
    <Icon title={title}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3.5 3 14.5 0 18c-3-3.5-3-14.5 0-18Z" />
      </svg>
    </Icon>
  );
}

function IconClock({ title }: { title: string }) {
  return (
    <Icon title={title}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </svg>
    </Icon>
  );
}

function IconSpark({ title }: { title: string }) {
  return (
    <Icon title={title}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2Z" />
        <path d="M5 13l.7 3.1L9 17l-3.3 1.2L5 21l-.7-2.8L1 17l3.3-.9L5 13Z" />
      </svg>
    </Icon>
  );
}

function IconStack({ title }: { title: string }) {
  return (
    <Icon title={title}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l9 5-9 5-9-5 9-5Z" />
        <path d="M3 12l9 5 9-5" />
        <path d="M3 16l9 5 9-5" />
      </svg>
    </Icon>
  );
}

export function PostCard({ post, delayClass, locale = "en" }: PostCardProps) {
  const prefix = localePrefix(locale);
  const minuteLabel = locale === "fr" ? "min de lecture" : "min read";
  const showSeries = typeof post.series === "string" && post.series.trim().length > 0;
  const showDifficulty = !!post.difficulty;
  const showTime = typeof post.timeToImplementMinutes === "number" && Number.isFinite(post.timeToImplementMinutes);
  const timeLabel = locale === "fr" ? "min build" : "min build";

  const visibleTags = post.tags.slice(0, 6);
  const hiddenTags = post.tags.slice(6);
  const moreLabel = locale === "fr" ? `+${hiddenTags.length} de plus` : `+${hiddenTags.length} more`;
  const dateLabel = locale === "fr" ? "Date" : "Date";
  const regionLabel = locale === "fr" ? "Région" : "Region";
  const readingLabel = locale === "fr" ? "Lecture" : "Reading time";
  const categoryLabel = locale === "fr" ? "Catégorie" : "Category";
  const seriesLabel = locale === "fr" ? "Série" : "Series";
  const difficultyLabel = locale === "fr" ? "Niveau" : "Difficulty";
  const buildTimeLabel = locale === "fr" ? "Temps de build" : "Build time";

  return (
    <div className={`card-frame motion-card motion-enter ${delayClass || ""}`}>
      <article className="rounded-2xl border theme-border theme-surface p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="meta-chip" title={dateLabel}>
            <IconCalendar title={dateLabel} />
            <span>{formatDisplayDate(post.date, locale)}</span>
          </span>
          <span className="meta-chip" title={regionLabel}>
            <IconGlobe title={regionLabel} />
            <span>{getRegionLabel(post.region, locale)}</span>
          </span>
          <span className="meta-chip" title={readingLabel}>
            <IconClock title={readingLabel} />
            <span>
              {post.readingTimeMinutes} {minuteLabel}
            </span>
          </span>
          <span className="meta-chip" title={categoryLabel}>
            <IconStack title={categoryLabel} />
            <span>{getCategoryLabel(post.category, locale)}</span>
          </span>
          {showSeries ? (
            <span className="meta-chip" title={seriesLabel}>
              <IconSpark title={seriesLabel} />
              <span>{getSeriesLabel(post.series!, locale)}</span>
            </span>
          ) : null}
          {showDifficulty ? (
            <span className="meta-chip" title={difficultyLabel}>
              <IconSpark title={difficultyLabel} />
              <span>{getDifficultyLabel(post.difficulty!, locale)}</span>
            </span>
          ) : null}
          {showTime ? (
            <span className="meta-chip" title={buildTimeLabel}>
              <IconClock title={buildTimeLabel} />
              <span>
                {Math.max(5, Math.round(post.timeToImplementMinutes!))} {timeLabel}
              </span>
            </span>
          ) : null}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          <Link href={`${prefix}/posts/${post.slug}`} className="motion-link hover:text-cyan-300">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 card-excerpt">{post.excerpt}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <Link
              key={`${post.slug}-${tag}`}
              href={`${prefix}/tags/${formatTagForPath(tag)}`}
              className="rounded-full theme-pill px-3 py-1 text-xs theme-text-soft transition theme-pill-hover"
            >
              {tag}
            </Link>
          ))}

          {hiddenTags.length > 0 ? (
            <details className="tag-more">
              <summary className="tag-more-summary">{moreLabel}</summary>
              <div className="tag-more-panel">
                {hiddenTags.map((tag) => (
                  <Link
                    key={`${post.slug}-${tag}-hidden`}
                    href={`${prefix}/tags/${formatTagForPath(tag)}`}
                    className="rounded-full theme-pill px-3 py-1 text-xs theme-text-soft transition theme-pill-hover"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </article>
    </div>
  );
}
