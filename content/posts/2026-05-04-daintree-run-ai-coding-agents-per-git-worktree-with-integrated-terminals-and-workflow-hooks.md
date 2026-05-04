---
title: "Daintree — run AI coding agents per git worktree with integrated terminals and workflow hooks"
date: "2026-05-04"
excerpt: "Daintree runs AI coding agents (Claude, Gemini, Codex) in isolated git worktrees, injecting file context and offering an integrated terminal plus workflow hooks for safe, reviewable changes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-04-daintree-run-ai-coding-agents-per-git-worktree-with-integrated-terminals-and-workflow-hooks.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "daintree"
  - "ai-agents"
  - "git-worktrees"
  - "devtools"
  - "workflow"
  - "open-source"
sources:
  - "https://github.com/daintreehq/daintree"
---

## TL;DR in plain English

- What Daintree is: an open-source delegation environment for running multiple AI coding agents. It ties each agent session to a git worktree so the agent works in an isolated copy of the repo. See the project README: https://github.com/daintreehq/daintree.
- Why this helps: experiments stay isolated from your main branches. Agents get file context and an integrated terminal, so you see changes faster and with less copying of files into prompts.
- Quick immediate steps (30–60 seconds): clone the repo, create a git worktree, add provider API keys to a local config, and start an agent session for that worktree (repo: https://github.com/daintreehq/daintree).

Plain-language definitions:
- API = application programming interface (how your code talks to a model provider).
- CI = continuous integration (automated tests and checks that run on code changes).
- PR = pull request (the standard review object in git hosting services).

Pilot guardrails (start small):
- Run with 1–3 people and up to 5 concurrent agents to keep costs low.
- Keep active worktrees under 10 per developer to avoid confusion.
- Require at least 1 human reviewer for any agent-driven merge.

Concrete example: Alice wants an agent to refactor a helper function. She adds a worktree named agent/refactor-alice, starts a Daintree session for that worktree, asks the agent to refactor only files in that worktree, runs local tests, creates a PR, and asks a reviewer to approve before merging.

Repo reference: https://github.com/daintreehq/daintree

## What you will build and why it helps

You will set up a local delegation environment that:
- launches agent sessions (examples listed in the repo: Claude, Gemini, Codex) and ties each session to a git worktree;
- provides an integrated terminal and injects file context into prompts to improve the agent's suggestions;
- includes simple workflow hooks so agents can propose changes while humans control merges.

How this helps small teams and solo founders (practical points):
- Isolation: agent changes live in worktrees named like agent/<task>-<owner>. That keeps experiments separate from main branches.
- Faster feedback: agents get repository files as context so you avoid copying files into prompts and can test changes quickly.
- Controlled parallelism: limit concurrent agents (3–5) during a pilot to control cost and review load.

Decision table (example):

| Agent role | Primary task | Allowed actions | Approval required |
|---:|---|---|---:|
| Exploration agent | Prototype proof-of-concept | Create files in worktree only | 1 human reviewer before merge |
| Refactor agent | Apply refactor, run tests | Commit to worktree | 1 reviewer + CI pass (tests and lint) |
| Automation agent | Routine edits (formatting) | Optionally auto-commit | Feature flag + canary worktree |

See the project README for scope and details: https://github.com/daintreehq/daintree

## Before you start (time, cost, prerequisites)

Estimated time and cost:
- Setup time: 1–3 hours to clone, configure keys, make a worktree, and run a smoke test.
- Initial API cost: budget $0–$50 for early tests; expect higher monthly spend once you scale.

Minimum prerequisites:
- git with worktree support (git >= 2.15 recommended).
- a terminal and basic shell skills.
- provider API keys for agents you will use.
- read the repository README: https://github.com/daintreehq/daintree.

Pre-flight checklist:
- [ ] Confirm git version and worktree support
- [ ] Clone the repo locally
- [ ] Obtain API keys and store them locally (do not commit)
- [ ] Read the repository README for platform-specific start commands (https://github.com/daintreehq/daintree)

Operational limits to set for a pilot:
- Concurrent agents: <= 5
- Active worktrees per dev: <= 10
- API error alert threshold: 2% error rate
- API latency alert: 2 s average for code-generation calls

## Step-by-step setup and implementation

Plain-language explanation before the commands: Daintree ties an AI session to a git worktree. That means each agent works inside an isolated copy of the repo. You give the agent provider keys so it can call the model API. You then use the session to propose changes. Humans run tests and review before merging.

Follow these steps. Confirm exact install and start commands in the repo README: https://github.com/daintreehq/daintree.

1) Clone the repository

```bash
git clone https://github.com/daintreehq/daintree
cd daintree
less README.md
```

2) Install dependencies
- Check the README for the runtime (Node/Python/Go) and run the project-specific install command. Example placeholder:

```bash
# example - replace with the README command
./install-deps.sh  # or: npm install, pip install -r requirements.txt
```

3) Configure provider credentials and local settings
- Create a local config file; do not commit API keys. Example config (adjust keys per README and provider docs):

```yaml
# example config.yml
providers:
  claude:
    key: "CLAUDE_KEY_PLACEHOLDER"
  gemini:
    key: "GEMINI_KEY_PLACEHOLDER"
server:
  port: 8080
  concurrency: 3
  retry:
    max_attempts: 3
    backoff_ms: 500
```

4) Create a test git worktree

```bash
# create an isolated worktree for the agent task
git worktree add ../agent/refactor-alice main
cd ../agent/refactor-alice
git status
```

5) Start Daintree and open an agent session
- Use the project's start command shown in README (replace the placeholder with the real command from the repo):

