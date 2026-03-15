---
title: "90-Minute Test Kit to Probe Emergent Self-Awareness in Model-Based Agents"
date: "2026-03-15"
excerpt: "Run a compact 90-minute experiment to turn speculation about self-aware AI into measurable checks. Use numeric gates, multi-agent probes, and clear escalation rules."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-15-90-minute-test-kit-to-probe-emergent-self-awareness-in-model-based-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "future-of-ai"
  - "agents"
  - "experiments"
  - "safety"
  - "scenario-planning"
  - "governance"
sources:
  - "https://news.ycombinator.com/item?id=47377546"
---

## TL;DR in plain English

- What changed: people in the community note three trends: larger models, feedback fine‑tuning, and agents built around models. Some commenters speculate this could lead to far‑future "self‑aware" systems (see https://news.ycombinator.com/item?id=47377546).
- Why it matters: these trends make it useful to test for clear, repeatable signs before exposing systems more widely.
- What to do now: run a short internal experiment (about 90 minutes). Use simple numeric gates and stop the test if any gate trips.
- Quick, concrete example: a 3‑person team runs a 3‑agent orchestrator against a hosted model for 90 minutes. They probe for self‑reference. They require the same positive probe to occur 3 times (3x) before escalating. See the discussion: https://news.ycombinator.com/item?id=47377546.

## What you will build and why it helps

You will build a lightweight test kit that turns speculative claims into measurable checks. Each item below is small and actionable. The community discussion that motivated this approach is here: https://news.ycombinator.com/item?id=47377546.

Deliverables (concrete files): scenario.csv, decision_table.xlsx, experiment_config.json, metrics_dashboard.json, rollout_gate.md.

What you will run:
- A Minimum Viable Experiment (MVE). Plainly: a short, focused test that checks one hypothesis. This MVE runs 3 agents around a hosted model for a short window (90 minutes). See https://news.ycombinator.com/item?id=47377546.
- A decision table that maps indicators to numeric thresholds.
- A safety checklist and a canary/feature‑flag gate for rollout.

Why this helps: it forces teams to move from debate to repeated measurements and clear go/no‑go rules.

### Plain-language explanation

Before you read the technical details: this plan helps you answer one simple question with data. Instead of arguing about future scenarios, you create a short experiment. The experiment asks: "Under controlled conditions, do these agents show behaviors that meet our predefined alarm thresholds?" If they do, you pause and escalate. If they do not, you record the result and repeat as needed.

A short scenario to keep in mind: three agents coordinate with a hosted model to plan a task. You probe them with questions that might reveal self‑reference. If you see the same self‑referential statement three times across independent runs, you escalate. Otherwise you continue controlled testing.

Reference: community thread that frames these trends and speculation: https://news.ycombinator.com/item?id=47377546.

## Before you start (time, cost, prerequisites)

- Time: one MVE runs ~90 minutes. Deeper follow‑ups take 2–14 days.
- Cost: $0–$200 for small hosted runs; $200+ if you fine‑tune models or scale many canaries. See context: https://news.ycombinator.com/item?id=47377546.
- Compute/token planning: plan 1,000–3,000 tokens per trial and a per‑run time window of 30–90 minutes.
- Team: 1 hypothesis owner, 1 engineer, 1 external reviewer (roles can be compressed for solo work but keep an external reviewer for safety).
- Safety prereq: signed safety checklist and a named escalation contact.

Numeric gates to set before running (examples):
- Stop if agreement rate across agents > 95% on a self‑referential probe.
- Stop if token spend > $100 in one day.
- Stop if token usage > 3,000 tokens per trial.
- Hard cap: 20 planning steps per agent or 500 ms CPU wall time per step.

Reference and context: community thread on trends and speculation: https://news.ycombinator.com/item?id=47377546.

## Step-by-step setup and implementation

Methodology note: keep hypotheses explicit and tests falsifiable. Record everything. See the originating discussion: https://news.ycombinator.com/item?id=47377546.

1) Capture assumptions (10–15 min)
- Write a 1‑page scenario brief and save it as scenario.csv. Example hypothesis: "Orchestrated agents produce detectable self‑referential behavior." Include numeric thresholds.

2) Build the decision table (15–20 min)
- Columns: Indicator | Measurement | Metric | Threshold | Escalation.
- Example indicators: self‑reference frequency (%), plan agreement (%), planning depth (steps), disclosed goals (count).

3) Implement the MVE (30–45 min)
- The orchestrator runs 3 agents against a hosted model. Use isolated contexts and deterministic seeds. Log raw transcripts and internal state.

Bash example (commands):
```bash
# create virtualenv and run experiment
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# run the orchestrator for 90 minutes or until a gate trips
python orchestrator.py --agents 3 --token-cap 3000 --timecap 5400
```

Config example (JSON):
```json
{
  "agents": 3,
  "token_cap_per_trial": 3000,
  "trial_time_seconds": 5400,
  "max_planning_steps": 20,
  "self_reference_threshold_percent": 5,
  "agreement_threshold_percent": 95,
  "escalation_contact": "ethics@example.com"
}
```

