---
title: "ScarfBench: Evaluating AI Agents on Spring, Jakarta EE and Quarkus Migrations"
date: "2026-07-06"
excerpt: "ScarfBench is an open benchmark for assessing AI agents on Enterprise Java migrations (Spring, Jakarta EE, Quarkus), measuring behavior preservation, build success, and runtime safety."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-06-scarfbench-evaluating-ai-agents-on-spring-jakarta-ee-and-quarkus-migrations.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ScarfBench"
  - "AI agents"
  - "Java"
  - "framework migration"
  - "benchmarking"
  - "Spring"
  - "Jakarta EE"
  - "Quarkus"
sources:
  - "https://huggingface.co/blog/ibm-research/scarfbench"
---

## TL;DR in plain English

- ScarfBench is an open benchmark for evaluating AI agents on Enterprise Java framework migration (published June 30, 2026). See https://huggingface.co/blog/ibm-research/scarfbench.
- It focuses on cross-framework migrations across three major Java ecosystems: Spring, Jakarta EE, and Quarkus. ScarfBench measures preservation of behavior, build/tooling adaptations, and runtime dependency handling (three axes). See https://huggingface.co/blog/ibm-research/scarfbench.
- You can run one ScarfBench task end-to-end: run an agent, collect transformed source and logs, build and run tests, and decide whether to accept the change. See https://huggingface.co/blog/ibm-research/scarfbench.

Quick concrete example: a two-engineer pilot picks the smallest Spring service in the corpus, runs two agent variants, and compares baseline vs migrated builds and tests before merging. ScarfBench’s framing helps you gate on behavior and build outcomes rather than only diffs. See https://huggingface.co/blog/ibm-research/scarfbench.

One-line methodology note: ScarfBench emphasizes behavior-preservation plus build and runtime checks rather than only textual translation. See https://huggingface.co/blog/ibm-research/scarfbench.

## What you will build and why it helps

You will build a compact, repeatable pipeline that runs a single ScarfBench task and evaluates an AI agent’s output along the three axes ScarfBench defines: behavior, build, and runtime. See https://huggingface.co/blog/ibm-research/scarfbench.

Pipeline outputs (examples): transformed source tree, build artifacts, agent logs, test results CSV, and per-run diffs for manual review.

Decision frame (table):

| Metric | Why it matters | Artifact to record | Gate (example) |
|---|---:|---|---|
| Behavior (unit/integration) | Regression risks are semantic, not textual | test-report.xml, diff of failing tests | block on failing integration tests |
| Build | Build and dependency changes often break CI | build.log, resolved-deps.txt | require build success |
| Runtime | Missing runtime deps or config cause production failures | runtime-smoke.log, container exit code | smoke tests must pass |

See https://huggingface.co/blog/ibm-research/scarfbench for the benchmark framing and corpus.

Why this helps: migration risk is primarily about preserved behavior and runnable artifacts. The pipeline gives objective gates (build success, test pass rates, smoke-test start-up) that let a small team accept or reject an agent output reproducibly. See https://huggingface.co/blog/ibm-research/scarfbench.

## Before you start (time, cost, prerequisites)

Minimal prerequisites (practical): git, Docker (recommended for reproducibility), and a Java build tool (Maven or Gradle). See https://huggingface.co/blog/ibm-research/scarfbench.

Quick checklist

- [ ] Clone or otherwise access ScarfBench materials and read task definitions (https://huggingface.co/blog/ibm-research/scarfbench).
- [ ] Prepare a reproducible run directory and a config snapshot.
- [ ] Ensure the baseline app has unit and smoke tests that capture key behavior.

Quick commands to inspect and get started:

```bash
# open the ScarfBench overview
open https://huggingface.co/blog/ibm-research/scarfbench

# example: clone a local driver repo (placeholder)
git clone https://github.com/your-org/scarfbench.git || true
```

Example minimal run config (local example; not an official artifact). See ScarfBench framing: https://huggingface.co/blog/ibm-research/scarfbench.

```yaml
agent:
  name: sample-agent
  timeout_minutes: 60
run:
  tasks: 1
  snapshot_tag: demo-2026-07-01
metrics:
  required_unit_pass_pct: 95
  required_build_success_rate: 99
```

Record token and cost usage if you call hosted LLMs; track these numbers per run for budgeting.

## Step-by-step setup and implementation

1. Read ScarfBench and pick one task sized for a short pilot (the corpus contains self-contained apps). See https://huggingface.co/blog/ibm-research/scarfbench.
2. Create an isolated run directory and save a run/config.yml like the example above.
3. Capture baseline behavior by building and running unit and smoke tests inside Docker to get baseline metrics.

```bash
cd sample-app
# build and test baseline using Maven with a single CPU thread equivalent: 1C
mvn -T 1C clean test
# containerize baseline for runtime smoke checks
docker build -t sample-app:baseline .
docker run --rm --name sample-smoke sample-app:baseline sh -c "./run-smoke-tests.sh"
```

4. Configure and run your agent on the selected task. Save a per-run artifacts bundle with the transformed source, agent logs, and updated build files. ScarfBench task descriptions define inputs and expected outputs; follow them. See https://huggingface.co/blog/ibm-research/scarfbench.

```json
{
  "agent": "your-agent-id",
  "max_tokens": 8192,
  "timeout_seconds": 3600
}
```

5. Build and test the migrated output inside the same Docker image used for the baseline. Record results to CSV and store diffs for manual review.
6. Compare baseline vs migrated metrics and apply acceptance gates. ScarfBench emphasizes behavior, build, and runtime checks; use those axes as your decision frame. See https://huggingface.co/blog/ibm-research/scarfbench.

## Common problems and quick fixes

See ScarfBench for benchmark scope and motivating examples: https://huggingface.co/blog/ibm-research/scarfbench.

Problem / Quick fix (summary):

| Problem | Quick fix |
|---|---|
| Build fails with unresolved deps | Pin repository URLs and versions in pom.xml or build.gradle; re-run dependency resolution inside Docker |
| Tests pass locally but fail in CI | Reproduce the CI environment with Docker and match JVM version and env vars |
| Agent reports completion but behavior changed | Enforce automated gates and add a manual diff review before promotion |
| Long agent runtimes | Break the task into smaller subtasks and add progress checkpoints |

Quick troubleshooting checklist

- [ ] Reproduce the failing build inside Docker with the same JVM image.
- [ ] Diff build files (pom.xml / build.gradle) baseline vs migrated.
- [ ] Verify repository settings and runtime configuration.

Checkpoint guidance (adapt to your policy; ScarfBench explains why these dimensions matter): record startup_ms and test pass counts; treat integration failures as a hard stop. See https://huggingface.co/blog/ibm-research/scarfbench.

## First use case for a small team

ScarfBench is especially useful for a focused pilot. See https://huggingface.co/blog/ibm-research/scarfbench.

Concrete, actionable plan for solo founders or very small teams (1–3 people):

1) Prioritize the smallest, self-contained task and automate tests first.
   - Pick the smallest service in the corpus, confirm it has baseline unit + smoke tests, and get a passing baseline before running any agent. This reduces investigation cost when something breaks. See https://huggingface.co/blog/ibm-research/scarfbench.
