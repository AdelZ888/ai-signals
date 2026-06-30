---
title: "Run TreasuryBench: set up a repeatable benchmark for personal-finance AI assistants"
date: "2026-06-30"
excerpt: "Step-by-step guide to set up TreasuryBench, a repeatable benchmark that tests personal-finance AI assistants with synthetic personas, saves run metadata, and makes comparisons auditable."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-30-run-treasurybench-set-up-a-repeatable-benchmark-for-personal-finance-ai-assistants.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "benchmarks"
  - "personal-finance"
  - "ai-evaluation"
  - "open-source"
  - "treasurybench"
  - "tutorial"
  - "tooling"
sources:
  - "https://github.com/Treasury-Technologies-Inc/treasurybench"
---

## TL;DR in plain English

- This guide explains how to get started with TreasuryBench, a personal‑finance assistant benchmark available at https://github.com/Treasury-Technologies-Inc/treasurybench.
- High level: clone the repository, read the README, adapt a config for your assistant endpoints, run a small deterministic evaluation, and save run metadata for reproducibility and comparison.
- Use small pilot runs first, then scale. Record a run_id and the harness commit SHA so future runs can be compared.

## What you will build and why it helps

You will set up a repeatable evaluation harness that drives assistant endpoints with synthetic personas and produces machine‑readable outputs for analysis and CI. The repository referenced here contains the benchmark framework: https://github.com/Treasury-Technologies-Inc/treasurybench.

Why this helps:
- Replace ad‑hoc/manual checks with automated, auditable runs that can be repeated and stored.
- Machine‑readable outputs enable dashboards, gates, and automated regression detection.
- Deterministic inputs and recorded run metadata make vendor/model comparisons fair and traceable.

Note: specific artifact names, file locations, and exact metrics used by your pipeline should be validated against the repository and are listed under Assumptions / Hypotheses below.

## Before you start (time, cost, prerequisites)

Minimum practical prerequisites:
- Git and network access to clone the repository.
- API keys or endpoints for the assistant(s) you plan to test (store secrets in environment variables or a secrets manager; do not commit them).
- Disk space appropriate for your planned run volume and retention policy.

Estimated time buckets (very approximate; validate against your environment):
- Quick pilot: 5–15 minutes for a handful of personas.
- Small run: 30–120 minutes for 50–200 calls depending on parallelism and latency.

Quick preflight checklist:
- [ ] Clone the repo
- [ ] Read the README and harness docs at https://github.com/Treasury-Technologies-Inc/treasurybench
- [ ] Create local config and set API keys in env vars
- [ ] Pick an initial persona subset (5–10)
- [ ] Set a conservative parallelism and throttle to avoid rate limits

Cost tip: estimate tokens * calls * cost_per_1k before running to avoid surprises. See Assumptions / Hypotheses for an example formula.

## Step-by-step setup and implementation

1) Clone the code

```bash
git clone https://github.com/Treasury-Technologies-Inc/treasurybench.git
cd treasurybench
# Read README.md and any CONTRIBUTING.md in the repository for runtime and usage details
```

2) Read the project's runtime instructions (README) and adapt the example config there to your endpoints. The exact commands to install dependencies and run the harness depend on the runtime the repo uses.

Example minimal config (illustrative only — validate fields against the repo README):

```json
{
  "dataset_version": "v1",
  "seed": 42,
  "endpoints": [ { "name": "my_endpoint", "url": "https://api.example/assistant" } ],
  "parallelism": 3
}
```

3) Run a small pilot using the project’s documented runner command (see README). After the run, locate and save the run metadata the harness emits (run_id, timestamp, dataset_version, seed, harness commit SHA).

4) Analyze outputs. Import CSV/JSON results into your analytics tooling or run ad‑hoc SQL queries to compute rates (harmful outputs, factual errors, latency percentiles).

## Common problems and quick fixes

Reference: https://github.com/Treasury-Technologies-Inc/treasurybench

Typical issues and high‑level remedies:
- Dependency or install failures: follow the repo's pinned runtime versions and install steps in README; use isolated environments (virtualenv, nvm, containers).
- API rate limits (HTTP 429): reduce parallelism, add throttling, and implement exponential backoff with jitter.
- Credential errors (401/403): stop the run and verify environment variables and key scopes.
- Malformed or non‑JSON assistant responses: save raw text, then attempt a tolerant repair/parsing step and mark repaired records.
- Cost spikes: run a preflight token/cost estimate and abort if it exceeds a configured budget.

Exponential backoff pseudocode (generic):

