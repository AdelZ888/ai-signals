---
title: "Superhuman CEO Shishir Mehrotra on the 'Expert Review' feature that used reporters' names"
date: "2026-03-24"
excerpt: "Nilay Patel interviews Superhuman CEO Shishir Mehrotra after the 'Expert Review' AI feature used reporters' names without consent; he apologizes and outlines remediation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-24-superhuman-ceo-shishir-mehrotra-on-the-expert-review-feature-that-used-reporters-names.jpg"
region: "US"
category: "News"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "NEWS"
tags:
  - "ai-impersonation"
  - "model-attribution"
  - "creator-rights"
  - "product-trust"
  - "legal-risk"
  - "Superhuman"
  - "podcast-interview"
sources:
  - "https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation"
---

## TL;DR in plain English

- The Verge reported an AI feature that produced content framed as coming from a named reporter; the piece includes an interview with the company CEO. Read it here: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Key actionable takeaways:
- If your product claims to speak “in the voice” of real people, you face rapid trust, PR, and legal risk. See the Verge reporting above for context.
- Immediate targets you can adopt: confirm scope within 30 minutes, publish an initial public status within 180 minutes (3 hours), and aim to remediate within 72 hours.
- Technical guardrails: provide an opt-out, visible attribution, and a one-click rollback that can flip in <5 minutes and update UI state within ~200 ms.

This note translates the Verge interview into operational steps teams can run now. It is practical guidance, not legal advice. Methodology: this memo summarizes the Verge reporting and CEO interview listed above (same link). https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## What changed

The Verge published reporting and an interview about an AI product that generated content presented as if authored by a named reporter; the piece focuses on attribution versus impersonation. Read it here: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Use this reusable incident timeline and fill values immediately after discovery:

| Step | Example field | Your value (fill in) |
|---|---:|---|
| Release date | ISO date | 2026-03-XX |
| Discovery date | ISO date | 2026-03-XX |
| Discovery channel | e.g., reporter story, social | reporter story |
| Initial mitigation options | pause / opt-out / narrow / defend | pause |
| Time-to-public mitigation target | hours | 72 |
| Final resolution | removed / revised / policy | pending |

Reference: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## Why this matters (for real teams)

- Trust and retention: public claims of impersonation can erode trust quickly. Track time-to-remediation (goal <72 hours) and monitor retention changes over 7 and 30 days. A >3% drop in retention is material. See the Verge reporting for incident context: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

- Operational surge: expect support-volume spikes of 3×–10× in the first 24 hours after public coverage; plan for temporary 24–72 hour scale-ups in staffing.

- Legal and partner risk: features that use real names or imitate public figures raise rights-of-publicity and reputational exposure. Treat persona features as requiring legal review before broad release. The Verge piece explains why attribution versus impersonation matters: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Concrete thresholds you can copy now:
- Triage SLAs: 30 minutes to confirm scope; 180 minutes to publish initial public status; 72 hours to remediate or publish remediation timeline.
- Rollback targets: one-click revert across environments in <5 minutes; UI state update <200 ms.
- Audit retention: persist prompt context at least 1,024 tokens per event for 90 days.

## Concrete example: what this looks like in practice

Scenario: you ship an “expert tips” mode that labels generated suggestions as coming from named professionals. A reporter sees their name used without consent and publishes a story. Use the Verge report as the incident lens: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Decision options (when to use each):
- Apologize + Opt-out: add an opt-out and publish a brief public apology; appropriate when exposure is broad and harm is reputational. Target opt-out uptake >20% in first 7 days if users are concerned.
- Narrow content: replace names with role labels (e.g., “AI-generated — Senior Editor”) and remove named prompts; low-risk stopgap.
- Remove feature: full removal followed by rebuild with consent flows; required if legal counsel advises.
- Defend: only with legal signoff and clear evidence; high risk.

Operational metrics during an incident:
- Time-to-removal target: <72 hours.
- Opt-out uptake target: >20% in first 7 days (if deployed).
- Support-ticket surge: plan for +200–1,000 tickets depending on user base size.

Example rollback: flip persona_enabled = false. The toggle should update UI state within ~200 ms and propagate across CDN edges within 5 minutes. Reference: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## What small teams and solo founders should do now

