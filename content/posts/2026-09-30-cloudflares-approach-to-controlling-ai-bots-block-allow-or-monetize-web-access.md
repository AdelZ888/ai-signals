---
title: "Cloudflare’s approach to controlling AI bots: block, allow, or monetize web access"
date: "2026-09-30"
excerpt: "Cloudflare says bots now exceed half of web traffic. This guide explains how site owners can detect AI agents, choose policies, and deploy Cloudflare rules plus tokens to control access."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-30-cloudflares-approach-to-controlling-ai-bots-block-allow-or-monetize-web-access.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "cloudflare"
  - "bots"
  - "ai"
  - "scraping"
  - "web-security"
  - "rate-limiting"
  - "monetization"
  - "web-ops"
sources:
  - "https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising"
---

## TL;DR in plain English

- Cloudflare’s CEO says bots already make up a majority (>50%) of web traffic. Source: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising
- This guide gives a short, practical playbook. It helps you measure bot activity, choose a policy, and deploy protections with Cloudflare plus a small origin-side check.
- Pilot and watch closely. Start small, log first, then increase enforcement.

Quick example scenario

- A small e-commerce site sees product pages scraped every minute by unknown agents. You measure 7 days, identify three hot endpoints, deploy a challenge on those paths, and issue short-lived tokens to trusted partners. Monitor for 72 hours and adjust.

## What you will build and why it helps

You will build a lightweight control plane that detects automated agents and enforces simple policies. It uses Cloudflare features (firewall rules, rate limits, edge logic) plus a tiny origin endpoint that issues and validates short-lived tokens.

Why this helps

- Reduces excessive scraping and load on origin servers. 
- Protects paid or UX-sensitive content. 
- Lets legitimate crawlers and partners access content with minimal friction.

This effort is motivated by Cloudflare’s observation about bot traffic: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

Outputs you will produce

- A short decision table mapping traffic types to actions (allow / challenge / block / paid-access).
- Cloudflare firewall filters and rate-limit rules, staged for rollout.
- A small token endpoint and edge validation to gate paying or trusted crawlers.

Example decision table (concrete):

| Traffic type | Action | Notes |
|---|---:|---|
| Verified search crawlers | Allow | Whitelist IP ranges / user agent (UA) and confirm via Search Console logs |
| Unknown high-volume agents | Challenge | Use CAPTCHA or JavaScript challenge. Log for 24–72 hours |
| Paid partners / crawlers | Allow with token | Issue short-lived token from origin and validate at edge |
| Spike / suspected DDoS | Block or rate-limit | Use strict rules only in canary or emergency mode |

Source: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

## Before you start (time, cost, prerequisites)

Time estimate

- 90 minutes for a single-domain quick pilot (one engineer). 
- 4–8 hours for a cautious rollout across multiple domains.

Cost and plan notes

- Detailed logs and advanced bot controls may require a paid Cloudflare plan. Confirm features and budget before you begin.

Prerequisites

- A Cloudflare account and the domain proxied through Cloudflare.
- An API token with edit scopes for firewall and rate-limit rules.
- Admin access to the origin server to add a small token validation endpoint.
- At least 7 days of traffic data from Cloudflare Analytics or Logpush.

Pre-flight checklist

- [ ] DNS proxied through Cloudflare
- [ ] API token created with edit scope
- [ ] Export of last 7 days of traffic available

Reference: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

## Step-by-step setup and implementation

Plain-language explanation before advanced details

Start by measuring before you act. Logging and a short pilot let you see what is normal. That reduces the chance of blocking good users. Keep rules narrow at first. Use challenge modes (log or CAPTCHA) before hard blocks. Gradually increase enforcement only after you verify effects.

1) Measure baseline

- Export 7 days of Cloudflare analytics or use Logpush. Capture: bot % (daily), requests per minute, top IPs, and top endpoints. Compare 24h peak vs 7-day average.

Example: list zones with the API (replace $CF_TOKEN):

```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[] | {id, name}'
```

Include the Verge link in your notes: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

2) Decide policy

- Create a short decision table (see earlier). Keep rules simple. Focus on the top 10 endpoints by request volume.

3) Configure Cloudflare controls in staged mode

- Add firewall filters and rate-limit objects. Start in logging or challenge mode, not immediate block.

Example firewall JSON body (for Cloudflare API):

```json
{
  "action": "challenge",
  "filter": {"expression": "(http.request.uri.path contains \"/products/\") and cf.threat_score > 10"},
  "description": "Challenge suspicious product scrapers"
}
```

- Use rate limits to protect critical endpoints. Keep enforcement conservative and monitor.

4) Gate paid access

- Implement an origin endpoint that issues short-lived HMAC-signed tokens. HMAC is a hash-based message authentication code (HMAC).
- Validate tokens at the edge (Cloudflare Worker) or at origin.

Example token config (pseudo-YAML):

```yaml
token_ttl_seconds: 300
hmac_key_id: "kp_prod_01"
hmac_algo: "sha256"
```

5) Canary and rollout

- Deploy rules to a small percentage of traffic first.
- Monitor metrics for 24–72 hours before increasing coverage.
- Roll back immediately if key metrics degrade (search traffic, 5xx spikes, or legitimate-user impact).

6) Monitor and iterate

