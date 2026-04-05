---
title: "agent_debugger: Local-first debugger for AI agents with replay, failure memory and drift detection"
date: "2026-04-05"
excerpt: "Quickstart to run agent_debugger locally: capture and replay agent sessions, index recurring failures into a searchable memory, and surface smart highlights and drift—see the repo for commands."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-05-agentdebugger-local-first-debugger-for-ai-agents-with-replay-failure-memory-and-drift-detection.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "agent-debugger"
  - "local-first"
  - "observability"
  - "ai-agents"
  - "debugging"
  - "replay"
  - "drift-detection"
  - "devtools"
sources:
  - "https://github.com/acailic/agent_debugger"
---

## TL;DR in plain English

- agent_debugger is a local-first agent debugger that provides replayable runs, a failure memory index, smart highlights, and drift detection (source: https://github.com/acailic/agent_debugger).
- Use it to capture and replay agent sessions so you can inspect failures without repeatedly trying to reproduce them by hand. The repository is the authoritative source for exact commands and schemas: https://github.com/acailic/agent_debugger.
- This guide is a concise workflow to get a local debugger running, capture a failing trace, and start a light triage process. Methodology note: details not specified in the repo are collected in the Assumptions / Hypotheses section below (see that section for numeric targets and config examples).

## What you will build and why it helps

You will stand up a local-first debugging workflow around the agent_debugger project to achieve three practical outcomes (all described in the repo):

- Replayable traces you can open and step through later.
- A searchable failure memory that groups similar failures for faster triage.
- Signal highlights and drift checks that surface behavior changes over time.

Why this helps: replays make failures reproducible and shareable, the failure memory helps prioritize recurring issues, and drift checks provide early warning of behavioral regressions. See the project for feature details: https://github.com/acailic/agent_debugger.

Artifacts you will produce (high level): a timestamped JSON replay file, indexed failure metadata, and a small local config to point the debugger at your replay folder (refer to the repo for exact schema and examples): https://github.com/acailic/agent_debugger.

## Before you start (time, cost, prerequisites)

Prerequisites (minimal, repo-backed):

- Git access to clone the project and read the README at https://github.com/acailic/agent_debugger.
- A developer workstation or VM where you can run local services and store replay files.
- Basic command-line tools (bash, PowerShell or equivalent) to run the repo examples.

Pre-flight checklist (light):

- [ ] Clone the repo: https://github.com/acailic/agent_debugger
- [ ] Read the README and any quickstart or troubleshooting docs in the repository
- [ ] Pick a single owner who will run the first captures and triage the first week

Refer to the repository for precise setup instructions and any platform-specific notes: https://github.com/acailic/agent_debugger.

## Step-by-step setup and implementation

Follow the repository README for exact startup and schema details; the repo is the source of truth: https://github.com/acailic/agent_debugger.

1) Clone the repository and inspect the README.

```bash
# clone and inspect the repo (official source)
git clone https://github.com/acailic/agent_debugger.git
cd agent_debugger
ls -la
sed -n '1,120p' README.md
```

2) Start the local debugger per the repository quickstart. The repo README contains the exact start commands and any Docker examples you should use: https://github.com/acailic/agent_debugger.

3) Instrument your agent to write replay files that the debugger can read. Confirm field names and serializer details from the repo before you instrument.

Decision frame (example to help choose priorities):

| Feature area | Priority | Notes / Next action |
|---|---:|---|
| Replay capture | High | Implement minimal serializer and save traces in an accessible folder (see repo) |
| Failure memory | Medium | Map replay metadata to an index; consult repository docs for examples |
| Drift checks | Low→Medium | Start dry-run checks and tune thresholds after ~baseline samples (repo covers the concept) |

4) Capture a failing session and open it in the local UI described in the repository. Use the UI to inspect highlights and to add a failure entry to the memory index.

5) Iterate: collect a small baseline set of replays, tune any heuristics, and validate drift checks in dry-run mode before enabling automated alerts. Always confirm exact configuration keys in the repository: https://github.com/acailic/agent_debugger.

## Common problems and quick fixes

