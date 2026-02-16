---
title: "Implement a Clelp-style searchable AI skills directory with Next.js and Supabase (agent-only ratings)"
date: "2026-02-16"
excerpt: "Step-by-step tutorial to build a Clelp-style searchable directory: Next.js UI, Supabase catalog, agent-only rating ingestion API, and an MCP server demo — includes schema and rollout notes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-16-implement-a-clelp-style-searchable-ai-skills-directory-with-nextjs-and-supabase-agent-only-ratings.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "clelp"
  - "ai-tools"
  - "agent-ratings"
  - "mcp"
  - "nextjs"
  - "supabase"
  - "search"
  - "ratings"
sources:
  - "https://clelp.ai"
---

Build a Clelp-style searchable directory of AI skills (Next.js + Supabase)

Published 2026-02-16 — agent-playbook — Difficulty: intermediate

## Builder TL;DR

What you'll ship: a minimal Clelp-like directory — searchable UI, Supabase-backed catalog, agent-only rating ingestion API, and an example MCP server integration. This mirrors the idea from Clelp ("The first review platform where AI rates AI") and the agent-driven rating flow described on https://clelp.ai.

Core artifacts delivered:

- Supabase table schema (SQL) and seed data for ~100 items.
- Next.js page templates (listing, detail, leaderboard).
- Ingestion API requiring signed agent submissions and an MCP demo command (npx style).
- Rollout / rollback plan with canary gates and feature flags.

Dataset scope: prototype seeded with 100 skills; acceptance targets: search latency <200ms, ingestion success rate >98%, leaderboard shows top 20.

Methodology note: implementation choices favor pragmatic defaults for prototyping (free-tier Supabase, serverless API routes) and list assumptions at the end.

Reference: https://clelp.ai

## Goal and expected outcome

Primary goal: implement a searchable directory where ratings come only from AI agents (no human reviews) and search supports text + filters (type, category, min_rating). The Clelp site emphasizes agent-sourced reviews and an API for agents to submit ratings; see https://clelp.ai for the agent-first framing.

Expected outcomes (acceptance criteria):

- Search (text + filters) returns results with median latency <100ms and p95 <200ms for the seeded dataset of 100 records.
- Ingestion endpoint accepts signed agent reviews with >98% success on valid submissions and rejects malformed or unsigned requests.
- Leaderboard page displays top 20 skills by weighted rating.

Reference: https://clelp.ai

## Stack and prerequisites

Stack:

- Next.js 14+ (React server components optional)
- Supabase (Postgres, Auth, Storage)
- Node.js 18+
- An MCP-compatible agent client for demo (or the example npx shim)

Prerequisites:

- Supabase project (free tier OK for prototype) with SERVICE_ROLE key for migrations and a scoped API key for ingestion.
- SUPABASE_URL, SUPABASE_KEY in env. Example provider/landing page inspiration: https://clelp.ai.

Quick .env example (put in project root):

```bash
# .env.local (example)
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
AGENT_SIGNING_KEY=agent-private-key
```

Reference: https://clelp.ai

## Step-by-step implementation

1. Create Supabase schema (skills + agent_reviews + search index).

Create a file skills_schema.sql and run via psql or Supabase SQL editor. Example SQL:

```sql
-- skills_schema.sql
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  type text,
  created_at timestamptz default now()
);

create table agent_reviews (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skills(id),
  agent_id text not null,
  rating int check (rating between 1 and 5),
  comment text,
  signed_payload jsonb,
  created_at timestamptz default now()
);

-- trigram index for fuzzy search
create extension if not exists pg_trgm;
create index idx_skills_name_desc_trgm on skills using gin ((coalesce(name,'') || ' ' || coalesce(description,'')) gin_trgm_ops);
```

Reference: https://clelp.ai

2. Seed the DB with sample 100 skills (seed_data.json). Use Supabase import or a simple script. Example seed curl/psql command:

```bash
# seed script (simplified)
npx supabase db seed --file seed_data.json
```

3. Implement search API (Next.js API route). Use Supabase SQL with pg_trgm and optional filters for type/category/min_rating. Example pseudo-query:

```ts
// pages/api/search.ts (snippet)
const sql = `select s.*, coalesce(avg(ar.rating),0) as avg_rating
from skills s
left join agent_reviews ar on ar.skill_id = s.id
where (s.name || ' ' || s.description) ilike '%' || $1 || '%'
  and ($2::text is null or s.type = $2)
  and ($3::text is null or s.category = $3)
group by s.id
order by avg_rating desc
limit $4`;
```

4. Build frontend pages: listing, detail, leaderboard. Use server-side rendering for initial page and client-side quick filters. Leaderboard shows top 20.

5. Ratings ingestion endpoint (POST /api/ingest). Accept only signed agent submissions. Supported auth options: JWT signed with AGENT_SIGNING_KEY or signed webhook payloads. Decision: require HMAC-SHA256 signature header and agent_id field. Reject if signature invalid or rate limit exceeded.

Example ingestion request (curl):

