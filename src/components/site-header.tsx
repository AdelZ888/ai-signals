"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { ThemeToggle } from "@/components/theme-toggle";
import { getLocaleFromPathname, localePrefix, stripLocalePrefix, withLocalePath } from "@/lib/i18n";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const navLabels = useMemo(() => {
    return locale === "fr"
      ? {
          startHere: "Commencer",
          news: "Actualités",
          tutorials: "Tutoriels",
          newsletter: "Newsletter",
          regions: "Régions",
          search: "Recherche",
          about: "À propos",
          explore: "Explorer",
          subscribe: "S'abonner",
          menu: "Menu",
          close: "Fermer",
          language: "Langue",
          theme: "Thème",
        }
      : {
          startHere: "Start Here",
          news: "News",
          tutorials: "Tutorials",
          newsletter: "Newsletter",
          regions: "Regions",
          search: "Search",
          about: "About",
          explore: "Explore",
          subscribe: "Subscribe",
          menu: "Menu",
          close: "Close",
          language: "Language",
          theme: "Theme",
        };
  }, [locale]);

  const primaryLinks = [
    { path: "/news", label: navLabels.news, delayClass: "motion-delay-1" },
    { path: "/tutorials", label: navLabels.tutorials, delayClass: "motion-delay-2" },
    { path: "/start-here", label: navLabels.startHere, delayClass: "motion-delay-3" },
  ];

  const secondaryLinks = [
    { path: "/regions", label: navLabels.regions },
    { path: "/newsletter", label: navLabels.newsletter },
    { path: "/search", label: navLabels.search },
    { path: "/about", label: navLabels.about },
    { path: "/rss.xml", label: "RSS", external: true as const },
  ];

  const canonicalPath = stripLocalePrefix(pathname || "/");
  const enHref = withLocalePath(canonicalPath, "en");
  const frHref = withLocalePath(canonicalPath, "fr");
  const subscribeHref = `${localePrefix(locale) || ""}/#newsletter`;

  const isActive = (path: string) => {
    if (path === "/") return canonicalPath === "/";
    return canonicalPath === path || canonicalPath.startsWith(`${path}/`);
  };

  const mobileDrawer =
    mobileOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="mobile-drawer-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={navLabels.menu}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setMobileOpen(false);
            }}
          >
            <div className="mobile-drawer">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">{navLabels.explore}</p>
                <button type="button" className="nav-menu-button" aria-label={navLabels.close} onClick={() => setMobileOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 6l12 12" />
                    <path d="M18 6l-12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 grid gap-1">
                {primaryLinks.map((link) => (
                  <Link
                    key={`drawer-${link.path}`}
                    href={withLocalePath(link.path, locale)}
                    className={`nav-menu-item ${isActive(link.path) ? "nav-menu-item-active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="my-4 h-px w-full" style={{ background: "var(--border)" }} />

              <div className="grid gap-1">
                {secondaryLinks.map((link) =>
                  link.external ? (
                    <a key={`drawer-${link.path}`} href={link.path} className="nav-menu-item" target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={`drawer-${link.path}`}
                      href={withLocalePath(link.path, locale)}
                      className={`nav-menu-item ${isActive(link.path) ? "nav-menu-item-active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>

              <Link href={subscribeHref} className="nav-menu-item nav-menu-cta mt-3" onClick={() => setMobileOpen(false)}>
                {navLabels.subscribe}
              </Link>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] theme-text-faint">{navLabels.language}</p>
                  <div className="lang-switch">
                    <Link href={enHref} className={`lang-pill ${locale === "en" ? "lang-pill-active" : ""}`}>
                      EN
                    </Link>
                    <Link href={frHref} className={`lang-pill ${locale === "fr" ? "lang-pill-active" : ""}`}>
                      FR
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] theme-text-faint">{navLabels.theme}</p>
                  <ThemeToggle locale={locale} />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="theme-header sticky top-0 z-40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href={localePrefix(locale) || "/"} className="brand-mark motion-link">
            <span className="brand-dot" aria-hidden />
            <span>AI Signals</span>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 text-sm theme-text-muted lg:flex">
              {primaryLinks.map((link) => (
                <Link
                  key={link.path}
                  href={withLocalePath(link.path, locale)}
                  className={`nav-pill motion-enter-soft ${link.delayClass} ${isActive(link.path) ? "nav-pill-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}

              <details className="relative">
                <summary className="nav-pill nav-pill-summary motion-enter-soft motion-delay-4">{navLabels.explore}</summary>
                <div className="nav-menu-panel nav-more-panel">
                  {secondaryLinks.map((link) =>
                    link.external ? (
                      <a key={`more-${link.path}`} href={link.path} className="nav-menu-item" target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={`more-${link.path}`}
                        href={withLocalePath(link.path, locale)}
                        className={`nav-menu-item ${isActive(link.path) ? "nav-menu-item-active" : ""}`}
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </div>
              </details>
            </nav>

            <Link
              href={subscribeHref}
              className="hidden rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-zinc-900 transition hover:bg-cyan-200 lg:inline-flex"
            >
              {navLabels.subscribe}
            </Link>

            <div className="lang-switch hidden lg:inline-flex">
              <Link href={enHref} className={`lang-pill ${locale === "en" ? "lang-pill-active" : ""}`}>
                EN
              </Link>
              <Link href={frHref} className={`lang-pill ${locale === "fr" ? "lang-pill-active" : ""}`}>
                FR
              </Link>
            </div>

            <ThemeToggle locale={locale} />

            <button
              type="button"
              className="nav-menu-button hamburger-button lg:hidden"
              aria-label={mobileOpen ? navLabels.close : navLabels.menu}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="sr-only">{navLabels.menu}</span>
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      {mobileDrawer}
    </>
  );
}
