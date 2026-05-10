---
title: "Vennio API v1.4.0 — implement availability queries, direct bookings and webhooks for apps and AI agents"
date: "2026-05-10"
excerpt: "Use Vennio API v1.4.0 to query multi-calendar availability, create bookings (including Stripe-paid flows), and handle booking.created webhooks—get a working flow in ~60–90 minutes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-10-vennio-api-v140-implement-availability-queries-direct-bookings-and-webhooks-for-apps-and-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Vennio"
  - "scheduling"
  - "calendar"
  - "API"
  - "webhooks"
  - "Stripe"
  - "MCP"
  - "integrations"
sources:
  - "https://docs.vennio.app"
---

## TL;DR in plain English

- Vennio is scheduling infrastructure you call from your app or an AI agent via a REST API. See https://docs.vennio.app.  
- Stable API: v1.4.0. Typical booking flow: 3 API calls (GET /v1/availability/slots, present slots, POST /v1/bookings). The API emits booking.created webhooks after a booking. See https://docs.vennio.app.  
- It handles Google and Microsoft 365 calendar providers, conflict detection, confirmation emails, CRM sync, webhooks, and paid booking flows via Stripe. See https://docs.vennio.app.  

Quick practical starting thresholds: present 3 candidate slots, use a 7-day window, 30-minute durations, and expect a demo in 60–90 minutes and 3–8 hours for production hardening. Aim for booking.created delivery within 30 seconds for smoke tests.  

One-line methodology: grounded in the Vennio API docs at https://docs.vennio.app.

## What you will build and why it helps

You will build a single scheduling endpoint that:

- Calls GET /v1/availability/slots to find open times for N participants across time zones. See https://docs.vennio.app.  
- Returns up to 3 candidate slots to the chooser (UI or agent).  
- Calls POST /v1/bookings to create the booking; handle booking.created webhooks. See https://docs.vennio.app.

Why this helps (decision frame):

| Option | When to use | Pros | Cons |
|---|---:|---|---|
| Venn Links (shareable page) | Public self-serve booking | Fast to deploy; no UI work | Less control over closed workflows |
| POST /v1/bookings (direct) | App-driven or agent-driven bookings | Full control; immediate booking + confirmations | Requires capturing consent and participants |
| Paid bookings (Stripe) | Paid sessions | Collect payment before confirm; returns checkout_url | Requires Stripe connect and webhook reconciliation |

Vennio reduces provider-specific plumbing (Google/Microsoft), handles conflict checks and confirmation emails, and provides webhook events for automation. See https://docs.vennio.app.

## Before you start (time, cost, prerequisites)

Estimated effort and numeric thresholds:

- Demo: 60–90 minutes (1–1.5 hours).  
- Production hardening: 3–8 hours.  
- Acceptance tests: 5 successful internal bookings.  
- Canary rollout: start with ~5% of users or 5 users for 48 hours.  
- Key rotation cadence recommendation: 90 days.  

Prerequisites:

- VENNIO_API_KEY from the Vennio dashboard; store in your secrets manager. See https://docs.vennio.app.  
- Public HTTPS webhook URL reachable by Vennio (for dev: use ngrok exposing port 3001). See https://docs.vennio.app.  
- At least one Google or Microsoft 365 test calendar connected for consent.  
- Stripe account if you need paid bookings (paid flows return pending_payment and a checkout_url and confirm after Stripe Checkout). See https://docs.vennio.app.

Operational thresholds to set before go-live:

- Alert if webhook failure rate > 5% over 5 minutes.  
- Alert if booking creation latency > 2 seconds.  
- Acceptance SLA: booking.created < 30 seconds for smoke tests.

## Step-by-step setup and implementation

1) Obtain credentials and config

- Create an API key in the Vennio dashboard and set VENNIO_API_KEY. See https://docs.vennio.app.

Example env (store in secrets manager):

```json
{
  "VENNIO_API_KEY": "sk_test_xxx",
  "WEBHOOK_URL": "https://yourapp.example.com/webhooks/vennio",
  "BASE_URL": "https://api.vennio.app"
}
```

2) Run local dev and expose webhooks

- Vennio documents a local base URL and a sample run command (run: cd api && node server.js) and local port 3001. Use ngrok to expose that port. See https://docs.vennio.app.

```bash
# start local server (example from docs)
cd api && node server.js
# expose local port 3001 for webhook testing
ngrok http 3001
```

3) Connect calendars and capture consent

- Implement the consent/connect flow so Vennio can access Google or Microsoft 365 calendars on behalf of users. Persist consent IDs for future queries. See https://docs.vennio.app.

4) Query availability

- Call GET /v1/availability/slots with participants, from/to window, and duration (minutes). Example: 30-minute slots over a 7-day window. The API returns structured slots and natural-language descriptions. See https://docs.vennio.app.

Example curl (30-minute duration, seven-day window):

```bash
curl -H "Authorization: Bearer $VENNIO_API_KEY" \
  "https://api.vennio.app/v1/availability/slots?from=2026-05-11T00:00:00Z&to=2026-05-18T00:00:00Z&duration=30"
```

5) Present and select slots

- Return up to 3 options. Show each option in participant local time and include UTC timestamps for auditing. Use the API's natural-language descriptions if helpful. See https://docs.vennio.app.

6) Create the booking

