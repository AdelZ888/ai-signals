const LEGACY_EXACT = new Set(["/fr", "/posts", "/tags", "/regions", "/tutorials", "/search", "/start-here", "/services"]);
const LEGACY_PREFIXES = ["/fr/", "/posts/", "/tags/", "/regions/", "/tutorials/", "/services/", "/api/services/", "/newsletter/"];

/** True for URLs of the pre-v2 blog, which must answer 410 Gone. */
export function isLegacyPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/u, "") : pathname;
  if (LEGACY_EXACT.has(p)) return true;
  return LEGACY_PREFIXES.some((prefix) => p.startsWith(prefix));
}
