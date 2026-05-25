---
title: "Musts — A CI validation loop that blocks merging of AI-created pull requests until validators pass"
date: "2026-05-25"
excerpt: "Practical Musts guide: configure a fast CI validation loop (lint, tests, commands) so AI-opened pull requests are blocked from merging until checks pass. Includes setup and rollout tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-25-musts-a-ci-validation-loop-that-blocks-merging-of-ai-created-pull-requests-until-validators-pass.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "validation"
  - "ci"
  - "open-source"
  - "testing"
  - "devtools"
  - "developer-experience"
sources:
  - "https://github.com/bitomule/musts"
---

## TL;DR in plain English

- Musts is an open-source validation loop that stops AI coding agents from marking work done before checks actually run. See the repo: https://github.com/bitomule/musts
- What it does: when an agent opens a pull request (PR), Musts runs validators (lint, unit tests, custom commands). If validators fail, the PR is blocked from merging. See examples at https://github.com/bitomule/musts.
- Start small: add a short list of fast validators first. Keep the gate quick so reviewers are not delayed.

Quick scenario (concrete example): an AI assistant opens a PR that changes JavaScript files. Your CI runs a lint validator and unit tests via Musts. Lint fails with a missing semicolon. The PR stays blocked. A human fixes the lint issue, or the agent creates a new commit. Only after validators pass can the PR be merged.

Methodology note: this guide follows the Musts repo description and common CI/validation patterns. See https://github.com/bitomule/musts.

## What you will build and why it helps

You will build a reproducible validation loop that runs when an AI agent submits code in a PR. The Musts repo summarizes the idea: "The validation loop that stops AI coding agents from claiming work is done before it actually is." See https://github.com/bitomule/musts.

Why this helps:

- Fewer wasted reviews: failing PRs are blocked before humans spend time reviewing.
- Faster feedback: automated checks run the same way every time and return clear results.
- Clear decisions: a simple mapping from validator results to actions makes reviewer expectations explicit.

Acceptance-decision table (example):

| Validator result | Action | Human review required |
|---|---:|---:|
| pass | merge allowed | no |
| warn | merge allowed (optional) | 1 reviewer suggested |
| fail | block merge | required (1 reviewer) |

Reference samples and patterns are available in the Musts repo: https://github.com/bitomule/musts.

## Before you start (time, cost, prerequisites)

Checklist (prerequisites):

- [ ] A repository with a working test command (for example, npm test or pytest) that returns exit code 0 on success. See https://github.com/bitomule/musts.
- [ ] A CI system (Continuous Integration) where you can add jobs and required status checks (e.g., GitHub Actions, GitLab CI).
- [ ] Permission to edit branch protection rules for the branch you want to protect.
- [ ] An automation or AI agent that opens PRs. Agents should create PRs rather than marking tasks done locally.

Time and cost notes (high level):

- Use existing CI minutes where possible to avoid extra cost.
- Heavy integration tests on cloud VMs will increase cost. Evaluate on your billing dashboard before scaling.
- Start with fast checks to limit both cost and merge latency. See repo examples: https://github.com/bitomule/musts.

## Step-by-step setup and implementation

Plain-language explanation before advanced details:

When a PR is opened, your CI runs the Musts job. Musts reads a config file that lists validators. Each validator is a command (for example, lint or unit tests). Musts runs each validator, collects results, and sets a status check. Branch protection can require that status check to pass before merging. If any validator fails, the status check blocks the merge.

Advanced details follow if you want to implement this end-to-end.

1. Clone the Musts repo and inspect examples:

```bash
git clone https://github.com/bitomule/musts.git
cd musts
ls -la
```

2. Add a minimal musts configuration file to your project (example .musts.yml):

```yaml
# .musts.yml
validators:
  - id: lint
    cmd: "npm run lint"
    timeout_ms: 300000
    severity: fail
  - id: unit
    cmd: "npm test --silent"
    timeout_ms: 600000
    severity: fail
thresholds:
  flaky_retry: 2
```

Save this file as .musts.yml in your repository root. The Musts repo includes templates and examples: https://github.com/bitomule/musts.

3. Add a CI job that runs Musts on PRs. Example GitHub Actions job:

```yaml
# .github/workflows/musts.yml
name: musts-validator
on: [pull_request]
jobs:
  musts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: npm ci
      - name: Run musts validators
        run: npx musts run --config .musts.yml
```

This job checks out the code, installs dependencies, and runs Musts with your config.

4. Make the agent open PRs and wait for CI status. A simple polling script example (adapt to your tooling):

