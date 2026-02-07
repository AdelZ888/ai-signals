---
title: "Set up OpenClaw with the CLI onboarding: configure Gateway, seed workspace, install a daemon and add channels"
date: "2026-02-07"
excerpt: "Use the OpenClaw CLI onboarding to set up a local Gateway (port 18789) with token auth, seed ~/.openclaw/workspace, install a user daemon, and connect a messaging channel."
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "openclaw"
  - "onboarding"
  - "cli"
  - "gateway"
  - "workspace"
  - "daemon"
  - "channels"
  - "tutorial"
sources:
  - "https://docs.openclaw.ai/start/wizard"
  - "https://docs.openclaw.ai/start/wizard-cli-reference"
  - "https://getclawdbot.com/guides/install/"
---

## Builder TL;DR

Run the onboarding wizard to configure a local or remote OpenClaw Gateway and seed an agent workspace:

- Interactive: `openclaw onboard`
- Scripted: `openclaw onboard --non-interactive`

Expected immediate artifacts: `~/.openclaw/openclaw.json` (config), a seeded workspace at `~/.openclaw/workspace`, and a Gateway listening on port 18789 with token auth enabled (the wizard auto-generates a token even for loopback). See the onboarding overview and CLI reference: https://docs.openclaw.ai/start/wizard and https://docs.openclaw.ai/start/wizard-cli-reference. Platform installers: https://getclawdbot.com/guides/install/.

Quick checklist (minimal):

- [ ] Run `openclaw onboard`
- [ ] Choose QuickStart or Advanced
- [ ] Provide Anthropic API key or configure OpenAI/OAuth
- [ ] Connect at least one channel (e.g., Telegram bot token)
- [ ] Confirm daemon installed (LaunchAgent on macOS or systemd user unit on Linux/WSL2)

Notes: the wizard seeds the workspace and configures model/auth, gateway, channels, daemon, and skills (local flow). See: https://docs.openclaw.ai/start/wizard.

## Goal and expected outcome

Goal: install the OpenClaw CLI, run the onboarding wizard, connect at least one channel, and have a healthy Gateway plus a seeded agent workspace.

Acceptance criteria after a successful onboarding (based on the wizard behavior documented):

- Gateway configured (default port 18789) with token auth enabled and a generated token (the wizard generates a token even for loopback). See: https://docs.openclaw.ai/start/wizard.
- Seeded agent workspace at `~/.openclaw/workspace` containing bootstrap files for first-run. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- A user daemon installed to keep the Gateway running (LaunchAgent on macOS or a systemd user unit on Linux/WSL2). See: https://docs.openclaw.ai/start/wizard-cli-reference.

If any of the above do not materialize, re-run the wizard or use the CLI reference to inspect/reset config: https://docs.openclaw.ai/start/wizard-cli-reference.

## Stack and prerequisites

- Operating systems supported for local wizard flow: macOS, Linux, or Windows (via WSL2). See: https://docs.openclaw.ai/start/wizard.
- OpenClaw CLI installed and on PATH. Follow platform-specific install steps: https://getclawdbot.com/guides/install/.
- Model/auth access: the wizard recommends an Anthropic API key but also supports OpenAI (OAuth or keys) and other providers documented in the CLI reference. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- Channels: the wizard prompts for channel configuration; supported options include Telegram, WhatsApp, Discord, Google Chat, Mattermost, Signal, BlueBubbles, and iMessage per the CLI reference. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- File system and user permissions to write `~/.openclaw/workspace` and install a user daemon (LaunchAgent or systemd user unit).
- Optional: a Brave Search API key can be added via `openclaw configure --section web` to set `tools.web.search.apiKey`. See: https://docs.openclaw.ai/start/wizard.

Operational counts to plan for now (documented options): 8 channel choices, 6 provider options in the model/auth matrix, 2 daemon types, and the default Gateway port 18789. See the CLI reference: https://docs.openclaw.ai/start/wizard-cli-reference.

## Step-by-step implementation

1) Install the CLI

Follow the installer guide for your platform: https://getclawdbot.com/guides/install/.

```bash
# Verify install
openclaw --version
```

2) Run the onboarding wizard

