---
title: "Orange introduces Sharlie, a real-time conversational voice assistant for Sosh and MAIA for advisors"
date: "2026-03-13"
excerpt: "Orange launched MAIA for advisors and Sharlie, a real-time conversational voice AI for Sosh projected to handle ~20% of contacts; read how this shifts phone support ops."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-13-orange-introduces-sharlie-a-real-time-conversational-voice-assistant-for-sosh-and-maia-for-advisors.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "AI"
  - "generative-ai"
  - "voice-agent"
  - "customer-service"
  - "telecom"
  - "Orange"
  - "Sosh"
  - "France"
sources:
  - "https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html"
---

## TL;DR in plain English

Orange announced two generative‑AI services on 12 March 2026: MAIA (an advisor‑side assistant) and Sharlie (a real‑time voice assistant for Sosh customers). Orange projects Sharlie can quickly handle about 20% of Sosh contacts, signalling a shift from menu‑driven IVR and simple chatbots toward live voice agents. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Key bullets:

- Orange launched MAIA and Sharlie; Sharlie is explicitly a real‑time vocal assistant for Sosh. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Orange projects Sharlie can rapidly handle ~20% of Sosh customer contacts. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Practical effect: any phone‑support roadmap should reassess escalation, monitoring, and consent practices now.

Quick scenario (one sentence): a caller asks about a bill, the voice agent fetches a line item and either resolves the query or hands the call, with context, to a human. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Pilot checklist (short):
- [ ] Pick a narrow pilot scope and success metric
- [ ] Draft a clear consent prompt and logging policy
- [ ] Define an immediate escalation path to a human

## What changed

Historically phone support relied on menu trees and scripted agents. The new step is deploying generative AI inside live voice calls so the system can hold spoken conversations and make constrained decisions. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Concrete points:

- Public launch: Orange introduced MAIA (advisor assistant) and Sharlie (real‑time voice assistant for Sosh customers). Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Role change: vendors now position generative‑AI agents as first‑line handlers, not only back‑office helpers. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Operational implication: production stacks must integrate ASR, NLU, dialog state, and TTS and reconsider consent, recording, and handoff logic. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

## Why this matters (for real teams)

- Roadmap pressure: major operators advertising voice AI will prompt stakeholders to ask why you are not exploring similar capabilities. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- New operational surface: ASR, NLU, dialog state and TTS require different telemetry — containment rate, handoff rate/reasons, ASR error rate — and new monitoring dashboards. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- User expectations: public launches raise expectations for faster resolution and a reliable, clearly signposted path to a human. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

## Concrete example: what this looks like in practice

Use case: a caller reports an unexpected charge on their Sosh bill (inspired by the announcement). Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Caller flow (compact):

1) Greeting and consent: the agent asks permission to record and process the call.
2) ASR transcribes speech; NLU maps to a "billing dispute" intent.
3) The agent performs a constrained account lookup and reads or explains the relevant invoice line using pre‑approved phrasing.
4) If confidence is low or the issue is sensitive, the agent routes to a human and passes a short summary card to avoid repetition.
5) If resolved, the agent confirms resolution and optionally asks a short CSAT question.

Decision matrix (example):

| Intent category | AI handling model | Notes |
|---|---:|---|
| Account lookup / balance | Automated readout | Low risk if no transfer or payment occurs |
| Plan information | Assistive (confirm with human) | Require explicit confirmation for changes |
| Billing disputes / refunds | Prefer human | Sensitive: needs verification and audit trail |

Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

## What small teams and solo founders should do now

Practical, low‑cost actions you can do with limited engineering bandwidth, aligned with the Orange announcement context. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Actionable steps (minimum three):

1) Pick one narrow, low‑risk intent and scope it tightly (example: account lookup or plan information). Define a single success metric (for example, containment % or intent accuracy). Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

2) Start text‑first to reduce complexity: build a chat or SMS flow that mirrors the intended voice experience. This lets you collect 200–500 sample utterances cheaply before adding ASR/TTS. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

3) Implement a one‑click human handoff with context: humans should receive a one‑screen summary (key utterances + intent + recent actions). Test handoffs in shadow mode with real agents before opening to customers. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

4) Instrument a tiny telemetry set from day one: containment %, handoff reasons (categorised), median latency in ms, and a simple CSAT question. Use those signals to decide whether to enable voice. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

5) Soft‑launch to a small fraction of traffic (for example 5–10%) and expand only after meeting acceptance criteria. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Practical pilot checklist for small teams:
- [ ] Define 1 intent and 1 success metric (containment % or intent accuracy)
- [ ] Build a text‑first PoC and collect sample utterances (target 200+)
- [ ] Create a one‑screen human handoff card and test in shadow mode
- [ ] Monitor containment, handoff reasons, latency (ms), and CSAT

## Regional lens (FR)

The announcement and Sharlie rollout are France‑facing; localise consent prompts and UX in French and test them with a small panel before public rollout. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Operational implications for France:

- Keep an auditable trail of decisions and recordings during the pilot; French operators exposing voice agents as first‑line channels imply additional compliance scrutiny. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

- Localise messages and consent language; validate phrasing and comprehension on 20–50 test calls before scaling. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

## US, UK, FR comparison

Short guidance: jurisdiction matters for consent wording, privacy expectations and localisation cost. The Orange announcement is France‑centred; pilots in other countries require localized UX and legal review. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

| Factor | US | UK | FR |
|---|---:|---:|---:|
| Localization effort | Moderate | High | High |
| Consent complexity | Medium | High | High |
| Recommended minimal pilot | Chat‑first | Chat + localized UX | Local‑language pilot with audit logs |

If most users are in one country, pilot there to reduce localization and legal overhead. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

## Technical notes + this-week checklist

### Assumptions / Hypotheses
- This brief is based on Numerama’s summary of Orange’s public announcement about MAIA and Sharlie (published 12 March 2026): https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Suggested pilot parameters to validate (examples to test, not claims about Orange): containment target ~20%; pilot duration ~4 weeks; soft‑rollout fraction 5–10%; sample utterances per intent 200–500; confidence thresholds examples 0.60 / 0.65 / 0.85; human‑answer SLA target <30 seconds; median processing latency goal <400 ms; measure ASR word error rate (WER) on your traffic. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Methodology note: factual points about Orange and Sharlie come from the Numerama article; the numeric thresholds above are proposed pilot parameters and require local validation. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

### Risks / Mitigations
- Risk: poor handoff experience reduces CSAT. Mitigation: require a mandatory context card and enforce handoff when confidence < configured threshold. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Risk: ASR WER too high on noisy calls. Mitigation: run WER tests and restrict voice automation to channels with acceptable WER until improved. Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Risk: unexpected runtime cost (per‑minute ASR/TTS or token costs). Mitigation: cap spend with feature gates and soft‑rollouts (for example, enable_voice_agent=false for >X% traffic). Source: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

### Next steps
This week — short checklist to get started (practical):
- [ ] Re‑read the Numerama announcement and collect any Orange public materials: https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- [ ] Pick 1–2 pilot intents and collect 200+ sample utterances
- [ ] Define acceptance metrics (containment %, intent accuracy, median latency ms, CSAT) and a rollback criterion
- [ ] Build a text‑based proof‑of‑concept, add logging, and validate handoffs with humans in shadow mode
- [ ] If metrics meet acceptance criteria, schedule a soft‑launch (5–10% traffic) and monitor containment, ASR WER, latency (ms), and CSAT

If you want, I can produce a 4‑week runbook, sample utterances, a short consent script in French and English, and a monitoring dashboard spec (containment %, latency ms, WER, CSAT).
