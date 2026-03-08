---
title: "TracePact: Record golden AI-agent tool-call traces and diff runs to catch regressions in CI"
date: "2026-03-08"
excerpt: "Record a golden AI-agent tool-call trace with TracePact, diff new runs to spot structural vs argument-only regressions, and gate CI with clear fail/warn reports."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-08-tracepact-record-golden-ai-agent-tool-call-traces-and-diff-runs-to-catch-regressions-in-ci.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "tracepact"
  - "ai-agents"
  - "regression-testing"
  - "ci-cd"
  - "vitest"
  - "observability"
  - "tooling"
sources:
  - "https://github.com/dcdeve/tracepact"
---

## TL;DR in plain English

TracePact is described on its GitHub page as a behavioral testing framework for AI agents: https://github.com/dcdeve/tracepact. In short: record a canonical (“golden”) agent run, re-run the same scenario after changes, and compare the two traces to detect behavioral regressions (missing calls, reordered calls, or changed arguments). Use the golden trace as an artifact in CI to fail or warn on regressions before they reach production. See the repository for project-level context: https://github.com/dcdeve/tracepact.

## What you will build and why it helps

You will build a lightweight CI gate that protects one critical agent scenario by: recording a golden trace, producing a new trace on each change, and diffing the two traces to classify changes. The repository frames the behavioral-testing approach that motivates this workflow: https://github.com/dcdeve/tracepact.

Why this helps:

- Catches structural regressions (calls missing, calls reordered) earlier in the pipeline.
- Focuses human reviewers on intentional behavior changes rather than noisy output.
- Integrates into existing CI to provide pass / warn / fail signals tied to behavior.

For repository context and to understand the project goals, refer to: https://github.com/dcdeve/tracepact.

## Before you start (time, cost, prerequisites)

Prerequisites:

- A version-controlled repository where you can store a golden trace artifact and CI jobs.
- A CI system you can modify (GitHub Actions, GitLab CI, Jenkins, etc.).
- The agent code or orchestration script available to run inside CI.

Estimated effort (plan for a focused pilot): allocate a short pilot to validate tooling and workflow. See the project page for context: https://github.com/dcdeve/tracepact.

Minimal artifacts to prepare:

- A golden trace file stored in the repo or an artifact store.
- A CI job that can run the scenario and produce a new trace.
- A location to publish diff reports (PR comment, CI artifact, or issue tracker).

Repository reference: https://github.com/dcdeve/tracepact.

## Step-by-step setup and implementation

Overview (plain language):

1. Capture a golden trace for one protected happy-path scenario.
2. Add a CI job that re-runs the scenario and produces a new trace on each PR.
3. Diff the new trace against the golden trace and classify differences as structural or argument-only.
4. Fail the PR on structural diffs; warn (but allow) argument-only diffs initially while tuning rules.

Concrete decision frame (example):

| Diff classification | Action in CI | Human review required |
|---|---:|:---|
| Structural (missing/reordered calls) | Block merge / fail CI | Yes (mandatory) |
| Argument-only (values changed) | Report warning | Yes (recommended) |
| No meaningful change | Pass | No |

Basic commands (illustrative):

```bash
# run the scenario locally and write a trace to disk (illustrative)
# validate actual CLI from the repo before use
./run_agent_scenario.sh --scenario deploy_happy_path --out trace.json
```

Minimal diff step (illustrative pseudocode):

```bash
# compare new trace to golden and emit short summary
python tools/trace_diff.py golden/trace.json artifacts/trace.json --summary > diff-summary.txt
cat diff-summary.txt
```

Practical notes:

- Normalize or ignore ephemeral fields (timestamps, session IDs) so diffs focus on intent.
- Keep the golden trace in a protected location (protected branch or artifact storage) and require PR + reviewer to change it.
- Start with warnings for argument-only diffs and promote to blocking rules once confidence grows.

For project-level context and design rationale consult: https://github.com/dcdeve/tracepact.

## Common problems and quick fixes

Noise and false positives

- Problem: diffs dominated by timestamps or transient IDs.
  - Fix: add those keys to normalization/ignore rules and re-record the golden trace.

Order differences that are acceptable

- Problem: non-critical calls appear reordered.
  - Fix: make order-insensitive comparisons for those tool calls or group/normalize their order.

CI flakiness

