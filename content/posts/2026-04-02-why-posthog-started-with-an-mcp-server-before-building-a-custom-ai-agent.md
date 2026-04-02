---
title: "Why PostHog started with an MCP server before building a custom AI agent"
date: "2026-04-02"
excerpt: "Lessons from two years at PostHog: validate agent demand by exposing a narrow, authenticated MCP server (34% of AI-created dashboards used it) before building a full agent."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-02-why-posthog-started-with-an-mcp-server-before-building-a-custom-ai-agent.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "product"
  - "MCP server"
  - "startup"
  - "engineering"
  - "validation"
sources:
  - "https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building"
---

## TL;DR in plain English

- Agent-style features are powerful but often not required to get value quickly. PostHog learned that a minimal, authenticated product-action endpoint — which they call an "MCP server" — delivered substantial usage: 34% of dashboards created by AI flowed through their MCP server, and those dashboard creations were 18% of all dashboards created. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Start by exposing a single, narrow, authenticated write action that converts a natural-language request into a validated, auditable product change. Use that to validate demand before building an embedded conversational agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Build complexity in stages: simple LLM calls for one-off tasks, specialized models for structured outputs, hardcoded workflows for predictable multi-step flows, and only then a full custom embedded agent if non-engineer UX, compliance, or full control demand it. PostHog iterated over ~2 years and relaunched their agent after validating demand with simpler approaches; an initial assistant was released ~6 months after first prototype work. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Methodology note: This summary follows the lessons and data reported in the linked PostHog writeup. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

## What you will build and why it helps

Goal: ship a minimal pathway that turns natural-language input into safe, auditable product actions and use measured adoption to decide whether to invest in a full agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Quick comparison (decision frame):

| Option | Relative complexity | When to choose | Example datapoint from PostHog |
|---|---:|---|---:|
| MCP server (minimal product-action endpoint) | Low | Users are developers or you want a low-maintenance integration | 34% of AI-created dashboards used MCP; these were 18% of all dashboards (PostHog) |
| Single LLM call | Low | One-off text tasks (descriptions, short Q&A) | Fast to prototype; use careful prompting (PostHog recommendation) |
| Specialized model | Medium | Deterministic outputs (SQL, code, JSON) | Higher reliability for structured results (PostHog guidance) |
| Hardcoded workflow | Medium | Predictable multi-step flows | Cheaper to run and easier to maintain than agents |
| Full custom embedded agent | High | Non-engineer UX, strict compliance, or full control needed | Use only after validating demand with simpler patterns (PostHog) |

Plain-language summary: think of the MCP server as a narrow, authenticated doorway. The model fills a strict schema; the product shows a preview; the user confirms. That gives auditable writes, lower engineering cost, and a measurable signal of demand. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

## Before you start (time, cost, prerequisites)

Prerequisite checklist (draft before you implement):

- [ ] Product API that supports the read/write actions you want to expose. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- [ ] Authentication and API key plan for the MCP endpoint. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- [ ] Telemetry, logging, and analytics to capture requests, intents, schema validation failures, and latencies. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- [ ] Clear opt-in and consent flows when actions will mutate user data. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Estimated timeline guidance (use PostHog's public timeline as a reference point):

- Prototype: a narrow prototype can take 1–4 weeks.
- Product iteration: PostHog released an early assistant ~6 months after starting prototype work and iterated over ~2 years before relaunching as PostHog AI; use that to set expectations. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Budget note: keep model/runtime spend small for the prototype; measure spend during a canary before allocating larger budgets. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

## Step-by-step setup and implementation

1. Pick one high-value action to expose (example: create-dashboard).
2. Define one strict JSON schema for the model output; keep the schema narrow and versioned.
3. Implement an MCP endpoint that accepts authenticated POST requests and validates model output before any write.
4. Integrate a hosted LLM and constrain it to return the strict JSON schema; always validate.
5. Surface a preview to the user and require explicit confirmation before applying mutations.
6. Route fully predictable sub-flows to hardcoded code to reduce calls and cost.
7. Launch behind a feature flag and run a short canary while collecting telemetry.

Example: minimal MCP server (commands)

```bash
# install dependencies and run a tiny example server
pip install flask requests
FLASK_APP=mcp_server.py flask run --port 8080

# test create action
curl -X POST http://localhost:8080/actions/create-dashboard \
  -H "Authorization: Bearer $MCP_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question":"How many signups last week?"}'
```

Example: strict JSON schema the model must return

```json
{
  "type": "object",
  "properties": {
    "dashboard": {
      "type": "object",
      "properties": {
        "title": {"type": "string"},
        "widgets": {"type": "array"}
      },
      "required": ["title","widgets"]
    }
  },
  "required": ["dashboard"]
}
```

Implementation notes:

- Always validate model output against the schema. If validation fails, show the result as a draft; do not apply writes automatically. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Log prompt_version, schema_version, request_id, and intent to help debug and correlate telemetry with UX. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

## Common problems and quick fixes

Problem: Model hallucination or invalid JSON
- Quick fix: enforce schema validation and surface a preview. If output fails, require explicit confirmation and log the failure. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Problem: High model cost or latency
- Quick fix: move repeatable deterministic logic to hardcoded paths and call the model only for ambiguous parts. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Problem: Low early adoption
- Quick fix: provide clear in-app examples and guided prompts; measure adoption via the ratio of agent-driven creations to total creations. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Incident debug checklist

- [ ] Check telemetry for recent requests, latencies, and errors.
- [ ] Replay 10 failed prompts locally and inspect raw model outputs.
- [ ] Confirm schema enforcement and feature flag state.
- [ ] Roll back by toggling the feature flag if needed.

## First use case for a small team

Context: solo founders or teams of 2–3 need speed, low cost, and low maintenance. The MCP pattern fits: it validates demand without building a complex agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Concrete path for a tiny team (3 actionable points):

1) Narrow to one action and one schema
- Ship a single MCP action (for example, create-dashboard or draft-email). Limit scope to one schema and one write action.

