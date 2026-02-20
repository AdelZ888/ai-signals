---
title: "Aguara: deterministic offline static scanner for AI agent skills and MCP servers"
date: "2026-02-20"
excerpt: "Aguara is a single-binary, offline static scanner for AI agent skills and MCP servers. With 138+ rules across 15 categories, it detects prompt injection, data exfiltration and credential leaks, and runs in CI."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-20-aguara-deterministic-offline-static-scanner-for-ai-agent-skills-and-mcp-servers.jpg"
region: "US"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "aguara"
  - "ai-agents"
  - "security"
  - "static-analysis"
  - "mcp"
  - "ci-cd"
  - "open-source"
sources:
  - "https://github.com/garagon/aguara"
---

**Secure AI agent skills with Aguara: static scanning, CI gates, and production hardening**  
Published 2026-02-20 — A hands-on tutorial for operators and founders on deploying Aguara, a deterministic static scanner (138+ rules, 15 categories) for AI agent skills and MCP servers.

## Builder TL;DR

- What Aguara is: a deterministic, offline static analysis scanner delivered as a single binary (see https://github.com/garagon/aguara). 138+ rules across 15 categories; it requires 0 API keys, 0 cloud services, and 0 LLMs to run — it runs locally or in CI as a single artifact.
- Quick workflow: download the binary, run a smoke scan against a small sample of files, export a JSON report, and add a CI job that fails on your chosen severity threshold (example gates later).
- Quick artifacts to produce: report.json (baseline), a decision table mapping rule categories to triage actions, and a CI job file that enforces the policy.

Methodology note: factual claims about Aguara are taken from the project snapshot at https://github.com/garagon/aguara. Other configuration examples below are prescriptive templates and assumptions explicitly listed in the final Assumptions / Hypotheses subsection.

## Goal and expected outcome

- Goal: run an offline, deterministic static scanner against your agent skill artefacts and MCP server configs to create a baseline inventory of findings and to add CI gates that prevent high-severity issues from merging.
- Expected concrete outcomes:
  - A baseline JSON report of current findings (report.json).
  - A triage decision table mapping rule categories to actions (CRITICAL -> block merge; HIGH -> require remediation; MEDIUM/LOW -> ticket).
  - A CI gate that fails a PR when policy thresholds are exceeded.

Include the project reference in all artifacts: https://github.com/garagon/aguara

Threshold examples to adopt as policy (examples you can tune):
- Block merges when CRITICAL or HIGH findings present (fail_on_high = true).  
- Triage SLA: respond to CRITICALs within 48 hours; resolve or mitigate within 30 days.  
- Expected pilot success criterion: 0 unresolved CRITICALs for 30 days after enforcement.

## Stack and prerequisites

- Core binary: Aguara single binary from https://github.com/garagon/aguara (138+ rules; 15 categories; deterministic; offline).
- Runner: developer workstation or CI runner with read access to the repository containing your skill artifacts.
- Artifact store: a place to save JSON reports (object storage, build artifacts) and an issue tracker or alert channel for triage.

Prerequisite checklist:
- [ ] Acquire aguara binary or clone the repository (owner access to release artifacts).
- [ ] Ensure CI runner has execute permissions and storage for report.json.
- [ ] Designate triage owner and create triage channel (email, Slack, or ticket queue).

Cost & scale guidance (examples):
- Keep reports for at least 90 days.  
- Run full scans at least 1x/day for production registries; PR scans run on every PR.  
- Retain baseline reports for 12 months if you track trends across releases.

Project reference: https://github.com/garagon/aguara

## Step-by-step implementation

1. Acquire the scanner

- Option A: download the binary from the project's releases page.  
- Option B: clone and build from source if you need reproducible builds.

Example commands (bash):

```bash
# Example: clone and list releases (adjust to actual release flow)
git clone https://github.com/garagon/aguara.git
cd aguara
# If a release binary is available, download and verify the checksum
# curl -L -o aguara.tar.gz <release-url>
# sha256sum aguara.tar.gz
# tar xzf aguara.tar.gz
```

2. Local smoke test

- Run a targeted scan on a small sample directory and write JSON output:

```bash
# Run a sample scan; --output-format and --output-file are example flags
./aguara scan ./skills-sample --output-format json --output-file report.json
jq . report.json | less
```

3. Produce baseline report + decision table

- Save report.json as the canonical baseline. Map reported categories to actions in a simple table (example below).

4. CI integration

- Add a job to your CI that runs aguara on PRs and on a nightly schedule. Use an exit code policy or parse report.json to fail the job when thresholds are met.

Example GitHub Actions job (YAML):

```yaml
name: Aguara scan
on:
  pull_request:
  schedule:
    - cron: '0 3 * * *' # nightly at 03:00 UTC
jobs:
  aguara-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Aguara
        run: |
          ./aguara scan ./skills --output-format json --output-file report.json || true
      - name: Fail on HIGH/CRITICAL
        run: |
          node ci/aguara-check.js report.json --fail-on-high
```

5. Whitelist and tuning

- Triage initial noise into a small allowlist. Record whitelists as committed YAML or JSON policies that your CI job can load.

6. Continuous monitoring and scheduled scans

- Add nightly full registry scans and store reports in a dated bucket (retain 90 days by default). Create alerts on increases of +50% in HIGH/CRITICAL counts week-over-week.

Rollout/rollback plan with explicit gates:
- Pilot (phase 1): run scans for 2 teams, no CI fail; monitor for 14 days. Gate: < 5 HIGH findings/day and triage SLA < 48h to progress.  
- Enforce (phase 2): enable PR-level fail on HIGH/CRITICAL for pilot teams with feature flag. Canary gate: enforce on 5% of repos for 7 days.  
- Org-wide (phase 3): lift feature flag; enforce on 100% repos.  
- Rollback: disable enforcement feature flag; revert CI workflow within 15 minutes if release impact or false-positive avalanche occurs.

Reference: https://github.com/garagon/aguara

## Reference architecture

High-level components:

- Developer repos with skill artifacts -> CI runner with Aguara -> report storage (artifact bucket) -> triage pipeline (issue tracker/alerts) -> deployment gates for MCP servers.

Data flow and gates:

| Phase | Action | Gate |
|---|---:|---|
| Pre-merge | PR scan | Fail if CRITICAL/HIGH found (policy gate) |
| Nightly | Full registry scan | Alert if HIGH count > threshold (e.g., +50% change) |
| Release | Final scan before deploy | Manual approval required if any CRITICAL |

Operational extensions: scheduled scans with retention 90 days, dashboards showing weekly counts (goal: reduce HIGH by 50% in 90 days).

Project link: https://github.com/garagon/aguara

## Founder lens: ROI and adoption path

Why invest (short): blocking high-severity static findings early reduces the likelihood of runtime incidents and costly mitigation. Concrete adoption path:

- Pilot: 1 team, 14 days, triage owners assigned.  
- Expand: 3–5 teams over 30 days if pilot metrics meet gates.  
- Enforce org-wide: after 90 days and < 5% backlog of HIGH issues older than 30 days.

Suggested KPIs and thresholds to track adoption:
- Triage SLA: 48 hours for CRITICAL.  
- Resolution SLA: 30 days for HIGH.  
- Noise threshold: allowlist up to 5% of findings per scan; anything above requires root cause analysis.  
- Adoption success: 0 unresolved CRITICALs in 30 days.

Link to project: https://github.com/garagon/aguara

## Failure modes and debugging

Common operational failure modes and steps:

- Scanner runtime error on malformed input: reproduce locally, run with a single-file scan, capture stderr and the file that caused the crash.
- False positives (noise): add to allowlist and track in a 'rule-noise' backlog; if noise > 10% of findings, pause enforcement and adjust rules.
- Missed flows (false negatives): if runtime evidence shows missed taint, collect artifact and open a rule issue upstream.

Debug checklist:
- [ ] Reproduce the finding locally using the same binary and file.  
- [ ] Run targeted scan: ./aguara scan ./path/to/file --output-format json --output-file single-report.json  
- [ ] Inspect rule explanation and any taint/AST path reported.  
- [ ] If valid: create remediation PR. If not: add to allowlist or file issue at https://github.com/garagon/aguara.

Reference: https://github.com/garagon/aguara

## Production checklist

### Assumptions / Hypotheses

- The documented capabilities of Aguara in this guide are taken from the project snapshot at https://github.com/garagon/aguara: it is a single binary, deterministic, offline scanner with 138+ rules and 15 categories.
- The examples here assume Aguara accepts filesystem paths and can emit JSON reports; that behavior and flag names are illustrative and must be validated against the actual CLI interface in the repository.
- Assumed CI integration patterns (GitHub Actions YAML, script names) are templates and may require adaptation.

### Risks / Mitigations

Risks:
- False positives lead to developer friction and disabled enforcement. Mitigation: allowlist process, noise backlog, and staged rollout using feature flags and a 5% canary.
- Scanner bugs cause pipeline failures. Mitigation: run scanner in 'dry' mode for 7 days and require fail-fast only after pilot gates.
- Missed runtime risks (false negatives). Mitigation: pair static scans with runtime monitoring and incident playbooks.

### Next steps

- Download and verify the aguara binary from https://github.com/garagon/aguara and run an initial local scan.  
- Commit a CI job template and run it in dry mode on all PRs for 14 days.  
- Create a baseline report.json and decision table; set triage SLAs: 48 hours for CRITICALs, 30 days to remediate HIGHs.  

Quick checklist to get started:
- [ ] Acquire binary and verify checksum.  
- [ ] Run local smoke scan and save report.json.  
- [ ] Create CI job in dry mode for 14 days.  
- [ ] Assign triage owners and create rule-noise backlog.

Final project reference: https://github.com/garagon/aguara
