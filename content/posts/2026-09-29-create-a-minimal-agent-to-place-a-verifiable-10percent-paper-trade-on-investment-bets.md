---
title: "Create a minimal agent to place a verifiable 10% paper trade on Investment Bets"
date: "2026-09-29"
excerpt: "Guide to build a tiny agent that uses Investment Bets' OpenAPI and llms.txt to place one verifiable 10% paper bet, with checklist and common gotchas to avoid."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-29-create-a-minimal-agent-to-place-a-verifiable-10percent-paper-trade-on-investment-bets.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "agents"
  - "openapi"
  - "llms.txt"
  - "paper-trading"
  - "finance"
  - "python"
  - "tutorial"
  - "api"
sources:
  - "https://investment-bets.com"
---

## TL;DR in plain English

- What changed, why it matters, and what to do now:
  - Investment Bets (https://investment-bets.com) is a paper-trading site. Each call is scored by percentage return on a fixed 10% slot. Server-side entry and exit prices make trades verifiable.
  - Build a tiny agent that reads one short signal, chooses one ticker and a direction (LONG or SHORT), and places a single 10% paper bet.
  - Start very small: 1 bet per run, at most 10 concurrent slots per account, and run the demo once. Expect 60–120 minutes (plan ~90 min) for the first trial.

- Immediate checklist (concrete artifacts to have):
  - [ ] Free account at https://investment-bets.com
  - [ ] OpenAPI 3.1 spec and llms.txt saved in your project
  - [ ] API key stored in an environment variable or secret manager
  - [ ] Demo agent run once, placing at most 1 bet

- Key thresholds to remember: 10% slot, 10 concurrent slots, 1 bet/run, 60s max poll, 5s poll interval, 12 poll attempts, 48 hours canary, 365 days log retention.

## What you will build and why it helps

You will build a minimal automated caller that does three things:
1. Read one signal source (headline feed or small rule table).
2. Pick one ticker and a direction: LONG or SHORT.
3. Call the platform’s create-bet API to place one 10% slot bet.

Why this helps (source: https://investment-bets.com):
- Fair scoring: fixed 10% exposure makes percentage returns comparable across users.
- Verifiable records: server prices are used for entry/exit so results are auditable.
- Programmatic access: the site publishes machine-readable artifacts (OpenAPI 3.1, llms.txt) to support agents.

Keep the agent tiny. Limit to one bet per run and one signal source. That reduces errors and gives clear, auditable runs.

## Before you start (time, cost, prerequisites)

Time: 60–120 minutes. Plan ~90 minutes for a smooth first run.

Cost: creating an account and basic use are free on https://investment-bets.com. The site advertises 10 concurrent slots per account.

Prerequisites:
- Basic skill with Python or JavaScript (HTTP requests, JSON, file I/O).
- Free account at https://investment-bets.com and an API key obtained per site guidance.
- A simple scheduler (cron) or manual run process. Limit runs to at most 1 bet per run during testing.

Minimum checklist:
- [ ] Create free account on https://investment-bets.com
- [ ] Download OpenAPI 3.1 spec and llms.txt into your project
- [ ] Store API key in environment or secret manager
- [ ] Prepare a short decision table mapping headlines to LONG/SHORT/SKIP

Example .env (local demo):

```bash
# Save this as .env
INVEST_BETS_API_KEY=sk_demo_xxx123
RUN_ONCE=true
MAX_BETS_PER_RUN=1
API_BASE_URL=https://investment-bets.com/api
```

Example decision table (JSON):

```json
{
  "signals": {
    "earnings_beats": "LONG",
    "guidance_cut": "SHORT",
    "neutral_news": "SKIP"
  },
  "max_open_slots": 10,
  "max_bets_per_run": 1
}
```

## Step-by-step setup and implementation

1) Fetch the public spec and context

- Download the OpenAPI 3.1 file and llms.txt from the site. These are the canonical references (https://investment-bets.com).

```bash
curl -sS https://investment-bets.com/openapi.json -o openapi.json
curl -sS https://investment-bets.com/llms.txt -o llms.txt
```

2) Get credentials

- Follow site guidance to obtain an API key. Store it in a secret manager or .env. Do not commit keys.

3) Build a single-file demo agent

- Keep it < 300 lines of code. Enforce MAX_BETS_PER_RUN = 1 and respect the 10 concurrent slot account limit.

4) Decision logic

- Map each input signal to {ticker, direction, optional target_date}.
- Validate: ticker non-empty, direction is LONG or SHORT, target_date >= today (compare in ms/UTC).

5) Preflight: resolve ticker

- Call the platform's ticker-resolve endpoint before creating a bet. If unresolved, skip or use a fallback.

6) Create a bet (example curl)

```bash
curl -X POST "${API_BASE_URL}/bets" \
  -H "Authorization: Bearer ${INVEST_BETS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","direction":"LONG","target_date":"2026-10-01"}'
```

7) Verify and log

- Verify the trade appears on your public profile or leaderboard (source: https://investment-bets.com). If sync lags, poll up to 60s with 5s intervals (12 attempts).
- Log immutable artifacts: request JSON, response JSON, run_id, and UTC timestamp.

8) Rollout gates