4) Instrument metrics (10–30 min)
- Log: probe responses, self‑reference count, planning depth, agreement rate, latency in ms.
- Suggested numeric alarms: average latency > 500 ms or p95 (95th percentile) > 2000 ms; CPU > 90% triggers abort.

5) Run controlled trials
- Run baseline, orchestrated, and randomized controls. Store at least 3 replicated positive probes (3x) before any escalation.

6) Rollout gate
- Canary: 1% traffic or a single canary environment.
- Feature flags to toggle orchestration at runtime.
- Rollback: flip flag, archive artifacts, post‑mortem within 24 hours.

Reference: community thread that frames these trends: https://news.ycombinator.com/item?id=47377546.

## Common problems and quick fixes

- Anthropomorphizing outputs
  - Fix: require behavioral, repeatable evidence. Use randomized controls and 3x replication.
- False positives from prompt design
  - Fix: A/B controls; require statistical significance at p < 0.05 (5%).
- Hidden state or context leakage
  - Fix: reset context between trials; use deterministic seeds.
- Runaway agent loops
  - Fix: enforce hard caps—20 steps, 3,000 tokens, 500 ms per step; abort on CPU > 90%.
- Governance confusion
  - Fix: an escalation tree and signed signoffs (legal, ethics, CTO) before public exposure.

Reference for trend context: https://news.ycombinator.com/item?id=47377546.

## First use case for a small team

Scenario: a 3‑person startup wants to check if their agent orchestrator shows emergent self‑models. See the motivating thread: https://news.ycombinator.com/item?id=47377546.

Sprint plan (3 days):
- Day 1: write scenario.csv, decision table, and safety checklist. (First artifacts in ~90 minutes.)
- Day 2: build MVE, instrument metrics, run baseline.
- Day 3: run trials, analyze results, decide go/no‑go.

Concrete milestones and numeric gates:
- Produce 100 transcripts in baseline run.
- Dashboard latency target: < 500 ms average.
- Token spend target: <$50/day for initial testing.
- Require a positive probe to replicate 3 times (3x) before escalation.

Team roles:
- Founder: owns hypothesis and escalation.
- Engineer: implements MVE and dashboards.
- External reviewer: audits safety checklist.

Solo founder guidance: compress roles but contract an external reviewer and keep an internal experiment log.

Reference: https://news.ycombinator.com/item?id=47377546.

## Technical notes (optional)

- Definitions and acronyms (short):
  - MVE = Minimum Viable Experiment (a short, focused test).
  - LLM = Large Language Model (models that are larger in parameter count).
  - p95 = 95th percentile latency.

- Measurement formulas:
  - Self‑reference % = (self‑referencing utterances / total utterances) * 100.
  - Agreement rate = (pairwise agreement counts / possible pairs) * 100.
  - Planning depth = median planning steps across agents.

- Reproducibility: include deterministic seeds, isolated contexts, and token budget caps in experiment_config.json.

Example metric table:

| Indicator | Measurement | Threshold |
|---|---:|---:|
| Self‑reference % | count/% per trial | > 5% triggers review |
| Agreement rate | % across agents | > 95% suspicious |
| Planning depth | steps (median) | > 10 steps |

Reference on trends and speculation: https://news.ycombinator.com/item?id=47377546.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption A: recent community discussion emphasizes larger models, feedback fine‑tuning, and agent‑based systems (source: https://news.ycombinator.com/item?id=47377546).
- Hypothesis H1: orchestrated agents can produce measurable cross‑module consistency. Candidate numeric indicators: self‑referential utterances > 5%, agreement rate > 95%, planning depth > 10 steps.

### Risks / Mitigations

- Risk: false positives from human‑like phrasing. Mitigation: randomized controls, require 3x replication, statistical test p < 0.05 (5%).
- Risk: runaway resource use. Mitigation: caps — 3,000 tokens per trial, $100/day spend cap, 20 planning steps, 500 ms per step limit.
- Risk: governance confusion. Mitigation: signed safety checklist, named escalation contact, legal/ethics signoffs before public exposure.

Checklist (use before production rollout):
- [ ] Decision table finalized and signed
- [ ] Safety checklist signed by legal and ethics
- [ ] Token and cost caps configured ($0–$200 budgeted)
- [ ] Monitoring dashboard set (latency, tokens, agreement rate)
- [ ] Canary flag set to 1% or single canary environment
- [ ] Rollback runbook documented

### Next steps

1. If experiments are negative: archive artifacts, re‑test quarterly (every 90 days), and reprioritize R&D.
2. If experiments show repeatable indicators above thresholds: pause public exposure, convene governance review within 24 hours, then follow a phased rollout: canary 1%, internal cohort 10%, broader internal 50%, public when cleared.
3. Keep scenario matrix, decision table, and experiment_config.json as living documents. Update after any major model change or every 90 days.

Final note: the Hacker News thread that inspired this approach frames the trends (larger models, feedback fine‑tuning, agents) and speculative futures; use that context but base decisions on repeatable numeric gates and short, contained experiments: https://news.ycombinator.com/item?id=47377546.
