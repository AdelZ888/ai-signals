---
title: "Implementing Pre‑ and Post‑LLM Guardrails to Prevent PII Leakage and Catch Hallucinations"
date: "2026-04-07"
excerpt: "Step-by-step guidance to add two guardrails around each LLM call: pre-LLM redaction/blocking to stop PII leakage and post-LLM verification to catch hallucinations before users see them."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-07-implementing-pre-and-postllm-guardrails-to-prevent-pii-leakage-and-catch-hallucinations.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "ai-agents"
  - "guardrails"
  - "llm-safety"
  - "pii-redaction"
  - "prompt-injection"
  - "hallucination-detection"
  - "observability"
  - "deployment"
sources:
  - "https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails"
---

## TL;DR in plain English

- Build two cooperating guardrails around each large language model (LLM) call: a pre-LLM check that blocks or redacts risky input before it leaves your environment, and a post-LLM verifier that checks outputs before users see them. (See guidance on pre-/post-LLM guardrails: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

Quick example scenario

- A customer support chat contains a credit card number. Pre-LLM redaction removes the card number before the prompt is sent to the external model. Later, the model makes an unsupported factual claim; the post-LLM verifier flags it and returns a retry-with-evidence action. The user never sees the raw card number or the hallucinated claim. This two-point interception pattern (pre-LLM and post-LLM) is described in the Arthur.ai guardrails guidance.

## What you will build and why it helps

Plain-language explanation before advanced details (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- Guardrails are interceptions placed at two points in the agent loop to prevent PII exfiltration and to catch unsupported outputs. You will implement:

1) Pre-LLM middleware (proxy or SDK hook)
   - Runs synchronously before any assembled context leaves your environment.
   - Common uses: PII redaction, secret blocking, prompt-injection detection.
2) Post-LLM verifier
   - Runs immediately after a model response and before user delivery.
   - Common uses: hallucination detection (unsupported claims), confidential-data leakage checks, and dangerous-instruction detection.

Why this helps

- These guardrails convert silent model failures into auditable decisions: deliver, retry-with-evidence, redact-and-deliver, or block-and-escalate. The Arthur.ai article documents exactly this pre/post interception approach and real-world uses such as redacting PII for a major airline and catching hallucinations before user exposure (https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails).

Deliverables (example filenames)

- redaction_rules.yaml
- prompt_injection_rules.yaml
- output_verifier_config.json
- decision_table.csv

Store artifacts in a signed Git repo and record a changelog.

## Before you start (time, cost, prerequisites)

Prerequisites (see list and rationale in https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- An application that calls an LLM and can insert a middleware hook (HTTP proxy or SDK interceptor).
- A labeled sandbox of ~200–1,000 representative examples (benign, edge, adversarial) for initial validation.
- CI and a staging environment for canary rollout and automated tests.
- Observability: metrics (Prometheus-style), structured logs (JSON), and an alerting system (PagerDuty/Slack).

Estimated time and cost (rough)

- Development: 2–4 engineer-weeks for core pre/post components and basic rules.
- Validation labeling: 1–2 engineer-weeks for 200–500 examples.
- Runtime cost: expect $50–$500/month for lightweight verification at low volume (1k–10k checks/month); if you run high-rate fact-checker LLM calls, budget $500–$5,000/month.

Planning notes

- Decide placement: centralized proxy vs. edge hook. Central proxy simplifies rollout; edge reduces raw-PII exposure. Guidance and patterns for these trade-offs are covered in the Arthur.ai guardrails post (https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails).

## Step-by-step setup and implementation

1) Define goals and decision logic

- Create decision_table.csv with columns: verifier_result, severity_score (0–100), action {deliver|retry_with_evidence|redact|block_and_escalate}, notify {none/team/SL}.

2) Create rule artifacts

- Example redaction_rules.yaml (deterministic regex + allowlist):

```yaml
rules:
  - id: cc-number
    priority: 10
    pattern: '(?:\b(?:3[47][0-9]{13}|4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12})\b)'
    action: redact
    redact_with: '[REDACTED_CREDIT_CARD]'
  - id: email
    priority: 5
    pattern: '\b[\w.%-]+@[\w.-]+\.[A-Za-z]{2,6}\b'
    action: redact
allowlist:
  - '\b(?:internal-bot@company.com)\b'
```

