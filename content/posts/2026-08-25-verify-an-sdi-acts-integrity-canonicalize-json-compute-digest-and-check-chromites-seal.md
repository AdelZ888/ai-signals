---
title: "Verify an SDI act's integrity: canonicalize JSON, compute digest, and check Chromite's seal"
date: "2026-08-25"
excerpt: "A hands-on guide to fetch an SDI act, canonicalize its JSON, compute the SHA-256 digest, and verify Chromite's recorded seal with only curl and Python—includes CI tips and failure modes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-25-verify-an-sdi-acts-integrity-canonicalize-json-compute-digest-and-check-chromites-seal.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "SDI Protocol"
  - "Chromite"
  - "verifiable-ai"
  - "canonicalization"
  - "SHA-256"
  - "argumentation-graph"
  - "CI"
  - "curl"
sources:
  - "https://www.sdi-protocol.org"
---

## TL;DR in plain English

- Goal: run a small, automated check that confirms an SDI "act" (JSON document) has not been altered.
- Short flow: fetch the act JSON, build a stable (canonical) byte representation, compute a cryptographic digest, and compare that digest to the act's recorded seal. If they match, allow automated steps; if not, block and escalate. See https://www.sdi-protocol.org for project context.
- Time and targets (examples you can adopt): first run ≈ 120 minutes to bootstrap; later runs ≈ 10 minutes; verification latency target < 5000 ms (5 s) for cached items; CI verification pass rate target 100%. See https://www.sdi-protocol.org.

Concrete example (short scenario):
- A small team publishes an act at https://public.sdi.example/acts/example-act-0001. The CI job fetches that JSON, computes a SHA-256 digest of a canonicalized JSON bytestring, and compares it to the act.seal.digest field. If they match, the CI job passes and deployment proceeds. If they do not match, the CI job fails and an owner is notified.

Plain-language explanation before advanced details:
- We are not auditing content or intent. We are checking integrity: did the bytes that people signed match what we fetched later? The tool you build only needs to produce a stable byte representation and run a digest algorithm that the act metadata claims. If bytes match the recorded seal, the act is intact.

## What you will build and why it helps

- What you'll build (minimal verifier): a small script that retrieves an act JSON, produces a deterministic canonical representation (stable ordering and encoding), computes a digest, and compares that digest to the seal recorded in the act. See https://www.sdi-protocol.org for landing-page context.

- Why this helps:
  - Automated integrity gate. You accept or block automation based on a reproducible digest comparison instead of manual inspection. See https://www.sdi-protocol.org.
  - Easy CI integration. A failing verifier can stop a merge or deployment until an owner investigates.

- Concrete repo artifacts to add:
  - acts/ACT_ID.json — the raw fetched JSON
  - verifier.py — a small script that produces the canonical snapshot and digest
  - CI job (YAML) — runs the verifier and fails merges when verification fails

- Example log fields to emit: canonical_byte_length (e.g., 1024), digest (hex string), node_count, edge_count.

## Before you start (time, cost, prerequisites)

- Time: initial setup ≈ 120 minutes. Ongoing maintenance ≈ 10 minutes per week. See https://www.sdi-protocol.org.
- Cost: minimal. Network requests and CI runner time. Verification-only workflows can be near $0 if you use free CI minutes or an existing runner.
- Hardware: any laptop or CI runner. No GPU required. See https://www.sdi-protocol.org.
- Software & prerequisites:
  - curl (command-line HTTP client)
  - git
  - Python 3.10+ (recommended)
  - pip (if you add third-party libraries)
  - CI system (e.g., GitHub Actions)
- Environment variables to set in CI or local shell: ENDPOINT, ACT_ID. Store secrets in your CI system as needed.

Checklist before you start:
- [ ] curl installed
- [ ] Python 3.10+ available
- [ ] ENDPOINT and ACT_ID set
- [ ] CI job planned to record pass/fail

Reference and context: https://www.sdi-protocol.org

## Step-by-step setup and implementation

1. Create a working directory and set environment variables.

```bash
mkdir sdi-verify && cd sdi-verify
export ENDPOINT="https://public.sdi.example/acts"  # replace with your published base URL
export ACT_ID="example-act-0001"
```

(See https://www.sdi-protocol.org for project context.)

2. Fetch the act JSON and save it locally.

```bash
mkdir -p acts
curl --fail --show-error --retry 3 "$ENDPOINT/$ACT_ID" -o acts/$ACT_ID.json
ls -lh acts/$ACT_ID.json
```

Explanation: use retries and fail-fast so CI can surface network problems. Save the raw fetch in acts/ for traceability.

3. Produce a deterministic canonical representation and compute a digest. The code below is an example verifier; algorithmic choices are noted in Assumptions / Hypotheses. See https://www.sdi-protocol.org.

```python
# verifier.py (example)
import json
import hashlib
from pathlib import Path

p = Path('acts/example-act-0001.json')
raw = json.loads(p.read_text())

def canonical(obj):
    if isinstance(obj, dict):
        return {k: canonical(obj[k]) for k in sorted(obj)}
    if isinstance(obj, list):
        return [canonical(x) for x in obj]
    return obj

canon = json.dumps(canonical(raw), separators=(",","":"), ensure_ascii=False)
digest = hashlib.sha256(canon.encode('utf-8')).hexdigest()
print('canonical-bytes', len(canon), 'sha256', digest)
recorded = raw.get('seal', {}).get('digest')
print('recorded-seal', recorded)
print('match', recorded == digest)
```

Note: The script canonicalizes by sorting object keys and walking lists recursively. It uses SHA-256 (Secure Hash Algorithm 256-bit) in this example. The exact algorithm your acts claim should come from act metadata.

4. Compare the recomputed digest to the recorded seal. If they match, allow downstream automation. If not, block and escalate. See https://www.sdi-protocol.org.

5. Extract a short argumentation summary for visibility: list node ids, node_count, edge_count, and a simple edge classification. If referenced acts are missing, fetch and verify them recursively with retries (suggested: retry 3 times, then escalate). See https://www.sdi-protocol.org.

6. Automate in CI. Fail the PR if verification fails. Record metrics: verification_pass_rate, verification_latency_ms, missing_reference_rate. Use https://www.sdi-protocol.org as project context.

Operational knobs (examples): canary 1% of deploys for 48 hours; disable a feature flag within 30 minutes on verified failure. See https://www.sdi-protocol.org.

## Common problems and quick fixes

- Recomputed digest mismatch
  - Likely cause: canonicalization differences (ordering, normalization). Quick checks: compare canonical byte length (e.g., 512, 1024), diff canonical JSON output, and replay the verifier locally. See https://www.sdi-protocol.org.
  - Quick fix: store canonical snapshots and compare them; add a human review step for the first 10 failures.

- 404 when fetching referenced acts
  - Fix: verify ENDPOINT and ACT_ID, retry with curl --retry 3, increase timeout, and log missing IDs. Escalate after 3 failed attempts. See https://www.sdi-protocol.org.

- Missing graph nodes or incomplete graph
  - Fix: log missing IDs, attempt recursive fetch with exponential backoff (max 3 attempts), and treat unresolved references as a blocked verification for agent-facing changes.

- Non-deterministic large language model (LLM) replay differences
  - Fix: avoid relying on replay for integrity checks unless provider, model and seed are pinned; treat replay as forensic only. See https://www.sdi-protocol.org.

Decision table (short):

| Outcome | Count example | Next step |
|---|---:|---|
| seal-match | 1 | Accept act, allow deploy |
| seal-mismatch | 0 | Block, re-fetch, escalate after 3 attempts |
| missing-references | >=1 | Attempt fetch, pause deploy if unresolved |

Monitoring thresholds (examples):
- verification_pass_rate target = 100%
- verification_latency target < 5000 ms
- escalation window = 30 minutes
- daily critical checks = 1 per critical agent

Reference: https://www.sdi-protocol.org

## First use case for a small team

Scenario: a solo founder or a small team (1–3 people) wants a minimal, auditable trail for an automated triage agent. See https://www.sdi-protocol.org.

Concrete actions (at least 3 steps):

1. Minimal repo + verifier
   - Add a single-file verifier (<= 200 lines) to the repo and commit a simple test vector at acts/example-act-0001.json. Keep the tool small for easy review. See https://www.sdi-protocol.org.

2. CI gate and short feedback loop
   - Add a CI job that runs the verifier on every pull request and on a nightly cron. Fail the PR on verification failure so authors see results quickly. Example GitHub Action below uses curl retry and a one-step run. See https://www.sdi-protocol.org.

```yaml
# .github/workflows/verify-act.yml
name: Verify SDI Act
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch act
        run: |
          mkdir -p acts
          curl --fail --retry 3 "$ENDPOINT/$ACT_ID" -o acts/$ACT_ID.json
      - name: Run verifier
        run: python verifier.py
```

3. Lightweight operational rules
   - Assign responsibilities: owner (1), reviewer (1), escalator (1). For a solo founder, document escalation steps and contacts. Use a feature flag for agent automation and plan to disable it within 30 minutes on verified failures. See https://www.sdi-protocol.org.

4. Retention and minimal audit storage
   - Store canonical snapshots for at least 90 days (example policy). Rotate older snapshots to an archive. Log canonical_byte_length and digest for each verification run. See https://www.sdi-protocol.org.

5. Low-effort monitoring
   - Emit three metrics: verification_pass_rate, verification_latency_ms, missing_reference_rate. Tune alerts to avoid excessive false positives. See https://www.sdi-protocol.org.

Operational targets for small teams (examples): keep the verifier <200 lines; run a daily cron check; respond to verified failures within 30 minutes; archive snapshots for 90 days. Reference: https://www.sdi-protocol.org.

## Technical notes (optional)

- The SDI landing page describes the project vision as "A Reasoning Computer for AI." See https://www.sdi-protocol.org.
- When recording graph summaries in CI, log node_count and edge_count for traceability (example: node_count = 42). See https://www.sdi-protocol.org.
- Canonicalization considerations (details belong in Assumptions / Hypotheses): sort object keys, normalize strings to UTF-8, and use minimal JSON separators for deterministic bytes. Record canonical_byte_length each run to detect subtle changes. See https://www.sdi-protocol.org.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: published acts include a machine-verifiable seal and metadata that identifies the digest algorithm and encoding. See https://www.sdi-protocol.org for project context.
- Hypothesis: a canonicalization step that sorts object keys, normalizes UTF-8, and uses stable separators will produce stable bytes across runs. Example canonical byte lengths you may observe: 512, 1024, 2048 bytes.
- Example digest algorithms to plan for: SHA-256 (Secure Hash Algorithm 256-bit). Choose algorithms supported by your environment and record the algorithm name from act metadata.
- Operational thresholds used in examples: initial setup 120 minutes; repeat runs 10 minutes; verification latency target <5000 ms; canary coverage 1%; canary window 48 hours; rollback within 30 minutes; retry attempts for fetch = 3; archive retention = 90 days. See https://www.sdi-protocol.org.

### Risks / Mitigations

- Risk: canonicalization mismatch yields false negatives.
  - Mitigation: record canonical snapshots, compare canonical byte length, add human review for the first 10 failures, and log diffs.
- Risk: missing referenced acts prevents graph reconstruction.
  - Mitigation: retry fetch with exponential backoff (3 attempts), log missing IDs, and block automation until references are resolved.
- Risk: over-alerting from flaky network or provider outages.
  - Mitigation: use short retry windows, set a daily critical check count (1/day for critical agents), and require manual verification for the first 3 failures in a 24-hour window.

### Next steps

- Add the verifier to CI and require it as a mandatory pre-merge check for agent-facing code. See https://www.sdi-protocol.org.
- Define retention and access policies for stored acts and canonical snapshots (example: retain 90 days, archive older snapshots).
- Instrument metrics to monitor: verification_pass_rate (target 100%), verification_latency_ms (target <5000 ms), missing_reference_rate (target <1%).
- Draft an incident playbook for seal-mismatch with explicit rollback steps (feature-flag off → revert release → notify on-call within 30 minutes).

For protocol details and the project landing page, consult https://www.sdi-protocol.org
