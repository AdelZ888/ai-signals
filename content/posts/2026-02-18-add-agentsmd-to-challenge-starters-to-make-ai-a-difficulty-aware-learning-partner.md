---
title: "Add AGENTS.md to challenge starters to make AI a difficulty-aware learning partner"
date: "2026-02-18"
excerpt: "Practical playbook based on Frontend Mentor's rollout: add AGENTS.md (and optional CLAUDE.md) to challenge starters, enforce via CI, and shape AI to tutor by difficulty."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-18-add-agentsmd-to-challenge-starters-to-make-ai-a-difficulty-aware-learning-partner.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "agents"
  - "ai-tutoring"
  - "developer-experience"
  - "education"
  - "frontend"
  - "product"
sources:
  - "https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge"
---

Add AGENTS.md to Your Challenges: make AI a learning partner, not an answer machine

Published 2026-02-18 — A practical tutorial inspired by Frontend Mentor’s rollout of AGENTS.md and CLAUDE.md to starter code.

Methodology note: this tutorial is grounded in the Frontend Mentor excerpt linked below and expands into a practical implementation playbook. See the source: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Builder TL;DR

What you’ll do: add an AGENTS.md (and optional CLAUDE.md) file to each challenge's starter folder so AI coding assistants behave as a difficulty-aware tutor rather than auto-coding full solutions. The Frontend Mentor team added AGENTS.md and CLAUDE.md to their starter code to make AI assistants better learning partners: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

Core artifacts to create:

- AGENTS.md template (one per starter/ folder).
- CLAUDE.md alias (optional) that maps to the same guidance.
- CI job that fails the PR if a starter/ folder lacks an AGENTS.md.
- A PR checklist that enforces content and ownership.

Expected quick wins (example mapping):

| Example difficulty | Agent behavior (suggested) |
|---:|---|
| Beginner | hint-first, step-by-step suggestions |
| Intermediate | trade-offs, architecture guidance |
| Advanced | critique, alternative approaches |

Quick rollout plan: pilot 10–20 challenges, validate with CI checks, then expand in batches of 50–100. (See assumptions in Production checklist.)

See the Frontend Mentor write-up for the rationale and their file conventions: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Goal and expected outcome

Primary goal: ensure AI tools guide learners' thinking instead of producing full copy-paste solutions. The Frontend Mentor excerpt summarizes the principle: “AI should guide your thinking, not replace it.” Source: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

Concrete expected outcomes (operational):

- Every updated starter/ contains AGENTS.md and, where relevant, CLAUDE.md.
- AI responses change to the difficulty-pattern you define (hints-first → progressive reveal → no full solution).
- CI enforces file presence; PRs cannot merge if 1 or more starter/ folders lack the file.

Success artifacts to track:

- Rollout checklist and PR coverage report (counts).
- A/B experiment plan (pilot vs. control) with thresholds such as +10% completion rate target or <5% harmful guidance rate before scale.

Reference: guidance and reasoning from Frontend Mentor's announcement: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Stack and prerequisites

Minimum stack you need:

- Git host (GitHub/GitLab) and repo with challenge starter/ folders.
- CI (GitHub Actions or equivalent) that can run a presence/structure check.
- PR workflow and at least 2 reviewers or an owners file.
- Editor/encoding: ensure files are UTF-8 with LF line endings.

Permissions & process:

- Ownership list with 1–3 reviewers per category; we recommend 1 owner per 10–50 challenges.
- Decide who can approve content changes and who maintains templates.

Tools & sample artifacts:

- AGENTS.md template (text file in repo root to copy into starters).
- CLAUDE.md alias for Claude users.
- A CI lint job (YAML) that fails if AGENTS.md is missing. Example below.

Reference: Frontend Mentor's pattern of adding AGENTS.md/CLAUDE.md to project starter code: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Step-by-step implementation

1. Draft templates

- Create AGENTS.md and CLAUDE.md templates describing the learner profile and expected agent behaviour. Keep them short (200–800 tokens per template; aim for ~300 tokens).
- Include a short “Do not produce full solutions” rule and a progressive-hint policy.

2. Map behaviors to difficulty

- Produce a simple decision table (1 page) mapping difficulty tiers to allowed actions: hint-first, debugging help, critique-only, etc.

3. Bulk add files

- Write a script to insert AGENTS.md into each starter/ folder. Example commands:

```bash
# find all starter folders and add AGENTS.md from templates/
for d in $(find . -type d -name starter); do
  cp templates/AGENTS.md "$d/AGENTS.md"
  git add "$d/AGENTS.md"
done
git commit -m "chore: add AGENTS.md starter guidance"
git push origin add-agents
```

4. CI enforcement

- Add a CI job that fails the PR if any starter/ folder is missing AGENTS.md or CLAUDE.md. Example GitHub Actions (YAML) below.

5. Pilot & feedback

- Pilot on 10–20 challenges (10 and 20 are suggested pilot sizes) for 2–4 weeks (14–28 days). Collect qualitative feedback from learners and run automated prompt tests to verify agent behavior.

6. Rollout gates

- Canary: deploy to 3–5% of new challenge views or 3 challenge pages first.
- Feature flag: enable on production domain for the pilot cohort only.
- Monitor metrics for 14 days; if key metrics fall below thresholds (e.g., >5% drop in completion rate or >3 reported harmful guidance incidents), trigger rollback.

