"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getLocaleFromPathname, localePrefix } from "@/lib/i18n";

export function SiteFooter() {
  const locale = getLocaleFromPathname(usePathname());
  const prefix = localePrefix(locale);

  const description =
    locale === "fr"
      ? "Actualités IA quotidiennes, tutoriels et analyses de modèles."
      : "Daily AI news, tutorials, and model analysis.";

  return (
    <footer className="border-t theme-border py-8">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="font-heading text-lg font-extrabold tracking-tight">AI Signals</p>
            <p className="text-sm theme-text-faint">{description}</p>
            <p className="text-xs theme-text-faint">
              {locale === "fr" ? "Construit pour devs, fondateurs, et passionnés IA." : "Built for devs, founders, and AI enthusiasts."}
            </p>
          </div>

          <div className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {locale === "fr" ? "Explorer" : "Explore"}
            </p>
            <ul className="mt-3 grid gap-2">
              <li>
                <Link className="footer-link inline-flex w-fit" href={`${prefix}/start-here`}>
                  {locale === "fr" ? "Commencer ici" : "Start here"}
                </Link>
              </li>
              <li>
                <Link className="footer-link inline-flex w-fit" href={`${prefix}/news`}>
                  {locale === "fr" ? "Actualités" : "News"}
                </Link>
              </li>
              <li>
                <Link className="footer-link inline-flex w-fit" href={`${prefix}/tutorials`}>
                  {locale === "fr" ? "Tutoriels" : "Tutorials"}
                </Link>
              </li>
              <li>
                <Link className="footer-link inline-flex w-fit" href={`${prefix}/newsletter`}>
                  {locale === "fr" ? "Newsletter" : "Newsletter"}
                </Link>
              </li>
              <li>
                <Link className="footer-link inline-flex w-fit" href={`${prefix}/regions`}>
                  {locale === "fr" ? "Régions" : "Regions"}
                </Link>
              </li>
              <li>
                <Link className="footer-link inline-flex w-fit" href={`${prefix}/search`}>
                  {locale === "fr" ? "Recherche" : "Search"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">RSS</p>
            <ul className="mt-3 grid gap-2">
              <li>
                <a className="footer-link inline-flex w-fit" href={`${prefix}/rss.xml`}>
                  {locale === "fr" ? "Flux RSS" : "RSS feed"}
                </a>
              </li>
              <li>
                <a className="footer-link inline-flex w-fit" href={`${prefix}/newsletter/rss.xml`}>
                  {locale === "fr" ? "RSS newsletter" : "Newsletter RSS"}
                </a>
              </li>
              <li>
                <a className="footer-link inline-flex w-fit" href="/sitemap.xml">
                  Sitemap
                </a>
              </li>
            </ul>
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
