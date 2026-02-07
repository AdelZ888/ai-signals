---
title: "Analysis: OMG-Agent's decoupled planner-retriever-executor pipeline for missing-modality generation"
date: "2026-02-06"
excerpt: "Analysis of OMG-Agent (arXiv:2602.04144): a three-stage planner->retriever->executor that separates semantic planning from detail synthesis to curb hallucination and guide adoption."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-06-analysis-omg-agents-decoupled-planner-retriever-executor-pipeline-for-missing-modality-generation.jpg"
region: "UK"
category: "Model Breakdowns"
series: "agent-playbook"
difficulty: "advanced"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "OMG-Agent"
  - "missing-modality"
  - "multimodal"
  - "retrieval-augmented"
  - "MLLM"
  - "hallucination"
  - "evidence-retrieval"
  - "arXiv:2602.04144"
sources:
  - "https://arxiv.org/abs/2602.04144"
---

## Builder TL;DR

What it is: OMG-Agent is a three‑stage, deliberate‑then‑act pipeline for missing‑modality generation: (1) an MLLM‑driven Semantic Planner, (2) a non‑parametric Evidence Retriever, and (3) a Retrieval‑Injected Executor. The architecture and abstract are available at https://arxiv.org/abs/2602.04144.

Why it matters: The paper identifies a structural failure mode called “Semantic–Detail Entanglement” and proposes decoupling semantic planning from detail synthesis to reduce hallucination and retrieval rigidity (https://arxiv.org/abs/2602.04144).

When to consider: adopt when multimodal features fail because of hallucination or brittle retrieval in missing‑modality cases — for example, when >5% of production outputs are judged hallucinated or manual review costs exceed $2,000/month.

Quick adoption checklist:

- [ ] Measure current hallucination rate and label costs (>5% or >$2k/month trigger)
- [ ] Inventory external evidence sources and indexability (target coverage >80%)
- [ ] Define latency budget (P95 budget ≤300 ms)
- [ ] Prototype a narrow semantic‑planner + retriever flow for 1–2 tasks

Methodology note: this summary uses the paper abstract and metadata from https://arxiv.org/abs/2602.04144 as the primary source.

## Core thesis

Thesis statement: Dynamically splitting missing‑modality generation into a deterministic semantic planning stage (MLLM) and a separate evidence‑grounded execution stage (retrieval + injection) reduces hallucination and overreliance on internal memory versus monolithic parametric or rigid retrieval‑only systems. The key idea and terminology (Semantic–Detail Entanglement; planner + retriever + executor) come from the paper abstract (https://arxiv.org/abs/2602.04144).

Mechanics summarized from the abstract (https://arxiv.org/abs/2602.04144):

- MLLM Semantic Planner: progressive contextual reasoning that produces a deterministic structured semantic plan.
- Non‑parametric Evidence Retriever: grounds abstract semantics in external knowledge to avoid memorization‑based hallucination.
- Retrieval‑Injected Executor: uses retrieved evidence as flexible feature prompts so the executor can synthesize high‑fidelity details without rigid retrieval constraints.

Decision artifact (mapping product need to component priority):

| Product priority | Planner strength | Retriever priority | Executor focus |
|---:|:---:|:---:|:---:|
| Highest fidelity (audit) | High (deterministic plans) | High (grounding, recall ≥80%) | High (fine synthesis) |
| Low latency / mobile | Medium | Medium (light index) | Low‑latency model (P95 ≤300 ms) |
| Privacy‑sensitive | Low (local planner) | High (on‑prem / encrypted index) | Data‑redaction in executor |

## Evidence from sources

Primary source: arXiv:2602.04144 (submitted 2026‑02‑04). The abstract explicitly states the three‑stage design, names the failure mode (Semantic‑Detail Entanglement), and reports extensive experiments across multiple benchmarks concluding that OMG‑Agent “consistently surpasses state…”; see https://arxiv.org/abs/2602.04144.

Concrete items present in the excerpt (directly supported by the abstract):

- Identification of the bottleneck called “Semantic‑Detail Entanglement.”
- Decomposition into three stages: MLLM Semantic Planner, non‑parametric Evidence Retriever, Retrieval‑Injected Executor.
- Planner described as performing Progressive Contextual Reasoning to create deterministic structured semantic plans.
- Use of non‑parametric retrieval to ground semantics in external knowledge.
- Retrieval evidence is injected into the executor as flexible feature prompts to overcome retrieval rigidity.
- The abstract reports empirical gains across benchmarks; full numeric results are in the paper PDF.

What to verify in reproduction (practical checklist): dataset splits and counts (N_train/N_val/N_test), metric definitions (fidelity, hallucination, recall), model sizes and seeds, index sizes (#docs, e.g., 1M), and exact ablations.

## Technical implications

Interfaces and schemas (paper context: https://arxiv.org/abs/2602.04144)

- Define a deterministic semantic‑plan schema (JSON or typed protobuf) with explicit slots for entities, temporal order, and uncertainty flags (confidence 0–1).
- Planner output size guidance: budget planner context to platform limits (for example ≤8,000 tokens) and serialize plans at ≤2,000–4,000 tokens per request to control latency.

Retrieval infrastructure (paper context: https://arxiv.org/abs/2602.04144)

- Use FAISS/ScaNN or similar for non‑parametric indices; shard indices when >1,000,000 documents. Target retrieval hit rate ≥80% for an initial rollout.
- Index freshness policy: rebuild cadence between 24 and 168 hours depending on volatility (24h for fast domains, 168h for slow catalogs).

Executor integration (paper context: https://arxiv.org/abs/2602.04144)

- Retrieval injection pattern: pass top‑K = 5 items (each ≤512 tokens) as soft or hard prompts; use a retrieval timeout fallback of 100–300 ms.
- Fallback policy: if retrieval fails (hit rate <50% or timeout), fall back to a parametric generator and mark outputs with provenance flags.

Performance & cost

- Expect increased end‑to‑end latency vs. a single model. Target P50 ≤80 ms for planner compute; set full pipeline P95 ≤300 ms depending on SLA.
- Example per‑request cost guardrail: $0.03–$0.20 depending on model sizes and retrieval volume; index storage for 10M items may be tens of GB.

Observability

- Instrument retrieval hit rate, planner confidence distribution, executor hallucination flag rate, and fallback frequency.

## Founder lens: business consequences

Direct product benefits

- Grounded generation improves explainability and creates provenance traces that help audits (paper abstract motivates grounding; see https://arxiv.org/abs/2602.04144).
- Potential support reductions if hallucinations drive tickets; engineering spend is reasonable to weigh when manual review costs exceed $2,000/month.

Go‑to‑market & monetization

- Offer a premium “evidence‑grounded” tier with stricter SLAs (example target: hallucination rate ≤5%, retrieval hit rate ≥80%) and charge a premium for higher reliability.
- Curated evidence indices can be productized when you control high‑value ground truth sources.

Compliance & risk management

- Grounded outputs provide provenance for audits; retain retrieval metadata for investigations (retain ≥90 days recommended).

Investment tradeoffs (planning numbers)

- Prototype engineering time: 2–6 engineer‑weeks.
- Infra monthly cost estimate: $2,000–$20,000 depending on scale.
- Rollout trigger: prototype should show 10–20% relative improvement on fidelity or reduce hallucination enough to yield positive NPV within 6–12 months.

## Trade-offs and risks

Key failure modes (context: https://arxiv.org/abs/2602.04144)

- Retrieval dependence: index staleness and coverage gaps can introduce systematic grounding errors; monitor segment coverage and retrieval hit rate (target ≥80%).
- Complexity & latency: a 3‑component pipeline increases operational surface area and latency; set P95 budgets (e.g., ≤300 ms) and build graceful degradation.
- Privacy & leakage: retrieval can surface sensitive records; enforce redaction, encrypted indices, and provenance tagging.

Mitigations (brief)

- Fallback to parametric generator with provenance flagging when retrieval fails.
- Enforce retrieval timeouts (100–300 ms), cap top‑K to ≤5, and run regular index rebuilds.
- Access controls, encryption, and retention policies for indices.

## Decision framework

Stepwise adoption playbook (reference: https://arxiv.org/abs/2602.04144)

1) Measure baseline: record hallucination rate, support costs, and per‑request latency (P50/P95). Example triggers: hallucination >5% or support cost >$2k/month.
2) Inventory evidence: confirm indexable sources and target coverage ≥80% for critical domains.
3) Prototype: build planner + retriever + executor for one narrow task (2–6 weeks, top‑K=5, retrieval timeout 200 ms).
4) Evaluate: require prototype to hit an improvement target (suggested ≥10% relative fidelity uplift or a clear hallucination reduction).
5) Gate to rollout: meet fidelity target, P95 latency SLA, privacy review, and cost estimate.

Prototype decision checklist:

- [ ] Baseline metrics collected (hallucination rate, P95 latency)
- [ ] Evidence sources inventoried and indexable
- [ ] Planner schema defined and validated on 50–200 examples
- [ ] Retrieval hit rate target ≥80% on validation
- [ ] Prototype meets fidelity uplift target (≥10%)

## Metrics to track

### Assumptions / Hypotheses

- Hypothesis 1: Decoupling planning and synthesis reduces hallucination rate by ≥10% relative to a strong parametric baseline when reliable evidence is available (paper motivates decoupling; numeric target is an assumption for product gating) (https://arxiv.org/abs/2602.04144).
- Hypothesis 2: Retrieval hit rate ≥80% is required for consistent gains; below 50% the executor will fall back to parametric memory and net gains will likely disappear.
- Hypothesis 3: A top‑K of 5 and retrieval timeout ~200 ms balances fidelity and latency for many production tasks.

### Risks / Mitigations

- Risk: Index staleness causes incorrect grounding → Mitigation: index rebuild cadence 24–168h and retention logs for ≥90 days.
- Risk: Latency exceeds SLA → Mitigation: retrieval timeout 100–300 ms, top‑K ≤5, and asynchronous prefetching.
- Risk: Sensitive data returned in evidence → Mitigation: redaction rules, encrypted indices, and provenance flags on outputs.

### Next steps

- Instrument baseline metrics: hallucination rate, retrieval hit rate, P50/P95 latency, fallback rate, cost per inference (target per‑inference budget $0.03–$0.20).
- Build a 2–6 week prototype for a single task with K=5, retrieval timeout 200 ms, and index size target 0.1–10M documents.
- Run an A/B test vs. baseline on N ≥1,000 requests and require ≥10% relative fidelity uplift or reduction of hallucination below 5% before wider rollout.

Checklist reminder:

- [ ] Baseline collected
- [ ] Evidence coverage ≥80% target
- [ ] Prototype meets fidelity and latency gates

References: OMG‑Agent abstract and metadata — https://arxiv.org/abs/2602.04144
