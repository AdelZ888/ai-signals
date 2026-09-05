---
title: "South Korea opens 'AI for Everyone' procurement for a free national chatbot with 50% domestic models"
date: "2026-09-05"
excerpt: "Seoul's 'AI for Everyone' tender seeks vendors to deliver a free, unlimited chatbot for 52M citizens, requires ≥50% domestic models, 2–3 winners, and up to 512 B200 GPUs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-05-south-korea-opens-ai-for-everyone-procurement-for-a-free-national-chatbot-with-50percent-domestic-models.jpg"
region: "FR"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "south-korea"
  - "public-ai"
  - "national-program"
  - "domestic-models"
  - "gpu"
  - "procurement"
  - "startups"
  - "policy"
sources:
  - "https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models"
---

## TL;DR in plain English

South Korea opened a national tender on 13 July 2026 called “AI for Everyone.” The programme aims to give free, unlimited AI access to all 52,000,000 residents and includes a public chatbot plus an agent that finds and files benefit applications. The tender requires at least 50% domestic model usage, will select 2–3 vendors, and offers up to 512 Nvidia B200 GPUs per winner; winners must match government GPU support. Beta was scheduled for September 2026 with a full launch targeted by year‑end; the programme runs through 2030. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Key numbers: 52,000,000 residents; >=50% domestic models; 2–3 vendors; up to 512 Nvidia B200 GPUs per winner; beta Sept 2026; launch by year‑end 2026; programme through 2030; 44.5% (≈23,000,000) regular generative‑AI users in Korea. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models


## What changed

Seoul moved from rhetoric to procurement: on 13 July 2026 the Ministry opened a formal tender that defines minimums, hardware offers, selection counts and a compressed delivery schedule. This is procurement of a national public AI service rather than a commercial product. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Verified changes from the tender summary:

- Domestic minimum: at least 50% of the system must use domestic (Korean) AI models. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Selection count: 2–3 winning vendors will be selected. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Hardware support: winners may receive up to 512 Nvidia B200 GPUs each; winners must provide matching funding. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Timeline: applications were open through 11 August 2026; beta planned for September 2026; full launch by year‑end 2026; contract through 2030. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models


## Why this matters (for real teams)

Treat this as infrastructure procurement, not a typical SaaS go‑to‑market. That changes priorities for product, engineering and finance. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Concrete implications:

- Scale: the service must serve 52,000,000 residents; plan capacity, SLOs and cost projections at national scale. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Domestic floor: the >=50% domestic requirement favors local model providers or hybrid stacks with verifiable domestic inference. Documentation and auditable metrics will be essential. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Capital & ops: up to 512 B200 GPUs per winner are offered, but winners must match that support — expect to show matching funding or equivalent cloud credits. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- User expectations: about 44.5% of the population (~23,000,000) use generative AI regularly; many currently use foreign services (ChatGPT ≈23.45M Korean users, Gemini ≈8.45M, Claude ≈2.41M). Competing with established UX and language coverage is nontrivial. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models


## Concrete example: what this looks like in practice

Example plan for a Korean startup that intends to bid (aligned to the tender summary). https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Milestones and commitments:

1) Bid posture
- Commit to >=60% domestic model usage to exceed the 50% floor; list domestic model partners and hosting locations. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

2) Infrastructure & funding
- Accept up to 512 B200 GPUs from government; document a matching‑fund plan (capital purchase, partner funding or cloud credits) covering equivalent of 512 GPUs. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

3) Integration & product
- Implement secure connectors to identity and benefits APIs so the public‑service agent can locate and file applications; include test API contracts in the bid. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

4) Rollout gates
- Staging → closed beta (target Sept 2026) → public beta → full launch (target year‑end 2026). Define acceptance tests, SLOs (e.g., 99% availability, 100–300 ms median model latency targets where applicable), and governance checkpoints. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

5) Transparency & ops
- Publish data provenance, incident response processes and privacy controls; demonstrate how you will scale to 52M users. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models


## What small teams and solo founders should do now

This procurement is compliance‑heavy and capital‑intensive, but there are concrete, time‑boxed moves solo founders and small teams can make in the next 7–28 days. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Actionable items (solo / small team focus):

- Partner and specialise quickly: as a solo founder, contact one domestic model provider and one systems integrator. Secure a written statement of intent within 7 days to show partnership velocity. Example target: 1 email + 1 call per partner, 2 partners in 7 days. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

