---
title: "Styx: a self-hosted MCP-native AI gateway that auto-routes requests with styx:auto"
date: "2026-03-09"
excerpt: "Hands-on guide to self-hosting Styx, an MCP-native AI gateway that auto-routes requests (styx:auto) across 65+ models with live pricing. Setup, test routing, and POC tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-09-styx-a-self-hosted-mcp-native-ai-gateway-that-auto-routes-requests-with-styxauto.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 30
editorialTemplate: "TUTORIAL"
tags:
  - "styx"
  - "ai-gateway"
  - "mcp"
  - "self-hosted"
  - "auto-routing"
  - "open-source"
  - "model-routing"
  - "openrouter"
sources:
  - "https://github.com/timmx7/styx"
---

## TL;DR in plain English

- Styx is an open-source, self-hosted AI gateway. The project page describes it as an "MCP-Native AI Gateway" that can route requests to many providers and supports 65+ models: https://github.com/timmx7/styx
- Why use it: call one local endpoint from your app instead of many provider SDKs. That reduces secret sprawl and makes swapping providers a config change instead of code work. See the repo headline: https://github.com/timmx7/styx
- Quick action: clone the repo, read the README, then run a short local proof of concept (POC — proof of concept) behind a development firewall.

Concrete short scenario

- Example: a small team runs a customer-support bot. Short FAQ queries go to a cheap model. Code-related questions go to a higher-quality model. The gateway routes each request automatically based on simple rules. You test this locally before rolling it out.

Plain-language explanation before advanced details

- This guide shows how to run Styx locally, configure two providers, and test routing. It keeps steps small so you can validate behavior quickly. Advanced topics (monitoring, canaries, hardening) come after a working POC.

## What you will build and why it helps

You will build a single, self-hosted gateway that your application calls for every AI request. The gateway inspects each request and forwards it to one of several model providers. The repository advertises that behavior: https://github.com/timmx7/styx

Why this helps small teams and founders:
- One integration point. Your app talks to one URL instead of many SDKs.
- Fewer secrets to manage. Provider keys stay behind the gateway.
- Safer provider swaps. Change gateway configuration, not app code.

Concrete artifact you will create:
- A small routing decision table (JSON or YAML) you can update and test behind a feature flag.
- Example rules: low-cost model for short prompts; high-quality model for code.

Note on the repository headline: it uses the term "MCP". The project page uses that acronym as written; the repository does not expand it in the headline. See: https://github.com/timmx7/styx

## Before you start (time, cost, prerequisites)

- Time estimates:
  - ~5 minutes to clone and inspect the repo.
  - ~30 minutes for a local POC.
  - 2–8 hours to harden secrets, monitoring, and CI for staging.
- Cost:
  - Styx is open-source and self-hosted (no gateway license fee). You still pay any model provider fees when you call models. See the repo: https://github.com/timmx7/styx
- Minimum prerequisites:
  - Git installed.
  - A container runtime (Docker / docker compose) or equivalent.
  - Outbound network access to chosen model providers.
  - A place to keep secrets (local env files, a secrets manager, or cloud secrets).
- Quick checklist before you begin:
  - [ ] Clone the repo: https://github.com/timmx7/styx
  - [ ] Prepare provider API keys (start with 2 providers)
  - [ ] Choose a dev host: at least 2 CPU cores and 2 GB RAM for a POC

## Step-by-step setup and implementation

The repository is here: https://github.com/timmx7/styx. Verify exact filenames and commands in the README before running anything.

1) Clone and inspect the repo.

```bash
git clone https://github.com/timmx7/styx
cd styx
ls -la
# open README.md and any docker-compose or .env.example files
```

2) Prepare secrets (do not commit keys). Example local env file (illustrative):

```env
# illustrative only — verify names in the repo
STYX_ADMIN_KEY=example_admin_key
PROVIDER_KEY_OPENAI=sk-xxxx
PROVIDER_KEY_OTHER=pk-xxxx
```

3) Start a local stack (example command; verify in the repository):

```bash
docker compose up --build -d
# then watch logs
docker compose logs -f
```

4) Register at least two providers in the gateway configuration or UI. Pick one low-cost provider and one higher-quality provider. Use simple routing rules that match prompt length or keywords.

5) Test routing with a single request from curl or your app. Look at gateway logs or metrics to confirm which provider handled the request.

6) Canary rollout and gates (pattern, not prescriptive):
- Canary 1: 10% traffic. Gate: p95 latency < 1,000 ms, error rate < 0.5%, daily cost delta < $5.
- Canary 2: 50% traffic. Gate: p95 latency < 1,000 ms, error rate < 0.5%, cost variance < 20%.
- Full: 100% traffic after two full days of passing gates.

Simple routing decision table example:

| Prompt type | Signal | Preferred tier | Initial split |
|---|---|---|---:|
| Short FAQ | length < 128 tokens | low-cost | 100% |
| Code / Dev | contains code block | high-quality | 100% |
| Unknown | default | auto | 10% low-cost / 90% high-quality |

Notes: verify token counting and pattern matching against your client. Adjust splits during canaries.

## Common problems and quick fixes

Source overview: https://github.com/timmx7/styx

- Container fails to start:
  - Check Docker daemon, free ports, and container logs (docker compose logs). Confirm environment variables and .env values.
- Gateway can't reach provider APIs:
  - Confirm outbound network access, correct provider API keys, and provider-side rate limits.
- Routing chooses expensive models too often:
  - Add explicit rules based on prompt length, keywords, or token thresholds. Start with a 10% canary for new rules.
- CI/CD fails due to secrets in code:
  - Move secrets to a secrets manager, inject them at runtime, and add secret scanning to the pipeline.

Metric thresholds to watch when troubleshooting: p95 latency > 1,000 ms, error rate > 0.5%, daily cost delta > $10, unexpected token bill > 1,000,000 tokens/day.

## First use case for a small team

Scenario: you are a solo founder or a 2–3 person team building a support chatbot. You want cheap answers for short FAQs and higher quality for technical or code answers. Repo: https://github.com/timmx7/styx

Concrete, actionable plan for a small team (three clear steps):

1) Minimal POC in 60–90 minutes
   - Clone the repo and run a local POC on a dev machine (2 CPU, 2 GB RAM). Read the README first: https://github.com/timmx7/styx
   - Configure two provider keys (keep keys in a local secrets store).
   - Deploy the gateway locally and send 10 test requests to validate routing.

2) Cheap/quality split rules you can implement in < 30 minutes
   - Rule A: if prompt length < 128 tokens → route to low-cost model.
   - Rule B: if prompt contains code markers (``` or the word function) → route to high-quality model.
   - Use a 10% canary when you add or change rules.

3) Cost and safety controls to set immediately
   - Set a per-day spend alert at $50 and a hard cap webhook at $200/day while testing.
   - Monitor token usage; alert at 100,000 tokens/day and escalate at 1,000,000 tokens/day.
   - Rotate API keys every 30–90 days and restrict admin endpoints by IP allowlist.

Quick week-1 checklist:
- [ ] POC deployed to dev (local or small VM)
- [ ] Two providers configured and validated
- [ ] Canary at 10% for 24 hours
- [ ] Cost and latency dashboard connected (p95, error rate, tokens)

If you tell me which two providers you plan to test and your target p95 and cost thresholds, I can draft a minimal docker-compose override and a routing config (JSON or YAML) to drop in the repo.

## Technical notes (optional)

Repository snapshot: https://github.com/timmx7/styx. The repository headline advertises MCP-native gateway behavior, "intelligent auto-routing," and support for 65+ models. Inspect the repo to confirm supported providers and configuration details.

Instrumentation recommendations (practical numbers to track):
- p95 latency (target < 1,000 ms)
- Error rate (target < 0.5%)
- Token usage (alert at 100,000 tokens/day; escalate at 1,000,000 tokens/day)
- Cost alerts (daily delta > $5 for early canaries; > $50 for production alerts)

## What to do next (production checklist)

### Assumptions / Hypotheses

- The document treats the repository headline as factual baseline: "MCP-native gateway," "intelligent auto-routing," and "65+ models" per https://github.com/timmx7/styx.
- Example commands, env names, and rollout numbers are illustrative patterns common to self-hosted gateway projects. Verify exact CLI commands, config filenames, and API surfaces in the repository before running any script.

### Risks / Mitigations

- Risk: secrets leakage. Mitigation: use a secrets manager, rotate keys every 30–90 days, and restrict admin endpoints to an IP allowlist.
- Risk: unexpected spend. Mitigation: start with a 10% canary, set per-day spend alerts at $50, and a hard cap webhook at $200/day during testing.
- Risk: latency spikes. Mitigation: add a fallback routing policy to a lower-latency model if p95 > 1,000 ms and scale gateway instances horizontally.
- Risk: gateway bottleneck. Mitigation: run at least 2 gateway instances behind a load balancer and add health checks and auto-restart for unhealthy nodes.

### Next steps

1. Clone and inspect the repository: https://github.com/timmx7/styx
2. Provision a test host (minimum 2 CPU, 2 GB RAM) and a secrets store.
3. Run a local POC and implement the routing decision table; start canary at 10% for at least 24 hours.
4. Add monitoring for p95 latency, error rate, and tokens; set alerts at the thresholds above.
5. After 7 days of stable metrics, expand to 50% then 100% traffic. Schedule a post-deploy cost/quality audit.

If you share the two providers you want to test and your target p95 and cost thresholds, I will draft a minimal docker-compose override and a routing config (JSON or YAML) you can drop into the repo.
