---
title: "Conductor: YAML-first deterministic orchestration for reproducible multi-agent AI workflows"
date: "2026-05-30"
excerpt: "Learn how Conductor uses YAML and Jinja2 to make multi-agent AI workflows deterministic and reproducible, reducing latency and making routing, branching, and testing explicit."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-30-conductor-yaml-first-deterministic-orchestration-for-reproducible-multi-agent-ai-workflows.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "conductor"
  - "multi-agent-ai"
  - "deterministic-orchestration"
  - "YAML"
  - "Jinja2"
  - "CLI"
  - "open-source"
  - "GitHub"
sources:
  - "https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/"
---

## TL;DR in plain English

- Conductor is an open-source CLI for deterministic, YAML-first orchestration of multi-agent AI workflows: you declare steps, routing, and branching in YAML and use Jinja2 for expressions instead of a planner LLM (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).

- Deterministic means the orchestrator follows the YAML and templates exactly: identical inputs should produce identical outputs, which reduces surprises and speeds debugging. See the announcement for the design rationale: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

- Quick next action: create a tiny workflow YAML, run it locally against simple HTTP stubs, and confirm byte-for-byte equality across 5 repeat runs. (Methodology note: this guide is grounded in the Conductor overview linked above.)

Concrete example in one line: a code-review pipeline that runs a linter, a security-check, then a summarizer; keep routing and branching in YAML and validate locally to avoid API spend (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).

## What you will build and why it helps

You will build a minimal deterministic multi-agent workflow (YAML + Jinja2) that:
- runs a linter agent, a security-check agent, and a summarizer agent; and
- uses Jinja2 expressions to pass data and decide branches.

Why this helps (summary tied to the project design): the orchestration is explicit in YAML, making runs reproducible and easier to test and review (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).

Comparison: explicit orchestration vs planner LLM

| Property | YAML-first (Conductor) | Planner LLM orchestrator |
|---|---:|---:|
| Determinism | High (byte-for-byte repeatable) | Low–variable |
| Debuggability | Explicit step IDs, templates | Harder to trace decisions |
| Latency overhead | Low (no planning LLM calls) | Higher (planning model calls) |

Source: design rationale and trade-offs in the Conductor announcement: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

## Before you start (time, cost, prerequisites)

Estimated effort and cost (guidance):
- Hands-on setup: ~60 minutes. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Initial test budget for real model calls (optional): $10.
- Local tests: run stub agents to avoid API costs.

Prerequisites:
- Command-line comfort (POSIX shell like bash).  
- Basic YAML familiarity.  
- Familiarity with Jinja2 templating basics.  
- Ability to run simple HTTP stubs on local ports (examples use ports 9001–9003).

Preflight checklist:
- Clone the Conductor repo and read its README: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.  
- Ensure a local runtime (Python or Node) as required by the repo.  
- Prepare a small test dataset (e.g., 5 sample PR texts) to validate determinism.

## Step-by-step setup and implementation

Overview: get the CLI, map agent IDs to endpoints, author a workflow YAML with Jinja2 expressions, and run against local stubs to confirm deterministic behavior (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).

1) Clone and install the CLI

```bash
# clone the repo
git clone https://github.com/microsoft/conductor.git
cd conductor
# follow the repo README for build/install instructions (example: pip install . --user)
```

2) Create agent mapping config (short timeouts for local tests)

```yaml
# config.yaml
agents:
  linter:
    url: "http://localhost:9001/lint"
  security:
    url: "http://localhost:9002/seccheck"
  summarizer:
    url: "http://localhost:9003/summarize"
timeouts:
  step_default_ms: 30000
```

3) Write a minimal workflow YAML

```yaml
# example/workflow.yaml
id: code_review_workflow
inputs:
  - pr_text
steps:
  - id: lint
    agent: linter
    inputs:
      text: "{{ inputs.pr_text }}"
  - id: security
    agent: security
    inputs:
      text: "{{ inputs.pr_text }}"
    run_after:
      - lint
  - id: consolidate
    agent: summarizer
    inputs:
      lint_result: "{{ steps.lint.output }}"
      sec_result: "{{ steps.security.output }}"
    run_after:
      - security
```

Notes: each step has an id and agent; inputs use Jinja2 expressions; run_after controls ordering. See the project overview for the YAML-first approach: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

4) Run with stubs

Start deterministic HTTP stubs that return predictable JSON, then run the workflow:

```bash
# run the conductor CLI with config and workflow
conductor run --config config.yaml --workflow example/workflow.yaml --input '{"pr_text":"Fix bug in payment code"}'
```

5) Verify determinism
- Repeat the exact same input 5 times locally and assert byte-for-byte equality.  
- For CI, run 50 repeats and assert exact matches.

6) Simple rollout gates (suggested)
- Canary: route 10% of traffic or 10 PRs to the new workflow.  
- Acceptance: require canary pass rate >= 95%.  
- Rollback trigger: error rate > 5% or deterministic mismatch.

