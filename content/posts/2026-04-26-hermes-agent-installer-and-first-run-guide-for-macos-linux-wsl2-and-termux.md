---
title: "Hermes Agent: installer and first-run guide for macOS, Linux, WSL2 and Termux"
date: "2026-04-26"
excerpt: "Independent guide that walks through choosing macOS, Linux, WSL2 or Termux, running the official one-line installer, reloading the shell, and the essential post-install Hermes commands."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-26-hermes-agent-installer-and-first-run-guide-for-macos-linux-wsl2-and-termux.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "beginner"
timeToImplementMinutes: 30
editorialTemplate: "TUTORIAL"
tags:
  - "hermes-agent"
  - "installation"
  - "macos"
  - "linux"
  - "wsl2"
  - "termux"
  - "guide"
sources:
  - "https://ai-hermes-agent.com/install"
---

## TL;DR in plain English

- Choose a supported host: macOS, Linux, WSL2 (Windows Subsystem for Linux), or Android via Termux. See the official host guidance: https://ai-hermes-agent.com/install
- Run the recommended one-line installer, reload your shell, then run health checks. The installer one-liner appears on the install page: https://ai-hermes-agent.com/install

One-line installer (recommended):

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

Quick post-install checks (reload your shell first):

```bash
hermes         # launch or print help
hermes model   # configure or list models
hermes doctor  # run diagnostics
hermes update  # upgrade the agent
```

Key prerequisites: shell access, curl, and a model-provider API key (bring the key or compatible endpoint before configuring your first model). Time estimates: quick test 5–15 minutes; production readiness typically 1–2 hours or more. See install reference: https://ai-hermes-agent.com/install

Numbers to keep in mind up front: 1 installer script, 4 supported host families, 5–15 min quick test, 1–2 h production prep, 1–5 canary users for initial trials, 7–14 day private test window. See https://ai-hermes-agent.com/install

## What you will build and why it helps

You will install Hermes Agent on a host you control to run a local assistant runtime that calls an external model provider using an API key or compatible endpoint you supply. This lets a solo founder or small team iterate privately, wire simple automations, and expose a single gateway (webhook or messaging bridge) with a small blast radius. The official install guide recommends the one-line installer and lists supported hosts: https://ai-hermes-agent.com/install

Plain-language summary:

- Hermes is a CLI program installed on your PATH that helps configure models and gateways and run a local assistant process.
- The installer places a hermes command on the system and provides helpers (model config, gateways, diagnostics) to verify the runtime. See https://ai-hermes-agent.com/install

Host decision table (from the install guidance):

| Host | Best for | Key note |
|------|----------|----------|
| macOS | Personal always-on machine | Good default for a Mac mini or workstation; see https://ai-hermes-agent.com/install |
| Linux | VPS, homelab, cloud | Best for continuous background runs and remote deployments; see https://ai-hermes-agent.com/install |
| WSL2 | Windows-first developers | Use WSL2 rather than native Windows; recommended path. See https://ai-hermes-agent.com/install |
| Termux (Android) | Mobile experimentation | Runs with a curated extra dependency set. See https://ai-hermes-agent.com/install |

Concrete benefit for small teams: run one Hermes instance on a Linux VPS or a personal macOS machine, start with 1–5 canary users for 7–14 days, and expand incrementally once smoke tests are green. Reference: https://ai-hermes-agent.com/install

## Before you start (time, cost, prerequisites)

Estimated time:

- Quick test install and verification: 5–15 minutes.
- Production-ready setup (secrets, monitoring, backups): 1–2 hours or more.

Pre-install checklist:

- [ ] Confirm your host is supported (macOS, Linux, WSL2, or Android via Termux) — https://ai-hermes-agent.com/install
- [ ] Ensure shell access and curl are available (installer uses curl) — https://ai-hermes-agent.com/install
- [ ] Choose an install path and ensure it is writable.
- [ ] Bring a model-provider API key or compatible endpoint before configuring your first model — https://ai-hermes-agent.com/install