- Example output_verifier_config.json snippet:

```json
{
  "checks": {
    "leak_check": {"enabled": true},
    "claim_support": {"min_similarity": 0.6, "min_supported_fraction": 0.8},
    "safety": {"forbidden_categories": ["self_harm","data_exfiltration"]}
  },
  "actions": {
    "pass": "deliver",
    "soft_fail": "retry_with_evidence",
    "hard_fail": "block_and_escalate"
  }
}
```

3) Implement pre-LLM middleware (proxy or SDK hook)

- Operation: receive request, apply high-priority regex rules, run lightweight NER, emit audit event {request_id, rule_ids_triggered, redaction_summary, original_text_hash}.
- Performance targets: pre-LLM redaction latency <500 ms at the 99th percentile. If exceeded, fall back to deterministic rules and mark the audit event as partial. Use guidance in Arthur.ai for interception points (https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails).

4) Implement post-LLM verifier and correction loop

- Verifier checks: leak-check, extract claims and retrieve top-3 documents, compute semantic similarity; if max similarity <0.6 for a claim, mark unsupported. Action map: pass -> deliver; soft_fail -> retry_with_evidence; hard_fail -> block_and_escalate.

- Correction loop: for soft_fail, re-run agent with evidence-citation prompt; if still unsupported, escalate to HITL.

5) Tests and rollout

- Unit tests for each regex/NER edge case, integration tests on 200 labeled examples, canary rollout: 1% traffic for 24 h -> 10% for 48 h -> full if gates pass (these percentages and durations are consistent with guardrail best practices described in the source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails).

Command-line example: start a local proxy and test a redaction call

```bash
# run local proxy (example)
$ ./start-guardrail-proxy --port 8080 --config ./redaction_rules.yaml
# test with curl
$ curl -s -X POST http://localhost:8080/check -d '{"text":"Card 4111-1111-1111-1111"}'
```

Decision table (example)

| verifier_result | severity_score | action               | notify |
|-----------------|----------------|----------------------|--------|
| PASS            | 0              | deliver              | none   |
| SOFT_FAIL       | 40             | retry_with_evidence  | team   |
| FAIL            | 90             | block_and_escalate   | ops    |

## Common problems and quick fixes

(Examples derived from guardrail patterns in https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- Over-redaction (false positives)
  - Symptom: legitimate user content removed; UX complaints increase.
  - Fix: add allowlist entries and raise confidence required for automatic redaction. Example: auto-redact NER entities only when model_confidence >=0.85; otherwise mask-and-log and prompt for confirmation.

- Missed PII patterns (false negatives)
  - Symptom: PII escapes detection (novel formats or obfuscation).
  - Fix: expand deterministic patterns, add normalization (strip punctuation), and add obfuscated examples to training. Concrete: normalize whitespace/hyphens before regex checks for numeric tokens length 13–19.

- Prompt-injection bypasses
  - Symptom: adversarial phrasing defeats signature rules.
  - Fix: add semantic-similarity checks against known injection vectors (embedding cosine >=0.8) and route ambiguous cases to HITL.

- Latency impact
  - Symptom: checks increase latency beyond SLOs.
  - Fix: split checks: deterministic rules in the fast path; learned checks async for non-critical flows. Maintain budgets: pre-LLM redaction <500 ms; synchronous verifier ≤800 ms at p99.

- Classifier drift
  - Symptom: NER/classifiers degrade over time.
  - Fix: weekly evaluations on rolling labeled samples, track precision/recall, retrain monthly or when precision drops >5 percentage points.

## First use case for a small team

Target: a support assistant for a solo founder or 2–3 person team. Keep scope tight and auditable (see practical guardrail patterns at https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails).

Three priorities with concrete steps and time estimates

1) Ship a minimal pre-LLM redactor (2–5 days)
   - Implement a small proxy that applies 5–10 deterministic regex rules (emails, credit cards, SSNs, API tokens, internal hostnames).
   - Log: {request_id, rules_triggered, original_text_hash}. Retain logs 30 days.
   - Acceptance: pass 200 labeled privacy examples with false-negative rate <1% and false-positive rate <5%.

