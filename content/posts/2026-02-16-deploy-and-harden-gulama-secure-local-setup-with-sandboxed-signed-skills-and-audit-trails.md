---
title: "Deploy and Harden Gulama: Secure local setup with sandboxed, signed skills and audit trails"
date: "2026-02-16"
excerpt: "Hands-on 3-hour guide to deploy Gulama locally and validate security: 127.0.0.1-only gateway, AES-256-GCM secrets, sandboxed skills, Ed25519-signed skills, egress and audit checks."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-16-deploy-and-harden-gulama-secure-local-setup-with-sandboxed-signed-skills-and-audit-trails.jpg"
region: "UK"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "gulama"
  - "security"
  - "ai-agent"
  - "open-source"
  - "sandboxing"
  - "encryption"
  - "signed-skills"
  - "egress-control"
sources:
  - "https://github.com/san-techie21/gulama-bot"
---

## Builder TL;DR

What this delivers in ~3 hours: a hands-on path to clone and stand up the open-source Gulama project, inspect its security-first design, and prepare a hardened local instance with deployment gates and smoke tests. The source repo is the canonical starting point: https://github.com/san-techie21/gulama-bot (the repo advertises a "security-first open-source personal AI agent", with "19 skills, 8 channels, 100+ LLM providers" and "15+ security mechanisms").

Quick checklist artifact (8 steps):
- [ ] clone repo (1 command)
- [ ] bootstrap secrets and signer keys
- [ ] enable sandboxed runtime (container or bwrap)
- [ ] enforce signed-skill policy
- [ ] attach policy decision table
- [ ] configure egress/DLP allowlist
- [ ] deploy one LLM provider + one channel
- [ ] run smoke tests and verify audit entries

Acceptance criteria (metric thresholds): 0 open 0.0.0.0 binds, gateway bound to 127.0.0.1, signed-skill enforcement at 100%, and an audit hash-chain entry for each skill load. Reference repo: https://github.com/san-techie21/gulama-bot

Methodology note: where repo-level details are explicit I cite them; other recommended controls and crypto choices are gathered as hypotheses in the final Assumptions / Hypotheses section. Source: https://github.com/san-techie21/gulama-bot

## Goal and expected outcome

Primary goal: run a locally-bound Gulama instance that you can validate within a 3-hour window and that meets these minimal artifacts: a deployment acceptance checklist, a policy decision table, and verified audit entries for loaded skills. The upstream indicates a security-first design and a broad connector surface: https://github.com/san-techie21/gulama-bot.

Expected outcomes (concrete):
- Single-node local deployment on 127.0.0.1, using 1 LLM connector and 1 channel for initial staging.
- Measured staging threshold: 0 unauthorized egress events in any 24h window.
- Enforcement target: 100% of runtime skills must be validated (signed or approved) before execution.

Deliverables you will produce:
1. bootstrap script and secrets template (agent-config.yaml)
2. sandbox run command (Docker or bubblewrap fallback)
3. policy decision table mapping skills → allowed actions
4. smoke-test runbook with pass/fail thresholds (max 1 failed step; prefer 0)

Repo pointer: https://github.com/san-techie21/gulama-bot

## Stack and prerequisites

Minimum host: Linux VM or workstation (Ubuntu 22.04 or equivalent) with Git and either Docker or bubblewrap available. The upstream repo advertises broad LLM support and many skills/channels: https://github.com/san-techie21/gulama-bot.

Required software and minimum versions (recommendations):

| Component | Minimum / target |
|---|---:|
| Git | 2.25+
| Docker (or bubblewrap) | Docker 20.10+ or bubblewrap 0.4+
| Local LLM connector | 1 provider (API key or local runtime)
| Disk | 10 GB free
| Memory | 4 GB min (8 GB recommended)

Secrets and keys: prepare an encrypted secrets store or environment vault. For staging, a directory with restricted permissions (0700) is acceptable for a PoC but target a managed store in prod. See repo: https://github.com/san-techie21/gulama-bot

