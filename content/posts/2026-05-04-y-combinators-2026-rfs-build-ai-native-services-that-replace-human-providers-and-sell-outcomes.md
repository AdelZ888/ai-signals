---
title: "Y Combinator’s 2026 RFS: build AI-native services that replace human providers and sell outcomes"
date: "2026-05-04"
excerpt: "YC's April 2026 Requests for Startups frames AI as the company 'operating system': favor services that observe, decide and act, replacing human providers and pricing outcomes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-04-y-combinators-2026-rfs-build-ai-native-services-that-replace-human-providers-and-sell-outcomes.jpg"
region: "FR"
category: "News"
series: "founder-notes"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "NEWS"
tags:
  - "Y Combinator"
  - "Requests for Startups"
  - "AI-native"
  - "startups"
  - "founder-advice"
  - "automation"
  - "France"
  - "outcome-based-pricing"
sources:
  - "https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html"
---

## TL;DR in plain English

- Numerama reported YC’s Requests for Startups (RFS) on 28 April 2026 and describes a clear shift: YC favors "AI‑native" companies where the AI is the system that observes, decides and acts, and that replace human providers rather than just ship software features. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Business implication: sell the delivered service/outcome (resolved tickets, processed claims) rather than seats or licenses; investors will expect outcome metrics such as cost per task and escalation/error rates. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Rapid decision aid (72 hours): answer 3 questions — 1) Will the AI make decisions or act for the customer? 2) Can you measure cost or performance vs the human baseline? 3) Is required data available now? Aim to answer all three within 72 hours. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Recommended pilot pattern: 4‑week pilot, ingest 3 months of history (or ≥1,000 items), run offline simulation on ≥1,000 cases and a 5% live A/B with an escalation gate (start <2–5%). Target MTTR <1 hour.

## What changed

- Framing shift: Numerama summarizes YC’s RFS as prioritizing AI as the company’s "operating system" and encouraging startups that replace existing human providers rather than shipping AI as a feature. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Business model pivot: the emphasis moves from seat/license pricing toward outcome‑based services (price per resolved item, processed claim, etc.). Expect investor questions about cost per task, escalation rate and SLA adherence. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Product & ops priorities: design for autonomy with human‑in‑the‑loop fallbacks, immutable audit logs and explicit escalation thresholds from day one. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html

## Why this matters (for real teams)

- Unit economics change: automating repeatable tasks reduces marginal cost per task, enabling outcome pricing. Numerama highlights the tilt toward services that replace people — quantify assumptions before pilots (example targets: escalation <5%; payback ≤6 months; pilot sample ≥1,000 items). Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- GTM and procurement: buyers will compare your price to the incumbent human cost. Prepare a buyertable showing incumbent cost → your price → payback months (target ≤6 months). Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Ops, legal and reputational exposure: replacing employees increases privacy, safety and labour considerations — treat compliance, incident controls and communication plans as acceptance criteria, not add‑ons. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Engineering priorities: small teams should prioritize ML reliability, observability and incident playbooks over polish. Set latency budgets (example: 200 ms–2,000 ms per API step) and human review targets in minutes; aim MTTR <1 hour.

## Concrete example: what this looks like in practice

Scenario: a support automation vendor pivots from selling a ticketing UI to offering support‑as‑a‑service that drafts, routes and resolves tickets autonomously — the pattern Numerama describes as YC’s preferred outcome. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html

Pilot plan (4 weeks, concrete):
- Ingest 3 months of historical tickets or ≥1,000 representative items (target ≥10,000 rows if available for better power).
- Run an offline simulation on ≥1,000 historical tickets. Measure average handle time (AHT in seconds), escalation rate and a CSAT proxy.
- Live A/B: route 5% of incoming traffic to the automation for 2 weeks. Gate full rollout if escalation increases ≥2 percentage points above baseline or exceeds 5% absolute.
- Acceptance criteria: escalation <5%; CSAT delta within ±5 points; MTTR for incidents <1 hour.

Key metrics table:

| Metric | Example target |
|---|---:|
| Escalation rate to human | <5% |
| Cost reduction per resolved ticket | ≥30% vs. human baseline |
| Pilot sample | ≥1,000 items (or 3 months logs) |
| Live A/B traffic | 5% |
| MTTR target | <1 hour |
| Uptime SLA | 99.9% (~8.8 hours downtime/year) |

Operational controls to include: immutable audit logs of inputs/prompts/outputs, a human override endpoint (max human‑review latency 30 minutes for critical flows), and tracing from action → source data → policy rule.

## What small teams and solo founders should do now

(All items grounded in the Numerama framing of YC’s RFS; see source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html.)

Actionable steps for teams of 1–5 (including solo founders):

1) Scope sharply and pick one workflow. Select a repeatable task that occurs ≥100 times/month, has a clear incumbent cost in $/hour or $/task, and where data exists for ≥3 months or ≥1,000 items. Score candidates by ROI (% savings), data availability and safety risk.

