---
title: "Agent Observatory — a local, mobile-first monitor for AI coding agents planned and built by an AI pipeline"
date: "2026-04-03"
excerpt: "Field report: Agent Observatory is a single-process local monitor that ingests OTEL telemetry, sends mobile push alerts, and can stop/restart AI coding agents — built by an AI planner."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-03-agent-observatory-a-local-mobile-first-monitor-for-ai-coding-agents-planned-and-built-by-an-ai-pipeline.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "observability"
  - "monitoring"
  - "otel"
  - "bun"
  - "web-push"
  - "cloudflare-tunnel"
  - "agent-observatory"
sources:
  - "https://ren.phytertek.com/blog/building-the-panopticon-from-inside/"
---

## TL;DR in plain English

- Build a local, mobile-first Agent Observatory that watches multiple AI coding agents, ingests OpenTelemetry (OTEL) telemetry, shows live sessions in a WebSocket-powered React dashboard, pushes mobile alerts, and can stop/restart agents via a local control API. Field report: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- Why it matters: the field report explains the problem — one terminal is simple, five parallel agents are not — and shows the Observatory follows you with push alerts so you do not miss completions or burn compute on stalled agents: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- Quick concept: run a single-process local server that accepts OTEL telemetry, normalizes session events, broadcasts them to a React UI, and sends Web Push notifications; keep remote control (Cloudflare Tunnel) disabled until you trust alerts. See the field report for the exact stack choices: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## What you will build and why it helps

You will implement a minimal Agent Observatory similar in purpose and components to the system described in the field report. The report cites a single-process observability server built with Bun, OTEL ingestion, a WebSocket React dashboard, Web Push notifications, and an optional Cloudflare Tunnel for secure remote access: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

Feature presence (field report comparison):

| Feature / Component                     | Present in the field report? |
|-----------------------------------------|:----------------------------:|
| Single-process, local-first server      | Yes                          |
| OpenTelemetry ingestion (OTEL)          | Yes                          |
| WebSocket-powered React dashboard       | Yes                          |
| Web Push mobile notifications           | Yes                          |
| Cloudflare Tunnel (optional remote)     | Yes                          |
| Planned & built by AI (Dark Factory)    | Yes                          |

Source and context: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

Why this helps

- Parallel agents let you walk away, but you cannot monitor many terminals. Mobile-first notifications and an actionable dashboard let you react from anywhere. The field report frames that exact problem and solution: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- The reference system deliberately avoided cloud dependencies for day‑to‑day operation; that design is useful for rapid iteration and trust-building before enabling any remote access: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Before you start (time, cost, prerequisites)

- Supported stack facts from the field report: the author observed a Bun server running on a MacBook, OTEL telemetry ingestion, a WebSocket React UI, Web Push, and Cloudflare Tunnel as an optional remote path: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- Practical prerequisites (qualitative): a developer machine (macOS or Linux recommended), Bun or Node runtime available, a modern browser on your phone that supports Web Push, and a local agent process that can emit telemetry to the Observatory.

Starter checklist

- [ ] Create a local repository for the Observatory.
- [ ] Install Bun or Node and a WebSocket-capable server framework.
- [ ] Provide an OTEL endpoint (local collector or direct ingest).
- [ ] Ensure your phone’s browser supports Web Push and that you can accept notifications.
- [ ] Keep control API remote access disabled until you validate alerts.

Reference and context: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Step-by-step setup and implementation

1) Scaffold a minimal repo and run a placeholder server

```bash
mkdir agent-observatory && cd agent-observatory
git init
echo "console.log('observatory running')" > index.ts
# run with Bun (field report used Bun)
bun run index.ts
```

Add the field report link to README: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

2) Add OTEL ingestion (collector or direct receiver)

Create a minimal OpenTelemetry collector configuration to accept incoming OTEL data and log it for now. The field report identifies OTEL ingestion as a core piece: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

