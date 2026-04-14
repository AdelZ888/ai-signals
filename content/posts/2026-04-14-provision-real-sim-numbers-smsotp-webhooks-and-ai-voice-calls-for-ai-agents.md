---
title: "Provision real SIM numbers, SMS/OTP webhooks, and AI voice calls for AI agents"
date: "2026-04-14"
excerpt: "Step-by-step guide to give each AI agent its own real phone number: provision a SIM via API, receive SMS/OTP at a webhook, and run AI voice calls that return transcripts."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-14-provision-real-sim-numbers-smsotp-webhooks-and-ai-voice-calls-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "agentcall"
  - "ai-agents"
  - "telephony"
  - "sms"
  - "otp"
  - "voice"
  - "webhooks"
  - "api"
sources:
  - "https://agentcall.co"
---

## TL;DR in plain English

- Give each AI agent a real phone number it controls. That number can receive SMS, one-time passwords (OTPs), and voice calls. See AgentCall for the same flow: https://agentcall.co.
- Why this helps: real SIM (subscriber identity module) numbers reduce VoIP (Voice over Internet Protocol) rejections and let agents place AI-driven calls that return transcripts.
- Do this now: provision one number, point it at a webhook, and wire the webhook into your agent. Aim for a 90-minute prototype. Run it for 2 weeks before scaling.

Quick bullets (read in ~30 seconds):
- Three steps to a demo: provision → connect webhook → receive events. The provider describes the same pattern at https://agentcall.co.
- Start with 1 number per market and a single webhook for testing.
- Gate rollout with "agent isolation" (one number per agent) before production.

Concrete example (short scenario):
- A signup flow: a user requests a verification code. Your agent requests a phone number from the API, the number receives the SMS code, your webhook parses the OTP and forwards it to the agent, and the agent completes the signup automatically.

Methodology note: this document follows the feature set shown on the provider site: https://agentcall.co.

## What you will build and why it helps

You will build a small integration that demonstrates three capabilities the provider lists: 1) provision a real SIM number by API (application programming interface), 2) receive SMS and verification-code webhooks, and 3) make AI voice calls that return transcripts. The provider shows a three-step flow: provision, point the agent to the number with an API key, and receive events at a webhook — see https://agentcall.co.

Concrete artifacts you will produce:
- A provisioning script (bash) to request numbers via API.
- A webhook listener that accepts sms_received, code_webhook, and call_transcript events.
- A small database: agents table with one row per agent mapping agent_id → phone_number, plus a transcripts table.

Why it helps small teams:
- Removes manual OTP (one-time password) collection and manual dialing.
- Real SIM numbers pass stricter verification checks than many VoIP setups.
- A single developer can produce a working prototype in ~90 minutes and iterate after observing traffic for 2 weeks.

### Plain-language explanation

Think of this as giving each AI agent its own real phone line. The agent uses the line to get codes (SMS), to answer or place calls, and to receive transcripts of conversations. A webhook is a URL that the provider calls to tell your app when new messages or transcripts arrive. Keep the webhook fast and simple; offload heavier work to background workers.

## Before you start (time, cost, prerequisites)

- Estimated dev prototype time: 90 minutes.
- Short test window: run the prototype for 2 weeks to see operational failures and edge cases.
- Check pricing and billing on the provider site before you provision: https://agentcall.co/pricing or https://agentcall.co.

Prerequisites:
- An AgentCall account and an API key. Store it as AGENTCALL_API_KEY in your secrets manager.
- A public HTTPS webhook endpoint with a valid TLS (Transport Layer Security) certificate.
- An AI model backend or transcript post-processor if you plan to analyze or store transcripts.
- A secrets store (Vault, AWS Secrets Manager, etc.) for rotation and least privilege.

Minimal preflight checklist:
- [ ] API key issued and stored in vault
- [ ] Webhook TLS cert valid and reachable
- [ ] Firewall allows provider pings (or use NGROK for dev)
- [ ] Logging and alerting for errors and delivery failures

Short methodology: claims here align with the features listed at https://agentcall.co.

## Step-by-step setup and implementation

1) Create account and store API key

- Get an API key from https://agentcall.co and store it as AGENTCALL_API_KEY in your secrets store.

2) Provision a number via API (example)

- AgentCall advertises provisioning a real SIM number in seconds. Choose country, number type, and capabilities when you request a number: https://agentcall.co.

Example curl to provision a number (replace placeholders):

```bash
curl -X POST "https://api.agentcall.co/v1/numbers" \
  -H "Authorization: Bearer $AGENTCALL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "GB",
    "type": "mobile",
    "capabilities": ["sms","voice"],
    "webhook_url": "https://your.service/webhook",
    "agent_id": "onboarding-agent-01"
  }'
```

3) Implement a webhook receiver

- Required behavior:
  - Respond 200 OK on receipt. Aim to send 200 within ~200 ms where possible.
  - Parse events like sms_received and call_transcript.
  - Validate any signature header the provider sends.

Example webhook JSON you might receive (fields noted by the provider):

```json
{
  "event": "sms_received",
  "from": "+447700900123",
  "to": "+441234567890",
  "body": "Your code is 482903",
  "timestamp_ms": 1713052800000
}
```

- Extract OTPs with a conservative regex (e.g., first 4–8 digit group). Keep parsing simple and idempotent.

4) Wire the webhook to your agent

- When sms_received arrives, parse the OTP and enqueue it for your agent processor (SQS, RabbitMQ, or an internal queue).
- Keep the webhook handler quick (< 60 seconds for synchronous work). Offload heavy processing to background workers.

