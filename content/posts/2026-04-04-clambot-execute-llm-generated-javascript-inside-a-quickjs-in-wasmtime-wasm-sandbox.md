---
title: "ClamBot: Execute LLM-generated JavaScript inside a QuickJS-in-Wasmtime WASM sandbox"
date: "2026-04-04"
excerpt: "A tutorial outline for ClamBot: run LLM-generated JavaScript inside a QuickJS WebAssembly module under Wasmtime. See how sandboxing limits host exposure and adds control."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-04-clambot-execute-llm-generated-javascript-inside-a-quickjs-in-wasmtime-wasm-sandbox.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "ClamBot"
  - "WASM"
  - "QuickJS"
  - "Wasmtime"
  - "sandboxing"
  - "LLM"
  - "JavaScript"
  - "security"
sources:
  - "https://github.com/clamguy/clambot"
---

## TL;DR in plain English

- ClamBot is a security-focused personal AI assistant that runs LLM-generated JavaScript inside a WebAssembly (WASM) sandbox by embedding QuickJS inside Wasmtime. See https://github.com/clamguy/clambot for the project description.
- The sandboxing pattern reduces direct exposure of your host to generated code: the JS runs inside QuickJS compiled to WASM and executed by Wasmtime rather than performing host syscalls directly. Reference: https://github.com/clamguy/clambot
- Quick starter: clone the repo, read the README, and run the example in an isolated VM or container with Wasmtime available. See https://github.com/clamguy/clambot

Quick checklist (first things to do):

- [ ] Clone https://github.com/clamguy/clambot
- [ ] Read the top-level README in the repo (look for notes about QuickJS + Wasmtime)
- [ ] Run the provided example inside an isolated VM or container
- [ ] Verify logs show sandboxed execution

Concrete scenario (short): an LLM generates a JavaScript maintenance snippet. Instead of executing that snippet on the host, run it in the QuickJS-in-WASM sandbox. If the snippet attempts an unsupported syscall or a missing binding, the sandbox prevents the action. See https://github.com/clamguy/clambot

## What you will build and why it helps

You will set up a local experiment that accepts JavaScript produced by an LLM and executes it inside a WASM sandbox where QuickJS runs under Wasmtime. The repository documents this architecture: https://github.com/clamguy/clambot

Why this helps (short):

- Isolation: generated code executes inside a WASM runtime rather than the host OS.
- Explicit surface: only host bindings you register are reachable from the sandbox.
- Safer iteration: you can validate small tasks locally before broader rollout.

Decision/comparison table (sandbox vs direct host execution)

| Aspect | Sandbox (QuickJS in Wasmtime) | Direct host execution |
|---|---:|---:|
| Host syscall exposure | Minimal; only explicit bindings | Full, unless manually restricted |
| Review burden | Bindings reviewed before enabling | High; every script may require review |
| Typical use case | Short, ephemeral tools and maintenance scripts | Full automation, OS-level tasks |
| Failure mode | Script error or binding-denied (observable) | Potential host compromise or accidental change |

Reference: https://github.com/clamguy/clambot

## Before you start (time, cost, prerequisites)

Prerequisites (minimum):

- Git and basic command-line skills.
- An isolated test host: VM or container for first runs.
- Wasmtime available on the test host (the project uses Wasmtime as the WASM runtime). See https://github.com/clamguy/clambot

Cost note: the repository is open source; cloning and local tests have no licensing cost. Running many sandboxes in cloud VMs will incur cloud compute and storage costs.

Safety planning (must-have before any write-capable flows):

- A policy describing which host bindings are allowed and how they are approved.
- An audit log and a human approval step for write-capable APIs.

Repo reference: https://github.com/clamguy/clambot

## Step-by-step setup and implementation

Methodology note: the core architecture — QuickJS inside Wasmtime — is described in the repository: https://github.com/clamguy/clambot. The steps below are a minimal, conservative path to a local proof-of-concept.

1. Clone the repository and change into it.

```bash
git clone https://github.com/clamguy/clambot.git
cd clambot
```

2. Read the top-level README and runtime notes in the repo. Look for mentions of QuickJS and Wasmtime: https://github.com/clamguy/clambot

3. Install Wasmtime on your test host (or use the runtime artifacts the repo documents). The README will point to build and runtime steps.

4. Run the provided example in an isolated VM or container. Use the example harness the repo includes; a placeholder run might look like:

```bash
# adjust to the repo's actual runner if different
./run-sandbox --config sandbox.yaml --script examples/hello.js
```

5. Start with a trivial JavaScript snippet that returns a computed value. Send that snippet to the runner and confirm an expected result.

6. Verify isolation: attempt an action that requires a missing host binding (for example, opening /etc/passwd). Confirm the runtime returns an error or binding-denied message rather than accessing the file.

