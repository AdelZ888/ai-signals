---
title: "Rig: per-agent Linux cloud desktops with dev servers and signed-in Chrome for AI agents"
date: "2026-09-25"
excerpt: "Rig provides per-agent Linux cloud desktops—each with a dev server, test runner and a signed-in Chrome that pauses when idle. Follow a hands-on guide to clone, launch and inspect one agent."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-25-rig-per-agent-linux-cloud-desktops-with-dev-servers-and-signed-in-chrome-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "rig"
  - "cloud-desktop"
  - "ai-agents"
  - "open-source"
  - "linux"
  - "dev-server"
  - "test-runner"
  - "signed-in-chrome"
sources:
  - "https://github.com/ShadowWalker2014/rig"
---

## TL;DR in plain English

- Rig is an open-source project that gives each AI "agent" its own Linux cloud desktop. (See https://github.com/ShadowWalker2014/rig)
- Each agent desktop includes a dev server, tests, and a signed-in Chrome that pauses when idle. (Source: https://github.com/ShadowWalker2014/rig)
- Quick actions: clone the repo, read README.md, run the example start script for one agent. (https://github.com/ShadowWalker2014/rig)

Quick checklist
- [ ] git clone https://github.com/ShadowWalker2014/rig
- [ ] Read README.md and the example start script(s) in the repo (https://github.com/ShadowWalker2014/rig)
- [ ] Start one agent desktop from the repo examples and open it in a browser (https://github.com/ShadowWalker2014/rig)

Methodology note: this guide is based on the repository snapshot at https://github.com/ShadowWalker2014/rig and the project description it contains.

## What you will build and why it helps

You will provision one cloud-hosted Linux desktop for a single AI agent using the Rig project as described in the repository. The repository summary states: "Open-source cloud desktops for AI agents. Each agent gets a Linux desktop with a dev server, tests and a signed-in Chrome that pauses when idle." (https://github.com/ShadowWalker2014/rig)

Simple benefits (mapped to the repo description):
- Isolation: agent work runs remotely, off your laptop. (https://github.com/ShadowWalker2014/rig)
- Reproducibility: the repo provides start scripts and examples to follow. (https://github.com/ShadowWalker2014/rig)
- Inspectability: you can view the signed-in Chrome session to watch agent activity. (https://github.com/ShadowWalker2014/rig)

Feature comparison (from the repository description)

| Feature                         | In repo description? | Notes / Source |
|--------------------------------|----------------------|----------------|
| Per-agent Linux desktop        | Yes                  | https://github.com/ShadowWalker2014/rig |
| Dev server inside desktop      | Yes                  | https://github.com/ShadowWalker2014/rig |
| Tests / test runner            | Yes                  | https://github.com/ShadowWalker2014/rig |
| Signed-in Chrome that pauses   | Yes                  | https://github.com/ShadowWalker2014/rig |

## Before you start (time, cost, prerequisites)

Read README.md in the repository first: https://github.com/ShadowWalker2014/rig

Minimum prerequisites
- git installed and ability to clone a public repo. (https://github.com/ShadowWalker2014/rig)
- A host to run the example start script (local Linux machine or cloud VM). (https://github.com/ShadowWalker2014/rig)
- A modern browser to open the remote desktop UI. (https://github.com/ShadowWalker2014/rig)

Quick estimates (validate these against your environment)
- Time to first working agent: ~90 minutes (clone, inspect, provision, launch).
- Cost: expect from $0.05 to $0.50 per hour depending on VM size and provider.
- Start with 1 agent. Validate before expanding to 3 concurrent agents.

## Step-by-step setup and implementation

Follow the repo README and the example scripts as the authoritative path: https://github.com/ShadowWalker2014/rig

1) Clone and inspect the repo

```bash
# clone and inspect README and example scripts
git clone https://github.com/ShadowWalker2014/rig
cd rig
ls -la
sed -n '1,120p' README.md
```

2) Read the example start script the README points to. Understand any environment variables and prompts before running. (https://github.com/ShadowWalker2014/rig)

3) Prepare a host. A local Linux host or a small cloud VM are both valid test platforms. Match any environment variables the scripts require. (https://github.com/ShadowWalker2014/rig)

4) Run the example start script for one agent. Follow the prompts and capture the output (URL, ports). (https://github.com/ShadowWalker2014/rig)

5) Verify the desktop and services. Open the desktop URL printed by the script. Check the dev server and test runner inside the desktop. (https://github.com/ShadowWalker2014/rig)

Example verification commands (use values from the script output):

```bash
# check a dev server port shown by the repo's start output
curl -I http://<VM-IP>:<PORT>

# quick host health snapshot (adjust user and IP)
ssh user@<VM-IP> "uptime; free -m; df -h"
```

Optional local smoke test (example, not from the repo):

```yaml
# docker-compose.yml - local smoke test to mimic a desktop container
version: '3.8'
services:
  dev-desktop:
    image: ubuntu:22.04
    container_name: rig-dev-desktop
    tty: true
    volumes:
      - ./workspace:/home/dev/workspace
    ports:
      - "8080:8080" # dev server port
    command: /bin/bash -lc "apt-get update && apt-get install -y python3 && cd /home/dev/workspace && python3 -m http.server 8080"
```

Run the smoke test locally:

```bash
docker-compose up --build -d
# then open http://localhost:8080
```

Always reconcile this example with the official start scripts and README in the repository: https://github.com/ShadowWalker2014/rig

## Common problems and quick fixes

Start with the repository README and any logs the start script creates: https://github.com/ShadowWalker2014/rig

Problem: Dev server unreachable
- Confirm which port the start script exposes. (https://github.com/ShadowWalker2014/rig)
- Verify host firewall and cloud security group rules allow that port. Aim to open only the needed port (e.g., a single dev port such as 8080) and keep other ports closed.
- From another host, run the curl check shown above.

Problem: Chrome session behavior differs from expectations
- The repo description mentions a signed-in Chrome that pauses when idle. Verify the start script and any credential handling to confirm how sign-in and pause are implemented. (https://github.com/ShadowWalker2014/rig)

Problem: Start script errors
- Re-run the start script and capture stdout/stderr to a file.
- Inspect logs written by the scripts. Example tail command:

```bash
# tail the most recent 200 lines of any log directory the start script uses
ssh user@<VM-IP> "tail -n 200 ~/rig/logs/* || ls -la ~/rig/logs"
```

If the start script requires env vars, check you set them before running. See README.md and any example .env files in the repo: https://github.com/ShadowWalker2014/rig

## First use case for a small team

This workflow is for solo founders or teams of up to 3 people. All canonical scripts live in the repository: https://github.com/ShadowWalker2014/rig

Canary and collaborate (1–3 person example):
1) Canary run: clone the repo and start one agent desktop. Command sequence: git clone https://github.com/ShadowWalker2014/rig then run the example start script pointed to by README.md. (https://github.com/ShadowWalker2014/rig)
2) Local smoke test: run the docker-compose example above to validate your local workflow before cloud provisioning.
3) Capture artifacts: when the agent reproduces an issue, save logs, a browser snapshot, and a link to the desktop. Attach them to an issue for teammates.
4) Cost guard: limit exposure by starting with a single agent and enforcing a short canary window (e.g., 7 days). Track hourly spend and stop if you exceed your ceiling.

Team workflow (3-person): Person A provisions a canary desktop and runs failing tests. Person A saves logs and screenshot and files an issue. Persons B and C reproduce using the repo start script. Keep configs under version control for consistency. (https://github.com/ShadowWalker2014/rig)

## Technical notes (optional)

- The repository description states per-agent Linux desktops with a dev server, tests, and a signed-in Chrome that pauses when idle. Inspect the repo files for exact implementation and flags: https://github.com/ShadowWalker2014/rig
- Keep credentials out of source. Use ephemeral credentials or a secrets manager and supply them via environment variables at runtime.

Example .env snippet (example only):

```env
# .env.example
RIG_AGENT_NAME=canary-1
RIG_DEV_PORT=8080
RIG_IDLE_TIMEOUT_MIN=30
```

Example idle-detect placeholder (adapt to repo utilities):

```bash
# placeholder idle detect - adapt to repo scripts
if ./detect-no-active-sessions.sh --idle-min 30; then
  echo "Idle for 30 min, consider shutting down"
fi
```

See the repository for exact tools, scripts, and supported flags: https://github.com/ShadowWalker2014/rig

## What to do next (production checklist)

### Assumptions / Hypotheses

These items are explicit assumptions you must validate against the repository and your environment: (https://github.com/ShadowWalker2014/rig)
- Time to first working agent: ~90 minutes to clone, read, provision, and launch.
- Canary duration: 7 days for an initial validation window.
- Idle shutdown candidate: 30 minutes of inactivity (proposal; confirm whether the repo supplies this behavior).
- CPU scale-up threshold (proposal): 75% sustained for 5 minutes.
- Starting VM sizes to validate: small = 2 vCPU / 4 GB RAM; medium = 4 vCPU / 8 GB RAM; large = 8 vCPU / 16 GB RAM.
- Cost estimate range to validate: $0.05–$0.50 per hour.
- Initial concurrent agents: start with 1 (canary); expand to 3 after validation.
- Snapshot retention: keep 3 snapshots per agent for 30 days.

### Risks / Mitigations

- Risk: secrets committed to repo. Mitigation: use a secrets manager and exclude .env files from version control.
- Risk: runaway cloud costs from always-on desktops. Mitigation: enforce short idle windows (e.g., 30 minutes) and daily budget alerts.
- Risk: inconsistent configs across team. Mitigation: require PR review for start script or config changes.
- Risk: missing reproducibility artifacts. Mitigation: capture logs, browser snapshots, and at least 3 artifacts per incident.

Source for feature claims: https://github.com/ShadowWalker2014/rig

### Next steps

- Clone and validate the repository quickstart: git clone https://github.com/ShadowWalker2014/rig and run the example start script for a single agent. (https://github.com/ShadowWalker2014/rig)
- Run the local smoke test above, then run a single cloud VM test.
- Add minimal telemetry: collect CPU, memory, and active browser session counts. Alert at 75% CPU sustained for 5 minutes.
- Run a 7-day canary with 1 agent. If reproducibility, cost, and stability targets are met, expand to 3 agents behind rollout gates.

Final reminder: inspect README.md and the example start script(s) in the repository before running commands: https://github.com/ShadowWalker2014/rig
