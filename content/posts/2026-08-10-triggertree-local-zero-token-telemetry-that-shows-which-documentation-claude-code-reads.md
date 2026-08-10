---
title: "trigger_tree — Local, zero-token telemetry that shows which documentation Claude Code reads"
date: "2026-08-10"
excerpt: "Add trigger_tree to your repo to collect per-run, local (zero-token) telemetry. Produce heat/cold maps, a numeric health grade, and evidence to guide doc or router fixes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-10-triggertree-local-zero-token-telemetry-that-shows-which-documentation-claude-code-reads.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "trigger_tree"
  - "telemetry"
  - "documentation-discovery"
  - "Claude Code"
  - "github-actions"
  - "heatmaps"
  - "health-grade"
  - "local-first"
sources:
  - "https://github.com/Hedde/trigger_tree"
---

## TL;DR in plain English

trigger_tree is a local telemetry tool for Claude Code. It shows which documentation files an agent actually reads. The project advertises heat/cold maps, a numeric health grade, and evidence-backed router fixes, and it is described as running 100% locally with zero tokens: https://github.com/Hedde/trigger_tree.

What to do now, short list:
- Add a CI workflow that runs trigger_tree on a private test branch. See the repo for intent and examples: https://github.com/Hedde/trigger_tree.
- Upload only reviewer-friendly artifacts (heatmap image, health grade, summaries).
- Make one small, reversible router or doc change. Re-run and compare evidence.

Quick rollout checklist (example):
- [ ] Add workflow to a test branch
- [ ] Run a smoke session and collect artifacts
- [ ] Inspect heatmap and health output
- [ ] Apply one small change and re-run

(Methodology note: examples below are implementation suggestions. Concrete gates and numeric thresholds live in the Assumptions / Hypotheses section.)

## What you will build and why it helps

You will add per-run telemetry so each Claude Code session produces diagnostic output. The collected outputs make file-access behavior visible for each run. The trigger_tree project describes heat/cold maps, a health grade, and evidence-backed router fixes; it is intended for local-first use and zero-token operation: https://github.com/Hedde/trigger_tree.

Why this helps:
- Replace guesswork with per-run evidence about which files an agent read. (Repo intent: heat/cold maps and run-level summaries.)
- Make small, auditable changes. Use one run's evidence to justify a targeted router tweak or a short doc move.
- Measure impact. Re-run and compare the same run-level outputs to see whether attention changed.

Keep decisions small and reversible. See the project page for intent and examples: https://github.com/Hedde/trigger_tree.

## Before you start (time, cost, prerequisites)

Prerequisites (minimal):
- A repository where you can add a CI workflow and upload artifacts.
- Permission to run GitHub Actions or another CI runner that can run local tooling.
- A disposable test branch so you do not apply experimental changes to main.

Practical notes:
- The project advertises a 100% local, zero-tokens approach; review the repo for its design intent: https://github.com/Hedde/trigger_tree.
- Keep raw evidence out of the main tree. Upload only reviewed summaries to shared storage.

See the repo for usage context and intent: https://github.com/Hedde/trigger_tree.

## Step-by-step setup and implementation

Follow this pattern and adapt paths and names to your repo. These are example steps; consult the repo for intent and any provided examples: https://github.com/Hedde/trigger_tree.

1) Pick an outputs directory
- Keep raw evidence off the repository root. Use a CI artifact directory such as diagnostics/trigger_tree and upload artifacts from CI.

2) Add a GitHub Actions workflow (example)

```yaml
name: trigger_tree diagnostics
on:
  push:
    branches: [ test-trigger-tree ]
  workflow_dispatch: {}

jobs:
  trigger_tree_run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run trigger_tree (example)
        run: |
          mkdir -p diagnostics/trigger_tree
          # Example: run a local diagnostic tool that writes summaries
          ./tools/trigger_tree --output diagnostics/trigger_tree
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: trigger_tree-diagnostics
          path: diagnostics/trigger_tree
          retention-days: 14
```

3) Example commands to trigger a smoke run

```bash
git checkout -b test-trigger-tree
git add .github/workflows/trigger_tree.yml
git commit -m "Add trigger_tree diagnostics workflow"
git push --set-upstream origin test-trigger-tree
# Trigger run via GitHub or workflow_dispatch
```

4) Produce a reviewer-oriented decision CSV (example layout)

| file_path | read_count | suggested_action |
|---|---:|---|
| docs/guide.md | 18 | promote_to_index |
| CONTRIBUTING.md | 2 | deprioritize |

Save a decision-table.csv into diagnostics/trigger_tree when generating run summaries. That CSV helps reviewers pick one small, reversible change.

