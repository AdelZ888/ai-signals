function clamp(input: string, max: number) {
  const value = String(input || "").trim();
  if (value.length <= max) return value;
  return value.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

export type OgLocale = "en" | "fr";
export type OgKind = "page" | "post" | "newsletter";

type BuildOgUrlInput = {
  title: string;
  subtitle?: string;
  locale: OgLocale;
  kind: OgKind;
  kicker?: string;
};

// Social crawlers can be sensitive to extremely long og:image URLs.
// Keep query params short and predictable.
export function buildOgUrl(input: BuildOgUrlInput) {
  const params = new URLSearchParams({
    title: clamp(input.title, 90),
    subtitle: clamp(input.subtitle || "", 150),
    locale: input.locale,
    kind: input.kind,
  });

  if (input.kicker) params.set("kicker", clamp(input.kicker, 28));

  return `/api/og?${params.toString()}`;
}

