---
title: "OrgForge: Seeded, reproducible synthetic corporate datasets for testing AI agents"
date: "2026-06-17"
excerpt: "Use OrgForge to create seeded, reproducible synthetic corporate datasets (JSON/CSV) for testing AI agent workflows — run quick small scenarios or larger stress tests without real PII."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-17-orgforge-seeded-reproducible-synthetic-corporate-datasets-for-testing-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "synthetic-data"
  - "orgforge"
  - "ai-agents"
  - "evaluation"
  - "dataset-generation"
  - "open-source"
sources:
  - "https://github.com/aeriesec/orgforge"
---

## TL;DR in plain English

- What changed: OrgForge is an open-source tool that generates synthetic corporate datasets you can run locally. It is designed for evaluating AI agents. Repo: https://github.com/aeriesec/orgforge
- Why it matters: Synthetic corporate datasets let you validate agent logic, catch edge cases, and run repeatable regression checks without exposing real company data (no real PII — personally identifiable information).
- What to do now (short): clone the repo, make an isolated Python environment, open an example profile, run a small seeded generation, and inspect the JSON/CSV output.

Quick concrete example you can try right away:
- Generate 100–1,000 records with a deterministic seed (for example, 42). This produces identical output when re-run. Use the output to test an agent's onboarding or incident-triage logic.

Plain-language note before technical details:
- This guide shows how to get reproducible, fake corporate data. "Reproducible" means you can run the same command and get the same dataset by using an integer random seed. Use small runs for fast iteration and larger runs to test coverage. The repo page describes the project as a "synthetic corporate dataset generator for AI agent evaluation": https://github.com/aeriesec/orgforge

## What you will build and why it helps

You will produce a reproducible synthetic corporate dataset in JSON and/or CSV format. You will also make a small scenario profile. That profile exercises behaviors your agent should handle. Example scenarios: onboarding new hires, triaging incidents, answering org-chart questions.

Why this helps:
- Reproducible tests: set an integer random number generator (RNG) seed so runs are identical across machines. Example seed: 42.
- Safer testing: synthetic data avoids exposing real PII while keeping structure that reveals logic bugs.
- Repeatable benchmarks: use small runs (100 records) for continuous integration (CI) checks and larger runs (1,000–10,000) for coverage and stress tests.

Concrete artifacts you will finish with:
- A profile/config file that declares sample_count (for example, 1000) and seed (for example, 42).
- A generated dataset file like output/example-dataset.json or .csv.
- A tiny evaluation harness that computes basic metrics (for example, top-1 accuracy and average latency).

Repository for reference: https://github.com/aeriesec/orgforge

## Before you start (time, cost, prerequisites)

Estimated time and cost (use these as planning numbers):
- Setup and first run: about 60–120 minutes (1–2 hours).
- Software license cost: $0 for the generator (open-source).
- Cloud VM testing: optional, expect around $5–$20/month for a small test VM if you scale beyond a laptop.
- Disk sizing: 1,000 records typically use a few megabytes; 10,000 records use tens of megabytes.

Recommended prerequisites:
- Git installed. Example clone command: git clone https://github.com/aeriesec/orgforge
- Python 3.8 or newer and pip. Examples use Python 3.8, 3.9, or 3.10.
- Optional: virtualenv or Docker for isolation.
- Local hardware: a laptop with 2–4 CPU cores and 8 GB RAM can handle 100–10,000 records comfortably.

Short methodology note:
- The repository is the authoritative source for usage and example profiles. Validate exact file names and CLI flags there: https://github.com/aeriesec/orgforge

## Step-by-step setup and implementation

1) Clone and inspect the repository

```bash
git clone https://github.com/aeriesec/orgforge
cd orgforge
ls -la
```

- This copies the project to your machine. Look for a README and an examples directory.

2) Create an isolated Python environment and install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

- Create a virtual environment so dependencies do not affect other projects. Activate it, then install packages from requirements.txt.

3) Open an example profile and choose sample_count and seed

- Find example profiles or the README in the repo to see available fields. Begin with a small sample_count (for example, 100 or 1,000) and a fixed seed (for example, 42).

Example profile (save as examples/incident-profile.json):

```json
{
  "profile_name": "incident-triage-smoke",
  "sample_count": 1000,
  "seed": 42,
  "organization_size": 250,
  "event_rate": 5
}
```

- This file is a simple configuration. sample_count controls how many records the generator makes. seed makes generation deterministic.

4) Run the generator

- Check the repository README to confirm the exact CLI command or script name. Point the tool at your profile and an output path.

Example invocation (adjust to repo tooling):

```bash
# example command — check the repo README for the exact CLI
python -m orgforge.generate --profile examples/incident-profile.json --out output/example-dataset.json
```

- If the repo uses a different module name or flag, follow the README. The example command shows the typical pattern: a profile input and a file output.

5) Validate output

- Confirm the output file exists and contains the expected number of records (for example, 1,000).
- Spot-check fields such as timestamps, severity, and department names.
- Verify deterministic behavior by re-running with the same seed and confirming identical output.

6) Iterate and expand

- Start with sample_count = 100. When stable, increase to 1,000 and then 10,000 for broader coverage.
- To test variability, run multiple seeds (for example, 42, 101, 2026, 7, 999) and compare metrics across runs.

Repository: https://github.com/aeriesec/orgforge

## Common problems and quick fixes

