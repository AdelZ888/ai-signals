---
title: "Foremerge: open-source coordinator that detects AI-agent intent conflicts before pull requests"
date: "2026-09-01"
excerpt: "Run Foremerge locally or in CI to record agents' intent JSON, use a .foremerge decision table to surface incompatible plans, and gate PRs so conflicts are resolved before code is written."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-01-foremerge-open-source-coordinator-that-detects-ai-agent-intent-conflicts-before-pull-requests.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "foremerge"
  - "ai-agents"
  - "git"
  - "ci"
  - "decision-table"
  - "open-source"
  - "devtools"
sources:
  - "https://github.com/naw103/foremerge"
---

## TL;DR in plain English

- Foremerge is an open-source coordination layer that aims to “Catch intent conflicts before code conflicts.” It sits above Git and collects agent intent before code is written. Source: https://github.com/naw103/foremerge.
- Why use it: when multiple coding agents or scripts plan changes, Foremerge surfaces incompatible plans early. That reduces surprise merge conflicts and rework.
- Quick path: run a local Foremerge service, have agents POST intent JSON to it, add a CI (continuous integration) check that queries Foremerge on pull requests (PRs), and store a decision table (.foremerge/decision-table.csv) in your repo.
- Start mode: monitoring-only (soft) for 1–2 weeks. Then switch to require-review. Then, if safe, switch to block.
- Concrete example: Agent A plans to remove a parameter from /v1/orders. Agent B plans to add a required parameter to /v1/orders. Foremerge flags an api-change intent conflict before any code is committed. The team triages and updates policy to require review for api-change.

### Plain-language explanation (quick)

Foremerge treats each agent's planned change as an "intent". Agents report intents as structured JSON instead of directly pushing code. Foremerge compares intents. If two intents cannot safely co-exist, Foremerge marks a conflict. The goal is earlier human or automated coordination so fewer broken builds and fewer late merge fixes.

## What you will build and why it helps

You will set up a small Foremerge coordinator (local or container), add a policy decision table in one repository, and add a CI workflow that asks Foremerge whether a PR is safe given recorded intents. The GitHub project describes itself as an open-source coordination protocol for coding agents built above Git: https://github.com/naw103/foremerge.

Why this helps:
- Detect incompatible plans earlier. Agents declare intent before producing code. That gives teams time to coordinate.
- Reduce rework. Teams can triage intent conflicts rather than resolving code merge conflicts after the fact.
- Stage enforcement. Start with monitoring, move to require-review, then optional blocking once policies are stable.

Deliverables:
- Foremerge service running locally or in a container.
- .foremerge/decision-table.csv in a repo to map intent types to actions.
- A CI workflow that calls Foremerge on PR events and enforces policy.

How Foremerge fits in a typical flow (simple scenario):
1. Agent sends intent JSON to Foremerge via HTTP POST.
2. Foremerge stores and analyzes intents against the decision table in the repo.
3. When a PR opens, CI calls Foremerge to check for intent conflicts and follows the decision table (allow, require-review, block).

Reference: https://github.com/naw103/foremerge

## Before you start (time, cost, prerequisites)

