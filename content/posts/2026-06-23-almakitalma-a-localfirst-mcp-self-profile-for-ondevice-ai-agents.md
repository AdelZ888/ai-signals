---
title: "almakit/alma — a local‑first MCP 'self' profile for on‑device AI agents"
date: "2026-06-23"
excerpt: "Run alma locally to store a versioned, structured 'self' profile for on‑machine AI agents. Keeps private data on‑device, standardizes agent decisions, and is quick to prototype."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-23-almakitalma-a-localfirst-mcp-self-profile-for-ondevice-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "local-first"
  - "self-model"
  - "privacy"
  - "open-source"
  - "alma"
  - "mcp"
  - "tutorial"
sources:
  - "https://github.com/almakit/alma"
---

## TL;DR in plain English

- What this is: a local-first “self” model you can run from the almakit/alma repo. It provides a private, structured profile of a person or team that on-machine agents can read and (optionally) write. Source: https://github.com/almakit/alma
- Why it helps: it keeps private data local and gives agents a single, versioned profile to consult. That makes agent decisions more predictable and easier to audit.
- Quick actions: clone the repo, read the README, start a local dev instance, load a sample profile, and run a smoke query. See the repo: https://github.com/almakit/alma

Checklist (smoke):
- [ ] clone → install → start local server → load sample-profile.json → run a sample query

Plain-language explanation before advanced details:
- This project holds a small, structured representation of “who I am” (a person or team) on your machine. Agents, which are small programs that take actions or give suggestions, read that profile instead of asking a cloud service for private info. That keeps secrets local and makes behavior repeatable. The rest of the document explains how to run it, test it, and move from a prototype to a small production canary.

Concrete example (short scenario):
- A product team runs alma on a laptop. A triage bot reads the team profile and suggests code reviewers based on availability and reviewer preferences stored in sample-profile.json. At first the bot only reads the profile; write permission is added later behind a flag.

## What you will build and why it helps

You will run a local instance of the alma "self" model so on-machine agents can read and (optionally) write a structured profile. The repo describes a local-first MCP-style self model for AI agents: https://github.com/almakit/alma.

What this gives you:
- Local storage of sensitive fields. No need to send private preferences to a hosted service.
- A single source of truth for agent decision logic. Agents using the same profile behave consistently.
- A minimal starting artifact you can expand: a JSON/YAML profile plus a short decision table mapping profile fields to allowed actions.

Concrete artifact (example): sample-profile.json containing identity, roles, preferences, and a small policies block. See the repository: https://github.com/almakit/alma.

Plain-language note before technical steps:
- Think of the profile as a small, versioned file you control. Keep it simple at first: a name, a couple of roles, a few preferences, and a rules block that says what an agent may or may not do automatically.

## Before you start (time, cost, prerequisites)

Reference: https://github.com/almakit/alma

What you need before you begin:
- Git access and basic terminal skills.
- A code editor and a browser.
- Space for a data folder to hold the profile files.

Pre-run checklist:
- [ ] git installed and working
- [ ] Clone access to the repo: https://github.com/almakit/alma
- [ ] A data directory for profile files and backups

Notes: the repository README contains exact runtime and start commands. Check it before you install. The snapshot we used is public at: https://github.com/almakit/alma.

## Step-by-step setup and implementation

Reference: https://github.com/almakit/alma

1. Clone the repository and inspect the README.

```bash
# clone
git clone https://github.com/almakit/alma
cd alma
less README.md
```

2. Install the runtimes and dependencies the README lists. If the project uses Node or Python, follow the exact versions it specifies.

3. Create a local data folder and a minimal profile file named sample-profile.json.

4. Copy any example config from the repo and update the data path to point to your profile.

5. Start the local dev instance per the README. Confirm the process listens on the configured port.

```bash
# example start patterns — adapt to what the repo documents
# If the repo uses a script
./run-local.sh --config config/local.yaml
# Or for Node-based projects
npm run dev
```

6. Place sample-profile.json into the configured data folder. A minimal example (adjust to the repo schema):

```json
{
  "id": "example-self",
  "identity": { "name": "Alex", "role": "product" },
  "preferences": { "meeting_window": "09:00-17:00", "timezone": "+01:00" },
  "policies": { "auto_assign_pr": false }
}
```

7. Run a smoke test. Ask an agent to read a preference and return a controlled result (for example, propose meeting slots based on meeting_window). Keep tests deterministic and small.

