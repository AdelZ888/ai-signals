---
title: "predicate-secure: 3-5 line Python wrapper for fail-closed, deterministic pre- and post-verification of AI agent actions"
date: "2026-03-14"
excerpt: "Drop-in Python wrapper that enforces a fail-closed, three-phase safety loop for AI agents: local YAML pre-authorization, action execution, and deterministic post-checks. Fits in 3-5 lines."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-14-predicate-secure-3-5-line-python-wrapper-for-fail-closed-deterministic-pre-and-post-verification-of-ai-agent-actions.jpg"
region: "UK"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "predicate-secure"
  - "security"
  - "agents"
  - "python"
  - "playwright"
  - "browser-use"
  - "langchain"
  - "qwen-2.5"
sources:
  - "https://news.ycombinator.com/item?id=47365599"
---

## TL;DR in plain English

- predicate-secure is a small, drop-in Python wrapper that enforces deterministic safety for agent actions; see the project announcement: https://news.ycombinator.com/item?id=47365599
- It implements a 3-phase loop: pre-execution authorization, action execution, and mathematical post-execution verification (the announcement calls this a three‑phase loop): https://news.ycombinator.com/item?id=47365599
- The wrapper is described as a 3-line (and in examples 3–5 lines) developer DX change, uses local YAML policies (fail-closed), and uses a local LLM (Qwen 2.5 7B Instruct) only to synthesize verification predicates; runtime evaluation is deterministic and runs in milliseconds per the announcement: https://news.ycombinator.com/item?id=47365599

Quick summary table (decision frame)

| Aspect | predicate-secure (announcement) | Traditional "LLM-as-a-judge" |
|---|---:|---|
| Integration size | 3-line / 3–5 lines (drop-in) | Varies, often large |
| Verification model | Deterministic math predicates (local) | Probabilistic LLM judgments |
| Policy location | Local YAML (fail-closed) | Often external or ad-hoc |
| Predicate synthesis | Local LLM (Qwen 2.5 7B) optionally | LLM per-verification (tokens/time) |
| Latency | Deterministic checks in milliseconds (announcement) | Variable, LLM round trips

Reference: https://news.ycombinator.com/item?id=47365599

## What you will build and why it helps

You will wrap an existing Python agent with predicate-secure so each attempted action is:
1) authorized against a local YAML policy, 2) executed by the agent, and 3) verified by a deterministic mathematical check of before/after snapshots. The public announcement describes this three‑phase flow and lists adapters for common frameworks (browser-use, LangChain, PydanticAI, OpenClaw, raw Playwright): https://news.ycombinator.com/item?id=47365599

Why it helps (concise):
- Reduces reliance on repeated LLM judgment cycles and token burn (announcement contrasts deterministic checks with the common "LLM-as-a-judge" pattern): https://news.ycombinator.com/item?id=47365599
- Keeps policy and verification evidence local (YAML + local predicates) so sensitive snapshots need not leave your environment: https://news.ycombinator.com/item?id=47365599
- Minimal developer friction: the project advertises a 3-line integration and 3-phase enforcement loop: https://news.ycombinator.com/item?id=47365599

## Before you start (time, cost, prerequisites)

Prerequisites (grounded in the announcement):
- A Python environment and an existing agent implemented with a supported framework (adapters mentioned: browser-use, LangChain, PydanticAI, OpenClaw, raw Playwright): https://news.ycombinator.com/item?id=47365599
- The predicate-secure package and the appropriate adapter for your agent type (drop-in wrapper described in the announcement): https://news.ycombinator.com/item?id=47365599
- A local policies/ directory with at least one YAML policy file (the announcement specifies local YAML policies and a fail-closed model): https://news.ycombinator.com/item?id=47365599
- Optional: a local, offline LLM such as Qwen 2.5 7B Instruct if you want on-the-fly predicate synthesis; the announcement states this model is used only to generate predicates from diffs, while runtime evaluates them deterministically: https://news.ycombinator.com/item?id=47365599