5) Inspect and act
- Download CI artifacts, open the heatmap image and the numeric health output, and review per-run evidence bundles that point to run IDs and file paths. Make one small change and re-run.

6) Canary and iterate
- Apply changes behind a small canary and compare subsequent runs before making a broad change. For design intent and local-first operation see: https://github.com/Hedde/trigger_tree.

## Common problems and quick fixes

- No outputs produced
  - Check CI logs for the trigger_tree step. Verify binary path and step exit code.
- Heatmap shows everything cold
  - Confirm the agent session actually requested docs in that run. Reproduce with a synthetic query that targets a known file to get traces.
- Evidence references unexpected files
  - Normalize repo paths in CI (strip symlinks and set a consistent repo root) before summarizing.
- Privacy concerns about raw evidence
  - Do not commit raw evidence. Keep it in restricted artifact storage and share only reviewed summaries.

For implementation intent and examples, consult the project repo: https://github.com/Hedde/trigger_tree.

## First use case for a small team

Goal: confirm whether a Claude Code agent reads README and API docs during triage, then make one small, reversible change. See project intent here: https://github.com/Hedde/trigger_tree.

Actionable steps for a small team or solo founder:
1) Add the workflow on a private test branch, run one CI job, and download artifacts. One iteration gives run-level evidence.
2) Focus on one signal and one change: pick one file (e.g., README) and one small action (router priority tweak or moving a short doc into an index). Use the run evidence to justify the single change.
3) Short feedback loop: re-run and compare outputs. If attention on the file does not increase, revert and try a different minimal change.

Checklist for small teams:
- [ ] Add workflow on a private test branch
- [ ] Run one smoke session and collect artifacts
- [ ] Inspect heatmap and run evidence for the chosen file
- [ ] Apply one small router or doc change and re-run

Refer to the repo for project descriptions and intent: https://github.com/Hedde/trigger_tree.

## Technical notes (optional)

Plain-language summary of project intent:
- trigger_tree records which files an agent reads and summarizes that evidence.
- The project advertises heat/cold maps (visual), a numeric health grade, and suggested router fixes.
- The repo description emphasizes local-first operation and zero tokens: https://github.com/Hedde/trigger_tree.

Example thresholds file (illustrative placeholder — move concrete numeric gates to Assumptions / Hypotheses):

```yaml
# thresholds.yaml (example placeholders)
health_grade_min: 60
min_runs: 3
cold_threshold_reads: 5
promote_reads: 20
```

Keep thresholds in a single file so CI can fail or gate merges automatically based on telemetry outputs.

See the repository for the project's intent and discovery telemetry description: https://github.com/Hedde/trigger_tree.

## What to do next (production checklist)

### Assumptions / Hypotheses

The numeric gates and timing below are operational suggestions for rollout. They are proposed patterns to use as starting points (not direct quotes from the repo). See https://github.com/Hedde/trigger_tree for the project's local-first claims.

- Initial install + first run estimate: 60 minutes.
- Example repo size used for the estimate: 100 files.
- Recommended confirming runs before trusting a change: 3 runs.
- Read-count threshold for "cold": <5 reads.
- Promote threshold (indicates effective attention): >=20 reads.
- Minimum docs-coverage threshold for a docs audit: 30%.
- Canary fraction for router changes: 10% of traffic/sessions.
- Artifact retention for raw evidence (example): 14 days.
- Target job runtime for cost control: <300 s (5 minutes).
- Example health_grade gate to consider stable: >=60.
- Improvement threshold to expand rollout: >=10 points increase in health_grade.
- Target rollback window on regressions: <5 minutes to start rollback procedure.

### Risks / Mitigations

- Risk: Sensitive content appears in artifacts.
  - Mitigation: Do not commit raw evidence. Upload only summarized artifacts (heatmap image, numeric health output) to restricted storage.
- Risk: CI minutes and storage costs increase.
  - Mitigation: Run only on test branches, set short artifact retention (e.g., 14 days), and optimize jobs to hit the target runtime (e.g., <300 s).
- Risk: Overfitting to synthetic queries or false-positive router fixes.
  - Mitigation: Apply fixes behind feature flags and canary to a small fraction (e.g., 10%), require multiple confirming runs (e.g., 3) before wider rollout, and monitor health_grade.

### Next steps

- Add the trigger_tree workflow to a private test branch and push the commit; see project page: https://github.com/Hedde/trigger_tree.
- Run the configured number of sessions and collect artifacts (heatmap image, health output, decision-table.csv).
- Review evidence and make one small, reversible router or doc change.
- Canary the change at the proposed fraction and monitor health outputs for the proposed number of runs.
- If health improves by the target amount, expand rollout; otherwise rollback within the target window and iterate.

Resources:
- trigger_tree: https://github.com/Hedde/trigger_tree
