---
title: "Wasted Cycles — local wall-clock profiler for machine-blocking stalls in AI coding agent loops"
date: "2026-08-20"
excerpt: "Local-first wall-clock profiler that identifies machine-blocking stalls in AI agent loops: builds, tests, CI, containers. Run a checksum-verified binary to audit local traces and GitHub Actions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-20-wasted-cycles-local-wall-clock-profiler-for-machine-blocking-stalls-in-ai-coding-agent-loops.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 30
editorialTemplate: "NEWS"
tags:
  - "wasted-cycles"
  - "profiling"
  - "ai-agents"
  - "github-actions"
  - "local-first"
  - "developer-tools"
  - "observability"
  - "performance"
sources:
  - "https://zozo123.github.io/wasted-cycles/"
---

## TL;DR in plain English

- What it is: Wasted Cycles is a local-first wall-clock profiler that finds where machine time blocks agent loops (builds, tests, CI, containers, packages, sub-agents, and repeated machine work). See the project page: https://zozo123.github.io/wasted-cycles/

- How to try fast: verify the installer checksum, run the installer, and run a short audit. Example installer command: `curl -fsSL https://zozo123.github.io/cycles | sh` (verify checksum first). A quick profile: `wasted-cycles --days 7` (the command saves a JSON export). Source: https://zozo123.github.io/wasted-cycles/

- What you get: wall-clock totals and a short ranked list (example demo totals: AGENT LOOP 4h 59m; BLOCKED 2h 05m; Model work 1h 28m; Build 1h 06m; Tests 47m). Use the top blocker to prioritize work. Source: https://zozo123.github.io/wasted-cycles/

Quick checklist

- [ ] verify installer checksum and store it
- [ ] run `wasted-cycles --days 7` and save the JSON export
- [ ] open BREAKDOWN and note the top blocked category
- [ ] create one remediation ticket with baseline numbers

One-line methodology: Wasted Cycles measures elapsed (wall-clock) time and reports machine-blocked time separately from human wait. Source: https://zozo123.github.io/wasted-cycles/

## What changed

- Distribution and trust model: the tool is distributed as a checksum-verified binary, runs from a temporary directory, supports version pinning, requires no account, and does not upload traces by default (installer: `curl -fsSL https://zozo123.github.io/cycles | sh`). Source: https://zozo123.github.io/wasted-cycles/

- Measurement focus: it measures wall-clock elapsed time and classifies blocking sources—builds, tests, CI, containers, packages, sub-agents, repeated machine work—while reporting human wait separately. Source: https://zozo123.github.io/wasted-cycles/

- GitHub Actions support: `wasted-cycles github owner/repo --days 30` inspects completed workflow runs and reports queue delay, median and p95 latency, unsuccessful time, and per-workflow elapsed totals. Demo values include WORKFLOW LATENCY 22h 29m; QUEUE DELAY 0s; MEDIAN 38s; P95 33m; SUCCESS RATE 100% (84/84). Source: https://zozo123.github.io/wasted-cycles/

- Trace reading and classification: the tool reads existing traces in place (examples: Codex, Claude Code, Cursor, Grok) and classifies using structured event fields and executed commands; pasted logs/quoted commands are excluded. Source: https://zozo123.github.io/wasted-cycles/

## Why this matters (for real teams)

- Focus fixes on real machine stalls. Teams often optimize prompts or orchestration while the real delay is a build or test that blocks the agent loop; Wasted Cycles surfaces elapsed blocking time so you can pick the highest-impact change. Source: https://zozo123.github.io/wasted-cycles/

- Prioritize using measured thresholds. Example early targets: reclaim >=10% of AGENT LOOP elapsed time, reduce BLOCKED totals by >=30%, or cut workflow p95 by 30% (demo p95 = 33m). Use 7-day audits for quick feedback and 30-day windows for CI trends. Source: https://zozo123.github.io/wasted-cycles/

- Comparable baselines across sessions. Sessions are defined so metrics are stable: gaps >2 hours start a new session; shorter gaps cap at 30 minutes and remain visible in the JSON export. Source: https://zozo123.github.io/wasted-cycles/

## Concrete example: what this looks like in practice

1) Run: `wasted-cycles --days 30` and open BREAKDOWN. Source: https://zozo123.github.io/wasted-cycles/

2) Read totals and pick the top blocker. The scaled demo reports: AGENT LOOP 4h 59m; BLOCKED 2h 05m; Model work 1h 28m; Build 1h 06m; Tests 47m. Source: https://zozo123.github.io/wasted-cycles/

3) One measurable change and re-measure. Example targets you can aim for:

- Reclaim >=10% of AGENT LOOP elapsed time (baseline check).
- Reduce BLOCKED total by >=30% after one change.
- Cut workflow p95 by 30% (demo p95 = 33m) as an initial objective.

Immediate low-effort fixes to try (use the JSON export for exact numbers): enable dependency caching, pin build images to avoid repeated pulls, split long tests into 2–4 parallel shards, or move non-critical scans off-peak. Source: https://zozo123.github.io/wasted-cycles/

## What small teams and solo founders should do now

A short, concrete sequence tailored for solo founders and small teams (time estimates and actionable steps). Source: https://zozo123.github.io/wasted-cycles/

1) Fast audit (30–60 minutes)
- Verify the installer checksum, run the installer in a temporary directory, then run: `wasted-cycles --days 7`. Save the JSON export and note the top 1–2 blocked categories (e.g., Build 1h 06m, Tests 47m). Record AGENT LOOP and BLOCKED totals. Source: https://zozo123.github.io/wasted-cycles/