- Use 72 hours of intensive monitoring, then a 14-day reduced cadence. Alert on bot % spikes and error-rate increases.

Source: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

## Common problems and quick fixes

- Problem: You accidentally block search engines.
  - Quick fix: add verified crawler IP ranges and UAs (user agents) to an allowlist. Check Search Console crawl reports for 24–72 hours.

- Problem: High false-positive rate.
  - Quick fix: switch enforcement to challenge mode first. Reduce rule aggressiveness and expand logging for 48–72 hours.

- Problem: Paid-access tokens replayed.
  - Quick fix: shorten token TTL (time to live) and bind tokens to a nonce or client attribute. Rotate HMAC keys regularly and log token usage.

- Problem: Unexpected cost increases after enabling logging.
  - Quick fix: lower log retention (e.g., 7 days) or reduce sampling rate until you validate the rule set.

Reference: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

## First use case for a small team

Target reader: solo founders and small teams (1–3 people) who need fast wins with minimal ops overhead. See context from Cloudflare: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

Actionable steps (minimum 3)

1) Measure and mark the worst 3 endpoints.
   - Export logs for 7 days. Identify the top 3 endpoints by requests and origin cost (CPU or DB).

2) Apply conservative protection to those endpoints.
   - Use Cloudflare firewall in challenge/log mode for the selected endpoints. Keep rules simple and scoped to those paths.

3) Add a minimal token endpoint for trusted partners.
   - Create a tiny origin route that issues short-lived tokens for partners. Require simple onboarding (email + key) before issuing tokens.

4) Monitor a single focused dashboard.
   - Track three metrics only: requests per minute for the endpoints, origin CPU percentage, and errors (4xx/5xx). Check these every 4 hours for the first 72 hours.

Checklist (72-hour small-team runbook):

- [ ] Export 7 days of logs and identify top 3 endpoints
- [ ] Deploy a scoped firewall rule in challenge mode to those endpoints
- [ ] Deploy a minimal token endpoint and issue 3 test tokens
- [ ] Confirm Search Console verifies crawlers (if applicable)
- [ ] Monitor requests/min, origin CPU, and 4xx/5xx for 72 hours

Notes for solo/small teams: keep scope narrow (3 endpoints max). Avoid site-wide blocks. Prefer logging or challenges before hard blocks.

## Technical notes (optional)

- Logging & retention: stream logs to S3 or your SIEM (security information and event management). Retain 7–30 days depending on storage budget.

- Edge validation: Cloudflare Workers can validate tokens with low latency. Typical edge verification is in the 10–30 ms range before forwarding to origin.

- Metrics to track (minimum set): bot traffic % (daily), peak requests/min (1m and 5m windows), challenge pass rate, and legitimate 4xx/5xx rate.

- Tooling snippets: a Worker validating HMAC then forwarding a request is a small function (validate HMAC → check TTL → forward). Keep key material in a secure KV/secret store.

Reference: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

## What to do next (production checklist)

### Assumptions / Hypotheses

- The statement that bots are a majority (>50%) of web traffic comes from the linked Verge interview with Cloudflare’s CEO: https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

- The following numeric values are pragmatic heuristics for pilots and should be tuned for your site:
  - Pilot duration: 90 minutes for a single-domain quick test; 4–8 hours for multi-domain rollouts.
  - Baseline measurement window: 7 days.
  - Example rate-limit starting points: 120 requests/min (per IP), burst allowance 10 requests/sec, block duration 60 seconds.
  - High-volume agent threshold example: 1,000 requests/hour from a single agent.
  - False-positive target for challenges: <0.5% of legitimate users challenged in 24h.
  - Token lifetimes: 5–60 minutes (typical) and can be as short as 60 seconds for high-risk tokens.
  - Canary rollout gates: 1% → 10% → 50% → 100% over staged windows.
  - Monitoring windows: intense first 72 hours, then 14 days of reduced cadence.
  - Edge validation latency estimate: ~10–30 ms.

These heuristics are starting points. Validate them against your logs before enforcing broadly.

### Risks / Mitigations

- Risk: Blocking legitimate users or search crawlers.
  - Mitigation: staged rollout, whitelist verified crawler IPs/UAs, and confirm via Search Console and logs for 24–72h.

- Risk: Paid tokens abused or replayed.
  - Mitigation: short TTLs (60–300s), bind tokens to an IP or client nonce, rotate keys (for example, every 7 days), and monitor token usage.

- Risk: Service or cost spikes after enabling logging or rules.
  - Mitigation: limit log retention (7–30 days), sample logs if necessary, and include an immediate rollback gate when 5xx or 4xx increase by >2% absolute.

- Risk: Missing a dependency (DNS or limited Cloudflare plan).
  - Mitigation: confirm plan features and DNS control before beginning; if not available, engage a contractor or vendor for the pilot.

### Next steps

- Finalize the decision table and document the exact Cloudflare filters to apply.
- Run a 7-day canary on one domain with an engineer on-call for the first 72 hours.
- If you plan to monetize crawler access, draft partner terms and pilot with up to 3 partners for 30 days.

If you want, I can generate a ready-to-import Cloudflare firewall JSON for your zone and a tiny Worker or Node example (5–30 lines) to validate HMAC tokens in your preferred language and key format.