Cost note: The installer script is publicly hosted on GitHub; model-provider usage and VPS costs are separate. Bring your own API key and budget accordingly. See install source: https://ai-hermes-agent.com/install

Example minimal model config (do not commit secrets):

```yaml
# example hermes model config (do not commit secrets)
models:
  default:
    provider: example-provider
    api_key: "${HERMES_API_KEY}"
    endpoint: "https://api.example-provider.com/v1"
```

Store secrets in environment variables or a secrets manager. See install guidance: https://ai-hermes-agent.com/install

## Step-by-step setup and implementation

Follow the official installer guidance at https://ai-hermes-agent.com/install. Condensed common path:

1. Pick your host. macOS suits a personal always-on machine; Linux suits VPS/homelab/cloud. If on Windows, use WSL2. For Android, use Termux with the curated extras. See https://ai-hermes-agent.com/install
2. Run the official installer as the user who will own the hermes process:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

3. Reload your shell immediately after install so hermes is on PATH. Close and reopen the terminal or source your profile. The installer prints PATH changes—follow them. See https://ai-hermes-agent.com/install
4. Run first verification commands:

```bash
hermes               # start/help
hermes model list    # list configured models
hermes setup         # first-time configuration helper
hermes gateway list  # view configured gateways
hermes doctor        # diagnostics
hermes update        # upgrade the agent
```

5. Configure a model provider key. The install guidance explicitly says: "Bring an API key or compatible endpoint before you configure your first model." Set the key in an environment variable like HERMES_API_KEY or in the agent config file. See https://ai-hermes-agent.com/install
6. Minimal rollout gates to reduce risk:
   - Canary: run on 1 host for 1–5 users.
   - Smoke tests: keep 3 representative prompts and expect non-error responses from hermes doctor and the CLI.
   - Rollback: disable gateway access and restore a prior config snapshot if tests fail. Reference: https://ai-hermes-agent.com/install

## Common problems and quick fixes

- Problem: Trying to run Hermes on native Windows.
  - Fix: Use WSL2 and install Hermes inside the Linux environment; the guide recommends WSL2 as the supported Windows path. See https://ai-hermes-agent.com/install

- Problem: Missing curl or installer download failing.
  - Fix: Install curl via your package manager and verify connectivity to raw.githubusercontent.com; the installer command is shown on the official page: https://ai-hermes-agent.com/install

- Problem: hermes command not found after install.
  - Fix: Reload your shell (close/open terminal or source your profile) and follow PATH directions printed by the installer. Reference: https://ai-hermes-agent.com/install

- Problem: Model authentication errors.
  - Fix: Export HERMES_API_KEY or add the provider endpoint to the config before running hermes model or hermes setup. The install page instructs you to bring a model API key: https://ai-hermes-agent.com/install

- Problem: Termux dependency issues on Android.
  - Fix: Follow the Termux-specific guidance in the official docs; Termux requires a curated extra dependency set. See https://ai-hermes-agent.com/install

Quick health rule: require hermes doctor to report no errors and pass 3 smoke prompts before promoting beyond a canary host. See diagnostics on install page: https://ai-hermes-agent.com/install

## First use case for a small team

Target audience: solo founders and small teams (1–4 people) who want a low-cost, low-risk starting point.

Objective: run Hermes to triage messages, draft short release notes, and automate one workflow while keeping exposure, cost, and maintenance minimal.

Concrete, actionable starter steps (each step is testable and reversible):

1) Single-host, fast install (1 host, ~10 min).
   - Pick macOS for a single personal machine or a small Linux VPS (1 vCPU, 1–2 GB RAM) for always-on access. Install via the official one-liner: https://ai-hermes-agent.com/install
   - Command to install and verify in sequence:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.profile   # or restart terminal to refresh PATH
