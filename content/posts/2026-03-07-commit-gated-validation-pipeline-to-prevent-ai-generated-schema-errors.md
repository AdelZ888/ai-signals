---
title: "Commit-gated validation pipeline to prevent AI-generated schema errors"
date: "2026-03-07"
excerpt: "A commit-gated pipeline (Prompt→LLM→Validation→Normalizer→Retry→Commit) keeps AI-generated structured files off disk until they pass schema checks, revealing schema gaps."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-07-commit-gated-validation-pipeline-to-prevent-ai-generated-schema-errors.jpg"
region: "US"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "validation"
  - "LLM"
  - "schema"
  - "pipeline"
  - "CI"
  - "devops"
  - "data-quality"
  - "automation"
sources:
  - "https://news.ycombinator.com/item?id=47276142"
---

## TL;DR in plain English

- Pattern: Prompt → LLM (large language model) → Validation Engine → Error Normalizer → Retry Controller → Commit Gate → File. See the original thread: https://news.ycombinator.com/item?id=47276142
- Goal: stop AI-generated structured files from touching disk unless they match your schema. This avoids downstream breakage like empty Dataview queries or CI (continuous integration) failures. Source: https://news.ycombinator.com/item?id=47276142
- Quick plan: set up a minimal pipeline in ~3 hours, run a 100-file pilot, and enforce max_attempts_per_field = 2 so repeated identical errors abort and reveal schema boundaries. Reference: https://news.ycombinator.com/item?id=47276142

Checklist (quick):
- [ ] Install the CLI and confirm git pre-commit hooks run locally (commands below).
- [ ] Add akf.yaml taxonomy to your repo and commit schema.json.
- [ ] Run a pilot of 100 files; target validation pass-rate ≥ 95% (fail-rate ≤ 5%).

Concrete signals to track: pass-rate ≥ 95%, abort-count ≤ 5/day, and aim for test coverage near 91% (reported in the reference repo): https://news.ycombinator.com/item?id=47276142

Plain-language explanation before advanced details

This pipeline treats the LLM as the only unpredictable part. Everything after the LLM is a deterministic check-and-repair loop. If the generated file fails schema checks, the pipeline converts the failure into instructions and asks the LLM to try again. If the same field fails for the same reason twice, the system aborts and requires a human review. This prevents bad files from being written and surfaces cases where the schema itself needs to change. See discussion and examples here: https://news.ycombinator.com/item?id=47276142

Example (short scenario): a docs team asks an LLM to write 100 runbooks. Without checks, some files use wrong enum values or dates in the wrong format and later break a search index. With the pipeline, failing files never commit. The system retries fixes once per field and aborts if the same error repeats, so the team finds schema gaps quickly. Reference: https://news.ycombinator.com/item?id=47276142

## What you will build and why it helps

You will build a commit-gated validation pipeline that inspects AI-generated structured files before they are written. The LLM is the only nondeterministic component. Validation, normalization, retry logic, and the commit gate are deterministic and testable.

Why this helps:
- Prevents downstream failures (broken queries, CI failures, corrupted indexes).
- Keeps a clear, auditable record of errors and repairs.
- Lets you change the taxonomy (akf.yaml) without redeploying code.

What it catches (canonical error codes from the reference):
- E001: wrong enum values
- E002: missing required fields
- E003: bad date formats
- E004: type mismatches (e.g., tags as a string vs tags as an array)
- E006: domain values outside your taxonomy

These codes and the overall pattern are described in the original thread: https://news.ycombinator.com/item?id=47276142

Immediate benefits to measure: fewer manual fixes, clearer audit trails for retries, and faster discovery of schema problems. The referenced project reports 560 tests and ~91% coverage; use that as a quality benchmark: https://news.ycombinator.com/item?id=47276142

## Before you start (time, cost, prerequisites)

