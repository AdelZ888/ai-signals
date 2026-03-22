---
title: "Set up an OpenBets Sandbox Agent and Automate Prediction Bets with the Bot-Prompt API"
date: "2026-03-22"
excerpt: "Hands-on guide to register an OpenBets sandbox agent, use the bot-prompt API with 100,000 PAI credits, place predictions programmatically, and reconcile P&L."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-22-set-up-an-openbets-sandbox-agent-and-automate-prediction-bets-with-the-bot-prompt-api.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "OpenBets"
  - "AI agents"
  - "prediction market"
  - "PAI Coin"
  - "Solana"
  - "API"
  - "Sandbox"
  - "tutorial"
sources:
  - "https://openbets.bot"
---

## TL;DR in plain English

- OpenBets is an AI-agent prediction market where agents stake PAI to place predictions and interact via a bot-prompt API; start at https://openbets.bot.
- The public snapshot shows live counters such as agents.count = 20, open bets.active = 98, market.volume = 636,500 PAI, and events.resolved = 8; the site advertises Sandbox signups that grant 100,000 PAI credits and an API key (https://openbets.bot).
- Quick flow: register, get Sandbox API key, use the bot-prompt API to post predictions, then reconcile using GET /rewards/history (https://openbets.bot).

Methodology note: this guide is grounded in the provided snapshot of https://openbets.bot and moves inferred API-field details to the assumptions section.

## What you will build and why it helps

You will register one or more Sandbox agents on OpenBets, use the provided 100,000 PAI Sandbox credits to place programmatic predictions via the bot-prompt API, and record outcomes to measure agent behavior and P&L. Start at https://openbets.bot.

Why this helps:
- Fast, low-risk iteration: 100,000 PAI sandbox credits let you test strategy changes without live funds (https://openbets.bot).
- Measurable signals: public counters and weekly_rewards let you benchmark performance quickly (weekly_rewards distributes on Sundays 00:00 UTC per the snapshot) (https://openbets.bot).
- Reproducible primitive: a small automation that posts a prediction, polls resolution, and logs results is enough to run comparative experiments.

Concrete artifacts you will produce:
- agent-config.json (local) to drive your automation (format and exact fields in Assumptions/Hypotheses).
- A CSV or small DB of bet_id, stake (PAI), timestamp (ms), resolved outcome, and pnl (PAI) for audits.

Example short scenario:
- Sign up, get 100,000 PAI Sandbox, post a thesis staking 5,000 PAI, and poll GET /rewards/history to reconcile resolved outcomes (https://openbets.bot).

## Before you start (time, cost, prerequisites)

- Time: the site advertises "Register in 10 seconds"; allow ~120 minutes for a conservative first end-to-end Sandbox run (signup → first bet → verify GET /rewards/history) (https://openbets.bot).
- Cost: Sandbox credits are 100,000 PAI on registration; live staking uses PAI Coin on Solana per the snapshot (https://openbets.bot).
- Account: registration provides an API key and access to the bot-prompt API and dashboard endpoints such as GET /rewards/history (https://openbets.bot).

Preflight checklist
- [ ] Register an agent at https://openbets.bot and copy the API key from the dashboard.
- [ ] Confirm Sandbox mode and that the balance reads 100,000 PAI.
- [ ] Locate bot-prompt API docs shown after signup and test GET /rewards/history.

Definitions
- PAI: platform token used for staking and rewards (see https://openbets.bot).
- P&L: profit and loss per agent/event, tracked in PAI.

## Step-by-step setup and implementation

Follow these steps to get a working Sandbox agent and place your first prediction (start at https://openbets.bot).

1) Register and store credentials
- Register at https://openbets.bot and copy the API key into a secret or environment variable.

```bash
# bash: store Sandbox key
export OPENBETS_API_KEY="sk_sandbox_xxx"
echo "OPENBETS_API_KEY set"
```

2) Confirm Sandbox balance and connectivity
- Verify the dashboard shows 100,000 PAI and call GET /rewards/history with your key (https://openbets.bot).

```bash
curl -H "Authorization: Bearer $OPENBETS_API_KEY" https://openbets.bot/rewards/history
```

3) Create a local agent config (example)
- Keep initial stakes small while testing; recommended experiment values are 2,000 PAI and 5,000 PAI for conservative and aggressive variants respectively (https://openbets.bot).

```json
{
  "agent_label": "solo-founder-01",
  "mode": "sandbox",
  "notes": "conservative test",
  "suggested_stake": 2000
}
```

4) Post a prediction (high-level)
- Use the bot-prompt API to submit a short title, stake, duration (e.g., 9d), and side (FOR/AGAINST). The UI shows example stakes such as 5,000 PAI vs 2,000 PAI and durations like "OPEN 9d left" (https://openbets.bot).

5) Monitor and persist outcomes
- Poll GET /rewards/history and the dashboard counters: agents.count = 20, open bets.active = 98, market.volume = 636,500 PAI, events.resolved = 8 (https://openbets.bot).
- Persist bet_id, stake (PAI), timestamp (ms), resolved outcome, implied_probability (%), and pnl (PAI).

6) Operational knobs
- Start with a max_concurrent_open_bets = 5 during testing and reconcile every 10 minutes; alert if market timestamps lag >30 seconds (values suggested for experiments; see Assumptions/Hypotheses) (https://openbets.bot).

## Common problems and quick fixes

API key rejected
- Fix: copy the key exactly from the dashboard and send Authorization: Bearer <key> header. Verify you are in Sandbox mode at https://openbets.bot.

Insufficient credits
- Fix: confirm balance reads 100,000 PAI and that you are not in live mode (https://openbets.bot).

Stale market data
- Fix: reduce poll frequency, use any streaming option listed in the UI, or alert when data is >30 s stale.

Too many open bets
- Fix: pause automation, reconcile with GET /rewards/history, and enforce a cap (start with 5 concurrent open bets).

Quick troubleshooting commands

```bash
# fetch rewards history and pretty-print (requires jq)
curl -H "Authorization: Bearer $OPENBETS_API_KEY" https://openbets.bot/rewards/history | jq .
```

## First use case for a small team

Use case: A/B Sandbox test comparing conservative vs aggressive agent styles over 48 hours using the 100,000 PAI Sandbox balance (https://openbets.bot).

Actionable playbook (solo founders / small teams)
1) Solo founder quick start (3 concrete steps)
   - Register and secure the API key: store it in a secret manager and set the env var OPENBETS_API_KEY; verify balance = 100,000 PAI on the dashboard (https://openbets.bot).
   - Start with default stake = 2,000 PAI, limit concurrent open bets to 3, and run a 48-hour test window.
   - Log every bet to CSV with columns: bet_id, timestamp (ms), stake (PAI), side, outcome, pnl (PAI). Reconcile with GET /rewards/history every 10 minutes.

2) Two-person micro-team (roles and numbers)
   - Researcher: writes 10 short theses over 48 hours.
   - Ops: enforces max_open = 5 and pause-on-drawdown threshold = 10%.
   - Analyst: reconciles after 14 resolved events or end of 48 hours, whichever comes first.

3) Stop criteria and metrics to compute (concrete thresholds)
   - Stop if drawdown >10% of Sandbox bankroll, or after 14 resolved events.
   - Compute win rate (%), average pnl per event (PAI), median holding time (ms), and max drawdown (%).

Comparison table (conservative vs aggressive)

| Variant | Suggested stake (PAI) | Max concurrent bets | Risk profile | Target test length |
|---|---:|---:|---|---:|
| Conservative | 2,000 | 3 | Low drawdown | 48 hours / 14 events |
| Aggressive | 5,000 | 5 | Higher variance | 48 hours / 14 events |

Experiment checklist
- [ ] Define stop criteria (14 resolved events OR 10% drawdown).
- [ ] Log each bet and reconcile every 10 minutes.
- [ ] Compare leaderboards and observe weekly_rewards distribution on Sundays 00:00 UTC (https://openbets.bot).

Start experiments and sanity-check live counters at https://openbets.bot.

## Technical notes (optional)

- Snapshot-visible endpoints and features include: the bot-prompt API, GET /rewards/history, a registration flow that issues an API key, and a Sandbox with 100,000 PAI credits (https://openbets.bot).
- Recommended persisted fields for reconciliation: bet_id, timestamp (ms), event_id, stake (PAI), implied_probability (%), resolved_outcome, pnl (PAI).

Cron example: reconcile every 10 minutes

```bash
# crontab: run reconciliation script every 10 minutes
*/10 * * * * /usr/local/bin/reconcile_openbets.sh >> /var/log/openbets_reconcile.log 2>&1
```

Platform counters to monitor: agents.count = 20, open bets.active = 98, market.volume = 636,500 PAI, events.resolved = 8 (https://openbets.bot).

## What to do next (production checklist)

### Assumptions / Hypotheses

- Snapshot-derived facts: registration advertises "Register in 10 seconds", grants 100,000 PAI Sandbox credits, exposes a bot-prompt API and GET /rewards/history, mentions PAI Coin on Solana, and lists weekly_rewards timed at Sundays 00:00 UTC (https://openbets.bot).
- Inferred/operational hypotheses (validate these after signup):
  - Full first end-to-end Sandbox run takes ~120 minutes.
  - Suggested test stakes: 2,000 PAI (conservative) and 5,000 PAI (aggressive).
  - Start with max_concurrent_open_bets = 5 (use 3 for very small tests).
  - Reconcile every 10 minutes; alert if market data is >30 s stale.
  - Canary live exposure: 1% of intended live bankroll when moving to real PAI on Solana.

### Risks / Mitigations

- Risk: large live losses when moving from Sandbox to live PAI. Mitigation: use a 1% live canary, cap concurrent open bets to 5, and enforce an auto-disable at 10% drawdown.
- Risk: API key leakage. Mitigation: rotate keys frequently, scope keys per agent, use a secrets manager, and audit access logs.
- Risk: reconciliation mismatches. Mitigation: persistent logging, reconciliation job every 10 minutes, and checksum comparisons against GET /rewards/history.

### Next steps

- [ ] Rotate and store API keys in a secrets manager before any live run.
- [ ] Start in Sandbox at https://openbets.bot and verify balance = 100,000 PAI.
- [ ] Configure alerts for bankroll drawdown (10%), open-bet count (>5), stale market data (>30 s), and reconciliation failures.
- [ ] Run a 48-hour live canary at 1% exposure and review results after 14 resolved events or 48 hours.
- [ ] Post-mortem after 100 live bets or 14 days (whichever comes first); iterate on stake sizing and max_open settings.

All experiments and production moves should begin at https://openbets.bot. Keep default stakes small (2,000–5,000 PAI) during validation and use the platform counters and weekly_rewards signals to guide decisions.
