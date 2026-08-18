---
title: "Tracelint: deterministic linter for agent execution traces"
date: "2026-08-18"
excerpt: "Use Tracelint to statically analyze saved agent execution traces and surface reproducible evidence for ignored tool errors, schema violations, and loops—plus CI rollout tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-18-tracelint-deterministic-linter-for-agent-execution-traces.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "tracelint"
  - "agent-traces"
  - "linting"
  - "ai-agents"
  - "ci"
  - "observability"
  - "oss"
  - "testing"
sources:
  - "https://github.com/AshwinUgale/tracelint"
---

## TL;DR in plain English

- What changed: Tracelint is an open-source, deterministic linter that inspects agent execution traces and flags structural bugs (ignored errors, schema violations, loops) with evidence and without an LLM judge (source: https://github.com/AshwinUgale/tracelint).
- Why it matters: when an agent run fails or continues after a tool error, Tracelint surfaces reproducible evidence tied to specific trace steps so you can fix orchestration or parsing logic instead of guessing from downstream symptoms (see repo: https://github.com/AshwinUgale/tracelint).
- Quick action (3 steps):
  1. Export a saved execution trace from a test run in JSON (or your framework's trace format).
  2. Run the linter locally against that trace and inspect the produced evidence JSON.
  3. Add a CI job to run the linter on trace artifacts and decide gate rules (for example: block merges on any ERROR).

Concrete numbers to keep in mind: sample rollout windows of 7 days, advisory canary for 1 protected branch, 0 ERRORs allowed on strict branches, allow up to 5% WARNINGS during initial rollout, and cap PR-run traces at 10 MB or 1,000 steps to avoid slow CI. Repo: https://github.com/AshwinUgale/tracelint

## What you will build and why it helps

You will add a deterministic lint step that scans saved agent execution traces and produces evidence-backed findings for structural defects such as ignored tool errors, schema violations, and loops. The project describes itself as "a deterministic linter for agent runs" and emphasizes evidence-based findings and "No LLM judge" (https://github.com/AshwinUgale/tracelint).

Why this helps:
- Faster triage: evidence points to the specific step and message in a trace.
- Fewer silent failures: the linter highlights when a tool returned an error that the agent ignored.
- Auditability: trace + evidence makes reviews and postmortems reproducible.

Decision table (example):

| Severity | Typical action | Allowed during rollout |
|---:|---|---:|
| ERROR | Block merge, create urgent ticket | 0 ERRORs on protected branches |
| WARNING | Create backlog ticket, annotate PR | Allow up to 5% WARNINGS during initial rollout |
| INFO | Record for monitoring | Unlimited (for trend analysis) |

(Reference: project description at https://github.com/AshwinUgale/tracelint)

## Before you start (time, cost, prerequisites)

Estimated time and cost:
- Local quick test: ~60 minutes to clone and run a sample lint.
- CI integration and tuning: 2–8 hours depending on existing CI and artifact wiring.
- Ongoing cost: developer time and CI minutes. Tracelint is OSS (no license fee) — repo: https://github.com/AshwinUgale/tracelint.

Prerequisites checklist:
- [ ] Access to the Tracelint repo: https://github.com/AshwinUgale/tracelint
- [ ] At least one saved execution trace from a test run (JSON or your framework's trace format)
- [ ] Git access and permission to add a CI job
- [ ] Decision on which severities block merges (example: 0 ERRORs)

Suggested upfront operational thresholds (examples you can tune):
- Fail on any ERROR in PR gating: 0 ERRORs allowed.
- WARNING tolerance during rollout: 5% of PRs with only WARNINGS allowed.
- Per-item parse timeout target in CI: 200 ms.
- Max PR-run trace size: 10 MB or 1,000 steps; larger traces go to nightly jobs.

Repo link: https://github.com/AshwinUgale/tracelint

## Step-by-step setup and implementation

Plain workflow summary: clone the repo, prepare a saved trace, run the linter locally, review evidence, then add a CI job that evaluates the linter output against your policy.

1) Clone and inspect

```bash
git clone https://github.com/AshwinUgale/tracelint.git
cd tracelint
# Inspect README and examples in the repo before running
```

2) Prepare a saved trace
- Export one execution trace from an agent test run in JSON (or adapt your framework's format) and keep it under 10 MB for a PR-run. Larger traces can be split or processed nightly.

3) Run the linter locally (illustrative command)

```bash
# Example pattern (adjust to the repo's CLI):
./bin/tracelint lint ./examples/sample-trace.json --output evidence.json
```

4) Review evidence
- The linter output is evidence-oriented: each finding should point to a trace step, a message, and a reason (ignored-error, schema-violation, loop-detected).
- Map severity to your policy (block merge vs. annotate).

5) Add config and CI gate (example config)

```yaml
# tracelint.yaml (illustrative example)
rules:
  ignored-errors:
    severity: ERROR
  schema-violation:
    severity: WARNING
  loops-detected:
    severity: ERROR
thresholds:
  max-trace-size-mb: 10
  max-steps: 1000
ci:
  fail-on-severity: ERROR
```

6) CI job example (illustrative):

```bash
# run linter in CI and fail on ERRORs
./bin/tracelint lint artifact/trace.json --format json -o tracelint_out.json
if jq '.errors | length' tracelint_out.json | grep -qv '^0$'; then
  echo "Tracelint found ERRORs; failing CI"
  exit 1
fi
```

Rollout gates to reduce disruption: start advisory (Day 0–7), canary blocking (Day 8–21), full enforcement after stability. Repo: https://github.com/AshwinUgale/tracelint

## Common problems and quick fixes

- Problem: Tracelint can't parse your trace format.
  - Fix: add a small adapter that converts your trace into the linter's expected JSON shape; open an issue or PR at the repo if you want upstream support: https://github.com/AshwinUgale/tracelint.
- Problem: CI fails because traces are missing.
  - Fix: persist the trace artifact from the test step and add a pre-check that exits with a clear code (example: exit code 2) when missing.
- Problem: noisy WARNINGS on large or noisy runs.
  - Fix: filter traces to the segment you care about, temporarily increase WARNING tolerance to 5%, then reduce as rules improve.
- Problem: long lint times on very long traces (> 1,000 steps).
  - Fix: cap PR-run traces at 10 MB or 1,000 steps and process full traces in a nightly batch.

Quick troubleshooting checklist:
- [ ] Confirm trace file exists and matches a JSON shape used by your adapter.
- [ ] Run local lint and reproduce CI behavior within ~60 minutes.
- [ ] Capture evidence JSON for false positives and open an issue at https://github.com/AshwinUgale/tracelint if needed.

## First use case for a small team

Scenario: a 3-person startup automates ticket triage. They add Tracelint as a PR check to detect ignored tool errors.

Rollout suggestion:
1. Advisory mode for 7 days on a canary branch; annotate PRs with evidence but do not block merges.
2. Triage ERRORs found in that week. If the backlog of ERRORs > 5, plan a focused fix sprint.
3. After ERRORs trend to 0 for 7 consecutive days on canaries, enable blocking on protected branches.

Metrics to track (targets):
- Weekly distinct ERRORs: target 0 within a few sprints.
- Mean time to fix ERROR: target <= 2 days.
- False-positive noise rate for WARNINGS: target <= 5%.

Small team responsibilities (example estimates):
- Developer A: wire trace export and CI artifact (~4 hours).
- Developer B: create tracelint config and PR annotations (~2 hours).
- PM / on-call: decide severity actions and monitor metrics weekly.

Repo: https://github.com/AshwinUgale/tracelint

## Technical notes (optional)

- Deterministic approach: Tracelint inspects saved traces and flags structural issues with evidence instead of using an LLM to judge runs (source: https://github.com/AshwinUgale/tracelint).
- Adapter layer: if your agent emits a custom schema, build a small adapter that normalizes to the linter's expected shape and include unit tests with at least 10 sample traces (varied sizes: 1 step, 10 steps, 100 steps).
- Performance guidance: aim for per-item parse targets of ~200 ms and cap PR-run traces to 10 MB / 1,000 steps; large traces should be scheduled to nightly runs.

Example minimal adapter JSON shape (illustrative):

```json
{
  "trace_id": "run-123",
  "steps": [
    {"type": "tool_call", "status": "error", "output": "..."}
  ]
}
```

Repo: https://github.com/AshwinUgale/tracelint

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: Tracelint inspects saved execution traces and flags structural bugs (ignored errors, schema violations, loops) with evidence; it does not rely on an LLM judge (https://github.com/AshwinUgale/tracelint).
- Hypothesis: Adding a deterministic lint step will reduce silent failures and speed triage for your agent flows by making structural defects visible in CI.

Methodology note: the commands and config examples above are illustrative; check the repository README for exact CLI and supported config keys (single authoritative source: https://github.com/AshwinUgale/tracelint).

### Risks / Mitigations

- Risk: High false-positive rate blocks critical work.
  - Mitigation: start advisory mode for 7 days; allow up to 5% WARNINGS during initial rollout; tune rules before blocking merges.
- Risk: Large traces slow CI or exceed runner limits.
  - Mitigation: cap trace size to 10 MB and 1,000 steps for PR checks; process large traces in nightly jobs.
- Risk: Missing trace artifacts cause flaky CI failures.
  - Mitigation: add a pre-check that fails with a clear message if the trace artifact is absent and document trace export steps.

### Next steps

- Day 0: clone https://github.com/AshwinUgale/tracelint and run a local lint against a sample trace in ~60 minutes.
- Day 1–7: run in advisory mode on a canary branch; collect evidence and fix high-priority ERRORs.
- Day 8–21: enable blocking on a subset of protected branches; measure ERROR count and time to fix.
- Week 4: expand to all protected branches if canary ERRORs remain at 0 for 7 consecutive days.

Rollout quick plan:
- Canary gate: run on 1 protected branch for 7 days.
- Feature flag: enable for 25% of PRs then 100% when stable.
- Rollback gate: if > 50% of PRs fail due to noise in the first 72 hours, disable the CI job and open a tuning PR.

Repo reference: https://github.com/AshwinUgale/tracelint
