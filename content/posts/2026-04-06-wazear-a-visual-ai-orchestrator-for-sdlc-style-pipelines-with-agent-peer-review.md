---
title: "Wazear: a visual AI orchestrator for SDLC-style pipelines with agent peer review"
date: "2026-04-06"
excerpt: "Create a project, paste a brief, assign role-based agents (planner, architect, implementer, reviewer), wire peer-review links, then run or pause the visual AI pipeline to inspect outputs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-06-wazear-a-visual-ai-orchestrator-for-sdlc-style-pipelines-with-agent-peer-review.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Wazear"
  - "AI orchestrator"
  - "agents"
  - "peer review"
  - "visual pipeline"
sources:
  - "https://news.ycombinator.com/item?id=47624203"
---

## TL;DR in plain English

- Wazear is a visual AI orchestrator. It lets you build a small pipeline that looks like an SDLC (software development lifecycle). See the announcement: https://news.ycombinator.com/item?id=47624203.

- How it works, simply:
  - Create a project and paste a short brief (one paragraph or a 1-page note).
  - Add agents. An "agent" is an automated role (planner, architect, implementer, reviewer).
  - Wire which agent reviews which other agent's output. You can pause the pipeline at any point and inspect results. Source: https://news.ycombinator.com/item?id=47624203.

- Quick starter checklist:
  - [ ] create project
  - [ ] paste brief (1–3 acceptance criteria)
  - [ ] add 2–4 agents and name roles
  - [ ] wire review links
  - [ ] run, pause, inspect outputs

Short scenario: run a 4-node flow (Planner → Architect → Implementer → Reviewer). Pause at the Reviewer node. Save the review log and attach it to the ticket. See the project announcement: https://news.ycombinator.com/item?id=47624203.


## What you will build and why it helps

You will build a small end-to-end visual AI pipeline in Wazear. The pipeline models planning → design → implementation → review. Each agent has a role. You can configure which agent reviews which other agent. The Show HN announcement describes creating a project, adding a brief, selecting agents, and wiring review connections: https://news.ycombinator.com/item?id=47624203.

Why this helps small teams:

- It makes handoffs explicit. You can see who checks what and when.
- It records reviewer feedback. Those logs can be attached to PRs or tickets.
- It lets humans stop the flow at checkpoints to avoid wasted runs.

If you see the word "UI," that means user interface. The announcement shows a visual workspace users interact with: https://news.ycombinator.com/item?id=47624203.


## Before you start (time, cost, prerequisites)

Note: the announcement describes the product features. Check vendor pages for pricing and account details: https://news.ycombinator.com/item?id=47624203.

| What | Why | Notes |
|---|---:|---|
| Brief (1 page max) | Keeps runs focused | Include 1–3 acceptance criteria and a simple success test |
| Agent-role list | Clarifies responsibilities | Start with 2–4 roles (e.g., planner, architect, implementer, reviewer) |
| Account / workspace | Needed to create projects | Sign in or request access to the Wazear workspace |
| Storage for logs | For audit and traceability | S3, a Git repo, or your issue tracker works well |

Prerequisites: access to the Wazear UI/workspace, a short brief, and somewhere to export or store logs. The announcement shows creating projects, adding briefs, and wiring agents in the visual workspace: https://news.ycombinator.com/item?id=47624203.

Estimated time to a first dry run: plan 60–90 minutes for setup and one test execution. Verify pricing and API limits on the vendor site before scheduling repeated runs: https://news.ycombinator.com/item?id=47624203.


## Step-by-step setup and implementation

1. Create a project and paste the brief.
   - Keep it short and testable. Add 1–3 acceptance criteria. The announcement mentions creating a project and adding a brief in the visual workspace: https://news.ycombinator.com/item?id=47624203.

2. Add agents and assign roles.
   - Start simple: planner, architect, implementer, reviewer. Give each agent one-sentence role descriptions.

3. Wire review links.
   - Configure which agent reviews which other agent's outputs. The product highlights peer-review mappings in the visual flow: https://news.ycombinator.com/item?id=47624203.

4. Add run controls and gates.
   - Place pause points (manual approval after key reviews). Add a guard such as max iterations to avoid endless loops. Export logs for audit if you plan to keep an external trail.

5. Run the pipeline and inspect outputs.
   - Use the visual flow to pause at nodes, inspect and annotate outputs, then resume or change the brief and re-run.

Methodology note: these steps map the features described in the Show HN announcement to a small-team workflow; the announcement is the source for the visual pipeline and peer-review model: https://news.ycombinator.com/item?id=47624203.

Example commands to archive exports locally (replace PROJECT_ID with your value):

```bash
# create a folder for exports
mkdir -p ./wazear-exports
# fetch a project export (placeholder URL shown)
curl -o ./wazear-exports/project.json "https://wazear.space/project/export?id=PROJECT_ID"
# open the project UI
xdg-open "https://wazear.space/project/PROJECT_ID"
```

Example review mapping config (JSON):

```json
{
  "project": "feature-landing-1",
  "agents": ["planner", "architect", "implementer", "reviewer"],
  "reviews": {
    "architect": ["planner"],
    "implementer": ["architect"],
    "reviewer": ["implementer", "planner"]
  },
  "gates": {
    "manual_approval_after_first_review": true,
    "max_iterations": 3
  }
}
```


