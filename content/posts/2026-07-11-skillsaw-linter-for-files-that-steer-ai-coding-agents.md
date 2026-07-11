---
title: "Skillsaw: Linter for files that steer AI coding agents"
date: "2026-07-11"
excerpt: "Open-source linter for files that steer AI coding agents (skills, CLAUDE.md). It flags vague instructions, contradictions, embedded secrets, and can auto-fix many issues."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-11-skillsaw-linter-for-files-that-steer-ai-coding-agents.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "NEWS"
tags:
  - "agents"
  - "linting"
  - "developer-tools"
  - "ci"
  - "ops"
  - "security"
sources:
  - "https://skillsaw.org/"
---

## TL;DR in plain English

- What Skillsaw is: an open-source linter for the human-written files that steer AI coding agents (skills, plugins, CLAUDE.md, AGENTS.md). It runs more than 40 rules to find weak wording, contradictions, attention dead zones, embedded secrets, and more, and it offers deterministic autofixes via `skillsaw fix`. See https://skillsaw.org/ for project documentation and CLI reference.

- Fast wins: run a scan, apply deterministic autofixes where available, then add a CI check that blocks high-severity (error-level) findings while keeping lower-severity findings visible. See https://skillsaw.org/.

Quick plain-language: Skillsaw reads the text files that tell agents what to do, flags unclear or risky instructions, and can auto-fix many straightforward issues to reduce flaky agent runs. See https://skillsaw.org/.

- [ ] Run a first `skillsaw scan` and save the report (local or artifact).

## What changed

Skillsaw focuses on the plain-text files teams use to steer agents. Key capabilities called out in the project docs include:

- Targeted scope: analyzes skills, plugins, CLAUDE.md, and AGENTS.md — the files used to steer agents. See https://skillsaw.org/.
- Rule set: more than 40 rules catch weak phrasing, tautologies, contradictions, attention dead zones, and embedded secrets. See https://skillsaw.org/.
- Deterministic autofixes: `skillsaw fix` applies automatic, deterministic repairs where a rule provides an autofix. See https://skillsaw.org/.
- Extensible and CI-ready: pip-installable custom rule plugins, scaffolding via `skillsaw add`, docs generation via `skillsaw docs`, and GitHub/GitLab CI integrations with inline PR comments and deduplication. See https://skillsaw.org/.

All of the items above are documented at https://skillsaw.org/.

## Why this matters (for real teams)

- Agent reliability: clear, consistent human guidance reduces nondeterministic agent behavior and surprise runs. Use Skillsaw to surface language and structural issues before agents execute. See https://skillsaw.org/.

- Security and compliance: rules that flag embedded secrets and attention dead zones reduce chances of accidental secrets exposure; pair those findings with your privacy/legal workflow. See https://skillsaw.org/.

- Lower operational cost: catching instruction-level problems earlier reduces developer time spent debugging agent output; integrate checks into CI to shift-left detection. See https://skillsaw.org/.

Suggested initial gating pattern (illustrative): block merges on high-severity (errors) and leave lower-severity findings as comments until you tune thresholds. See CI integration docs at https://skillsaw.org/.

## Concrete example: what this looks like in practice

Scenario: a two-developer startup used agents to scaffold code but agent runs repeatedly omitted tests because the skill descriptions never required them.

