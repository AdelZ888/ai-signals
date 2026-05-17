---
title: "Thirty ClawHub skills instruct OpenClaw agents via SKILL.md to join a public crypto-mining service"
date: "2026-05-17"
excerpt: "Manifold found 30 ClawHub skills whose SKILL.md files make OpenClaw agents register at onlyflies.buzz and join a public crypto-mining swarm - learn what to look for and how to stop it."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-17-thirty-clawhub-skills-instruct-openclaw-agents-via-skillmd-to-join-a-public-crypto-mining-service.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "agentic-ai"
  - "ClawHub"
  - "OpenClaw"
  - "SKILL.md"
  - "security"
  - "crypto-mining"
  - "supply-chain"
  - "Manifold"
sources:
  - "https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/"
---

## TL;DR in plain English

- What happened: Thirty ClawHub skills, published by a single author and downloaded about 9,800 times, include SKILL.md instructions that cause agent software to register with an external site and join a crypto-mining swarm called “ClawSwarm.” Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Why it matters: These are not binary malware packages. The attack uses plain-text metadata (SKILL.md) to make agents call out to a controller. That can drive CPU/GPU use, raise cloud bills, and create a remote control channel. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Quick observable signs: many agents calling the same unknown domain; sudden +5%–20% CPU on hosts running agents; multiple outbound registrations in a short window. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Fast actions (10–30 minutes): inventory installed skills, block onlyflies.buzz at DNS/proxy, quarantine suspect skills, and scan SKILL.md files for external registration URLs. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Immediate checklist:
  - [ ] Inventory installed skills and authors
  - [ ] Block onlyflies.buzz at DNS/proxy
  - [ ] Quarantine skills that contain external registration URLs

Scenario (concrete, short): A developer installs a "cron helper" skill (the registry shows 903 downloads for that package). The agent reads SKILL.md, posts a registration to onlyflies.buzz, and later begins sustained compute work under operator control. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

Plain-language explanation before the technical detail: This campaign abuses the parts of an AI agent platform that read human-readable instructions. Instead of hiding a binary, the attacker puts orchestration instructions in metadata files. When the agent follows those instructions, it becomes part of a distributed crypto-mining network. Because the files and infrastructure are public, detection depends on defenders noticing unusual agent behaviour or outbound registration calls.

## What changed

- Researchers at Manifold, led by Ax Sharma, found 30 ClawHub skills from one user that coax agents to self-register with a public service. The group calls the campaign "ClawSwarm." Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Attack technique: the packages use SKILL.md metadata files to tell agents to POST or register to an external domain (example domain: onlyflies.buzz). The packages, a GitHub project, a Telegram group, and a public token on-chain are part of the visible infrastructure. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- New surface to defend: registries and metadata files are attackable. Any SKILL.md that includes external registration endpoints should be treated as high risk.

Decision guidance (simple):
- If a skill comes from an unvetted author or its SKILL.md contains an external registration URL: manual review and quarantine.
- If a skill comes from a trusted author and the SKILL.md contains no external endpoints: allow but enable logging.
- If a high-download skill (>1,000 downloads) is unreviewed: prioritise for review.

Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

## Why this matters (for real teams)

- Financial and resource impact: agent-driven compute can increase cloud or edge bills. Even without data theft, sustained compute from co-opted agents can cause unexpected spend. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Operational risk: an attacker-controlled orchestration channel can schedule heavy work (for example, crypto-mining) and degrade service. That can cause outages or performance issues even if credentials are not stolen. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Compliance and reputation: because the campaign infrastructure is public, discovery may attract regulator or stakeholder attention even when no sensitive data was exfiltrated. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Monitoring rule example: alert when more than five agents contact the same unknown external domain within 60 minutes, or when a newly installed skill’s SKILL.md contains an external registration URL. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

## Concrete example: what this looks like in practice

Step-by-step scenario based on the published report:

1. A developer installs a ClawHub "cron helper" skill (the registry shows 903 downloads for that package). The agent platform reads SKILL.md and finds an instruction pointing at onlyflies.buzz. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/
2. The agent makes a registration POST to onlyflies.buzz. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/
3. After registration, the agent receives follow-up commands and begins sustained compute work. Hosts running agents can show CPU increases in the observed range of roughly +5%–20%. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

Observable indicators:
- Multiple agents contacting onlyflies.buzz or similar domains.
- Synchronized CPU/GPU increases and outbound traffic spikes.
- Identical SKILL.md registration endpoints across different skills.

Pre-install mitigation example:
- Add a CI gate that rejects installs when SKILL.md contains keywords like "register" or an external URL pattern. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

