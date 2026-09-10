---
title: "Mathematicians seek proof OpenAI didn’t train on their unpublished work"
date: "2026-09-10"
excerpt: "Mathematicians have asked OpenAI to prove it didn't ingest private drafts or chats to train models. The Verge documents the dispute but finds no internal audit evidence - why provenance matters."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-10-mathematicians-seek-proof-openai-didnt-train-on-their-unpublished-work.jpg"
region: "US"
category: "Model Breakdowns"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "data-provenance"
  - "model-training"
  - "research-ethics"
  - "OpenAI"
  - "transparency"
  - "risk-management"
sources:
  - "https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data"
---

## TL;DR in plain English

- The Verge reports that several mathematicians publicly asked OpenAI for proof that unpublished conversations and private work were not used to train models that recently improved on math: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- The article records the public dispute, names individuals who raised questions, and documents requests for transparency; it does not publish internal training logs, dataset manifests, or cryptographic snapshot evidence that would settle the question either way: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- Practical takeaway (high level): treat the situation as a provenance and transparency issue. Preserve records you control and ask vendors for provenance statements before relying on model outputs for sensitive or publishable work.

## Core question and short answer

Core question: Did OpenAI use unpublished conversations or private mathematics work to train models that now show stronger math ability?

Short answer: The Verge documents mathematicians publicly asking for proof and frames the situation as a transparency dispute; the article itself does not provide the internal audit artifacts (logs, manifests, signed attestations) that would confirm or refute the claim: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Practical implication: until a vendor provides verifiable provenance, treat unexpected close matches to private material as a governance and evidence problem rather than a settled technical fact.

## What the sources actually show

- The Verge article reports that multiple mathematicians publicly requested proof that their private content and chat logs were not used in training. It frames the story around those public requests and the resulting debate: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- The piece records allegations and calls for transparency but does not include internal company evidence (for example: ingestion logs, dataset manifests, or cryptographic snapshot hashes) that would conclusively demonstrate whether specific private artifacts were or were not included in training.

Methodology note: this summary is limited to the linked Verge snapshot and public reporting in that article, not internal or third-party confidential audits.

Plain-language summary: people who do math saw model outputs resembling private work, asked for proof, and received public responses framed as requests for transparency; the article does not itself resolve provenance.

## Concrete example: where this matters

Hypothetical scenario (illustrative only): a small research team shares a draft proof in a private forum and also consults a vendor chatbot. Weeks later a public model outputs a solution that mirrors the draft. The team needs timestamped exports and vendor provenance to document whether their private text could have been included in training.

Why this matters (as reported and implied by the dispute): attribution, reputation, and collaboration incentives can be affected when practitioners believe private work may have been incorporated into public models. The Verge frames those community concerns as the core of the story: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

If you encounter this situation, the relevant actions are about evidence preservation and vendor engagement, not immediate technical proof. The article shows a transparency request dynamic rather than a technical adjudication.

## What small teams should pay attention to

From the reporting: the central operational issue is provenance. Small teams should prioritize controls that preserve their own evidence and that allow them to ask focused questions of vendors: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

High-level attention points (conceptual):
- Preserve artifacts you control (exports, timestamps).
- Track when a model produced a matching output and when you raised concerns publicly.
- Ask vendors for a short, verifiable provenance statement rather than open-ended answers.

These are governance priorities reflected by the dispute in the reporting; specific thresholds, technical hashes, or retention durations are implementation details and appear in the assumptions section below.

## Trade-offs and risks

The Verge reporting centers on transparency and community trust; the trade-offs teams face are about balancing speed versus proven provenance: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Simple decision table (what the article shows vs. what it does not):

| Issue observed in reporting | Reported by The Verge? | Evidence included in article |
|---|---:|---|
| Public requests for proof that private work wasn't used | Yes | Article records requests and dispute |
| Internal training logs or manifests proving non-use | No | Article does not publish such logs |
| Signed vendor attestations or cryptographic snapshot hashes | No | Not present in the article |

