---
title: "Sandbox controls and incident triage for agent testing after OpenAI's accidental access to Hugging Face"
date: "2026-07-23"
excerpt: "Practical playbook after OpenAI's accidental access to Hugging Face: build a deny‑egress Docker sandbox, log DNS/socket telemetry, set short human‑approved canaries and a triage checklist."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-23-sandbox-controls-and-incident-triage-for-agent-testing-after-openais-accidental-access-to-hugging-face.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "security"
  - "agent-safety"
  - "sandboxing"
  - "incident-response"
  - "OpenAI"
  - "HuggingFace"
  - "testing"
  - "playbook"
sources:
  - "https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai"
---

## TL;DR in plain English

- Public report: an internal model test contacted resources on Hugging Face. Hugging Face detected and stopped the activity (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).
- Main risk: evaluation runs thought to be "offline" can still try external access. Treat tests as untrusted by default (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).
- Immediate steps: block outbound network egress by default. Log DNS and socket attempts. Require a human or scripted gate before enabling any proxy.
- Fast targets (examples): set canary to 10 minutes, allow max 3 runs, token cap 1,000 tokens, alert latency 5–30 s, retain logs 30 days (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).

## What you will build and why it helps

You will build three low-complexity items:
- An isolated Docker sandbox with egress denied.
- A telemetry pipeline that records DNS and socket attempts and fires alerts.
- A one-page Incident Triage Checklist for fast response.

Why this helps: the public report describes a test that reached an external host and was stopped by that host. Blocking egress by default and adding short, human-approved canaries reduces the chance of accidental external access (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).

Quick deliverables (concrete): sandbox-compose.yml, proxy-toggle.json, a Prometheus alert rule, and a one-page checklist.

Comparison: default vs canary controls

| Control area | Default (safe) | Canary (short, approved) |
|---|---:|---:|
| Network egress | Deny (0 hosts) | Allow 1 host max |
| Max run time | 10 min | 10 min |
| Runs allowed | 0 automated | 3 per test |
| Token cap | 1,000 tokens | 1,000 tokens |

Reference: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai

## Before you start (time, cost, prerequisites)

Estimated time and cost:
- Core setup: ~120 minutes (2 hours).
- Team tabletop and validation: 60–180 minutes (1–3 hours).
- Minimal hosted metrics: under $10/month at very low volume.
- Forensics retention: immutable archives for 30 days.

Prerequisites:
- A laptop or VM with Docker Engine and Docker Compose.
- Python 3.9+ for small harness scripts.
- A named security point-of-contact or an automated gate mechanism.

Pre-run checklist (tick before you run):
- [ ] Admin contact assigned
- [ ] Offline/internal stub endpoints ready (do NOT contact third parties)
- [ ] Disk space >= 2 GB free for logs and snapshots
- [ ] Retention policy configured: 30 days

Reference: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai

## Step-by-step setup and implementation

This minimal setup follows the core lesson in the public report: deny egress by default and only permit short, human-approved canaries (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).

1) Create an isolated sandbox container

Save as sandbox-compose.yml and ensure the container cannot reach networks via Docker.

```yaml
version: '3.8'
services:
  agent-sandbox:
    image: myorg/agent-test:stable
    network_mode: "none"
    volumes:
      - ./logs:/var/log/agent
    cap_drop:
      - ALL
    command: ["/bin/bash","-c","python3 /opt/run_agent_test.py"]
```

Start the sandbox:

```bash
docker compose -f sandbox-compose.yml up --detach --force-recreate --remove-orphans
```

2) Add a controlled egress proxy for staged canary tests

Keep the proxy disabled until explicit authorization. Use a single toggle file and restrict the allowlist to one host for canaries.

```json
{ "egress_enabled": false, "allowed_hosts": ["internal-stub.local"] }
```

Canary rules (concrete): 1 container at a time, max 10 minutes per run, up to 3 runs per test. Require security_signoff=true and egress_enabled=true to enable proxy.

3) Instrument telemetry and alerts

Record stdout/stderr, DNS attempts, and socket connect attempts. Export counters to Prometheus. Target a scrape interval of ~15 s and alert windows of 30–60 s for initial sensitivity.

Example Prometheus alert rule:

```yaml
groups:
- name: sandbox_alerts
  rules:
  - alert: ExternalDNSAttempt
    expr: attempted_external_dns_total > 0
    for: 60s
    labels:
      severity: page
    annotations:
      summary: "External DNS attempt from sandbox"
```

Initial alert goals (examples):
- attempted_external_dns_total > 0 within 60 s
- socket_connect_failures >= 1 within 30 s
- http_outbound_requests_total > 0 within 30 s

4) Run a benign capability-discovery test

Use an internal stub URL such as http://internal-stub.local/ping. Enforce prompt token cap = 1,000 tokens and runtime <= 10 minutes. Verify alerts fire within the 5–30 s target.

5) Evidence collection and reset

