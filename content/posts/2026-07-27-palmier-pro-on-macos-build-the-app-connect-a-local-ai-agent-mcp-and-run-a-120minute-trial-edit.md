---
title: "Palmier Pro on macOS — build the app, connect a local AI agent (MCP), and run a 120‑minute trial edit"
date: "2026-07-27"
excerpt: "Step-by-step: clone and run Palmier Pro on macOS, connect a local MCP AI agent (Claude/Codex), and run a 120-minute trial edit to reduce export/import cycles."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-27-palmier-pro-on-macos-build-the-app-connect-a-local-ai-agent-mcp-and-run-a-120minute-trial-edit.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "palmier"
  - "macOS"
  - "video-editing"
  - "AI"
  - "agents"
  - "open-source"
  - "Claude"
  - "Codex"
sources:
  - "https://github.com/palmier-io/palmier-pro"
---

## TL;DR in plain English

- Palmier Pro is described on its repository landing page as a macOS video editor built for AI: https://github.com/palmier-io/palmier-pro. Use that page as the authoritative source for files, scripts, and release assets.
- This guide shows a pragmatic path to: clone the repo, run a local dev instance or build the app, connect an AI agent (or a hosted API), and run one end‑to‑end edit to see if AI-assisted edits reduce manual export/import loops.
- Time estimates: quick trial ~120 minutes; fuller local build + indexing 3–6 hours.

Quick checklist (30s skim)
- Clone and read the repo: git clone https://github.com/palmier-io/palmier-pro
- Start a local dev instance and run one demo agent edit
- Request 3 variants and review; limit re‑generations to 2 per clip

Concrete example (short scenario)
- Team: 2 people (creative + tech).
- Goal: produce one 60–90s promo. Import 3 source clips (<2 GB total). Ask the AI agent for 3 transition variants and 2 subtitle timing proposals. Review and apply one variant. Timebox the trial to 120 minutes.

Plain-language note before advanced details
- "Agent" here means a component that calls an AI model to suggest edits. "API" means application programming interface — the network endpoint the agent uses. "ffmpeg" is a common command‑line tool for media transcode and thumbnails. "Xcode" is Apple’s macOS development toolset. Keep secrets (API keys) in environment variables or the OS keychain, not in plain files.

## What you will build and why it helps

Using the code referenced at https://github.com/palmier-io/palmier-pro you will:
- Run a macOS build or a local development instance.
- Connect an AI agent or hosted AI API.
- Run one end‑to‑end edit where the agent suggests or applies timeline changes.

Why this helps (expected outcomes)
- Faster iterations: the goal is to reduce a manual export/import cycle by roughly half for short clips (example: a 60–90s promo with 3 variants).
- Fewer handoffs: designers export less; engineers do less wiring to test small creative changes.
- Reproducibility: keep a single shared project folder plus one small config file so 2–3 teammates can reproduce results.

Target example repeated: a 2–3 person team producing a 60–90s clip, generating 3 transition variants, and limiting AI re‑generations to 2 attempts per clip.

Reference: project landing page at https://github.com/palmier-io/palmier-pro.

## Before you start (time, cost, prerequisites)

Time estimates
- Quick trial: ~120 minutes to clone, launch, and run one demo edit.
- Full local build + indexing: plan 3–6 hours.

Cost
- The repository is public: cloning is free. Hosted AI API usage will incur separate costs. Example pilot budgets: $0–$200. For small pilots, plan caps of $20–$200.

Hardware & OS
- macOS is the intended platform per the repo: https://github.com/palmier-io/palmier-pro.
- Disk: reserve >= 20 GB free for media and caches.
- Memory: recommend >= 8 GB free RAM for moderate projects.

Software & prerequisites (illustrative)
- Git and macOS build tools (Xcode) if you will build native binaries.
- ffmpeg for thumbnails and transcodes (install via Homebrew if needed).
- A hosted AI API or local agent runtime, and any API keys required.

