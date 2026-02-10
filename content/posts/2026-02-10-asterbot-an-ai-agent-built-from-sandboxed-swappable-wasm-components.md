---
title: "Asterbot — an AI agent built from sandboxed, swappable WASM components"
date: "2026-02-10"
excerpt: "Run Asterbot - an AI agent where each capability (search, memory, LLM) is a sandboxed, swappable WASM component via WASI. Learn how components are authorized and discovered."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-10-asterbot-an-ai-agent-built-from-sandboxed-swappable-wasm-components.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "wasm"
  - "wasi"
  - "wasmtime"
  - "asterbot"
  - "asterai"
  - "ai-agents"
  - "sandboxing"
  - "registry"
sources:
  - "https://github.com/asterai-io/asterbot"
---

## Builder TL;DR

What you get: a running Asterbot agent concept — "A modular AI agent built on WASM components. Every capability is sandboxed and swappable." Source: https://github.com/asterai-io/asterbot

Quick checklist to get started (high level):

- Clone the repository and inspect the README at the repo: https://github.com/asterai-io/asterbot
- Read the agent README and repo files to confirm the runtime and authorization model (the repo advertises sandboxed, swappable WASM components).
- Prepare a WASM-capable runtime and a local or remote component store before you execute components (see repo for component interfaces).
- Run repo-provided examples or tests to verify discovery and invocation behavior.

Key safety model in one line: per the repository description, every capability is provided as a sandboxed WASM module and is intended to be swappable; check the repo at https://github.com/asterai-io/asterbot for the exact runtime and manifest details.

Methodology note: factual statements above are grounded on the repository description linked above; operational commands and specific runtime names are treated as assumptions later in the checklist.

## Goal and expected outcome

Goal: exercise the Asterbot agent artifact so you can verify discovery and invocation of at least one sandboxed WASM capability from the codebase at https://github.com/asterai-io/asterbot.

Concrete outcome (acceptance criteria):

- You will have cloned the Asterbot repository (count: 1 repo).
- You will inspect the agent README and component manifests delivered with the repo (count: ≥1 manifest).
- You will run the repository’s example or test that demonstrates a component call and observe a non-error exit (0 exit code) for that run.
- Success metric threshold (smoke): <1% failures in local smoke runs (assumption captured below).

Deliverables by the end of this tutorial:

- Local clone of https://github.com/asterai-io/asterbot
- Readme inspection notes and at least one component manifest saved locally
- A passing local test run or example execution (artifact: test log)

Reference: repository landing -> https://github.com/asterai-io/asterbot

## Stack and prerequisites

Core pieces (as surfaced by the repo description):

- The Asterbot repository: https://github.com/asterai-io/asterbot (artifact).
- A collection of WASM-based components (the repo describes capabilities as WASM components that are sandboxed and swappable).

Developer prerequisites (minimum):

- Familiarity with cloning Git repositories (git).
- Comfort reading a README and component manifests inside a Git repo.
- Ability to run local tests or example programs provided by projects on GitHub.

Config artifact to check in the repo: the agent’s runtime and component manifests inside https://github.com/asterai-io/asterbot — verify those files before executing modules.

Note: operational specifics such as the exact WASM runtime binary, environment variable names used for tool authorization, and the registry URL are not present in the public README excerpt; these are captured as assumptions below.

## Step-by-step implementation

1. Clone and inspect the repo.

   - Command: git clone https://github.com/asterai-io/asterbot
   - Open the README and any component/manifest directories to understand how capabilities are declared.
   - Source: https://github.com/asterai-io/asterbot

2. Identify example(s) and tests shipped with the repo.

   - Locate example workflows or tests; make a note of required inputs and any environment variables referenced.

3. Validate local environment for WASM execution.

   - Confirm you can run simple WASM modules or the repo-provided example harness; if the repo includes a test suite, execute it and capture pass/fail counts.

4. Observe a component invocation from the agent.

   - Run the example agent invocation (if provided) and capture logs showing discovery and call of a component; save the run log as proof.

5. (Optional) Inspect a component manifest and verify declared capabilities.

   - Review permissions, declared inputs/outputs, and any policy attachments contained in the manifest.

6. Run the repo’s test suite and assert the smoke criteria.

   - Smoke success: target <1% failures locally across N=10 runs (assumption: test harness supports repeated runs).

Notes: the above numbered steps intentionally avoid naming a specific WASM runtime or an env var name because those details are not in the public excerpt of the README. If the repository includes concrete commands they will appear in the repo files at https://github.com/asterai-io/asterbot.

## Reference architecture

High-level components (derived from the repo description):

- Asterbot agent (control plane) — discovers and orchestrates capabilities.
- WASM components (capabilities) — modular, sandboxed, swappable.
- Component manifests stored alongside components or in a registry (repo indicates swappable components).

Architecture decision table (example, conceptual only):

| Choice | Pros | Cons |
|---|---:|---|
| Local-only component store | Faster local iteration, 0 network requests during dev | Harder to share components across teams (sync effort) |
| Central registry | Easier sharing, versioning | Requires auth, network dependency |