Decision table (editable example):

| Field | Allowed for automated actions? | Requires human approval |
|-------|-------------------------------:|------------------------:|
| preferences.meeting_window | Yes | No |
| policies.auto_assign_pr | No | Yes |
| identity.email | No | Yes |

8. Add a smoke script that exercises read access and validates outputs. Keep assertions simple: expected keys and no private fields leaked.

Rollout suggestions: run the automation for a small sample first and gate writes behind a feature flag. See the repo for local-first guidance: https://github.com/almakit/alma.

## Common problems and quick fixes

Reference: https://github.com/almakit/alma

Server won't start
- Fix: change the configured port and retry. Check logs for the exact error.

Missing runtime or dependency
- Fix: install the exact runtime version the README specifies.

Profile not loaded or empty responses
- Fix: ensure sample-profile.json is placed in the configured data folder and is readable by the process.

Stale or inconsistent agent responses
- Fix: confirm the agent reads the active data namespace and disable or shorten caches while testing.

Useful diagnostics:

```bash
# check listening ports (example)
ss -ltnp | grep 3000
# check logs
tail -n 200 logs/dev.log
```

Monitoring targets to track during early testing (move to production thresholds later): aim for high read success and low errors; keep the smoke flow small and repeatable. See the project: https://github.com/almakit/alma.

## First use case for a small team

Reference: https://github.com/almakit/alma

Scenario: a small product team wants a triage assistant that suggests reviewers from a local team profile. Keep the profile anonymised and prefer read-only access for agents at first.

How to start
- Run alma locally on a private machine and create a team-profile file with reviewer preferences and availability.
- Grant the triage agent read-only access to the profile. Keep write actions gated by a feature flag.
- Run a short canary on one repository and inspect outcomes before expanding.

What to measure during the canary
- Changes in time-to-triage, false-positive auto-assigns, and reviewer satisfaction. Track simple pass/fail signals from the smoke script. Use the repo docs for integration hints: https://github.com/almakit/alma.

Advice for a solo founder
- Start with one automation and keep data local-only until behavior stabilises. Keep the profile minimal and versioned.

## Technical notes (optional)

Reference: https://github.com/almakit/alma

Data format and validation
- Expect JSON or YAML for profile files. Keep a schema for validation if the repo provides one.

Security and storage
- Keep sensitive fields encrypted at rest if you plan to store secrets locally. Use local keyrings and audited logs for reads and writes.

Performance tuning (dev vs prod)
- Use short cache TTLs (time to live) in development. Increase TTLs in production only after you validate correctness.

Example YAML config snippet (local example):

```yaml
server:
  port: 3000
  host: 127.0.0.1
data:
  profile_path: ./data/sample-profile.json
security:
  encrypt_sensitive: true
  encryption_key_path: ~/.keys/alma_key
```

If you plan to attach external LLMs (large language models), control token and cost usage via caps and counters. See the repo for the architecture note: https://github.com/almakit/alma.

## What to do next (production checklist)

Reference: https://github.com/almakit/alma

### Assumptions / Hypotheses

- The repository provides a runnable local mode and a README that describes running a local instance (source snapshot: https://github.com/almakit/alma).
- Prototype estimates used earlier are hypotheses and should be validated in your environment: example prototype time 3 hours; example machine recommendation 4 CPU cores and 8 GB RAM; example canary duration 7 days; read success target 95%+; rollback threshold error rate >10%.

### Risks / Mitigations

- Risk: accidental leakage of private fields.
  - Mitigation: encrypt sensitive fields at rest, require human approval for writes, and enable audit logs.
- Risk: automation quality issues (wrong assignments).
  - Mitigation: run a canary on a small population, require human approval for an initial window, and set a rollback trigger if error rate exceeds the threshold you define.
- Risk: unexpected API costs when using hosted LLMs.
  - Mitigation: enforce a hard spend cap and per-request token caps. Monitor usage and alert on cost spikes.

### Next steps

- Add the smoke test to CI so it runs automatically on changes (tests/smoke.sh or similar).
- Finalise and version the decision table that maps profile fields to allowed automated actions.
- Create backups and a retention policy; start with daily snapshots and a 30-day retention as an initial policy.
- Implement monitoring and alerts for read success rate <95% or error rate >5%.
- Revisit the assumptions above and replace hypothesis values with measured thresholds from your canary.

Reference / repo: https://github.com/almakit/alma