Preflight checklist
- [ ] Confirm you can access https://github.com/palmier-io/palmier-pro
- [ ] macOS build tools or a prebuilt binary available
- [ ] Git installed and authenticated
- [ ] Disk space >= 20 GB
- [ ] API keys prepared (if using hosted agents)

Notes about claims in this guide
- This document treats the repository landing page as the primary source. Where filenames, ports, or scripts are not explicit in the repo, examples below are illustrative. See Assumptions / Hypotheses at the end for details you must verify.

## Step-by-step setup and implementation

1) Clone and inspect

```bash
# clone the repo referenced on the project page
git clone https://github.com/palmier-io/palmier-pro
cd palmier-pro
ls -la
# open README and any BUILD or RUN docs
```

- After cloning, open the README and any BUILD or RUN documentation in the repo. Treat those files as canonical for exact commands.

2) Install common prerequisites (illustrative)

```bash
# example installs (adjust to your environment)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install ffmpeg git
```

- This example uses Homebrew on macOS to install ffmpeg and git. If you already have these, skip installation.

3) Build or use a prebuilt app
- If the repository publishes release binaries, consider using a release. Otherwise open the Xcode workspace and build the macOS app on a machine with Xcode.

4) Start a local helper service (illustrative)
- Many AI workflows use a small helper service to accept agent requests. Confirm the repository for exact scripts and ports.

```bash
# illustrative: run a local helper server on port 3000
./scripts/start-mcp.sh --port 3000
# or (Node example)
node server/index.js --port=3000
```

- If the repo provides a different script, use that. Keep helper services bound to 127.0.0.1 until you add authentication.

5) Minimal example config (YAML, illustrative)

```yaml
# config.yaml (illustrative values)
mcpPort: 3000
agentEndpoint: "https://your-agent.example/api"
agentApiKeyEnv: "AGENT_API_KEY"
ffmpegPath: "/usr/local/bin/ffmpeg"
embeddingBatchSize: 128
agentRetries: 3
```

- Store secrets in environment variables or the OS keychain rather than in plaintext files.

6) Try a demo flow
- Create a project in the app. Import 3–10 source files (keep the initial test set < 5 GB). Request 3 transition variants and 2 subtitle timing proposals. Review results and apply one.

7) Guardrails and thresholds (examples)
- Canary to 2% of projects or 1–2 pilot projects for 7–14 days.
- Feature flags: keep AI edits disabled for most users until validated.
- Rollback triggers: errors > 5% of commands or agent latency > 2,000 ms sustained for 10 minutes.

8) Save artifacts
- Keep config.yaml, a one‑page runbook, and any embedding index files so runs can be reproduced.

Reference: https://github.com/palmier-io/palmier-pro.

## Common problems and quick fixes

Reference repository page: https://github.com/palmier-io/palmier-pro.

Troubleshooting checklist (quick)
- Server unreachable: check firewall, port binding (example port 3000), host address (127.0.0.1 vs 0.0.0.0).
- macOS permissions: grant Files and Folders or Full Disk Access in System Settings if imports fail.
- Missing transcodes/thumbnails: install ffmpeg and re-run media preprocess.
- Agent API rate limits: implement retries=3 with exponential backoff (base wait 500 ms, max wait 5,000 ms) and set billing alerts at 50% of your monthly budget.

Quick troubleshooting table

| Symptom | Quick check | Action |
|---|---:|---|
| Server not reachable | port open? (e.g., 3000) | netstat/lsof; update config port |
| Thumbnails missing | ffmpeg present? | brew install ffmpeg; run media preprocess script |
| API 429 | usage spike? | throttle; add retries (3) and backoff (500 ms base) |

Performance knobs to monitor
- Agent call latency: target < 500 ms for local calls; accept <= 2,000 ms for remote APIs under load.
- Index build time: measure minutes per GB for 1 GB, 5 GB, and 20 GB libraries.

## First use case for a small team

