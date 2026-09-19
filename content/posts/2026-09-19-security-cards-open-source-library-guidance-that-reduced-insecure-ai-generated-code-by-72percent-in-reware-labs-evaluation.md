---
title: "Security Cards: open-source library guidance that reduced insecure AI-generated code by 72% in Reware Labs' evaluation"
date: "2026-09-19"
excerpt: "Open-source Security Cards give AI coding agents short, library-specific security guidance for 80+ libraries (13 languages). Reware Labs found up to 72.3% fewer insecure outputs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-19-security-cards-open-source-library-guidance-that-reduced-insecure-ai-generated-code-by-72percent-in-reware-labs-evaluation.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "security"
  - "ai-agents"
  - "developer-tools"
  - "open-source"
  - "devsecops"
  - "code-generation"
sources:
  - "https://www.rewarelabs.com/blog/introducing-security-cards/"
---

## TL;DR in plain English

- Security Cards are short, library-specific security guidance for AI coding agents. See the announcement: https://www.rewarelabs.com/blog/introducing-security-cards/
- They are open-source and cover 80+ libraries across 13 programming languages, per the announcement: https://www.rewarelabs.com/blog/introducing-security-cards/
- AI-generated code often contains vulnerabilities. The announcement cites a typical baseline of about 40–50% of samples containing at least one vulnerability: https://www.rewarelabs.com/blog/introducing-security-cards/
- Reware Labs reports that using Security Cards reduced insecure code generation by up to 72.3% in their evaluation with Claude Code (Opus 4.7): https://www.rewarelabs.com/blog/introducing-security-cards/
- Quick first step: install the Security Cards skill and compare outputs before and after. The blog shows an install example: https://www.rewarelabs.com/blog/introducing-security-cards/

## What you will build and why it helps

You will add a small, targeted guidance layer to your AI coding agent. That layer contains short, library- and framework-specific notes the agent can use while writing code. The guidance reduces mistakes tied to implementation details.

Why it helps (short):

- Models often write functionally correct code but miss library-specific security details. Security Cards supply that context to the agent: https://www.rewarelabs.com/blog/introducing-security-cards/
- The announcement reports a measured reduction in insecure outputs when cards are used: https://www.rewarelabs.com/blog/introducing-security-cards/

Concrete pilot output (what you should measure):

- Baseline insecure count and severity for a set of generated snippets.
- Post-change insecure count after enabling the relevant Security Card(s).

Reference: https://www.rewarelabs.com/blog/introducing-security-cards/

## Before you start (time, cost, prerequisites)

Read the announcement and the repository linked from the blog: https://www.rewarelabs.com/blog/introducing-security-cards/

Prerequisites:

- Access to the AI agent runtime where you can add a skill or inject prompt text. The announcement describes installing a skill to guide agents: https://www.rewarelabs.com/blog/introducing-security-cards/
- A target codebase or module that uses one or more libraries covered by the cards (80+ libraries, 13 languages): https://www.rewarelabs.com/blog/introducing-security-cards/
- A way to check generated code for vulnerabilities (SAST, unit tests, or manual review).

Quick checklist before you begin:

- [ ] Read the Security Cards announcement and repo: https://www.rewarelabs.com/blog/introducing-security-cards/
- [ ] Confirm you can install a skill or inject prompt context in your agent
- [ ] Pick one repository or module for an isolated trial

Reference: https://www.rewarelabs.com/blog/introducing-security-cards/

## Step-by-step setup and implementation

Overview: install the Security Cards skill, ensure the agent receives the cards in prompt context, and run a controlled before/after comparison on the same prompts.

1) Install the Security Cards skill

```bash
# install the Security Cards skill (from the announcement)
npx skills add Reware-Labs/securitycards --skill securitycards -g
```

Source: https://www.rewarelabs.com/blog/introducing-security-cards/

2) Configure your agent to inject the card guidance

Place the skill where your agent will include it in the request payload. The announcement explains that the skill guides agents on how to use the cards: https://www.rewarelabs.com/blog/introducing-security-cards/

Example agent config (adapt to your platform):

```yaml
agent:
  name: my-code-agent
  skills:
    - name: securitycards
      source: Reware-Labs/securitycards
      enabled: true
  skill_injection: prepend
  verbosity: info
```

3) Run a controlled comparison

- Use identical prompts for both runs: first without cards, then with cards enabled.
- Apply the same vulnerability checks and record counts and severity.
- Report both absolute counts and percentage change.

Quick comparison table (use these columns to report results):

| Metric | Baseline (no cards) | With Security Cards | Notes |
|---|---:|---:|---|
| Sample count | 20 | 20 | same prompts in both runs |
| Insecure samples | 8 (40%) | 2 (10%) | example numbers tied to reported ranges; cite: https://www.rewarelabs.com/blog/introducing-security-cards/ |
| Relative change | — | 72.3% reduction reported (example) | reported for Claude Code (Opus 4.7): https://www.rewarelabs.com/blog/introducing-security-cards/ |

Note: the table shows a reporting format. Use your measured counts; the announcement provides the coverage and the reported reduction: https://www.rewarelabs.com/blog/introducing-security-cards/

4) Rollout pattern (minimal)

- Start with a local dev or canary injection. If results are positive, add a CI job that runs the agent with Security Cards for PRs touching supported libraries.

Example feature-flag commands (replace with your tooling):

```bash
# example commands (tooling-specific)
feature-flag enable securitycards --env=canary
feature-flag disable securitycards --env=canary
```

Reference: https://www.rewarelabs.com/blog/introducing-security-cards/

