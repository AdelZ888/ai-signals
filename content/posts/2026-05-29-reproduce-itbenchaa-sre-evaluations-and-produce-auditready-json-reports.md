---
title: "Reproduce ITBench‑AA SRE Evaluations and Produce Audit‑Ready JSON Reports"
date: "2026-05-29"
excerpt: "Reproducible tutorial to run ITBench‑AA's SRE tasks and emit audit‑ready JSON reports (accuracy, avg_turns, false_positive_rate, task_count). Frontier models scored below 50%."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-29-reproduce-itbenchaa-sre-evaluations-and-produce-auditready-json-reports.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "SRE"
  - "benchmarking"
  - "agentic-AI"
  - "Kubernetes"
  - "ITOps"
  - "ITBench-AA"
  - "IBM"
  - "Artificial Analysis"
sources:
  - "https://huggingface.co/blog/ibm-research/itbench-aa"
---

## TL;DR in plain English

- ITBench-AA is a new benchmark (published May 27, 2026) for agentic enterprise IT tasks. "Agentic" means models act like agents that can read logs, trace dependencies, and suggest root causes. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Headline result: leading frontier models scored below 50% on the Site Reliability Engineering (SRE) task set. Reported top scores: Claude Opus 4.7 = 47%, GPT-5.5 (xhigh) = 46%, Qwen3.7 Max = 42%. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Interaction length varies a lot (nearly 3×). Example: GPT-5.5 (xhigh) averaged 31 turns per task at 46% accuracy, while Gemini 3.1 Pro Preview averaged 83 turns at 30% accuracy. Longer conversations did not reliably improve accuracy. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Concrete example / short scenario

- Scenario: a two-person ops team runs a 10-task smoke test locally. One model returns correct root causes on 5 of 10 tasks, with an average of 28 turns per task. The team uses those numbers to decide whether to require human approval before any automated action (recommended until accuracy improves). This is the kind of practical decision the benchmark is designed to inform. Source: https://huggingface.co/blog/ibm-research/itbench-aa

## What you will build and why it helps

You will build a reproducible evaluation harness that runs the ITBench-AA SRE task set against one or more candidate models and emits a JSON report per model. Each report should include at least these fields: {accuracy, avg_turns, false_positive_rate, task_count}. Use the canonical task set and the rubric cited in the ITBench-AA write-up. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Why this helps

- It makes model behavior measurable. Published leaders scored under 50%, so a numeric baseline is essential to decide whether a model is safe enough for any level of automation. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- It highlights specific failure modes. The report stresses over-investigation and plausible false positives as common problems. Capturing per-task trajectories helps detect those modes and add human-in-loop checks. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Deliverable

- One JSON report per model suitable for audit logs and automated decisioning. Report fields should let you compare directly to the published numbers. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Plain-language explanation before advanced details

- You will feed the same tasks and logs the authors used to each model. Each model interacts with the task like an agent. You record every step (the trajectory) and the model's final root-cause answer. Then you score the answers against the official rubric. The rest of this guide explains how to set that up, run it safely, and interpret results.

## Before you start (time, cost, prerequisites)

- Read the ITBench-AA description and confirm the SRE task set and rubric. Use the canonical files cited in the report. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Obtain the canonical ITBench SRE task set and verify checksums. Do not substitute ad-hoc tasks if you want comparable scores. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Plan to capture per-task trajectories (every agent turn) and the final root-cause outputs. These are needed to compute accuracy, mean turns, and false-positive patterns emphasized in the report. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Practical time and cost notes (to validate locally)

- A quick smoke run of 10 tasks can take 10–30 minutes depending on latency and model. Full benchmarking will take longer. Treat any time or cost numbers as operational suggestions to validate in your environment. Source: https://huggingface.co/blog/ibm-research/itbench-aa

## Step-by-step setup and implementation

1. Acquire the ITBench-AA SRE task set and harness code. Verify dataset hashes against the canonical source. Source: https://huggingface.co/blog/ibm-research/itbench-aa
2. Create an isolated run directory and capture inputs and outputs. Save task files, raw logs, dependency graphs, per-task trajectories, and final answers in results/. Source: https://huggingface.co/blog/ibm-research/itbench-aa
3. Configure model endpoints. Keep credentials out of source control and record endpoint, model name, adapter settings, and timeout. Source: https://huggingface.co/blog/ibm-research/itbench-aa
4. Run single-model smoke tests first. Save a JSON report per model. Then run batched comparisons across models. Source: https://huggingface.co/blog/ibm-research/itbench-aa
5. Score with the canonical rubric. Compute: accuracy (fraction of tasks with correct root-cause entity), mean turns per task, and false-positive patterns. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Example commands (replace with your canonical repo and endpoints):

```bash
# clone a harness and run a smoke test (replace with canonical repo)
git clone https://example.com/itbench-aa-harness.git
cd itbench-aa-harness
python run_itbench.py --config config/itbench_aa_sre.yml --model my-llm
```

Example config snippet (illustrative; validate defaults under Assumptions / Hypotheses):

```yaml
tasks_dir: tasks/
output_dir: results/
models:
  - name: my-llm
    endpoint: https://api.provider.example/v1
    max_tokens: 8000
    timeout_ms: 30000
```

Notes: always follow the canonical task set and rubric when computing metrics so your numbers are comparable to the published results. Source: https://huggingface.co/blog/ibm-research/itbench-aa

## Common problems and quick fixes

