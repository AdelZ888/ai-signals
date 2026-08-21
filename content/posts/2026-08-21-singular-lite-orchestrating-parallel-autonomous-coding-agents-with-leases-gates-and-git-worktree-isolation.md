---
title: "singular-lite: orchestrating parallel autonomous coding agents with leases, gates, and git-worktree isolation"
date: "2026-08-21"
excerpt: "Use singular-lite to run multiple autonomous coding agents on a repo: per-agent git-worktrees, lease-based concurrency, plus gates and audits to keep merges human-reviewed and auditable."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-21-singular-lite-orchestrating-parallel-autonomous-coding-agents-with-leases-gates-and-git-worktree-isolation.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "singular-lite"
  - "autonomous-agents"
  - "agent-orchestration"
  - "git-worktree"
  - "leases"
  - "gates"
  - "audits"
sources:
  - "https://github.com/alex-reysa/singular-lite"
---

## TL;DR in plain English

- singular-lite is an open-source engine that coordinates multiple autonomous agents to work on a git repository. See the project page: https://github.com/alex-reysa/singular-lite.
- It uses named primitives such as L0/L1/L2 agent roles, leases, gates, audits, git-worktree isolation, and detached dispatch. These terms come from the project page: https://github.com/alex-reysa/singular-lite.
- Start small. Run a short demo in a non-production repository. Observe behavior for a week before widening scope.

Example scenario: run three agents that lint, add tests, and propose merges in a fork. Let the system create pull requests (PRs) but require a human to approve the first few merges.

### Plain-language explanation

singular-lite wires together small automated workers (agents) so they can safely make changes to code. Each agent gets its own isolated workspace to avoid collisions. The controller hands out time-limited permissions (leases) so only a few agents change the same part of the repo at once. Gates let people stop risky merges. Audits record what happened.

This guide walks you through a minimal demo. It explains why each piece matters and shows commands and config you can copy.

## What you will build and why it helps

You will build a compact demo that shows a controller dispatching three cooperating agents on a sample repository. The demo highlights three features that reduce risk:

- git-worktree isolation: each agent uses its own working tree to avoid branch collisions.
- lease-based concurrency control: leases limit how many agents can edit the same resource at once.
- gates plus audit trails: human checks and recorded actions before merges.

Why this helps a small team:

- Automate low-risk tasks, like linting and small fixes. This saves reviewer time.
- Keep humans for policy-sensitive decisions by using gates.
- Prevent accidental overwrites by isolating agents' workspaces.

Quick decision table (example guidance)

| Role | Common tasks | Suggested max concurrent leases | Escalation rule |
|---|---:|---:|---:|
| L0 | Lint & formatting | 1–2 | Auto-create PRs; human review later |
| L1 | Add tests / scaffolding | 1 | Require L2 review |
| L2 | Policy enforcement & merge | 1 | Blocked -> manual approval |

Reference: project page with these concepts: https://github.com/alex-reysa/singular-lite.

## Before you start (time, cost, prerequisites)

- Time: plan a short hands-on demo session (1–3 hours). Expect 1–2 days to adapt to your repo for a basic integration.
- Cost: the code is published under GPL-3.0 and is free to use. Compute costs depend on your environment. A small VM or existing CI runner is usually enough. See license and repo: https://github.com/alex-reysa/singular-lite.
- Prerequisites: a git-compatible repository and basic git skills. If agents call an LLM (large language model), have the API key ready.

Quick preflight checklist

- [ ] Clone https://github.com/alex-reysa/singular-lite
- [ ] Confirm runtime and install steps from the repo README
- [ ] Ensure branch protection exists for production branches
- [ ] Provision a non-production repo or branch for the demo

## Step-by-step setup and implementation

1) Clone and inspect the repository

```bash
git clone https://github.com/alex-reysa/singular-lite demo/singular-lite
cd demo/singular-lite
ls -la
```

2) Install and start the controller per the repo README. The project page is the authoritative source for exact commands: https://github.com/alex-reysa/singular-lite.

3) Create a simple agents.yaml (demo config). Adapt names and tasks to your codebase.

```yaml
# agents.yaml (demo)
agents:
  - name: l0-lint-fix
    role: L0
    max_leases: 2
    task: lint-fix
  - name: l1-add-test
    role: L1
    max_leases: 1
    task: add-test
  - name: l2-review-merge
    role: L2
    max_leases: 1
    task: review-merge
gates:
  protected_branches:
    - main
  merge_policy:
    manual_approval_first_n: 5
    test_pass_threshold: 95
```

4) Start agents in detached mode per the README. Detached dispatch means the controller schedules work and agents run asynchronously. Confirm the controller can list leases and tasks. See the repo: https://github.com/alex-reysa/singular-lite.

5) Exercise gates and audits. Run the demo, open PRs, and confirm audit entries are recorded in your configured audit path.

Notes: keep the demo in a non-production fork or branch while you tune settings.

## Common problems and quick fixes

