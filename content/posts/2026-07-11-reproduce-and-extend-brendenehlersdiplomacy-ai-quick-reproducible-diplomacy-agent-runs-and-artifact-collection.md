---
title: "Reproduce and extend brendenehlers/diplomacy-ai: quick, reproducible Diplomacy agent runs and artifact collection"
date: "2026-07-11"
excerpt: "Step-by-step guide to clone and run brendenehlers/diplomacy-ai demos, save reproducible logs, collect move histories, and compare agent configs to measure behavior."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-11-reproduce-and-extend-brendenehlersdiplomacy-ai-quick-reproducible-diplomacy-agent-runs-and-artifact-collection.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "multi-agent"
  - "diplomacy"
  - "open-source"
  - "github"
  - "tutorial"
  - "experimentation"
sources:
  - "https://github.com/brendenehlers/diplomacy-ai"
---

## TL;DR in plain English

- Clone the demo sandbox. (https://github.com/brendenehlers/diplomacy-ai)
- Use a Python virtual environment. Install the repo requirements. Run one example entrypoint. Save logs and artifacts to a local logs/ folder.
- Make runs reproducible. Pick a numeric seed (for example 42). Record python --version and pip freeze output. Save the exact config file used.

Quick checklist:

- [ ] git clone https://github.com/brendenehlers/diplomacy-ai
- [ ] create a virtualenv and install deps
- [ ] run one demo entrypoint and save outputs to logs/
- [ ] record seed, Python version, and config used

Method note: this guide follows the repo’s demo-first intent and aims for fast, reproducible runs. (https://github.com/brendenehlers/diplomacy-ai)

## What you will build and why it helps

You will reproduce a local demo run from the repository and collect artifacts for analysis. The repo is an exploratory sandbox with example scripts and entrypoints. (https://github.com/brendenehlers/diplomacy-ai)

Primary artifacts to collect:

- Per-run logs saved under logs/run-<timestamp>.json (1 file per run recommended).
- Move-history CSV or JSON if the demo writes them.
- A short comparison table of two agent configs (baseline vs experiment).

Example decision/comparison table (baseline vs experiment):

| Metric | Baseline | Experiment |
|---|---:|---:|
| Matches run | 10 | 10 |
| Win rate (%) | 30% | 45% |
| Avg negotiation messages | 7 | 9 |
| Median latency per decision (ms) | 180 ms | 220 ms |

Why this helps: running controlled demos yields measurable signals for prompts, policies, and agent configs. You can iterate quickly without building a production stack. (https://github.com/brendenehlers/diplomacy-ai)

## Before you start (time, cost, prerequisites)

Prerequisites

- Git and network access to https://github.com/brendenehlers/diplomacy-ai.
- Python 3.8+ installed and the ability to create virtual environments.
- Basic CLI skills: running Python scripts and editing small YAML/JSON files.

Estimates and budget guidance

- Local smoke-test: plan 1 run (≈5–15 minutes).
- Small reproducibility sweep: plan >=10 matches (≈30–120 minutes depending on concurrency).
- People: solo or small teams of 1–3 people recommended for early experiments.
- Cost: local CPU runs can be $0. External LLM calls may cost $10–$100 for exploratory batches; set a stop threshold at $50.

Quick preflight checklist

- [ ] confirm python --version and pip --version
- [ ] clone https://github.com/brendenehlers/diplomacy-ai and open README.md
- [ ] create a virtualenv and install requirements listed in the repo
- [ ] prepare a gitignored config file for any API keys

## Step-by-step setup and implementation

Follow these condensed steps. Inspect the README and example entrypoints first: https://github.com/brendenehlers/diplomacy-ai.

1) Clone and inspect the repo

```bash
git clone https://github.com/brendenehlers/diplomacy-ai
cd diplomacy-ai
ls -la
# open README.md and look for example scripts or an examples/ folder
```

2) Create an isolated Python environment and install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Record environment details:

```bash
python --version
pip freeze > env.txt
```

3) Run a single demo entrypoint and save outputs

- Find a runnable command in the README or examples folder. Redirect logs to logs/.

```bash
mkdir -p logs
# example placeholder — adapt to the repo's actual entrypoint
python run_demo.py --output logs/run-$(date +%s).json
```

4) Create a small gitignored config file for runs

```yaml
# config.yaml (example)
seed: 42
concurrency: 1
agents:
  - name: A
    policy: local_mock
  - name: B
    policy: local_mock
llm:
  provider: example_api
  api_key_env: EXAMPLE_API_KEY
```

- Save a copy of the exact config used for each run.
- For reproducibility run >=10 matches and record: seed, python version, pip freeze, and config path.

