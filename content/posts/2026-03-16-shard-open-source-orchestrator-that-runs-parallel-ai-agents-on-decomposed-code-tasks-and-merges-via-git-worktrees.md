---
title: "Shard — open-source orchestrator that runs parallel AI agents on decomposed code tasks and merges via git worktrees"
date: "2026-03-16"
excerpt: "Shard decomposes large code changes into a DAG of parallel subtasks, runs multiple AI agents in separate git worktrees, and merges results in order with test-aware retries."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-16-shard-open-source-orchestrator-that-runs-parallel-ai-agents-on-decomposed-code-tasks-and-merges-via-git-worktrees.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "shard"
  - "ai"
  - "parallelization"
  - "agents"
  - "git"
  - "git-worktrees"
  - "open-source"
  - "developer-tools"
sources:
  - "https://github.com/nihalgunu/Shard"
---

## TL;DR in plain English

- Shard is an open-source orchestration project for running AI (artificial intelligence) helpers in parallel on code tasks. See https://github.com/nihalgunu/Shard.
- It breaks a large coding job into smaller subtasks, runs those subtasks at the same time, and then applies an ordered merge of the results. The repo includes an example DAG (directed acyclic graph) and a runbook you can try locally: https://github.com/nihalgunu/Shard.
- Treat initial runs as experiments on a fork or feature branch. Inspect per-task worktrees and agent logs to learn the primitives: decomposition, parallel invocation, and ordered merge. See https://github.com/nihalgunu/Shard.

Quick concrete scenario: you want to add a new API endpoint plus tests. Instead of one large edit, Shard splits the work into tasks (endpoint code, tests, docs). Each task runs a separate agent. You review each task’s diff, then an ordered merge combines them into the branch you want to promote.

### Plain-language explanation before advanced details

Shard makes three ideas explicit:
- Decomposition: split a large change into smaller, independent tasks.
- Parallel invocation: run multiple agents concurrently on those tasks.
- Ordered merge: apply task changes in a controlled sequence so merges are easier to manage.

Read the README and examples in the repo to see these concepts implemented in code and config: https://github.com/nihalgunu/Shard.

## What changed

