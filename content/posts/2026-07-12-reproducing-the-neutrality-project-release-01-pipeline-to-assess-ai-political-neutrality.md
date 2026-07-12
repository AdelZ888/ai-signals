---
title: "Reproducing the Neutrality Project Release 01: pipeline to assess AI political neutrality"
date: "2026-07-12"
excerpt: "Guide to reproduce the Neutrality Project Release 01: run 18 models on six political axes, record per-axis means, refusal rates, and 95% confidence intervals."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-12-reproducing-the-neutrality-project-release-01-pipeline-to-assess-ai-political-neutrality.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai"
  - "benchmarking"
  - "neutrality"
  - "ethics"
  - "evaluation"
  - "mlops"
  - "tutorial"
  - "open-data"
sources:
  - "https://neutralityproject.org/results.html"
---

## TL;DR in plain English

- The Neutrality Project's Release 01 ran a public benchmark that tested 18 models across 6 politically anchored axes with 3,987 questions. Source: https://neutralityproject.org/results.html
- Headline findings: 97 of 108 measured positions landed left of center and the average position across results is −0.41. Several models show high refusal rates (for example, Phi-4 refused 26% of questions and flagged all 6 axes). Source: https://neutralityproject.org/results.html
- What to build now: a small, reproducible pipeline that runs a fixed question set against candidate models and reports per-axis mean, refusal rate, and 95% CI so you can compare against the Neutrality Project baseline. Use ranges like 100–400 questions per model for quick checks and scale up to reproduce the full 3,987-question release when needed. Source: https://neutralityproject.org/results.html

## What you will build and why it helps

You will build a reproducible neutrality-assessment pipeline that:
- Sends the same question set to each model, records raw responses, and flags refusals. (Neutrality Project results cite refusal patterns and per-model anchors.) Source: https://neutralityproject.org/results.html
- Maps each response to a numeric score on six anchored dimensions and computes per-axis mean, refusal %, and a 95% confidence interval for uncertainty. Source: https://neutralityproject.org/results.html
- Produces a one-page decision table that product, legal, and ops can use to compare models objectively.

Why this helps:
- Evidence-based vendor selection: compare models with identical inputs and scoring rules against the public baseline (18 models, 6 axes). Source: https://neutralityproject.org/results.html
- Safety gating: separate directional lean from guardrail-driven refusals so you can tell whether silence is suppression or a genuine weight bias. Source: https://neutralityproject.org/results.html
- Faster decisions: a short run (100–400 questions per model) gives quick signal; scale to 3,987 questions to match the Release 01 baseline. Source: https://neutralityproject.org/results.html

## Before you start (time, cost, prerequisites)

Prerequisites:
- Basic Python and Pandas experience, Git for version control, and access to model APIs or a local runtime. Source: https://neutralityproject.org/results.html
- A spreadsheet or simple dashboard for the one-page summary.

Minimum checklist:
- [ ] Download the Neutrality Project Release 01 question set and metadata. Source: https://neutralityproject.org/results.html
- [ ] Confirm API keys or local runtime access for each model you will test.
- [ ] Version-control prompt templates and anchor definitions (e.g., anchors_v1.csv).

Time & cost example (estimate — validate in your environment):
- Small exploratory run: 3–5 models × 100–400 questions each → engineer time ≈ 2–6 hours and API cost example range $10–$100. These are environment-dependent estimates.
- Reproduce-scale run: full 3,987-question release across multiple models will take longer and cost more; plan for several hours to days and higher API spend.
- Canary windows: 24 h and 72 h windows are common for early monitoring.

## Step-by-step setup and implementation

1) Acquire the dataset
- Download the Release 01 question pack and metadata and save as questions.csv. Source: https://neutralityproject.org/results.html

2) Define models and endpoints
- Create a model_manifest.csv with columns: model, endpoint, auth_token, expected_latency_ms, est_cost_per_1k_tokens_usd.

3) Lock prompts and anchors
- Store prompt_config.yml and anchors_v1.csv in Git and tag changes.

```yaml
# prompt_config.yml
prompt_template: |
  Answer the question with a short response. Do not add policy context.
  Question: "{question}"
  Return JSON: {"answer":"...","refusal":false}
max_tokens: 256
stop: "\n"
```

4) Run queries with resumable scripts
- Implement retries, exponential backoff, batching, and resume capability. Log progress every 500 questions or every 600 seconds.

```bash
#!/usr/bin/env bash
set -euo pipefail
MODEL="$1"
QUESTIONS="questions.csv"
OUTDIR="raw_responses/${MODEL}"
mkdir -p "$OUTDIR"
python run_benchmark.py --model "$MODEL" --questions "$QUESTIONS" --out "$OUTDIR"
```

5) Parse and score
- Produce scored_results.csv with columns: model, question_id, axis, score, refusal_flag, raw_response.
- Scoring uses self-anchored numeric scales per model; Release 01 reports per-axis means using that approach. Source: https://neutralityproject.org/results.html

6) Compute summary metrics
- For each (model, axis) compute: mean score, refusal % (count_refusals / n_questions × 100), standard error, and a 95% CI. The benchmark reports per-axis means and propagates ±1 standard error into CI reporting. Source: https://neutralityproject.org/results.html

7) Two-layer analysis (lean vs suppression)
- Flag an axis as suppressed if refusal % exceeds your suppression threshold (choose and record the threshold in run_manifest.json). This helps separate guardrail suppression from directional lean. Source: https://neutralityproject.org/results.html

8) Visualize and summarize
- Plot mean-of-six-axes lean on one axis and an intelligence proxy on another (Neutrality Project provides a neutrality map and a 3D model map concept). Source: https://neutralityproject.org/results.html

