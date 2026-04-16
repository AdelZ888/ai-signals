---
title: "LeftGlove — an MCP server (npx) that wraps ShiftLefter for agent and human web exploration"
date: "2026-04-16"
excerpt: "Setup LeftGlove locally with npx to run an MCP server that wraps ShiftLefter, surfacing pages, forms and interactions for agents and humans to review, annotate, and export."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-16-leftglove-an-mcp-server-npx-that-wraps-shiftlefter-for-agent-and-human-web-exploration.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "leftglove"
  - "shiftlefter"
  - "mcp"
  - "npx"
  - "agents"
  - "web-ui"
  - "testing"
  - "tutorial"
sources:
  - "https://github.com/stephenchilcote-gauntlet/leftglove"
---

## TL;DR in plain English

- LeftGlove is an MCP server that wraps ShiftLefter and gives both agents and humans a shared interface to explore, catalog, and test web apps. See the repository: https://github.com/stephenchilcote-gauntlet/leftglove
- Quick wins:
  - Run it locally and see the web UI in minutes.
  - First useful discovery often appears in under 5 minutes on a local machine.
  - Expect a basic, usable catalog after 2–4 hours of focused work.
- Example scenario: a solo founder points LeftGlove at a 10-page marketing site, runs the server locally, reviews discoveries for 30–60 minutes, and exports 3 smoke checks for CI.

## What you will build and why it helps

You will set up a locally runnable MCP server that acts as a mediator between programmatic agents and a human web UI. The service collects discoveries (pages, forms, interactions) so team members can review, annotate, and reuse them. The repository describes LeftGlove as an "MCP server wrapping ShiftLefter" with an agent/human interface: https://github.com/stephenchilcote-gauntlet/leftglove.

Plain-language note before advanced details
- This guide focuses on practical steps you can follow now. The repo contains the code and more precise schemas. Use this guide to get a local proof-of-concept running, then read the repo for exact CLI flags and schemas.

Why this is useful for small teams
- Reduce duplicated scrapers across 2–5 ad‑hoc scripts.
- Let product managers (PMs) and QA confirm agent findings before they change pipelines or tests.
- Shorten feedback loops: expect a few quick tuning cycles (minutes to a few hours).

Quick success metrics that are easy to measure
- Time to first discovery: under 5 minutes on a local machine.
- Discovery coverage: aim for >= 90% of expected pages after 1–2 runs.
- Approval gate: >= 80% of critical pages approved by a PM before promotion.

Reference: https://github.com/stephenchilcote-gauntlet/leftglove

## Before you start (time, cost, prerequisites)

Estimated time and cost
- Local setup: 45–90 minutes for a single developer.
- Integrate with agents / team workflow: 2–4 hours.
- Optional cloud VM cost: roughly $0.02–$0.40 per hour, depending on instance size.

Minimum prerequisites (suggested)
- Node >= 18 installed.
- A modern browser to open the web UI.
- Port 3000 (or another configured port) available.
- Permission to scan the target sites. Only point LeftGlove at sites you control or have explicit permission to test.

Quick checklist
- [ ] Node >= 18 installed (node --version shows 18.x+).
- [ ] Port 3000 free or configured port open.
- [ ] Target URLs (start with 1–25 items) identified and authorized.

Security note: only test sites you own or have permission to test. See the repo: https://github.com/stephenchilcote-gauntlet/leftglove

## Step-by-step setup and implementation

1) Prepare the host
- Verify Node and port availability.

```bash
node --version   # expect v18.x or newer
lsof -i :3000    # confirm port 3000 is free
```

2) Obtain the code
- Clone the repository or run from a package runner. The repo is here: https://github.com/stephenchilcote-gauntlet/leftglove

3) Example minimal configuration (illustrative)
- This JSON shows common config keys you will see or mimic. Validate exact names in the repo before production.

```json
{
  "port": 3000,
  "allowedOrigins": ["http://localhost:8080"],
  "agentApiKey": "change-me",
  "maxConcurrentSessions": 3
}
```

4) Provide targets to catalog
- Start small: 1–25 URLs. Keep the first run to 5–25 targets so you can iterate quickly.

```json
{
  "targets": [
    "https://example.local/page1",
    "https://example.local/page2"
  ]
}
```

5) Start the server and smoke test
- Open the UI at http://localhost:3000 (or the port you configured). Look for the UI to load and for agent endpoints to report OK.

6) Connect an agent and test the endpoint
- A simple curl call tests the agent endpoint. Replace the API key and URL if you changed them.

```bash
# example curl test (illustrative)
curl -s -o /dev/null -w "%{http_code} %{time_total}s" -H "Authorization: Bearer change-me" "http://localhost:3000/agent/ping"
```

7) Tune concurrency and timeouts
- For initial runs, set maxConcurrentSessions = 1–3.
- If interactions fail, try timeouts of 10–20 seconds. Monitor CPU and memory and reduce concurrency if needed.

Rollout guidance
- Canary: run on a single VM with maxConcurrentSessions = 1 and exercise ~100 page checks over 24 hours. Expand only after the canary is stable.

Source: https://github.com/stephenchilcote-gauntlet/leftglove

## Common problems and quick fixes

