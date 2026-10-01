---
title: "ProvenanceGuard: Preventing Cross‑Source Conflation in MCP LLM Agents"
date: "2026-10-01"
excerpt: "Adds a source-aware verification layer for MCP agents that checks claims against the named tool output, returns support_score and match_span, and flags cross-source conflation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-01-provenanceguard-preventing-crosssource-conflation-in-mcp-llm-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "MCP"
  - "ProvenanceGuard"
  - "source-aware verification"
  - "LLM agents"
  - "provenance"
  - "factuality"
  - "cross-source conflation"
sources:
  - "https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source"
---

## TL;DR in plain English

- Problem: agents using the Model Context Protocol (MCP) call many tools and combine their outputs. That can cause cross-source conflation: a fact that is true somewhere in the pooled evidence is attributed to the wrong source. See: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source
- Goal: add a source-aware verifier that checks each claim against the specific source the agent names, not just the pooled evidence. See: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source
- Quick actions:
  - Add a verifier that returns support_score (0.0–1.0) and match_span for each claim.
  - Set accept threshold = 0.8, clarify band = 0.5–0.8, escalate <0.5.
  - Enable human review for the first 1,000 flagged queries or first 2 weeks.

Quick checklist (artifact you should produce):
- [ ] provenance_config.json with source schema and alias table
- [ ] verifier that returns support_score and match_span per claim
- [ ] decision table mapping score bands to actions

Methodology note: this write-up follows the ProvenanceGuard framing from the Hugging Face summary: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

Concrete short example:
- Agent reply: “According to the account record, this plan includes a 30-day refund window.”
- Problem: the 30-day rule exists in the company policy, not in the account record. A source-blind checker might accept this because the fact appears somewhere in the pooled evidence. A source-aware verifier would flag the mismatch. See: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## What you will build and why it helps

You will build a source-aware verification layer similar to ProvenanceGuard. It takes an agent answer, pulls out claimed facts, and checks each claim specifically against the source the agent names. That prevents cross-source conflation, where a claim is true somewhere but not in the named source. Reference: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

Benefits:
- Auditability: every accepted claim links to source_id, a match_span, and a numeric support_score.
- Safer downstream automation: systems that depend on precise attribution get correct source links.
- Low-cost prototype: basic wiring takes a few hours and is cheap for low-volume traffic (example cost estimate later).

Deliverables you should produce:
- provenance_config.json: source schema + alias table.
- Verifier endpoint: returns support_score (0.0–1.0) and match_span for each claim.
- Decision table and rollout gate (canary percentages: 10% -> 50% -> 100%).

### Plain-language explanation (before advanced details)

MCP agents can call many tools: search, account records, policy DBs, etc. Each tool reply should keep a source_id. When the agent writes its answer, it should say which source it used for each claim. The verifier takes each claim, looks only at the named source fragment, and scores how well that fragment supports the claim. If the fragment does not support the claim, the system clarifies or routes to a human.

This is different from regular fact-checkers that look at the combined evidence. Those checkers can miss misattribution because the fact may appear in some other source.

## Before you start (time, cost, prerequisites)

Time estimate:
- Prototype wiring: ~4 hours.
- Staged rollout and monitoring: 1–2 days.
- Labeled test run (200 samples): ~2 hours.

Cost estimate (example):
- Prototype: a few dollars per day for low volume.
- Example: if each scoring call costs $0.002 and you score 1,000 claims/day → ~$2/day.

Prerequisites:
- An MCP-compliant agent that preserves source_id and text fragments in tool outputs. See: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source
- A verifier that returns support_score and match_span for claim vs. source fragment.
- A labeled test set (200 labeled items is a realistic small-team sample).

Concrete thresholds to set before rollout:
- support_score accept threshold: 0.8
- clarify band: 0.5–0.8
- misattribution target: <5% on a 200-sample test
- initial canary volume: 10% of traffic for 48–72 hours, then 50% for 48 hours, then 100%
- manual-review cap: first 1,000 queries or 2 weeks

Reference briefing: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## Step-by-step setup and implementation

1. Instrument MCP tool outputs

   - Ensure every tool call returns: { source_id, text, metadata } and keep source_id with the agent trace. See: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

2. Emit claimed facts and pointers

   - When composing an answer, emit claimed facts with: claim_id, claimed_source_name, natural-language claim text, and a pointer to the reasoning step. Keep these machine-readable.

3. Run source-aware verifier per claim

   - For each claim, check only the named source fragment(s). The verifier should return support_score (0.0–1.0) and match_span (start/end token offsets or character offsets) that show where the support comes from.

4. Apply decision rules (example)

   - Accept if support_score >= 0.8.
   - If 0.5 <= support_score < 0.8, mark "needs clarification" and attempt automated repair.
   - If support_score < 0.5, mark "unsupported-by-named-source" and escalate to human review for high-impact claims.

5. Repair or escalate

   - Repair actions: re-run the named tool, re-quote a better span, or present a multi-source attribution template.
   - Escalate: route to a human reviewer for sensitive claims (billing, refunds, legal).

