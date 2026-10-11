# AI Signals v2 — Data Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the auto-generated AI blog at `aisignals.dev` with a fully automated, programmatic data hub: daily model prices and specs from models.dev, model, provider, compare and "best" pages in a terminal design, plus a small grounded editorial engine (flash articles and a weekly digest) written by `gpt-6.1-sol`.

**Architecture:** Pure TypeScript logic lives in `src/lib/**`, uses relative `.ts` imports and only Node built-ins, and is shared by the Next.js 16 site (static generation) and by Node 24 scripts (native type stripping, no build step). Data is stored in git under `data/models/`. GitHub Actions refresh it daily, write at most one article, build, smoke-test and commit. Vercel deploys on push.

**Tech Stack:** Next.js 16.1.6 (App Router, `proxy.ts`), React 19.2, TypeScript 5.9, Node 24, `node:test`, gray-matter + remark/rehype (+ `remark-gfm`), `openai` SDK v6, Resend, Beehiiv API, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-11-ai-signals-data-hub-design.md`

## Global Constraints

- Node `>=24`. Scripts run with `node file.ts` (native type stripping). No `ts-node`/`tsx`.
- `package.json` has `"type": "module"`. `tsconfig.json` adds `allowImportingTsExtensions`, `erasableSyntaxOnly`, `verbatimModuleSyntax`.
- Inside `src/lib/**`, imports are relative and end with `.ts`; type-only imports use `import type`. Pages and components import with `@/lib/...` and no extension.
- No enums, namespaces or parameter properties (erasable syntax only).
- Tests use only `node:test` + `node:assert/strict`. Test files are `*.test.ts` next to the code. Run them with `npm test`.
- New dependency allowed: `remark-gfm@4.0.1` only. Removed: `twitter-api-v2`, `@vercel/blob`, `rss-parser`, `github-slugger`, `slugify`, `remark-html`, `tailwindcss`, `@tailwindcss/postcss`.
- Data source: `https://models.dev/api.json` (MIT). Cross-check: `https://raw.githubusercontent.com/pydantic/genai-prices/main/prices/data_slim.json` (MIT, warnings only). **Never call the OpenRouter API.**
- Lab allow-list (canonical prefixes): `openai, anthropic, google, xai, mistral, deepseek, alibaba, zhipuai, moonshotai, minimax, cohere, meta`. The first-party provider id equals the lab id, except `zhipuai → zai`.
- Host allow-list: `amazon-bedrock, azure, google-vertex, togetherai, fireworks-ai, deepinfra, groq, cerebras, nebius, baseten, novita-ai, cloudflare-workers-ai, nvidia, scaleway`.
- Tier-1 labs: `openai, anthropic, google, xai, deepseek, meta, mistral, alibaba`.
- Blended price = `(3 * input + output) / 4`, in USD per 1M tokens, rounded to 4 decimals.
- `OPENAI_MODEL=gpt-6.1-sol`, timeout 120 s, 3 retries. The LLM is never the source of a number: every number in published text must exist in the fact sheet.
- Flash articles: threshold score ≥ 60, max 1 per day, max 4 per ISO week.
- UI copy in English only. Design tokens: `--bg #0a0e0b`, `--fg #c8f5d8`, `--fg-strong #e9fff1`, `--muted #7ea58c`, `--dim #4f6e5a`, `--line #1d2a21`, `--line-soft #121a15`, `--accent #22c55e`, `--up #f97316`, `--amber #f59e0b`. Font: JetBrains Mono via `next/font/google`. Dark only.
- `AdSlot` renders nothing unless `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` are set, and it is never placed above the key-stats grid.
- Every script exits with an explicit `process.exit(code)`. Every workflow job has `timeout-minutes`. Every workflow push goes through `scripts/ops/commit-and-push.sh` (`pull --rebase` + 3 retries).
- Work happens directly on `main` (Adel's choice, 2026-10-11): one local commit per task. **Push to `origin/main` exactly once, at the end of Task 17** after full verification, because every push deploys production on Vercel and the old Health Check would fail between Task 1 and Task 16.

## Review Focus

1. **A model that disappears from models.dev and comes back** yields a `new_model` event for an old model. It must not produce a "new model" flash article (owner: Task 12, test `re-listed old model is not eligible`).
2. **Month-only or year-only release dates** (`"2026-09"`, 212 such entries in models.dev) must not produce `NaN` in sorting, "newest" lists or chart scales. They are normalized to ISO days (owner: Task 2, test `normalizes partial release dates`).
3. **Zero or tiny prices** (`0.0375`, a price going from 0 to N) must never print `Infinity`, `NaN` or `$0.04` for `$0.0375` (owner: Task 3 `pct from zero never returns Infinity`, Task 6 `fmtUsd keeps small values precise`, `a single point or empty input never yields NaN`).
4. **A corrupted or empty line in `data/models/history/*.jsonl`** (a bad merge, a truncated write) must not crash the whole site build: the line is skipped with a warning (owner: Task 4, test `readEvents skips invalid lines`).
5. **Garbage in the cost calculator** (`"abc"`, `"-5"`, `"1e99"`, empty) must show `$0` or clamped values, never `NaN` or negative costs (owner: Task 7, test `parseTokenInput clamps garbage`).

---

## File Map

```
package.json, tsconfig.json                          (modify)  ESM, Node 24, test script, deps
src/proxy.ts                                          (create)  410 for legacy URLs
src/lib/data/config.ts, types.ts, dates.ts            (create)  allow-lists, types, date helpers
src/lib/data/normalize.ts, validate.ts, diff.ts       (create)  models.dev → Model[] → guards → events
src/lib/data/crosscheck.ts, store.ts, toml.ts         (create)  genai-prices check, data/ IO, TOML cost parser
src/lib/data/backfill.ts, testing.ts                  (create)  timeline → events, test factory
src/lib/data/__fixtures__/modelsdev-mini.json         (create)  test fixture
src/lib/site/legacy.ts, format.ts, urls.ts, chart.ts  (create)  pure UI helpers
src/lib/site/catalog.ts, rows.ts, history.ts, cost.ts (create)  site data access, table rows, price history, cost
src/lib/site/selection.ts, verdict.ts                 (create)  alternatives, pairs, rankings, compare verdict
src/lib/site/seo.ts, articles.ts                      (create)  titles, sitemaps, RSS, markdown articles
src/lib/editorial/score.ts, factsheet.ts, guards.ts   (create)  click score, fact sheet, grounding
src/lib/editorial/template.ts, digest.ts, email.ts    (create)  no-LLM article, weekly digest, email HTML
scripts/data/refresh.ts, backfill-history.ts          (create)
scripts/editorial/openai.ts, prompts.ts, run.ts, weekly-digest.ts (create)
scripts/newsletter/send-digest.ts                     (create)
scripts/ops/site-check.ts, staleness.ts, check-staleness.ts, commit-and-push.sh (create)
src/app/** pages, src/components/**                   (rewrite) terminal UI
.github/workflows/daily-update.yml, weekly-digest.yml (create); health-check.yml, alert-on-failure.yml (rewrite)
```

---

### Task 1: Purge the legacy blog and set up the TypeScript/Node 24 toolchain

**Files:**
- Delete: `content/`, `data/*.json`, `scripts/*` except `scripts/send-alert.mjs` and `scripts/load-env.mjs`, the 7 `.github/workflows/auto-*.yml` files, `postcss.config.mjs`, `public/{file,globe,next,vercel,window}.svg`
- Delete: `src/app/{fr,posts,tags,regions,tutorials,search,start-here,services,news,about,rss.xml}/`, `src/app/api/services/`, `src/app/newsletter/` (whole folder), `src/app/sitemap.ts`
- Delete: `src/components/*` except `google-analytics.tsx`; `src/lib/{og,i18n,newsletters,posts}.ts`
- Modify: `package.json`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/not-found.tsx`
- Create: `src/lib/site/legacy.ts`, `src/lib/site/legacy.test.ts`, `src/proxy.ts`

**Interfaces:**
- Produces: `isLegacyPath(pathname: string): boolean`; `npm test` runs every `*.test.ts`; the root layout loads the font variable `--font-mono`.

- [ ] **Step 1: Start from an up-to-date `main`**

```bash
git checkout main && git pull --ff-only && git status --short
```

Expected: on `main`, up to date with `origin/main`. The only pending changes are `.gitignore` (the `.superpowers/` line) and `docs/`: commit them first with `git add .gitignore docs && git commit -m "docs: v2 data hub spec and implementation plan"`.

- [ ] **Step 2: Delete legacy files**

```bash
git rm -r -q content data/newsletter-sent.json data/posts-index.en.json data/posts-index.fr.json data/topics-queue.json data/x-posted.json
git rm -q scripts/automate.mjs scripts/backfill-60-days.mjs scripts/backfill-cover-images.mjs scripts/compact-queue.mjs scripts/cover-images.mjs scripts/discover-topics.mjs scripts/generate-newsletter.mjs scripts/generate-post.mjs scripts/health-check.mjs scripts/posts-index.mjs scripts/rebuild-posts-index.mjs scripts/send-newsletter.mjs scripts/send-x.mjs
git rm -q .github/workflows/auto-newsletter.yml .github/workflows/auto-post-x-content.yml .github/workflows/auto-post-x-engagement.yml .github/workflows/auto-post-x-weekly-thread.yml .github/workflows/auto-publish-tutorial.yml .github/workflows/auto-publish.yml .github/workflows/auto-send-newsletter.yml
git rm -r -q src/app/fr src/app/posts src/app/tags src/app/regions src/app/tutorials src/app/search src/app/start-here src/app/services src/app/news src/app/about src/app/rss.xml src/app/api/services src/app/newsletter src/app/sitemap.ts
git rm -q src/lib/og.ts src/lib/i18n.ts src/lib/newsletters.ts src/lib/posts.ts postcss.config.mjs public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
cd src/components && git rm -q $(ls | grep -v '^google-analytics.tsx$') && cd ../..
```

Expected: `git status --short | head` shows only `D` lines; `ls src/components` prints `google-analytics.tsx`.

- [ ] **Step 3: Update dependencies and package metadata**

```bash
npm uninstall twitter-api-v2 @vercel/blob rss-parser github-slugger slugify remark-html tailwindcss @tailwindcss/postcss
npm install remark-gfm@4.0.1
npm install -D @types/node@24
npm pkg set type=module version=2.0.0 "engines.node=>=24"
npm pkg set scripts.test="node --test \"src/**/*.test.ts\" \"scripts/**/*.test.ts\""
npm pkg delete scripts.discover-topics scripts.generate-post scripts.generate-tutorial scripts.generate-newsletter scripts.send-newsletter scripts.send-x scripts.backfill-covers scripts.backfill-60days scripts.rebuild-posts-index scripts.automate
```

Expected: `npm pkg get scripts` prints only `dev`, `build`, `start`, `lint`, `test`.

- [ ] **Step 4: Update `tsconfig.json` compiler options**

Add these three keys inside `compilerOptions` (keep every existing key):

```json
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
```

- [ ] **Step 5: Write the failing legacy-path test**

`src/lib/site/legacy.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { isLegacyPath } from "./legacy.ts";

test("old blog URLs are legacy", () => {
  for (const p of [
    "/posts/2026-01-05-x", "/posts", "/fr", "/fr/", "/fr/posts/x", "/tags/ai", "/regions/us",
    "/tutorials", "/search", "/start-here", "/services", "/api/services/lead",
    "/newsletter/2026-02-06-ai-signals-issue-1", "/newsletter/rss.xml",
  ]) {
    assert.equal(isLegacyPath(p), true, p);
  }
});

test("new site URLs are not legacy", () => {
  for (const p of [
    "/", "/models", "/models/openai/gpt-6.1-sol", "/news", "/news/x", "/newsletter", "/newsletter/",
    "/api/newsletter/subscribe", "/compare/a-vs-b", "/fresh-models",
  ]) {
    assert.equal(isLegacyPath(p), false, p);
  }
});
```

- [ ] **Step 6: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../src/lib/site/legacy.ts'`.

- [ ] **Step 7: Implement `src/lib/site/legacy.ts`**

```ts
const LEGACY_EXACT = new Set(["/fr", "/posts", "/tags", "/regions", "/tutorials", "/search", "/start-here", "/services"]);
const LEGACY_PREFIXES = ["/fr/", "/posts/", "/tags/", "/regions/", "/tutorials/", "/services/", "/api/services/", "/newsletter/"];

/** True for URLs of the pre-v2 blog, which must answer 410 Gone. */
export function isLegacyPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/u, "") : pathname;
  if (LEGACY_EXACT.has(p)) return true;
  return LEGACY_PREFIXES.some((prefix) => p.startsWith(prefix));
}
```

- [ ] **Step 8: Run the tests and verify they pass**

Run: `npm test`
Expected: `ℹ pass 2`, `ℹ fail 0`.

- [ ] **Step 9: Create `src/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

import { isLegacyPath } from "./lib/site/legacy.ts";

export function proxy(request: NextRequest) {
  if (isLegacyPath(request.nextUrl.pathname)) {
    return new NextResponse("410 Gone: this page was removed when AI Signals became an AI model pricing tracker.\n", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/fr", "/fr/:path*", "/posts/:path*", "/tags/:path*", "/regions/:path*", "/tutorials/:path*",
    "/search", "/start-here", "/services/:path*", "/api/services/:path*", "/newsletter/:path+",
  ],
};
```

- [ ] **Step 10: Replace `src/app/globals.css` with the token base** (the full design system comes in Task 6)

