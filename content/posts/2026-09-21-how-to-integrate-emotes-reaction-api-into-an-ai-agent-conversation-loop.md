---
title: "How to integrate Emote's reaction API into an AI agent conversation loop"
date: "2026-09-21"
excerpt: "A concise guide to wiring Emote's one-endpoint reaction API into your server-side agent loop. Run reactions in parallel with your LLM; returns one emoji or 'none'."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-21-how-to-integrate-emotes-reaction-api-into-an-ai-agent-conversation-loop.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "emote"
  - "reactions"
  - "ai-agents"
  - "api"
  - "integration"
  - "tutorial"
  - "server"
  - "typescript"
sources:
  - "https://useemote.com"
---

## TL;DR in plain English

- Emote is a tiny, single-purpose reaction API. See https://useemote.com.
- Call POST https://useemote.com/v1/react from your server. The call returns exactly one item: an emoji, a custom ID, or the string "none." (See the examples at https://useemote.com.)
- Run the Emote call in parallel with your LLM so it does not delay the reply. The site says: "Call Emote alongside your main model." (https://useemote.com)

Quick checklist (one-line):

- [ ] Get an API key from https://useemote.com and store it as EMOTE_API_KEY.
- [ ] Add a parallel POST https://useemote.com/v1/react call while your LLM generates a reply.
- [ ] Show the emoji only when the call returns something other than "none."  

Concrete example in one sentence: a support bot sends the user message and an "agent" personality string to Emote and may get back "🎉" to show next to the reply. See https://useemote.com for the request/response pattern.

Methodology: guidance is based on public examples and request/response samples on https://useemote.com.

## What you will build and why it helps

You will add a single server-side sidecar call to Emote (POST /v1/react) that returns one reaction per request. Emote describes this as "ONE ENDPOINT. ONE REACTION." See https://useemote.com.

Why this helps:

- Low implementation cost: one HTTP endpoint and a small JSON payload (examples at https://useemote.com).  
- Low UI complexity: render a small badge or nothing when the API returns "none." The site shows an "ALLOWED REACTIONS 12 / 12" pattern and sample emojis (https://useemote.com).  
- Tone control: you supply an "agent" description so reactions match the personality you want (examples on https://useemote.com).

Plain artifact you will produce:

- A server call that runs in parallel with your LLM and returns a single emoji or "none."  
- A short decision table mapping event types to allowed reactions.

Example mapping:

| Event type | Allowed reactions (starter) |
|---:|---|
| Success / win | 🎉, ❤️, 👍 |
| Question / unclear | 👀, 🤔 |
| Bad news / empathy | 😢, 🤔 |

Reference: example emojis and the allowed-reactions UI are shown on https://useemote.com.

## Before you start (time, cost, prerequisites)

Prerequisites (from https://useemote.com):

- An Emote API key. The API expects an Authorization: Bearer $EMOTE_API_KEY header.  
- A server runtime that can make outbound HTTPS calls; Emote shows server-side TypeScript and cURL examples. See https://useemote.com.  
- A secrets store or an environment variable named EMOTE_API_KEY (examples use process.env.EMOTE_API_KEY on the docs page: https://useemote.com).

Minimal checks before coding:

- Verify your runtime can reach POST https://useemote.com/v1/react.  
- Confirm EMOTE_API_KEY is readable by your server process.

Estimated work:

- Prototype: ~45 minutes.  
- Tidy integration and UI polish: ~1–2 hours.

Operational considerations (numbers to track):

- Start with a canary cohort of 5%–10% of sessions.  
- Monitor p50 < 200 ms and p95 < 800 ms for Emote calls.  
- Watch error rate thresholds: warn at ≥ 1%, consider rollback if > 5%.

## Step-by-step setup and implementation

1. Create an account and get an API key at https://useemote.com. Store it as EMOTE_API_KEY in your secret manager.  
2. Add a non-blocking HTTP call to POST https://useemote.com/v1/react while your LLM request runs. The docs advise: "Call Emote alongside your main model." (https://useemote.com)  
3. Send the minimal payload: message, agent, reactions. The response will be one emoji, a custom ID, or "none."  
4. Render the reaction only if the returned value !== "none" and keep it visually separate from the model-generated text.

Example cURL (bash):

```bash
curl -X POST https://useemote.com/v1/react \
  -H "Authorization: Bearer $EMOTE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"I finally got the job!","agent":"A thoughtful friend. Warm, genuine, and never over the top.","reactions":["❤️","🎉","👍"]}'
```

Example TypeScript snippet (server-side; adapted from https://useemote.com):

```ts
const response = await fetch("https://useemote.com/v1/react", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.EMOTE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: userMessage,
    agent: "Thoughtful — warm without overdoing it.",
    reactions: ["👍","🎉","❤️"],
  }),
});
if (!response.ok) throw new Error(`Emote: ${response.status}`);
const reaction = await response.json(); // emoji string, custom ID, or "none"
```

UI rules (keep simple):

- Render the emoji only when reaction !== "none". See https://useemote.com.  
- Do not insert the emoji into the model-generated text; treat it as an orthogonal presence signal.

Error handling guidance:

- Treat Emote failures as non-fatal: default to silence and log the error. The docs present Emote as "connected to text in, reaction out" and intended to be lightweight (https://useemote.com).

Configuration example (JSON):

```json
{
  "emote": {
    "endpoint": "https://useemote.com/v1/react",
    "envVar": "EMOTE_API_KEY",
    "allowedReactions": ["👍","🎉","❤️"]
  }
}
```

## Common problems and quick fixes

- API timeouts or network errors
  - Fix: treat as silent and log. Use a short timeout so the LLM reply is never blocked (goal: p50 < 200 ms).
- Reactions feel too frequent or tone is wrong
  - Fix: reduce allowedReactions or refine the agent description you send. The docs show agent text examples at https://useemote.com.
- UI jitter (reaction arrives after reply is visible)
  - Fix: reserve a small placeholder slot and insert the emoji when it arrives, or fade it in.

Quick troubleshooting checklist:

- [ ] Confirm EMOTE_API_KEY is present.  
- [ ] Verify endpoint reachable: POST https://useemote.com/v1/react.  
- [ ] Check logs for non-200 responses and status codes (sample error thrown: `Emote: ${response.status}`).  
- [ ] Ensure UI hides reaction for "none".

Suggested latency targets and alarms (numbers):

- p50 target: < 200 ms.  
- p95 target: < 800 ms.  
- Alert if error rate ≥ 1%; escalate if > 5%.

## First use case for a small team

Scenario: a 4-person support team wants the bot to acknowledge updates without changing reply content. See https://useemote.com for the request/response pattern.

Implementation notes for a small team:

- Start with 3 reactions (e.g., 👍, 🎉, 👀).  
- Use a single feature flag to enable Emote for 5%–10% of sessions initially.  
- Suggested roles: 1 engineer to wire the call, 1 designer for placement, 1 PM for metrics, 1 owner for the API key and rollout control (total headcount: 4).  
- Measure UX satisfaction and Emote error logs (log status, latency ms, and chosen reaction; avoid storing full messages).

Rollout suggestion: canary at 5%–10% for 7–14 days. Monitor p50/p95 latency and error rate before broadening. The docs recommend server-side integration so rollout can be controlled centrally (https://useemote.com).

## Technical notes (optional)

- API shape (per https://useemote.com): POST /v1/react with fields message, agent, reactions. Response is one emoji, a custom ID, or "none." The site emphasizes "ONE ENDPOINT. ONE REACTION."  
- Run from your server: the docs say "Run from your server" and show server-side TypeScript and cURL examples (https://useemote.com).  
- No tool calls. No generated text. Emote returns a presence signal, not model text.

Optional client config example:

```json
{
  "timeoutMs": 600,
  "maxRetries": 0,
  "logLevel": "info"
}
```

Telemetry and SLO suggestions (numbers):

- Log: status code, latency ms, and reaction chosen; do not log full user messages.  
- SLO suggestions: p50 < 200 ms, p95 < 800 ms; alert if error rate ≥ 1%; consider rollback if error rate > 5%.
- Keep retries minimal (maxRetries: 0 above) and prefer silence over repeated calls.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Development time: prototype ~45 minutes; tidy integration and basic UI polish ~1–2 hours.  
- Initial canary cohort: 5%–10% of sessions for 7–14 days.  
- Observability gates: alert if reaction error rate ≥ 1%; rollback threshold > 5% error rate or user satisfaction drops > 3 percentage points.  
- Latency goals: aim for p50 < 200 ms and p95 < 800 ms for the Emote call.  
- Retry policy hypothesis: prefer at most 1 retry; prefer silence over repeated calls.  
- Allowed reactions starter set: 3 reactions (for example: 👍, 🎉, 👀).  
- Monitoring window for canary: 7–14 days.

### Risks / Mitigations

- Risk: Reactions change user interpretation of replies.
  - Mitigation: render reactions separately and keep them visually subtle.
- Risk: Latency or errors harm UX.
  - Mitigation: use short server-side timeouts (example 600 ms), keep retry count low, and treat failures as silence.
- Risk: Privacy concerns when forwarding messages to a sidecar.
  - Mitigation: log only non-sensitive metadata (status code, latency ms, chosen reaction) and document data flow internally.

### Next steps

- Create secrets and access controls for EMOTE_API_KEY (store as EMOTE_API_KEY). See https://useemote.com for examples.  
- Implement the parallel POST https://useemote.com/v1/react call using the cURL / TypeScript examples on https://useemote.com.  
- Add a feature flag and start a canary cohort (5%–10%).  
- Build dashboards for p50/p95 latency, error rate, and a simple UX satisfaction signal.  
- After a successful canary (7–14 days), gradually expand the rollout and update the allowed-reactions map.

Final note: use the sample requests and the TypeScript and cURL examples on https://useemote.com as your canonical integration reference.
