---
title: "Sitrep: Open-source AI incident copilot that ties screen captures to Grafana traces"
date: "2026-07-31"
excerpt: "Sitrep is an open-source AI incident copilot that watches your screen, deduplicates tiles, and links screenshots to Grafana traces/logs for evidence-backed answers. Demo ~2 hrs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-31-sitrep-open-source-ai-incident-copilot-that-ties-screen-captures-to-grafana-traces.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "incident-response"
  - "observability"
  - "opentelemetry"
  - "grafana"
  - "ai-agent"
  - "on-call"
  - "open-source"
sources:
  - "https://github.com/dj9889/sitrep"
---

## TL;DR in plain English

- Sitrep is an open-source AI "incident copilot" that watches an operator's screen and answers questions with evidence. It is wired into the Grafana LGTM stack and instrumented with OpenTelemetry (OTel) GenAI semantic conventions: https://github.com/dj9889/sitrep.
- Quick outcome: one query can return a screenshot tile plus the matching trace or log link. This reduces guesswork and context switching; example savings per query: roughly 30–300 seconds. See the project: https://github.com/dj9889/sitrep.
- Quick setup estimate: about 120 minutes (≈2 hours) for a basic local demo on one machine. Local run cost $0. Cloud inference costs depend on model choice and token usage. Repo: https://github.com/dj9889/sitrep.

Concrete example (short scenario):
- At 14:12 you see a latency spike on a dashboard. You ask Sitrep, "Which trace IDs started at 14:12?" Sitrep returns a screenshot tile of the dashboard and a link to the trace in Grafana. You open the trace, confirm the span, and add the trace link to the incident ticket.

## What you will build and why it helps

You will build a local Sitrep instance that:
- captures an operator's screen and extracts visual tiles (images),
- deduplicates similar tiles before sending them to the model,
- verifies visual findings against Grafana and OpenTelemetry traces, and
- answers evidence-backed Q&A with links to Grafana traces or logs.

Why this helps
- Sitrep ties visual evidence (screenshots) to telemetry (trace_ids) so answers are auditable and actionable. The repository describes Sitrep as an AI incident copilot integrated with Grafana and OpenTelemetry: https://github.com/dj9889/sitrep.
- This reduces context switches between chat, dashboards, and tracing tools. It surfaces the exact place to investigate in Grafana.

### Plain-language explanation before advanced details

Sitrep runs on a machine and captures parts of the screen at intervals. It turns those screen pieces into small image "tiles." It removes repeated tiles so the model does not get the same image many times. When Sitrep sees something worth checking, it calls Grafana or your tracing backend to find matching trace_ids or logs. The assistant then answers a question with the screenshot and a link to the trace or log. This makes answers easier to verify.

## Before you start (time, cost, prerequisites)

Estimated time and cost
- Setup time (local demo): ~120 minutes (≈2 hours).
- Suggested pilot length: 14 days (2 weeks).
- Local run cost: $0. Cloud inference cost: varies by model and token usage; plan daily caps (for example, 4,000–50,000 tokens).

Required prerequisites
- Git and Docker / Docker Compose installed.
- A machine or VM capable of running containers (1 CPU is OK for a minimal demo; 2+ CPU recommended for smoother UX).
- A Grafana instance and a read-only API key for dashboards/traces you will query.
- Optional: an OpenTelemetry (OTel) collector / endpoint if you want to validate exported trace_ids.

Quick checklist before you begin
- [ ] Clone https://github.com/dj9889/sitrep
- [ ] Docker / Docker Compose running
- [ ] Grafana URL and read-only API key ready
- [ ] (Optional) OpenTelemetry endpoint configured

Repo reference: https://github.com/dj9889/sitrep.

## Step-by-step setup and implementation

1) Clone the repo and inspect files

```bash
git clone https://github.com/dj9889/sitrep
cd sitrep
ls -la
# open README and example config files in the repo
```

2) Start Sitrep locally with Docker Compose

```bash
# example (adapt to the repo's compose file)
docker compose up --build -d
# follow logs
docker compose logs -f sitrep
```

3) Configure Grafana integration

- Add your Grafana URL and the read-only API key to the Sitrep environment or grafana-config.json (see examples in repo).
- Verify the key can read dashboards and traces via Grafana's API.

4) (Optional) Enable OpenTelemetry GenAI semconv

- If you run an OTel collector, ensure traces are exported and visible in Grafana. The repository references GenAI semantic conventions for observability: https://github.com/dj9889/sitrep.

5) Start the screen-capture client and tune dedupe

- Launch the client on the operator machine. Enable capture only for allowed windows.
- Set the capture interval (start at 500 ms). Shorter intervals increase responsiveness and CPU.
- Tune tile deduplication Hamming threshold (suggested start: 10; tune 5–30) and tile size (start 256 px; tune 128–512 px).

6) Run an end-to-end test

- Trigger a synthetic alert or create a test trace at a known time (for example: 14:12) and ask Sitrep a question such as: "Which trace IDs started at 14:12?" Expect a screenshot tile and a trace_id link you can open in Grafana.

7) Apply cost controls and model toggles

- Start with a conservative daily token cap (for example, 4,000 tokens) and a cheaper model tier for pilot traffic. Increase to 50,000 tokens if needed for heavier testing.

8) Verify privacy controls

- Test blackout mode and an application allowlist. Document who can toggle blackout during the pilot.

Example config fragments (adapt from repo templates):

```yaml
# otel-collector-config.yaml (fragment)
receivers:
  otlp:
    protocols:
      http: {}
exporters:
  logging:
    logLevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging]
```

```json
// grafana-config.json (fragment)
{
  "grafana_url": "https://grafana.example.com",
  "api_key": "REPLACE_WITH_READONLY_KEY",
  "dashboards": ["/api/dashboards/db/example"]
}
```

