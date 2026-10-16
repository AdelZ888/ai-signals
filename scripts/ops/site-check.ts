import { getCatalog, getPairs } from "../../src/lib/site/catalog.ts";
import { BEST_LISTS, alternativesPageModels, isIndexable } from "../../src/lib/site/selection.ts";
import { alternativesUrl, bestUrl, compareUrl, modelUrl } from "../../src/lib/site/urls.ts";

type Check = { path: string; status: number; expect?: RegExp; contentType?: string };

const BASE = (process.env.SITE_CHECK_BASE ?? "https://aisignals.dev").replace(/\/+$/u, "");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const BASIC: Check[] = [
  { path: "/", status: 200, expect: /ai_signals/u },
  { path: "/models", status: 200, expect: /All AI models/u },
  { path: "/providers", status: 200 },
  { path: "/compare", status: 200 },
  { path: "/best", status: 200 },
  { path: "/calculator", status: 200 },
  { path: "/changes", status: 200 },
  { path: "/news", status: 200 },
  { path: "/newsletter", status: 200 },
  { path: "/about", status: 200 },
  { path: "/rss.xml", status: 200, expect: /<rss/u },
  { path: "/sitemap.xml", status: 200, expect: /<sitemapindex/u },
  { path: "/sitemaps/models.xml", status: 200, expect: /<urlset/u },
  { path: "/robots.txt", status: 200, expect: /Sitemap:/u },
  { path: "/sitemaps/alternatives.xml", status: 200, expect: /<urlset/u },
  { path: "/llms.txt", status: 200, expect: /^# AI Signals/u },
  { path: "/guides", status: 200, expect: /pricing guides/u },
  { path: "/hosts", status: 200, expect: /inference hosts/u },
  { path: "/data/models.json", status: 200, expect: /"models":\[\{/u },
  { path: "/data/models.csv", status: 200, expect: /^id,name,lab/u },
  { path: "/api/og?title=health", status: 200, contentType: "image/png" },
  { path: "/posts/legacy-check", status: 410 },
  { path: "/fr", status: 410 },
];

/** Checks that depend on the local data (only valid against a build of this checkout). */
function deepChecks(): Check[] {
  const { models } = getCatalog();
  const checks: Check[] = [{ path: "/compare/nope-vs-nothing", status: 404 }];
  const model = models.find(isIndexable);
  if (model) checks.push({ path: modelUrl(model), status: 200, expect: new RegExp(escapeRe(model.name), "u") });
  const withAlternatives = alternativesPageModels(models, getCatalog().today)[0];
  if (withAlternatives) checks.push({ path: alternativesUrl(withAlternatives), status: 200, expect: /alternatives/u });
  const pair = getPairs()[0];
  if (pair) {
    checks.push({ path: compareUrl(pair.key), status: 200 });
    checks.push({ path: compareUrl(`${pair.b.slug}-vs-${pair.a.slug}`), status: 308 });
  }
  for (const list of BEST_LISTS) checks.push({ path: bestUrl(list.slug), status: 200 });
  return checks;
}

async function run(check: Check): Promise<{ check: Check; got: number | string; ok: boolean }> {
  try {
    const res = await fetch(`${BASE}${check.path}`, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
    const typeOk = !check.contentType || (res.headers.get("content-type") ?? "").includes(check.contentType);
    const bodyOk = !check.expect || check.expect.test(await res.text());
    return { check, got: res.status, ok: res.status === check.status && typeOk && bodyOk };
  } catch (error) {
    return { check, got: (error as Error).name, ok: false };
  }
}

async function main(): Promise<number> {
  const checks = process.argv.includes("--deep") ? [...BASIC, ...deepChecks()] : BASIC;
  const results = await Promise.all(checks.map(run));
  for (const r of results) console.log(`${r.ok ? "OK  " : "FAIL"} ${String(r.got).padStart(3)} (want ${r.check.status}) ${r.check.path}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`[site-check] ${BASE}: ${results.length - failed}/${results.length} ok`);
  return failed === 0 ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[site-check] failed:", error);
    process.exit(1);
  },
);