Example decision table (one-page summary):

| model | mean lean | refusal % | CI width | latency ms | est $/1k tokens | recommended action |
|---|---:|---:|---:|---:|---:|---|
| Grok-1 | −0.11 | 4% | 0.12 | 120 ms | $5 | OK candidate |
| Phi-4 | −0.42 | 26% | 0.25 | 340 ms | $12 | Flag — suppression |

Rollout gates (examples to implement in CI):
- Canary ramp: 1% → 5% → 100% traffic while monitoring refusal % and mean lean drift.
- Monitor cadence: hourly checks for the first 24 h, then daily for 7 days.

## Common problems and quick fixes

High refusal rates (many "I won't answer") — quick checks:
- Prompt: reduce optional policy wording; run a 50-question calibration to see if refusals drop.
- Endpoint: test latency expectations (e.g., expected_latency_ms of 120 ms vs observed 340 ms) and tune timeouts accordingly.
- If refusals cluster by axis, mark the axis suppressed and document in suppression_flags.json. The Neutrality Project observed notable refusals — Phi-4 refused 26% of questions and flagged all 6 axes. Source: https://neutralityproject.org/results.html

Wide confidence intervals:
- Increase per-axis sample size (e.g., from 100 to 400 or more) to reduce 95% CI width.
- Use bootstrap resampling to estimate uncertainty and require a CI width gate before full rollout.

Rate limits and reliability:
- Use batching, exponential backoff, and resume tokens. Log progress every 500 questions or every 600 seconds.

Inconsistent anchors across runs:
- Version-control anchor definitions and run a 50-question calibration before full runs.

## First use case for a small team

Target audience: solo founders or teams of ≤5 people who need a fast, auditable check before choosing a model. Reference baseline: https://neutralityproject.org/results.html

Concrete, actionable workflow (can be done in half a day by one person):
1) Quick signal run (actionable): pick 100 questions from the Neutrality Project set and run them against 1–3 candidate models to get immediate signal on refusal % and mean lean. Record raw_responses and a one-page CSV. Source: https://neutralityproject.org/results.html

2) Shortlist with a compact decision rule (actionable): use a simple, auditable rule to shortlist (example rule: prefer models with low refusal and small mean-of-six absolute lean). Capture the rule in a single file (decision_rule.txt) and commit it. This keeps product/legal aligned.

3) Minimal CI for founders (actionable): add a lightweight nightly job that runs 50–100 calibration questions against your chosen model to detect drift in refusal % or mean lean and alert if drift exceeds your tolerance.

Additional practical tips:
- Keep tests small and repeatable: 1 model × 100 questions gives a sub-1-hour quick check; 3–5 models × 400 questions is a full afternoon run for a single engineer.
- Snapshot everything: prompt_config.yml, anchors_v1.csv, run_manifest.json, suppression_flags.json. Retain raw_responses for at least 90 days for audit.
- If you need production assurance quickly: prefer a conservative human-in-loop for the first 24–72 h (24 h, 72 h monitoring windows are common) rather than rushing to full rollout.

Example compact table a solo founder could produce in one afternoon:

| model | mean lean | refusal % | latency ms | est $/1k tokens |
|---|---:|---:|---:|---:|
| Model A | −0.08 | 6% | 120 ms | $5 |
| Model B | −0.36 | 18% | 340 ms | $12 |

## Technical notes (optional)

- Anchoring: Release 01 uses self-anchored per-model scales and reports per-axis means; replicate that anchoring to compare consistently. Source: https://neutralityproject.org/results.html
- Two-layer analysis: add a suppression flagging step so refusal-driven suppression is separated from directional lean in summaries. Source: https://neutralityproject.org/results.html
- Reproducibility: freeze dependency versions, store run_manifest.json, and keep raw_responses for audits.

Methodology note: the Neutrality Project propagates ±1 standard error into reported confidence intervals; mirror that when you compute your per-axis 95% CI. Source: https://neutralityproject.org/results.html

## What to do next (production checklist)

### Assumptions / Hypotheses

- The examples above use rule-of-thumb gates and costs: small run (3–5 models × 400 Q) ≈ 4 hours engineer time; API cost example $10–$100. These are starting hypotheses — validate in your environment.
- Example numeric gates (starting points, not authoritative): refusal gate 10%, suppression flag at 20% refusal, |mean lean| gate 0.15, CI width gate 0.15. Adjust per risk appetite.
- Monitoring cadence suggested: hourly for the first 24 h, daily for 7 days, then weekly checks.

### Risks / Mitigations

- Risk: model updates change lean or refusal after deployment (drift). Mitigation: schedule weekly or monthly re-runs and instrument live interactions for drift detection; add a CI job that runs 50–100 calibration questions nightly.
- Risk: small samples give false confidence. Mitigation: require a CI width threshold (example 0.15) before full rollout and increase per-axis sample size if CI is wide.
- Risk: regulatory or audit scrutiny. Mitigation: keep a one-page decision table, run_manifest.json, and suppression_flags.json in version control for review and retain raw_responses for 90 days.

### Next steps

- Automate: add run_benchmark.py to CI and push metrics_summary.csv to a dashboard on each change.
- Scale: when ready, run the full ~3,987-question Release 01 across more models to reproduce the Neutrality Project scale. Source: https://neutralityproject.org/results.html
- Governance: create a transparency disclosure template, commit suppression_flags.json to policy review artifacts, and schedule periodic re-evaluations.

References: Neutrality Project results (Release 01): https://neutralityproject.org/results.html
