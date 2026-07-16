---
title: "Traceforce (YC S26): Agent and browser extension to monitor AI apps and map MCP endpoints on company devices"
date: "2026-07-16"
excerpt: "Install Traceforce's agent + browser extension on a small set of devices to map AI apps and their MCP endpoints, see devices in ~30 minutes, and run mcp-xray."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-16-traceforce-yc-s26-agent-and-browser-extension-to-monitor-ai-apps-and-map-mcp-endpoints-on-company-devices.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "traceforce"
  - "ai-security"
  - "endpoint-security"
  - "mcp"
  - "mcp-xray"
  - "yc-s26"
  - "show-hn"
  - "startup"
sources:
  - "https://news.ycombinator.com/item?id=48936384"
---

## TL;DR in plain English

- Traceforce is a lightweight device agent plus a browser extension that discovers which AI apps (for example, ChatGPT or Claude) run on a device and shows how those apps connect to downstream MCPs (called endpoints). Source: https://news.ycombinator.com/item?id=48936384
- Devices typically begin uploading metadata to a company profile and appear in the dashboard within ~30 minutes of enrollment. Run a monitor-only pilot for 48–72 hours. Source: https://news.ycombinator.com/item?id=48936384
- Default privacy posture: metadata and telemetry only. Deeper inspection of tool calls (inspect_calls) is opt-in. Source: https://news.ycombinator.com/item?id=48936384
- Open-source dynamic MCP pentesting tool mcp-xray is available to scan discovered MCPs; use it only in controlled test environments. Source: https://news.ycombinator.com/item?id=48936384

Quick pilot recommendation (concrete): enroll 3–5 devices (for example: founder laptop, engineer laptop, sandbox VM), run monitor-only for 48–72 hours, and run mcp-xray against test MCPs within 24–48 hours of discovery. Source: https://news.ycombinator.com/item?id=48936384

## What you will build and why it helps

You will run a short proof-of-concept (PoC) that installs the Traceforce binary and browser extension on a small set of devices so they report metadata to a central dashboard; then run mcp-xray against discovered MCP endpoints in a controlled test environment. Source: https://news.ycombinator.com/item?id=48936384

Why this helps (decision frame):

| Decision factor | Pilot (3–5 devices) | Production canary (25 devices) |
|---|---:|---:|
| Visibility latency | ~30 minutes to appear | ~30 minutes to appear |
| Pilot duration | 48–72 hours | 72 hours |
| Privacy posture | metadata-only | optional inspect_calls (opt-in) |
| Risk tolerance | monitor-only | enforce warnings/blocks |

Source: https://news.ycombinator.com/item?id=48936384

Concrete benefits:
- One view of AI usage across devices and the MCPs they call (agents, MCPs, telemetry). Source: https://news.ycombinator.com/item?id=48936384
- Low-friction pilot with clear rollbacks (revoke tokens / disable extension). Source: https://news.ycombinator.com/item?id=48936384
- Use mcp-xray to check discovered MCPs for misconfigurations in test environments. Source: https://news.ycombinator.com/item?id=48936384

## Before you start (time, cost, prerequisites)

Time estimates and concrete numbers (grounded in the announcement):
- Enrollment visibility: devices appear in the dashboard within ~30 minutes. Source: https://news.ycombinator.com/item?id=48936384
- Pilot window: run 48–72 hours to collect useful telemetry. Source: https://news.ycombinator.com/item?id=48936384
- Small-pilot setup (3–5 devices): expect <2 hours for enrollment and verification (estimate).
- Canary scale before broad rollout: 25 devices as a next gate.

Cost / tooling:
- mcp-xray is open-source on GitHub; confirm license before use. Source: https://news.ycombinator.com/item?id=48936384
- Prepare MDM packaging if you expect to scale beyond the 3–5 pilot devices.

