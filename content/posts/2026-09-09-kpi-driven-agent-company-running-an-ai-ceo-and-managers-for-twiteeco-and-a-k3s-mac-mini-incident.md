---
title: "KPI-driven agent company: running an AI CEO and managers for twitee.co and a k3s Mac mini incident"
date: "2026-09-09"
excerpt: "A founder prototyped an AI-run company: you set a KPI (e.g., +10% weekly traffic for twitee.co) and an AI CEO and managers plan, report, and requested budget after a k3s Mac mini outage."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-09-kpi-driven-agent-company-running-an-ai-ceo-and-managers-for-twiteeco-and-a-k3s-mac-mini-incident.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "kpis"
  - "agent-ops"
  - "startup"
  - "founder-notes"
  - "monitoring"
  - "incident-response"
  - "automation"
sources:
  - "https://news.ycombinator.com/item?id=49608984"
---

## TL;DR in plain English

- Idea in one line: give an AI-led group a KPI (Key Performance Indicator) — a single measurable target — instead of detailed tasks. An AI "CEO" agent breaks that KPI into plans. Manager agents create daily work items. Specialist agents or humans execute or open approval requests. Source: https://news.ycombinator.com/item?id=49608984

- What happened in the author's experiment: they ran a KPI-driven agent flow for the goal "Increase traffic 10% every week" for their site (twitee.co). The stack ran on k3s (a lightweight Kubernetes distribution) on a Mac mini. A sudden overnight traffic spike knocked the host offline. An agent later requested budget to scale up. Source: https://news.ycombinator.com/item?id=49608984

- Bottom line: this is an experimental coordination pattern. It can find opportunities and surface resource needs. But it needs explicit approval gates for provisioning and spending. Source: https://news.ycombinator.com/item?id=49608984

- Short scenario: a solo founder publishes a KPI file. An AI CEO agent reports daily. One night traffic spikes. The founder sees an approval request in the morning asking to increase capacity and budget. The founder approves or denies the change.

## What you will build and why it helps

Plain-language explanation before advanced details

You will prototype a simple loop where a human sets one KPI. AI agents then run a small planning and reporting system around that KPI. The loop has three roles: a CEO agent to set strategy from the KPI, manager agents to create prioritized work, and specialist agents or humans to take actions or ask for approval. Keep a human approval gate for any provisioning or spend.

Why this helps (from the Hacker News post):

- One number to aim at. A single KPI focuses effort on a measurable target. Source: https://news.ycombinator.com/item?id=49608984
- Less micro-management. Agents publish daily reports so the human leader does not need to stay in the loop constantly. Source: https://news.ycombinator.com/item?id=49608984
- Early escalation. Agents detected a scaling need after a traffic spike and requested budget rather than silently changing infrastructure. Source: https://news.ycombinator.com/item?id=49608984

What you will build (overview):

- A repo that stores the KPI and agent prompts. The author linked their prototype in the discussion. https://news.ycombinator.com/item?id=49608984
- A metrics source agents can query (CSV, JSON endpoint, or simple analytics).
- An approval mechanism (manual flag, webhook, or human-in-the-loop) to block provisioning and spend until reviewed.
- A minimal agent orchestration layer that runs the CEO and manager roles.

## Before you start (time, cost, prerequisites)

Note: the Hacker News post describes a personal, experimental setup. It is not a production recipe. Use the linked discussion for context. https://news.ycombinator.com/item?id=49608984

Minimal prerequisites for a quick prototype:

- A code repository to store KPI files and prompts. The author's project is referenced in the thread. https://news.ycombinator.com/item?id=49608984
- One reliable metrics source with a clear query so agents can cite exact evidence.
- An approval gate for any provisioning or billing changes.
- An LLM (large language model) integration or agent framework to run the CEO and manager roles. Define "agent" as an automated assistant powered by an LLM.

Estimated time and cost (very rough):

- Set up a basic prototype in a few hours to a couple of days, depending on familiarity with your orchestration and LLM tools.
- Cost: minimal to moderate — depends on LLM API use, infrastructure for agents, and any cloud resources you authorize. The author ran their stack on a local Mac mini. Source: https://news.ycombinator.com/item?id=49608984

## Step-by-step setup and implementation

High-level steps

1. Define a single plain-language KPI and commit it to your repo. Example from the author: "Increase traffic 10% every week." Source: https://news.ycombinator.com/item?id=49608984
2. Create role definitions:
   - CEO agent: decompose KPI into strategy and daily summary.
   - Manager agents: turn strategy into prioritized work items.
   - Specialist agents/humans: execute tasks or open approval requests.
3. Point agents to one source-of-truth metrics endpoint so their reports can be reproduced.
4. Implement an approval gate that blocks provisioning and cost changes until a human approves.
5. Run a controlled prototype and observe recommendations and escalation behavior.

Commands and a minimal bootstrap (as referenced by the author):

```bash
# Clone the referenced prototype and start a local orchestrator (example from the thread)
git clone https://github.com/nohuman-labs/agent-company
cd agent-company
./start-local-orchestrator.sh --env=dev
```

Example KPI JSON template to store in the repo:

```json
{
  "name": "Increase traffic",
  "metric": "daily_users",
  "baseline": 1200,
  "target_pct": 10,
  "window_days": 7
}
```

Implementation tips:

- Keep a single metrics endpoint and include the exact query or CSV column in the KPI file. Agents must cite this evidence in every report.
- Require agents to produce a short daily report that includes: metric snapshot, proposed next action, and whether an approval is requested.
- Store approval requests and agent plans in the repo or an append-only log to enable audits.

## Common problems and quick fixes

Observed incident (from the Hacker News note): an overnight traffic spike overwhelmed a single-host k3s deployment on a Mac mini. An agent later requested budget to scale up. Source: https://news.ycombinator.com/item?id=49608984

Common problems and fixes:

- Problem: agents automatically provision or scale at night and a single host fails.
  Fix: require human approval for provisioning/spend and block auto-provisioning outside monitored hours.

- Problem: noisy or ambiguous metric interpretations by agents.
  Fix: make metric definitions exact in the KPI file (query, time-window, column). Require evidence attachments in reports.

- Problem: agents propose product experiments without context.
  Fix: require a one-paragraph rationale, evidence links, and a short human review before executing new product bets.

- Problem: agent hallucinations or wasted compute.
  Fix: add confidence scores and require cited evidence. Rate-limit plan generation and cache results.

Each of these controls is grounded in the experiment and discussion in the linked thread. https://news.ycombinator.com/item?id=49608984

## First use case for a small team

A conservative pilot for a solo founder or tiny team should minimize scope and make decisions visible.

Suggested pilot workflow:

- Publish a single KPI file in the repo. Use a single metrics endpoint that agents must cite in reports.
- Require every provisioning or budget change to open an explicit approval request recorded in the repo or a write-once log.
- Run the prototype during monitored hours. Review agent daily reports manually instead of allowing unattended actions.
- Keep an immutable log of plans and approvals so you can review what happened after any incident. The author's agent reports enabled later review. Source: https://news.ycombinator.com/item?id=49608984

Concrete example (from the thread): the author ran twitee.co on k3s on a Mac mini with the KPI to increase traffic 10% weekly. A traffic surge caused the Mac mini to fail, and the agent later asked for budget to scale up. Source: https://news.ycombinator.com/item?id=49608984

## Technical notes (optional)

Reference: the Hacker News note and the linked project provide the experimental context. https://news.ycombinator.com/item?id=49608984

Decision table (use as a prompt-writing aid):

| Role | Responsibility | Allowed actions without approval | Requires human approval |
|---|---:|---|---:|
| CEO (agent) | Decompose KPI; summarize daily status | Draft plans; request evidence | Provisioning; budget spend |
| Manager (agent) | Prioritize experiments; create issues | Stage experiments in staging | Full production rollout; budget spend |
| DevOps (agent/human) | Run tests and monitor | Run load tests in staging | Add production nodes; change infra billing |

Audit guidance:

- Keep an immutable audit trail. Commit every plan and approval request or append to a write-once log and retain it for review.
- If using an LLM (large language model), avoid unbounded plan generation. Cache plans and diff them to reduce repeated API calls.

Context note: the author's story (k3s on a Mac mini, KPI "Increase traffic 10% every week," and an agent-triggered budget request) informs these notes. Source: https://news.ycombinator.com/item?id=49608984

## What to do next (production checklist)

### Assumptions / Hypotheses

- Hypothesis: handing off KPIs rather than tasks reduces coordination overhead. The author framed this aim as: "My dream is to become a chairman who only gave KPIs for AI." Source: https://news.ycombinator.com/item?id=49608984

- Hypothesis: agents will surface resource needs and request budget increases when they detect opportunity or risk. The author's log shows an agent requesting budget to scale after a traffic spike on a k3s Mac mini. Source: https://news.ycombinator.com/item?id=49608984

Proposed experimental thresholds (suggested starting points; validate in trials):

- Prototype run: 4 hours.
- Prompt/iteration window to refine: 1–2 weeks.
- Example KPI from the source: 10% weekly traffic increase.
- Audit retention: 90 days for agent recommendations and approvals.
- Autoscale precondition suggestion: 3 consecutive intervals above threshold before provisioning.
- Early pilot approval cap suggestion: $100/day.
- LLM plan generation cap suggestion: 2,000 tokens per plan.
- Canary test size suggestion: 10% of traffic or 1 instance out of N for rollouts.

Note: these numeric suggestions are practical starting points. They are not direct claims from the Hacker News post but recommendations for pilots. https://news.ycombinator.com/item?id=49608984

### Risks / Mitigations

- Risk: automated overnight scaling overwhelms a single-host deployment.
  Mitigation: require human approval for provisioning/spend and block auto-provisioning outside monitored hours.

- Risk: agents hallucinate or waste cycles on low-evidence experiments.
  Mitigation: require evidence links, add a confidence score, and require short human review before execution.

- Risk: oscillating autoscale decisions cause instability.
  Mitigation: require multiple consecutive high intervals and a cooldown window before scaling down or up.

### Next steps

- [ ] Run a short prototype: publish one KPI in the repo, point agents to a single metrics endpoint, and exercise the approval webhook.
- [ ] Record agent plans and approval requests in a committed audit trail and review after the run.
- [ ] Configure a canary rollout and an explicit human approval gate for provisioning and spend.
- [ ] Post-mortem the dry run and update the decision table, prompts, and approval rules.

For the original experiment context and community discussion, see the Hacker News thread: https://news.ycombinator.com/item?id=49608984
