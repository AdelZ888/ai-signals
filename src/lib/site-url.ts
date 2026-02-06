function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/u, "");
}

export function getSiteUrl() {
  const explicit = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (explicit) return stripTrailingSlash(explicit);

  // Vercel exposes the deployment hostname without protocol, e.g. "aisignals.dev" or
  // "project-git-branch-user.vercel.app".
  const vercelUrl = String(process.env.VERCEL_URL || "").trim();
  if (vercelUrl) return `https://${stripTrailingSlash(vercelUrl)}`;

  return "http://localhost:3000";
}