Prerequisites (minimum):
- Company admin account or vendor-provided console access. Source: https://news.ycombinator.com/item?id=48936384
- Admin privileges on target devices to install a lightweight binary and browser extension. Source: https://news.ycombinator.com/item?id=48936384
- Test devices with outbound network access so telemetry can reach the console.

Pre-deployment checklist
- [ ] Admin console account created (or trial requested) — Source: https://news.ycombinator.com/item?id=48936384
- [ ] Enrollment token or installer package available
- [ ] 3–5 pilot devices identified (e.g., founder, engineer, sandbox)
- [ ] Participant consent and acceptable-use note shared
- [ ] Security contact and escalation path documented

## Step-by-step setup and implementation

Follow each gate and verify before moving on. Source: https://news.ycombinator.com/item?id=48936384

1) Request access / create company profile
- Use the vendor flow described in the announcement to obtain an enrollment token or trial. Source: https://news.ycombinator.com/item?id=48936384

2) Install the device agent and browser extension (test devices first)
- Deploy manually to one laptop and one sandbox VM. Use MDM for scale.

Example install commands (illustrative):

```bash
# download and install agent (illustrative)
curl -o traceforce-agent.tar.gz https://example.traceforce.ai/agent/download?token=ENROLLMENT_TOKEN
tar xzf traceforce-agent.tar.gz
sudo ./install.sh --token ENROLLMENT_TOKEN
```

3) Verify device appearance (~30 minutes)
- Confirm devices show in the dashboard and check the "last seen" timestamp. Verify metadata-only collection is enabled by default. Source: https://news.ycombinator.com/item?id=48936384

4) Run mcp-xray in a controlled test environment
- Clone the repo and scan only test MCPs; do not scan production without written authorization. Source: https://news.ycombinator.com/item?id=48936384

Example mcp-xray run (illustrative):

```bash
git clone https://github.com/traceforce/mcp-xray.git
cd mcp-xray
# consult README, then run a test scan against a non-production endpoint
python3 mcp-xray.py --target https://mcp-test.internal --timeout-ms 5000
```

5) Configure monitor-only pilot and alert thresholds
- Keep inspect_calls disabled initially. Run the pilot for 48–72 hours and triage daily with a 24-hour SLA.

Example config (illustrative YAML):

```yaml
telemetry_mode: metadata # options: metadata | inspect_calls
retention_days: 30
enrollment_token: "ENROLL-XXXX"
alert_thresholds:
  medium: 10   # alerts/day per 100 devices
  high: 1      # critical alerts/day per 100 devices
```

6) Gates to expand
- If pilot success criteria met (e.g., <5 actionable alerts/device/day and false positive rate <10%), expand to a 25-device canary for 72 hours.
- Rollback: revoke tokens or disable extension via MDM. Target stop time for telemetry after rollback: ~30 minutes.

Source: Traceforce announcement and mcp-xray repo. Source: https://news.ycombinator.com/item?id=48936384

## Common problems and quick fixes

All troubleshooting steps reference the announced model (agent + extension + metadata default). Source: https://news.ycombinator.com/item?id=48936384

- Device never appears
  - Verify the agent process is running, enrollment token is correct, and outbound egress is allowed by firewall/NAT. Check last-seen timestamps.
- Extension blocked by policy
  - Add the extension to managed-extension whitelist or sideload for pilot users.
- Noisy alerts / high false positives
  - Stay metadata-only or monitor-only; raise thresholds (example: 20 alerts/day per 100 devices) and add allowlists for known benign MCPs.
- mcp-xray low-severity results
  - Triage by impact, schedule fixes, and re-scan after remediation. Track counts over 2–4 weeks.

Quick troubleshooting checklist
- [ ] Agent process alive on device
- [ ] Extension installed and permissions granted
- [ ] Enrollment token correct
- [ ] Firewall allows outbound telemetry
- [ ] Device shows "last seen" within 10 minutes

Source: https://news.ycombinator.com/item?id=48936384

## First use case for a small team