```yaml
# otel-collector-config.yaml (starter)
receivers:
  otlp:
    protocols:
      http:
      grpc:
processors:
  batch:
exporters:
  logging:
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

3) Emit or mock session events

If you have agents, configure them to export OTEL traces/events to the collector. For early testing you can post simple JSON session messages to the server (mock):

```json
{"session_id":"agent-01","status":"crash","timestamp":1680000000000}
```

4) Wire WebSocket broadcasting and React dashboard

- Server: translate OTEL spans/events into normalized session messages and broadcast them via WebSocket to connected clients.
- Client: React UI connects to the WebSocket, lists active sessions, and registers a service worker to obtain a Web Push subscription.

5) Implement Web Push notifications

- Deliver notifications for crash/stall events to the registered subscription. The report lists Web Push as the chosen mobile notification path: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

6) Add a protected local control API

- Implement POST /control/kill and POST /control/restart endpoints and require a local token by default. Keep remote exposure disabled initially.

7) Optional: enable Cloudflare Tunnel for remote control

- Only enable the tunnel after local validation. The field report mentions using a Cloudflare Tunnel for secure remote access: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

8) Smoke tests

- Verify a mock session appears in the UI.
- Simulate a crash; confirm a push arrives on your phone.
- Call the control endpoint locally and verify the agent stops.

## Common problems and quick fixes

- No push notifications on phone
  - Cause: service worker not registered or notifications blocked.
  - Fix: re-register the dashboard service worker, clear site permissions, and retry.

- Telemetry not appearing
  - Cause: collector not running or endpoint mismatch.
  - Fix: verify otel-collector-config.yaml, check exporter endpoint and collector logs.

- WebSocket disconnects
  - Cause: server crash, idle tunnel timeouts, missing ping/pong frames.
  - Fix: restart server, add ping/pong keepalive, increase tunnel keepalive settings.

- Runaway agent loops
  - Immediate mitigation: use the local control API to stop the session.
  - Longer-term: add stall detection and conservative alert rules during canary testing.

Reference: field report on stack and goals: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## First use case for a small team

The field report demonstrates a single-process Observatory running on a developer machine; that design is intentionally local-first and suitable for a solo founder or a very small team: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

Actionable canary for a tiny team

- Start in alert-only mode (no remote tunnel, control API local-only).
- Run OTEL ingestion and the dashboard; verify that crash/stall events surface and that Web Push notifications reach at least one operator.
- Record false positives and refine rules before allowing any remote kill/restart.
- When ready, enable a single-operator Cloudflare Tunnel guarded by a feature flag and strict token rotation.

Quick checklist for small teams:

- [ ] Start alert-only locally and confirm phone notifications.
- [ ] Record false alerts and improve rules before enabling remote control.
- [ ] Enable a tunnel for a single operator only after canary gates pass.

Context and field reference: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Technical notes (optional)

- Stack observed in the field report: Bun server on localhost, OTEL ingestion, WebSocket-powered React dashboard, Web Push notifications, and Cloudflare Tunnel. The system ran as a single process with no external cloud dependencies for normal operation: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- The Observatory was planned and largely implemented by an AI planning pipeline (Dark Factory) and validated against a governance framework called the Five Conditions. Repo metrics cited in the report include 115 commits, ~26,000 lines of TypeScript, and 1,103 passing tests: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Implementation-time and tuning targets (suggested starting values for your canary):
  - Minimal local reproduction: ~6 hours of focused work.
  - Canary duration (alert-only): 48–72 hours.
  - Small-team agent concurrency to plan for initially: 3–5 parallel agents.
  - Alert latency target: median < 10 seconds from event to push.
  - Acceptable false-alert rate during canary: < 5% (tune after logging).
  - Circuit-breaker triggers (suggestion): no session progress for 30 seconds or sustained agent CPU > 80%.
  - Tunnel hobby cost estimate: $0–$5/month.
  - Progressive exposure: enable remote control for a single operator after 7 days of stable operation.

Methodology note: facts cited directly from the field report are limited to the Observatory's existence, the observed stack, and the repo metrics; the above numeric thresholds are pragmatic assumptions for a conservative canary and belong here as hypotheses.

### Risks / Mitigations

- Risk: accidental remote control or leaked control secret.
  - Mitigation: default to local-only control, require an explicit feature flag before enabling remote control, and rotate secrets on any suspicion.

- Risk: alert fatigue from false positives.
  - Mitigation: begin conservative, log false alerts during the canary, and iterate thresholds before enabling automated kills.

- Risk: platform compatibility for Web Push across phones/browsers.
  - Mitigation: test the target OS/browser matrix and provide onboarding steps for operators.

- Risk: tunnel downtime or idle disconnects breaking remote control.
  - Mitigation: keep local access as a fallback and maintain a runbook to revoke tunnels and rotate tokens quickly.

### Next steps

- Implement the minimal reproduction from Step-by-step and run an alert-only canary for 48–72 hours.
- Add CI smoke tests for OTEL ingest, WebSocket broadcast, service worker registration, and protected control endpoints.
- If canary gates pass, enable single-operator remote control behind a feature flag; expand operator access gradually after seven days of stable operation.
- Prioritize v2 features: long-term telemetry storage, multi-tenant RBAC, and an approvals workflow for operator grants, aligning governance with the Five Conditions and the report’s planning pipeline references: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

Production checklist (practical):
- [ ] CI gates for smoke tests
- [ ] Encrypted storage for private keys and secrets
- [ ] Audit logging for control API calls
- [ ] RBAC or approval workflow for operator grants
- [ ] Incident runbook: revoke tunnels, rotate tokens, blacklist misbehaving agents

Reference and context: field report on the Observatory and how it was planned and built: https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