- Estimated time: ~3 hours (≈180 minutes) for a minimal working pipeline and initial tests. Source: https://news.ycombinator.com/item?id=47276142
- Pilot size: 100 files is a useful early batch.
- Team example: a 3-person docs team or a solo founder can run the pilot.
- Software prerequisites: Git repo, Python 3.9+, pip, and an LLM provider. The reference lists compatibility with Claude, GPT-4, Gemini, and Ollama: https://news.ycombinator.com/item?id=47276142
- Tests/coverage benchmark: the referenced repo lists 560 tests and ~91% coverage; use that as an aspirational target while you iterate: https://news.ycombinator.com/item?id=47276142
- Cost note: LLM costs vary by provider and token usage. Start with 100 files to measure spend before broader rollout.

Minimum local checklist before implementation:
- [ ] Git repo initialized and a pilot branch created
- [ ] schema.json committed
- [ ] akf.yaml taxonomy committed
- [ ] API keys stored in a secrets manager (not in repo)

Example akf.yaml snippet (external taxonomy so you can edit without redeploy):

```yaml
# akf.yaml
enums:
  domain: [ai-system, api-design, devops, security]
  level: [beginner, intermediate, advanced]
  status: [draft, active, completed, archived]
```

Reference for the external taxonomy approach: https://news.ycombinator.com/item?id=47276142

## Step-by-step setup and implementation

Each step maps to a concrete artifact you can copy and adapt. Keep max_attempts_per_field = 2 to surface schema boundary issues quickly.

1. Define and commit a formal JSON Schema (schema.json) for your structured files.
2. Add an external taxonomy file akf.yaml to the repo. This decouples enums from code: https://news.ycombinator.com/item?id=47276142
3. Install the reference CLI and run basic commands.

```bash
# Install and smoke-test the CLI referenced in the thread
pip install ai-knowledge-filler
# Example commands (reference):
akf generate "Write a guide on Docker networking"
akf validate ./vault/
```

4. Implement a Validation Engine that runs schema checks and maps failures to canonical error codes E001–E006. Keep mapping rules in validation_config.yaml for auditability.
5. Implement an Error Normalizer that converts schema errors into repair prompts. Store mappings in error_normalizer.yml so prompts and fixes are auditable.
6. Implement a Retry Controller. Example settings below:

```yaml
# retry_policy.yaml
max_attempts_per_field: 2
abort_on_repeat: true
backoff_ms: 250
track_window_seconds: 600
```

7. Wire the Commit Gate. Use a git pre-commit hook or a CI job that blocks commits/merges when validation fails. Example pre-commit hook:

```bash
#!/bin/sh
# .git/hooks/pre-commit
python -m akf.validate ./vault/ || {
  echo "Validation failed: commit blocked" && exit 1
}
```

8. Add tests and metrics. Create unit tests for each validation rule and at least one integration test for generate → validate → commit. Aim for high coverage; the reference lists 560 tests and 91% coverage: https://news.ycombinator.com/item?id=47276142
9. Dry run and thresholds: run 100 generated files through the pipeline. Target validation pass-rate ≥ 95% and fail-rate ≤ 5%. If abort-rate or retries are high, tune prompts or schema.

Rollout plan (example thresholds):
- Canary: 1 canary repo for 7 days.
- Feature flag window: 24–72 hours before full enforcement.
- Rollback criteria example: user-reported breakages > 10 in first week or abort_count > 5/day.

## Common problems and quick fixes

The items below are motivated by the error taxonomy and behavior in the referenced design: https://news.ycombinator.com/item?id=47276142

- Under-specified prompts → symptom: many E001/E006 enum errors. Fix: include explicit enum lists and examples in prompts.
- Retry oscillation → symptom: Retry Controller loops without making progress. Fix: keep max_attempts_per_field = 2 and abort on repeat to reveal schema gaps.
- Taxonomy drift → symptom: sudden spike in E006 errors. Fix: update akf.yaml and require owner review for changes.
- Date parsing issues (E003) → canonicalize date formats in the normalizer or add a stricter format rule in schema.json.

Quick debugging checklist:
1. Reproduce with a single failing file.
2. Run akf validate ./path and capture the Error Normalizer output.
3. Test a single manual LLM correction using the normalized prompt.
4. If repeat errors occur, open an abort ticket to review schema boundaries.

