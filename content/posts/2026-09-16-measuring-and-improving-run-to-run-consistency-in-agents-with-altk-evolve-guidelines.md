---
title: "Measuring and Improving Run-to-Run Consistency in Agents with ALTK-Evolve Guidelines"
date: "2026-09-16"
excerpt: "Learn a practical pipeline to measure run-to-run agent consistency (R=5), log full trajectories, and inject short ALTK-Evolve guidelines at inference to reduce flip failures."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-16-measuring-and-improving-run-to-run-consistency-in-agents-with-altk-evolve-guidelines.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "agents"
  - "consistency"
  - "reliability"
  - "evaluation"
  - "ALTK-Evolve"
  - "metrics"
  - "guidelines"
  - "HuggingFace"
sources:
  - "https://huggingface.co/blog/ibm-research/altk-evolve-consistency"
---

## TL;DR in plain English

- Problem: an agent can succeed once and then fail on the same task on the next run. This is a run-to-run consistency problem. See the study: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Data point: the Hugging Face / IBM example shows 77.4% average success but only 53.0% of tasks succeeded on all five repeats. That is a 24.4 percentage-point consistency gap. Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- First steps: pick a focused set of tasks, run repeated inferences, and log full trajectories (prompts, planner steps, tool calls). The study uses R = 5 repeats as a practical baseline. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Quick fix: distill 2–5 short bullets from winning trajectories. Inject them at inference time behind a toggle. Rerun the repeated test to confirm flips decreased. Reference: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## What you will build and why it helps

You will build a small pipeline that does three things:

1. Measure run-to-run consistency by running each task multiple times and logging the full trajectory (R = 5 is the baseline used in the referenced study). See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
2. Extract short, machine-injectable "consistency guidelines" from successful trajectories. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
3. Inject those guidelines at inference time behind a feature flag and run a canary to validate impact. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Why this matters: average success hides instability. The study reports average success (77.4%) and a distinct per-task all-run success (53.0%). Measuring per-task all-run success surfaces the instability that averages obscure. Injecting distilled guidelines nudges the agent toward stable decision paths without full retraining. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Before you start (time, cost, prerequisites)

Prerequisites (minimum):

- Permission to capture replay logs (full trajectories: prompts, planner states, tool calls). See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Ability to prepend or toggle small guideline bundles at inference time.
- Basic scripting skills (bash + Python) to run repeated jobs and process CSV/JSON outputs.

Estimated time and cost:

- Initial experiment: one afternoon to a few days if logging is available. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Short methodology note: use R = 5 repeats as the practical baseline from the study. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Quick checklist before you begin:

- [ ] Permission to capture full trajectories — required. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- [ ] Ability to toggle an inference feature flag — recommended.
- [ ] A script or notebook to compute average success and per-task all-run success.

## Step-by-step setup and implementation

1) Baseline measurement

- Pick a representative task set and run each task R times. The referenced work uses R = 5. Log one record per (task, run) with the full trajectory and a binary success label. Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

2) Compute the key metrics

- average_success = mean(success across all task-run pairs)
- per_task_all_run_success = fraction of tasks that succeeded on all R runs
- consistency_gap = average_success - per_task_all_run_success

Example (reported): average_success = 77.4%, per_task_all_run_success = 53.0%, consistency_gap = 24.4 percentage points. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

3) Diagnose flips

- For flipping tasks, compare successful vs failed trajectories. Inspect planner branches, tool calls, prompt deltas, and timestamps. Log planner state and tool outputs to isolate differences.

4) Distill concise guidelines

- From winning trajectories, pick 2–5 short bullets that encode the stable decision path. Keep each bullet one short sentence.

5) Inject and toggle

- Prepend the guideline bundle to the planner context or add it as an instruction. Make the injection configurable for A/B tests or canaries.

6) Measure the change

- Re-run the repeated test with and without guidelines using the same R baseline. Compare average_success and per_task_all_run_success.

Example commands and config

Bash — run baseline (example):

```bash
# run_baseline.sh: run N tasks with R repeats and store trajectories
python run_baseline.py --tasks tasks.csv --repeats 5 --out baseline_results.csv
```

YAML — inference config toggle (example):

```yaml
# inference_config.yaml
inject_consistency_guidelines: true
guidelines_path: "repo:/guidelines/guidelines.json"
# planner_timeout_ms: 2000  # operational choice; see Assumptions / Hypotheses
```

Python — compute metrics (example):

```python
# compute_metrics.py
import csv
from statistics import mean

def compute(baseline_csv):
    rows = list(csv.DictReader(open(baseline_csv)))
    tasks = {}
    for r in rows:
        tasks.setdefault(r['task_id'], []).append(int(r['success']))
    avg = mean(sum(v)/len(v) for v in tasks.values())
    all_run = sum(1 for v in tasks.values() if all(x == 1 for x in v))/len(tasks)
    return avg, all_run, avg - all_run

avg, all_run, gap = compute('baseline_results.csv')
print(f"average_success={avg*100:.1f}%, per_task_all_run_success={all_run*100:.1f}%, consistency_gap={gap*100:.1f}pp")
```