(Reference: use repo docs for exact commands and migration scripts: https://github.com/acailic/agent_debugger.)

Problem: A replay file fails to load in the UI
- Quick checks: confirm the replay JSON matches the schema expected by the running debugger version; try a minimal replay sample provided or produced by the repo examples.

Problem: UI will not start or the server exits
- Quick checks: read the repository startup logs and README for platform requirements; try running any supplied diagnostic or migration scripts in the repo.

Problem: Highlights or failure grouping look noisy or sparse
- Quick checks: verify your trace fields match the serializer and highlight heuristics in the repository; instrument token counts, timestamps, and any tool-call markers the repo expects.

Useful inspection commands (adapt to repo scripts and names found in the README):

```bash
# list local replay files (example path may differ; check repo README)
ls -lh ./data/replays || echo "No local replays found — check repo README"
# run repo-provided diagnostics if present
[ -x ./scripts/diagnose.sh ] && ./scripts/diagnose.sh --check-replays || echo "See README in https://github.com/acailic/agent_debugger"
```

## First use case for a small team

Goal: a small team wants reproducible evidence for agent failures so fixes are faster and less guess-driven. The repository documents the core capabilities to support this local-first workflow: https://github.com/acailic/agent_debugger.

Suggested lightweight process (high level):

- Single-owner bootstrap: one teammate starts the debugger, captures an initial failing replay, and confirms it opens in the UI.
- Sample and tag: capture a small set of failing traces in staging and tag severity and short hypotheses in the UI or metadata index.
- Daily micro-triage: review the top few new failures and mark them for fix, experiment, or deprioritize. Keep triage time short and evidence-focused.
- Canary guardrails: use replays and failure memory to reason about rollout-related regressions before extended traffic increases.

See the repository for implementation and UI instructions: https://github.com/acailic/agent_debugger.

## Technical notes (optional)

The repository describes itself as local-first with features for replay, failure memory, smart highlights, and drift detection; consult the project for architecture and schema details: https://github.com/acailic/agent_debugger.

If you plan to add drift checks, confirm the expected replay schema in the repo and start with dry-run analyses before enabling alerts. Verify exact field names (timestamps, token counts, tool markers) in the serializing code or examples provided in the project.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repo advertises these core features: replay, failure memory, smart highlights, drift detection (source: https://github.com/acailic/agent_debugger).
- Suggested quickstart and numeric targets (examples for planning rather than repo-mandated values):
  - Capture 1 failing replay during initial bootstrap within 60 minutes (60). 
  - Reserve ~2 GB of disk for initial replay storage (2 GB).
  - Use a local UI port such as 8080 as an example (8080).
  - Build an initial baseline of about 50 samples for drift checks (50).
  - Sample 5%–10% of sessions or capture failing sessions only for staging (5%, 10%).
  - Example drift alert threshold: 10% initial, tune toward 5% after validation (10%, 5%).
  - Latency gate example: median latency <500 ms for rollout gates (<500 ms).
  - Retention examples: 7 days for sensitive traces; 30 days for non-sensitive traces (7 days, 30 days).
  - Severity tagging scale: 1–5 (5). 
  - Token or output thresholds for attention: >1000 tokens as a high-output check (>1000 tokens).
  - Cost examples: baseline local run $0; optional paid APIs or cloud storage estimated $5–$50/month ($0, $5–$50).

Example configuration template (adapt to the repository schema):

```yaml
# example peaky-config.yaml — TEMPLATE ONLY, confirm keys in the repo
server:
  host: 127.0.0.1
  port: 8080
storage:
  path: ./data/replays
drift:
  baseline_samples: 50
  alert_threshold_pct: 10
highlight:
  min_signal_strength: 0.05
```

Example quick start commands (template; confirm exact commands in repo README):

```bash
git clone https://github.com/acailic/agent_debugger.git
cd agent_debugger
# adapt the project's actual start command from README, e.g.:
# ./scripts/start-local-debugger.sh --config ./peaky-config.yaml
```

### Risks / Mitigations

- Risk: sensitive or PII-containing content appears in replays. Mitigation: redact or avoid recording PII, enforce access controls, and apply short retention (e.g., keep PII-tagged replays ≤ 7 days).
- Risk: noisy drift alerts produce fatigue. Mitigation: run drift checks in dry-run first, increase baseline samples (≥50), and require manual review before automated responses.
- Risk: storage or CI overload from capturing too many traces. Mitigation: sample a small fraction (5%–10%) of runs or store only failed-test replays; limit retention (7–30 days) to control costs.

### Next steps

Short term (24–72 hours): clone the repository, read the README, start a local instance as shown in the project docs, and capture one failing replay to confirm the end-to-end flow (see https://github.com/acailic/agent_debugger).

Medium term (1–2 weeks): instrument staging to collect a baseline (~50 runs), test drift checks in dry-run mode, and tune alerts.

Long term (1–3 months): integrate replay capture for failed CI runs only, add canary rollout gates informed by failure memory, and codify retention and access policies. Refer to the repository for concrete integration points and any provided examples: https://github.com/acailic/agent_debugger.

Copyable production checklist:

- [ ] Clone repo and read README: https://github.com/acailic/agent_debugger
- [ ] Start a local instance and confirm UI opens a saved replay
- [ ] Capture and tag at least one failing replay during bootstrap
- [ ] Build a baseline of ~50 runs for drift detection
- [ ] Tune an initial drift alert (example: 10% — validate toward 5%)
- [ ] Define retention and access policies for replays
