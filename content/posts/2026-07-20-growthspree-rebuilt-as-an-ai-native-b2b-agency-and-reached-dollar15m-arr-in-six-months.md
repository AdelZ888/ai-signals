---
title: "GrowthSpree rebuilt as an AI-native B2B agency and reached $1.5M ARR in six months"
date: "2026-07-20"
excerpt: "GrowthSpree rewired its agency around AI - AEO demand capture, cohort-led ABM, and a retrieval server - then broke a multi-year plateau to reach $1.5M ARR in six months."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-20-growthspree-rebuilt-as-an-ai-native-b2b-agency-and-reached-dollar15m-arr-in-six-months.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 480
editorialTemplate: "TUTORIAL"
tags:
  - "AEO"
  - "Answer Engine Optimization"
  - "AI-native"
  - "B2B"
  - "ABM"
  - "agency"
  - "growth"
  - "tooling"
sources:
  - "https://news.ycombinator.com/item?id=48980665"
---

## TL;DR in plain English

- GrowthSpree rebuilt a B2B marketing agency to be AI-native. They report growing from a multi-year plateau to $1.5M ARR in 6 months. Source: https://news.ycombinator.com/item?id=48980665
- Their key moves: optimize to be the answer LLMs return (AEO), wire AI into research and first-draft messaging, run cohort-led ABM with an always-on LinkedIn warmup, and ship internal tooling (an MCP-style server). Source: https://news.ycombinator.com/item?id=48980665
- Measured outcomes they report: previously stuck between $500K and $800K ARR for ~2 years, then $1.5M ARR after the rebuild; a reported 40% close rate even on cold leads; and they had worked with 300+ B2B SaaS companies before. Source: https://news.ycombinator.com/item?id=48980665

Methodology note: this summary is grounded in the Hacker News post above. Source: https://news.ycombinator.com/item?id=48980665

## What you will build and why it helps

You will build an AI-native GTM stack focused on three linked outcomes (all described in the HN post): https://news.ycombinator.com/item?id=48980665

| Component | Purpose | Key metric (reported or implied) |
|---|---:|---:|
| AEO (Answer Engine Optimization) | Become the answer LLMs return for buyer questions | visibility that compounds vs. traditional page-one SEO (reported shift) |
| Cohort-led ABM + always-on LinkedIn | Warm accounts before first calls | higher pre-call trust; GrowthSpree reports improved close rates (40%) |
| MCP-style retrieval server | Make canonical answers retrievable with source IDs for prompts | citation frequency in model outputs; retrieval hit counts |

Why this helps (from the post): buyers ask an LLM before they ask Google. Being the answer an LLM gives builds trust earlier in the funnel. AI enables research and scalable first-draft outreach so humans can ship at velocity. Source: https://news.ycombinator.com/item?id=48980665

## Before you start (time, cost, prerequisites)

- Time to see signal: GrowthSpree reports outcomes measured over a 6-month window after their rebuild. Source: https://news.ycombinator.com/item?id=48980665
- Cost signals: expect engineering time and LLM API spend; GrowthSpree built internal tooling (an MCP server). Source: https://news.ycombinator.com/item?id=48980665

Prerequisites (from the post): https://news.ycombinator.com/item?id=48980665
- Narrow domain expertise to author authoritative answer-style content.
- Access to an LLM API and a retrieval path that can return passages with source IDs (the MCP role cited).
- Channels for outreach: LinkedIn and email, and the ability to group accounts into cohorts.

Pre-launch checklist:
- [ ] Define a narrow niche and target account cohort. Source: https://news.ycombinator.com/item?id=48980665
- [ ] Create canonical, answer-style pages with clear source metadata. Source: https://news.ycombinator.com/item?id=48980665
- [ ] Expose a simple retrieval endpoint that returns passages tied to source IDs (the MCP role). Source: https://news.ycombinator.com/item?id=48980665
- [ ] Choose an LLM provider and set conservative budget alerts. Source: https://news.ycombinator.com/item?id=48980665

## Step-by-step setup and implementation

1. Pick one tight cohort and a clear value prop. GrowthSpree emphasizes cohort-led ABM. Source: https://news.ycombinator.com/item?id=48980665

2. Author canonical answer content. Convert product docs, FAQs, and short thought pieces into concise, citationable answer pages that directly address buyer intent. Source: https://news.ycombinator.com/item?id=48980665

3. Index and expose retrieval. Implement or wire a minimal MCP-like service that returns short passages plus a source identifier (the HN post cites an MCP server as core tooling). Source: https://news.ycombinator.com/item?id=48980665

4. Use retrieval-augmented prompts. Insert returned passages into the LLM prompt and ask the model to emit citations (source IDs). Track whether the model actually cites your sources. Source: https://news.ycombinator.com/item?id=48980665

5. Run an always-on LinkedIn warmup and layered outreach. Keep a persistent, value-first presence for the cohort; layer targeted LinkedIn and email outreach; re-cohort based on engagement. Source: https://news.ycombinator.com/item?id=48980665

6. Automate drafts; gate sends with humans. Use AI for research and first drafts. Require a human to review before sending. GrowthSpree reports AI handled research and drafts; humans reviewed before send. Source: https://news.ycombinator.com/item?id=48980665

7. Measure and iterate. Track retrieval hit counts, citation frequency in model outputs, reply rates, qualified meetings, and close rates. Use these metrics to decide when to scale. Source: https://news.ycombinator.com/item?id=48980665

## Common problems and quick fixes

