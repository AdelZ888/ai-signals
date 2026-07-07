---
title: "Wayflow — an embeddable visual workflow editor with a built-in runtime"
date: "2026-07-07"
excerpt: "Drop a full visual workflow workspace into your web app with one call. Edit a JSON graph users can run in-browser or on your server - includes LLM, branching, human-in-loop and custom nodes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-07-wayflow-an-embeddable-visual-workflow-editor-with-a-built-in-runtime.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "wayflow"
  - "visual-workflow-editor"
  - "runtime"
  - "embeddable"
  - "llm"
  - "human-in-the-loop"
  - "open-source"
  - "developer"
sources:
  - "https://wayflow.build/"
---

## TL;DR in plain English

- What it is: Wayflow is an embeddable visual workflow editor with a built-in runtime. Drop a full workflow workspace into a web app with one call. See https://wayflow.build/.
- How it runs: The same JSON graph you edit can run in the browser for fast prototypes or on your server in production. See https://wayflow.build/.
- Key pieces: one call mounts canvas, node palette, config panel, and run controls. A runtime ships with the package so you can execute graphs without rebuilding an engine. See https://wayflow.build/.

Quick starter checklist

- [ ] npm install wayflow
- [ ] Call createWorkflowEditor(element) to mount the UI
- [ ] Export graph.json and store it as your canonical artifact

Concrete example (short scenario)

- Scenario: A small support team embeds Wayflow to triage tickets. They mount the editor, build a flow: ticket -> LLM (large language model) summarize -> conditional route -> human approval -> response. They export graph.json and run that graph in the browser for early testing. Later they run the same graph on a server with provider keys kept secret. See https://wayflow.build/.

Notes about sources and terms

- LLM means "large language model." CI means "continuous integration." All claims here follow the Wayflow docs at https://wayflow.build/.

## What you will build and why it helps

You will embed a complete workflow workspace inside your web product. Wayflow provides the canvas, node palette, config panel, and run controls in one mount call, so you do not need to build an editor UI or an execution engine from scratch. The docs describe it as "a complete workspace, not a blank canvas you finish yourself." A runtime ships in the box and can run the same graph in the browser or on a server. See https://wayflow.build/.

Why this helps

- Faster iteration: non-engineers can assemble node-based flows without a custom UI.
- Single artifact: exported graph.json is the canonical representation the runtime executes.
- Flexible execution: built-in LLM steps, tool-calling, branching, and map-over-list nodes mix with deterministic steps. Use AI where useful and plain logic where you need predictability. See https://wayflow.build/.

What you will ship

- An embedded editor instance in your app.
- A versioned graph.json that represents each workflow.
- Optional server adapters that hold provider keys for production runs. See https://wayflow.build/.

## Before you start (time, cost, prerequisites)

Prerequisites

- A web page or app that runs TypeScript/JavaScript and has a DOM element to mount the editor. Wayflow supports React, Vue, Svelte, Angular, Solid, and Vanilla JS. See https://wayflow.build/.
- Basic ability to export/import JSON files (graph.json) and store them in your repo or backend. See https://wayflow.build/.
- A place to host provider keys off the client if you plan to call LLM or image vendors from a server runtime. Wayflow provides provider-neutral adapters; you supply keys to your chosen vendors. See https://wayflow.build/.

Time and cost (high level)

- The library is MIT licensed and ships as a client-side package (docs reference releases such as v0.3.0). See https://wayflow.build/.
- Provider API costs (for LLMs or image services) are billed by your chosen vendor. Wayflow itself does not bill vendor usage. See https://wayflow.build/.

Estimated effort

- Mounting the editor and making a simple in-browser prototype: 30–120 minutes for an experienced developer.
- Adding a small server runtime and provider adapters: a few hours to a day depending on complexity.

## Step-by-step setup and implementation

Follow these concrete steps based on the quickstart pattern in the docs (https://wayflow.build/):

1) Install the package

```bash
# install the package referenced in the docs
npm install wayflow@0.3.0
```

2) Mount the editor with one call

```ts
import { createWorkflowEditor } from 'wayflow'
// mount into a DOM container
const editor = createWorkflowEditor(document.getElementById('editor'))
```

3) Build flows and export the graph

- Use the UI to add nodes, wire them, and configure steps. Export graph.json. That JSON is the canonical artifact the runtime consumes. See https://wayflow.build/.

4) Prototype in-browser

- The shipped runtime can execute the exported graph inside the browser for quick validation without a backend. See https://wayflow.build/.

5) Move to server execution when you need secrets or scale

- Use the same graph JSON on a server-side runtime and inject provider adapters for protected keys. The docs state the runtime can run both in-browser and on a server. See https://wayflow.build/.

Server adapter example (illustrative)

```json
{
  "adapters": {
    "example-provider": { "apiKey": "REDACTED_ON_SERVER" }
  }
}
```

6) Extend with custom nodes

- Wayflow exposes TypeScript types and zero runtime dependencies. Implement node handlers in TypeScript and register them in both editor and runtime so the graph can execute them. See https://wayflow.build/.

Plain-language explanation before advanced details