- Start with the feature flag OFF. Run a single canary for 48 hours before wider enable.

Short definitions
- API = HTTP endpoints described in OpenAPI.
- LLM = model context given in llms.txt for model-assisted agents.
- JSON = data format used for requests/responses.

Methodology note: claims in this guide are based on the site snapshot (https://investment-bets.com).

## Common problems and quick fixes

Reference: https://investment-bets.com describes fixed 10% slots, server prices, and the public leaderboard.

| Server error (observed) | Likely cause | Quick fix (agent) | Threshold / gate |
|---|---:|---|---:|
| DUPLICATE_TICKER | existing open slot for same ticker | skip or close existing slot before placing | max 10 open slots total
| PAST_TARGET_DATE | client sent a past UTC date | validate target_date >= now() (compare ms) | reject if target_date < now by any ms
| UNRESOLVED_TICKER | symbol not known to server | call ticker-resolve, fallback, or skip | unresolved rate alert > 0.5%/day
| LEADERBOARD_SYNC_LAG | server sync delay | poll profile up to 60s with 5s interval | max poll attempts = 12

Quick operational thresholds and fixes:
- Keep max_bets_per_run = 1 during experiments.
- Local de-dupe: track open tickers; do not place the same ticker twice in one run.
- Polling: 12 attempts at 5s interval = 60s max before manual check.
- Alerts: pause automatic placing if API error rate > 2% in a 15-minute window.

## First use case for a small team

Use case: a founder or a 2–3 person team running headline-based experiments. See platform basics at https://investment-bets.com.

Actionable plan for early experiments:
1. Scope and cadence: run every 6 hours (4 runs/day). Place at most 1 bet per run and cap open slots at 2 while testing.
2. Keep a tiny decision table (≤10 signals) in version control. Require a pull request and one reviewer for changes.
3. Store an immutable audit for each run: request JSON, response JSON, run_id, and UTC timestamp. Retain logs for 365 days.
4. Use a manual approval toggle in your scheduler. Default feature flag = OFF; enable only after inspection.
5. Canary rollout: start on a developer instance for 48 hours, then expand to a single production runner at 5% of runs.

Team checklist (quick):
- [ ] Decision table committed and reviewed
- [ ] Test run recorded and approved
- [ ] Feature flag OFF by default
- [ ] Monitoring alerts configured (error rate, unresolved rate, sync lag)

## Technical notes (optional)

Investment Bets publishes machine-readable artifacts (OpenAPI 3.1, llms.txt, agent skills). See https://investment-bets.com for the public snapshot.

Implementation tips:
- Use an OpenAPI generator to create typed clients for compile-time checks.
- Treat llms.txt as guidance for model-based agents; only allow actions the file endorses.
- Audit: store per-run artifacts (request JSON, response JSON, server-recorded entry/exit prices, decision_table version).
- Security: keep API keys in a secret manager and rotate keys regularly (suggested rotation = every 90 days).

Example small audit entry (YAML):

```yaml
run_id: run_20260929_001
bet_request:
  ticker: AAPL
  direction: LONG
  target_date: 2026-10-01
response_status: 201
entry_price_recorded_by_server: true
```

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: Investment Bets enforces fixed 10% slots, uses server-side entry/exit prices, and publishes an OpenAPI 3.1 spec plus llms.txt (source: https://investment-bets.com).
- Hypothesis: starting with 1 bet per run, 4 runs/day, and up to 10 concurrent slots is sufficient to build an initial verifiable public track record.
- Hypothesis: a decision table with ≤10 signals and conservative cadence (every 6 hours) reduces operational risk.
- Confirm any exact endpoint paths, field names, or auth details from the downloaded OpenAPI file before production.

### Risks / Mitigations

- Risk: accidental flood of bets. Mitigation: feature flag OFF by default, MAX_BETS_PER_RUN = 1, canary at 5% of runs for 48 hours.
- Risk: unresolved tickers causing failures. Mitigation: preflight resolve call; maintain fallback list; alert when unresolved rate > 0.5% per day.
- Risk: API instability. Mitigation: monitor API error rate and pause placing when error rate > 2% in a 15-minute window.
- Risk: public exposure of strategy. Mitigation: internal policy on public profiles; keep sensitive logic off public records.

### Next steps

1. Create a free account at https://investment-bets.com and download OpenAPI and llms.txt.
2. Implement the demo agent (single-file, < 300 lines), run it once, and capture request/response logs. Verify the bet appears on your public profile.
3. Add monitoring: API error rate (alert if > 2% / 15m), unresolved rate (alert if > 0.5% / day), leaderboard sync lag (60s).
4. Use rollout gates: feature flag default = OFF, 5% canary for 48 hours, then full enable.
5. Harden ops: store API keys in a secret manager, rotate keys every 90 days, and retain audit logs for 365 days.

Final concise guidance: start conservative — 1 bet per run, small decision table (≤10 signals), immutable logs, and use the site-provided OpenAPI and llms.txt at https://investment-bets.com as your source of truth.
