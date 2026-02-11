# AI Signals - Automated AI Blog

A fully automated blog that discovers AI topics, generates posts, and publishes them on a schedule.

## What this project does

- Renders a markdown-based blog from `content/posts`.
- Supports sections and blog UX:
  - Home, News, Tutorials, Services, Regions, Search, About
  - French mirror routes under `/fr` with localized UI and metadata
  - Regional pages (`/regions/us`, `/regions/uk`, `/regions/fr`)
  - Tag pages (`/tags/[tag]`)
  - Reading time, table of contents, related posts, share links
- Generates SEO outputs:
  - RSS feed at `/rss.xml`
  - French RSS feed at `/fr/rss.xml`
  - Sitemap at `/sitemap.xml`
- Automates content pipeline:
  - Topic discovery from AI RSS feeds (US/UK/FR + global sources)
  - Queue scoring in `data/topics-queue.json`
  - Region-balanced post generation for US/UK/FR
  - Long-form generation rules (minimum word counts, structured deep-dive sections, multi-source bundle)
  - Automatic French companion post generation in `content/posts/fr`
  - Post generation with OpenAI (fallback template if key is missing)
  - Daily GitHub Action auto-commit

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Add your key in `.env.local`:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MIN_WORDS_EN=900
MAX_WORDS_EN=1500
MIN_WORDS_FR=850
```

4. Run the app:

```bash
npm run dev
```

5. Run one automation cycle locally:

```bash
npm run automate
```

## Available scripts

- `npm run dev` - start local site
- `npm run build` - production build
- `npm run lint` - lint check
- `npm run discover-topics` - refresh queue from RSS sources
- `npm run generate-post` - generate one post from queue
- `npm run automate` - discover + generate

## GitHub automation

Daily publishing is configured in:

- `.github/workflows/auto-publish.yml`

To enable OpenAI generation in GitHub Actions, add this repository secret:

- `OPENAI_API_KEY`

## Services lead funnel

Service pages are available at:

- `/services`
- `/fr/services`

Qualified requests are posted to:

- `/api/services/lead`

Required env vars:

- `RESEND_API_KEY`
- `SERVICES_LEAD_TO`

Optional env vars:

- `SERVICES_FROM`
- `SERVICES_REPLY_TO`
- `SERVICES_BOOKING_URL`
- `NEXT_PUBLIC_SERVICES_BOOKING_URL`