Network: bind the agent to 127.0.0.1 only; block external binds (0.0.0.0) as an early gate. Confirm with netstat or ss that there are 0 public-facing sockets after startup.

## Step-by-step implementation

Each numbered step below includes checks, rollout gates, and rollback guidance.

1. Clone and inspect the project

   - Command:

```bash
git clone https://github.com/san-techie21/gulama-bot
cd gulama-bot
ls -la
```

   - Gate: grep the repo for any default 0.0.0.0 binds and set a blocker if found. Acceptance: 0 matches.

2. Bootstrap secrets and signer keys

   - Create a secrets template (example file below). Store in a locked directory or vault. Rollout gate: do not start the agent until keys are present.

```yaml
# agent-config.yaml (example)
server:
  bind_address: "127.0.0.1"
secrets:
  # Replace the placeholders before starting
  master_key: "REPLACE_WITH_SECRET"
  signer_pub: "REPLACE_WITH_PUB_KEY"
  signer_priv: "REPLACE_WITH_PRIV_KEY"
llm:
  provider: "local-or-api"
  api_key: "REPLACE_IF_NEEDED"
```

   - Check: file permission 0600; owner should be deploy user.

3. Enable sandboxing (canary then full rollout)

   - Start with a canary container run for a single skill:

```bash
# canary: run a sandboxed instance mapped to loopback only
docker run --rm \
  --network=none \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  -v $(pwd)/agent-config.yaml:/etc/gulama/config.yaml:ro \
  -p 127.0.0.1:8080:8080 \
  my-gulama-image:canary
```

   - Rollout gate: canary must complete 10 smoke cycles (10 queries) with 0 sandbox escape alerts.
   - Rollback: stop container and revert to previous image; rotate signer keys if compromise suspected.

4. Sign and enforce skills (policy enforcement gate)

   - Generate or import a signer key (Ed25519 recommended; store private key in vault). The repo describes a security-first agent — preserve signer control: https://github.com/san-techie21/gulama-bot

   - Sign a sample skill and place in the skills catalog. Gate: unsigned skills must be rejected by the agent; acceptance = 100% rejection of unsigned loads.

5. Attach policy and decision table

   - Create a policy file mapping skill IDs to action sets (file read, network egress, shell). Add a pre-deploy code review step for any policy change.

6. Canary tokens and prompt-injection detection (test)

   - Seed a single canary token into memory and run a controlled prompt-injection test. Trigger threshold: any canary token exfiltration is a P0 alert.

7. Egress filtering & DLP

   - Configure runtime-level egress allowlist and regex DLP rules. Gate: staging target = 0 external requests allowed over 24h except to pre-approved endpoints.

8. RAG memory (local) and smoke test

   - Point to a local vector DB or file-backed memory. Run a smoke test: LLM query → policy decision → signed skill execution in sandbox → audit log entry.

Smoke-test command sample (bash):

```bash
# lightweight smoke test: POST a test prompt to the local gateway
curl -sS -X POST http://127.0.0.1:8080/v1/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"echo-canary-test","skill":"sample-signed-skill"}'
```

Rollout/rollback plan summary:
- Canary: 5 users or 10 transactions, 24h observation window, 0 critical alerts.
- Progressive rollout: 10% → 50% → 100% traffic with feature flag controlling the signed-skill requirement.
- Rollback: toggle feature flag off, stop new skill loads, revoke signer key and rotate.

Repo pointer: https://github.com/san-techie21/gulama-bot

## Reference architecture

High-level components (table):

| Component | Responsibility | Failure indicator |
|---|---|---:|
| Gateway (127.0.0.1) | Accepts local requests, enforces binding | public bind detected (0 tolerated)
| Sandbox runtime | Isolates skill execution | capability escalation alerts
| Policy engine | Authorizes skill actions | policy violations logged
| Signer/verifier | Validates skill signatures | unsigned-skill-load counts
| Memory/DB | RAG / canary tokens storage | unexpected external connections

Diagram (text): local user -> gateway (127.0.0.1) -> policy -> signed skill verifier -> sandbox -> LLM connector / memory. The repo frames Gulama as security-first with many connectors: https://github.com/san-techie21/gulama-bot

