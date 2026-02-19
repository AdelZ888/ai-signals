---
title: "Run and Extend Drift: Live TUI Code‑Health Dashboard, Go AST Analysis and Copilot‑Driven Fixes"
date: "2026-02-19"
excerpt: "Step-by-step guide to install and run Drift's live terminal dashboard, inspect the Go AST analyzer, and test Copilot-driven interactive 'drift fix' suggestions and CI automation."
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "go"
  - "code-health"
  - "tui"
  - "github-copilot"
  - "devtools"
  - "observability"
  - "refactoring"
  - "github-actions"
sources:
  - "https://drift.marquis.codes/"
---

Tutorial: Build and Extend Drift — Real-time Code‑Health TUI with AI‑powered Fixes (Go)

Published 2026-02-19 — a concise, hands-on guide to install and run Drift, inspect the Go AST analyzer, wire a GitHub Copilot CLI agent, and add a CI step that surfaces health reports. All examples reference the project landing page: https://drift.marquis.codes/.

## Builder TL;DR

What you get: a live terminal dashboard (Bubble Tea + Lip Gloss) that monitors five health dimensions and shows trends over the last 10 commits. See the project site: https://drift.marquis.codes/.

Quick install checklist (one-line artifacts shown):

- Homebrew: brew install greatnessinabox/tap/drift (official installer shown on https://drift.marquis.codes/).
- Or build from source with go install (repo referenced from the site).

Quick run sequence (the project documents three main commands, zero config):

```bash
# 1) Install (Homebrew example)
brew install greatnessinabox/tap/drift

# 2) Run a baseline analysis
drift analyze

# 3) Monitor live TUI (example terminal size: 80x24)
drift monitor

# Optional interactive fix flow (Copilot CLI agent)
drift fix
copilot --agent drift-dev "suggest refactoring for Update()"
```

Core facts from the docs: the CLI auto-detects languages, exposes a live TUI with a 10-commit sparkline, and integrates with Copilot agents; source: https://drift.marquis.codes/.

Methodology note: claims here are grounded in the project snapshot at https://drift.marquis.codes/.

## Goal and expected outcome

Goal: run Drift locally, confirm a Health Score and 10-commit sparklines, and complete at least one interactive Copilot suggestion flow for review and PR creation. See https://drift.marquis.codes/.

Expected measurable artifacts:

- A running TUI showing a Health Score (example from the docs: 78/100) and 10-commit sparklines.
- At least one drift fix flow that surfaces Copilot suggestions (docs show "Found 3 issue(s) to fix" and a [HIGH] item with complexity: 25).
- Config artifact: .github/agents/drift-dev and a CI workflow YAML that runs drift analyze.

Deliverables checklist:

- [ ] TUI screenshot (80x24 example in the docs)
- [ ] A PR containing an applied, human-reviewed refactor
- [ ] .github/agents/drift-dev agent config
- [ ] A CI workflow that runs drift analyze

Reference: https://drift.marquis.codes/.

## Stack and prerequisites

Minimum tools (per the docs at https://drift.marquis.codes/):

- Homebrew or Go toolchain for installing/running drift (Homebrew example present).
- Git and access to your repository.
- GitHub Copilot CLI and a GitHub account (Copilot agent usage appears on the site).
- Optional: CI runner (GitHub Actions) for automation.

Supported languages (auto-detected per the docs): Go, TypeScript, Python, Rust, Java, Ruby, PHP, and C#; dependency checks query registries such as Go proxy, npm, PyPI, crates.io, Maven Central, RubyGems, Packagist, and NuGet. See https://drift.marquis.codes/.

Permissions: keep Copilot agent configs and any automation tokens in secrets; follow the project's guidance at https://drift.marquis.codes/.

## Step-by-step implementation

1) Clone & install

```bash
git clone https://github.com/greatnessinabox/drift.git
cd drift
# recommended quick install via Homebrew (documented on the site)
brew install greatnessinabox/tap/drift
```

Reference: install instructions on https://drift.marquis.codes/ ("Three commands. Zero config.").

2) Run a baseline analysis

```bash
# Full health analysis; the CLI auto-detects language
drift analyze
# Start the live TUI that updates as you code
drift monitor
```

Verify: the TUI shows a Health Score (example: 78/100) and the 10-commit sparklines documented on the site: https://drift.marquis.codes/.

3) Inspect the Go analyzer (go/ast)

- The docs state "Full AST analysis for Go"; use the repo's analyzer package and go/ast to trace function parsing and cyclomatic calculations (the docs show an example complexity of 25 on a function).

4) Enable Copilot interactive fixes

- Create .github/agents/drift-dev (use the example template from the repo).
- Authenticate the Copilot CLI per your GitHub account.
- Run drift fix and follow prompts. The docs include the sample command: copilot --agent drift-dev "suggest refactoring for Update()" and an interactive prompt "Apply this suggestion? [y/N/s]" — see https://drift.marquis.codes/.

5) Review and create PRs

- Treat Copilot suggestions as drafts: apply after human review. The docs show a flow where drift lists items such as "Found 3 issue(s) to fix".

6) CI automation and rollout plan

Example GitHub Action (illustrative YAML):

```yaml
name: drift-analyze
on: [push, pull_request]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install drift
        run: brew install greatnessinabox/tap/drift || true
      - name: Run drift analyze
        run: drift analyze --output json > drift-report.json
```

