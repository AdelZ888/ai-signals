---
title: "ghbrk: run git and the GitHub CLI for AI agents without sharing SSH keys or tokens"
date: "2026-07-02"
excerpt: "Deploy ghbrk, a Rust credential broker that lets AI agents run git and the GitHub CLI without exposing SSH keys or API tokens. Uses a root-owned policy and centralized logs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-02-ghbrk-run-git-and-the-github-cli-for-ai-agents-without-sharing-ssh-keys-or-tokens.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "ghbrk"
  - "git"
  - "github"
  - "agents"
  - "security"
  - "rust"
  - "credential-broker"
sources:
  - "https://github.com/marconae/ghbrk"
---

## TL;DR in plain English

- What this is: ghbrk (https://github.com/marconae/ghbrk) is a small credential broker written in Rust. It performs git and GitHub CLI (gh) operations on behalf of agents without handing out SSH keys or GitHub API tokens. The broker enforces each operation using a policy file that must be owned by root.
- Why it helps: you cut down on exposed credentials and centralize who controls what an agent can do. That reduces the blast radius and makes auditing easier.
- Quick plan: clone the repo or fetch a release, place a root-owned policy on the host, run ghbrk in a trusted VM or container, test read-only actions for ~90 minutes, then stage writes behind a gate for 7–14 days.
- Time/cost targets: one quick smoke test in ~90 minutes; 60–120 minutes for validation. Run on a micro VM (virtual machine, 1 CPU, 512–1024 MB RAM) at roughly $0–$10/month.

Concrete example scenario: a 3-person team wants an AI helper to read repos and open pull requests (PRs). Start the broker with a read-only policy. Let the helper read code for two weeks and log every request. If logs show only expected reads, add narrow write rules to allow creating PRs.

Reference: https://github.com/marconae/ghbrk

## What you will build and why it helps

You will deploy one trusted ghbrk instance from https://github.com/marconae/ghbrk. The repository describes a credential broker that gives coding agents git and gh access without exposing SSH keys or tokens, gated by a root-owned policy, and written in Rust. These points are core facts from the project description.

Core guarantees (as stated in the repo):

- Agents do not receive raw SSH keys or API tokens.  
- Each operation is checked against a policy that is owned by root.  
- The project is implemented in Rust.

Why this matters in practice:

- Limit blast radius: revoke or change one policy file instead of rotating many long-lived tokens. Example: instead of rotating 50 tokens, update one policy.  
- Centralize audit: all brokered operations can be logged and forwarded to a central store.  
- Safer experimentation: run read-only traffic first, then add limited write rules after a staging period.

Reference: https://github.com/marconae/ghbrk

## Before you start (time, cost, prerequisites)

Estimated time and cost

- First smoke test: ~90 minutes.  
- Full basic validation: 60–120 minutes.  
- Staging window before broader rights: 14 days (2 weeks).  
- Cost: one micro VM/container (1 CPU, 512–1024 MB RAM), typical budget $0–$10/month.

Prerequisites

- Admin/root access to the host so the policy file can be owned by root.  
- Git installed or network access to fetch releases from https://github.com/marconae/ghbrk.  
- Network access to GitHub for repo operations.  
- A plan for log collection and retention (target: 90 days).  

Preflight checklist

- [ ] Host or container with admin/root access.  
- [ ] Git or release binary available from https://github.com/marconae/ghbrk.  
- [ ] Plan for log export and 90-day retention.  
- [ ] Agent runtime sandboxed with no baked-in SSH keys or API tokens.

Quick compatibility guidance

- Staging period: run in staging before production (14 days recommended).  
- Audit retention: export logs to a SIEM (security information and event management) or object store for 90 days.  
- Canary size: start small (for example, 10% of agent requests).

Reference: https://github.com/marconae/ghbrk

## Step-by-step setup and implementation

Plain-language explanation before advanced details

This section gives a practical sequence: obtain code or a binary, create and protect a root-owned policy, run ghbrk in a trusted environment, and test with a controlled agent. The code snippets below are concrete examples to make setup reproducible. Treat the policy JSON, Dockerfile, and systemd unit as illustrative. Always verify the exact policy schema and CLI flags against the repository and release you use.

All steps assume the ghbrk repo is authoritative: https://github.com/marconae/ghbrk

1) Acquire the source or binary

```bash
git clone https://github.com/marconae/ghbrk.git
cd ghbrk
# If you build locally and have Rust installed (cargo):
cargo build --release
# built binary typically at target/release/ghbrk
```

2) Create and protect a root-owned policy (concrete artifact)

Place a policy file on the host and make it owned by root with strict permissions. The JSON below is a concrete starting artifact for a read-only policy. It is illustrative—verify the exact policy schema in the repository before production.

```json
{
  "version": "1",
  "rules": [
    {
      "id": "read-only-repos",
      "allow": ["repo:your-org/*:read"]
    }
  ]
}
```

Install it with OS ownership/permissions:

```bash
sudo mkdir -p /etc/ghbrk
sudo tee /etc/ghbrk/policy.json > /dev/null <<'POL'
{ "version": "1", "rules": [{ "id": "read-only-repos", "allow": ["repo:your-org/*:read"] }] }
POL
sudo chown root:root /etc/ghbrk/policy.json
sudo chmod 0400 /etc/ghbrk/policy.json
```

