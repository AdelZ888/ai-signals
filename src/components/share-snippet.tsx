"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";

type ShareSnippetProps = {
  title: string;
  excerpt?: string;
  url: string;
  locale?: Locale;
};

function clamp(input: string, max: number) {
  const value = String(input || "").trim();
  if (value.length <= max) return value;
  return value.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

export function ShareSnippet({ title, excerpt = "", url, locale = "en" }: ShareSnippetProps) {
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    const cleanExcerpt = clamp(excerpt, 160);
    if (locale === "fr") {
      return `${title}\n\n${cleanExcerpt ? `${cleanExcerpt}\n\n` : ""}${url}\n\n(Chaque semaine: actus IA, patterns d'agents, tutoriels)`;
    }

    return `${title}\n\n${cleanExcerpt ? `${cleanExcerpt}\n\n` : ""}${url}\n\n(Weekly: AI news, agent patterns, tutorials)`;
  }, [excerpt, locale, title, url]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      try {
        if (typeof (window as unknown as { gtag?: unknown }).gtag === "function") {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "share_snippet_copy", {
            locale,
          });
        }
      } catch {
        // ignore
      }
    } catch {
      // Ignore clipboard failure; users can still manually copy.
    }
  }

  return (
    <section className="article-section motion-enter motion-delay-2">
      <h2 className="article-section-title">{locale === "fr" ? "Partager" : "Share"}</h2>
      <p className="mt-2 text-sm theme-text-muted">
        {locale === "fr"
          ? "Copiez un extrait propre pour LinkedIn, Slack ou email."
          : "Copy a clean snippet for LinkedIn, Slack, or email."}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <pre className="overflow-x-auto rounded-xl border theme-border theme-surface px-4 py-3 text-xs leading-relaxed theme-text-muted">
          {snippet}
        </pre>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg bg-cyan-300 px-4 py-3 text-xs font-extrabold text-zinc-950 transition hover:bg-cyan-200"
        >
          {copied ? (locale === "fr" ? "Copie" : "Copied") : locale === "fr" ? "Copier" : "Copy"}
        </button>
      </div>
    </section>
  );
}

