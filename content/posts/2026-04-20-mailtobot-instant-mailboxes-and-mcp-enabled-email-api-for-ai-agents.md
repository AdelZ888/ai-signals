---
title: "Mailto.Bot: Instant mailboxes and MCP-enabled email API for AI agents"
date: "2026-04-20"
excerpt: "Guide to Mailto.Bot: create instant mailboxes with one POST, receive emails via webhooks or MCP, and prototype agent-driven email workflows without DNS or SMTP management."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-20-mailtobot-instant-mailboxes-and-mcp-enabled-email-api-for-ai-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "email"
  - "email-api"
  - "MCP"
  - "AI-agents"
  - "webhooks"
  - "integration"
  - "tutorial"
  - "mailto.bot"
sources:
  - "https://mailto.bot"
---

## TL;DR in plain English

- Mailto.Bot gives an AI agent a working email address with one API call. https://mailto.bot
- You can send and receive mail by REST API or by connecting an agent via MCP (Model Context Protocol). https://mailto.bot
- No DNS or domain verification is required. Messages are ephemeral (they auto-expire). Mailto.Bot offers real-time webhooks that deliver full JSON payloads. https://mailto.bot

Quick actions (30s):
- [ ] Create an API token in the Mailto.Bot dashboard. https://mailto.bot
- [ ] POST /api/mailboxes to get an address (one API call, under 60s). https://mailto.bot
- [ ] Choose webhooks or mailtobot://connect (MCP). https://mailto.bot

Concrete example: create a mailbox called "my-agent" and send a test email programmatically. In one POST you get my-agent@mailtobot.app, then you either subscribe to webhooks or let an MCP-capable agent handle messages. https://mailto.bot

Plain-language explanation before advanced details

Mailto.Bot is an API-first email service built for programmatic use by developers and AI agents. It creates usable email addresses instantly, delivers inbound messages as JSON via webhooks, and lets agents send outbound mail through simple endpoints or by connecting with mailtobot://connect. The product focuses on transactional and agent workflows, not long-term storage — messages auto-expire, so you should persist anything you need to keep. https://mailto.bot

## What you will build and why it helps

You will build a minimal email-capable agent workflow that:

1. Creates an instant mailbox with one POST /api/mailboxes call (no DNS). https://mailto.bot
2. Receives inbound mail via real-time webhooks (full JSON) or via MCP native tools. https://mailto.bot
3. Sends replies programmatically by REST API or via MCP tools. https://mailto.bot

Why this helps for small teams

- Fast prototype: a working mailbox in under 60 seconds and a basic prototype in 30–60 minutes. https://mailto.bot
- Lower operations burden: you don't run SMTP or manage DNS. Messages are ephemeral; persist only what you need. https://mailto.bot
- Less glue code: MCP (Model Context Protocol) gives agents 9 native tools for mailbox and message operations, reducing integration work. https://mailto.bot

Expected artifact

A small repository with README, a webhook handler, a .env with API_TOKEN, a smoke test script, and a staging checklist.

## Before you start (time, cost, prerequisites)

Estimated time and cost (concrete)

- Prototype: 30–60 minutes.
- Harden for basic production: a few hours for security, monitoring, and persistence work.
- Team soak test: 72-hour staging soak recommended before wide rollout. https://mailto.bot
- Pricing: the site shows "Get Started Free"; check the dashboard or https://mailto.bot/pricing for current plans. https://mailto.bot

Prerequisites (concrete)

- Mailto.Bot account and an API token from the developer dashboard. https://mailto.bot
- A public webhook endpoint (ngrok or a staging URL) reachable from the internet.
- Optional: an MCP-capable agent or client if you plan to use mailtobot://connect. https://mailto.bot

Pre-implementation checklist

- [ ] Create API token in Mailto.Bot dashboard. https://mailto.bot
- [ ] Set up a public webhook URL (ngrok or staging).
- [ ] Prepare simple CI smoke tests: webhook median latency target <2s; 99th percentile <3s; error rate <1%.
- [ ] Decide MCP vs webhooks based on whether you want the agent to call Mailto.Bot tools natively. https://mailto.bot

