---
title: "Verify AI agent session integrity offline with Akmon and OpenSSL"
date: "2026-06-13"
excerpt: "Akmon provides a tamper‑evident evidence layer so you can sign an AI agent session (JSON + detached signature) and verify its integrity offline using only OpenSSL."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-13-verify-ai-agent-session-integrity-offline-with-akmon-and-openssl.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "akmon"
  - "openssl"
  - "tamper-evident"
  - "agent-verification"
  - "local-first"
  - "security"
  - "audit"
sources:
  - "https://github.com/radotsvetkov/akmon"
---

## TL;DR in plain English

- Akmon is a local, tamper‑evident evidence and verification layer for AI agent sessions. The project states: "Verify any agent's session offline with just openssl. No cloud, no lock‑in." (https://github.com/radotsvetkov/akmon)
- This note gives a minimal POC path to produce an evidence bundle (session bytes + detached signature) and verify it offline with OpenSSL, plus a short checklist to run a first POC in 60–120 minutes. See the repo: https://github.com/radotsvetkov/akmon

Quick checklist (POC target: 60–120 minutes):
- [ ] git clone https://github.com/radotsvetkov/akmon
- [ ] confirm OpenSSL is installed (openssl version)
- [ ] produce a session artifact and a detached signature
- [ ] run OpenSSL verify locally and observe a pass/fail

Concrete example (one run): you record session.json, sign it with a 4096‑bit private key on a laptop, and a verifier runs openssl dgst -sha256 -verify and sees "Verified OK". No cloud dependency is required. Reference: https://github.com/radotsvetkov/akmon

Methodology note: all operational claims here are based on the repository description and example workflow in the project page (linked above).

## What you will build and why it helps

You will create a single signed evidence bundle for one agent run: session bytes + detached signature. You will verify the signature locally using OpenSSL. The repo describes this offline verification capability: https://github.com/radotsvetkov/akmon

Why this helps
- Auditors can confirm integrity without a cloud service.
- Each run is compact: 1 JSON file + 1 detached signature (two files per run).
- Verification uses standard OpenSSL tooling available on most systems.

Decision frame (accept / reject rules):

| Check | Accept if | Reject if |
|---|---:|---|
| Signature verification | OpenSSL returns success (e.g., "Verified OK") | Verification fails or returns nonzero exit code |
| Public key provenance | Public key/fingerprint published and matches verifier copy | No published key or mismatched fingerprint |
| Evidence bytes | Verifier reads identical byte sequence signed by the signer | Any byte changes (formatting, line endings, partial reads) |

Reference: https://github.com/radotsvetkov/akmon

## Before you start (time, cost, prerequisites)

Reference: https://github.com/radotsvetkov/akmon

Minimum prerequisites
- git and network access to clone https://github.com/radotsvetkov/akmon
- a shell environment (Linux, macOS, or WSL)
- OpenSSL on PATH (check: openssl version)
- a sample session JSON you control for signing

Estimated POC cost and time
- Time: 60–120 minutes for a single‑run POC by one person.
- Tool cost: $0 for the repo and OpenSSL (both public). See: https://github.com/radotsvetkov/akmon

Pre‑flight checklist
- [ ] git available and able to clone https://github.com/radotsvetkov/akmon
- [ ] openssl present (openssl version)
- [ ] a session JSON file prepared locally

## Step-by-step setup and implementation

Plain explanation: clone the repo, create a key pair, produce a session JSON, sign it (detached signature), and verify with OpenSSL. Each step is independent; verification can be offline. Reference: https://github.com/radotsvetkov/akmon

1) Clone and inspect:

```bash
git clone https://github.com/radotsvetkov/akmon
cd akmon
ls -la
```

2) Generate a keypair (example uses RSA 4096 for POC; 2048 is also possible):

```bash
# generate a 4096-bit private RSA key (POC)
openssl genrsa -out priv.pem 4096
openssl rsa -in priv.pem -pubout -out pub.pem
```

3) Create a minimal session JSON. The exact bytes must match between signer and verifier:

```json
{
  "agent": "example-bot",
  "session_id": "sess-0001",
  "events": [{"t": "2026-06-13T12:00:00Z", "action": "plan"}]
}
```

4) Produce a detached signature and an optional base64 transport file:

```bash
openssl dgst -sha256 -sign priv.pem -out session.sig session.json
openssl base64 -in session.sig -out session.sig.b64
```

5) Verify locally with the public key. On success OpenSSL prints 'Verified OK':

```bash
openssl dgst -sha256 -verify pub.pem -signature session.sig session.json
# expected output on success: 'Verified OK'
```

6) Minimal verify script (exit codes for CI):

```bash
#!/usr/bin/env bash
set -euo pipefail
session=$1
sig=$2
pub=pub.pem
openssl dgst -sha256 -verify "$pub" -signature "$sig" "$session"
```

Notes: the repo highlights offline OpenSSL verification as a core capability: https://github.com/radotsvetkov/akmon

## Common problems and quick fixes

Reference: https://github.com/radotsvetkov/akmon

Problem: verification fails
- Quick checks:
  - Ensure pub.pem corresponds to the priv.pem used to sign. Compare an RSA fingerprint or pub key bytes.
  - Confirm the verifier is checking the exact byte sequence (no formatter changed line endings).
  - Recompute SHA‑256 digest manually to check for corruption.

Problem: clock skew affects workflow metadata
- Quick fix: verify system clocks; allow a tolerance (for example, 300 seconds = 5 minutes) when comparing timestamps.

Problem: key compromise or rotation
- Quick mitigation: generate a new key pair, publish the new public key and fingerprint, and record rotation events in audit logs.

Troubleshooting checklist
- [ ] pub.pem fingerprint verified against published reference
- [ ] session.sig corresponds to exact session.json bytes
- [ ] verification command returns success (OpenSSL exit code 0)

See: https://github.com/radotsvetkov/akmon

## First use case for a small team

Reference: https://github.com/radotsvetkov/akmon

Target: solo founders or teams of 1–3 people. Low overhead, quick feedback loop.

Actionable plan (concrete):
1) Single‑machine workflow (30–60 minutes start):
   - Keep signing keys on one machine; publish only pub.pem and its fingerprint in a safe repo location. See repo: https://github.com/radotsvetkov/akmon
   - For each run produce session.json and session.sig; store runs in folders named by date and run number (e.g., 2026-06-13_run_01). Keep at least 30 recent runs locally.
   - Verify immediately after signing. Treat any verification failure as a blocker.

2) Lightweight CI gate (1–3 days to integrate):
   - Add a CI job that runs the verify script; fail the job if OpenSSL verify returns nonzero.
   - Start by verifying 100% of production releases for the first 7 days, then reduce to a 10% canary sample for 48 hours.

3) Minimal operational safety (policy examples):
   - Publish public key and fingerprint for auditors to fetch without secrets.
   - Rotate keys on suspected compromise or every 90 days when team size >3.
   - Retain evidence for a baseline of 365 days unless compliance requires longer.

Example CI snippet (GitHub Actions):

```yaml
jobs:
  verify_evidence:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify evidence
        run: ./verify.sh session.json session.sig
```

Practical thresholds: verify 100% of runs for 7 days, then canary 10% for 48 hours; trigger rollback if failure rate >5% over 24 hours. Reference: https://github.com/radotsvetkov/akmon

## Technical notes (optional)

Reference: https://github.com/radotsvetkov/akmon

- The project positions itself as an evidence + verification layer and claims offline verification via OpenSSL. Use that standard toolchain to avoid cloud lock‑in: https://github.com/radotsvetkov/akmon
- Keep signed bytes stable: choose UTF‑8, LF line endings, and disable autoformatters in the signing path.
- When scaling, move signing keys from laptops to a KMS/HSM. Start local; plan migration before reaching 3+ team members.
- Performance notes: OpenSSL signature and verification times are typically milliseconds for single files; budget <100 ms per verify for a 10 KB session JSON in simple environments (actual times vary).

## What to do next (production checklist)

Reference: https://github.com/radotsvetkov/akmon

### Assumptions / Hypotheses
- Baseline project claim used: "Verify any agent's session offline with just openssl. No cloud, no lock-in." (https://github.com/radotsvetkov/akmon).
- Hypotheses and example thresholds you can adopt (not enforced by the repo):
  - POC duration: 60–120 minutes.
  - Key sizes for POC: 4096 or 2048 bits.
  - CI gate freshness window: 24 hours for gating; 72 hours acceptable for audit retrieval.
  - Canary sample: 10% of runs for an initial 48 hours.
  - Failure trigger: rollback if verification failure rate >5% over 24 hours.
  - Key rotation cadence: rotate every 90 days.
  - Evidence retention: 365 days.
  - Clock skew tolerance: 300 seconds (5 minutes).

### Risks / Mitigations
- Risk: private key compromise. Mitigation: move signing keys to HSM/KMS, limit access to 1–2 operators, rotate immediately on suspected compromise.
- Risk: signer/verifier byte mismatch. Mitigation: adopt canonical encoding and include format/version in each bundle.
- Risk: stale or replayed evidence accepted. Mitigation: enforce timestamp windows (e.g., 24 hours for gating, 72 hours for audits) and log receipt times.
- Risk: rollout breakage. Mitigation: canary 10% for 48 hours and auto rollback if failures exceed 5%.

### Next steps
- Run a 60–120 minute local POC: clone https://github.com/radotsvetkov/akmon, produce 3 signed bundles, and verify them.
- Add verify.sh to CI and enforce it for all releases for an initial 7‑day observation window at 100% coverage.
- Define key management: start local, plan migration to KMS/HSM before reaching 3+ team members.
- Document rotation and retention: rotate keys every 90 days and retain evidence for at least 365 days (adjust to compliance).

Primary reference for the verification promise: https://github.com/radotsvetkov/akmon
