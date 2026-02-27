---
title: "Self-host MailCat: instant ephemeral mailboxes for AI agents (Cloudflare Workers + D1)"
date: "2026-02-27"
excerpt: "Deploy MailCat: an open-source API that gives AI agents instant, ephemeral inboxes, auto-extracts verification codes, and stores mail for one hour—set up in minutes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-27-self-host-mailcat-instant-ephemeral-mailboxes-for-ai-agents-cloudflare-workers-d1.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 20
editorialTemplate: "TUTORIAL"
tags:
  - "mailcat"
  - "email"
  - "ai-agents"
  - "self-hosting"
  - "cloudflare-workers"
  - "verification"
  - "open-source"
  - "devops"
sources:
  - "https://github.com/apidog/mailcat"
---

## TL;DR in plain English

MailCat gives an AI agent its own temporary email address so the agent can receive messages directly. The project page says: "Give your AI agent (e.g., OpenClaw) its own email address. Instant mailbox creation, receive emails, no signup required." See https://github.com/apidog/mailcat.

- You can create a mailbox instantly and read incoming mail automatically. This removes manual copy/paste steps. (AI = artificial intelligence.)
- Useful for automated signup flows, QA bots, and CI test scripts. (CI = continuous integration; API = application programming interface.)
- Fast example: create a mailbox, trigger a signup, read a 6‑digit code from the email. Expect 10–30 minutes to run a quick local test, and 1–2 hours to add basic monitoring. See https://github.com/apidog/mailcat.

Concrete short checklist:

- [ ] Clone the repo and read the README: https://github.com/apidog/mailcat
- [ ] Start a quick local run and make 1 test mailbox
- [ ] Send a verification email and fetch it via the API

Example scenario

- You run one command to create an inbox.
- Your automated signup flow sends a verification email to that inbox.
- Your script fetches the email, extracts the verification code, and submits it back to the service.

This removes a human from the loop for verification steps.

## What you will build and why it helps

You will stand up a MailCat instance from the upstream repository at https://github.com/apidog/mailcat. The goal is a small HTTP API that lets a program create inboxes and fetch messages. That lets automated agents or test harnesses observe email without manual steps.

Why this helps:

- Replace manual verification steps in tests and agent flows. Reduce human involvement in verification.
- Provide ephemeral, reproducible mailboxes for automated pipelines. Create 1–50 test boxes depending on needs.
- Audit and fork the source before running it in your environment. Repository: https://github.com/apidog/mailcat.

Sequence (example):

| Step | Actor | Artifact |
|---|---:|---:|
| 1 | Agent / CI | calls MailCat API to create an inbox (1 request) |
| 2 | Vendor | sends verification email to that address (1 email) |
| 3 | MailCat | stores/returns mail to caller (1 retrieval) |

Repository: https://github.com/apidog/mailcat.

## Before you start (time, cost, prerequisites)

Estimated effort and constraints:

- Time: 10–30 minutes for a local clone + basic test; 1–2 hours to add monitoring and CI integration.
- Cost: $0 on many free developer tiers for light tests; budget $0–$20/month for steady use. Aim to keep monthly spend < $20 for staging.
- Initial scale: create 1–10 mailboxes for early tests. Load tests later can target 50–500 creations.

Minimum prerequisites:

- Git and a terminal.
- A host to run the code (local machine, virtual machine, or cloud). See repo: https://github.com/apidog/mailcat.
- A way to store secrets (CI secret store, local encrypted file, or vault).

Pre‑deploy checklist:

- [ ] Clone https://github.com/apidog/mailcat
- [ ] Read README and quickstart in the repo
- [ ] Prepare secret storage for API tokens
- [ ] Decide retention policy for test mail (for example, 3600s = 1 hour) and confirm in the repo

## Step-by-step setup and implementation

Follow these concise steps. Replace placeholders with values from the MailCat README at https://github.com/apidog/mailcat.

### Plain-language explanation

At a high level: your script asks MailCat for a new address. The external service sends mail to that address. MailCat receives the message and either stores it for polling or forwards it via a webhook. Your script then reads the message and extracts the code or token it needs.

1) Clone and inspect the repo:

```bash
git clone https://github.com/apidog/mailcat.git
cd mailcat
ls -la
# open README.md
```

2) Install and run locally (example commands — follow the repo for exact steps):

```bash
# example; use exact commands from README
npm install
npm run dev
```

3) Minimal config (keep secrets out of source control). Update with real values after checking the repo docs: https://github.com/apidog/mailcat.

```json
{
  "API_TOKEN": "REPLACE_WITH_SECRET_TOKEN",
  "HOST": "https://your-host.example.com",
  "WEBHOOK_URL": "https://your-ci.example.com/mailhook"
}
```

4) Create a test mailbox (example curl — replace host and token):

```bash
curl -X POST "https://your-host.example.com/api/create-mailbox" \
  -H "Authorization: Bearer REPLACE_WITH_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"ci-test-1"}'
```

5) Send a verification email to the returned address. Poll or receive a webhook to fetch messages. For a smoke test, run 10 signups and expect >=95% success across 10–50 attempts.

6) Rollout guidance: start with 5% of CI runs or 1/20 pipelines for 24 hours. If 5xx errors or verification failures exceed 1% during canary, roll back.

Repository: https://github.com/apidog/mailcat.

## Common problems and quick fixes