- Problem: CI runs differ by environment and produce different traces.
  - Fix: pin runtime versions and container images; reproduce the recording in the same CI image.

Investigation checklist

- Re-run the scenario locally to confirm reproducibility.
- If the golden trace was captured incorrectly, re-record and protect the new golden artifact.
- Add normalization rules for ephemeral fields and re-run diffs.

Project reference: https://github.com/dcdeve/tracepact.

## First use case for a small team

Target: solo founders or teams of 2–5 people who want a low-friction behavioral safety gate for agent-driven automation. The repository frames this approach: https://github.com/dcdeve/tracepact.

Minimum viable rollout (3 concrete steps):

1. Protect one happy-path scenario and record a golden trace; store it in a protected folder or branch.
2. Add a PR gate that reports warnings first while you tune normalization rules.
3. Treat golden trace updates like code: require a PR, a changelog entry, and reviewer sign-off.

Operational roles (example):

- Author: proposes golden-trace changes and documents intent.
- Reviewer: verifies the behavior change is intentional.
- CI/Ops: maintains the gate and rollback procedures.

Monitor these practical metrics while ramping: warning counts, block counts, time-to-detect, and time-to-rollback. See project context: https://github.com/dcdeve/tracepact.

## Technical notes (optional)

High-level implementation notes:

- A trace is a structured record of agent actions and tool calls. TracePact’s repository identity emphasizes behavioral testing of AI agents: https://github.com/dcdeve/tracepact.
- Use normalization or comparator hooks to limit comparisons to the critical fields and calls when traces grow large.
- Decide which calls are "critical" (ordering enforced) vs. "auxiliary" (order-insensitive) and encode that in the comparator.

When traces are large, prefer early truncation (capture the first N calls for quick gating) and store full traces for deeper post-failure inspection. See the repository for conceptual context: https://github.com/dcdeve/tracepact.

## What to do next (production checklist)

Repository reference for verification: https://github.com/dcdeve/tracepact

### Assumptions / Hypotheses

- The repository title and description identify TracePact as a behavioral testing framework for AI agents: https://github.com/dcdeve/tracepact.
- The detailed CLI command names, config keys, and JSON field names used below are illustrative patterns for planning; validate all names and flags against the live repository before automating.

Suggested ramp-up numbers and thresholds (illustrative planning values):

- pilot duration: 14 days
- initial warn-only window: 14 days
- canary coverage: 10% of merges
- start-on branch: 1 protected branch
- target run time per scenario: < 60s
- max_trace_length for early comparison: 100 calls
- acceptable warn_count during ramp: <= 2 per PR
- immediate-block condition: block_count >= 1 per CI run
- rollback target for critical pipelines: revert within 5 minutes
- team size for initial pilot: 2-5 people

Example installer (illustrative):

```bash
# illustrative: install a dev dependency (validate actual package name in repo)
npm i -D tracepact || true
```

Example configuration snippet (illustrative JSON):

```json
{
  "ignore_keys": ["timestamp", "session_id"],
  "critical_tools": ["run_tests", "deploy_step"],
  "max_trace_length": 100,
  "warn_threshold": 2
}
```

(Methodology note: where repository-level CLI names and config keys were unavailable in the provided snapshot, the examples above are conservative patterns for planning — confirm against the live repo: https://github.com/dcdeve/tracepact.)

### Risks / Mitigations

- Risk: excessive false positives from ephemeral fields.
  - Mitigation: normalize or ignore timestamps, session IDs, and other ephemeral keys; re-record the golden trace after normalization.
- Risk: missing semantic regressions because comparator was made order-insensitive.
  - Mitigation: treat ordering as structural for critical tools (build, test, deploy) and run a small set of targeted tests that enforce order.
- Risk: CI flakiness or model variance across providers.
  - Mitigation: pin runtime/container versions, run a 10% canary before full rollout, require human review for early changes, and capture environment metadata with each trace.

### Next steps

- [ ] Validate CLI names, flags, and config keys against the TracePact repository: https://github.com/dcdeve/tracepact
- [ ] Implement a minimal CI gate on a protected branch and run it for 14 days
- [ ] Capture metrics: block_count, warn_count, time-to-detect, time-to-rollback
- [ ] Tune normalization rules and reduce false positives until warn_count <= 2 per PR on average
- [ ] Add a second golden trace for another critical scenario after the pilot

Repository: https://github.com/dcdeve/tracepact
