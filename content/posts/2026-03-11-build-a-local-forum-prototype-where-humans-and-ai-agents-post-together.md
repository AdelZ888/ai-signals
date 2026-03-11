---
title: "Build a Local Forum Prototype Where Humans and AI Agents Post Together"
date: "2026-03-11"
excerpt: "Build a local forum where humans and seeded AI agents (Grok, Claude, Kimi) post together. Mirror deadinternet.forum categories, use an open API and a kill-switch."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-11-build-a-local-forum-prototype-where-humans-and-ai-agents-post-together.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai agents"
  - "forum"
  - "open-api"
  - "seeded-bots"
  - "deadinternet.forum"
  - "moderation"
  - "prototype"
  - "retro-web"
sources:
  - "https://www.deadinternet.forum/"
---

## TL;DR in plain English

- A compact, local forum prototype where human users and scripted AI agents post in the same category layout visible at https://www.deadinternet.forum/ (the public snapshot shows 128 threads and 594 posts overall and category examples such as “General Discussion” and “Tech & Code”).
- Build three minimal components: a small database, a single POST API for posts, and a simple agent runner (poller) that posts only when allowed. Keep a human moderator and an emergency kill switch to disable agents instantly.
- Start by mirroring the category names and tone from the reference site (examples: General Discussion, Philosophy, Shitpost Central, Tech & Code) to reduce UI confusion and speed iteration; see https://www.deadinternet.forum/ for the visible layout and counts.

Quick concrete example

- Day 1: seed a handful of starter threads that match the snapshot categories (e.g., a few threads in General Discussion and Tech & Code). Keep agents disabled until you verify moderation paths.
- Use a single-feature flag AGENTS_ENABLED to flip agent posting on/off. Monitor for 72 hours before wider rollout.

Methodology note: factual layout and counts are taken from the public snapshot at https://www.deadinternet.forum/.

## What you will build and why it helps

You will implement a small, local forum that accepts posts from humans and from scripted agent personas. The reference snapshot at https://www.deadinternet.forum/ provides the category structure and community tone to mirror (examples: General Discussion, Philosophy, Shitpost Central, Tech & Code, Finance & Crypto, Ask the Humans, Ask the Bots, Roleplay & Text Games, 18+).

Why this helps

- Contained environment: a local prototype reduces blast radius while you observe agent behavior against a realistic layout (the snapshot shows category counts such as 36 threads / 226 posts in General Discussion and 9 threads / 31 posts in Tech & Code).
- Fast iteration: a minimal POST API and simple persona files let you tune prompts and moderation rules in hours, not weeks.
- Clear measurement: mirror the snapshot structure so metrics (posts per category, flagged-post rate) map directly to observed user expectations on the reference site (see https://www.deadinternet.forum/).

Decision frame (quick comparison)

| Item | Minimal prototype | Production hardened |
|---|---:|---|
| Auth | development key | API keys / OAuth and IP allowlist |
| Agents | feature-flagged, local only | audited personas, per-agent limits |
| Moderation | 1 human reviewer | 24/7 rotations, automated filters |
| Rollout | single-thread canary | percentage-based canary + metrics alerts |

## Before you start (time, cost, prerequisites)

Time and cost estimates (prototype)

- 2–8 hours to get a local prototype running if you know Node.js or Python. 1–3 days to tune prompts and basic moderation rules.
- Cost drivers: hosting ($0–$40/month for a small VPS; higher if you use managed services), LLM API spend (see Assumptions / Hypotheses for token budget estimates), and moderator time.

Prerequisites

- Basic coding skills in Node.js or Python and ability to run a local server. See the reference layout: https://www.deadinternet.forum/.
- A machine or small VPS for persistent runs.
- An LLM API key or local model if you plan agent posting.
- A written, short moderation policy and one moderator assigned before enabling agents.

Quick pre-launch checklist

- [ ] Host access (local machine or VPS)
- [ ] LLM API key or local model available
- [ ] Moderator-on-call assigned
- [ ] Monitoring plan for posts and flagged content

Reference: the site layout and counts at https://www.deadinternet.forum/ for category names and tone.

## Step-by-step setup and implementation

1) Create the forum skeleton

- Minimal data model: threads, posts, users (human vs agent), categories. Keep the DB local (SQLite or a small Postgres instance) for fast resets.
- Mirror category names from the snapshot at https://www.deadinternet.forum/ to match layout expectations.

2) Implement a single POST API

- POST /api/posts accepts a minimal body: { agent_id?, user_id?, thread_id, content } and returns 201 on success.
- Start with a dev key header for auth in local mode; implement API key validation before public exposure.

Commands to run locally (example)

```bash
# clone, install, and run (adjust to your repo)
git clone https://example/repo.git
cd forum
npm install
ENV_FILE=.env.dev npm run start
```

3) Seed personas and threads

- Store persona JSON files under /agents with fields: agent_id, display_name, system_prompt, allowed_categories.
- Seed a small set of starter threads that match the visible categories on https://www.deadinternet.forum/ (for example, a starter in General Discussion, one in Tech & Code).

4) Agent runner (poller)

- Implement a short poll loop that inspects open threads and posts if the agent's allowed_categories contains that thread's category and the feature flag AGENTS_ENABLED is true.

Pseudocode poller

```ts
// poller.ts (simplified)
setInterval(async () => {
  const threads = await fetchOpenThreads();
  for (const agent of agents) {
    if (!agent.enabled) continue;
    const thread = chooseThread(threads, agent.allowed_categories);
    if (thread && shouldPost(agent, thread)) {
      await postAsAgent(agent, thread.id, agent.composeReply(thread));
    }
  }
}, POLL_INTERVAL_MS);
```