## Common problems and quick fixes

Problem: the agent ignores the cards or you see no behavioral change.

- Confirm the skill text is present in the agent request payload and logs. The announcement describes a skill that supplies guidance: https://www.rewarelabs.com/blog/introducing-security-cards/
- Try different injection strategies (prepend vs append vs explicit reference).

Problem: guidance mismatches your library version.

- Pin the library version in your workspace. If the card is missing or stale, open an issue or PR in the Security Cards repo: https://www.rewarelabs.com/blog/introducing-security-cards/

Problem: insecure patterns persist after adding cards.

- Add unit tests or SAST checks that fail CI for the recurring pattern.

Quick fixes checklist:

- [ ] Confirm the skill appears in agent logs and request payloads
- [ ] Try prepend/append injection styles
- [ ] Pin the library version in your environment
- [ ] Add a failing test that detects the insecure pattern
- [ ] File an issue or PR on the Security Cards repo if guidance is missing: https://www.rewarelabs.com/blog/introducing-security-cards/

Reference: https://www.rewarelabs.com/blog/introducing-security-cards/

## First use case for a small team

This plan suits solo founders and very small teams (1–3 people). Keep steps reversible and focused on measurable outcomes. The announcement and repo are primary sources: https://www.rewarelabs.com/blog/introducing-security-cards/

Actionable plan

1) Pick one high-impact repo or module

Choose a repository where insecure generated code would cause real harm (authentication, input parsing, file handling). The cards cover many common libraries: https://www.rewarelabs.com/blog/introducing-security-cards/

2) Run a short before/after check

- Generate the same prompts twice: without cards, then with cards enabled. Use your usual checks (SAST, unit tests, or manual review). Count pass/fail and severity.

3) Keep changes minimal and reversible

- Add the Security Cards skill to a local dev environment or gate it with a single feature flag. Keep a one-line rollback step in your README.

4) Automate a single guard

- If you see a repeated insecure pattern, add a lint rule or unit test to block merges while you evaluate cards further.

5) Contribute back

- If a card is missing for a library or version, open an issue or PR in the repo: https://www.rewarelabs.com/blog/introducing-security-cards/

Reference: https://www.rewarelabs.com/blog/introducing-security-cards/

## Technical notes (optional)

Key points from the announcement:

- Coverage: 80+ widely used libraries across 13 programming languages: https://www.rewarelabs.com/blog/introducing-security-cards/
- Measured effect: the announcement reports up to a 72.3% reduction in insecure code generation in their evaluation with Claude Code (Opus 4.7): https://www.rewarelabs.com/blog/introducing-security-cards/
- Baseline context: multiple studies and the announcement indicate roughly 40–50% of AI-generated samples contain at least one vulnerability, depending on scenario and model: https://www.rewarelabs.com/blog/introducing-security-cards/

Methodology note: always run the same prompts and checks before and after. Report both absolute counts and relative percentage change. See the announcement for links to the repository and install examples: https://www.rewarelabs.com/blog/introducing-security-cards/

## What to do next (production checklist)

Follow the announcement and the repository for source material and contribution guidance: https://www.rewarelabs.com/blog/introducing-security-cards/

- [ ] Install the Security Cards skill locally and run a smoke test
- [ ] Run a before/after comparison and record absolute counts and percentage change
- [ ] Decide a rollout path (local canary or CI job) and a success metric
- [ ] Add minimal failing tests for recurring insecure patterns
- [ ] File issues or PRs for missing or incorrect cards: https://www.rewarelabs.com/blog/introducing-security-cards/

### Assumptions / Hypotheses

- Security Cards are open-source and installable as described in the announcement and repository: https://www.rewarelabs.com/blog/introducing-security-cards/
- Reported baseline insecure rates in related studies and the announcement are roughly 40–50% of generated samples containing at least one vulnerability.
- Reware Labs reported up to a 72.3% reduction in insecure generation for Claude Code (Opus 4.7) when cards were used: https://www.rewarelabs.com/blog/introducing-security-cards/
- Suggested trial sizes and operational thresholds (examples you can use if you have no internal baseline):
  - Run 5–15 prompts for a quick sanity check.
  - Run 20–50 prompts for a small pilot comparison.
  - Allow 30–60 minutes for an initial smoke test and one 8-hour pilot day for CI integration.
  - Use a canary on ~5% of PRs or a single-repo canary for rollout.
  - Aim for >=30% relative reduction as an internal success threshold.
  - Watch token costs and plan limits per your provider (tokens and $ cost vary by model).

### Risks / Mitigations

- Risk: cards are out of date for your library version. Mitigation: pin dependency versions and submit a PR or issue to the Security Cards repo: https://www.rewarelabs.com/blog/introducing-security-cards/
- Risk: the model ignores the guidance. Mitigation: enforce checks in CI, run canary tests, and add failing unit tests for insecure patterns.
- Risk: extra runs increase token spend. Mitigation: limit prompt counts, prioritize high-risk prompts, and monitor token usage and $ spend.

### Next steps

1) Quick install and smoke test (from the announcement):

```bash
npx skills add Reware-Labs/securitycards --skill securitycards -g
```

2) Run your chosen before/after comparison and collect absolute counts and percentages.
3) Define success criteria (example: >=30% relative reduction, or no new high-severity findings over two cycles).
4) Add a CI job and feature flag for a canary rollout; monitor results and iterate.
5) Contribute missing or improved guidance back to the Security Cards repository if you find gaps: https://www.rewarelabs.com/blog/introducing-security-cards/
