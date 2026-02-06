"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getLocaleFromPathname, localePrefix } from "@/lib/i18n";

export function SiteFooter() {
  const locale = getLocaleFromPathname(usePathname());
  const prefix = localePrefix(locale);

  const description =
    locale === "fr"
      ? "Actualites IA quotidiennes, tutoriels et analyses de modeles."
      : "Daily AI news, tutorials, and model analysis.";

  return (
    <footer className="border-t theme-border py-8">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="font-heading text-lg font-extrabold tracking-tight">AI Signals</p>
            <p className="text-sm theme-text-faint">{description}</p>
            <p className="text-xs theme-text-faint">
              {locale === "fr" ? "Construit pour devs, fondateurs, et passionnes IA." : "Built for devs, founders, and AI enthusiasts."}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {locale === "fr" ? "Explorer" : "Explore"}
            </p>
            <Link className="footer-link" href={`${prefix}/news`}>
              {locale === "fr" ? "Actualites" : "News"}
            </Link>
            <Link className="footer-link" href={`${prefix}/tutorials`}>
              {locale === "fr" ? "Tutoriels" : "Tutorials"}
            </Link>
            <Link className="footer-link" href={`${prefix}/newsletter`}>
              {locale === "fr" ? "Newsletter" : "Newsletter"}
            </Link>
            <Link className="footer-link" href={`${prefix}/regions`}>
              {locale === "fr" ? "Regions" : "Regions"}
            </Link>
            <Link className="footer-link" href={`${prefix}/search`}>
              {locale === "fr" ? "Recherche" : "Search"}
            </Link>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">RSS</p>
            <a className="footer-link" href={`${prefix}/rss.xml`}>
              {locale === "fr" ? "Flux RSS" : "RSS feed"}
            </a>
            <a className="footer-link" href={`${prefix}/newsletter/rss.xml`}>
              {locale === "fr" ? "RSS newsletter" : "Newsletter RSS"}
            </a>
            <a className="footer-link" href={`${prefix}/sitemap.xml`}>
              Sitemap
            </a>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {locale === "fr" ? "Newsletter" : "Newsletter"}
            </p>
            <p className="text-sm theme-text-faint">
              {locale === "fr"
                ? "Un email par semaine: releases, playbooks d'agents, tutoriels."
                : "One email per week: releases, agent playbooks, tutorials."}
            </p>
            <Link
              className="inline-flex w-fit rounded-lg border theme-border-soft theme-surface px-3 py-2 text-xs font-bold theme-text-soft transition hover:border-cyan-300 hover:text-cyan-300"
              href={`${prefix}/#newsletter`}
            >
              {locale === "fr" ? "Ouvrir l'inscription" : "Open signup"}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t theme-border pt-6 text-xs theme-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AI Signals</p>
          <p>{locale === "fr" ? "Automatisation stricte: validation + citations." : "Strict automation: validation + citations."}</p>
        </div>
      </div>
    </footer>
  );
}