Decision table (baseline vs guideline-injected)

| Metric | Baseline (example) | With Guidelines (goal) |
|---|---:|---:|
| average_success | 77.4% | ≥ 76% |
| per_task_all_run_success | 53.0% | ≥ 70% |
| consistency_gap | 24.4 pp | ≤ 10 pp |

Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Rollout note: keep the first rollout small and short. Use the same R baseline during canary measurements. See ALTK-Evolve concept: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Common problems and quick fixes

- Symptom: high variability but no clear prompt difference.
  - Quick fix: re-run with deterministic decoding or fixed seeds to reduce sampling noise and re-check. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

- Symptom: tool calls alternate between runs.
  - Quick fix: add a guideline that prefers the reliable tool or include a guard derived from winning trajectories. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

- Symptom: guidelines reduce average success.
  - Quick fix: shorten the guidelines; turn them into preferences rather than hard rules; A/B test and rollback if average_success drops by > 1–2 percentage points.

- Symptom: noisy metrics from small samples.
  - Quick fix: increase R or increase N and report confidence intervals before rollout.

Common causes and mitigations

- Flip in tool call → cause: unstable tool selection. Mitigation: prefer one tool in guidelines.
- Different planner branch → cause: low-confidence planner choice. Mitigation: inject a stable sequence from a winning trajectory.
- Random sampling differences → cause: high temperature. Mitigation: lower temperature or use deterministic decoding.

Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## First use case for a small team

Scenario: a 1–3 person team runs an invoice-reconciliation agent that flips results on repeated runs. The goal is a fast, low-cost reliability improvement without retraining. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Concrete steps for a small team (rapid cycle):

1) Rapid scope + capture

- Pick a narrow slice of high-value inputs and run R = 5 repeats for each input. Save full trajectories (prompts, planner steps, tool outputs). See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

2) Quick triage and distillation (1–2 hours)

- Inspect winning trajectories and write 2–5 short bullets that capture the stable decision path. Commit them to guidelines.json.

Example guidelines.json snippet:

```json
{
  "guidelines": [
    "If amounts match exactly, skip extra verification steps.",
    "Prefer ledger-match when vendor names differ by > 2 tokens.",
    "If invoice date missing, request it before reconciling."
  ]
}
```

3) Tiny canary + fast measurement (1–3 days)

- Enable guidelines behind a feature flag and replay the same R = 5 repeats for the scoped inputs. Compare average_success and per_task_all_run_success. If per_task_all_run_success improves without a meaningful drop in average_success, keep the change; otherwise revert and iterate. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Operational tips

- Iterate capture → distill → canary in short cycles (1–3 day cycles).
- Treat guidelines like code: small commits, reviews, and easy rollback.
- Automate the metric comparison so each experiment re-runs in under 10 minutes.

Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Technical notes (optional)

- Metric formulas (compact):
  - average_success = mean(success_{task,run})
  - per_task_all_run_success = (# tasks with success on all R runs) / N_tasks
  - consistency_gap = average_success - per_task_all_run_success

- Logged fields that help automated diagnosis: planner state, tool calls, prompts, and (if feasible) model logits. These support automated distillation or later retraining. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

- Reported example numbers to reference: 77.4% average success, 53.0% per-task all-run success, 24.4 percentage-point gap. See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## What to do next (production checklist)

- [ ] Baseline measurement saved as CSV/JSON with full trajectories (use R = 5 as the study baseline). See: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- [ ] Distilled guidelines committed to repo (guidelines.json)
- [ ] Inference toggle implemented (feature flag)
- [ ] Canary plan defined (traffic %, duration, owner)
- [ ] Alerts and dashboard for consistency_gap and average_success

Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency

### Assumptions / Hypotheses

- Baseline repeats: R = 5 is treated as the practical baseline (supported: https://huggingface.co/blog/ibm-research/altk-evolve-consistency).
- Operational thresholds to validate in your environment: canary traffic 5% of traffic; canary duration 24–72 hours; guideline bundle size 3–5 bullets; extract 5–20 winning trajectories for initial distillation; planner timeout example 2000 ms.
- Rollback gates (hypothesis): require a decrease in consistency_gap or an increase in per_task_all_run_success; abort if average_success drops by > 1–2 percentage points.

### Risks / Mitigations

- Risk: guidelines over-constrain the agent and reduce average success.
  - Mitigation: keep bullets short, use preferences not hard rules, A/B test and roll back quickly.
- Risk: insufficient sample size yields noisy measurements.
  - Mitigation: increase R or increase N and report confidence intervals before changing production routing.
- Risk: unstable external tools inflate flips.
  - Mitigation: add tool-health checks, prefer reliable tools in guidelines, and monitor tool error rates.

### Next steps

1. Implement the baseline script and run R = 5 on your prioritized tasks.
2. Extract 5–20 winning trajectories, author 3–5 short guidelines, store them as guidelines.json behind a feature flag.
3. Run a small canary (e.g., 5% traffic, 24–72 hours), monitor consistency_gap and average_success, and use the rollback gates above to decide promote vs rollback.

Source: https://huggingface.co/blog/ibm-research/altk-evolve-consistency
