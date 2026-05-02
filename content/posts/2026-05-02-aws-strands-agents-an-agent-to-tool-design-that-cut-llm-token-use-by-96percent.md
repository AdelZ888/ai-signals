---
title: "AWS Strands Agents: an agent-to-tool design that cut LLM token use by ~96%"
date: "2026-05-02"
excerpt: "An AWS Strands Agents design moved extraction, summarization and caching out of prompts into deterministic tools, cutting measured LLM token use by ~96% and lowering costs, privacy risk."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-02-aws-strands-agents-an-agent-to-tool-design-that-cut-llm-token-use-by-96percent.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "AWS"
  - "Strands"
  - "agents"
  - "token-usage"
  - "cost-optimization"
  - "LLM-ops"
  - "privacy"
  - "tooling"
sources:
  - "https://thenewstack.io/strands-agents-tool-design/"
---

## TL;DR in plain English

- AWS Strands Agents separate decision-making (an LLM) from predictable data work (deterministic tools for extraction, aggregation, caching, summarization). Source: https://thenewstack.io/strands-agents-tool-design/
- In the reported example, introducing an agent→tool boundary cut token usage by about 96% for the measured flow — a direct reduction in metered LLM usage. Source: https://thenewstack.io/strands-agents-tool-design/
- The practical payoff: lower per-request token volume, smaller privacy exposure of raw text, and easier testing/auditing because deterministic code replaces repeated prompt content. Source: https://thenewstack.io/strands-agents-tool-design/

Short plain-language summary: move repeatable, high-volume text work out of the prompt and into code you control; use the LLM for policy/decisions only. Source: https://thenewstack.io/strands-agents-tool-design/

## What changed

Core shift: treat extraction, summarization, aggregation, caching, and structured-state maintenance as explicit tools, not things you repeatedly paste into prompts. Reserve the LLM for decisions such as "choose next action" or "generate a single final reply." Source: https://thenewstack.io/strands-agents-tool-design/

Decision pattern (copyable):

| Action category | Send to LLM (decision) | Handle in Tool (deterministic) |
|---|---:|---:|
| Clarify user intent | Yes | No |
| Parse and extract entities | No | Yes |
| Database lookups / joins | No | Yes |
| Multi-document aggregation | No | Yes |
| Final user-facing text (once) | Yes | No |

Reference and design pattern: https://thenewstack.io/strands-agents-tool-design/

## Why this matters (for real teams)

- Cost control: the Strands write-up shows a roughly 96% token-volume drop after applying the agent→tool boundary; lower tokens reduce metered charges in per-token billing models. Source: https://thenewstack.io/strands-agents-tool-design/
- Testability and auditability: deterministic tools are unit-testable and versionable; prompts carrying raw threads are harder to reproduce. Source: https://thenewstack.io/strands-agents-tool-design/
- Data-minimization / privacy: compact summaries and structured state let you send far less raw text to external models, aiding compliance and traceability. Source: https://thenewstack.io/strands-agents-tool-design/

Reference: https://thenewstack.io/strands-agents-tool-design/

## Concrete example: what this looks like in practice

Scenario: a support-triage agent that previously sent whole ticket threads to the LLM.

Before: each step included full prior messages and thread context in prompts, producing repeated large token payloads.

After (agent→tool pattern):
- Deterministic extractor parses the thread and emits a compact JSON with intent, key entities, and relevant metadata. Source: https://thenewstack.io/strands-agents-tool-design/
- An aggregator compacts prior messages into a short summary and a small state object; a cache stores repeated lookup results. Source: https://thenewstack.io/strands-agents-tool-design/
- The LLM receives only the compact summary plus a policy prompt asking it to pick the next action (escalate, suggest reply, request clarification). Source: https://thenewstack.io/strands-agents-tool-design/

Result: tools perform the heavy work; the model performs decision-making. The Strands report shows the same end-to-end behavior with a dramatic token drop. Artifacts for rollout: a feature flag, token-usage and latency dashboard panels, and unit tests for each deterministic tool. Source: https://thenewstack.io/strands-agents-tool-design/

## What small teams and solo founders should do now

Actionable starter playbook — achievable by one engineer or a solo founder. Each step is concrete and minimal.

1) Capture a short baseline for one representative flow. Log tokens-per-request and number of model calls for a sample of ~50–200 recent requests so you have a clear cost/usage baseline. Source: https://thenewstack.io/strands-agents-tool-design/

2) Pick one high-frequency flow to refactor. Choose a repeatable workflow that repeatedly sends long text to the model (examples: ticket triage, FAQ/answering, customer-summary generation). Prioritize the single flow where tokens are concentrated. Source: https://thenewstack.io/strands-agents-tool-design/