Reference: design and trade-offs in the project announcement: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

## Common problems and quick fixes

This troubleshooting assumes the YAML + Jinja2 model described by the Conductor announcement: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

Symptom: Jinja2 expression fails to evaluate
- Cause: missing input variable or typo.  
- Fix: render the template locally with a known context; add defaults or validate inputs.

Symptom: branch not taken as expected
- Cause: condition evaluated to false.  
- Fix: enable --verbose logging to inspect evaluated conditions and values.

Symptom: outputs are non-deterministic
- Cause: an agent uses an unseeded or variable model.  
- Fix: stub the agent during tests or configure the model to use a fixed seed; add a CI regression that runs 50 repeats.

Quick troubleshooting commands and checks

```bash
# render or lint a workflow YAML locally (example toolchain may vary)
conductor lint --workflow example/workflow.yaml

# run with verbose output to inspect evaluated Jinja2 expressions
conductor run --verbose --config config.yaml --workflow example/workflow.yaml --input '{"pr_text":"x"}'
```

Practical checks:
- Render a Jinja2 template locally to find missing keys.  
- Run 50 repeats in CI to detect flakiness; alert if >5% mismatches.  

Reference: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

## First use case for a small team

Target: a 3-person team or solo founder building a deterministic code-review pipeline (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).

Concrete steps for a small team:
1) Start local: run stub agents on ports 9001–9003 to avoid API spend; validate logic with 5 inputs and confirm identical outputs.  
2) Keep the workflow small: limit to 6 steps initially.  
3) Single owner: assign one person for 2 weeks to own changes and review in pull requests.  
4) Automate determinism: add a CI job that runs 50 repeats for canonical inputs and fails on byte-for-byte mismatches.  
5) Budget guardrails: keep initial model spend to ~$10 until gates pass.

Rollout suggestion (example thresholds):
- Local tests: 5 inputs, 0 differences.  
- Canary: 10 PRs or 10% traffic with >= 95% pass.  
- Promote after 72 hours of stable metrics and error rate < 5%.

Source: approach and recommendations taken from the Conductor announcement: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

## Technical notes (optional)

Conductor emphasizes deterministic routing encoded in YAML and uses Jinja2 expressions for branching, which reduces runtime variance compared with an orchestrator that relies on a planner LLM (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).

Configuration fields to expect:
- agents.<id>.url — endpoint for each agent (examples above use http://localhost:9001 etc.).  
- timeouts.step_default_ms — default step timeout (example: 30000 ms).  
- workflow.id — logical workflow identifier.

Monitoring suggestions and numeric targets:
- Track 90th percentile step latency; target < 500 ms.  
- Record determinism test pass rate across 50 runs; target >= 95%.  
- Alert on error rate > 5% over a 1-hour window.

Reference and deeper reading: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/.

## What to do next (production checklist)

- [ ] Move secrets out of YAML into a secure secrets store and reference them at runtime.  
- [ ] Add per-step metrics (latency, error count) and a determinism regression in CI.  
- [ ] Create a canary workflow and automated gate checks (95% pass over 50 runs).  
- [ ] Document rollback steps and ensure a quick revert path is available.

### Assumptions / Hypotheses

- Conductor is an open-source CLI that uses YAML plus Jinja2 for deterministic orchestration (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).
- Operational recommendations and numeric thresholds below are planning defaults for small teams (not direct claims from the source):
  - Hands-on setup: 60 minutes.  
  - Initial test budget: $10.  
  - Local test runs for quick verification: 5 identical runs.  
  - CI determinism check: 50 repeats.  
  - Canary slice: 10% traffic or 10 PRs.  
  - Canary acceptance gate: >= 95% pass.  
  - Rollback trigger: error rate > 5%.  
  - Example step timeout: 30,000 ms (30 s).  
  - Monitoring target: 90th percentile step latency < 500 ms.  
  - Small-team example size: 3 people.

### Risks / Mitigations

- Risk: agent endpoints introduce non-determinism (unseeded models).
  Mitigation: use local stubs or seeded models during testing; add determinism tests in CI (50 repeats recommended).

- Risk: secrets stored in YAML and leaked.
  Mitigation: move secrets to a managed secrets store and reference them at runtime.

- Risk: rollout produces high error rates.
  Mitigation: canary with a 10% slice or 10 PRs and automated gates requiring >= 95% pass; rollback immediately if error rate > 5%.

### Next steps

1) Clone the Conductor repo and run the example locally (see the project blog and repo README: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/).  
2) Create example/workflow.yaml and config.yaml as shown above, run 5 identical inputs and assert byte-for-byte stability.  
3) Add CI-based determinism tests (50 repeats) and a canary rollout that enforces the acceptance gates listed in Assumptions.

If you want, I can generate a starter repository with the example workflow, three Dockerized stub agents (ports 9001–9003), and a CI script that runs the 50-run determinism check and reports pass/fail.
