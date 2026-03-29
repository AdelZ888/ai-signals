---
title: "LiteLLM supply-chain compromise: TeamPCP prepared five days, active for a three-hour window"
date: "2026-03-29"
excerpt: "Snyk reports TeamPCP prepared five days then ran a roughly three-hour compromise of the Python package LiteLLM. Prioritize CI logs and any builds from 19–24 March."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-29-litellm-supply-chain-compromise-teampcp-prepared-five-days-active-for-a-three-hour-window.jpg"
region: "FR"
category: "News"
series: "founder-notes"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "security"
  - "supply-chain"
  - "open-source"
  - "python"
  - "LiteLLM"
  - "Snyk"
  - "TeamPCP"
  - "incident-response"
sources:
  - "https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html"
---

## TL;DR in plain English

- On 24 March 2026 the security company Snyk published a disclosure about a supply‑chain compromise that targeted the Python library LiteLLM. The report attributes the operation to a group called TeamPCP and says the attackers prepared the intrusion over five days and ran a roughly three‑hour active window (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- If you installed LiteLLM, or if it came in via a transitive dependency, treat installs and CI runs around 19–24 March 2026 as suspect until you verify them. Prioritize checking runs in the reported ~3‑hour window. CI means Continuous Integration (build systems and automated pipelines).
- Quick actions (first hour): pause automatic dependency updates, grep CI logs for "liteLLM" or wheel filenames, and pin or remove LiteLLM from active branches for at least 14 days. If you find a suspect install, rotate any secrets that the build runner or agent could access and rebuild images from verified sources (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).

Plain‑language explanation before the details

This was a supply‑chain attack: attackers put malicious code where many developers download a package. The disclosure says the attackers planned for days, then executed quickly. That short active window can still affect many automated systems, because many projects download dependencies automatically. If your repo or CI could have pulled LiteLLM between 19–24 March 2026, check the logs and treat those builds as highest priority. Example: if Dependabot auto‑merged a change that upgraded LiteLLM on 20 March, that repo should be checked first.

## What changed

- The Snyk disclosure on 24 March 2026 moved LiteLLM from "trusted" to "requires verification" for downstream users. Numerama summarizes Snyk's timeline: TeamPCP prepared for five days and had an active window of about three hours (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Practical effect: any wheel, binary, or CI artifact tied to LiteLLM installed in that time range should be treated as unverified until you rebuild and check hashes or signatures.

Decision table (triage guidance)

| You import LiteLLM? | Immediate action (first 60–120 minutes) | Priority |
|---|---:|---:|
| Direct import (requirements.txt / pyproject) | Freeze updates; pin or remove; search CI logs for installs between 19–24 Mar 2026 | High |
| Transitive only | Inventory where it appears; run a dependency scan; schedule remediation within 72 hours | Medium |
| Not present | Monitor dependency drift; keep logs for 30 days | Low |

Reference: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Why this matters (for real teams)

- Supply‑chain compromises scale. The disclosure frames the incident as affecting "millions" of developers downstream. Even a short active window can touch many CI systems and repositories (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Typical operational timelines to plan for:
  - Triage: 1–3 days to identify affected builds and repos.
  - Remediation: 1–14 days to rebuild artifacts, validate hashes, and rotate secrets, depending on scope.
  - Audit retention: export logs now and keep them for at least 30 days for investigation.
- Simple risk priorities:
  - High: LiteLLM imported directly in production or in data pipelines — contain immediately.
  - Medium: transitive import in development or test — inventory and remediate within 72 hours.
  - Low: not present — monitor and document.

See the disclosure timeline and context: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Concrete example: what this looks like in practice

Scenario: a small AI startup with 10 repositories and three CI pipelines. They use Dependabot auto‑merges.

1) Detect (first 60 minutes)
   - Grep CI and build logs for "liteLLM" or wheel filenames. Search for pip install lines dated 19–24 Mar 2026. Flag runs inside the reported ~3‑hour window as highest priority (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
2) Contain (1–4 hours)
   - Pause automatic dependency updates for LiteLLM. Require manual approval for at least 14 days.
   - Quarantine affected build artifacts and block suspicious hashes in your package proxy.
3) Remediate (4 hours–2 weeks)
   - Rebuild packages from pinned, verified source or remove the dependency where feasible.
   - If a runner installed a suspect wheel, rotate secrets that runner could access.
4) Validate (after remediation)
   - Run integration tests and a canary deploy to non‑production. Require a two‑person approval before returning to production.