- POST /v1/bookings with the chosen slot and participants. Paid bookings may return pending_payment and a checkout_url; confirmation happens after Stripe Checkout completes. See https://docs.vennio.app.

Example booking payload:

```json
{
  "participants": ["user:alice@example.com","user:bob@example.com"],
  "start": "2026-05-15T14:00:00Z",
  "end": "2026-05-15T14:30:00Z",
  "title": "Interview: Backend Engineer"
}
```

7) Handle webhooks

- Implement handlers for booking.created, booking.cancelled, and consent.changed. Persist booking records and CRM IDs; fire downstream automation. See https://docs.vennio.app.

8) End-to-end testing

- Verify events appear on both calendars and confirmation emails are sent. Target: 5 acceptance bookings and booking.created within 30 seconds for smoke tests.

## Common problems and quick fixes

Fast troubleshooting (all anchored to the API behavior in https://docs.vennio.app):

- No slots returned: confirm consent is active and calendars are connected. React to consent.changed events.  
- Timezone errors: perform server-side logic in UTC and render local time per participant in the UI.  
- Webhook failures: ensure TLS / endpoint reachability, implement retries and replay, and monitor delivery rates.  
- Payments stuck in pending_payment: verify Stripe integration and webhook configuration.

Quick checklist of fixes:

- No slots -> reconsent or reconnect calendars.  
- Wrong local time -> normalize to UTC on server (store timestamps in ISO8601).  
- Webhooks failing -> check ngrok/TLS, implement exponential backoff retries with dead-letter storage.  
- Payment issues -> run sandbox Stripe transactions, verify checkout_url flow.

Operational thresholds to monitor here:

- Retry window: exponential backoff up to 5 attempts.  
- Webhook replay retention: keep events for at least 7 days for replay.  
- Alert thresholds: webhook failure rate > 5% over 5 minutes, booking creation latency > 2,000 ms.

## First use case for a small team

Target audience: solo founders or teams of 2–3 building interview scheduling + CRM automation. See https://docs.vennio.app.

MVP plan (30–90 minutes):

1) Start with 1 interviewer + 1 candidate. Query GET /v1/availability/slots for a 7-day window and 30-minute duration; return top 3 options.  
2) Use Venn Links for public pages or POST /v1/bookings for closed flows. See https://docs.vennio.app.  
3) Automate 1 downstream action on booking.created: update CRM, post to Slack, or rely on Vennio's CRM sync.  
4) Timebox: 30–60 minutes to wire API calls; 30 minutes to verify webhooks and calendar events; run 5 acceptance tests.

Canary and rollout guidance:

- Use separate API keys for dev and prod.  
- Canary: ~5% of users (example: 5 users) for 48 hours before wider rollout.  
- Limit financial sandbox tests (start with <$50 in test charges).  

## Technical notes (optional)

- API version: v1.4.0 (stable v1 series; v1 endpoints are backwards compatible within v1). See https://docs.vennio.app.  
- Base URLs: Production https://api.vennio.app, Local dev http://localhost:3001 (run: cd api && node server.js). See https://docs.vennio.app.  
- Core endpoints: GET /v1/availability/slots and POST /v1/bookings. Paid bookings may return pending_payment and checkout_url and confirm after Stripe Checkout. See https://docs.vennio.app.  
- Webhook events: booking.created, booking.cancelled, consent.changed.

Example TypeScript webhook verifier:

```ts
import crypto from 'crypto';
export function verify(payload: string, signature: string, secret: string) {
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature));
}
```

Security & reliability notes:

- Implement idempotency for POST /v1/bookings.  
- Store consent IDs and replayable webhook events for at least 7 days.  
- Monitor latency (target < 2,000 ms) and webhook success rate (target > 95%).

## What to do next (production checklist)

### Assumptions / Hypotheses

- This guide assumes Vennio exposes structured slot data, supports GET /v1/availability/slots and POST /v1/bookings, and emits booking.created webhooks as described at https://docs.vennio.app (API v1.4.0).  
- Timing guidance (60–90 minutes demo, 3–8 hours hardening, 30-second webhook acceptance) are team guidelines to be adjusted to your environment.  
- Exact header names for idempotency, webhook signature formats, and replay windows should be validated against the full API reference at https://docs.vennio.app.

### Risks / Mitigations

- Risk: webhook delivery outages. Mitigation: implement retries with exponential backoff (up to 5 attempts), store events for replay (retain 7 days), and alert if failure rate > 5% over 5 minutes.  
- Risk: payment flow failures. Mitigation: test Stripe in sandbox, reconcile checkout_url flows, and verify Stripe webhook delivery.  
- Risk: consent or privacy gaps. Mitigation: persist consent IDs, enforce retention and GDPR controls, and surface consent.changed events.

### Next steps

- Smoke tests: run 5 internal bookings, assert booking.created arrives within 30 seconds and calendar events are visible.  
- Monitoring: configure alerts for booking creation latency > 2,000 ms and webhook failure rate > 5% over 5 minutes.  
- Rollout: canary to ~5% of users (example: 5 users) for 48 hours, then expand if metrics are stable.

Final ship checklist:

- [ ] API key stored in secrets manager  
- [ ] Public webhook URL reachable and tested  
- [ ] Connected test calendar(s)  
- [ ] Five successful internal bookings  
- [ ] Monitoring & alerts configured (latency, failure rates)

For the authoritative API reference and examples, see https://docs.vennio.app.