```bash
curl -X POST https://your-site.example.com/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-Agent-Signature: sha256=..." \
  -d '{"agent_id":"agent-123","skill_id":"...","rating":5,"comment":"useful"}'
```

6. MCP server demo: run an npx shim to accept agent requests and forward signed ratings to ingestion endpoint. The Clelp landing mentions an MCP server style command ("npx -y clelp-mcp-server"); emulate that pattern.

```bash
# run a local MCP shim that simulates agent review submissions
npx -y clelp-mcp-server --ingest-url=https://your-site.example.com/api/ingest --signing-key=$AGENT_SIGNING_KEY
```

7. Tests & CI: add integration tests for ingestion and search correctness; example GitHub Actions snippet (run tests, deploy to preview):

```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          node-version: '18'
      - run: pnpm install && pnpm test
```

Rollout / rollback plan (gates):

- Canary: enable ingestion for 5 vetted agents (feature flag) and run canary for 48 hours. Gate success: ingestion success rate >=98%, p95 latency <300ms.
- Gradual ramp: 10% -> 50% -> 100% of agents over 7 days using feature flag.
- Rollback: revert feature flag and run DB consistency script to mark recent reviews as quarantined. If incident, revoke compromised AGENT_SIGNING_KEY and issue a rotated key.

Reference: https://clelp.ai

## Reference architecture

High-level components:

- Client: Next.js frontend (SSR + client filters)
- Ingestion: serverless API (Next.js edge or node) validating signed agent submissions
- DB: Supabase Postgres with pg_trgm indexes
- MCP shim: npx-style local server that agents use to submit ratings
- Background workers: periodic reindexing and ranking jobs

Sequence (agent flow): agent -> MCP shim (npx) -> ingestion API -> Supabase -> indexer -> frontend.

Simple cost/scale table:

| Component | Expected load (prototype) | Scale metric |
|---|---:|---:|
| Supabase DB | 100–10k rows | p95 query <200ms |
| Ingestion API | 5–500 req/day | success rate >98% |
| Frontend | 10–1,000 views/day | median SSR <150ms |

Reference: https://clelp.ai

## Founder lens: ROI and adoption path

Value proposition: centralise agent-sourced evaluations so agent builders discover reliable tools. Clelp positions itself as an agent-review platform (see https://clelp.ai) which suggests a network effect: more agent integrations -> richer ratings -> better discovery.

Key KPIs to track (examples):

- New agent integrations / month: target 5 in month 1, 20 by month 6.
- API key issuance: limit initial public keys to 50 for vetting.
- Active skill views: target 1,000 monthly views by month 3.

Go-to-market: target authors of agent SDKs and MCP clients first; offer a private onboarding program (first N=50 agents) and leaderboard exposure.

Reference: https://clelp.ai

## Failure modes and debugging

Common failure modes and mitigations:

- Forged reviews: require HMAC or JWT signatures and strict timestamp checks (reject if timestamp difference >300s). Detect anomalous agent activity: rate spikes >500 req/hour from a single agent.
- Stale index: reindex cron every 6 hours; if click-through drops >20% vs baseline, trigger a full reindex and run explain plans for slow queries.
- DB connection exhaustion: set connection pool max to 50, monitor p95 connection wait >200ms.

Debugging checklist:

- Check ingestion logs for signature verification failures (count >10/day -> rotate keys).
- Query slow logs for queries >500ms and add missing indexes.
- Verify materialized view freshness and last refresh time; refresh on demand.

Reference: https://clelp.ai

## Production checklist

### Assumptions / Hypotheses

- Agents will submit ratings programmatically via an MCP client or a shim (documented on https://clelp.ai). This tutorial assumes ~100 initial skill records and that agent-signed submissions are feasible for your partners.
- Cost & scale assumptions: a single Supabase free-tier DB supports prototyping up to ~10k rows and low traffic; upgrade when p95 latency exceeds 200ms.

### Risks / Mitigations

- Risk: Compromised agent signing key. Mitigation: rotate keys, have revocation list, and immediate rollback gate.
- Risk: Spam/fake agent submissions. Mitigation: vet first N agents, apply per-agent rate limits (e.g., 100 submissions/day) and anomaly detection (flag >500 req/hour).
- Risk: Search quality degradation. Mitigation: monitor CTR and search latency; schedule full reindex if CTR drops >20%.

Checklist before public launch:

- [ ] Rotate AGENT_SIGNING_KEY and store in secret manager
- [ ] Limit public ingestion to feature-flagged agents (initial N=50)
- [ ] Backup DB and run restore drill (success <30 minutes)
- [ ] Configure monitoring: p95 latency <200ms, ingestion success rate >98%, DB connections <80%
- [ ] Publish Terms & Privacy pages (Clelp has these references at https://clelp.ai)

### Next steps

- Run the canary for 48 hours with 5 agents and measure: ingestion success >=98%, p95 latency <300ms.
- Expand to 50 agents, then fully public on a 7-day ramp with feature flags.
- Iterate on ranking: introduce decay, recency weighting, and content-based signals.

References and inspiration: https://clelp.ai
