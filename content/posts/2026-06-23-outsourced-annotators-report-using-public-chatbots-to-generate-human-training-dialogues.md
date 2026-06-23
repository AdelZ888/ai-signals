---
title: "Outsourced annotators report using public chatbots to generate 'human' training dialogues"
date: "2026-06-23"
excerpt: "Whistleblowers say subcontracted annotators often prompt public chatbots (e.g. ChatGPT) to produce 'human' training dialogues—risking model feedback loops. Practical checklist included."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-23-outsourced-annotators-report-using-public-chatbots-to-generate-human-training-dialogues.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "training-data"
  - "data-quality"
  - "crowdwork"
  - "model-risk"
  - "ai-safety"
  - "data-governance"
  - "newscientist"
sources:
  - "https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/"
---

## TL;DR in plain English

- Workers paid to produce training conversations for new AI models report routinely using public chatbots (for example ChatGPT) to generate examples instead of writing them from scratch. Source: New Scientist (22 June 2026): https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- This shortcut is reported mainly among subcontracted, quota‑driven, low‑paid trainers; whistleblowers told New Scientist the practice is widespread and hard to stop: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- The core risk: training on model‑generated outputs can narrow linguistic diversity and amplify prior models’ errors, reducing future model robustness: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Quick operational fixes you can apply in 30 minutes: add a provenance field, require prompt disclosure, and run spot checks (checklist below): https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

Concrete short scenario (illustrative): a startup buys 10,000 dialog examples from an outsourced vendor paid per item. Workers meet quotas by prompting a public chatbot and copying replies into the submission form; the startup later trains on that data and risks amplifying the chatbot’s style and errors. This behavior is described in New Scientist’s whistleblower reporting: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

- [ ] Quick action checklist included at the end of the doc (see Technical notes + this-week checklist).

## What changed

- Earlier generation LLMs were trained on large web scrapes (many billions of tokens). To improve conversational quality, teams began hiring humans to create and test dialogs to supply higher‑quality examples.
- New Scientist reports that some contractors, facing per‑item quotas and low pay, are instead prompting public chatbots and submitting the chatbot outputs as if they were original human dialogs. The reporting is based on multiple whistleblowers and highlights this behavior in outsourced roles: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Resulting change in the data pipeline: an increasing share of “human” training text may actually be model output, which can introduce a feedback loop that narrows stylistic and factual diversity in future models: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## Why this matters (for real teams)

- Data quality: machine‑generated dialogs tend to reuse templates and exhibit less lexical variety. Over time, a model trained on such data can become repetitive and less robust. New Scientist’s whistleblower accounts make this provenance risk concrete: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Provenance and auditability: if vendors mislabel AI outputs as human‑written, compliance checks and internal audits will be misled; the article highlights this provenance gap in outsourced workflows: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Detection difficulty: contractors can hide shortcuts unless you require prompt histories, screenshots, timestamps or lightweight telemetry. Operational controls such as logging, spot checks and schema fields are practical mitigations: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

Concrete thresholds to monitor: average worker_time_to_complete <60 s for a 3‑turn dialog is suspicious; >30% n‑gram overlap across a batch suggests duplication; quarantine a vendor if >10% of items are flagged.

## Concrete example: what this looks like in practice

Scenario (illustrative): a vendor delivers 5,000 multi‑turn dialogs. Whistleblowers described workers using public chatbots to meet quotas rather than creating original dialogs: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

Fast signals to watch for

- Many submissions use identical turns or repeated phrasing across >5% of items.
- Low completion times (for example, under 60 seconds per multi‑turn dialog) or many items submitted at near‑identical timestamps.
- Missing prompt_history, screenshots, or timestamps on submissions.

Decision table (illustrative)

| Evidence present | Stylistic similarity (0–1) | Action |
|---|---:|---|
| Prompt history + unique timestamps | <0.6 | Accept and merge |
| No prompt history; similarity 0.6–0.9 | 0.6–0.9 | Quarantine + manual review |
| No provenance; similarity >0.9 or many duplicates | >0.9 | Reject + flag vendor |

Quarantine quick steps: request raw prompt_text, an API log or screenshot, and worker_time_to_complete (seconds). Open an audit ticket and attempt to reproduce the dialog in a closed environment. These steps respond directly to the contractor behaviors described by New Scientist: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## What small teams and solo founders should do now

Treat this primarily as a provenance and quality problem you can fix with small process changes. Actions below are tailored to teams without large engineering resources.

Minimum 30‑minute fixes (solo/mini teams)

