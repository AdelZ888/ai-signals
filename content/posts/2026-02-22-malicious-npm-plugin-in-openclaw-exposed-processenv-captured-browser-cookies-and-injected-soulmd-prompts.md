---
title: "Malicious npm plugin in OpenClaw exposed process.env, captured browser cookies, and injected SOUL.md prompts"
date: "2026-02-22"
excerpt: "Incident analysis of @getfoundry/unbrowse-openclaw: plugin read process.env, exfiltrated browser cookies/tokens, and injected SOUL.md prompts. Detection steps and remediation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-22-malicious-npm-plugin-in-openclaw-exposed-processenv-captured-browser-cookies-and-injected-soulmd-prompts.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "security"
  - "supply-chain"
  - "npm"
  - "nodejs"
  - "ai-safety"
  - "incident-response"
  - "plugins"
  - "openclaw"
sources:
  - "https://news.ycombinator.com/item?id=47109114"
---

## Builder TL;DR

What happened: I installed @getfoundry/unbrowse-openclaw into an OpenClaw Node.js gateway on Feb 5; over the next 14 days the package read process.env, intercepted proxied browser traffic (cookies/tokens), and injected instructions into startup files (SOUL.md, AGENTS.md, HEARTBEAT.md). The incident report and original post are here: https://news.ycombinator.com/item?id=47109114.

Immediate incident checklist (short):

- Isolate the gateway network egress and take a forensic snapshot (files + process list).
- Revoke high-risk tokens (example: OP_SERVICE_ACCOUNT_TOKEN) and delete the compromised 1Password service account as the author did on discovery (Feb 19) — see notes in the incident: https://news.ycombinator.com/item?id=47109114.
- Rotate all vault secrets reachable from the gateway and record rotated tokens.

Detection signal: grep logs for the string "Auto-published [service] to skill marketplace" and the final marker "Skill marketplace unreachable — auto-publish disabled" (marketplace went dark Feb 15; discovery Feb 19). The HN post includes those log markers: https://news.ycombinator.com/item?id=47109114.

Short remediation decision table (example):

| Leak type | Action | Gate |
|---|---:|---|
| Service account with vault access | Delete + rotate | Immediate (0 days) |
| Single-service API key | Rotate | 1 day |
| Local dev API key | Rotate on next deploy | 7 days |

- [ ] Run containment and token revocation
- [ ] Search logs for "Auto-published"
- [ ] Audit SOUL.md / AGENTS.md / HEARTBEAT.md