- Models hit rate limits or fail mid-run. Fix: add retries with exponential backoff, monitor quotas, and use a secrets vault for keys. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Log format mismatch. Fix: normalize logs into the harness format and add unit tests for the parser. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Agent loops or excessive turns. Fix: impose a max_turns policy and flag tasks with turns far above the median. The report notes turn counts vary nearly 3× and longer runs do not guarantee higher accuracy. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Results differ from published numbers. Fix: confirm you used the canonical task set, the same rubric, and matched evaluation rules. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Quick policy snippet (example):

```yaml
agent_policy:
  max_turns: 40
  turn_penalty: 0.01
  retries: 3
  backoff_seconds: 2
```

## First use case for a small team

Goal: a solo founder or a small team (1–3 people) needs low-cost evidence about whether a model can draft diagnostics safely. The team wants to avoid any automated remediation until they are confident. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Actionable steps (concrete, low-friction):

1. Run a 10-task smoke set locally. Choose 10 representative tasks from the canonical set. Produce a per-model JSON report with accuracy, avg_turns, and false_positive_rate. Expect 10–30 minutes per smoke run depending on latency. Source: https://huggingface.co/blog/ibm-research/itbench-aa
2. Require human confirmation for any remediation until a conservative gate is met (example: 70% accuracy for autonomous actions). This gate is a local policy, not a claim from the report. Source: https://huggingface.co/blog/ibm-research/itbench-aa
3. Use turn limits to control cost: set max_turns = 40 and a per-request timeout = 30,000 ms. Log tasks with > 2× median turns for manual review. Source: https://huggingface.co/blog/ibm-research/itbench-aa
4. Start with local or open models to reduce marginal cost. When testing commercial endpoints, run a capped batch (for example, 20 tasks) to estimate per-model spend before scaling. Source: https://huggingface.co/blog/ibm-research/itbench-aa

Small-team checklist (smoke evaluation):

- [ ] Acquire canonical ITBench-AA SRE tasks and rubric (verify source). Source: https://huggingface.co/blog/ibm-research/itbench-aa
- [ ] Run a 10-task smoke test and produce a JSON report
- [ ] Flag tasks with > 2× median turns for manual review
- [ ] Require human confirmation for remediation until your accuracy gate is met

Decision table (reported values from ITBench-AA):

| Model (reported) | Accuracy | Avg turns | Note |
|---|---:|---:|---|
| Claude Opus 4.7 | 47% | — | Top reported at 47% (below 50%). Source: https://huggingface.co/blog/ibm-research/itbench-aa |
| GPT-5.5 (xhigh) | 46% | 31 turns | Reported avg 31 turns. Source: https://huggingface.co/blog/ibm-research/itbench-aa |
| Qwen3.7 Max | 42% | — | Reported below 50%. Source: https://huggingface.co/blog/ibm-research/itbench-aa |

## Technical notes (optional)

- Metric definitions (short): accuracy = fraction of tasks where the final root-cause entity matches the rubric; average turns = mean interaction turns per task; false-positive pattern = rate of plausible but incorrect root-cause entities. These are the core outputs emphasized in the ITBench-AA write-up. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Turn-count variance: ITBench-AA reports nearly 3× variation across models; examples include 31 vs 83 turns where longer trajectories do not imply better accuracy. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Dataset provenance: ITBench was developed by IBM and adapted by Artificial Analysis for this frontier evaluation. Confirm you use the canonical task set referenced in the report. Source: https://huggingface.co/blog/ibm-research/itbench-aa

## What to do next (production checklist)

Source: https://huggingface.co/blog/ibm-research/itbench-aa

### Assumptions / Hypotheses

- Assumption: you will validate that your harness matches the ITBench-AA implementation and rubric by checking dataset hashes and rubric files against the canonical source. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Suggested practical defaults to validate locally (examples to be tested): single-model smoke run setup time depends on your environment; canary fraction for a low-risk rollout = 5%; policy limits: max_turns = 40; retries = 3; backoff_seconds = 2; request timeout = 30000 ms; model request max_tokens = 8000 tokens. These are operational suggestions to validate, not claims from the report. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Hypotheses to validate with runs: models that produce long trajectories (> median × 2) will not show consistent accuracy gains; over-investigation correlates with higher false-positive rates. Source: https://huggingface.co/blog/ibm-research/itbench-aa

### Risks / Mitigations

- Risk: model reports a plausible but incorrect root cause and triggers automated remediation. Mitigation: require human confirmation for remediation during canary and for any task where a false-positive heuristic or low confidence is detected. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Risk: API rate limits or key leakage. Mitigation: store keys in a secrets vault, rotate keys, add retries with exponential backoff, and monitor quota usage. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Risk: benchmark inputs differ from production logs. Mitigation: normalize logs to the harness format, add parser unit tests, and run an integration test comparing sample production logs to harness inputs before trusting results. Source: https://huggingface.co/blog/ibm-research/itbench-aa

### Next steps

- Run a full benchmark for each candidate model and produce JSON reports per model. Compare your numbers to the published leaders (47%, 46%, 42%) but expect variation. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Use a decision artifact (no deploy / human-in-loop / canary / full rollout) driven by accuracy, avg_turns, and false-positive patterns. Source: https://huggingface.co/blog/ibm-research/itbench-aa
- Schedule automated weekly runs (example cron below) to detect regressions and drift; keep historical JSON reports for trend analysis.

Example cron job (illustrative only):

```bash
# run the harness weekly (example)
0 3 * * 1 /usr/bin/python /opt/itbench/run_itbench.py --config /opt/itbench/config/itbench_aa_sre.yml >> /var/log/itbench/weekly.log 2>&1
```

Methodology note: this guide focuses on reproducing the core ITBench-AA SRE evaluation and interpreting its core metrics. Consult the original report for full dataset provenance and rubric details. Source: https://huggingface.co/blog/ibm-research/itbench-aa