2) Run a 4‑week pilot with gates. Week 0: ingest ≥1,000 representative items (or 3 months of logs). Week 1–2: offline simulation on ≥1,000 cases and tune prompts/rules. Week 3–4: 5% live A/B test for 2 weeks with a hard escalation gate (block rollout if escalation >5% or CSAT drops >5 points). Keep the initial live exposure <5% to limit blast radius.

3) Instrument minimal but sufficient observability before live traffic. Build one dashboard showing escalation rate, MTTR (<1 hour), CSAT delta (±5 points) and a rolling 24h error count. Script a human fallback so 1 operator can supervise up to 100–500 sessions depending on risk; set human review latency target (e.g., 30 minutes for critical flows).

4) Prepare procurement and compliance artifacts you can share in a single page: a data‑use note, a sample immutable audit log, and the pilot SLA (e.g., 99.9%). These reduce friction in sales conversations and align expectations.

5) Pricing and sales: offer an outcome price tied to replaced cost ("we replace X hours for €Y/month") and include a payback estimate (aim ≤6 months). Be ready to show cost per outcome, escalation rate and CSAT impact.

Quick checklist to start this week:
- [ ] Run the 3‑question rapid assessment within 72 hours.
- [ ] Ingest a representative dataset (≥1,000 items or 3 months) and run an offline evaluation.
- [ ] Draft a 4‑week pilot plan with 5% live A/B and escalation threshold (start <2–5%).
- [ ] Build a minimal monitoring dashboard and a scripted human fallback plan.

Tactics for resource‑constrained founders: reuse prompt/templates across customers, automate audit‑log capture, and prioritize numeric gates so one person can scale oversight.

Reference: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html

## Regional lens (FR)

The core signal — YC’s RFS urging AI‑native services that replace human providers — is the framing Numerama reported on 28 April 2026; French founders should treat that as the investor context. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html

Practical notes for France:
- Emphasize explainability and prepare a one‑page "how we use your data" for procurement teams.
- Show an audit‑log example and a pilot SLA with clear escalation thresholds (escalation <5%; MTTR <1 hour).
- Prepare a short investor packet with the 4‑week pilot plan and three core metrics: cost per outcome, escalation rate, CSAT delta.

Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html

## US, UK, FR comparison

Below is a pragmatic comparison to help choose pilot markets. Use Numerama’s coverage as framing and validate local specifics with counsel. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html

| Dimension | US | UK | FR |
|---|---:|---:|---:|
| Speed to raise pilot funding (rank 1=fast) | 2 | 3 | 3 |
| Regulatory compliance friction (1=low) | 4 | 3 | 2 |
| Labour / firing constraints (1=low) | 2 | 3 | 4 |
| Typical procurement lead time (weeks) | 8–20 | 12–24 | 12–30 |

Validate market specifics with local counsel and customers before committing.

## Technical notes + this-week checklist

### Assumptions / Hypotheses
- Core assumption (from Numerama): YC’s RFS (28 April 2026) favors AI‑native services that replace human providers. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
- Week‑0 hypotheses to validate: customer baseline cost ($ or € per month), availability of ≥3 months historical data or ≥1,000 items, and customer acceptance of an escalation threshold ≤5%.
- Technical parameters to confirm: acceptable latency budgets (200 ms–2,000 ms per API step), operator supervision ratio (1 operator → 100–500 sessions), and model token limits for your chosen LLM.

### Risks / Mitigations
- Privacy risk — Mitigation: run offline simulations on redacted data, prepare a DPIA draft and a data‑minimization plan before live tests.
- Safety/regulatory risk — Mitigation: start with 5% live A/B and a hard escalation gate of <2–5% depending on domain sensitivity; capture immutable audit logs.
- Reputational / labour risk — Mitigation: prepare customer and internal communications framing the service as augmentation and offer transition support.
- Operational risk — Mitigation: set MTTR <1 hour, run fault‑injection tests on orchestration and maintain rollback procedures.

### Next steps
- This week (priority checklist):
  - [ ] Answer the 3 rapid assessment questions within 72 hours.
  - [ ] Ingest representative dataset (≥1,000 items or 3 months) and run offline evaluation.
  - [ ] Draft a 4‑week pilot plan with a 5% live A/B and an escalation gate set (target <2–5%).
  - [ ] Instrument a simple monitoring dashboard with alerts on escalation rate, MTTR (<1 hour), and CSAT delta (±5 points).
  - [ ] Prepare a one‑page privacy / data use note for pilot customers.

- Scale rule: if pilot metrics meet gates (escalation <5%, CSAT within ±5 points, cost per outcome improved by ≥30%), move to 20–50% traffic and enforce automatic rollback on breach.

One‑line methodology note: this brief condenses Numerama’s coverage of YC’s RFS (28 April 2026) into practical steps for small teams; validate legal and regulatory specifics with counsel. Source: https://www.numerama.com/tech/2241967-ne-vendez-plus-de-logiciels-et-remplacez-vos-employes-le-nouveau-dogme-des-startups-de-la-silicon-valley.html