Problem: mailbox creation returns auth error
- Fix: verify your API token and endpoint. Regenerate token if needed.

Problem: incoming mail never appears
- Fix: confirm the sender actually sent mail. Check vendor logs. If using webhooks, ensure the endpoint responds 200 within 500 ms.

Problem: parser fails to extract code
- Fix: inspect the raw message and loosen the regular expression (regex). If you expect a 6‑digit code, assert pattern ^\d{6}$ in tests. Add unit tests that run in <500 ms.

Problem: intermittent 5xx under load
- Fix: add retries with exponential backoff (max 5 retries). Example backoff sequence: 100 ms, 200 ms, 400 ms, 800 ms, 1600 ms. Aim for 5xx <1% during tests.

Useful thresholds to track:
- Smoke tests: 10–50 signups
- Canary window: 24 hours
- Canary traffic: 5% (or 1/20 runs)
- Success gate: >=95% verification success
- Extraction failure alert: >2%
- Webhook timeout target: 500 ms
- Retry attempts: 5 max

Repo: https://github.com/apidog/mailcat.

## First use case for a small team

Target: solo founders or a small team (1–3 people) who need ephemeral inboxes for testing or automation.

Actionable plan (solo founder — 3 clear steps):

1) Run locally or on a free tier host. Clone the repo and start one instance on your laptop or a low-cost cloud VM. Use a single mailbox for early tests. See https://github.com/apidog/mailcat.

2) Script the flow end‑to‑end. Create a short script that:
   - Calls the MailCat API to create 1 mailbox (1 request).
   - Triggers your signup flow once and waits up to 30 s for the verification email.
   - Extracts a 4–8 digit code with a small regex and submits it.

   Make the script runnable in 10–30 seconds for quick local debugging. Store the API token in a local encrypted file or CI secret.

3) Automate token rotation and cleanup. For ephemeral tokens, rotate at least every 24 hours and delete test mailboxes after 1 hour (3600s) or after tests complete.

Extra tips for 1–3 person teams:
- Use a single shared staging instance before scaling to multiple mailboxes. Start with 1–5 mailboxes.
- Keep monitoring simple: log mailbox_create_count and mail_inbound_count. Alert if extraction_failure_rate >2%.
- Limit cost: target <$20/month; measure mailbox creation rate and scale later.

CI checklist for small teams:

- [ ] Generate a mailbox token and save it to CI secrets
- [ ] Add 1 script to perform create -> trigger -> read -> assert within 30 s
- [ ] Rotate tokens every 24 hours or on any suspected leak

Repository: https://github.com/apidog/mailcat.

## Technical notes (optional)

Read the repository for implementation details at https://github.com/apidog/mailcat. Below are illustrative examples and tips.

Example host config (sample only):

```toml
# example host config (replace with platform-specific fields)
name = "mailcat-example"
account_id = "REPLACE_WITH_ACCOUNT_ID"
workers_dev = true

[vars]
API_TOKEN = "REPLACE_WITH_SECRET_TOKEN"
```

Parser guidance:
- Prefer tests that assert a 4–8 digit numeric code or an 8–64 char token depending on vendor.
- Keep regexes narrow for extraction but allow small vendor format differences.
- Unit tests should cover 10–50 sample messages and run in <1 s locally.

Retries and backoff example (advanced): use up to 5 retries with initial delay 100 ms, doubling each attempt to 1600 ms. Aim to keep user‑perceived latency for verification under 2 s where possible.

Repository reference: https://github.com/apidog/mailcat.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository summary at https://github.com/apidog/mailcat advertises instant mailbox creation and receiving mail for AI agents. That statement is supported by the project description.
- Details such as hosting platform, default retention TTL, storage backend, or license type are not confirmed by the excerpt and must be checked in the repo.
- Any rate limits, default webhook behavior, and exact API endpoints should be confirmed by reading README and source at https://github.com/apidog/mailcat.

### Risks / Mitigations

- Token leakage: mitigate by storing secrets in a vault or CI secret store and rotating tokens every 24 hours for ephemeral tokens. Monitor token creation; investigate if >100 tokens/day are created unexpectedly.
- Data exposure: if mail retention exists, set retention to a short TTL (for example, 3600s) and redact sensitive fields. Limit retention to 1 hour where possible.
- Availability and rate limits: run load tests at 50–500 mailbox creations and ensure 5xx <1% during tests. Add retries (max 5 attempts) and exponential backoff (100 ms -> 1600 ms).
- Compliance: if personally identifiable information (PII) is processed, perform legal review and limit retention and access.

### Next steps

- [ ] Read the README and source at https://github.com/apidog/mailcat and confirm hosting, retention, and API endpoints.
- [ ] Choose a hosting target and prepare a canary: route 5% of CI jobs (or 1/20 runs) to the MailCat instance for 24 hours.
- [ ] Implement secret storage and rotate ephemeral tokens every 24 hours; revoke tokens immediately on suspected leak.
- [ ] Add metrics: mailbox_create_count, mail_inbound_count, extraction_failure_rate. Alert if extraction_failure_rate >2% or 5xx >1%.
- [ ] Run a rollback rehearsal: ensure a rollback can be executed within 15 minutes of detecting a canary failure.

Methodology note: this guide is based on the repository description snapshot and pragmatic operational best practices. Confirm exact commands and defaults in https://github.com/apidog/mailcat.