Conservative time & cost notes (practical guidance, keep conservative):
- Initial sandbox POC: allow 1–3 days for a single scenario (policy authoring + integration + basic tests).
- Example integration size advertised: 3 to 5 lines of wrapper code (announcement): https://news.ycombinator.com/item?id=47365599
- If you run a local 7B model for predicate synthesis, expect infrastructure costs for CPU/GPU and storage (announcement names Qwen 2.5 7B Instruct as the offline model used for synthesis): https://news.ycombinator.com/item?id=47365599

Minimum artifacts you will create:
- policies/*.yaml (local policy files)
- A short SecureAgent wrapper (the announcement shows the DX as a 3-line wrapper): https://news.ycombinator.com/item?id=47365599
- A verification test that captures before/after snapshots and asserts predicates (announcement describes mathematical diff + predicate evaluation): https://news.ycombinator.com/item?id=47365599

## Step-by-step setup and implementation

1) Install predicate-secure and the adapter for your framework. The announcement shows a simple Python DX. Example command:

```bash
# Example: install predicate-secure and a browser-use adapter
pip install predicate-secure predicate-secure-adapter-browser-use
```

2) Create a minimal YAML policy. Policies are local and rule-based per the announcement. Example policy following the announcement's pattern:

```yaml
# policies/shopping.yaml
mode: strict
rules:
  - allow:
      action: browser.click
      selector: "button#checkout"
  - deny:
      action: fs.read
      path_glob: "~/.ssh/*"
  - deny:
      action: navigation
      domain_whitelist:
        - example.com
```

Notes: the announcement emphasizes fail-closed and local YAML policies: https://news.ycombinator.com/item?id=47365599

3) Wrap your agent. The announcement shows a drop-in wrapper in a few lines. Example from the announcement:

```python
from predicate_secure import SecureAgent
from browser_use import Agent

agent = Agent(task="Buy headphones on Amazon", llm=my_model)
secure_agent = SecureAgent(agent=agent, policy="policies/shopping.yaml", mode="strict")
secure_agent.run()
```

This mirrors the project's advertised DX: add SecureAgent around your existing agent with 3–5 lines and keep the rest of your agent unchanged: https://news.ycombinator.com/item?id=47365599

4) Add local verification tests.
- Capture before/after snapshots (DOM for browser actions, filesystem listings for file actions).
- If you synthesize predicates, use the local LLM to generate short predicates from diffs (the announcement cites element_exists('#success') and url_contains('example.com') as examples); runtime evaluation is deterministic: https://news.ycombinator.com/item?id=47365599

5) Rollout plan (practical conservative steps):
- Start in sandbox. Run repeated tests until predicates and policies are stable.
- Integrate verification into CI: run canned scenarios and fail the pipeline on verification regressions.
- Monitor structured audit logs for every intercepted action and verification result (announcement notes structured logging): https://news.ycombinator.com/item?id=47365599

## Common problems and quick fixes

Policy too permissive or too strict
- Symptom: agent performs forbidden actions or is constantly blocked.
- Fix: use deny-by-default (fail-closed) and narrow Allow rules to exact selectors and explicit globs (announcement emphasizes local YAML policies and fail-closed behavior): https://news.ycombinator.com/item?id=47365599

Flaky verification from ephemeral fields
- Symptom: predicates fail due to timestamps, random IDs, or ephemeral attributes.
- Fix: sanitize snapshots before predicate synthesis or pre-author predicates. Strip timestamps and normalize ephemeral IDs before diffing.

Adapter mismatch
- Symptom: adapter surface does not match your agent API.
- Fix: pick one of the adapters listed or implement a thin bridge; adapters mentioned include browser-use, LangChain, PydanticAI, OpenClaw, and raw Playwright: https://news.ycombinator.com/item?id=47365599

Operational metrics to track (recommended)
- Verification latency (announcement notes runtime verification runs in milliseconds)
- Verification failure rate
- Policy violation rate

Reference: https://news.ycombinator.com/item?id=47365599

## First use case for a small team

Target audience in the announcement includes developers using common agent frameworks; the wrapper is presented as lightweight and suitable for quick POCs: https://news.ycombinator.com/item?id=47365599

Concrete POC plan for a team starting out (grounded, conservative):
- Scope: pick 1 end-to-end flow and 1–3 Allow rules that cover it. Keep policy under version control.
- Integration: add the SecureAgent wrapper (3–5 lines per announcement) and run the agent against a sandbox account.
- Observe: capture structured logs for each intercepted action, predicate synthesis (if used), and deterministic verification results.
- CI: add one smoke test that runs the canned scenario and fails the pipeline on verification regressions.

Who does what (small team roles — pragmatic recommendation)
- Engineer: write the minimal policy and add the SecureAgent wrapper.
- DevOps/Integrator: add CI and logging retention.
- Tester: exercise flows and report verification failures.

Quick checklist for a small-team POC (task boxes):
- [ ] Create policies/shopping.yaml with deny-by-default
- [ ] Install predicate-secure and the matching adapter
- [ ] Wrap the agent with SecureAgent (3–5 lines)
- [ ] Run local POC against a sandbox account and inspect logs
- [ ] Add a CI smoke test that fails on verification regressions

Reference: https://news.ycombinator.com/item?id=47365599

## Technical notes (optional)

- Predicate synthesis and evaluation: the announcement states a local, offline LLM (Qwen 2.5 7B Instruct) is used to generate verification predicates from before/after diffs; the runtime then evaluates those predicates deterministically and quickly (announcement: local LLM for synthesis, deterministic runtime verification in milliseconds): https://news.ycombinator.com/item?id=47365599

- Adapters: the announcement lists adapters for browser-use, LangChain, PydanticAI, OpenClaw, and raw Playwright; choose the adapter that matches your agent framework or implement a thin bridge: https://news.ycombinator.com/item?id=47365599

- Audit logs: the announcement indicates structured logs for actions, predicates, and verification results; retain logs as part of your audit window for investigations: https://news.ycombinator.com/item?id=47365599

## What to do next (production checklist)

### Assumptions / Hypotheses

- The announcement describes a drop-in Python wrapper and adapters for common frameworks; this writeup assumes your agent uses one of the listed adapters or can be bridged to one: https://news.ycombinator.com/item?id=47365599
- The announcement states Qwen 2.5 7B Instruct is used for predicate synthesis; this document assumes you will either run that model locally or pre-author predicates: https://news.ycombinator.com/item?id=47365599
- Where the public announcement does not specify operational defaults (e.g., retention windows, exact latency budgets), this checklist uses conservative, organization-specific standards.

### Risks / Mitigations

- Risk: flaky predicates due to ephemeral DOM fields.
  - Mitigation: sanitize snapshots (strip timestamps, normalize random IDs) or pre-author predicates rather than synthesize them continuously.
- Risk: performance impact in high-throughput systems.
  - Mitigation: start with a canary, measure verification latency (announcement: runtime checks run in milliseconds), and gate rollout on acceptable latency and failure rates.
- Risk: policy drift leading to over-blocking or accidental allows.
  - Mitigation: require policy changes via PR with reviewers and keep policy files under version control (announcement emphasises local YAML policies and fail-closed behavior): https://news.ycombinator.com/item?id=47365599

### Next steps

- Policy governance: require PRs and 1–2 approvers for policy changes; keep policies in a dedicated repo path (policies/).
- CI: add automated verification tests that run on policy PRs and block merges on regressions.
- Monitoring: create dashboards for verification latency (millisecond-scale checks per announcement), verification failure rate, and policy violation counts; alert on sustained elevated failure rates.
- Rollout: move from sandbox to limited production traffic with rollback gates and a verified rollback path.

Reference: https://news.ycombinator.com/item?id=47365599

Methodology note: this writeup follows the public project announcement above as the single ground truth; where the announcement did not state specifics, the document offers conservative operational recommendations rather than new factual claims: https://news.ycombinator.com/item?id=47365599
