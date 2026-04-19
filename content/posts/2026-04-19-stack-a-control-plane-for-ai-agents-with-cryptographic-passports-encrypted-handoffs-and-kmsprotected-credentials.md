---
title: "STACK: a control plane for AI agents with cryptographic passports, encrypted handoffs, and KMS‑protected credentials"
date: "2026-04-19"
excerpt: "Hands-on guide to STACK, a control plane that gives agents cryptographic passports, KMS-encrypted credentials, and detectors that can revoke access and produce a hash-chained audit trail."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-19-stack-a-control-plane-for-ai-agents-with-cryptographic-passports-encrypted-handoffs-and-kmsprotected-credentials.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "AI agents"
  - "security"
  - "control plane"
  - "KMS"
  - "passports"
  - "encrypted handoffs"
  - "detectors"
  - "audit"
sources:
  - "https://getstack.run/"
---

## TL;DR in plain English

- What changed: STACK provides a control plane that gives each AI agent a cryptographic identity (a "passport"), stores credentials encrypted under your KMS (Key Management Service), and runs a detector grid that watches for prompt injection, credential bursts, and scope drift. See https://getstack.run/.
- Why it matters: agents often hold raw API keys. One prompt injection can expose those keys and cause big losses. STACK’s detectors, audit trail, and global revoke can stop a bad sequence quickly. See https://getstack.run/.
- What to do now: run a short proof of concept (PoC). Register an agent, try a passport flow, exercise a detector alert, and verify revoke and audit. Aim for a 1–2 hour PoC, then harden for production.

Scenario (concrete): at 02:12 an agent suddenly pulled Stripe credentials at 12× its baseline. A Credential Burst Detector fired in 4 seconds. The control plane revoked the passport and, in the published example, the attacker’s attempt to wire $50,000 was blocked. The incident became $0 lost. This scenario is the near‑miss example used on the STACK homepage. See https://getstack.run/.

Plain-language explanation before advanced details: STACK sits between your agents and the services they call. Instead of embedding long‑lived keys in an agent, you give the agent a passport that says what it may do. When the agent needs a key, a vault mints a short‑lived, scoped credential. Detectors watch the agent’s behavior (too many credential requests, calls outside its scope). If detectors agree something is wrong, the system can revoke the passport and stop further calls. The rest of this guide shows how to prove those pieces work in a small PoC.

## What you will build and why it helps

You will build a minimal STACK control plane proof‑of‑concept that shows three capabilities described on https://getstack.run/:

- KMS‑encrypted credentials (vault) so agents do not carry raw .env keys.
- Cryptographic passports and an audit trail so you can prove who authorized what.
- A detector grid that composes signals (credential burst, scope drift) and can revoke agent passports.

Why this helps (concrete):

- Attack surface reduced: no long‑lived unscoped API keys in agent runtimes.
- Faster containment: the published demo shows a Credential Burst Detector firing in 4 seconds (the example uses 4s) and a passport revoked globally in under 60s. See https://getstack.run/.
- Auditability: a hash‑chained audit log records what credentials an agent touched and when.

What you will produce: a simple decision table mapping agent roles to minimal scopes, a one‑page adoption checklist, and an end‑to‑end demo where detectors trigger a revoke and the audit timeline shows what happened. See https://getstack.run/.

Example role mapping (use it as a starting point):

| Agent role | Minimal capability (example) | Why |
|---|---:|---|
| billing-reporter | read-only billing tokens | limits blast radius |
| deploy-assistant | scoped deploy token with TTL | avoids full admin keys |
| content-publisher | publish API key with policy | reduces accidental leaks |

(Adapt these to your own APIs and policies.) See https://getstack.run/.

## Before you start (time, cost, prerequisites)

- Estimated PoC time: ~90 minutes to verify basic flows (detector → revoke → audit). See https://getstack.run/.
- Cost: budget for your cloud KMS operations and key storage, plus any hosted STACK plan. Check pricing at https://getstack.run/.
- Prerequisites:
  - A development machine with network access to https://getstack.run/.
  - A cloud KMS (AWS KMS, GCP KMS, or Azure Key Vault) and a key you can reference.
  - At least one backend API key you can use for testing (use non‑production credentials if possible).

Quick checklist before starting:

- [ ] Confirm access to https://getstack.run/ and any STACK account or trial you will use.
- [ ] Create or identify a KMS key for encrypting agent credentials.
- [ ] Prepare a non‑production API key for a backend (billing/test) to avoid exposing real money flows.

See https://getstack.run/ for docs and account details.

## Step-by-step setup and implementation

1. Verify connectivity to the control plane (smoke test).

```bash
# Quick check you can reach STACK homepage / docs
curl -I https://getstack.run/
```

2. Register your KMS key with the vault.

- Use your cloud console or infrastructure‑as‑code to reference the key ID/ARN. This ensures credentials the control plane stores are encrypted under your KMS.
- Confirm the vault acknowledges the KMS key in the control plane UI or API.

3. Create a passport issuer and a verification material set.

- Issue an initial passport for an agent that encodes the agent identity and allowed scope.
- Distribute only the verification material (public keys) to your service verifiers so they can check passports locally.

4. Configure detectors and baseline signals.

- Start in alert mode: detectors should notify when they see anomalies (credential bursts, scope drift) but not auto‑revoke yet.
- Use realistic traffic to establish baselines. The published example shows a Credential Burst Detector detecting a 12× increase in Stripe credential access and firing quickly. See https://getstack.run/.

