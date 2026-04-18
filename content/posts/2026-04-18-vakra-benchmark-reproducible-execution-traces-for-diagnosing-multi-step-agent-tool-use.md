---
title: "VAKRA benchmark: reproducible execution traces for diagnosing multi-step agent tool use"
date: "2026-04-18"
excerpt: "Guides running VAKRA's runnable benchmark—8,000+ local APIs across 62 domains—to record full execution traces, reproduce common multi‑step agent failures, and guide focused fixes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-18-vakra-benchmark-reproducible-execution-traces-for-diagnosing-multi-step-agent-tool-use.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "VAKRA"
  - "agents"
  - "benchmarking"
  - "tool-use"
  - "failure-modes"
  - "evaluation"
  - "ibm-research"
  - "hugging-face"
sources:
  - "https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis"
---

## TL;DR in plain English

- VAKRA is a runnable, tool-grounded benchmark that requires agents to reason and act across an ecosystem of over 8,000+ locally hosted APIs backed by real databases spanning 62 domains. It measures compositional reasoning with full execution traces and multi-step workflows (common chain length: 3–7 steps; some chains use 1–12 tool calls). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis (Published April 15, 2026).

- The benchmark comprises four task families and exposes capability groups (for example, a BI/business-intelligence capability with 2,077 test instances across 54 domains). Use these groups to pick representative tasks and reproduce failures locally. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

- Practical first actions: (1) reproduce a single VAKRA task locally, (2) capture its full execution trace, (3) classify the observed failure mode (API chaining error, hallucinated tool call, retrieval miss, or state drift) and fix the smallest possible cause. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Concrete facts from the VAKRA report:
- Executable environment with 8,000+ local APIs and 62 domains. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Tasks commonly require 3–7 step reasoning; some chains use 1–12 tool calls. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- BI capability example: 2,077 test instances across 54 domains. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## What you will build and why it helps

Goal: a small, repeatable local harness that runs VAKRA tasks, records full execution traces, and lets a small team iterate until a targeted set of tasks pass. The VAKRA design intentionally uses full execution traces to assess whether agents can reliably complete multi-step workflows, so building traces into your harness aligns directly with the benchmark's analysis approach. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Why this helps:
- Reproducibility: full traces make errors deterministic and debuggable (the benchmark emphasizes execution traces for analysis). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Signal: capability-grouped tasks (e.g., BI) collect many variations; fixing a few representative failures can yield broad improvements. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Prioritization: VAKRA highlights specific failure modes that you can map to small, testable mitigations (see Common problems and Assumptions). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Concrete outputs to plan for (conceptual):
- A local runner that executes single tasks and exports per-run traces.
- Trace-backed reports that show per-step success/failure, arguments, and tool outputs (the benchmark uses execution traces for failure analysis). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## Before you start (time, cost, prerequisites)

Read the VAKRA overview and dataset links first: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

What VAKRA implies about scale and effort (grounded facts):
- API surface: ~8,000+ locally hosted APIs, across 62 domains. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Task families: the benchmark groups tasks into four capability types; some capability sets include thousands of instances (for example, the BI group with 2,077 instances across 54 domains). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Typical reasoning depth: many tasks require 3–7 steps; a subset requires longer chains (up to 1–12 tool calls). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Minimum practical prerequisites (high-level):
- A development machine or CI runner that can host mock/local APIs and a document store for a small pilot.
- Familiarity with your agent/tooling stack so you can hook the agent to the local endpoints.

Time and cost guidance (plan):
- First reproducible run: a few hours to a day depending on familiarity with the repo/environment.
- Small pilot (see Assumptions for suggested pilot sizes and gates).

Reference: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## Step-by-step setup and implementation

Follow a minimal hygiene-first path that mirrors the benchmark's emphasis on traceable execution.

1. Read the VAKRA blog and follow dataset/repo links: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
2. Start a minimal local environment that exposes the API universe and a document store for the tasks you will pilot. (Use a single capability group first; BI is a dense example in the benchmark.) Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
3. Hook your agent to the local endpoints and ensure you can execute a single task end-to-end.
4. Record the full execution trace for each run so you can inspect the sequence of tool calls, inputs, outputs, and step outcomes (VAKRA analysis relies on full traces). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
5. Iterate on the smallest fix that addresses the first failing step; re-run the single task to confirm the targeted repair.

Notes:
- Focus on one task at a time. VAKRA's failure-mode analysis is most useful when a run produces a clear execution trace to analyze. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Keep your pilot narrow: reproduce, trace, and fix before scaling to hundreds or thousands of tasks. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## Common problems and quick fixes

VAKRA's published analysis surfaces recurring failure modes; use traces to spot and classify them. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Benchmark facts (excerpt-grounded):

| Item | Value |
|---|---:|
| Local APIs | 8,000+ |
| Domains | 62 |
| Typical chain length | 3–7 steps |
| Max tool calls in some tasks | 1–12 |
| BI capability instances | 2,077 |
| BI capability domains | 54 |
| Task families | 4 |
| Published | April 15, 2026 |