- What happens when you mount the editor: the UI shows a canvas, a palette of nodes, a config panel, and run controls. You build a graph visually. When you run it, the runtime interprets the graph JSON and executes nodes in order. For AI steps the runtime calls provider adapters you configure. For human approval steps the runtime can pause and resume. These behaviors are described in the Wayflow docs. See https://wayflow.build/.

## Common problems and quick fixes

All troubleshooting steps assume you followed the docs at https://wayflow.build/.

| Symptom | First check | Quick target |
|---|---:|---:|
| Editor mounts but runtime errors | Confirm exported graph.json is present and matches the editor export | 0 malformed graphs in CI |
| AI nodes fail in prototype | Ensure provider adapters/keys are configured where the runtime runs | 1 server-side adapter for production |
| Custom node not executing | Confirm node registration in both editor and runtime | 1 matching registration |

Quick fixes

- If the UI appears but nodes error, export graph.json and validate its JSON shape against your runtime. See https://wayflow.build/.
- If you see missing-provider errors, configure provider adapters on the runtime host. Wayflow is provider-neutral and expects you to plug in keys. See https://wayflow.build/.
- Pin the Wayflow package version in package.json to avoid mismatches between editor and runtime during upgrades (docs reference releases such as v0.3.0). See https://wayflow.build/.

## First use case for a small team

Use case: customer support triage (an example in the docs: triage tickets, route them, and draft replies with a human check). See https://wayflow.build/.

Three actionable steps for a team of 1–3

1) Prototype fully in-browser (30–120 minutes)

- Mount the editor locally and build a minimal flow with 4–6 nodes: input → LLM summarize → conditional route → human approval → output. Export graph.json and test runs in the browser. See https://wayflow.build/.

2) Keep secrets server-side (immediate)

- Create a small server that hosts provider adapters and injects API keys. Point the runtime to call that server for LLM/image calls. Do not embed keys in client builds. See https://wayflow.build/.

3) Ship a single canonical artifact and a reviewer checklist (1 commit)

- Commit exported graph.json to a repo path for versioning. Add a brief reviewer checklist that explains expected node behavior and any human approval steps. This gives a single source of truth for changes.

Additional tips for small teams

- Automate graph.json validation in CI (continuous integration) before merging changes. See https://wayflow.build/.
- Start with one LLM step and expand only after behavior is stable.
- Log run IDs and node durations to track regressions; keep logs for at least 30 days for early-stage audits.

See https://wayflow.build/ for editor and runtime reference.

## Technical notes (optional)

- Single-call mount: createWorkflowEditor() mounts canvas, palette, config panel, and run controls in one call. See https://wayflow.build/.
- Runtime parity: a real execution engine ships with Wayflow so you can prototype in the browser and run the same graph on a server. See https://wayflow.build/.
- Built-in node types: includes LLM steps, tool-calling, branching, and map-over-list nodes; these mix with deterministic steps. See https://wayflow.build/.
- Provider adapters: neutral adapters let you plug vendor keys and swap providers without changing the editor graph. See https://wayflow.build/.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: you will export graph.json from the editor and store it as the canonical artifact. See https://wayflow.build/.
- Hypothesis: embedding and a first in-browser prototype can take ~2 hours for an experienced developer.
- Hypothesis: adding a minimal server runtime and adapter mapping takes ~4–12 hours for a small team.
- Hypothesis: initial provider spend ranges from $10 to $500+/month depending on usage and model choice.
- Suggested rollout gates (example thresholds to test during canary): 10% traffic, 3 hosts, 48 hours canary duration, error-rate gate < 2%, approval SLA < 24 hours.
- Observability targets: median external-call latency < 100 ms, 95th percentile < 1000 ms, external-call timeout 30 s.
- Testing counts for map-over-list: test with 1, 10, and 100 items. Token warmup example: 10,000 tokens/day as an initial budget.

### Risks / Mitigations

- Risk: provider keys exposed in client builds. Mitigation: keep keys off the client; store secrets in a vault and use server-side adapters. See https://wayflow.build/.
- Risk: external API latency slows runs. Mitigation: set a 30 s timeout, monitor median and 95th percentile latencies, and add retries or fallbacks.
- Risk: malformed graphs reach production. Mitigation: add graph JSON validation in CI and block merges of invalid graph.json files.

### Next steps

- Add observability: capture run-level audit logs and node timings; create an alert for runtime error rate > 2%.
- Testing: add unit tests for custom node handlers and end-to-end tests that execute representative graph.json files.
- Rollout: enable a feature flag and run a canary with the example thresholds above. Expand if gates pass; have a rollback feature flag ready.
- Operational: pin Wayflow package in package.json (example: wayflow@0.3.0), keep a migration checklist, and document where graph.json lives in your repo.

Quick references

```bash
# dev quickstart (example)
npm install wayflow@0.3.0
npm run dev
```

```json
{
  "providerAdapters": {
    "example": { "note": "store real keys on server or in vault" }
  }
}
```

Checklist before route-to-production:

- [ ] Export and commit a canonical graph.json
- [ ] Add CI graph validation
- [ ] Configure server-side adapters for providers
- [ ] Add basic observability (logs, error-rate alerts)

For the canonical docs and API reference, see https://wayflow.build/.