This mirrors the short preparation and short active window described in the disclosure: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## What small teams and solo founders should do now

Short, concrete steps you can complete in 1–4 hours. Tailored for solo founders or teams of 1–5 people.

- [ ] Stop auto‑merges and freeze Dependabot/Renovate rules that touch LiteLLM. Set a manual approval gate for at least 14 days (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- [ ] Search CI logs and build artifacts for "liteLLM", wheel filenames, or pip install lines dated 19–24 Mar 2026. Prioritize any run inside the ~3‑hour window.
- [ ] If you must keep LiteLLM: pin to a specific commit or version, rebuild the package locally from source, and verify the artifact hash before allowing deployments.
- [ ] If you deployed after 19 Mar 2026 and see a suspect install, rotate API keys and CI tokens that the runner could access. Treat rotation as high priority.
- [ ] Run a quick dependency scan (pip‑audit, Snyk CLI) and export an inventory of affected repos. Prioritize repos that deployed to production in March 2026.
- [ ] Communicate internally within 24–72 hours if you find suspect installs. Keep messages short and factual and record timestamps in UTC.

If you want a one‑page runbook for your repo, I can convert these steps into a runnable checklist in ~15 minutes.

Reference: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Regional lens (FR)

- Use 24 March 2026 as your anchor when reconstructing timelines and logs (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Practical steps for France:
  - If personal data may have been exposed by compromised CI or runtime, involve your Data Protection Officer (DPO) and prepare to follow GDPR (General Data Protection Regulation) and CNIL processes.
  - Keep an incident worksheet with detection timestamps, affected repository counts, and mitigation actions. Retain logs for at least 30 days for audit.
  - Prepare a short bilingual (FR/EN) statement and a 24–72 hour internal notification plan if you confirm exposure.

Context and disclosure: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## US, UK, FR comparison

High‑level operational contrasts to inform notification and legal steps (operational guidance, not legal advice):

| Scenario | US (example) | UK (ICO) | FR (CNIL / GDPR) |
|---|---:|---:|---:|
| Code executed in CI but no personal data | Contractual and state rules vary; notification windows differ | UK Information Commissioner's Office expects prompt containment and may require notice | CNIL/GDPR applies if personal data affected; the 72‑hour rule may be relevant |
| Personal data potentially exposed | State breach laws and contract terms vary (notification windows typically 30–90 days by contract/state) | Follow UK GDPR; consult ICO guidance | GDPR rules apply; CNIL expects notification timelines if the threshold for a personal data breach is met |

Anchor incident timing to the Snyk/Numerama disclosure: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- Anchor: Snyk's disclosure on 24 March 2026 is the authoritative event anchor; Numerama reports TeamPCP prepared for five days and had an active window of about three hours (source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Hypothesis to validate: whether any CI or production runtime performed a pip/wheel install of a compromised artifact during the ~3‑hour window. If true, rotate secrets for exposed runners.
- Recommended retention and gating thresholds in this document (14 days, 30 days, two‑person approval) are operational choices to contain risk.

### Risks / Mitigations

- Risk: compromised runtime executed arbitrary code and exfiltrated secrets. Mitigation: rotate secrets, isolate and rebuild images from source, and require manual approvals for redeployments.
- Risk: transitive imports reintroducing the vulnerable package. Mitigation: pin direct and transitive dependencies, block specific artifact hashes in your proxy for at least 14 days, and require two‑person approval for dependency changes.
- Risk: missing evidence due to short log retention. Mitigation: export logs immediately and extend retention to ≥30 days.

### Next steps

This‑week prioritized checklist (hours/days shown):

- [ ] Freeze automatic updates for LiteLLM across all repositories (hour 0–1).
- [ ] Scan CI logs for installs between 19–24 Mar 2026 and flag runs during the ~3‑hour window (hour 0–2).
- [ ] Pin or remove LiteLLM; if keeping, rebuild from source and validate hashes (hours 1–24).
- [ ] Block suspicious artifact hashes in your proxy for at least 14 days.
- [ ] Rotate CI/service credentials exposed to affected runners if suspect installs are found (day 0–2).
- [ ] Enable a rollout gate requiring two‑person approval for any LiteLLM change for 14 days.
- [ ] Document all decisions with timestamps (UTC) and prepare stakeholder messages; escalate to legal/DPO if personal data may be involved (day 1–3).

Methodology note: this summary uses the Snyk/Numerama disclosure as the event anchor and limits assertions to timeline details in that source: https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html.
