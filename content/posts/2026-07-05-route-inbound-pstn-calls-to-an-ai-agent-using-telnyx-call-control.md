---
title: "Route Inbound PSTN Calls to an AI Agent Using Telnyx Call Control"
date: "2026-07-05"
excerpt: "Follow a webhook-driven Call Control loop to answer inbound Telnyx numbers, insert ASR/AI inference, then speak or hang up—includes a Flask sample and minimal answer→speak→hangup flow."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-05-route-inbound-pstn-calls-to-an-ai-agent-using-telnyx-call-control.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "telnyx"
  - "voice-ai"
  - "call-control"
  - "webhook"
  - "python"
  - "flask"
  - "pstn"
  - "tts"
sources:
  - "https://telnyx.com/resources/route-phone-calls-ai-agent"
---

## TL;DR in plain English

- Telnyx lets you route inbound PSTN/SIP phone calls into an AI-driven dialog loop using webhook-driven Call Control. Telnyx handles carrier, numbers (available in 140+ countries), media transport (WebSocket/SIP/PSTN) and webhook delivery; your application receives Telnyx webhooks, uses the call_control_id to send Call Control actions (answer, speak, hangup), and runs AI inference where you choose. See the Telnyx guide: https://telnyx.com/resources/route-phone-calls-ai-agent

- Quick path: provision a Telnyx Phone Number and a Call Control Application, expose a public HTTPS webhook, run the provided Python Flask sample to observe the webhook loop, then insert your ASR/NLU/TTS or streaming inference in the event loop. See the Telnyx example: https://telnyx.com/resources/route-phone-calls-ai-agent

- Quick checklist (scan ~30–60s):
  - [ ] inbound call to your Telnyx number appears in console/delivery logs
  - [ ] your webhook receives call.initiated events
  - [ ] your app posts an "answer" action using call_control_id and can send "speak" (TTS)
  - [ ] dialog ends with "hangup" or transfer

Methodology note: statements are grounded in the Telnyx route-phone-calls-to-ai-agent guide (link above). Only implementation details that fit the Telnyx flow are included.   

## What you will build and why it helps

You will build a webhook-driven Call Control loop that inserts AI inference into Telnyx’s voice event flow. Telnyx delivers call events (webhooks) to your app; your app uses the call_control_id from those webhooks to instruct Telnyx to answer, speak (TTS), transfer, or hang up. The Telnyx article and sample explain the webhook loop and example actions: https://telnyx.com/resources/route-phone-calls-ai-agent

Responsibilities (concise):

| Component | Primary responsibility | Telnyx doc reference |
|---|---:|---|
| Telnyx | Carrier, phone numbers (140+ countries), PSTN/SIP/WebSocket media, webhook delivery | https://telnyx.com/resources/route-phone-calls-ai-agent |
| Your app | Receive webhooks, hold call state, run business rules, call inference | https://telnyx.com/resources/route-phone-calls-ai-agent |
| AI agent | ASR / NLU / response selection, return text for TTS or routing decisions | https://telnyx.com/resources/route-phone-calls-ai-agent |

Why this split helps:
- Avoid running telephony trunks and media routing.
- Iterate dialog logic independently of the carrier layer.
- Choose either simple post-answer ASR or lower-latency streaming (WebSocket) depending on UX needs. See Telnyx options: https://telnyx.com/resources/route-phone-calls-ai-agent

## Before you start (time, cost, prerequisites)

Essential prerequisites (from the Telnyx guide):

- Telnyx account and a Telnyx Phone Number (Telnyx lists availability in 140+ countries). https://telnyx.com/resources/route-phone-calls-ai-agent
- A Call Control Application in the Telnyx console, configured to point callbacks to your webhook URL. https://telnyx.com/resources/route-phone-calls-ai-agent
- A public HTTPS webhook URL reachable from Telnyx (ngrok is commonly used for local testing). https://telnyx.com/resources/route-phone-calls-ai-agent
- A small web app to receive JSON webhooks; the Telnyx sample uses Python + Flask. https://telnyx.com/resources/route-phone-calls-ai-agent

Latency note from Telnyx: Telnyx Voice AI advertises sub-500 ms latency for reduced round trips; use streaming WebSocket if you need lower interactive latency. https://telnyx.com/resources/route-phone-calls-ai-agent

## Step-by-step setup and implementation

1) Protect secrets and create minimal config (example):

```yaml
# config.yml (example - do not commit)
TELNYX_API_KEY: "REPLACE_WITH_KEY"
CALL_CONTROL_APP_ID: "REPLACE_WITH_APP_ID"
WEBHOOK_URL: "https://your-host.example.com/webhook"
```

2) Provision Telnyx resources

- In the Telnyx console, buy a phone number and create a Call Control Application; point callbacks to your WEBHOOK_URL. See: https://telnyx.com/resources/route-phone-calls-ai-agent

3) Run the sample webhook app

- Use the Telnyx sample (the guide references a Python Flask example) to observe the call event sequence: call.initiated → answer → call.answered → speak/transfer → hangup. https://telnyx.com/resources/route-phone-calls-ai-agent

4) Implement the minimal Call Control loop (core actions)

- On call.initiated: extract call_control_id from webhook JSON and POST an "answer" action to Telnyx Calls Actions endpoint.
- After you receive call.answered, do either:
  - post-answer ASR (simpler): capture audio, run ASR → NLU → send a Telnyx "speak" action with the TTS text; or
  - streaming WebSocket (lower latency): stream media for partial ASR/partial-turn inference, then send "speak" or other actions. The Telnyx guide discusses WebSocket and media options: https://telnyx.com/resources/route-phone-calls-ai-agent