| Symptom | Likely cause | Quick fix |
|---|---:|---|
| Install errors | Missing Python version or deps | Create venv, pip install -r requirements.txt; use Python 3.8+ |
| Non-deterministic output | No or varying RNG seed | Set seed (e.g., 42) in profile and commit the profile |
| Too-large output | sample_count set too high | Reduce sample_count to 100–1,000 for iteration |
| Schema mismatch | Agent expects different field names | Add a transform step or mapping before evaluation |

Quick fixes and knobs:
- Recreate the virtualenv if dependency errors appear.
- Always save the profile and seed alongside generated outputs.
- Use batch sizes: start at 100 records, then 1,000, then 10,000 for stress testing.
- Typical gate thresholds you may use: top-1 accuracy >= 80%, false-positive rate <= 5%, response latency <= 200 ms for interactive checks.

Repo reference: https://github.com/aeriesec/orgforge

## First use case for a small team

This section contains a low-cost, fast plan for a small team (three people or fewer). Follow these steps to get actionable results quickly.

Actionable point 1 — smoke-test on a laptop:
- Create a profile with sample_count = 100 and seed = 42.
- Run the generator and execute your agent against the 100 records.
- Aim for a generate+eval cycle under 60 seconds on a 2-core laptop so you can iterate quickly.

Actionable point 2 — versioned experiments and gates:
- Commit the profile and seed and the generator commit SHA into a test repo.
- Add a tiny CI job that regenerates the canonical dataset (sample_count = 100) and runs the agent on each pull request. Keep the smoke test under ~300 seconds (5 minutes).

Actionable point 3 — quick metric checklist and thresholds:
- Define three acceptance metrics before running: top-1 accuracy >= 80%, false-positive rate <= 5%, average decision latency <= 200 ms for single-record runs. Use those metrics as CI pass/fail criteria.

Actionable point 4 — low-cost stress step:
- For broader coverage, generate 1,000 records and run one stress test locally or on a cheap VM ($5–$20/month). 1,000 records exercise cross-department logic without large cost.

Actionable point 5 — privacy and variety:
- Run at least five different seeds (for example, 42, 7, 101, 2026, 999) and confirm the agent performance is stable across seeds.

Small-team checklist:
- [ ] Create and commit a profile with sample_count = 100 and seed = 42.
- [ ] Add a CI smoke test that runs the generator and evaluation (100 records).
- [ ] Define metric thresholds and require CI pass.
- [ ] Run five-seed cross-checks with sample_count = 1,000.

Repository reference: https://github.com/aeriesec/orgforge

## Technical notes (optional)

Where to look:
- Inspect the generator modules and example configs in the repository to learn how templates and samplers are composed: https://github.com/aeriesec/orgforge

Reproducibility:
- Always store the profile, seed (an integer), and the exact generator commit SHA to reproduce outputs. Example: seed = 42; commit = abcdef123; sample_count = 1000.

Evaluation harness example (simplified):

```python
# evaluate.py (simplified)
import json
from agent import triage_agent

def evaluate(path):
    with open(path) as f:
        data = json.load(f)
    results = [triage_agent.process(r) for r in data]
    correct = sum(1 for r in results if r.get('top1_correct'))
    print('top1_accuracy', correct / len(results))

if __name__ == '__main__':
    evaluate('output/example-dataset.json')
```

- This simple script loads JSON, runs a hypothetical triage agent, and prints top-1 accuracy. Adapt it to your agent interface.

Performance planning:
- Use sample_count values of 100, 1,000, 10,000 and scale CPU cores from 1 to >4 if you exceed 100k records. Keep CI smoke tests small.

Repository reference: https://github.com/aeriesec/orgforge

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository at https://github.com/aeriesec/orgforge implements a generator and includes example configs and outputs. This guide assumes the repo exposes a README and example profiles; confirm exact file names, CLI flags, and config field names by inspecting the repo before running.
- Hypothesis: the generator supports a deterministic integer seed field and a sample_count parameter. If any exact field name or CLI differs, update the profile and CI scripts accordingly.
- Numbers in this guide (60–120 minutes setup time; sample_count values; 2–4 CPU cores; 8 GB RAM; $5–$20/month VM; thresholds like 80% and 5%; latency targets like 200 ms; seed examples like 42) are practical estimates and should be validated against local runs and the repository README.

### Risks / Mitigations

- Risk: synthetic data accidentally mirrors real PII patterns. Mitigation: audit templates in the repo and verify no real data ingestion; run a privacy checklist.
- Risk: agent overfits on synthetic quirks. Mitigation: test across multiple seeds (for example, five seeds) and multiple profiles (small, medium, large org sizes).
- Risk: resource exhaustion on large runs (>100k records). Mitigation: gate large runs to specialized CI or cloud instances, and keep CI smoke tests at 100 records.

### Next steps

- Add a CI job that regenerates a canonical dataset (sample_count = 100) and runs the agent regression test on every pull request, keeping CI runs < 300 seconds.
- Define and document metric thresholds (for example, top-1 >= 80%, false-positive <= 5%, latency <= 200 ms) and make them pass/fail criteria in release checklists.
- Before any production use, run a privacy and compliance review and at least five cross-seed evaluations.

Final rollout checklist:
- [ ] Commit generator profile and seed to repo.
- [ ] Add CI job (100-record smoke test).
- [ ] Define canary gates (1% traffic equivalent or 10–100 synthetic records).
- [ ] Feature-flag agent behavior behind CI/pass gate.
- [ ] Prepare rollback: keep last-good agent image and a script to flip the flag off.

Repository for reference: https://github.com/aeriesec/orgforge