6. Test end-to-end

   - Run unit and integration tests against a labeled set (200 items). Measure attribution precision, false acceptance rate, and latency.

7. Deploy with staged rollout and rollback plan

   - Canary: 10% for 48–72 hours with full logging.
   - Advance to 50% for 48 hours if misattribution <5% on a rolling 200-sample window and median latency increase <100 ms.
   - Finalize 100% rollout when gates pass. Rollback immediately if misattribution >3% or unsupported claims increase by >50% vs baseline.

Example commands and config:

```bash
# start verifier server (example)
uvicorn verifier.app:app --host 0.0.0.0 --port 8080 --workers 2

# run basic integration test
python tests/run_provenance_tests.py --samples 200 --threshold 0.8
```

```json
{
  "sources": [
    {"id": "account_record", "aliases": ["acct", "account_v1"]},
    {"id": "policy_doc", "aliases": ["policy_v1", "refund_policy"]}
  ],
  "thresholds": {"accept": 0.8, "clarify": 0.5},
  "cache_ttl_ms": 60000
}
```

Decision table (example):

| support_score | Action |
|---:|---|
| >= 0.8 | Accept and record claim_id -> source_id -> match_span |
| 0.5 - 0.8 | Ask agent to clarify / automated repair |
| < 0.5 | Route to human review; return safe-default reply |

Reference: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## Common problems and quick fixes

Problem: verifier accepts a claim because the fact exists somewhere (false accept).
- Cause: source-blind check.
- Fix: enforce span overlap with the named source and raise accept threshold to 0.85 if false accept rate >2%.

Problem: source aliasing (e.g., "policy doc 1" vs "policy_v1").
- Fix: normalize names in provenance_config.json and keep an alias table. Fail fast if alias mapping is ambiguous.

Problem: verifier is too slow and adds latency.
- Fix: batch-check claims, add cache with TTL 60,000 ms (60 s), and set a 100 ms per-claim soft latency budget. Use parallel workers.

Problem: verifier blocks correct answers (too conservative).
- Fix: add a secondary heuristic (metadata checks) and allow automated repair prompts for scores between 0.6 and 0.8.

Logging checklist (must capture these fields):
- [ ] claim_id
- [ ] claimed_source
- [ ] support_score
- [ ] match_span
- [ ] action_taken

Include reference while debugging: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## First use case for a small team

Scenario: a 3-person support team deploys a customer-account agent that answers refund questions and must cite either the account record or company policy. See problem framing: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

Minimal rollout plan (owners + time estimates):
- Instrument tools with source_id: 1 hour (owner: SRE).
- Add claim emission to agent: 2 hours (owner: ML engineer).
- Implement verifier endpoint + config: 4 hours (owner: ML engineer).
- Run 200-sample labeled test and adjust thresholds: 2 hours (owner: QA).

Concrete rollout gates for small teams:
- Human review for unsupported claims for the first 2 weeks or until 1,000 queries are processed.
- Acceptance metric: <5% misattribution on a 200-sample test before full traffic.

Advice for a solo founder: start with exact-span matching (binary). Enable logs and manual review for the first 100–200 flagged items. Keep provenance_config.json minimal and add aliases only as needed.

Reference: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## Technical notes (optional)

- MCP detail: preserve source_id across the agent trace so the verifier can map claims to fragments; agents often pool outputs, which is why provenance checks must be source-aware. See: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source
- Scoring approaches: combine exact-span overlap (for precision) and embedding similarity (for paraphrase tolerance). Example weights: 70% span overlap, 30% embedding similarity. Limit fragments to ~512 tokens for cost control.
- Performance budgeting: expect ~100 ms additional median latency per claim; batch where possible and use caches (TTL 60,000 ms).

## What to do next (production checklist)

### Assumptions / Hypotheses

- The agent preserves source_id for each tool output throughout its reasoning. Source: https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source
- Verifier scores in a 0.0–1.0 range where >=0.8 is a reasonable initial accept threshold.
- Prototype inference cost is modest for low volume; example budgeting uses $0.002 per claim at 1,000 claims/day.

### Risks / Mitigations

- Risk: cross-source conflation persists if the agent names the wrong source. Mitigation: require match_span and metadata checks; flag repeat offenders for retraining.
- Risk: latency and cost increase. Mitigation: cache fragments (TTL 60,000 ms), batch checks, and set per-claim latency failover to a safe-default reply at >100 ms additional latency.
- Risk: verifier false positives/negatives. Mitigation: keep a human-review queue during early rollout (first 1,000 queries or 2 weeks) and monitor a rolling 200-sample audit.

### Next steps

- Produce provenance_config.json and decision_table; run integration test with 200 samples and tune thresholds.
- Deploy canary: 10% for 48–72 hours; gate to 50% then 100% if misattribution <5% and latency impact <100 ms.
- Schedule weekly audits for month 1 and maintain an alias table for new sources.

Reference: ProvenanceGuard and cross-source conflation explanation — https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source
