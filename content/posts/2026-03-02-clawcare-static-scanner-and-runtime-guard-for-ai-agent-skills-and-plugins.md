---
title: "ClawCare: Static scanner and runtime guard for AI agent skills and plugins"
date: "2026-03-02"
excerpt: "ClawCare scans AI agent skills for risky patterns before merge and runs a runtime guard to block dangerous commands in real time. Includes CI gate guidance and deploy tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-02-clawcare-static-scanner-and-runtime-guard-for-ai-agent-skills-and-plugins.jpg"
region: "FR"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "security"
  - "ai-agents"
  - "runtime-security"
  - "devsecops"
  - "ci"
  - "python"
  - "clawcare"
  - "tutorial"
sources:
  - "https://github.com/natechensan/ClawCare"
---

## TL;DR in plain English

- ClawCare is an open-source security scanner described as "Security scanner for AI agent skills and plugins" on its project page: https://github.com/natechensan/ClawCare.
- Practical short actions:
  - Scan any new skill before merging it into main. See the repo: https://github.com/natechensan/ClawCare.
  - Add a CI gate that fails on high-risk findings (configured in your CI system). Refer to the repository: https://github.com/natechensan/ClawCare.
  - Run a runtime guard in development to observe blocked calls before wider rollout (see Assumptions / Hypotheses below for deployment examples).

Concrete example (plain language): if a skill pipes an external download into a shell (e.g., "curl ... | sh"), treat it as high-risk, quarantine the skill, and require human review. Source: https://github.com/natechensan/ClawCare.

Methodology note: example commands and config below are illustrative; see Assumptions / Hypotheses for which CLI names, flags, and thresholds are proposed rather than asserted. See the repo for the project definition: https://github.com/natechensan/ClawCare.

## What you will build and why it helps

Goal: add a layered safety system around agent skills/plugins so malicious or dangerous actions are caught before they execute in production. The project page describes that aim: https://github.com/natechensan/ClawCare.

Deliverables you should produce (high level):
- A machine-readable scan report (JSON) that records findings and counts.
- A simple policy file (YAML) mapping findings to actions such as allow, warn, or block.
- Runtime guard logs (JSON) recording blocked or monitored calls during execution.

Comparison: static scan vs runtime guard vs CI gate

| Layer | Purpose | When it fires | Typical action |
|---|---:|---|---|
| Static scan | Find risky patterns before run | Pull request / pre-merge | Block or require review |
| Runtime guard | Observe/stop behavior at call time | During execution | Block, log, or alert |
| CI gate | Automate pre-merge enforcement | On push / PR | Fail build / require exception |

Why this helps: the repo frames the tool as a scanner for agent skills/plugins; combining static + runtime checks gives two independent detection points, reducing the chance an attack executes without detection. See: https://github.com/natechensan/ClawCare.

## Before you start (time, cost, prerequisites)

Reference: https://github.com/natechensan/ClawCare.

Time estimates (planning guidance):
- Local trial: ~60 minutes.
- Add CI gate: 1–2 hours of configuration and testing.
- Staged rollout and monitoring: 1–2 weeks.

Prerequisites:
- Read access to the repo or codebase containing the skills/plugins you will scan (example project: https://github.com/natechensan/ClawCare).
- A build runner or CI where you can add a job (self-hosted or hosted).
- Admin or owner access to the agent runtime if you plan to attach runtime guards.

Minimum environment:
- Python 3.10+ recommended for local tooling (see Assumptions / Hypotheses for exact runtime requirements).

Preflight checklist:
- [ ] Confirm you can clone the target repo and the scanner project at https://github.com/natechensan/ClawCare.
- [ ] Have a CI runner where you can add a job that runs on push and pull_request.
- [ ] Identify an owner who can review and approve blocked findings.

Cost note: the ClawCare codebase is open source on GitHub (no license fee reported at that URL), but cloud agents, hosted APIs, or extra services you use may incur charges. See the project link: https://github.com/natechensan/ClawCare.

## Step-by-step setup and implementation

Reference: https://github.com/natechensan/ClawCare.

High-level steps you will perform:
1) Install or make available a scanner client for your environment.
2) Run a full scan of the skills directory and produce a JSON report.
3) Create a small policy mapping finding categories to actions.
4) Add a CI job that runs the scan on PRs and fails for high-risk findings.
5) (Optional) Enable a runtime guard in a development runtime and collect logs.

Illustrative commands (example only):

```bash
# create a virtual environment and activate it (illustrative)
python3 -m venv .venv
source .venv/bin/activate
# example install command (illustrative)
pip install clawcare
```

Example scan invocation (illustrative):

```bash
# example CLI usage (illustrative)
clawcare scan ./skills --output scan-results.json
```

Example policy (illustrative YAML):

```yaml
# policy.yaml (example)
version: 1
rules:
  - id: block-pipe-to-shell
    severity: high
    patterns:
      - "| sh"
      - "curl .* | sh"
  - id: env-exfil
    severity: high
    patterns:
      - "os.environ"
```