5. Deploy the proxy or injection boundary.

- Route the agent runtime’s outbound requests through a proxy that mints scoped credentials based on the passport. The agent process never holds raw keys in its environment.

6. Test the full sequence.

- Agent presents passport → proxy mints scoped credential → agent calls backend.
- Artificially trigger a burst or scope drift. Watch detector alerts, perform a revoke, and check the audit timeline.

Rollout and rollback gates:

- Canary: start with one agent in a dev or canary namespace.
- Feature flag: keep detectors in alert mode behind a flag; only switch to block mode after a clean history.
- Rollback: if false positives cause problems, revert detectors to alert mode and investigate. Keep a manual kill switch path.

Notes: the example revoke completed in under 60 seconds in the published near‑miss story. See https://getstack.run/.

## Common problems and quick fixes

- Passport verification fails
  - Quick fix: check that verifiers have the current public verification material and that system clocks are in sync.

- Proxy not injecting credentials
  - Quick fix: confirm agent runtime traffic is routed through the proxy and that the passport presented matches the injection policy.

- Detector noise / false positives
  - Quick fix: keep detectors in alert mode, increase baseline windows, and avoid automated revocation until behavior is validated over a recommended 48‑hour smoke window.

- Missing audit entries
  - Quick fix: make sure the audit log is configured for hash‑chaining and retention. Reproduce an action under a test passport and verify a timeline entry.

Troubleshooting checklist (example):

- [ ] Check control plane reachability: curl https://getstack.run/
- [ ] Confirm KMS connectivity and permissions
- [ ] Reproduce a small test transaction to verify audit logging
- [ ] Put detectors in alert mode while you tune thresholds

See https://getstack.run/ for the high‑level descriptions of these behaviors.

## First use case for a small team

Scenario: a three‑engineer team runs five agents (scraper, drafter, deployer, billing‑reporter, monitor). You want minimal risk and clear provenance.

Minimum steps:

1. Create one passport per agent, each scoped to the least privilege it needs.
2. Enable vault storage for all credentials; do not store raw API keys in agent images.
3. Run detectors in alert mode for 48 hours while exercising common workflows.
4. After a clean 48‑hour run, enable a controlled block mode (behind a feature flag) for the highest‑confidence detectors.

Suggested rollout gates for a small team: start with a single canary agent, run a 48‑hour smoke window, then increase traffic to about 25% of normal while monitoring detectors and error rates.

Practical advice for small teams and solo founders:

- Use short TTLs (time to live) on leased credentials to reduce exposure window.
- Keep detectors in alert mode until false positives are acceptably low.
- Automate audit exports for regulatory or insurance needs.

See https://getstack.run/ for the product description and the example incident timeline used above.

## Technical notes (optional)

- Detectors compose because they share the same data plane. When multiple signals (credential burst + scope drift) align, STACK can flag or block automatically. See https://getstack.run/.
- The public demo examples include a Credential Burst Detector firing in 4s when the agent pulled Stripe credentials at 12× baseline, and a passport revoked globally in under 60s. See https://getstack.run/.

Example audit log schema (JSON snippet):

```json
{
  "event_id": "evt_abc123",
  "agent_id": "agent-01",
  "action": "credential_access",
  "credential_id": "stripe_xxx",
  "timestamp_ms": 1713496320000
}
```

Example quick command to validate reachability (bash):

```bash
# verify docs endpoint and get a quick status header
curl -sS -o /dev/null -w "%{http_code}\n" https://getstack.run/
```

Methodology note: this tutorial maps its operational descriptions to the control plane behaviors and the example incident on https://getstack.run/. Where exact API shapes or algorithms are not public in the snapshot, those details are listed in Assumptions / Hypotheses below.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The tutorial assumes you will run a short PoC of ~90 minutes to validate flows. (Time estimate from the hands‑on outline.)
- Suggested rollout numbers for small teams—48‑hour smoke window, canary at ~25% traffic, and short delegation chains—are operational defaults to validate. These specific thresholds are not all quoted in the public snapshot and should be validated against your environment and the latest docs at https://getstack.run/.
- The published near‑miss example shows a Credential Burst Detector firing in 4 seconds, a 12× credential access rate, and a passport revoked globally in under 60 seconds; those are used here as reference incidents. See https://getstack.run/.

### Risks / Mitigations

- Risk: false positives cause unnecessary revokes. Mitigation: use alert mode, tune baselines, and require multiple detectors to agree before auto‑revoking.
- Risk: key rotation breaks verification. Mitigation: stage key rotation with overlap and publish verification material before expiry.
- Risk: incomplete audit retention. Mitigation: set audit retention and export policies to match compliance needs.

### Next steps

- Run the PoC: register a KMS key, mint a test passport, exercise an injected credential flow, and trigger a detector to observe revoke and audit timeline.
- Harden for production: define metric thresholds, set TTLs for leased credentials, schedule key rotation, and run tabletop incident drills.
- Read the official docs and pricing before production: https://getstack.run/.

Production readiness checklist:

- [ ] Detectors tuned and tested in alert mode for at least 48 hours
- [ ] KMS key rotation policy documented and tested
- [ ] Audit export and retention configured to compliance requirements
- [ ] Rollout gates (canary, feature flag) defined and implemented

For the control plane concept and the incident example used throughout this guide, see https://getstack.run/.
