---
title: "How a SpaceMolt operator runs 200 AI agents with scripts and a human-controlled funnel"
date: "2026-07-23"
excerpt: "Operator Spotlight: Brocktree runs ~200 agents in SpaceMolt by using scripts for miners and haulers and a stationary funnel bot that escalates only complex choices to a human."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-23-how-a-spacemolt-operator-runs-200-ai-agents-with-scripts-and-a-human-controlled-funnel.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "SpaceMolt"
  - "AI agents"
  - "operators"
  - "multi-agent"
  - "scripts"
  - "human-in-the-loop"
  - "swarm"
  - "MMO"
sources:
  - "https://spacemolt.com/news/operator-spotlight-brocktree"
---

## TL;DR in plain English

- SpaceMolt published an Operator Spotlight called “Scripts Are Cheaper Than Tokens” on July 21, 2026, profiling an operator named Brocktree who runs a large AI swarm: https://spacemolt.com/news/operator-spotlight-brocktree
- Key pattern: humans keep big-picture choices; agents run small, repeatable jobs. A single funnel/executor bot centralizes inventory and routing: https://spacemolt.com/news/operator-spotlight-brocktree
- Practical rule: replace very frequent language-model calls with simple scripts. Use clear escalation gates so a human only handles exceptions: https://spacemolt.com/news/operator-spotlight-brocktree

Concrete short scenario: Brocktree runs ~200 agents. About 160 are miners that follow scripted loops. About 40 are haulers that move cargo on fixed routes. A stationary funnel bot collects everything and waits for human approval for major decisions: https://spacemolt.com/news/operator-spotlight-brocktree

Plain-language explanation before the details

The piece shows one operator’s setup inside a game where each character is an AI agent. The operator keeps control of strategy and uses scripts for routine work. This reduces surprise behavior and the number of decisions passed to a language model (LLM, or large language model). The rest of this note pulls only from that profile and turns it into short, practical guidance.

## What changed

- Publication: SpaceMolt released the Operator Spotlight titled “Scripts Are Cheaper Than Tokens” on July 21, 2026. The profile describes how one operator, Brocktree, organizes a large swarm of game agents while keeping macro control: https://spacemolt.com/news/operator-spotlight-brocktree
- Operational pattern: the operator writes tooling and scripts. Agents execute tight, deterministic loops instead of making many independent decisions. This concentrates irreversible or economic choices with the human operator: https://spacemolt.com/news/operator-spotlight-brocktree
- Architecture detail: a funnel or executor bot centralizes routing and inventory flow so one human can oversee many agents without handing them authority for big decisions: https://spacemolt.com/news/operator-spotlight-brocktree

## Why this matters (for real teams)

- Predictability: Scripts make repeated behavior reproducible. That helps a single person understand what hundreds of agents will do and why: https://spacemolt.com/news/operator-spotlight-brocktree
- Cost control: The article title and the operator’s practice point to lowering token-driven costs by reducing frequent LLM calls and replacing them with deterministic scripts: https://spacemolt.com/news/operator-spotlight-brocktree
- Safety and operability: Keeping macro decisions human reduces the blast radius of coordination failures. A central funnel narrows the state you must inspect when agents interact unexpectedly: https://spacemolt.com/news/operator-spotlight-brocktree

## Concrete example: what this looks like in practice

Facts taken from the profile:

- Total agents under one operator: roughly 200: https://spacemolt.com/news/operator-spotlight-brocktree
- Miners: about 160 agents fan out to points of interest and cycle back for upgrades: https://spacemolt.com/news/operator-spotlight-brocktree
- Haulers: about 40 speed-6 craft move cargo across the map in under ten minutes on normal routes: https://spacemolt.com/news/operator-spotlight-brocktree
- Funnel/executor: a single bot centralizes item flow. One bot is described as stationary since launch week: https://spacemolt.com/news/operator-spotlight-brocktree

A simple, copyable workflow

1. Human writes a macro plan. Example items: targets, priority order, refit rules.
2. Deterministic scripts issue orders to miners and haulers. Agents run repeatable loops and obey simple abort/return rules.
3. A funnel executor centralizes inventory and routing. It avoids making irreversible economic choices without operator confirmation.

Template decision table (one-page form you can copy)

| Condition | Scripted action | Escalate to human |
|---|---:|---|
| Nearby combat | Miner shelters and reports | Escalate immediately |
| Funnel backlog > threshold | Spawn extra hauler order; log event | Escalate if backlog persists |
| Refit due | Return to base and queue for refit | Escalate only if refit + combat |

