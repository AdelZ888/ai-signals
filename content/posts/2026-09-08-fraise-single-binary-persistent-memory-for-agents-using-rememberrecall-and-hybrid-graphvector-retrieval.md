---
title: "Fraise: single-binary persistent memory for agents using remember/recall and hybrid (graph+vector) retrieval"
date: "2026-09-08"
excerpt: "Fraise is a single-binary memory service for AI agents that stores short temporal facts in a bipartite graph and returns capped, ranked recall (remember/recall) to lower token costs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-08-fraise-single-binary-persistent-memory-for-agents-using-rememberrecall-and-hybrid-graphvector-retrieval.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "fraise"
  - "agent-memory"
  - "remember"
  - "recall"
  - "hybrid-retrieval"
  - "graph"
  - "vector-search"
  - "mcp"
sources:
  - "https://docs.getfraise.dev"
---

## TL;DR in plain English

- What changed: Fraise is a lightweight memory store for AI agents. It uses two simple verbs: remember (write) and recall (read). Results are ranked and intentionally limited so agents read fewer tokens. See https://docs.getfraise.dev.
- Why this matters: agents can store short facts (flags, recent events, preferences) and ask for only the few most relevant items. That lowers the tokens you send to a large language model (LLM) and keeps responses focused. The docs show the two-verb query language and design goals: https://docs.getfraise.dev.
- Quick action (15–90 minutes): install the binary or run the Docker image. Start the server, check /health, seed ~10 facts, then call recall with a low top value (for example, top:3) to validate behavior.

Quick checklist (pilot):
- [ ] install binary or run Docker
- [ ] start server and verify /health
- [ ] seed ~10 facts and run recall top:3

Concrete short scenario: a 3-person support team has the assistant remember the last 3 billing events per customer. Aim to finish install and wiring in 90 minutes and see p95 recall latency under 500 ms during the demo.

(Methodology: claims and endpoints below follow the Fraise docs: https://docs.getfraise.dev.)

Plain-language explanation before advanced details:
Fraise is a small service that saves short, structured text snippets ("memories") and returns a short, ranked list when you ask for them. It is built so agents read less history into each request. Keep each memory short. Ask for only the top few matches. That keeps token use and latency low.

## What you will build and why it helps

You will build a small, persistent memory service for agents. It stores short facts and returns a capped, ranked set of results. That makes agent prompts smaller and fresher.

Key properties from the docs:
- Two-verb query language: remember and recall. Use remember to add facts and recall to fetch them. See https://docs.getfraise.dev.
- Hybrid retrieval: results are ranked across full-text, graph and vector indices and are intentionally capped to reduce token spend. Recent memories outrank older ones. See retrieval and architecture notes at https://docs.getfraise.dev.
- Simple integration: Fraise exposes an HTTP API with endpoints such as /query, /explain, /stats and /health. Use those from your agent code. See HTTP API at https://docs.getfraise.dev.

Why small teams benefit:
- Persist a few recent facts so you do not re-send full chats every session.
- Cap results (for example, top:3 or top:5) to reduce token costs and latency.
- Run on modest infrastructure (single binary or Docker image) to keep ops simple; install options are provided in the docs: release binaries, Docker, Homebrew, and Linux packages (https://docs.getfraise.dev).

Example decision table

| Trigger | Remember entry (example) | Recall query to show last 3 |
|---|---|---|
| Billing change | "acme moved to annual billing on 2026-08-01" | recall billing entity:acme top:3 since:30d |
| Escalation opened | "ticket #123 escalated to L2 by alice" | recall escalations entity:acme top:5 since:90d |

Reference: https://docs.getfraise.dev

## Before you start (time, cost, prerequisites)

- Estimated local demo time: 60–120 minutes. For a modest pilot, plan 2+ days for backups and a privacy check. See quickstart and installation options: https://docs.getfraise.dev.
- Cost: local demo cost is typically $0. Cloud VM hosting can range from $5 to $50 / month depending on instance size. Use release binaries or Docker per the docs: https://docs.getfraise.dev.
- Minimum prerequisites:
  - macOS or Linux host, or a Docker-capable host
  - Basic CLI knowledge
  - A simple agent that can call an HTTP endpoint (agent integrations are referenced in docs: https://docs.getfraise.dev)
- Artifacts to prepare: config file, a short ingestion script, and ~10 seed facts to exercise recall ranking.

Minimum acceptance criteria for a demo:
- Server /health returns OK within 30 s
- Remember → recall roundtrip completes and p95 latency is < 500 ms for simple queries

Docs reference: https://docs.getfraise.dev

## Step-by-step setup and implementation

1) Install Fraise (pick one install path shown in the docs):

```bash
# Homebrew (macOS)
brew install fraise

# Docker (portable)
docker run --rm -p 8080:8080 ghcr.io/getfraise/fraise:latest
```

See the installation section for release binaries and Linux packages: https://docs.getfraise.dev.

2) Start the server and check health

```bash
# run local binary in background
fraise serve --config ./config/config.yaml &
# verify
curl -sS http://localhost:8080/health | jq .
```

3) Minimal config file (config/config.yaml). Adjust paths and ports for production.

```yaml
server:
  http_addr: 0.0.0.0:8080
storage:
  path: /var/lib/fraise/data
scheduler:
  enabled: true
  max_concurrency: 4
```

Fields such as storage.path, server.http_addr and scheduler.max_concurrency are referenced in the docs: https://docs.getfraise.dev.

4) Wire Fraise into your agent pipeline

Fraise exposes an HTTP query API (endpoints include /query, /explain, /stats, /health). Example minimal memory config for an agent:

```json
{
  "memory": {
    "type": "http",
    "url": "http://fraise.internal:8080/query",
    "timeout_ms": 3000
  }
}
```

See integrations and HTTP API at https://docs.getfraise.dev.

5) Ingest sample memories

Use the remember verb to add facts. Seed ~10 facts for initial tests.

```bash
curl -X POST http://localhost:8080/query -d '{"q":"remember \"acme moved to annual billing on 2026-08-01\" topic:billing entity:acme"}'
```

6) Run recall and validate

```bash
curl -X POST http://localhost:8080/query -d '{"q":"recall billing entity:acme since:30d top:5"}' | jq .
```

Confirm results are capped (top:n) and recent items rank higher. Use /explain to inspect ranking decisions and /stats to measure latency and concurrency. See the HTTP API docs: https://docs.getfraise.dev.

7) Simple rollout plan (canary -> ramp)

- Start with 5% of sessions for 48 hours.
- If gates pass, ramp 5% → 25% → 100% over 1–2 weeks.
- Rollback via feature flag to previous memory provider if needed.

## Common problems and quick fixes

Problem: server won’t start or port conflict
- Quick fix: change server.http_addr (for example, 8080 → 8081) and restart. Verify storage.path permissions.

Problem: recalls return irrelevant items
- Quick fixes: increase top from 3 to 10, extend since from 30d to 90d, or call /explain to see why results scored poorly.

Problem: high recall latency
- Check /stats for p50/p95/p99. If CPU-bound, increase instance size or reduce embedding precision. Suggested pilot target: p95 < 500 ms.

Problem: persistence lost after restart
- Ensure storage.path is on a persistent disk and the process has write permissions.

Problem: token costs larger than expected
- Lower top, shorten since window, or pre-filter recalls by topic before sending to the LLM (large language model).

Quick troubleshooting table

| Symptom | First check (30 s) | Next step (5–30 min) |
|---|---:|---|
| No /health | Is process running? | Check logs and config ports |
| Irrelevant recalls | Call /explain | Tune top/since/topic |
| High latency | Check /stats p95 | Scale CPU or tune scheduler |

Reference: https://docs.getfraise.dev

## First use case for a small team

Pilot: a 3-person support team storing per-customer facts (billing events, escalation flags, preferences). Keep scope small and iterate quickly.

Concrete, actionable steps for solo founders / tiny teams:

1) Deploy quickly: use Docker on a small VM (1 vCPU, 2 GB RAM). Expected monthly cost range: $5–$20. See install options: https://docs.getfraise.dev.
2) Seed useful facts: add 10–30 recent events per active customer. Use remember to add facts and keep each fact under 512 tokens.
3) Limit what you surface: start with recall top:3 and since:30d. This keeps token output low and makes results easier to review.
4) Run a short canary: route 5% of traffic for 7–14 days. Spot-check 20 random sessions for relevance; target > 80% human relevance on spot-checks.
5) Automate simple ops: add a one-page runbook with three commands — start, stop, backup — and a health check script that polls /health every 60 s.

Operational checklist for the small team:
- [ ] Docker image running on 1 vCPU / 2 GB VM
- [ ] Seeded 10–30 facts per active customer
- [ ] recall default set to top:3 since:30d
- [ ] 5% canary traffic for 7–14 days

Docs for integrations and quickstart: https://docs.getfraise.dev

## Technical notes (optional)

- Retrieval model: Fraise uses hybrid ranking across full-text, graph and vector indices. Results are ranked and capped; recent memories outrank older ones. See Retrieval and Architecture in the docs: https://docs.getfraise.dev.
- Debug endpoints: /query, /explain, /stats, /health. Use /explain to understand ranking decisions and /stats for latency and concurrency metrics (p50/p95/p99). See HTTP API: https://docs.getfraise.dev.
- Concurrency and scheduler: Fraise includes a scheduler and multi-graph architecture. Tune scheduler.max_concurrency for higher ingest or recall throughput. See configuration reference: https://docs.getfraise.dev.

Short config knobs: storage.path, server.http_addr, scheduler.max_concurrency. Consult the docs for full settings: https://docs.getfraise.dev.

## What to do next (production checklist)

### Assumptions / Hypotheses
- Fraise runs reliably as a single process on a small VM for pilot workloads (up to a few 100s of writes/day).
- The hybrid recall model (full-text + vector + graph) will reduce token read-back by returning capped, ranked results (top:N).
- Pilot thresholds we will use for gating: p95 latency < 500 ms, human-checked recall relevance > 80%, initial token cost target per session (hypothesis) <$0.05.

### Risks / Mitigations
- Risk: recall relevance too low. Mitigation: increase top to 10, expand since to 90 d, use /explain to tune queries.
- Risk: data lost on restart. Mitigation: point storage.path to persistent disk, run nightly backups, and verify restores monthly.
- Risk: CPU/memory spikes. Mitigation: monitor /stats, set autoscale rule (for example, CPU > 70% for 5 min), and keep a feature-flag rollback path.

### Next steps
- Finalize production config: enable TLS, authentication, and persistent storage paths. Review scheduler settings and durability options in the docs: https://docs.getfraise.dev.
- Build monitoring: dashboards for p50/p95/p99 latencies, recall error rate, index size, and token-cost per session.
- Run a 2-week A/B test measuring token cost and human-evaluated recall relevance before full rollout.

Production checklist (quick):
- [ ] TLS + authentication enabled
- [ ] Backups scheduled and restore tested
- [ ] Dashboards for p50/p95/p99 and recall accuracy
- [ ] Feature flag for quick rollback
- [ ] Privacy review completed (fields excluded from memory)

Further reading and docs: https://docs.getfraise.dev