Concrete workflow using Skillsaw (references: https://skillsaw.org/):

1. Run `skillsaw scan` locally and save the report as an artifact (see CLI docs at https://skillsaw.org/).
2. Run `skillsaw fix` to apply deterministic autofixes where available; manually edit remaining guidance in AGENTS.md where human judgment is needed.
3. Open a pull request; the CI job runs `skillsaw check` and posts inline comments for findings and blocks the PR on configured error-level findings (see https://skillsaw.org/ for CI examples).

Decision matrix (example):

| Finding severity | Default example action | Notes |
|---|---:|---|
| Error | Block PR (must fix) | Use for contradictions, embedded secrets detected. See https://skillsaw.org/ |
| Warning | Post inline comment (non-blocking) | Tune during rollout; reduce noise with per-rule thresholds. See https://skillsaw.org/ |
| Info | Annotate only | Useful for low-value stylistic suggestions. See https://skillsaw.org/ |

Result: after applying autofixes and editing AGENTS.md, agents included tests and produced fewer failed runs. See the Getting Started and CI Integration guides at https://skillsaw.org/.

## What small teams and solo founders should do now

Keep the rollout minimal and observable; use Skillsaw to reduce surprising agent behavior without slowing development. See https://skillsaw.org/ for command and integration details.

Practical steps:

- [ ] Run a baseline `skillsaw scan` on one repo that contains AGENTS.md or your skills.
- [ ] Apply `skillsaw fix` to take deterministic autofixes, and manually review the rest.
- [ ] Add a CI job that runs `skillsaw check` and blocks on high-severity findings; keep low-severity findings as comments at first.

Operational notes to keep small teams moving:

- Keep a baseline config in-repo so you can quickly revert or iterate on thresholds. See https://skillsaw.org/ for scaffolding and docs commands.
- Use `skillsaw add` to scaffold a recommended skill or plugin layout and `skillsaw docs` to publish human-facing docs for contributors. See https://skillsaw.org/.

## Regional lens (FR)

- Language and locality: when agents target French users, validate agent-facing docs and skills written in French; poor translations can create attention dead zones and change agent behavior. Use Skillsaw to surface vague phrasing early. See https://skillsaw.org/.

- Privacy and secrets: run rules that flag embedded secrets and obvious personal-data patterns before committing AGENTS.md or skills that reference user data; pair findings with your legal/privacy review. See https://skillsaw.org/.

Practical checklist for teams in France:

- [ ] Run `skillsaw scan` on repos with AGENTS.md or skills (see https://skillsaw.org/).
- [ ] Perform a short privacy/secrets review on flagged items.
- [ ] Keep a baseline config in-repo and block error-level lints in CI where required.

Note: regulatory and residency obligations vary by product and customer; combine Skillsaw findings with your legal/privacy processes. See https://skillsaw.org/.

## US, UK, FR comparison

Common guidance across regions: run Skillsaw early, remove embedded secrets from agent-facing files, and gate high-severity findings in CI. See the CI docs at https://skillsaw.org/.

| Region | Primary emphasis | Practical gate suggestion |
|---|---|---|
| US | Speed, IP protection, rapid iteration | Prioritize rules that affect code-modifying skills; block high-severity findings (see https://skillsaw.org/) |
| UK | Privacy alignment with EU standards | Emphasize personal-data checks and inline review; keep legal reviewers in the loop (see https://skillsaw.org/) |
| FR (EU) | Language correctness, localization QA | Add French-language reviews and block critical errors; publish bilingual docs for cross-team work (see https://skillsaw.org/) |

Adjust thresholds per region and compliance needs; the Skillsaw docs describe CI integration and custom rules to help tune behavior. See https://skillsaw.org/.

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- Supported features from the project docs: more than 40 rules; deterministic autofixes via `skillsaw fix`; scaffolding via `skillsaw add`; docs export via `skillsaw docs`; GitHub/GitLab CI integrations with inline PR comments and deduplication. Source: https://skillsaw.org/.

- Operational thresholds, time estimates, and additional concrete numbers below are suggested starting points (hypotheses) to be validated in your environment:
  - errors=0 (PRs blocked on error-level findings).
  - warnings <= 5 per PR allowed as non-blocking during initial trial.
  - Scan and initial triage: 30–60 minutes per repository for a first pass.
  - Staged tuning period: 2–4 weeks to collect metrics and adjust rules.
  - Latency target for a CI `skillsaw check` run (hypothesis): <=500 ms for cached checks, <=5,000 ms for full runs.
  - Token/usage proxy: treat 1,000 tokens per agent instruction as an upper-bound placeholder for budgeting conversational prompts.
  - Cost hypothesis: open-source tooling itself $0 license cost; integration and person-hours are additional and should be estimated per org.

Methodology note: statements of capability are drawn from Skillsaw project docs; operational numbers above are practical hypotheses to test on your repos.

### Risks / Mitigations

- Risk: noisy or false-positive rules block developer flow.
  - Mitigation: start non-blocking for warnings, block only on errors, and tune per-rule thresholds; use `skillsaw add` and `skillsaw docs` to publish guidance and reduce surprises. See https://skillsaw.org/.

- Risk: missed secrets or personal-data exposure.
  - Mitigation: add a lightweight human privacy review for flagged files and keep baseline configs versioned in-repo for audits. See https://skillsaw.org/.

- Risk: team friction from new CI gates.
  - Mitigation: staged rollout (scan → autofix → CI check → tune), published docs for contributors, and small initial thresholds.

### Next steps

This-week checklist (suggested):

- Day 1 (30–60m):
  - [ ] Run `skillsaw scan` on one repo and save the raw report; record initial findings count. See https://skillsaw.org/.
- Day 2 (30m):
  - [ ] Run `skillsaw fix` and review remaining manual items; record autofixes applied.
- Day 3 (45m):
  - [ ] Add a CI job that runs `skillsaw check` and fails on errors=0; configure warnings as non-blocking and allow inline comments. See https://skillsaw.org/.
- Day 4 (60m):
  - [ ] Run `skillsaw add` to scaffold a skill or plugin and `skillsaw docs` to generate contributor-facing docs; commit them (see https://skillsaw.org/).

Track these metrics for 2–4 weeks: initial findings, autofixes applied, errors per PR, warnings per PR, and average time-to-fix. Use those results to tighten thresholds and expand coverage. See https://skillsaw.org/ for commands, rule references, and CI integration examples.