5) Simple rollout gates (recommended thresholds)

- Canary: 1 match before wider batch.
- Batch: 50 matches for a promotion run.
- Rollback if win rate drops by >50% relative to baseline.

(Repo reference: https://github.com/brendenehlers/diplomacy-ai)

## Common problems and quick fixes

Reference the README at https://github.com/brendenehlers/diplomacy-ai while debugging.

- Missing dependencies or Python mismatch: recreate the virtualenv and run pip install -r requirements.txt. Record python --version.
- No obvious entrypoint: search for README, examples/, or scripts named run_*. If none exist, open an issue on the repo.
- Slow runs or high memory: reduce concurrency and agent count in config (for example set concurrency 4 → 1). Aim to keep RAM use under 80%.
- External API limits or cost: use local mock policies for CI and smoke tests to keep per-call latency low (target <200 ms for mocks).
- Missing outputs: increase log level and run 1–3 debug runs to dump full logs.

Metrics quick-fix thresholds

- If RAM usage >80%, reduce concurrency or agent count.
- If per-decision latency >200 ms for mocks, use caching or lower concurrency.
- If run-to-run variance >10% on key metrics, pin the seed and re-run >=10 matches.

## First use case for a small team

Actionable plan for a solo founder or a 1–3 person team using the sandbox (https://github.com/brendenehlers/diplomacy-ai).

1) One-hour setup and smoke test (60 minutes)

- Clone the repo, create a virtualenv, install requirements, and run exactly one demo entrypoint. Save logs to logs/ and note timestamp.
- Record python --version, pip freeze > env.txt, and the seed used (e.g., 42).

2) Quick metrics sweep (1–2 hours)

- Run 10 automated matches with a local mock policy. Save move-history files and one aggregated CSV of per-run metrics.
- Capture two simple metrics per run: win_count and negotiation_count. Export as CSV for quick analysis.

3) Triage & iterate (2–8 hours)

- If behavior is stable (variance <=10%), change one variable: a prompt string, a decision threshold, or an agent count. Run another 10-match sweep and compare.
- Use canaries: 1 single-match test before a 50-match batch. If win rate drops by >50%, stop and revert.

Extra tips

- Keep concurrency low (1–2) during early tests. This reduces RAM and flakiness.
- Pin a seed (for example seed 42) and store it with logs for reproducibility.
- Create README-CHECKLIST.md in your fork with exact commands that produced a successful run.

(Reference: https://github.com/brendenehlers/diplomacy-ai)

## Technical notes (optional)

- Repository intent: the repo describes itself as an experimental demo: “ever wondered what a game of diplomacy played by ai agents would look like?” (https://github.com/brendenehlers/diplomacy-ai).
- Reproducibility: log seed (e.g., 42), Python version, pip freeze output, and the exact config used for each run.
- External LLMs: if you plan to call LLM APIs, capture token counts per call and note per-call token limits. Set a budget threshold (for example stop if projected spend > $50 per batch).
- Recommended thresholds summary: run count 10, canary 1, batch 50, RAM 80%, latency 200 ms, seed 42, budget $50–$100.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository includes README and example scripts or entrypoints that can be inspected and run, based on the repo description. (https://github.com/brendenehlers/diplomacy-ai)
- Time and cost planning (1 hour smoke test, 10-match sweep, $10–$100 exploratory spend) are scheduling assumptions to help you plan work.
- Operational thresholds suggested above (80% RAM, 200 ms latency, >=10 matches, seed=42, canary 1 match, batch 50 runs) are recommendations, not hard repo constraints.

### Risks / Mitigations

- Risk: external API cost or quota surprises. Mitigation: use local mock policies for CI, track token usage, and set a hard spend stop at $50 per batch.
- Risk: nondeterministic results. Mitigation: pin seeds (e.g., 42), run >=10 matches, and record environment snapshots (python and pip output).
- Risk: resource exhaustion during batches. Mitigation: gate with a canary match (1), limit concurrency to 1–4, and monitor memory (avoid >80% RAM).

### Next steps

- Add README-CHECKLIST.md to your fork with exact commands and the successful run details (seed, python version, pip freeze, config file).
- Create a CI smoke-test that runs 1 match with a local mock and checks for logs/ and move-history artifacts.
- Run a reproducibility sweep of >=10 matches, collect metrics, and export a decision table comparing baseline vs. experiment.
- If calling LLM APIs, create a prompt/version manifest and a cost-tracking sheet before spending more than $50 on experiments.

(Starting point: https://github.com/brendenehlers/diplomacy-ai)