Rollout gates (recommended):

- Canary: start with 1 repo or 2–5 team members.
- Feature flags: keep auto-apply OFF by default.
- Human approval: require at least 1 reviewer before merge.
- Immediate rollback: disable the GitHub Action or remove the agent config to stop automated fixes.

See integration notes at https://drift.marquis.codes/.

## Reference architecture

The project site describes a compact component map: https://drift.marquis.codes/.

Key components

| Component | Role | Notes |
|---|---|---|
| CLI / TUI | Local monitoring and interactive fixes | Live TUI (example 80x24), 10-commit sparklines |
| Language analyzers | Produce metrics | Go: full AST; others: heuristics (TS/Py/Rs/Java/Rb/PHP/C#) |
| Copilot CLI agent | Suggest refactors | Invoked like: copilot --agent drift-dev "..." |
| CI integration | Run analyses in PRs | Action runners can emit JSON reports |

Metric weights (from the docs):

- Cyclomatic Complexity: 30%
- Dependency Freshness: 20%
- Architecture Boundaries: 20%
- Dead Code Detection: 15%

Data flow (text): file change → analyzer → metric store (rolling window = last 10 commits) → TUI sparklines. For fixes: analyzer extracts symbol → Copilot CLI subprocess → human review → PR. Source: https://drift.marquis.codes/.

## Founder lens: ROI and adoption path

Why adopt: Drift surfaces regressions (Health Score + sparklines) so teams spot degradations earlier; the docs give examples such as HEAD +12% improvement across 10 commits and a sample Health Score of 78/100. See https://drift.marquis.codes/.

Adoption path (phased):

1) Developer pilot: local install (3 commands, zero config). Monitor 1–2 repos.
2) Team opt-in: enable CI analyses and PR comments for selected repos.
3) Gated automation: allow Copilot suggestions to create PRs but require human approval.
4) Limited auto-apply: auto-apply trivial suggestions only; keep high-complexity items (example complexity >=25) manual.

ROI tracking: measure detection-to-PR time, Health Score trends, and PR count reduced by tooling. Example baseline figures from the docs: Score 78/100, HEAD +12%, 3 issues listed in a typical fix session.

Costs: maintain analyzer rules and agent configs; protect tokens and scopes. Guidance: https://drift.marquis.codes/.

## Failure modes and debugging

Reference the project's troubleshooting patterns at https://drift.marquis.codes/ when investigating failures.

1) Copilot CLI errors

- Symptom: drift fix fails or Copilot subprocess exits non-zero.
- Debug steps: capture subprocess logs and run the copilot command directly, for example:

```bash
copilot --agent drift-dev "suggest refactoring for Update()" > copilot.log 2>&1
# capture exit code
echo $? > copilot.exitcode
```

- Preserve drift-debug.log and copilot logs for triage. The docs show Copilot usage in the fix flow (https://drift.marquis.codes/).

2) Analyzer mismatches (heuristics)

- Symptom: false positives on non-Go languages (the docs state Go has full AST analysis; other languages are heuristic-based).
- Mitigations: exclude paths, tighten heuristics, or suppress rules in config; for Go, trace go/ast paths to validate computed cyclomatic numbers (example complexity: 25 appears in the docs). See https://drift.marquis.codes/.

3) Dependency registry failures

- Symptom: Dependency Freshness reports incorrect counts or stalls.
- Debug: confirm outbound access to npm/PyPI/crates.io/Maven Central; the docs show dependency checks against multiple registries and an example result of 42/42 up to date. See https://drift.marquis.codes/.

4) Stale TUI or lag

- Symptom: UI not reflecting recent commits or the 10-commit sparkline.
- Debug: confirm the monitor is active, verify the rolling window of 10 commits, and restart drift monitor if unresponsive. Reference: https://drift.marquis.codes/.

## Production checklist

### Assumptions / Hypotheses

- The guide assumes the Copilot CLI is available and authenticated for your account; Copilot agent usage examples appear on https://drift.marquis.codes/ but full auth flows are outside the snapshot.
- The CI YAML above is illustrative; converting drift JSON into PR comments requires repository tokens and additional comment logic not specified in the excerpt.
- Rollout thresholds such as "improve Health Score by +5 points in 3 commits" are operational hypotheses to validate in pilot and are not explicit in the snapshot.

### Risks / Mitigations

- Risk: automated suggestions applied without review. Mitigation: keep feature flag OFF, require 1+ reviewer, enforce PR gating.
- Risk: secret leakage (agent configs or tokens). Mitigation: store agent configs in secrets, restrict GITHUB_TOKEN scopes, rotate tokens regularly.
- Risk: noisy false positives from heuristic analyzers. Mitigation: opt-in canary repos, tune rules, and exclude large generated folders.

### Next steps

- Pilot on 1 repo and collect metrics across 10 commits (the project uses a 10-commit window).
- Create .github/agents/drift-dev and lock it behind a team-only secret.
- Instrument drift analyze JSON output and store artifacts for trending (example Health Score: 78/100, metric weights: 30%, 20%, 20%, 15%).
- Apply rollout gates: canary repo → team roll-out → org roll‑out with strict PR review and rollback plans (disable Action / remove agent config).

For the official documentation and quick reference, visit: https://drift.marquis.codes/.
