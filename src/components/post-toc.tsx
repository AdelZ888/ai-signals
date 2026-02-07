import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { TocItem } from "@/lib/posts";

type PostTocProps = {
  toc: TocItem[];
  locale?: Locale;
};

export function PostToc({ toc, locale = "en" }: PostTocProps) {
  if (toc.length === 0) return null;
  const title = locale === "fr" ? "Sommaire" : "Table of contents";

  return (
    <aside className="article-aside-card motion-card motion-enter motion-delay-2">
      <details className="toc-details" open>
        <summary className="toc-summary">{title}</summary>
        <ul className="mt-3 space-y-2 text-sm">
          {toc.map((item, index) => (
            <li key={item.id} className={`motion-enter motion-delay-${Math.min(index + 1, 8)}`}>
              <Link className={item.level === 3 ? "article-toc-link article-toc-link-sub" : "article-toc-link"} href={`#${item.id}`}>
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