```python
delay = initial_ms
for attempt in range(max_retries):
    resp = send_request()
    if resp.ok:
        return resp
    if resp.status_code == 429 or 500 <= resp.status_code < 600:
        sleep(delay/1000.0 + random() * jitter_ms/1000.0)
        delay = min(delay * factor, max_ms)
    else:
        break
raise Exception("failed after retries")
```

If you need concrete retry parameters, see Assumptions / Hypotheses.

## First use case for a small team

Reference: https://github.com/Treasury-Technologies-Inc/treasurybench

Objective: detect obvious harmful outputs and regressions quickly with minimal cost.

Suggested workflow (high level):
1. Pick 5 key personas or flows representing critical user journeys.
2. Run a baseline with a deterministic seed and conservative parallelism.
3. Inspect sorted results for the highest‑severity failures.
4. Apply fixes (prompt changes, filters, or model selection) and re‑run the same baseline to confirm improvements.

Quick checklist for a small team:
- [ ] Run baseline and save run_id
- [ ] Identify top 3 defects by severity
- [ ] Apply fixes (prompts/filters)
- [ ] Re-run and confirm reduced defect counts
- [ ] Archive run artifacts and record the harness commit SHA for audit

## Technical notes (optional)

Reference: https://github.com/Treasury-Technologies-Inc/treasurybench

High‑level considerations:
- Reproducibility: record a deterministic seed, dataset version, and the harness commit SHA.
- Token accounting: capture or estimate prompt and completion tokens for cost tracking.
- Safety layering: combine simple rule checks (regex/blacklist) with classifier‑based detectors.
- Storage: keep a raw responses directory and a manifest for checksums and retention.

For repository‑specific implementation details, consult the project README and source files in the linked repository.

## What to do next (production checklist)

### Assumptions / Hypotheses

The following items are assumptions or recommended concrete parameters that must be validated against the repository and your environment before use:

- The repository provides a runnable harness and persona definitions that can be executed locally after cloning: https://github.com/Treasury-Technologies-Inc/treasurybench
- Example artifact names and outputs that many teams expect (validate these in the repo): run_metadata.json, results.csv, raw_responses/<run_id>/*.json, aggregates.json.
- Concrete retry/backoff defaults you may adopt for pilots:
  - initial_ms = 500
  - factor = 2
  - jitter_ms = 1000
  - max_ms = 60000
  - max_retries = 5
- Example gating thresholds (starting points — tune for production):
  - harmful_advice_rate <= 1% (0.01)
  - factual_error_rate <= 5% (0.05)
  - compliance_score >= 95% (0.95)
  - avg_latency_ms <= 3000
  - cost cap per run = $50
- Cost estimation formula example:
  - tokens_per_request = prompt_tokens + expected_response_tokens (example: 500 + 512 = 1,012)
  - calls = personas * endpoints * messages_per_persona
  - cost_estimate = calls * tokens_per_request/1000 * cost_per_1k_tokens
  - Example: 50 calls * 1,000 tokens/call * $0.03 per 1k = $1.50
- Suggested pilot sizes: 5 personas, parallelism 3, throttle 3000 ms; small teams often iterate with 5–10 personas initially.

Decision comparison (pilot vs. small run):

| Run type | Personas | Parallelism | Expected duration | Typical cost range |
|---|---:|---:|---:|---:|
| Pilot | 5 | 3 | 5–15 minutes | $0.5–$5 |
| Small run | 50 | 3–10 | 30–120 minutes | $1–$50 |

### Risks / Mitigations

- Risk: unexpected run costs. Mitigation: preflight cost estimate and an abort threshold (e.g., $50). Enable billing alerts.
- Risk: nondeterministic outputs causing noisy diffs. Mitigation: record seed, set model temperature to 0 where supported, and store harness commit SHA.
- Risk: leaked secrets. Mitigation: store keys in env vars or a secrets manager; do not commit them.

### Next steps

- Validate that the cloned repository runs in your environment and produces the artifacts you expect.
- Add secrets management and a preflight cost guard to the harness wrapper.
- Integrate a baseline run into CI (e.g., nightly or on PR) and fail PRs when defined metrics regress beyond configured thresholds.
- Gradually increase persona coverage and add historical baselines for automated drift detection.

Repository reference for all steps: https://github.com/Treasury-Technologies-Inc/treasurybench

Methodology note: where repository specifics were unspecified in the available snapshot, they were moved to the Assumptions / Hypotheses section above; confirm by reviewing the repo README and source files.