- Problem: model does not surface your pages (low citation frequency).
  - Fix: ensure retrieval returns short, explicit answer snippets with clear source IDs. Re-run sample prompts and inspect top-k retrieved passages. Source: https://news.ycombinator.com/item?id=48980665

- Problem: outreach feels generic and converts poorly.
  - Fix: require at least one human edit per AI draft. Add account-specific context or a recent trigger event. GrowthSpree paired AI drafts with human review. Source: https://news.ycombinator.com/item?id=48980665

- Problem: LinkedIn limits or deliverability issues.
  - Fix: slow cadence, publish value-first posts, and split sends across accounts. Source: https://news.ycombinator.com/item?id=48980665

Triage checklist (first 14 days):
- [ ] Confirm retrieval returns expected top passages with source IDs. Source: https://news.ycombinator.com/item?id=48980665
- [ ] Confirm AEO pages include explicit citations. Source: https://news.ycombinator.com/item?id=48980665
- [ ] Monitor reply rate and inbox health daily. Source: https://news.ycombinator.com/item?id=48980665
- [ ] Verify the model sometimes cites your sources in replies. Source: https://news.ycombinator.com/item?id=48980665

Benchmarks to keep in mind from the report: a reported 40% close rate on cold leads and two internal tools doing heavy lifting. Source: https://news.ycombinator.com/item?id=48980665

## First use case for a small team

Scenario: a solo founder or a 2–3 person team wants fast validation. GrowthSpree’s post implies starting tight and dogfooding the motion. Source: https://news.ycombinator.com/item?id=48980665

Actionable steps for small teams (grounded in the post): https://news.ycombinator.com/item?id=48980665
- Focus on one narrow niche where you already have credibility. GrowthSpree used tight cohorts.
- Publish 1–2 canonical answers: convert a core FAQ or how-to into a short, citation-ready page that an LLM can consume.
- Minimal retrieval: expose a simple endpoint that returns passages plus a source ID so prompts can include citations. The HN post cites an MCP server role.
- Outreach practice: use AI to draft personalized outreach but always edit before sending. Re-cohort on engagement.

Measure success: aim for at least one qualified meeting from the pilot cohort and evidence that the LLM sometimes surfaces or cites your content. Source: https://news.ycombinator.com/item?id=48980665

## Technical notes (optional)

- MCP responsibilities (as described in the post): ingest canonical docs, expose semantic retrieval with a citation/source field, and serve retrieval results into prompts and AEO testing. GrowthSpree reports shipping an MCP server. Source: https://news.ycombinator.com/item?id=48980665
- Instrumentation: log retrieval hit counts, citation frequency, outreach reply rates, and qualified-meeting counts; tie model surface frequency to GTM outcomes. Source: https://news.ycombinator.com/item?id=48980665
- Security note: scrub PII before sending to third-party LLMs and add budget alerts. (Suggested practice alongside the post.) Source: https://news.ycombinator.com/item?id=48980665

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: buyers increasingly ask LLMs before Google and being surfaced by an LLM increases pre-call trust. This is the AEO hypothesis GrowthSpree describes. Source: https://news.ycombinator.com/item?id=48980665
- Hypothesis: cohort-led ABM with an always-on warmup will raise qualified meetings and pre-call trust. GrowthSpree reports this motion increased close rates to ~40%. Source: https://news.ycombinator.com/item?id=48980665
- The following knobs are illustrative and not claimed in the HN post; treat them as starting assumptions to validate in your context:

```bash
# Illustrative: index a folder of canonical docs into a local MCP-like endpoint
curl -X POST http://localhost:8080/index \
  -H 'Authorization: Bearer $MCP_TOKEN' \
  -F 'path=./canonical_docs' \
  -F 'source=product_docs'
```

```yaml
# Illustrative: example mcp-config.yaml
index_paths:
  - ./canonical_docs
citation_field: source_id
llm_endpoint: https://api.example-llm.com/v1/completions
auth_token: ${LLM_API_KEY}
```

- Example experiment knobs to validate (illustrative): a 2-week MVP sprint, ~80 developer-hours, a 50-account initial cohort, canary rollout at 5% then 25%, and a 7-day canary hold.

### Risks / Mitigations

- Risk: the model ignores your content (low citation frequency).
  - Mitigation: tighten retrieval, shorten answer snippets, and ensure explicit source IDs are attached to passages.
- Risk: outbound outreach harms deliverability or brand reputation.
  - Mitigation: human-gate sends, pilot on a small canary cohort, and keep cadence conservative.
- Risk: LLM API costs spike unexpectedly.
  - Mitigation: set rate limits, budget alerts, and feature flags to disable non-essential calls.

### Next steps

1. Audit the top 10–20 buyer intent queries for your niche and write canonical answers for each. Source: https://news.ycombinator.com/item?id=48980665
2. Build or wire a minimal retrieval endpoint (the MCP role) that returns passages and source IDs; test whether sample prompts cite your sources. Source: https://news.ycombinator.com/item?id=48980665
3. Run a 1-cohort pilot and dogfood the always-on warmup plus multi-channel outreach. Gate scaling on at least one qualified meeting and evidence of model citation. Source: https://news.ycombinator.com/item?id=48980665
4. If pilot signals align, plan a phased rollout with metric gates tied to reply rate and qualified meetings. Source: https://news.ycombinator.com/item?id=48980665

References: GrowthSpree’s Hacker News thread is the primary grounding for this playbook: https://news.ycombinator.com/item?id=48980665