```css
:root {
  --bg: #0a0e0b;
  --fg: #c8f5d8;
  --fg-strong: #e9fff1;
  --muted: #7ea58c;
  --dim: #4f6e5a;
  --line: #1d2a21;
  --line-soft: #121a15;
  --accent: #22c55e;
  --up: #f97316;
  --amber: #f59e0b;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-mono), ui-monospace, Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 11: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";

import { GoogleAnalytics } from "@/components/google-analytics";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600", "700"] });

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
const TITLE = "AI Signals: AI Model API Pricing & Specs, Updated Daily";
const DESCRIPTION =
  "Track the price, context window and capabilities of every major AI model API. Compare models and estimate your monthly cost. Updated daily.";
const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI",
  "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
];

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: TITLE, template: "%s | AI Signals" },
  description: DESCRIPTION,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  alternates: { canonical: "/", types: { "application/rss+xml": [{ title: "AI Signals", url: "/rss.xml" }] } },
  openGraph: {
    type: "website",
    siteName: "AI Signals",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/api/og?title=AI%20Signals&subtitle=Every%20AI%20model%27s%20price%2C%20tracked%20daily", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

const gaBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)}, wait_for_update: 500 });
gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
`.trim();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga-bootstrap" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gaBootstrap }} />
          </>
        ) : null}
        {ADSENSE_CLIENT ? (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className={mono.variable}>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID || undefined} />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 12: Replace `src/app/page.tsx` (temporary, rewritten in Task 9) and `src/app/not-found.tsx`**

`src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px" }}>
      <h1>&gt; ai_signals_</h1>
      <p>v2 under construction.</p>
    </main>
  );
}
```

`src/app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell" style={{ padding: "40px 16px" }}>
      <p className="dim">$ curl -I {"<this page>"}</p>
      <h1>404: not found</h1>
      <p>
        This page does not exist. Try the <Link href="/models">model list</Link> or the <Link href="/calculator">cost calculator</Link>.
      </p>
    </main>
  );
}
```

- [ ] **Step 13: Verify lint, tests, build and the 410 behaviour**

```bash
npm run lint && npm test && npm run build
npm start -- -p 3100 & sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/posts/anything
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/fr
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/
kill %1
```

Expected: lint clean, `pass 2`, build succeeds, then `410`, `410`, `200`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: purge legacy blog, set up Node 24 TypeScript toolchain and 410 proxy"
```

---

### Task 2: Data model, allow-lists and models.dev normalization

**Files:**
- Create: `src/lib/data/config.ts`, `src/lib/data/types.ts`, `src/lib/data/dates.ts`, `src/lib/data/normalize.ts`, `src/lib/data/testing.ts`
- Create: `src/lib/data/__fixtures__/modelsdev-mini.json`
- Test: `src/lib/data/dates.test.ts`, `src/lib/data/normalize.test.ts`

**Interfaces:**
- Produces:
  - `config.ts`: `LAB_IDS`, `type LabId`, `isLabId(x: string): x is LabId`, `LAB_PROVIDER: Record<LabId, string>`, `LAB_NAMES: Record<LabId, string>`, `TIER1_LABS: ReadonlySet<string>`, `HOST_IDS`, `HOST_NAMES: Record<string, string>`, `MODELS_DEV_URL`, `GENAI_PRICES_URL`, `GUARDS`
  - `types.ts`: `Price`, `PriceTier`, `Host`, `ModelStatus`, `Model`, `PriceSnapshot`, `EventType`, `ModelEvent`, `Meta`
  - `dates.ts`: `toIsoDay(v): string | null`, `daysBetween(from, to): number`, `addDays(date, n): string`, `isoWeek(date): string` (e.g. `"2026-W41"`), `lastWeekRange(today): { start; end; weekId }`
  - `normalize.ts`: `type RawModelsDev`, `round(n, digits?)`, `blendedPrice(input, output)`, `normalizeModelsDev(raw: RawModelsDev): Model[]` (sorted by `id`)
  - `testing.ts`: `makeModel(over: Partial<Model> & { id: string }): Model`

- [ ] **Step 1: Create `src/lib/data/config.ts`**

```ts
export const LAB_IDS = [
  "openai", "anthropic", "google", "xai", "mistral", "deepseek",
  "alibaba", "zhipuai", "moonshotai", "minimax", "cohere", "meta",
] as const;
export type LabId = (typeof LAB_IDS)[number];

export function isLabId(value: string): value is LabId {
  return (LAB_IDS as readonly string[]).includes(value);
}

/** models.dev provider id that sells the lab's own API. */
export const LAB_PROVIDER: Record<LabId, string> = {
  openai: "openai", anthropic: "anthropic", google: "google", xai: "xai", mistral: "mistral",
  deepseek: "deepseek", alibaba: "alibaba", zhipuai: "zai", moonshotai: "moonshotai",
  minimax: "minimax", cohere: "cohere", meta: "meta",
};

export const LAB_NAMES: Record<LabId, string> = {
  openai: "OpenAI", anthropic: "Anthropic", google: "Google", xai: "xAI", mistral: "Mistral",
  deepseek: "DeepSeek", alibaba: "Alibaba (Qwen)", zhipuai: "Z.AI (Zhipu)", moonshotai: "Moonshot AI",
  minimax: "MiniMax", cohere: "Cohere", meta: "Meta",
};

export const TIER1_LABS: ReadonlySet<string> = new Set([
  "openai", "anthropic", "google", "xai", "deepseek", "meta", "mistral", "alibaba",
]);

export const HOST_IDS = [
  "amazon-bedrock", "azure", "google-vertex", "togetherai", "fireworks-ai", "deepinfra", "groq",
  "cerebras", "nebius", "baseten", "novita-ai", "cloudflare-workers-ai", "nvidia", "scaleway",
] as const;

export const HOST_NAMES: Record<string, string> = {
  "amazon-bedrock": "Amazon Bedrock", azure: "Azure", "google-vertex": "Google Vertex AI",
  togetherai: "Together AI", "fireworks-ai": "Fireworks AI", deepinfra: "DeepInfra", groq: "Groq",
  cerebras: "Cerebras", nebius: "Nebius", baseten: "Baseten", "novita-ai": "Novita AI",
  "cloudflare-workers-ai": "Cloudflare Workers AI", nvidia: "NVIDIA", scaleway: "Scaleway",
};

export const MODELS_DEV_URL = "https://models.dev/api.json";
export const GENAI_PRICES_URL = "https://raw.githubusercontent.com/pydantic/genai-prices/main/prices/data_slim.json";

export const GUARDS = { maxCountDropPct: 20, maxPricePerM: 1000, maxChangedPct: 30, minCommonForChangeCheck: 10 } as const;
```

- [ ] **Step 2: Create `src/lib/data/types.ts`**

```ts
export type PriceTier = { minContext: number; input: number; output: number };

/** USD per 1M tokens, base tier. */
export type Price = { input: number; output: number; cacheRead?: number; cacheWrite?: number; tiers?: PriceTier[] };

export type Host = { provider: string; input: number; output: number };

export type ModelStatus = "active" | "deprecated" | "beta";

export type Model = {
  /** Canonical id, e.g. "anthropic/claude-haiku-5-5". */
  id: string;
  /** URL segment, unique across the catalog. */
  slug: string;
  lab: string;
  name: string;
  family: string | null;
  /** ISO day (YYYY-MM-DD). */
  releaseDate: string | null;
  knowledgeCutoff: string | null;
  status: ModelStatus;
  openWeights: boolean;
  price: Price;
  blended: number;
  /** Provider whose price is the reference (first party, or the cheapest allow-listed host). */
  priceSource: string;
  context: number;
  maxOutput: number | null;
  modalitiesIn: string[];
  capabilities: { reasoning: boolean; toolCall: boolean; structuredOutput: boolean };
  hosts: Host[];
  aliases: string[];
};

export type PriceSnapshot = { input: number; output: number; blended: number; context: number };

export type EventType = "new_model" | "price_change" | "context_change" | "deprecated" | "removed";

export type ModelEvent = {
  date: string;
  id: string;
  lab: string;
  slug: string;
  name: string;
  type: EventType;
  before?: PriceSnapshot;
  after?: PriceSnapshot;
  /** For price_change: percent change of the blended price. */
  pctChange?: number;
};

export type Meta = { lastSuccessAt: string; source: string; modelCount: number; lastChangeAt: string | null };
```

- [ ] **Step 3: Write the failing date tests**

`src/lib/data/dates.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { addDays, daysBetween, isoWeek, lastWeekRange, toIsoDay } from "./dates.ts";

test("normalizes partial release dates", () => {
  assert.equal(toIsoDay("2026-10-07"), "2026-10-07");
  assert.equal(toIsoDay("2026-09"), "2026-09-01");
  assert.equal(toIsoDay("2025"), "2025-01-01");
  assert.equal(toIsoDay(""), null);
  assert.equal(toIsoDay(undefined), null);
  assert.equal(toIsoDay("soon"), null);
});

test("day arithmetic is UTC-stable", () => {
  assert.equal(daysBetween("2026-10-01", "2026-10-11"), 10);
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("isoWeek follows ISO-8601", () => {
  assert.equal(isoWeek("2026-10-11"), "2026-W41"); // Sunday
  assert.equal(isoWeek("2026-10-12"), "2026-W42"); // Monday
  assert.equal(isoWeek("2026-01-01"), "2026-W01");
  assert.equal(isoWeek("2026-12-31"), "2026-W53");
});

test("lastWeekRange returns the previous Monday-Sunday", () => {
  assert.deepEqual(lastWeekRange("2026-10-12"), { start: "2026-10-05", end: "2026-10-11", weekId: "2026-W41" });
  assert.deepEqual(lastWeekRange("2026-10-14"), { start: "2026-10-05", end: "2026-10-11", weekId: "2026-W41" });
});
```

- [ ] **Step 4: Run the tests and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../src/lib/data/dates.ts'`.

- [ ] **Step 5: Implement `src/lib/data/dates.ts`**

```ts
const DAY_MS = 86_400_000;

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function toIsoDay(value: string | null | undefined): string | null {
  const v = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/u.test(v)) return v;
  if (/^\d{4}-\d{2}$/u.test(v)) return `${v}-01`;
  if (/^\d{4}$/u.test(v)) return `${v}-01-01`;
  return null;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isoWeek(date: string): string {
  const d = utc(date);
  const dayFromMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayFromMonday + 3); // Thursday of this week
  const year = d.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / DAY_MS - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function lastWeekRange(today: string): { start: string; end: string; weekId: string } {
  const dayFromMonday = (utc(today).getUTCDay() + 6) % 7;
  const thisMonday = addDays(today, -dayFromMonday);
  const start = addDays(thisMonday, -7);
  return { start, end: addDays(thisMonday, -1), weekId: isoWeek(start) };
}
```

- [ ] **Step 6: Run the tests and verify they pass**

Run: `npm test`
Expected: all date tests pass.

- [ ] **Step 7: Create the fixture `src/lib/data/__fixtures__/modelsdev-mini.json`**

It covers a first-party model with tiers, a dated snapshot alias, a deprecated model with a month-only date, an image model and a free model (both excluded), a non-allow-listed lab and an aggregator (both excluded), a host-only open-weights model on 2 hosts, the `zai → zhipuai` mapping, and a slug collision.

```json
{
  "anthropic": {
    "id": "anthropic", "name": "Anthropic",
    "models": {
      "claude-haiku-5-5": {
        "id": "claude-haiku-5-5", "name": "Claude Haiku 5.5", "family": "claude-haiku",
        "release_date": "2026-10-07", "knowledge": "2026-06", "open_weights": false,
        "reasoning": true, "tool_call": true, "structured_output": true,
        "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
        "limit": { "context": 1000000, "output": 128000 },
        "cost": { "input": 0.1, "output": 0.5, "cache_read": 0.01, "cache_write": 0.125,
          "tiers": [{ "input": 0.5, "output": 2.5, "tier": { "type": "context", "size": 100000 } }] },
        "canonical_model_id": "anthropic/claude-haiku-5-5"
      },
      "claude-opus-4-5": {
        "id": "claude-opus-4-5", "name": "Claude Opus 4.5", "family": "claude-opus",
        "release_date": "2025-11-24", "open_weights": false, "reasoning": true, "tool_call": true,
        "modalities": { "input": ["text", "image"], "output": ["text"] },
        "limit": { "context": 200000, "output": 64000 },
        "cost": { "input": 5, "output": 25 },
        "canonical_model_id": "anthropic/claude-opus-4-5"
      },
      "claude-opus-4-5-20251101": {
        "id": "claude-opus-4-5-20251101", "name": "Claude Opus 4.5 (2025-11-01)", "family": "claude-opus",
        "release_date": "2025-11-01", "open_weights": false, "reasoning": true, "tool_call": true,
        "modalities": { "input": ["text", "image"], "output": ["text"] },
        "limit": { "context": 200000, "output": 64000 },
        "cost": { "input": 5, "output": 25 },
        "canonical_model_id": "anthropic/claude-opus-4-5-20251101"
      },
      "claude-3-haiku": {
        "id": "claude-3-haiku", "name": "Claude Haiku 3", "family": "claude-haiku", "status": "deprecated",
        "release_date": "2024-03", "open_weights": false, "tool_call": true,
        "modalities": { "input": ["text", "image"], "output": ["text"] },
        "limit": { "context": 200000, "output": 4096 },
        "cost": { "input": 0.25, "output": 1.25 }
      }
    }
  },
  "openai": {
    "id": "openai", "name": "OpenAI",
    "models": {
      "gpt-6.1-sol": {
        "id": "gpt-6.1-sol", "name": "GPT-6.1 Sol", "family": "gpt-sol", "release_date": "2026-09-29",
        "knowledge": "2026-03", "open_weights": false, "reasoning": true, "tool_call": true, "structured_output": true,
        "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] },
        "limit": { "context": 1050000, "output": 128000 },
        "cost": { "input": 2, "output": 10, "cache_read": 0.1, "context_over_200k": { "input": 4, "output": 15 } },
        "canonical_model_id": "openai/gpt-6.1-sol"
      },
      "gpt-image-2": {
        "id": "gpt-image-2", "name": "GPT Image 2",
        "modalities": { "input": ["text", "image"], "output": ["image"] },
        "limit": { "context": 32000, "output": 0 }, "cost": { "input": 5, "output": 40 },
        "canonical_model_id": "openai/gpt-image-2"
      },
      "gpt-free-preview": {
        "id": "gpt-free-preview", "name": "GPT Free Preview",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 16000 }, "cost": { "input": 0, "output": 0 },
        "canonical_model_id": "openai/gpt-free-preview"
      }
    }
  },
  "zai": {
    "id": "zai", "name": "Z.AI",
    "models": {
      "glm-5": {
        "id": "glm-5", "name": "GLM-5", "family": "glm", "release_date": "2026-02-11", "open_weights": true,
        "reasoning": true, "tool_call": true, "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 200000, "output": 128000 }, "cost": { "input": 1, "output": 3.2 },
        "canonical_model_id": "zhipuai/glm-5"
      }
    }
  },
  "mistral": {
    "id": "mistral", "name": "Mistral",
    "models": {
      "glm-5": {
        "id": "glm-5", "name": "Mistral GLM 5", "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 32000, "output": 8000 }, "cost": { "input": 0.5, "output": 1.5 },
        "canonical_model_id": "mistral/glm-5"
      }
    }
  },
  "togetherai": {
    "id": "togetherai", "name": "Together AI",
    "models": {
      "google/gemma-4-31b-it": {
        "id": "google/gemma-4-31b-it", "name": "Gemma 4 31B (Together)", "family": "gemma",
        "release_date": "2026-04-02", "open_weights": true, "tool_call": false,
        "modalities": { "input": ["text", "image"], "output": ["text"] },
        "limit": { "context": 262144, "output": 8192 }, "cost": { "input": 0.2, "output": 0.6 },
        "canonical_model_id": "google/gemma-4-31b-it"
      },
      "zai-org/GLM-5": {
        "id": "zai-org/GLM-5", "name": "GLM-5 (Together)", "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 200000, "output": 32000 }, "cost": { "input": 1.1, "output": 3.5 },
        "canonical_model_id": "zhipuai/glm-5"
      },
      "xiaomi/mimo-v3": {
        "id": "xiaomi/mimo-v3", "name": "MiMo V3", "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 }, "cost": { "input": 0.3, "output": 1 },
        "canonical_model_id": "xiaomi/mimo-v3"
      }
    }
  },
  "deepinfra": {
    "id": "deepinfra", "name": "DeepInfra",
    "models": {
      "google/gemma-4-31b-it": {
        "id": "google/gemma-4-31b-it", "name": "Gemma 4 31B", "family": "gemma",
        "release_date": "2026-04-02", "open_weights": true, "tool_call": false,
        "modalities": { "input": ["text", "image"], "output": ["text"] },
        "limit": { "context": 262144, "output": 8192 }, "cost": { "input": 0.12, "output": 0.4 },
        "canonical_model_id": "google/gemma-4-31b-it"
      }
    }
  },
  "openrouter": {
    "id": "openrouter", "name": "OpenRouter",
    "models": {
      "anthropic/claude-haiku-5-5": {
        "id": "anthropic/claude-haiku-5-5", "name": "Claude Haiku 5.5",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 1000000, "output": 128000 }, "cost": { "input": 0.09, "output": 0.45 },
        "canonical_model_id": "anthropic/claude-haiku-5-5"
      }
    }
  }
}
```

- [ ] **Step 8: Write the failing normalization test**

`src/lib/data/normalize.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { blendedPrice, normalizeModelsDev, type RawModelsDev } from "./normalize.ts";

const raw = JSON.parse(
  readFileSync(new URL("./__fixtures__/modelsdev-mini.json", import.meta.url), "utf8"),
) as RawModelsDev;
const models = normalizeModelsDev(raw);
const byId = new Map(models.map((m) => [m.id, m]));

test("keeps only allow-listed labs, text output and paid models", () => {
  assert.deepEqual(
    models.map((m) => m.id),
    [
      "anthropic/claude-3-haiku",
      "anthropic/claude-haiku-5-5",
      "anthropic/claude-opus-4-5",
      "google/gemma-4-31b-it",
      "mistral/glm-5",
      "openai/gpt-6.1-sol",
      "zhipuai/glm-5",
    ],
  );
});

test("first-party price wins and aggregators are ignored", () => {
  const haiku = byId.get("anthropic/claude-haiku-5-5")!;
  assert.equal(haiku.priceSource, "anthropic");
  assert.deepEqual(haiku.price, {
    input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125,
    tiers: [{ minContext: 100000, input: 0.5, output: 2.5 }],
  });
  assert.equal(haiku.blended, 0.2);
  assert.deepEqual(haiku.hosts, []);
  assert.deepEqual(haiku.capabilities, { reasoning: true, toolCall: true, structuredOutput: true });
  assert.deepEqual(haiku.modalitiesIn, ["text", "image", "pdf"]);
  assert.equal(haiku.context, 1000000);
  assert.equal(haiku.maxOutput, 128000);
  assert.equal(haiku.knowledgeCutoff, "2026-06");
});

test("legacy context_over_200k becomes a tier", () => {
  assert.deepEqual(byId.get("openai/gpt-6.1-sol")!.price.tiers, [{ minContext: 200000, input: 4, output: 15 }]);
  assert.equal(byId.get("openai/gpt-6.1-sol")!.slug, "gpt-6.1-sol");
});

test("host-only models use the cheapest allow-listed host", () => {
  const gemma = byId.get("google/gemma-4-31b-it")!;
  assert.equal(gemma.priceSource, "deepinfra");
  assert.equal(gemma.name, "Gemma 4 31B");
  assert.equal(gemma.blended, 0.19);
  assert.deepEqual(gemma.hosts, [
    { provider: "deepinfra", input: 0.12, output: 0.4 },
    { provider: "togetherai", input: 0.2, output: 0.6 },
  ]);
});

test("zai provider maps to the zhipuai lab and keeps host prices", () => {
  const glm = byId.get("zhipuai/glm-5")!;
  assert.equal(glm.lab, "zhipuai");
  assert.equal(glm.priceSource, "zai");
  assert.deepEqual(glm.hosts, [{ provider: "togetherai", input: 1.1, output: 3.5 }]);
});

test("dated snapshots with identical prices become aliases", () => {
  assert.deepEqual(byId.get("anthropic/claude-opus-4-5")!.aliases, ["claude-opus-4-5-20251101"]);
  assert.equal(byId.has("anthropic/claude-opus-4-5-20251101"), false);
});

test("normalizes partial release dates and status", () => {
  const old = byId.get("anthropic/claude-3-haiku")!;
  assert.equal(old.releaseDate, "2024-03-01");
  assert.equal(old.status, "deprecated");
});

test("slug collisions get a lab suffix on the later id", () => {
  assert.equal(byId.get("mistral/glm-5")!.slug, "glm-5");
  assert.equal(byId.get("zhipuai/glm-5")!.slug, "glm-5-zhipuai");
  assert.equal(new Set(models.map((m) => m.slug)).size, models.length);
});

test("blendedPrice is 3:1 input:output", () => {
  assert.equal(blendedPrice(1, 2), 1.25);
  assert.equal(blendedPrice(0, 4), 1);
});
```

- [ ] **Step 9: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../src/lib/data/normalize.ts'`.

- [ ] **Step 10: Implement `src/lib/data/normalize.ts`**

```ts
import { HOST_IDS, LAB_IDS, LAB_PROVIDER, isLabId, type LabId } from "./config.ts";
import { toIsoDay } from "./dates.ts";
import type { Host, Model, ModelStatus, Price, PriceTier } from "./types.ts";

type RawTier = { input?: number; output?: number; tier?: { type?: string; size?: number } };
type RawCost = {
  input?: number; output?: number; cache_read?: number; cache_write?: number;
  tiers?: RawTier[]; context_over_200k?: { input?: number; output?: number };
};
type RawModel = {
  id?: string; name?: string; family?: string; release_date?: string; knowledge?: string; status?: string;
  open_weights?: boolean; reasoning?: boolean; tool_call?: boolean; structured_output?: boolean;
  modalities?: { input?: string[]; output?: string[] }; limit?: { context?: number; output?: number };
  cost?: RawCost; canonical_model_id?: string;
};
export type RawModelsDev = Record<string, { id?: string; name?: string; models?: Record<string, RawModel> }>;

type Candidate = { providerId: string; key: string; raw: RawModel & { cost: { input: number; output: number } } };

const DATE_SUFFIX = /-(\d{8}|\d{4}-\d{2}-\d{2}|\d{4})$/u;
const PROVIDER_TO_LAB = new Map<string, LabId>(LAB_IDS.map((lab) => [LAB_PROVIDER[lab], lab]));
const HOSTS: ReadonlySet<string> = new Set(HOST_IDS);

export function round(n: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function blendedPrice(input: number, output: number): number {
  return round((3 * input + output) / 4);
}

function isPaidText(m: RawModel): m is Candidate["raw"] {
  const c = m.cost;
  return (
    (m.modalities?.output ?? []).includes("text") &&
    typeof c?.input === "number" && typeof c.output === "number" &&
    (c.input > 0 || c.output > 0)
  );
}

function toTiers(cost: RawCost): PriceTier[] | undefined {
  const tiers: PriceTier[] = [];
  for (const t of cost.tiers ?? []) {
    if (t.tier?.type === "context" && typeof t.tier.size === "number" && typeof t.input === "number" && typeof t.output === "number") {
      tiers.push({ minContext: t.tier.size, input: t.input, output: t.output });
    }
  }
  const legacy = cost.context_over_200k;
  if (tiers.length === 0 && typeof legacy?.input === "number" && typeof legacy.output === "number") {
    tiers.push({ minContext: 200_000, input: legacy.input, output: legacy.output });
  }
  return tiers.length > 0 ? tiers.sort((a, b) => a.minContext - b.minContext) : undefined;
}

function toPrice(cost: RawCost & { input: number; output: number }): Price {
  const price: Price = { input: cost.input, output: cost.output };
  if (typeof cost.cache_read === "number") price.cacheRead = cost.cache_read;
  if (typeof cost.cache_write === "number") price.cacheWrite = cost.cache_write;
  const tiers = toTiers(cost);
  if (tiers) price.tiers = tiers;
  return price;
}

function toStatus(status: string | undefined): ModelStatus {
  if (status === "deprecated") return "deprecated";
  if (status === "beta" || status === "alpha") return "beta";
  return "active";
}

function slugFromId(id: string): string {
  return id.split("/").slice(1).join("-").toLowerCase().replace(/[^a-z0-9.-]+/gu, "-").replace(/^-+|-+$/gu, "");
}

function cheapest(cands: Candidate[]): Candidate {
  return [...cands].sort(
    (a, b) => blendedPrice(a.raw.cost.input, a.raw.cost.output) - blendedPrice(b.raw.cost.input, b.raw.cost.output) || a.providerId.localeCompare(b.providerId),
  )[0];
}

function toHosts(cands: Candidate[]): Host[] {
  const best = new Map<string, Host>();
  for (const c of cands) {
    const host: Host = { provider: c.providerId, input: c.raw.cost.input, output: c.raw.cost.output };
    const current = best.get(c.providerId);
    if (!current || blendedPrice(host.input, host.output) < blendedPrice(current.input, current.output)) best.set(c.providerId, host);
  }
  return [...best.values()].sort((a, b) => blendedPrice(a.input, a.output) - blendedPrice(b.input, b.output) || a.provider.localeCompare(b.provider));
}

export function normalizeModelsDev(raw: RawModelsDev): Model[] {
  const byId = new Map<string, { firstParty?: Candidate; hosts: Candidate[] }>();

  for (const [providerId, provider] of Object.entries(raw)) {
    const providerLab = PROVIDER_TO_LAB.get(providerId);
    const isHost = HOSTS.has(providerId);
    if (!providerLab && !isHost) continue;

    for (const [key, m] of Object.entries(provider.models ?? {})) {
      if (!isPaidText(m)) continue;
      let id = (m.canonical_model_id ?? "").trim();
      if (!id && providerLab) id = `${providerLab}/${m.id ?? key}`;
      const lab = id.split("/")[0];
      if (!id || !isLabId(lab)) continue;

      const entry = byId.get(id) ?? { hosts: [] };
      const cand: Candidate = { providerId, key, raw: m };
      if (providerLab === lab) entry.firstParty ??= cand;
      else if (isHost) entry.hosts.push(cand);
      else continue;
      byId.set(id, entry);
    }
  }

  const models: Model[] = [];
  for (const [id, entry] of byId) {
    const base = entry.firstParty ?? cheapest(entry.hosts);
    const m = base.raw;
    const price = toPrice(m.cost);
    models.push({
      id,
      slug: slugFromId(id),
      lab: id.split("/")[0],
      name: (m.name ?? base.key).trim(),
      family: m.family ?? null,
      releaseDate: toIsoDay(m.release_date),
      knowledgeCutoff: m.knowledge ?? null,
      status: toStatus(m.status),
      openWeights: Boolean(m.open_weights),
      price,
      blended: blendedPrice(price.input, price.output),
      priceSource: base.providerId,
      context: m.limit?.context ?? 0,
      maxOutput: m.limit?.output ? m.limit.output : null,
      modalitiesIn: m.modalities?.input ?? ["text"],
      capabilities: { reasoning: Boolean(m.reasoning), toolCall: Boolean(m.tool_call), structuredOutput: Boolean(m.structured_output) },
      hosts: toHosts(entry.hosts),
      aliases: [],
    });
  }

  // Merge dated snapshots into their base model when prices match.
  const index = new Map(models.map((m) => [m.id, m]));
  const merged: Model[] = [];
  for (const m of models) {
    const match = m.id.match(DATE_SUFFIX);
    const base = match ? index.get(m.id.slice(0, -match[0].length)) : undefined;
    if (base && base.price.input === m.price.input && base.price.output === m.price.output) {
      base.aliases.push(m.slug);
      continue;
    }
    merged.push(m);
  }

  merged.sort((a, b) => a.id.localeCompare(b.id));
  const seen = new Set<string>();
  for (const m of merged) {
    m.aliases.sort();
    if (seen.has(m.slug)) m.slug = `${m.slug}-${m.lab}`;
    seen.add(m.slug);
  }
  return merged;
}
```

- [ ] **Step 11: Create the test factory `src/lib/data/testing.ts`** (used by later tests)

```ts
import { blendedPrice } from "./normalize.ts";
import type { Model } from "./types.ts";

export function makeModel(over: Partial<Model> & { id: string }): Model {
  const [lab, ...rest] = over.id.split("/");
  const price = over.price ?? { input: 1, output: 2 };
  return {
    slug: rest.join("-"),
    lab,
    name: rest.join("-"),
    family: null,
    releaseDate: "2026-09-01",
    knowledgeCutoff: null,
    status: "active",
    openWeights: false,
    priceSource: lab,
    context: 128_000,
    maxOutput: 8_192,
    modalitiesIn: ["text"],
    capabilities: { reasoning: false, toolCall: true, structuredOutput: false },
    hosts: [],
    aliases: [],
    ...over,
    price,
    blended: over.blended ?? blendedPrice(price.input, price.output),
  };
}
```

- [ ] **Step 12: Run the tests and verify they pass**

Run: `npm test`
Expected: all tests pass (`fail 0`).

- [ ] **Step 13: Commit**

```bash
git add src/lib/data
git commit -m "feat(data): models.dev normalization with lab/host allow-lists"
```

### Task 3: Guards, diff and genai-prices cross-check

**Files:**
- Create: `src/lib/data/validate.ts`, `src/lib/data/diff.ts`, `src/lib/data/crosscheck.ts`
- Test: `src/lib/data/validate.test.ts`, `src/lib/data/diff.test.ts`, `src/lib/data/crosscheck.test.ts`

**Interfaces:**
- Consumes: `Model`, `ModelEvent`, `PriceSnapshot` (Task 2), `GUARDS`, `LAB_PROVIDER`, `isLabId` (Task 2), `makeModel` (Task 2)
- Produces:
  - `validateSnapshot(prev: Model[] | null, next: Model[]): string[]` (empty means OK)
  - `pct(before: number, after: number): number` (1 decimal; `pct(0, x>0) = 100`, `pct(0, 0) = 0`)
  - `snapshotOf(m: Model): PriceSnapshot`
  - `diffSnapshots(prev: Model[], next: Model[], date: string): ModelEvent[]`
  - `type GenaiProvider = { id: string; models: { id: string; prices: unknown }[] }`
  - `crossCheck(models: Model[], genai: GenaiProvider[], tolerancePct?: number): string[]`

- [ ] **Step 1: Write the failing tests**

`src/lib/data/validate.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "./testing.ts";
import { validateSnapshot } from "./validate.ts";

const base = Array.from({ length: 10 }, (_, i) => makeModel({ id: `openai/m${i}` }));

test("accepts a sane snapshot", () => {
  assert.deepEqual(validateSnapshot(base, base), []);
  assert.deepEqual(validateSnapshot(null, base), []);
});

test("rejects an empty snapshot", () => {
  assert.deepEqual(validateSnapshot(base, []), ["snapshot is empty"]);
});

test("rejects invalid and absurd prices", () => {
  const errors = validateSnapshot(null, [
    makeModel({ id: "openai/neg", price: { input: -1, output: 2 } }),
    makeModel({ id: "openai/huge", price: { input: 1, output: 5000 } }),
    makeModel({ id: "openai/nan", price: { input: Number.NaN, output: 1 } }),
  ]);
  assert.equal(errors.length, 3);
  assert.match(errors[0], /openai\/neg: invalid input price -1/);
  assert.match(errors[1], /openai\/huge: output price 5000 exceeds 1000/);
  assert.match(errors[2], /openai\/nan: invalid input price NaN/);
});

test("rejects a large drop in model count", () => {
  assert.match(validateSnapshot(base, base.slice(0, 7)).join("\n"), /model count dropped 30\.0% \(10 -> 7\)/);
});

test("rejects mass price changes but allows a few", () => {
  const reprice = (n: number) => base.map((m, i) => (i < n ? makeModel({ id: m.id, price: { input: 9, output: 9 } }) : m));
  assert.match(validateSnapshot(base, reprice(4)).join("\n"), /40\.0% of models changed price/);
  assert.deepEqual(validateSnapshot(base, reprice(3)), []);
});
```

`src/lib/data/diff.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { diffSnapshots, pct } from "./diff.ts";
import { makeModel } from "./testing.ts";

const prev = [
  makeModel({ id: "openai/a", price: { input: 1, output: 2 } }),
  makeModel({ id: "openai/b", context: 128_000 }),
  makeModel({ id: "openai/c" }),
  makeModel({ id: "openai/gone" }),
];
const next = [
  makeModel({ id: "openai/a", price: { input: 0.5, output: 1 } }),
  makeModel({ id: "openai/b", context: 256_000 }),
  makeModel({ id: "openai/c", status: "deprecated" }),
  makeModel({ id: "openai/new" }),
];

test("emits one event per change, in catalog order then removals", () => {
  const events = diffSnapshots(prev, next, "2026-10-11");
  assert.deepEqual(
    events.map((e) => `${e.type}:${e.id}`),
    ["price_change:openai/a", "context_change:openai/b", "deprecated:openai/c", "new_model:openai/new", "removed:openai/gone"],
  );
  const price = events[0];
  assert.equal(price.date, "2026-10-11");
  assert.equal(price.pctChange, -50);
  assert.deepEqual(price.before, { input: 1, output: 2, blended: 1.25, context: 128_000 });
  assert.deepEqual(price.after, { input: 0.5, output: 1, blended: 0.625, context: 128_000 });
  assert.equal(events[3].after?.blended, 1.25);
  assert.equal(events[4].before?.blended, 1.25);
  assert.equal(events[4].after, undefined);
});

test("unchanged snapshots produce no events", () => {
  assert.deepEqual(diffSnapshots(prev, prev, "2026-10-11"), []);
});

test("pct from zero never returns Infinity", () => {
  assert.equal(pct(0, 0), 0);
  assert.equal(pct(0, 2), 100);
  assert.equal(pct(4, 5), 25);
  assert.equal(pct(3, 1), -66.7);
});
```

`src/lib/data/crosscheck.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { crossCheck, type GenaiProvider } from "./crosscheck.ts";
import { makeModel } from "./testing.ts";

const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", price: { input: 0.1, output: 0.5 } }),
  makeModel({ id: "openai/gpt-6.1-sol", price: { input: 2, output: 10 } }),
  makeModel({ id: "google/gemma-4-31b-it", priceSource: "deepinfra", price: { input: 0.12, output: 0.4 } }),
];

const genai: GenaiProvider[] = [
  { id: "anthropic", models: [{ id: "claude-haiku-5.5", prices: { input_mtok: 0.1, output_mtok: 0.55 } }] },
  {
    id: "openai",
    models: [{
      id: "gpt-6.1-sol",
      prices: [
        { constraint: { start_date: "2026-01-01" }, prices: { input_mtok: 1, output_mtok: 10 } },
        { prices: { input_mtok: 2.04, output_mtok: { base: 10 } } },
      ],
    }],
  },
  { id: "google", models: [{ id: "gemma-4-31b-it", prices: { input_mtok: 9, output_mtok: 9 } }] },
];

test("warns only on first-party prices that differ by more than 5%", () => {
  const warnings = crossCheck(models, genai);
  assert.deepEqual(warnings, [
    "anthropic/claude-haiku-5-5 output_mtok: models.dev=0.5 genai-prices=0.55 (10.0%)",
  ]);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../validate.ts'` (and for diff/crosscheck).

- [ ] **Step 3: Implement `src/lib/data/validate.ts`**

```ts
import { GUARDS } from "./config.ts";
import type { Model } from "./types.ts";

/** Returns a list of blocking problems; an empty list means the snapshot can be written. */
export function validateSnapshot(prev: Model[] | null, next: Model[]): string[] {
  if (next.length === 0) return ["snapshot is empty"];
  const errors: string[] = [];

  for (const m of next) {
    for (const [field, value] of [["input", m.price.input], ["output", m.price.output]] as const) {
      if (!Number.isFinite(value) || value < 0) errors.push(`${m.id}: invalid ${field} price ${value}`);
      else if (value > GUARDS.maxPricePerM) errors.push(`${m.id}: ${field} price ${value} exceeds ${GUARDS.maxPricePerM}`);
    }
  }

  if (prev && prev.length > 0) {
    const dropPct = ((prev.length - next.length) / prev.length) * 100;
    if (dropPct > GUARDS.maxCountDropPct) {
      errors.push(`model count dropped ${dropPct.toFixed(1)}% (${prev.length} -> ${next.length})`);
    }
    const prevById = new Map(prev.map((m) => [m.id, m]));
    const common = next.filter((m) => prevById.has(m.id));
    const changed = common.filter((m) => {
      const p = prevById.get(m.id);
      return p !== undefined && (p.price.input !== m.price.input || p.price.output !== m.price.output);
    });
    if (common.length >= GUARDS.minCommonForChangeCheck) {
      const changedPct = (changed.length / common.length) * 100;
      if (changedPct > GUARDS.maxChangedPct) errors.push(`${changedPct.toFixed(1)}% of models changed price in one run`);
    }
  }
  return errors;
}
```

- [ ] **Step 4: Implement `src/lib/data/diff.ts`**

```ts
import type { Model, ModelEvent, PriceSnapshot } from "./types.ts";

export function pct(before: number, after: number): number {
  if (before === 0) return after === 0 ? 0 : 100;
  return Math.round(((after - before) / before) * 1000) / 10;
}

export function snapshotOf(m: Model): PriceSnapshot {
  return { input: m.price.input, output: m.price.output, blended: m.blended, context: m.context };
}

export function diffSnapshots(prev: Model[], next: Model[], date: string): ModelEvent[] {
  const prevById = new Map(prev.map((m) => [m.id, m]));
  const nextIds = new Set(next.map((m) => m.id));
  const head = (m: Model) => ({ date, id: m.id, lab: m.lab, slug: m.slug, name: m.name });
  const events: ModelEvent[] = [];

  for (const m of next) {
    const p = prevById.get(m.id);
    if (!p) {
      events.push({ ...head(m), type: "new_model", after: snapshotOf(m) });
      continue;
    }
    if (p.price.input !== m.price.input || p.price.output !== m.price.output) {
      events.push({ ...head(m), type: "price_change", before: snapshotOf(p), after: snapshotOf(m), pctChange: pct(p.blended, m.blended) });
    }
    if (p.context !== m.context) {
      events.push({ ...head(m), type: "context_change", before: snapshotOf(p), after: snapshotOf(m) });
    }
    if (p.status !== "deprecated" && m.status === "deprecated") {
      events.push({ ...head(m), type: "deprecated", before: snapshotOf(p), after: snapshotOf(m) });
    }
  }
  for (const p of prev) {
    if (!nextIds.has(p.id)) events.push({ ...head(p), type: "removed", before: snapshotOf(p) });
  }
  return events;
}
```

- [ ] **Step 5: Implement `src/lib/data/crosscheck.ts`**

```ts
import { LAB_PROVIDER, isLabId } from "./config.ts";
import type { Model } from "./types.ts";

export type GenaiProvider = { id: string; models: { id: string; prices: unknown }[] };

const norm = (s: string) => s.toLowerCase().replace(/\./gu, "-");

function asNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof (v as { base?: unknown }).base === "number") return (v as { base: number }).base;
  return null;
}

/** genai-prices stores either one price object or a list of time-bounded ones (latest last). */
function latestPrices(prices: unknown): Record<string, unknown> | null {
  if (Array.isArray(prices)) {
    const last = prices[prices.length - 1] as { prices?: Record<string, unknown> } | undefined;
    return last?.prices ?? null;
  }
  return prices && typeof prices === "object" ? (prices as Record<string, unknown>) : null;
}

export function crossCheck(models: Model[], genai: GenaiProvider[], tolerancePct = 5): string[] {
  const byProvider = new Map(genai.map((p) => [p.id, new Map(p.models.map((m) => [norm(m.id), m]))]));
  const warnings: string[] = [];
  for (const m of models) {
    if (!isLabId(m.lab) || m.priceSource !== LAB_PROVIDER[m.lab]) continue;
    const match = byProvider.get(m.priceSource)?.get(norm(m.slug));
    const prices = match ? latestPrices(match.prices) : null;
    if (!prices) continue;
    for (const [key, ours] of [["input_mtok", m.price.input], ["output_mtok", m.price.output]] as const) {
      const theirs = asNumber(prices[key]);
      if (theirs === null || ours === 0) continue;
      const diff = (Math.abs(theirs - ours) / ours) * 100;
      if (diff > tolerancePct) warnings.push(`${m.id} ${key}: models.dev=${ours} genai-prices=${theirs} (${diff.toFixed(1)}%)`);
    }
  }
  return warnings;
}
```

- [ ] **Step 6: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/data
git commit -m "feat(data): snapshot guards, change detection and genai-prices cross-check"
```

---

### Task 4: Data store and the daily refresh script (first real snapshot)

**Files:**
- Create: `src/lib/data/store.ts`, `scripts/data/refresh.ts`
- Test: `src/lib/data/store.test.ts`
- Modify: `package.json` (script `refresh-data`)
- Create (generated): `data/models/latest.json`, `data/models/meta.json`

**Interfaces:**
- Consumes: `normalizeModelsDev`, `validateSnapshot`, `diffSnapshots`, `crossCheck`, `MODELS_DEV_URL`, `GENAI_PRICES_URL`
- Produces (all synchronous):
  - `DEFAULT_DATA_DIR: string` (`<cwd>/data/models`)
  - `readLatest(dir): Model[] | null`, `writeLatest(dir, models): void`
  - `readMeta(dir): Meta | null`, `writeMeta(dir, meta): void`
  - `readEvents(dir): ModelEvent[]` (skips invalid lines with a warning)
  - `appendEvents(dir, events): void` (grouped into `history/YYYY-MM.jsonl`)
  - `writeEvents(dir, events): void` (replaces all history files)

- [ ] **Step 1: Write the failing store test**

`src/lib/data/store.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { appendEvents, readEvents, readLatest, readMeta, writeEvents, writeLatest, writeMeta } from "./store.ts";
import { makeModel } from "./testing.ts";
import type { ModelEvent } from "./types.ts";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "ais-store-"));
const ev = (date: string, id: string): ModelEvent => ({ date, id, lab: "openai", slug: id, name: id, type: "new_model" });

test("latest and meta round-trip, missing files read as null", () => {
  const dir = tmp();
  assert.equal(readLatest(dir), null);
  assert.equal(readMeta(dir), null);
  const models = [makeModel({ id: "openai/a" })];
  writeLatest(dir, models);
  writeMeta(dir, { lastSuccessAt: "2026-10-11T06:00:00.000Z", source: "models.dev", modelCount: 1, lastChangeAt: null });
  assert.deepEqual(readLatest(dir), models);
  assert.equal(readMeta(dir)?.modelCount, 1);
});

test("events are grouped by month and read back in order", () => {
  const dir = tmp();
  appendEvents(dir, [ev("2026-09-30", "a"), ev("2026-10-01", "b")]);
  appendEvents(dir, [ev("2026-10-02", "c")]);
  assert.deepEqual(fs.readdirSync(path.join(dir, "history")).sort(), ["2026-09.jsonl", "2026-10.jsonl"]);
  assert.deepEqual(readEvents(dir).map((e) => e.id), ["a", "b", "c"]);
  assert.deepEqual(readEvents(tmp()), []);
});

test("readEvents skips invalid lines", () => {
  const dir = tmp();
  appendEvents(dir, [ev("2026-10-01", "a")]);
  fs.appendFileSync(path.join(dir, "history", "2026-10.jsonl"), "{not json\n\n");
  appendEvents(dir, [ev("2026-10-02", "b")]);
  assert.deepEqual(readEvents(dir).map((e) => e.id), ["a", "b"]);
});

test("writeEvents replaces the whole history", () => {
  const dir = tmp();
  appendEvents(dir, [ev("2025-01-01", "old")]);
  writeEvents(dir, [ev("2026-10-02", "y"), ev("2026-10-01", "x")]);
  assert.deepEqual(fs.readdirSync(path.join(dir, "history")), ["2026-10.jsonl"]);
  assert.deepEqual(readEvents(dir).map((e) => e.id), ["x", "y"]);
});
```

- [ ] **Step 2: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../store.ts'`.

- [ ] **Step 3: Implement `src/lib/data/store.ts`**

```ts
import fs from "node:fs";
import path from "node:path";

import type { Meta, Model, ModelEvent } from "./types.ts";

export const DEFAULT_DATA_DIR = path.join(process.cwd(), "data", "models");
const MONTH_FILE = /^\d{4}-\d{2}\.jsonl$/u;

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function writeJsonAtomic(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

export const readLatest = (dir: string) => readJson<Model[]>(path.join(dir, "latest.json"));
export const writeLatest = (dir: string, models: Model[]) => writeJsonAtomic(path.join(dir, "latest.json"), models);
export const readMeta = (dir: string) => readJson<Meta>(path.join(dir, "meta.json"));
export const writeMeta = (dir: string, meta: Meta) => writeJsonAtomic(path.join(dir, "meta.json"), meta);

export function readEvents(dir: string): ModelEvent[] {
  const historyDir = path.join(dir, "history");
  let files: string[];
  try {
    files = fs.readdirSync(historyDir).filter((f) => MONTH_FILE.test(f)).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const events: ModelEvent[] = [];
  for (const file of files) {
    for (const line of fs.readFileSync(path.join(historyDir, file), "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        events.push(JSON.parse(trimmed) as ModelEvent);
      } catch {
        console.warn(`[store] skipped invalid line in ${file}`);
      }
    }
  }
  return events;
}

export function appendEvents(dir: string, events: ModelEvent[]): void {
  const historyDir = path.join(dir, "history");
  const byMonth = new Map<string, ModelEvent[]>();
  for (const e of events) byMonth.set(e.date.slice(0, 7), [...(byMonth.get(e.date.slice(0, 7)) ?? []), e]);
  fs.mkdirSync(historyDir, { recursive: true });
  for (const [month, list] of byMonth) {
    fs.appendFileSync(path.join(historyDir, `${month}.jsonl`), `${list.map((e) => JSON.stringify(e)).join("\n")}\n`);
  }
}

export function writeEvents(dir: string, events: ModelEvent[]): void {
  const historyDir = path.join(dir, "history");
  if (fs.existsSync(historyDir)) {
    for (const f of fs.readdirSync(historyDir)) if (MONTH_FILE.test(f)) fs.rmSync(path.join(historyDir, f));
  }
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id) || a.type.localeCompare(b.type));
  appendEvents(dir, sorted);
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 5: Create `scripts/data/refresh.ts`**

```ts
import { GENAI_PRICES_URL, MODELS_DEV_URL } from "../../src/lib/data/config.ts";
import { crossCheck, type GenaiProvider } from "../../src/lib/data/crosscheck.ts";
import { diffSnapshots } from "../../src/lib/data/diff.ts";
import { normalizeModelsDev, type RawModelsDev } from "../../src/lib/data/normalize.ts";
import { DEFAULT_DATA_DIR, appendEvents, readLatest, readMeta, writeLatest, writeMeta } from "../../src/lib/data/store.ts";
import { validateSnapshot } from "../../src/lib/data/validate.ts";

const USER_AGENT = "aisignals-bot/2.0 (+https://aisignals.dev/about)";

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { "user-agent": USER_AGENT } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function main(): Promise<number> {
  const dir = process.env.DATA_DIR ?? DEFAULT_DATA_DIR;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const next = normalizeModelsDev((await fetchJson(MODELS_DEV_URL)) as RawModelsDev);
  const prev = readLatest(dir);
  const errors = validateSnapshot(prev, next);
  if (errors.length > 0) {
    console.error(`[refresh] guard failed, nothing written:\n${errors.slice(0, 20).join("\n")}`);
    return 1;
  }

  try {
    const genai = (await fetchJson(GENAI_PRICES_URL)) as GenaiProvider[];
    for (const warning of crossCheck(next, genai)) console.warn(`[refresh] crosscheck: ${warning}`);
  } catch (error) {
    console.warn(`[refresh] crosscheck skipped: ${(error as Error).message}`);
  }

  // First run only sets the baseline; history comes from the backfill.
  const events = prev ? diffSnapshots(prev, next, today) : [];
  writeLatest(dir, next);
  appendEvents(dir, events);
  writeMeta(dir, {
    lastSuccessAt: now,
    source: "models.dev",
    modelCount: next.length,
    lastChangeAt: events.length > 0 ? today : (readMeta(dir)?.lastChangeAt ?? null),
  });
  console.log(`[refresh] models=${next.length} events=${events.length}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[refresh] failed:", error);
    process.exit(1);
  },
);
```

- [ ] **Step 6: Register the script and run it against the live source**

```bash
npm pkg set scripts.refresh-data="node scripts/data/refresh.ts"
npm run refresh-data
```

Expected: `[refresh] models=N events=0` with N between 200 and 320 (296 identities measured on 2026-10-11, minus merged snapshots), possibly a few `crosscheck:` warnings, and exit code 0. Then:

```bash
node -e "const m=JSON.parse(require('fs').readFileSync('data/models/latest.json','utf8'));const h=m.find(x=>x.id==='anthropic/claude-haiku-5-5');console.log(m.length,h.blended,h.priceSource)"
```

Expected: `<N> 0.2 anthropic`.

- [ ] **Step 7: Run it a second time and verify it is idempotent**

Run: `npm run refresh-data && git status --short data/`
Expected: `events=0`; only `data/models/meta.json` changes between the two runs (new `lastSuccessAt`).

- [ ] **Step 8: Commit**

```bash
git add src/lib/data package.json data/models
git commit -m "feat(data): data store and daily refresh script with first snapshot"
```

---

### Task 5: Backfill price history from the models.dev git history

**Files:**
- Create: `src/lib/data/toml.ts`, `src/lib/data/backfill.ts`, `scripts/data/backfill-history.ts`
- Test: `src/lib/data/toml.test.ts`, `src/lib/data/backfill.test.ts`
- Modify: `package.json` (script `backfill-history`)
- Create (generated): `data/models/history/*.jsonl`

**Interfaces:**
- Consumes: `readLatest`, `readEvents`, `writeEvents`, `readMeta`, `writeMeta` (Task 4), `blendedPrice` (Task 2), `pct` (Task 3), `daysBetween` (Task 2), `LAB_PROVIDER`, `isLabId`
- Produces:
  - `parseCostFromToml(text: string): { input: number; output: number } | null`
  - `type CostPoint = { date: string; input: number; output: number }`
  - `timelineToEvents(model: Pick<Model, "id" | "lab" | "slug" | "name" | "context" | "releaseDate">, points: CostPoint[]): ModelEvent[]`

- [ ] **Step 1: Write the failing tests**

`src/lib/data/toml.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { parseCostFromToml } from "./toml.ts";

test("reads the [cost] table and ignores tiers and experimental modes", () => {
  const text = `
base_model = "openai/gpt-6.1-sol"

[cost]
input = 2.00
output = 10.00 # list price
cache_read = 0.10

[[cost.tiers]]
tier = { type = "context", size = 272_000 }
input = 4.00
output = 15.00

[experimental.modes.fast]
cost = { input = 4.00, output = 20.00 }
`;
  assert.deepEqual(parseCostFromToml(text), { input: 2, output: 10 });
});

test("reads the legacy inline top-level cost", () => {
  assert.deepEqual(parseCostFromToml(`name = "x"\ncost = { input = 1_000, output = 0.5 }\n[limit]\ncontext = 8\n`), { input: 1000, output: 0.5 });
});

test("returns null without both prices", () => {
  assert.equal(parseCostFromToml(`[cost]\ninput = 1\n`), null);
  assert.equal(parseCostFromToml(`name = "x"`), null);
});
```

`src/lib/data/backfill.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { timelineToEvents } from "./backfill.ts";

const model = { id: "anthropic/claude-x", lab: "anthropic", slug: "claude-x", name: "Claude X", context: 200_000, releaseDate: "2026-01-10" };

test("first point is a new_model near release, then real price changes only", () => {
  const events = timelineToEvents(model, [
    { date: "2026-01-12", input: 1, output: 5 },
    { date: "2026-01-12", input: 1, output: 4 },
    { date: "2026-02-01", input: 1, output: 4 },
    { date: "2026-03-01", input: 0.5, output: 2 },
  ]);
  assert.deepEqual(events.map((e) => `${e.date}:${e.type}`), ["2026-01-12:new_model", "2026-03-01:price_change"]);
  assert.deepEqual(events[0].after, { input: 1, output: 4, blended: 1.75, context: 200_000 });
  assert.equal(events[1].pctChange, -50);
});

test("no new_model when the model was added to models.dev long after release", () => {
  const events = timelineToEvents({ ...model, releaseDate: "2024-03-01" }, [
    { date: "2025-06-04", input: 3, output: 15 },
    { date: "2025-09-01", input: 1, output: 5 },
  ]);
  assert.deepEqual(events.map((e) => e.type), ["price_change"]);
  assert.deepEqual(events[0].before, { input: 3, output: 15, blended: 6, context: 200_000 });
});

test("empty timeline gives no events", () => {
  assert.deepEqual(timelineToEvents(model, []), []);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../toml.ts'` and `'.../backfill.ts'`.

- [ ] **Step 3: Implement `src/lib/data/toml.ts`**

```ts
const PRICE_LINE = /^(input|output)\s*=\s*([0-9][0-9_]*(?:\.[0-9_]+)?)\s*(?:#.*)?$/u;

const toNumber = (s: string) => Number(s.replace(/_/gu, ""));

/** Minimal reader for the base input/output price of a models.dev TOML file. */
export function parseCostFromToml(text: string): { input: number; output: number } | null {
  const found: Partial<Record<"input" | "output", number>> = {};
  let section = "";
  for (const raw of text.split(/\r?\n/u)) {
    const line = raw.trim();
    if (line.startsWith("[")) {
      section = line.replace(/^\[+|\]+$/gu, "").trim();
      continue;
    }
    if (section === "cost") {
      const m = line.match(PRICE_LINE);
      if (m) found[m[1] as "input" | "output"] = toNumber(m[2]);
    } else if (section === "") {
      const inline = line.match(/^cost\s*=\s*\{(.*)\}\s*$/u);
      if (!inline) continue;
      for (const part of inline[1].split(",")) {
        const m = part.trim().match(PRICE_LINE);
        if (m) found[m[1] as "input" | "output"] = toNumber(m[2]);
      }
    }
  }
  return typeof found.input === "number" && typeof found.output === "number" ? { input: found.input, output: found.output } : null;
}
```

- [ ] **Step 4: Implement `src/lib/data/backfill.ts`**

```ts
import { daysBetween } from "./dates.ts";
import { pct } from "./diff.ts";
import { blendedPrice } from "./normalize.ts";
import type { Model, ModelEvent, PriceSnapshot } from "./types.ts";

export type CostPoint = { date: string; input: number; output: number };

/** A model added to models.dev more than this many days after release has no trustworthy launch price. */
const LAUNCH_WINDOW_DAYS = 14;

export function timelineToEvents(
  model: Pick<Model, "id" | "lab" | "slug" | "name" | "context" | "releaseDate">,
  points: CostPoint[],
): ModelEvent[] {
  const byDate: CostPoint[] = [];
  for (const p of [...points].sort((a, b) => a.date.localeCompare(b.date))) {
    if (byDate.length > 0 && byDate[byDate.length - 1].date === p.date) byDate[byDate.length - 1] = p;
    else byDate.push(p);
  }
  const clean = byDate.filter((p, i) => i === 0 || p.input !== byDate[i - 1].input || p.output !== byDate[i - 1].output);

  const snap = (p: CostPoint): PriceSnapshot => ({ input: p.input, output: p.output, blended: blendedPrice(p.input, p.output), context: model.context });
  const head = { id: model.id, lab: model.lab, slug: model.slug, name: model.name };
  const events: ModelEvent[] = [];

  clean.forEach((p, i) => {
    if (i === 0) {
      const nearLaunch = !model.releaseDate || daysBetween(model.releaseDate, p.date) <= LAUNCH_WINDOW_DAYS;
      if (nearLaunch) events.push({ ...head, date: p.date, type: "new_model", after: snap(p) });
      return;
    }
    const before = snap(clean[i - 1]);
    const after = snap(p);
    events.push({ ...head, date: p.date, type: "price_change", before, after, pctChange: pct(before.blended, after.blended) });
  });
  return events;
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 6: Create `scripts/data/backfill-history.ts`**

```ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { timelineToEvents, type CostPoint } from "../../src/lib/data/backfill.ts";
import { LAB_PROVIDER, isLabId } from "../../src/lib/data/config.ts";
import { DEFAULT_DATA_DIR, readEvents, readLatest, readMeta, writeEvents, writeMeta } from "../../src/lib/data/store.ts";
import { parseCostFromToml } from "../../src/lib/data/toml.ts";
import type { ModelEvent } from "../../src/lib/data/types.ts";

const REPO_URL = "https://github.com/sst/models.dev.git";

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
}

function ensureRepo(): string {
  if (process.env.MODELS_DEV_REPO) return process.env.MODELS_DEV_REPO;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "modelsdev-"));
  console.log(`[backfill] cloning ${REPO_URL} into ${tmp}`);
  git(tmp, ["clone", "--quiet", REPO_URL, "repo"]);
  return path.join(tmp, "repo");
}