- Agents conflict on the same branch
  - Fix: reduce max_leases and enable git-worktree isolation. See the repo for isolation notes: https://github.com/alex-reysa/singular-lite.
- Gate never allows merge due to flaky tests
  - Fix: require a pass rate over a window (for example, 95% over several runs) or add a flaky-test allowance.
- Detached agents appear to hang
  - Fix: restart the controller; check agent logs and OS process limits. Implement a restart backoff (for example, 30s).
- Audit logs not written
  - Fix: check write permissions and the configured audit path. If audits are sent to an external store, verify network connectivity and credentials.

Quick troubleshooting checklist

- [ ] controller process running
- [ ] leases list shows expected counts
- [ ] git-worktree directories present
- [ ] audit files updated recently

Reference for concepts: https://github.com/alex-reysa/singular-lite.

## First use case for a small team

Scenario: a solo founder or a 2–3 person team wants to reduce review overhead while keeping tight control.

Concrete, actionable steps for a small team:

1) Start in one non-critical repository or a fork. Clone the project and run a demo there: https://github.com/alex-reysa/singular-lite. Observe the demo for 7–14 days before changing production rules.

2) Use conservative lease limits. Example actions:
   - Configure L0 agents with max_leases = 1.
   - Configure L1 and L2 with max_leases = 1 for protected branches.
   - If behavior is safe after 7 days, consider increasing L0 to 2.

3) Force human approval for the first N merges. Example: set manual_approval_first_n = 5 in the merge_policy and require at least one human reviewer for those first 5 automated merges.

4) Automate rollback and alerts. Example actions:
   - Add an alert when merge failures exceed 3 in 24 hours.
   - If the alert fires, disable auto-merge and require manual intervention.

5) Keep audit logs local and verify retention policy (for example, retain 30 days). Verify write permissions after deployment.

Why this sequence helps: it limits the blast radius, preserves human control during initial rollout, and lets you expand automation only after you see stable behavior.

Reference: the repository lists the orchestration primitives used here: https://github.com/alex-reysa/singular-lite.

## Technical notes (optional)

Key terms and short definitions (from the project page):

- L0/L1/L2: named agent role levels used by the project to describe task responsibilities.
- Leases: a concurrency primitive that limits how many agents may touch a resource at once.
- Gates: policy checkpoints, for example requiring tests to pass before merge.
- Audits: recorded traces of agent actions.
- git-worktree isolation: a technique giving each agent an isolated working tree to avoid branch collisions.
- Detached dispatch: the controller schedules tasks and agents execute asynchronously.

See the repository for these terms: https://github.com/alex-reysa/singular-lite.

Example environment binding (illustrative):

```json
{
  "LLM_KEY_ENV": "OPENAI_API_KEY",
  "AGENT_RUNTIME": "node",
  "AUDIT_PATH": "./audits"
}
```

Security note: run agents with least privilege. Keep secrets in a secrets manager and grant tokens only the scopes they need to create branches or open PRs.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The project page advertises L0/L1/L2, leases, gates, audits, git-worktree isolation, and detached dispatch: https://github.com/alex-reysa/singular-lite. The numeric thresholds and example filenames in this guide are operational suggestions for a demo and testing, not claims extracted from the repository.
- Suggested thresholds for rollout and monitoring (examples used below): 3 agents, 1–2 leases, manual_approval_first_n = 5, test_pass_threshold = 95%, retain audits 30 days, observe 7–14 days before expansion, alert if merge failures > 3/24h, agent error rate alert at > 5%, cost estimate $1–$5 for a short VM run. These are planning hypotheses.

### Risks / Mitigations

- Risk: agents make unwanted merges. Mitigation: set manual_approval_first_n = 5 and keep branch protection enabled.
- Risk: concurrency causes flaky test runs. Mitigation: set conservative lease limits (1–2), monitor test pass rate, and alert if failures exceed your threshold.
- Risk: license obligations (GPL-3.0). Mitigation: include the LICENSE file and consult legal before redistribution. Source: https://github.com/alex-reysa/singular-lite.

### Next steps

- Run a local demo: clone https://github.com/alex-reysa/singular-lite and follow the README to start the controller.
- Create a single agents.yaml (copy the sample above) and test with three agents in a non-production repo for 7–14 days.
- Instrument monitoring: set alerts for merge failures > 3 in 24h, agent error rate > 5%, and audit-write failures.
- After two weeks of stable behavior, increase lease concurrency incrementally (for example, +1 every 7 days) and expand auto-merge scope carefully.

Production checklist

- [ ] Audit logging verified and retention set to >= 30 days
- [ ] Branch protection enabled for main and release branches
- [ ] Manual approval required for first 5 agent merges
- [ ] Alerts configured: merge failures (>3/24h), agent error rate (>5%), audit failures
- [ ] Legal review for GPL-3.0 compliance (include LICENSE)

References: singular-lite project (concepts and license) — https://github.com/alex-reysa/singular-lite.
