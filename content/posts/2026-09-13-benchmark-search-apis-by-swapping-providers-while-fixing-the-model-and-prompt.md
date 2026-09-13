---
title: "Benchmark Search APIs by swapping providers while fixing the model and prompt"
date: "2026-09-13"
excerpt: "Build a repeatable harness that runs one agent across multiple Search APIs (20 products). Compare cost, latency, and accuracy to choose the best provider."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-13-benchmark-search-apis-by-swapping-providers-while-fixing-the-model-and-prompt.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "search"
  - "agents"
  - "benchmark"
  - "APIs"
  - "retrieval"
  - "cost"
  - "latency"
sources:
  - "https://artificialanalysis.ai/agents/search-api"
---

## TL;DR in plain English

- The Artificial Analysis Search Index runs the same agent while swapping only the Search API to measure cost, time, and answer quality; see the benchmark page: https://artificialanalysis.ai/agents/search-api (20 Search API products across 10 providers, snapshot Sep 8, 2026).
- Practical first steps: run a model-only baseline, then run each Search API on the same queries and prompts, collect cost-per-task ($), time-per-task (ms), and accuracy (%), and compare deltas against the baseline (the benchmark uses model-only as the baseline). Reference: https://artificialanalysis.ai/agents/search-api.
- Quick example: run 200 representative queries. If a provider reduces median latency from 800 ms to 300 ms and increases exact-answer accuracy by ~12 percentage points versus baseline, that is a strong signal to prefer it (https://artificialanalysis.ai/agents/search-api).

This guide shows how to build a repeatable harness that freezes the candidate model and prompt while swapping Search APIs, matching the Artificial Analysis methodology (https://artificialanalysis.ai/agents/search-api).

## What you will build and why it helps

You will build a small, repeatable test harness that:

- fixes one candidate model and a single prompt; and
- swaps Search API providers one at a time; and
- records cost, latency, and answer-quality metrics (accuracy, F1, exact match).

Why this helps: Search APIs differ in index coverage, result formatting, and tradeoffs between cost, speed, and retrieval quality; a controlled comparison isolates the Search API effect, as the Artificial Analysis benchmark does (https://artificialanalysis.ai/agents/search-api).

Core artifacts to produce:

- provider-decision-table.csv: provider, cost_per_task ($), time_per_task (ms), accuracy (%), freshness_score (0-1).
- leaderboard.csv: aggregated score computed as an equal-weighted mean across DeepSearchQA F1, BrowseComp exact-answer accuracy, and AA-Omniscience accuracy (per the benchmark: https://artificialanalysis.ai/agents/search-api).
- harness-config.json and adapters/*: adapter smoke tests and baseline.csv.

Keep harness and adapters in version control for auditability.

## Before you start (time, cost, prerequisites)

Read the benchmark framing at https://artificialanalysis.ai/agents/search-api. It documents the goals, the three public benchmarks used, and the set of providers evaluated (20 products, 10 providers, latest snapshot Sep 8, 2026).

Minimum technical checklist

- Candidate LLM API key (model-only baseline) and credentials for each Search API you will test.
- Representative queries saved as queries.json (suggest 200 queries; scale to 1,000 for broader coverage).
- Repository with a harness that normalizes provider results into a common schema.
- Local dev environment with Python or Node; containerization recommended.

Suggested planning defaults (validate in your project):

- baseline short run: ~4 hours to wire and smoke-test; full experiment: 1–3 days.
- wiring adapters for 2 providers: <= 8 hours.
- context window: 4096 tokens as a working value in harness-config.json.
- guardrails: initial daily cost cap $10/day and a $50 24-hour hard guardrail during early tests.
- operational latency goals: median <= 400 ms, 95th percentile <= 1,000 ms.

These are starting defaults — validate against your needs (https://artificialanalysis.ai/agents/search-api).

## Step-by-step setup and implementation

The harness strategy mirrors the Artificial Analysis approach: freeze the agent and vary only the Search API provider (https://artificialanalysis.ai/agents/search-api).

1) Clone a harness and install dependencies.

```bash
git clone https://example.com/test-harness.git
cd test-harness
pip install -r requirements.txt
```

2) Create harness-config.json that freezes the model and retrieval settings used across providers.

```json
{
  "model": "candidate-model",
  "context_tokens": 4096,
  "queries_path": "queries.json",
  "output_dir": "results/"
}
```

3) Implement adapters: each adapter must normalize responses to {title, snippet, url, score, freshness_score} and expose per-query latency_ms and search_cost_usd. Add an adapter validator and run a smoke test of 20 queries.

4) Run a model-only baseline (no search) and save results:

```bash
export MODEL_API_KEY=sk-...
python run_harness.py --config harness-config.json --providers none --out baseline.csv
```

5) Run providers one at a time with identical queries; collect per-query latency_ms, per-query search_cost_usd, and quality metrics (accuracy % / F1):

```bash
python run_harness.py --config harness-config.json --providers providers.yml --out results/provider-XYZ.csv
```

6) Aggregate results and compute leaderboard columns: cost_per_task ($), median latency (ms), 95th-percentile latency (ms), and accuracy (%). Example aggregation pseudocode:

```python
# pseudocode
cost_per_task = (model_cost_usd + sum(search_costs_usd)) / tasks
time_per_task_ms = median(latencies_ms)
accuracy_pct = compute_exact_match(preds, gold)
```

7) Compute the overall leaderboard score as the equal-weighted mean across DeepSearchQA F1, BrowseComp exact-answer accuracy, and AA-Omniscience accuracy (per Artificial Analysis): https://artificialanalysis.ai/agents/search-api.

Notes on reproducibility and fairness: always run the identical prompt, identical query set, and identical candidate model to isolate provider differences (methodology summarized at https://artificialanalysis.ai/agents/search-api).

## Common problems and quick fixes

- 429 / rate-limit errors: add exponential backoff, concurrency limits, and a local cache. Run a 20-query smoke test to validate adapter behavior.
- Heterogeneous result formats: normalize fields in adapters and validate using the adapter-validator before full runs.
- No accuracy uplift vs model-only: verify the retrieval text is injected into the prompt exactly the same way as in the baseline run; check that the snippet length and tokenization match the harness-config.
- Latency noise: compute median and 95th-percentile latencies; investigate queries in the top 5% by latency.
- Index freshness surprises: include freshness_score in adapter output and sample returned URLs to estimate content age.

Quick-fix command (enable cache and 3 retries):

```bash
python run_harness.py --config harness-config.json --cache enabled --retry 3
```

Reference: the Artificial Analysis index emphasizes consistent harness settings so provider differences are isolated (https://artificialanalysis.ai/agents/search-api).

## First use case for a small team

Scenario: a solo founder or a 1–5 person team wants an internal troubleshooting and triage agent that combines internal docs with public web results. Use the Artificial Analysis method to select a Search API while keeping costs and latency acceptable for users (https://artificialanalysis.ai/agents/search-api).

Practical, concrete actions for solo founders / very small teams (minimum 3 actionable items):

1) Minimal experiment: pick one candidate model and 1–2 Search API providers; prepare 200 representative queries from real tickets or user questions and save as queries.json. Run a 20-query smoke test, then the 200-query run. Measure median latency (ms), 95th percentile (ms), cost per query ($), and accuracy (%).

2) Lightweight adapters and guardrails: implement a single adapter per provider that returns a normalized JSON line per query with {latency_ms, search_cost_usd, snippet, url, freshness_score}. Enforce a daily cost cap of $10 and a $50 24-hour hard guardrail during initial testing.

3) Canary and rollout for small teams: deploy to internal users behind a feature flag at 5% traffic for 24 hours; refresh a simple dashboard every 15 minutes showing median latency, 95th percentile, cost/day, and accuracy uplift vs model-only. If accuracy uplift < 12 percentage points or median latency > 400 ms, fail the canary and revert.

4) Fast, low-cost dashboard: use a single CSV (provider-decision-table.csv) and render a tiny dashboard that shows median_ms, p95_ms, cost_per_task ($), and accuracy (%). Keep total daily spend hypothesis <= $10/day until the provider decision is final.

Example provider decision table (illustrative values):

| Provider | Cost/task ($) | Median time (ms) | 95th pct (ms) | Accuracy (%) |
|---|---:|---:|---:|---:|
| Provider A | 0.05 | 300 | 480 | 78 |
| Provider B | 0.03 | 420 | 900 | 72 |
| Provider C | 0.08 | 250 | 600 | 81 |

Include the benchmark reference when interpreting results: https://artificialanalysis.ai/agents/search-api.

## Technical notes (optional)

- The Artificial Analysis index uses three public benchmarks: DeepSearchQA (F1), BrowseComp (exact-answer accuracy), and AA-Omniscience (accuracy). The published leaderboard aggregates these via an equal-weighted mean to produce a single score per provider (https://artificialanalysis.ai/agents/search-api).
- Freeze model-config.json, tokenizer and context-window settings (example: 4096 tokens) for reproducibility.
- Version adapters and harness-config in git and containerize runs with Docker for larger experiments.

Methodology note: keep harness settings consistent so provider differences are isolated from agent changes (https://artificialanalysis.ai/agents/search-api).

## What to do next (production checklist)

### Assumptions / Hypotheses

- The Artificial Analysis benchmark evaluated 20 Search API products across 10 providers and reports aggregated scores across three public benchmarks (DeepSearchQA, BrowseComp, AA-Omniscience) — snapshot dated Sep 8, 2026 (https://artificialanalysis.ai/agents/search-api).
- Working defaults to validate in your project:
  - queries: 200 representative queries (scale to 1,000 for broader coverage)
  - baseline setup and initial run: ~4 hours
  - tuning and scale tests: 1–3 days
  - adapter wiring: <= 8 hours for 2 providers
  - context_tokens: 4096
  - canary: 5% traffic for 24 hours
  - dashboard refresh interval: 15 minutes
  - initial daily cost cap: $10/day; 24-hour hard guardrail: $50
  - latency evaluation thresholds: median <= 400 ms; 95th percentile <= 1,000 ms
  - accuracy uplift goal vs model-only: >= 12 percentage points

These are project-specific hypotheses; validate them in your environment.

### Risks / Mitigations

- Risk: sudden cost spike. Mitigation: enforce a daily cap (example initial cap $10/day) and automated alerts that pause runs when 24-hour spend exceeds $50.
- Risk: SLA breaches at the tail. Mitigation: gate rollout with a 5% canary and monitor the 95th-percentile latency; set an action threshold (example action threshold 500 ms).
- Risk: no measurable accuracy uplift. Mitigation: increase query set to 1,000, tune retrieval parameters, or revert to model-only if uplift < 12 percentage points.

### Next steps

- Operationalize: implement cost and latency alerts, build an observability dashboard, and finalize a rollback plan.
- Deliverables before go-live: provider-decision-table.csv, leaderboard.csv, recommendation.md, and a tested rollback plan.

Minimal rollout checklist

- [ ] Security review completed
- [ ] Cost cap configured (example: $10/day initial)
- [ ] Observability dashboard in place (median, 95th, cost, accuracy)
- [ ] Canary plan ready (5% for 24 hours)
- [ ] Rollback plan tested via feature flag

For the benchmark context and scoring methodology that informed this guide, see https://artificialanalysis.ai/agents/search-api.