Common error codes and canonical actions

| Error | Symptom | Primary action | On repeat |
|---:|---|---|---|
| E001 | Wrong enum | Send normalized prompt to LLM to re-generate field | Abort after 2 repeats |
| E002 | Missing required field | Prompt LLM to fill the field with examples | Abort after 2 repeats |
| E003 | Bad date format | Normalize date format in error normalizer | Abort if unchanged |
| E004 | Type mismatch (tags) | Convert to array in normalizer or ask LLM | Abort after 2 repeats |
| E006 | Domain outside taxonomy | Flag taxonomy edit (akf.yaml) | Do not retry — update taxonomy |

## First use case for a small team

Scenario: a 3-person docs team generates 100 internal runbooks with LLM assistance. The pipeline prevents broken Dataview queries and a corrupted search index by enforcing schema checks before writes. See the original design notes: https://news.ycombinator.com/item?id=47276142

Pilot steps:
1. Owner A commits schema.json and akf.yaml to a canary branch.
2. Owner B installs the CLI and hooks the pre-commit script locally.
3. Owner C generates 100 files and runs validation. Track: validation pass-rate, retry counts, and aborts/day.

Acceptance criteria for the pilot: pass-rate ≥ 95% and abort-count ≤ 5/day.

Roles and responsibilities:
- Taxonomy owner: edits akf.yaml and approves enum changes.
- Schema owner: edits schema.json and coordinates schema evolution.
- Reviewer: handles abort cases and decides when to update schema or taxonomy.

Solo-founder tip: use a local model (for example, Ollama) and the CLI to iterate with low token spend before moving to a cloud LLM. Reference: https://news.ycombinator.com/item?id=47276142

## Technical notes (optional)

- The pattern treats the LLM as the single non-deterministic component; validation, normalization, retry, and commit gating are pure functions you can unit-test deterministically. See design notes: https://news.ycombinator.com/item?id=47276142
- Interfaces supported in the reference: CLI, Python API, REST (FastAPI). Use pre-commit for local enforcement and CI for server-side gating.
- Observability: emit validation_fail_rate, retry_count, and abort_count. Example alert: abort_count > 5/day triggers immediate review.

Example FastAPI endpoint (simplified):

```python
# app.py
from fastapi import FastAPI
app = FastAPI()

@app.post('/generate-and-validate')
def generate_and_validate(payload: dict):
    # call LLM -> validate -> normalize -> retry controller -> return or error
    return {"status": "ok"}
```

Methodology note: this document maps the reference's architecture, error codes, and taxonomy approach to a practical checklist and examples: https://news.ycombinator.com/item?id=47276142

## What to do next (production checklist)

### Assumptions / Hypotheses

- The LLM will remain the only non-deterministic component; other components can be deterministic and tested. Reference: https://news.ycombinator.com/item?id=47276142
- The taxonomy (akf.yaml) will be edited more often than code and should be editable without redeploys.
- Retry policy of max_attempts_per_field = 2 will surface schema boundary problems instead of silently looping.

### Risks / Mitigations

- Risk: excessive aborts flood the team. Mitigation: set an abort_count alert threshold (example: 5/day) and a rollback feature flag.
- Risk: token cost spikes during retries. Mitigation: pilot with 100 files and measure token usage before wider rollout (token cost is environment-dependent).
- Risk: bad taxonomy edits cause E006 spikes. Mitigation: require owner sign-off and an audit log for akf.yaml changes.

### Next steps

- Add CI enforcement: create a CI job that runs akf validate on PRs and fails the build on validation failures.
- Instrument metrics: track validation pass-rate, retry counts, abort counts; target pass-rate ≥ 95% before wide rollout.
- Governance: create a taxonomy change approval flow and require a 24-hour review window for akf.yaml edits.
- Rollout: start with 1 canary repo for 7 days. Expand only if abort_count ≤ 5/day and fail-rate ≤ 5%.

Reference and original design notes: https://news.ycombinator.com/item?id=47276142
