---
title: "The Rouge — an open-source build→evaluate→fix workflow for shipping AI MVPs"
date: "2026-05-05"
excerpt: "Walkthrough of The Rouge repo: an open-source workflow that turns ideas into MVP stories via a spec phase and repeatable build→evaluate→fix loops with external checks and escalation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-05-the-rouge-an-open-source-buildevaluatefix-workflow-for-shipping-ai-mvps.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "the-rouge"
  - "ai-product-factory"
  - "iterative-development"
  - "autoresearch"
  - "llm-workflows"
  - "qa"
  - "open-source"
  - "prompt-engineering"
sources:
  - "https://github.com/gregario/the-rouge"
---

## TL;DR in plain English

The Rouge repo prescribes an iterative product-development pattern: build, evaluate against external signals, fix, repeat until the quality bar is met. The project statement is explicit: “Not one-shot code generation. Iterative product development: build, evaluate against external signals, fix, repeat until the quality bar is met.” See the repository: https://github.com/gregario/the-rouge

Concise actionable points:
- Work in short loops: one small change → one model call → one external check → accept or fix and repeat.
- Keep each iteration small and reviewable; store the prompt, model output, and evaluation result for every run.
- Escalate to a human after a fixed number of failing iterations (for example, after 2 consecutive failures).

Quick start checklist (very small):
- [ ] Clone the repository and open README.md.
- [ ] Run one demo loop to observe artifacts.
- [ ] Decide and document the human-escalation rule.

Minimal commands to get the source locally (example):

```bash
# clone and inspect
git clone https://github.com/gregario/the-rouge.git
cd the-rouge
ls -la
head -n 40 README.md
```

One short methodology note: treat each iteration as an experiment — change only one variable at a time to keep results interpretable. Grounding: https://github.com/gregario/the-rouge

## What you will build and why it helps

You will adopt a short build → evaluate → fix loop for a single feature or story so every iteration produces replayable artifacts. The repository frames this iterative philosophy directly: https://github.com/gregario/the-rouge

Why it helps:
- Repeatable checks reduce release surprises and improve auditability.
- External-signal evaluation (a check outside the single model call) makes automation measurable and separable from the model itself.
- Small teams can automate noisy work and intervene only on persistent failures, keeping human attention for higher-value tasks.

This is a pattern, not a single script — adapt the loop to your tests, risk profile, and tooling. See the repo for the stated pattern: https://github.com/gregario/the-rouge

## Before you start (time, cost, prerequisites)

Prerequisites (minimal):
- git, a POSIX shell (bash or zsh), and a text editor. See: https://github.com/gregario/the-rouge
- Comfort running scripts and reading logs.
- If you call hosted models, an API key and provider account.

Estimated time and conservative cost (examples to plan by):
- Time: 60–180 minutes (1–3 hours) to clone, read README, and run a demo loop.
- Budget: start with $5–$50 total for exploratory hosted-model calls; use a budget guard early.

Practical prep steps:
1. Clone the repo and inspect README.md for the suggested entry point: https://github.com/gregario/the-rouge
2. Identify a working directory for artifacts (one folder per story).
3. Choose an external evaluation harness (unit test, JSON schema, or scripted UI check).

## Step-by-step setup and implementation

Runbook (adapt to the repo layout you find after cloning):

1) Clone and inspect the project root and README: https://github.com/gregario/the-rouge

2) Create a work directory for artifacts (prompts, outputs, evaluations, and logs). Use a one-folder-per-story convention.

3) Wire an external evaluation harness. Typical options are unit tests, JSON-schema validation for structured outputs, or scripted headless UI checks. The important rule: the evaluation is external to the model call and should be deterministic where possible.

4) Run a single story through one iteration. Save these artifacts as files:
   - prompt.txt
   - output.json or output.txt
   - evaluation.json (pass/fail + metrics)
   - run.log (caller, timestamp, tokens used, latency)

5) If the evaluation fails, make a small targeted fix (prompt tweak, instruction change, or post-processing rule) and repeat. Stop when the acceptance criteria are met or when the escalation rule triggers.

6) Define escalation rules in advance (for example: escalate after 2 consecutive failures or after exceeding 5 iterations).

Decision frame (comparison table):

| Evaluation type | Best for | Notes |
|---|---:|---|
| Unit test | Structured logic, deterministic outputs | Fast, repeatable, integrates with CI |
| JSON schema | Structured model outputs (JSON) | Verifies shape and types, simple gate |
| Headless UI check | Visual or layout outcomes | Simulates browser rendering; slower but closer to user view |

Example config file to start from (adapt and secure keys):

```yaml
# example-config.yaml
api_key: "REPLACE_WITH_KEY"
model: "example-model"
temperature: 0.2
quality_gate: 0.90
workdir: "./work"
max_iterations: 5
budget_usd: 20
```

Log and observability snippet (example JSON):

```json
{
  "iteration": 1,
  "tokens_used": 412,
  "latency_ms": 240,
  "evaluation_pass": false
}
```

Grounding for the pattern: https://github.com/gregario/the-rouge

## Common problems and quick fixes

