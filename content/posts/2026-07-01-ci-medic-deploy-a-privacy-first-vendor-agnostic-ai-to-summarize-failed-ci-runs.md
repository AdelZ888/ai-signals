---
title: "CI-medic: Deploy a privacy-first, vendor-agnostic AI to summarize failed CI runs"
date: "2026-07-01"
excerpt: "CI-medic auto-summarizes failed CI runs into 1–3 diagnostic bullets, redacts secrets, and suggests next steps. Single-repo proof-of-concept in ~60–120 minutes; explore trade-offs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-01-ci-medic-deploy-a-privacy-first-vendor-agnostic-ai-to-summarize-failed-ci-runs.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "ci"
  - "ai"
  - "triage"
  - "devops"
  - "open-source"
  - "privacy"
  - "vendor-agnostic"
  - "github-actions"
sources:
  - "https://github.com/alitariq4589/ci-medic"
---

## TL;DR in plain English

- What this is: CI-medic is an open-source project that advertises "AI triage for failed CI runs" with a privacy-first, vendor-agnostic stance (https://github.com/alitariq4589/ci-medic).
- Why it helps: instead of reading long logs, CI-medic summarizes failures into short diagnostics (typically 1–3 bullets) and suggested next steps so engineers can triage faster. Expect initial usefulness after ~1–2 days of tuning and a reliable canary after ~50 failures or ~1–2 weeks of collection (https://github.com/alitariq4589/ci-medic).
- Quick expectations: a minimal single-repo setup takes ~60–120 minutes; targeting triage latency < 10,000 ms is a reasonable UX goal. Start in read-only mode and require >= 60% developer acceptance before wide automation (https://github.com/alitariq4589/ci-medic).

One-minute start checklist:

- [ ] Clone the repo (https://github.com/alitariq4589/ci-medic)
- [ ] Add a CI failure POST or webhook to a test instance
- [ ] Run one controlled failing job and inspect the generated issue

Example: a team spending 20+ minutes per flaky-test failure can often reduce mean time to triage to <10 minutes using short AI summaries and a 1–3 bullet format (https://github.com/alitariq4589/ci-medic).

## What you will build and why it helps

You will deploy a CI-medic service that receives failed CI payloads, redacts secrets, calls a model backend (local or API), and returns short diagnostics plus next steps. The repository presents itself as privacy-first and vendor-agnostic (https://github.com/alitariq4589/ci-medic).

Why this matters for small teams / solo founders:

- Saves repetitive time: reduces manual log reading for noisy suites.
- Directs work: helps separate infra failures from flaky tests so assignments are clearer.
- Lets you choose trade-offs: local hosting for privacy, managed API for lower ops.

Quick decision frame (local vs API vs hybrid):

| Option  | Sensitivity | Typical ops cost / month | Latency target | Suggested throughput |
|---------|-------------|--------------------------:|----------------:|--------------------:|
| Local   | High        | $50–$500 (GPU or VM)     | 200–2,000 ms     | 1–50 rps            |
| API     | Low/Medium  | $0.01–$0.50 per call     | 200–2,000 ms     | 1–1,000 rps         |
| Hybrid  | Medium      | Mixed                    | 200–10,000 ms    | tunable             |

(See repo summary: https://github.com/alitariq4589/ci-medic.)

## Before you start (time, cost, prerequisites)

- Time: 60–120 minutes for a minimal single-repo proof-of-concept. Add 2–4 hours for multi-repo wiring or strict redaction rules. Plan ~1–2 weeks or ~50 failures for a reliable canary.
- Cost: the code is open-source (https://github.com/alitariq4589/ci-medic). Model hosting: plan $50–$500/month for small local infra or variable per-call costs for managed APIs (e.g., $0.01–$0.50 per call depending on provider and model size).
- Prerequisites: Git access, basic CI knowledge (GitHub Actions/GitLab), and either a model endpoint or the ability to host one.

Preflight checklist:

- [ ] Clone https://github.com/alitariq4589/ci-medic
- [ ] Read the top-level README and architecture notes
- [ ] Decide local vs API model backend
- [ ] Configure a CI failure hook or add a CI step to POST failures to CI-medic

Minimum throughput guidance for small orgs: expect ~1–10 requests per second. Target triage latency under 10,000 ms (10 s) and error_rate < 5% for reasonable experience (https://github.com/alitariq4589/ci-medic).

## Step-by-step setup and implementation

Plain summary: get the code, choose where the model runs, configure CI-medic, wire CI to POST failures, test a controlled failure, then tune prompts and redaction based on human feedback (https://github.com/alitariq4589/ci-medic).

1) Get the code

```bash
git clone https://github.com/alitariq4589/ci-medic.git
cd ci-medic
ls -la
```

2) Choose a model backend

- Local: best for high-sensitivity logs; expect higher ops cost but full control.
- API: lower ops overhead; send only redacted snippets if privacy is a concern.

3) Add a minimal config (example YAML)

```yaml
# Minimal .ci-medic config (example)
version: 1
model:
  backend: "api"        # api | local
  endpoint: "https://model.example/api/v1/triage"
  timeout_ms: 10000
ci:
  webhook_secret: "REPLACE_ME"
  accepted_cis: [github_actions]
redaction:
  enabled: true
  max_chars: 5000
```

(Adapt fields from the repo and confirm exact schema at https://github.com/alitariq4589/ci-medic.)

4) Wire CI to send failures

Add a failing-job webhook or a step that triggers on failure and POSTs the payload. Example POST to a local test endpoint:

```bash
curl -X POST "https://ci-medic.example/internal/triage" \
  -H "Authorization: Bearer REPLACE_ME" \
  -H "Content-Type: application/json" \
  -d '{"ci":"github_actions","workflow":"test","status":"failed","logs":"..."}'
```

5) Validate and iterate

- Trigger a controlled failing job. Collect ~50 failures for a canary.
- Measure developer_acceptance_rate (target >= 60%) and triage_latency (target < 10,000 ms). If acceptance < 30% or error_rate > 5%, revert to read-only and iterate.

6) Rollout gates

- Canary: read-only outputs for 1 repo for 2 weeks or ~50 failures.
- Partial rollout: enable automated comments for ~10% of repos and monitor for 2 weeks.
- Full rollout: expand after meeting thresholds.

## Common problems and quick fixes

(Aligned with the project intent: https://github.com/alitariq4589/ci-medic.)

- No response from CI-medic
  - Check service health endpoint and confirm process is running.
  - Verify webhook secret and firewall rules.
  - Confirm model endpoint is reachable and not timing out.
  - Quick tip: set model timeout_ms >= 5,000 ms; 10,000 ms is a safe default.

- Low-quality triage suggestions
  - Trim logs to last 1,000–10,000 characters instead of sending complete logs.
  - Collect human feedback and iterate prompts weekly.

- Sensitive logs leak
  - Enable redaction immediately and match known secret patterns.
  - For high sensitivity, prefer local model hosting.

Quick troubleshooting checklist:

- [ ] Service process running
- [ ] Webhook secret matches
- [ ] Model endpoint reachable
- [ ] Redaction enabled if needed
- [ ] Logs trimmed to < 1,000,000 characters before sending

Common thresholds: triage_latency < 10,000 ms; developer_acceptance_rate >= 60%; error_rate alert > 5%; canary sample = 50 failures; rollout increment = 10% (https://github.com/alitariq4589/ci-medic).

## First use case for a small team

Scenario: a 5-person startup using GitHub Actions spends >20 minutes per flaky JS-test failure. Goal: reduce mean time to triage to <10 minutes and reclaim ~2 hours/week of engineering time (https://github.com/alitariq4589/ci-medic).

Concrete, actionable steps for solo founders / small teams (3+ clear items):

1) Lightweight, private start
   - Deploy a single CI-medic container in a private VPC or behind SSH for 30–60 minutes setup. Use read-only outputs (create issues instead of PR comments) for the first 2 weeks. See the repo for code and quick-start (https://github.com/alitariq4589/ci-medic).

2) Keep it cheap and fast
   - Use a managed API for the first 1–2 weeks if you need to avoid GPU ops. Limit sent logs to max 5,000 characters and set model timeout_ms to 10,000 ms to cap latency and cost.

3) Tight feedback loop
   - Spend 30–60 minutes per day reviewing new summaries for the first 2 weeks (target ~50 failures). Track acceptance_rate; aim for >= 60% before enabling automatic PR comments.

4) Automate minimal surface area
   - Trim logs to the last 5,000 characters, redact known tokens, and delete payloads after 7 days to limit storage. Start automated comments at 10% of repos once canary thresholds pass.

5) Cost and safety thresholds to enforce now
   - Monthly spend cap: $100 (configurable alert). Per-call timeout: 10,000 ms. Rollback trigger: acceptance_rate < 30% or error_rate > 5%.

Small-team rollout checklist (copyable):

- [ ] Start in read-only mode (issues/Slack) for 2 weeks
- [ ] Collect ~50 sample failures
- [ ] Measure acceptance_rate; proceed to partial automation if >= 60%
- [ ] Monitor triage_latency < 10,000 ms and error_rate < 5%

Reference code and repository: https://github.com/alitariq4589/ci-medic.

## Technical notes (optional)

Reference and code examples: https://github.com/alitariq4589/ci-medic.

- Redaction preprocessor: run regex-based scans to remove secrets and PII before sending logs. Target common keys like SECRET_KEY or API_TOKEN and long JWT-like strings.

- Vendor-agnostic adapter: normalize CI payloads to a single internal JSON shape so you can swap model backends without changing CI hooks. Example mapping:

```json
{
  "ci": "github_actions",
  "repo": "org/repo",
  "workflow": "test",
  "run_id": 12345,
  "logs_snippet": "...",
  "timestamp_ms": 1710000000000
}
```

- Metrics: store triage results and feedback. Compute triage_precision = accepted_suggestions / total_suggestions. Targets used in this doc: triage_precision >= 60%; alert if error_rate > 5% or triage_latency > 10,000 ms.

Methodology note: thresholds and steps are suggested planning targets informed by the project goals; confirm concrete schema and filenames in the repo before production (https://github.com/alitariq4589/ci-medic).

## What to do next (production checklist)

### Assumptions / Hypotheses

- CI-medic is described by its repo as "AI triage for failed CI runs" and positions itself as privacy-first and vendor-agnostic (https://github.com/alitariq4589/ci-medic). The rollout numbers here (canary = 50 failures, acceptance >= 60%, latency target = 10,000 ms) are practical planning targets, not fixed project requirements; verify exact config names and schemas in the repository.

### Risks / Mitigations

- Risk: sensitive data exposure.
  - Mitigation: enable redaction, keep payloads < 5,000 characters by default, delete payloads after 7 days, and prefer local hosting for highly sensitive projects.
- Risk: noisy or incorrect suggestions.
  - Mitigation: start read-only, require human review for first ~50 failures, and enforce an acceptance threshold (>= 60%) before auto-commenting.
- Risk: service outage delaying CI.
  - Mitigation: make CI-medic non-blocking in your CI; set model timeout_ms <= 10,000 ms and allow CI runs to continue if triage fails.

### Next steps

Short (0–2 days): clone https://github.com/alitariq4589/ci-medic, create a simple config, and run the quick curl POST test. Expect to spend ~60–120 minutes on core setup.

Medium (1–2 weeks): run a 2-week canary on one repo, collect ~50 failures, measure developer_acceptance_rate and triage_latency, and iterate prompts/redaction.

Long (1–3 months): add monitoring dashboards (latency, precision, error_rate), formalize data retention and privacy policies, and expand rollout in 10% increments until 100% after gates are met.

Final production checklist:

- [ ] Privacy audit and redaction in place
- [ ] Monitoring and alerts configured (latency, error rate, acceptance)
- [ ] Rollout gates documented (canary size, thresholds, rollback plan)
- [ ] Config versioning and changelog enabled

Repository reference: https://github.com/alitariq4589/ci-medic