7. Add bindings only as needed, keep them minimal, and require explicit human review for write-capable bindings. Track binding changes in the repo and require PR + reviewer approval for each change.

Reference: https://github.com/clamguy/clambot

## Common problems and quick fixes

Symptom: example doesn't start.
- Likely cause: Wasmtime not installed or build step failed. Check the README in the repo: https://github.com/clamguy/clambot
- Quick check commands:

```bash
which wasmtime || echo "wasmtime not found"
wasmtime --version || echo "wasmtime version check failed"
```

Symptom: script errors about missing APIs.
- Fix: mock the binding in tests or add a minimal, reviewed host binding.

Symptom: timeouts during runs.
- Fix: increase the execution timeout for local testing; ensure tighter limits before production.

Symptom: unexpected network or file access.
- Fix: remove or restrict the offending binding, re-run canaries, and review audit logs.

If you need quick evidence of sandboxing, run a synthetic failing script that attempts an unavailable host call and check for a binding-denied error in the logs. Repo reference: https://github.com/clamguy/clambot

## First use case for a small team

Use case: a 3–8 person engineering team wants an internal assistant to generate short maintenance scripts without giving those scripts arbitrary shell access on CI or production. Start with the repository as a conservative prototype: https://github.com/clamguy/clambot

Conservative rollout steps:

- Start with a single developer or a very small canary group behind a feature flag.
- Expose a small, read-only host API first; do not enable write-capable APIs by default.
- Require human approval and PR review for any binding that enables writes.
- Collect and review logs daily for the first 7–14 days.

Rollout checklist for a small team:

- [ ] Run integration smoke tests with synthetic workloads
- [ ] Review and sign off on host API exposure
- [ ] Require manual approval before enabling write-capable APIs
- [ ] Enable audit logging and review results

Repo reference: https://github.com/clamguy/clambot

## Technical notes (optional)

- The project embeds QuickJS inside Wasmtime so JavaScript runs as a WASM module under a controlled runtime. See the repository description: https://github.com/clamguy/clambot
- Any host binding you register increases the attack surface; minimize bindings and require code review.

Example host-binding configuration (illustrative JSON — adjust to the repository runtime and policy):

```json
{
  "bindings": {
    "readDir": { "path": "/srv/safe-read", "mode": "read-only" },
    "maxConcurrent": 4
  }
}
```

Keep a signed manifest or PR-based approval step for binding changes and maintain an auditable history of which bindings are enabled in each environment.

Reference: https://github.com/clamguy/clambot

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository implements a security-focused personal AI assistant which runs LLM-generated code inside a WASM sandbox (QuickJS inside Wasmtime): https://github.com/clamguy/clambot.
- The following operational thresholds are hypotheses to validate in staging (treat these as experimental until measured):
  - Execution timeout to test: 500 ms, 1,000 ms, 2,000 ms (evaluate p95 behavior).
  - Memory per sandbox to try: 16 MB, 32 MB, 64 MB, 128 MB.
  - Canary rollout sizes to validate: 1 developer, 2 developers, then 5% of users.
  - Synthetic runs per canary: 100 runs, 500 runs, 1,000 runs.
  - Alert thresholds to consider: error rate > 2% after 100 runs; p95 latency > 2,000 ms.
  - Concurrency knobs to test: 1, 2, 4, 8 sandboxes per host.
  - Local smoke-test time estimate: 30–60 minutes; small prototype adaptation: 2–4 hours.

### Risks / Mitigations

- Risk: overly permissive host bindings create an escape path.
  - Mitigation: require PR + reviewer sign-off for any binding change; maintain a signed manifest of allowed bindings.
- Risk: performance or cost issues at scale (compute or storage costs grow nonlinearly).
  - Mitigation: limit concurrency per host (test 4–8), measure cost in staging, and gate autoscaling until canary success.
- Risk: silent failures or unnoticed errors.
  - Mitigation: set alerts (error rate > 2% after 100 runs; p95 latency > 2,000 ms), enable structured audit logs, and schedule daily reviews during rollout.

### Next steps

- Run a focused canary: pick 1–2 developers or ~5% of users and execute 100–1,000 synthetic runs. Monitor success rate, average latency (ms), memory usage (MB), and audit log volume (MB/day).
- Codify a host-binding review policy and require PR + reviewer sign-off; use a signed manifest for production binding changes.
- Add an incident runbook with an immediate rollback flag and notification thresholds (error rate > 2% or p95 latency > 2,000 ms).
- Keep write-capable APIs behind manual feature flags and do not enable them by default; require human approval for each activation.

Repository for reference and code review: https://github.com/clamguy/clambot

Short methodology note: architectural statements above are grounded in the repository description at https://github.com/clamguy/clambot; operational thresholds are proposed hypotheses to validate in staging.