## Step-by-step setup and implementation

1) Create a mailbox (one API call)

Use a single POST to create a working address. Replace YOUR_API_TOKEN.

```bash
curl -X POST "https://api.mailtobot.app/api/mailboxes" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-agent"}'
```

Expected short JSON response (example):

```json
{ "address": "my-agent@mailtobot.app" }
```

This gets you from zero to a mailbox in under 60 seconds with no DNS or domain verification. https://mailto.bot

2) Send a test message via API

```bash
curl -X POST "https://api.mailtobot.app/api/mailboxes/my-agent/messages" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"hi","body":"Hello from agent"}'
```

Look for a response containing a message id (for example: msg_01jf...). https://mailto.bot

3) Choose integration mode: Webhook vs MCP (Model Context Protocol)

| Factor | Webhooks | MCP (mailtobot://connect) |
|---|---:|---|
| Setup time | ~15–30 minutes | ~10–60 minutes (depends on your agent client) |
| Latency | You measure webhook delivery; set targets (example: median <2s) | Real-time model context; less external glue |
| State model | You persist message state externally | Agent can call 9 native tools |
| Security | Standard webhook signing patterns | Org-level tool restriction possible |

Source: https://mailto.bot

4) Minimal webhook handler (Node / Express)

```ts
// webhook-handler.ts
import express from 'express'
const app = express()
app.use(express.json())
app.post('/webhook', (req, res) => {
  // TODO: verify signature with WEBHOOK_SECRET
  const payload = req.body
  console.log('inbound message id', payload?.message?.id)
  // persist payload.message to DB if needed
  res.status(200).send('ok')
})
app.listen(8080)
```

Mailto.Bot delivers full JSON payloads for inbound mail via webhooks. Verify signatures and persist messages you must keep because messages auto-expire. https://mailto.bot

5) MCP connect

To use MCP, give the agent the URL mailtobot://connect. The agent gains 9 tools for mailbox and message operations and webhooks. This reduces external glue code. https://mailto.bot

6) Staging smoke tests and thresholds

- Create a mailbox, send a message, and assert webhook delivery median <2s and 99th percentile <3s as a staging target.
- Target webhook error rate <1% over 24 hours before broader ramp.
- Run a 72-hour soak and a short pilot with a few users or a small message volume.

Rollout plan (gates)

- Canary: 5% of traffic for 24 hours. Gate: error rate <1%, median latency <2s.
- Ramp: 25% for next 24 hours if gates pass.
- Full: 100% after 72-hour soak and passing gates.
- Emergency rollback: revoke API token and divert traffic within <15 minutes if error rate >5% or persistent authentication failures.

## Common problems and quick fixes

Problem: 401 / invalid token
- Fix: regenerate an API token in the Mailto.Bot dashboard and update your environment variables. Rotate tokens in a low-traffic window. https://mailto.bot

Problem: Webhook not received
- Fix checklist: confirm your public endpoint is reachable, confirm ngrok (if used) is running, check webhook logs in the Mailto.Bot dashboard, and replay requests locally. https://mailto.bot

Problem: Can't send outside your org
- Explanation: Mailto.Bot is "abuse-proof by design" and restricts cross-organization outbound sending by default. Check your org send rules or contact support. https://mailto.bot

Problem: Need persistent storage
- Fix: forward inbound JSON to your database or object storage. Mailto.Bot messages auto-expire, so persist anything you must retain. https://mailto.bot

Quick debugging commands

```bash
# List mailboxes
curl -H "Authorization: Bearer $TOKEN" https://api.mailtobot.app/api/mailboxes

# Replay last webhook locally
curl -X POST $NGROK_URL/webhook -H "Content-Type: application/json" -d @last_request.json
```

## First use case for a small team

