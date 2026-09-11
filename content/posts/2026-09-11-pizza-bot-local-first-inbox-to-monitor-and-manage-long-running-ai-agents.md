---
title: "Pizza Bot: Local-first inbox to monitor and manage long-running AI agents"
date: "2026-09-11"
excerpt: "Run a local Pizza Bot instance to monitor and control long-running AI agent jobs. The repo includes setup steps, a validation checklist, and DeepAgents/LangGraph notes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-11-pizza-bot-local-first-inbox-to-monitor-and-manage-long-running-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "pizza-bot"
  - "ai-agents"
  - "local-first"
  - "long-running"
  - "DeepAgents"
  - "LangGraph"
  - "tutorial"
  - "open-source"
sources:
  - "https://github.com/pizza-bot-app/pizza-bot"
---

## TL;DR in plain English

Pizza Bot is an open-source, local-first inbox for long-running AI agents. The repository describes it as "A local-first inbox for long-running AI agents, built with DeepAgents and LangGraph." See the project page: https://github.com/pizza-bot-app/pizza-bot.

It gives a simple UI to watch and manage background jobs. You can see queued work, running jobs, and final states. The repo page is the primary reference: https://github.com/pizza-bot-app/pizza-bot.

Quick practical start: get the repository, prepare a local config, run the app, and POST a test task to the inbox endpoint to see it in the UI. For source and context, refer to: https://github.com/pizza-bot-app/pizza-bot.

Methodology note: this summary is based on the repository snapshot at the linked URL above.

## What you will build and why it helps

You will run a local development instance of Pizza Bot from the repository: https://github.com/pizza-bot-app/pizza-bot. The running app provides an inbox-style UI and a light control plane for long-running agents. The repo explicitly names DeepAgents and LangGraph as integration points: https://github.com/pizza-bot-app/pizza-bot.

Why this helps:
- Visibility: inspect queued → running → done states in a single place.
- Control: retry, cancel, or intervene for individual items in the queue.
- Local-first: run on a laptop or small server to keep data and costs constrained.

Decision table — quick guidance where to run (example):

| Constraint | Run locally | Run on dev server | Run in cloud |
|---|---:|---:|---:|
| Latency requirement <200 ms | ✅ | ✅ | ✅ |
| Sensitive data | ✅ | ✅ | ❌ (evaluate) |
| Uptime >99% | ❌ | ✅ | ✅ |
| Team size 1–3 | ✅ | ✅ | ✅ |

Reference and source: https://github.com/pizza-bot-app/pizza-bot.

## Before you start (time, cost, prerequisites)

- Time: plan for a focused validation session. See the repo for entry points: https://github.com/pizza-bot-app/pizza-bot.
- Cost: the code is open-source at the link above; running locally can be $0. For shared access, a small VM will add hosting costs. See the project: https://github.com/pizza-bot-app/pizza-bot.
- Prerequisites: Git and a terminal. Check the repository README for any runtime or tool versions: https://github.com/pizza-bot-app/pizza-bot.

Quick checklist (local validation):
- [ ] Clone the repository: https://github.com/pizza-bot-app/pizza-bot
- [ ] Inspect the repository README for required runtimes and tools: https://github.com/pizza-bot-app/pizza-bot
- [ ] Reserve a writable path for local persistence
- [ ] Decide a dev port and local inbox endpoint for your test agent

## Step-by-step setup and implementation

1) Clone the repo and enter the directory (example):

```bash
git clone https://github.com/pizza-bot-app/pizza-bot.git
cd pizza-bot
```

2) Install dependencies (example commands — check the repository README for exact toolchain):

```bash
npm install
# or
# pnpm install
```

3) Example local config (adjust per the repo README):

```yaml
# example local config
PORT: 3000
STORAGE_PATH: ./data/pizza-bot.db
INBOX_ENDPOINT: http://localhost:3000/api/inbox
```

4) Start a development instance (example; verify start command in the repo):

```bash
npm run dev
# or
# pnpm dev
```

Open the UI at the configured port (example: http://localhost:3000). See the project page for reference: https://github.com/pizza-bot-app/pizza-bot.

5) Post a simple test task (payload example) to exercise the inbox endpoint:

```json
{
  "task_id": "local-001",
  "type": "test",
  "payload": { "prompt": "Test task — short output" }
}
```

```bash
curl -X POST -H "Content-Type: application/json" --data @payload.json http://localhost:3000/api/inbox
```

6) Verify the UI shows the queued task and follow state transitions. If you plan integrations (DeepAgents or LangGraph), consult the repository for integration notes: https://github.com/pizza-bot-app/pizza-bot.

