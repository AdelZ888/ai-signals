---
title: "Task-Method-Knowledge Prompting Improves LLM Planning on PlanBench Blocksworld"
date: "2026-02-06"
excerpt: "TMK prompts (Task / Method / Knowledge) raised LLM planning accuracy on PlanBench Blocksworld from 31.5% to 97.3%. Practical steps and reproduction tips for builders."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-06-task-method-knowledge-prompting-improves-llm-planning-on-planbench-blocksworld.jpg"
region: "UK"
category: "Model Breakdowns"
series: "founder-notes"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "LLM"
  - "prompting"
  - "TMK"
  - "planning"
  - "PlanBench"
  - "Blocksworld"
  - "chain-of-thought"
  - "research-brief"
sources:
  - "https://arxiv.org/abs/2602.03900"
---

## Builder TL;DR

What happened: The paper adapts the Task-Method-Knowledge (TMK) framework to prompting and reports large improvements on planning benchmarks (PlanBench Blocksworld). See the submission: https://arxiv.org/abs/2602.03900 (submitted 3 Feb 2026).

Practical takeaway: When an LLM fails to decompose or justify multi-step plans, try a TMK-structured prompt (explicit Task / Method / Knowledge fields). The authors report a jump from 31.5% to 97.3% accuracy on opaque, symbolic Blocksworld instances: https://arxiv.org/abs/2602.03900.

Immediate actions (artifact checklist):

- [ ] 1) pick 10–100 representative planning tasks from your product backlog
- [ ] 2) craft a TMK prompt template with Task / Method / Knowledge slots
- [ ] 3) run A/B vs your current Chain-of-Thought (CoT) prompts on the same inputs
- [ ] 4) capture plan success rate, per-step correctness, and invalid-action counts

Scope note: Results are reported specifically on PlanBench (Blocksworld). Validate on your domain before rollout. See the paper for task/domain scope: https://arxiv.org/abs/2602.03900.

## Core thesis

The TMK (Task-Method-Knowledge) prompting pattern improves LLM planning by encoding not only what to do and how to do it, but also why actions are taken. The paper frames TMK as capturing causal, teleological, and hierarchical structure that guides decomposition—an expressive representation compared to HTN/BDI because TMK explicitly represents the "why" behind actions. The authors evaluate TMK-structured prompting on PlanBench Blocksworld and report substantial performance gains (from 31.5% to 97.3% on opaque symbolic tasks): https://arxiv.org/abs/2602.03900.

Key elements of the thesis from the paper: TMK provides explicit task decomposition mechanisms and an explicit knowledge field that supplies causal/teleological links, and TMK prompting materially reduces planning failure modes in the evaluated benchmark: https://arxiv.org/abs/2602.03900.

## Evidence from sources

Primary evidence comes from the paper: https://arxiv.org/abs/2602.03900 (Erik Goh, John Kos, Ashok Goel, submitted 3 Feb 2026). The authors perform experiments on PlanBench (Blocksworld domain) and report that TMK-structured prompting enabled a reasoning model to achieve up to 97.3% accuracy on opaque, symbolic Blocksworld tasks where it previously scored 31.5%: https://arxiv.org/abs/2602.03900.

Methodology note: reproduce the PlanBench Blocksworld baseline, then run the TMK prompt experiments on the same splits to validate effect size.

Concrete reported numbers from the paper (paper excerpt):

- baseline reasoning-model accuracy on opaque Blocksworld: 31.5% (reported)
- TMK-prompted reasoning-model accuracy on same tasks: 97.3% (reported)
- submission date: 3 Feb 2026 (metadata)

Practical reproduction checklist derived from the evidence:

- select the same PlanBench Blocksworld inputs (count and distribution as in the paper)
- apply the TMK prompt templates used in the study (Task / Method / Knowledge fields)
- measure per-instance correctness and aggregate accuracy to confirm a similar delta

Source: https://arxiv.org/abs/2602.03900.

## Technical implications

1) Prompt-level intervention can fix planning breakdowns. The paper shows TMK as a prompting strategy that materially changes model behavior on planning tasks; this implies you can get large accuracy gains without model re-training in similar symbolic tasks: https://arxiv.org/abs/2602.03900.

2) Decomposition + causal scaffolding reduces search errors. TMK's explicit decomposition and knowledge fields appear to guide the model to generate ordered, justifiable subtasks and avoid the chaotic step-mixing that commonly breaks multi-step plans.

3) Per-model variance expected. The paper notes "significant performance inversion in reasoning models," which implies different LLMs may react differently to TMK prompts—validate per model and per task: https://arxiv.org/abs/2602.03900.

4) Implementation artifact (prompt template): define three slots—Task (goal statement), Method (decomposition pattern / algorithmic hints), Knowledge (causal relations, invariants). Start with 1–3 few-shot examples per slot, then scale.