Reference: https://github.com/palmier-io/palmier-pro.

Scenario: you are a solo founder or a small team (1–3 people) producing a 60–90s launch clip and want to validate AI edits quickly with low cost and low risk. Follow these actionable steps.

Actionable points (solo founders / small teams)
1) Start tiny and timebox: run a single 120‑minute trial with 3 source files totaling < 2 GB. Measure end‑to‑end: import → agent request → returned suggestion → apply. Record one baseline metric: full cycle elapsed time.
2) Limit API spend and retries: set a hard per‑project cap of $20 for the first two pilots and limit agentRetries to 2; set an alert at 50% of that cap. This keeps pilot cost predictable.
3) Re‑use one local index and a single shared project folder: keep embeddings and metadata under one path so results are reproducible. Batch indexing with batchSize=128 (illustrative) overnight to avoid daytime stalls.
4) Two‑person review rule: require one creative owner + one technical reviewer to sign off on any AI edit before export. Limit AI re‑generations to 2 attempts per clip to avoid endless loops.
5) Fallback plan: keep a manual export path ready. If agent latency > 2,000 ms or error rate > 5% during a 10‑minute window, disable AI edits and continue manual work.

Practical checklist for rollout (solo/small team)
- [ ] Run the 120‑minute trial with 3 files (< 2 GB)
- [ ] Set per‑project spend cap = $20 and alert at 50%
- [ ] Limit re‑generations to 2 per clip
- [ ] Agree review rule (creative + technical) prior to export

Notes: this sequence prioritizes speed (120 minutes), cost control ($20 cap), and reproducibility (single index). See https://github.com/palmier-io/palmier-pro for the repo context.

## Technical notes (optional)

High level: the repository landing page states Palmier Pro is a macOS video editor built for AI: https://github.com/palmier-io/palmier-pro.

Config knobs you may tune (illustrative)
- mcpPort: 3000
- embeddingBatchSize: 128
- agentRetries: 3
- ffmpegTranscodePreset: "medium"

Collect these metrics
- Agent latency (ms): target < 500 ms local, accept <= 2,000 ms remote.
- Index time (minutes per GB): baseline for 1 GB, 5 GB, 20 GB.
- Error rate (%): alert at > 5% in a 10‑minute window.

Security basics
- Keep API keys in environment variables or the OS keychain. Prefer binding helper services to 127.0.0.1 until you add authentication and monitoring.

Reference: https://github.com/palmier-io/palmier-pro.

## What to do next (production checklist)

### Assumptions / Hypotheses
- The repository landing page identifies Palmier Pro as a macOS video editor built for AI: https://github.com/palmier-io/palmier-pro. This guide uses that page and the README as the authoritative source. Many example commands, ports (for example: 3000), script names, config keys (mcpPort, embeddingBatchSize) and thresholds in this document are illustrative; verify exact names and values in the repository before running commands.

### Risks / Mitigations
- Risk: exposing a helper service increases attack surface. Mitigation: bind to 127.0.0.1, use API keys, and add authentication before opening to other hosts.
- Risk: unexpected agent API costs. Mitigation: set billing alerts at 50% of your monthly budget, apply per‑project caps (example caps: $20–$200), and limit retries to 2–3.
- Risk: indexing consumes disk and RAM. Mitigation: require >= 20 GB disk and recommend >= 8 GB free RAM; run large index builds overnight.

### Next steps
- Verify the README, scripts, and release assets at https://github.com/palmier-io/palmier-pro and replace illustrative commands with repo‑accurate ones.
- Run a 14‑day pilot: 1–3 projects, 2–3 people, monitor error rate, latency, and spend.
- Add smoke tests: start app, import a test clip, request an agent edit, and verify a timeline change within 2,000 ms for local calls (target < 500 ms when possible).
- Canary rollout path: 2% → pilot (1–3 projects for 7–14 days) → wider rollout after QA, security, and cost thresholds are met.