- The Shard project packages an orchestration layer that focuses on AI-assisted parallel work on code. The README and examples show the intended primitives (decomposition, parallel agent invocation, ordered merge). See https://github.com/nihalgunu/Shard.
- Instead of keeping one long interactive agent session, you define smaller tasks and run them concurrently. The repo provides example configurations and a sample DAG you can run locally to observe behavior (https://github.com/nihalgunu/Shard).
- By making these primitives explicit, teams can add instrumentation and measurement instead of relying on ad-hoc scripts.

## Why this matters (for real teams)

- Faster feedback loops. Smaller tasks mean reviewers and CI (continuous integration) see partial, testable work earlier. The examples in the repo illustrate these workflow patterns: https://github.com/nihalgunu/Shard.
- Safer automation. An ordered merge step helps reconcile per-task edits in a controlled order instead of merging many competing edits at once. Inspect the merge examples in the repository: https://github.com/nihalgunu/Shard.
- New operational trade-offs. Parallel runs increase branch and merge activity and expose nondeterministic AI outputs. Teams must add gates and observability to detect regressions.

Practical adoption heuristic:

| Repository shape | Recommended immediate action |
|---|---|
| Modular, many small files | Try a controlled canary using the example DAG (https://github.com/nihalgunu/Shard) |
| Mixed modularity | Harden tests and run small-parallel trials on a fork (https://github.com/nihalgunu/Shard) |
| Monolithic codebase | Invest in modularization and test speed before parallel runs (see examples at https://github.com/nihalgunu/Shard) |

## Concrete example: what this looks like in practice

- The repo includes an example DAG that shows one full flow: subtask definition, per-task worktree, parallel agent runs, and an ordered merge. See the example DAG at https://github.com/nihalgunu/Shard.
- What you will see locally when you run the example: separate logs per agent, per-task diffs in isolated worktrees, and a merge log that records merge order and test outcomes. The repository shows how those artifacts are surfaced (https://github.com/nihalgunu/Shard).
- Practical first-run plan: pick a small change, run the example DAG on a sandbox fork, review diffs from each task, and verify the ordered merge before promoting to main. The repo includes sample configs to reproduce this pattern (https://github.com/nihalgunu/Shard).

## What small teams and solo founders should do now

Definitions first: CI = continuous integration; PR = pull request. Start conservatively.

Short, concrete steps for teams of 1–5:

1) Reduce blast radius. Run experiments on a fork or feature branch. Use the example DAG in the repo and do not run first experiments on main. See https://github.com/nihalgunu/Shard.

2) Start small. Pick a module you can revert quickly and that has focused tests. Limit the first runs to one or two subtasks. Clone and run the example from https://github.com/nihalgunu/Shard.

3) Add minimal gates. Create a CI job that runs merged-branch tests and blocks merges until you manually inspect ordered merge results.

4) Instrument three simple metrics and use them to decide whether to continue: agent wall-clock time, PR lead time, and flaky-test rate. Record results for three runs before scaling.

Checklist for a solo founder or very small team:
- [ ] Fork and clone https://github.com/nihalgunu/Shard
- [ ] Pick one small module and create a canary branch
- [ ] Run the example DAG against the canary branch in a sandbox
- [ ] Add a CI gate requiring manual review of the ordered merge before merging

## Regional lens (UK)

- Data handling and residency: because Shard is open-source, you can run the orchestration inside your UK cloud account. That gives you control over where prompts and telemetry run. See https://github.com/nihalgunu/Shard for local run options.

Practical UK checklist:
- [ ] Map which external agent endpoints your runs call (if any)
- [ ] Decide whether orchestration and git operations must stay in-region and run them in your UK cloud
- [ ] Add a short vendor clause if you call external agent APIs

## US, UK, FR comparison

Operational focus by region (high level):
- United States: emphasize vendor controls and contractual SLAs (service-level agreements) for external agent providers. Use the repo to keep orchestration auditable: https://github.com/nihalgunu/Shard.
- United Kingdom: emphasize data residency and a clear data map for any prompt or telemetry that leaves your environment. The repo can be run in-region to limit exposure (https://github.com/nihalgunu/Shard).
- France: be conservative with personal data and prefer EU-region hosting when processing sensitive information. Use the open-source orchestration to minimize external calls: https://github.com/nihalgunu/Shard.

Hosting decision template:

| Sensitivity | Orchestration location | External agent calls |
|---|---:|---|
| Public | Any | Any |
| Internal | Preferred region (UK/EU/US) | Approved vendors only |
| Confidential | Local / same region | Minimize; prefer self-hosted |

## Technical notes + this-week checklist

Shard’s public repo outlines an orchestration model: task decomposition, parallel agent invocation, and ordered merging. Inspect the code and the example DAG at https://github.com/nihalgunu/Shard.

### Assumptions / Hypotheses

- The repository implements the primitives described: decomposition, parallel invocation, and ordered merge. Source: https://github.com/nihalgunu/Shard.
- Trial sizing guidance (apply to your risk tolerance): start trials with 1–4 parallel agents; measure before scaling. Use three runs as a minimum sample to compare outcomes.
- Suggested numeric thresholds to treat as hypotheses to validate:
  - Test coverage guidance: target >= 70% for modules you canary.
  - Promotion gate: require merged-run pass rate >= 95% before promoting to protected branches.
  - Pause threshold: flaky-test rate > 5% should halt rollout until fixed.
  - Latency targets to observe: small prompts < 2,000 ms; large code generation prompts < 30 s (measure in your environment).
  - Slow integration test flag: if a single test > 10 minutes, prefer test speedups before parallelizing.
  - Expected scaling example: modular repos might see up to ~4× wall-clock improvement when moving from sequential to 4 parallel subtasks (hypothesis to validate).

### Risks / Mitigations

- Risk: nondeterministic AI edits cause regressions.
  - Mitigation: require integration tests, human review of diffs, and keep rollbacks simple.
- Risk: flaky tests multiply and mask real regressions.
  - Mitigation: quarantine flaky tests, improve determinism, and gate promotion on flaky-test rate.
- Risk: sensitive code leaves your control via external agent calls.
  - Mitigation: run orchestration locally/in-region, minimize prompt contents, and add vendor data clauses.

### Next steps

This-week practical checklist:
- [ ] Clone https://github.com/nihalgunu/Shard and read the README
- [ ] Pick a small, well-tested module and fork the repo
- [ ] Run the example DAG against the fork in a sandbox environment
- [ ] Start with 1 agent, then scale to 2–4 agents while measuring latency and token usage
- [ ] Add a CI job to run merged-branch tests and require a manual review of the ordered merge before promoting
- [ ] Record three metrics across three runs: agent wall-clock (minutes), PR lead time (minutes), flaky-test rate (%)

Brief methodology note: these recommendations come from the Shard project's public repository and its examples. Inspect the repo for exact implementation details before production use: https://github.com/nihalgunu/Shard.
