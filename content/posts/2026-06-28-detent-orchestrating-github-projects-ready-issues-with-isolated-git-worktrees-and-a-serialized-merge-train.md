---
title: "Detent: Orchestrating GitHub Projects 'Ready' issues with isolated Git worktrees and a serialized merge train"
date: "2026-06-28"
excerpt: "Detent is a single Go binary that watches a GitHub Projects board, creates isolated Git worktrees per ready issue, runs coding agents and enqueues validated PRs in a serialized merge train."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-28-detent-orchestrating-github-projects-ready-issues-with-isolated-git-worktrees-and-a-serialized-merge-train.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "detent"
  - "ai-agents"
  - "git"
  - "worktree"
  - "merge-train"
  - "github"
  - "devops"
  - "developer-experience"
sources:
  - "https://github.com/digitaldrywood/detent"
---

## TL;DR in plain English

- Detent is a single Go executable that connects a GitHub Projects board to automated code work. It watches the board for issues marked "ready." For each ready issue it creates an isolated Git worktree, runs a coding agent, runs a validation gate, and then pushes approved changes through a serialized merge train. Activity is visible on web and terminal dashboards. See: https://github.com/digitaldrywood/detent.

- Key benefits:
  - Isolates each issue into its own worktree so experiments do not touch main branches.
  - Serializes merges to keep changes ordered and auditable.
  - Shows progress in dashboards so a human operator can review and intervene.

- Quick start suggestion: pilot with 1 repository, 1 Projects board, and 1 "Ready" column.

Concrete example (short scenario):
- Alice is a solo founder. She tags one issue "Ready" on her GitHub Projects board. Detent notices the issue, clones a worktree for that issue, runs a coding agent that proposes edits, runs CI and a validation gate, and then enqueues the resulting pull request into a merge train. Alice reviews the proposal in the web dashboard and approves it. The change merges in order without disturbing other work.

### Plain-language explanation before advanced details

Detent automates a repeatable loop: an issue becomes a small unit of automated work. Each unit runs separately in its own Git worktree (a lightweight, separate working copy inside a Git clone). The loop is: detect ready issue → create worktree → run an agent that edits code → validate the edit → enqueue into a merge train that merges changes one at a time. The system aims to keep agent work isolated, auditable, and ordered.

## What you will build and why it helps

You will set up a small orchestration flow using the Detent binary. The flow links a GitHub Projects board to automated agent runs. For each issue you mark "ready," Detent will:

- create an isolated Git worktree (a separate working copy tied to the same repo),
- run a coding agent to propose changes,
- run a validation gate (for example CI and approvals), and
- push approved changes through a serialized merge train so merges happen in a controlled order.

Why this helps:

- Isolation: one worktree per issue prevents experiments from contaminating the main branch.
- Ordering: a serialized merge train avoids many simultaneous merges and reduces merge conflicts.
- Visibility: web and terminal dashboards give a clear audit trail and let humans step in.

Reference: project summary at https://github.com/digitaldrywood/detent.

## Before you start (time, cost, prerequisites)

Minimum prerequisites (confirm against the repository): https://github.com/digitaldrywood/detent

- A GitHub Projects board and a repository to watch (start with 1 board and 1 repo).
- A host that can run a Go binary and manage Git worktrees (local machine, laptop, or virtual machine). The binary is distributed as a single Go executable.
- A credentials token or secret with permission to read the Projects board and push to the repository. Store this in a secrets manager or as a protected file.
- At least one human reviewer to validate agent proposals during the pilot.

Time and cost framing for a pilot (guidance to validate the flow):

- Single end-to-end test: allow up to 120 minutes to run and observe one issue. This is a conservative window for debugging.
- Pilot recommendation: 14 days to exercise different cases.
- Pilot sample size: 3–5 issues.
- Concurrency for pilot: run with 1 worktree at a time.
- Disk reserve: keep ~5 GB free on the host and expect ~100–500 MB per active worktree.

Confirm these minimums and exact configuration against the upstream repository: https://github.com/digitaldrywood/detent.

## Step-by-step setup and implementation

This is a high-level sequence. Consult the repository for full details: https://github.com/digitaldrywood/detent.

1. Create or identify a GitHub Projects board. Choose one column to represent "Ready."
2. Pick a single repository and a non-critical branch for the pilot.
3. Provision a host with basic resources (e.g., 2 CPU cores, 2 GB RAM, ~5 GB free disk) for the pilot. Adjust resources later.
4. Install the Detent binary on the host. Ensure the host has a clean clone of the repository for worktree operations.
5. Provide credentials (token) to the host via a secrets manager or a mounted file.
6. Configure the board URL, repository, and validation behavior. Keep the pilot simple: concurrency = 1, require human approval.
7. Start the binary and watch the terminal and web dashboards for ready issues, worktree creation, validation output, and merge-train status.
8. Run one issue end-to-end: worktree → agent run → validation gate → enqueue to merge train → merge or halt on failure.

Operational checks during setup:

- Verify the board URL and repo values in your Detent configuration.
- Ensure the host can create and delete Git worktrees and the filesystem is writable.
- Confirm that the token used has permissions to read the Projects board and push to the repo.

See the project entry for the core behavior and architecture: https://github.com/digitaldrywood/detent.

## Common problems and quick fixes

Reference: project summary at https://github.com/digitaldrywood/detent.

Problem: Detent cannot access the Projects board
- Quick fixes: check network connectivity. Verify the board URL. Ensure the token is present and has the right permissions.

