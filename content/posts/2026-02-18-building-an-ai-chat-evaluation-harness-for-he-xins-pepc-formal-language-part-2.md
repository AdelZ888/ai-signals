---
title: "Building an AI-Chat Evaluation Harness for He Xin's PEPC Formal Language (Part 2)"
date: "2026-02-18"
excerpt: "Build an AI-chat evaluation harness for He Xin’s PEPC formal language to test expressiveness, contradiction handling, and alignment with wargame baselines — includes artifacts and metrics."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-18-building-an-ai-chat-evaluation-harness-for-he-xins-pepc-formal-language-part-2.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "advanced"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "PEPC"
  - "He Xin"
  - "formal-language"
  - "evaluation"
  - "LLM"
  - "wargaming"
  - "knowledge-graphs"
  - "concept-drift"
sources:
  - "https://news.ycombinator.com/item?id=46976391"
---

## Builder TL;DR

What you’ll build: an AI-chat-driven evaluation harness that ingests PEPC formal artifacts (He Xin Tree, historical concept classes), exercises the PEPC formal language with scenario inputs, and reports alignment metrics against baseline wargame outputs (conflict probability, resource consumption). The PEPC system is described as a formalization for dynamic, contradiction-compatible dialectical logic and is reported to be applicable to strategic wargaming and dynamic concept evolution (source: https://news.ycombinator.com/item?id=46976391).

Why it matters: use the PEPC specification as the test target for an LLM-assisted evaluation harness that stresses expressiveness, contradiction handling, and evolution behavior before any pilot or productization. The HN excerpt frames PEPC’s application to strategic scenarios and AI/knowledge-graph use (https://news.ycombinator.com/item?id=46976391).

Quick artifacts delivered: evaluation checklist, decision table mapping score ranges to actions, and a metric-threshold sheet. Example infra constraints and counts you should plan for: 1,000–8,192 token model contexts, Node.js 18+ or Python 3.10+ runtimes, N≥20 scenarios, and N=5 replicate runs per scenario.

## Goal and expected outcome

Primary goal: validate the expressiveness and operational behavior of He Xin’s PEPC formal language under dynamic scenario inputs via AI-chat interrogation and automated tests. Grounding: PEPC’s stated features—dynamic generation of concepts, He Xin Tree, and historical-concept-class set—motivate tests that check concept evolution and alignment to wargame baselines (https://news.ycombinator.com/item?id=46976391).

Expected outcomes:
- A reproducible evaluation report comparing PEPC-derived predictions to baseline wargame outputs (conflict probability, resource consumption) for N=20 representative scenarios.
- Delivered artifacts: parser grammar (BNF), IR schema (JSON), prompt set, results CSV, and a decision table that maps score ranges to actions.

Success criteria (example operational thresholds to test and then declare): parse success target (example) 95% across parse test corpus, conflict-probability alignment target within 5% delta, and response median latency target 200 ms for the evaluator path.

Methodology note: factual claims about PEPC’s role and applicability are taken from the referenced discussion; implementation converts those claims into measurable checks (https://news.ycombinator.com/item?id=46976391).

## Stack and prerequisites

Required stack and artifacts:
- LLM/chat API with 1,000–8,192 token context capacity; budget estimate $1,200–$3,000/month for moderate evaluation usage.
- Parser toolchain: ANTLR or tree-sitter and a grammar file (BNF) for PEPC.
- Processing runtime: Node.js 18+ or Python 3.10+ for the harness and ETL.
- Storage: object store for artifacts (SVG/PDF diagrams, logs) and a SQL/CSV dataset of baseline wargame outputs (N≥20 scenarios).
- Dashboard: Grafana or static report generator for SVG/PDF and CSV outputs.

Engineer prerequisites: experience with formal grammars, prompt engineering, unit testing, and metrics pipelines. Prepare these concrete artifacts before starting:
- parser/pepc.bnf (grammar)
- scenarios.csv (N≥20 rows with baseline conflict_prob and baseline_resource_consumption)
- eval-config.yaml (prompts, thresholds, replicates)

Reference for scope and target use-cases: https://news.ycombinator.com/item?id=46976391.

## Step-by-step implementation

1. Gather inputs.
   - Collect available PEPC spec artifacts (He Xin Tree notes, historical-concept-class descriptions) and assemble scenario baselines (N≥20) in scenarios.csv. Source: https://news.ycombinator.com/item?id=46976391.

2. Formal ingestion — implement the parser.
   - Write an initial BNF/grammar and unit tests with expected parse counts. Aim for iterative targets (e.g., 50 unit tests first, grow to 200 failing-case entries).

3. IR and mapping.
   - Convert parse trees into a compact IR (JSON schema). Keep IR keys concise (<50 keys) and normalize numeric fields (probabilities 0–1 or absolute units).

4. Prompt design & AI-chat harness.
   - Create prompt templates that ask the model to (a) validate semantics of parsed PEPC artifacts, (b) simulate evolution when parameters change by ±10–50%, and (c) translate deductions into measurable indicators like conflict probability and resource consumption. Store prompt variants in eval-config.yaml.

5. Test harness run.
   - Run the harness over scenarios.csv, collect N results per scenario (replicates N=5 to measure variance), and produce results.csv with columns: scenario_id, parse_ok (0/1), predicted_conflict_prob, baseline_conflict_prob, predicted_consumption, baseline_consumption, latency_ms.

6. Metrics, gating, and iterate.
   - Populate the metric-threshold table and a decision table. If alignment metrics fail (example gates: conflict delta >5% OR consumption delta >10% OR parse success <90%), trigger the remediation loop: refine grammar, adjust IR mapping, or tighten prompts. Cap iterations at 12 or 30 days for the first phase.

Rollout / rollback plan (gates):
- Canary: promote to 5% of pilot workloads or 1 of 20 scenarios for 24–72 hours.
- Feature flag: evaluator behind a flag; enable A/B where A is golden wargame baseline.
- Rollback criteria: error rate >2% for parsing/classification, metric delta >10% sustained for 6 hours, or human-approved red flags.

Example commands and config to run the harness:

```bash
# Install and run tests
npm ci
npm run test:parser  # runs parser unit tests (initial set: 50 tests)
python3 harness/run_eval.py --config eval-config.yaml --scenarios scenarios.csv --out results.csv
```

```yaml
# eval-config.yaml (example)
llm:
  model: "gpt-eval-1"
  max_tokens: 2000
  temperature: 0.0
thresholds:
  parse_success: 0.95
  conflict_delta: 0.05
  consumption_delta: 0.10
iterations: 12
replicates: 5
batch_size: 5
```

Source context for the testing focus: https://news.ycombinator.com/item?id=46976391.

## Reference architecture

Dataflow: scenario CSV (N≥20) -> Parser (grammar) -> IR (JSON) -> AI-chat evaluator (prompts) -> Metric collector -> Comparison engine -> Dashboard/report (SVG/PDF + CSV).

Components and artifact counts:
- Formal-spec store (1 canonical folder)
- Parser (1 grammar file + 50–200 unit tests)
- IR layer (1 JSON schema)
- AI-chat evaluator (3 prompt families, ~10 prompt variants)
- Scenario dataset (≥20 scenarios)
- Metrics pipeline (collector + dashboard)

Example metric table (thresholds):

| Metric | Target | Fail threshold |
|---|---:|---:|
| Parse success | >=95% | <90% |
| Conflict alignment (delta) | <=5% | >10% |
| Resource consumption delta | <=10% | >15% |
| Median evaluator latency | <=200 ms | >500 ms |

Reference mapping to the PEPC discussion: the architecture targets PEPC’s role modeling concept evolution and mapping to strategic indicators (https://news.ycombinator.com/item?id=46976391).

## Founder lens: ROI and adoption path

Value propositions tied to the PEPC use-case described in the excerpt:
- Encodes multi-parameter scenarios into a testable decision-support harness derived from the PEPC formal language; the HN excerpt frames PEPC as applicable to strategic analysis and AI/knowledge-graph tasks (https://news.ycombinator.com/item?id=46976391).

Adoption path (staged timeline):
- Research prototype: weeks 2–6 to validate N=20 scenarios against baselines with initial parser and prompt families.
- Domain pilot: 1–3 months to integrate with a small analyst group and collect KPIs (alignment scores, time-to-decision metrics).
- Integration: 3–9 months to ship as a plugin or integration with existing pipelines if pilot KPIs are positive.

Notes on revenue or pricing are assumptions and are listed in the Assumptions / Hypotheses section below.

## Failure modes and debugging

Primary failure modes, fixes, and debug actions (tied to gating thresholds). Source context on PEPC drives what you test: https://news.ycombinator.com/item?id=46976391.

- Parser ambiguity / misparse (symptom: parse success <90%).
  - Debug: add failing-case registry, increase unit tests from 50 → 200, and define 1:1 mapping tests between grammar nodes and IR nodes.
- LLM hallucination (symptom: free-text explanation inconsistent with formal parse in >5% of runs).
  - Debug: constrain temperature to 0.0–0.2, use golden examples, require human review when hallucination_score >0.05, and run N=5 replicates to estimate variance.
- Metric divergence vs baselines (symptom: conflict delta >10% sustained).
  - Debug: check mapping rules, run sensitivity analyses with parameter sweeps ±10–50%, and re-evaluate IR semantics.
- Performance regression (latency median >500 ms).
  - Debug: cache repeated prompt templates, batch scenario requests (batch size 5), or switch to a lower-latency model. Latency SLO: median ≤200 ms, P95 ≤1,000 ms.

Debugging checklist:
- [ ] Confirm grammar passes initial unit tests (start at 50 tests)
- [ ] Re-run 5 replicates per scenario and record variance
- [ ] Compare deltas and log failing scenarios (top 10% by delta)
- [ ] Open human-review tickets for highest-risk divergent cases

For more context on why to focus on concept-evolution behavior and wargaming alignment, see: https://news.ycombinator.com/item?id=46976391.

## Production checklist

### Assumptions / Hypotheses

- Assumption: PEPC’s formalism can be expressed with a determinable grammar suitable for parser tooling; this follows from the excerpt’s claim that PEPC formalizes dialectical logic (https://news.ycombinator.com/item?id=46976391).
- Hypothesis: PEPC-derived predictions can align with baseline wargames on key indicators (conflict probability, resource consumption) within operational thresholds (example: conflict delta ≤5%, consumption delta ≤10%).
- Assumption: initial tooling will use models with 1,000–8,192 token contexts and budget $1,200–$3,000/month for moderate evaluation runs.
- Timeline hypothesis: 1 week for an initial parser prototype, 2 additional weeks to run and analyze N=20 scenarios with 5 replicates each; full pilot 1–3 months.

### Risks / Mitigations

- Risk: Parser misinterpretation of ambiguous constructs.
  - Mitigation: rigorous unit tests (target >=95% pass for final test set), failing-case registry, and human-in-loop review for top 10% divergences.
- Risk: LLM hallucination.
  - Mitigation: low temperature (0.0–0.2), golden examples, replicate runs (N=5), and automated hallucination detectors (threshold >0.05 triggers review).
- Risk: Divergence from baselines.
  - Mitigation: remediation decision table -> refine mapping rules -> extend grammar -> escalate to domain experts.

### Next steps

- Prepare artifacts: parser/pepc.bnf, scenarios.csv (N≥20), eval-config.yaml, and a minimal golden baseline CSV.
- Run initial prototype: allocate 1 week for parser + 2 weeks to run and analyze N=20 scenarios with 5 replicates each.
- Gate to pilot if parse_success >=95% and conflict alignment <=5% delta across >=90% of scenarios; otherwise iterate up to 12 iterations or 30 days.

Primary reference for the PEPC scope used to design this harness: https://news.ycombinator.com/item?id=46976391.
