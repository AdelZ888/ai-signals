---
title: "Okta CEO Todd McKinnon urges treating AI agents as distinct service identities"
date: "2026-04-01"
excerpt: "Todd McKinnon says treat AI agents like users. This post gives three quick controls—unique service IDs, least privilege, short-lived tokens—and a 90-minute checklist."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-01-okta-ceo-todd-mckinnon-urges-treating-ai-agents-as-distinct-service-identities.jpg"
region: "US"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "NEWS"
tags:
  - "okta"
  - "identity"
  - "ai-agents"
  - "security"
  - "enterprise"
  - "startups"
  - "governance"
  - "todd-mckinnon"
sources:
  - "https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity"
---

## TL;DR in plain English

- Okta’s CEO publicly recommended treating AI agents (bots, automation, or model-backed services) like human users. This is a clear industry signal to govern non-human actors more carefully (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).
- Do three simple things now:
  - Give each agent a unique service identity (one account per agent).
  - Apply least privilege (only grant the roles the agent needs).
  - Use short-lived tokens (time-to-live, TTL) so a leaked credential is only useful for a short time (example: 1 hour = 3600 seconds).
- Quick, time-boxed 90-minute checklist you can run this week:
  - Inventory where models or automations hold credentials — 15–30 minutes.
  - Create unique service identities for the top 3 agents and assign owners — 30–40 minutes.
  - Set token TTL <= 3600 seconds and turn on audit logging (include service_id in logs) — 20 minutes.
- If you do only one thing: require TTL <= 1 hour for any automation that touches user data. When asking for help, reference the Okta CEO statement to explain why this is urgent (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).

### Plain-language explanation (before the technical details)

AI agents are any non-human process that calls your APIs or writes data — for example, a chatbot that looks up user profiles and updates a ticketing system. Treating an agent like a user means:
- Give it its own identity and owner. Treat it like a person on your team.  
- Give it only the access it needs (role-based access control, RBAC). RBAC means you grant roles that limit what the agent can do.  
- Make its access short-lived so a compromised token has limited value (TTL = time-to-live).  

These are standard security ideas applied to machines instead of people. Okta’s CEO framed this as a new priority for identity platforms, which makes vendors and customers more likely to expect these controls (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).

## What changed

- Leadership signal: Okta’s CEO publicly described “AI agent identity” as a new frontier for identity. That public statement nudges vendors and buyers to treat non-human actors as first-class identities (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).
- Practical impact: expect requests for features such as agent-level logs, configurable token TTLs, and per-agent service accounts to appear in product roadmaps. These features make it easier for teams to add basic controls quickly.
- Bottom line: if you can spare a few engineering hours (1–4 hours total this week), you can reduce risk substantially by inventorying agents, giving them unique IDs, enforcing short TTLs, and enabling audit logging.

## Why this matters (for real teams)

- Shared or long-lived credentials increase the blast radius. A token valid for a day or more can let an automated process multiply damage while you investigate.
- Treating agents like users lets you reuse proven governance: RBAC (role-based access control), rotation, audit trails, and incident response playbooks.
- Concrete metrics to track immediately:
  - Count of service accounts with tokens > 24 hours. Target: 0 for high-risk data within 30 days.
  - Percent of agent requests that include an explicit service_id in logs. Target: 100% during rollout week.
  - Number of high-risk agents inventoried. Target: top 3 in 90 minutes, full inventory within 7 days.
- The Okta CEO quote is useful in procurement and security reviews. It reduces friction when you ask vendors to support agent-level controls (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).

## Concrete example: what this looks like in practice

Scenario: a two-founder SaaS runs an automated support agent that reads user profiles and writes notes into the CRM.

Minimal rollout (time-boxed)

1. Inventory (15–30 minutes): list where the agent stores credentials and which systems it touches. Note if it accesses personally identifiable information (PII).
2. Unique identity (30–40 minutes): create a service account like support-agent@acme-prod and assign a named owner.
3. Least privilege: give the account a crm.write-limited role so it can only update allowed fields. Avoid roles that allow bulk export of PII.
4. Short TTL (20 minutes): set token_ttl_seconds = 3600 (1 hour). If you cannot automate rotation yet, rotate at every deploy or manually at least every 24 hours until automation exists.
5. Audit logging: include service_id on each request and centralize logs. Verify CRM writes show a matching service_id in logs.

Outcome metrics for week 1:
- Percent of CRM writes from support-agent service account: target 100%.
- Distinct human API keys used by the agent: target 0.
- Median token lifetime for agents touching PII: target <= 3600 seconds.

