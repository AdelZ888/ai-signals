---
title: "Integrating VIBE✓ into cq: a four-domain pre-approval review for shared agent knowledge"
date: "2026-05-14"
excerpt: "Add a lightweight VIBE✓ pre-approval step to cq that flags vulnerabilities, intent-impact gaps, bias, and edge cases. Learn the checklist, CI gate pattern, and approval rules."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-14-integrating-vibe-into-cq-a-four-domain-pre-approval-review-for-shared-agent-knowledge.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "cq"
  - "vibe"
  - "responsible-ai"
  - "agents"
  - "security"
  - "checklist"
  - "pipeline"
  - "mozilla.ai"
sources:
  - "https://blog.mozilla.ai/first-line-of-defense-for-cq/"
---

## TL;DR in plain English

- What changed: Mozilla.ai’s cq proposes knowledge units automatically and offers a human review entry point (/cq:reflect). VIBE✓ is a human-centered review pattern to catch automation bias, secrets, and unsafe advice before proposed units enter shared memory. Read more: https://blog.mozilla.ai/first-line-of-defense-for-cq/
- Why it matters: automation bias (the human tendency to over‑trust automation) can cause API key leakage, exposure of personally identifiable information (PII), or unsafe guidance. A short VIBE review adds a low-friction human gate while keeping cq fast. See the announcement and checklist idea: https://blog.mozilla.ai/first-line-of-defense-for-cq/
- What to do now: add a pre-approval step that (a) runs automated scans, (b) assigns a severity (clean / soft / hard), and (c) blocks auto-commit for hard findings. Start in log-only for 1–2 weeks. Enforce blocking once false positives are low. Reference: https://blog.mozilla.ai/first-line-of-defense-for-cq/

Quick example (30s): A 4-person team uses cq to capture continuous integration (CI) failure fixes. A proposed unit includes a stack trace and a sample command that accidentally contains an API key. VIBE’s Vulnerabilities check flags the key. The system returns a sanitized rewrite and queues the unit for human approval. The secret never reaches shared memory. See the cq flow: https://blog.mozilla.ai/first-line-of-defense-for-cq/

Methodology note: this guide follows the cq announcement and adapts a lightweight VIBE✓ review pattern for small teams. The domain mappings below are implementation suggestions, not new claims.

## What you will build and why it helps

You will add a pre-approval VIBE✓ review step that runs whenever cq proposes a knowledge unit (either from background propose or an explicit /cq:reflect call). The review produces an immutable audit record and one of three outcomes: clean (auto-commit), soft concern (queue for reviewer), or hard finding (block + sanitized rewrite). See the cq overview here: https://blog.mozilla.ai/first-line-of-defense-for-cq/

Plain-language explanation before advanced details

The gate is a short checklist plus a few fast automated checks. When cq produces a proposed unit, the gate runs. If checks pass, the unit can be auto-committed. If there are small concerns, a human reviews it. If there are serious risks (secrets, PII, unsafe instructions), the gate blocks the commit and suggests a redacted rewrite.

Why it helps

- Reduces automation bias: forces a human click for risky items.
- Lowers leakage risk: blocks PII or API keys before they enter shared memory.
- Keeps speed: aim for lightweight checks (example target <200 ms per unit) so the gate does not create noticeable delay. See the reasoning on human review importance: https://blog.mozilla.ai/first-line-of-defense-for-cq/

Concrete artifact you’ll get

- VIBE-checklist.md (one page)
- cq-vibe-rollout-gate.yaml (gate config)
- decision-table.csv (severity → action)
- audit-log-schema.json

## Before you start (time, cost, prerequisites)

