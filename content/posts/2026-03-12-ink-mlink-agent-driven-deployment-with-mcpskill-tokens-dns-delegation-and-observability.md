---
title: "Ink (ml.ink): Agent-driven deployment with MCP/Skill tokens, DNS delegation, and observability"
date: "2026-03-12"
excerpt: "Use Ink (ml.ink) to let AI agents push code, generate an MCP/Skill token, and deploy full‑stack apps with auto-detected builds, delegated subdomains, and shared observability."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-12-ink-mlink-agent-driven-deployment-with-mcpskill-tokens-dns-delegation-and-observability.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "ink"
  - "ml.ink"
  - "ai-agents"
  - "deployment"
  - "mcp"
  - "skills"
  - "dns"
  - "observability"
sources:
  - "https://ml.ink/"
---

## TL;DR in plain English

- What changed / why it matters: ml.ink (https://ml.ink/) is a single platform where an AI agent can build, deploy, and run apps. It bundles compute, DNS, databases, secrets, logs, and metrics in one workspace. Agents and humans see the same structured logs and real‑time metrics.
- What to do now: sign up at https://ml.ink/, create a workspace, generate an MCP/Skill token (platform API token), push a small repo, and let an agent deploy. Expect a first demo in about 60 minutes. DNS delegation can add 10–48 hours.
- Cost note: Ink bills per minute while services run. Snapshot rates: CPU $0.000393 / vCPU·min, Memory $0.000161 / GB·min. A $2 free credit is available to start (https://ml.ink/).

One quick methodology note: statements here cite the ml.ink snapshot at https://ml.ink/.

## What you will build and why it helps

You will build a small full‑stack demo that an agent can deploy to ml.ink (https://ml.ink/) and operate. The demo shows how an agent can push code, run a deploy, and read the same observability data you see.

Deliverables:

- A repository with a start command or Dockerfile pushed to Ink git or connected GitHub.
- An MCP/Skill token (platform API token) scoped for deploy and secrets.
- A running service reachable at yourservice.ml.ink (or a delegated dev subdomain) with structured logs and real‑time metrics visible in the dashboard.

Why this helps small teams:

- One workspace: compute, DNS, secrets, and observability live together and are agent‑accessible (https://ml.ink/). Agents don’t need separate cloud provider credentials.
- Faster shipping: Ink auto‑detects many stacks (Node, Python, Docker, Next.js and more) so you can go from code to URL faster.
- Shared observability: structured logs and real‑time charts let agents and humans share the same signals for debugging and autoscaling.

Concrete example: push a tiny Node app with a start script, create an MCP token, deploy to yourservice.ml.ink, and watch logs and CPU/memory charts for 1 hour. You’ll see build and runtime logs combined in the dashboard (for example: POST /api/deploy 201 — 230ms).

## Before you start (time, cost, prerequisites)

Estimated time

- 60 minutes to a first demo for a small app.
- 10–48 hours extra if you delegate a domain and wait for registrar propagation (https://ml.ink/).

Cost (from snapshot)

- CPU: $0.000393 per vCPU·min.
- Memory: $0.000161 per GB·min.
- Free credit: $2 to start.
- Billing model: pay per minute while services run; no idle charges when stopped (https://ml.ink/).

Minimum prerequisites

- An ml.ink account and workspace (https://ml.ink/).
- A small app: static site, Node, or Python microservice with a start script or Dockerfile.
- Access to your DNS registrar if you want delegated subdomains.

Quick checklist

- [ ] Create an ml.ink account and workspace (https://ml.ink/)
- [ ] Prepare a small repo with a start script or Dockerfile
- [ ] Generate an MCP/Skill token and store it securely
- [ ] (Optional) Delegate dev.example.com at your registrar to Ink nameservers

Simple cost example (60 minutes at 0.25 vCPU / 0.25 GB)

| Resource | Qty | Rate | Minutes | Cost |
|---|---:|---:|---:|---:|
| vCPU | 0.25 vCPU | $0.000393 / vCPU·min | 60 | $0.005895 |
| Memory | 0.25 GB | $0.000161 / GB·min | 60 | $0.002415 |
| Total | — | — | 60 | $0.00831 |

## Step-by-step setup and implementation

1) Create workspace and token

- Sign up at https://ml.ink/ and create a workspace. Invite the teammates who need access.
- In the dashboard generate an MCP or Skill token (platform API token). Restrict scopes to the minimum (deploy, secrets, DNS). Store it in your secrets manager as MCP_TOKEN.

Example env export (bash):

```bash
export MCP_TOKEN="your-token-here"
# store in your local .env or vault
```

2) Optional: delegate a dev subdomain

- Create an NS record at your registrar pointing dev.example.com to Ink's nameservers per instructions on https://ml.ink/. Allow up to 48 hours for propagation.

3) Prepare a minimal repo

- Provide a clear start command or Dockerfile. Ink auto‑detects many stacks, but a simple start script avoids failures.

Example package.json snippet:

```json
{
  "name": "mini-admin",
  "scripts": { "start": "node server.js" }
}
```

4) Push and deploy

- Push to Ink’s built‑in git or connect GitHub. Give your agent access to MCP_TOKEN and ask it to run the deploy action. The platform shows both build and runtime logs together.

5) Monitor and gate rollout

- Watch structured logs and metrics (CPU, memory, network). Use thresholds as gates: CPU 80%, memory 85%, error rate < 1% during canary.
- Example rollout plan: route 5% of traffic to new release for 10 minutes. Promote if error rate < 1% and latency is stable.

6) Autoscale and cost controls

- Start with 0.25 vCPU and 256 MB. Cap at 2 vCPU / 4 GB if you expect bursts. Configure auto‑shutdown after 60 minutes of idle time to control per‑minute billing.

YAML sample resource config:

```yaml
service:
  name: mini-admin
  resources:
    cpu: 0.25 # vCPU
    memory: 256 # MB
  autoscale:
    min_instances: 1
    max_instances: 4
    cpu_target: 0.7 # 70%
```

Rollback example (conceptual):

```bash
ml-ink service rollback --service mini-admin --to-revision 42 --token "$MCP_TOKEN"
```

## Common problems and quick fixes

- DNS not resolving: confirm NS delegation exists at the registrar and that the dev subdomain is added in the workspace (https://ml.ink/). Use dig; allow TTL up to 48 hours.
- Build detection failed: ensure a Dockerfile or package.json with a start script exists. Adding a Procfile or Dockerfile usually fixes auto‑detect failures.
- Missing permissions: check MCP_TOKEN scopes and workspace secret ACLs. Rotate the token if it was leaked.
- Runtime connection refused: inspect combined build/runtime logs in the dashboard for lines like ERROR Connection refused or Retry 1/3 — reconnecting...; check upstream host/port and database strings.

Quick triage checklist:

- [ ] Search logs for @level:error or specific error strings
- [ ] Verify MCP token scopes and expiration
- [ ] Confirm DNS NS records with dig (expect delegated NS)
- [ ] Run the start command locally to validate runtime

Log lines to watch (examples from the dashboard snapshot):

- POST /api/deploy 201 — 230ms
- Slow query: SELECT * FROM services (312ms)
- ERROR Connection refused: upstream 10.0.1.42:8080

## First use case for a small team

Scenario: a solo founder or a 1–3 person team needs an internal admin UI deployed and maintained by an agent (https://ml.ink/).

Concrete, actionable steps for small teams:

1) Minimum viable deploy in ~60 minutes

- Prepare a tiny Node app with a single route and a start script. Push to Ink git or connect GitHub at https://ml.ink/.
- Generate an MCP_TOKEN scoped to deploy+secrets only. Store it in a vault and do not paste it to chat.
- Ask the agent to deploy to the workspace default domain (yourservice.ml.ink) first — skip DNS delegation to save 10–48 hours.

2) Cost control and sizing (actionable)

- Start at 0.25 vCPU and 256 MB (expected cost ~ $0.00831 for 60 minutes).
- Set an idle auto‑shutdown at 60 minutes and a max cap of 2 vCPU / 4 GB to bound spend.
- Turn services off overnight or schedule daily shutdown to avoid 24/7 charges.

3) Fast safety and observability

- Enable structured logs and watch the 1H chart to catch regressions quickly.
- Use a canary: 5% traffic for 10 minutes. Require error rate < 1% before full promotion.
- Add a single human approver for production promotions.

4) Use platform features to reduce work

