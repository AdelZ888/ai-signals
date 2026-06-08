---
title: "How Viktor uses prompt caching and byte-stable prefixes to cut agent-thread costs"
date: "2026-06-08"
excerpt: "Viktor turns repeated thread history into cheap cache reads with byte-stable prefixes, SDK tools, append-only logs and in-cache compaction — a 40-step thread fell from $11.35 to $2.07."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-08-how-viktor-uses-prompt-caching-and-byte-stable-prefixes-to-cut-agent-thread-costs.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "prompt-caching"
  - "agent-threads"
  - "cost-optimization"
  - "llm-ops"
  - "token-economics"
  - "architecture"
  - "compaction"
  - "viktor"
sources:
  - "https://viktor.com/blog/how-we-built-viktor-around-prompt-caching"
---

## TL;DR in plain English

- Prompt caching converts repeated thread history into cheap cache reads (≈0.1x read cost) by enforcing a byte-stable prefix and an SDK-first tool model. Viktor reports an example 40-step thread dropping from $11.35 to $2.07 (81.8% savings) on Claude Opus 4.8. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

- Why it matters: LLM APIs are mostly stateless, so agents re-send the conversation each call. Viktor measured ~2.17M input tokens for a 40-step thread even though the transcript is ~85K tokens; caching turns that repeated prefix into cheap reads. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

- Quick start checklist (30–60 minutes):
  - [ ] Record baseline tokens-per-thread and cost-per-thread
  - [ ] Stand up a Redis/TLS cache and instrument hit-rate
  - [ ] Add a byte-stable serializer and an SDK wrapper for tools

Methodology note: numbers and the running example come from Viktor's production write-up and are used here as a reproducible reference. See: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

## What you will build and why it helps

You will build a thread engine organized around a prompt cache so repeated tokens become cache reads at ≈0.1x cost. Key structural choices (all described in Viktor's post): SDK-exposed tools, append-only thread logs, byte-stable prefixes, and in-cache summarization/compaction. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

Why these choices help:
- SDK-first tools remove variable schema text from prompts and stabilize prefixes.
- Append-only logs make canonical prefixes deterministic and safe to compact.
- Byte-stability (deterministic serialization) yields high cache hit-rates.
- In-cache summarization turns a separate full-priced summarization call into a cheap cache read.

Comparison (Viktor example):

| Metric | Without caching | With prompt cache | Improvement |
|---:|---:|---:|---:|
| Total input tokens (40-step) | ~2,170,000 tokens | ~0.1x reads (cache) | N/A (≈90% token read reduction) |
| Transcript-size | ~85,000 tokens | ~85,000 tokens (summarized inside cache) | — |
| Cost (Claude Opus 4.8) | $11.35 | $2.07 | 81.8% ↓ |

Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

## Before you start (time, cost, prerequisites)

Time estimates
- Prototype to capture tokens and test cache: ~3 hours.
- SDK conversion and safe compaction rollout: 2–5 days.

Cost illustration (Viktor example)
- 40-step thread: $11.35 without caching, $2.07 with caching → $9.28 saved (81.8%). Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

Prerequisites
- Model API access and token-counting or billing traces.
- A fast cache (example: Redis with TLS and TTL support).
- Ability to move tool invocations into an SDK layer.
- Instrumentation for tokens-per-call, cache-hit-rate, latency, and cost-per-thread.

Pre-launch checklist
- [ ] API keys and billing access
- [ ] Cache instance (example: Redis) with TLS
- [ ] Tokenization library in your language
- [ ] Logging for tokens-per-call and thread-id
- [ ] A representative test thread (target: ~40 calls)

Security note: treat cached summaries and thread logs as sensitive; enable encryption-at-rest and strict ACLs. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

## Step-by-step setup and implementation

1) Instrument and measure baseline
- Log tokens-per-call, cumulative tokens-per-thread, latency (ms), and cost-per-thread ($). Run a 40-step representative thread to confirm the baseline (~2.17M input tokens vs ~85K transcript tokens in Viktor's example). Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

2) Add a byte-stable serializer and canonical prefix
- Deterministic JSON ordering, strip ephemeral timestamps, normalize floats and IDs so identical inputs produce identical bytes.

3) Implement a prompt cache
- Key pattern: thread:{thread_id}:prefix:v1
- TTL tuning examples: hot window 30m; default TTL 60m (3600s). Tune per provider. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

4) Make tools SDK-first
- Move tool logic out of prompt text; call SDK functions and append tool outputs to the append-only thread log.

5) Convert threads to append-only logs
- Event schema example: {seq:int, type:user|model|tool, ts, payload}
- Append-only invariant preserves byte-stability and simplifies compaction.

6) Summarize and compact inside the cache
- Trigger compaction when thresholds hit (example triggers: >40 events or >85,000 tokens). Summaries become cheap reads (~0.1x) rather than full-priced model calls.

7) Provider adapter and compaction timing
- Never compact a hot thread. Example gate: compact only if cache-age > 30 minutes and cache-hit-rate > 80%.
- Build provider adapters because providers differ (explicit breakpoints, TTLs, routing). Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

8) Validate with the running example
- Re-run the 40-step example and measure cost-per-thread goal (target ≥50% reduction; Viktor example: 81.8%).

Smoke-test commands:

```bash
# run a single-thread smoke test
python run_thread_smoke.py --thread-id sample-40 --capture-tokens --save=./out --retries=3
# inspect token and cost summary
cat ./out/sample-40-summary.json | jq '.tokens_per_call | {total, calls, cost_estimate}'
```

Example config (cache and compaction policy):

```yaml
cache:
  backend: redis
  prefix: "thread"
  ttl_seconds: 3600  # 60m default
compaction:
  hot_window_minutes: 30
  compact_before_cold_minutes: 5
  summary_trigger_calls: 40
  summary_trigger_tokens: 85000
provider_adapters:
  opus:
    explicit_breakpoints: true
    recommended_ttl: 1800
```

Rollout plan and gates
- Canary: 10% traffic for 48h. Gate: cache-hit-rate ≥ 75% and cost/thread reduction ≥ 50%.
- Ramp: 10% → 50% → 100% if metrics hold.
- Rollback triggers: correctness drop > 3%, user-reported regressions, or cost-per-thread rising > 20%.

Reference design: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

## Common problems and quick fixes

Problem: cache misses from tiny serialization differences
- Fix: enforce deterministic JSON, strip timestamps, normalize IDs. Add byte-diff tests; aim for serialization byte-drift < 1 byte per stable event. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

Problem: compaction removes context and hurts accuracy
- Fix: add a compaction safety window (do not compact if cache-age < 30 minutes). Validation gate: ensure A/B accuracy degradation < 2% before enabling aggressive compaction.

Problem: tools still inject variability into prompts
- Fix: move tool runs to SDK functions and append outputs to the append-only log.

Problem: provider cache eviction or routing differs
- Fix: add a provider adapter and use conservative TTLs (example recommended_ttl 1800s). Monitor provider-specific cache behavior and route accordingly. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

Quick metrics to monitor
- cache-hit-rate (target > 75%)
- cost-per-thread (target reduction ≥ 50%)
- latency tail increase (target < 100 ms)
- correctness degradation (alert if > 3%)

## First use case for a small team

Scenario: 2–5 person support team where a ticket-triage agent averages 30–50 model calls per ticket. Follow this 6-step rollout (reference: Viktor example). Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

1. Baseline capture: record tokens/thread and cost/thread for 7 days.
2. Prototype: add cache + byte-stable prefix and run on offline replay threads (prototype ~3 hours).
3. Smoke tests: run 10 sample threads. Target: cost reduction > 50%.
4. Canary: enable caching for 10% of live tickets for 48h. Monitor correctness and cache-hit-rate.
5. Ramp: 10% → 50% → 100% if cache-hit-rate > 75% and correctness holds.
6. Full ramp + optimize compaction (suggested triggers: 40 calls or 85,000 tokens).

Operational targets for the small team:
- cache-hit-rate > 75%
- cost-per-thread reduction > 50%
- latency tail increase < 100 ms

Aim: Viktor’s 81.8% cost reduction on a 40-step thread is a practical benchmark. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching

## Technical notes (optional)

- Byte-stability: use deterministic JSON, stable field ordering, and removal of ephemeral fields for reliable cache hits. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching
- Compaction algorithms: in-cache LLM summarization, windowed snapshots, or checkpoint compression. Trade-offs: accuracy vs read-cost; Viktor runs summarization inside the thread's cache so history reads are cheap. Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching
- Provider differences: caches behave differently (explicit breakpoints vs automatic TTLs vs routing). Build an adapter layer and tune TTLs per-provider.
- Security: encrypt cache values at rest, enforce ACLs, and redact PII where needed.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Model APIs are stateless; callers re-send history and repeated tokens drive cost. Viktor’s example: 2.17M input tokens vs 85K transcript on a 40-step thread and cost drop from $11.35 → $2.07 (81.8%). Source: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching
- Hypothesis: byte-stable prefixes + SDK-first tools will yield cache-hit-rate > 80% on representative threads; validate with A/B testing and a canary (10% traffic for 48h).

### Risks / Mitigations

- Risk: correctness loss from over-aggressive compaction.
  - Mitigation: compaction safety window (do not compact if cache-age < 30 minutes), A/B tests, rollback if correctness drop > 3%.
- Risk: cache misses from serialization drift.
  - Mitigation: deterministic serializer, byte-diff tests, and stable event schemas.
- Risk: provider cache eviction surprises.
  - Mitigation: provider adapter and conservative TTLs (example hot window 30m; recommended_ttl 1800s).
- Risk: PII leakage in cache.
  - Mitigation: encryption-at-rest, strict ACLs, redaction policies.

### Next steps

- Build a 3-hour prototype to measure tokens-per-thread on your heaviest agent; aim to reproduce the baseline numbers.
- Implement a canonical serializer and provider adapter; canary at 10% traffic and target cache-hit-rate ≥ 75%.
- Stage rollout: 10% → 50% → 100% with gates (cache-hit-rate, correctness, cost-per-thread).

Post-launch alerts to configure:
- cache-hit-rate < 60%
- cost-per-thread rises > 20%
- correctness drop > 3%

Core reference and further reading: https://viktor.com/blog/how-we-built-viktor-around-prompt-caching
