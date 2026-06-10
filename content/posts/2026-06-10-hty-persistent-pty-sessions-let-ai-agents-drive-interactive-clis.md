---
title: "hty: persistent PTY sessions let AI agents drive interactive CLIs"
date: "2026-06-10"
excerpt: "hty exposes interactive programs through persistent PTY sessions so AI agents can snapshot the rendered terminal and send keystrokes—letting agents drive editors, auth flows, and wizards."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-10-hty-persistent-pty-sessions-let-ai-agents-drive-interactive-clis.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "NEWS"
tags:
  - "hty"
  - "ai-agents"
  - "cli"
  - "pty"
  - "sessions"
  - "automation"
  - "devtools"
  - "security"
sources:
  - "https://hty.sh/"
---

## TL;DR in plain English

- hty wraps interactive terminal programs in a persistent PTY so an AI agent can read the rendered terminal and send keystrokes back. This gives agents a human‑like view of tools such as editors, REPLs, multi‑prompt scaffolding wizards, and auth flows (https://hty.sh/).
- Sessions persist across invocations; you can snapshot the screen and send keystrokes to a named session, then watch, replay, or delete it later (https://hty.sh/).
- Quick pilot: install hty, add the packed skill or point an agent at https://hty.sh/skill.md, run a named session, exercise snapshot/send, and verify with a smoke build.

Plain summary: instead of agents guessing filesystem state or writing temporary files, they read the terminal and type as a person would, reducing brittle hacks and increasing reliability for interactive CLIs (https://hty.sh/).

## What changed

- Two practical primitives: snapshot (capture the rendered terminal) and send (deliver keystrokes to the running PTY). These let an agent observe and act inside an interactive session (https://hty.sh/).
- Sessions persist on a server that can autostart and keep sessions alive; you can reattach or watch live without restarting the process each time (https://hty.sh/).
- There is a packaged agent skill that teaches agents when to use hty; install with npx skills add LatentEvals/hty --skill hty or point agents to https://hty.sh/skill.md (https://hty.sh/).

## Why this matters (for real teams)

- Higher automation success for multi‑prompt tools. Examples called out in the docs include create-next-app, git add -p, gh auth login; these previously broke agents that couldn't read the terminal reliably (https://hty.sh/).
- You can set numeric rollout gates. Examples to use as targets: >= 90% success across 50 runs, average end‑to‑end time < 5 minutes for simple scaffolds, install prompt response within 2000 ms when possible (https://hty.sh/).
- Treat session logs as sensitive: rendered output and keystrokes may include usernames, emails, tokens, or other personal data. Protect logs with retention and access controls; start with a short retention window and RBAC (https://hty.sh/).
- Safer pilots: run a focused evaluation for 60–90 minutes with 1–3 pilot users, require security sign‑off before production integration, and track failure modes and costs (https://hty.sh/).

## Concrete example: what this looks like in practice

Scenario: an agent scaffolds a Next.js app and drives GitHub authentication inside an hty session (https://hty.sh/).

Steps (illustrative):

1. Start a named session: hty run --name create-next-app -- create-next-app my-app (https://hty.sh/).
2. Capture the screen: hty snapshot create-next-app (https://hty.sh/).
3. Agent sends keystrokes: hty send create-next-app --text "y\n" (https://hty.sh/).
4. Repeat until the wizard completes. Verify with a smoke check: npm run build should exit 0 within your CI timeout (https://hty.sh/).
5. Delete the session: hty delete create-next-app (https://hty.sh/).

Decision table (practical thresholds):

| Prompt pattern | Agent action | Verification | Accept threshold |
|---|---:|---|---:|
| "Use TypeScript? (Y/n)" | send "y\n" | tsconfig.json exists | >= 95% over 50 runs |
| "Install dependencies?" | send "y\n" | npm ci exits 0 | install starts within 2000 ms |
| "Authenticate with GitHub" | run gh auth flow inside hty | gh auth status returns token | token not stored in plain logs |

Practical gate: require >= 90% flow success across 50 runs before allowing unsupervised CI usage; measure mean time per run and common failure modes (https://hty.sh/).

## What small teams and solo founders should do now

These are concrete, low‑effort actions you can complete in a 60–90 minute session. Each step references the hty docs (https://hty.sh/).

1) Install locally or on a single isolated runner (10–20 minutes)
- Install hty on your laptop or a dedicated CI runner. Start one named session and take a snapshot to confirm the basic loop works: hty run, hty snapshot, hty send (https://hty.sh/).
- For solo founders, prefer a single-host setup to avoid cross‑tenant exposure and to minimize costs.

2) Add the agent skill and run a quick demo (10–20 minutes)
- Add the packaged skill: npx skills add LatentEvals/hty --skill hty or point your agent at https://hty.sh/skill.md. Run the agent demo once to confirm it knows when to snapshot/send (https://hty.sh/).
- Check that the agent reads prompts reliably by running a simple wizard once and inspecting the snapshots.

3) Run focused smoke tests and measure (30–60 minutes)
- Choose 2 critical flows (for example, create-next-app and gh auth login). Run each flow at least 10 times; record success rate (target >= 90%) and mean time per run (target < 5 minutes).
- Capture common failure patterns and the first 3 root causes by count. If a flow fails > 10% of runs, don’t expand automation yet.

4) Protect secrets and logs (15 minutes)
- Use ephemeral test accounts or short‑lived tokens only. Do not use production credentials inside sessions. Rotate any tokens used for testing immediately after the pilot (https://hty.sh/).
- Configure session log retention to 7 days initially and restrict access with RBAC. Log who exported or accessed sessions.

5) Limit blast radius and cost (10 minutes)
- Keep the pilot to 1–3 users and one isolated environment. Use a single dedicated runner to cap compute costs and simplify auditing.
- If you track costs, measure CPU time and wall time per run to estimate incremental cost before scaling.

Why this sequence: it yields visibility on success rates and secrets exposure quickly, with minimal setup and cost. All steps reference the hty docs for commands and behavior (https://hty.sh/).

## Regional lens (FR)

- GDPR perspective: terminal sessions can contain personal data (usernames, emails). Treat session logs as potentially personal data and document your legal basis for processing (https://hty.sh/).
- Recommended controls in France:
  - Perform a DPIA if sessions expose personal data or special categories. Document scope and retention.
  - Default retention: 7 days for dev logs; extend only to 30 days with a documented justification.
  - Record who exported or accessed sessions and keep an audit trail.
- Hosting note: run the hty server in an EU/France‑hosted runner if session contents may include personal data (https://hty.sh/).

## US, UK, FR comparison

| Region | Focus | Minimum controls |
|---|---|---|
| US | Sectoral rules + contract requirements (HIPAA, FINRA where applicable) | Contractual controls, strict secrets handling, limited retention (start at 7 days) |
| UK | GDPR‑aligned; attention to transfers and legal basis | DPIA‑style checks, documented legal basis for transfers, audit logs |
| FR (EU) | GDPR + national scrutiny; DPIA likely if logs contain personal data | DPIA, minimize retention (7–30 days), prefer EU hosting |

All regions require careful secrets handling and documented access controls before production rollouts; map session log flows and access early (https://hty.sh/).

## Technical notes + this-week checklist

### Assumptions / Hypotheses
- Assumption: hty exposes persistent PTY sessions and snapshot/send primitives; see the project docs (https://hty.sh/).
- Hypothesis: with tuning, common interactive flows (scaffolding, auth, git add -p) can reach >= 90% automation success after ≈ 50 runs of iteration and prompt handling.
- Small‑team estimate: an initial pilot requires ~60–90 minutes of focused work plus 1–2 hours of repeated runs to gather metrics.
- Methodology note: recommendations are grounded in the hty documentation snapshot and common rollout/security practices (https://hty.sh/).

### Risks / Mitigations
- Risk: secrets or personal data appear in session logs. Mitigation: use ephemeral accounts, avoid production credentials, set retention to 7 days, and apply RBAC (https://hty.sh/).
- Risk: agent issues destructive commands. Mitigation: run only in isolated environments, require smoke checks (e.g., npm run build exits 0), and snapshot outputs before destructive steps.
- Risk: compliance gaps across regions. Mitigation: complete DPIA where needed, prefer EU hosting for EU data, and keep an access audit trail.

### Next steps
- [ ] Install hty and add the hty skill: npx skills add LatentEvals/hty --skill hty or point an agent at https://hty.sh/skill.md; verify basic commands at https://hty.sh/.
- [ ] Run two smoke tests (create-next-app scaffold + gh auth login) 10 runs each; measure success rate and average time (target: >= 90% success, < 5 minutes per run).
- [ ] Configure session log retention (start at 7 days) and set RBAC; export an access audit.
- [ ] Draft a rollout gate: require security sign‑off, define retention policy, pilot list (1–3 users), and thresholds (>= 90% across 50 runs).
- [ ] If the pilot passes, schedule a 2‑week non‑prod pilot to track failure modes, user friction, and incremental costs.

Short closing: hty gives agents a human‑like way to use interactive CLIs. For solo founders and small teams, finish a 60–90 minute pilot, protect logs and secrets, and verify you meet numeric thresholds before broad automation (https://hty.sh/).