| Symptom | Likely cause | Quick fix |
|---|---:|---|
| Server fails to start | Port in use or wrong Node version | Check node --version, free the port, restart (expected < 5 min) |
| UI unreachable | CORS / allowedOrigins mismatch | Add origin, restart server (10–30 s) |
| Agent 500s or timeouts | Headless browser timeouts or resource limits | Increase timeout to 10–20 s, reduce concurrency to 1–3 |
| Low discovery coverage | Crawl depth or navigation rules | Add explicit targets and rerun 1–3 times |

Quick commands

```bash
# basic checks
node --version
lsof -i :3000
# view logs (example)
tail -n 200 logs/leftglove.log
```

Practical operational thresholds
- UI metadata endpoints: 200–500 ms response time target.
- Page interaction latency: 500 ms–5 s target.
- Error-rate rollback threshold: 1% over 1 hour.

Tips for small ops teams
- If CPU spikes above 80% for > 30 s, reduce concurrency to 1–2 sessions.
- Keep a 5-step runbook and plan for a 15-minute on-call response window during the first 48 hours after deployment.

Reference: https://github.com/stephenchilcote-gauntlet/leftglove

## First use case for a small team

Scenario: a solo founder or a small team (1–3 people) wants a human-reviewed catalog of a marketing site with 10–25 pages. The repo describes LeftGlove as an MCP server wrapping ShiftLefter: https://github.com/stephenchilcote-gauntlet/leftglove

Concrete, actionable steps for a small team

1) Start small and local
- Pick 5–10 most important pages. Run the server locally and target only those. This keeps the first run under 30–60 minutes.

2) Limit resource use
- Set maxConcurrentSessions = 1–2 to keep CPU and memory low. If memory > 75% or CPU > 80% for > 30 s, pause and reduce concurrency.

3) Fast human review loop
- Hold a 30–60 minute review session. Approve or tag discovered items. Prioritize the top 5 pages for immediate automation.

4) Automate the critical checks
- Export or codify 3–5 smoke checks for critical pages. Run these in your CI pipeline and gate merges on passing checks.

5) Keep runs repeatable
- Save your targets file and config so you can rerun the discovery in 5–10 minutes when needed.

Example time budget for a small team
- Setup: 45–90 minutes.
- First discovery + review: 30–60 minutes.
- Automate critical checks: 1–2 hours.

Repo reference: https://github.com/stephenchilcote-gauntlet/leftglove

## Technical notes (optional)

Architecture note
- The repository describes LeftGlove as an MCP server that wraps ShiftLefter and provides an agent + human interface plus an HTTP API for agents: https://github.com/stephenchilcote-gauntlet/leftglove

Performance guidance (illustrative)
- Max concurrent sessions on a dev machine: 1–5.
- For production, only increase to 10–50 concurrent sessions after load testing.
- Retain logs for 30 days and rotate API keys every 90 days.

Example production config (illustrative)

```json
{
  "port": 443,
  "tls": {"certPath": "/etc/ssl/certs/fullchain.pem", "keyPath": "/etc/ssl/private/key.pem"},
  "maxConcurrentSessions": 10,
  "logsRetentionDays": 30
}
```

Security recommendations
- Store API keys in environment variables, rotate keys regularly, and whitelist a small set of trusted origins.

Reference: https://github.com/stephenchilcote-gauntlet/leftglove

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository explicitly identifies LeftGlove as an "MCP server wrapping ShiftLefter" and as an agent/human interface (source: https://github.com/stephenchilcote-gauntlet/leftglove).
- CLI invocations (for example, `npx leftglove`), config keys (port, allowedOrigins, agentApiKey, maxConcurrentSessions), filenames (leftglove.config.json, targets.json) and endpoints (/agent/ping) used above are illustrative patterns. They are plausible but not fully verified by the single snapshot. Validate the exact CLI and schema in the repo before production.
- Suggested numeric thresholds (Node >= 18, timeouts 10–20 s, concurrency 1–10, error-rate gate 1%, retention 30 days) are operational recommendations. Tune them to your environment.

### Risks / Mitigations

- Risk: exposing the server publicly may leak agent access or enable unintended crawling.
  - Mitigation: enable TLS, use API keys, restrict allowedOrigins to a small whitelist (<= 10), and place the service behind an authenticated reverse proxy.
- Risk: headless browsers consume CPU or memory, causing degraded performance.
  - Mitigation: limit maxConcurrentSessions to 1–3 for small VMs; monitor CPU > 80% and memory > 75% as alerts; scale horizontally after load testing.
- Risk: noisy discoveries create false positives.
  - Mitigation: require human review gates and set PM approval thresholds (e.g., >= 80%) before changes are promoted.

### Next steps

1) Validate CLI and config schema in the repository: https://github.com/stephenchilcote-gauntlet/leftglove.
2) Create a small CI job that:
   - boots LeftGlove in a container,
   - runs a quick agent test (HTTP 200) and a discovery count check (for larger target sets, expect more discoveries),
   - fails the pipeline if error rate > 1% or median discovery time > 5 s.
3) Canary rollout: deploy to 1 VM, run ~100 page checks over 24 hours with maxConcurrentSessions = 1, then broaden if stable.
4) Operationalize: set logging retention to 30 days, add monitoring alerts for error rate > 1% and median discovery time > 5 s, and schedule key rotation every 90 days.

Repository: https://github.com/stephenchilcote-gauntlet/leftglove
