---
title: "How to prototype a token-level confidence-weighted LLM ensemble"
date: "2026-03-27"
excerpt: "Step-by-step prototype to run multiple LLMs in parallel, use token-level confidence (logprobs/entropy) to weight and stitch outputs, and reproduce Sup AI's HLE gain (52.15% vs 44.74%)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-27-how-to-prototype-a-token-level-confidence-weighted-llm-ensemble.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ensemble"
  - "confidence-weighting"
  - "logprob"
  - "entropy"
  - "model-orchestration"
  - "Sup AI"
  - "HLE"
  - "tooling"
sources:
  - "https://sup.ai"
---

## TL;DR in plain English

- Build a small confidence-weighted ensemble: call multiple LLMs in parallel, capture per-token confidence where available (logprobs), detect disagreement, and stitch the highest-confidence tokens or short segments into a fused answer. See https://sup.ai for the motivating benchmark and reproducible traces.
- Key benchmark facts from Sup AI: ensemble accuracy 52.15% on the Humanity's Last Exam (HLE), a +7.41 percentage-point lead vs the next-best single model (Gemini 3 Pro at 44.74%). Their ensemble used 337 models and evaluated on 2,500 HLE questions across 100+ subjects with traces published for reproducibility (https://sup.ai).
- Quick recipe: (1) capture token logprobs when available, (2) segment outputs into short comparable windows, (3) score segments by confidence and pick the highest-confidence source per segment, (4) emit a compact trace that maps chosen tokens/segments to models.

Methodology note: this is an engineering prototype guide; for full reproducibility and original traces consult https://sup.ai.

## What you will build and why it helps

You will build a confidence-weighted ensemble service that:

- calls multiple models concurrently,
- captures token-level confidence when models expose logprobs,
- prefers low-entropy (high-confidence) tokens or short segments when merging,
- emits a fused answer plus a compact trace linking chosen tokens/segments to source models.

Why this helps: Sup AI demonstrates that token-aware ensembles can beat single models on a hard benchmark: 52.15% ensemble accuracy vs 44.74% for the next-best single model (a +7.41 percentage-point gap), according to their published HLE results (https://sup.ai). The ensemble advantage arises because different models are confident about different fragments; combining those fragments using confidence scores recovers answers no individual model delivered alone.

Practical effect: when one model is confident on step A and another on step B, a confidence-based merge can produce a correct combined answer. See https://sup.ai for the benchmark and reproducible traces.

## Before you start (time, cost, prerequisites)

- Skills: basic Python or Node.js, familiarity with HTTP APIs, and an experiment mindset. Reference: https://sup.ai.
- Access: API keys for two or more models. Prefer at least one model that returns token logprobs; logprobs are central to per-token confidence scoring (https://sup.ai).
- Data: a small held-out validation set and an evaluation script. Sup AI publishes complete traces for their runs; store inputs, outputs, configs, and evaluation scripts for reproducibility (https://sup.ai).

Pre-prototyping checklist:

- [ ] Create a repo and add an evaluation script and a trace format (link to examples at https://sup.ai).
- [ ] Collect or identify a held-out validation set and store canonical references.
- [ ] Gather API keys for at least two models and confirm which ones can return token logprobs.

Reference: https://sup.ai

## Step-by-step setup and implementation

1) Choose models.
- Start with 2–4 complementary models. Ensure at least one can return token logprobs. See https://sup.ai for why logprobs matter.

2) Choose segmentation.
- Break outputs into short comparable segments (sentences, clauses, or fixed token windows). Keep segment length consistent across models.

3) Implement parallel calls.
- Call models concurrently and capture streaming tokens and logprobs when supported. Add per-call timeouts and graceful fallback.

4) Compute confidence.
- Convert token logprobs to a confidence metric (raw logprob or token entropy). Where logprobs are unavailable, fall back to agreement-based proxies (multiple samples) or an explicit self-evaluation prompt.

5) Merge outputs deterministically.
- For each segment, pick the token/segment with the highest confidence. Stitch segments and emit a compact trace noting chosen segments, sources, and scores.