5) Make AI voice calls

- Request a call with a chosen voice and a short system prompt. The provider supports multiple voices and returns a transcript on completion (see https://agentcall.co).

Example outbound-call request body (JSON shape):

```json
{
  "from": "+441234567890",
  "to": "+447700900456",
  "voice": "Alloy",
  "system_prompt": "You are a polite assistant confirming onboarding.",
  "record_transcript": true,
  "timeout_seconds": 60
}
```

- On completion you will receive a call_transcript event. Store transcripts for troubleshooting and compliance.

6) Agent isolation and mapping

- Assign one number per agent in your database. This prevents a compromise from cascading to other agents. The provider documents "Agent Isolation": each agent gets its own number — see https://agentcall.co.

7) Rollout and canary plan

- Stages: dev → staging → prod. Use a feature flag to enable outbound calls per agent.
- Canary: route a small percent of traffic (for example, 5%) to new numbers for 24 hours. Monitor errors and throughput.
- Rollback: set agent mapping enabled=false and rotate the agent's API key.

Operational thresholds to monitor:
- Webhook latency: alert if median > 500 ms over 5 minutes.
- Webhook success: require 200 OK for 99% of deliveries.
- SMS failure rate: alert if > 2% over 1 hour.
- Call error rate: alert if > 5% over 1 hour.
- Canary window: 24 hours and 5% traffic.
- Max concurrent webhook handlers: 50.
- Prototype runtime to observe issues: 2 weeks.

## Common problems and quick fixes

- Webhook delivery fails:
  - Check TLS certificate chain and DNS. Use NGROK for dev. Ensure endpoint returns 200 within ~200 ms.
- Missing OTPs:
  - Confirm the number has SMS capability and that the region supports SMS for that number type.
- Calls won't connect:
  - Confirm the number is a real SIM, not VoIP. AgentCall advertises "Real SIM Numbers" that pass strict platform checks: https://agentcall.co.
- Low transcript quality:
  - Adjust the system prompt, test a different voice, and verify audio codec and SNR (signal-to-noise ratio).

Quick debug checklist:
- [ ] Confirm number has SMS and voice capabilities
- [ ] Verify webhook URL returns 200 OK and is reachable
- [ ] Check provider dashboard for delivery errors at least every 15 minutes
- [ ] Rotate API key if you suspect compromise

## First use case for a small team

Use case: a two-person startup automates sign-up verification and sends outbound confirmation calls. This uses one number per market and one webhook service.

Minimal setup for small teams (start):
- Provision 1 regional number per market via API (see https://agentcall.co).
- Run a single webhook function that forwards events into your app and queue.
- Start with 1 number total. Run the prototype for 2 weeks and measure.

Lightweight rollout checklist:
- [ ] Dev API key and test number
- [ ] Logging dashboard with SMS and call counts (daily and 15-min windows)
- [ ] Alerts: SMS failure > 2% over 1 hour; call error > 5% over 1 hour
- [ ] Rollback: disable outbound calls via feature flag

Budget & governance tip: add numbers only when you exceed ~100 verifications/day per region or when latency/throughput requires more capacity.

Reference: the provider home page and feature list: https://agentcall.co.

## Technical notes (optional)

Real SIM vs VoIP
- AgentCall highlights real SIM numbers that pass strict platform verification. That reduces rejections in many verification flows: https://agentcall.co.

Webhook signing and concurrency
- Validate provider signatures if provided and rotate secrets regularly.
- Keep webhook handlers idempotent. Use a max_concurrent_webhooks limit (example: 50) and offload long work.

Voices quick reference (from provider materials):

| Voice | Tone | Best for |
|---|---:|---|
| Alloy | Neutral & Balanced | General purpose |
| Ash | Warm & Conversational | Customer service |
| Ballad | Expressive & Melodic | Engaging conversations |
| Coral | Clear & Professional | B2B calls |
| Echo | Resonant & Deep | Formal inquiries |
| Sage | Calm & Authoritative | Healthcare, finance |
| Shimmer | Bright & Energetic | Sales/outreach |
| Verse | Smooth & Articulate | Executive |

Example config (yaml):

```yaml
webhook_timeout_seconds: 60
max_concurrent_webhooks: 50
agent_isolation_enabled: true
secrets_store: 'vault://prod/agentcall'
sms_failure_alert_pct: 2
call_error_alert_pct: 5
```

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: the provider supplies real SIM numbers and webhook events for SMS and call transcripts as described at https://agentcall.co.
- Hypothesis: a 1-number prototype observed for 2 weeks will reveal >90% of small-team operational issues.

### Risks / Mitigations

- Risk: leaked API key or number compromise. Mitigation: rotate keys, disable agent mapping, and enforce least privilege.
- Risk: regulatory requirements for call recording in certain countries. Mitigation: capture in-call consent and apply region-specific retention rules.
- Risk: webhook overload causing missed events. Mitigation: cap concurrent handlers (e.g., 50), use durable queues, and autoscale workers.

### Next steps

- Move API keys into a secrets manager and enforce least privilege (rotate every 90 days).
- Create dashboards for webhook latency, SMS failure rate, and call error rate. Set alerts: 2% SMS failures over 1 hour; 5% call errors over 1 hour.
- Run a canary: 5% of traffic for 24 hours, then extend progressively to 25% and 100%.
- Simulate an incident: rotate an agent key, disable the agent mapping, and validate rollback within 10 minutes.

More details and the provider home page: https://agentcall.co.