- Estimated time: ~120 minutes (2 hours) to get a basic instance and CI gate for one repo. Plan another 2–8 hours to tune policies and agent adapters.
- Cost: The code is open-source (no license fee). Expect infrastructure costs for a VM/container host and CI minutes. Public repo metadata at the time of writing: forks: 3, stars: 87 (see https://github.com/naw103/foremerge).

Prerequisites:
- Basic Git knowledge and a test repository.
- A CI (continuous integration) system such as GitHub Actions or GitLab CI that can call an HTTP endpoint from a job.
- At least one agent or script capable of sending an HTTP POST with an intent payload to Foremerge.

Pre-flight checklist:
- [ ] Clone https://github.com/naw103/foremerge
- [ ] Create .foremerge/config.yaml and .foremerge/decision-table.csv in your repo
- [ ] Add a CI workflow to query Foremerge on PR creation (PR = pull request)
- [ ] Run two smoke-test agent scripts to validate conflict detection

Note: The project page is the primary reference: https://github.com/naw103/foremerge

## Step-by-step setup and implementation

1. Clone the repo and inspect the README

```bash
git clone https://github.com/naw103/foremerge
cd foremerge
ls -la
# Read the README on the repo page: https://github.com/naw103/foremerge
```

2. Run a local Foremerge instance (container or binary)

- Check the repository for a quickstart, docker-compose, or binaries. If none are present, run a local container for testing.

```bash
# example: run a local container (adjust per repo docs)
docker run --rm -p 8080:8080 naw103/foremerge:local
# expect the HTTP API at http://localhost:8080
```

3. Add a repo-level policy and decision table

Create .foremerge/decision-table.csv in your application repo. Example rows:

```csv
intent_type,scope,action
api-change,endpoint,require-review
refactor,module,allow
breaking-change,public-api,block
```

Create .foremerge/config.yaml with connection details. Example:

```yaml
service:
  endpoint: "http://foremerge.example.local:8080"
  token: "REPLACE_WITH_TOKEN"
registry:
  url: "https://mcp-registry.example.local"
metrics:
  enabled: true
```

4. Configure agents to POST intent messages

Agents should send a JSON intent to the Foremerge HTTP API. Example curl call:

```bash
curl -X POST http://localhost:8080/intents \
  -H "Authorization: Bearer TOKEN123" \
  -H "Content-Type: application/json" \
  -d '{"agent":"agent-A","intent_type":"api-change","scope":"/v1/orders","details":"remove param x"}'
```

5. Add a CI check that queries Foremerge on PR creation

Create a CI workflow (example for GitHub Actions) that calls Foremerge when a PR opens or updates. The workflow should fail or mark the PR depending on the decision-table result.

Example workflow snippet (pseudo-yaml):

```yaml
name: Foremerge check
on: [pull_request]
jobs:
  foremerge:
    runs-on: ubuntu-latest
    steps:
      - name: Call Foremerge
        run: |
          curl -s -f -X POST "$FOREMERGE_URL/check" \
            -H "Authorization: Bearer ${{ secrets.FORMERGE_TOKEN }}" \
            -d '{"pr": "$GITHUB_REF"}' || exit 1
```

6. Validate with a smoke test

- Run two scripted agents that submit conflicting intents and confirm the CI check flags the PR. Expected: intent submissions -> Foremerge returns conflict -> CI job fails and annotates PR.

Rollout and rollback gates (recommended):
- Canary: enable on 1 repo or 10% of repos for 7 days.
- Feature flag: enforcement=monitoring for 14 days, then require-review for 14 days, then block if stable.
- Rollback: switch the feature flag back to monitoring and re-run the CI job.

Reference: https://github.com/naw103/foremerge

## Common problems and quick fixes

- Agents not sending intents
  - Check the endpoint URL and token. Test with the curl example above and expect HTTP 200 or 202 within 5 seconds.
- CI check passes unexpectedly
  - Verify .foremerge/decision-table.csv is in the correct path and readable by the runner. Confirm the CI runner can reach the Foremerge endpoint within 5,000 ms (5s).
- Permission errors
  - Ensure the CI token has required permissions to post statuses or write checks. Use a service account token scoped to the minimum necessary permissions.
- False positives
  - Use monitoring-only mode first. Add a human triage step before enabling hard blocks. A 24-hour triage SLA is a reasonable starting point.

Quick troubleshooting checklist:
- [ ] Endpoint reachable from CI within 5s
- [ ] Token valid and not expired
- [ ] decision-table.csv present under .foremerge/
- [ ] Agents use the agreed JSON schema

Reference: https://github.com/naw103/foremerge

## First use case for a small team

Scenario (concrete): two agents (Agent A and Agent B) intent to change the same public API endpoint. Agent A plans to remove a parameter. Agent B plans to add a required parameter. Both submit api-change intents. Foremerge detects an intent conflict before any code is committed.

Small-team playbook (2–3 people):
1. Foremerge annotates the PR and sends a conflict alert to Slack or email.
2. A triage owner reviews and sets the decision-table action to require-review for api-change if needed.
3. The team follows a 24-hour SLA for triage. If unresolved, escalate to the on-call maintainer.

Suggested decision-table row for this case (CSV format shown earlier):

| intent_type | scope      | action         | sla_hours |
|-------------|------------|----------------|-----------|
| api-change  | public-api | require-review | 24        |

Advice for a solo founder or very small team:
- Start with monitoring-only for 1–2 weeks and measure intent_conflict_rate.
- Use a simple target such as intent_conflict_rate < 2% before enabling hard blocks.
- Keep policy files in the repo so policy changes go through PRs and have an audit trail.

Reference: https://github.com/naw103/foremerge

## Technical notes (optional)

Plain-language summary first: Foremerge treats intent as a separate object from code. Agents translate proposed changes into typed intents (for example: api-change, refactor, breaking-change). A decision table maps intent types and scopes to actions (allow, require-review, block). The service is accessed by HTTP and secured with bearer tokens.

Advanced details:
- Positioning: Foremerge is a coordination protocol that sits above Git and makes intent first-class. See https://github.com/naw103/foremerge for the project description.
- Integration points: build agent adapters that turn proposed code edits into typed intents. Store tokens and endpoint configuration in .foremerge/config.yaml.
- Suggested metrics: intent_conflict_count (gauge), conflict_latency_ms (histogram). Alert if intent_conflict_rate > 5% across PRs/week or API latency > 500 ms p95.
- Security: protect intent submissions with bearer tokens. Rotate tokens regularly and apply least-privilege scopes.

Example metrics config (JSON) for an exporter:

```json
{
  "metrics": {
    "intent_conflict_count": "gauge",
    "conflict_latency_ms": "histogram"
  },
  "alerts": {
    "high_conflict_rate": {"threshold_pct": 5}
  }
}
```

Reference: https://github.com/naw103/foremerge

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository states the project goal and that it is built above Git: https://github.com/naw103/foremerge. Other items in this guide (CI configuration, decision-table format, rollout timings, VM sizing) are practical patterns and hypotheses. Validate them in your proof of concept (POC).
- Example numeric assumptions to validate: $0 license cost; 1 small VM for staging; 5s API latency target; triage SLA = 24 hours; rollout windows of 1–2 weeks per stage; target ROI = 30% fewer late merge conflict fixes in 30 days.

### Risks / Mitigations

- Risk: false positives block work. Mitigation: use monitoring-only for 1–2 weeks and require-review before blocking.
- Risk: CI or Foremerge service outage interrupts PR flow. Mitigation: set a service-level objective (SLO) for Foremerge, provide a manual override feature-flag to skip checks, and document rollback steps.
- Risk: tokens leaked. Mitigation: rotate tokens every 90 days and restrict CI secrets with least privilege.

### Next steps

Rollout plan (gated):
1. Canary: deploy to 1 repo (or 10% of repos) for 7 days.
2. Soft: monitoring-only for 14 days; collect intent_conflict_count and conflict_latency_ms.
3. Require-review: enable for 14 days; ensure triage SLA = 24 hours and conflict_rate < 5%.
4. Block: enable hard-blocks after 30 days of stable metrics and verified ROI.

Rollback plan: revert the feature flag to monitoring and re-run the CI job. Verify CI passes quickly and confirm worker nodes use the rollback token.

Operational checklist:
- Maintain policy changes via PR.
- Add a Prometheus alert for intent_conflict_rate > 5%.
- Document an incident runbook and schedule a 30-day ROI review.

Immediate next actions:
- [ ] Clone https://github.com/naw103/foremerge and run a local instance
- [ ] Add .foremerge/decision-table.csv to one test repo
- [ ] Add a CI workflow that calls Foremerge and aims for a 5s response target
- [ ] Run a two-agent smoke test and confirm conflict detection

Reference: https://github.com/naw103/foremerge
