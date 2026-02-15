---
title: "Control a Micropolis city with an LLM via Hallucinating Splines' REST API"
date: "2026-02-15"
excerpt: "Use Hallucinating Splines' REST API to run an LLM as a city mayor in a live Micropolis simulation. See how agents manage zoning, roads and power and why spatial planning trips them up."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-15-control-a-micropolis-city-with-an-llm-via-hallucinating-splines-rest-api.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "micropolis"
  - "simcity"
  - "ai-agents"
  - "llm"
  - "rest-api"
  - "cloudflare"
  - "durable-objects"
  - "mcp"
sources:
  - "https://hallucinatingsplines.com"
---

Build an AI Mayor: Let an LLM Agent Play SimCity (Micropolis) via REST API

## Builder TL;DR

What you’ll build: a looped agent that reads city state from the Hallucinating Splines site and issues build actions (roads, power, zoning) to a live Micropolis city via the service’s API surface. The public project is visible at https://hallucinatingsplines.com and lists cities, mayors and Docs/GitHub links you’ll use as your spec.

Quick runbook:
- Read the site Docs and GitHub links at https://hallucinatingsplines.com to discover the API shapes and example payloads.
- Run a connectivity test (curl) against the documented GET city/state endpoint and validate a POST action returns an action-id.
- Implement a planner loop: fetch state -> prompt LLM -> validate proposed action -> POST -> poll for completion.

Concrete artifacts to produce:
- A working demo agent that issues at least 1 valid build action and records the returned action-id and city snapshot.
- A CSV decision table mapping intents to API payloads and a simple config with endpoint + API key placeholders.

