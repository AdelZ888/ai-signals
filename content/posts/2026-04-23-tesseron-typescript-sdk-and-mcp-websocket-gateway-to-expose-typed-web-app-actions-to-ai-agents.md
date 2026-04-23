---
title: "Tesseron: TypeScript SDK and MCP WebSocket gateway to expose typed web-app actions to AI agents"
date: "2026-04-23"
excerpt: "Tesseron is an open-source TypeScript SDK and MCP-compatible WebSocket gateway that lets web apps register typed actions callable by AI agents. Follow repo examples to run a local demo."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-23-tesseron-typescript-sdk-and-mcp-websocket-gateway-to-expose-typed-web-app-actions-to-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "tesseron"
  - "typescript"
  - "mcp"
  - "websocket"
  - "ai-agents"
  - "sdk"
  - "developer-tools"
  - "integration"
sources:
  - "https://github.com/BrainBlend-AI/tesseron"
---

## TL;DR in plain English

Tesseron is an open-source TypeScript SDK plus an MCP-compatible WebSocket gateway that lets a web app expose typed actions to AI agents over WebSocket (see the repository: https://github.com/BrainBlend-AI/tesseron). Use the repo's README and the example folders as the canonical reference implementation.

Quick summary:
- Purpose: expose typed web-app actions (inputs/outputs described with TypeScript) to MCP-compatible agents via a WebSocket gateway (source: https://github.com/BrainBlend-AI/tesseron).
- What you will run: a gateway process and a small app that registers typed actions; examples in the repo show both pieces (https://github.com/BrainBlend-AI/tesseron).

Methodology: claims about repository contents are sourced to the repo link above; the guide below mixes repo-grounded facts with pragmatic recommendations.

## What you will build and why it helps

You will assemble a minimal demo with two components derived from the repository examples:
- A TypeScript web app that registers typed actions (shared TypeScript types describe inputs and outputs).
- The tesseron MCP-compatible WebSocket gateway that exposes those actions to agents over a WebSocket endpoint.

Why this matters (repo-backed): the project description states it "expose[s] typed web-app actions to MCP-compatible AI agents over WebSocket" and ships a TypeScript SDK plus a matching gateway, so using the examples gives you a ready template for typed contracts between app and agent (https://github.com/BrainBlend-AI/tesseron).

Component comparison

| Component | Role | Source of truth |
|---|---:|---|
| TypeScript SDK | Register typed actions, input/output types | examples and SDK code in repo (https://github.com/BrainBlend-AI/tesseron)
| MCP WebSocket gateway | Accept agent connections and forward action calls to app handlers | gateway example in repo (https://github.com/BrainBlend-AI/tesseron)

Deliverable: a working local demo in which an agent (or simulator) calls a named action and the app returns a typed response. Use the repository examples as the canonical templates (https://github.com/BrainBlend-AI/tesseron).

## Before you start (time, cost, prerequisites)

Repository reference: https://github.com/BrainBlend-AI/tesseron

Minimum prerequisites (from the repo context):
- Node.js + TypeScript toolchain (the SDK is TypeScript-based; examples live in the repository: https://github.com/BrainBlend-AI/tesseron).
- A machine that can run a local Node process and a WebSocket endpoint.

Starter checklist (use the repository examples as the working reference):
- [ ] Clone the tesseron repository and inspect the example folders: https://github.com/BrainBlend-AI/tesseron
- [ ] Identify the SDK example that shows action registration and the example gateway process
- [ ] Confirm you can run Node and compile TypeScript locally

Cost note: the repo is open-source. Hosting and operational costs are external to the repository and not described there; treat hosting as a separate operational decision (see Assumptions / Hypotheses for example cost estimates).

## Step-by-step setup and implementation

Follow the examples in the repository; they are the authoritative starting point: https://github.com/BrainBlend-AI/tesseron

Minimal example flow (align with the repo examples):

1) Clone the repository and open the examples folder

```bash
git clone https://github.com/BrainBlend-AI/tesseron
cd tesseron
ls -la examples
```

2) Locate the SDK example that registers actions and the gateway example that exposes them via WebSocket (both are included in the repo: https://github.com/BrainBlend-AI/tesseron).

3) Create a shared types file and a handler based on the example structure. Keep types in a shared module so both the gateway and the app import the same contract.

```ts
// examples/shared/actions.ts  (follow the repository files as canonical)
export interface FetchAccountInput { id: string }
export interface FetchAccountOutput { id: string; name: string; status: string }

// registration (follow the SDK usage in the repo examples)
// sdk.registerAction<FetchAccountInput, FetchAccountOutput>('fetchAccount', handler)
```

4) Start the gateway and the demo app using the commands shown in the examples. Confirm the gateway opens the WebSocket endpoint expected by the agent example (examples and commands are in the repository: https://github.com/BrainBlend-AI/tesseron).

5) Use an MCP-compatible agent or a simulator to call the registered action. The app should receive a typed request and return a typed response; the repo examples demonstrate the message wiring and handler patterns (https://github.com/BrainBlend-AI/tesseron).

Example illustrative gateway config (follow repo examples for exact keys):

```yaml
# examples/config/example-gateway.yaml  (illustrative; validate against repository files)
server:
  wsPath: /mcp
protocol:
  version: 1
security:
  requireAuth: true
```

Observability suggestions (refer to example hooks in the repo): log action name and request ID; measure duration_ms per invocation; keep request/response sizes reasonable.

## Common problems and quick fixes

Repository reference for troubleshooting: https://github.com/BrainBlend-AI/tesseron

Connection refused / WebSocket closed
- Confirm the gateway process is running and listening on the expected wsPath from the example config.
- Check example logs in the gateway example folder (the repo shows how gateway startup and errors are logged: https://github.com/BrainBlend-AI/tesseron).

Type mismatches between gateway and app
- Move shared TypeScript types into a single file or small package imported by both sides (the examples demonstrate a shared-types pattern: https://github.com/BrainBlend-AI/tesseron).

Protocol mismatch with agents
- Verify agent and gateway use the same MCP-compatible wiring. The gateway in the repository is described as MCP-compatible and the examples are the reference: https://github.com/BrainBlend-AI/tesseron.

Quick commands and checks (illustrative):

```bash
# verify a process is listening on the expected port (macOS/Linux)
lsof -iTCP -sTCP:LISTEN -P | grep LISTEN
```

If you see type compilation errors, run the repository's TypeScript build step shown in the examples and adjust imports so both sides compile against the shared types (examples: https://github.com/BrainBlend-AI/tesseron).

## First use case for a small team

Repository reference: https://github.com/BrainBlend-AI/tesseron

Target outcome: a 1–3 person team (including solo founders) runs a safe, minimal demo that exposes a very small set of typed read-only actions to an agent for internal workflows, using the examples in the repository as templates.

Concrete, actionable steps for solo founders / very small teams (apply the repo examples directly):

1) Start with 1–3 read-only actions and the example gateway
- Use the repository examples to model each action's TypeScript input/output. Keep the action catalog small so you can test all code paths in short sessions (follow example files in the repo: https://github.com/BrainBlend-AI/tesseron).

2) Keep types shared and pinned locally
- Put shared types in a single file under examples/shared or a tiny package and import it in both the gateway and app. This avoids drift when you iterate quickly (the repo includes example structures for sharing types: https://github.com/BrainBlend-AI/tesseron).

3) Run everything locally and exert manual control before automating
- Start the gateway and app from the example start commands. Manually invoke each action using the agent simulator or example client in the repo to validate behaviour before introducing automation (see examples in the repository: https://github.com/BrainBlend-AI/tesseron).

4) Add a simple approval gate for any write-style action
- If you add any action that performs writes, require a human confirmation step or a manual feature flag toggle before the gateway forwards the call to a handler (the repository provides the gateway pattern; implement the gate in your handler code using the examples as a template: https://github.com/BrainBlend-AI/tesseron).

Solo-founder checklist (quick):
- [ ] Limit to 1–3 read-only actions initially (use examples in the repo)
- [ ] Share and pin types in a single file/package from examples/shared (https://github.com/BrainBlend-AI/tesseron)
- [ ] Run gateway and app locally and exercise each action manually using the repo's example client

Why follow the repo examples: the repository explicitly provides a TypeScript SDK and an MCP-compatible WebSocket gateway; using its examples reduces ambiguity about wiring and types (https://github.com/BrainBlend-AI/tesseron).

## Technical notes (optional)

Reference: https://github.com/BrainBlend-AI/tesseron

- The repository implements a TypeScript SDK and an MCP-compatible WebSocket gateway; use the example code in the repo as canonical implementations for registration and message wiring (https://github.com/BrainBlend-AI/tesseron).
- To avoid type drift, export shared types from a single module imported by both gateway and app.
- Instrument actions with simple metrics: count, duration_ms, and status. The repo examples show where handlers hook into the SDK/gateway flow, which is a logical place to emit these metrics (https://github.com/BrainBlend-AI/tesseron).

Minimal example metrics JSON (illustrative):

```json
{
  "action": "fetchAccount",
  "duration_ms": 120,
  "status": "ok"
}
```

## What to do next (production checklist)

Repository reference: https://github.com/BrainBlend-AI/tesseron

### Assumptions / Hypotheses
- The tesseron repository describes a TypeScript SDK and an MCP-compatible WebSocket gateway that exposes typed web-app actions (source: https://github.com/BrainBlend-AI/tesseron).
- The repository contains example folders that show action registration, gateway setup, and wiring between agent and app; this guide relies on those example folders as canonical templates (https://github.com/BrainBlend-AI/tesseron).
- Operational recommendations and numeric thresholds below are suggested practices for staging and production; they are not explicit claims from the repository and therefore listed as assumptions/hypotheses here:
  - Initial demo inspection time: 10–20 minutes.
  - Initial local run time target: 60–90 minutes.
  - Keep initial action count to 1–3 actions.
  - Test invocation latency target in staging: 30,000 ms (30 s) goal for functional tests; tighter targets for production (see below).
  - Local latency gate for developer testing: 500 ms.
  - Canary rollout example: 10% of traffic for 24 hours.
  - Alert threshold example: error rate > 1% over 5 minutes.
  - SLO example: 99% success rate.
  - Suggested retry policy: 3 retries with initial backoff 200 ms.
  - Cost estimate for a tiny hosted gateway: $5–$50 / month (highly variable).
  - Testing window for initial restricted testing: 48 hours.

### Risks / Mitigations
- Risk: accidental destructive writes by agents. Mitigation: keep initial actions read-only and require manual approval or feature flags for writes.
- Risk: type drift between gateway and app. Mitigation: publish or pin shared TypeScript types and add CI steps that compile both sides together.
- Risk: performance regressions at scale. Mitigation: canary rollouts (example: 10% traffic for 24 hours) and metric gates (alert if error rate > 1% over 5 minutes or average latency exceeds chosen targets).

### Next steps
- Harden transport: enable TLS (wss://) and require agent authentication as you move to production; consult the gateway example for where transport changes belong (https://github.com/BrainBlend-AI/tesseron).
- Add CI: build shared types, run unit tests, and add an integration test that invokes each exported action from the repository examples.
- Operations: create a runbook with restart commands, a rollback container tag policy, and an incident contact list.

Production checklist (adapt items from repository examples):
- [ ] TLS enabled for WebSocket
- [ ] Agent authentication required
- [ ] Shared types published or pinned and compiled in CI
- [ ] Canary rollout plan defined (example: 10% traffic for 24 hours)
- [ ] Alerts configured: error rate > 1% over 5 minutes
- [ ] SLO: 99% success, average latency targets defined

For canonical examples and exact SDK usage, refer to the repository: https://github.com/BrainBlend-AI/tesseron