See the repository: https://github.com/asterai-io/asterbot for the canonical layout and any example diagrams included in the source.

## Founder lens: ROI and adoption path

Value proposition (conceptual): sandboxing each capability as a WASM module reduces the tool-exploit surface by limiting what each capability can access; the repository expressly positions capabilities as sandboxed and swappable: https://github.com/asterai-io/asterbot.

Phased adoption path (conceptual):

- Phase 1 (Dev): 1 component, dev-only, internal tests, 1–2 engineers.
- Phase 2 (Pilot): 3–5 components, non-critical workflows, 5–10 stakeholders.
- Phase 3 (Canary): 20% of traffic to WASM-enabled agents, telemetry enabled.
- Phase 4 (Full): 100% migration once quality and observed ROI thresholds are met.

ROI tracking examples (sample KPIs — illustrative):

- Reduction in privileged tool incidents: target 75% reduction year-over-year.
- Mean time to remediate (MTTR): target 30% improvement vs. prior tooling.

Reference repo: https://github.com/asterai-io/asterbot

## Failure modes and debugging

Common failure modes to look for (conceptual):

- Component not discovered: check filesystem/registry and agent discovery logs in the repo source.
- Manifest/permission mismatch: component declares capabilities but runtime denies access.
- Runtime execution faults: module panics or exits with non-zero code.

Suggested debug workflow (high level):

- Collect agent stdout/stderr and any component stderr logs for the failing run.
- Re-run the failing component in an isolated WASM execution harness (if available) to reproduce.
- Increase verbosity or enable repo-specified tracing flags, if present in https://github.com/asterai-io/asterbot.

Monitoring thresholds (example gates — assumptions below):

- Rollback if tool invocation error-rate > 2% for 15 min.
- Alert if 95th percentile latency for calls exceeds 1000 ms.

## Production checklist

Security, CI and rollout items (conceptual) — confirm the exact file names and scripts in https://github.com/asterai-io/asterbot.

- CI: ensure a build step that produces component artifacts.
- Security: require a signed manifest for published components.
- Observability: enable audit logs for all component discovery and invocation events.

- [ ] Clone the repo and sign the component manifest
- [ ] Run CI that builds the component to WASM
- [ ] Run repository sandbox tests (pass threshold: 100% of critical tests)
- [ ] Enable telemetry and set retention (example: 30 days retention)

Rollout / rollback plan (conceptual): canary + feature flag + automated rollback gate

- Canary: route 5–20% of production traffic to the new WASM-enabled agent for 24–72 hours.
- Gate: rollback automatically if error-rate > 5% for 10 minutes or if latency increase > 50% over baseline.
- Feature flags: toggle component visibility per environment and per user group.

### Assumptions / Hypotheses

The concrete commands, runtime names, env var names, and registry URLs required to implement the hands-on pieces below are not present in the public README excerpt of https://github.com/asterai-io/asterbot. The following is an explicit set of operational assumptions you can use as a concrete example. Treat these as hypotheses to validate against the repository files.

Example commands (assumption):

```bash
# Clone the repo
git clone https://github.com/asterai-io/asterbot
cd asterbot
# (Assumed) run a local example or test
./scripts/run-example.sh
```

Example runtime/config (assumption):

```yaml
# runtime-config.yaml (assumed format)
filesystem:
  allowed_paths:
    - ./components/data
network: false
logging:
  level: INFO
```

Rollout / rollback explicit gates (assumptions with thresholds):

- Canary percentage: 20% → 50% → 100% over three gates (20, 50, 100).
- Observation windows: 15 min for short gate, 72 hours for full canary.
- Rollback triggers: error-rate > 5% OR 95th percentile latency > 1000 ms OR unexpected stderr > 3 occurrences in 10 minutes.

Concrete numeric thresholds referenced in this document (all assumed unless validated against the repo): 1%, 2%, 3, 5%, 10 minutes, 15 minutes, 20%, 50%, 72 hours, 30 days, 1000 ms, 500 ms, 95th percentile, $0.10 (cost per 1k calls — illustrative), 2048 tokens (example budget), N=10 runs.

### Risks / Mitigations

- Risk: unknown env var names or runtime flags in the repo. Mitigation: inspect repository files and README at https://github.com/asterai-io/asterbot and confirm exact identifiers before running.
- Risk: component has broader permissions than expected. Mitigation: enforce minimal allowed_paths in runtime config and require signed manifests.
- Risk: runtime incompatibility. Mitigation: run components locally in an isolated harness and add pre-deploy smoke tests.

### Next steps

1. Inspect the full repository at https://github.com/asterai-io/asterbot and open any README, manifests, and scripts to validate the assumptions above.
2. Replace assumed commands and config with the repo-provided scripts and values.
3. Execute a local smoke run, collect logs, and iterate on config until the acceptance criteria (see Goal) are met.

References

- Repo: https://github.com/asterai-io/asterbot