```bash
# Interactive
openclaw onboard

# Non-interactive for scripted installs / CI
openclaw onboard --non-interactive
```

The wizard walks the local flow steps: model/auth, workspace, gateway, channels, daemon, and skills. QuickStart uses defaults; Advanced exposes all prompts. See: https://docs.openclaw.ai/start/wizard.

3) QuickStart vs Advanced (decision table)

| Setting | QuickStart (defaults) | Advanced |
|---|---:|---|
| Gateway bind | loopback (127.0.0.1) | custom bind |
| Gateway port | 18789 | custom port |
| Token auth | auto-generated (recommended) | manual options |
| Workspace | `~/.openclaw/workspace` | custom path |
| Tailscale | Off | optional |
| Channels | common defaults | full channel choices |

Reference: https://docs.openclaw.ai/start/wizard and https://docs.openclaw.ai/start/wizard-cli-reference.

4) Model & auth

Provide an Anthropic API key (recommended) or configure OpenAI/OAuth. The CLI supports additional providers per the reference. Optionally configure web search:

```bash
openclaw configure --section web
# sets tools.web.search.apiKey
```

See: https://docs.openclaw.ai/start/wizard-cli-reference and https://docs.openclaw.ai/start/wizard.

5) Workspace and seeds

Accept the default workspace `~/.openclaw/workspace` to receive seed files needed for first-run. The CLI reference documents the workspace layout and seed behavior. See: https://docs.openclaw.ai/start/wizard-cli-reference.

6) Gateway and daemon

Keep token auth enabled (the docs recommend keeping token auth even for loopback). Choose to install a LaunchAgent (macOS) or a systemd user unit (Linux/WSL2). The wizard runs a health check after starting the Gateway. See: https://docs.openclaw.ai/start/wizard-cli-reference.

7) Channels

Follow the channel prompts: Telegram requires a bot token; WhatsApp supports QR login. For channel-specific details consult the CLI reference: https://docs.openclaw.ai/start/wizard-cli-reference.

8) Health check and smoke test

The wizard performs a Gateway health check; to inspect status manually:

```bash
# Inspect core config
cat ~/.openclaw/openclaw.json
# Check Gateway port listening (Linux example)
ss -ltnp | grep 18789 || netstat -ltnp | grep 18789
# Open Control UI
openclaw dashboard
```

9) Re-run and reset behavior

If `~/.openclaw/openclaw.json` exists, the wizard offers Keep/Modify/Reset. `--reset` supports multiple scopes (Config only, Config + credentials + sessions, Full reset). See: https://docs.openclaw.ai/start/wizard-cli-reference.

Sample concrete config artifact (seeded or produced by the wizard). The fields below are illustrative and reflect keys referenced in the CLI excerpts (gateway.port, workspace, and tools.web.search.apiKey). Replace placeholder values as needed.

```json
{
  "workspace": "~/.openclaw/workspace",
  "gateway": {
    "bind": "127.0.0.1",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "<AUTO_GENERATED_TOKEN>"
    }
  },
  "tools": {
    "web": {
      "search": {
        "apiKey": "<BRAVE_SEARCH_API_KEY or empty>"
      }
    }
  }
}
```

Store secrets (API keys) in a secure vault; the wizard documents where it persists credentials and how reset scopes behave. See: https://docs.openclaw.ai/start/wizard-cli-reference.

## Reference architecture

Components (per the onboarding flow and CLI reference):

- Gateway: local loopback by default, listening on port 18789; can be configured to connect to a remote Gateway in Remote mode. See: https://docs.openclaw.ai/start/wizard.
- Agent workspace: `~/.openclaw/workspace` seeded by the wizard. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- Channels: supported channel list is documented in the CLI reference. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- Model/providers: Anthropic is recommended; other providers are documented in the CLI reference. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- Daemon: LaunchAgent (macOS) or systemd user unit (Linux/WSL2) to maintain Gateway process. See: https://docs.openclaw.ai/start/wizard-cli-reference.

Primary flows (as the wizard configures them): onboarding -> gateway start -> wizard health check -> channel message flow. The wizard documents the local vs remote mode behaviors and what it configures in each flow. See: https://docs.openclaw.ai/start/wizard-cli-reference.