Scenario: a 10-person startup wants visibility into ChatGPT/Claude usage and whether sessions call internal MCPs. Source: https://news.ycombinator.com/item?id=48936384

Minimum pilot (concrete steps and numbers):
1) Enroll 3 devices (founder laptop, engineer laptop, sandbox VM). Devices should appear within ~30 minutes and produce useful telemetry after 48–72 hours. Source: https://news.ycombinator.com/item?id=48936384
2) Run mcp-xray against discovered MCPs in a test environment within 24–48 hours of discovery. Source: https://news.ycombinator.com/item?id=48936384
3) Triage daily; set a 24-hour SLA to label new alerts as Investigate / Exempt / False positive.

Actionable play for 1–3 people:
- Fast path: enroll 2 devices (primary laptop + sandbox VM); schedule a 60–90 minute session to review findings after 72 hours. Source: https://news.ycombinator.com/item?id=48936384
- Keep monitor-only for first 72 hours and confirm fewer than 5 actionable alerts/day before enabling any inspection.

Small-team rollout checklist
- [ ] Enroll 3 pilot devices
- [ ] Run 72-hour monitor period
- [ ] Run mcp-xray in test environment within 48 hours of discovery
- [ ] Produce a 1-page incident play and assign a 24-hour triage owner

Source: https://news.ycombinator.com/item?id=48936384

## Technical notes (optional)

- Architecture summary: a lightweight binary plus browser extension collect metadata/telemetry and upload to a company profile. Default mode is metadata-only; inspect_calls is opt-in. Source: https://news.ycombinator.com/item?id=48936384
- Open-source: mcp-xray is available on GitHub as a dynamic MCP pentesting tool; run it in controlled test environments only. Source: https://news.ycombinator.com/item?id=48936384
- Suggested operational knobs to track (examples for monitoring): telemetry_mode, retention_days (example: 30), alert thresholds expressed as counts per day per 100 devices, and enrollment token lifecycle.

Source: https://news.ycombinator.com/item?id=48936384

## What to do next (production checklist)

### Assumptions / Hypotheses

- The guide uses the Traceforce announcement as the primary source: agent + browser extension, metadata default, opt-in inspect_calls, and mcp-xray open-source tool. Source: https://news.ycombinator.com/item?id=48936384
- Pilot timings assume devices appear within ~30 minutes and a 48–72 hour pilot yields useful telemetry.

(Methodology: this guide is built from the Traceforce announcement and the linked repo note.)

### Risks / Mitigations

- Risk: privacy concerns if inspect_calls is enabled.
  - Mitigation: require explicit approval before enabling inspect_calls; keep pilot monitor-only for 48–72 hours and document retention (example: 30 days).
- Risk: noisy alerts causing operational friction.
  - Mitigation: start metadata-only; tune thresholds toward a target false positive rate <10%; maintain allowlists for known MCPs.
- Risk: deployment failure due to MDM or policy restrictions.
  - Mitigation: pre-approve extension in MDM, prepare rollback playbook (revoke tokens / disable extension). Aim to stop telemetry within ~30 minutes after rollback.
- Risk: unauthorized scans with mcp-xray.
  - Mitigation: run mcp-xray only against test MCPs and obtain written authorization before any production scans.

Targets to monitor before full rollout
- Enrollment coverage: target >80% of devices in scope
- Actionable alerts: target <5 per device per day
- Mean time to triage (MTTT): target <24 hours
- False positive rate: target <10%

### Next steps

- Complete a 5-device, 72-hour pilot and collect artifacts: device list, alert log (counts per device), and a one-page incident play.
- Run scheduled mcp-xray scans weekly for 4 weeks against discovered MCPs in a test environment.
- Prepare MDM installers and a rollback playbook (ability to revoke enrollment tokens and disable the extension; target <30 minutes to stop telemetry).
- If pilot meets targets above, run a 25-device canary for 72 hours before broader rollout.

Final reference: Traceforce announcement and the mcp-xray repo. Source: https://news.ycombinator.com/item?id=48936384