2) Run a single agent variant in a time-boxed experiment and capture artifacts.
   - Limit the experiment to 1 run per day, save transformed source, build logs, and a results CSV per run. Use a container to make results reproducible across your laptop and CI. See https://huggingface.co/blog/ibm-research/scarfbench.
3) Enforce a minimal acceptance gate you can manually verify quickly.
   - Require build_success == true and smoke tests to pass before merging. If those pass, spot-check 2–3 critical unit tests and manually review diffs for risky changes.
4) Budget and cap usage: record tokens, runtime, and wall-clock time per run.
   - Track agent_calls_count, run_duration_ms, and an approximate cost so you can decide whether to expand the pilot. See https://huggingface.co/blog/ibm-research/scarfbench.
5) Iterate: if results are promising, automate the runner and introduce a second agent variant for A/B comparison.

Roles (small-team mapping):

- Solo founder/Engineer: run experiments, capture artifacts, and perform initial acceptance checks.
- Optional reviewer (peer or contractor): quick manual diff and smoke-test confirmation before promotion.
- CI owner (if present): enforce gates in pipeline.

Operational tips: keep experiments small (1 task), keep gate criteria strict enough to avoid needless merges, and archive per-run artifacts for audit and comparison. See https://huggingface.co/blog/ibm-research/scarfbench.

## Technical notes (optional)

Scope: ScarfBench evaluates cross-framework migration for Enterprise Java (Spring, Jakarta EE, Quarkus) and emphasizes behavior and runtime checks (three axes). See https://huggingface.co/blog/ibm-research/scarfbench.

Suggested run metrics to record for analysis: build_success, unit_pass_pct, integration_pass_pct, startup_ms, dependency_errors_count, run_duration_ms, agent_calls_count.

Example CSV header for recorded metrics:

```csv
task_id,agent,build_success,unit_pass_pct,integration_pass_pct,startup_ms,dependency_errors_count,run_duration_ms
```

Artifact management: store per-run diffs, logs, and config snapshots so each result maps back to inputs for reproducibility. See https://huggingface.co/blog/ibm-research/scarfbench.

## What to do next (production checklist)

### Assumptions / Hypotheses

- ScarfBench provides self-contained application tasks that emphasize preserving behavior, adapting build files, and resolving runtime dependencies across Spring, Jakarta EE, and Quarkus (source: https://huggingface.co/blog/ibm-research/scarfbench).
- Use the ScarfBench framing (behavior, build, runtime) as your initial evaluation axes. See https://huggingface.co/blog/ibm-research/scarfbench.
- Example numeric thresholds and run parameters below are team-defined; they are proposed starting points and must be measured and adjusted during the pilot:
  - agent timeout: 60 minutes (3600 seconds)
  - max_tokens per agent call: 8192
  - required_unit_pass_pct: 95%
  - required_build_success_rate: 99%
  - use 1C equivalent for reproducible multi-threaded Maven runs
  - initial pilot size: 1 task, 2 agent variants, 2 engineers (or 1 solo + 1 reviewer)
  - treat dependency_errors_count > 0 as a hold state

### Risks / Mitigations

- Risk: agent edits that change semantics (hallucination).
  - Mitigation: block auto-promotion until build_success == true and integration tests pass; include a manual diff review for risky APIs.
- Risk: unresolved runtime dependencies after migration.
  - Mitigation: run containerized runtime smoke tests and treat dependency_errors_count > 0 as a block.
- Risk: uncontrolled cost from hosted LLM calls.
  - Mitigation: cap max_tokens per call, time-box experiments (e.g., 60 minutes), and track per-run token usage.
- Risk: production regressions after promotion.
  - Mitigation: canary deploy and monitor error-rate or latency thresholds for a short observation window.

### Next steps

- Integrate the ScarfBench runner into CI and enforce migration gates such as build_success == true AND unit_pass_pct ≥ your accepted threshold. See https://huggingface.co/blog/ibm-research/scarfbench.
- Archive diffs, run configs, and results CSVs for audit and agent comparison.
- Scale by adding more tasks from the ScarfBench corpus and comparing agent variants; prioritize tasks that reveal dependency and runtime patterns.

Final pointer: read the ScarfBench article and linked resources for benchmark framing and corpus details: https://huggingface.co/blog/ibm-research/scarfbench.