Note: the site is built on micropolisJS (GPL v3) and shows live metrics like 226 mayors, 823 cities, and a total population of 12,130,020 on the public leaderboard (see https://hallucinatingsplines.com).

## Goal and expected outcome

Primary goal: implement an LLM-driven mayor that can query a Hallucinating Splines city state, decide the single next actionable step, and submit that step successfully via the documented endpoints on https://hallucinatingsplines.com.

Expected outcome:
- Your agent appears as a mayor or is logged as making actions in the public site listing (the site shows a cities leaderboard; use it to confirm your agent’s activity: https://hallucinatingsplines.com).
- A short demo script that issues at least one valid action, stores action-id(s), and captures the resulting city snapshot for verification.

Acceptance criteria (concrete thresholds):
- The demo must POST a valid action and receive an action-id within 2s of the request.
- The agent must poll for completion with a 5s interval and time out after 30s if the MCP/engine doesn’t respond.
- If the action returns an invalid-action error, retry up to 3 times with backoff.

## Stack and prerequisites

Stack summary:
- Hallucinating Splines (Micropolis-based) website + Docs (https://hallucinatingsplines.com).
- An LLM-capable client or SDK (your choice: hosted model or local LLM) able to send/receive JSON over HTTP and manage prompt state.
- A small runner service (Node.js recommended) to host the planner loop and manage retries/backoff.

Prerequisites:
- Node.js 18+ and npm/yarn.
- curl or HTTP client for manual testing.
- Familiarity with asynchronous polling and idempotency keys.

Minimum local resources and constraints:
- 1 vCPU, 256 MB RAM for a lightweight agent process; scale to 2 vCPU, 1 GB for multiple concurrent mayors.
- Rate-limit guidance: keep client-side burst to <= 100 requests/min and average <= 10 requests/min per agent to avoid tripping automated protections; confirm limits on the site Docs (https://hallucinatingsplines.com/docs).

Example quick CLI check (replace placeholders):

```bash
# connectivity test (assumption: /api/cities/{id}/state exists in the docs)
curl -s -H "Authorization: Bearer ${SPLINES_KEY}" \
  "https://hallucinatingsplines.com/api/cities/${CITY_ID}/state" | jq .
```

And a minimal agent config (yaml):

```yaml
# agent-config.yaml
endpoint: "https://hallucinatingsplines.com/api"
api_key: "REPLACE_WITH_KEY"
poll_interval_ms: 5000
max_retries: 3
idempotency_prefix: "agent-xyz-"
```

## Step-by-step implementation

1. Read the API spec and collect endpoints

- Open the site Docs at https://hallucinatingsplines.com/docs and catalogue endpoints for reading a city snapshot and for submitting actions. Create a checklist CSV of required fields per endpoint.

2. Acquire a key and test connectivity

- If the site exposes keys/examples, follow the Docs. Run the curl connectivity test from the previous section to confirm credentials and basic GET access.

3. Map intents -> payloads

- Build a decision table that maps high-level intents ("build residential block", "connect power", "build road") to concrete payload shapes. Example table:

| Intent | Endpoint (example) | Required fields | Example param values |
|---|---:|---|---|
| Build road | /cities/{id}/actions | x,y,action_type,length | x=10,y=12,action_type=road,length=8 |
| Zone residential | /cities/{id}/actions | x,y,zone_type,size | zone_type=res,size=4 |

(Concrete endpoint paths in your agent should follow the official Docs at https://hallucinatingsplines.com/docs.)

4. Implement the planner loop (code sketch)

- Steps inside your runner:
  1. GET city state snapshot.
  2. Extract features (population, residential demand, power status). Note the public site shows metrics such as population: 12,130,020 and demand indicators (see https://hallucinatingsplines.com).
  3. Prompt your LLM with the processed state and a short instruction: propose exactly one action and return JSON.
  4. Validate proposed action against your decision table and guard rails (e.g., coordinates within map bounds).
  5. POST the action with an idempotency key and record action-id.
  6. Poll action status every 5s (poll interval) until complete or 30s timeout. If status indicates invalid-action, apply up to 3 retries with exponential backoff.

Rollout / rollback plan and gates:
- Canary: start with 1 agent (1% of write capacity). Monitor invalid-action rate; gate to next rollout step when invalid-action rate < 5% over 100 actions.
- Feature flag: wrap write operations behind a "mayor-write-enabled" flag; enable for canary group only.
- Rollback: if invalid-action rate > 20% or average API latency > 2s over a 1-min window, flip the feature flag off and stop writes; hold a rollback window of 10 minutes.

5. Add safety and retries

- Implement action validation client-side: reject placements outside map bounds, avoid overlapping forbidden tiles, and enforce a maximum of 10 build tiles per minute.
- Use idempotency keys to avoid duplicate work; include an idempotency prefix in your YAML/JSON config.

Example POST (bash placeholder):

```bash
curl -X POST "https://hallucinatingsplines.com/api/cities/${CITY_ID}/actions" \
  -H "Authorization: Bearer ${SPLINES_KEY}" \
  -H "Idempotency-Key: agent-xyz-123" \
  -H "Content-Type: application/json" \
  -d '{"action":"build_road","x":10,"y":12,"length":8}'
```

6. Observability

- Log action payloads, action-id, response time (ms), and status codes.
- Track these KPIs: avg latency (target < 500ms), invalid-action rate (target < 5%), and actions per minute (cap at 10/min per agent).

Checklist (developer):
- [ ] Confirm Docs and endpoints at https://hallucinatingsplines.com/docs
- [ ] Run connectivity curl test and capture sample response
- [ ] Implement planner loop with 5s poll interval and 30s timeout
- [ ] Add idempotency and 3 retry policy

## Reference architecture

H3 Architecture components

- Agent runner (Node.js): responsible for observation, planning (LLM), validation, and write operations.
- Hallucinating Splines API + city engine: authoritative state and action processing (see https://hallucinatingsplines.com).
- Observability: a small monitoring stack to track latency, error rates, and per-agent actions.

H3 Flow

agent -> GET city snapshot -> LLM -> validate -> POST action -> GET action status -> agent (repeat)

H3 Example responsibilities table

| Component | Responsibility | Constraint |
|---|---|---:|
| Agent runner | Plan and submit single action per loop | limit 10 actions/min per agent |
| Hallucinating Splines API | Validate and execute action, return action-id | authoritative state (public site shows leaderboard: 226 mayors, 823 cities) |

## Founder lens: ROI and adoption path

Why it matters: low-friction public demos (Docs + GitHub linked on https://hallucinatingsplines.com) and visible leaderboards lower onboarding friction. The site already surfaces metrics (e.g., 226 mayors, 823 cities, 12,130,020 total population) which are powerful social proof and distribution hooks.

Adoption path (staged):
1. Seed with 3 example agents (one rule-based, one LLM-guided, one human-in-the-loop) and publish them on GitHub.
2. Open a free, rate-limited key path to encourage experimentation (monitor: < 100 qps aggregate, initial per-agent cap 10/min).
3. Convert to paid tiers once you observe >= 1,000 monthly active agents or when median session length > 30 minutes.

ROI signals to track: number of unique mayors added (target first milestone = +50 mayors), average session length (target > 5 minutes), and retention rate after 7 days (target > 10%). Use the public leaderboard as a funnel to attract shareable content.

## Failure modes and debugging

Common failure: the LLM proposes spatially invalid or scattered placements; initial invalid-action rates may be 20–80% while you tune prompts and validation.

Debugging checklist:
- Reproduce the POST with curl (capture the exact JSON payload).
- Inspect the API response for error codes and field-level validation messages.
- Open the city in browser (https://hallucinatingsplines.com) to visually compare intent vs result.

Desired log fields (store for each action):
- action-id
- latency_ms (example target < 500ms)
- response_code
- validation_errors (if any)
- retry_count

Concrete thresholds to monitor:
- Alert if avg latency > 2000 ms for 60s.
- Alert on invalid-action rate > 10% across 100 actions.
- Throttle agent if actions/min > 10.

Short methodology note: this tutorial references the public site snapshot as the authoritative surface for example metrics; treat endpoint paths used in examples as placeholders to be confirmed against the Docs at https://hallucinatingsplines.com/docs.

## Production checklist

### Assumptions / Hypotheses

- The public site exposes actionable API endpoints and Docs at https://hallucinatingsplines.com/docs (you must confirm exact paths and auth mechanisms).
- The project uses micropolisJS under GPL v3 (documented on the site); any redistribution must comply with GPL v3.
- Durable Object deployment details (e.g., Cloudflare Durable Objects per-city) are NOT asserted as fact here and should be validated directly with the project repo or Docs.

### Risks / Mitigations

- Risk: high invalid-action rate (>= 20%) — Mitigation: add client-side validation and restrict agent to propose one action per 30s until rate < 5%.
- Risk: abusive clients overloading API (>= 100 qps) — Mitigation: enforce rate limits, per-key quotas, and automated blocks for patterns exceeding 500 actions/hour.
- Risk: license noncompliance with micropolisJS GPL v3 — Mitigation: include license checklist and consult legal before redistributing derived code.

### Next steps

- Validate exact API endpoints and auth flows in the Docs at https://hallucinatingsplines.com/docs and clone the GitHub repo linked on the site for examples.
- Implement a single-canary agent, monitor the invalid-action rate for the first 100 actions, and iterate prompts/validation until invalid-action rate < 5%.
- Prepare a public demo repo with 3 example agents and step-by-step README referencing the site.

---

References: Hallucinating Splines (site snapshot) — https://hallucinatingsplines.com
