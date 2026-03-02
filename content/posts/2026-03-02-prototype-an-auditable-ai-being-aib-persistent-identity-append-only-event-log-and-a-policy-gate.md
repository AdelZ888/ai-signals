---
title: "Prototype an auditable AI Being (AIB): persistent identity, append-only event log, and a policy gate"
date: "2026-03-02"
excerpt: "In this hands-on guide, assemble a 4-hour prototype of an 'AI Being' - persistent identity, immutable append-only events, an LLM behaviour loop and a policy gate for auditability."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-02-prototype-an-auditable-ai-being-aib-persistent-identity-append-only-event-log-and-a-policy-gate.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai"
  - "agents"
  - "aib"
  - "transparency"
  - "safety"
  - "tutorial"
  - "event-sourcing"
  - "governance"
sources:
  - "https://news.ycombinator.com/item?id=47014795"
---

## TL;DR in plain English

- Build a small prototype of a persistent, accountable “AI Being” (AIB). This is a minimal system that keeps a constant identity and an immutable record of actions. The Hacker News discussion that inspired this approach is here: https://news.ycombinator.com/item?id=47014795.
- Keep the system tiny and replaceable. Start with 1 identity service, 1 append-only event log, 1 behaviour loop, 1 simple policy gate, and 1 read-only audit view. Each piece should be easy to swap or rewrite in a few hours: https://news.ycombinator.com/item?id=47014795.
- Design goals in one line: persistent ID, immutable events, visible state changes. This framing comes from the community discussion: https://news.ycombinator.com/item?id=47014795.

Concrete example (short scenario):
- A 3-person SaaS team gives a persistent assistant one identity. The assistant remembers onboarding choices, proposes follow-up actions, and logs every suggestion with a signed hash. Humans approve risky actions in a small manual queue. This is the simple, auditable use case discussed in the thread: https://news.ycombinator.com/item?id=47014795.

## What you will build and why it helps

You will build a minimal prototype that demonstrates three core capabilities emphasized in the community thread: persistent identity, an append-only event record, and observable evolution. See the source discussion: https://news.ycombinator.com/item?id=47014795.

Concrete components you will assemble:

- Identity service: mints persistent IDs and signs assertions. Keep one keypair per environment.
- Append-only event store: every event records timestamp, sequence number, payload, and a SHA-256 hash.
- Behaviour loop: reads the last N events (default N = 10), summarizes them, and asks a large language model (LLM) for a suggested action.
- Policy gate: simple numeric thresholds and a manual-review queue for actions flagged as risky.
- Audit dashboard: read-only view that shows recent events, hashes, and sequence integrity.

Why this helps:
- Persistent IDs and immutable events make actions auditable. That reduces opaque, ephemeral behavior and helps governance. The Hacker News thread frames this as an alternative to unaccountable, short-lived agent sessions: https://news.ycombinator.com/item?id=47014795.

Plain-language explanation before advanced details:
- Think of the prototype as a book and a librarian. The identity service is the librarian’s badge (who is speaking). The event store is the book where every change is written and never erased. The behaviour loop is the librarian reading the recent pages and writing a suggested new line. The policy gate is a human who checks anything risky before the book accepts the change. This model makes the system’s history traceable and harder to hide.

## Before you start (time, cost, prerequisites)

- Time: 4 hours to assemble a local end-to-end demo. 8–24 hours to reach a stable alpha for 5 users. This schedule matches the community framing: https://news.ycombinator.com/item?id=47014795.
- Cost: local prototype can be $0. Hosted tests using an LLM API may cost $10–$100 for early development. Set a per-session cap (example: $5) during early tests.
- Prerequisites: Git; Python 3.10+ or Node 18+; SQLite or Postgres; an LLM API key or a local model runtime; basic secrets storage.
- Targets & thresholds to track from day one: event write SLO >= 99.9%; anchor snapshot cadence every 100 events; max event chain = 10 to prevent runaway loops; token budget per session 5000 tokens with fallback 2500 tokens. These thresholds are consistent with conservative prototyping in the public discussion: https://news.ycombinator.com/item?id=47014795.

## Step-by-step setup and implementation

1) Bootstrap repo and folders (10 minutes)

```bash
mkdir aib-prototype && cd aib-prototype
git init
mkdir identity events behavior dashboard
cat > identity/identity-schema.json <<'JSON'
{
  "id_type": "aib",
  "version": "1"
}
JSON
```

Include the community link in README: https://news.ycombinator.com/item?id=47014795.

2) Minimal identity service (30–90 minutes)

- Implement a POST /mint endpoint that returns { persistent_id, signed_assertion }.
- Store a single signing key for the prototype; plan key rotation for production.
- Validate the identity schema on issuance and keep a local mapping of id → public key.

3) Append-only event store (20–60 minutes)

- Quick option: use events.jsonl with one JSON event per line. Each event: timestamp (ISO), seq (int), actor_id, payload, sha256.
- Production option: use an append-only Postgres table with a monotonic seq and an insert-only policy.

Verifier sketch (keep this file as-is):

```python
# verify_events.py (sketch)
# reads events.jsonl, recomputes sha256, verifies sequence and timestamps
import hashlib, json
with open('events.jsonl') as f:
    prev_seq = -1
    for line in f:
        e = json.loads(line)
        h = hashlib.sha256(json.dumps(e['payload']).encode()).hexdigest()
        assert h == e['sha256']
        assert e['seq'] == prev_seq + 1
        prev_seq = e['seq']
```

4) Behaviour loop (30–120 minutes)

- Poll the last trigger_window = 10 events.
- Build a short summary (<= 1024 tokens) and call the LLM with token_budget_per_session = 5000 tokens (fallback 2500).
- If the policy score > 0.8 (80%), push the suggestion to manual-review. Otherwise append the action event.

Example YAML config (keep as-is):

```yaml
trigger_window: 10
token_budget_per_session: 5000
fallback_tokens: 2500
policy_review_threshold: 0.8
max_event_chain: 10
anchor_every: 100
```

5) Policy gate and human review (20–90 minutes)

- Store disallowed action patterns and numeric thresholds in a small JSON policy file.
- Provide a manual-review UI with a queue size limit of 10 items. Approved actions append a signed "approved" event.

6) Dashboard and anchoring (30–180 minutes)

- Build a read-only UI showing the last 100 events, with ISO timestamps, seq numbers, actor IDs, and SHA-256 hashes.
- Anchor snapshots by writing a snapshot hash every 100 events to an anchor file or external store.

Reference and community context: https://news.ycombinator.com/item?id=47014795.

## Common problems and quick fixes

- Runaway loops: detect repeated self-triggering within max_event_chain = 10 and disable triggers immediately. This problem and the emphasis on limits appear in the community thread: https://news.ycombinator.com/item?id=47014795.
- Corrupted logs: run verify_events.py, restore the last anchor snapshot, and replay from the previous snapshot. Keep snapshot cadence at 100 events.
- High token spend: reduce token_budget_per_session from 5000 → 2500 tokens. Cache embeddings and shorten summaries to <= 1024 tokens.
- Identity drift: reject requests when signature verification fails. Alert if identity mismatch rate > 0.1% over 24 hours.

Useful scripts to include:
- logs-health-check.sh (check last 50 events exist)
- verify_events.py (above)
- identity-ci-check.yml (CI ensures signatures validate)

Community reference: https://news.ycombinator.com/item?id=47014795.

## First use case for a small team

Scenario: a 3-person SaaS team wants a persistent assistant that remembers onboarding preferences and produces audit-friendly suggestions. The community thread suggests this class of practical, small-scale use: https://news.ycombinator.com/item?id=47014795.

Concrete rollout plan and actionable advice for solo founders and small teams (three concrete actions):

1) Start local and iterate fast:
   - Run the prototype with SQLite and a small local model or a low-cost API plan. Keep initial cost target <= $20. Local deploy lets you iterate in 2–4 hours.
2) Minimal roles & tasks a solo founder can cover:
   - Mint one persistent ID and a single signing key (10 minutes).
   - Wire an events.jsonl writer and the verify_events.py script (30–60 minutes).
   - Implement a behaviour loop that reads the last 10 events and appends suggested actions (60–120 minutes).
3) Protect with simple gates:
   - Set max_event_chain = 10 and policy_review_threshold = 0.8. If the behaviour loop proposes anything above the threshold, route it to a manual queue capped at 10 items.

Experiment plan:
- Run a 7-day internal canary with 5 users. Watch for 48 hours of stable metrics before expanding.
- Build a one-page read-only dashboard showing the last 100 events with ISO timestamps and SHA-256. This takes 2–6 hours.

Role/time table (example):

| Role | Responsibility | Time (hrs) |
|---|---:|---:|
| Founder/Engineer | Identity and behaviour loop | 2–8 |
| Designer/Engineer | Dashboard and manual-review UI | 2–6 |
| Reviewer | Policy and manual approvals | 1–4 |

Rollout path: alpha (5 users, 7 days) → beta (50 users, 14 days) → production (>500 users) with further hardening. Community inspiration: https://news.ycombinator.com/item?id=47014795.

## Technical notes (optional)

- Event sourcing: record each transition and keep periodic snapshots to speed replays. Snapshot cadence: every 100 events.
- Integrity: sign events with a persistent private key and verify with a public key. Use SHA-256 for event hashes and monotonic sequence numbers.
- LLM considerations: cap token_budget_per_session at 5000 tokens; use a fallback of 2500 tokens. Cache embeddings and limit prompts to <= 1024 tokens for summaries.
- Operational thresholds to monitor: event write SLO >= 99.9%; identity mismatch alert if > 0.1% of requests in 24h; manual-review queue depth <= 10.

Reference and design framing from the public AIB discussion: https://news.ycombinator.com/item?id=47014795.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: the AIB concept in the referenced thread emphasizes persistent identity and transparent state changes: https://news.ycombinator.com/item?id=47014795. This prototype assumes a narrow capability set and explicit human review for risky actions.
- Hypotheses and numeric thresholds to validate in an alpha test:
  - Prototype assembly time: ~240 minutes (4 hours).
  - Initial early-test cost: $0–$100 depending on local vs hosted model use.
  - Token budget per session: 5000 tokens; fallback: 2500 tokens.
  - Max event chain to prevent self-triggering: 10 events.
  - Anchor snapshot cadence: every 100 events.
  - Event write success SLO target: >= 99.9%.
  - Identity mismatch alert threshold: 0.1% of requests in 24 hours.
  - Canary window: 7 days; stable gate: 48 hours.

### Risks / Mitigations

- Risk: runaway autonomy.
  - Mitigations: rollout_gate flag; immediate disable script; max_event_chain = 10; manual-review queue capped at 10 items.
- Risk: log corruption.
  - Mitigations: run verify_events.py, anchor snapshots every 100 events, and target event write SLO >= 99.9%.
- Risk: unexpected cost.
  - Mitigations: token_budget_per_session = 5000 with fallback 2500; local model fallback; per-session cap of $5–$10 during canary.
- Risk: identity compromise.
  - Mitigations: store signing keys in a secrets manager; rotate keys every 30–90 days; alert if identity mismatch > 0.1% in 24h.

### Next steps

- [ ] Create and secure identity signing keys (HSM or secrets manager).
- [ ] Start the identity service and mint test IDs (1–2 hours).
- [ ] Boot a 7-day canary with 5 internal users; monitor for 48 hours of stable metrics.
- [ ] Verify event hashes and anchor every 100 events.
- [ ] Prepare incident response playbook and secrets rotation documentation.

Example rollback command (k8s) to disable external behaviour triggers:

```bash
kubectl set env deployment/aib --containers=aib ROLLOUT_GATE=false
./scripts/mark_canary_failed.sh --reason "anomaly_rate>1%"
```

Final reference: community discussion about building a persistent, transparent AIB: https://news.ycombinator.com/item?id=47014795.
