---
title: "Agon — run competing AI code agents in isolated git worktrees and auto-apply validated fixes"
date: "2026-08-07"
excerpt: "Set up Agon to run multiple AI code models in isolated git worktrees, validate candidate fixes, auto-apply winners, and track model skill with Glicko-2 to route future work."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-07-agon-run-competing-ai-code-agents-in-isolated-git-worktrees-and-auto-apply-validated-fixes.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "agon"
  - "AI-coding"
  - "git-worktrees"
  - "Glicko-2"
  - "model-evaluation"
  - "automation"
  - "KERNlang"
sources:
  - "https://github.com/KERNlang/agon"
---

## TL;DR in plain English

- Agon runs multiple AI coding models on the same task and compares their outputs. See the project: https://github.com/KERNlang/agon
- Each model runs in an isolated git worktree (a separate working copy). The system tests each candidate, picks a winner, can auto-apply the winning change, and tracks model skill with Glicko-2 (a rating system): https://github.com/KERNlang/agon
- This turns one-off A/B edits into repeatable contests. Better models get routed more work. Over time the system learns which model is stronger for your tasks.
- Quick timelines you can expect: a 3-hour proof of concept (POC), a 14-day staging run to gather metrics, then a canary rollout in steps (for example: 5% -> 20% -> 100%).
- Keep POC tasks tiny: 5 lines or fewer or one file changes. Require tests to pass (100%) before any auto-apply.

Concrete example scenario:
- Task: fix a flaky unit test that fails when a helper returns None. Two models propose edits. Each edit is applied in its own git worktree and the validation script runs. The edit that makes tests pass wins and can be auto-merged if it meets your gates.

Methodology note: claims here are grounded in the repository snapshot at https://github.com/KERNlang/agon.

## What you will build and why it helps

You will build a minimal Agon pipeline that:

- launches agent processes that call models,
- runs each agent’s proposed code change in an isolated git worktree (separate working copy of the repo),
- validates each candidate with your test harness (unit tests or a verify script), and
- applies the winning change and updates that model’s rating using Glicko-2 (see the repo: https://github.com/KERNlang/agon).

Why this helps small teams and solo founders:

- Repeatability: the same task and tests become an empirical contest instead of a debate.
- Routing: models that win more contests get assigned more tasks via Glicko-2 tracking (https://github.com/KERNlang/agon).
- Focus: you can auto-apply tiny, low-risk fixes and keep human time for larger changes.

Concrete minimal artifact you should aim for: an agon-config.yaml that defines two agents, a small validation script, and an initial rating record.

Definitions on first use:
- POC: proof of concept.
- API: application programming interface.
- Glicko-2: a rating system (used to track which model performs best).
- Git worktree: a separate working copy of a Git repository used to isolate attempts.

## Before you start (time, cost, prerequisites)

Time estimates:

- PoC: ~3 hours to clone, configure, and run two models on small tasks.
- Staging run: 14 days to collect meaningful metrics.
- Canary phases: 48–72 hours per increment is common for low-risk signals.

Cost pointers:

- Agon is open-source (no license fee). Model API calls will incur provider charges. Plan budget and rate limits.
- Example budget guard: set an alert at $200/day during early testing.

Minimum prerequisites:

- A repository with a validation harness (unit tests or a verify script that returns non-zero on failure).
- Git with worktree support (Agon uses isolated worktrees: https://github.com/KERNlang/agon).
- Access to model endpoints or API keys.
- A branch or policy reserved for auto-applies and a service or bot account to perform merges.

Checklist to prepare:

- [ ] Clone https://github.com/KERNlang/agon
- [ ] Add API keys to runner secrets
- [ ] Prepare 3–10 small POC tasks (each <=5 lines or <=1 file)
- [ ] Create agon-config.yaml in the project root

Decisions to make before running:

- Max auto-apply size: e.g., 5 lines or 1 file.
- Minimum contests before routing a model: e.g., 10 contests.
- Staging duration: e.g., 14 days.
- Canary increments: e.g., 5% -> 20% -> 100%.

Reference: https://github.com/KERNlang/agon

## Step-by-step setup and implementation

Plain-language explanation before advanced details:

You will run a small agent runner that launches two model-backed agents. Each agent makes edits in its own worktree. The runner runs your validation script against each worktree. If an agent’s edit passes all gates and beats the other, the runner records the win, updates that agent’s Glicko-2 rating, and—if configured—auto-applies the change to your target branch.

1. Clone the Agon repo and inspect examples:

```bash
git clone https://github.com/KERNlang/agon
cd agon
less README.md
```

2. Prepare a tiny target repo or use an existing repo. Add a validation script that returns non-zero on failure. Keep tasks small: 0–5 lines, 1 file.

3. Create a minimal agon-config.yaml. Example:

```yaml
# agon-config.yaml (minimal)
agents:
  - name: model-a
    endpoint: "https://api.example.com/v1"
  - name: model-b
    endpoint: "https://api.other/v1"
task:
  validate: ./scripts/validate.sh
  max_lines_auto_apply: 5
ratings:
  initial_rating: 1500
  minimum_contests: 10
```

4. Run a local example or the provided runner per the repo examples (see README at https://github.com/KERNlang/agon). A simple run might look like:

```bash
# example runner invocation (adjust per repo examples)
./bin/agon run --config ./agon-config.yaml --tasks ./poc-tasks
```

5. Configure gates and auto-apply rules. Example gate policy to start with:

- Unit tests: 100% pass required.
- Linter score: >= 80.
- Change size: <= 5 lines and <= 1 file.
- Agent contests: >= 10 before routing production issues.

6. Hook to CI: run Agon on issue labels or a schedule. Example snippet for a GitHub Actions job:

```yaml
# .github/workflows/agon-run.yml
on:
  issues:
    types: [opened]
jobs:
  run-agon:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Agon
        run: |
          ./bin/agon run --config agon-config.yaml
        env:
          API_KEY: ${{ secrets.MODEL_API_KEY }}
```

7. Inspect logs and rating outputs after each contest. Track metrics such as merge success rate, post-merge failures, and reverts during your 14-day staging.

Reference: https://github.com/KERNlang/agon

## Common problems and quick fixes

Symptoms and fixes (quick reference):

| Symptom | Quick fix | Threshold / check |
|---|---:|---:|
| Worktree conflict | Serialize tasks touching same file or produce PR | if >2 conflicts/day trigger serialization |
| Unwanted auto-merge | Add extra validators or require human review | require human review if files_changed > 1 |
| Rating noise | Increase minimum_contests before routing | minimum_contests >= 10 |
| Cost spike | Throttle runs and set budget alerts | alert if spend > $200/day |

Other quick remedies:

- Worktree conflicts: detect concurrent edits to the same path and refuse simultaneous auto-apply. Fall back to PR mode.
- False positives: add linters, static analysis, or security scanners before auto-apply.
- API rate limits: implement token buckets or daily limits in your runner.

See repository behavior for isolation and rating: https://github.com/KERNlang/agon

## First use case for a small team

Target audience: solo founders and teams of 1–4 people. Goal: automate tiny fixes and keep humans for larger changes. Repo reference: https://github.com/KERNlang/agon

Concrete, actionable steps:

1) Start with exactly two models and one validation harness.
   - Run contests only for tasks limited to <=5 lines and 1 file.
   - Enforce unit tests == 100% before any auto-apply.

2) Build simple rollout and safety rules you can operate manually.
   - Canary schedule: 5% of eligible tasks for 48 hours, then 20% for 72 hours, then 100% after 14 days if gates pass.
   - Success gates: post-merge failure rate < 0.5% over 24 hours; revert rate < 2% over 7 days.

3) Keep automation low-cost and observable.
   - Cap daily spend alerts at $200 and throttle runs to avoid API spikes.
   - Log every auto-apply and surface a leaderboard with model rating and contests count (e.g., require rating >=1500 and contests >=10 before routing).

Operational tips you can apply today:

- Use one on-call reviewer who checks PRs for anything >5 lines or >1 file.
- Keep a short decision table in your repo README so everyone knows when auto-apply runs.

Decision table (size -> action):

| Change size (lines) | Files touched | Action |
|---:|---:|---|
| 0–5 | 1 | Auto-apply if tests == 100% and linter >= 80 |
| 6–20 | 1–2 | Create PR; require 1 reviewer |
| >20 or >2 files | any | Always require human review |

See core project for model-worktree behavior: https://github.com/KERNlang/agon

## Technical notes (optional)

- Isolation: Agon runs each agent attempt in an isolated git worktree so attempts are versioned and separated (see https://github.com/KERNlang/agon).
- Ratings: The project uses Glicko-2 to track model skill and route work to better-performing agents (repo: https://github.com/KERNlang/agon).
- Security: Treat model outputs as untrusted code. Run static analysis, secret scanning, and limit bot ACLs before auto-apply.
- Extensibility: Agents are processes that operate on worktrees; you can add adapters for different model APIs.

If you have many agents, monitor rating stability and consider tuning parameters after each agent has >10 contests.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository snapshot indicates Agon runs model attempts in isolated git worktrees and uses Glicko-2 to track winners and route future work: https://github.com/KERNlang/agon.
- Small-change auto-applies are safe if your validation harness (tests + linters) captures regressions for your target fixes.
- Budget and API rate-limit controls will be implemented outside of Agon in your CI or runner.
- Unchecked specifics (exact Git version, precise Glicko-2 parameter defaults) must be verified against your environment or the live repo.

### Risks / Mitigations

- Risk: bad code auto-applied. Mitigation: require tests == 100%, linter >= 80, and staged canary (5% -> 20% -> 100%).
- Risk: rating noise from too few contests. Mitigation: set minimum_contests = 10 before routing and collect at least 10–20 contests per agent before trusting the leaderboard.
- Risk: cost spikes from model calls. Mitigation: throttle runs and set daily spend alerts (e.g., $200/day) and hard limits in the runner.
- Risk: worktree conflicts. Mitigation: serialize edits to the same file or fall back to PR mode when conflicts >2/day.

### Next steps

- [ ] Run a 3-hour PoC: clone https://github.com/KERNlang/agon, add agon-config.yaml, and run two models on small tasks.
- [ ] Run a 14-day staging campaign to gather metrics: merge success rate, revert rate, and post-merge failures.
- [ ] Execute a canary rollout: 5% for 48h -> 20% for 72h -> 100% after 14 days if gates pass.
- [ ] Audit leaderboard and ratings weekly; adjust routing when an agent has >=10 contests and rating >=1500.

Reference and examples: https://github.com/KERNlang/agon
