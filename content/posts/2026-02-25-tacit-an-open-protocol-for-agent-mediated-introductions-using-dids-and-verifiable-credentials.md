---
title: "Tacit — an open protocol for agent-mediated introductions using DIDs and Verifiable Credentials"
date: "2026-02-25"
excerpt: "Build a local POC where agents use W3C DIDs, DIDComm v2 and Verifiable Credentials to compute signed authenticity vectors and produce cryptographically verified, consented introductions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-25-tacit-an-open-protocol-for-agent-mediated-introductions-using-dids-and-verifiable-credentials.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "tacit"
  - "decentralized-identity"
  - "did"
  - "didcomm"
  - "verifiable-credentials"
  - "ai-agents"
  - "protocol"
  - "open-source"
sources:
  - "https://github.com/tacitprotocol/tacit"
---

## TL;DR in plain English

- What it is: Tacit calls itself “the social layer for the agent era — AI agents discover, trust, and introduce people to each other.” See the project repo: https://github.com/tacitprotocol/tacit
- What you will get quickly: a local proof-of-concept (POC) where two agent identities (for example, Alice and Bob) exchange a signed attestation, compute a 0..1 authenticity score, and produce a signed introduction receipt (JSON). Repository source: https://github.com/tacitprotocol/tacit
- Why try it now: it replaces blind cold outreach with auditable, consented introductions you can score and iterate on.
- Time and quick targets: plan ~120 minutes (2 hours) to a runnable local POC. Example starting threshold: 0.7. Canary size: 10 introductions.

Concrete scenario: Alice (an introducer) has a signed attestation that Bob (the candidate) uses. Alice verifies the attestation, the system computes an authenticity score (0.0–1.0), and then Alice and Bob create a signed introduction receipt stored as artifacts/introduction-receipt.json.

This note follows the public repository description and uses conservative examples from https://github.com/tacitprotocol/tacit.

## What you will build and why it helps

Build: a minimal local POC with two identities (Alice, Bob). Each identity holds local keys. One issues a signed attestation. The other verifies it. The system runs a scoring rule that outputs a 0..1 score. Both identities then produce a signed introduction receipt (JSON). The repo is the authoritative source: https://github.com/tacitprotocol/tacit.

Deliverables you will produce locally:
- artifacts/introduction-receipt.json — signed introduction record.
- artifacts/authenticity-vector.json — numeric score on a 0..1 scale.
- config/scoring.yaml — decision table mapping attestation types to weights.

Why this helps for small teams and founders:
- Reduces cold outreach friction by showing a pre-qualification score. Start with 1–2 attestations and tune weights.
- Keys stay local in the POC. There is no central key store for the initial run.
- Fast iteration: change one weight and re-run in minutes. Use a 10-introduction canary to validate changes.

Example decision table (suggested weights; adapt to your context):

| Attestation     | Weight (0..1) | Qualifier example         |
|-----------------|---------------:|--------------------------:|
| company-email   | 0.4            | domain verified (example) |
| org-membership  | 0.3            | active membership check   |
| github-org      | 0.3            | org membership verified   |

Source repo for reference: https://github.com/tacitprotocol/tacit

## Before you start (time, cost, prerequisites)

Time estimate:
- First runnable POC: ~120 minutes (2 hours).
- Small hardening or integrations: add 1–3 days.

Cost estimate:
- Local run: $0 beyond your machine. Use a laptop or VM (virtual machine) with spare resources.
- Light cloud runs: $5–$20/day for a small instance if you test remotely.

Minimum prerequisites:
- Git installed and configured.
- Basic command-line skills (bash or PowerShell).
- Machine with at least 2 GB free RAM; 4 GB recommended.
- Modern browser to inspect artifacts.

Quick checklist

- [ ] Clone the repo and read the top-level README: https://github.com/tacitprotocol/tacit
- [ ] Reserve ~120 minutes for the first run
- [ ] Decide an initial accept threshold (example: 0.7)

Repo: https://github.com/tacitprotocol/tacit

## Step-by-step setup and implementation

Plain-language explanation before advanced details:
This section gives concrete steps to run a local POC. Work on one machine. Create two identities and local keys. Issue one attestation, run a simple scoring rule, and produce a signed introduction receipt. If the repo provides scripts or helpers, prefer them. If not, follow the manual steps below.

These steps point to the repo as the authoritative source: https://github.com/tacitprotocol/tacit. Keep sentences short and actions concrete.

1) Clone the repository and open examples

```bash
git clone https://github.com/tacitprotocol/tacit
cd tacit
ls -la
```

2) Inspect README and examples in the repo root and docs. Look for demo scripts, key helpers, or docker-compose files at the top level.