2) Add a lightweight post-LLM verifier (3–7 days)
   - Check for proprietary keywords/internal URLs and run a simple claim-support check against a small FAQ index (top-3 docs).
   - Action: if unsupported, respond, “I don't have confirmation for that—would you like me to check?” or escalate for critical flows.
   - Acceptance: hallucination_rate <5% on 200 validation samples.

3) Canary and iterate (ongoing)
   - Canary: 1% traffic for 24 h, 10% for 48 h, then full rollout after review.
   - Monitor: PII_block_count, hallucination_rate, verifier_latency.

Ownership

- Assign a single guardrail owner (engineer) for rule changes and weekly 30-minute reviews of blocked inputs.

## Technical notes (optional)

- Placement trade-offs: centralized proxy vs. edge agent; see patterns and examples at https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails.

- Detection mix
  - Deterministic regex for high-precision tokens; use Luhn for candidate credit-card numbers.
  - NER/classifier for contextual entities; only auto-redact when confidence >=0.85.
  - Semantic checks for prompt-injection via embedding similarity (cosine >=0.8).

- Verifier strategies
  - Extract numeric facts, dates, and named entities as candidate claims; retrieve evidence and compute similarity; use thresholds like min_similarity 0.6 and min_supported_fraction 0.8.
  - Optionally use a smaller auxiliary LLM as a fact-checker with SUPPORTED probability >=0.8 before delivering claims.

- Instrumentation and observability
  - Metrics: PII_block_rate, PII_false_positive_rate (sampling), verifier_outcomes (pass/soft_fail/hard_fail), verifier_latency_p50/p95/p99, config_change_count, canary_percent.
  - Alerts: trigger PagerDuty for PII_block_count >0 during the first 24 h of canary OR hallucination_rate >2%.

- Security
  - Encrypt audit logs at rest, restrict access, rotate allowlist entries quarterly, retention: redacted logs 30 days, original_text_hash 24 h.

## What to do next (production checklist)

(See the Arthur.ai guardrails summary and examples: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- [ ] Finalize rule artifacts and commit to a signed config repo: redaction_rules.yaml, prompt_injection_rules.yaml, output_verifier_config.json, decision_table.csv.
- [ ] Create dashboards and alerts for PII_block_rate, hallucination_rate, verifier_latency_p95/p99, canary_percent.
- [ ] Prepare canary plan: 1% (24 h) -> 10% (48 h) -> full; require manual sign-off at each stage.
- [ ] Publish runbook: owner, rollback steps, test suite, changelog, sampling cadence for manual review.

### Assumptions / Hypotheses

- Canary percent: 1% -> 10% -> 100%; durations: 24 h, 48 h, 72 h respectively.
- Latency budgets: pre-LLM redaction <500 ms at p99; synchronous verifier ≤800 ms at p99.
- Acceptance gates: hallucination_rate <2% (sampled) and zero confirmed PII leakage during each 24 h canary window.
- Labeled sample targets: start with 200 examples; scale to 1,000 for broader coverage.
- Cost example: $50–$500/month for lightweight verification; $500–$5,000/month if high-rate fact-checker LLMs are used.

### Risks / Mitigations

- Risk: false positives block legitimate users. Mitigation: allowlist and conservative auto-redaction thresholds; provide explicit user flows to confirm masked text.
- Risk: missed PII or novel injection vectors. Mitigation: normalization passes, semantic checks, and routine rule updates from sampled blocked/escaped inputs.
- Risk: latency regression. Mitigation: fast-path deterministic checks and async verification; telemetry for fallback events.
- Risk: config drift across edge agents. Mitigation: signed config repos, versioned releases, and health checks.

### Next steps

1. Finalize artifacts and store in signed repo.
2. Prepare dashboards and alerts for the key metrics above and schedule weekly review.
3. Execute the canary per the gates and require manual sign-off at each stage.
4. Publish the runbook with owner, rollback steps, test suite, changelog procedure, and sampling cadence for manual review.

Further reading and examples: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails

(Methodology note: claims about interception points and patterns are grounded in the Arthur.ai guardrails summary cited above.)