```bash
# placeholder: replace with the repo's start command
./start-daemon.sh --config ../daintree/config.yml
```

- Open an agent session tied to the new worktree. The README documents session commands and UI elements: https://github.com/daintreehq/daintree.

6) Smoke test and rollout gates
- Ask an agent to make a small change. Run lint and unit tests locally. Require the relevant tests to pass.
- Canary: apply changes first to 1 canary worktree and observe for 24 hours.
- Rollback: if failures appear, revert within 30 minutes using git revert and disable the feature flag.

7) Governance and monitoring
- Track API spend, error rate, and latency. Suggested alert thresholds: error rate > 2%, latency > 2 s, monthly spend > $100.
- Document the decision table and permissions in the repo README for onboarding.

Repo reference: https://github.com/daintreehq/daintree

## Common problems and quick fixes

Auth errors (missing API key)
- Symptom: provider returns 401 or "missing key" errors.
- Fix: ensure your local config or .env is loaded and keys match names in the README (https://github.com/daintreehq/daintree). Rotate keys if needed.

Git worktree issues (stale or detached HEAD)
- Run:

```bash
git worktree list
git worktree prune
```

- Keep active worktrees <= 10 per dev.

Port conflicts
- If the server port (default 8080) is in use, change server.port to 8081 and restart. Expect a TCP health response in < 200 ms locally.

Rate limits / slow responses
- Apply exponential backoff: max_attempts: 3, backoff_ms: 500 -> 2000 ms.
- Alert if error rate > 2% or average latency > 2 s for code-generation calls.

Repo reference and troubleshooting tips: https://github.com/daintreehq/daintree

## First use case for a small team

Repository reference: https://github.com/daintreehq/daintree

Scenario: a 3-person team (Dev A, Dev B, Reviewer) runs an agent-driven refactor. Below are concrete, actionable steps for solo founders and small teams.

Actionable points (at least 3 concrete actions):
1. Start with a single canary worktree for experiments. Command:

```bash
git worktree add ../agent/canary-1 main
cd ../agent/canary-1
```

   - Keep only 1 canary at a time. This reduces context switches and keeps active worktrees <= 5.
2. Use strict gating: require a local CI pass (lint + unit tests) before any merge.
   - Run tests and the linter locally. If CI minutes are limited, run lightweight checks locally and reserve full CI for PRs.
3. Limit agent tokens and runtime per session.
   - Set a per-session token cap (e.g., 1,000 tokens) and a wall-clock limit (e.g., 5–10 minutes) to avoid runaway cost.
4. Easy review workflow for solo founders: create a PR from the agent worktree and review your own changes after a 10–30 minute cooling-off period.
   - Use a naming convention like agent/<task>-<owner> (e.g., agent/refactor-alice) to make history searchable.
5. Automate simple rollbacks: tag canary merges and keep a fast revert command ready (revert within 30 minutes if a regression appears).

Shared config advice:
- Keep non-secret defaults committed in examples/config.yml and secrets in a local .env file ignored via .gitignore.
- Add a short README section with the decision table and the expected approval gate: 1 human + CI pass + 24-hour canary.

See the project README for implementation details: https://github.com/daintreehq/daintree

## Technical notes (optional)

- The repository describes managing Claude, Gemini, and Codex sessions across git worktrees, with integrated terminals, context injection, and workflow automation (source: https://github.com/daintreehq/daintree).
- Treat injected file context as untrusted input. Sanitize paths and do not auto-commit secrets. Use a secrets manager in production.
- Monitoring suggestions: track API error rate, latency (ms), and spend ($). Suggested alert thresholds: error rate > 1–2%, latency > 2 s, monthly spend > $100.
- Automation hooks can create commits or PRs. Keep an explicit human-in-the-loop gate and limit auto-merges to canary worktrees.

Methodology note: claims above are grounded in the repository description linked repeatedly to the source: https://github.com/daintreehq/daintree.

## What to do next (production checklist)

### Assumptions / Hypotheses
- Assumption: Daintree provides session management for Claude/Gemini/Codex and ties sessions to git worktrees, per the README: https://github.com/daintreehq/daintree.
- Hypothesis: the repo exposes start/install commands that vary by runtime; verify the README before running commands.
- Hypothesis: workflow automation hooks exist that can be configured to open commits or PRs; confirm in the repository.

### Risks / Mitigations
- Risk: secret leakage (API keys committed). Mitigation: enforce .gitignore, use a secrets manager, and scan commits for tokens.
- Risk: runaway API costs. Mitigation: cap concurrent agents to 5, set per-session token limits (e.g., 1,000 tokens), and set monthly budget alerts (e.g., $50–$100).
- Risk: low-quality automated merges. Mitigation: require 1 human reviewer, CI pass, and a 24-hour canary observation window before wider rollout.

### Next steps
- Move provider keys to a secrets manager and delete local copies.
- Add telemetry: track API error rate, latency (ms), and spend ($); alert if error rate > 2% or latency > 2 s or spend > $100/month.
- Run a 1-week pilot with 1–3 people, up to 5 concurrent agents, and the gates above.
- Document the team workflow in the repo README and include the decision table and examples/config.yml for onboarding new developers.

Production go-live checklist:
- [ ] Secrets moved to vault and removed from local copies
- [ ] CI gates enforce lint/tests = pass
- [ ] Human approval required for agent-generated PRs
- [ ] Monitoring and budget alerts configured
- [ ] Pilot completed (1 week) and lessons captured

Repository reference and starting point: https://github.com/daintreehq/daintree