- Add a lightweight provenance_flag field to each example: human | assistant_assisted | bot_original. Store this in your CSV or JSONL line for each item. Source context: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Require suppliers or contractors to submit prompt_text and a timestamp for each item; if you’re a solo founder, require a short recorded note (audio or text) explaining how the example was created (10–30 s). This is low overhead but raises the bar for undisclosed bot use.
- Implement a sampling rule: for every 50 items received, manually inspect 1 item (1/50 sampling). If you receive 1,000 items from a new vendor, perform a 1,000‑item sample scan or outsource a short audit (typical cost range $300–$1,000 for a focused 1,000‑item vendor review).

Practical daily operations (small teams)

- Capture minimal telemetry per submission: prompt_history (recommend up to 1,024 tokens), worker_id, worker_time_to_complete (s), and provenance_flag. These are cheap to store and give auditors actionable signals.
- Run a duplication check and basic stylometry on batches of 500–1,000 items; flag batches where >30% n‑gram overlap appears or where >10% of items are identical.
- Update simpler contract clauses or supplier onboarding: require disclosure of third‑party model use and permit spot checks; make undisclosed model use terminable.

If you’re solo and truly resource constrained, prioritize these three: (1) add provenance_flag, (2) require prompt_text + timestamp, (3) sample 1 per 50 for manual checks. New Scientist reporting explains where these shortcuts happen and why these controls help: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## Regional lens (UK)

- The New Scientist accounts describe problems that occur in outsourced, quota‑driven trainer roles common in many markets, including the UK: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Under UK‑GDPR, keeping records of processing activities is expected. Storing prompt histories and provenance flags helps demonstrate recordkeeping. Recommended retention: keep provenance logs and screenshots for 12 months to support audits.
- Practical UK steps: add a data‑provenance appendix to supplier contracts, count contractor vs employee trainers, and collect prompt logs and timestamps for a 1,000‑item sample during onboarding. This aligns operationally with the provenance gaps described by New Scientist: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## US, UK, FR comparison

| Dimension | US | UK | FR (France) |
|---|---:|---:|---:|
| Worker classification landscape | Patchwork enforcement; contract law varies | Contractor risk similar; GDPR recordkeeping matters | Strong labour protections; active GDPR enforcement |
| Data‑provenance expectations | Contractual and sector controls | UK‑GDPR requires documentation | GDPR enforcement and national regulators are active |
| Enforcement intensity for provenance gaps | Medium (sector dependent) | Medium‑High (data protection focus) | High (GDPR + national enforcement) |

Common cross‑jurisdiction advice: require prompt histories, add provenance flags, run automated detection scans, and keep manual review thresholds (for example 1 check per 50 items or a 1,000‑item sample for new vendors). New Scientist documents where outsourced shortcuts can appear: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## Technical notes + this-week checklist

### Assumptions / Hypotheses
- Hypothesis: some contractors use public chatbots to speed up annotation and dialog production; supported by New Scientist whistleblower accounts (22 June 2026): https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Assumption: teams can capture lightweight telemetry (prompt_history, timestamps, worker_time_to_complete) without large engineering effort.
- Operational thresholds below are heuristics to prioritize effort, not measured prevalence estimates.

### Risks / Mitigations
- Risk: false positives from detection heuristics (stylometry, n‑gram overlap). Mitigation: quarantine rather than delete; require manual review for mid‑range similarity (for example 0.6–0.9).
- Risk: contractor pushback on disclosure. Mitigation: update contracts, provide clear evidence examples (prompt history, screenshot, API logs), and enforce spot checks.
- Risk: regulatory scrutiny if provenance is fuzzy. Mitigation: keep a provenance_pass boolean, retain a 1,000‑item evidence sample, and align records with GDPR/UK‑GDPR expectations.

### Next steps
- This‑week checklist (practical):
  - [ ] Add provenance_flag (human | assistant_assisted | bot_original) to the dataset schema.
  - [ ] Capture prompt_history (recommend up to 1,024 tokens), worker_id, and worker_time_to_complete (s) on each submission.
  - [ ] Run a 1,000‑item stylometry and n‑gram duplication scan; flag items with >30% n‑gram overlap or similarity >0.6.
  - [ ] Quarantine datasets where >10% of items are flagged; perform manual review on quarantined items (sample 50 items).
  - [ ] Update contractor terms to require disclosure of third‑party model use and prompt history on demand.
  - [ ] Log one audit ticket reproducing a quarantined dialog using the submitted prompt history.

Methodology note: this brief is grounded in New Scientist whistleblower reporting (22 June 2026) and focuses on pragmatic, low‑cost operational controls that respond to the provenance issues the article describes: https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/.