| Field | Example value | Why it matters |
|---|---:|---|
| service_id | support-agent | attribution in logs |
| token_ttl_seconds | 3600 | limits window if leaked |
| allowed_roles | [crm:read, crm:write-limited] | least privilege |
| audit_enabled | true | for forensics |

(Source rationale: use the Okta CEO statement when prioritizing these changes: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity.)

## What small teams and solo founders should do now

This section is for solo founders and very small teams. Actions are concrete, low-cost, and time-boxed.

Top 3 immediate tasks (about 90 minutes total):

1) Inventory + triage (15–30 minutes)
   - List your top 3 automations that hold credentials or access user data (APIs, databases, CRM). Note owners and exposure (PII, billing, admin APIs).
2) Create per-agent identities (30–40 minutes)
   - Make one service account per agent and assign a named owner. Do not share human API keys across agents. Start with 3 accounts.
3) TTL + logging (20 minutes)
   - Enforce token TTL <= 3600 seconds for the top 3. Turn on audit logs that include service_id. If you lack a paid tool, export cloud audit logs to a CSV weekly.

Quick, low-cost tweaks
- If engineering time is scarce: add a cron job that rotates a token every 24 hours and log the rotation in a CSV (temporary workaround).
- If you have a small budget ($0–$500): trial a hosted identity or log ingestion service for central logs and 30–90 day retention.
- If product limits block per-agent identities: enforce per-agent API keys and a manual rotation policy until workload identity (OpenID Connect, OIDC) is available.

Policy lines to add to your README (one sentence each):
- All non-human actors must have unique service identities and a named owner.
- Tokens that access user data must have TTL <= 1 hour unless an approved exception exists.
- Audit logs must include service_id on each external request.

Reference: this guidance reflects Okta’s CEO framing and can help when you ask for 1–2 hours of help (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).

## Regional lens (US)

- For US customers, the Okta CEO message is a practical procurement argument: ask vendors for agent-level logging and configurable token TTLs during evaluations (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).
- Suggested vendor question: “Do you support distinct service identities for non-human actors, per-request audit logs, and configurable token TTLs (in seconds)?”
- Produce a one-page mapping for sales and security showing which agents access which data and their token lifetimes. Choose log retention of 30–90 days based on your risk appetite.

## US, UK, FR comparison

The table below recommends minimal controls by market. Adjust thresholds to match your risk profile.

| Market | Recommended minimal controls | Example retention / TTL targets |
|---|---|---:|
| US | Agent identity + audit logs + short TTLs | Token TTL <= 3600s, log retention 30–90 days |
| UK | Same baseline; document alignment when selling to public sector | Token TTL <= 3600s, log retention 30–90 days |
| FR | Same baseline; be explicit about personal data access and minimization | Token TTL <= 3600s, document flows and retention |

Why: the Okta CEO signal increases buyer attention to agent controls. Use a short decision table in RFPs and reviews (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The memo assumes Okta’s public framing will accelerate vendor and customer focus on agent identity; this is a market-signal hypothesis drawn from the CEO statement (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).
- It assumes small teams can implement short-lived token controls using existing identity provider APIs or cloud workload identity (OIDC) within ~1–4 hours of focused work.

### Risks / Mitigations

- Risk: short-lived tokens increase friction for background jobs. Mitigation: automate rotation, add retries, and set alerts for rotation failures.
- Risk: incomplete logs impede forensics. Mitigation: require service_id in headers and export logs to a central sink with 30–90 day retention.
- Risk: single-vendor dependence. Mitigation: daily export of logs to object storage and maintain a small CSV inventory as backup.

### Next steps

This week checklist (time boxes included):
- [ ] Inventory top 3 agents and map to resources (15–30 minutes).
- [ ] Create unique service identities and assign owners for top 3 (30–40 minutes).
- [ ] Set token TTL <= 3600s for those identities and enable audit logs (20 minutes).
- [ ] Add a one-line policy to your security README about agent identities and TTLs (5–10 minutes).
- [ ] Produce a one-page decision table for RFPs that includes agent controls (30 minutes).

Optional month+ enhancements: implement workload identity (OIDC), mutual TLS (mTLS) for service connections, and automated rotation schedules (rotate_schedule_days = 1–7 depending on risk). Aim for 100% of agent requests to carry service_id in logs and 0 agents with tokens >24 hours for high-risk data within 30 days.

Methodology note: this memo translates the Okta CEO leadership signal into practical, time-boxed steps small teams can act on immediately (source: https://www.theverge.com/podcast/902264/oktas-ceo-is-betting-big-on-ai-agent-identity).
