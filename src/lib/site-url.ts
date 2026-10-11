function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/u, "");
}

export function getSiteUrl() {
  const explicit = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (explicit) return stripTrailingSlash(explicit);

  // On production deployments, prefer the project's production domain (e.g. "aisignals.dev").
  const productionHost = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
  if (process.env.VERCEL_ENV === "production" && productionHost) return `https://${stripTrailingSlash(productionHost)}`;

  // Vercel exposes the deployment hostname without protocol, e.g. "aisignals.dev" or
  // "project-git-branch-user.vercel.app".
  const vercelUrl = String(process.env.VERCEL_URL || "").trim();
  if (vercelUrl) return `https://${stripTrailingSlash(vercelUrl)}`;

  return "http://localhost:3000";
}