hermes doctor       # expect no errors before continuing
```

2) Secrets and cost controls (immediate, required).
   - Store HERMES_API_KEY in a secrets manager or CI secret; inject it at runtime. Do not commit keys to git.
   - Configure simple request limits in your gateway or model wrapper: 60 s timeout, 1000 token budget per interactive request, and a 3-retry policy for transient errors.

3) Minimal gateway and access policy (1 gateway, 7–14 day trial).
   - Enable only one gateway (private webhook or direct CLI) and restrict access to 1–5 canary users for 7–14 days.
   - Run 3 smoke prompts after each deploy and require hermes doctor success before expanding access.

4) Basic observability and restart policy (automate within 30 min).
   - Create a simple systemd service or supervisor with automatic restart on failure and a log rotation policy. Check hermes doctor every 5–15 minutes via cron or scheduler.

5) Version pinning and rollback (safety step).
   - Record the installer commit SHA or vendor the install.sh into your deployment repo so you can reinstall a known-good version and roll back within 15 min if needed. See install guidance: https://ai-hermes-agent.com/install

Small-team checklist (copyable):

- [ ] Pick host and run the official installer (https://ai-hermes-agent.com/install)
- [ ] Store API key in a secrets manager and inject at runtime
- [ ] Enable only one gateway and limit to 1–5 canary users for 7–14 days
- [ ] Require hermes doctor + 3 smoke prompts before expanding access
- [ ] Pin installer SHA in the repo and create a simple rollback plan

Numbers to track initially: 1 host, 1 gateway, 3 smoke prompts, 7–14 day private test window, 1–5 canary users, 60 s timeout, 1000 token per request, 3 retries. See https://ai-hermes-agent.com/install

## Technical notes (optional)

- Installer source: the official installer script is hosted at the GitHub raw URL used by the recommended one-liner; the install page references that script and the official docs: https://ai-hermes-agent.com/install
- Supported hosts: Linux, macOS, WSL2, and Android via Termux are explicitly listed on the install page: https://ai-hermes-agent.com/install
- Official vs contributor installs: the official installer is the recommended path unless you are doing contributor or edge-case setup; follow contributor docs if you are building from source. See https://ai-hermes-agent.com/install

Methodology note: this guide strictly follows the host and installer guidance shown on the official install page: https://ai-hermes-agent.com/install

## What to do next (production checklist)

### Assumptions / Hypotheses

- The one-line installer is the recommended quick path; pin the install.sh commit SHA before use (see https://ai-hermes-agent.com/install).
- Suggested rollout thresholds (treat as hypotheses until validated):
  - 500 ms median response target for simple smoke prompts
  - 99% availability goal for the canary host
  - 3 retries for short transient errors
  - 60 s request timeout for gateway calls
  - 1000 token budget per interactive request
  - 10% initial error budget for canary traffic
  - $0 baseline for agent code (model/API costs vary by provider)
  - 24/7 desired uptime for production agents

Validate these numbers with your model provider, monitoring, and load testing before accepting them as firm requirements. See install reference: https://ai-hermes-agent.com/install

### Risks / Mitigations

- Risk: running an unreviewed remote installer.
  - Mitigation: review the installer script and pin the commit SHA or vendor the script into your CI/deployment repo (see https://ai-hermes-agent.com/install).
- Risk: leaking model API keys.
  - Mitigation: use a secrets manager, inject keys at runtime, and do not store keys in version control.
- Risk: unexpected production instability.
  - Mitigation: start with a single canary host, require hermes doctor + 3 passing smoke prompts as release gates, and keep a rollback plan (disable gateway and restore previous config snapshot).

### Next steps

- Pin and vendor: copy or pin the installer script to a commit SHA in your deployment repository.
- Service: create a reproducible service start (systemd service, container entrypoint, or similar) and configure automatic restarts on failure.
- Secrets: move API keys to your secrets manager and inject them at service start.
- Monitoring: add logs, uptime checks, and run hermes doctor every 5–15 minutes via cron or a scheduler.
- Iterate: expand gateway access incrementally (1 user → 5 users → 10+), and document install and configuration decisions in a team repo.

Authoritative install reference and host guidance: https://ai-hermes-agent.com/install