- Use Ink’s auto‑detect builds instead of writing Docker when possible to save setup time (https://ml.ink/).
- Let the agent read metrics via MCP so it can auto‑diagnose CPU spikes or retry failed deploys.

Checklist for small teams

- [ ] Use built‑in ml.ink domain for first demo to avoid DNS delay (https://ml.ink/)
- [ ] Start at 0.25 vCPU / 256 MB and enable idle shutdown at 60m
- [ ] Configure canary 5% for 10m with error gate < 1%

## Technical notes (optional)

Plain-language summary before advanced details:

These notes show the low‑level features you can use when you need programmatic control or custom runtimes. You can skip this section if you prefer the dashboard and auto‑detect builds.

- Programmatic control: Ink exposes MCP/Skill APIs so agents can call platform operations (deploy, scale, set secrets, create DNS records) programmatically (https://ml.ink/).
- Observability: structured logs and real‑time metrics with ranges 1H, 6H, 7D, 30D let agents and humans share the same signals.
- Supported stacks: auto‑detect, Docker, or buildpacks. When you need exact runtime control, provide a Dockerfile.

Example minimal Dockerfile:

```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "server.js"]
```

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumes per‑minute billing and the snapshoted rates (CPU $0.000393 / vCPU·min, Memory $0.000161 / GB·min) match the current ml.ink pricing at https://ml.ink/.
- Assumes agents can access structured logs, real‑time metrics, and perform deploy/scale operations via MCP/Skill as shown on the site.

### Risks / Mitigations

- Risk: unexpected continuous run time increases costs. Mitigation: set autoscale caps, idle shutdown at 60 minutes, and schedule nightly shutdowns.
- Risk: faulty deploy causes user impact. Mitigation: canary 5% for 10 minutes; require error rate < 1% and stable latency before full rollout; rollback when 5xx > 0.5% over 5 minutes.
- Risk: token leakage. Mitigation: restrict MCP/Skill token scopes, rotate tokens every N days, and store tokens in a secrets manager.

### Next steps

- Harden SLOs and alerts (example thresholds: CPU 80%, memory 85%, 5xx threshold 0.5%).
- Run a rollback drill: practice reverting to a previous revision within 5 minutes.
- Automate DB backups and migration rollbacks.

Final production checklist

- [ ] Rotate and scope MCP/Skill tokens
- [ ] Enable canary deploys (5% for 10m) with health gates
- [ ] Set SLOs and alerts (CPU 80%, memory 85%, 5xx 0.5%)
- [ ] Configure backups and migration rollback steps
- [ ] Run an incident drill and verify rollback time < 10 minutes

If you want, I can produce a one‑page incident runbook, a sample Procfile/Dockerfile for your stack, and a minimal MCP/Skill permission list to request.