- Estimated prototype time: 1–3 hours in a dev sandbox; allow 8–16 hours for reviewer training and CI wiring.
- Cost: low — mainly reviewer time and minimal compute (example: $0–$50/month for small CI minutes at prototype scale).
- Prerequisites:
  - a running cq instance or dev sandbox that can call /cq:reflect (https://blog.mozilla.ai/first-line-of-defense-for-cq/)
  - the ability to add a pre-approval webhook or CI job
  - at least one reviewer assigned for human-in-the-loop signoff
  - secure storage for sanitized rewrites and audit logs (example retention: purge originals after 30 days)

Checklist to prepare

- [ ] Get access to cq dev sandbox and API endpoint /cq:reflect (https://blog.mozilla.ai/first-line-of-defense-for-cq/)
- [ ] Create VIBE-checklist.md and redaction-config.json
- [ ] Configure a CI job to run on proposed units and write audit records

## Step-by-step setup and implementation

Plain-language overview before the detailed steps

You will create a short checklist, plug a webhook or CI job into /cq:reflect, run fast automated checks, write one audit record per proposed unit, and route units based on severity. Start in log-only mode to tune rules before blocking anything.

1. Create a short VIBE✓ checklist

   - Keep it scannable: 6–8 checks. Recommended domains: Vulnerabilities, Intention vs Impact, Bias & Blind Spots, Edge Case Handling. These domain names map the VIBE✓ idea into practical checks; the cq announcement recommends human-centered checklists: https://blog.mozilla.ai/first-line-of-defense-for-cq/

2. Wire a pre-approval call into /cq:reflect

   - When cq proposes or when /cq:reflect is called, invoke your VIBE engine (automated checks plus light sanitizers). The endpoint can be an internal webhook that returns an audit record.

Example: invoke /cq:reflect via curl (prototype)

```bash
curl -X POST "https://cq.example.local/cq:reflect" \
  -H "Authorization: Bearer $CQ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"s123","context":"<session text>"}'
```

3. Produce a single audit record per proposed knowledge unit

   - Suggested fields: unit_id, domain_flags, severity (clean/soft/hard), sanitized_rewrite (optional), redaction_log, created_by, timestamp.
   - Target automated-check latency: <200 ms for lightweight checks. Background propose can remain asynchronous.

4. Add a CI/automation job and immutable audit log

   - Write audit records to an immutable store. Keep sanitized rewrites indefinitely; purge original sensitive payloads after a defined retention (example: 30 days).

Example rollout gate config (YAML)

```yaml
# cq-vibe-rollout-gate.yaml
gate:
  name: cq-vibe-preapproval
  enforce: true
  rules:
    - severity: hard
      action: block
    - severity: soft
      action: queue_for_review
    - severity: clean
      action: auto_commit
metrics:
  hard_finding_alert_threshold_pct: 2
  soft_finding_relax_threshold_pct: 5
  review_latency_alert_hours: 48
```

5. Decision table and reviewer UI

   - Example decision table (one-line per rule) maps severity to action and reviewer requirement.

| Severity | Action | Reviewer requirement | Auto-commit allowed? |
|---|---:|---|---:|
| clean | auto-commit | none | yes |
| soft | queue | 1 reviewer within 24 hours | no |
| hard | block | 2-person sign-off + sanitized rewrite | no |

   - UI should show: redacted original context, VIBE findings, sanitized rewrite, and buttons: Approve / Modify / Reject. Log reviewer id & timestamp and require a short justification on soft/hard approvals.

6. Rollout plan (canary + rollback)

   - Phase A — Log-only (2 weeks): gate runs but does not block. Collect metrics for ~100 proposals.
   - Phase B — Canary (1 team): enforce gate for 10% of traffic (feature flag) and require sign-off for hard findings.
   - Phase C — Gradual ramp: 10% → 50% → 100% with thresholds and monitoring.
   - Rollback: flip the feature flag off to stop blocking; keep audit logs for incident analysis. If a leak occurs, run your incident playbook and revert the knowledge unit.

7. Instrument metrics to track

   - % units flagged by domain, hard findings per 100 proposals (target <2–5% initially), reviewer approval latency (target <24 hours), number of sanitized rewrites used in production.

Commit these artifacts: VIBE-checklist.md, cq-vibe-rollout-gate.yaml, decision-table.csv, audit-log-schema.json.

## Common problems and quick fixes

- Too many false positives → reviewer fatigue
  - Quick fix: add a benign-pattern whitelist and tune severity thresholds. Run log-only for 100 proposals to collect ground truth.
- Automation bias (reviewers click through) → weak review
  - Quick fix: require a short justification (≥10 chars) for approvals on soft/hard findings. Audit justification frequency weekly.
- Sanitization misses secrets/PII
  - Quick fix: add regex-based secret scanning in the Vulnerabilities phase and block until redacted. Maintain redaction-config.json.
- Blocking too many useful units early
  - Quick fix: start log-only for 1–2 weeks, then enable a 10% canary and raise auto-approve thresholds only after metrics look stable.

Helpful thresholds/examples: 24 hours required reviewer response, 48 hours alert for latency, 30 days purge originals, aim for reviewer latency <24 hours. See the cq announcement for the human-review rationale: https://blog.mozilla.ai/first-line-of-defense-for-cq/

## First use case for a small team

Scenario: a 4-person team ships about 25 proposed knowledge units per week. They use cq to share fixes for CI build errors.

Pipeline (copyable): proposed unit → VIBE audit job (CI) → audit record attached → reviewer inbox notifies on-call → approved or rejected.

Team rules you can adopt immediately

- Auto-approve clean items.
- Queue soft concerns with required reviewer justification within 24 hours.
- Block hard findings until 2-person sign-off.
- Pilot mode: run log-only for 1 week, then enable gating for a canary reviewer.

Small-team artifacts

- decision-table.csv (one-line per rule)
- on-call rotation checklist (one person/week)
- redaction-config.json with 6–8 regex patterns (API keys, emails, tokens) to auto-redact

Advice for a solo founder

- Start in log-only for 7–14 days.
- Keep the checklist to 6 checks so reviews take <5 minutes each.
- Use sanitized-rewrite templates to avoid publishing secrets by accident.

Reference: https://blog.mozilla.ai/first-line-of-defense-for-cq/

## Technical notes (optional)

- Automatable checks by domain (examples):
  - Vulnerabilities: regex/static secret scanning, deterministic patterns. Aim for <200 ms per check.
  - Intention vs Impact: use lightweight prompts to generate expected outcomes; treat these results as heuristics.
  - Bias & Blind Spots: keep a short checklist of known data gaps and a few test cases to validate guidance.
  - Edge Case Handling: run quick unit tests or small fuzz inputs derived from the session context.
- Data handling: store only sanitized_rewrite and a redaction_hash in the long term. Purge any original sensitive payloads after 30 days.
- Policy-as-data: keep decision-table external (CSV/JSON) so policy changes do not require code deploys.

Example audit-log-schema.json (fragment)

```json
{
  "unit_id": "string",
  "severity": "clean|soft|hard",
  "domain_flags": ["vulnerabilities","bias"],
  "sanitized_rewrite": "string|null",
  "redaction_log": {"removed_patterns": 2},
  "created_at": "2026-05-14T12:00:00Z"
}
```

See the cq post for guidance on why human review matters: https://blog.mozilla.ai/first-line-of-defense-for-cq/

## What to do next (production checklist)

### Assumptions / Hypotheses

- The cq announcement describes propose and /cq:reflect and recommends human-centered checklists. This guide implements a practical VIBE✓-style gate built on that concept: https://blog.mozilla.ai/first-line-of-defense-for-cq/
- Mapping VIBE✓ to four domains (Vulnerabilities / Intention vs Impact / Bias & Blind Spots / Edge Case Handling) is an implementation choice for clarity and automation. Treat it as a hypothesis to validate during the pilot.

### Risks / Mitigations

- Risk: automation bias → reviewers approve unsafe items.
  - Mitigation: require justification for soft/hard approvals and audit justifications weekly. Set a metric threshold (e.g., justification present ≥95%).
- Risk: reviewer latency causes blocked knowledge flow.
  - Mitigation: SLA 24 hours for required reviews; alert at 48 hours.
- Risk: missed secrets in sanitization.
  - Mitigation: add regex secret scans and block items until redacted; keep redaction-config.json and update it weekly.
- Risk: high false-positive rate.
  - Mitigation: run log-only for ~100 proposals to tune thresholds; add allowlist patterns.

### Next steps

1. Commit these artifacts to your repo: VIBE-checklist.md, cq-vibe-rollout-gate.yaml, decision-table.csv, audit-log-schema.json.
2. Run a 2-week log-only pilot (collect ~100 proposals). Track: % hard findings, reviewer latency, number of sanitized rewrites.
3. If hard findings <2% and reviewer latency <24 hours, enable a canary at 10% traffic behind a feature flag; monitor for 7 days.
4. If metrics hold (hard findings <5% and justification compliance ≥95%), ramp to 100% and enforce blocking for hard findings.
5. Maintain an incident playbook: immediate removal/rollback, notification list, and post-mortem template.

For background and design rationale see: https://blog.mozilla.ai/first-line-of-defense-for-cq/
