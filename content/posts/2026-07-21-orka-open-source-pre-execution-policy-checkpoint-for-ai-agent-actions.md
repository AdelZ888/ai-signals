---
title: "Orka: Open-source pre-execution policy checkpoint for AI agent actions"
date: "2026-07-21"
excerpt: "Orka is an open-source pre-execution checkpoint that vets agent actions (allow/deny/confirm) to stop runaway loops, limit costs, and create an auditable record."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-21-orka-open-source-pre-execution-policy-checkpoint-for-ai-agent-actions.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "orka"
  - "agents"
  - "policy"
  - "open-source"
  - "cost-control"
  - "audit"
sources:
  - "https://github.com/mathhMadureira/orka"
---

## TL;DR in plain English

- Orka is an open-source checkpoint service that vets planned external actions from AI agents. It sits between an agent and the tools the agent would call and answers with allow / deny / require-confirmation. See the project: https://github.com/mathhMadureira/orka.
- Main benefits: stop runaway loops that can waste money and create an auditable record you can show finance and compliance teams. The repo tagline is: “Stop your AI agents from burning money on runaway loops — and prove what you saved.” See: https://github.com/mathhMadureira/orka.
- Quick plan: run a 1–2 hour proof-of-concept (PoC) in alert-only mode for 48 hours, tune thresholds, then move to staged enforcement.

Concrete example (short scenario):
- A team runs an agent that calls an LLM (large language model) to generate code. A bug causes the agent to call the LLM 1,000 times in a loop. Orka sits between the agent and the LLM, detects the high rate and estimated cost, and either blocks the calls or pauses for human confirmation. This prevents surprise cloud bills and creates a log you can show auditors.

Plain-language summary before details: Orka gives you a safety gate. Agents plan actions (for example: call LLM, start a deploy). Before any external call runs, the checkpoint evaluates a policy (rate limits, cost caps, allow-lists). The checkpoint then returns a decision: allow, deny, or require human confirmation. That decision is logged so you can review and report saved costs.

## What you will build and why it helps

You will add a lightweight checkpoint between your AI agent and the external tools it calls. The checkpoint receives a planned action, evaluates it against a policy, and returns a decision: allow, deny, or require human confirmation. The Orka project documents this checkpoint approach; inspect it at https://github.com/mathhMadureira/orka.

Why this helps:
- Prevent surprise costs from runaway loops or repetitive calls. The project explicitly frames itself to prevent agents from "burning money on runaway loops." See: https://github.com/mathhMadureira/orka.
- Create an auditable trail you can show to finance and compliance teams. The repo also highlights that it helps "prove what you saved." See: https://github.com/mathhMadureira/orka.
- Enforce simple policies: rate limits, per-action cost caps, and emergency allow-lists.

## Before you start (time, cost, prerequisites)

Estimated time and cost
- PoC: 1–2 hours (60–120 minutes). This gets a local instance running and a basic policy tested.
- Hardening: 3–7 days to add monitoring, SLOs (service-level objectives), and approval or incident workflows.
- Monitoring window before enforcement: run in alert-only mode for 24–72 hours; 48 hours is recommended.

Minimum prerequisites
- Clone the Orka repository: https://github.com/mathhMadureira/orka
- An agent you can modify to add a pre-execution hook or middleware
- API keys or credentials for the external tools your agent calls
- A host to run Orka (local laptop, VM, or container)

Suggested starting thresholds (examples you can tune):
- Checkpoint client timeout: 200 ms
- Per-tool rate limit: 20 calls/minute
- Per-run call cap: 100 calls
- Per-run estimated spend cap: $50

Reference: See the project README and code for setup details: https://github.com/mathhMadureira/orka.

## Step-by-step setup and implementation

1) Clone the repo and inspect the README

```bash
git clone https://github.com/mathhMadureira/orka
cd orka
# Read README.md for runtime and dependency instructions
```

Explanation: the repository contains the checkpoint service and example configs. Read the README to learn required runtime tools and configuration steps.

2) Start a local dev instance

Follow the repo README at https://github.com/mathhMadureira/orka to install dependencies and start the service. Example local start commands (adjust per README):

```bash
# example local start (placeholder; follow README)
./install-deps.sh || echo "See README"
./start-orka.sh || echo "Start per README"
```

Explanation: these example commands are placeholders. Use the exact install and start commands shown in the repository README for your environment.

3) Add a simple policy (example)

Below is a sample policy file you can use locally while you tune behavior. Save it near your Orka config and edit to match your needs.

```yaml
# example policies.yml (local example)
mode: alert-only  # options: alert-only, enforce
rate_limits:
  per_tool_per_minute: 20
  per_run_max_calls: 100
cost_thresholds:
  per_action_usd: 0.50
  per_run_max_usd: 50.00
emergency_allow_list:
  - emergency-deploy
```

Explanation: mode=alert-only means the checkpoint will log decisions but not block calls. Use enforce only after you have collected telemetry and tuned thresholds.

4) Instrument your agent (three concrete changes)

- Add a pre-execution hook that POSTs the planned action to the checkpoint.
- If the checkpoint returns allow, proceed. If deny, abort and log. If require-confirmation, pause and surface a manual approval flow.
- In enforcement mode, fail-closed on checkpoint timeouts. In alert-only mode, log and proceed.

Example HTTP call (replace host/port to match your environment):

```bash
curl -X POST http://localhost:8080/checkpoint \
  -H 'Content-Type: application/json' \
  -d '{"agent_id":"triage-1","action":{"tool":"llm-write","estimated_tokens":1200}}'
```

Explanation: the curl example shows the minimal POST your agent should make to the checkpoint. The JSON should include enough metadata for the checkpoint to evaluate rate and cost (agent id, tool name, estimated usage).