function main(): number {
  const dir = process.env.DATA_DIR ?? DEFAULT_DATA_DIR;
  const models = readLatest(dir);
  if (!models) {
    console.error("[backfill] data/models/latest.json missing: run `npm run refresh-data` first");
    return 1;
  }
  const repo = ensureRepo();
  const backfilled: ModelEvent[] = [];
  let withHistory = 0;

  for (const m of models) {
    if (!isLabId(m.lab) || m.priceSource !== LAB_PROVIDER[m.lab]) continue;
    const rel = `providers/${LAB_PROVIDER[m.lab]}/models/${m.id.slice(m.lab.length + 1)}.toml`;
    const log = git(repo, ["log", "--format=%H %cs", "--", rel]).trim();
    if (!log) continue;
    const points: CostPoint[] = [];
    for (const line of log.split("\n").reverse()) {
      const [sha, date] = line.split(" ");
      let text: string;
      try {
        text = git(repo, ["show", `${sha}:${rel}`]);
      } catch {
        continue; // file deleted in this commit
      }
      const cost = parseCostFromToml(text);
      if (cost) points.push({ date, ...cost });
    }
    const events = timelineToEvents(m, points);
    if (events.length > 0) withHistory += 1;
    backfilled.push(...events);
  }

  const live = readEvents(dir);
  const cutoff = live.length > 0 ? live.map((e) => e.date).sort()[0] : "9999-12-31";
  const merged = [...backfilled.filter((e) => e.date < cutoff), ...live];
  writeEvents(dir, merged);

  const meta = readMeta(dir);
  const lastChangeAt = merged.map((e) => e.date).sort().at(-1) ?? null;
  if (meta) writeMeta(dir, { ...meta, lastChangeAt });

  console.log(`[backfill] models with history=${withHistory} events=${backfilled.length} total=${merged.length}`);
  return 0;
}

try {
  process.exit(main());
} catch (error) {
  console.error("[backfill] failed:", error);
  process.exit(1);
}
```

- [ ] **Step 7: Run the backfill**

```bash
npm pkg set scripts.backfill-history="node scripts/data/backfill-history.ts"
npm run backfill-history
ls data/models/history | head -3 && ls data/models/history | wc -l
```

Expected: `[backfill] models with history=<M> events=<E> total=<E>` with M > 100 and E > M, and several monthly files starting around `2025-06.jsonl`. If M is below 50, the TOML layout changed: run `git -C <clone> log --stat -3 -- providers/anthropic/models` to inspect it, adapt `parseCostFromToml` with a new test, and rerun. This step is time-boxed to 30 minutes; after that, continue with a partial history (spec §5.5).

- [ ] **Step 8: Spot-check one model and confirm refresh still works**

```bash
grep -h '"anthropic/claude-haiku-4-5"' data/models/history/*.jsonl | head -5
npm run refresh-data
```

Expected: one `new_model` line (and price changes if any), then `[refresh] ... events=0`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/data scripts/data package.json data/models
git commit -m "feat(data): backfill price history from models.dev git history"
```

### Task 6: Terminal design system, site shell and shared components

**Files:**
- Create: `src/lib/site/format.ts`, `src/lib/site/urls.ts`, `src/lib/site/chart.ts`
- Test: `src/lib/site/format.test.ts`, `src/lib/site/chart.test.ts`
- Create: `src/components/{terminal-nav,site-footer,newsletter-form,box,stat-grid,faq-list,breadcrumbs,json-ld,ad-slot,price-chart,event-feed}.tsx`
- Modify: `src/app/globals.css` (full design system), `src/app/layout.tsx` (nav + main + footer), `src/app/page.tsx`, `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `ModelEvent` (Task 2)
- Produces:
  - `format.ts`: `fmtUsd(n)`, `fmtUsdCost(n)`, `fmtTokens(n | null)`, `fmtPct(p)`, `monthYear(isoDay)`, `yesNo(b)`
  - `urls.ts`: `modelUrl({lab, slug})`, `providerUrl(lab)`, `compareUrl(key)`, `bestUrl(slug)`, `newsUrl(slug)`, `ogImageUrl(title, subtitle)`
  - `chart.ts`: `type ChartSeries = { id: string; points: { date: string; value: number }[] }`, `buildStepChart(series, width, height, pad?) → { paths: { id; d }[]; yMax; startDate; endDate }`
  - Components: `<TerminalNav/>`, `<SiteFooter/>`, `<NewsletterForm/>`, `<Box title className? id?>`, `<StatGrid stats={{label, value, note?}[]}/>`, `<FaqList items={{q, a}[]}/>`, `<Breadcrumbs items={{href, label}[]}/>`, `<JsonLd data/>`, `<AdSlot minHeight?/>`, `<PriceChart points={{date, input, output}[]}/>`, `<EventFeed events showDate?/>`

- [ ] **Step 1: Write the failing tests**

`src/lib/site/format.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost, monthYear } from "./format.ts";
import { modelUrl, ogImageUrl } from "./urls.ts";

test("fmtUsd keeps small values precise", () => {
  assert.equal(fmtUsd(0.1), "$0.10");
  assert.equal(fmtUsd(2), "$2.00");
  assert.equal(fmtUsd(0.0375), "$0.0375");
  assert.equal(fmtUsd(0.01), "$0.01");
  assert.equal(fmtUsd(0.012345), "$0.0123");
  assert.equal(fmtUsd(0), "$0");
  assert.equal(fmtUsd(Number.NaN), "—");
});

test("fmtUsdCost rounds large monthly costs", () => {
  assert.equal(fmtUsdCost(10), "$10.00");
  assert.equal(fmtUsdCost(0.5), "$0.50");
  assert.equal(fmtUsdCost(1234.56), "$1,235");
});

test("fmtTokens uses K and M", () => {
  assert.equal(fmtTokens(1_000_000), "1M");
  assert.equal(fmtTokens(1_048_576), "1.05M");
  assert.equal(fmtTokens(128_000), "128K");
  assert.equal(fmtTokens(65_536), "65.5K");
  assert.equal(fmtTokens(512), "512");
  assert.equal(fmtTokens(null), "—");
  assert.equal(fmtTokens(0), "—");
});

test("fmtPct and monthYear", () => {
  assert.equal(fmtPct(-20), "−20%");
  assert.equal(fmtPct(5), "+5%");
  assert.equal(fmtPct(0), "0%");
  assert.equal(monthYear("2026-10-11"), "Oct 2026");
});

test("urls", () => {
  assert.equal(modelUrl({ lab: "openai", slug: "gpt-6.1-sol" }), "/models/openai/gpt-6.1-sol");
  assert.equal(ogImageUrl("A & B", "x"), "/api/og?title=A+%26+B&subtitle=x");
});
```

`src/lib/site/chart.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildStepChart } from "./chart.ts";

test("builds a step path scaled to the box", () => {
  const g = buildStepChart([{ id: "input", points: [{ date: "2026-01-11", value: 2 }, { date: "2026-01-01", value: 1 }] }], 100, 50, 0);
  assert.deepEqual(g.paths, [{ id: "input", d: "M0 28.3H100V6.5" }]);
  assert.equal(g.yMax, 2.3);
  assert.equal(g.startDate, "2026-01-01");
  assert.equal(g.endDate, "2026-01-11");
});

test("a single point or empty input never yields NaN", () => {
  const one = buildStepChart([{ id: "x", points: [{ date: "2026-01-01", value: 0 }] }], 100, 50, 0);
  assert.doesNotMatch(one.paths[0].d, /NaN|Infinity/u);
  assert.deepEqual(buildStepChart([], 100, 50).paths, []);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../format.ts'` and `'.../chart.ts'`.

- [ ] **Step 3: Implement `src/lib/site/format.ts`, `src/lib/site/urls.ts`, `src/lib/site/chart.ts`**

`src/lib/site/format.ts`:

```ts
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** USD per 1M tokens: 2 decimals from $0.10, otherwise 3 significant digits. */
export function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "$0";
  if (Math.abs(n) >= 0.1) return `$${n.toFixed(2)}`;
  return `$${Number(n.toPrecision(3))}`;
}

export function fmtUsdCost(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 100) return `$${Math.round(n).toLocaleString("en-US")}`;
  return `$${n.toFixed(2)}`;
}

export function fmtTokens(n: number | null): string {
  if (n === null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${Number((n / 1_000_000).toFixed(2))}M`;
  if (n >= 1_000) return `${Number((n / 1_000).toFixed(1))}K`;
  return String(n);
}

export function fmtPct(p: number): string {
  if (!Number.isFinite(p) || p === 0) return "0%";
  return p > 0 ? `+${p}%` : `−${Math.abs(p)}%`;
}

export function monthYear(isoDay: string): string {
  const [year, month] = isoDay.split("-");
  return `${MONTHS[Number(month) - 1] ?? ""} ${year}`.trim();
}

export const yesNo = (v: boolean) => (v ? "yes" : "no");
```

`src/lib/site/urls.ts`:

```ts
export const modelUrl = (m: { lab: string; slug: string }) => `/models/${m.lab}/${m.slug}`;
export const providerUrl = (lab: string) => `/providers/${lab}`;
export const compareUrl = (key: string) => `/compare/${key}`;
export const bestUrl = (slug: string) => `/best/${slug}`;
export const newsUrl = (slug: string) => `/news/${slug}`;

export function ogImageUrl(title: string, subtitle: string): string {
  return `/api/og?${new URLSearchParams({ title, subtitle }).toString()}`;
}
```

`src/lib/site/chart.ts`:

```ts
export type ChartPoint = { date: string; value: number };
export type ChartSeries = { id: string; points: ChartPoint[] };
export type ChartGeometry = { paths: { id: string; d: string }[]; yMax: number; startDate: string; endDate: string };

const DAY_MS = 86_400_000;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Step-line geometry (prices change in steps) on a shared time/price scale. */
export function buildStepChart(series: ChartSeries[], width: number, height: number, pad = 8): ChartGeometry {
  const all = series.flatMap((s) => s.points);
  if (all.length === 0) return { paths: [], yMax: 0, startDate: "", endDate: "" };
  const times = all.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const span = Math.max(t1 - t0, DAY_MS);
  const yMax = Math.round(Math.max(...all.map((p) => p.value), 0.0001) * 1.15 * 10_000) / 10_000;
  const x = (date: string) => r1(pad + ((Date.parse(`${date}T00:00:00Z`) - t0) / span) * (width - 2 * pad));
  const y = (v: number) => r1(height - pad - (v / yMax) * (height - 2 * pad));

  const paths = series.map((s) => {
    const pts = [...s.points].sort((a, b) => a.date.localeCompare(b.date));
    const d = pts.map((p, i) => (i === 0 ? `M${x(p.date)} ${y(p.value)}` : `H${x(p.date)}V${y(p.value)}`)).join("");
    return { id: s.id, d };
  });
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  return { paths, yMax, startDate: iso(t0), endDate: iso(t1) };
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 5: Replace `src/app/globals.css` with the full design system**

```css
:root {
  --bg: #0a0e0b;
  --fg: #c8f5d8;
  --fg-strong: #e9fff1;
  --muted: #7ea58c;
  --dim: #4f6e5a;
  --line: #1d2a21;
  --line-soft: #121a15;
  --accent: #22c55e;
  --up: #f97316;
  --amber: #f59e0b;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-mono), ui-monospace, Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--fg-strong); text-decoration: underline; text-decoration-color: var(--dim); text-underline-offset: 3px; }
a:hover { color: var(--accent); text-decoration-color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
h1 { font-size: 26px; line-height: 1.25; color: var(--fg-strong); font-weight: 600; margin: 0 0 6px; }
h2 { font-size: 18px; line-height: 1.3; color: var(--fg-strong); font-weight: 600; margin: 28px 0 10px; }
.shell { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.sub { color: var(--muted); font-size: 12px; margin: 0 0 18px; }
.ok, .dn { color: var(--accent); }
.up { color: var(--up); }
.muted { color: var(--muted); }
.dim { color: var(--dim); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }

/* nav + footer */
.nav { display: flex; flex-wrap: wrap; gap: 8px 20px; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
.nav-logo { color: var(--accent); font-weight: 700; text-decoration: none; }
.nav-logo .cursor { animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .nav-logo .cursor { animation: none; } }
.nav-links { display: flex; flex-wrap: wrap; gap: 4px 18px; }
.nav-links a { color: var(--muted); text-decoration: none; }
.nav-links a:hover { color: var(--accent); }
.footer { border-top: 1px solid var(--line); margin-top: 40px; padding: 20px 16px 32px; color: var(--muted); font-size: 12px; }
.footer a { color: var(--muted); }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }

/* blocks */
.hero { margin: 8px 0 22px; }
.hero h1 { font-size: 30px; }
.crumbs { color: var(--dim); font-size: 12px; margin-bottom: 8px; }
.crumbs a { color: var(--dim); text-decoration: none; }
.crumbs a:hover { color: var(--accent); }
.box { border: 1px solid var(--line); padding: 12px 14px; margin: 0 0 14px; min-width: 0; }
.box-title { margin: 0 0 10px; font-size: 11px; font-weight: 400; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border: 1px solid var(--line); margin: 0 0 14px; }
.stats > div { padding: 12px 14px; border-right: 1px solid var(--line); min-width: 0; }
.stats > div:last-child { border-right: none; }
.stats small { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; }
.stats b { display: block; font-size: 22px; color: var(--fg-strong); font-weight: 600; }
.stats em { font-style: normal; color: var(--dim); font-size: 11px; }
@media (max-width: 640px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats > div:nth-child(2) { border-right: none; }
  .stats > div:nth-child(-n + 2) { border-bottom: 1px solid var(--line); }
}
.grid-2 { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; }
@media (max-width: 900px) { .grid-2 { grid-template-columns: minmax(0, 1fr); } }

/* tables */
.table-wrap { overflow-x: auto; }
table.data { width: 100%; border-collapse: collapse; }
table.data th, table.data td { padding: 6px 8px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line-soft); }
table.data th:first-child, table.data td:first-child { text-align: left; }
table.data th { color: var(--muted); font-weight: 400; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid var(--line); }
table.data th button { all: unset; cursor: pointer; }
table.data th button:focus-visible { outline: 2px solid var(--accent); }
.kv { margin: 0; }
.kv > div { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid var(--line-soft); }
.kv dt { color: var(--muted); }
.kv dd { margin: 0; text-align: right; }

/* tags, buttons, inputs */
.tag { display: inline-block; font-size: 11px; padding: 0 6px; margin-right: 6px; color: var(--bg); background: var(--accent); }
.tag.price { background: var(--amber); }
.tag.warn { background: var(--up); }
.tag.dim { background: var(--line); color: var(--muted); }
.btn { display: inline-block; border: 1px solid var(--accent); color: var(--accent); background: transparent; font: inherit; font-size: 12px; padding: 4px 10px; margin: 8px 6px 0 0; text-decoration: none; cursor: pointer; }
.btn:hover { background: var(--accent); color: var(--bg); }
.search { width: 100%; background: transparent; border: 1px solid var(--line); color: var(--fg-strong); font: inherit; padding: 9px 12px; margin: 0 0 12px; }
.search::placeholder { color: var(--dim); }
.input { background: transparent; border: 1px solid var(--line); color: var(--fg-strong); font: inherit; padding: 2px 8px; width: 8em; text-align: right; }
.calc-inputs > div { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 4px 0; }
.newsletter-form { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.newsletter-form .search { margin: 0; flex: 1 1 200px; }

/* feed, faq, prose */
.feed { list-style: none; margin: 0; padding: 0; }
.feed li { padding: 6px 0; border-bottom: 1px solid var(--line-soft); }
.faq details { border-bottom: 1px solid var(--line-soft); padding: 6px 0; }
.faq summary { cursor: pointer; color: var(--fg-strong); }
.faq summary::marker { color: var(--accent); }
.faq p { margin: 6px 0 4px; }
.prose { max-width: 72ch; line-height: 1.7; }
.prose table { border-collapse: collapse; margin: 12px 0; display: block; overflow-x: auto; }
.prose th, .prose td { border-bottom: 1px solid var(--line-soft); padding: 6px 10px; text-align: left; white-space: nowrap; }
.prose th { color: var(--muted); font-weight: 400; }

/* chart, ads */
.chart { width: 100%; height: auto; display: block; }
.chart .grid { stroke: var(--line-soft); }
.chart .s-input { stroke: var(--accent); }
.chart .s-output { stroke: var(--amber); }
.chart text { fill: var(--muted); font-size: 10px; font-family: inherit; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 11px; color: var(--muted); }
.legend .k-in::before, .legend .k-out::before { content: ""; display: inline-block; width: 10px; height: 2px; margin-right: 6px; vertical-align: middle; }
.legend .k-in::before { background: var(--accent); }
.legend .k-out::before { background: var(--amber); }
.ad-slot { border: 1px dashed var(--line); margin: 0 0 14px; overflow: hidden; }

/* model page: dashboard (desktop) or report layout */
.model-layout { display: flex; flex-direction: column; }
.model-main, .model-side { display: contents; }
.layout-toggle { display: none; gap: 6px; justify-content: flex-end; margin-bottom: 10px; order: 0; }
.layout-toggle button { font: inherit; font-size: 12px; background: transparent; color: var(--muted); border: 1px solid var(--line); padding: 2px 10px; cursor: pointer; }
.layout-toggle button[aria-pressed="true"] { color: var(--accent); border-color: var(--accent); }
.o-chart { order: 1; }
.o-calc { order: 2; }
.o-ad { order: 3; }
.o-alt { order: 4; }
.o-hosts { order: 5; }
.o-spec { order: 6; }
.o-faq { order: 7; }
@media (min-width: 1024px) {
  .layout-toggle { display: flex; }
  .model-layout[data-layout="dashboard"] { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); column-gap: 16px; align-items: start; }
  .model-layout[data-layout="dashboard"] .layout-toggle { grid-column: 1 / -1; }
  .model-layout[data-layout="dashboard"] .model-main,
  .model-layout[data-layout="dashboard"] .model-side { display: flex; flex-direction: column; min-width: 0; }
  .model-layout[data-layout="dashboard"] .o-spec { order: 0; }
}
```

- [ ] **Step 6: Create the shell components**

`src/components/terminal-nav.tsx`:

```tsx
import Link from "next/link";

const LINKS = [
  ["/models", "models"], ["/compare", "compare"], ["/best", "best"],
  ["/calculator", "calculator"], ["/changes", "changes"], ["/news", "news"],
] as const;

export function TerminalNav() {
  return (
    <header className="shell">
      <nav className="nav" aria-label="Main">
        <Link href="/" className="nav-logo">&gt; ai_signals<span className="cursor">_</span></Link>
        <div className="nav-links">
          {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </div>
      </nav>
    </header>
  );
}
```

`src/components/newsletter-form.tsx`:

```tsx
"use client";

import { useId, useState } from "react";

type State = "idle" | "sending" | "done" | "error";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<State>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale: "en", hp, utm_source: "site", utm_medium: source }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") return <p className="ok">✓ subscribed. Check your inbox.</p>;
  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
      <input id={`${id}-email`} className="search" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" value={hp} onChange={(e) => setHp(e.target.value)} />
      <button type="submit" className="btn" disabled={state === "sending"}>{state === "sending" ? "..." : "subscribe"}</button>
      {state === "error" ? <p className="up">Something went wrong. Please try again.</p> : null}
    </form>
  );
}
```

`src/components/site-footer.tsx`:

```tsx
import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="shell footer">
      <div className="footer-grid">
        <div>
          <p className="box-title">// weekly digest</p>
          <p>Price cuts, new models and deprecations, every Monday.</p>
          <NewsletterForm />
        </div>
        <div>
          <p className="box-title">// explore</p>
          <p>
            <Link href="/models">all models</Link><br />
            <Link href="/providers">providers</Link><br />
            <Link href="/compare">comparisons</Link><br />
            <Link href="/best">rankings</Link><br />
            <Link href="/calculator">cost calculator</Link>
          </p>
        </div>
        <div>
          <p className="box-title">// about</p>
          <p>
            <Link href="/about">methodology &amp; sources</Link><br />
            <a href="/rss.xml">rss</a><br />
            Data: <a href="https://models.dev" rel="noopener">models.dev</a> (MIT)
          </p>
        </div>
      </div>
      <p className="dim">AI Signals. List prices in USD per 1M tokens. Always confirm with the provider before you commit.</p>
    </footer>
  );
}
```

`src/components/box.tsx`:

```tsx
export function Box({ title, className, id, children }: { title: string; className?: string; id?: string; children: React.ReactNode }) {
  return (
    <section className={className ? `box ${className}` : "box"} id={id} aria-label={title}>
      <h2 className="box-title">// {title}</h2>
      {children}
    </section>
  );
}
```

`src/components/stat-grid.tsx`:

```tsx
export type Stat = { label: string; value: string; note?: string };

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stats">
      {stats.map((s) => (
        <div key={s.label}>
          <small>{s.label}</small>
          <b>{s.value}</b>
          {s.note ? <em>{s.note}</em> : null}
        </div>
      ))}
    </div>
  );
}
```

`src/components/faq-list.tsx`:

```tsx
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((it) => (
        <details key={it.q}>
          <summary>{it.q}</summary>
          <p>{it.a}</p>
        </details>
      ))}
    </div>
  );
}
```

`src/components/json-ld.tsx`:

```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</gu, "\\u003c") }} />;
}
```

`src/components/breadcrumbs.tsx`:

```tsx
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  const base = getSiteUrl();
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {items.map((it, i) => (
          <span key={it.href}>
            {i > 0 ? " / " : null}
            {i === items.length - 1 ? <span aria-current="page">{it.label}</span> : <Link href={it.href}>{it.label}</Link>}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${base}${it.href}` })),
        }}
      />
    </>
  );
}
```

`src/components/ad-slot.tsx`:

```tsx
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "";

/** Renders nothing until AdSense is configured. Never place it above the key stats. */
export function AdSlot({ minHeight = 250 }: { minHeight?: number }) {
  useEffect(() => {
    if (!CLIENT || !SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked by the browser */
    }
  }, []);

  if (!CLIENT || !SLOT) return null;
  return (
    <div className="ad-slot" style={{ minHeight }}>
      <ins className="adsbygoogle" style={{ display: "block", minHeight }} data-ad-client={CLIENT} data-ad-slot={SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
```

`src/components/price-chart.tsx`:

```tsx
import { buildStepChart } from "@/lib/site/chart";
import { fmtUsd } from "@/lib/site/format";

const W = 600;
const H = 140;

export function PriceChart({ points }: { points: { date: string; input: number; output: number }[] }) {
  const g = buildStepChart(
    [
      { id: "input", points: points.map((p) => ({ date: p.date, value: p.input })) },
      { id: "output", points: points.map((p) => ({ date: p.date, value: p.output })) },
    ],
    W,
    H,
    10,
  );
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Price history from ${g.startDate} to ${g.endDate}`}>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} className="grid" x1="0" x2={W} y1={H * f} y2={H * f} />)}
        {g.paths.map((p) => <path key={p.id} d={p.d} className={`s-${p.id}`} fill="none" strokeWidth="2" />)}
        <text x="4" y="12">{fmtUsd(g.yMax)}</text>
      </svg>
      <figcaption className="legend">
        <span className="k-in">input $/1M</span>
        <span className="k-out">output $/1M</span>
        <span className="dim">{g.startDate} → {g.endDate}</span>
      </figcaption>
    </figure>
  );
}
```

`src/components/event-feed.tsx`:

```tsx
import Link from "next/link";

import type { ModelEvent } from "@/lib/data/types";
import { fmtPct, fmtTokens, fmtUsd } from "@/lib/site/format";
import { modelUrl } from "@/lib/site/urls";

const LABEL: Record<ModelEvent["type"], { text: string; cls: string }> = {
  new_model: { text: "NEW", cls: "tag" },
  price_change: { text: "PRICE", cls: "tag price" },
  context_change: { text: "CTX", cls: "tag" },
  deprecated: { text: "DEPR", cls: "tag warn" },
  removed: { text: "GONE", cls: "tag dim" },
};

function detail(e: ModelEvent): string {
  if (e.type === "price_change" && e.before && e.after) return `${fmtUsd(e.before.input)} → ${fmtUsd(e.after.input)} in · ${fmtPct(e.pctChange ?? 0)}`;
  if (e.type === "new_model" && e.after) return `${fmtUsd(e.after.input)} in / ${fmtUsd(e.after.output)} out`;
  if (e.type === "context_change" && e.before && e.after) return `${fmtTokens(e.before.context)} → ${fmtTokens(e.after.context)}`;
  return "";
}

