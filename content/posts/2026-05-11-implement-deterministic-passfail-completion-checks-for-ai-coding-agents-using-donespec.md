---
title: "Implement deterministic PASS/FAIL completion checks for AI coding agents using DoneSpec"
date: "2026-05-11"
excerpt: "Use DoneSpec to convert ambiguous agent outputs into deterministic PASS/FAIL validators, enabling CI gating, automated retries, and measurable pass-rate observability."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-11-implement-deterministic-passfail-completion-checks-for-ai-coding-agents-using-donespec.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "DoneSpec"
  - "AI agents"
  - "validation"
  - "testing"
  - "CI"
  - "developer-tools"
sources:
  - "https://github.com/xryv/DoneSpec"
---

## TL;DR in plain English

- DoneSpec is an open-source pattern and reference implementation for deterministic validation of AI agent task completion; see the repository at https://github.com/xryv/DoneSpec.
- Pattern: agent writes its output to disk (JSON or text), then a small machine-checkable validator reads that artifact and returns PASS (exit code 0) or FAIL (non-zero). The repo describes this “deterministic validation” approach: https://github.com/xryv/DoneSpec.
- Why use it: turn ambiguous natural-language "I'm done" signals into boolean, auditable outcomes; this reduces human review time and enables CI gating and automated retry logic.

Quick facts and thresholds (summary):
- Pilot: 1–3 hours to ship a single simple check; 4–12 hours for a robust spec. 
- Canary: run an optional 7-day (168-hour) canary targeting ~100 runs before enforcement.
- Enforcement thresholds: require ≥95% pass rate over ~100 runs to flip checks to required; allow rollback if pass rate drops below 90%.

Methodology note: this guide references the DoneSpec repository and adapts its deterministic-validation pattern (https://github.com/xryv/DoneSpec).

## What you will build and why it helps

You will add a deterministic post-run validator to your agent loop that reads the agent's output artifact and emits a clear PASS/FAIL. The DoneSpec repo shows examples and the approach: https://github.com/xryv/DoneSpec.

Concrete benefits (measurable):
- Clear gate: PASS/FAIL instead of fuzzy text reduces time-to-merge and human review counts by measurable amounts (target: reduce ambiguous reviews by ≥50% in pilot data).
- CI automation: use a boolean exit code to gate merges or trigger automated retries (retry policies e.g., up to 3 attempts).
- Observability: track pass-rate (%) and validation latency (ms) to evaluate stability.

What you will produce:
- One spec file (YAML or JSON) and 2+ fixtures (good/bad). Aim for 10+ fixtures over time.
- A validator CLI or library that runs in <2000 ms for typical checks (target 200–2000 ms; heavy checks should be capped at 5 minutes / 300000 ms).

Reference: https://github.com/xryv/DoneSpec

## Before you start (time, cost, prerequisites)

Estimated effort and cost (numbers):
- Quick path: ~1 hour (single check). Conservative: ~3 hours.
- Robust spec and fixtures: 2–12 hours (target 4–12 hours). Maintain 10+ fixtures over months.
- CI cost: expect roughly $0.10–$5.00 for small pilots depending on runtime and number of runs; monitor minutes used.
- Retention: keep artifacts for at least 30 days to allow replay and audits.

People and permissions:
- Team size: 1–3 people for a small pilot; scale owners as needed.
- Required access: git and permission to add or edit CI workflows (example: GitHub Actions).

Technical prerequisites:
- An agent or test harness that writes output to disk (JSON, NDJSON, or plain text).
- A CI system; GitHub Actions is a common example and integrates well with the pattern: https://github.com/xryv/DoneSpec.
- Basic shell, git, and small scripting skills (bash/python).

Quick pre-flight checklist

- [ ] Clone the DoneSpec repository: https://github.com/xryv/DoneSpec
- [ ] Identify the agent output file to validate (JSON preferred)
- [ ] Create at least two fixtures: one known-good and one known-bad (10+ recommended over time)

## Step-by-step setup and implementation

Follow these condensed steps. The DoneSpec repo contains example specs and tools: https://github.com/xryv/DoneSpec.

1) Clone and inspect the repo

```bash
git clone https://github.com/xryv/DoneSpec.git
cd DoneSpec
ls -la
```

2) Create a minimal spec and fixtures
- Choose one high-confidence invariant (required key, non-empty tests array, or checksum match).
- Store spec at specs/my_spec.yaml and fixtures/good.json, fixtures/bad.json.

3) Wire the validator into the agent
- Pattern A: in-process library call that returns True/False or exits 0/1.
- Pattern B: external CLI that reads artifact.json and exits 0/1.

4) Local validation and timing targets
- Validate good and bad fixtures locally. Expect deterministic outcomes: good -> exit 0, bad -> non-zero.
- Measure validation time; target 200–2000 ms per run for lightweight checks. Cap heavy checks at 5 minutes / 300000 ms.

5) Add CI job and canary (optional for first 7 days)
- Keep the check optional for the first 168 hours (7 days), collect ~100 runs, and log pass/fail counts and mean latency (ms).

Example GitHub Actions snippet:

```yaml
name: donespec-check
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run agent in test mode
        run: ./scripts/run-agent.sh --output artifact.json --mode test
      - name: Run DoneSpec validator
        run: |
          python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input artifact.json
```

6) Iterate with regression fixtures
- Maintain >=10 fixtures over time (e.g., 5 good, 5 bad) to measure false positive and false negative rates.

Command example (local validator):

```bash
python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input fixtures/good.json
# expect exit code 0
```

Repo reference: https://github.com/xryv/DoneSpec

## Common problems and quick fixes

Common symptoms, likely cause, and quick action. See examples in the repo: https://github.com/xryv/DoneSpec.

| Symptom | Likely cause | Quick fix (example thresholds) |
|---|---:|---|
| False negatives | Spec too strict | Relax non-essential asserts; canonicalize whitespace/timestamps; allow IDs to vary (target FP reduction ≥50%) |
| False positives | Spec too loose | Add 1–3 high-confidence invariants (required keys, checksum); require presence of tests file |
| CI timeouts / high cost | Heavy checks in PR path | Move heavy checks to nightly; set per-check timeout = 300000 ms (5 minutes) |
| Environment flakiness | Unpinned runtimes or missing caches | Pin runtimes (node=18.x, python=3.11) and use Docker image; target <1% environment-induced failures |

Quick fixes
- Too many false negatives: relax optional asserts and add normalization steps.
- Too many false positives: add required-key checks and a checksum.
- Flaky CI: pin runtimes or run inside Docker; cache dependencies.

Repo: https://github.com/xryv/DoneSpec

## First use case for a small team

Target: 1–3 people or a solo maintainer; fast iteration and low overhead.

Concrete plan (hours / days):
1) Ship one high-value invariant in 1–3 hours
- Example invariant: every generated PR must include at least 1 tests file and the linter must exit 0.
- Implement the spec and two fixtures (good + bad). Keep the spec concise (aim <50 lines).

2) Run a 7-day (168-hour) optional CI canary
- Collect ~100 runs if available. Track pass-rate (%) and average validation time (ms).

3) Enforce only after stability
- Flip to required checks only when pass-rate ≥95% over the last ~100 runs.
- Roll back if pass-rate falls below 90% during enforcement.

4) Low-effort observability
- Log PASS/FAIL with timestamp and a short reason (under 200 tokens). Retain artifacts for 30 days.

Practical checklist

- [ ] Create specs/my_spec.yaml and fixtures/good.json and fixtures/bad.json
- [ ] Add CI workflow that runs DoneSpec as an optional check for 7 days
- [ ] Monitor pass-rate (%) and validation latency (ms)
- [ ] Flip to required when pass-rate ≥95% over 100 runs

Examples and fallback
- If you need a tiny validator, adapt scripts from https://github.com/xryv/DoneSpec or write a small Python CLI to check JSON keys and exit 0/1.

## Technical notes (optional)

- Determinism: the pattern requires saving agent outputs to disk so validations are replayable and deterministic (DoneSpec describes deterministic validation: https://github.com/xryv/DoneSpec).
- Integration patterns: in-process library call or out-of-process CLI that reads artifact.json; both should produce a boolean outcome.
- Test harness advice: keep at least 10 fixtures (e.g., 5 good, 5 bad) and measure false positive/negative rates as counts.

Example test loop (bash):

```bash
for f in fixtures/*.json; do
  python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input "$f" || echo "FAILED: $f"
done
```

- Logging and telemetry: emit minimal structured logs (timestamp, pass/fail, reason code). Keep message sizes under ~200 tokens and store for 30 days.

Repo: https://github.com/xryv/DoneSpec

## What to do next (production checklist)

### Assumptions / Hypotheses
- The DoneSpec repository at https://github.com/xryv/DoneSpec provides examples and a deterministic validation approach you can adapt. This guide assumes you can run a validator as a CLI or library and save agent outputs as JSON or text artifacts.
- Assumes permission to modify CI workflows (for example GitHub Actions) and to add optional status checks during a canary.

### Risks / Mitigations
- Risk: false enforcement causing developer friction. Mitigation: keep the check optional for 7 days (168 hours), collect ~100 runs, and require ≥95% pass rate before enforcing.
- Risk: spec drift as the agent evolves. Mitigation: require review for spec changes, keep a changelog, and require owner signoff for edits.
- Risk: increased CI cost or latency. Mitigation: cap per-check runtime (for example 5 minutes / 300000 ms), move heavy checks to nightly runs, and measure CI cost during the pilot (target $0.10–$5.00 for the pilot).

### Next steps
Short-term (1–7 days)
- Clone https://github.com/xryv/DoneSpec, write a minimal spec and two fixtures, and add an optional CI job. Run a 7-day canary targeting ~100 runs and record pass-rate (%) and mean latency (ms).

Medium-term (2–4 weeks)
- Expand fixtures to 10+ examples, tune the spec, add dashboards for pass-rate (%), average validation time (ms), and failure counts.

Long-term (1–3 months)
- Make DoneSpec checks a required merge gate once thresholds are stable (≥95% over ~100 runs). Maintain a spec-change log and automate rollback if pass-rate drops below the recovery threshold (90%).

Final reference: https://github.com/xryv/DoneSpec
