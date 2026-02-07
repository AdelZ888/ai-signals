---
title: "Rules fail at the prompt, succeed at the boundary"
date: "2026-02-06"
excerpt: "Agentic workflows and prompt coercion are the new attack surface. This tutorial shows a concrete, deployable boundary strategy (policy engine + sandbox + attested channels) to reduce agentic compromise risk — with configs, code, metrics and a founder cost/risk frame."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary.jpg"
region: "UK"
category: "Tutorials"
editorialTemplate: "TUTORIAL"
tags:
  - "prompt-security"
  - "agent-safety"
  - "zero-trust"
  - "policy-engine"
  - "Anthropic"
  - "Gemini"
  - "production"
  - "UK"
sources:
  - "https://www.technologyreview.com/2026/01/28/1131003/rules-fail-at-the-prompt-succeed-at-the-boundary/"
  - "https://arxiv.org/abs/2602.04326"
  - "https://arxiv.org/abs/2602.04248"
  - "https://arxiv.org/abs/2602.04284"
---

## Builder TL;DR

The risk: prompt-injection and coercion of agentic workflows (human-in-loop or fully autonomous) are now primary attack vectors. Real-world incidents — from the Gemini Calendar prompt-injection disclosure to the September 2025 state-sponsored use of a Claude-based intrusion engine (affecting roughly 30 organizations) — show that rules inside prompts are fragile; boundaries enforced outside the model are survivable and testable [MIT Technology Review](https://www.technologyreview.com/2026/01/28/1131003/rules-fail-at-the-prompt-succeed-at-the-boundary/) and recent technical analyses (see arXiv collection below) document multiple practical exploits [arXiv:2602.04326](https://arxiv.org/abs/2602.04326), [arXiv:2602.04248](https://arxiv.org/abs/2602.04248), [arXiv:2602.04284](https://arxiv.org/abs/2602.04284).

Concrete artifact (metric): aim for detection latency < 2 minutes for agentic outbound actions, Mean Time To Contain (MTTC) < 15 minutes, and an initial true positive detection rate target of >= 90% for coercive action patterns.

## Goal and expected outcome

Goal: stop coercion of agents by keeping model instructions immutable for sensitive capabilities and ensure any high-risk action is gated by external checks.

Expected outcome (measurable):

- Reduce unauthorized outbound action rate to < 0.5% of agent-initiated actions during rollout.
- Human approvals for high-risk actions (credential use, code execution, network access) enforced with signed attestations and 2FA.
- Audit trail with cryptographically-signed transcripts and action tokens preserved for 1 year (or required retention window).

Concrete rollout decision: enforce boundaries first in monitor-only mode for 2–4 weeks (collect baseline), then move to block mode for top-3 highest-risk actions.

## Stack and prerequisites

Recommended stack choices (concrete architecture choices and configs):

- Model layer: hosted LLM API (e.g., vendor) behind an inference proxy; alternative: self-hosted Llama/Claude in an isolated tenant.
- Policy engine: Open Policy Agent (OPA) as an externalized decision point.
- Sandboxing: Firecracker or gVisor for code execution; no host networking by default.
- Secrets: short-lived credentials from vault (HashiCorp Vault or AWS Secrets Manager) with automated rotation.
- Telemetry: centralized logging (e.g., ELK or Loki) and tracing (OpenTelemetry) with retention and alerting.

Prerequisite configs (examples):

- Network: agent subnet has egress only through an egress-proxy with TLS interception for metadata routing.
- Vault TTL: set secret_ttl = 5m for ephemeral credentials used by agents.
- OPA: enable audit logging and policy versioning. Example constraint: reject any action token that is not signed by the boundary signature service.

Artifact (config): sample OPA constraint: ``allow_action = false if action.capability == "exec_remote" and not action.attestation.present``.

Minimum developer prerequisites:

- Familiarity with policy-as-code (Rego), container sandboxing, and HMAC signing.
- CI/CD to roll policies (git repo + mandatory PR + automated policy tests).

## Step-by-step implementation

1) Inference proxy + immutable system channel

- Build an inference proxy that always injects a sealed SYSTEM channel that the model cannot modify. The proxy signs the system channel with a boundary HMAC and sends signed tokens downstream.

2) External policy check (OPA)

- Intercept proposed agent actions (structured JSON outputs) and pass them to OPA for allow/deny. Keep policy repo in Git and require policy unit tests.

3) Capability gating

- Map model "capabilities" to concrete actions (e.g., send-email, read-db, exec-shell) and only map if external approval is present.

4) Human approval with attestations

- For any capability classified as high-risk (credential use, lateral network access, code execution), require a signed human attestation using 2FA. Store attestation token with TTL in Vault.

5) Sandboxed execution

- Execute actions inside microVMs (Firecracker) with ephemeral credentials and network egress only through a hard-filtering egress proxy.

6) Monitoring and response

- Log model outputs, OPA decisions, attestation tokens, and action results. Alert on policy deny rates or abnormal token creation.