Note: the repo snapshot at the link above is the authoritative starting point for exact commands and config keys: https://github.com/pizza-bot-app/pizza-bot.

## Common problems and quick fixes

Reference: https://github.com/pizza-bot-app/pizza-bot.

Symptoms, where to look, and quick fixes:

| Symptom | Log / file to inspect | Immediate fix |
|---|---|---|
| App fails to start | stdout / package logs | Re-run dependency install; re-check runtime versions against repo README |
| Tasks never arrive | server access logs / inbox endpoint | Verify the POST target matches your INBOX_ENDPOINT; retry test payload |
| UI shows stale data | local storage file, permissions | Check STORAGE_PATH permissions and restart the process |

Quick checks:

```bash
# verify node is present (example)
node -v || echo "node not found"
# check port 3000 is listening (example)
ss -ltnp | grep 3000 || echo "port 3000 not listening"
```

Operational thresholds to watch during an early validation (move to production only after canary):
- Warning/error thresholds: warning at 5% error rate, critical at 10% error rate
- Queue depth gate for early rollout: 50 tasks
- Early job-time target: <600s (10 minutes)
- Start retry policy: 3 retries, 60s retry delay

For more repository context, see: https://github.com/pizza-bot-app/pizza-bot.

## First use case for a small team

Audience: solo founders and teams of 1–3. Source: https://github.com/pizza-bot-app/pizza-bot.

Concrete plan for 1–3 people:
1. Run locally and validate flows. Use a short session for initial proof-of-concept. See the repo: https://github.com/pizza-bot-app/pizza-bot.
2. If you need shared access, move to a small VM and limit users to 1–3. Keep backups and access controls.
3. Assign a single owner who can recover the instance quickly.
4. Track simple metrics during the 7-day internal trial: daily task count, avg job time, failure rate.
5. Start with conservative defaults (retry count and retry delay) and tune after the canary.

Team rollout checklist (small-team focused):
- [ ] Owner assigned and reachable
- [ ] One-page runbook created and shared
- [ ] One-week internal validation completed using repository code: https://github.com/pizza-bot-app/pizza-bot
- [ ] Decision to keep local or move to a small VM

## Technical notes (optional)

- Project description in the repository: "A local-first inbox for long-running AI agents, built with DeepAgents and LangGraph." See: https://github.com/pizza-bot-app/pizza-bot.
- Social signals seen in the repo snapshot: 79 stars and 6 forks on the project page: https://github.com/pizza-bot-app/pizza-bot.
- Persistence approach for quick validation: local file DB (example: SQLite). For shared hosting add regular backups and access control.

Example agent hook config (JSON, example values):

```json
{
  "inbox_url": "http://localhost:3000/api/inbox",
  "max_retries": 3,
  "retry_delay_seconds": 60,
  "max_tokens": 1000
}
```

Health-check example (poll every 30s):

```bash
# simple health check polling every 30 seconds
while true; do curl -fsS http://localhost:3000/health || echo "service down"; sleep 30; done
```

Refer to the repository for code-level details: https://github.com/pizza-bot-app/pizza-bot.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository at https://github.com/pizza-bot-app/pizza-bot provides a dev-friendly start and names DeepAgents and LangGraph as integration points.
- Numeric planning guidance for an early trial (example values to be validated):
  - Setup validation time: ~90 minutes
  - Trial period: 7 days
  - Retry limit per task: 3 retries
  - Retry delay: 60 seconds
  - Health-poll interval: 30 seconds
  - Alert thresholds: warning at 5% error rate, critical at 10% error rate
  - Queue depth gate for rollout: 50 tasks
  - Token budget guidance: 500–1000 tokens per task
  - Small VM cost guidance: $5–$50/month

### Risks / Mitigations

- Risk: Sensitive data stored locally is exposed. Mitigation: avoid cloud-sync of dev storage, encrypt backups, and limit access to a small group.
- Risk: Failure rate increases after scale (>10%). Mitigation: gate rollouts with a 7-day canary and observable rollback triggers.
- Risk: Unexpected billing on a shared host. Mitigation: set billing alerts and caps (example cap $50/month) and enforce autoscaling limits.

### Next steps

- Harden auth and role-based access before production. Start with two roles: admin and reviewer.
- Add observability: health endpoint polled every 30s, metrics for queue depth and avg latency, alerts for failure rate >5%.
- Run a 1-week internal canary with gates: queue depth <50, failure rate <5%, average job time <600s.
- Prepare rollback: keep the previous deployable artifact and a runbook that enables rollback within 30 minutes.

Practical summary: start locally using the repository at https://github.com/pizza-bot-app/pizza-bot to validate flows with a small team. Track simple metrics (task count, avg job time, failure rate), then harden and gate any production rollout.
