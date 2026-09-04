---
title: "Run Crew locally: set up a sandbox agent to draft PRs from issues"
date: "2026-09-04"
excerpt: "Step-by-step guide to run the Crew repo locally, inspect .claude/skills and .github, and configure a narrow AI agent to draft PRs from issues while keeping human approval."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-04-run-crew-locally-set-up-a-sandbox-agent-to-draft-prs-from-issues.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "crew"
  - "github"
  - "tutorial"
  - "ai-agents"
  - "agent-workflow"
  - "local-setup"
  - "pull-requests"
sources:
  - "https://github.com/JamelHammoud/crew"
---

## TL;DR in plain English

- What this guide is: a concise, practical walkthrough to run and experiment with the Crew repository locally so people and narrow AI agents can collaborate on issues and produce draft pull requests (PRs). Repository snapshot: https://github.com/JamelHammoud/crew.
- Why it matters: the project layout includes agent "skills" and CI hints; the snapshot shows active history and repository cues you should inspect (for example, a .claude/skills folder and a .github folder are present). See the repo: https://github.com/JamelHammoud/crew.
- Quick result: clone the repo, inspect .claude/ and .github, follow the README for exact start commands, and experiment with a narrowly scoped agent in a sandbox repository (refer to the repo at https://github.com/JamelHammoud/crew).

Key things to check immediately: that .claude/skills and .github exist in the checkout and that the README directs the local start procedure (link: https://github.com/JamelHammoud/crew).

## What you will build and why it helps

- Build: a local instance of the Crew workspace and one narrowly scoped agent profile you control. Use the repository as your starting point (https://github.com/JamelHammoud/crew).
- Why it helps: a narrow agent can draft reproducible PRs or add triage comments so humans focus on review and decision-making while retaining the human gate.

Concrete artifact to produce (project-local): a single agent profile stored in the repository's skills directory and a documented, reproducible demo workflow that a human can run and verify. Inspect .claude/skills and .github in the repo for examples and CI hooks: https://github.com/JamelHammoud/crew.

Decision frame (short): keep privileges minimal, require human approval for merges, and run the agent only against a sandbox/fork until you have measurable safety signals.

## Before you start (time, cost, prerequisites)

Minimal local checklist (prepare these before running the demo):

- [ ] Clone the repository
- [ ] Inspect .claude/skills and .github in the checkout
- [ ] Read the repository README for exact start/install commands (link: https://github.com/JamelHammoud/crew)
- [ ] Pick a sandbox repo or fork for testing

Notes: the repository snapshot includes the folders to inspect (.claude/skills and .github) and an active commit history—start by following the repo README at https://github.com/JamelHammoud/crew for exact install and run commands.

## Step-by-step setup and implementation

Plain-language sequence (confirm exact commands in the project's README at https://github.com/JamelHammoud/crew): clone, inspect, follow install steps in README, configure runtime secrets as required, then run a demo flow that triggers a draft PR.

1) Clone and inspect the repository locally:

```bash
# clone and inspect the repository layout
git clone https://github.com/JamelHammoud/crew
cd crew
ls -la .claude .github || true
```

2) Follow the project's README for install and start steps: the snapshot includes a README and the repository root contains the folders mentioned above; confirm exact install and run steps there (see https://github.com/JamelHammoud/crew).

3) Add or adapt a single skill file in the local .claude/skills directory to exercise the demo flow. Keep the skill narrow and place it under the skills/ registry so the local runtime can discover it (refer to .claude/ in the repo: https://github.com/JamelHammoud/crew).

4) Start the local service according to the README, trigger a test issue or webhook, and observe whether the agent creates a draft PR (demo verification).

Rollback / canary example (use a pinned tag or feature flag if available):

```bash
# example rollback: move back to the last known good tag
git fetch --tags
git checkout tags/last-known-good -b rollback-test
# or disable the skill and restart according to the README
```

Implementation notes:
- Always pin experiments to a local branch or tag so you can revert quickly.
- Use the repository's .claude/skills and .github for examples and adaptation (https://github.com/JamelHammoud/crew).

## Common problems and quick fixes

Repository source: https://github.com/JamelHammoud/crew

Common issues and quick checks:

- Missing README or unclear start steps: open the repo README and follow the exact commands listed there (link: https://github.com/JamelHammoud/crew).
- Missing or mis-located skills: confirm .claude/skills exists in the checkout and that your new skill file is placed there.
- Authentication failures when calling external APIs: confirm any runtime secrets are configured per the project's README and not checked into the repo.
- Service won't start or port is in use: consult the README for how the project starts locally and free the port or change the runtime binding in your local configuration.

Quick troubleshooting checklist:
- [ ] Confirm README and startup steps in repo
- [ ] Confirm .claude/skills contains expected files
- [ ] Confirm any required secrets are provided to the runtime
- [ ] Run the local start command shown in the README

If you need to revert an agent or skill change, restore the file from a pinned commit or branch in your local clone and restart the local service.

## First use case for a small team

Repo reference: https://github.com/JamelHammoud/crew

Scenario: a small team wants agents to triage issues and prepare draft PRs so engineers focus on review. Start in a sandbox/fork and keep the agent scope minimal until you validate safety signals.

Decision table (qualitative) — use this to decide whether to expand agent scope:

| Observed signal | Decision | Action |
|---|---:|---|
| Low volume, high quality drafts | Expand slowly | Add one additional narrow skill or increase allowed repos by one |
| High volume, low quality | Restrict scope | Reduce triggering conditions and require stricter approval |
| Frequent errors | Pause | Roll back skill and investigate logs |

Practical advice: run agent experiments only against a fork or sandbox repo referenced from your local clone of https://github.com/JamelHammoud/crew, review every draft PR, and keep an explicit rollback plan.

## Technical notes (optional)

- The repository snapshot contains .claude/skills and .github folders; use those as the primary locations for agent definitions and CI hints (https://github.com/JamelHammoud/crew).
- Pin experiments to a commit or tag to avoid drift; the provided repository snapshot shows a large commit history—inspect the history and pick a stable point to base tests on (see the repo: https://github.com/JamelHammoud/crew).
- Monitor metadata and errors during tests and keep a documented rollback command for rapid remediation.

Performance and security targets are implementation decisions and are listed under Assumptions / Hypotheses below where numeric thresholds and timeframes are explicit.

## What to do next (production checklist)

### Assumptions / Hypotheses

The following concrete numbers and thresholds are proposed design assumptions for a conservative pilot. They are not asserted as repo facts but as a starting policy for experiments that use the repository at https://github.com/JamelHammoud/crew:

- Repository snapshot metrics observed: 13,295 commits, 26 stars, 1 fork (source: https://github.com/JamelHammoud/crew).
- Pilot timeline: 14 days.
- Pilot team size: 3–5 developers.
- Time to a running local demo: 30–120 minutes (depends on environment and README steps).
- Cost for a paid LLM during pilot: $5–$20 per day (if you attach a paid model).
- Canary fraction: enable agent on 1%–5% of incoming issues for first 3 days.
- Agent safety caps: max_prs_per_day = 5; require approval before merge.
- Model tuning defaults: temperature = 0.2 and max_tokens = 2048 for initial drafts.
- Interactive targets: metadata ops under 500 ms and model-call timeouts under 3,000 ms for responsive flows.
- Alert thresholds: >10 errors in 24h triggers an immediate rollback investigation.
- Secret policy: rotate API keys every 30 days and remove keys from repo; use a secrets manager.
- Audit cadence: weekly audits for the first 8 weeks after rollout.

Example agent config (example; adapt and store under .claude/skills in your local clone):

```yaml
# example: .claude/skills/issue-drafter.yaml (sample policy)
name: issue-drafter
role: assistant
allowed_actions:
  - create_draft_pr
  - add_comment
limits:
  max_prs_per_day: 5
  max_tokens: 2048
  temperature: 0.2
approval_required: true
```

### Risks / Mitigations

- Risk: agent executes unintended write actions or merges.
  - Mitigation: require approval_required = true; do not grant merge permissions; pin max_prs_per_day to a low number (e.g., 5) while testing.
- Risk: secrets leakage.
  - Mitigation: remove secrets from .env files in the repo, put keys in a secrets manager, and rotate every 30 days.
- Risk: high token spend or low-quality outputs.
  - Mitigation: cap max_tokens (e.g., 2048), reduce temperature (e.g., 0.2), and require human review before merging.
- Risk: production instability (error spike).
  - Mitigation: alert on >10 errors/24h, enable a canary fraction (1%–5%), and keep a pinned rollback tag ready.

### Next steps

- Harden secrets: move keys to a secrets manager and remove secrets from repository history.
- Pin to a stable commit or tag: pick a known-good SHA from the repository history (the snapshot shows many commits; choose and pin one locally).
- Implement monitoring: track PRs/day, API errors/24h, and 95th-percentile response latencies.
- Rollout path: sandbox-only → draft PRs with approval_required → conditional merge after meeting quality thresholds.
- Audit and rollback playbook: document weekly audits for 8 weeks and keep a rollback script that checks out a pinned tag.

Production checklist to complete:

- [ ] Move keys to a secrets manager
- [ ] Pin repo to a stable commit or tag
- [ ] Implement monitoring and alerts for errors and latencies
- [ ] Create a human review checklist for agent-drafted PRs
- [ ] Document rollback commands and feature-flag locations

Methodology note: this guide references repository cues and the public snapshot at https://github.com/JamelHammoud/crew for layout and history; exact install/start commands and runtime requirements must be taken from the project's README in that repo.