Code artifact: minimal example of middleware that verifies a signed boundary token (Node.js / pseudo):

```javascript
const crypto = require('crypto');
function verifyBoundary(token, secret) {
  const [payloadB64, sigB64] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64');
  return expected === sigB64;
}

// Usage: verify incoming SYSTEM token before honoring any capability
```

Rollout decision artifact: run the proxy in "observe" mode for 14 days, then enforce deny policies for top-3 actions.

## Reference architecture

Concrete architecture choice: three-layer boundary design

- Inference proxy (stateless) — injects SYSTEM channel, signs tokens, rate-limits.
- Policy plane (OPA + policy repo) — deterministic allow/deny, policy testing pipeline.
- Execution plane (sandbox microVMs + Vault + egress proxy) — runs only allowed actions.

Key metrics to instrument:

- Decision latency (proxy -> OPA -> response): target <= 200ms.
- MTTC (Mean Time To Contain): target <= 15 minutes.
- Action authorization rate and denial ratio.

Example network segmentation (artifact): all agent-related compute on VLAN A, egress via egress-proxy with host-based ACLs; management plane on VLAN B with restricted access.

For visualization and running tests, include a minimal compose/deployment that separates these services and enables per-service tracing.

## Founder lens: ROI and adoption path

Compact cost / risk decision frame (one-liner + bullets):

- Quick win: deploy observe-mode proxy + OPA for £10–£30k engineering and infra per quarter; prevents large-scale automated intrusions that, as seen in late-2025, impacted ~30 orgs — potential breach cost >> deployment cost.

Cost / risk bullets (artifact: estimated costs & adoption milestones):

- Initial engineering (4–6 weeks): £25k — build proxy, OPA repo, tests.
- Infra ops: £2–5k/month — microVM capacity, Vault, logging.
- Adoption path: pilot with internal non-sensitive agents (2–4 wks observe), then phasing to sensitive capabilities (4–8 wks), full enforcement at 12 wks.
- Risk reduction metric: expected >90% reduction in successful unauthorized high-risk actions after enforcement.

Trade-offs to communicate to founders (artifact: go/no-go decision points):

- Latency vs. safety: adding policy checks increases request latency (~100–200ms); acceptable for ticket automation, risky for real-time chat.
- UX friction: human attestations slow workflows; choose progressive enforcement (observe -> warn -> block).

## Failure modes and debugging

Common failure modes and concrete debugging artifacts:

- False negatives (coercion slips past rules): metric to monitor — percentage of unvetted outbound actions per day. Investigate by replaying signed transcripts and running anomaly detectors.
- False positives (legitimate actions blocked): track rollback rate and time-to-fix; keep "override" flow logged and auditable.
- Token compromise: detection artifact — sudden spike in attestation token creation; response — revoke all tokens, rotate HMAC key.
- Sandbox breakout: artifact — unauthorized network connections from microVMs; response — isolate host and capture disk snapshot.

Debugging checklist (bulleted):

- Collect: model transcript, signed SYSTEM token, OPA decision, execution logs.
- Reproduce: run model transcript against local policy engine and simulate action path.
- Test: inject adversarial prompt variations from the arXiv exploit corpus and validate deny behavior [see arXiv papers].
- Metrics: alert when unvetted action rate > 0.5% or decision latency > 500ms.

## Production checklist

Deployment and operations checklist (artifact: checklist items — at least 8 bullets):

- [ ] Observe-mode for 14 days; collect baseline metrics (decision latency, deny ratios, false positives).
- [ ] Policy repo with CI: unit tests, policy coverage target >= 80%.
- [ ] Vault integration: secret TTL <= 5 minutes for ephemeral credentials.
- [ ] Signed SYSTEM channel: HMAC key rotation schedule (rotate every 7 days).
- [ ] Sandboxing: run code in microVMs (no host networking) with resource limits.
- [ ] Audit trail: store signed transcripts and action tokens for 1 year (or compliance window).
- [ ] Incident runbook: MTTC target <= 15 minutes and playbooks for token compromise, sandbox breakout.
- [ ] Canary/rollback: blue/green deploy for policy updates; automatic rollback if deny-rate spikes.
- [ ] Telemetry: traces and logs to ELK/OpenTelemetry with SLOs for ingestion latency.
- [ ] Training: red-team prompt injection tests monthly using shared corpus (include arXiv exploit patterns).

Final note: rules embedded in prompts are brittle; enforce immutable boundaries outside the model. Start with observe-mode, run policy-as-code, and gate capabilities with attestations. For technical references and the recent incident analyses, read the MIT Technology Review piece and the arXiv papers linked above: https://www.technologyreview.com/2026/01/28/1131003/rules-fail-at-the-prompt-succeed-at-the-boundary/, https://arxiv.org/abs/2602.04326, https://arxiv.org/abs/2602.04248, https://arxiv.org/abs/2602.04284.
