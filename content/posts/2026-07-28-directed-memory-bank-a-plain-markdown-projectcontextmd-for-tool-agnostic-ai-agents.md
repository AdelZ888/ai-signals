---
title: "Directed Memory Bank: a plain-markdown project_context.md for tool-agnostic AI agents"
date: "2026-07-28"
excerpt: "Create a single, versioned project_context.md so any file-reading agent (Claude, Gemini, Codex, Cursor) begins sessions with the same project facts, reducing repeated explanations."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-28-directed-memory-bank-a-plain-markdown-projectcontextmd-for-tool-agnostic-ai-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "directed-memory-bank"
  - "project-context"
  - "ai-agents"
  - "tool-agnostic"
  - "plain-markdown"
  - "tutorial"
  - "github"
sources:
  - "https://github.com/pmikutel/directed-memory-bank"
---

## TL;DR in plain English

- Add one small, versioned plain-markdown file to your repo named project_context.md. See the repo: https://github.com/pmikutel/directed-memory-bank
- Why: a single canonical file gives every agent the same starting facts. That reduces repeated explanations and inconsistent answers. Source: https://github.com/pmikutel/directed-memory-bank
- What to include: one-line elevator pitch; three metadata fields (Version, Last updated, Owner); a few short sections such as current objectives, top files, and constraints. Keep it compact: aim for ≤ 8,000 tokens (≈ 6–8 KB) and use 300–512 token summaries per sub-section when possible.
- Quick plan: create project_context.md, commit with message "chore(dmb): add project_context.md v0.1", and run one agent test within 60–90 minutes. Run a 2-week pilot and target a measurable improvement (for example, reduced time-to-triage).

Scenario example: a new issue arrives. Instead of pasting context every session, tell the agent to READ project_context.md first. The agent uses the file to triage, assign an owner, and propose labels. The team spends less time repeating the same background.

Methodology: this guide follows the plain-markdown approach in the repository above (https://github.com/pmikutel/directed-memory-bank).

## What you will build and why it helps

You will build a directed memory bank: a single, tool-agnostic markdown file (or a very small set of focused md files) that any agent that can read files uses as canonical project context. The repository describes this pattern: plain markdown that works with Claude Code, Cursor, Codex, Gemini, and any agent that reads files (https://github.com/pmikutel/directed-memory-bank).

### Plain-language explanation

Think of project_context.md as a one-page cheat sheet for AI helpers. It contains the most important facts they need to make correct, consistent suggestions. Because it is plain markdown, many different agents and tools can read it without installing anything.

Minimum artifact (example): project_context.md with these parts:
- Header metadata: Version, Last updated (ISO), Owner — three fields.
- One-line elevator pitch.
- Current objectives (3–5 items).
- Top 10 repo paths with short notes.
- Constraints and known issues as short bullets.

Decision table (example):

| Agent task | Primary file(s) to read | First prompt to give |
|---|---:|---|
| Triage issues | project_context.md | "Read project_context.md fully, then triage issue X." |
| Generate PR draft | project_context.md, changelog.md | "Read project_context.md; draft PR for change Y." |
| Write tests | project_context.md, tests/README.md | "Prioritize tests guided by project_context.md." |

Source: https://github.com/pmikutel/directed-memory-bank

## Before you start (time, cost, prerequisites)

- Estimated time: 60–90 minutes to create a first draft and run a test; 2–3 days for iterative polish.
- Cost: $0 to author the file; negligible API spend for a few sessions (estimate < $5 for 2–4 paid sessions if you use an API). API stands for application programming interface.
- Prerequisites:
  - A code repository (GitHub recommended).
  - Basic Markdown skills.
  - Access to any agent that can read files or accept pasted content.

Practical guardrails and thresholds:
- Keep the initial file ≤ 8,000 tokens (≈ 6–8 KB).
- Use 300–512 token summaries per subsection where possible.
- Refresh policy: update if age > 7 days for active sprints; block merges if Last updated > 14 days without approval.

Checklist to prepare:
- [ ] Repo access (write on a feature branch)
- [ ] Owner & approver identified (one person)
- [ ] Redaction checklist run
- [ ] Test agent session plan (1–3 tasks)

Reference: https://github.com/pmikutel/directed-memory-bank

## Step-by-step setup and implementation

1. Create the file and commit it

```bash
git checkout -b chore/dmb-add-project-context
cat > project_context.md <<'MD'
Version: 2026-07-28 | Owner: @alice | Expires: 2026-08-04

# Elevator pitch
One line describing purpose.

# Current objectives
1. ...

# Key files
- src/main.py
- tests/

# Constraints
- No external SSO

MD

git add project_context.md
git commit -m "chore(dmb): add project_context.md v0.1"
git push --set-upstream origin chore/dmb-add-project-context
```

2. Populate minimal sections. Keep subsections concise (≤ 512 tokens): elevator pitch, 3–5 objectives, top 10 paths, test/CI notes.

3. Add a one-line metadata header (Version, Last updated ISO date, Owner). That makes simple programmatic checks possible.

4. Open a pull request and request a single reviewer.

5. Point agents to the file. If the agent can fetch files, give the raw GitHub URL. If not, paste the file contents. Start the session with an explicit instruction such as: "READ project_context.md fully before answering." Ask one short quiz question to confirm ingestion (one question). For example: "In one sentence, state the elevator pitch."

6. Test with a small task and measure impact. Example test: ask for a one-paragraph README update using only facts from project_context.md. Measure time-to-first-draft and compare to baseline.

7. CI validation (example):

```yaml
name: Validate DMB
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ensure project_context.md exists
        run: test -f project_context.md
      - name: Lint header
        run: |
          head -n 1 project_context.md | grep -E "Version: .* \| Owner: @" || (echo "Header missing" && exit 1)
```

Rollout/rollback plan with gates:
- Canary: test with 3 members for 3 days.
- Traffic gating: start with 10% issue traffic, increase to 50% next week if gates pass.
- Rollback triggers: errors > 5% OR human edit rate on generated PRs increases by > 20%.

Source: https://github.com/pmikutel/directed-memory-bank

## Common problems and quick fixes

- Agent ignores the file or contradicts it
  - Fix: prepend an explicit instruction and require a one-question verification step (agent must repeat the one-line elevator pitch).

- Context becomes stale
  - Fix: add Last updated and a refresh policy. Refresh if age > 7 days for active work; block merges if older than 14 days without approval.

- File too long / token limits
  - Fix: split into overview.md + architecture.md + changelog.md and add an index file. Keep each file < ~8,000 tokens and use 300–512 token summaries.

- Secrets accidentally included
  - Fix: run the redaction checklist and add a CI linter or pre-commit hook to reject common secret patterns. SSO means single sign-on.

Reference: https://github.com/pmikutel/directed-memory-bank

## First use case for a small team

Target: solo founders and teams of 1–4 people. The goal is a low-overhead pilot that gives immediate value for triage and PR drafting.

Concrete, actionable steps (solo founder / small team):

1) Ship a minimal file in 30–60 minutes
- Create project_context.md with: Version, Owner, 1-line pitch, 3 current objectives, top 5 file paths. Keep the file ≤ 1,000 tokens to stay concise. Push on a feature branch and open a PR. Source: https://github.com/pmikutel/directed-memory-bank

2) Run a 3-day canary with 10% traffic
- Configure the agent to auto-triage only 10% of incoming issues for the first 3 days. Collect time-to-first-triage and labels assigned. If errors ≤ 5% and triage time improves, increase traffic to 50% in week 2.