2) Use managed models and hosted infra
- Use a hosted LLM service to avoid running models yourself; run one small serverless function or a single VM and require API-key authentication. Always show a preview before mutation. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

3) Canary and measure with a tiny cohort
- Run a short canary (for example, internal beta). Collect telemetry: request count, validation failures, preview-to-apply ratio. Iterate on prompts and schema until behavior is stable. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Practical small-team tips:

- Prioritize a working preview/confirm UX over perfect automation.
- Instrument metrics you can act on: attempts, validation failures, conversion from preview to apply.
- Reuse existing product APIs; avoid adding broad new write paths unless they are justified by demand.

## Technical notes (optional)

- Tag telemetry with prompt_version and schema_version and keep prompt templates and schema definitions in version control to allow rollbacks. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Prefer specialized models for deterministic outputs (SQL, code) when correctness is required; this lowers maintenance versus a full agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

Example feature-flag + rollout config (YAML)

```yaml
feature: mcp_create_dashboard
owner: product@acme
rollout:
  canary_percent: 5
  users: [internal, beta_group]
```

Example prompt metadata to log (JSON)

```json
{
  "prompt_version": "v1.0",
  "schema_version": "s1",
  "model": "hosted-llm-v1"
}
```

## What to do next (production checklist)

Source and context: follow the conservative path PostHog used—validate via MCP before building a full agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

### Assumptions / Hypotheses

- The PostHog writeup reports 34% of AI-created dashboards came via an MCP server and those were 18% of all dashboards; this supports the hypothesis that an MCP server can validate demand before a full agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Prototype timeline hypothesis: 1–4 weeks for a narrow prototype; expect multi-month iteration (PostHog: ~6 months to first assistant, ~2 years of work before relaunch). Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Operational gates to validate during a canary (example thresholds to test; treat these as assumptions to confirm): canary cohort = 5% users; creation success target = 75% of previewed actions applied; rollback threshold = 5% error rate; median orchestration latency target = 200 ms; token cap per call = 1,024 tokens; weekly trigger to consider a full agent = 100 agent-driven requests/week; prototype model/runtime budget = $50–$200; initial production reserve = $500–$2,000/month.

### Risks / Mitigations

- Risk: hallucinated or unsafe outputs that damage trust. Mitigation: require structured JSON, show preview/confirm, log failures for audit. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Risk: token and model cost growth. Mitigation: cap tokens (e.g., 1,024 tokens per call), hardcode frequent flows, and monitor tokens/week and spend. (See Assumptions above for numeric gates.)
- Risk: building a full agent too early and incurring high maintenance. Mitigation: use MCP metrics (requests/week, success rate, preview-to-apply) as gates and only commit engineering resources once demand and non-engineer needs justify a custom embedded agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building

### Next steps

- Implement the MCP endpoint and one prompt-to-JSON flow behind a feature flag; instrument prompt_version and schema_version in logs. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
- Run a short canary (example: 5% of users or internal beta) and collect telemetry for 2 weeks against the gates listed in Assumptions above.
- If canary metrics meet gates, expand rollout and consider a follow-up project only if non-engineer demand, compliance, or UX requirements justify a custom embedded agent. Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