export function EventFeed({ events, showDate = true }: { events: ModelEvent[]; showDate?: boolean }) {
  if (events.length === 0) return <p className="dim">No changes recorded yet.</p>;
  return (
    <ul className="feed">
      {events.map((e) => (
        <li key={`${e.date}-${e.id}-${e.type}`}>
          {showDate ? <span className="dim">{e.date} </span> : null}
          <span className={LABEL[e.type].cls}>{LABEL[e.type].text}</span>
          {e.type === "removed" ? <span>{e.name}</span> : <Link href={modelUrl(e)}>{e.name}</Link>}{" "}
          <span className={e.type === "price_change" ? ((e.pctChange ?? 0) < 0 ? "dn" : "up") : "muted"}>{detail(e)}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 7: Wire the shell into the layout**

In `src/app/layout.tsx`, add the imports and replace the `<body>` content:

```tsx
import { SiteFooter } from "@/components/site-footer";
import { TerminalNav } from "@/components/terminal-nav";
```

```tsx
      <body className={mono.variable}>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID || undefined} />
        <TerminalNav />
        <main className="shell">{children}</main>
        <SiteFooter />
      </body>
```

In `src/app/not-found.tsx`, replace `<main className="shell" style={{ padding: "40px 16px" }}>` / `</main>` with `<div style={{ padding: "24px 0" }}>` / `</div>`. In `src/app/page.tsx`, replace the `<main ...>` wrapper with `<div>` / `</div>`.

- [ ] **Step 8: Verify lint, tests, build and the look**

```bash
npm run lint && npm test && npm run build
```

Expected: everything passes. Then start `npm run dev`, open `http://localhost:3000/` in the browser pane and take a screenshot: dark background `#0a0e0b`, green `> ai_signals_` logo with a blinking cursor, nav links, footer with three columns and the subscribe form. Resize to the mobile preset: no horizontal scroll.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat(ui): terminal design system, site shell and shared components"
```

---

### Task 7: Site data access: catalog, price history, selection rules, cost

**Files:**
- Create: `src/lib/site/catalog.ts`, `src/lib/site/history.ts`, `src/lib/site/selection.ts`, `src/lib/site/cost.ts`, `src/lib/site/rows.ts`
- Test: `src/lib/site/history.test.ts`, `src/lib/site/selection.test.ts`, `src/lib/site/cost.test.ts`

**Interfaces:**
- Consumes: store readers (Task 4), `pct` (Task 3), `blendedPrice`, `makeModel`, date helpers, config (Task 2), urls (Task 6)
- Produces:
  - `catalog.ts`: `type Catalog = { models; events; meta; today }`, `getCatalog()`, `findModel(lab, slug)`, `labName(lab)`, `hostName(provider)`, `isFirstPartyPrice(m)`, `recentEvents(events, n)`, `type LabSummary = { lab; name; models: Model[]; minBlended; maxBlended }`, `labSummaries(models)`
  - `history.ts`: `type PricePoint = { date; input; output }`, `priceHistory(model, events, today): PricePoint[]`, `change30d(model, events, today): number | null`
  - `selection.ts`: `isActive`, `isIndexable`, `priceBand`, `versionOf`, `alternatives(model, models, n=5)`, `nearestCompetitors(model, models, n=3)`, `predecessor(model, models)`, `notablePool(models, today, perFamily=2)`, `type Pair = { key; a; b }`, `makePair(x, y)`, `comparisonPairs(models, today, cap=300)`, `type BestList`, `BEST_LISTS`, `MIN_LIST_SIZE = 5`, `findBestList(slug)`
  - `cost.ts`: `type Scenario`, `SCENARIOS`, `monthlyCost(price, inputTokens, outputTokens)`, `parseTokenInput(raw): number` (millions, clamped 0..1,000,000)
  - `rows.ts`: `type ModelRow = { id; href; name; labName; input; output; context; change30d; status }`, `modelRows(models): ModelRow[]`

- [ ] **Step 1: Write the failing tests**

`src/lib/site/cost.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { SCENARIOS, monthlyCost, parseTokenInput } from "./cost.ts";

test("monthlyCost uses USD per 1M tokens", () => {
  assert.equal(monthlyCost({ input: 0.1, output: 0.5 }, 50_000_000, 10_000_000), 10);
  assert.equal(monthlyCost({ input: 2, output: 10 }, 0, 0), 0);
  assert.equal(SCENARIOS.length, 3);
});

test("parseTokenInput clamps garbage", () => {
  assert.equal(parseTokenInput("50"), 50);
  assert.equal(parseTokenInput(" 2.5 "), 2.5);
  assert.equal(parseTokenInput("1,000"), 1000);
  assert.equal(parseTokenInput("abc"), 0);
  assert.equal(parseTokenInput("-5"), 0);
  assert.equal(parseTokenInput(""), 0);
  assert.equal(parseTokenInput("1e99"), 1_000_000);
});
```

`src/lib/site/history.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import type { ModelEvent } from "../data/types.ts";
import { change30d, priceHistory } from "./history.ts";

const model = makeModel({ id: "openai/a", price: { input: 0.5, output: 1 }, releaseDate: "2026-01-01" });
const snap = (input: number, output: number) => ({ input, output, blended: (3 * input + output) / 4, context: 128_000 });
const head = { id: "openai/a", lab: "openai", slug: "a", name: "a" };
const events: ModelEvent[] = [
  { ...head, date: "2026-01-05", type: "new_model", after: snap(1, 2) },
  { ...head, date: "2026-06-01", type: "price_change", before: snap(1, 2), after: snap(0.5, 1), pctChange: -50 },
];

test("history follows events and ends today", () => {
  assert.deepEqual(priceHistory(model, events, "2026-10-11"), [
    { date: "2026-01-05", input: 1, output: 2 },
    { date: "2026-06-01", input: 0.5, output: 1 },
    { date: "2026-10-11", input: 0.5, output: 1 },
  ]);
});

test("history without events is a flat line from release", () => {
  assert.deepEqual(priceHistory(model, [], "2026-10-11"), [
    { date: "2026-01-01", input: 0.5, output: 1 },
    { date: "2026-10-11", input: 0.5, output: 1 },
  ]);
});

test("a price change without new_model starts at release with the old price", () => {
  assert.deepEqual(priceHistory(model, [events[1]], "2026-10-11")[0], { date: "2026-01-01", input: 1, output: 2 });
});

test("change30d compares with the price 30 days ago", () => {
  assert.equal(change30d(model, events, "2026-06-20"), -50);
  assert.equal(change30d(model, events, "2026-10-11"), null);
  const fresh = makeModel({ id: "openai/a", releaseDate: "2026-10-01" });
  assert.equal(change30d(fresh, [], "2026-10-11"), null);
});
```

`src/lib/site/selection.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import {
  BEST_LISTS, alternatives, comparisonPairs, findBestList, isIndexable, makePair, nearestCompetitors,
  notablePool, predecessor, versionOf,
} from "./selection.ts";

const TODAY = "2026-10-11";
const vision = { modalitiesIn: ["text", "image"] };

test("versionOf reads model generations, not sizes", () => {
  assert.equal(versionOf("claude-haiku-5-5"), 5.5);
  assert.equal(versionOf("gpt-6.1-sol"), 6.1);
  assert.equal(versionOf("gemma-4-31b-it"), 4);
  assert.equal(versionOf("llama-4-scout"), 4);
  assert.equal(versionOf("qwen3.8-max"), 3.8);
  assert.equal(versionOf("gpt-4o"), 4);
  assert.equal(versionOf("command-r"), null);
});

test("isIndexable needs a price and a context", () => {
  assert.equal(isIndexable(makeModel({ id: "openai/x", context: 0 })), false);
  assert.equal(isIndexable(makeModel({ id: "openai/x" })), true);
});

test("alternatives keep capabilities and sort by blended price", () => {
  const target = makeModel({ id: "anthropic/t", ...vision, price: { input: 1, output: 5 }, context: 200_000 });
  const models = [
    target,
    makeModel({ id: "google/cheap-vision", ...vision, price: { input: 0.1, output: 0.4 } , context: 1_000_000 }),
    makeModel({ id: "openai/mid-vision", ...vision, price: { input: 0.5, output: 2 }, context: 200_000 }),
    makeModel({ id: "meta/text-only", price: { input: 0.05, output: 0.1 }, context: 200_000 }),
    makeModel({ id: "xai/deprecated", ...vision, status: "deprecated", price: { input: 0.01, output: 0.01 }, context: 200_000 }),
    makeModel({ id: "mistral/tiny-ctx", ...vision, price: { input: 0.02, output: 0.02 }, context: 32_000 }),
  ];
  assert.deepEqual(alternatives(target, models).map((m) => m.id), ["google/cheap-vision", "openai/mid-vision"]);
});

test("nearestCompetitors excludes the same lab and sorts by price ratio", () => {
  const target = makeModel({ id: "openai/t", price: { input: 1, output: 1 } });
  const models = [
    target,
    makeModel({ id: "openai/sibling", price: { input: 1, output: 1 } }),
    makeModel({ id: "anthropic/x2", price: { input: 2, output: 2 } }),
    makeModel({ id: "google/x10", price: { input: 10, output: 10 } }),
    makeModel({ id: "meta/half", price: { input: 0.6, output: 0.6 } }),
  ];
  assert.deepEqual(nearestCompetitors(target, models).map((m) => m.id), ["meta/half", "anthropic/x2", "google/x10"]);
});

test("notablePool keeps recent models, two per family", () => {
  const models = [
    makeModel({ id: "openai/gpt-6", family: "gpt", releaseDate: "2026-06-01" }),
    makeModel({ id: "openai/gpt-6.1", family: "gpt", releaseDate: "2026-09-01" }),
    makeModel({ id: "openai/gpt-5", family: "gpt", releaseDate: "2026-01-01" }),
    makeModel({ id: "openai/ancient", family: "old", releaseDate: "2023-01-01" }),
  ];
  assert.deepEqual(notablePool(models, TODAY).map((m) => m.id), ["openai/gpt-6", "openai/gpt-6.1"]);
});

test("comparisonPairs: predecessor and competitors first, canonical keys, no duplicates, capped", () => {
  const models = [
    makeModel({ id: "anthropic/claude-haiku-5-5", family: "claude-haiku", releaseDate: "2026-10-07", price: { input: 0.1, output: 0.5 } }),
    makeModel({ id: "anthropic/claude-haiku-4-5", family: "claude-haiku", releaseDate: "2025-10-15", price: { input: 1, output: 5 } }),
    makeModel({ id: "google/gemini-3-8-flash", family: "gemini-flash", releaseDate: "2026-08-01", price: { input: 0.15, output: 0.6 } }),
    makeModel({ id: "openai/gpt-6-1-mini", family: "gpt-mini", releaseDate: "2026-09-01", price: { input: 0.2, output: 0.8 } }),
    makeModel({ id: "meta/llama-5", family: "llama", releaseDate: "2026-05-01", price: { input: 0.1, output: 0.3 } }),
  ];
  const pairs = comparisonPairs(models, TODAY);
  assert.equal(pairs[0].key, "claude-haiku-4-5-vs-claude-haiku-5-5");
  assert.ok(pairs.every((p) => p.a.slug < p.b.slug && p.key === `${p.a.slug}-vs-${p.b.slug}`));
  assert.equal(new Set(pairs.map((p) => p.key)).size, pairs.length);
  assert.equal(comparisonPairs(models, TODAY, 2).length, 2);
  assert.equal(makePair(models[1], models[0]).key, makePair(models[0], models[1]).key);
  assert.equal(predecessor(models[0], models)?.id, "anthropic/claude-haiku-4-5");
});

test("best lists filter and rank", () => {
  const models = [
    makeModel({ id: "openai/a", ...vision, price: { input: 3, output: 3 }, releaseDate: "2026-10-01" }),
    makeModel({ id: "google/b", ...vision, price: { input: 1, output: 1 }, releaseDate: "2026-02-01" }),
    makeModel({ id: "meta/c", price: { input: 0.1, output: 0.1 }, releaseDate: "2026-09-20" }),
  ];
  const vis = findBestList("cheapest-vision-model");
  assert.deepEqual(vis?.select(models, TODAY).map((m) => m.id), ["google/b", "openai/a"]);
  const newest = findBestList("newest-ai-models");
  assert.deepEqual(newest?.select(models, TODAY).map((m) => m.id), ["openai/a", "meta/c"]);
  assert.equal(new Set(BEST_LISTS.map((l) => l.slug)).size, BEST_LISTS.length);
  assert.equal(findBestList("nope"), null);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module` for `cost.ts`, `history.ts` and `selection.ts`.

- [ ] **Step 3: Implement `src/lib/site/cost.ts`**

```ts
export type Scenario = { id: string; label: string; inputTokens: number; outputTokens: number };

export const SCENARIOS: Scenario[] = [
  { id: "chatbot", label: "Chatbot", inputTokens: 10_000_000, outputTokens: 2_000_000 },
  { id: "rag", label: "RAG app", inputTokens: 50_000_000, outputTokens: 5_000_000 },
  { id: "agent", label: "Coding agent", inputTokens: 20_000_000, outputTokens: 10_000_000 },
];

/** Monthly USD cost at base-tier list price (prices are per 1M tokens). */
export function monthlyCost(price: { input: number; output: number }, inputTokens: number, outputTokens: number): number {
  return Math.round(((price.input * inputTokens + price.output * outputTokens) / 1_000_000) * 100) / 100;
}

/** Parses a "millions of tokens" field; garbage becomes 0, huge values are clamped. */
export function parseTokenInput(raw: string): number {
  const n = Number(String(raw).replace(/[,_\s]/gu, ""));
  if (!Number.isFinite(n) || n < 0) return n === Number.POSITIVE_INFINITY ? 1_000_000 : 0;
  return Math.min(n, 1_000_000);
}
```

- [ ] **Step 4: Implement `src/lib/site/history.ts`**

```ts
import { addDays } from "../data/dates.ts";
import { pct } from "../data/diff.ts";
import { blendedPrice } from "../data/normalize.ts";
import type { Model, ModelEvent } from "../data/types.ts";

export type PricePoint = { date: string; input: number; output: number };

export function priceHistory(model: Model, events: ModelEvent[], today: string): PricePoint[] {
  const own = events
    .filter((e) => e.id === model.id && (e.type === "new_model" || e.type === "price_change"))
    .sort((a, b) => a.date.localeCompare(b.date));
  const release = model.releaseDate;
  const points: PricePoint[] = [];

  for (const e of own) {
    if (!e.after) continue;
    if (points.length === 0 && e.type === "price_change" && e.before) {
      points.push({ date: release && release < e.date ? release : e.date, input: e.before.input, output: e.before.output });
    }
    points.push({ date: e.date, input: e.after.input, output: e.after.output });
  }
  if (points.length === 0) {
    points.push({ date: release && release < today ? release : today, input: model.price.input, output: model.price.output });
  }
  points.push({ date: today, input: model.price.input, output: model.price.output });

  const out: PricePoint[] = [];
  for (const p of points) {
    if (out.length > 0 && out[out.length - 1].date === p.date) out[out.length - 1] = p;
    else out.push(p);
  }
  return out;
}

/** Percent change of the blended price over 30 days, or null when unknown or unchanged. */
export function change30d(model: Model, events: ModelEvent[], today: string): number | null {
  const cutoff = addDays(today, -30);
  const past = priceHistory(model, events, today).filter((p) => p.date <= cutoff).at(-1);
  if (!past) return null;
  const before = blendedPrice(past.input, past.output);
  return before === model.blended ? null : pct(before, model.blended);
}
```

- [ ] **Step 5: Implement `src/lib/site/selection.ts`**

```ts
import { TIER1_LABS } from "../data/config.ts";
import { daysBetween } from "../data/dates.ts";
import type { Model } from "../data/types.ts";

export const NOTABLE_MAX_AGE_DAYS = 548;
export const NEW_MODEL_DAYS = 90;
export const PAIR_CAP = 300;
export const MIN_LIST_SIZE = 5;
const LIST_SIZE = 20;

export const isActive = (m: Model) => m.status === "active";
export const isIndexable = (m: Model) => m.context > 0 && (m.price.input > 0 || m.price.output > 0);

export function priceBand(blended: number): 0 | 1 | 2 {
  if (blended < 0.5) return 0;
  return blended <= 3 ? 1 : 2;
}

export function versionOf(slug: string): number | null {
  const m = slug.match(/(\d+)(?:[.-](\d+)(?!\d*[a-z]))?/iu);
  if (!m) return null;
  return Number(m[2] === undefined ? m[1] : `${m[1]}.${m[2]}`);
}

const ratioDistance = (a: number, b: number) => Math.abs(Math.log(Math.max(a, 1e-6)) - Math.log(Math.max(b, 1e-6)));
const byBlended = (a: Model, b: Model) => a.blended - b.blended || a.id.localeCompare(b.id);
const byNewest = (a: Model, b: Model) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") || a.id.localeCompare(b.id);
const listable = (models: Model[]) => models.filter((m) => isActive(m) && isIndexable(m));

export function alternatives(model: Model, models: Model[], n = 5): Model[] {
  return listable(models)
    .filter(
      (c) =>
        c.id !== model.id &&
        model.modalitiesIn.every((x) => c.modalitiesIn.includes(x)) &&
        (!model.capabilities.toolCall || c.capabilities.toolCall) &&
        (!model.capabilities.reasoning || c.capabilities.reasoning) &&
        c.context >= model.context * 0.5,
    )
    .sort(byBlended)
    .slice(0, n);
}

export function nearestCompetitors(model: Model, models: Model[], n = 3): Model[] {
  return listable(models)
    .filter((c) => c.lab !== model.lab && c.capabilities.toolCall === model.capabilities.toolCall)
    .sort((a, b) => ratioDistance(a.blended, model.blended) - ratioDistance(b.blended, model.blended) || a.id.localeCompare(b.id))
    .slice(0, n);
}

export function predecessor(model: Model, models: Model[]): Model | null {
  const release = model.releaseDate;
  if (!model.family || !release) return null;
  const older = models.filter(
    (m) => m.id !== model.id && m.lab === model.lab && m.family === model.family && m.releaseDate !== null && m.releaseDate < release && isIndexable(m),
  );
  return older.sort(byNewest)[0] ?? null;
}

export function notablePool(models: Model[], today: string, perFamily = 2): Model[] {
  const groups = new Map<string, Model[]>();
  for (const m of listable(models)) {
    if (m.releaseDate === null || daysBetween(m.releaseDate, today) > NOTABLE_MAX_AGE_DAYS) continue;
    const key = `${m.lab}:${m.family ?? m.id}`;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  return [...groups.values()].flatMap((list) => list.sort(byNewest).slice(0, perFamily)).sort((a, b) => a.id.localeCompare(b.id));
}

export type Pair = { key: string; a: Model; b: Model };

export function makePair(x: Model, y: Model): Pair {
  const [a, b] = x.slug < y.slug ? [x, y] : [y, x];
  return { key: `${a.slug}-vs-${b.slug}`, a, b };
}

export function comparisonPairs(models: Model[], today: string, cap = PAIR_CAP): Pair[] {
  const pool = notablePool(models, today);
  const out = new Map<string, Pair>();
  const add = (p: Pair) => {
    if (out.size < cap && p.a.id !== p.b.id && !out.has(p.key)) out.set(p.key, p);
  };

  const newest = pool.filter((m) => m.releaseDate !== null && daysBetween(m.releaseDate, today) <= NEW_MODEL_DAYS).sort(byNewest);
  for (const m of newest) {
    const pred = predecessor(m, models);
    if (pred) add(makePair(m, pred));
    for (const c of nearestCompetitors(m, pool, 3)) add(makePair(m, c));
  }

  const tier = (p: Pair) => Number(TIER1_LABS.has(p.a.lab)) + Number(TIER1_LABS.has(p.b.lab));
  const band: Pair[] = [];
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      if (pool[i].lab !== pool[j].lab && priceBand(pool[i].blended) === priceBand(pool[j].blended)) band.push(makePair(pool[i], pool[j]));
    }
  }
  band.sort((p, q) => tier(q) - tier(p) || ratioDistance(p.a.blended, p.b.blended) - ratioDistance(q.a.blended, q.b.blended) || p.key.localeCompare(q.key));
  for (const p of band) add(p);
  return [...out.values()];
}

export type BestList = { slug: string; title: string; description: string; select: (models: Model[], today: string) => Model[] };

const cheapest = (models: Model[]) => [...models].sort(byBlended).slice(0, LIST_SIZE);
const hasImage = (m: Model) => m.modalitiesIn.includes("image");

export const BEST_LISTS: BestList[] = [
  { slug: "cheapest-llm-api", title: "Cheapest LLM APIs", description: "The lowest blended price per million tokens across every tracked model.", select: (ms) => cheapest(listable(ms)) },
  { slug: "cheapest-vision-model", title: "Cheapest Vision Models", description: "Models that accept image input, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter(hasImage)) },
  { slug: "cheapest-reasoning-model", title: "Cheapest Reasoning Models", description: "Models with built-in reasoning, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.capabilities.reasoning)) },
  { slug: "longest-context-window", title: "AI Models With the Longest Context Window", description: "Models ranked by maximum context length, cheapest first on ties.", select: (ms) => listable(ms).sort((a, b) => b.context - a.context || byBlended(a, b)).slice(0, LIST_SIZE) },
  { slug: "cheapest-1m-context-model", title: "Cheapest Models With a 1M-Token Context", description: "Models with at least one million tokens of context, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.context >= 1_000_000)) },
  { slug: "best-open-weights-models", title: "Cheapest Open-Weights Models", description: "Open-weights models ranked by the cheapest tracked price.", select: (ms) => cheapest(listable(ms).filter((m) => m.openWeights)) },
  { slug: "cheapest-tool-calling-model", title: "Cheapest Models With Tool Calling", description: "Models that support function and tool calling, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.capabilities.toolCall)) },
  { slug: "cheapest-structured-output-model", title: "Cheapest Models With Structured Output", description: "Models with native JSON or schema output, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.capabilities.structuredOutput)) },
  { slug: "cheapest-gpt-alternative", title: "Cheapest GPT Alternatives", description: "Non-OpenAI models with tool calling, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.lab !== "openai" && m.capabilities.toolCall)) },
  { slug: "cheapest-claude-alternative", title: "Cheapest Claude Alternatives", description: "Non-Anthropic models with tool calling, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.lab !== "anthropic" && m.capabilities.toolCall)) },
  { slug: "cheapest-gemini-alternative", title: "Cheapest Gemini Alternatives", description: "Non-Google models with image input, ranked by blended price.", select: (ms) => cheapest(listable(ms).filter((m) => m.lab !== "google" && hasImage(m))) },
  {
    slug: "newest-ai-models",
    title: "Newest AI Models",
    description: "Models released in the last 60 days, newest first.",
    select: (ms, today) =>
      listable(ms)
        .filter((m) => m.releaseDate !== null && daysBetween(m.releaseDate, today) >= 0 && daysBetween(m.releaseDate, today) <= 60)
        .sort(byNewest)
        .slice(0, LIST_SIZE),
  },
];

export function findBestList(slug: string): BestList | null {
  return BEST_LISTS.find((l) => l.slug === slug) ?? null;
}
```

- [ ] **Step 6: Implement `src/lib/site/catalog.ts` and `src/lib/site/rows.ts`**

`src/lib/site/catalog.ts`:

```ts
import path from "node:path";

import { HOST_NAMES, LAB_NAMES, LAB_PROVIDER, isLabId } from "../data/config.ts";
import { readEvents, readLatest, readMeta } from "../data/store.ts";
import type { Meta, Model, ModelEvent } from "../data/types.ts";
import { isActive, isIndexable } from "./selection.ts";

export type Catalog = { models: Model[]; events: ModelEvent[]; meta: Meta | null; today: string };

let cached: Catalog | null = null;

/** Reads data/models once per process. `today` is the last successful refresh, so builds are reproducible. */
export function getCatalog(): Catalog {
  if (cached) return cached;
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data", "models");
  const meta = readMeta(dir);
  cached = {
    models: readLatest(dir) ?? [],
    events: readEvents(dir),
    meta,
    today: (meta?.lastSuccessAt ?? new Date().toISOString()).slice(0, 10),
  };
  return cached;
}

export function findModel(lab: string, slug: string): Model | null {
  return getCatalog().models.find((m) => m.lab === lab && m.slug === slug) ?? null;
}

export const labName = (lab: string) => (isLabId(lab) ? LAB_NAMES[lab] : lab);

const PROVIDER_LAB = new Map(Object.entries(LAB_PROVIDER).map(([lab, provider]) => [provider, lab]));
export function hostName(provider: string): string {
  return HOST_NAMES[provider] ?? labName(PROVIDER_LAB.get(provider) ?? provider);
}

export const isFirstPartyPrice = (m: Model) => isLabId(m.lab) && m.priceSource === LAB_PROVIDER[m.lab];

export function recentEvents(events: ModelEvent[], n: number): ModelEvent[] {
  return [...events].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)).slice(0, n);
}

export type LabSummary = { lab: string; name: string; models: Model[]; minBlended: number; maxBlended: number };

export function labSummaries(models: Model[]): LabSummary[] {
  const byLab = new Map<string, Model[]>();
  for (const m of models) if (isActive(m) && isIndexable(m)) byLab.set(m.lab, [...(byLab.get(m.lab) ?? []), m]);
  return [...byLab.entries()]
    .map(([lab, list]) => ({
      lab,
      name: labName(lab),
      models: list,
      minBlended: Math.min(...list.map((m) => m.blended)),
      maxBlended: Math.max(...list.map((m) => m.blended)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
```

`src/lib/site/rows.ts`:

```ts
import type { Model } from "../data/types.ts";
import { getCatalog, labName } from "./catalog.ts";
import { change30d } from "./history.ts";
import { modelUrl } from "./urls.ts";

export type ModelRow = {
  id: string; href: string; name: string; labName: string;
  input: number; output: number; context: number; change30d: number | null; status: string;
};

export function modelRows(models: Model[]): ModelRow[] {
  const { events, today } = getCatalog();
  return models.map((m) => ({
    id: m.id, href: modelUrl(m), name: m.name, labName: labName(m.lab),
    input: m.price.input, output: m.price.output, context: m.context,
    change30d: change30d(m, events, today), status: m.status,
  }));
}
```

- [ ] **Step 7: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`. If `comparisonPairs` puts another pair first, check that `predecessor()` is evaluated before `nearestCompetitors()` for the newest model (claude-haiku-5-5, released 2026-10-07).

- [ ] **Step 8: Sanity-check against the real data**

```bash
node -e "
import('./src/lib/site/selection.ts').then(async (s) => {
  const { readLatest } = await import('./src/lib/data/store.ts');
  const models = readLatest('data/models');
  const pairs = s.comparisonPairs(models, new Date().toISOString().slice(0,10));
  console.log('models', models.length, 'pairs', pairs.length, pairs.slice(0,5).map(p => p.key));
  for (const l of s.BEST_LISTS) console.log(l.slug, l.select(models, new Date().toISOString().slice(0,10)).length);
});"
```

Expected: between 100 and 300 pairs, and every best list with at least 5 entries except possibly `newest-ai-models`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/site
git commit -m "feat(site): catalog access, price history, selection rules and cost helpers"
```

---

### Task 8: Model page (`/models/[lab]/[slug]`) with dashboard/report toggle

**Files:**
- Create: `src/lib/site/seo.ts`, `src/lib/site/seo.test.ts`
- Create: `src/components/model-layout.tsx`, `src/components/cost-calculator.tsx`
- Create: `src/app/models/[lab]/[slug]/page.tsx`

**Interfaces:**
- Consumes: everything from Tasks 6–7; `pct` (Task 3)
- Produces:
  - `seo.ts`: `modelTitle(m, today)`, `modelDescription(m, labName)`, `compareTitle(a, b, today)`, `bestTitle(list, n, today)`
  - `<ModelLayout main side/>` (client; `localStorage` key `ais-layout`, values `dashboard|report`)
  - `<CostCalculator rows={CalcRow[]} defaultInputM? defaultOutputM? searchable?/>`, `type CalcRow = { id; name; href; input; output }`

- [ ] **Step 1: Write the failing SEO title test**

`src/lib/site/seo.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { bestTitle, compareTitle, modelDescription, modelTitle } from "./seo.ts";

const haiku = makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 }, context: 1_000_000 });
const sol = makeModel({ id: "openai/gpt-6.1-sol", name: "GPT-6.1 Sol" });

test("titles match search intent and carry the month", () => {
  assert.equal(modelTitle(haiku, "2026-10-11"), "Claude Haiku 5.5 Pricing, Context Window & Specs (Oct 2026)");
  assert.equal(compareTitle(haiku, sol, "2026-10-11"), "Claude Haiku 5.5 vs GPT-6.1 Sol: Price & Specs Compared (Oct 2026)");
  assert.equal(bestTitle({ title: "Cheapest Vision Models" }, 20, "2026-10-11"), "20 Cheapest Vision Models (Oct 2026)");
});

test("model description uses real numbers", () => {
  assert.equal(
    modelDescription(haiku, "Anthropic"),
    "Claude Haiku 5.5 by Anthropic: $0.10 per 1M input tokens, $0.50 per 1M output tokens, 1M context. Price history, cheaper alternatives and a cost calculator.",
  );
});
```

- [ ] **Step 2: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../seo.ts'`.

- [ ] **Step 3: Implement `src/lib/site/seo.ts`** (sitemap and RSS helpers are added in Tasks 12 and 14)

```ts
import type { Model } from "../data/types.ts";
import { fmtTokens, fmtUsd, monthYear } from "./format.ts";

export function modelTitle(m: Model, today: string): string {
  return `${m.name} Pricing, Context Window & Specs (${monthYear(today)})`;
}

export function modelDescription(m: Model, labName: string): string {
  return `${m.name} by ${labName}: ${fmtUsd(m.price.input)} per 1M input tokens, ${fmtUsd(m.price.output)} per 1M output tokens, ${fmtTokens(m.context)} context. Price history, cheaper alternatives and a cost calculator.`;
}

export function compareTitle(a: Model, b: Model, today: string): string {
  return `${a.name} vs ${b.name}: Price & Specs Compared (${monthYear(today)})`;
}

export function bestTitle(list: { title: string }, n: number, today: string): string {
  return `${n} ${list.title} (${monthYear(today)})`;
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 5: Create `src/components/model-layout.tsx`**

```tsx
"use client";

import { useSyncExternalStore } from "react";

type Layout = "dashboard" | "report";
const KEY = "ais-layout";
const listeners = new Set<() => void>();

function read(): Layout {
  try {
    return window.localStorage.getItem(KEY) === "report" ? "report" : "dashboard";
  } catch {
    return "dashboard";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function write(layout: Layout) {
  try {
    window.localStorage.setItem(KEY, layout);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  listeners.forEach((l) => l());
}

/** Same HTML for both layouts; CSS switches the grid. Mobile is always the report layout. */
export function ModelLayout({ main, side }: { main: React.ReactNode; side: React.ReactNode }) {
  const layout = useSyncExternalStore(subscribe, read, () => "dashboard" as Layout);
  return (
    <div className="model-layout" data-layout={layout}>
      <div className="layout-toggle" role="group" aria-label="Page layout">
        <button type="button" aria-pressed={layout === "dashboard"} onClick={() => write("dashboard")}>dashboard</button>
        <button type="button" aria-pressed={layout === "report"} onClick={() => write("report")}>report</button>
      </div>
      <div className="model-main">{main}</div>
      <div className="model-side">{side}</div>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/cost-calculator.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { monthlyCost, parseTokenInput } from "@/lib/site/cost";
import { fmtUsd, fmtUsdCost } from "@/lib/site/format";

export type CalcRow = { id: string; name: string; href: string; input: number; output: number };

export function CostCalculator({
  rows, defaultInputM = 50, defaultOutputM = 10, searchable = false,
}: { rows: CalcRow[]; defaultInputM?: number; defaultOutputM?: number; searchable?: boolean }) {
  const id = useId();
  const [inputM, setInputM] = useState(String(defaultInputM));
  const [outputM, setOutputM] = useState(String(defaultOutputM));
  const [query, setQuery] = useState("");
  const inTokens = parseTokenInput(inputM) * 1_000_000;
  const outTokens = parseTokenInput(outputM) * 1_000_000;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => !q || r.name.toLowerCase().includes(q))
      .map((r) => ({ ...r, cost: monthlyCost(r, inTokens, outTokens) }))
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
  }, [rows, query, inTokens, outTokens]);

  return (
    <div>
      <div className="calc-inputs">
        <div>
          <label htmlFor={`${id}-in`}>input tokens / month (millions)</label>
          <input id={`${id}-in`} className="input" inputMode="decimal" value={inputM} onChange={(e) => setInputM(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${id}-out`}>output tokens / month (millions)</label>
          <input id={`${id}-out`} className="input" inputMode="decimal" value={outputM} onChange={(e) => setOutputM(e.target.value)} />
        </div>
      </div>
      {searchable ? (
        <input className="search" style={{ marginTop: 12 }} placeholder="filter models…" aria-label="Filter models" value={query} onChange={(e) => setQuery(e.target.value)} />
      ) : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th scope="col">model</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th><th scope="col">= monthly</th></tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td><Link href={r.href}>{r.name}</Link></td>
                <td>{fmtUsd(r.input)}</td>
                <td>{fmtUsd(r.output)}</td>
                <td className="dn">{fmtUsdCost(r.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="dim">Base-tier list prices. Long-context tiers, caching and batch discounts are not included.</p>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/app/models/[lab]/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CostCalculator, type CalcRow } from "@/components/cost-calculator";
import { FaqList } from "@/components/faq-list";
import { ModelLayout } from "@/components/model-layout";
import { PriceChart } from "@/components/price-chart";
import { StatGrid } from "@/components/stat-grid";
import { pct } from "@/lib/data/diff";
import type { Model } from "@/lib/data/types";
import { findModel, getCatalog, hostName, isFirstPartyPrice, labName } from "@/lib/site/catalog";
import { monthlyCost } from "@/lib/site/cost";
import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost, yesNo } from "@/lib/site/format";
import { priceHistory } from "@/lib/site/history";
import { modelDescription, modelTitle } from "@/lib/site/seo";
import { alternatives, comparisonPairs, isIndexable, makePair } from "@/lib/site/selection";
import { compareUrl, modelUrl, ogImageUrl, providerUrl } from "@/lib/site/urls";

type Params = { lab: string; slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCatalog().models.map((m) => ({ lab: m.lab, slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lab, slug } = await params;
  const model = findModel(lab, slug);
  if (!model) return {};
  const url = modelUrl(model);
  return {
    title: modelTitle(model, getCatalog().today),
    description: modelDescription(model, labName(model.lab)),
    alternates: { canonical: url },
    robots: isIndexable(model) ? undefined : { index: false, follow: true },
    openGraph: {
      url,
      images: [{ url: ogImageUrl(`${model.name} pricing`, `${fmtUsd(model.price.input)} in · ${fmtUsd(model.price.output)} out per 1M tokens`), width: 1200, height: 630 }],
    },
  };
}

const toCalcRow = (m: Model): CalcRow => ({ id: m.id, name: m.name, href: modelUrl(m), input: m.price.input, output: m.price.output });

function buildFaq(model: Model, alts: Model[], source: string | null): { q: string; a: string }[] {
  const p = model.price;
  const tiers = (p.tiers ?? []).map((t) => ` Prompts above ${fmtTokens(t.minContext)} tokens are billed at ${fmtUsd(t.input)} input and ${fmtUsd(t.output)} output.`).join("");
  const items = [
    {
      q: `How much does ${model.name} cost?`,
      a: `${model.name} costs ${fmtUsd(p.input)} per million input tokens and ${fmtUsd(p.output)} per million output tokens${source ? ` (cheapest tracked host: ${source})` : ""}. At 50M input and 10M output tokens per month that is about ${fmtUsdCost(monthlyCost(p, 50_000_000, 10_000_000))}.${tiers}`,
    },
    {
      q: `What is the context window of ${model.name}?`,
      a: `${fmtTokens(model.context)} tokens${model.maxOutput ? `, with up to ${fmtTokens(model.maxOutput)} output tokens per request` : ""}.`,
    },
  ];
  if (p.cacheRead !== undefined) {
    items.push({
      q: `Does ${model.name} support prompt caching?`,
      a: `Yes. Cached input tokens cost ${fmtUsd(p.cacheRead)} per million${p.cacheWrite !== undefined ? ` and cache writes cost ${fmtUsd(p.cacheWrite)} per million` : ""}.`,
    });
  }
  const cheaper = alts.filter((a) => a.blended < model.blended).slice(0, 3);
  if (cheaper.length > 0) {
    items.push({
      q: `What are cheaper alternatives to ${model.name}?`,
      a: `${cheaper.map((a) => `${a.name} (${fmtUsd(a.price.input)} in / ${fmtUsd(a.price.output)} out)`).join(", ")} offer the same input types and capabilities for less.`,
    });
  }
  if (model.openWeights) {
    const host = model.hosts[0];
    items.push({
      q: `Is ${model.name} open weights?`,
      a: `Yes.${host ? ` It is available from ${model.hosts.length} tracked hosts; the cheapest is ${hostName(host.provider)} at ${fmtUsd(host.input)} input and ${fmtUsd(host.output)} output per million tokens.` : ""}`,
    });
  }
  return items;
}

export default async function ModelPage({ params }: { params: Promise<Params> }) {
  const { lab, slug } = await params;
  const model = findModel(lab, slug);
  if (!model) notFound();

  const { models, events, meta, today } = getCatalog();
  const alts = alternatives(model, models, 5);
  const pairKeys = new Set(comparisonPairs(models, today).map((p) => p.key));
  const compareLinks = models
    .filter((m) => m.id !== model.id)
    .map((m) => makePair(model, m))
    .filter((p) => pairKeys.has(p.key))
    .slice(0, 6);
  const source = isFirstPartyPrice(model) ? null : hostName(model.priceSource);
  const verified = (meta?.lastSuccessAt ?? today).slice(0, 10);
  const p = model.price;

  return (
    <>
      <Breadcrumbs items={[{ href: "/models", label: "models" }, { href: providerUrl(model.lab), label: labName(model.lab) }, { href: modelUrl(model), label: model.name }]} />
      <h1>{model.name} pricing &amp; specs</h1>
      <p className="sub">
        <Link href={providerUrl(model.lab)}>{labName(model.lab)}</Link> · released {model.releaseDate ?? "n/a"} · <span className="ok">● verified {verified}</span>
        {model.status !== "active" ? <> · <span className="tag warn">{model.status}</span></> : null}
      </p>
      {model.status === "deprecated" && alts[0] ? (
        <p className="up">This model is deprecated. Cheapest compatible replacement: <Link href={modelUrl(alts[0])}>{alts[0].name}</Link>.</p>
      ) : null}
      <StatGrid
        stats={[
          { label: "input / 1M", value: fmtUsd(p.input), note: source ? `via ${source}` : undefined },
          { label: "output / 1M", value: fmtUsd(p.output), note: source ? `via ${source}` : undefined },
          { label: "context", value: fmtTokens(model.context) },
          { label: "max output", value: fmtTokens(model.maxOutput) },
        ]}
      />
      <ModelLayout
        main={
          <>
            <Box title="price history ($/1M tokens)" className="o-chart">
              <PriceChart points={priceHistory(model, events, today)} />
            </Box>
            <Box title="cheaper or similar alternatives" className="o-alt">
              {alts.length === 0 ? <p className="dim">No compatible alternative tracked.</p> : (
                <div className="table-wrap">
                  <table className="data">
                    <thead><tr><th scope="col">model</th><th scope="col">in</th><th scope="col">out</th><th scope="col">ctx</th><th scope="col">vs {model.name}</th></tr></thead>
                    <tbody>
                      {alts.map((a) => {
                        const diff = pct(model.blended, a.blended);
                        return (
                          <tr key={a.id}>
                            <td><Link href={modelUrl(a)}>{a.name}</Link></td>
                            <td>{fmtUsd(a.price.input)}</td>
                            <td>{fmtUsd(a.price.output)}</td>
                            <td>{fmtTokens(a.context)}</td>
                            <td className={diff < 0 ? "dn" : "muted"}>{fmtPct(diff)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {compareLinks.map((c) => (
                <Link key={c.key} className="btn" href={compareUrl(c.key)}>{c.a.name} vs {c.b.name} →</Link>
              ))}
            </Box>
            {model.hosts.length > 0 ? (
              <Box title="price by host" className="o-hosts">
                <table className="data">
                  <thead><tr><th scope="col">host</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th></tr></thead>
                  <tbody>
                    {model.hosts.map((h) => (
                      <tr key={h.provider}><td>{hostName(h.provider)}</td><td>{fmtUsd(h.input)}</td><td>{fmtUsd(h.output)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ) : null}
            <Box title="faq" className="o-faq">
              <FaqList items={buildFaq(model, alts, source)} />
            </Box>
          </>
        }
        side={
          <>
            <Box title="spec sheet" className="o-spec">
              <dl className="kv">
                <div><dt>input / 1M</dt><dd>{fmtUsd(p.input)}</dd></div>
                <div><dt>output / 1M</dt><dd>{fmtUsd(p.output)}</dd></div>
                {p.cacheRead !== undefined ? <div><dt>cache read / 1M</dt><dd>{fmtUsd(p.cacheRead)}</dd></div> : null}
                {p.cacheWrite !== undefined ? <div><dt>cache write / 1M</dt><dd>{fmtUsd(p.cacheWrite)}</dd></div> : null}
                {(p.tiers ?? []).map((t) => (
                  <div key={t.minContext}><dt>&gt; {fmtTokens(t.minContext)} ctx</dt><dd>{fmtUsd(t.input)} / {fmtUsd(t.output)}</dd></div>
                ))}
                <div><dt>blended (3:1)</dt><dd>{fmtUsd(model.blended)}</dd></div>
                <div><dt>context</dt><dd>{fmtTokens(model.context)}</dd></div>
                <div><dt>max output</dt><dd>{fmtTokens(model.maxOutput)}</dd></div>
                <div><dt>input types</dt><dd>{model.modalitiesIn.join(" · ")}</dd></div>
                <div><dt>reasoning</dt><dd>{yesNo(model.capabilities.reasoning)}</dd></div>
                <div><dt>tool calling</dt><dd>{yesNo(model.capabilities.toolCall)}</dd></div>
                <div><dt>structured output</dt><dd>{yesNo(model.capabilities.structuredOutput)}</dd></div>
                <div><dt>open weights</dt><dd>{yesNo(model.openWeights)}</dd></div>
                <div><dt>knowledge cutoff</dt><dd>{model.knowledgeCutoff ?? "n/a"}</dd></div>
                <div><dt>price source</dt><dd>{hostName(model.priceSource)}</dd></div>
                {model.aliases.length > 0 ? <div><dt>aliases</dt><dd>{model.aliases.join(", ")}</dd></div> : null}
              </dl>
              <p className="dim">
                <a href={`mailto:hello@aisignals.dev?subject=${encodeURIComponent(`Data error: ${model.name}`)}`}>report a data error</a>
              </p>
            </Box>
            <Box title="cost calculator" className="o-calc">
              <CostCalculator rows={[model, ...alts.slice(0, 3)].map(toCalcRow)} />
            </Box>
            <div className="o-ad"><AdSlot /></div>
          </>
        }
      />
    </>
  );
}
```

- [ ] **Step 8: Verify build and the page in the browser**

```bash
npm run lint && npm test && npm run build
```

Expected: the build lists `/models/[lab]/[slug]` with ~N prerendered paths (● SSG). Then run `npm run dev`, open `/models/anthropic/claude-haiku-5-5` in the browser pane and check:
1. Desktop (≥1024 px): two columns, spec sheet at the top right, then the calculator. The toggle switches to one column, and the choice survives a reload.
2. Mobile preset: one column in report order (chart, calculator, alternatives, hosts, spec, FAQ), toggle hidden, no horizontal scroll.
3. Change the calculator fields to `abc`: costs show `$0.00`, never `NaN`.
4. An open-weights, host-only model (e.g. a `google/gemma-*` page) shows "via DeepInfra" (or another host) and the "price by host" box.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat(ui): model page with price history, alternatives, calculator and layout toggle"
```

### Task 9: Home, model index and provider pages

**Files:**
- Create: `src/components/model-table.tsx`
- Modify: `src/app/page.tsx` (real home)
- Create: `src/app/models/page.tsx`, `src/app/providers/page.tsx`, `src/app/providers/[lab]/page.tsx`

**Interfaces:**
- Consumes: `getCatalog`, `labSummaries`, `recentEvents`, `labName`, `modelRows`, `type ModelRow`, `notablePool`, `BEST_LISTS`, components from Task 6, `monthYear`, urls
- Produces: `<ModelTable rows searchable? showLab? initialSort?: "name" | "input" | "output" | "context" | "change30d" | null/>` (client, sortable, searchable)

- [ ] **Step 1: Create `src/components/model-table.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { fmtPct, fmtTokens, fmtUsd } from "@/lib/site/format";
import type { ModelRow } from "@/lib/site/rows";

type SortKey = "name" | "input" | "output" | "context" | "change30d";

export function ModelTable({
  rows, searchable = false, showLab = true, initialSort = "input",
}: { rows: ModelRow[]; searchable?: boolean; showLab?: boolean; initialSort?: SortKey | null }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey | null; dir: 1 | -1 }>({ key: initialSort, dir: 1 });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? rows.filter((r) => `${r.name} ${r.labName}`.toLowerCase().includes(q)) : rows;
    const key = sort.key;
    if (!key) return filtered;
    return [...filtered].sort((a, b) => {
      if (key === "name") return a.name.localeCompare(b.name) * sort.dir;
      const va = a[key];
      const vb = b[key];
      if (va === vb) return a.name.localeCompare(b.name);
      if (va === null) return 1;
      if (vb === null) return -1;
      return (va - vb) * sort.dir;
    });
  }, [rows, query, sort]);

  const th = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}>
        {label}{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <>
      {searchable ? (
        <input className="search" type="search" aria-label="Search models" placeholder={`search ${rows.length} models… (e.g. "claude", "llama")`} value={query} onChange={(e) => setQuery(e.target.value)} />
      ) : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {th("name", "model")}
              {showLab ? <th scope="col">lab</th> : null}
              {th("input", "in $/1M")}
              {th("output", "out $/1M")}
              {th("context", "ctx")}
              {th("change30d", "30d")}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={r.href}>{r.name}</Link>
                  {r.status !== "active" ? <> <span className="tag dim">{r.status}</span></> : null}
                </td>
                {showLab ? <td className="muted">{r.labName}</td> : null}
                <td>{fmtUsd(r.input)}</td>
                <td>{fmtUsd(r.output)}</td>
                <td>{fmtTokens(r.context)}</td>
                <td className={r.change30d === null ? "dim" : r.change30d < 0 ? "dn" : "up"}>{r.change30d === null ? "—" : fmtPct(r.change30d)}</td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr><td colSpan={showLab ? 6 : 5} className="dim">no model matches “{query}”</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx` with the home page**

```tsx
import Link from "next/link";

import { Box } from "@/components/box";
import { EventFeed } from "@/components/event-feed";
import { ModelTable } from "@/components/model-table";
import { TIER1_LABS } from "@/lib/data/config";
import { daysBetween } from "@/lib/data/dates";
import { getCatalog, labSummaries, recentEvents } from "@/lib/site/catalog";
import { modelRows } from "@/lib/site/rows";
import { BEST_LISTS, notablePool } from "@/lib/site/selection";
import { bestUrl } from "@/lib/site/urls";

export default function Home() {
  const { models, events, meta, today } = getCatalog();
  const popular = notablePool(models, today, 1)
    .filter((m) => TIER1_LABS.has(m.lab))
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))
    .slice(0, 15);
  const movers = events
    .filter((e) => e.type === "price_change" && daysBetween(e.date, today) <= 30)
    .sort((a, b) => Math.abs(b.pctChange ?? 0) - Math.abs(a.pctChange ?? 0))
    .slice(0, 5);
  const sync = meta ? `${meta.lastSuccessAt.slice(0, 16).replace("T", " ")} UTC` : "pending";

  return (
    <>
      <section className="hero">
        <h1>Every AI model&apos;s price, tracked daily.</h1>
        <p className="sub">
          {models.length} models · {labSummaries(models).length} labs · <span className="ok">● last sync {sync}</span>
        </p>
      </section>
      <div className="grid-2">
        <Box title="popular models">
          <ModelTable rows={modelRows(popular)} initialSort={null} />
          <Link className="btn" href="/models">search all {models.length} models →</Link>
        </Box>
        <div>
          <Box title="latest changes">
            <EventFeed events={recentEvents(events, 8)} />
            <Link className="btn" href="/changes">full changelog →</Link>
          </Box>
          <Box title="biggest price moves (30 days)">
            <EventFeed events={movers} />
          </Box>
        </div>
      </div>
      <Box title="rankings">
        <ul className="feed">
          {BEST_LISTS.map((l) => (
            <li key={l.slug}><Link href={bestUrl(l.slug)}>{l.title}</Link> <span className="dim">{l.description}</span></li>
          ))}
        </ul>
      </Box>
    </>
  );
}
```

- [ ] **Step 3: Create `src/app/models/page.tsx`**

```tsx
import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModelTable } from "@/components/model-table";
import { getCatalog } from "@/lib/site/catalog";
import { modelRows } from "@/lib/site/rows";

export const metadata: Metadata = {
  title: "All AI Models: API Pricing & Specs",
  description: "Search and sort every tracked AI model by input price, output price, context window and 30-day price change.",
  alternates: { canonical: "/models" },
};

export default function ModelsPage() {
  const { models, meta } = getCatalog();
  const rows = modelRows([...models].sort((a, b) => a.blended - b.blended || a.id.localeCompare(b.id)));
  return (
    <>
      <Breadcrumbs items={[{ href: "/models", label: "models" }]} />
      <h1>All AI models: API pricing &amp; specs</h1>
      <p className="sub">{models.length} models · USD per 1M tokens · verified {meta?.lastSuccessAt.slice(0, 10) ?? "n/a"}</p>
      <Box title="models">
        <ModelTable rows={rows} searchable />
      </Box>
    </>
  );
}
```

- [ ] **Step 4: Create `src/app/providers/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog, labSummaries } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { providerUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "AI Model Providers: API Pricing by Lab",
  description: "Every AI lab we track, with model count and blended price range per million tokens.",
  alternates: { canonical: "/providers" },
};

export default function ProvidersPage() {
  const summaries = labSummaries(getCatalog().models);
  return (
    <>
      <Breadcrumbs items={[{ href: "/providers", label: "providers" }]} />
      <h1>AI model providers</h1>
      <p className="sub">Blended price = (3 × input + output) / 4, USD per 1M tokens.</p>
      <Box title="labs">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">lab</th><th scope="col">models</th><th scope="col">cheapest</th><th scope="col">most expensive</th></tr></thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.lab}>
                  <td><Link href={providerUrl(s.lab)}>{s.name}</Link></td>
                  <td>{s.models.length}</td>
                  <td>{fmtUsd(s.minBlended)}</td>
                  <td>{fmtUsd(s.maxBlended)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
```

- [ ] **Step 5: Create `src/app/providers/[lab]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EventFeed } from "@/components/event-feed";
import { ModelTable } from "@/components/model-table";
import { StatGrid } from "@/components/stat-grid";
import { getCatalog, labName, labSummaries, recentEvents } from "@/lib/site/catalog";
import { fmtUsd, monthYear } from "@/lib/site/format";
import { modelRows } from "@/lib/site/rows";
import { modelUrl, providerUrl } from "@/lib/site/urls";

type Params = { lab: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return labSummaries(getCatalog().models).map((s) => ({ lab: s.lab }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lab } = await params;
  const summary = labSummaries(getCatalog().models).find((s) => s.lab === lab);
  if (!summary) return {};
  return {
    title: `${summary.name} API Pricing: All ${summary.models.length} Models Compared (${monthYear(getCatalog().today)})`,
    description: `Every ${summary.name} model with input and output price per 1M tokens, context window and price history. Blended prices from ${fmtUsd(summary.minBlended)} to ${fmtUsd(summary.maxBlended)}.`,
    alternates: { canonical: providerUrl(lab) },
  };
}

export default async function ProviderPage({ params }: { params: Promise<Params> }) {
  const { lab } = await params;
  const { models, events } = getCatalog();
  const summary = labSummaries(models).find((s) => s.lab === lab);
  if (!summary) notFound();

  const all = models.filter((m) => m.lab === lab).sort((a, b) => a.blended - b.blended || a.id.localeCompare(b.id));
  const cheapest = summary.models.reduce((a, b) => (b.blended < a.blended ? b : a));
  const priciest = summary.models.reduce((a, b) => (b.blended > a.blended ? b : a));
  const releases = [...all].filter((m) => m.releaseDate).sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "")).slice(0, 15);

  return (
    <>
      <Breadcrumbs items={[{ href: "/providers", label: "providers" }, { href: providerUrl(lab), label: labName(lab) }]} />
      <h1>{summary.name} API pricing</h1>
      <p className="sub">{all.length} models tracked · USD per 1M tokens</p>
      <StatGrid
        stats={[
          { label: "active models", value: String(summary.models.length) },
          { label: "cheapest", value: fmtUsd(cheapest.blended), note: cheapest.name },
          { label: "most expensive", value: fmtUsd(priciest.blended), note: priciest.name },
          { label: "newest", value: releases[0]?.releaseDate ?? "n/a", note: releases[0]?.name },
        ]}
      />
      <Box title="models">
        <ModelTable rows={modelRows(all)} showLab={false} />
      </Box>
      <div className="grid-2">
        <Box title="release timeline">
          <ul className="feed">
            {releases.map((m) => <li key={m.id}><span className="dim">{m.releaseDate}</span> <Link href={modelUrl(m)}>{m.name}</Link></li>)}
          </ul>
        </Box>
        <Box title="recent changes">
          <EventFeed events={recentEvents(events.filter((e) => e.lab === lab), 20)} />
        </Box>
      </div>
    </>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npm run lint && npm test && npm run build
```

Expected: build OK, with `/providers/[lab]` prerendered for about 12 labs. In the browser pane check `/` (popular table, changes feed, rankings), `/models` (searching "haiku" filters, column headers sort), `/providers/anthropic`, desktop and mobile.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat(ui): home, model index and provider pages"
```

---

### Task 10: Comparison and ranking pages

**Files:**
- Create: `src/lib/site/verdict.ts`, `src/lib/site/verdict.test.ts`
- Create: `src/app/compare/page.tsx`, `src/app/compare/[pair]/page.tsx`, `src/app/best/page.tsx`, `src/app/best/[slug]/page.tsx`

**Interfaces:**
- Consumes: `comparisonPairs`, `type Pair`, `BEST_LISTS`, `findBestList`, `MIN_LIST_SIZE`, `SCENARIOS`, `monthlyCost`, `compareTitle`, `bestTitle`, `pct`, components
- Produces: `compareVerdict(a: Model, b: Model): string[]`

- [ ] **Step 1: Write the failing verdict test**

`src/lib/site/verdict.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import { compareVerdict } from "./verdict.ts";

test("verdict states price, context and capability differences", () => {
  const a = makeModel({
    id: "openai/a", name: "A", price: { input: 1, output: 1 }, context: 128_000, modalitiesIn: ["text", "image"],
    capabilities: { reasoning: true, toolCall: true, structuredOutput: false },
  });
  const b = makeModel({ id: "google/b", name: "B", price: { input: 4, output: 4 }, context: 1_000_000 });
  assert.deepEqual(compareVerdict(a, b), [
    "A is 75% cheaper than B on a blended 3:1 input/output basis.",
    "B has the larger context window (1M vs 128K tokens).",
    "Only A supports built-in reasoning.",
    "Only A accepts image input.",
  ]);
});

test("identical models get a single neutral line", () => {
  const a = makeModel({ id: "openai/a", name: "A" });
  const b = makeModel({ id: "google/b", name: "B" });
  assert.deepEqual(compareVerdict(a, b), ["A and B have the same blended price."]);
});
```

- [ ] **Step 2: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../verdict.ts'`.

- [ ] **Step 3: Implement `src/lib/site/verdict.ts`**

```ts
import { pct } from "../data/diff.ts";
import type { Model } from "../data/types.ts";
import { fmtTokens } from "./format.ts";

const CAPABILITIES = [
  ["reasoning", "built-in reasoning"],
  ["toolCall", "tool calling"],
  ["structuredOutput", "structured output"],
] as const;

export function compareVerdict(a: Model, b: Model): string[] {
  const lines: string[] = [];
  if (a.blended === b.blended) {
    lines.push(`${a.name} and ${b.name} have the same blended price.`);
  } else {
    const [cheap, dear] = a.blended < b.blended ? [a, b] : [b, a];
    lines.push(`${cheap.name} is ${Math.abs(pct(dear.blended, cheap.blended))}% cheaper than ${dear.name} on a blended 3:1 input/output basis.`);
  }
  if (a.context !== b.context) {
    const [big, small] = a.context > b.context ? [a, b] : [b, a];
    lines.push(`${big.name} has the larger context window (${fmtTokens(big.context)} vs ${fmtTokens(small.context)} tokens).`);
  }
  for (const [key, label] of CAPABILITIES) {
    if (a.capabilities[key] !== b.capabilities[key]) lines.push(`Only ${(a.capabilities[key] ? a : b).name} supports ${label}.`);
  }
  const aImage = a.modalitiesIn.includes("image");
  if (aImage !== b.modalitiesIn.includes("image")) lines.push(`Only ${(aImage ? a : b).name} accepts image input.`);
  return lines;
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 5: Create `src/app/compare/[pair]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Model } from "@/lib/data/types";
import { getCatalog, labName } from "@/lib/site/catalog";
import { SCENARIOS, monthlyCost } from "@/lib/site/cost";
import { fmtTokens, fmtUsd, fmtUsdCost, yesNo } from "@/lib/site/format";
import { compareTitle } from "@/lib/site/seo";
import { comparisonPairs, type Pair } from "@/lib/site/selection";
import { compareUrl, modelUrl, ogImageUrl } from "@/lib/site/urls";
import { compareVerdict } from "@/lib/site/verdict";

type Params = { pair: string };

export const dynamicParams = true;

export function generateStaticParams(): Params[] {
  const { models, today } = getCatalog();
  return comparisonPairs(models, today).map((p) => ({ pair: p.key }));
}

function resolvePair(key: string): { pair: Pair; all: Pair[] } | { redirectTo: string } | null {
  const { models, today } = getCatalog();
  const all = comparisonPairs(models, today);
  const pair = all.find((p) => p.key === key);
  if (pair) return { pair, all };
  const parts = key.split("-vs-");
  const reversed = parts.length === 2 ? `${parts[1]}-vs-${parts[0]}` : "";
  return all.some((p) => p.key === reversed) ? { redirectTo: compareUrl(reversed) } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolvePair((await params).pair);
  if (!r || "redirectTo" in r) return {};
  const { a, b, key } = r.pair;
  return {
    title: compareTitle(a, b, getCatalog().today),
    description: `${a.name} vs ${b.name}: ${fmtUsd(a.price.input)} vs ${fmtUsd(b.price.input)} per 1M input tokens, ${fmtTokens(a.context)} vs ${fmtTokens(b.context)} context. Side-by-side specs and monthly cost scenarios.`,
    alternates: { canonical: compareUrl(key) },
    openGraph: { images: [{ url: ogImageUrl(`${a.name} vs ${b.name}`, "price & specs compared"), width: 1200, height: 630 }] },
  };
}

type Row = { label: string; a: string; b: string; better?: "a" | "b" | null };

function lower(x: number, y: number): "a" | "b" | null {
  if (x === y) return null;
  return x < y ? "a" : "b";
}

function specRows(a: Model, b: Model): Row[] {
  return [
    { label: "input / 1M", a: fmtUsd(a.price.input), b: fmtUsd(b.price.input), better: lower(a.price.input, b.price.input) },
    { label: "output / 1M", a: fmtUsd(a.price.output), b: fmtUsd(b.price.output), better: lower(a.price.output, b.price.output) },
    { label: "blended (3:1)", a: fmtUsd(a.blended), b: fmtUsd(b.blended), better: lower(a.blended, b.blended) },
    { label: "cache read / 1M", a: a.price.cacheRead !== undefined ? fmtUsd(a.price.cacheRead) : "—", b: b.price.cacheRead !== undefined ? fmtUsd(b.price.cacheRead) : "—" },
    { label: "context", a: fmtTokens(a.context), b: fmtTokens(b.context), better: lower(b.context, a.context) },
    { label: "max output", a: fmtTokens(a.maxOutput), b: fmtTokens(b.maxOutput) },
    { label: "input types", a: a.modalitiesIn.join(" · "), b: b.modalitiesIn.join(" · ") },
    { label: "reasoning", a: yesNo(a.capabilities.reasoning), b: yesNo(b.capabilities.reasoning) },
    { label: "tool calling", a: yesNo(a.capabilities.toolCall), b: yesNo(b.capabilities.toolCall) },
    { label: "structured output", a: yesNo(a.capabilities.structuredOutput), b: yesNo(b.capabilities.structuredOutput) },
    { label: "open weights", a: yesNo(a.openWeights), b: yesNo(b.openWeights) },
    { label: "released", a: a.releaseDate ?? "n/a", b: b.releaseDate ?? "n/a" },
    { label: "knowledge cutoff", a: a.knowledgeCutoff ?? "n/a", b: b.knowledgeCutoff ?? "n/a" },
    { label: "lab", a: labName(a.lab), b: labName(b.lab) },
  ];
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const r = resolvePair((await params).pair);
  if (!r) notFound();
  if ("redirectTo" in r) permanentRedirect(r.redirectTo);
  const { a, b, key } = r.pair;
  const others = r.all.filter((p) => p.key !== key && (p.a.id === a.id || p.b.id === a.id || p.a.id === b.id || p.b.id === b.id)).slice(0, 8);

  return (
    <>
      <Breadcrumbs items={[{ href: "/compare", label: "compare" }, { href: compareUrl(key), label: `${a.name} vs ${b.name}` }]} />
      <h1>{a.name} vs {b.name}</h1>
      <p className="sub">Price and specs side by side · USD per 1M tokens · verified {getCatalog().today}</p>
      <Box title="side by side">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th scope="col">metric</th><th scope="col"><Link href={modelUrl(a)}>{a.name}</Link></th><th scope="col"><Link href={modelUrl(b)}>{b.name}</Link></th></tr>
            </thead>
            <tbody>
              {specRows(a, b).map((row) => (
                <tr key={row.label}>
                  <td className="muted">{row.label}</td>
                  <td className={row.better === "a" ? "dn" : undefined}>{row.a}</td>
                  <td className={row.better === "b" ? "dn" : undefined}>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="monthly cost scenarios">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">workload</th><th scope="col">tokens in / out</th><th scope="col">{a.name}</th><th scope="col">{b.name}</th></tr></thead>
            <tbody>
              {SCENARIOS.map((s) => {
                const ca = monthlyCost(a.price, s.inputTokens, s.outputTokens);
                const cb = monthlyCost(b.price, s.inputTokens, s.outputTokens);
                return (
                  <tr key={s.id}>
                    <td>{s.label}</td>
                    <td className="muted">{fmtTokens(s.inputTokens)} / {fmtTokens(s.outputTokens)}</td>
                    <td className={ca < cb ? "dn" : undefined}>{fmtUsdCost(ca)}</td>
                    <td className={cb < ca ? "dn" : undefined}>{fmtUsdCost(cb)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="verdict">
        <ul className="feed">{compareVerdict(a, b).map((line) => <li key={line}>{line}</li>)}</ul>
      </Box>
      <AdSlot />
      {others.length > 0 ? (
        <Box title="related comparisons">
          {others.map((p) => <Link key={p.key} className="btn" href={compareUrl(p.key)}>{p.a.name} vs {p.b.name}</Link>)}
        </Box>
      ) : null}
    </>
  );
}
```

- [ ] **Step 6: Create `src/app/compare/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { comparisonPairs } from "@/lib/site/selection";
import { compareUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "AI Model Comparisons: Price & Specs Side by Side",
  description: "Head-to-head comparisons of popular AI models: input and output prices, context windows, capabilities and monthly cost.",
  alternates: { canonical: "/compare" },
};

export default function CompareIndex() {
  const { models, today } = getCatalog();
  const pairs = [...comparisonPairs(models, today)].sort((p, q) => p.key.localeCompare(q.key));
  return (
    <>
      <Breadcrumbs items={[{ href: "/compare", label: "compare" }]} />
      <h1>AI model comparisons</h1>
      <p className="sub">{pairs.length} head-to-head pages · blended price = (3 × input + output) / 4</p>
      <Box title="comparisons">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">comparison</th><th scope="col">blended A</th><th scope="col">blended B</th></tr></thead>
            <tbody>
              {pairs.map((p) => (
                <tr key={p.key}>
                  <td><Link href={compareUrl(p.key)}>{p.a.name} vs {p.b.name}</Link></td>
                  <td>{fmtUsd(p.a.blended)}</td>
                  <td>{fmtUsd(p.b.blended)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
```

- [ ] **Step 7: Create `src/app/best/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog, labName } from "@/lib/site/catalog";
import { fmtTokens, fmtUsd } from "@/lib/site/format";
import { bestTitle } from "@/lib/site/seo";
import { BEST_LISTS, MIN_LIST_SIZE, findBestList } from "@/lib/site/selection";
import { bestUrl, modelUrl } from "@/lib/site/urls";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return BEST_LISTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const list = findBestList((await params).slug);
  if (!list) return {};
  const { models, today } = getCatalog();
  const entries = list.select(models, today);
  return {
    title: bestTitle(list, entries.length, today),
    description: `${list.description} Updated daily from list prices.`,
    alternates: { canonical: bestUrl(list.slug) },
    robots: entries.length >= MIN_LIST_SIZE ? undefined : { index: false, follow: true },
  };
}

export default async function BestPage({ params }: { params: Promise<Params> }) {
  const list = findBestList((await params).slug);
  if (!list) notFound();
  const { models, today } = getCatalog();
  const entries = list.select(models, today);
  const top = entries[0];

  return (
    <>
      <Breadcrumbs items={[{ href: "/best", label: "best" }, { href: bestUrl(list.slug), label: list.title }]} />
      <h1>{entries.length} {list.title}</h1>
      <p className="sub">{list.description} · verified {today}</p>
      {top ? (
        <p>
          #1 is <Link href={modelUrl(top)}>{top.name}</Link> at {fmtUsd(top.price.input)} input and {fmtUsd(top.price.output)} output per million tokens.
        </p>
      ) : null}
      <Box title="ranking">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">#</th><th scope="col">model</th><th scope="col">lab</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th><th scope="col">ctx</th></tr></thead>
            <tbody>
              {entries.map((m, i) => (
                <tr key={m.id}>
                  <td className="dim">{i + 1}</td>
                  <td><Link href={modelUrl(m)}>{m.name}</Link></td>
                  <td className="muted">{labName(m.lab)}</td>
                  <td>{fmtUsd(m.price.input)}</td>
                  <td>{fmtUsd(m.price.output)}</td>
                  <td>{fmtTokens(m.context)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <AdSlot />
      <Box title="other rankings">
        {BEST_LISTS.filter((l) => l.slug !== list.slug).map((l) => <Link key={l.slug} className="btn" href={bestUrl(l.slug)}>{l.title}</Link>)}
      </Box>
    </>
  );
}
```

- [ ] **Step 8: Create `src/app/best/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalog } from "@/lib/site/catalog";
import { fmtUsd } from "@/lib/site/format";
import { BEST_LISTS } from "@/lib/site/selection";
import { bestUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "Best AI Models by Price: Rankings Updated Daily",
  description: "Rankings of the cheapest AI models by capability: vision, reasoning, long context, open weights, tool calling and more.",
  alternates: { canonical: "/best" },
};

export default function BestIndex() {
  const { models, today } = getCatalog();
  return (
    <>
      <Breadcrumbs items={[{ href: "/best", label: "best" }]} />
      <h1>AI model rankings</h1>
      <p className="sub">Rule-based rankings from list prices · verified {today}</p>
      <Box title="rankings">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">ranking</th><th scope="col">models</th><th scope="col">#1</th><th scope="col">#1 blended</th></tr></thead>
            <tbody>
              {BEST_LISTS.map((l) => {
                const entries = l.select(models, today);
                return (
                  <tr key={l.slug}>
                    <td><Link href={bestUrl(l.slug)}>{l.title}</Link></td>
                    <td>{entries.length}</td>
                    <td className="muted">{entries[0]?.name ?? "—"}</td>
                    <td>{entries[0] ? fmtUsd(entries[0].blended) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
```

- [ ] **Step 9: Verify**

```bash
npm run lint && npm test && npm run build
```

Expected: build OK, `/compare/[pair]` prerendered for every pair. In the browser pane: open a comparison from `/compare` (cheaper cells green, verdict lines, related links). Then open the reversed URL (`/compare/<b>-vs-<a>`): it redirects to the canonical order. `/compare/foo-vs-bar` returns 404. Open `/best/cheapest-vision-model`.

- [ ] **Step 10: Commit**

```bash
git add src
git commit -m "feat(ui): comparison and ranking pages"
```

---

### Task 11: Calculator, changelog, about, newsletter page and OG images

**Files:**
- Create: `src/app/calculator/page.tsx`, `src/app/changes/page.tsx`, `src/app/about/page.tsx`, `src/app/newsletter/page.tsx`
- Modify: `src/app/api/og/route.tsx` (full rewrite)

**Interfaces:**
- Consumes: `CostCalculator`, `EventFeed`, `NewsletterForm`, `JsonLd`, `getCatalog`, `recentEvents`, `isActive`, `isIndexable`, `labSummaries`
- Produces: OG image endpoint `GET /api/og?title=&subtitle=` (1200×630, terminal style)

- [ ] **Step 1: Create `src/app/calculator/page.tsx`**

```tsx
import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CostCalculator } from "@/components/cost-calculator";
import { getCatalog } from "@/lib/site/catalog";
import { isActive, isIndexable } from "@/lib/site/selection";
import { modelUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "AI API Cost Calculator: Compare Monthly LLM Costs",
  description: "Enter your monthly input and output tokens and compare the cost of every tracked AI model API, cheapest first.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  const { models } = getCatalog();
  const rows = models
    .filter((m) => isActive(m) && isIndexable(m))
    .map((m) => ({ id: m.id, name: m.name, href: modelUrl(m), input: m.price.input, output: m.price.output }));
  return (
    <>
      <Breadcrumbs items={[{ href: "/calculator", label: "calculator" }]} />
      <h1>AI API cost calculator</h1>
      <p className="sub">Monthly cost at list price for {rows.length} models, cheapest first.</p>
      <Box title="cost calculator">
        <CostCalculator rows={rows} searchable />
      </Box>
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/changes/page.tsx`**

```tsx
import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EventFeed } from "@/components/event-feed";
import { getCatalog, recentEvents } from "@/lib/site/catalog";

export const metadata: Metadata = {
  title: "AI Model Price Changes & New Releases Log",
  description: "Every tracked AI model launch, price cut, price increase, context change and deprecation, newest first.",
  alternates: { canonical: "/changes" },
};

export default function ChangesPage() {
  const { events } = getCatalog();
  const latest = recentEvents(events, 300);
  return (
    <>
      <Breadcrumbs items={[{ href: "/changes", label: "changes" }]} />
      <h1>AI model changelog</h1>
      <p className="sub">{events.length} recorded changes · showing the latest {latest.length}</p>
      <Box title="changes">
        <EventFeed events={latest} />
      </Box>
    </>
  );
}
```

- [ ] **Step 3: Create `src/app/about/page.tsx`**

```tsx
import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getCatalog, labSummaries } from "@/lib/site/catalog";

export const metadata: Metadata = {
  title: "About AI Signals: Methodology & Data Sources",
  description: "How AI Signals collects, normalizes and verifies AI model prices every day, and how its articles are written.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { models, events, meta } = getCatalog();
  const base = getSiteUrl();
  return (
    <>
      <Breadcrumbs items={[{ href: "/about", label: "about" }]} />
      <h1>About AI Signals</h1>
      <div className="prose">
        <p>AI Signals tracks the list price, context window and capabilities of {models.length} AI models from {labSummaries(models).length} labs, refreshed every day at 06:00 UTC.</p>
        <h2>Data sources</h2>
        <p>Model data comes from <a href="https://models.dev" rel="noopener">models.dev</a>, an open-source database released under the MIT license (copyright the models.dev contributors). Prices of major labs are cross-checked daily against <a href="https://github.com/pydantic/genai-prices" rel="noopener">pydantic/genai-prices</a> (MIT).</p>
        <h2 id="data">Methodology</h2>
        <ul>
          <li>Prices are base-tier list prices in USD per million tokens.</li>
          <li>The reference price is the lab&apos;s own API. Open-weights models without a first-party API use the cheapest tracked host.</li>
          <li>Blended price = (3 × input + output) / 4, a common way to compare models on a typical 3:1 input/output mix.</li>
          <li>Price history is built from our daily snapshots and, before launch, from the public git history of models.dev (since June 2025).</li>
          <li>A refresh is rejected automatically if the source looks broken (sudden model loss, absurd prices, mass changes).</li>
        </ul>
        <h2>How articles are written</h2>
        <p>News articles and the weekly digest are generated automatically from our own data. An AI model (GPT-6.1 Sol) writes the text, and every number it uses is checked against the data before publication. If the check fails, a plain data template is published instead.</p>
        <h2>Corrections</h2>
        <p>Spotted a wrong price? Email <a href="mailto:hello@aisignals.dev">hello@aisignals.dev</a>, or contribute the fix upstream to models.dev.</p>
      </div>
      <Box title="dataset">
        <p className="muted">{models.length} models · {events.length} recorded changes · last refresh {meta?.lastSuccessAt ?? "n/a"}</p>
      </Box>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "AI model API prices and specs",
          description: "Daily list prices (USD per 1M tokens), context windows and capabilities of AI model APIs, with price history.",
          url: `${base}/about#data`,
          isBasedOn: "https://models.dev",
          creator: { "@type": "Organization", name: "AI Signals", url: base },
          dateModified: meta?.lastSuccessAt,
          variableMeasured: ["input price per 1M tokens", "output price per 1M tokens", "context window"],
        }}
      />
    </>
  );
}
```

- [ ] **Step 4: Create `src/app/newsletter/page.tsx`**

```tsx
import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Weekly AI Model Pricing Digest",
  description: "One email every Monday: new AI models, price cuts, price increases and deprecations, straight from our daily data.",
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/newsletter", label: "newsletter" }]} />
      <h1>The weekly AI pricing digest</h1>
      <div className="prose">
        <p>Every Monday you get one short email with what changed in AI model pricing last week:</p>
        <ul>
          <li>new models and their launch prices,</li>
          <li>price cuts and increases, with the percentage,</li>
          <li>context window changes and deprecations.</li>
        </ul>
        <p>No fluff, no sponsored picks. Unsubscribe in one click.</p>
      </div>
      <Box title="subscribe">
        <NewsletterForm source="newsletter-page" />
      </Box>
    </>
  );
}
```

- [ ] **Step 5: Rewrite `src/app/api/og/route.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

function clamp(value: string | null, max: number, fallback: string): string {
  const v = String(value ?? "").trim() || fallback;
  return v.length <= max ? v : `${v.slice(0, max - 1).trimEnd()}…`;
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const title = clamp(url.searchParams.get("title"), 90, "AI Signals");
  const subtitle = clamp(url.searchParams.get("subtitle"), 120, "Every AI model's price, tracked daily.");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0e0b", color: "#c8f5d8", padding: 64 }}>
        <div style={{ display: "flex", color: "#22c55e", fontSize: 32, fontWeight: 700 }}>&gt; ai_signals_</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 60, color: "#e9fff1", fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#7ea58c", marginTop: 20 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#4f6e5a", borderTop: "2px solid #1d2a21", paddingTop: 20 }}>aisignals.dev · prices updated daily</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

- [ ] **Step 6: Verify**

```bash
npm run lint && npm test && npm run build
npm start -- -p 3100 & sleep 4
curl -s -o /tmp/og.png -w "%{http_code} %{content_type}\n" "http://localhost:3100/api/og?title=Claude%20Haiku%205.5&subtitle=test"
kill %1
```

Expected: `200 image/png`. In the browser pane: `/calculator` (type `abc` in a field and check costs show `$0.00`), `/changes`, `/about`, `/newsletter` (two forms on the page, footer and body, with distinct ids). Open `/tmp/og.png` to check the image.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat(ui): calculator, changelog, about, newsletter pages and terminal OG images"
```

### Task 12: Editorial core: click score, fact sheet, grounding guards, template article

**Files:**
- Create: `src/lib/editorial/score.ts`, `src/lib/editorial/factsheet.ts`, `src/lib/editorial/guards.ts`, `src/lib/editorial/template.ts`
- Test: `src/lib/editorial/score.test.ts`, `src/lib/editorial/guards.test.ts`, `src/lib/editorial/template.test.ts`

**Interfaces:**
- Consumes: `TIER1_LABS`, `LAB_NAMES`, `isLabId`, `daysBetween`, `isoWeek`, `pct`, `versionOf`, `priceBand`, `alternatives`, `nearestCompetitors`, `SCENARIOS`, `monthlyCost`, `modelUrl`, formatters, `makeModel`
- Produces:
  - `score.ts`: `FLASH_THRESHOLD = 60`, `MAX_FLASH_PER_WEEK = 4`, `type Rival`, `type ScoredEvent = { event; score; reasons: string[]; eligible; rival: Rival | null }`, `scoreEvent(event, models, today)`, `pickFlashEvent(scored, publishedDates, today): ScoredEvent | null`
  - `factsheet.ts`: `type FactModel`, `type FactSheet`, `buildFactSheet(scored, models): FactSheet`
  - `guards.ts`: `extractNumbers(text)`, `allowedNumbers(facts)`, `checkGrounding(text, facts): { ok; unknown: number[] }`, `pickTitle(titles, facts): string | null`
  - `template.ts`: `type Article = { title; description; body }`, `renderTemplateArticle(facts): Article`, `articleSlug(event): string`

- [ ] **Step 1: Write the failing score tests**

`src/lib/editorial/score.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import type { ModelEvent } from "../data/types.ts";
import { pickFlashEvent, scoreEvent } from "./score.ts";

const TODAY = "2026-10-11";
const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", family: "claude-haiku", releaseDate: "2026-10-07", price: { input: 0.1, output: 0.5 } }),
  makeModel({ id: "anthropic/claude-haiku-5-mini", name: "Claude Haiku 5 Mini", family: "claude-haiku", releaseDate: "2026-10-08", price: { input: 0.8, output: 4 } }),
  makeModel({ id: "anthropic/claude-haiku-4-5", name: "Claude Haiku 4.5", family: "claude-haiku", releaseDate: "2025-10-15", price: { input: 1, output: 5 } }),
  makeModel({ id: "google/gemini-3-8-flash-lite", name: "Gemini 3.8 Flash Lite", family: "gemini-flash", releaseDate: "2026-09-01", price: { input: 0.25, output: 1 } }),
  makeModel({ id: "openai/gpt-4o-mini", name: "GPT-4o mini", releaseDate: "2024-07-18", price: { input: 0.15, output: 0.6 } }),
  makeModel({ id: "zhipuai/glm-5", name: "GLM-5", family: "glm", releaseDate: "2026-10-01", price: { input: 1, output: 3.2 } }),
  makeModel({ id: "anthropic/claude-haiku-5-5-20261007", name: "snapshot", releaseDate: "2026-10-07" }),
  makeModel({ id: "xai/grok-6", name: "Grok 6", status: "beta", releaseDate: "2026-10-10" }),
];
const snap = (input: number, output: number, context = 128_000) => ({ input, output, blended: (3 * input + output) / 4, context });
const ev = (id: string, type: ModelEvent["type"], extra: Partial<ModelEvent> = {}): ModelEvent => {
  const [lab, slug] = id.split("/");
  return { date: TODAY, id, lab, slug, name: slug, type, ...extra };
};

test("new generation from a tier-1 lab that undercuts a rival is eligible", () => {
  const s = scoreEvent(ev("anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5) }), models, TODAY);
  assert.equal(s.score, 85);
  assert.equal(s.eligible, true);
  assert.equal(s.rival?.name, "Gemini 3.8 Flash Lite");
});

test("a new variant from a tier-1 lab alone is not enough", () => {
  const s = scoreEvent(ev("anthropic/claude-haiku-5-mini", "new_model", { after: snap(0.8, 4) }), models, TODAY);
  assert.equal(s.score, 55);
  assert.equal(s.eligible, false);
});

test("price changes: thresholds and tiers", () => {
  const cut20 = scoreEvent(ev("anthropic/claude-haiku-4-5", "price_change", { before: snap(1.25, 6.25), after: snap(1, 5), pctChange: -20 }), models, TODAY);
  assert.equal(cut20.score, 60);
  assert.equal(cut20.eligible, true);
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "price_change", { pctChange: -8, after: snap(1, 5) }), models, TODAY).eligible, false);
  assert.equal(scoreEvent(ev("zhipuai/glm-5", "price_change", { pctChange: -25, after: snap(1, 3.2) }), models, TODAY).score, 35);
});

test("context changes need at least 2x", () => {
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "context_change", { before: snap(1, 5, 200_000), after: snap(1, 5, 400_000) }), models, TODAY).score, 50);
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "context_change", { before: snap(1, 5, 200_000), after: snap(1, 5, 300_000) }), models, TODAY).eligible, false);
});

test("re-listed old model is not eligible", () => {
  const s = scoreEvent(ev("openai/gpt-4o-mini", "new_model", { after: snap(0.15, 0.6) }), models, TODAY);
  assert.equal(s.eligible, false);
  assert.deepEqual(s.reasons, ["re-listed old model"]);
});

test("snapshots, beta models and removals are never flash news", () => {
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-5-5-20261007", "new_model", { after: snap(1, 2) }), models, TODAY).eligible, false);
  assert.equal(scoreEvent(ev("xai/grok-6", "new_model", { after: snap(1, 2) }), models, TODAY).eligible, false);
  assert.equal(scoreEvent(ev("anthropic/claude-haiku-4-5", "removed"), models, TODAY).eligible, false);
});

test("pickFlashEvent enforces 1 per day and 4 per ISO week", () => {
  const best = scoreEvent(ev("anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5) }), models, TODAY);
  const other = scoreEvent(ev("anthropic/claude-haiku-4-5", "price_change", { before: snap(1.25, 6.25), after: snap(1, 5), pctChange: -20 }), models, TODAY);
  assert.equal(pickFlashEvent([other, best], [], TODAY)?.event.id, "anthropic/claude-haiku-5-5");
  assert.equal(pickFlashEvent([best], [TODAY], TODAY), null);
  assert.equal(pickFlashEvent([best], ["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"], TODAY), null);
  assert.equal(pickFlashEvent([best], ["2026-10-02", "2026-10-03", "2026-10-04"], TODAY)?.score, 85);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../editorial/score.ts'`.

- [ ] **Step 3: Implement `src/lib/editorial/score.ts`**

```ts
import { TIER1_LABS } from "../data/config.ts";
import { daysBetween, isoWeek } from "../data/dates.ts";
import type { Model, ModelEvent } from "../data/types.ts";
import { priceBand, versionOf } from "../site/selection.ts";

export const FLASH_THRESHOLD = 60;
export const MAX_FLASH_PER_WEEK = 4;
const RELIST_MAX_AGE_DAYS = 60;
const SNAPSHOT = /-(\d{8}|\d{4}-\d{2}-\d{2}|\d{4})$/u;
const VARIANT = /(^|-)(free|exp|experimental|preview|batch)($|-)/u;

export type Rival = { id: string; name: string; lab: string; slug: string; blended: number };
export type ScoredEvent = { event: ModelEvent; score: number; reasons: string[]; eligible: boolean; rival: Rival | null };

const rejected = (event: ModelEvent, reason: string): ScoredEvent => ({ event, score: 0, reasons: [reason], eligible: false, rival: null });

/** Most recent tier-1 model from another lab, same price band, more expensive than `blended`. */
function findRival(model: Model, blended: number, models: Model[]): Rival | null {
  const r = models
    .filter(
      (m) =>
        m.lab !== model.lab && TIER1_LABS.has(m.lab) && m.status === "active" &&
        m.capabilities.toolCall === model.capabilities.toolCall &&
        priceBand(m.blended) === priceBand(blended) && m.blended > blended,
    )
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") || a.blended - b.blended || a.id.localeCompare(b.id))[0];
  return r ? { id: r.id, name: r.name, lab: r.lab, slug: r.slug, blended: r.blended } : null;
}

export function scoreEvent(event: ModelEvent, models: Model[], today: string): ScoredEvent {
  if (event.type === "removed") return rejected(event, "removals are digest-only");
  const model = models.find((m) => m.id === event.id);
  if (!model) return rejected(event, "model not in catalog");
  if (model.status === "beta") return rejected(event, "beta model");
  if (SNAPSHOT.test(model.slug) || VARIANT.test(model.slug)) return rejected(event, "snapshot or variant");

  const tier1 = TIER1_LABS.has(model.lab);
  let score = tier1 ? 40 : 15;
  const reasons = [tier1 ? "tier-1 lab +40" : "tier-2 lab +15"];

  if (event.type === "new_model") {
    if (model.releaseDate && daysBetween(model.releaseDate, today) > RELIST_MAX_AGE_DAYS) return rejected(event, "re-listed old model");
    const siblings = models.filter((m) => m.id !== model.id && m.lab === model.lab && model.family !== null && m.family === model.family);
    const version = versionOf(model.slug);
    const siblingMax = Math.max(Number.NEGATIVE_INFINITY, ...siblings.map((s) => versionOf(s.slug) ?? Number.NEGATIVE_INFINITY));
    if (siblings.length === 0 || (version !== null && version > siblingMax)) {
      score += 30;
      reasons.push("new generation +30");
    } else {
      score += 15;
      reasons.push("new variant +15");
    }
  } else if (event.type === "price_change") {
    const change = Math.abs(event.pctChange ?? 0);
    if (change < 10) return rejected(event, "price change under 10%");
    const points = change >= 50 ? 30 : change >= 20 ? 20 : 10;
    score += points;
    reasons.push(`price change ${change}% +${points}`);
  } else if (event.type === "context_change") {
    if (!event.before || !event.after || event.after.context < event.before.context * 2) return rejected(event, "context change under 2x");
    score += 10;
    reasons.push("context x2 +10");
  }

  let rival: Rival | null = null;
  const isCut = event.type === "price_change" && (event.pctChange ?? 0) < 0;
  if ((event.type === "new_model" || isCut) && event.after) {
    rival = findRival(model, event.after.blended, models);
    if (rival) {
      score += 15;
      reasons.push(`undercuts ${rival.name} +15`);
    }
  }
  return { event, score, reasons, eligible: score >= FLASH_THRESHOLD, rival };
}

export function pickFlashEvent(scored: ScoredEvent[], publishedDates: string[], today: string): ScoredEvent | null {
  if (publishedDates.includes(today)) return null;
  const week = isoWeek(today);
  if (publishedDates.filter((d) => isoWeek(d) === week).length >= MAX_FLASH_PER_WEEK) return null;
  return scored.filter((s) => s.eligible).sort((a, b) => b.score - a.score || a.event.id.localeCompare(b.event.id))[0] ?? null;
}
```

- [ ] **Step 4: Run the score tests and verify they pass**

Run: `npm test`
Expected: score tests pass. Check the 85: tier-1 40 + new generation 30 (5.5 > 5 and 4.5) + rival 15 (Gemini Flash Lite blended 0.4375 > 0.2, same band < 0.5).

- [ ] **Step 5: Write the failing guards and template tests**

`src/lib/editorial/guards.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { checkGrounding, extractNumbers, pickTitle } from "./guards.ts";
import type { FactSheet } from "./factsheet.ts";

const facts = {
  eventType: "price_change", date: "2026-10-09",
  model: { name: "Claude Haiku 5.5", lab: "Anthropic", url: "/models/anthropic/claude-haiku-5-5", input: 0.1, output: 0.5, blended: 0.2, context: 1_000_000, maxOutput: 128_000, releaseDate: "2026-10-07", openWeights: false, reasoning: true, toolCall: true, vision: true, diffPctVsSubject: 0, subjectVsThisPct: 0 },
  before: { input: 0.125, output: 0.625, blended: 0.25, context: 1_000_000 }, pctChange: -20,
  rival: { name: "Gemini 3.8 Flash Lite", url: "/models/google/gemini-3-8-flash-lite", blended: 0.4375, diffPctVsSubject: 118.8, subjectVsThisPct: -54.3 },
  competitors: [], scenarios: [{ label: "Chatbot", inputTokensM: 10, outputTokensM: 2, cost: 2, competitorCosts: [] }],
  isCheapestInClass: false,
} as unknown as FactSheet;

test("extractNumbers reads prices, percents, token counts and dates", () => {
  assert.deepEqual(extractNumbers("Costs $1,234.50 and 20% (10M/2M) on 2026-10-07"), [1234.5, 20, 10, 2, 2026, 10, 7]);
});

test("checkGrounding accepts numbers from the facts and rejects invented ones", () => {
  assert.deepEqual(checkGrounding("Claude Haiku 5.5 now costs $0.10 / $0.50, 54% cheaper than rivals, 1M context, from $0.13 before.", facts), { ok: true, unknown: [] });
  assert.deepEqual(checkGrounding("It scores 87.5 on MMLU and costs $0.10.", facts), { ok: false, unknown: [87.5] });
});

test("pickTitle filters hype, invented numbers, missing names and false superlatives", () => {
  const titles = [
    "Claude Haiku 5.5 Is INSANE!",
    "Anthropic cuts prices again",
    "Claude Haiku 5.5 Drops 35% Overnight",
    "Claude Haiku 5.5 Becomes the Cheapest Model Around",
    "Claude Haiku 5.5 Price Cut: 20% Lower",
    "Claude Haiku 5.5 Cuts Prices 20%, Now Cheaper Than Gemini 3.8 Flash Lite",
  ];
  assert.equal(pickTitle(titles, facts), "Claude Haiku 5.5 Cuts Prices 20%, Now Cheaper Than Gemini 3.8 Flash Lite");
  assert.equal(pickTitle(["nothing usable!"], facts), null);
});
```

`src/lib/editorial/template.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { makeModel } from "../data/testing.ts";
import type { ModelEvent } from "../data/types.ts";
import { buildFactSheet } from "./factsheet.ts";
import { checkGrounding } from "./guards.ts";
import { scoreEvent } from "./score.ts";
import { articleSlug, renderTemplateArticle } from "./template.ts";

const TODAY = "2026-10-11";
const vision = { modalitiesIn: ["text", "image"] };
const models = [
  makeModel({ id: "anthropic/claude-haiku-5-5", name: "Claude Haiku 5.5", family: "claude-haiku", releaseDate: "2026-10-07", price: { input: 0.1, output: 0.5 }, context: 1_000_000, ...vision }),
  makeModel({ id: "google/gemini-3-8-flash-lite", name: "Gemini 3.8 Flash Lite", releaseDate: "2026-09-01", price: { input: 0.25, output: 1 }, context: 1_048_576, ...vision }),
  makeModel({ id: "openai/gpt-6-1-mini", name: "GPT-6.1 Mini", releaseDate: "2026-09-29", price: { input: 0.0375, output: 0.3 }, context: 400_000, ...vision }),
  makeModel({ id: "meta/llama-5-scout", name: "Llama 5 Scout", releaseDate: "2026-06-01", price: { input: 0.12, output: 0.4 }, context: 262_144, openWeights: true }),
];
const snap = (input: number, output: number, context = 1_000_000) => ({ input, output, blended: (3 * input + output) / 4, context });
const head = { id: "anthropic/claude-haiku-5-5", lab: "anthropic", slug: "claude-haiku-5-5", name: "Claude Haiku 5.5" };

const cases: ModelEvent[] = [
  { ...head, date: TODAY, type: "new_model", after: snap(0.1, 0.5) },
  { ...head, date: TODAY, type: "price_change", before: snap(0.125, 0.625), after: snap(0.1, 0.5), pctChange: -20 },
  { ...head, date: TODAY, type: "context_change", before: snap(0.1, 0.5, 200_000), after: snap(0.1, 0.5) },
];

for (const event of cases) {
  test(`template article for ${event.type} is fully grounded`, () => {
    const facts = buildFactSheet(scoreEvent(event, models, TODAY), models);
    const article = renderTemplateArticle(facts);
    assert.ok(article.title.includes("Claude Haiku 5.5"));
    assert.match(article.body, /## What it costs in practice/u);
    assert.match(article.body, /\| Chatbot \| 10M \/ 2M \|/u);
    assert.deepEqual(checkGrounding(`${article.title}\n${article.body}\n${article.description}`, facts), { ok: true, unknown: [] });
  });
}

test("articleSlug is stable and URL-safe", () => {
  assert.equal(articleSlug(cases[1]), "2026-10-11-claude-haiku-5-5-price-cut");
  assert.equal(articleSlug({ ...cases[0], slug: "gpt-6.1-sol" }), "2026-10-11-gpt-6-1-sol-pricing");
});
```

- [ ] **Step 6: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../guards.ts'` (and for factsheet/template).

- [ ] **Step 7: Implement `src/lib/editorial/factsheet.ts`**

```ts
import { LAB_NAMES, isLabId } from "../data/config.ts";
import { pct } from "../data/diff.ts";
import type { EventType, Model, PriceSnapshot } from "../data/types.ts";
import { SCENARIOS, monthlyCost } from "../site/cost.ts";
import { alternatives, nearestCompetitors } from "../site/selection.ts";
import { modelUrl } from "../site/urls.ts";
import type { ScoredEvent } from "./score.ts";

export type FactModel = {
  name: string; lab: string; url: string;
  input: number; output: number; blended: number; context: number; maxOutput: number | null;
  releaseDate: string | null; openWeights: boolean; reasoning: boolean; toolCall: boolean; vision: boolean;
  /** This model vs the subject, in % of blended price (positive = more expensive). */
  diffPctVsSubject: number;
  /** The subject vs this model, in % (negative = the subject is cheaper). */
  subjectVsThisPct: number;
};

export type FactSheet = {
  eventType: EventType;
  date: string;
  model: FactModel;
  before: PriceSnapshot | null;
  pctChange: number | null;
  rival: { name: string; url: string; blended: number; diffPctVsSubject: number; subjectVsThisPct: number } | null;
  competitors: FactModel[];
  scenarios: { label: string; inputTokensM: number; outputTokensM: number; cost: number; competitorCosts: { name: string; cost: number }[] }[];
  isCheapestInClass: boolean;
};

function factModel(m: Model, subject: Model): FactModel {
  return {
    name: m.name, lab: isLabId(m.lab) ? LAB_NAMES[m.lab] : m.lab, url: modelUrl(m),
    input: m.price.input, output: m.price.output, blended: m.blended, context: m.context, maxOutput: m.maxOutput,
    releaseDate: m.releaseDate, openWeights: m.openWeights, reasoning: m.capabilities.reasoning,
    toolCall: m.capabilities.toolCall, vision: m.modalitiesIn.includes("image"),
    diffPctVsSubject: pct(subject.blended, m.blended), subjectVsThisPct: pct(m.blended, subject.blended),
  };
}

/** Every number an article may use. The LLM never sees anything else. */
export function buildFactSheet(scored: ScoredEvent, models: Model[]): FactSheet {
  const { event, rival } = scored;
  const model = models.find((m) => m.id === event.id);
  if (!model) throw new Error(`model ${event.id} is not in the catalog`);
  const competitors = nearestCompetitors(model, models, 3);
  const cheaper = alternatives(model, models, 1)[0];
  return {
    eventType: event.type,
    date: event.date,
    model: factModel(model, model),
    before: event.before ?? null,
    pctChange: event.pctChange ?? null,
    rival: rival
      ? { name: rival.name, url: modelUrl(rival), blended: rival.blended, diffPctVsSubject: pct(model.blended, rival.blended), subjectVsThisPct: pct(rival.blended, model.blended) }
      : null,
    competitors: competitors.map((c) => factModel(c, model)),
    scenarios: SCENARIOS.map((s) => ({
      label: s.label,
      inputTokensM: s.inputTokens / 1_000_000,
      outputTokensM: s.outputTokens / 1_000_000,
      cost: monthlyCost(model.price, s.inputTokens, s.outputTokens),
      competitorCosts: competitors.map((c) => ({ name: c.name, cost: monthlyCost(c.price, s.inputTokens, s.outputTokens) })),
    })),
    isCheapestInClass: !cheaper || cheaper.blended >= model.blended,
  };
}
```

- [ ] **Step 8: Implement `src/lib/editorial/guards.ts`**

```ts
import type { FactSheet } from "./factsheet.ts";

const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/gu;
const BANNED = /you won'?t believe|shocking|insane|mind[- ]?blowing|game[- ]?changer|jaw[- ]?dropping|!|\?\?/iu;

export function extractNumbers(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(NUMBER_RE)) {
    const n = Number(m[0].replace(/,/gu, ""));
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

function walk(value: unknown, onNumber: (n: number) => void, onString: (s: string) => void): void {
  if (typeof value === "number") onNumber(value);
  else if (typeof value === "string") onString(value);
  else if (Array.isArray(value)) value.forEach((v) => walk(v, onNumber, onString));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => walk(v, onNumber, onString));
}

const roundTo = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Numbers of the fact sheet with their usual display forms (M/K units, rounding). */
export function allowedNumbers(facts: unknown): number[] {
  const set = new Set<number>();
  walk(
    facts,
    (n) => {
      const a = Math.abs(n);
      for (const v of [a, a / 1_000_000, a / 1_000]) {
        set.add(v);
        set.add(roundTo(v, 2));
        set.add(roundTo(v, 1));
        set.add(Math.round(v));
      }
    },
    (s) => extractNumbers(s).forEach((n) => set.add(n)),
  );
  return [...set];
}

/** Every number in `text` must exist in the facts (0.5% tolerance). Integers up to 10 are always allowed. */
export function checkGrounding(text: string, facts: unknown): { ok: boolean; unknown: number[] } {
  const allowed = allowedNumbers(facts);
  const unknown = new Set<number>();
  for (const n of extractNumbers(text)) {
    if (Number.isInteger(n) && n <= 10) continue;
    if (!allowed.some((a) => a === n || Math.abs(a - n) <= Math.abs(a) * 0.005)) unknown.add(n);
  }
  return { ok: unknown.size === 0, unknown: [...unknown] };
}

export function pickTitle(titles: string[], facts: FactSheet): string | null {
  const name = facts.model.name.toLowerCase();
  const valid = titles
    .map((t) => t.trim().replace(/^["']|["']$/gu, ""))
    .filter(
      (t) =>
        t.length >= 20 && t.length <= 90 && !BANNED.test(t) && t.toLowerCase().includes(name) &&
        checkGrounding(t, facts).ok && (!/\bcheapest\b/iu.test(t) || facts.isCheapestInClass),
    );
  const score = (t: string) => (/\d/u.test(t) ? 2 : 0) + (/\b(vs\.?|than|undercuts|beats)\b/iu.test(t) ? 2 : 0) + (/[$%]/u.test(t) ? 1 : 0);
  return valid.map((t, i) => ({ t, s: score(t), i })).sort((a, b) => b.s - a.s || a.i - b.i)[0]?.t ?? null;
}
```

- [ ] **Step 9: Implement `src/lib/editorial/template.ts`**

```ts
import type { ModelEvent } from "../data/types.ts";
import { fmtPct, fmtTokens, fmtUsd, fmtUsdCost } from "../site/format.ts";
import type { FactSheet } from "./factsheet.ts";

export type Article = { title: string; description: string; body: string };

export function articleSlug(e: ModelEvent): string {
  const kind =
    e.type === "new_model" ? "pricing"
      : e.type === "price_change" ? ((e.pctChange ?? 0) < 0 ? "price-cut" : "price-increase")
        : e.type === "context_change" ? "context-window" : "deprecated";
  return `${e.date}-${e.slug}-${kind}`.replace(/\./gu, "-");
}

function headline(f: FactSheet): string {
  const m = f.model;
  const p = Math.abs(f.pctChange ?? 0);
  switch (f.eventType) {
    case "price_change":
      return (f.pctChange ?? 0) < 0
        ? `${m.name} Price Cut: ${p}% Lower, Now ${fmtUsd(m.input)} / ${fmtUsd(m.output)} per 1M Tokens`
        : `${m.name} Price Increase: Up ${p}% to ${fmtUsd(m.input)} / ${fmtUsd(m.output)} per 1M Tokens`;
    case "context_change":
      return `${m.name} Context Window Grows to ${fmtTokens(m.context)} Tokens`;
    case "deprecated":
      return `${m.name} Is Deprecated: Pricing and Cheapest Alternatives`;
    default:
      return `${m.name} Pricing: ${fmtUsd(m.input)} Input, ${fmtUsd(m.output)} Output per 1M Tokens`;
  }
}

function intro(f: FactSheet): string {
  const m = f.model;
  switch (f.eventType) {
    case "new_model":
      return `${m.lab} released ${m.name}${m.releaseDate ? ` on ${m.releaseDate}` : ""}. It costs ${fmtUsd(m.input)} per million input tokens and ${fmtUsd(m.output)} per million output tokens, with a ${fmtTokens(m.context)}-token context window.`;
    case "price_change":
      return f.before
        ? `${m.lab} changed the price of ${m.name} on ${f.date}: input goes from ${fmtUsd(f.before.input)} to ${fmtUsd(m.input)} and output from ${fmtUsd(f.before.output)} to ${fmtUsd(m.output)} per million tokens, a ${fmtPct(f.pctChange ?? 0)} change in blended price.`
        : `${m.lab} changed the price of ${m.name} on ${f.date}. It now costs ${fmtUsd(m.input)} input and ${fmtUsd(m.output)} output per million tokens.`;
    case "context_change":
      return `${m.name} now accepts ${fmtTokens(m.context)} tokens of context${f.before ? `, up from ${fmtTokens(f.before.context)}` : ""}. Pricing stays at ${fmtUsd(m.input)} input and ${fmtUsd(m.output)} output per million tokens.`;
    default:
      return `${m.lab} marked ${m.name} as deprecated. It still lists at ${fmtUsd(m.input)} input and ${fmtUsd(m.output)} output per million tokens, so plan a migration.`;
  }
}

function whoShouldCare(f: FactSheet): string[] {
  const m = f.model;
  const out: string[] = [];
  if (m.toolCall) out.push("- Teams building agents and tool-using workflows.");
  if (m.vision) out.push("- Products that read screenshots, documents or photos.");
  if (m.reasoning) out.push("- Workloads that need step-by-step reasoning.");
  if (m.openWeights) out.push("- Teams that want open weights and a choice of hosts.");
  if (f.isCheapestInClass) out.push("- Cost-sensitive teams: it is the cheapest compatible option we track.");
  if (out.length === 0) out.push("- Teams already running this model or its predecessors.");
  return out;
}

const row = (cells: string[]) => `| ${cells.join(" | ")} |`;

/** Deterministic, number-safe article used when the LLM is unavailable or fails grounding. */
export function renderTemplateArticle(f: FactSheet): Article {
  const m = f.model;
  const lines: string[] = [intro(f)];
  if (f.rival) {
    lines.push("", `That makes it cheaper than [${f.rival.name}](${f.rival.url}) on a blended basis: ${fmtUsd(m.blended)} vs ${fmtUsd(f.rival.blended)} per million tokens.`);
  }
  lines.push("", "## What changed", "", row(["", "Input / 1M", "Output / 1M", "Context"]), row(["---", "---", "---", "---"]));
  if (f.before) lines.push(row(["Before", fmtUsd(f.before.input), fmtUsd(f.before.output), fmtTokens(f.before.context)]));
  lines.push(row([f.before ? "Now" : "Launch", fmtUsd(m.input), fmtUsd(m.output), fmtTokens(m.context)]));

  lines.push("", "## What it costs in practice", "", "Monthly cost at list price (base tier):", "");
  lines.push(row(["Workload", "Tokens in / out", m.name, ...f.competitors.map((c) => c.name)]));
  lines.push(row(["---", "---", "---", ...f.competitors.map(() => "---")]));
  for (const s of f.scenarios) {
    lines.push(row([s.label, `${s.inputTokensM}M / ${s.outputTokensM}M`, fmtUsdCost(s.cost), ...s.competitorCosts.map((c) => fmtUsdCost(c.cost))]));
  }

  if (f.competitors.length > 0) {
    lines.push("", "## How it compares", "", row(["Model", "Input / 1M", "Output / 1M", "Context", `vs ${m.name}`]), row(["---", "---", "---", "---", "---"]));
    for (const c of f.competitors) {
      lines.push(row([`[${c.name}](${c.url})`, fmtUsd(c.input), fmtUsd(c.output), fmtTokens(c.context), fmtPct(c.diffPctVsSubject)]));
    }
  }

  lines.push("", "## Who should care", "", ...whoShouldCare(f), "", `[Full ${m.name} pricing, history and cost calculator](${m.url})`);
  const first = intro(f);
  return { title: headline(f), description: first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first, body: lines.join("\n") };
}
```

- [ ] **Step 10: Run all tests and verify they pass**

Run: `npm test`
Expected: `fail 0`. If a template test reports an `unknown` number, the template printed a value that is not in the fact sheet: fix the template, never the guard.

- [ ] **Step 11: Commit**

```bash
git add src/lib/editorial
git commit -m "feat(editorial): click score, fact sheet, grounding guards and template articles"
```

---

### Task 13: Articles on the site, RSS, and the daily editorial script (gpt-6.1-sol)

**Files:**
- Create: `src/lib/site/articles.ts`, `src/lib/site/articles.test.ts`
- Modify: `src/lib/site/seo.ts` (add `xmlEscape`, `buildRss`), `src/lib/site/seo.test.ts`
- Create: `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`, `src/app/rss.xml/route.ts`
- Create: `scripts/editorial/openai.ts`, `scripts/editorial/prompts.ts`, `scripts/editorial/run.ts`
- Modify: `package.json` (script `editorial`), `.env.example` (`OPENAI_MODEL=gpt-6.1-sol`)

**Interfaces:**
- Consumes: everything from Task 12, store readers, `addDays`
- Produces:
  - `articles.ts`: `type ArticleKind = "flash" | "digest"`, `type ArticleFile = { slug; title; description; date; kind; modelId: string | null; body }`, `NEWS_DIR`, `listArticles(dir?)`, `parseArticle(slug, raw)`, `serializeArticle(a)`, `writeArticle(a, dir?)`, `articleExists(slug, dir?)`, `renderMarkdown(md): Promise<string>`
  - `seo.ts`: `xmlEscape(s)`, `type RssItem = { title; link; description; date }`, `buildRss(channel, items)`
  - `scripts/editorial/openai.ts`: `OPENAI_MODEL`, `complete(system, user, { json?, maxTokens? }): Promise<string>`
  - `scripts/editorial/prompts.ts`: `TITLE_SYSTEM`, `BODY_SYSTEM`, `DIGEST_INTRO_SYSTEM`, `repairPrompt(unknown)`

- [ ] **Step 1: Write the failing tests**

`src/lib/site/articles.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { articleExists, listArticles, parseArticle, renderMarkdown, serializeArticle, writeArticle } from "./articles.ts";

test("articles round-trip through front matter, newest first", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ais-news-"));
  writeArticle({ slug: "a", title: "Old: 1", description: "d", date: "2026-10-01", kind: "flash", modelId: "openai/x", body: "Hello" }, dir);
  writeArticle({ slug: "b", title: "New", description: "d", date: "2026-10-05", kind: "digest", modelId: null, body: "World" }, dir);
  assert.deepEqual(listArticles(dir).map((a) => [a.slug, a.kind, a.date]), [["b", "digest", "2026-10-05"], ["a", "flash", "2026-10-01"]]);
  assert.equal(listArticles(dir)[1].title, "Old: 1");
  assert.equal(articleExists("a", dir), true);
  assert.deepEqual(listArticles(path.join(dir, "missing")), []);
});

test("unquoted YAML dates are read as days", () => {
  const a = parseArticle("x", "---\ntitle: T\ndate: 2026-10-11\nkind: flash\n---\nBody\n");
  assert.equal(a.date, "2026-10-11");
  assert.match(serializeArticle(a), /^---\n/u);
});

test("markdown renders GFM tables and strips scripts", async () => {
  const html = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |\n\n<script>alert(1)</script>");
  assert.match(html, /<table>/u);
  assert.doesNotMatch(html, /<script>/u);
});
```

In `src/lib/site/seo.test.ts`, add `buildRss, xmlEscape` to the existing `import { … } from "./seo.ts";` line at the top, then append:

```ts
test("xml escaping and RSS", () => {
  assert.equal(xmlEscape(`a & <b> "c" 'd'`), "a &amp; &lt;b&gt; &quot;c&quot; &apos;d&apos;");
  const rss = buildRss(
    { title: "AI Signals", link: "https://aisignals.dev", description: "d" },
    [{ title: "A & B", link: "https://aisignals.dev/news/a", description: "x", date: "2026-10-11" }],
  );
  assert.match(rss, /<item><title>A &amp; B<\/title><link>https:\/\/aisignals.dev\/news\/a<\/link>/u);
  assert.match(rss, /<pubDate>Sun, 11 Oct 2026 06:00:00 GMT<\/pubDate>/u);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../articles.ts'` and `buildRss` not exported.

- [ ] **Step 3: Implement `src/lib/site/articles.ts`**

```ts
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

export type ArticleKind = "flash" | "digest";
export type ArticleFile = {
  slug: string; title: string; description: string; date: string;
  kind: ArticleKind; modelId: string | null; body: string;
};

export const NEWS_DIR = path.join(process.cwd(), "content", "news");

function toDay(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

export function parseArticle(slug: string, raw: string): ArticleFile {
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: toDay(data.date),
    kind: data.kind === "digest" ? "digest" : "flash",
    modelId: typeof data.modelId === "string" ? data.modelId : null,
    body: content.trim(),
  };
}

export function serializeArticle(a: ArticleFile): string {
  const data: Record<string, string> = { title: a.title, description: a.description, date: a.date, kind: a.kind };
  if (a.modelId) data.modelId = a.modelId;
  return matter.stringify(`${a.body.trim()}\n`, data);
}

export function listArticles(dir = NEWS_DIR): ArticleFile[] {
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return files
    .map((f) => parseArticle(f.slice(0, -3), fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function writeArticle(a: ArticleFile, dir = NEWS_DIR): string {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${a.slug}.md`);
  fs.writeFileSync(file, serializeArticle(a));
  return file;
}

export const articleExists = (slug: string, dir = NEWS_DIR) => fs.existsSync(path.join(dir, `${slug}.md`));

export async function renderMarkdown(md: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeSanitize).use(rehypeStringify).process(md);
  return String(file);
}
```

- [ ] **Step 4: Add `xmlEscape` and `buildRss` to `src/lib/site/seo.ts`**

```ts
export function xmlEscape(s: string): string {
  return s.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&apos;");
}

export type RssItem = { title: string; link: string; description: string; date: string };

export function buildRss(channel: { title: string; link: string; description: string }, items: RssItem[]): string {
  const pubDate = (day: string) => new Date(`${day}T06:00:00Z`).toUTCString();
  const body = items
    .map((i) => `<item><title>${xmlEscape(i.title)}</title><link>${xmlEscape(i.link)}</link><guid>${xmlEscape(i.link)}</guid><pubDate>${pubDate(i.date)}</pubDate><description>${xmlEscape(i.description)}</description></item>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xmlEscape(channel.title)}</title><link>${xmlEscape(channel.link)}</link><description>${xmlEscape(channel.description)}</description>${body}</channel></rss>\n`;
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 6: Create the news pages and the RSS route**

`src/app/news/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { listArticles } from "@/lib/site/articles";
import { newsUrl } from "@/lib/site/urls";

export const metadata: Metadata = {
  title: "AI Model Pricing News",
  description: "New AI models, price cuts and the weekly pricing digest, generated from our daily data.",
  alternates: { canonical: "/news" },
};

export default function NewsIndex() {
  const articles = listArticles();
  return (
    <>
      <Breadcrumbs items={[{ href: "/news", label: "news" }]} />
      <h1>AI model pricing news</h1>
      <p className="sub">Generated from our daily data · every number is checked against the dataset</p>
      <Box title="articles">
        {articles.length === 0 ? <p className="dim">No articles yet.</p> : (
          <ul className="feed">
            {articles.map((a) => (
              <li key={a.slug}>
                <span className="dim">{a.date} </span>
                <span className={a.kind === "digest" ? "tag price" : "tag"}>{a.kind === "digest" ? "WEEKLY" : "NEWS"}</span>
                <Link href={newsUrl(a.slug)}>{a.title}</Link>
                <br /><span className="muted">{a.description}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </>
  );
}
```

`src/app/news/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { listArticles, renderMarkdown } from "@/lib/site/articles";
import { getCatalog } from "@/lib/site/catalog";
import { modelUrl, newsUrl, ogImageUrl } from "@/lib/site/urls";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return listArticles().map((a) => ({ slug: a.slug }));
}

const find = (slug: string) => listArticles().find((a) => a.slug === slug) ?? null;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const article = find((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: newsUrl(article.slug) },
    openGraph: { type: "article", publishedTime: article.date, images: [{ url: ogImageUrl(article.title, article.date), width: 1200, height: 630 }] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const article = find((await params).slug);
  if (!article) notFound();
  const html = await renderMarkdown(article.body);
  const model = article.modelId ? getCatalog().models.find((m) => m.id === article.modelId) : undefined;
  const base = getSiteUrl();

  return (
    <article>
      <Breadcrumbs items={[{ href: "/news", label: "news" }, { href: newsUrl(article.slug), label: article.title }]} />
      <h1>{article.title}</h1>
      <p className="sub">{article.date} · {article.kind === "digest" ? "weekly digest" : "news"} · generated from AI Signals data, numbers verified automatically</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      {model ? <p><Link className="btn" href={modelUrl(model)}>{model.name}: live pricing →</Link></p> : null}
      <AdSlot />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          dateModified: article.date,
          mainEntityOfPage: `${base}${newsUrl(article.slug)}`,
          author: { "@type": "Organization", name: "AI Signals", url: base },
          publisher: { "@type": "Organization", name: "AI Signals", url: base },
        }}
      />
    </article>
  );
}
```

`src/app/rss.xml/route.ts`:

```ts
import { getSiteUrl } from "@/lib/site-url";
import { listArticles } from "@/lib/site/articles";
import { buildRss } from "@/lib/site/seo";
import { newsUrl } from "@/lib/site/urls";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const xml = buildRss(
    { title: "AI Signals", link: base, description: "AI model launches, price changes and the weekly pricing digest." },
    listArticles().slice(0, 30).map((a) => ({ title: a.title, link: `${base}${newsUrl(a.slug)}`, description: a.description, date: a.date })),
  );
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
```

- [ ] **Step 7: Create `scripts/editorial/openai.ts` and `scripts/editorial/prompts.ts`**

`scripts/editorial/openai.ts`:

```ts
import OpenAI from "openai";

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6.1-sol";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  client ??= new OpenAI({ apiKey, timeout: 120_000, maxRetries: 3 });
  return client;
}

export async function complete(system: string, user: string, opts: { json?: boolean; maxTokens?: number } = {}): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: OPENAI_MODEL,
    reasoning_effort: "medium",
    max_completion_tokens: opts.maxTokens ?? 8000,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}
```

`scripts/editorial/prompts.ts`:

```ts
export const TITLE_SYSTEM = `You write SEO headlines for AI Signals, a site that tracks AI model API prices.
Rules:
- Use only facts from the JSON fact sheet. Every number you write must appear in it (you may add $ or %).
- Include the exact model name, one concrete number, and a comparison when the fact sheet has a rival or competitors.
- No exclamation marks, no hype words, no questions. Maximum 80 characters. American English.
Return JSON: {"titles": ["…", "…", "…", "…", "…"]}`;

export const BODY_SYSTEM = `You write short, factual news articles for developers who choose AI model APIs.
Rules:
- 400 to 700 words, American English, Markdown. Do not repeat the title.
- Use only facts from the JSON fact sheet. Every number must come from it; you may format it with $ or %, but never compute a new number.
- Do not speculate about quality, benchmarks or features that are not in the fact sheet.
- No exclamation marks, no hype.
- Structure: one intro paragraph, then "## What changed", "## What it costs in practice" (a Markdown table built from "scenarios"), "## How it compares" (a Markdown table built from "competitors"), "## Who should care".
- Link the model once with its "url" field, e.g. [Model name](url). Link competitors with their "url" fields.`;

export const DIGEST_INTRO_SYSTEM = `You write the two- or three-sentence introduction of a weekly AI model pricing digest.
Use only facts from the JSON. Every number must appear in it. No hype, no exclamation marks. Return plain text only.`;

export const repairPrompt = (unknown: number[]) =>
  `These numbers are not in the fact sheet: ${unknown.join(", ")}. Rewrite the article so that every number comes from the fact sheet. Return only the article in Markdown.`;
```

- [ ] **Step 8: Create `scripts/editorial/run.ts`**

```ts
import "../load-env.mjs";

import { addDays } from "../../src/lib/data/dates.ts";
import { DEFAULT_DATA_DIR, readEvents, readLatest } from "../../src/lib/data/store.ts";
import type { Model, ModelEvent } from "../../src/lib/data/types.ts";
import { buildFactSheet, type FactSheet } from "../../src/lib/editorial/factsheet.ts";
import { checkGrounding, pickTitle } from "../../src/lib/editorial/guards.ts";
import { pickFlashEvent, scoreEvent } from "../../src/lib/editorial/score.ts";
import { articleSlug, renderTemplateArticle, type Article } from "../../src/lib/editorial/template.ts";
import { articleExists, listArticles, writeArticle } from "../../src/lib/site/articles.ts";
import { complete } from "./openai.ts";
import { BODY_SYSTEM, TITLE_SYSTEM, repairPrompt } from "./prompts.ts";

const DRY_RUN = process.env.DRY_RUN === "1";
const MIN_WORDS = 250;

async function writeWithLlm(facts: FactSheet, fallback: Article): Promise<{ article: Article; mode: "llm" | "template" }> {
  try {
    const factsJson = JSON.stringify(facts, null, 2);
    const parsed = JSON.parse(await complete(TITLE_SYSTEM, factsJson, { json: true, maxTokens: 2000 })) as { titles?: unknown };
    const title = pickTitle(Array.isArray(parsed.titles) ? parsed.titles.map(String) : [], facts) ?? fallback.title;

    let body = await complete(BODY_SYSTEM, `Title: ${title}\n\nFact sheet:\n${factsJson}`);
    let check = checkGrounding(body, facts);
    if (!check.ok) {
      body = await complete(BODY_SYSTEM, `Fact sheet:\n${factsJson}\n\nPrevious draft:\n${body}\n\n${repairPrompt(check.unknown)}`);
      check = checkGrounding(body, facts);
    }
    if (!check.ok || body.split(/\s+/u).length < MIN_WORDS) {
      console.warn(`[editorial] LLM draft rejected (unknown numbers: ${check.unknown.join(", ") || "none"}), using template`);
      return { article: fallback, mode: "template" };
    }
    return { article: { title, description: fallback.description, body }, mode: "llm" };
  } catch (error) {
    console.warn(`[editorial] LLM unavailable (${(error as Error).message}), using template`);
    return { article: fallback, mode: "template" };
  }
}

function simulate(models: Model[], events: ModelEvent[], days: number, end: string): number {
  const published: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = addDays(end, -i);
    const pick = pickFlashEvent(events.filter((e) => e.date === day).map((e) => scoreEvent(e, models, day)), published, day);
    if (!pick) continue;
    published.push(day);
    console.log(`${day} score=${pick.score} ${renderTemplateArticle(buildFactSheet(pick, models)).title}`);
  }
  console.log(`[editorial] simulation: ${published.length} flash articles over ${days} days`);
  return 0;
}

async function main(): Promise<number> {
  const models = readLatest(DEFAULT_DATA_DIR);
  if (!models) {
    console.error("[editorial] no data/models/latest.json");
    return 1;
  }
  const events = readEvents(DEFAULT_DATA_DIR);
  const today = process.env.EDITORIAL_DATE ?? new Date().toISOString().slice(0, 10);
  const simulateDays = Number(process.env.SIMULATE_DAYS ?? 0);
  if (simulateDays > 0) return simulate(models, events, simulateDays, today);

  const scored = events.filter((e) => e.date === today).map((e) => scoreEvent(e, models, today));
  for (const s of scored) console.log(`[editorial] ${s.event.type} ${s.event.id} score=${s.score}${s.eligible ? " ELIGIBLE" : ""} (${s.reasons.join("; ")})`);

  const flashDates = listArticles().filter((a) => a.kind === "flash").map((a) => a.date);
  const pick = pickFlashEvent(scored, flashDates, today);
  if (!pick) {
    console.log("[editorial] nothing to publish today");
    return 0;
  }
  const slug = articleSlug(pick.event);
  if (articleExists(slug)) {
    console.log(`[editorial] ${slug} already exists`);
    return 0;
  }

  const facts = buildFactSheet(pick, models);
  const fallback = renderTemplateArticle(facts);
  const { article, mode } = DRY_RUN ? { article: fallback, mode: "template" as const } : await writeWithLlm(facts, fallback);
  if (DRY_RUN) {
    console.log(`[editorial] DRY RUN ${slug}\n# ${article.title}\n\n${article.body}`);
    return 0;
  }
  const file = writeArticle({ slug, title: article.title, description: article.description, date: today, kind: "flash", modelId: pick.event.id, body: article.body });
  console.log(`[editorial] wrote ${file} mode=${mode} score=${pick.score}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[editorial] failed:", error);
    process.exit(1);
  },
);
```

- [ ] **Step 9: Register the script, set the model in `.env.example`, run a simulation and a real dry run**

```bash
npm pkg set scripts.editorial="node scripts/editorial/run.ts"
sed -i '' 's/^OPENAI_MODEL=.*/OPENAI_MODEL=gpt-6.1-sol/' .env.example
SIMULATE_DAYS=60 npm run editorial
DRY_RUN=1 EDITORIAL_DATE=<a date from the simulation output> npm run editorial
```

Expected: the simulation prints at most 4 articles per ISO week and no more than one per day. Every title contains a model name and a number. The dry run prints a full template article. If the simulation selects more than 2 articles per week on average, raise `FLASH_THRESHOLD` to 65 in `score.ts` (constants are designed to be tuned), rerun the tests, and note the change in the commit message.

- [ ] **Step 10: Write one real LLM article to check the pipeline end to end**

```bash
EDITORIAL_DATE=<same date> npm run editorial
cat content/news/*.md | head -60
```

Expected: `[editorial] wrote content/news/<slug>.md mode=llm` (or `mode=template` with a logged reason). Read the article: numbers match the model page, there are tables, no hype. Then delete it (`rm content/news/<slug>.md`), because launch content should be dated on publication days.

- [ ] **Step 11: Verify the site and commit**

```bash
npm run lint && npm test && npm run build
git add src scripts package.json .env.example
git commit -m "feat(editorial): grounded flash articles with gpt-6.1-sol, news pages and RSS"
```

---

### Task 14: Sitemaps, robots and indexing rules

**Files:**
- Modify: `src/lib/site/seo.ts` (add sitemap helpers), `src/lib/site/seo.test.ts`
- Create: `src/app/sitemap.xml/route.ts`, `src/app/sitemaps/[file]/route.ts`
- Modify: `src/app/robots.ts`

**Interfaces:**
- Consumes: catalog, selection, articles, urls, `getSiteUrl`
- Produces: `SITEMAP_FILES`, `type SitemapEntry = { loc; lastmod? }`, `buildUrlset(entries)`, `buildSitemapIndex(entries)`, `lastModFor(ids, events): string | null`

- [ ] **Step 1: Write the failing test**

In `src/lib/site/seo.test.ts`, add `buildSitemapIndex, buildUrlset, lastModFor` to the existing import from `./seo.ts`, then append:

```ts
test("sitemaps", () => {
  assert.equal(
    buildUrlset([{ loc: "https://x.dev/a?b&c", lastmod: "2026-10-11" }, { loc: "https://x.dev/b" }]),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://x.dev/a?b&amp;c</loc><lastmod>2026-10-11</lastmod></url>\n<url><loc>https://x.dev/b</loc></url>\n</urlset>\n',
  );
  assert.match(buildSitemapIndex([{ loc: "https://x.dev/sitemaps/models.xml", lastmod: null }]), /<sitemapindex[^>]*>\n<sitemap><loc>https:\/\/x.dev\/sitemaps\/models.xml<\/loc><\/sitemap>\n<\/sitemapindex>/u);
});

test("lastModFor uses the latest event of the page's models", () => {
  const e = (date: string, id: string) => ({ date, id, lab: "l", slug: "s", name: "n", type: "price_change" as const });
  assert.equal(lastModFor(["a", "b"], [e("2026-01-01", "a"), e("2026-03-01", "b"), e("2026-09-01", "c")]), "2026-03-01");
  assert.equal(lastModFor(["z"], [e("2026-01-01", "a")]), null);
});
```

- [ ] **Step 2: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `buildUrlset` is not exported.

- [ ] **Step 3: Add the helpers to `src/lib/site/seo.ts`**

```ts
import type { ModelEvent } from "../data/types.ts";

export const SITEMAP_FILES = ["pages.xml", "models.xml", "compare.xml", "best.xml", "news.xml"] as const;

export type SitemapEntry = { loc: string; lastmod?: string | null };

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';
const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
const entry = (tag: string, e: SitemapEntry) => `<${tag}><loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</${tag}>`;

export function buildUrlset(entries: SitemapEntry[]): string {
  return `${XML_HEAD}<urlset ${NS}>\n${entries.map((e) => entry("url", e)).join("\n")}\n</urlset>\n`;
}

export function buildSitemapIndex(entries: SitemapEntry[]): string {
  return `${XML_HEAD}<sitemapindex ${NS}>\n${entries.map((e) => entry("sitemap", e)).join("\n")}\n</sitemapindex>\n`;
}

/** Real last-change date of the models shown on a page (never the build date). */
export function lastModFor(ids: string[], events: ModelEvent[]): string | null {
  const wanted = new Set(ids);
  let max: string | null = null;
  for (const e of events) if (wanted.has(e.id) && (max === null || e.date > max)) max = e.date;
  return max;
}
```

Merge the new `import type { ModelEvent }` with the existing `import type { Model }` line at the top of the file.

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 5: Delete any metadata sitemap and create the sitemap routes**

`src/app/sitemap.xml/route.ts`:

```ts
import { getSiteUrl } from "@/lib/site-url";
import { getCatalog } from "@/lib/site/catalog";
import { SITEMAP_FILES, buildSitemapIndex } from "@/lib/site/seo";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const lastmod = getCatalog().meta?.lastChangeAt ?? null;
  const xml = buildSitemapIndex(SITEMAP_FILES.map((f) => ({ loc: `${base}/sitemaps/${f}`, lastmod })));
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
```

`src/app/sitemaps/[file]/route.ts`:

```ts
import { getSiteUrl } from "@/lib/site-url";
import { listArticles } from "@/lib/site/articles";
import { getCatalog, labSummaries } from "@/lib/site/catalog";
import { SITEMAP_FILES, buildUrlset, lastModFor, type SitemapEntry } from "@/lib/site/seo";
import { BEST_LISTS, MIN_LIST_SIZE, comparisonPairs, isIndexable } from "@/lib/site/selection";
import { bestUrl, compareUrl, modelUrl, newsUrl, providerUrl } from "@/lib/site/urls";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SITEMAP_FILES.map((file) => ({ file }));
}

const STATIC_PAGES = ["/", "/models", "/providers", "/compare", "/best", "/calculator", "/changes", "/news", "/newsletter", "/about"];

function entriesFor(file: string, base: string): SitemapEntry[] | null {
  const { models, events, meta, today } = getCatalog();
  const siteLastmod = meta?.lastChangeAt ?? null;
  switch (file) {
    case "pages.xml":
      return [
        ...STATIC_PAGES.map((p) => ({ loc: `${base}${p}`, lastmod: siteLastmod })),
        ...labSummaries(models).map((s) => ({ loc: `${base}${providerUrl(s.lab)}`, lastmod: lastModFor(s.models.map((m) => m.id), events) })),
      ];
    case "models.xml":
      return models.filter(isIndexable).map((m) => ({ loc: `${base}${modelUrl(m)}`, lastmod: lastModFor([m.id], events) ?? m.releaseDate }));
    case "compare.xml":
      return comparisonPairs(models, today).map((p) => ({ loc: `${base}${compareUrl(p.key)}`, lastmod: lastModFor([p.a.id, p.b.id], events) }));
    case "best.xml":
      return BEST_LISTS.filter((l) => l.select(models, today).length >= MIN_LIST_SIZE).map((l) => ({ loc: `${base}${bestUrl(l.slug)}`, lastmod: siteLastmod }));
    case "news.xml":
      return listArticles().map((a) => ({ loc: `${base}${newsUrl(a.slug)}`, lastmod: a.date }));
    default:
      return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const entries = entriesFor((await params).file, getSiteUrl());
  if (!entries) return new Response("Not found", { status: 404 });
  return new Response(buildUrlset(entries), { headers: { "content-type": "application/xml; charset=utf-8" } });
}
```

- [ ] **Step 6: Replace `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/og"], disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
```

- [ ] **Step 7: Verify the XML output**

```bash
npm run build && npm start -- -p 3100 & sleep 6
curl -s http://localhost:3100/sitemap.xml | head -5
curl -s http://localhost:3100/sitemaps/models.xml | grep -c "<url>"
curl -s http://localhost:3100/sitemaps/compare.xml | grep -c "<url>"
curl -s http://localhost:3100/robots.txt
curl -s http://localhost:3100/models/anthropic/claude-haiku-5-5 | grep -o '<title>[^<]*</title>'
kill %1
```

Expected: the sitemap index lists 5 files. The `models.xml` count equals the number of indexable models, and the `compare.xml` count equals the number of pairs. robots allows `/api/og`. The title follows `… Pricing, Context Window & Specs (Mon YYYY) | AI Signals`.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat(seo): sitemap index, per-type sitemaps with real lastmod, robots"
```

### Task 15: Weekly digest and newsletter sending

**Files:**
- Create: `src/lib/editorial/digest.ts`, `src/lib/editorial/email.ts`
- Test: `src/lib/editorial/digest.test.ts`, `src/lib/editorial/email.test.ts`
- Create: `scripts/editorial/weekly-digest.ts`, `scripts/newsletter/send-digest.ts`
- Modify: `package.json` (scripts `weekly-digest`, `send-digest`)

**Interfaces:**
- Consumes: `lastWeekRange`, `readEvents`, `checkGrounding`, `complete`, `DIGEST_INTRO_SYSTEM`, `writeArticle`, `articleExists`, `listArticles`, `renderMarkdown`, formatters, `modelUrl`, `type Article`
- Produces:
  - `digest.ts`: `type DigestRange = { start; end; weekId }`, `digestSlug(weekId)`, `digestFacts(events, range)`, `buildDigest(events, range, intro?): (Article & { slug: string }) | null`
  - `email.ts`: `unsubscribeUrl(siteUrl, email, secret)` (same HMAC as `src/app/api/newsletter/unsubscribe/route.ts`), `renderEmailHtml({ title, contentHtml, url, unsubscribeUrl, address })`

- [ ] **Step 1: Write the failing tests**

`src/lib/editorial/digest.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import type { ModelEvent } from "../data/types.ts";
import { buildDigest, digestFacts, digestSlug } from "./digest.ts";
import { checkGrounding } from "./guards.ts";

const range = { start: "2026-10-05", end: "2026-10-11", weekId: "2026-W41" };
const snap = (input: number, output: number, context = 200_000) => ({ input, output, blended: (3 * input + output) / 4, context });
const e = (date: string, id: string, type: ModelEvent["type"], extra: Partial<ModelEvent> = {}): ModelEvent => {
  const [lab, slug] = id.split("/");
  return { date, id, lab, slug, name: `Model ${slug}`, type, ...extra };
};
const events: ModelEvent[] = [
  e("2026-10-04", "openai/too-early", "new_model", { after: snap(1, 2) }),
  e("2026-10-07", "anthropic/claude-haiku-5-5", "new_model", { after: snap(0.1, 0.5, 1_000_000) }),
  e("2026-10-09", "google/gemini-x", "price_change", { before: snap(0.5, 2), after: snap(0.25, 1), pctChange: -50 }),
  e("2026-10-10", "meta/llama-y", "context_change", { before: snap(0.1, 0.3, 128_000), after: snap(0.1, 0.3, 256_000) }),
  e("2026-10-11", "xai/grok-old", "removed", { before: snap(3, 15) }),
];

test("digest covers the week only, with one section per change type", () => {
  const d = buildDigest(events, range);
  assert.ok(d);
  assert.equal(d.slug, "weekly-ai-pricing-2026-w41");
  assert.equal(d.title, "AI Model Pricing This Week: 4 Changes (2026-10-05 to 2026-10-11)");
  assert.doesNotMatch(d.body, /too-early/u);
  for (const h of ["## New models", "## Price changes", "## Context window changes", "## Deprecated or removed"]) assert.match(d.body, new RegExp(h, "u"));
  assert.match(d.body, /\[Model claude-haiku-5-5\]\(\/models\/anthropic\/claude-haiku-5-5\)/u);
  assert.match(d.body, /\| Model grok-old \|/u);
});

test("an LLM intro replaces the default first line and must be grounded", () => {
  const facts = digestFacts(events, range);
  assert.equal(facts.total, 4);
  assert.equal(checkGrounding("4 changes this week, including a 50% price cut.", facts).ok, true);
  assert.equal(checkGrounding("12 changes this week.", facts).ok, false);
  assert.match(buildDigest(events, range, "Custom intro.")?.body ?? "", /^Custom intro\./u);
});

test("empty weeks produce no digest", () => {
  assert.equal(buildDigest([], range), null);
  assert.equal(digestSlug("2026-W01"), "weekly-ai-pricing-2026-w01");
});
```

`src/lib/editorial/email.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import { renderEmailHtml, unsubscribeUrl } from "./email.ts";

test("unsubscribe links use the same HMAC as the API route", () => {
  const sig = crypto.createHmac("sha256", "s3cret").update("ann@example.com").digest("hex");
  assert.equal(unsubscribeUrl("https://aisignals.dev", " Ann@Example.com ", "s3cret"), `https://aisignals.dev/api/newsletter/unsubscribe?email=ann%40example.com&sig=${sig}`);
});

test("email html escapes the title and carries the unsubscribe link and address", () => {
  const html = renderEmailHtml({ title: "A <b> & C", contentHtml: "<p>body</p>", url: "https://aisignals.dev/news/x", unsubscribeUrl: "https://u", address: "AI Signals, 1 Street" });
  assert.match(html, /A &lt;b&gt; &amp; C/u);
  assert.match(html, /<p>body<\/p>/u);
  assert.match(html, /href="https:\/\/u"/u);
  assert.match(html, /AI Signals, 1 Street/u);
});
```

- [ ] **Step 2: Run them and verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../digest.ts'` and `'.../email.ts'`.

- [ ] **Step 3: Implement `src/lib/editorial/digest.ts`**

```ts
import type { ModelEvent } from "../data/types.ts";
import { fmtPct, fmtTokens, fmtUsd } from "../site/format.ts";
import { modelUrl } from "../site/urls.ts";
import type { Article } from "./template.ts";

export type DigestRange = { start: string; end: string; weekId: string };

export const digestSlug = (weekId: string) => `weekly-ai-pricing-${weekId.toLowerCase()}`;

const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
const linkOf = (e: ModelEvent) => (e.type === "removed" ? e.name : `[${e.name}](${modelUrl(e)})`);

function inRange(events: ModelEvent[], range: DigestRange): ModelEvent[] {
  return events
    .filter((e) => e.date >= range.start && e.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

/** Facts given to the LLM for the intro; also used to ground it. */
export function digestFacts(events: ModelEvent[], range: DigestRange) {
  const list = inRange(events, range);
  const count = (t: ModelEvent["type"]) => list.filter((e) => e.type === t).length;
  return {
    ...range,
    total: list.length,
    newModels: count("new_model"),
    priceChanges: count("price_change"),
    contextChanges: count("context_change"),
    deprecatedOrRemoved: count("deprecated") + count("removed"),
    events: list.map((e) => ({ name: e.name, type: e.type, date: e.date, before: e.before ?? null, after: e.after ?? null, pctChange: e.pctChange ?? null })),
  };
}

export function buildDigest(events: ModelEvent[], range: DigestRange, intro: string | null = null): (Article & { slug: string }) | null {
  const list = inRange(events, range);
  if (list.length === 0) return null;
  const of = (t: ModelEvent["type"]) => list.filter((e) => e.type === t);
  const news = of("new_model");
  const prices = of("price_change").sort((a, b) => (a.pctChange ?? 0) - (b.pctChange ?? 0));
  const contexts = of("context_change");
  const gone = [...of("deprecated"), ...of("removed")];

  const lines = [
    intro?.trim() ||
      `${list.length} changes to AI model pricing between ${range.start} and ${range.end}: ${news.length} new models, ${prices.length} price changes, ${contexts.length} context window changes and ${gone.length} deprecations or removals.`,
  ];
  if (news.length > 0) {
    lines.push("", "## New models", "", row(["Model", "Date", "Input / 1M", "Output / 1M", "Context"]), row(["---", "---", "---", "---", "---"]));
    for (const e of news) lines.push(row([linkOf(e), e.date, fmtUsd(e.after?.input ?? 0), fmtUsd(e.after?.output ?? 0), fmtTokens(e.after?.context ?? null)]));
  }
  if (prices.length > 0) {
    lines.push("", "## Price changes", "", row(["Model", "Date", "Input / 1M", "Output / 1M", "Change"]), row(["---", "---", "---", "---", "---"]));
    for (const e of prices) {
      lines.push(row([linkOf(e), e.date, `${fmtUsd(e.before?.input ?? 0)} → ${fmtUsd(e.after?.input ?? 0)}`, `${fmtUsd(e.before?.output ?? 0)} → ${fmtUsd(e.after?.output ?? 0)}`, fmtPct(e.pctChange ?? 0)]));
    }
  }
  if (contexts.length > 0) {
    lines.push("", "## Context window changes", "", row(["Model", "Date", "Before", "After"]), row(["---", "---", "---", "---"]));
    for (const e of contexts) lines.push(row([linkOf(e), e.date, fmtTokens(e.before?.context ?? null), fmtTokens(e.after?.context ?? null)]));
  }
  if (gone.length > 0) {
    lines.push("", "## Deprecated or removed", "", row(["Model", "Date", "Status"]), row(["---", "---", "---"]));
    for (const e of gone) lines.push(row([linkOf(e), e.date, e.type]));
  }
  lines.push("", "[Every change in the changelog](/changes) · [Compare costs in the calculator](/calculator)");

  return {
    slug: digestSlug(range.weekId),
    title: `AI Model Pricing This Week: ${list.length} Changes (${range.start} to ${range.end})`,
    description: `${news.length} new models, ${prices.length} price changes and ${contexts.length + gone.length} other updates in AI model pricing, ${range.start} to ${range.end}.`,
    body: lines.join("\n"),
  };
}
```

- [ ] **Step 4: Implement `src/lib/editorial/email.ts`**

```ts
import crypto from "node:crypto";

const escapeHtml = (s: string) => s.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

/** Must match `sign()` in src/app/api/newsletter/unsubscribe/route.ts. */
export function unsubscribeUrl(siteUrl: string, email: string, secret: string): string {
  const normalized = email.trim().toLowerCase();
  const sig = crypto.createHmac("sha256", secret).update(normalized).digest("hex");
  return `${siteUrl}/api/newsletter/unsubscribe?${new URLSearchParams({ email: normalized, sig }).toString()}`;
}

export function renderEmailHtml(opts: { title: string; contentHtml: string; url: string; unsubscribeUrl: string; address: string }): string {
  const mono = "ui-monospace,Menlo,Consolas,monospace";
  return `<!doctype html><html><body style="margin:0;background:#0a0e0b;color:#c8f5d8;font-family:${mono};font-size:14px;line-height:1.6">
<div style="max-width:640px;margin:0 auto;padding:24px 16px">
<p style="color:#22c55e;font-weight:700;margin:0 0 16px">&gt; ai_signals_</p>
<h1 style="color:#e9fff1;font-size:20px;margin:0 0 16px">${escapeHtml(opts.title)}</h1>
<div style="color:#c8f5d8">${opts.contentHtml}</div>
<p style="margin:24px 0"><a href="${escapeHtml(opts.url)}" style="color:#22c55e">Read on the web →</a></p>
<p style="color:#4f6e5a;font-size:12px;border-top:1px solid #1d2a21;padding-top:12px">${escapeHtml(opts.address)}<br><a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#7ea58c">Unsubscribe</a></p>
</div></body></html>`;
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 6: Create `scripts/editorial/weekly-digest.ts`**

```ts
import "../load-env.mjs";

import { lastWeekRange } from "../../src/lib/data/dates.ts";
import { DEFAULT_DATA_DIR, readEvents } from "../../src/lib/data/store.ts";
import { buildDigest, digestFacts, digestSlug } from "../../src/lib/editorial/digest.ts";
import { checkGrounding } from "../../src/lib/editorial/guards.ts";
import { articleExists, writeArticle } from "../../src/lib/site/articles.ts";
import { complete } from "./openai.ts";
import { DIGEST_INTRO_SYSTEM } from "./prompts.ts";

const DRY_RUN = process.env.DRY_RUN === "1";

async function main(): Promise<number> {
  const today = process.env.DIGEST_DATE ?? new Date().toISOString().slice(0, 10);
  const range = lastWeekRange(today);
  const slug = digestSlug(range.weekId);
  if (articleExists(slug)) {
    console.log(`[digest] ${slug} already exists`);
    return 0;
  }
  const events = readEvents(DEFAULT_DATA_DIR);
  const fallback = buildDigest(events, range);
  if (!fallback) {
    console.log(`[digest] no changes in ${range.weekId}`);
    return 0;
  }

  let digest = fallback;
  if (!DRY_RUN) {
    const facts = digestFacts(events, range);
    try {
      const intro = await complete(DIGEST_INTRO_SYSTEM, JSON.stringify(facts, null, 2), { maxTokens: 1500 });
      if (intro && !intro.includes("!") && checkGrounding(intro, facts).ok) digest = buildDigest(events, range, intro) ?? fallback;
      else console.warn("[digest] LLM intro rejected, using the default intro");
    } catch (error) {
      console.warn(`[digest] LLM unavailable (${(error as Error).message}), using the default intro`);
    }
  }

  if (DRY_RUN) {
    console.log(`[digest] DRY RUN ${digest.slug}\n# ${digest.title}\n\n${digest.body}`);
    return 0;
  }
  const file = writeArticle({ slug: digest.slug, title: digest.title, description: digest.description, date: today, kind: "digest", modelId: null, body: digest.body });
  console.log(`[digest] wrote ${file}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[digest] failed:", error);
    process.exit(1);
  },
);
```

- [ ] **Step 7: Create `scripts/newsletter/send-digest.ts`**

```ts
import "../load-env.mjs";

import fs from "node:fs";
import path from "node:path";

import { Resend } from "resend";

import { renderEmailHtml, unsubscribeUrl } from "../../src/lib/editorial/email.ts";
import { listArticles, renderMarkdown } from "../../src/lib/site/articles.ts";

const LOG_PATH = path.join(process.cwd(), "data", "newsletter-log.json");
const DRY_RUN = process.env.DRY_RUN === "1";
type SendLog = Record<string, { sentAt: string; recipients: number }>;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function listSubscribers(): Promise<string[]> {
  const apiKey = required("BEEHIIV_API_KEY");
  const publication = required("BEEHIIV_PUBLICATION_ID");
  const emails: string[] = [];
  let cursor = "";
  for (let page = 0; page < 200; page += 1) {
    const url = new URL(`https://api.beehiiv.com/v2/publications/${publication}/subscriptions`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("status", "active");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`Beehiiv list subscriptions failed: HTTP ${res.status}`);
    const json = (await res.json()) as { data?: { email?: string }[]; next_cursor?: string | null };
    for (const sub of json.data ?? []) if (sub.email) emails.push(sub.email);
    cursor = String(json.next_cursor ?? "");
    if (!cursor) break;
  }
  return emails;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<number> {
  const digest = listArticles().find((a) => a.kind === "digest");
  if (!digest) {
    console.log("[newsletter] no digest to send");
    return 0;
  }
  const log: SendLog = fs.existsSync(LOG_PATH) ? (JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) as SendLog) : {};
  const testTo = process.env.NEWSLETTER_TEST_TO?.trim();
  if (!testTo && log[digest.slug]) {
    console.log(`[newsletter] ${digest.slug} already sent`);
    return 0;
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://aisignals.dev").replace(/\/+$/u, "");
  const secret = required("NEWSLETTER_UNSUBSCRIBE_SECRET");
  const from = required("NEWSLETTER_FROM");
  const resend = new Resend(required("RESEND_API_KEY"));
  const recipients = testTo ? [testTo] : (await listSubscribers()).slice(0, Number(process.env.NEWSLETTER_MAX_SEND || 500));
  const contentHtml = await renderMarkdown(digest.body.replace(/\]\(\//gu, `](${site}/`));

  let sent = 0;
  for (const to of recipients) {
    const unsub = unsubscribeUrl(site, to, secret);
    if (DRY_RUN) {
      sent += 1;
      continue;
    }
    const { error } = await resend.emails.send({
      from,
      to,
      subject: digest.title,
      html: renderEmailHtml({ title: digest.title, contentHtml, url: `${site}/news/${digest.slug}`, unsubscribeUrl: unsub, address: process.env.NEWSLETTER_ADDRESS ?? "" }),
      replyTo: process.env.NEWSLETTER_REPLY_TO || undefined,
      headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
    if (error) console.warn(`[newsletter] one send failed: ${error.message}`);
    else sent += 1;
    await sleep(600);
  }

  if (!testTo && !DRY_RUN) {
    log[digest.slug] = { sentAt: new Date().toISOString(), recipients: sent };
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.writeFileSync(LOG_PATH, `${JSON.stringify(log, null, 2)}\n`);
  }
  console.log(`[newsletter] ${digest.slug} ${DRY_RUN ? "would send" : "sent"} ${sent}/${recipients.length}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[newsletter] failed:", error);
    process.exit(1);
  },
);
```

- [ ] **Step 8: Register the scripts and dry-run both**

```bash
npm pkg set scripts.weekly-digest="node scripts/editorial/weekly-digest.ts" scripts.send-digest="node scripts/newsletter/send-digest.ts"
DRY_RUN=1 DIGEST_DATE=2026-10-12 npm run weekly-digest
```

Expected: a digest for the week `2026-W41` printed with its tables, or `no changes in 2026-W41` if the backfill has no event that week (then rerun with a `DIGEST_DATE` on a Monday right after a week that has events in `data/models/history`).

**Do not run `send-digest` without `NEWSLETTER_TEST_TO`.** To test the sending path, ask Adel for a test address first, then run `NEWSLETTER_TEST_TO=<his address> npm run send-digest` only after writing a digest file locally. Delete that local digest file afterwards.

- [ ] **Step 9: Commit**

```bash
npm test && npm run lint
git add src/lib/editorial scripts package.json
git commit -m "feat(editorial): weekly digest and newsletter sender"
```

---

### Task 16: Operations: workflows, safe push, site checks, staleness alert

**Files:**
- Create: `scripts/ops/commit-and-push.sh`, `scripts/ops/staleness.ts`, `scripts/ops/staleness.test.ts`, `scripts/ops/check-staleness.ts`, `scripts/ops/site-check.ts`
- Create: `.github/workflows/daily-update.yml`, `.github/workflows/weekly-digest.yml`
- Rewrite: `.github/workflows/health-check.yml`, `.github/workflows/alert-on-failure.yml`
- Modify: `package.json` (script `site-check`)

**Interfaces:**
- Consumes: `readMeta`, `DEFAULT_DATA_DIR`, `getCatalog`, `comparisonPairs`, `BEST_LISTS`, `isIndexable`, urls
- Produces: `staleness(meta, now, maxHours = 72): { stale: boolean; hours: number | null }`; `node scripts/ops/site-check.ts [--deep]` (base URL from `SITE_CHECK_BASE`, default `https://aisignals.dev`)

- [ ] **Step 1: Write the failing staleness test**

`scripts/ops/staleness.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { staleness } from "./staleness.ts";

const now = new Date("2026-10-11T12:00:00Z");

test("fresh, stale, missing and broken metadata", () => {
  assert.deepEqual(staleness({ lastSuccessAt: "2026-10-11T06:00:00Z" }, now), { stale: false, hours: 6 });
  assert.deepEqual(staleness({ lastSuccessAt: "2026-10-08T06:00:00Z" }, now), { stale: true, hours: 78 });
  assert.deepEqual(staleness(null, now), { stale: true, hours: null });
  assert.equal(staleness({ lastSuccessAt: "garbage" }, now).stale, true);
});
```

- [ ] **Step 2: Run it and verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../scripts/ops/staleness.ts'`.

- [ ] **Step 3: Implement `scripts/ops/staleness.ts` and `scripts/ops/check-staleness.ts`**

`scripts/ops/staleness.ts`:

```ts
export function staleness(meta: { lastSuccessAt: string } | null, now: Date, maxHours = 72): { stale: boolean; hours: number | null } {
  if (!meta) return { stale: true, hours: null };
  const hours = Math.round((now.getTime() - Date.parse(meta.lastSuccessAt)) / 3_600_000);
  return { stale: !(hours <= maxHours), hours: Number.isFinite(hours) ? hours : null };
}
```

`scripts/ops/check-staleness.ts`:

```ts
import { DEFAULT_DATA_DIR, readMeta } from "../../src/lib/data/store.ts";
import { staleness } from "./staleness.ts";

const result = staleness(readMeta(DEFAULT_DATA_DIR), new Date());
if (result.stale) {
  console.error(`[staleness] data is stale: last successful refresh ${result.hours ?? "unknown"} hours ago (limit 72)`);
  process.exit(1);
}
console.log(`[staleness] ok: last successful refresh ${result.hours} hours ago`);
process.exit(0);
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: `fail 0`.

- [ ] **Step 5: Create `scripts/ops/site-check.ts`**

```ts
import { getCatalog } from "../../src/lib/site/catalog.ts";
import { BEST_LISTS, comparisonPairs, isIndexable } from "../../src/lib/site/selection.ts";
import { bestUrl, compareUrl, modelUrl } from "../../src/lib/site/urls.ts";

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
  { path: "/api/og?title=health", status: 200, contentType: "image/png" },
  { path: "/posts/legacy-check", status: 410 },
  { path: "/fr", status: 410 },
];

/** Checks that depend on the local data (only valid against a build of this checkout). */
function deepChecks(): Check[] {
  const { models, today } = getCatalog();
  const checks: Check[] = [{ path: "/compare/nope-vs-nothing", status: 404 }];
  const model = models.find(isIndexable);
  if (model) checks.push({ path: modelUrl(model), status: 200, expect: new RegExp(escapeRe(model.name), "u") });
  const pair = comparisonPairs(models, today)[0];
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
```

- [ ] **Step 6: Run the deep check against a local production build**

```bash
npm pkg set scripts.site-check="node scripts/ops/site-check.ts"
npm run build && (npm start -- -p 3100 &) && sleep 6
SITE_CHECK_BASE=http://localhost:3100 npm run site-check -- --deep
kill $(lsof -ti tcp:3100)
```

Expected: every line `OK`, including `410` for legacy paths, `308` for the reversed comparison and `404` for the unknown one.

- [ ] **Step 7: Create `scripts/ops/commit-and-push.sh`**

```bash
#!/usr/bin/env bash
# Usage: commit-and-push.sh "<message>" <path>...  (missing paths are ignored)
set -euo pipefail

message="$1"
shift
paths=()
for p in "$@"; do
  if [ -e "$p" ]; then paths+=("$p"); fi
done
if [ ${#paths[@]} -eq 0 ]; then
  echo "Nothing to add"
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -- "${paths[@]}"
if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 0
fi
git commit -m "$message"

for attempt in 1 2 3; do
  if git pull --rebase --quiet && git push; then
    exit 0
  fi
  echo "push failed (attempt ${attempt}/3), retrying in $((attempt * 15))s"
  sleep $((attempt * 15))
done
echo "push failed after 3 attempts"
exit 1
```

Then run `chmod +x scripts/ops/commit-and-push.sh`.

- [ ] **Step 8: Create `.github/workflows/daily-update.yml`**

```yaml
name: Daily Data & Editorial

on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:

concurrency:
  group: data-writes
  cancel-in-progress: false

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - name: Refresh model data
        run: npm run refresh-data
      - name: Write at most one flash article
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: gpt-6.1-sol
        run: npm run editorial
      - run: npm run lint
      - run: npm test
      - name: Build
        env:
          NEXT_PUBLIC_SITE_URL: https://aisignals.dev
        run: npm run build
      - name: Smoke test the build
        run: |
          npx next start -p 3100 &
          for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3100/ && break; sleep 1; done
          SITE_CHECK_BASE=http://localhost:3100 node scripts/ops/site-check.ts --deep
      - name: Commit and push
        run: bash scripts/ops/commit-and-push.sh "chore(data): daily refresh" data/models content/news
```

- [ ] **Step 9: Create `.github/workflows/weekly-digest.yml`**

```yaml
name: Weekly Digest

on:
  schedule:
    - cron: "0 8 * * 1"
  workflow_dispatch:

concurrency:
  group: data-writes
  cancel-in-progress: false

permissions:
  contents: write

jobs:
  digest:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - name: Write the weekly digest
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: gpt-6.1-sol
        run: npm run weekly-digest
      - run: npm run lint
      - run: npm test
      - name: Build
        env:
          NEXT_PUBLIC_SITE_URL: https://aisignals.dev
        run: npm run build
      - name: Commit and push the digest
        run: bash scripts/ops/commit-and-push.sh "chore(news): weekly digest" content/news
      - name: Wait for the digest page to be live
        run: |
          SLUG=$(node -e "import('./src/lib/site/articles.ts').then(m => console.log(m.listArticles().find(a => a.kind === 'digest')?.slug ?? ''))")
          if [ -z "$SLUG" ]; then echo "no digest"; exit 0; fi
          for i in $(seq 1 42); do
            code=$(curl -s -o /dev/null -w '%{http_code}' "https://aisignals.dev/news/$SLUG")
            if [ "$code" = "200" ]; then exit 0; fi
            sleep 10
          done
          echo "digest page not live after 7 minutes"
          exit 1
      - name: Send the newsletter
        env:
          NEXT_PUBLIC_SITE_URL: https://aisignals.dev
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          NEWSLETTER_FROM: ${{ secrets.NEWSLETTER_FROM }}
          NEWSLETTER_REPLY_TO: ${{ secrets.NEWSLETTER_REPLY_TO }}
          NEWSLETTER_ADDRESS: ${{ secrets.NEWSLETTER_ADDRESS }}
          NEWSLETTER_UNSUBSCRIBE_SECRET: ${{ secrets.NEWSLETTER_UNSUBSCRIBE_SECRET }}
          BEEHIIV_API_KEY: ${{ secrets.BEEHIIV_API_KEY }}
          BEEHIIV_PUBLICATION_ID: ${{ secrets.BEEHIIV_PUBLICATION_ID }}
        run: npm run send-digest
      - name: Commit the send log
        run: bash scripts/ops/commit-and-push.sh "chore(news): newsletter send log" data/newsletter-log.json
```

- [ ] **Step 10: Rewrite `.github/workflows/health-check.yml` and `.github/workflows/alert-on-failure.yml`**

`.github/workflows/health-check.yml`:

```yaml
name: Health Check

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: "24"
      - name: Production site check
        run: node scripts/ops/site-check.ts
      - name: Data freshness (alert after 72h without a successful refresh)
        run: node scripts/ops/check-staleness.ts
```

`.github/workflows/alert-on-failure.yml`:

```yaml
name: Alert on Failure

on:
  workflow_run:
    workflows:
      - Daily Data & Editorial
      - Weekly Digest
      - Health Check
    types:
      - completed

permissions:
  contents: read

jobs:
  alert:
    if: ${{ github.event.workflow_run.conclusion != 'success' && github.event.workflow_run.conclusion != 'skipped' }}
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - name: Send alert email
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          NEWSLETTER_FROM: ${{ secrets.NEWSLETTER_FROM }}
          NEWSLETTER_REPLY_TO: ${{ secrets.NEWSLETTER_REPLY_TO }}
          ALERT_TO: ${{ secrets.ALERT_TO }}
        run: node scripts/send-alert.mjs
```

- [ ] **Step 11: Validate the workflow files and commit**

`js-yaml` is already installed as a dependency of `gray-matter`:

```bash
node -e "const fs=require('fs');const y=require('js-yaml');for(const f of fs.readdirSync('.github/workflows')){y.load(fs.readFileSync('.github/workflows/'+f,'utf8'));console.log('valid',f)}"
npm test && npm run lint
git add scripts .github package.json
git commit -m "feat(ops): daily/weekly workflows, safe push, site checks and staleness alert"
```

Expected: exactly 4 lines `valid …` (`alert-on-failure.yml`, `daily-update.yml`, `health-check.yml`, `weekly-digest.yml`) and no YAML exception.

---

### Task 17: Final verification, docs and hand-off

**Files:**
- Rewrite: `README.md`
- Modify: `.env.example`

- [ ] **Step 1: Rewrite `README.md`**

````markdown
# AI Signals v2: AI model pricing tracker

Daily prices, context windows and capabilities of AI model APIs, with comparisons, rankings, a cost calculator and a small grounded news engine. Live at https://aisignals.dev.

## How it works

- `npm run refresh-data` downloads https://models.dev/api.json (MIT), normalizes it (`src/lib/data`), checks guards, writes `data/models/latest.json` and appends changes to `data/models/history/YYYY-MM.jsonl`.
- `npm run editorial` scores today's changes (`src/lib/editorial/score.ts`) and writes at most one article to `content/news/` with `gpt-6.1-sol`. Every number is checked against a fact sheet, with a template fallback.
- `npm run weekly-digest` writes the Monday digest; `npm run send-digest` emails it (Beehiiv subscribers, sent with Resend).
- The Next.js 16 site (`src/app`) is statically generated from `data/` and `content/news/`.
- GitHub Actions: `daily-update.yml` (06:00 UTC), `weekly-digest.yml` (Monday 08:00 UTC), `health-check.yml` (every 6 h), `alert-on-failure.yml`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run refresh-data
npm run dev
```

Requires Node 24 (scripts run TypeScript natively).

## Commands

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`node:test`) |
| `npm run refresh-data` | Daily data refresh |
| `npm run backfill-history` | One-shot price history from the models.dev git history |
| `npm run editorial` | Flash article (`DRY_RUN=1`, `EDITORIAL_DATE`, `SIMULATE_DAYS=60`) |
| `npm run weekly-digest` | Weekly digest (`DRY_RUN=1`, `DIGEST_DATE`) |
| `npm run send-digest` | Send the latest digest (`NEWSLETTER_TEST_TO` for a single test address) |
| `npm run site-check -- --deep` | Smoke test (`SITE_CHECK_BASE`) |

## Data and credits

Model data: [models.dev](https://models.dev), MIT license. Cross-check: [pydantic/genai-prices](https://github.com/pydantic/genai-prices), MIT license.
````

- [ ] **Step 2: Rewrite `.env.example`**

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-6.1-sol
NEXT_PUBLIC_SITE_URL=https://aisignals.dev
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SEGRLC8HGJ
# Leave empty until AdSense is approved (ads render nothing without both values)
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT=
BEEHIIV_PUBLICATION_ID=pub_98a9c096-7d14-4d0d-8321-ac509e687713
BEEHIIV_API_KEY=your_beehiiv_api_key_here
BEEHIIV_SEND_WELCOME_EMAIL=0
RESEND_API_KEY=your_resend_api_key_here
NEWSLETTER_FROM="AI Signals <newsletter@aisignals.dev>"
NEWSLETTER_REPLY_TO=hello@aisignals.dev
NEWSLETTER_ADDRESS="AI Signals, Your Address Here"
NEWSLETTER_UNSUBSCRIBE_SECRET=generate_a_long_random_string
ALERT_TO=you@example.com
```

- [ ] **Step 3: Full verification from a clean install**

```bash
rm -rf node_modules .next && npm ci
npm run lint && npm test && npm run build
npm run refresh-data
SIMULATE_DAYS=60 npm run editorial
DRY_RUN=1 DIGEST_DATE=2026-10-12 npm run weekly-digest
(npm start -- -p 3100 &) && sleep 6 && SITE_CHECK_BASE=http://localhost:3100 npm run site-check -- --deep; kill $(lsof -ti tcp:3100)
```

Expected: lint clean, all tests pass, build OK, refresh `events=0` (or a few real changes), simulation within the caps, digest printed, site-check all OK.

- [ ] **Step 4: Visual review in the browser pane (desktop and mobile presets)**

With `npm run dev`, take a screenshot of each page at desktop width and with the mobile preset: `/`, `/models`, `/models/anthropic/claude-haiku-5-5`, `/providers/openai`, one `/compare/...`, `/best/cheapest-llm-api`, `/calculator`, `/changes`, `/news`, `/about`, `/newsletter`, a 404. Check: no horizontal scroll at 375 px, readable contrast, no `NaN`/`Infinity`/`undefined` anywhere (also run `curl -s localhost:3000/<page> | grep -E "NaN|Infinity|undefined"` for each page and expect no output), toggle persistence on the model page. Reset the viewport to desktop afterwards.

- [ ] **Step 5: Commit the docs**

```bash
git add README.md .env.example
git commit -m "docs: README and env example for v2"
```

- [ ] **Step 6: Whole-change review**

Invoke `superpowers:requesting-code-review` on the local commits `origin/main..main`, and fix every confirmed issue with a test first.

- [ ] **Step 7: Push to `main` (authorized by Adel), then watch production**

```bash
git fetch origin && git status -sb
git pull --rebase --quiet && git push origin main
```

Then:
1. Wait for the Vercel production deploy and run `npm run site-check` (production, basic checks). Expect every line `OK`.
2. Trigger the first `Daily Data & Editorial` run with `gh workflow run "Daily Data & Editorial" -R AdelZ888/ai-signals`, and follow it with `gh run watch -R AdelZ888/ai-signals`.
3. Report to Adel: the number of commits, the test, build and site-check results, and the first workflow run.
4. The manual actions only he can do (spec §15):
   - delete the obsolete GitHub secrets `GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL`, `BLOB_READ_WRITE_TOKEN`, `X_*`, `SERVICES_*`;
   - add `ALERT_TO` if it is missing;
   - resubmit `https://aisignals.dev/sitemap.xml` in Google Search Console;
   - later, create AdSense, set `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` in Vercel, and decide on hosting (Vercel Pro or migration), because Hobby forbids commercial use.