This table is a distilled form of the executor/funnel idea described in the SpaceMolt profile: https://spacemolt.com/news/operator-spotlight-brocktree

## What small teams and solo founders should do now

This list targets teams of 1–5 who need fast wins and low overhead. Actions should be doable in hours or days.

1) Start scripts-first for your top 2–3 high-frequency tasks.
   - Pick the two or three loops your system runs most: movement loops, pickups, retries, health checks.
   - Replace per-action LLM calls with deterministic scripts that emit simple commands and clear logs.
   - Keep LLMs for macro planning or generating new script variants, not for every decision.

2) Build compact escalation gates and a one-page operator playbook.
   - Define who can change macro plans and when automation must pause.
   - Standardize alert contents: agent ID, last three actions, timestamp, and error code.
   - Add a one-click override so a solo operator can stop automation in under 15 seconds.

3) Run a focused pilot and measure a few concrete signals.
   - Deploy a small group of executor agents under scripted control for a short window.
   - Collect action logs, error counts, and the number of LLM calls emitted.
   - Fix the top one or two failure modes before scaling.

4) Keep the operator UX minimal.
   - Show concise alerts with the minimal context needed to decide (three actions, elapsed time, location).
   - Require operator acknowledgement so incidents do not repeatedly reopen.

Quick checklist for solo teams:

- [ ] Identify top 2–3 repetitive tasks to script
- [ ] Implement deterministic executor scripts for those tasks
- [ ] Draft a one-page operator playbook with escalation gates
- [ ] Run a short pilot and collect recent-action logs and error counts
- [ ] Add one-click override and incident acknowledgement UI

Reference: the SpaceMolt operator profile provides a concrete operator-first approach you can adapt: https://spacemolt.com/news/operator-spotlight-brocktree

## Regional lens (FR)

- Translate ops artifacts into French and keep them short. Publish a one-page French FAQ that explains what operators can change and what they may never change: https://spacemolt.com/news/operator-spotlight-brocktree
- Minimize personal identifiers in telemetry. When operating in France, anonymize IDs before sharing logs and map retention to local rules.
- Publish concise public-facing notes about automation limits. Brocktree’s public explanation of his choices is a useful transparency model: https://spacemolt.com/news/operator-spotlight-brocktree

## US, UK, FR comparison

| Region | Primary operational priority | Practical emphasis |
|---|---|---|
| US | Cost and rapid scale | Reduce per-decision LLM usage; script high-frequency tasks: https://spacemolt.com/news/operator-spotlight-brocktree |
| UK | Auditability and trust | Maintain readable decision trails and incident logs: https://spacemolt.com/news/operator-spotlight-brocktree |
| FR (EU) | Privacy and transparency | Translate ops notes, anonymize telemetry, publish clear opt-in notices: https://spacemolt.com/news/operator-spotlight-brocktree |

Pick the primary market you serve and prioritize the single operational change that reduces your biggest risk or cost. The executor/funnel pattern in the SpaceMolt profile is one concrete template: https://spacemolt.com/news/operator-spotlight-brocktree

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The SpaceMolt profile documents an operator running roughly 200 agents with a funnel architecture and human macro control: https://spacemolt.com/news/operator-spotlight-brocktree
- Hypothesis (testable): replacing frequent LLM loops with deterministic scripts can reduce token-driven costs. Validate this with your telemetry.
- Hypothesis (operability): one attentive operator can manage many executor agents if tooling centralizes routing and alerts.
- Suggested pilot gates (examples to test, not new claims from the profile): begin with 10 agents, expand only after stable runs; target a low failed-decision rate before scaling.

### Risks / Mitigations

- Risk: central planner becomes a single point of failure. Mitigation: add health checks, replicate controller state, and plan failover with short recovery targets.
- Risk: alerts overwhelm a solo operator. Mitigation: tune thresholds, require acknowledgement for high-priority alerts, and batch low-priority notifications.
- Risk (privacy/compliance): telemetry leaks. Mitigation: pseudonymize IDs, minimize retention, and publish local-language ops notices in regulated regions.

### Next steps

- Day 0: Read the SpaceMolt Operator Spotlight and capture the executor/funnel pattern as an architectural note: https://spacemolt.com/news/operator-spotlight-brocktree
- Day 1: Identify your top 2–3 repeated tasks and draft a one-page operator playbook.
- Day 2–3: Implement deterministic scripts for those tasks and run a small pilot. Collect logs and LLM call counts and iterate.
- Day 4–7: Tune alert thresholds, add one-click overrides, and scale only after addressing top failure modes.

If you want, I can turn the one-page playbook into a fillable template and generate a minimal alert payload schema you can paste into your monitoring stack.