2) One-ticket, one-change (15–120 minutes)
- Create a single remediation ticket that records baseline BLOCKED and p95. Choose a single low-risk fix that you can implement in one deploy (examples: enable dependency cache, pin build image, add 2–4 test shards). After rollout, re-run the same `--days` profile and compare BLOCKED and p95. Aim to reclaim >=10% AGENT LOOP or cut BLOCKED by >=30%. Source: https://zozo123.github.io/wasted-cycles/

3) Lightweight repeatable cadence (10–30 minutes per week)
- Automate a weekly `wasted-cycles --days 7` export or run it manually, store the JSON alongside CI artifacts, and keep a simple changelog entry: who ran it, date, top blocker, and result. Use monthly 30-day GitHub profiling for CI: `wasted-cycles github owner/repo --days 30` to track QUEUE DELAY, MEDIAN and P95. Demo: QUEUE DELAY 0s; MEDIAN 38s; P95 33m. Source: https://zozo123.github.io/wasted-cycles/

Extra lean tips for solos
- If you have one machine: run locally and keep two exports (before/after) to avoid context switching.
- If you have a single CI pipeline: focus on the single workflow with the highest elapsed time (use the per-workflow totals in the JSON).
- Use the one-ticket rule to avoid scope creep: one ticket, one measurable rollback condition.

- [ ] Fast audit done (verify checksum + 7-day run)
- [ ] One remediation ticket created with baseline numbers
- [ ] Weekly export scheduled or logged

## Regional lens (UK)

- Local-first control: the binary runs locally, supports checksum verification and version pinning, and does not upload traces by default — useful for UK teams that prefer to keep traces on-prem or in a controlled vault. Source: https://zozo123.github.io/wasted-cycles/

- Measure real queue behavior: run `wasted-cycles github owner/repo --days 30` to expose QUEUE DELAY and p95 for your repo (demo QUEUE DELAY 0s; MEDIAN 38s; P95 33m). Store JSON outputs in an internal vault or CI artifact store for auditability. Source: https://zozo123.github.io/wasted-cycles/

UK operational checklist

- [ ] verify installer checksum before running
- [ ] run in an isolated temporary directory
- [ ] store JSON exports in an internal vault or CI artifact store
- [ ] log who ran the audit and when

## US, UK, FR comparison

| Jurisdiction | Typical priority | Why Wasted Cycles helps | First recommended step |
|---|---:|---|---|
| US | cost & dev velocity | Profile Actions p95 and runner use to target billed minutes and speed | `wasted-cycles github owner/repo --days 30` |
| UK | privacy & operational control | Local-first, checksum-verified binary avoids uploads | verify checksum & run local traces |
| FR / EU | compliance & data locality | No-upload design and local traces reduce transfer concerns | run locally and consult legal before sharing reports |

Notes: operational guidance only. Source: https://zozo123.github.io/wasted-cycles/

## Technical notes + this-week checklist

Short methodology note: Wasted Cycles measures wall-clock elapsed time; overlapping runs count separately and workflow latency is created_at → updated_at. Source: https://zozo123.github.io/wasted-cycles/

### Assumptions / Hypotheses

- The tool reports wall-clock elapsed time and separates human wait from machine-blocked time. Source: https://zozo123.github.io/wasted-cycles/
- Sessions: gaps >2 hours start a new session; shorter gaps are capped at 30 minutes in the JSON. Source: https://zozo123.github.io/wasted-cycles/
- Classification uses structured event fields and executed commands; pasted logs and quoted commands are excluded. Source: https://zozo123.github.io/wasted-cycles/

### Risks / Mitigations

- Risk: running the installer without checksum verification. Mitigation: always verify checksum and store it in your artifact registry before running. Source: https://zozo123.github.io/wasted-cycles/
- Risk: conflating elapsed wall-clock time with billing minutes. Mitigation: use elapsed time to prioritize blockers and consult billing reports separately for $ decisions. Source: https://zozo123.github.io/wasted-cycles/
- Risk: over-optimizing low-impact items. Mitigation: follow the one-ticket rule and use thresholds (>=10% AGENT LOOP reclaim, >=30% BLOCKED reduction, 30% p95 cut) as gates.

### Next steps

This-week checklist:

- [ ] Verify binary checksum and run a 7-day local profile: `wasted-cycles --days 7` (installer: `curl -fsSL https://zozo123.github.io/cycles | sh`). Save the JSON export. Source: https://zozo123.github.io/wasted-cycles/
- [ ] If you use GitHub Actions, run: `wasted-cycles github owner/repo --days 30` and record QUEUE DELAY, MEDIAN, P95, and per-workflow elapsed totals (demo: WORKFLOW LATENCY 22h 29m; MEDIAN / P95 38s / 33m; SUCCESS RATE 100% for 84/84 runs). Source: https://zozo123.github.io/wasted-cycles/
- [ ] Create one remediation ticket for the top blocker with baseline numbers and an acceptance target (e.g., BLOCKED down by >=30% or p95 down by 30%).
- [ ] Implement the change behind a rollout gate and re-run the profiler using the same `--days` window.
- [ ] Compare JSON exports (before/after) and confirm thresholds before wider rollout.

If you want, I can convert the checklist into a one-page ticket template that records baseline numbers, acceptance criteria, and rollback conditions, or produce shell snippets to verify checksums and archive JSON exports.