Reference: https://github.com/dj9889/sitrep.

## Common problems and quick fixes

- Stale or duplicate screenshots
  - Fix: shorten the capture interval (try 500 ms or lower) or adjust the tile dedupe Hamming threshold (try 5–30). The repo includes dedupe parameters: https://github.com/dj9889/sitrep.

- Grafana traces/logs not found
  - Fix: verify the Grafana read-only API key and confirm trace_ids are exported from your application into OTel and visible in Grafana.

- Unexpected model cost
  - Fix: switch to a cheaper model tier, set a hard daily token cap (start with 4,000 tokens), and enforce per-query rate limits.

- Privacy concerns from captured screens
  - Fix: enable blackout mode, use an application allowlist, and limit capture windows to specific dashboard apps.

Quick diagnostic commands

```bash
# Check Sitrep containers and logs
docker compose ps
docker compose logs sitrep --tail 200

# Validate Grafana API access
curl -H "Authorization: Bearer $GRAFANA_KEY" https://grafana.example.com/api/org
```

Troubleshooting reference: https://github.com/dj9889/sitrep.

## First use case for a small team

This section is for solo founders or teams of 1–3 engineers using Sitrep to triage a production latency spike. Repo: https://github.com/dj9889/sitrep.

Actionable setup (solo founder / tiny team):

1) Single-machine quickstart
  - Run Sitrep locally on your laptop or a small VM with Docker Compose. If constrained, use 1 CPU and 2 GB RAM for the demo; 2+ CPU gives a smoother experience.
  - Commands:

```bash
git clone https://github.com/dj9889/sitrep && cd sitrep
docker compose up --build -d
```

  - Configure grafana-config.json with your Grafana URL and a read-only API key so answers include trace links.

2) Capture and privacy lockdown
  - Restrict capture to the browser or a specific dashboard window by enabling an application allowlist.
  - Set capture interval to 500 ms to balance responsiveness and CPU. Tune between 250–2000 ms as needed.
  - Enable blackout mode for private work and test the toggle before on-call use.

3) Cost and evidence policy
  - Set a daily token cap (start at 4,000 tokens) and a per-query rate limit (for example, 10 queries per minute).
  - Create a one-page playbook: who runs Sitrep, when to enable blackout, and how to attach Sitrep artifacts (screenshot + trace_id) to tickets.

Operational example flow (reproducible):
- At 14:12 a latency spike appears. With capture interval 500 ms and tile size 256 px, Sitrep returns a screenshot tile and a trace link. Open the trace in Grafana and annotate the incident ticket.

Practical pilot settings to try:
- Pilot size: 1–3 people
- Pilot duration: 14 days
- Capture interval: start 500 ms (tune 250–2000 ms)
- Tile size: 256 px (tune 128–512 px)
- Hamming threshold: start 10 (tune 5–30)

Repo reference: https://github.com/dj9889/sitrep.

## Technical notes (optional)

- Vision + verification: Sitrep pairs OCR (optical character recognition) and image tiles with backend Grafana and OTel queries to validate trace_ids before answering. The repo highlights Grafana + OpenTelemetry GenAI semantic conventions: https://github.com/dj9889/sitrep.
- Tile deduplication: tune Hamming distance (5–30) and tile size (128–512 px) in the tile-config file.
- Observability: Sitrep emits events instrumented with OpenTelemetry GenAI semantic conventions so activity is visible in Grafana. Confirm exporters and sampling settings in your OTel collector.

Model / cost comparison (example)

| Model tier   | Latency (ms) | Cost tendency | Suggested use                         |
|---|---:|---:|---|
| High-quality | 200–800 ms   | high ($$)     | deep analysis during P1 incidents     |
| Balanced     | 100–400 ms   | medium ($)    | most incident queries                 |
| Cheap        | 50–200 ms    | low ($)       | bursty queries and testing            |

Note: tune these numbers to your latency budget and token caps. See repo for model toggle samples: https://github.com/dj9889/sitrep.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository README is the authoritative source for Sitrep's stated capabilities: https://github.com/dj9889/sitrep.
- The repo provides example Docker Compose, grafana-config.json, otel-collector-config.yaml, and tile-config templates; if any are missing, create minimal equivalents.
- Suggested numeric tuning (validate in your environment): capture interval 500 ms (tune 250–2000 ms); tile size 256 px (tune 128–512 px); Hamming threshold 10 (tune 5–30); daily token cap 4,000–50,000 tokens; pilot length 14 days; pilot team size 1–3; acceptable false-evidence rate to expand rollout <5%.

### Risks / Mitigations

- Privacy leaks: require blackout mode and an application allowlist; gate rollout until compliance checks pass.
- Incorrect evidence (false positives): require manual verification during pilot and track false-evidence rate; set an operational threshold (for example, <5%) to proceed.
- Unexpected spend: enforce a hard daily model budget and per-query rate limits (for example, 10 queries/minute), start on a cheap model tier, and monitor spend daily.
- Permission abuse: use read-only Grafana API keys and approval workflows for any write-level access.

### Next steps

- Start a 14-day pilot with 1–3 engineers. Track metrics daily: model spend ($ per day), median time-to-evidence (seconds), false-evidence rate (%), blackout activations (count), and queries per user per hour.
- Gate to wider rollout when: model spend stays within caps for 7 consecutive days, privacy incidents = 0, and false-evidence rate <5%.
- After pilot: document rollout decisions, approve production Grafana API keys, and run phased canaries when scaling beyond 10–50 users.

Begin by cloning the repo and following its README: https://github.com/dj9889/sitrep. Share logs or errors and I can help troubleshoot next steps.
