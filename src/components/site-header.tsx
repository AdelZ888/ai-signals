"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { getLocaleFromPathname, localePrefix, stripLocalePrefix, withLocalePath } from "@/lib/i18n";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  const navLabels =
    locale === "fr"
      ? {
          home: "Accueil",
          news: "Actualites",
          tutorials: "Tutoriels",
          newsletter: "Newsletter",
          regions: "Regions",
          search: "Recherche",
          about: "A propos",
        }
      : {
          home: "Home",
          news: "News",
          tutorials: "Tutorials",
          newsletter: "Newsletter",
          regions: "Regions",
          search: "Search",
          about: "About",
        };

  const navLinks = [
    { path: "/", label: navLabels.home, delayClass: "motion-delay-1" },
    { path: "/news", label: navLabels.news, delayClass: "motion-delay-2" },
    { path: "/tutorials", label: navLabels.tutorials, delayClass: "motion-delay-3" },
    { path: "/newsletter", label: navLabels.newsletter, delayClass: "motion-delay-4" },
    { path: "/regions", label: navLabels.regions, delayClass: "motion-delay-5" },
    { path: "/search", label: navLabels.search, delayClass: "motion-delay-6" },
    { path: "/about", label: navLabels.about, delayClass: "motion-delay-7" },
  ];

  const canonicalPath = stripLocalePrefix(pathname || "/");
  const enHref = withLocalePath(canonicalPath, "en");
  const frHref = withLocalePath(canonicalPath, "fr");
  const subscribeHref = `${localePrefix(locale) || ""}/#newsletter`;

  const isActive = (path: string) => {
    if (path === "/") return canonicalPath === "/";
    return canonicalPath === path || canonicalPath.startsWith(`${path}/`);
  };

  return (
    <header className="theme-header sticky top-0 z-40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href={localePrefix(locale) || "/"} className="brand-mark motion-link">
          <span className="brand-dot" aria-hidden />
          <span>AI Signals</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 text-sm theme-text-muted md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={withLocalePath(link.path, locale)}
                className={`nav-pill motion-enter-soft ${link.delayClass} ${isActive(link.path) ? "nav-pill-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href={subscribeHref} className="hidden rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-zinc-900 transition hover:bg-cyan-200 md:inline-flex">
            {locale === "fr" ? "S'abonner" : "Subscribe"}
          </Link>

          <div className="lang-switch">
            <Link href={enHref} className={`lang-pill ${locale === "en" ? "lang-pill-active" : ""}`}>
              EN
            </Link>
            <Link href={frHref} className={`lang-pill ${locale === "fr" ? "lang-pill-active" : ""}`}>
              FR
            </Link>
          </div>

          <ThemeToggle />

          <details className="relative md:hidden">
            <summary className="nav-menu-button">Menu</summary>
            <div className="nav-menu-panel">
              {navLinks.map((link) => (
                <Link
                  key={`mobile-${link.path}`}
                  href={withLocalePath(link.path, locale)}
                  className={`nav-menu-item ${isActive(link.path) ? "nav-menu-item-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href={subscribeHref} className="nav-menu-item nav-menu-cta">
                {locale === "fr" ? "S'abonner" : "Subscribe"}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
