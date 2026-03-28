---
title: "Performance of 16 IDP Models on 9,000+ Real Documents: OCR, Table and Business Benchmarks"
date: "2026-03-28"
excerpt: "Nanonets' IDP Leaderboard tests 16 models on 9,000+ real documents across three benchmarks (messy OCR, layout, business extraction), revealing task-dependent rankings and cost trade-offs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-28-performance-of-16-idp-models-on-9000-real-documents-ocr-table-and-business-benchmarks.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IDP"
  - "document-AI"
  - "benchmarks"
  - "OCR"
  - "table-extraction"
  - "model-evaluation"
  - "cost-performance"
sources:
  - "https://nanonets.com/blog/idp-leaderboard-1-5/"
---

## TL;DR in plain English

- What happened: Nanonets published an IDP (Intelligent Document Processing) Leaderboard that ran 16 models on 9,000+ real documents across three complementary benchmarks. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Key findings from the leaderboard:
  - No single model dominates every IDP task; ranks flip by benchmark (the report notes the #7 model can score higher than #1 on a given benchmark). Source: https://nanonets.com/blog/idp-leaderboard-1-5/
  - The evaluation uses three distinct benchmarks to surface different failure modes: messy-page OCR, layout/structure understanding, and business-focused extraction (invoices, tables, DocVQA). Source: https://nanonets.com/blog/idp-leaderboard-1-5/
  - Cost-versus-performance matters: Nanonets OCR2+ is reported to match frontier models while operating at less than half the cost in this comparison. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

Plain summary: the leaderboard is task-focused (OCR, table extraction, key-field extraction, visual QA, long-doc understanding) and built so teams can compare models along the exact dimensions that matter for their documents, not a single headline accuracy number. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

## What changed

- A public, task-focused IDP Leaderboard now evaluates 16 models on 9,000+ real documents using three complementary benchmarks. This makes it easier to see where models fail, not just where they succeed. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- The three benchmarks described are:
  - OlmOCR Bench: noisy and messy-page OCR (degraded scans, tiny fonts, multi-column reading order).
  - OmniDocBench: layout and structural understanding (tables, reading order, formulas).
  - IDP Core: business extraction tasks (invoices, handwriting, ChartQA, DocVQA and 20+ business use cases). Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Practical effect: vendor claims like “95%+ accuracy” are not comparable unless you map them to the specific benchmark and your document types. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

## Why this matters (for real teams)

- Real-world documents are heterogeneous: degraded scans, tiny fonts, handwriting, multi-column layouts and complex tables. The leaderboard shows model rankings change depending on which of those problems matter to you. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- For operations, track field-level metrics (precision/recall per critical field), table F1 for line items, and cost/latency trade-offs rather than a single overall accuracy score. The leaderboard provides per-benchmark detail to map models to those operational metrics. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Cost/performance note from the report: one model (Nanonets OCR2+) matches frontier-level accuracy while operating at under half the cost in the comparison. Include cost columns when you evaluate vendors. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

## Concrete example: what this looks like in practice

Scenario: an accounts-payable team needs reliable invoice line-item extraction plus vendor and total fields from mixed-quality PDFs.

POC outline (what to run and why):
1. Select representative documents that include worst-case scans and layout variants so you exercise OlmOCR and OmniDocBench failure modes. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
2. Label the business fields and a subset of table ground truth so you can measure extraction F1 and field-level precision/recall. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
3. Run 3 candidate model archetypes: OCR-focused, layout-aware, and a cost-performance hybrid (the leaderboard highlights candidates to consider). Compare per-field precision/recall and table F1 across benchmarks. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

Example metrics table (illustrative — use your POC numbers):

| Metric / Model | Layout-aware | OCR-focused | Hybrid (OCR2+) |
|---|---:|---:|---:|
| Example table F1 | 0.88 | 0.72 | 0.86 |
| Vendor precision | 94% | 90% | 93% |
| Avg. latency per page | 420 ms | 200 ms | 350 ms |
| Relative cost | 1.0x | 0.8x | ~0.5x (reported) |

(Per-benchmark detail and model comparisons: https://nanonets.com/blog/idp-leaderboard-1-5/.)

## What small teams and solo founders should do now

Actionable steps that don't require a full ML org; each step points back to the leaderboard insights so you test the right failure modes. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

1. Map your documents to a benchmark: label the primary failure modes you care about (messy OCR, layout/table extraction, or business Q&A) and pick models that the leaderboard shows perform well on those specific benchmarks. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
2. Run a focused POC across 2–3 candidate models covering the major archetypes (OCR-first, layout-aware, and the cost-performance option highlighted by the leaderboard). Capture per-field precision/recall, table F1 and average latency so you can compare operational impact. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
3. Use simple operational gates to decide whether to pilot (e.g., define acceptable manual-review rate and which fields are blockers). If a model meets your gates and materially reduces manual work, pilot it. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

Practical starter checklist (copy into a ticket):
- [ ] Pick the benchmark that matches your dominant failure mode (OlmOCR, OmniDocBench, or IDP Core): https://nanonets.com/blog/idp-leaderboard-1-5/
- [ ] Select 2–3 candidate models from the leaderboard that align to those benchmarks
- [ ] Run POC and capture per-field precision/recall + table F1 + avg. latency

Notes on privacy and speed: if you must use external services, anonymize or use a tiny synthetic sample first; test latency on your pages (the leaderboard highlights latency/throughput trade-offs). Source: https://nanonets.com/blog/idp-leaderboard-1-5/

## Regional lens (UK)

- Data protection: treat UK personal data under UK GDPR workflows and document a data-protection checklist before sending documents to third-party hosted models. The leaderboard helps you pick models to test, but legal controls remain a separate requirement. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- UK-specific POC items to add: VAT line extraction and postcode parsing as part of your ground truth so you exercise locale-specific fields. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Operational step: add a UK compliance block to your rollout gate covering data residency, retention and access controls before bulk processing. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

## US, UK, FR comparison

- High-level regulatory mapping (use the leaderboard to choose models; treat legal/regulatory needs separately):
  - US: sector-specific rules (e.g., HIPAA for health records) — restrict test data where required. Source context: https://nanonets.com/blog/idp-leaderboard-1-5/
  - UK: follow UK GDPR; consider a DPIA for large-scale processing. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
  - FR: CNIL guidance may require extra local controls for personal data; include locale-specific tests (language, invoice formats) in POC. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Practical advice: split samples by locale and treat each as its own POC so you capture format and language differences that affect extraction quality. Source: https://nanonets.com/blog/idp-leaderboard-1-5/

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The leaderboard evaluated 16 models on 9,000+ real documents across three benchmarks and highlights task-specific variance and cost-performance tradeoffs. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Useful hypotheses for your POC (to validate):
  - A small, focused POC will reveal dominant failure modes. Practical POC parameters to consider (examples, not from the leaderboard): sample sizes of 100–200 documents, label 3–6 critical fields, label table ground truth for ~20% of samples, and run 3 candidate models in a 1–2 day experiment. These are operational recommendations to validate in your context.
  - Example operational gates to test during the POC (illustrative — validate on your data): vendor and total precision >= 92%, table F1 >= 0.85, manual-review rate <= 5–7%, average latency per page <= 500 ms.

### Risks / Mitigations

- Risk: headline accuracy numbers are not comparable across tasks. Mitigation: run task-specific tests from the leaderboard and log per-field precision/recall and table F1. Source: https://nanonets.com/blog/idp-leaderboard-1-5/
- Risk: exposing personal data to third-party services. Mitigation: anonymize or use synthetic data for initial runs and require contractual data controls before scaling.
- Risk: hidden operational cost from manual review. Mitigation: include manual-review rate and cost-per-doc in your acceptance criteria.

### Next steps

This-week engineer checklist (concrete):
- [ ] Identify which benchmark(s) map to your documents (OlmOCR, OmniDocBench, IDP Core): https://nanonets.com/blog/idp-leaderboard-1-5/
- [ ] Select 3 candidate models from the leaderboard (OCR-first, layout-aware, cost-performance hybrid)
- [ ] Prepare a small labeled sample and run the three models; capture per-field precision/recall, table F1, average latency (ms), and relative cost
- [ ] Apply your rollout gate: metric pass/fail, compliance signoff, ops cost estimate, approval date

Methodology note (short): pick the leaderboard benchmark that most closely matches your documents (OlmOCR for messy OCR, OmniDocBench for layout-heavy docs, IDP Core for business extraction). Details: https://nanonets.com/blog/idp-leaderboard-1-5/.
