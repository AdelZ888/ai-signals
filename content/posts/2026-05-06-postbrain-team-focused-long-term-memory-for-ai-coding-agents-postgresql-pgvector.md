---
title: "Postbrain: team-focused long-term memory for AI coding agents (PostgreSQL + pg_vector)"
date: "2026-05-06"
excerpt: "Practical guide to running Postbrain locally: a team long-term memory for AI coding agents with PostgreSQL and pg_vector. Covers setup, scopes, artifacts and promotion rules."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-06-postbrain-team-focused-long-term-memory-for-ai-coding-agents-postgresql-pgvector.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "postbrain"
  - "postgresql"
  - "pg_vector"
  - "ai-agents"
  - "long-term-memory"
  - "team-collaboration"
  - "open-source"
  - "developer-tools"
sources:
  - "https://github.com/simplyblock/postbrain"
---

## TL;DR in plain English

- What this is: Postbrain is an open-source long-term memory service for AI coding agents and the developers who work with them. It stores short text "memories" and vector embeddings in PostgreSQL using the pg_vector extension; the project is described as "Long-term memory for AI coding agents ... built on Vela (with PostgreSQL and pg_vector)." See: https://github.com/simplyblock/postbrain
- Why it helps: it keeps recurring context (style rules, decisions, RFCs) so an assistant can fetch shared facts instead of re-stating them, saving tokens and developer time. See: https://github.com/simplyblock/postbrain
- Quick outcome: you can run a local demo in ~120 minutes (2 hours) and a 1–4 person team can seed ~10 memories and tune rules so agents reference shared artifacts in most replies after some tuning. See: https://github.com/simplyblock/postbrain
- Safety note: the repository is prototype-stage; keep this in local or staging environments until you add backups, ACLs, and monitoring. See: https://github.com/simplyblock/postbrain

Short scenario (concrete example): a solo founder runs Postbrain locally, adds 10 memories (e.g., "Use 2-space indentation for JS") and, after ~7 days, the assistant cites the shared memory in PR comments, reducing first-pass style fixes. See repo: https://github.com/simplyblock/postbrain

One short methodology note: this guide follows the project README and migrations in the repository as the canonical source: https://github.com/simplyblock/postbrain

## What you will build and why it helps

You will run a local Postbrain instance backed by PostgreSQL with the pg_vector extension. The repo explicitly describes the stack as "built on Vela (with PostgreSQL and pg_vector)." See: https://github.com/simplyblock/postbrain

What you get:
- A searchable store of short team memories (counts: seed ~10, scale from 10 to 100+ items).
- Scopes and artifacts to group memories for agents and projects.
- A promotion path to convert frequently referenced memories into shared artifacts.

Why this helps (concrete thresholds to try):
- Frequency threshold: start at frequency >= 3 occurrences.
- Importance threshold: start at importance_score >= 0.75.
- Retention candidate: 365 days (1 year) default; tune by activity.
- Embedding dimension example to confirm in your pipeline: 1536 (if your encoder uses it).

Decision frame (quick comparison):

| Choice | Fast test (0–2 weeks) | Production gate |
|---|---:|---:|
| Manual promotion | Seed 10 memories; reviewer approves | Promote when frequency >= 3 and importance >= 0.75 |
| Automatic promotion | Auto-promote at frequency >= 5 | Require manual rollback and audit trail |
| Retention | 365 days (start) | Reduce to 180 days if noise >50% |

Repository reference for the design and migrations: https://github.com/simplyblock/postbrain

## Before you start (time, cost, prerequisites)

Time estimate:
- Local demo: ~120 minutes (2 hours).
- Harden and test for small-team staging: +4–8 hours.

Cost estimates:
- Local testing: $0 using Docker and a local Postgres image.
- Production: depends on hosted Postgres; plan for $20–$500+/month depending on CPU, storage, backups.

Minimum local hardware (recommended test target):
- 4 CPU cores, 8 GB RAM, 5 GB disk.
- Performance goal for small datasets (10–100 memories): p95 latency <200 ms.

Prerequisites:
- Git and basic clone/pull workflow. See: https://github.com/simplyblock/postbrain
- Docker & Docker Compose (Docker Engine >= 20.10 recommended).
- Basic SQL comfort (psql) to run CREATE EXTENSION.
- Node.js or Python only if you use the example server included in the repo. See: https://github.com/simplyblock/postbrain

Pre-flight checklist:
- [ ] git clone https://github.com/simplyblock/postbrain
- [ ] Docker installed and running
- [ ] Docker Compose available
- [ ] Confirm psql access to the running container

## Step-by-step setup and implementation

Plain-language plan: start Postgres with Docker Compose, enable pg_vector, run migrations from the repo, start the example service, then ingest and validate a small set of memories (10–100 items). See repository: https://github.com/simplyblock/postbrain

1) Clone the repo and inspect README and migrations:

```bash
git clone https://github.com/simplyblock/postbrain
cd postbrain
ls -la
cat README.md
```

2) Minimal Docker Compose (exposes Postgres on 5432). The repo contains examples; adapt as needed. See: https://github.com/simplyblock/postbrain

```yaml
# docker-compose.yml (minimal)
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example
    ports:
      - "5432:5432"
    volumes:
      - ./pgdata:/var/lib/postgresql/data
```

3) Enable pg_vector and run migrations from the repo. Example commands:

