---
title: "Turn classic software-engineering principles into 'skill' files to guide AI code-review agents"
date: "2026-02-26"
excerpt: "Encode lessons from Clean Code and DDIA as compact 'skill' files so AI reviewers give consistent, traceable suggestions. Learn a staged workflow (lint→review→human) and context tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-26-turn-classic-software-engineering-principles-into-skill-files-to-guide-ai-code-review-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "code-review"
  - "prompt-engineering"
  - "software-engineering"
  - "clean-code"
  - "ddia"
  - "github"
  - "agent-architecture"
sources:
  - "https://news.ycombinator.com/item?id=47098555"
---

## TL;DR in plain English

- Idea: encode lessons from classic software books as compact, opinionated "skill" files and use those files as explicit lenses when an AI reviews code. The Hacker News thread that inspired this describes the book-as-rubric pattern and cautions about misapplied lenses: https://news.ycombinator.com/item?id=47098555
- How it behaves: a lint-like fast pass applies deterministic rules; a model-driven reviewer applies one skill at a time and records which skill produced each suggestion.
- Quick try: add a single skill file, wire a fast lint-agent to CI, and run a reviewer-agent only on a limited subset of changes (see the decision-frame below). Keep a human approval gate.

Methodology note: this writeup follows the "book-as-rubric" idea discussed on Hacker News and keeps recommendations compact to make iterative testing simpler: https://news.ycombinator.com/item?id=47098555

## What you will build and why it helps

You will build an AI-assisted review pipeline that treats each book/principle as a small, named skill file. Each skill is a short, editable checklist the agent uses as its review lens. The HN thread frames this approach as a way to concentrate the model’s attention and make feedback more consistent and auditable: https://news.ycombinator.com/item?id=47098555

Why this helps:
- Consistency: comments reference a skill id instead of free-form prose.
- Auditability: you can trace suggestions back to the source lens.
- Reduced hallucination: narrower instructions keep output on-topic.

Caveat from the discussion: apply skills selectively by project context; a book lens written for one language or scale can be noisy if applied blindly to a different codebase: https://news.ycombinator.com/item?id=47098555

## Before you start (time, cost, prerequisites)

- Prerequisites: a repo with PRs and CI, a small folder for skill files under version control, and an API key or local model runtime. See the HN thread for the motivating idea: https://news.ycombinator.com/item?id=47098555
- Minimal time: plan for a short pilot to validate the pattern and catch context-mismatch issues.
- Cost guidance: prefer rule-based checks first and reserve model calls for an evaluated subset to limit spend.

Prepare these artifacts in your repo before wiring CI:
- skills/ — folder for skill YAML files
- context/manifest.json — a compact project manifest the agents can read
- agents/ — tiny scripts for lint-agent and reviewer-agent

Reference and origin: the approach and its cautions are summarized on Hacker News: https://news.ycombinator.com/item?id=47098555

## Step-by-step setup and implementation

1) Create a compact project manifest the agent will read. Keep it simple and explicit: language, test command, entrypoints, and owners. The HN thread highlights the importance of keeping the model’s lens aligned with project context: https://news.ycombinator.com/item?id=47098555

2) Author a short skill file limited to a few clear heuristics.

Example skill (YAML):

```yaml
id: clean_code_basic
source: Clean Code (book lens)
priority: high
heuristics:
  - id: naming
    description: Use intention-revealing names.
  - id: single_responsibility
    description: Prefer single-purpose functions.
examples:
  - before: "f()"
    after: "calculateInvoiceTotal()"
```

3) Implement three small processes: lint-agent, reviewer-agent, and meta-evaluator. Keep each process tiny to iterate quickly. The lint-agent is deterministic and low-cost; the reviewer-agent calls the model with one skill; the meta-evaluator deduplicates and attaches skill_id to suggestions.

Example commands:

```bash
# run lint-agent locally against changed files
python agents/lint_agent.py --changed-files $(git diff --name-only origin/main)

# run reviewer-agent for a single PR (manual/canary run)
python agents/reviewer_agent.py --skill skills/clean_code.yaml --manifest context/manifest.json
```

4) Wire to CI: run lint-agent on every PR; gate any auto-apply or auto-merge behind human approval. Run reviewer-agent on a controlled subset.

5) Canary decision frame (simple comparison table). Use this to decide when to call the model vs. run only lint rules.

| Check type | Trigger to run | Cost/latency profile | Recommended gate |
|---|---:|---:|---|
| lint-agent | any PR / changed file | low cost, <100 ms per file | auto-run, always visible |
| reviewer-agent | large diffs or selected canaries | higher cost, model call (tokens) | human approval required |
| meta-evaluator | after reviewer-agent | negligible | dedupe and attach skill_id |

Reference: the idea of separating levels of critique (fast lint vs. deeper review) comes from the Hacker News discussion: https://news.ycombinator.com/item?id=47098555

