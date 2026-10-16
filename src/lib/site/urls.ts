export const modelUrl = (m: { lab: string; slug: string }) => `/models/${m.lab}/${m.slug}`;
export const providerUrl = (lab: string) => `/providers/${lab}`;
export const compareUrl = (key: string) => `/compare/${key}`;
export const bestUrl = (slug: string) => `/best/${slug}`;
export const newsUrl = (slug: string) => `/news/${slug}`;

export function ogImageUrl(title: string, subtitle: string): string {
  return `/api/og?${new URLSearchParams({ title, subtitle }).toString()}`;
}
export const alternativesUrl = (m: { lab: string; slug: string }) => `/models/${m.lab}/${m.slug}/alternatives`;
export const hostUrl = (provider: string) => `/hosts/${provider}`;