5) Test a simulated runaway

- Create a test that issues 200 rapid calls to the same tool.
- Expect the checkpoint to block or flag calls according to your rate limits and cost caps.

6) Rollout pattern (canary)

- Run alert-only for 48 hours to collect traces.
- Stage enforcement with a canary: 1% -> 5% -> 25% -> 100%, each stage about 24 hours while you observe for false positives.

See the project for the checkpoint model and repo guidance: https://github.com/mathhMadureira/orka.

## Common problems and quick fixes

- Agent bypasses the checkpoint: ensure the pre-execution hook is part of the agent runtime and cannot be skipped. Audit the integration and enforce the hook in code or CI (continuous integration).
- Too many false positives: switch to alert-only, collect 24–48 hours of traces, then relax or adjust rate and cost thresholds.
- Checkpoint latency: set the client-side timeout (example: 200 ms). If the checkpoint frequently exceeds this, either scale the checkpoint or increase the timeout. Decide on fail-open (proceed) for alert-only or fail-closed (block) for enforce.
- Missing cost estimates: keep a simple cost mapping file that maps tool names to estimated USD per call.

Example cost mapping (local example):

```json
{
  "llm-write": 0.05,
  "image-gen": 0.80,
  "shell-deploy": 0.00
}
```

Helpful quick thresholds to test: 200 ms checkpoint timeout, 100 calls/hour cap, $50 per-run cap, 20 calls/minute per tool. Reference the repo for design details: https://github.com/mathhMadureira/orka.

## First use case for a small team

Context: solo founders or very small teams (1–3 people) need low-friction protection with low operational overhead.

Actionable steps for a small team (three concrete points):

1) Minimal local PoC in 1–2 hours
   - Clone the repo: git clone https://github.com/mathhMadureira/orka.
   - Start Orka locally per README and run your agent against it in alert-only mode for 48 hours.

2) Add three low-effort protections immediately
   - Throttle: set per_tool_per_minute = 20 and per_run_max_calls = 100.
   - Cost cap: set a conservative per_run_max_usd = $50.
   - Emergency bypass: configure an emergency allow-list for a single, audited deploy action.

3) Simple monitoring and rollback plan
   - Send alerts to Slack or email for any alert-only blocks for 48 hours.
   - If enabling enforcement, follow a canary (1% -> 5% -> 25% -> 100%).
   - If you see >1% unexpected blocks or blocked_cost_usd > $100/day, rollback to alert-only and investigate.

Minimal metrics to collect: blocked_actions_count, estimated_cost_saved_usd, average_checkpoint_latency_ms. Keep short retention (for example, 90 days) for audit logs.

Decision table (example):

| Action type | Default decision  | Rate limit   | Cost cap |
|-------------|-------------------|-------------:|---------:|
| llm-write   | alert-only        | 20/min       | $0.50    |
| image-gen   | enforce           | 5/min        | $5.00    |
| deploy      | require-confirm   | 1/hour       | $0.00    |

Reference: https://github.com/mathhMadureira/orka

## Technical notes (optional)

- Integration model: Orka implements a checkpoint that fits between agent and tools. See implementation notes in the repo: https://github.com/mathhMadureira/orka.
- Policy format: YAML or JSON policy files are simple to edit and review. Start with a single human-editable file and keep it in version control.
- Observability: record checkpoint latency and blocked-action counters. Tune the client timeout (200 ms example) and scale the checkpoint if latency causes operational issues.
- Security: planned actions can be sensitive. Encrypt logs at rest, apply role-based access control (RBAC) to audit data, and limit retention (suggestion: 90 days).

Reference and code examples: https://github.com/mathhMadureira/orka

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: Orka provides a checkpoint API and a policy-driven model as described in the project summary at https://github.com/mathhMadureira/orka.
- Assumption: you can add a pre-execution hook to your agent to call the checkpoint.
- Hypothesis: a 48-hour alert-only window plus a staged canary (1%, 5%, 25%, 100%) will reveal most tuning issues before full enforcement.
- Note: specific filenames and metric names used above (for example, savings_report.csv or incidents.csv) are local suggestions for PoC and should be verified against the repository and your environment.

### Risks / Mitigations

- Risk: false positives block critical automation (impact: service disruption). Mitigation: start alert-only, configure an emergency allow-list, and stage enforcement via canary percentages.
- Risk: Orka becomes a single point of failure. Mitigation: run redundant instances, set a client timeout (200 ms example), and choose fail-open for non-critical paths during early rollout.
- Risk: audit logs expose sensitive planned actions. Mitigation: encrypt logs at rest, restrict access, and retain logs only as long as necessary (for example, 90 days).

### Next steps

- Run a 48–72 hour alert-only monitoring window and collect telemetry.
- Implement a canary rollout plan: 1% -> 5% -> 25% -> 100%, each stage about 24 hours.
- Set SLOs and alerts (example: alert if unexpected blocks >1% or blocked_cost_usd > $100/day).
- Require manual sign-off before switching a policy from alert-only to enforce.
- Practice an incident drill: simulate a runaway; target detection <30 minutes and rollback <60 minutes.

Final checklist for production readiness:
- [ ] policies.yml reviewed and approved by owner
- [ ] 48 hours of alert-only telemetry collected
- [ ] Canary rollout plan with percentages: 1%, 5%, 25%, 100%
- [ ] Emergency allow-list configured
- [ ] Basic savings/incident reporting enabled (local CSV or other store)
- [ ] Alerts for >1% unexpected blocks or >$100/day blocked

For implementation details and the source code, inspect the Orka repository: https://github.com/mathhMadureira/orka.