- Productise a compact, sellable component in 2–4 weeks: deliverables that bidders will buy include a Korean dialogue taxonomy, a 1,000–10,000‑sentence evaluation dataset, or an authenticated API connector to benefits systems. Price the package ($5k–$50k) and prepare a one‑page spec. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

- Prepare a rapid tender stub (2 pages) this week: state the % domestic coverage you can supply, a matching‑fund approach for up to 512 B200 GPUs (or equivalent cloud credits), and a short ops runbook with staging → beta → launch gates. Have it ready to share in partnership talks. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

- Run a 60‑minute gap analysis: map your domestic model coverage, compute needs versus a 512‑GPU baseline, and identify one partner to close each gap. Document results in one page. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

- If you cannot bid, sell to bidders: create simple licensing terms for your component and reach out with a 1‑page commercial proposal. Target 3 outreach emails per day for one week. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Quick checklist:

- [ ] Contact one domestic model provider and one systems integrator (7 days)
- [ ] Draft a 2‑page tender stub (this week)
- [ ] Package one exportable asset (2–4 weeks)
- [ ] Run a 60‑minute compute vs. 512 GPU gap analysis


## Regional lens (FR)

French teams should read this tender as a procurement tactic that steers demand to domestic models via a >=50% floor and hardware subsidy. That approach could be replicated in other jurisdictions. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Practical steps for French entrants:

- Map French/EU models or assets that could count toward the >=50% floor and prepare to document hosting/ownership to satisfy audits. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Decide quickly whether to (a) partner with a Korean domestic model firm, (b) sell ancillary services (evaluation, monitoring, connectors), or (c) observe the procurement outcome. Partnering or selling components is the faster route for small teams. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models


## US, UK, FR comparison

South Korea’s tender is notable for scale, a domestic minimum and an explicit hardware offer, unlike typical US/UK approaches. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

| Country | Scale | Domestic floor | Hardware support | Timeline |
|---|---:|---:|---:|---|
| South Korea | National, 52,000,000 residents | >=50% domestic models | Up to 512 Nvidia B200 GPUs per winner (matching required) | Beta Sept 2026; launch by year‑end 2026; contract to 2030 |
| United States | Mostly pilot or agency‑level | Variable / procurement specific | Rarely national GPU subsidy | Slower, pilot‑led timelines |
| United Kingdom / France | Mostly agency or regional | EU/UK procurement constraints; localization matters | Uncommon as national hardware offers | Slower or distributed procurement |

Decision orientation:

- Bid in Korea: high scale, high compliance, compressed timeline, need for verified domestic coverage and matched funding. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- Supply components: lower direct domestic‑content risk, quicker to market for small teams. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models


## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The tender summary requires >=50% domestic model coverage; how the percentage is measured (inference time, token split, traffic weighting) is not published in the summary and must be confirmed in tender Q&A. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- The government offers up to 512 Nvidia B200 GPUs per winner as a capped subsidy; winners must match that GPU support with their own funding. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- User adoption figures used here (44.5% ≈23,000,000 generative‑AI users; ChatGPT ≈23.45M Korean users; Gemini ≈8.45M; Claude ≈2.41M; paying users ≈1.8M) are taken from the published summary and should guide adoption assumptions. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

Methodology note: this brief is based on the public tender summary and reporting in the linked article. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

### Risks / Mitigations

Risks:
- Failing to meet the >=50% domestic threshold.
- Unable to provide matching funds for the 512 GPU subsidy.
- Operational overload serving 52,000,000 residents under a compressed schedule.

Mitigations:
- Secure written partner commitments from domestic model providers and document deployment/hosting plans.
- Line up cloud credits, partner capital, or staged funding to cover matching requirements; model costs for a 512‑GPU equivalent baseline.
- Use phased rollout, strict canarying, and SLOs (e.g., 99% availability); prepare incident response and scale plans.

### Next steps

Immediate checklist (this week):

- [ ] Read the full tender summary and Q&A; confirm how the >=50% domestic metric is measured. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
- [ ] Run a 60‑minute gap analysis: map domestic model coverage, compute vs. a 512‑GPU baseline, and list one partner to close each gap.
- [ ] Draft a 2‑page pitch: declared domestic coverage %, matching‑fund plan for up to 512 GPUs, and a short ops runbook (staging → beta → launch).
- [ ] Contact one domestic model provider and one systems integrator and secure a written statement of intent (target: 7 days).

If you plan to bid, prioritise verified domestic coverage, a clear funding match, and compliance evidence—these are the top three evaluation risks. https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
