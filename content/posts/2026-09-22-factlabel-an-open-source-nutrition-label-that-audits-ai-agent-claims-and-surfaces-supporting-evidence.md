---
title: "Factlabel: an open-source nutrition label that audits AI agent claims and surfaces supporting evidence"
date: "2026-09-22"
excerpt: "Guide to Factlabel: an open-source 'nutrition label' that audits AI-generated claims, verifies linked sources, returns human-readable labels, and can block unsupported assertions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-22-factlabel-an-open-source-nutrition-label-that-audits-ai-agent-claims-and-surfaces-supporting-evidence.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "agent"
  - "audit"
  - "fact-checking"
  - "open-source"
  - "Jev"
  - "ops"
  - "safety"
sources:
  - "https://github.com/generallymatthew/factlabel"
---

## TL;DR in plain English

- Factlabel is an open-source "nutrition label" layer for AI-generated content. It "audits what AI agents say about data, blocks what doesn't hold up, and shows readers why." It is described as "Powered by Jev." (https://github.com/generallymatthew/factlabel)
- Quick pilot: clone the repo, run a local instance, start in annotation-only mode for at least 7 days, and review ~100 human-reviewed samples per week before enabling automatic blocking. (See README: https://github.com/generallymatthew/factlabel)
- Rollout guidance: start with a 10% canary of traffic. Aim for a pilot false-block rate ≤2% and production target ≤1%. Watch p95 added latency and roll back if p95 > 500 ms.

Concrete example (short scenario):
- A small newsroom runs an AI drafting agent that produces article text and claims a list of supporting URLs. The pipeline sends the draft plus claimed sources to Factlabel. Factlabel returns an annotation that lists what checks passed, what evidence was used, and a short rationale. Editors review the labels for a week in annotation-only mode and then enable blocking for claims that fail evidence checks.

## What you will build and why it helps

You will deploy Factlabel from the project repository and run it between your AI agent and your publishing system. Factlabel inspects agent outputs, verifies claimed evidence when possible, and returns a human-readable label or a block decision. The repository summarizes the project this way: it "audits what AI agents say about data, blocks what doesn't hold up, and shows readers why" and that it is "Powered by Jev." (https://github.com/generallymatthew/factlabel)

### Plain-language explanation

- "Agent": the program that writes text or claims (for example, an AI model or pipeline). Use that term for any automated writer.
- "Audit" and "label": Factlabel runs checks and produces a short, standard label that explains which checks ran, what evidence was found, and why a claim passed or failed.
- "Blocking": stopping an output from being published automatically. You can start with annotation-only mode so nothing is blocked.

Why this matters:
- Makes assertions auditable for reviewers and readers. (repo: https://github.com/generallymatthew/factlabel)
- Standardizes explanations so non-technical staff can see what checks ran. (repo: https://github.com/generallymatthew/factlabel)
- Centralizes policy settings so product and compliance teams can tune checks and track policy_version.

Decision table (example):

| Check | Evidence required | Example outcome |
|---|---:|---|
| source_present | pointer(s) provided by agent | allow + label shows source |
| evidence_aligns | evidence consistent with claim | annotate with rationale |
| evidence_contradicts | evidence disproves claim | flag or block for review |

Reference: repo description and README (https://github.com/generallymatthew/factlabel).

## Before you start (time, cost, prerequisites)

Read the repository README first. The README in the repo is the authoritative source for exact runtime and dependency commands (https://github.com/generallymatthew/factlabel).

Minimal preparations:

- [ ] clone the repo and read README.md (https://github.com/generallymatthew/factlabel)
- [ ] verify local runtime and dependencies per the README
- [ ] plan how your agent will POST generated outputs and claimed sources to the check service
- [ ] assign 1–3 reviewers for the initial pilot

Conservative estimates (starting guidance):
- Local quickstart: ≈ 60 minutes.
- Local cost: $0 for a developer machine.
- Production cost: depends on hosting and traffic; a small team might expect $5–$200/month. These are starting assumptions to tune later.

## Step-by-step setup and implementation

Follow the repo README for exact commands. The steps below give a clear sequence and keep the repo as the source of truth.

1. Clone the repository and read the top-level README (primary source: https://github.com/generallymatthew/factlabel).

```bash
# example quickstart (adjust per repo README)
git clone https://github.com/generallymatthew/factlabel.git
cd factlabel
less README.md
```

2. Install runtime dependencies and start the development server following the repo's exact commands. Use the README as authoritative (https://github.com/generallymatthew/factlabel).

```bash
# illustrative examples only — use commands from README
npm install
npm run dev
# or, if the project provides a Python example
pip install -r requirements.txt
python app.py
```

Explanation: the README will list which runtime (Node, Python, etc.) and any environment variables or API keys you must set. Use those exact instructions rather than the illustrative examples above.

3. Create and version a minimal policy/config file. The file should include a policy_version field so every audit record can reference which policy produced the decision. Commit this file to a policy repo.

4. Wire your agent to call Factlabel before publishing. Send the generated text and any claimed source pointers. Start in annotation-only mode so the service returns labels without blocking. Review returned labels for at least 7 days and sample ~100 human-reviewed labels per week before enabling block rules.

5. Test with known-good and known-bad samples and log outcomes. At minimum, capture: timestamp, agent_id, policy_version, outcome, and evidence rationale.

6. Instrument metrics and alerts. Recommended conservative rollout: canary 10% traffic, annotation-only for 7 days, then expand as quality metrics meet targets.

## Common problems and quick fixes

Reference the repo's issues and README troubleshooting (https://github.com/generallymatthew/factlabel). Common symptoms and fixes:

Problem: service unreachable
- Check the service process or container. Confirm the configured URL and port. Check firewall rules.
- Confirm logs show successful startup.

Runtime inspection examples (adapt to your environment):

```bash
# systemd example
journalctl -u factlabel -f

# docker-compose example
docker-compose logs -f factlabel
```

Problem: too many legitimate outputs flagged
- Review the policy file. Relax specific checks in a controlled manner.
- Add an allowlist for trusted sources while you iterate.
- Re-run your validation set after changes.

Problem: slow responses
- Add a short cache for evidence lookups (TTL = 60s).
- Move noncritical checks to asynchronous flows.
- Scale instances horizontally if needed.
- Monitor p95 latency and rollback if p95 > 500 ms.

Debugging checklist:
- [ ] service reachable
- [ ] policy file loaded and versioned
- [ ] sample inputs tested
- [ ] review workflow for flagged outputs in place

## First use case for a small team

A minimal adoption plan based on the repository and README (https://github.com/generallymatthew/factlabel):

Trial plan:
1. Local trial (60–120 minutes): run Factlabel locally, connect one development agent, enable annotation-only mode, and collect interactions for 7 days and 500–2,000 interactions.
2. Pilot (2–4 weeks): sample ~100 human-reviewed labels/week. Iterate policy_version and measure metrics (false-block rate, latency, blocked-rate).
3. Rollout: increase traffic in steps: 10% → 20% → 100% as targets are met.

Suggested roles:
- Engineer: deploy and maintain the service and update policy files.
- Product manager: review label quality and prioritize policy changes.
- SME (subject matter expert) / Support lead: sample outputs and flag false positives/negatives.

Solo founder note: keep the pilot narrow (one agent, one review channel) and follow the repo README for integration examples (https://github.com/generallymatthew/factlabel).

## Technical notes (optional)

- The project description states: "Powered by Jev." See the top-level repository page and README for implementation details (https://github.com/generallymatthew/factlabel).
- Version policy files and include policy_version in every audit record so decisions are reproducible.
- Keep immutable audit logs and export them for reviews or compliance checks.

Note: exact API schema, token caps, and runtime limits should come from the repository docs. If the README does not list an item, treat it as an operational choice to define during integration (https://github.com/generallymatthew/factlabel).

## What to do next (production checklist)

### Assumptions / Hypotheses

The following are conservative rollout and operational recommendations you can adopt and tune. They are practical starting points and not explicit claims from the repo:

- Local setup: ~60 minutes.
- Pilot duration: 7 days (annotation-only).
- Pilot sample target: 500–2,000 interactions, with ~100 human-reviewed samples/week.
- Pilot reviewer team: 1–3 people.
- Canary percent: start at 10%; consider 20% for faster iteration.
- False-block thresholds: pilot ≤2%; production target ≤1%.
- Latency gates: p95 added latency target 200 ms; emergency rollback if p95 > 500 ms.
- Suggested evidence token guardrail: 2,048 tokens per extraction pass.
- Estimated small-team production cost: $5–$200/month (hosting dependent).

### Risks / Mitigations

- Risk: false-blocking harms user experience.
  Mitigation: start annotation-only; pause blocking if human-reviewed false-block rate > 2%.

- Risk: added latency slows downstream systems.
  Mitigation: cache (TTL = 60s), move noncritical checks to async, and scale instances. Alert if p95 added latency > 200 ms and rollback if p95 > 500 ms.

- Risk: policy changes cause regressions.
  Mitigation: require code review for policy_version changes, keep immutable audit logs, and maintain a rollback plan.

### Next steps

- Harden transport: enable TLS (Transport Layer Security) or mTLS (mutual TLS) and API keys between agents and Factlabel. Add RBAC (role-based access control) for policy edits. See the repo README for security guidance: https://github.com/generallymatthew/factlabel.
- Monitoring/alerts: implement dashboards for blocked-rate, false-block rate (human-reviewed), p95 latency, and request volume. Suggested alarm thresholds: blocked-rate > 5%, false-block rate > 2%, p95 latency > 200 ms.
- Run a 14-day staging pilot with 500–2,000 interactions and a 7-day decision checkpoint before full rollout.

Useful quick commands and a policy example (adapt to the repo README):

```bash
# clone + quickstart (adjust per repo docs)
git clone https://github.com/generallymatthew/factlabel.git
cd factlabel
# follow the project's exact install and run steps in README
```

Example policy snippet to commit and iterate (JSON):

```json
{
  "policy_version": "1",
  "checks": [{"id":"source_present","required":true}],
  "rollout": {"mode":"canary","percent":10,"annotation_only":true},
  "thresholds": {"false_block_rate_max":0.02,"p95_latency_max_ms":200}
}
```

If you want, I can generate a ready-to-commit policy.yaml, a Node or Python integration snippet that posts to a check endpoint, or a 20-item validation set of known-good and known-bad prompts to use during your pilot. See the repo for source examples and schema: https://github.com/generallymatthew/factlabel.
