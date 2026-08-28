---
title: "Measure AI agent resolution rates with Terminal-Bench-Science v0.1 across 70 expert scientific workflows"
date: "2026-08-28"
excerpt: "Practical guide to running Terminal-Bench-Science v0.1: reproduce the 70-task benchmark, compute resolution rates (top model ≈30%), and build a small audit-ready evaluation pipeline."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-28-measure-ai-agent-resolution-rates-with-terminal-bench-science-v01-across-70-expert-scientific-workflows.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "terminal-bench-science"
  - "benchmarks"
  - "ai-agents"
  - "scientific-workflows"
  - "evaluation"
  - "stanford"
sources:
  - "https://www.terminal-bench-science.ai/announcement"
---

## TL;DR in plain English

- Terminal-Bench-Science v0.1 is a researcher-led, continuous benchmark of real scientific workflows. See the announcement: https://www.terminal-bench-science.ai/announcement.
- The first public release contains 70 tasks. The top model on the published leaderboard resolved about 30% of those tasks (announcement: https://www.terminal-bench-science.ai/announcement).
- Do a short smoke test (1–3 tasks) to check connectivity and basic scoring. Archive raw outputs and metadata for auditability.
- Use the benchmark result as one piece of evidence when deciding whether to pilot agents in your lab or product.

Concrete example / short scenario:
- A small lab wants to know if an AI assistant can help draft experiment protocols. They pick 3 tasks from the v0.1 set that match protocol drafting. They run each task 3 times, save raw JSON, and require a human sign-off before any protocol is used in the lab.

## What you will build and why it helps

You will build a lightweight evaluation pipeline that:
- runs Terminal-Bench-Science v0.1 tasks against one or more AI agents using the published tasks and scoring rules (announcement: https://www.terminal-bench-science.ai/announcement),
- saves raw responses and metadata for later review and audit, and
- computes the benchmark’s resolution-rate metric (percent of tasks resolved).

Why this helps
- The tasks are contributed by practicing scientists and reflect real research workflows. That makes this benchmark more relevant than textbook-style questions when you want evidence about an agent’s practical research ability (announcement: https://www.terminal-bench-science.ai/announcement).

Suggested artifacts to produce
- agent_configs.yaml (adapter settings per agent)
- raw-response archive (JSON)
- reproducibility metadata (harness commit, model settings, timestamps)
- leaderboard CSV for stakeholders

Keep the evaluation small at first. Run 1–3 tasks for a smoke test. Then run 8–12 tasks for a pilot. Always preserve raw outputs for adjudication (announcement: https://www.terminal-bench-science.ai/announcement).

## Before you start (time, cost, prerequisites)

Read the official announcement before running anything: https://www.terminal-bench-science.ai/announcement.

Minimum pre-run checklist
- Clone the benchmark tasks and read the README in the distribution you have (announcement: https://www.terminal-bench-science.ai/announcement).
- Obtain API keys or access to the agent endpoints you plan to evaluate. (API = application programming interface.)
- Decide a smoke-test set (1–3 tasks) and a results storage location.

Recommended operational defaults
- Plan for a 3-hour smoke window (≈180 minutes). This covers setup, a few runs, and basic troubleshooting.
- Use a small orchestration VM (virtual machine) with 1–2 vCPU and 2–4 GB RAM for the harness. (VM = virtual machine.)
- Budget depends on model pricing. A low-volume exploratory run could cost roughly $5–$500 in API spend. Track actual cost per run and set a cap.

## Step-by-step setup and implementation

Plain-language explanation before advanced details
- These steps show a minimum reproducible setup. Follow them to confirm the harness runs and saves auditable outputs.
- Advanced details (retry strategies, schema validation, large-scale orchestration) come after you have a working smoke test.

1. Clone the tasks and harness, and read the scoring rules in the tasks folder (announcement: https://www.terminal-bench-science.ai/announcement).

```bash
# example clone (replace with the official URL you have)
git clone https://example.org/terminal-bench-science-0.1.git ./tbs
cd ./tbs
ls -la tasks | sed -n '1,20p'
```

2. Create adapter configs for each agent. Replace endpoints and models with your agent info.

```yaml
# agent_configs.yaml
agents:
  - id: agent-claude-opus-5
    endpoint: https://api.vendor.example/v1
    model: claude-opus-5
    temperature: 0.0
    max_tokens: 8192
    retries: 3
    backoff_ms: 500
  - id: agent-gpt-5x
    endpoint: https://api.other/v1
    model: gpt-5x
    temperature: 0.2
    max_tokens: 4096
    retries: 5
    backoff_ms: 1000
```

Notes: temperature controls randomness. Set it low (0.0–0.2) for deterministic behavior in benchmarks.

3. Prepare an isolated environment and results folders, then install dependencies and create result directories.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdir -p results/raw results/csv
```

4. Run a smoke test (1–3 tasks). Confirm agent connectivity, scoring, and that raw JSON is saved. Save reproducibility metadata: harness commit hash, agent config, timestamps.

5. Run the harness at pilot scale (8–12 tasks), then summarize outputs into a leaderboard CSV and a one-page decision artifact. Example run command (adjust flags for your harness):

```bash
python run_benchmark.py --config agent_configs.yaml --tasks tasks/ --out results/raw --repeat 3
```

6. Produce artifacts for stakeholders: leaderboard CSV, raw-response archive, reproducibility metadata, and a short decision table.

Reference: benchmark v0.1 includes 70 tasks and a published leaderboard (announcement: https://www.terminal-bench-science.ai/announcement).

## Common problems and quick fixes

- Authentication and rate limits: add retries and exponential backoff. Use the retries/backoff fields in agent_configs.yaml. Log request/response bodies but redact secrets when saving logs (announcement: https://www.terminal-bench-science.ai/announcement).
- Task-format mismatch: validate task JSON/YAML before runs. Add schema validation as a continuous integration (CI) gate. (CI = continuous integration.)
- Disputed scoring: keep raw outputs and create a human-review queue with an adjudication rubric. Export a CSV for contested tasks and track decisions.
- Latency: flag tasks with median latency >2000 ms. Investigate model choice, network issues, or batching.

Quick fixes checklist
- [ ] Add retries and exponential backoff
- [ ] Validate task schema before runs
- [ ] Save raw responses for human adjudication
- [ ] Create a dispute/adjudication CSV

## First use case for a small team

Reference announcement: https://www.terminal-bench-science.ai/announcement.

This plan is for solo founders or small teams (1–3 people). It is low-cost, low-effort, and auditable.

Actionable plan (solo / small team)
1. Narrow scope to 3–5 representative tasks that match your core workflow. Pick tasks likely to show value (for example, protocol drafting or data-cleaning steps). Use the v0.1 tasks list as the source: https://www.terminal-bench-science.ai/announcement.
2. Run a 1–3 task smoke test with strict resource caps: limit repeats to N = 3 per task, set max_tokens = 4096, and stop the run if costs exceed your exploratory budget. Save raw JSON and a simple CSV with agent_id, task_id, resolution_flag.
3. Set a clear pass/fail gate for piloting: if the agent’s resolution_rate on your 3–5 tasks exceeds a conservative threshold (for example, 20%–25%), proceed to an 8–12 task pilot. Otherwise, iterate on prompts or adapters. See the announcement for context: https://www.terminal-bench-science.ai/announcement.
4. Keep human-in-the-loop review: require a reviewer to inspect every agent-suggested protocol before acting on it. Archive the first 100 interactions for audit and repeatability.
5. Measure time-saved and error rates during the pilot. Track absolute time-per-task and aim for an initial measurable time reduction target (for example, 10%–25%) before wider rollout.

Practical quick commands for small teams:

```bash
# run one task for smoke with strict budget / retries
python run_benchmark.py --task tasks/task-001.json --agent-config agent_configs.yaml --out results/raw --repeat 3 --max-tokens 4096
```

```bash
# minimal summarizer for a quick CSV
python summarize_results.py --in results/raw --out results/csv/leaderboard.csv --fields agent_id,task_id,resolution_flag
```

## Technical notes (optional)

- Terminal-Bench-Science v0.1 is a continuous benchmark of expert-curated scientific workflows. The initial release includes 70 tasks with a public leaderboard; the top model resolved roughly 30% of tasks (announcement: https://www.terminal-bench-science.ai/announcement).
- Methodology note: run repeat trials (suggested N = 3–5) and report medians and variance to reduce noise from nondeterministic agents.

## What to do next (production checklist)

Reference and context: the announcement and leaderboard are here: https://www.terminal-bench-science.ai/announcement.

Checklist (short-term → long-term):
- [ ] Short smoke test: 1–3 tasks, N = 3 repeats, store raw JSON and metadata.
- [ ] Pilot: 8–12 tasks, human reviewers enabled, measure resolution_rate and time-saved.
- [ ] Archive reproducibility metadata: harness commit hash, pinned model version, timestamps, seeds.
- [ ] If moving to production, run monthly re-evaluations and keep audit samples (first 100 interactions).

| Metric / parameter | Suggested default |
|---|---:|
| Benchmark tasks in v0.1 | 70 |
| Top-model resolution (v0.1 leaderboard) | ~30% |
| Smoke test tasks | 1–3 |
| Pilot tasks | 8–12 |
| Repeats per task | 3 |
| Canary resolution gate | 20% |
| Latency flag threshold | 2000 ms |
| Pilot length | 2 weeks |

### Assumptions / Hypotheses

This subsection lists practical thresholds and implementation assumptions you can use as defaults. These are suggested defaults your team can change and are not additional claims beyond what is cited above (announcement: https://www.terminal-bench-science.ai/announcement).
- Scope: v0.1 includes 70 tasks and a public leaderboard.
- Leaderboard baseline: best reported model ≈ 30% resolution on v0.1.
- Operational defaults suggested: repeats N = 3, pilot size 8–12 tasks, canary gate 20% resolution, latency flag 2000 ms, audit sample = first 100 interactions, smoke window ≈180 minutes.

### Risks / Mitigations

- Risk: hallucinations or incorrect protocols. Mitigation: require human-in-the-loop review and explicit sign-off before applying any agent-suggested protocol in practice.
- Risk: data leakage through API payloads. Mitigation: redact sensitive content and prefer private endpoints or on-prem models where possible.
- Risk: noisy metrics from nondeterministic agents. Mitigation: run N = 3–5 repeats, report medians and variance, and keep raw outputs for adjudication.
- Risk: unexpected costs. Mitigation: set per-run budget caps and monitor token usage (examples: max_tokens 4096 or 8192 depending on needs).

### Next steps

1. Short-term (1–3 days): run a smoke test (1–3 tasks) and export a leaderboard CSV.

```bash
python summarize_results.py --in results/raw --out results/csv/leaderboard.csv
```

2. Medium-term (1–2 weeks): run an 8–12 task pilot with human reviewers; measure time-saved and resolution_rate; pin model versions and save reproducibility metadata.
3. Long-term (monthly): schedule regular re-evaluations as models and the benchmark evolve and retain reproducibility artifacts (commit hash, model settings, timestamps).

For the official announcement, benchmark scope, and leaderboard context see: https://www.terminal-bench-science.ai/announcement.