6) Metrics to observe during a pilot: false-positive signal, suggestions applied, and PR cycle time. Use metrics to decide whether to broaden reviewer runs.

## Common problems and quick fixes

- Context collapse (wrong lens applied): consult your decision table using context/manifest.json and run only skills that match the repo type. The HN thread emphasizes domain-aware skill selection: https://news.ycombinator.com/item?id=47098555

- Shallow/repetitive review loops: separate lint and review passes; use the meta-evaluator to dedupe similar outputs.

- Noisy refactors that break behavior: require tests to pass and a human gate before merge.

- Cost spikes: limit reviewer runs to targeted changes or canaries and prefer cheaper models for linting.

Operational quick checks:
- Inspect duplicate-suggestions.log for repeated messages.
- Check pipeline_results.json for per-run timings and token usage.

Reference and origin: Hacker News thread discussion and community comments: https://news.ycombinator.com/item?id=47098555

## First use case for a small team

Target audience: solo founders and very small teams. The HN thread explicitly recommends starting small and being domain-aware: https://news.ycombinator.com/item?id=47098555

Concrete minimal pilot:
- Ship one skill file that encodes a few explicit heuristics and examples.
- Start with rule-based linting only and show those results on every PR.
- Run reviewer-agent manually or on a tiny controlled subset while you tune skill wording.
- Keep a human gate for any behavioral change.

Starter checklist (copy this into your repo):
- [ ] Add skills/clean_code.yaml with a small set of heuristics
- [ ] Commit context/manifest.json (language, test command)
- [ ] Add lint-agent to CI (fast checks on every PR)
- [ ] Run reviewer-agent manually or on a narrow canary

Reference: the recommendation to start small and tune skills by context is from Hacker News: https://news.ycombinator.com/item?id=47098555

## Technical notes (optional)

- Keep skill files declarative: id, source, priority, heuristics[], examples[]. Prefer short files you can review in <1 minute.
- Manifest size: keep it compact so the model doesn’t get irrelevant context; include only essential fields.
- Orchestration pattern: producer → consumer → arbiter. Emit idempotent JSON suggestions with fields such as skill_id, file, line_start, line_end, suggestion, confidence.

Example suggestion JSON (produced by meta-evaluator):

```json
{
  "skill_id": "clean_code_basic",
  "file": "src/payments.py",
  "line_start": 120,
  "line_end": 135,
  "suggestion": "Rename f() to calculate_invoice_total",
  "confidence_pct": 92
}
```

Useful metrics to collect during a pilot: violations per 100 LOC, false-positive rate, suggestions-applied percentage, median PR close time. Track these for a short validation window and iterate on skill wording.

Reference and inspiration: Hacker News thread — https://news.ycombinator.com/item?id=47098555

## What to do next (production checklist)

### Assumptions / Hypotheses

- Pilot numeric thresholds and operational targets (examples for validation):
  - Skill length: 4–8 heuristics per skill file.
  - Canary coverage: 1–10% of PRs for automated reviewer-agent runs.
  - Manual review window: collect metrics for ~14 days before expanding.
  - Script size: keep each agent script <200 lines for rapid iteration.
  - Large-diff threshold: consider reviewer-agent only when >100 lines changed.
  - Team size target for this pattern: 1–4 people for an initial pilot.
  - Test/manifest size target: manifest <1 KB.
  - Suggested audit metric goals to aim at during pilot: violations per 100 LOC < 3 and false-positive rate < 20% (initial hypotheses).

These thresholds are hypotheses to validate during your pilot and are not proven defaults; the original HN discussion highlights the practice and the need for domain-aware selection: https://news.ycombinator.com/item?id=47098555

### Risks / Mitigations

- Risk: wrong lens applied to code (context collapse).
  - Mitigation: require decision-table lookup using the manifest before running a skill; run only matching skills.
- Risk: noisy false positives and developer fatigue.
  - Mitigation: start with deterministic linting, gate model-driven suggestions behind human approval, and keep reviewer-agent coverage small until noise is low.
- Risk: unexpected cost growth from model calls.
  - Mitigation: use low-cost models for linting, throttle reviewer runs, and monitor daily spend closely.

Reference: community cautions and suggestions on Hacker News: https://news.ycombinator.com/item?id=47098555

### Next steps

1. Create a minimal skill (skills/clean_code.yaml) with a small set of heuristics and commit to a feature branch.
2. Add context/manifest.json and a simple skills-decision-table.csv that maps repo types to skill ids.
3. Wire lint-agent into CI; keep reviewer-agent behind a feature flag and run it only on a narrow canary while you collect metrics for ~14 days.
4. Use collected metrics and developer feedback to iterate on skill wording, priorities, and decision rules; require tests and a human gate before any automated behavioral change.

Origin and further reading: the book-as-rubric idea and associated cautions were discussed on Hacker News: https://news.ycombinator.com/item?id=47098555
