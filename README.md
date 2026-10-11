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