```bash
docker compose up -d db
# enable vector extension inside the running postgres container
docker exec -it $(docker ps -qf "ancestor=postgres:15") psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

4) Run the repository migrations that create core tables (memories, artifacts, scopes). Inspect migrations in the repo before executing them: https://github.com/simplyblock/postbrain

5) Start the example service (if present) and check health endpoints. Typical commands in the repo are Node or Python based; follow the repo's instructions: https://github.com/simplyblock/postbrain

```bash
# JS example
npm install && npm run start
# or Python example
pip install -r requirements.txt && python app.py
```

6) Ingest first memories (example SQL; adapt to the repo schema):

```sql
INSERT INTO memories (scope_id, text, importance_score, frequency)
VALUES ('project-1', 'Adopt 2-space indentation for JS files', 0.8, 1);
```

7) Validate a semantic query and measure latency on a small validation set (10–100 items). Example diagnostic query (adapt vector literal):

```sql
EXPLAIN ANALYZE
SELECT id, text FROM memories
ORDER BY embedding <-> '[0.01,0.02,...]'::vector
LIMIT 5;
```

Suggested rollout gates (example thresholds): canary 5% traffic for 24 hours -> 25% for 48 hours -> 100% when p95 latency <200 ms and recall precision >=0.8. Roll back within 30 minutes if p95 >500 ms or recall precision <0.6.

Repo source for migrations and examples: https://github.com/simplyblock/postbrain

## Common problems and quick fixes

- pg_vector extension missing
  - Fix: run CREATE EXTENSION IF NOT EXISTS vector; confirm with \dx in psql. See: https://github.com/simplyblock/postbrain
- DB connection refused
  - Fix: check POSTGRES_PASSWORD, host:port mapping (5432), Docker Compose status, and container logs.
- Slow similarity queries on larger datasets
  - Quick checks: confirm embedding column exists (vector(1536) or your encoder dim), run EXPLAIN ANALYZE on the query with a validation set of 10–100 items, tune indexes and Postgres settings before scaling.
- Mis-scoped memories
  - Fix: validate scope_hierarchy and parent/child scope queries in the repo migrations and code: https://github.com/simplyblock/postbrain

Quick-fix checklist:
- [ ] Confirm extension exists (\dx)
- [ ] Run migrations successfully
- [ ] Test sample semantic query with EXPLAIN ANALYZE
- [ ] Canary new behavior at 5% before full rollout

Example diagnostic SQL shown earlier; repository troubleshooting hints: https://github.com/simplyblock/postbrain

## First use case for a small team

Target: solo founders and teams of 1–4 people who want agents to remember project rules and decisions. See: https://github.com/simplyblock/postbrain

Concrete starter plan (counts and time):
1) Run the local demo (120 minutes).
2) Seed 10 high-value memories by hand (keep each <500 tokens).
3) Promotion policy: require human reviewer for promotions during first 2 weeks; promote when frequency >= 3 or importance_score >= 0.75.
4) Schedule a weekly job to recompute frequency and importance (1 run per week to start; increase to 2 runs/week if activity grows).
5) Measure impact over 14 days: target a 30% reduction in onboarding Q&A and >=70% artifact reference rate in relevant agent replies.

Simple rollout checklist for small teams:
- [ ] Run local demo (120 minutes)
- [ ] Seed 10 memories (<500 tokens each)
- [ ] Assign a reviewer for promotions
- [ ] Run weekly importance/frequency job

Repo reference for seeds, migrations, and examples: https://github.com/simplyblock/postbrain

## Technical notes (optional)

- The project describes itself as "Long-term memory for AI coding agents ... built on Vela (with PostgreSQL and pg_vector)." Confirm in the repo: https://github.com/simplyblock/postbrain
- Inspect the migrations folder to confirm core tables (memories, artifacts, scopes, scope_hierarchy) before inserting data: https://github.com/simplyblock/postbrain
- If adding an embedding column, confirm your encoder dimension (example: 1536) and choose an index (ivfflat, hnsw) appropriate to your workload.

Example SQL to add an embedding and index (adapt to repo schema):

```sql
ALTER TABLE memories ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding);
```

Note: index choice and parameters are hypotheses to test; monitor p95 latency and recall after changes. See repository migrations and examples: https://github.com/simplyblock/postbrain

## What to do next (production checklist)

### Assumptions / Hypotheses
- The repository provides migration scripts and example API patterns for memories, artifacts, and scopes: https://github.com/simplyblock/postbrain
- pg_vector can be enabled with CREATE EXTENSION IF NOT EXISTS vector; in a Postgres instance.
- Example numeric thresholds above (frequency >= 3, importance_score >= 0.75, retention = 365 days, embedding dim = 1536) are starting hypotheses; validate with a test dataset of 10–100 items.

### Risks / Mitigations
- Risk: data loss or mistaken promotions. Mitigation: require human reviewer for promotions for 2–4 weeks and configure daily backups with PITR and point-in-time restores.
- Risk: latency spikes at scale. Mitigation: canary at 5% traffic for 24 hours, then 25% for 48 hours; scale DB CPU to >=8 cores if needed; monitor p95 latency and disk I/O; rollback within 30 minutes if p95 >500 ms.
- Risk: privacy or leakage. Mitigation: add ACLs on scopes, encryption at rest, and audit logging before public rollout.

### Next steps
- Harden DB: configure daily backups, PITR, connection pooling (pgbouncer), and monitoring dashboards.
- Security & access: implement ACLs on scopes and audit trails for promotions.
- Retention & tests: set default retention (e.g., 365 days) and add E2E tests for scope visibility, artifact promotion, and semantic search accuracy using a validation set of 10–100 items.
- Production gates (example): canary 5% -> 25% for 48 hours -> 100%; fail and rollback if p95 latency >500 ms or recall precision <0.6.

Production gate checklist:
- [ ] Backups configured (daily + PITR)
- [ ] ACLs + audit logging enabled
- [ ] Performance tests: p95 latency <200 ms under expected load
- [ ] Semantic recall precision >=0.8 on a validation set (10–100 items)

For the canonical code and migrations, see the project repo: https://github.com/simplyblock/postbrain