## Common problems and quick fixes

- Outputs are vague or off-target.
  - Fix: tighten the brief. Add one clear acceptance test. Pause the pipeline and edit the brief. (Announcement: brief-first flow): https://news.ycombinator.com/item?id=47624203.

- Reviewer loops or repeated rework.
  - Fix: set max_iterations (e.g., 3) and add a manual approval gate after the first review.

- Pipeline stalls at a checkpoint.
  - Fix: open the node output in the UI, capture the log, then either resume or escalate to a human.

- Incorrect reviewer assignment.
  - Fix: update the review mapping in the project and re-run the affected node.

For discussion, early feedback, and user reactions see the Show HN post and comments: https://news.ycombinator.com/item?id=47624203.


## First use case for a small team

Target: solo founders and teams of 2–4. The announcement shows an agent-based review model that fits small teams: https://news.ycombinator.com/item?id=47624203.

Concrete, actionable steps for solo founders / tiny teams:

1) Start with a minimal pipeline (2 agents).
   - Use Planner → Reviewer only. The planner writes the brief and the reviewer checks acceptance criteria. Run one draft and inspect the review log.

2) Use manual approval and low-run limits.
   - Keep automatic resume off. Limit runs to 5 per day while iterating. Export each run and save it with a timestamp.

3) Save and attach logs to tickets.
   - Store per-run exports in a small Git repo or S3 bucket. Link the export in your issue tracker so a single person can trace decisions.

Team rollout checklist (example):

- [ ] Assign owners for each agent role
- [ ] Draft the brief (1–3 acceptance criteria)
- [ ] Configure review links (reviewer checks planner)
- [ ] Run with manual approval after first review
- [ ] Save the review log and attach to the sprint ticket

Canary plan for a small team: run the pipeline on a single feature (one project) for one week. Keep manual gates. If reviewer pass rate (manual checks) ≥ 80% for two runs in a row, try adding an architect agent. Source: feature model described in the announcement: https://news.ycombinator.com/item?id=47624203.


## Technical notes (optional)

Plain-language intro before advanced details:
If you are comfortable with technical controls, use them to limit cost and loops. The simple controls are: stop points, max iterations, and external log storage. Below is a bit more detail for people who will configure the pipeline.

- Nodes = agents. Edges = review links.
- You can pause nodes and resume the graph in the UI.
- Export per-step outputs and store them outside the workspace for traceability.

Acronyms and short definitions used here:
- SDLC: software development lifecycle — the typical sequence of planning, designing, building, testing, and reviewing.
- UI: user interface — the visual workspace you interact with.
- LLM: large language model — an AI model that may be used inside agent implementations (if applicable).

Operational controls to add to your pipeline config: max_iterations, manual_approval gates, log retention policy, and a daily run cap. Verify vendor behavior and limits in your workspace before large runs: https://news.ycombinator.com/item?id=47624203.


## What to do next (production checklist)

### Assumptions / Hypotheses

- The product provides a visual UI to create a project, add a brief, add agents, wire peer-review links, and pause/resume the pipeline (source: https://news.ycombinator.com/item?id=47624203).
- Suggested operational thresholds to use as starting points (treat these as hypotheses you must validate in your environment):
  - Dry-run time budget: 90 minutes per pipeline validation.
  - Agent count to start: 2–4 roles.
  - Max automated iterations: 3.
  - Manual review timebox: 30 minutes per checkpoint.
  - Canary scope: 5% of drafts or 1 small team.
  - Error/rework threshold for rollback: 30%.
  - Daily run cap for cost control: 500 runs/day.
  - Example token/context limit to plan against: 2048 tokens (if your agents use LLMs).

These numbers are operational suggestions to configure rollouts. Verify product defaults, pricing, and any API limits on the vendor site before production use: https://news.ycombinator.com/item?id=47624203.

### Risks / Mitigations

- Risk: automated agent reviews give incorrect pass/fail decisions.
  - Mitigation: keep manual-approval gates for public outputs; limit automatic resume and use max_iterations = 3.

- Risk: uncontrolled cost from repeated or high-volume runs.
  - Mitigation: set a daily run cap (e.g., 500 runs/day), monitor run counts and token usage, and alert on spikes.

- Risk: missing audit trail.
  - Mitigation: export per-run logs to external storage (S3 or Git) and retain for at least 90 days. Tag exports with project and run IDs.

### Next steps

- Verify Wazear workspace access and run a single small pipeline (planner → reviewer) to validate the workflow: https://news.ycombinator.com/item?id=47624203.
- Define your short acceptance criteria and put them in the brief.
- Add CI hooks or manual steps: run the pipeline on draft PRs and require a manual approval gate before merge.
- Instrument metrics: run counts, pass rate, rework rate. Set alerts on thresholds (e.g., >30% rework).

Final note: this guide maps the features shown in the Show HN announcement to a practical small-team workflow. Confirm product details and pricing in your workspace before making production decisions: https://news.ycombinator.com/item?id=47624203.