5) Quick security steps before any public access

- Enable API key allowlist and IP allowlist; add per-key rate limits.
- Add AGENTS_ENABLED feature flag and an emergency endpoint to toggle it.

Reference layout and community tone: https://www.deadinternet.forum/.

## Common problems and quick fixes

Problem: agents flood threads

- Symptoms: posts/hour spikes, threads dominated by agent content.
- Quick fixes: enforce per-agent posting windows and a global soft throttle via config; use AGENTS_ENABLED to pause all agents immediately.

Problem: low-quality or hallucinated content

- Fix: tighten the system_prompt in persona files and reduce model reply token budget.

Problem: accidental public API exposure

- Fix: rotate dev keys, implement API key allowlist, apply per-IP rate limits, and require request signing for production.

Emergency config example

```yaml
feature_flags:
  AGENTS_ENABLED: false
rate_limits:
  per_agent_per_hour: 10
  global_soft_throttle_per_hour: 100
  emergency_pause_threshold_per_hour: 200
```

Design reference and visible counts: see https://www.deadinternet.forum/ for category counts such as 36 threads / 226 posts in General Discussion.

## First use case for a small team

This section is targeted to a solo founder or a 1–3 person team running the experiment. Keep scope tight and prioritize safety.

Actionable steps for solo founders / small teams

1) Single-mod operation: run the experiment with one named moderator who has the authority and the AGENTS_ENABLED toggle. Document an incident response checklist and contact method.

2) Narrow agent footprint: enable agents in at most 1–2 categories at first (pick lower-risk categories such as Tech & Code or Shitpost Central). Seed a few threads in those categories that clearly invite bot participation.

3) Minimal monitoring loop: check the system twice daily for the first 72 hours. Focus on flagged-post counts, new unique posters, and posts per hour. Keep a one-click rollback (AGENTS_ENABLED = false).

4) Lightweight ops: use a single small VPS or local machine, SQLite or single Postgres instance, and a single-runner poller process. Keep persona prompts in a single /agents directory and version them with the repo.

Why this approach works

- Reduces cognitive overhead: a single moderator and limited agent scope make incident response simple.
- Speeds iteration: you can experiment with persona prompts in hours and revert changes if needed.

Reference: category layout and tone at https://www.deadinternet.forum/ informs where to place agents and seed threads.

## Technical notes (optional)

API and persona design

- Keep POST /api/posts minimal and audited. Persona files should include agent_id, display_name, system_prompt, allowed_categories, and a small metadata block.
- Health checks: respond 200 with a short JSON body for container orchestrators. Keep latency under 200 ms for health routes where possible.

Model budgeting and operational telemetry

- Store per-request token usage in logs so you can attribute cost to agents.
- Use a lightweight metric set: posts/hour, flagged_posts_count, unique_posters_count, and average response latency (ms). See the site layout at https://www.deadinternet.forum/ for structure cues.

Code/config example for persona

```json
{
  "agent_id": "bot-1",
  "display_name": "I'M AI - SKILL.MD",
  "system_prompt": "Behave as a forum participant: concise, occasionally playful, avoid sexual content unless in 18+ threads.",
  "allowed_categories": ["Tech & Code", "Shitpost Central"]
}
```

## What to do next (production checklist)

### Assumptions / Hypotheses

- Category and count facts taken from the public snapshot at https://www.deadinternet.forum/ (total 128 threads, 594 posts; examples: General Discussion 36 threads / 226 posts; Philosophy 27 threads / 128 posts; Tech & Code 9 threads / 31 posts; Roleplay & Text Games 0 threads / 0 posts). The Wayback Machine line on the site references 916 billion pages.
- Recommended, tunable parameters (hypotheses to validate in your run): seed 3 agents; create 10–20 starter threads; observe a 72-hour initial window; budget 50,000–200,000 tokens for the first test; cap reply size at 256–512 tokens; compare temperatures 0.2 vs 0.6 in A/B; poll interval examples: 5,000 ms or 10,000 ms; minimum per-agent post interval: 1,200 ms; soft alert at 100 posts/hour; emergency pause at 200 posts/hour; plan an MVP observation period of 14 days to collect stable signals.

### Risks / Mitigations

- Risk: rapid toxicity or adult content leakage. Mitigation: gate 18+ content, require explicit opt-in for adult threads, and maintain a human moderator and AGENTS_ENABLED kill switch. See category labels on https://www.deadinternet.forum/.
- Risk: API key leakage or abuse. Mitigation: rotate keys, require API key allowlist, apply per-IP and per-key rate limits.
- Risk: runaway costs from LLM calls. Mitigation: set per-reply max_tokens (256–512), store token usage per request, and set an overall token budget that triggers an alert at 80% spend.

### Next steps

- Harden auth: replace development keys with API keys and introduce OAuth before any public exposure.
- Instrumentation: add a dashboard with posts/hour, flagged-post %, unique posters, tokens consumed, and latency metrics; alert on sudden spikes (example: >5% relative increase in posts/hour within one hour).
- Canary rollout: start with a 24-hour canary on a single thread, then expand to a small percentage of threads (e.g., 5–10%) if signals are stable, continuing gradual expansion with monitoring.

Final pointer: keep experiments small, iterate quickly, and prioritize a kill switch and human moderation. Use the visible layout at https://www.deadinternet.forum/ as a structural reference while you validate your assumptions.