3) Build a minimal deterministic extractor. Implement a small script, function, or single-file microservice that emits a compact summary + a tiny JSON state (5–10 keys). Keep the first prototype to 1–2 hours of work. Unit-test it on 10–20 representative threads. Source: https://thenewstack.io/strands-agents-tool-design/

4) Feature-flag and roll out incrementally. Route a small slice (e.g., 5–10% traffic) to the new path, compare tokens-per-request and task outcomes, then increase if results match expectations. Source: https://thenewstack.io/strands-agents-tool-design/

5) Monitor three KPIs: tokens-per-request, median latency, and task correctness (e.g., percent successful triage). If correctness drops, tighten the extractor or revert. Source: https://thenewstack.io/strands-agents-tool-design/

Minimal checklist you can copy and run:

- [ ] Record a baseline of tokens-per-request and model-call count for one flow. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Select a single high-volume flow to refactor. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Implement a local extractor + compact summary tool and unit-test it on ~10–20 samples. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Feature-flag the refactor and route a 5–10% traffic slice to it. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Track tokens, median latency, and task correctness for the test slice. Source: https://thenewstack.io/strands-agents-tool-design/

Reference: https://thenewstack.io/strands-agents-tool-design/

## Regional lens (UK)

- Cost visibility: reducing token volume cuts variable metered spend you must forecast; expose token trends in your cost dashboard. Source: https://thenewstack.io/strands-agents-tool-design/
- Data protection: parsing and summarization inside your control plane reduces how much raw personal text you send externally, supporting data-minimization principles under UK guidance. Source: https://thenewstack.io/strands-agents-tool-design/
- Practical ops: draw a simple data-flow diagram labeling which fields remain local vs. which are compacted and sent to the model to aid reviewers and compliance. Source: https://thenewstack.io/strands-agents-tool-design/

Reference: https://thenewstack.io/strands-agents-tool-design/

## US, UK, FR comparison

| Data category | US (typical) | UK (ICO-focused) | FR (CNIL cautious) |
|---|---:|---:|---:|
| Sensitive personal data (PII) | Business controls + logging | Prefer minimization / pseudonymization | Prefer local handling / anonymization |
| Contractual customer data | Allowed with controls | Minimize and document legal basis | Strong preference for anonymize / local |
| Public information | Send with logging | Send but log | Send with clear transparency |

Design implication: when policy or law discourages sending identifiers, perform parsing and anonymization in local tools and send only compact, non-identifying summaries. Source: https://thenewstack.io/strands-agents-tool-design/

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The Strands case is an existence proof: the reported ~96% reduction in tokens is real for their measured flow but is not guaranteed for every product or data shape. Source: https://thenewstack.io/strands-agents-tool-design/
- Example numeric hypotheses you should test in your environment (experiment-driven): expect token reductions in the range 50%–99%; possible tokens-per-request change from ~10,000 → ~400 tokens; median latency targets of 100–500 ms for tool processing; potential cost reduction of $100–$5,000+/month depending on volume. These are hypotheses to measure, not claims from the excerpt.
- Run experiments with N=50–200 requests per test arm to get meaningful signal before wide rollout.

### Risks / Mitigations

- Risk: accuracy drops when raw context is removed. Mitigation: A/B test behind a feature flag and compare task outcomes against a control arm. Source: https://thenewstack.io/strands-agents-tool-design/
- Risk: cache or summary staleness produces incorrect decisions. Mitigation: apply TTLs, version summaries, and validate critical actions against fresh data. Source: https://thenewstack.io/strands-agents-tool-design/
- Risk: scope creep or an overly large refactor. Mitigation: keep the first refactor to a single flow and a short prototype window (1–2 weeks). Source: https://thenewstack.io/strands-agents-tool-design/

### Next steps

This-week checklist (practical, copyable):

- [ ] Capture baseline tokens-per-request and model-call count for one representative flow. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Identify one high-volume flow and document current prompt sizes and call counts. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Prototype a local extractor that emits a compact summary and a small JSON state object; test on 10–20 samples. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Add a feature flag and route a 5–10% traffic slice to the refactored flow. Source: https://thenewstack.io/strands-agents-tool-design/
- [ ] Add dashboard panels for tokens-per-request, median latency, and task correctness and monitor for 1–2 weeks.

Methodology note: claims above are grounded in the Strands write-up cited; implementation numbers beyond the excerpt are explicitly labeled as hypotheses to test. Source: https://thenewstack.io/strands-agents-tool-design/