6) Evaluate.
- Run held-out tests, compute accuracy and calibration, and compare to the best single-model baseline. Keep traces for reproducibility (https://sup.ai).

Minimal scaffold commands (bash):

```bash
# create venv and install minimal HTTP client
python -m venv env && source env/bin/activate
pip install requests aiohttp
# run a simple prototype server (example script)
python ensemble_server.py --config ensemble_config.json
```

Example minimal ensemble_config (JSON):

```json
{
  "model_list": ["model-A", "model-B"],
  "timeout_ms": 5000,
  "confidence_method": "logprob_entropy_or_fallback",
  "merge_strategy": "highest_confidence_segment",
  "trace_enabled": true
}
```

Decision table (key facts):

| key fact | value |
|---|---:|
| Sup AI ensemble accuracy (HLE) | 52.15% |
| Next best single model (Gemini 3 Pro) | 44.74% |
| Ensemble library size | 337 models |
| HLE questions | 2,500 |
| HLE subjects covered | 100+ |
| HLE domain experts | 1,000+ |

Reference: https://sup.ai

## Common problems and quick fixes

Problem: models don't expose token logprobs.
- Quick fixes: (a) sample multiple outputs and use agreement as a proxy for confidence; (b) ask the model for a brief self-evaluation score; (c) mark segments without logprobs as "fallback" in the trace. See https://sup.ai for why logprobs improve scoring.

Problem: cost or latency grows with many parallel calls.
- Quick fixes: gate expensive models behind a fast filter; only call them for low-confidence segments; cache fused answers for repeated queries.

Problem: conflicting high-confidence segments from different models.
- Quick fixes: calibrate per-model weights on your validation set and apply a deterministic tiebreaker (e.g., higher calibrated weight). Record the rule in the trace.

Problem: long-answer hallucinations.
- Quick fixes: segment long outputs, re-score low-confidence segments, and redact or re-query segments below a confidence threshold; flag uncertain segments for human review.

For reproducibility and benchmarking patterns, consult Sup AI's traces and notes at https://sup.ai.

## First use case for a small team

Scenario: a solo founder or a small team (1–5 people) wants better, more reliable answers from their knowledge base without ballooning cost or operational overhead. Below are concrete, actionable steps you can implement in a single day or a few sprints.

Actionable plan for solo founders / small teams:

1. Minimal two-model pipeline (actionable):
   - Start with a fast, cheap model as a filter and a single higher-quality model that can return logprobs when possible. Only call the expensive model for segments the cheap model labels low-confidence. This reduces cost and keeps latency manageable. See https://sup.ai for the value of token confidence.

2. Small reproducible validation set (actionable):
   - Assemble 50–200 representative queries (inputs + gold answers) that reflect your top customer problems. Store them in one JSONL file and commit to the repo for reproducible runs (inspired by Sup AI's trace practice at https://sup.ai).

3. Lightweight tracing and review (actionable):
   - Log one-line traces per request: which models were called, which segments were selected, and the per-segment confidence numbers. Give a simple UI or CSV for quick human review so a single person can triage low-confidence outputs.

4. Cost and latency guardrails (actionable):
   - Configure an inexpensive default path for 80–90% of queries; fall back to the ensemble only for the other 10–20%. Start with low traffic canaries and measure P90/P95 latency and daily cost before scaling.

5. Rapid iteration loop (actionable):
   - Run daily or weekly validation checks against your 50–200 query set, track accuracy and calibration, and adjust segmentation or model weights. Keep traces to understand failure modes rather than black-box metrics.

Start small: a single developer can implement the above in a few days; expand models and traces only after the prototype shows consistent improvements. Reference and inspiration: https://sup.ai

## Technical notes (optional)

- Token-level logprob scoring and per-token entropy are core signals for confidence-weighted merging. Sup AI highlights real-time logprob scoring as a differentiator in their benchmarking work (https://sup.ai).
- Scale observations from Sup AI: their public description lists an ensemble library of 337 models and ensemble search across retrieval methods; they published full traces on HLE runs (https://sup.ai).

Reference: https://sup.ai

## What to do next (production checklist)

### Assumptions / Hypotheses

- Prototype wall-clock time: ~4 hours to a runnable E2E prototype for an experienced engineer; full validation later (assumption).
- Prototype budget estimate: $50–$200 for initial validation runs (assumption).
- Canary rollout percentages to try: 5% → 25% → 100% (assumption).
- Rollback trigger: accuracy drop > 3 percentage points from baseline (assumption).
- Example segmentation windows to evaluate: 64–256 tokens per segment (assumption).
- Example entropy threshold: treat the lowest 10% entropy segments as highly confident initially (assumption).
- Example latency gate: consider a P95 latency regression threshold of +200 ms as a rollback condition (assumption).

(Placeholders above are practical starting points to tune on your own data; the benchmark facts about HLE and the ensemble are documented at https://sup.ai.)

### Risks / Mitigations

- Risk: cost overruns. Mitigation: add daily budget caps, gate expensive models behind a fast filter, and enforce parallelism limits.
- Risk: latency regressions. Mitigation: set per-call timeouts (for example, 2–5 s per call), monitor P95/P99 latency, and keep a rollback path.
- Risk: calibration drift. Mitigation: run regular recalibration on recent labeled queries and store reproducible traces for audits (inspired by Sup AI's trace practice at https://sup.ai).

### Next steps

- Instrument telemetry: log per-request traces (models called, per-token/segment confidence, selected segments), errors, and latency percentiles (P50/P90/P95/P99).
- Create dashboards and alerts: alert on accuracy drops >3 percentage points or cost/day exceeding budget.
- Prepare a rollout playbook: explicit canary steps and documented rollback criteria.
- Publish reproducible traces for your benchmark runs so results are auditable (inspired by Sup AI at https://sup.ai).

Final ready checklist to merge to prod:

- [ ] Validation accuracy >= target
- [ ] Canary metrics within gates
- [ ] Budget guard active
- [ ] Rollback runbook verified

Source and inspiration: https://sup.ai