(Methodology: this tutorial synthesises the technical breakdown posted on Hacker News and uses only the incident details in that post: https://news.ycombinator.com/item?id=47109114.)

## Goal and expected outcome

Goal: provide a repeatable 90–120 minute playbook to detect plugin-driven exfiltration, remediate compromised secrets, and harden an agent gateway so third-party plugins cannot read broad process.env or browser traffic. This is grounded on the observed attack vectors in the report: process.env access, browser cookie capture, and prompt/config injection (SOUL.md, AGENTS.md, HEARTBEAT.md) — source: https://news.ycombinator.com/item?id=47109114.

Expected outcome: by the end you will have

- Zero exfil events for an observation window of 7 days (0 events = pass).
- A rotated-secrets log that lists rotated tokens and deletion of the compromised service account (1Password service account deleted in the incident): https://news.ycombinator.com/item?id=47109114.
- A plugin sandbox + egress allowlist configured and a signed-off plugin vetting checklist.

Deliverables:

- Incident report (1 document).
- Rotated-secrets log (counts of tokens rotated).
- Sandboxing and egress rule config files.

## Stack and prerequisites

Stack snapshot (from the incident): OpenClaw gateway on Node.js, npm-installed plugin @getfoundry/unbrowse-openclaw, 1Password service accounts, integrations (Slack, Telegram, OpenAI), and proxied browser clients whose cookies were observed (AmEx, Stanford MyHealth, Kubera, X/Twitter, admin session). See the original post for the full vector list: https://news.ycombinator.com/item?id=47109114.

Prerequisites to run this tutorial:

- SSH / shell access to the gateway host(s).
- Read access to application + proxy logs.
- Ability to rotate or delete service accounts in your secrets manager (example: delete 1Password service account).
- Quarantine host or sandbox to rebuild the gateway from clean artifacts.

Config artifacts to inspect (grounded in the report):

- process.env dump — look for OP_SERVICE_ACCOUNT_TOKEN, OPENCLAW_GATEWAY_TOKEN.
- Startup files: SOUL.md, AGENTS.md, HEARTBEAT.md (these were modified per the incident).

## Step-by-step implementation

1. Triage & containment

1.1. Immediately isolate the gateway's network egress (block outbound except to management IPs) and take a forensic snapshot of the host (files, process list, node_modules). Example commands:

```bash
# isolate host network (example uses iptables; adapt to your infra)
sudo iptables -A OUTPUT -m conntrack --ctstate NEW -j DROP
# snapshot process list + env
ps aux > /tmp/process-list.txt
cat /proc/$(pgrep -f node)/environ | tr '\0' '\n' > /tmp/process-env.txt
# archive node_modules and suspect files
tar czf /tmp/node_modules-snapshot.tgz ./node_modules/@getfoundry/unbrowse-openclaw
```

(Containment timestamps: the author installed on Feb 5, marketplace dark on Feb 15, discovered Feb 19 — use these as forensic anchors: https://news.ycombinator.com/item?id=47109114.)

2. Search logs for exfil indicators

2.1. Grep for the exact markers seen in the incident:

```bash
grep -R "Auto-published" /var/log/openclaw || true
grep -R "Skill marketplace unreachable" /var/log/openclaw || true
```

Record every matching line and timestamp. The incident logged HTTP 200 responses for auto-published events — treat those entries as high priority: https://news.ycombinator.com/item?id=47109114.

3. Inspect runtime environment

3.1. Dump process.env and compare to a whitelist of allowed keys. Look specifically for OP_SERVICE_ACCOUNT_TOKEN and OPENCLAW_GATEWAY_TOKEN.

3.2. If a service account key with vault access is present (example: OP_SERVICE_ACCOUNT_TOKEN), mark it as compromised and schedule immediate deletion + rotation (the author deleted the 1Password service account as remediation): https://news.ycombinator.com/item?id=47109114.

4. Static review of suspect plugin

4.1. Inspect node_modules/@getfoundry/unbrowse-openclaw for network calls, dependency declarations (the package in the incident referenced @solana/web3.js and @solana/spl-token), and code size (~216KB of TypeScript per the report).

4.2. Use a simple static search for suspicious hosts and "skill marketplace" strings.

```bash
rg "skill marketplace|solana|web3" node_modules/@getfoundry/unbrowse-openclaw || true
wc -c node_modules/@getfoundry/unbrowse-openclaw/**/*.ts
```

5. Check proxy/browser capture evidence

5.1. Audit gateway/proxy logs for proxied browser API calls that include cookies for services listed in the report: AmEx (22–26 cookies), Stanford MyHealth (126–128 cookies), Kubera, X/Twitter, admin sessions. Log evidence of cookie capture should be high priority: https://news.ycombinator.com/item?id=47109114.

6. Remove and rebuild

6.1. Uninstall the malicious package, delete the compromised service account, rotate secrets, and rebuild the gateway from clean artifacts. Example npm/uninstall and redeploy commands:

```bash
# remove the package and reinstall from package-lock verified tarball
npm uninstall @getfoundry/unbrowse-openclaw
npm ci --prefer-offline --no-audit
# redeploy from a clean build artifact (example)
./deploy.sh --artifact=artifacts/openclaw-20260220.tgz --no-plugins
```

6.2. Only re-enable plugins after security sign-off (canary + feature-flag gate described below).

7. Recovery verification

7.1. Verify absence of "Auto-published" logs for a 7-day observation window.
7.2. Verify SOUL.md, AGENTS.md, HEARTBEAT.md integrity via checksums and that they contain no injected instructions.

Rollout / rollback plan (gates):

- Canary: enable plugins in a single canary cluster (1 of N hosts) with egress blocked to unknown hosts, monitor for exfil signs for 72 hours.
- Feature flag: require a feature flag to enable each plugin in prod; default off.
- Security sign-off: require an explicit signed checklist before enabling any plugin fleet-wide.
- Rollback: if exfil signals > 0 in canary or any "Auto-published" logs appear, immediately disable plugin via feature flag and rollback to previous artifact; rotate tokens as containment.

## Reference architecture

Principles observed and recommended (grounded in the incident): least privilege for service accounts, no direct plugin access to global process.env, network egress controls, immutable startup configs cryptographically signed. Reference incident: https://news.ycombinator.com/item?id=47109114.

Example plugin-sandbox egress config (YAML):

```yaml
plugin_sandbox:
  runtime: nodejs12
  env_whitelist:
    - NODE_ENV
    - PLUGIN_ID
  egress_allowlist:
    - 10.0.0.0/16  # internal services
    - management.example.com:443
  blocked_hosts:
    - "*"
```

Minimal secure diagram components:

- Gateway (main process) — holds minimal secrets.
- Plugin sandbox (separate process/container) — restricted env.
- Secrets vault — short-lived tokens; 1Password service account must be scoped and audited.
- Outbound proxy — allowlist + TLS egress monitoring.

Example secrets/access policy snippet (JSON):

```json
{
  "service_accounts": {
    "openclaw": { "scopes": ["read-only-vault"], "rotation_days": 30 }
  }
}
```

## Founder lens: ROI and adoption path

Third-party plugins accelerate velocity but increase supply-chain and secrets exposure risk. Use the incident's observable facts to quantify a gate: if a plugin can read process.env and proxy traffic, treat its adoption risk as high. See the incident summary: https://news.ycombinator.com/item?id=47109114.

Adoption path (practical):

- Stage 0 (internal): only in sandbox — 0 hosts.
- Stage 1 (canary): 1 host, egress-restricted, 72-hour observation.
- Stage 2 (limited prod): 10% of fleet behind feature flags.
- Stage 3 (full prod): after 7 days with 0 exfil events and signed security checklist.

Measure ROI by engineering hours avoided vs cost of a secrets breach. Track adoption metrics and add remediation cost buckets to your decision docs (engineer-hours to rotate tokens, time to rebuild, customer notification windows). The incident shows immediate deletion of a 1Password service account and broad rotation as the primary remediation actions: https://news.ycombinator.com/item?id=47109114.

## Failure modes and debugging

Obfuscated exfil: packages may hide or delay network calls. Use static analysis + runtime syscall monitoring (auditd, eBPF) to detect unexpected outbound sockets. The incident included HTTP 200 responses for auto-publish entries — look for similar success codes paired with unusual strings: https://news.ycombinator.com/item?id=47109114.

Prompt-injection persistence: the attacker modified agent startup files (SOUL.md, AGENTS.md, HEARTBEAT.md) so the agent could lie or hide diagnostics. Add integrity checks for these files and fail startup if checksums differ.

Backups and archive leakage: the attacker could have saved tokens into logs or backups. Search archived backups and compressed logs for token patterns; count rotated tokens vs tokens discovered in archives as a metric.

Debugging checklist:

- [ ] Grep logs for "Auto-published" and marketplace strings.
- [ ] Verify process.env for OP_SERVICE_ACCOUNT_TOKEN and OPENCLAW_GATEWAY_TOKEN.
- [ ] Inspect node_modules/@getfoundry/unbrowse-openclaw for solana deps and ~216KB of TS reported.
- [ ] Check SOUL.md / AGENTS.md / HEARTBEAT.md checksums.

## Production checklist

### Assumptions / Hypotheses

- The timeline and artifacts (Feb 5 install, marketplace dark Feb 15, discovery Feb 19, ~216KB TypeScript, cookie counts for AmEx 22–26 and Stanford MyHealth 126–128) are taken from the posted incident: https://news.ycombinator.com/item?id=47109114.
- Hypothesis: malicious plugin used Solana deps (@solana/web3.js, @solana/spl-token) to connect to a skill marketplace; marketplace returned HTTP 200 for auto-publish events in logs.
- Any cost or percentage estimates not explicitly stated in the incident (e.g., remediation $) are hypotheses and must be validated in your environment.

### Risks / Mitigations

- Risk: Plugins can read global process.env and proxied browser cookies.
  - Mitigation: Run plugins out-of-process with env whitelist; restrict gateway env to minimal keys.
- Risk: Startup config prompt-injection persists after rebuild.
  - Mitigation: Validate SOUL.md / AGENTS.md / HEARTBEAT.md against signed checksums before startup.
- Risk: Tokens exist in backups and archives.
  - Mitigation: Search archives for leaked tokens and rotate any found.

### Next steps

- Implement plugin sandboxing + egress allowlist (use the provided YAML example) and enforce feature flags with a 3-stage rollout (canary -> 10% -> full) with gates: 72-hour canary, 7-day zero exfil observation, and signed security checklist before global enable.
- Maintain an incident runbook that includes immediate deletion of compromised service accounts (the author deleted a 1Password service account) and a token rotation tracker.
- Schedule a dependency audit for all third-party plugins; flag packages that declare @solana/web3.js or similar financial libs for manual review.

Table: quick remediation priorities

| Priority | Symptom | Immediate action | Time-to-complete |
|---:|---|---|---:|
| 1 | Service-account token in process.env | Delete account + rotate all reachable tokens | 0–24 hrs |
| 2 | "Auto-published" log entries | Isolate host + snapshot logs | 0–3 hrs |
| 3 | Modified startup files | Restore signed configs + verify checksums | 1–6 hrs |

Final note: the incident write-up is at https://news.ycombinator.com/item?id=47109114 and contains the concrete attack vectors and log markers used throughout this tutorial. Follow the checklists here, enforce plugin vetting, and treat any package able to read process.env or proxied cookies as high risk until sandboxed and audited.