Problem: Worktree creation fails
- Quick fixes: ensure the repo clone is clean. Check filesystem permissions. Remove stale worktrees before retrying.

Problem: Merge train stalls because validation gate failed
- Quick fixes: inspect the validation output. Require a human to fix or approve. Fix CI failures.

Problem: Agent output quality is poor
- Quick fixes: add mandatory human review. Improve agent prompts or validation rules.

Decision guidance (example):

| Gate result     | Pilot action                          |
|-----------------|---------------------------------------|
| Pass            | Enqueue to merge train                |
| Require review  | Pause and notify a reviewer           |
| Fail            | Reject change; open follow-up issue   |

Quick commands and checks (examples):

```bash
# Confirm the host can run the binary (binary is a single Go executable)
./detent --help
```

```bash
# If worktrees pile up: list and remove stale worktrees (example git pattern)
git worktree list
# remove a stale worktree path
rm -rf /path/to/stale-worktree
```

For the project entry and behavior summary see: https://github.com/digitaldrywood/detent.

## First use case for a small team

Target audience: solo founders and very small teams (1–3 people). Reference: https://github.com/digitaldrywood/detent.

Actionable steps for a small team pilot:

1) Limit blast radius and timebox the pilot
- Use one non-critical repo, one Projects board, and one "Ready" column.
- Timebox each end-to-end test to 120 minutes. Run the overall pilot for 14 days.

2) Enforce human-in-the-loop checks
- Start with concurrency = 1 and require one human approval before merge.
- Require CI to pass for agent-created pull requests. Use a high pass-rate before enabling auto-merge.

3) Keep operations lightweight and observable
- Assign one operator to monitor dashboards and handle approvals.
- Track a few metrics: CI pass rate, merge-train median latency, and PR quality on a small sample.

4) Daily runbook (three checks)
- Check free disk (goal: >= 5 GB) and remove stale worktrees older than 24–72 hours.
- Review validation gate failures and act within 60 minutes where possible.
- Verify token validity and rotate tokens as part of early trials.

Why this works: it limits concurrency and risk, keeps the pilot small, and preserves human control. Confirm details with the repository: https://github.com/digitaldrywood/detent.

## Technical notes (optional)

Core architecture from the project summary:
- Single Go binary.
- Board-driven: watches a GitHub Projects board.
- Isolated Git worktrees per ready issue.
- Coding agent plus validation gate.
- Serialized merge train.
- Live web and terminal dashboards.

Tuning knobs to consider after pilot:
- Concurrency limits: start at 1, scale across hosts or increase concurrency slots.
- Worktree cleanup policy: remove stale worktrees after 24–72 hours.
- Merge-train depth and queue length: monitor latency and adjust depth.
- Logging and retention: keep logs at least 30 days for audits.

Consult the upstream repository for exact flags and implementation details: https://github.com/digitaldrywood/detent.

## What to do next (production checklist)

Reference and entry point: https://github.com/digitaldrywood/detent.

### Assumptions / Hypotheses

The repository excerpt describes the high-level behavior but does not include a full CLI reference in the provided snapshot. The commands and YAML below are examples to illustrate concepts. Validate actual flags and fields against the upstream README and releases: https://github.com/digitaldrywood/detent.

Example start command (hypothetical):

```bash
# Example only — confirm exact flags with upstream docs
./detent --config ./detent.yaml --token-file /path/to/token
```

Example config (hypothetical YAML to capture the concept; confirm real fields upstream):

```yaml
repo: my-org/my-repo
project_board_url: https://github.com/orgs/my-org/projects/1
watch_column: "Ready"
concurrency: 1
validation:
  require_ci: true
  require_approvals: 1
merge_target: pilot/agent
```

Suggested numeric thresholds to validate during pilot (hypotheses):
- Single test timebox: 120 minutes.
- Pilot duration: 14 days.
- Concurrency during pilot: 1 worktree.
- CI pass threshold before auto-merge: 95%.
- Merge-train median latency target: < 10 minutes.
- Pilot sample size: 3–5 issues.
- Human approvals required: 1 reviewer.
- Disk reserve: ~5 GB free; ~100–500 MB per worktree.

### Risks / Mitigations

- Risk: Agents propose breaking or low-quality changes.
  - Mitigation: require human approval and CI gate; run on a non-critical branch.
- Risk: Merge train delays other team workflows.
  - Mitigation: keep concurrency low during pilot; monitor median latency and pause if it grows.
- Risk: Secrets exposure on the host.
  - Mitigation: use a secrets manager, grant least privilege, rotate tokens regularly.
- Risk: Disk fills from many worktrees.
  - Mitigation: enforce cleanup policy and monitor disk usage.

### Next steps

- Run a 14-day pilot on one test repository. Collect these metrics: CI pass rate, merge-train median latency, and PR quality on a small sample.
- Hold a retrospective after the pilot and decide whether to widen scope to more repos or board columns.
- Harden production by adding monitoring, an audit log, a secrets manager, and a documented incident playbook.
- For rollout, consider rate limits, increasing required approvals, and multiple hosts or a scheduler.

Rollout checklist (examples to tick off):
- [ ] Pilot run completed for 14 days
- [ ] CI pass rate >= 95% for agent PRs
- [ ] Merge-train median latency < 10 minutes
- [ ] Secrets stored in a secrets manager
- [ ] Runbook and rollback steps tested

Repository reference: https://github.com/digitaldrywood/detent.