Key trade-offs (conceptual):
- Transparency vs. proprietary practices: community requests for provenance can conflict with vendors' IP or operational secrecy.
- Speed vs. caution: immediate external use of model outputs accelerates work but increases exposure if provenance is later disputed.

Reference: the Verge frames the issue around mathematicians’ public requests and the resulting transparency debate: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

## Technical notes (for advanced readers)

The article reports a transparency dispute rather than providing technical forensic artifacts. For readers who may need to pursue formal evidence, the reporting implies two necessary classes of items that would resolve such disputes if provided by a vendor: (1) ingest/extraction logs or dataset manifests linking timestamps to corpora, and (2) cryptographic snapshot hashes or signed attestations covering ingestion windows. The Verge article itself does not include those artifacts: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Advanced readers should note: probabilistic influence tests and membership-inference techniques exist but are noisy and, by themselves, cannot replace vendor-provided administrative logs. The dispute documented in the article is procedural: it centers on requests for evidence rather than presentation of a definitive forensic report.

## Decision checklist and next steps

### Assumptions / Hypotheses

- The Verge snapshot documents mathematicians publicly asking OpenAI for proof and frames the situation as a transparency dispute: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- Implementation and operational thresholds below are recommendations and hypotheses for teams to use when preserving evidence or engaging vendors; they are not claims made in the Verge article and assume the technical ability to export and hash artifacts.

Concrete recommended thresholds and counts (examples you can adopt):
- Retain raw exports for at least 90 days; consider 365 days for high-value work (counts: 90, 365).
- Preserve at least 3 distinct dates per incident: shared date, model-output date, and complaint date (count: 3).
- Request vendor provenance responses within 30 days (count: 30 days).
- Use a prompt length limit of 1,000 tokens for external submissions as a precaution (tokens: 1,000).
- Treat probabilistic membership results with a significance threshold such as 95% as supportive but not conclusive (percent: 95%).
- If monitoring alerts are used, set alert latency targets under 250 ms and trigger on sustained usage increases of 10–30% (ms: 250; percent: 10–30%).
- Budgetary example: for small-scale, inexpensive archival storage assume <$10/month per active researcher for hashed transcript storage (dollar: <$10/month).

### Risks / Mitigations

- Risk: vendor refuses or delays provenance disclosures. Mitigation: preserve time-stamped archives and escalate via formal channels (legal counsel, funders, institutional policy).
- Risk: false positives from probabilistic forensic tests. Mitigation: treat such results as supportive evidence only and rely on preserved artifacts and vendor attestation for formal claims.
- Risk: slowed collaboration and increased operational friction. Mitigation: apply a two-track process (exploratory redacted sessions vs. gated verified sharing) and document costs in weeks or percent slowdowns when proposing policy changes.

### Next steps

- [ ] Inventory: export and archive any private chats or drafts related to the incident. Record three dates (shared, observed model output, complaint) and compute cryptographic fingerprints for each export. Target completion: within 7 days.
- [ ] Vendor questionnaire: send a focused provenance request asking for ingestion date ranges, snapshot hashes, and opt-out records; request a 30-day response window.
- [ ] Policy update: draft or adopt a short data-sharing rule that limits external prompts (e.g., ≤1,000 tokens), requires artifact export, and defines archival retention (e.g., 90–365 days).
- [ ] Evidence bundle: if you observe a matching output, assemble stamped exports, hashes, timeline, and vendor responses; consult counsel before public escalation.

Suggested one-paragraph vendor message to adapt:

"Please confirm whether any content from these timestamps (YYYY-MM-DD to YYYY-MM-DD) or these attached transcript hashes was included in training snapshots for [model name]. Provide snapshot hashes, opt-out records, and an officer-signed attestation within 30 days." 

Primary source for the public dispute and transparency request framing: https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
