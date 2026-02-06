export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function localePrefix(locale: Locale): string {
  return locale === "fr" ? "/fr" : "";
}

export function withLocalePath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return locale === "fr" ? "/fr" : "/";
  return `${localePrefix(locale)}${normalized}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/fr" || pathname.startsWith("/fr/") ? "fr" : "en";
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/fr") return "/";
  if (pathname.startsWith("/fr/")) return pathname.slice(3);
  return pathname;
}