3) Optional: container image (concrete Dockerfile)

You can run ghbrk in a minimal container. This example assumes you copied a release binary into the image; pin to a release hash in production.

```dockerfile
FROM debian:12-slim
COPY ghbrk /usr/local/bin/ghbrk
RUN useradd --system --home /nonexistent ghbrk
USER ghbrk
ENTRYPOINT ["/usr/local/bin/ghbrk", "--policy", "/etc/ghbrk/policy.json"]
```

4) Run and monitor

Run ghbrk on a trusted host or container. Forward logs to your collector and set a liveness/health target (example: <200 ms probe latency). Alert if denied or failed-auth requests exceed an investigatory threshold (example: >1% in 24 hours).

5) Service management (example systemd unit)

```ini
[Unit]
Description=ghbrk broker
After=network.target

[Service]
ExecStart=/opt/ghbrk/ghbrk --policy /etc/ghbrk/policy.json
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

6) Test with a non-privileged agent

- Start with read-only operations: clone and pull.  
- Log all operations and review them.  
- If you need writes, stage them: run a limited set of write operations in staging (for example, 50 controlled write ops), and monitor for unexpected behavior.

Reference: https://github.com/marconae/ghbrk

## Common problems and quick fixes

- Broker rejects requests (permission error): check the request scope against the policy and confirm /etc/ghbrk/policy.json is owned by root and mode 0400.  
- Agent still has keys or tokens: audit the agent container for mounted secrets and environment variables. Ensure no tokens are baked into images.  
- No audit logs: verify log forwarding and check that disk or network issues are not dropping events. Rotate logs to avoid disk-full conditions.

Decision table

| Outcome | Likely cause | Quick fix |
|---|---|---|
| Permission denied | Policy too narrow or wrong path | Update policy; test with a scoped read request |
| Token leak | Secret in agent image | Rebuild image with no secrets; remove mounts |
| Missing logs | Forwarder misconfigured | Reconfigure and verify log-forward latency |

Reference: https://github.com/marconae/ghbrk

## First use case for a small team

Audience: solo founders and very small teams (1–3 people). Goal: give an AI helper limited repo abilities without sharing GitHub tokens. See https://github.com/marconae/ghbrk for project context.

Concrete actionable steps

1) Single small VM/container. Allocate 1 CPU, 512–1024 MB RAM and a small disk. Run the broker behind a private network so only your agent can reach it. Budget: $0–$10/month.  
2) Start read-only for 14 days. Create the root-owned policy shown above and run the agent against the broker. Record logs for 14 days and retain them for 90 days. If denied rate stays below your threshold (example: <1%) and no unexpected writes occur, add scoped write rules.  
3) Pin binaries and images. Store the release hash or commit number in your repo and upgrade only after a 7–14 day staging window.  
4) Sandbox the agent runtime. Ensure images contain no baked-in secrets and block host file mounts for keys. Automate an image build that removes environment variables and ~/.ssh.

Onboarding checklist for a small team

- [ ] Policy reviewed by an owner.  
- [ ] Broker binary pinned to a release hash.  
- [ ] Agent image scanned and contains no secrets.  
- [ ] Logging to central collector enabled (retain 90 days).  
- [ ] Rollback plan tested (disable writes within 5 minutes).

Reference: https://github.com/marconae/ghbrk

## Technical notes (optional)

- Language: the repository indicates the project is implemented in Rust. Rust's safety features can reduce certain memory-safety bugs. See https://github.com/marconae/ghbrk.  
- Policy integrity: the repo description highlights a root-owned policy model; enforce it with OS ownership (root) and file mode 0400.  
- Acronyms explained: VM = virtual machine; CLI = command-line interface; SIEM = security information and event management.

Operational thresholds (examples to tune): 14-day staging, 10% canary, alert on >1% denied in 24 hours, health-check <200 ms, audit retention 90 days, drain time 5 minutes, test write quota 50 ops during staging.

Reference: https://github.com/marconae/ghbrk

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repo description confirms a root-owned policy model and a Rust implementation (https://github.com/marconae/ghbrk).  
- The concrete file locations (/etc/ghbrk/policy.json), JSON schema shown above, Dockerfile layout, and systemd unit are illustrative examples provided to make setup concrete. Validate the exact policy schema, CLI flags, and released binaries in the repository before production.

### Risks / Mitigations

- Risk: policy misconfiguration allows accidental writes.  
  Mitigation: start with a read-only policy, require owner approval before enabling writes, and use a 14-day staging window.  
- Risk: leaked tokens or SSH keys in the agent.  
  Mitigation: build agent images with no tokens, block host key mounts, scan images for secrets, and enforce an image trust policy.  
- Risk: audit gaps or dropped logs.  
  Mitigation: forward logs off-host to a SIEM or object store with 90-day retention and alert on increased denied/failed-auth rates.

### Next steps

- Validate the exact policy schema and CLI options in https://github.com/marconae/ghbrk and pin to a release hash.  
- Implement a canary: 10% traffic for 7–14 days with gates (deny rate below your threshold and no unapproved writes).  
- Add monitoring: health-check <200 ms, dashboards for audit-event count per hour, and alerts on >1% denied in 24 hours.  
- Prepare a rollback runbook: feature-flag off for write actions, drain canary for 5 minutes, and revoke broker network access if needed.

Reference: https://github.com/marconae/ghbrk
