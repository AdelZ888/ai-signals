---
title: "Bouygues Telecom ends free Perplexity Pro access on 11 Feb 2026 — activate from your customer account"
date: "2026-02-04"
excerpt: "Bouygues Telecom ends its year-long free Perplexity Pro offer on 11 Feb 2026. Eligible subscribers must activate it in their Bouygues account now — expect activation surges."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-04-bouygues-telecom-ends-free-perplexity-pro-access-on-11-feb-2026-activate-from-your-customer-account.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "Bouygues Telecom"
  - "Perplexity Pro"
  - "Perplexity"
  - "telecom"
  - "AI"
  - "activation"
  - "deadline"
  - "France"
sources:
  - "https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html"
---

## Builder TL;DR

- What: Bouygues Telecom’s year-long free access to Perplexity Pro will end on 2026-02-11; eligible customers can still activate the benefit via their Bouygues customer space until that date (source: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).
- Who: Bouygues subscribers who haven’t yet enabled Perplexity Pro — activation is handled from the Bouygues account portal (source above).
- Product effect: expect a deadline-driven activation spike and a short-term surge in provisioning and support volume.
- Quick artifact (activation checklist): confirm (1) visible offer in the customer portal, (2) live CTA and one-click activation path, (3) provisioning events instrumented, (4) support FAQ and canned responses published.

Methodology: this brief is built from the Numerama report above and operational best-practices for time-limited telco+SaaS activations.

## What changed

Bouygues Telecom is ending its free Perplexity Pro offer on 11 February 2026; the promotion window that gave Bouygues subscribers one year of access will close on that date and customers must activate the benefit from their Bouygues account before the deadline (source: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

Operational implications:

- Deadline window: 2026-02-04 → 2026-02-11 (8 days) is the short run to push reminders and guardrails.
- User action: activate via Bouygues customer space; if not activated by 2026-02-11 the entitlement lapses.
- Expected load: short-term spikes in provisioning requests, confirmation emails, and support tickets — plan for increased traffic and staffing on the deadline day and 48 hours after.

Concrete timeline artifact to produce now: a 1-page surge plan mapping 2026-02-04 (reminder 1) → 2026-02-08 (escalation comms) → 2026-02-11 (deadline reminders, peak support) → 2026-02-12 (post-deadline reconciliation).

## Technical teardown (for engineers)

Perplexity Pro, as described in the report, behaves like an AI-powered search + synthesis product that emphasizes surfacing sources. Treat it operationally as a data-enriching service (not a raw model-only API) and focus on provisioning, entitlement, and observability.

Key technical areas to validate (include the Bouygues link in each section for traceability): https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html

- Auth & provisioning
  - Entitlement flag: single boolean per account (perplexity_pro_entitled) + entitlement_expires_at timestamp. Confirm both exist and are respected by front-end and back-end checks.
  - Token provisioning path: one-time provisioning token issued on activation, with a 24h activation window for retries; store token_id and created_at.
  - Revocation: ensure revoke path can be executed immediately if the CTA must be disabled.

- Telemetry & observability
  - Instrument events: view_offer, click_activate, provisioning_request, provisioning_success, provisioning_failure, confirmation_sent.
  - Metric thresholds (recommended):
    - provisioning_failure_rate alert if > 5% for 30 minutes
    - API error rate alert if > 3% absolute increase vs baseline in 15 minutes
    - 95th percentile latency target: <= 300 ms for provisioning endpoint
  - SLOs: 99% success rate for provisioning outside of the deadline surge window.

- Decision / rollout table (example)

| Metric | Normal range | Alert threshold | Action |
|---|---:|---:|---|
| provisioning_success_rate | 95%–100% | < 95% for 30m | Pause CTA, open incident, notify product ops |
| provisioning_latency_p95 | < 300 ms | > 600 ms for 15m | Disable add-flow, show maintenance banner |
| provisioning_failure_rate | < 2% | > 5% for 30m | Rollback CTA, enable support hotline |

- Privacy & security checks
  - Confirm consent text at activation and record consent flag (gdpr_consent = true) and retention policy.
  - Verify that any data shared with Perplexity follows Bouygues’ agreements and user consent recorded in the account (see source: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

## Implementation blueprint (for developers)

Activation flow (keep to <= 3 steps):
1) Banner in Bouygues customer portal -> activation modal
2) Single-click consent + backend provisioning request
3) Confirmation page + email

Instrumentation (events to implement): view_banner, click_activate, provisioning_request, provisioning_success, provisioning_failure, email_confirmed.

Minimal UX constraints:
- Max 3 clicks from portal landing to confirmation.
- Confirmation email dispatched within 5 minutes of provisioning_success.
- Failure path must show retry + support link; allow at most 3 provisioning retries before exposing manual support flow.

Sample funnel metrics to track:

| Funnel step | Metric | Desired target |
|---|---:|---:|
| Seen banner | unique_visitors | track daily | 
| Click CTA | click_rate | instrument per cohort |
| Provisioning | success_rate | SLO 99% outside surge |