5) Testing constraints: on symbolic, opaque tasks the reported accuracy reached 97.3%; on noisy, natural-language planning tasks, results need validation (paper's experiments are PlanBench Blocksworld): https://arxiv.org/abs/2602.03900.

## Founder lens: business consequences

Product implications

- Faster ship for agentic features: If TMK reliably increases planning accuracy, teams can expose stronger multi-step automation (schedulers, task planners, orchestrators) with less investment in fine-tuning.

- Differentiation: Improved plan validity (e.g., moving error from ~32% to ≈97% in a targeted domain) is a credible product differentiator for assistants that perform complex procedures.

Operational thresholds and rollout gates (recommendations):

- require A/B relative improvement ≥ 50% over baseline OR absolute plan-success ≥ 90% on representative tasks before productionizing
- rollback criteria: invalid-plan rate increase > 5% relative to baseline

Cost & go-to-market

- Because TMK is a prompting technique, initial experimentation incurs mostly inference cost; if it scales, you may re-evaluate fine-tuning vs prompt engineering depending on tokens and latency (assumptions below): https://arxiv.org/abs/2602.03900.

## Trade-offs and risks

Trade-offs

- Benchmark vs reality: The paper's gains are in Blocksworld, a symbolic domain. Real-world tasks often have noisy inputs and ambiguous goals; TMK may not deliver the same magnitude of improvement outside similar, well-structured domains: https://arxiv.org/abs/2602.03900.

- Prompt length and cost: richer TMK prompts (Task+Method+Knowledge + examples) increase token cost and latency—there is a trade-off between per-call cost and correctness.

Risks

- Model-specific failure modes and inversions: some models may degrade under TMK prompting; per-model validation is mandatory: https://arxiv.org/abs/2602.03900.

- Overfitting to structure: overly tight TMK templates could encourage brittle solutions that fail on slight domain drift.

Suggested safety/checklist (operational):

- [ ] Per-model sanity tests on 100 random inputs
- [ ] Prompt-robustness tests (paraphrase Task statements, 10 variants)
- [ ] Rollback rule: if invalid-plan rate rises >5% or latency increases >50 ms median, revert

## Decision framework

Use TMK when:

- Task requires explicit multi-step decomposition and causal justification (schedulers, automated workflows, symbolic planners). See the reported Blocksworld improvement: https://arxiv.org/abs/2602.03900.

Prefer other interventions (fine-tune / model change) when:

- TMK A/B trials yield negligible improvement across representative workloads OR
- Prompt length/latency/cost constraints are tight and expanding tokens would violate SLA.

Decision table (quick):

| Task type | Observed baseline accuracy | Recommended action |
|---|---:|---|
| Symbolic / opaque (Blocksworld-like) | ≤ 40% | Apply TMK prompt; expect large gains (paper: 31.5% → 97.3%) https://arxiv.org/abs/2602.03900 |
| Semi-structured / noisy | 40%–80% | A/B TMK; if <50% relative improvement, prefer model change or fine-tune |
| Natural-language, ambiguous goals | >80% | Use TMK selectively for hard cases; avoid uniform rollout without testing |

Operationalize: run a 2-week experiment: N=200 tasks, track plan success, per-step correctness, latency. If plan success increases by ≥50% relative or absolute success ≥90%, enable staged rollout.

## Metrics to track

Include the arXiv source in your tracking rationale: https://arxiv.org/abs/2602.03900

### Assumptions / Hypotheses

- Hypothesis 1: TMK prompts will increase plan success on structured/symbolic tasks to ≥90% (paper reports 97.3% on Blocksworld). Source: https://arxiv.org/abs/2602.03900.
- Hypothesis 2: Per-call token usage will increase (estimate 256–2,048 extra tokens for richer prompts) — this is an operational assumption to be measured.
- Hypothesis 3: Some models will invert performance under TMK (per paper note of "significant performance inversion"), so expect ~1–3 models out of the set to degrade; validate per-model. See: https://arxiv.org/abs/2602.03900.

### Risks / Mitigations

- Risk: No improvement on real-world inputs. Mitigation: require A/B on N≥200 domain examples and refuse rollout unless improvement thresholds met.
- Risk: Latency/cost spikes. Mitigation: track median latency and tokens; block rollout if median latency increases >50 ms or cost per call exceeds budget by >20%.
- Risk: Hallucinated/invalid actions. Mitigation: add a verifier step; alert and rollback if invalid-plan rate increases >5%.

### Next steps

- Step 1 (0–2 days): Implement TMK prompt template and run a smoke test on 20 canonical tasks; log per-step outputs. Include the paper for guidance: https://arxiv.org/abs/2602.03900.
- Step 2 (3–10 days): Run A/B on N=200 tasks, track plan success, per-subtask correctness, latency, tokens, and cost.
- Step 3 (10–21 days): If relative improvement ≥50% or absolute success ≥90% on structured tasks, run production pilot behind a feature flag; monitor rollback criteria.

Sources: primary — https://arxiv.org/abs/2602.03900