Common failure modes (from VAKRA) and high-level diagnostic approach:
- API chaining errors: identify which step in the chain returned an error; replay that call in isolation. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Hallucinated tool calls: detect references to tools that are not in your local universe; treat these as disallowed until validated. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Retrieval misses: when document search returns zero or irrelevant docs, log the raw query and consider broadened retrieval. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- State drift on long chains: for multi-step chains, check that intermediate state is read and written as expected. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Quick checklist (practical):
- [ ] Reproduce 1 task and export its trace.
- [ ] Classify failure mode from trace (API chaining, hallucination, retrieval, state drift).
- [ ] Apply the smallest-change fix and re-run the task.

Reference: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## First use case for a small team

Target audience: solo founders, product managers, or a small team (1–3 people) who need early confidence that an agent handles a small automated workflow that mixes API calls and document retrieval.

Why start with a small team and a few tasks:
- VAKRA exposes compositional failures that are often resolved by small, targeted changes; fixing a handful of high-signal tasks reduces risk before scaling. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Short action plan:
1. Choose one capability group (e.g., BI) and a few representative tasks from that group. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
2. Reproduce each task locally and collect its execution trace for inspection. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
3. Iterate: fix the first failing step, re-run the task, and retain before/after traces to document the change.
4. Expand to additional tasks only after a small set passes reproducibly.

Practical tip: use the benchmark's capability groupings to pick tasks that exercise different subskills (API chaining, retrieval, state maintenance). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## Technical notes (optional)

VAKRA is explicitly designed to measure compositional reasoning across APIs and documents using executable tasks and full execution traces. Use the benchmark's emphasis on end-to-end execution to guide your instrumentation and test design. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Design guidance (high-level):
- Instrument each run so you can order and filter steps in the trace.
- Keep runs small and deterministic to simplify root cause. The benchmark leverages execution traces for failure-mode analysis. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

## What to do next (production checklist)

### Assumptions / Hypotheses

Assumptions and operational hypotheses you should validate in your environment (suggested values to treat as hypotheses, not claims from the VAKRA excerpt):

- Pilot success gate: execution_success_rate >= 0.7 (validate on your pilot tasks).
- Canary gate: execution_success_rate >= 0.8.
- Production gate candidate: execution_success_rate >= 0.9.
- Retrieval tuning target for pilot queries: recall >= 0.8.
- Canary size suggestion: 5% of traffic or equivalent load.
- Baseline test counts: pilot 10 tasks; scale baseline 500–1,000 tasks before final gate.
- Rollback trigger: drop >= 20 percentage points in execution_success_rate from baseline.

Example commands and config (adapt these to the official repo and your infra; these are templates you should validate):

```bash
# Example: start a local environment wrapper (adapt to repo instructions)
# ./scripts/start_local_env.sh --mode=minimal
# Run a single-task evaluation and write a trace file
python run_eval.py --task-id example_task_001 --out trace_example_task_001.ndjson
```

```json
{
  "run_id": "pilot-2026-01",
  "trace_schema": ["timestamp_ms","step_index","tool_name","args","tool_output","success_bool","run_metadata"]
}
```

Sample NDJSON trace line (template to adapt):

```json
{"timestamp_ms": 1700000000000, "step_index": 1, "tool_name": "get_data", "args": {"query":"team metrics"}, "tool_output": {"rows": 3}, "success_bool": true}
```

Methodology note (short): use single-task reproduction + trace capture as the primary debugging loop before scaling to bulk runs.

Source for benchmark design and failure-mode focus: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

### Risks / Mitigations

Risks surfaced by VAKRA's failure-mode analysis (excerpt-grounded):
- Hallucinated or unauthorized tool calls (noted as a failure mode in VAKRA). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- API chaining errors across multi-step workflows. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- Retrieval misses that cause incorrect or incomplete answers. Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
- State drift across long chains (1–12 tool calls in some tasks). Source: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis

Mitigations (ideas to validate in your environment are listed under Assumptions above): enforce explicit tool allow-lists, record raw retrieval queries, and require small unit checks on chain segments. Validate each mitigation on a pilot before making it a CI/CD gate.

### Next steps

Short-term (0–2 weeks):
- Run a small pilot (suggested pilot: 10 tasks) and collect NDJSON traces for each run.
- Implement and validate one or two mitigations from Assumptions (schema validation, raw query logging, allow-list enforcement).

Medium-term (2–8 weeks):
- Run a baseline of 500–1,000 representative tasks and record metrics.json summarizing execution_success_rate and step_failure_rate.
- Define rollout_gate_config.yaml with validated thresholds and wire gates into CI.

Rollout checklist:
- [ ] Pilot pass and baseline metrics recorded.
- [ ] Scale test (500 tasks) completed and analyzed.
- [ ] Canary deploy at suggested size (5%) with feature flagging.
- [ ] Monitoring and rollback triggers configured (execution_success_rate, hallucinated_tool_count, step_failure_rate).

For VAKRA dataset details, task examples, and the full failure-mode discussion, see: https://huggingface.co/blog/ibm-research/vakra-benchmark-analysis