Comms artifacts to prepare (templates):
- In-app banner copy + 1 CTA
- Confirmation email with a one-paragraph usage guide and links to FAQ
- SMS reminder (if used) limited to 160 chars

Support & rollback
- Publish canned scripts for top 5 customer issues (activation failure, missing entitlement, email not received, consent confusion, revoke request).
- Rollback gate: if provisioning_failure_rate > 5% for 30m → disable CTA and surface maintenance message.

Reference: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html

## Founder lens: cost, moat, and distribution

- Cost: a telco-subsidized free tier accelerates trial but shifts API/usage costs to the provider; model the unit economics per activated user (MAU, queries/user/day, API cost/query). Use a simple decision table to run sensitivity analysis.

Example decision table (fill with your numbers):

| Variable | Example value | Notes |
|---|---:|---|
| Expected activations | 10,000 | change per cohort |
| Avg queries per user / day | 5 | monitor real usage |
| Days of exposure (trial) | 365 | the Bouygues offer was year-long |
| Estimated API cost/query | $X | variable — see Assumptions section |

- Moat: distribution via Bouygues’ account gating is the immediate moat; stickiness requires embedding Perplexity into daily workflows (search, summaries, research). The telco relationship provides retention hooks via billing/accounting and communication channels.

- Distribution: prioritize Bouygues customer portal, transactional email, and SMS for deadline nudges. Coordinate tracking UTM tags across channels to attribute activations.

Source: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html

## Regional lens (UK)

Applicability: the Bouygues-Perplexity arrangement is France-specific; replicating in the UK requires local legal, marketing, and support adjustments.

UK readiness checklist (6 core items):
- [ ] Data protection review vs UK GDPR
- [ ] Localized consent language and privacy policy
- [ ] Localization (en-GB) and time zone handling
- [ ] SMS opt-in verification adjusted for UK opt-in rates
- [ ] Billing & subscription interoperability checks
- [ ] Local support SLA and escalation paths

If you plan to reuse the partnership model in the UK, localize comms and confirm any data-residency or transfer requirements before launch. See the Bouygues example here: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html

## US, UK, FR comparison

Comparison table (high-level):

| Market | Typical partners | Primary distribution channels | Privacy & constraints | Recommended rollout gates |
|---|---|---|---|---|
| FR | Telcos (example: Bouygues) | Customer portal, SMS, email | EU GDPR; telco bundling common (see Bouygues) | 1) entitlement flags 2) consent captured |
| UK | Telcos & retailers | App + email + SMS | UK GDPR; localization required | 1) local consent 2) support SLA |
| US | ISPs, app stores, carriers | App stores, ISP bundles, carrier promotions | Fragmented; state laws + less telco bundling | 1) app-store flows 2) billing integration |

Note: the Bouygues example is the FR column and is the factual anchor for this brief: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html

## Ship-this-week checklist

### Assumptions / Hypotheses

- The Numerama report is accurate: Bouygues ends free Perplexity Pro on 2026-02-11 and activation is available via Bouygues’ customer space (source: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).
- Operational assumptions for planning (placeholders to validate): expected activations = 10k, avg queries/user/day = 5, provisioning latency SLO = 300 ms, acceptable provisioning_failure_rate = 2% baseline / 5% surge threshold. Replace these with real telemetry after 1st hour of launch.

### Risks / Mitigations

- Risk: Provisioning failures spike at deadline.
  - Mitigation: pre-configured rollback gate (if provisioning_failure_rate > 5% for 30m → disable CTA), extra support staff (see staffing below), and a maintenance banner.
- Risk: Support volume overwhelms channels.
  - Mitigation: pre-publish top-5 canned responses and triage script; queue SLA to 24h response for non-urgent.
- Risk: Consent or privacy text ambiguous.
  - Mitigation: legal-approved consent copy in portal and confirmation email; record consent flags at activation.

### Next steps

- [ ] Confirm the offer banner is present and points to the activation modal (deadline: 2026-02-05).
- [ ] Instrument and validate events: view_banner, click_activate, provisioning_request, provisioning_success/failure (deadline: 2026-02-05).
- [ ] Prepare and QA confirmation email and SMS template; ensure email sent within 5 minutes of success (deadline: 2026-02-06).
- [ ] Publish support FAQ and canned scripts; staff rota for 2026-02-08 → 2026-02-12 (deadline: 2026-02-07).
- [ ] Deploy monitoring dashboard with alerts: provisioning_failure_rate (>5% for 30m), provisioning_latency_p95 (>600 ms for 15m), provisioning_success_rate (<95% for 30m) (deadline: 2026-02-05).
- [ ] Execute reminder comms schedule: two emails (T-7 days, T-2 days), in-app banner daily, optional SMS on T-1 day (final reminder) (deadline: 2026-02-08).

- [ ] Gate decision: if any alert fires during peak testing, disable CTA and surface an explanatory banner; perform post-mortem and re-open when resolved.

Reference: https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html