```bash
# poll-pr-status.sh
PR_NUMBER=$1
POLL_INTERVAL=30
TIMEOUT=1800
elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
  status=$(gh pr view $PR_NUMBER --json status --jq '.status')
  if [ "$status" = "SUCCESS" ]; then
    echo "Validators passed"
    exit 0
  fi
  sleep $POLL_INTERVAL
  elapsed=$((elapsed + POLL_INTERVAL))
done
echo "Timeout waiting for validators"
exit 1
```

This script uses the GitHub CLI (gh) to poll the PR status. Adjust the tool and queries if you use another platform. See https://github.com/bitomule/musts for guidance.

5. Enforce branch protection. Require the Musts status check on the protected branch so merges are blocked until validators pass. The Musts repo includes examples and guidance: https://github.com/bitomule/musts.

6. Rollout plan (suggested practice): enable Musts on a non-critical repository first. Monitor behavior, then expand to other repos.

## Common problems and quick fixes

Flaky tests
- Symptom: tests fail intermittently and block merges.
- Quick fixes: identify flaky tests, add targeted retries, or mark them as flaky to address later. Musts supports retry patterns. See examples at https://github.com/bitomule/musts.

Slow validators
- Symptom: the gate is slow and delays reviewers.
- Quick fixes: split checks into a fast gate (must pass) and slower post-merge checks (optional). Keep the gate focused on fast, deterministic checks.

Agent ignoring validation
- Symptom: automation reports a task done while CI still fails.
- Quick fixes: require agents to open PRs and poll CI status. Enforce branch protection so merges cannot bypass the loop.

Quick fixes cheat-sheet:

| Symptom | Quick fix | Target outcome |
|---|---|---:|
| Flaky unit tests | mark and retry | fewer false blocks |
| Long gate time | move heavy checks post-merge | faster reviews |
| Agent bypass | require branch protection | no bypass allowed |

More patterns and templates are in the Musts repo: https://github.com/bitomule/musts.

## First use case for a small team

Use case: solo founders or small teams (1–3 people) that accept PRs from an AI assistant and want minimal friction.

Three concrete steps for a small team:

1) Start in a fork or non-critical repo and run only one fast validator.
   - Action: add a single lint validator in .musts.yml and run it on PRs. See https://github.com/bitomule/musts for examples.
   - Why: keeps the gate under a minute and reduces noise while you evaluate the agent.

2) Keep humans in the loop but lightweight.
   - Action: require 1 human reviewer only for blocking failures; allow auto-merge on pass. Configure branch protection accordingly.
   - Why: keeps oversight without daily overload for the team.

3) Automate PR polling and quick rollback.
   - Action: have the agent poll PR CI status (use the example script above) and label or abort PRs after a timeout. If a validator blocks many PRs, temporarily disable that check and file a bug to fix the root cause.
   - Why: prevents the agent from declaring work done prematurely and provides a clear fallback path.

Practical checklist for rollout:

- [ ] Add .musts.yml with a single fast validator (lint).
- [ ] Add CI job to run Musts on pull_request.
- [ ] Configure branch protection to require the Musts check on a non-critical branch.
- [ ] Make the agent open PRs and poll status before claiming completion.

Examples and starter templates: https://github.com/bitomule/musts.

## Technical notes (optional)

- Keep the .musts.yml config at the repository root so CI jobs can find it. See samples in the Musts repo: https://github.com/bitomule/musts.
- Run validators in sandboxed CI runners when possible. Limit runner permissions and network egress for code coming from agents.
- Save validator logs and artifacts for troubleshooting. The Musts repo shows sample logging and artifact patterns: https://github.com/bitomule/musts.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The Musts repo provides the validation-loop concept and quickstart examples (https://github.com/bitomule/musts). This guide assumes you can adapt those examples to your CI.
- Suggested starting targets to validate in your environment: 2 validators; gate runtime target < 300000 ms (5 minutes); initial integration effort ≈ 120 minutes; retry policy = 2 attempts; agent poll interval 30 s; agent poll timeout 1800 s; rollout canary = 7 days; evaluation window = 14 days; target pass rate >= 98%.

### Risks / Mitigations

- Risk: increased merge latency. Mitigation: run only fast validators in the gate and move heavy checks post-merge.
- Risk: flaky tests cause false blocks. Mitigation: add retries, flag flaky tests, and invest in flakiness reduction.
- Risk: running untrusted agent code in CI. Mitigation: use sandboxed runners, restrict permissions, and run static checks first.

### Next steps

- Canary: enable Musts on one non-critical repository for 7 days and collect metrics for 14 days.
- Track: validator pass rate (%), false-positive rate (%), median PR merge latency (minutes), and reviewer load (PRs/week).
- Rollout: if thresholds meet your acceptance criteria, expand to more repositories in phases and add heavier checks behind feature flags.

For configuration examples and issue templates, use the Musts repo as a starting point: https://github.com/bitomule/musts