7. Full rollout

- Expand to batches of 50–100 challenges per week with CI gates and a 7-day monitoring window for each batch.

Example AGENTS.md snippet you can use as a starting point:

```md
# AGENTS.md (template sample)
Learner profile: beginner-to-intermediate.
Guidance: prefer hint-first, provide step breakdowns, do not provide full working solutions unless explicitly requested after 3 hints.
Tone: Socratic, explanatory, and concise.
```

Reference: Frontend Mentor’s approach of embedding AGENTS.md into starter code to guide AI assistants: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Reference architecture

At-rest repo layout (example):

- challenges/
  - challenge-foo/
    - starter/
      - index.html
      - src/
      - AGENTS.md
      - CLAUDE.md

CI/QA layer:

- A lint job scans all starter/ paths, ensures AGENTS.md exists, and validates minimal fields (title, learner-profile, hint-policy).
- If the job finds 1+ missing files, the PR fails and a report is posted with counts.

Deployment and runtime integration:

- Option A: file-only — AGENTS.md lives in starter/ and is consumed by local AI tools and cloud assistants that read repo files.
- Option B: runtime export — a small server-side endpoint exports AGENTS.md as JSON for an in-app assistant; rate-limit to 100 requests/min and cache responses for 300 s.

Simple pipeline diagram (logical): repo -> CI check -> staged merge -> canary cohort -> full rollout.

See Frontend Mentor’s explanation of embedding agent guidance into project directories: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Founder lens: ROI and adoption path

Value proposition:

- Differentiation: a teaching-first AI experience reduces copy-paste behavior and improves perceived brand trust.
- Retention: target metrics (examples) — +10% completion, +5% repeat learners over 90 days if guidance improves learning outcomes.

Staged adoption path (recommended):

1. Pilot 10–20 challenges for 14–28 days.
2. If pilot meets success thresholds (e.g., +5–10% completion or <3 reported harmful guidance incidents), expand in batches of 50.
3. Full rollout; ongoing review every 90 days.

Costs & effort (example estimates):

- Initial PR/CI work: 40–120 developer hours.
- Ongoing maintenance: 1–4 hours/week for content owners.

Instrument adoption:

Track these KPIs: starts (count), completions (count), retention (30/90-day), help requests (count), and reports of inappropriate solutions (count). Baselines and thresholds should be defined before pilot.

Source describing the practice of including AGENTS.md for AI behavior: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Failure modes and debugging

Common failure modes and quick checks:

- File not visible to agent tooling: confirm file name AGENTS.md or CLAUDE.md and that it exists in starter/; ensure UTF-8 encoding (no BOM). (1 check)
- Agent ignores AGENTS.md: test with canned prompts and inspect the agent's context windows; validate that the tool reads repository files (some tools only read up to N tokens — test with 2,048 token prompts).
- Overly broad guidance: learners get frustrated; iterate wording to increase hints before solutions (e.g., reveal solution only after 3 hints).

Debugging checklist:

- [ ] Confirm AGENTS.md exists in all starter/ folders (CI should fail if any missing).
- [ ] Run 10 automated prompt tests per difficulty tier and log responses.
- [ ] Check that <5% of responses are full solutions in pilot cohort.

If CI returns false positives, add unit tests and small fixture repos to reproduce the detection failure. The Frontend Mentor note about file conventions is a primary reference for expected behavior: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge

## Production checklist

### Assumptions / Hypotheses

- Assumption: your users use AI coding assistants that read repo files (many do — e.g., GitHub Copilot, Claude, ChatGPT plugins). See Frontend Mentor: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge
- Hypothesis: pilot of 10–20 challenges over 14–28 days is sufficient to validate behavior change.
- Hypothesis: a 7–14 day canary window per batch will surface major regressions.
- Note: the Frontend Mentor excerpt describes adding AGENTS.md and CLAUDE.md to starter code; it does not specify total challenge counts in this excerpt.

### Risks / Mitigations

- Risk: agents ignore the files — Mitigation: iterate wording, add CLAUDE.md alias, publish guidance in README.
- Risk: guidance reduces helpfulness — Mitigation: A/B test and allow learners to opt-in to “show full solution” only after explicit request.
- Risk: CI flakiness — Mitigation: add reproducible unit tests and artifact logs for one failing folder.

### Next steps

- Create templates and a one-off PR to pilot 10 challenges.
- Add CI job and a pre-merge checklist.
- Run pilot for 14–28 days, gather metrics and qualitative feedback, then decide whether to proceed with batch rollout.

Example CI job (GitHub Actions) to check for AGENTS.md presence:

```yaml
name: check-agents-files
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: find missing AGENTS.md
        run: |
          missing=0
          for d in $(find . -type d -name starter); do
            if [ ! -f "$d/AGENTS.md" ]; then
              echo "MISSING: $d/AGENTS.md"
              missing=$((missing+1))
            fi
          done
          if [ "$missing" -gt 0 ]; then
            echo "Found $missing missing AGENTS.md files"
            exit 1
          fi
```

Final reference: Frontend Mentor’s announcement that they ship AGENTS.md/CLAUDE.md in starter code to make AI tools better learning partners: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge
