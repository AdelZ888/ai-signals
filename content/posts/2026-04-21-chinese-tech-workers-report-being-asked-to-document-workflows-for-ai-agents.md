---
title: "Chinese tech workers report being asked to document workflows for AI agents"
date: "2026-04-21"
excerpt: "A viral 'Colleague Skill' demo prompted Chinese tech workers to say managers asked them to export chats and write manuals so AI agents can do routine tasks, sparking debate about consent."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-21-chinese-tech-workers-report-being-asked-to-document-workflows-for-ai-agents.jpg"
region: "US"
category: "Model Breakdowns"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "SOCIETY"
tags:
  - "AI"
  - "work"
  - "agents"
  - "China"
  - "labor"
  - "ethics"
  - "management"
  - "privacy"
sources:
  - "https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/"
---

## TL;DR (jobs + people, plain English)

- A viral GitHub project called Colleague Skill showed how chat logs and files can be turned into a reusable “colleague manual.” It imported chat and files from Lark and DingTalk and produced instructions for an AI agent (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- The project was a spoof, but it touched a real trend: some managers ask staff to document workflows so AI can automate tasks (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- People first joked. Then many raised serious concerns about dignity, privacy, and replacement risk. The article quotes Amber Li, age 27, as an example of worker worry (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Practical effect: teams whose work lives in chat and shared documents are most exposed. That includes engineers, product people, and support teams (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Short take: if your day leaves exportable traces, expect requests to document or export them. Push for scope, redaction, review rights, and compensation (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## What the sources actually say

- Colleague Skill was presented as a way to “distill” coworkers into an AI skill. It automatically imported chat history and files from workplace apps (the article names Lark and DingTalk) and generated reusable manuals describing duties and quirks for an agent (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- The project’s author is Tianyi Zhou, an engineer at the Shanghai Artificial Intelligence Laboratory. Zhou told local press he started the stunt in response to AI-related layoffs and a growing practice of companies asking employees to automate themselves (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- The story went viral on social media. Some users treated it as a joke; others reported real workplace requests to export chats and write handbooks so agents could take over routine tasks. The article connects that trend to a broader debate about worker dignity, privacy, and replacement risk (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

Methodology note: this memo summarizes MIT Technology Review reporting. Items that extend beyond the article are listed under Assumptions / Hypotheses below (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## Which tasks are exposed vs which jobs change slowly

Short rule: tasks that are predictable and leave a trace in chat or documents are easiest to capture. Tacit judgment, high‑stakes discretion, and coaching change more slowly (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

| Exposure level | Typical tasks | Why exposed (evidence / example) |
|---|---:|---|
| High | Ticket triage, templated replies, routine data lookups | These actions leave structured traces in chats and shared files. Colleague Skill used chat + files to create manuals (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/). |
| Medium | First drafts of PRDs, routine test scripts, standard build steps | Drafts and templates exist in docs and can be auto-generated from notes or meeting logs. |
| Low | Hiring decisions, legal judgments, complex mentoring | These rely on tacit judgment and context not fully captured by exported chat logs or files. |

Why this table matters: the article shows one concrete pipeline (chat/files -> agent manual). Use that pipeline to audit which of your team’s tasks leave exportable traces (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## Three concrete personas (2026 scenarios)

Persona A — Li Wei (backend engineer, Shanghai)
- Context: Li’s debugging conversations live in Lark and DingTalk. Managers ask for a short handbook and chat exports so an agent can triage debug tickets.
- Concern: Informal heuristics and private snippets in chat could be captured and reused without consent.
- Response: Li requests a written scope, redaction rules, and the right to review agent outputs before the agent is used in production (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

Persona B — Ava (product manager, London)
- Context: Ava keeps PRD drafts, decision notes, and chat threads in shared docs.
- Concern: Private decision context or bias in notes could shape product direction if used unreviewed by an agent.
- Response: Ava asks for a limited pilot and human approval before any AI-generated PRD is accepted for release (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

Persona C — Marcus (customer-support lead, US remote)
- Context: His team’s historical chat logs form the training data for proposed support bots.
- Concern: Customer PII and immature responses could cause compliance or liability issues.
- Response: Marcus requires a shadow period where the bot only suggests replies and humans approve them. He also asks for audit logs of training sources (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## What employees should do now

- Ask for a written scope before you export anything. The scope should list which apps (for example Lark, DingTalk), fields, channels, and date ranges will be exported (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Insist on redaction rules for secrets and PII. Require a review window (for example 7–14 days) to inspect exported material and proposed agent outputs.
- Negotiate human-in-the-loop rights. Agents should not make final calls on hiring, firing, refunds, or legal outcomes without explicit human sign-off.
- Preserve bargaining power. Ask for paid time or one‑time compensation if you must prepare materials used to train an agent. Coordinate with peers and HR to make requests formal (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## What founders and managers should do now

- Publish a short internal policy before asking staff to export chats or files. The policy should state purpose, data sources, retention, opt-out rules, compensation, and a contact owner (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Run a security and privacy check before any export. Redact credentials and PII as a baseline and document who has access.
- Pilot in shadow mode. Require human approval on agent outputs for a measurable pilot window before any production rollout.
- Compensate contributors. Offer paid time or one-time payments when staff must produce documentation for training. Be explicit how contributions affect headcount planning and reviews (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## France / US / UK lens

The article reports on China’s social and workplace reaction to Colleague Skill; local law and labor practice differ across markets (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/). Before exporting chats or training agents, validate the following locally:
- France: check CNIL guidance on employee data and explicit consent requirements.
- United Kingdom: confirm data‑processing basis and consult ACAS/ICO guidance for worker consultation.
- United States: check state and federal privacy rules and the company’s employment contracts and IP clauses.

If local legal or collective‑bargaining rules require consultation or consent, do that before any export or pilot. Where law is silent, follow the transparency practices above and treat consent as revocable (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## Checklist and next steps

### Assumptions / Hypotheses
- The source documents Colleague Skill’s viral spread and worker reactions in China. This memo assumes similar pressures (managers asking staff to document workflows) can appear in other markets; these numeric gates are operational proposals to validate in pilots, not claims from the article (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Example numeric gates to test in pilots (hypotheses for negotiation): accuracy targets of 85% and 95%; critical-error caps ≤1% to ≤2%; pilot windows of 30 days; context limits of 10,000 tokens per request; latency goal ≤100 ms; retention options 0 / 30 / 90 days; and compensation ranges $300–$5,000 per role.
- Counts to track in pilots: number of exported chat channels, number of contributors, number of customer queries used for training, and number of agent decisions routed to human review.

### Risks / Mitigations
- Risk: unauthorized export of secrets or customer PII. Mitigation: minimal export lists, mandatory redaction, and a security review before any export (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Risk: employees feel coerced into training their replacements. Mitigation: require written, revocable consent; enable opt‑out; offer compensation or protected paid time; involve employee representatives when relevant.
- Risk: poor customer outcomes from immature agents. Mitigation: run pilots in shadow mode; require human‑in‑the‑loop for high‑risk replies; maintain audit logs linking training data to model updates.

### Next steps
Immediate (0–7 days)
- [ ] Request a written scope listing who, what, why, and retention options (0 / 30 / 90 days) (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- [ ] Ask for a data‑export spreadsheet showing exact sources, channels, and access roles.

Priority (7–30 days)
- [ ] Run a privacy and security review before any export.
- [ ] Define pilot metrics and a rollout gate (example pilot: 30 days; validate accuracy and error caps in your environment).
- [ ] Agree on compensation or protected time if employees must produce material used for training.

Medium term (30–90 days)
- [ ] Implement audit logging of which data were used and when model updates occurred.
- [ ] Red‑team agent outputs and publish results to stakeholders.
- [ ] Produce reskilling or compensation plans where roles change; estimate budgets and timelines and validate them with affected teams.

Reference: MIT Technology Review reporting on Colleague Skill and Chinese tech workers’ reactions (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
