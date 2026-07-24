---
title: "Deploy OneCLI — an open-source credential gateway that injects scoped secrets for AI agents"
date: "2026-07-24"
excerpt: "60–90 minute guide to deploy OneCLI, an open-source gateway that proxies agent requests, enforces host/path policies, and injects scoped credentials so agents never see raw keys."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-24-deploy-onecli-an-open-source-credential-gateway-that-injects-scoped-secrets-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "onecli"
  - "ai-agents"
  - "credential-gateway"
  - "credentials"
  - "vault"
  - "security"
  - "open-source"
  - "tutorial"
sources:
  - "https://onecli.sh"
---

## TL;DR in plain English

- OneCLI is an open‑source credential gateway. It routes agent outbound requests through a network proxy, injects scoped secrets per request, and keeps real keys in a vault so agents never see raw credentials (see https://onecli.sh).
- Policy enforcement happens at the network layer, outside the agent and the large language model (LLM). That means prompts inside an agent can’t make the model leak a secret it never received (see https://onecli.sh).
- Quick test (60–90 seconds): run one gateway instance locally, add one scoped secret and a single allow rule, then route one agent through the gateway and check the audit log.

Concrete example / short scenario:
- A solo founder wants an AI agent to open pull requests on a repo without sharing a GitHub token. The gateway stores a scoped token, injects it only for requests that match the repo path, and the agent never receives the token text. The OneCLI site shows a UI example that says “7 keys exposed to agents” and describes scoped credential injection (https://onecli.sh).

### How it works (plain language)

OneCLI runs a proxy that sits between agents and the outside world. When an agent makes an HTTP call (including CLI tools that use HTTP like curl), the gateway checks a policy: allow or deny. If allowed, the gateway adds only the credential needed for that request. The agent never sees the secret value. The gateway also logs what happened for auditing.

This guide explains a minimal, safe setup for testing and rolling out the gateway.

## What you will build and why it helps

Build: a minimal OneCLI gateway that proxies outbound HTTP/CLI requests, enforces deny‑by‑default network policies, and injects per‑request credentials from a vault (https://onecli.sh).

Why this helps (vendor statements):

- Keys never leave the vault — agents receive no raw secrets (https://onecli.sh).
- Policies are enforced at the network layer and cover CLIs, curl, and code agents write (https://onecli.sh).

Decision table (example policy outcomes):

| Outbound host/path | Policy decision | Secret used |
| --- | ---: | --- |
| api.github.com/repos/acme/* | ALLOW (write) | github_write_token |
| api.github.com/user/repos | DENY | — |
| payments.example.com/* | DENY | — |

Example policy fragment (illustrative YAML — adapt to live schema at https://onecli.sh"):

```yaml
secrets:
  - id: github_write_token
    type: token
    value: "<REDACTED>"
policies:
  - id: gh-write-acme
    match:
      host: api.github.com
      path: "/repos/acme/*"
    secret_id: github_write_token
    actions: ["inject-header:Authorization"]
```

Note: keep this YAML illustrative. Use the official docs at https://onecli.sh for exact fields and schema.

## Before you start (time, cost, prerequisites)

- Time estimate: set aside 60–90 minutes for a focused local test. See https://onecli.sh for faststarts.
- Cost: OneCLI is advertised as open source; a single‑developer local test can cost $0 for infra. Production costs depend on your cloud and high‑availability needs (https://onecli.sh).

Minimum prerequisites:

- A machine that can run a container or a process for the gateway.
- Basic command‑line (CLI), Git, and HTTP knowledge.
- One scoped test secret (for example, a least‑privilege GitHub token).

Pre‑start checklist:

- [ ] Read quickstart and docs at https://onecli.sh
- [ ] Prepare a least‑privilege test secret for injection
- [ ] Ensure you can run Docker or an equivalent runtime on your machine

## Step-by-step setup and implementation

1) Read the official quickstart at https://onecli.sh and choose a deployment pattern: local container, VM, or Kubernetes.

2) Run a local, single‑instance gateway for testing. The commands below are illustrative. Confirm the exact repo and build steps in the vendor docs at https://onecli.sh.

```bash
# illustrative local run (replace with vendor instructions from https://onecli.sh)
git clone https://github.com/onecli/onecli.git  # example repo name — confirm in docs
cd onecli
docker build -t onecli:local .
docker run --name onecli -p 8080:8080 onecli:local
```

3) Add one scoped secret and a minimal allow policy. Use the real CLI or API documented at https://onecli.sh. Example (illustrative):

```bash
# illustrative: apply policy file to gateway
onecli apply -f minimal-policy.yaml
```

4) Route a single agent through the gateway for a canary test. Common options:
- Set HTTP(S)_PROXY in the agent environment.
- Use host egress rules or firewall rules so outbound HTTP(S) must go through the gateway.

5) Test an end‑to‑end request. Example curl using a local proxy:

```bash
curl -x http://localhost:8080 -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/acme/some-repo/pulls
```

6) Verify results:
- The request returns the expected API response.
- The gateway audit log shows an injected credential event.
- The agent process and logs do not contain the raw token.

7) Rollout plan (example): start with one agent, observe behavior for the chosen window, then increase traffic.

## Common problems and quick fixes

Symptom: Gateway unreachable
- Quick check: Is the gateway container/process running?
- Fix: Restart container or pod; check config and mounts.

Symptom: Agent bypasses gateway
- Quick check: Are proxy env vars set or are egress rules enforced?
- Fix: Set HTTP(S)_PROXY for the agent or enforce network egress rules so the gateway is the only outbound path.

Symptom: 401/403 after injection
- Quick check: Does the policy match the host/path? Is the token scope correct?
- Fix: Adjust the match rules or token scope; confirm secret mapping.

Symptom: Increased latency
- Quick check: How much did P95 latency change?
- Fix: Autoscale gateway instances; reduce canary traffic; tune timeouts.

Quick debug commands (illustrative):

```bash
# follow gateway logs (adjust to your runtime)
docker logs -f onecli
# simple proxy test
curl -x http://localhost:8080 -v https://api.github.com/
```

If audit entries are missing, enable persistent audit logging and export to your monitoring system. See audit and visibility notes at https://onecli.sh.

## First use case for a small team

Use case: let a single agent open pull requests and manage basic repo tasks without exposing a shared GitHub token. OneCLI emphasizes "scoped credentials injected per request" and the claim that "Agents never hold a real secret" (https://onecli.sh).

Concrete steps for a small team (1–3 people):

1) Minimal scoped secret + single policy
- Create a least‑privilege token limited to the specific repo or actions.
- Store it in the gateway under a clear name (example: github_pr_token).
- Add a single allow rule that matches only the repo host and path you need (example: api.github.com/repos/your-org/your-repo/*).
- Use https://onecli.sh to confirm policy syntax.

2) Low‑risk routing and verification
- Route only one agent or a local dev machine through the gateway for the first canary.
- Confirm the injected request via the gateway UI or audit logs at https://onecli.sh.
- Verification checklist:
  - [ ] Request succeeds
  - [ ] Audit shows injected secret event
  - [ ] No token printed in agent logs

3) Lightweight operational hygiene
- Rotate the scoped token regularly (e.g., monthly) and automate rotation if possible.
- Keep token scopes minimal.
- Forward gateway audit entries for failed injections or unexpected host matches to Slack or email for review.

Tips:
- Start with a single rule and one agent before adding more secrets.
- Local tests can be low cost; production will need sizing and HA planning.
- Track audit events and denied requests as primary safety signals.

## Technical notes (optional)

- OneCLI enforces policies at the network layer so policy decisions happen outside the agent/LLM runtime. Align your threat model and test cases to that claim (https://onecli.sh).
- Common deployment patterns include proxying with HTTP(S)_PROXY or enforcing host egress rules so the gateway can observe outbound calls. Refer to the official docs at https://onecli.sh for supported options.
- This guide summarizes vendor statements and UI examples from the OneCLI product page at https://onecli.sh.

## What to do next (production checklist)

### Assumptions / Hypotheses
- Planning estimate: 90 minutes total (30m install/config, 30m secrets & rules, 30m test/iterate). These are planning estimates, not product commitments.
- Canary gates suggested: start with 1 agent or 5% traffic → 30% → 100%.
- Observation windows suggested: 24–72 hours for canary monitoring.
- Suggested operational thresholds: error_rate > 1% for 5 minutes or P95 latency increase > 150 ms triggers investigation.
- Recommended initial audit log retention: 30 days.
- Example port used in illustrations: 8080 (illustrative only).
- Contextual UI cues from the public page include text like "7 keys exposed to agents" (see https://onecli.sh).

### Risks / Mitigations
- Risk: Agent bypasses the gateway and exfiltrates secrets.
  - Mitigation: enforce egress routing or firewall rules so the gateway is the only outbound path; use deny‑by‑default policies (https://onecli.sh).

- Risk: Misconfigured policy grants broader access than intended.
  - Mitigation: start with explicit allow rules for a single host/path, use short token lifetimes, and run a small canary before expanding.

- Risk: Latency impacts workflows.
  - Mitigation: measure P95/P99, autoscale gateway instances if needed, and test with a small canary.

- Risk: Missing audit data or retention gaps.
  - Mitigation: enable persistent audit export to a SIEM or object store and set retention per compliance needs (30 days recommended initially).

### Next steps
- Harden connections: add mutual TLS or another strong client auth between agents and the gateway.
- Improve secrets hygiene: reduce token scopes, enable rotation, and integrate the gateway with your secrets manager when supported.
- Monitoring and alerts: add checks for error_rate (>1% for 5m), missing audit entries, and P95 latency regressions; wire alerts into your runbook.
- Run a controlled canary for 24–72 hours, review audit entries and latency (P95), then follow your ramp plan.

For the latest quickstart, deployment patterns, and versioned examples, consult the official docs at https://onecli.sh.