If you are 1–5 people, prioritize fast, low-cost, high-impact actions. The Verge report provides the incident context: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Minimum concrete actions (solo founder / tiny team):
1) Pause persona outputs now.
   - Action: flip a runtime flag or remove the persona template from circulation. Goal: 30–180 minutes from discovery.
2) Replace real names with generic roles and add attribution.
   - Action: change labels to “AI-generated — [role]” and surface visible attribution on first render for ≥3 seconds.
3) Add a persistent opt-out and a one-click global rollback.
   - Action: persist persona_enabled = false as a user setting and expose a global admin toggle; test end-to-end rollback in <5 minutes and validate UI latency <200 ms.

Additional low-cost, high-impact steps:
- Inventory the top 50 templates first; record template hashes and the last 1,024 tokens for quick audits.
- Draft a 2–3 sentence public status and a short FAQ; publish within 30–60 minutes.
- If possible, get a 30-minute consult with counsel; capture guidance in the incident log.

Quick checklist to copy and run now:
- [ ] Pause persona outputs (30–180 minutes)
- [ ] Inventory top 50 templates (24–48 hours)
- [ ] Publish short status message (30–60 minutes)

Reference: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## Regional lens (US)

Operational guidance for US launches (not legal advice). Use the Verge reporting as the incident reference: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

US-focused steps:
- Require legal review for persona outputs that reference named individuals; record signoff timestamps.
- Maintain a decision log with timestamps and who signed off; regulators and partners expect timely corrective action—aim for visible remediation under 72 hours.
- Prepare PR materials: one-line public statement template, customer FAQ, and documented rollback evidence for executives.

Monitoring metric: time from public discovery to visible remediation (goal <72 hours). See the Verge interview for context: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## US, UK, FR comparison

Below is a concise operational comparison. Local counsel should confirm specifics. Source context: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

| Jurisdiction | Operational focus | Quick mitigation checklist |
|---|---:|---|
| US | Fast PR and publicity risk; state rights-of-publicity concerns | Pause persona outputs; legal review; incident log; 72h remediation target |
| UK | Transparency and reputation; potential defamation concerns | Clear attribution; consent where possible; public FAQ and correction path |
| FR (France) | Strong personality/image protections; EU digital expectations | Avoid names without consent; document GDPR triggers if personal data processed |

## Technical notes + this-week checklist

This section lists short technical requirements and a 7-day tactical checklist. See the Verge reporting for incident context: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

### Assumptions / Hypotheses
- The Verge reporting documents a reporter being impersonated and includes an interview with the company CEO about attribution vs. impersonation: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
- Items not explicitly in that reporting (for example: specific lawsuits, settlements, or timeline outcomes) are treated as hypotheses and must be validated before citing externally.

### Risks / Mitigations
Risks:
- Public trust erosion: measurable as >3% retention drop or sustained NPS decline; support-ticket surges of 3×–10× in the first 24 hours.
- Legal exposure on rights-of-publicity and reputation.
- Operational cost: engineering hours and PR time to rollback and remediate.

Mitigations (first actions):
- Add persona_enabled = false global toggle. Target rollback execution <5 minutes and UI status update <200 ms.
- Persist prompt logs: record template hashes and the last 1,024 tokens per event for 90 days for audits.
- Require Product + Legal signoff (consent, attribution, audit log, legal review, rollback) before re-enabling persona outputs.

### Next steps
This-week checklist (7-day aims):
- [ ] Inventory top 50 prompt templates and flag those referencing named individuals (24–48 hours).
- [ ] Add visible attribution text for generated content and deploy within 48 hours.
- [ ] Implement and test a global opt-out toggle (persona_enabled = false) with one-click rollback; deploy within 72 hours.
- [ ] Draft a short public FAQ and incident-status template (ready in 24–48 hours).
- [ ] Engage counsel to review persona use and prepare a lightweight consent policy (meet within 7 days).

Developer checklist:
- Record template hashes and last 1,024 tokens for persona outputs.
- Ensure deployments can flip persona_enabled across prod/staging/canary in <5 minutes.
- Add monitoring: alert on 3× baseline increase in support tickets or social-mention spikes; notify execs.

Final note: treat the Verge report as a practical wake-up call and follow the short SLAs above. Source and context: https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