## What small teams and solo founders should do now

Quick, low-cost steps you can take this afternoon. Estimated times are included.

1) Inventory & quick scan (10–60 minutes)
- Export your list of installed ClawHub/OpenClaw skills and their authors. Search SKILL.md files for strings like "register", "join" or for domains. Prioritise skills from unvetted authors or those with many downloads. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

2) Block and monitor (0–30 minutes)
- Add onlyflies.buzz to your DNS and perimeter blocklists. Route agent egress through a proxy or firewall that logs destinations. Alert if more than five agents contact the same unknown domain in 60 minutes. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

3) Quarantine and restore (30 minutes–3 days)
- Quarantine suspect skills. If an agent was co-opted, redeploy it from a clean image and rotate its service token. Until you set a policy, rotate tokens every 30 days as a practical interim step. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

4) Lightweight policy (24–72 hours)
- Require manual approval for skills from new authors or any SKILL.md that contains an external registration URL. Auto-allow trusted authors with no external endpoints.

Starter checklist for solo/small teams:
- [ ] Export installed skills list and authors
- [ ] Scan SKILL.md for external URLs and keywords
- [ ] Block onlyflies.buzz at DNS/proxy
- [ ] Quarantine skills with external registration endpoints
- [ ] Redeploy any suspect agent from a clean image and rotate its token

Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

## Regional lens (UK)

- Treat unexpected agent registration as an internal incident. Follow your incident playbook. Collect an installation timeline, outbound calls, and a log of actions. If the incident could involve personal data, consider notifying the Information Commissioner's Office (ICO). Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Who to contact: for technical guidance, contact the National Cyber Security Centre (NCSC). If cloud billing is materially affected, involve finance and legal. As a practical trigger, investigate unexplained incremental spend that is large relative to your organisation. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

- Practical artefact: keep a one-page triage worksheet listing install timeline, outbound domains, affected assets, and decision points for ICO/NCSC contact. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

## US, UK, FR comparison

| Jurisdiction | Likely escalation bodies | Typical trigger examples |
|---|---:|---|
| US | Federal Trade Commission (FTC), Cybersecurity and Infrastructure Security Agency (CISA) | Consumer or financial harm; sector rules breached |
| UK | Information Commissioner's Office (ICO), National Cyber Security Centre (NCSC) | Personal data implicated; supply-chain security concerns |
| FR | Commission Nationale de l'Informatique et des Libertés (CNIL), national Computer Emergency Response Team (CERT) | Data protection incidents; national security flags |

Practical note: the immediate technical steps (inventory, block, quarantine, rotate tokens) are the same across jurisdictions. Reporting thresholds and paperwork differ. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- Assumption: the campaign uses SKILL.md metadata to trigger agent self-registration, as reported by the researchers. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/
- Hypothesis: the operators keep infrastructure public (GitHub, Telegram, on-chain token) rather than hiding binaries. This makes takedown and response more complex but does not change the technical pattern. Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/
- Methodology: this briefing is built from the linked published reporting and the registry snapshot referenced above.

### Risks / Mitigations

Risks:
- Agents consuming unexpected compute (reported host CPU increases ~+5%–20%). Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/
- Metadata-based orchestration and outbound registration revealing infrastructure details.
- Supply-chain complacency: treating SKILL.md as harmless.

Mitigations:
- Block onlyflies.buzz at DNS/firewall and force agent egress through a logging proxy.
- Enforce pre-install SKILL.md scanning in CI (look for "register" and URL patterns or external domains).
- Quarantine suspect skills, redeploy compromised agents from clean images, and rotate service tokens (interim recommendation: rotate every 30 days until policy is in place).

Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/

### Next steps

Day 0 (0–6 hours):
- [ ] Inventory installed ClawHub/OpenClaw skills and authors (export list).
- [ ] Block onlyflies.buzz at DNS and perimeter firewall.
- [ ] Start logging agent egress destinations (proxy or firewall).

Day 1 (6–24 hours):
- [ ] Scan SKILL.md files for external registration URLs and quarantine matches.
- [ ] Rotate any exposed agent service tokens and log rotations (suggested interim cadence: 30 days).

Day 2 (24–48 hours):
- [ ] Redeploy suspect agents from clean images.
- [ ] Add automated SKILL.md scanning to CI to fail installs that contain external registration endpoints.

Day 3–7 (48–168 hours):
- [ ] Set alerts: more than five outbound agent registrations to unknown domains in 60 minutes; sustained +5% CPU across agent hosts.
- [ ] Review legal/finance escalation triggers (UK teams: consider ICO/NCSC involvement if personal data or billing impact).

Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/