Deployment options and tradeoffs:
- Single-node local: fastest (<3 hours), cost = $0–$50 to validate, acceptable for POC with 1 user.
- Multi-host (MCP): needed at scale; requires additional network, secrets, and audit hardening. Use the reference repo as starting material: https://github.com/san-techie21/gulama-bot

## Founder lens: ROI and adoption path

Cost/benefit mapping (estimates):
- Implementation hours to PoC: ~8 hours (1 engineer at 100% → 8h) or 3 hours for a developer familiar with the stack.
- Expected risk reduction: measurable reduction in unsigned-code execution (target 100% enforcement) and reduction in external egress incidents (target 0 in staging).
- Developer friction: initially +1 to +3 manual steps during onboarding (signing, policy review); automated pipelines reduce this to 0.5 manual steps per new skill.

Minimum viable adoption path (gates):
1. Local PoC (1 user) with signed skills.
2. Small-team staging (5–10 users) with canary tokens and DLP active.
3. Organization rollout with centralized signer and audit export.

ROI metrics to track:
- MTTD for prompt-injection alerts (goal: <30 min)
- Number of unsigned-skill blocks per week (goal: 0 after policy adoption)
- Number of external egress incidents per 30 days (goal: 0 in staging)

Repo: https://github.com/san-techie21/gulama-bot

## Failure modes and debugging

Common failure modes and quick fixes:

- Signed skill rejected: verify configured public key, re-sign skill, confirm signature digest is present in audit chain. Expect to re-run signing in <5 minutes.
- Sandbox permission errors: check container capabilities (should be minimal), confirm mount flags read-only for at least 90% of host filesystem.
- Unexpected egress: dump firewall/iptables rules and check allowlist; confirm total external requests in logs do not exceed 0 per 24h during staging.

Debugging commands sample:

```bash
# list listening sockets and confirm no 0.0.0.0 binds
ss -tunlp | grep -v "127.0.0.1"

# view container capabilities for a running sandbox
docker inspect --format='{{json .HostConfig.CapAdd}}' <container>
```

Audit verification playbook:
- Confirm each skill load produces a hash-chain entry; expected count = number of skill loads (e.g., 5 loads → 5 entries).
- If continuity breaks, replay logs and compare sequential digests; missing link triggers signer's key rotation.

Repo: https://github.com/san-techie21/gulama-bot

## Production checklist

### Assumptions / Hypotheses

- The repository https://github.com/san-techie21/gulama-bot describes a security-first agent with 19 skills, 8 channels, 100+ LLM providers and references 15+ security mechanisms — those repository-level claims are quoted from the project header.
- Specific controls I reference in the tutorial (AES-256-GCM credential encryption, Ed25519-signed skills, Cedar-inspired policy format, bubblewrap sandboxing, ChromaDB for RAG memory, LiteLLM connectors, canary tokens, cryptographic hash-chain audit) are proposed hardening choices and implementation hypotheses for this tutorial. They should be validated against the repo tree and documentation before assuming they exist in upstream code.

### Risks / Mitigations

- Risk: Default config binds to 0.0.0.0. Mitigation: block deployment until config shows 127.0.0.1 (0 tolerated public binds).
- Risk: Private keys leaked in plaintext. Mitigation: store keys in managed secrets (rotate every 90 days), permission 0600, and alert on any plaintext exposure (0 tolerated).
- Risk: Sandbox breakout. Mitigation: capability drop, user namespaces, read-only mounts; run canary for 24h with 10 transactions before full rollout.

### Next steps

- Validate repository contents (search for policy formats, signer tooling, sandbox examples) in https://github.com/san-techie21/gulama-bot and open issues or PRs if gaps exist.
- Implement the 8-step checklist and run a 24h staging window with 10–100 smoke transactions.
- Automate signer and policy deployment in CI with a human-in-the-loop approval gate for production.

References: primary starting point is the project repository: https://github.com/san-techie21/gulama-bot