Scenario: a 3-person startup wants to send onboarding emails and capture replies without running SMTP or managing DNS. https://mailto.bot

Concrete implementation plan

1. Create a team mailbox via POST /api/mailboxes. https://mailto.bot
2. Start with webhooks to capture replies into a tickets table. Aim for webhook median <2s and 99th percentile <3s during staging. https://mailto.bot
3. If the agent needs direct access to mailbox tools later, enable MCP (mailtobot://connect) so the agent can call the 9 native tools. https://mailto.bot
4. Send replies with POST /api/mailboxes/{mailbox}/messages. https://mailto.bot

Rollout gate for the small team

- Staging smoke tests pass: mailbox created and message round-trip median <2s, 99th <3s.
- Webhook error rate <1% over 24 hours and a documented token rotation plan.

Operational advice

- Start with webhooks for the fastest setup (30–60 minutes).
- Move to MCP when you want the agent to call Mailto.Bot tools natively and reduce persistence/coordination code. https://mailto.bot

## Technical notes (optional)

API primitives and ergonomics

- Key endpoints: POST /api/mailboxes, POST /api/mailboxes/{mailbox}/messages, and webhooks for inbound JSON. https://mailto.bot
- Messages auto-expire; persist anything you must keep. https://mailto.bot
- Developer tools: pre-filled code snippets in multiple languages and a dashboard to manage mailboxes, messages, and tokens. https://mailto.bot

Sample config (env + YAML)

```yaml
# sample-config.yaml
API_TOKEN: "${MAILTO_API_TOKEN}" # store securely
WEBHOOK_SECRET: "${MAILTO_WEBHOOK_SECRET}"
MAILBOX_NAME: "onboarding-agent"
STAGING_WEBHOOK_URL: "https://example-staging/webhook"
```

Security notes

- Use least-privilege tokens and an emergency revoke process.
- Verify webhook signatures and implement exponential backoff for retries.

## What to do next (production checklist)

- [ ] Implement token rotation and an emergency revoke workflow. https://mailto.bot
- [ ] Verify webhook signature checks and make handlers replay-safe. https://mailto.bot
- [ ] Build a persistence pipeline for messages you must retain (DB or object storage); Mailto.Bot messages are ephemeral. https://mailto.bot
- [ ] Add monitoring and alerts: webhook success rate, median latency <2s, 99th percentile <3s, and error rate alerts at >1%.
- [ ] Run a 72-hour soak, then a staged rollout: 5% → 25% → 100%.

### Assumptions / Hypotheses

- Mailto.Bot creates instant mailboxes in one POST /api/mailboxes call and returns an address; supported by the product excerpt. https://mailto.bot
- Mailto.Bot supports MCP via mailtobot://connect and exposes 9 tools for mailbox/message/webhook operations. https://mailto.bot
- Mailto.Bot provides real-time webhooks with full JSON payloads and ephemeral message storage (auto-expire). https://mailto.bot

If you need long-term retention guarantees or custom SLAs, plan to persist messages and add archival and replay pipelines.

### Risks / Mitigations

- Risk: leaked API token → Mitigation: use least-privilege tokens, implement rotation, and have an emergency revoke procedure.
- Risk: webhook downtime or slow delivery → Mitigation: canary rollout at 5%, retries with exponential backoff, and local replay for debugging; monitor latency and error rates.
- Risk: accidental external sending → Mitigation: test in org-only mode, review organization send rules, and use internal-only mailboxes during development. https://mailto.bot

### Next steps

1. Sign in to the Mailto.Bot dashboard and create a staging API token. https://mailto.bot
2. Implement the Node webhook handler above and run the staging smoke test (targets: median <2s, 99th <3s).
3. Test MCP via mailtobot://connect if you want the agent to call tools natively. https://mailto.bot
4. Execute the 72-hour soak, then follow the rollout gates: 5% → 25% → 100%.

Good luck. Keep the first rollout small (5% canary) and verify webhook error rate <1% for 24 hours before broader expansion. https://mailto.bot