Example CI job snippet (illustrative GitHub Actions YAML):

```yaml
# .github/workflows/clawcare-scan.yml (illustrative)
name: ClawCare Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          pip install clawcare
          clawcare scan ./skills --output scan-results.json
      - run: |
          # fail if any high-severity findings (example uses jq)
          test $(jq '.high_count // 0' scan-results.json) -eq 0
```

Notes:
- Use the project page for context and intent: https://github.com/natechensan/ClawCare.
- Keep the CI job idempotent and short: aim for scan steps to be readable and fail-fast so the build time does not balloon.

## Common problems and quick fixes

Reference: https://github.com/natechensan/ClawCare.

Problems and quick remediations:
- pip / interpreter mismatch: recreate the virtual environment with the intended Python binary (fix time: ~5–15 minutes).
- CI fails unexpectedly after adding the scanner: run the scan locally, inspect the JSON report, and either tune rules or add a documented exception.
- Guard cannot attach: verify the runtime exposes plugin hooks and you have admin access; if not, run the guard in a staging runtime you control.
- Too many alerts: tune policy rules to reduce low-value matches and route alerts to a single on-call owner.

If secrets are discovered, treat it as an incident: rotate the secret immediately and follow your incident response playbook. See the project for context: https://github.com/natechensan/ClawCare.

## First use case for a small team

Reference: https://github.com/natechensan/ClawCare.

Scenario: a solo founder or 2-person team using third-party skills wants to keep unsafe skills out of main and catch runtime risk early.

Minimum practical workflow (small team):
1) Single-pass scan and block: scan all skills before merging new ones; quarantine any with high-severity findings until human review.
2) CI gate with a documented override: fail builds on high-severity findings but allow a manual override that records justification and the approver.
3) Dev-only runtime guard: enable the guard locally first to validate behavior before enabling it for collaborators.

Checklist for small teams:
- [ ] Run a full scan of the current skills inventory (initial baseline).
- [ ] Add a CI job that blocks PR merges on high-severity findings.
- [ ] Enable a runtime guard in dev and test it against one benign example and one malicious-looking example.

Test idea: confirm the system flags a skill that uses a download piped to a shell command; verify both static and runtime checks trigger. See: https://github.com/natechensan/ClawCare.

## Technical notes (optional)

Source context: the repository describes itself as a security scanner for AI agent skills and plugins: https://github.com/natechensan/ClawCare.

Operational suggestions (high-level):
- Collect runtime guard logs in JSON and aggregate counts by rule ID for trend analysis.
- Tune rules based on owner feedback to reduce noise; prefer a staged approach for rollout.

Limitations to keep in mind:
- Static analysis misses some dynamically generated payloads; use the runtime guard as a second check.
- A runtime guard requires the agent runtime to expose interceptable hook points.

## What to do next (production checklist)

Reference: https://github.com/natechensan/ClawCare.

### Assumptions / Hypotheses

- Project scope: ClawCare is described as a security scanner for AI agent skills and plugins on GitHub: https://github.com/natechensan/ClawCare.
- Example CLI names, flags, and the exact install command shown above are illustrative; adapt them to the actual package name and CLI provided by the project.
- Time and rollout guidance used above: local trial ~60 minutes; add CI 1–2 hours; staged rollout 1–2 weeks.
- Canary rollout plan suggested: 10% -> 50% -> 100% of sessions, with monitoring windows of 7–14 days between increases.
- Alert and exception thresholds proposed here: trigger an incident on >5 blocked events in 24 hours; keep policy exceptions <=3 per repo to limit drift.
- Environment performance targets (operational hypotheses): aim for scan runs under <60s for small repos (<=100 files) and expect up to <300s for larger inventories; these are targets, not guarantees.
- Cost and resources: repository code is open source ($0 license cost at the project URL), but API and cloud usage can incur charges.
- Token guidance if scans include language-model prompts: start with a 1,000-token prompt window for context and adjust by measurement.

### Risks / Mitigations

- Risk: false negatives (malicious code missed). Mitigation: keep least-privilege credentials, rotate keys, and maintain a runtime guard as a second defense.
- Risk: false positives blocking work. Mitigation: document an exception process and allow a manual CI override that records justification.
- Risk: alert fatigue. Mitigation: tune rules and raise alerts only when blocked-events exceed the >5 per 24-hour threshold.

### Next steps

- Integrate the scanner into your main CI and set a policy baseline (example: 0 high-severity findings to merge).
- Roll out runtime guard with canary percentages: 10% -> 50% -> 100% with 7–14 day observation windows between steps.
- Schedule an automated weekly scan job (frequency: 7 days) and maintain a skills inventory with an exceptions register.
- Prepare a post-incident playbook: rotate keys, revoke tokens, and update policy rules as needed.

Primary reference used for framing and intent: https://github.com/natechensan/ClawCare.