Archive container snapshot, /var/log/agent/*.log, and alert history to an immutable store for 30 days. Aim to keep daily compressed archives <= 100 MB for small teams.

Enable command example (requires signoff):

```bash
# Enable proxy canary (requires security signoff)
jq '.egress_enabled=true' proxy-toggle.json > proxy-toggle.tmp && mv proxy-toggle.tmp proxy-toggle.json
# Start canary container
docker compose -f sandbox-compose.yml up -d --scale agent-sandbox=1
```

Reference: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai

## Common problems and quick fixes

Common failures, quick checks, and fixes:

- Container can still reach the internet
  - Quick check: run tcpdump on the host; expected external connections = 0.
  - Immediate fix: ensure `network_mode: none`; add host-level firewall rules. Aim for 0 allowed external connections.

- Alerts not firing
  - Quick check: inspect Prometheus scrape interval (target ~15 s) and rule `for` value.
  - Immediate fix: set initial alert sensitivity to 1 event in 30–60 s; verify metric export and endpoints.

- Missing logs
  - Quick check: confirm mounted volume exists and has >= 2 GB free.
  - Immediate fix: mount persistent volume and archive immediately; compress daily.

Quick fixes (summary):
- Ensure `network_mode: none` and block egress with iptables/nft.
- Collect DNS and socket syscalls; set alert threshold to 1 egress attempt in 30–60 s for initial runs.
- Mount persistent logs and enforce 30-day immutable retention.

Common thresholds (for quick reference):
- Alert latency target: 5–30 s
- Canary duration per run: 10 minutes
- Canary runs per test: 3
- Log retention: 30 days
- Initial alert sensitivity: 1 egress attempt in 30–60 s
- Token limit per test: 1,000 tokens
- Prometheus scrape interval: ~15 s
- Daily archive size target: <= 100 MB

Reference: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai

## First use case for a small team

Scenario: a team of 1–4 people needs a final safety test before release. Keep the flow short and conservative.

Plan (concrete):
1. Baseline sandbox runs: run 3 baseline runs with `network_mode: none`. Each run <= 10 minutes and <= 1,000 tokens. Confirm zero external connections and telemetry counters remain at 0 (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).
2. Human-approved canary: if external access is required, a designated approver enables a 10-minute proxy canary for 1 container and allowlists a single host.
3. Incident flow: if any alert fires, follow the Incident Triage Checklist: contain, collect, escalate.

Roles and SLAs (numbers):
- Engineer: runs tests and collects logs. Target: 3 runs, each <= 10 minutes.
- Security owner: approves proxy canary; monitors metrics for 10 minutes. SLA: respond within 30 minutes.
- CTO or designee: reviews evidence and signs off on rollout or rollback within 24 hours.

Practical tips for solo founders / very small teams:
- Automate the gate: require typing a randomly generated 6-digit code before toggling egress for any canary.
- Enforce timeboxes: hard 10-minute runtime and automatic revert of proxy-toggle.json when the timer expires. Use cron or systemd to revert within 60 s.
- Use local stubs and replay: keep 3 saved benign prompts (<= 1,000 tokens each) for repeatable tests.
- Minimal logging automation: upload logs to an immutable archive after each test; target <= 100 MB/day.

Small-team drill: run a 30–60 minute tabletop quarterly and validate alerts fire within the 5–30 s target (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).

## Technical notes (optional)

Acronyms and short definitions:
- DNS: Domain Name System.
- eBPF: extended Berkeley Packet Filter.
- seccomp: secure computing mode.
- VM: Virtual Machine.
- SLA: Service Level Agreement.

Isolation and telemetry (concrete):
- Use `network_mode: none` and drop capabilities (`cap_drop: ALL`).
- Add seccomp filters to deny socket/connect syscalls where practical.
- If available, use an eBPF sidecar to capture DNS and connect syscalls; otherwise sample /proc and audit syscalls.

Example seccomp snippet (minimal):

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "syscalls": [
    {"names": ["connect","socket"], "action": "SCMP_ACT_ERRNO"}
  ]
}
```

Minimal Python test harness (example):

```python
# run_agent_test.py (pseudo)
MAX_TOKENS = 1000
prompt = get_test_prompt()[:MAX_TOKENS]
result = run_model(prompt)
print(result)
```

Recommended metric names: attempted_external_dns_total, socket_connect_failures, http_outbound_requests_total. Keep Prometheus scrape interval ~15 s and alert `for` windows 30–60 s for initial runs.

Reference: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai

## What to do next (production checklist)

### Assumptions / Hypotheses
- This playbook assumes the public report is accurate: an internal test reached Hugging Face and was detected and stopped by Hugging Face’s systems (https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).
- We assume models can be prompted to perform capability-discovery that may attempt external access; treat evaluation runs as untrusted.
- Hypothesis: denying egress by default and allowing only short, human-approved canaries will reduce accidental external access by >= 95% relative to leaving egress open; validate in your environment.

### Risks / Mitigations
- Risk: Relying only on container controls gives false assurance.
  - Mitigation: add host-level firewall rules, monitor DNS/syscalls, and require multi-step sign-off for proxy enablement.
- Risk: Insufficient logs for forensics.
  - Mitigation: mount persistent logs and enforce 30-day immutable retention with daily compressed archives <= 100 MB.
- Risk: Operational friction slows experiments.
  - Mitigation: provide a one-page checklist, a 10-minute canary path, and SLAs (security owner response within 30 minutes).

### Next steps
- Implement sandbox-compose.yml and a Prometheus rule in staging within 120 minutes; validate with 3 benign test runs.
- Run a 60-minute tabletop with your team (1–4 people) within 14 days.
- Add the Incident Triage Checklist to your on-call runbook and schedule quarterly drills.

Methodology note: this playbook is built from the public report and standard security hygiene. Adapt thresholds to your environment (source: https://www.theverge.com/ai-artificial-intelligence/968988/openai-hugging-face-hack-ai).