## Founder lens: ROI and adoption path

Pilot plan and measurable thresholds to consider (operational hypotheses for rollout planning):

- Gate 1 (canary): onboard 5 internal seats (5% proxy) for a 1-week internal beta to validate setup and UX.
- Gate 2 (expanded): scale to 25 seats while monitoring API spend and error rates; set an interim cost guard (example: $500/week during beta).
- Gate 3: full rollout when reliability and cost metrics are acceptable and feature adoption is sufficient (target: >10% of target user base adopting the feature).

Cost controls and adoption levers (operational guidance):

- Start with conservative model settings and track token usage; you can set quotas such as 100k tokens/day or $100/day as early hard limits.
- Use Gateway token auth and channel allowlists as gating controls during rollout. See onboarding docs: https://docs.openclaw.ai/start/wizard.

Financial and operational thresholds to monitor during pilots: API spend per week ($500), per-day token quotas (100k tokens/day), pilot length (7 days), rollback budget (15 minutes for critical incidents), and usage scale steps (5 -> 25 -> 100 seats).

## Failure modes and debugging

Common issues and first-step diagnostics drawn from the CLI reference: https://docs.openclaw.ai/start/wizard-cli-reference.

- Existing config detected: if `~/.openclaw/openclaw.json` exists the wizard prompts Keep/Modify/Reset. If the config is invalid or contains legacy keys, the wizard stops and recommends `openclaw doctor`.

- Gateway not starting: confirm bind and port 18789, check token auth, and inspect daemon logs. Useful checks:

```bash
ps aux | grep openclaw
cat ~/.openclaw/openclaw.json
ss -ltnp | grep 18789
```

- Channel failures: verify bot tokens, service account JSONs, or completion of WhatsApp QR login and re-run the channel setup step in the wizard.

- Daemon issues: on Linux inspect the systemd user journal for the unit the wizard installed; on macOS verify the LaunchAgent state. If config drift exists, re-run the wizard with Modify/Reset or run `openclaw doctor`. See: https://docs.openclaw.ai/start/wizard-cli-reference.

## Production checklist

### Assumptions / Hypotheses

- The onboarding wizard will create or update `~/.openclaw/openclaw.json` and seed `~/.openclaw/workspace` when run in local mode (per the onboarding docs). See: https://docs.openclaw.ai/start/wizard and https://docs.openclaw.ai/start/wizard-cli-reference.
- API access: Anthropic or OpenAI keys (or OAuth flows) are available to complete model/provider setup; the CLI reference documents supported providers and auth options. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- Pilot hypotheses to validate: canary of 5 seats for 7 days, expanded 25 seats, and rollout to 100 seats; rollback budget of 15 minutes for critical incidents; quota candidates include 100k tokens/day or $100/day.

### Risks / Mitigations

- Risk: accidental external exposure when enabling Tailscale or custom bind — Mitigation: require manual approval and verify token auth before enabling (see wizard docs). Source: https://docs.openclaw.ai/start/wizard.
- Risk: leaked channel credentials — Mitigation: store secrets in an enterprise secret manager and keep only non-secret seeds in VCS. See CLI reference for reset and credential handling: https://docs.openclaw.ai/start/wizard-cli-reference.
- Risk: model cost spikes — Mitigation: start with conservative defaults, enforce daily/week quotas (e.g., 100k tokens/day or $100/day) and monitor provider billing closely.

### Next steps

- Automate non-interactive onboarding in CI: `openclaw onboard --non-interactive` with parameterized config templates and a sealed secret store. See: https://docs.openclaw.ai/start/wizard-cli-reference.
- Run a closed internal beta for at least 7 days behind an allowlist, track uptime and token spend, and verify end-to-end channel flows.
- Add monitoring and alerts for Gateway health-check failures and set an alert target to detect downtime within 5 minutes; automate rollback and credential rotation playbooks.

Methodology note: this guide follows the Onboarding Wizard and CLI reference excerpts and the installer guidance (https://docs.openclaw.ai/start/wizard, https://docs.openclaw.ai/start/wizard-cli-reference, https://getclawdbot.com/guides/install/).
