---
title: "Litmus: Record and deterministically replay full LLM agent executions for debugging and CI validation"
date: "2026-03-25"
excerpt: "Litmus records complete LLM agent executions (prompts, tool calls, outputs) so teams can deterministically replay failures, inject faults, and gate regressions in CI."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-25-litmus-record-and-deterministically-replay-full-llm-agent-executions-for-debugging-and-ci-validation.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "NEWS"
tags:
  - "litmus"
  - "llm-agents"
  - "observability"
  - "testing"
  - "ci"
  - "replay"
  - "fault-injection"
  - "reliability"
sources:
  - "https://github.com/rylinjames/litmus"
---

## TL;DR in plain English

Litmus is a lightweight flight recorder for LLM agents. It records full agent executions: prompts, tool calls, and model outputs. The project says it can deterministically replay those runs. (See https://github.com/rylinjames/litmus.)

What you can do quickly:

- Record failing runs so you stop guessing from sparse logs. (https://github.com/rylinjames/litmus)
- Replay the exact run locally or in CI to reproduce the issue. (https://github.com/rylinjames/litmus)
- Inject faults during replay to test retries and error handling. (https://github.com/rylinjames/litmus)

Short action: capture a failing trace, reproduce it with the repo, and validate the fix in a replay before rolling out. (https://github.com/rylinjames/litmus)

## What changed

- A ready-made recorder and deterministic replay for agent executions is available in the Litmus project. The repo describes record-and-replay for LLM agents. (https://github.com/rylinjames/litmus)
- The project advertises built-in primitives for fault injection, reliability scoring, and CI gating. These reduce the need to build a bespoke tracing system. (https://github.com/rylinjames/litmus)
- Practically: teams can capture exact runs (prompts, tool calls, outputs) and run them deterministically in dev or CI instead of relying on partial logs. (https://github.com/rylinjames/litmus)

## Why this matters (for real teams)

Recording and replaying full agent runs addresses three common pain points. (https://github.com/rylinjames/litmus)

- Reproducibility: a saved trace freezes the inputs and interactions so you can rerun the same scenario. This helps with intermittent failures. (https://github.com/rylinjames/litmus)
- Faster incident response: replaying a recorded run narrows the investigation scope. You can reproduce the customer-facing failure locally or in CI without recreating production conditions. (https://github.com/rylinjames/litmus)
- Safer rollouts: using recorded runs in CI lets you exercise known failure modes and gate merges when reliability drops. The repo lists CI gating and reliability scoring as supported primitives. (https://github.com/rylinjames/litmus)

## Concrete example: what this looks like in practice

Scenario: a support agent sometimes misroutes billing tickets. Use Litmus to reproduce and validate a fix. (https://github.com/rylinjames/litmus)

Steps:

1. Record the failing flow. Enable the recorder on the billing flow and save representative traces. (https://github.com/rylinjames/litmus)
2. Replay deterministically. Load a saved trace and replay it locally or in CI to confirm the same prompts, tool calls, and outputs occur. (https://github.com/rylinjames/litmus)
3. Inject faults. Use fault-injection hooks to simulate downstream errors or timeouts and observe retry/error handling. (https://github.com/rylinjames/litmus)
4. Gate changes in CI. Add a replay step that reruns a suite of saved traces and blocks merges if the suite shows regressions. (https://github.com/rylinjames/litmus)

Investigation checklist:

- [ ] Capture failing and passing traces for the affected flow. (https://github.com/rylinjames/litmus)
- [ ] Replay traces locally and confirm reproduction. (https://github.com/rylinjames/litmus)
- [ ] Inject a representative failure and observe behavior. (https://github.com/rylinjames/litmus)
- [ ] Add a CI replay job to prevent regressions. (https://github.com/rylinjames/litmus)

## What small teams and solo founders should do now

Low-effort steps with immediate value. The Litmus repo is the starting point. (https://github.com/rylinjames/litmus)

- [ ] Clone the repo and run the example recorder against one critical flow. (https://github.com/rylinjames/litmus)
- [ ] Capture a small set of representative traces: include a few passing and failing runs. (https://github.com/rylinjames/litmus)
- [ ] Replay each saved trace locally to confirm deterministic behavior. (https://github.com/rylinjames/litmus)
- [ ] Add one CI job that replays the small trace set and flags regressions before merge. (https://github.com/rylinjames/litmus)
- [ ] Add a redaction step before storing traces and restrict access to the trace store. (https://github.com/rylinjames/litmus)

Why this order: it yields reproducible artifacts quickly and protects your highest-value flow first. (https://github.com/rylinjames/litmus)

## Regional lens (UK)

Litmus supplies the recorder and replay primitives; teams must decide how to store and protect traces. (https://github.com/rylinjames/litmus)

- Traces can include user content and metadata. Choose storage region and access controls that fit your legal and security posture. (https://github.com/rylinjames/litmus)
- Implement redaction or pseudonymisation before long-term storage when appropriate. (https://github.com/rylinjames/litmus)
- Prefer single-region storage for sensitive traces if that aligns with your compliance review. (https://github.com/rylinjames/litmus)

## US, UK, FR comparison

A compact, practical table to help pick initial defaults when you start recording agent traces. The recording and replay capability is provided by Litmus. (https://github.com/rylinjames/litmus)

| Country | Storage default (start) | Redaction required? | Notes / review gate |
|---|---:|---:|---|
| US | In-region where possible | Yes — redact PII before storage | Check state rules and contracts (https://github.com/rylinjames/litmus)
| UK | Prefer UK-region storage | Yes — consider redaction/pseudonymisation | Run a legal review if traces are high-volume (https://github.com/rylinjames/litmus)
| FR | Prefer EU/FR-region storage | Yes — minimise stored identifiers | Document purpose and safeguards (https://github.com/rylinjames/litmus)

Note: the table is a starting point. Legal / retention choices should involve counsel and be tailored to your data types. (https://github.com/rylinjames/litmus)

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The Litmus project advertises deterministic record-and-replay for agent executions, plus fault-injection hooks, reliability scoring, and CI gating primitives. (source: https://github.com/rylinjames/litmus)
- The numeric thresholds below are pragmatic starting points teams should validate in their environment; they are not claims about defaults shipped by the repo. (https://github.com/rylinjames/litmus)

Suggested starting numbers to validate:

- Reliability gate: 0.8 (80%)
- Initial sample size for gating: N = 10 traces
- Per-trace replay runs to check determinism: 3 replays
- Injected timeout for testing retries: 500 ms
- Retention posture to evaluate: 90 days
- Issue prevalence that should trigger investigation: 3% of sessions
- User-impact escalation threshold: 1,000 affected users
- Token budget per recorded request example: 2,048 tokens
- CI job wall-clock target to control cost: 5 minutes per job

### Risks / Mitigations

- Risk: traces contain PII or secrets. Mitigation: run a redaction pipeline before storage, and apply role-based access. Keep sensitive traces with shorter retention. (https://github.com/rylinjames/litmus)
- Risk: small sample sizes give false confidence. Mitigation: start with N = 10 and 3 replays, then expand to 50+ traces before full rollout. (https://github.com/rylinjames/litmus)
- Risk: CI cost or flakiness. Mitigation: keep a lightweight pre-merge gate (5–10 traces) and run larger suites on scheduled nightlies. (https://github.com/rylinjames/litmus)

### Next steps

Week-of actionable checklist:

- [ ] Clone or fork https://github.com/rylinjames/litmus and run the recorder on one flow.
- [ ] Capture a small set of representative traces and redact sensitive fields before storage.
- [ ] Replay each trace multiple times to confirm deterministic outputs.
- [ ] Add a CI job that replays the trace set and computes a simple reliability metric; set an initial gate (e.g., 0.8) to validate.
- [ ] Define retention and access policy for trace storage and document it for audits.

Methodology note: this write-up is grounded on the Litmus project description at https://github.com/rylinjames/litmus. Numeric thresholds are pragmatic starting defaults to be validated in your environment.
