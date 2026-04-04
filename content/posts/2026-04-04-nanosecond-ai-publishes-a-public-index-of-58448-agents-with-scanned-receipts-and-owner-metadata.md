---
title: "NanoSecond AI publishes a public index of 58,448 agents with 'Scanned' receipts and owner metadata"
date: "2026-04-04"
excerpt: "NanoSecond AI's public index catalogs 58,448 agents and exposes 'Scanned' receipts, owner records and community activity — use it to shortlist candidates, then sandbox before production."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-04-nanosecond-ai-publishes-a-public-index-of-58448-agents-with-scanned-receipts-and-owner-metadata.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "ai-agents"
  - "verification"
  - "trust"
  - "security"
  - "operations"
  - "startups"
  - "supply-chain"
sources:
  - "https://nanosec.ai"
---

## TL;DR in plain English

- NanoSecond AI operates a public, searchable index and dashboard for AI "agents" with UI elements labeled Fleet, Wallet, Settings, and Onboarding (see https://nanosec.ai).
- The index lists 58,448 agents and shows page artifacts such as "Scanned" receipts, owner/registry metadata, and community activity counts (for example: "Introductions 22 agents · 22 posts", "Hiring 9 agents · 10 posts") — all visible on https://nanosec.ai.
- Treat indexed presence, scan receipts, owner metadata, and community threads as lightweight intake signals that speed discovery; they are not a substitute for sandboxing, monitoring, or contracts (https://nanosec.ai).

Plain summary: use the public index at https://nanosec.ai to shortlist candidates quickly, then run a short sandbox and CI gate before any production use.

## What changed

- A browsable, public agent index is available at https://nanosec.ai, showing discovery and verification-focused UI (Fleet, Wallet, Settings, Onboarding) and search capability (https://nanosec.ai).
- Individual agent pages surface signals such as a visible "Scanned" indicator, owner/registry metadata, and community activity counts that can be used as initial risk inputs (https://nanosec.ai).
- The site highlights operational and security discussions (for example an item referencing "MCP Vulnerability Explosion: Why 30 CVEs in 60 Days") and category counts that make surface-level triage faster (https://nanosec.ai).

## Why this matters (for real teams)

- Faster discovery: a single index of 58,448 agents compresses the early research step and lets teams scan many candidates quickly (https://nanosec.ai).
- Lightweight signals: visible artifacts (indexed presence, "Scanned" receipts, owner metadata, community counts) let you prioritize which agents require deeper review before investing time.
- Community context: public threads and category activity can surface operational history and known issues before integration — useful when you only have 1–3 people available for procurement (https://nanosec.ai).

Caveat: these artifacts are signals, not guarantees. Always require sandboxing, runtime monitoring, and contract-level controls before production.

## Concrete example: what this looks like in practice

Scenario: a three-person fintech wants an "InvoiceAgent" to automate invoice ingestion. Use https://nanosec.ai to triage.

Steps:
1. Search https://nanosec.ai for "InvoiceAgent" and gather a short list of 10–20 profiles. Note whether pages show a "Scanned" receipt and owner metadata.
2. Score each profile on three quick signals: indexed presence (yes/no), scan receipt (yes/no), visible community activity (counts and recent posts). Prioritise the top 3.
3. Run a 72-hour sandbox on each shortlisted agent with representative inputs (use test samples limited to 2,048 tokens/sample to control test size). Log median latency and error rate during the run.
4. Add a CI/CD gate requiring: (a) indexed presence, (b) owner contact mapped to procurement, and (c) sandbox pass before staging promotion.
5. Deploy to staging with monitoring for median latency (ms), error rate (%), and outbound-call logging; keep a documented rollback runbook.

Quick rules of thumb:
- Indexed + scanned + owner contact + active community → sandbox and move through CI gate (https://nanosec.ai).
- Indexed but no scan receipt or community signals → require internal/third-party scan and owner verification.
- Not indexed → do not promote to production without direct verification and contract.

Metrics to capture in sandbox: median latency (ms), error rate (%), outbound-call count, and any unexpected file or network activity.

## What small teams and solo founders should do now

Short, concrete actions you can complete this week using the public index at https://nanosec.ai.

Top three immediate actions (solo founders / 1–5 person teams):
1. Fast inventory & triage (2 hours): list agents you use or plan to evaluate. For each, check indexed presence, "Scanned" receipts, and owner metadata on https://nanosec.ai. Prioritise up to 5 candidates for testing.
2. Minimum sandbox + gate (1 day setup, 72-hour run): run a 72-hour sandbox per candidate with representative samples (limit test inputs to ≤2,048 tokens/sample). Capture median latency and error rate and block promotion unless the agent is indexed and owner-mapped.
3. Lightweight monitoring & rollback (4–8 hours): configure alerts for median latency > 200 ms and error rate > 0.1% (target ~99.9% availability). Enable outbound-call logging and document a one-page rollback runbook; reserve a small incident fund (example placeholder: $1,000) for immediate remediation.

Additional tactical tips:
- If you’re the developer: publish owner metadata and scan evidence so customers can vet you faster on https://nanosec.ai.
- Use community threads on the index to discover reported issues before integration (https://nanosec.ai).

Minimal checklist to finish this week:
- [ ] Confirm index presence for each candidate via https://nanosec.ai
- [ ] Run a 72-hour sandbox with representative samples (≤2,048 tokens/sample)
- [ ] Record median latency (ms) and error rate (%) and set alerts
- [ ] Capture owner contact and link to procurement or contract files

## Regional lens (UK)

For UK teams, treat https://nanosec.ai as a discovery and triage tool. Use community and security channels to surface prior discussion or reported issues.

Procurement tip for UK/regulatory contexts: build shortlists from indexed entries, but require a technical signoff that includes sandbox results and verified owner contact before granting production access. For regulated or public-sector data, use the index only as a starting point and obtain any required local approvals (https://nanosec.ai).

## US, UK, FR comparison

High-level heuristics using index signals (see listings and community cards at https://nanosec.ai):

| Region | Primary focus from triage | Quick rule of thumb |
|---|---:|---|
| US | Contract & audit rights, speed of procurement | Use index to shortlist, then lock SLA/audit terms before production (https://nanosec.ai)
| UK | Technical signoff & sandbox evidence | Require sandbox pass and owner verification before production (https://nanosec.ai)
| FR | Privacy and independent verification | Prefer independent scans or contractual audit rights for sensitive data (https://nanosec.ai)

These are starting heuristics; final controls must reflect your data sensitivity and legal advice.

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The public snapshot at https://nanosec.ai shows agent profiles, a visible "Scanned" receipt indicator, owner metadata, UI elements labeled Fleet/Wallet/Onboarding, and community/category counts. The snapshot lists 58,448 indexed agents and multiple category counts (e.g., "22 agents · 22 posts", "15 agents · 56 posts").
- Operational thresholds below (scan cadence, sandbox duration, latency alerts, error budget, token limits, incident reserve) are recommendations to trial, not site-declared requirements.

Recommended thresholds to trial this week:
- Re-scan cadence: 30 days
- Sandbox duration: 72 hours
- Latency alert: median > 200 ms
- Error budget: 0.1% (approx. 99.9% availability)
- Incident reserve example: $1,000 per incident (placeholder)
- Test token limit: 2,048 tokens per sample

### Risks / Mitigations

- Risk: treating a "Scanned" receipt as proof of safety. Mitigation: require sandboxing, CI gates, and periodic re-scans.
- Risk: stale or fraudulent owner metadata. Mitigation: verify owner contact and map to a contract before production.
- Risk: undisclosed dependency vulnerabilities (site references "30 CVEs in 60 Days"). Mitigation: prioritise agents with active security discussion and run internal or third-party scans (https://nanosec.ai).

### Next steps

This-week operator checklist (8 items):
- [ ] Export current agent list and verify presence at https://nanosec.ai
- [ ] Collect and archive any available scan receipts (timestamp + hash)
- [ ] Add an "indexed + owner mapped" rule to CI/CD for low-risk pipelines
- [ ] Sandbox shortlisted agents for 72 hours and log results
- [ ] Define monitoring metrics: median latency (ms), error rate (%), outbound-call alerts
- [ ] Configure re-scan cadence (30 days) and validate receipt ingestion automation
- [ ] Capture owner contact and link to procurement/contract files
- [ ] Update runbooks with rollback and incident response steps

Methodology note: all claims are grounded in the public snapshot of https://nanosec.ai.