Symptom: loop repeats the same failure 2–3 times
- Quick fix: inspect saved artifacts (prompt + output + evaluation). If failures repeat across 2 consecutive iterations, escalate to human spec update.

Symptom: outputs are high-variance
- Quick fix: reduce nondeterminism by lowering temperature, pin model selection, or use more deterministic model variants.

Symptom: external checker starts failing after an environment change
- Quick fix: pin checker versions, run the checker locally, and validate network dependencies.

Symptom: unexpected spend or token usage
- Quick fix: instrument per-run token counts, cap tokens per call (e.g., 2,048 token cap as an example guard), and add a hard budget guard.

These remedies align with the repo’s emphasis on external-signal checks and repeat-until-quality behavior: https://github.com/gregario/the-rouge

## First use case for a small team

Target: a solo founder or a small team (1–3 people) shipping one narrow MVP story while keeping risk low. The repository’s iterative approach is the reference: https://github.com/gregario/the-rouge

Concrete steps for small teams:
1. Write a one-paragraph spec for a single story and store it with the artifacts.
2. Automate one external check (unit test or JSON schema) and use it as the loop gate.
3. Define an escalation rule: for example, pause automation and review after 2 consecutive failures.
4. Keep runs observable in a folder or simple log so you can replay regressions.
5. Start with 1 story end-to-end before expanding.

Suggested role split (example for 1–3 people):
- Spec: Owner/Founder — 1 paragraph per story.
- Loop operator: runs automation and captures artifacts.
- Reviewer: human who triages escalations.

Decision checklist (practical):
- [ ] Spec written and stored with project artifacts.
- [ ] One external check automated and passing locally.
- [ ] Run one demo loop and inspect saved artifacts.

Reference: https://github.com/gregario/the-rouge

## Technical notes (optional)

Pattern-level guardrails:
- Treat each iteration as a discrete transaction: prompt → model → external evaluation → fix.
- Persist prompt, output, evaluation result, iteration count, tokens used, and who triggered any escalation.

Observability recommendations (examples to implement):
- Record iteration_count, evaluation_outcome, tokens_used, and latency_ms.
- Log human escalations with a timestamp and reason.

Example quick commands to run a demo loop (illustrative):

```bash
# run a one-off demo using the repo's runner (example only)
./scripts/run-loop.sh --story=example-catalog --max-iterations=3 --budget-usd=20
```

See the repo for intent and examples: https://github.com/gregario/the-rouge

## What to do next (production checklist)

Follow these production steps; the repository describes the iterative pattern and is the reference: https://github.com/gregario/the-rouge

1. Clone and read README.md (10–20 minutes).
2. Create a local config from the example above and choose conservative defaults (max_iterations = 3; quality_gate = 0.90).
3. Run a single demo story, capture artifacts, and note tokens used and iteration counts.
4. Add basic observability and budget guards; alert if token usage per run rises > 30% vs baseline.
5. Prepare a simple rollout: feature flag, 1% canary, metric gates, and an explicit rollback script.

Final pre-production checklist:
- [ ] Clone and read README (1)
- [ ] Create config and secure keys (2)
- [ ] Run 1 demo loop and inspect outputs (3)
- [ ] Set conservative iteration and budget caps (4)
- [ ] Prepare feature flag and small canary (5)

### Assumptions / Hypotheses

The repository explicitly prescribes an iterative build/evaluate/fix loop: https://github.com/gregario/the-rouge

The numeric thresholds below are templates and assumptions to adapt for your environment:
- Initial exploration time: 120 minutes (≈2 hours).
- Iteration cap: 1–5 iterations; escalate after 2 consecutive failures.
- Quality gates: 0.90 (90%) for pre-release, 0.95 (95%) for wider release.
- Canary exposure: 1%–5% of users for 24–48 hours.
- Budget guard for exploratory runs: $20 (conservative); scale to $5–$50+ as needed.
- Token caps: 2,048 tokens per call; response tokens often 256–512 for short outputs.
- Latency guard: monitor median latency and flag if median + P95 exceeds 1000 ms.
- Rollback trigger examples: error rate > 0.5% or QA pass < 60%.

These values are starting suggestions you should tune.

### Risks / Mitigations

- Risk: runaway API spend. Mitigation: hard budget guard, cap tokens per call (e.g., 2,048), and limit iterations (1–5).
- Risk: flaky checks produce false positives/negatives. Mitigation: require 2 consecutive green runs before canary and mandate human review after repeated failures.
- Risk: user impact during canary. Mitigation: keep canary small (1%–5%), monitor for 24–48 hours, and define rollback triggers (error rate > 0.5%).

### Next steps

1. Clone the repo and read README.md now: https://github.com/gregario/the-rouge (10–20 minutes).
2. Create a local config, pick conservative defaults (max_iterations = 3; quality_gate = 0.90), and secure API keys.
3. Run one demo story; capture artifacts and measure baseline tokens and latency.
4. Add budget and token guards; alert on > 30% token increase vs baseline.
5. Plan a controlled rollout: feature flag, 1% canary, metric gates, and an automated rollback command or script.

Repository reference: https://github.com/gregario/the-rouge