3) Automate a one-question verification and an owner field
- Instruct the agent: "READ project_context.md. Confirm the primary objective in one sentence." Require the agent to assign an Owner field (one person). This enforces that every automated decision records a named owner.

4) Lightweight metrics and rollback
- Track: time-to-first-triage, first-pass PR acceptance rate, and number of human edits. Pilot length: 2 weeks. Success thresholds: triage time reduced by ≥ 20% OR team qualitative approval; error thresholds < 5%.

5) Keep it reversible
- Limit update rights to 1–2 owners. If human edit rate rises > 20% or errors > 5%, revert automation and re-evaluate.

Artifacts to produce: a triage decision mapping, a one-page PR checklist referencing project_context.md, and a short two-week pilot report.

Source: https://github.com/pmikutel/directed-memory-bank

## Technical notes (optional)

- Tool-agnostic: plain Markdown avoids SDK lock-in. Any agent that can read files can consume project_context.md (https://github.com/pmikutel/directed-memory-bank).
- Serving options: use raw GitHub URLs for HTTP fetch or mount the repo for local agent runners.
- Vector stores: optional. Exporting summaries to a vector database adds infrastructure and cost; skip for early pilots.

Example JSON metadata block you can embed in the md header for programmatic checks:

```json
{
  "version": "2026-07-28",
  "owner": "@alice",
  "expires": "2026-08-04"
}
```

Source: https://github.com/pmikutel/directed-memory-bank

## What to do next (production checklist)

### Assumptions / Hypotheses
- The agent can read files or accept pasted text (the repo describes plain markdown working with file-reading agents: https://github.com/pmikutel/directed-memory-bank).
- The team will update the file at least once every 7 days during active sprints.
- Pilot metrics (time to triage, PR edit rate) are meaningful indicators for this use case.

### Risks / Mitigations
- Risk: stale context leads to wrong outputs. Mitigation: enforce Last updated and a 7-day refresh policy; block merges if older than 14 days.
- Risk: token limits prevent full ingestion. Mitigation: split files and provide an index; keep each file < 8,000 tokens, with 300–512 token summaries.
- Risk: secrets leaked. Mitigation: redaction checklist + CI pre-commit hook.

### Next steps
- Finalize project_context.md and run a 2-week pilot with these gates:
  - 3-day canary on 3 members
  - 10% issue traffic week 1, 50% week 2
  - Success thresholds: triage time reduced by ≥ 20% OR team qualitative approval; error thresholds < 5%
- Add CI job to validate header and run redaction checks (see YAML example above).
- Limit update rights to 1–2 owners and document rollout/rollback in the runbook.

- [ ] Create project_context.md and open a PR
- [ ] Run 3-day canary at 10% traffic
- [ ] Collect metrics for 2 weeks and apply the success thresholds above

Final reminder: keep the memory bank small, reviewable, and versioned. The core idea is plain, tool-agnostic markdown so any agent that reads files starts each session up to speed: https://github.com/pmikutel/directed-memory-bank