3) Create two identities and keep keys local. If the repo provides a key helper, use it. If not, generate keys and save them under artifacts/keys.

4) Create one signed attestation (VC-like JSON). Sign it with the issuer key. Save to artifacts/attestation.json.

5) Create a scoring config (0..1). Use the table above or config/scoring.yaml. Run the scoring script to produce artifacts/authenticity-vector.json and check against accept_threshold (example: 0.7).

Example scoring config (adapt to repo tools):

```yaml
# config/scoring.yaml (illustrative)
weights:
  company-email: 0.4
  org-membership: 0.3
  github-org: 0.3
accept_threshold: 0.7
```

6) Exchange consent JSON between identities. Bundle signed attestation + score + consent into artifacts/introduction-receipt.json.

Notes:
- Use the repo as the source of truth for exact CLI names and arguments: https://github.com/tacitprotocol/tacit
- Keep private keys on the device used for the POC.

Code and command examples to help debug (unchanged):

```bash
# show docker-compose logs if applicable
docker-compose logs -f

# pretty-print the introduction receipt
jq . artifacts/introduction-receipt.json
```

## Common problems and quick fixes

Service not responding
- Check the process or container started. If using Docker, run docker-compose ps. Ensure at least 2 GB free RAM.

Key generation or DID errors
- DID means decentralized identifier. Check write permissions on the target directory. Re-run the repo key helper if present. Confirm JSON files are valid.

Attestation verification fails
- Check issuedAt/timestamp values and the issuer key. Match signature format to the repo examples.

Low authenticity score
- Add an independent attestation (increase count by +1). Reweight the decision table. Run 10 test introductions to validate.

Quick commands (adapt to repo tooling):

```bash
# show docker-compose logs if applicable
docker-compose logs -f

# pretty-print the introduction receipt
jq . artifacts/introduction-receipt.json
```

Repo reference: https://github.com/tacitprotocol/tacit

## First use case for a small team

Target audience: solo founders, single-node teams, or teams up to 3 people. Concrete steps you can do today.

1) Single-node POC locally
- Action: clone the repo, run any provided demo script, and create two identities on one machine. This keeps ops work small for the first 2–4 hours.

2) Start with 1–2 attestations and iterate
- Action: pick company-email and org-membership. Use accept_threshold = 0.7 as a starting point. Run 10 introductions and record results.

3) Canary before external outreach
- Action: run 10 manual introductions among test accounts. Target acceptance rate > 50% during the canary.

4) Minimal consent and auditable receipts
- Action: sign a short JSON consent and store it with artifacts/introduction-receipt.json for audit.

Monitoring targets during POC (examples):
- Canary size: 10 introductions
- Initial accept threshold: 0.7
- Target acceptance rate: >50%

Repository: https://github.com/tacitprotocol/tacit

## Technical notes (optional)

- Tacit frames itself as an agent-centric social layer; start at the repo for code and protocol guidance: https://github.com/tacitprotocol/tacit
- Keep cryptographic material local during the POC. Use signed audit logs for each introduction.

Suggested local performance targets (examples):
- Local verification latency: < 200 ms per check
- End-to-end local message flow: < 500 ms

Illustrative scoring JSON you can adapt locally:

```json
{
  "weights": {"company-email": 0.4, "org-membership": 0.3, "github-org": 0.3},
  "accept_threshold": 0.7
}
```

Reference: https://github.com/tacitprotocol/tacit

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository contains demos, examples, or tooling to run a local node and generate keys; the project description emphasizes an agent/social focus: https://github.com/tacitprotocol/tacit.
- Suggested numeric thresholds and operational gates in this document are starting examples: accept_threshold = 0.7, canary size = 10, 10% traffic canary, 7-day observation window, key rotation every 90 days, alert if acceptance rate < 40% or auth score drift > 0.1. Validate these numbers in your environment.

### Risks / Mitigations

- Risk: private keys are exfiltrated or centrally stored. Mitigation: keep keys local for the POC, encrypt at rest, and plan rotation every 90 days.
- Risk: poor acceptance rate after rollout. Mitigation: start conservative (accept_threshold 0.7), run a 10-introduction canary, monitor for 7 days, and require >=2 independent attestations before automatic acceptance.
- Risk: false positives in scoring. Mitigation: raise weights for stronger attestations, require a minimum of 2 attestations, and sample 10% of accepted introductions for manual review.

### Next steps

- Harden: define key rotation, rate limits, signed audit logs, and an incident response playbook.
- Compliance: run a privacy threat model and a retention policy for introduction receipts.
- Metrics & rollout: instrument introduction acceptance rate, score distribution, and false positive rate. Use a phased rollout: internal 10-introduction canary -> 10% traffic canary for 7 days -> full launch.

Start here: https://github.com/tacitprotocol/tacit