- When done, send "hangup" or "transfer".

5) Insert AI inference

- Map AI outputs to actions: generate TTS text for "speak", or return a transfer decision. Use confidence thresholds in your app logic to trigger escalations.

6) Validate with a live PSTN call

- Call your Telnyx number and confirm webhook sequence and delivery logs in the Telnyx console. https://telnyx.com/resources/route-phone-calls-ai-agent

Example minimal curl to answer a call (as shown by the sample path):

```bash
curl -X POST "https://api.telnyx.com/v2/calls/{call_control_id}/actions" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "answer"}'
```

## Common problems and quick fixes

- Webhooks not arriving
  - Confirm webhook URL is publicly reachable and check Telnyx webhook delivery logs in the console. https://telnyx.com/resources/route-phone-calls-ai-agent

- Invalid call_control_id or authorization errors
  - Use the call_control_id exactly from the webhook payload and verify API key / app scopes.

- Poor audio quality or slow replies
  - Verify codec/sample rates, enable WebSocket streaming for lower latency, or consider Telnyx Voice AI for reduced round trips (sub-500 ms is cited). https://telnyx.com/resources/route-phone-calls-ai-agent

- Rate limits / concurrency issues
  - Add retry/backoff logic and test expected concurrent call volumes in staging.

Sample JSON wiring/config (example):

```json
{
  "telnyx_api_key": "REPLACE",
  "call_control_app_id": "REPLACE",
  "webhook_endpoint": "https://your-host.example.com/webhook"
}
```

## First use case for a small team

Scenario: a solo founder or two-person team wants an AI first-responder that handles simple requests and escalates to a human when confidence is low. The Telnyx sample demonstrates the flow and what to expect: https://telnyx.com/resources/route-phone-calls-ai-agent

Concrete steps for a small team:
1) Provision and validate the path
- Buy a Telnyx number and create a Call Control Application; point it at a reachable HTTPS URL and confirm you receive call.initiated webhooks. https://telnyx.com/resources/route-phone-calls-ai-agent

2) Run the provided sample
- Use the Python Flask example referenced in the Telnyx guide to observe answer → speak → hangup on a real PSTN call. https://telnyx.com/resources/route-phone-calls-ai-agent

3) Gate AI replies and collect feedback
- Add a feature flag and route low-confidence decisions to a human fallback; log transcripts and confidence scores for review.

4) Iterate on a small intent set first and expand once resolution metrics are acceptable.

## Technical notes (optional)

- Media & transport: Telnyx supports WebSocket media, SIP, and PSTN; for low-latency streaming and partial ASR use WebSocket as described in the Telnyx guide. https://telnyx.com/resources/route-phone-calls-ai-agent

- Inference placement options:
  - Post-answer ASR: capture audio after call.answered → ASR → NLU → speak (simpler).
  - Streaming/real-time: use WebSocket to enable partial-turn inference and lower round trips.

- Telnyx Voice AI: Telnyx calls out sub-500 ms latency and co-located infrastructure for managed voice AI when lower round trips are required. https://telnyx.com/resources/route-phone-calls-ai-agent

## What to do next (production checklist)

### Assumptions / Hypotheses

- Prototype time: 60–120 minutes to build a basic proof-of-concept and validate webhook flow in staging.
- Prototype cost: expect $1–$20 total during initial test calls (number + PSTN test minutes), depending on geo and minutes used.
- Canary percentage: start with 1–5% of inbound traffic routed to the AI agent during early rollout.
- Pilot intent set: start with 3–5 high-value intents to reduce false positives.
- Latency target: aim for median agent response <500 ms for conversational feel; Telnyx advertises sub-500 ms for Voice AI. https://telnyx.com/resources/route-phone-calls-ai-agent
- Retry/backoff policy: start with 3 retries and exponential backoff up to 30s for transient webhook/API errors.
- Concurrency target for pilot: validate at 10–50 concurrent calls before scaling.

### Risks / Mitigations

- Risk: webhook delivery failures or delays.
  - Mitigation: monitor Telnyx webhook logs, alert on missed sequences, and implement retries with idempotency.

- Risk: poor latency or bad UX on high concurrency.
  - Mitigation: enable WebSocket streaming or use Telnyx Voice AI, measure end-to-end latency, and run a canary.

- Risk: incorrect AI escalations.
  - Mitigation: start with narrow intent set, use confidence thresholds, and keep human fallback behind a feature flag.

- Risk: leaked credentials or mis-scoped keys.
  - Mitigation: store keys in a secrets manager and rotate regularly.

### Next steps

- Move API keys to a secrets manager and restrict scopes.
  - [ ] secrets manager configured
  - [ ] API keys rotated and scoped

- Add observability: webhook delivery metrics, agent latency histograms, and error dashboards.
  - [ ] dashboards created
  - [ ] alerts for SLA breaches

- Run a controlled canary with rollback plan (feature flag + human fallback).
  - [ ] canary launched (1–5% traffic)
  - [ ] rollback tested

- Legal & compliance: confirm consent and recording policies before enabling call recording at scale.

Quick launch checklist (final):
- [ ] Provision Telnyx number and Call Control Application in console. https://telnyx.com/resources/route-phone-calls-ai-agent
- [ ] Webhook reachable and validated with Telnyx delivery logs.
- [ ] Basic answer → speak → hangup loop implemented and tested with a real PSTN call.
- [ ] AI inference wired and gated behind a feature flag.
- [ ] Canary plan and rollback tested.

For the canonical Telnyx example and the exact webhook loop, refer to: https://telnyx.com/resources/route-phone-calls-ai-agent
