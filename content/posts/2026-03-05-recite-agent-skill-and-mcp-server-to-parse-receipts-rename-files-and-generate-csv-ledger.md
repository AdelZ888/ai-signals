---
title: "Recite: agent skill and MCP server to parse receipts, rename files and generate CSV ledger"
date: "2026-03-05"
excerpt: "Recite turns a folder of PDF/image receipts into dated filenames and a structured CSV by connecting an agent (OpenClaw/Claude) to its public API or local MCP server. Dry-run recommended."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-05-recite-agent-skill-and-mcp-server-to-parse-receipts-rename-files-and-generate-csv-ledger.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "agent"
  - "agent-skill"
  - "recite"
  - "bookkeeping"
  - "receipt-scanning"
  - "openclaw"
  - "mcp"
  - "vision-ocr"
sources:
  - "https://github.com/rivradev/recite-agent-skill"
---

## TL;DR in plain English

Recite is an AI-powered receipt scanning and bookkeeping "skill" (an add-on) that automates renaming files and writing CSV rows for receipts. The project page is the canonical source: https://github.com/rivradev/recite-agent-skill.

Quick practical steps (first thing to do):

- Clone the repository. See README: https://github.com/rivradev/recite-agent-skill
- Copy a few receipts (PDF, JPG, PNG) into a test folder you control.
- Run a dry-run mode to get the CSV and rename suggestions. Do not apply changes yet.

Concrete example: run a dry-run on 10 receipts in ~/receipts/test. Inspect the CSV to confirm dates, vendor names, and totals. If the CSV rows look correct, you can later enable a guarded apply that archives originals before renaming.

Quick checklist

- [ ] Clone the repository (see README): https://github.com/rivradev/recite-agent-skill
- [ ] Put originals in a test folder you control
- [ ] Run a dry-run and inspect CSV + proposed renames

Methodology note: this guide follows the repository as the source of truth and offers recommended patterns for safe testing and rollout.

## What you will build and why it helps

You will wire the Recite skill into a small local pipeline. The repository describes an "AI-powered receipt scanning & bookkeeping skill" that automates renaming and CSV logging: https://github.com/rivradev/recite-agent-skill.

What the pipeline does, in plain terms:

- Take receipt files (images or PDFs) from an input folder.
- Run the skill to extract fields such as date, vendor, and total.
- Produce a CSV ledger row per receipt and a suggested new filename.

Why this is useful:

- Saves time. It reduces repeated manual data entry.
- Improves consistency. Filenames follow a predictable pattern, which helps search and audits.
- Makes bookkeeping imports easier. A single CSV simplifies getting data into accounting tools.

Reference: https://github.com/rivradev/recite-agent-skill

## Before you start (time, cost, prerequisites)

Minimum prerequisites (repo-backed):

- Git access to the repository: https://github.com/rivradev/recite-agent-skill
- An agent framework that can load skills (the repo lists examples such as OpenClaw/Claude).

Decisions to make before running:

- Pick input and output folders you control (example: ~/receipts/inbox and ~/receipts/out).
- Decide whether to run in dry-run mode first (recommended) or to allow automatic renames now.
- Ensure you have a backup/archive policy for originals before testing any apply/rename behavior.

Estimated time and cost notes:

- Time-to-first-test: plan ~60 minutes to clone, read the README, and run an initial dry-run.
- Costs: if the skill calls external APIs, budget for API usage. Start with a small cap while tuning.

Reference: https://github.com/rivradev/recite-agent-skill

## Step-by-step setup and implementation

Plain-language primer before the advanced steps:

You will: clone the repo, put test receipt files in a folder, register or load the skill into your agent, run the skill in a non-destructive dry-run to see what it would do, then inspect the CSV and rename suggestions. If results are acceptable, enable an apply mode that archives originals first.

1) Clone and inspect the repository

```bash
git clone https://github.com/rivradev/recite-agent-skill.git
cd recite-agent-skill
ls -la
# open README.md and any examples
```

2) Prepare a test folder you control and copy a few receipt PDFs/JPGs/PNGs into it.

3) Load or register the skill with your agent. The repo is the canonical source for the skill: https://github.com/rivradev/recite-agent-skill.

4) Run an initial dry-run. Use your agent's test command or a wrapper script that calls the skill and returns results without modifying files.

Example pseudo-command (replace with your agent's command):

```bash
# example dry-run invocation (adapt to your environment)
recite-run --mode dry --input ~/receipts/test --out ~/receipts/out --log ~/receipts/out/recite.log
```

5) Inspect outputs. Open the generated CSV and check a small set of rows for date, vendor, and total correctness. Review rename suggestions before any apply.

6) If dry-run matches expectations, create a guarded apply config that archives originals before renaming.

Example JSON config (adapt paths and flags to your environment):

```json
{
  "input_folder": "~/receipts/inbox",
  "output_csv": "~/receipts/out/processed.csv",
  "archive_folder": "~/receipts/archive",
  "apply_renames": false
}
```

7) Automate cautiously. Schedule runs at quiet times and notify approvers after each run.

Reference: https://github.com/rivradev/recite-agent-skill

## Common problems and quick fixes

Authentication / registration errors

- Symptom: agent returns 401 or 403 when invoking the skill.
- Quick fix: re-register the skill in the agent UI. Confirm any token or API key used by your agent. Check local permissions and keys.
- See the repo for the skill: https://github.com/rivradev/recite-agent-skill

OCR or extraction issues

- Symptom: wrong dates or mis-read totals.
- Quick fixes:
  - Use original PDFs where possible rather than low-resolution images.
  - Re-scan at higher quality (scan at or above 300 DPI where possible).
  - Run small batches to find patterns before scaling.
  - Keep a fallback filename-parsing regular expression for ambiguous dates.

Unexpected renames or destructive changes

- Symptom: files are renamed differently than expected.
- Quick fixes:
  - Keep apply_renames=false until you have an approval process.
  - Archive originals and test restore procedures.

Rate limits / cost control

- Symptom: slow processing or unexpected charges when the skill calls external APIs.
- Quick fixes:
  - Batch requests and add client-side pauses between calls.
  - Monitor spend and pause automation if costs rise.

Quick monitoring checklist

- [ ] Dry-run pass and CSV inspection
- [ ] Originals archived before any apply
- [ ] Monitoring enabled for CSV outputs

Reference: https://github.com/rivradev/recite-agent-skill

## First use case for a small team

Target audience: solo founders and small teams who need lower-friction bookkeeping. The repository documents the skill and its renaming/CSV behavior: https://github.com/rivradev/recite-agent-skill.

A simple rollout pattern you can follow:

1. Validate the flow in dry-run mode on a small set of receipts (example: 10 items).
2. Keep renames behind an approval gate while confirming mappings.
3. Always copy originals to an archive before applying any rename.
4. Sample processed items regularly (manual QA) to catch any drift in extraction accuracy.
5. Enforce per-run caps and a monthly spending cap during tuning.

Checklist for small teams

- [ ] Dry-run validated
- [ ] Archive policy enabled
- [ ] Manual approval gate in place for renames

Reference: https://github.com/rivradev/recite-agent-skill

## Technical notes (optional)

Repository statement: the README describes an "AI-powered receipt scanning & bookkeeping skill" that "automates renaming and CSV logging": https://github.com/rivradev/recite-agent-skill.

Suggested observability and hardening (practical guidance):

- Emit simple metrics such as processed_count, success_count, and per-item latency (average and max).
- Track extraction accuracy over time with a small labeled sample set.
- Add retry and exponential backoff for transient failures.

Example scheduled run (cron example):

```bash
# crontab: weekly run on Monday at 03:00
0 3 * * 1 /usr/local/bin/recite-run --config ~/recite-config.json >> /var/log/recite/last_run.log 2>&1
```

Reference: https://github.com/rivradev/recite-agent-skill

## What to do next (production checklist)

### Assumptions / Hypotheses

These numbers and thresholds are suggested rollout patterns and tuning guidance. Verify them against your environment and the examples in the repository: https://github.com/rivradev/recite-agent-skill.

- Time-to-first-test: 60 minutes to clone, read README, and run an initial dry-run.
- Tuning window: 1–3 days of light tuning to stabilize patterns.
- Canary sizes: start with 10 receipts, expand to 100 receipts for broader validation.
- Accuracy gates: date >= 95%, amount >= 98% before full rollout.
- Sampling for QA: 5% of processed items or at least 10 items per week for manual review.
- Resource sizing: test host ~1 CPU / 2 GB RAM; canary host ~2 CPUs / 4 GB RAM.
- Image quality baseline: scan at >= 300 DPI where possible.
- Rate limiting: pause 200–500 ms between external API requests or batch by 5 items.
- Cost guard: example monthly cap $50 and per-run cap 100 items while tuning.
- Retention: keep originals archived for 365 days and CSV exports for at least 12 months.

Example CSV schema (you may produce or map to this):

| column    | type               | example                 |
|-----------|--------------------|-------------------------|
| date      | date (YYYY-MM-DD)  | 2026-03-01              |
| vendor    | string             | Acme Coffee             |
| total     | number             | 12.50                   |
| currency  | string             | GBP                     |
| category  | string             | Meals                   |
| file_path | string             | /shared/bookkeeping/2026-03-01_Acme-12.50.pdf |

### Risks / Mitigations

- Risk: OCR or extraction accuracy below tolerance. Mitigation: require manual approval for the first 10 processed receipts and maintain the 5% weekly sample check.
- Risk: accidental destructive rename. Mitigation: keep apply_renames=false by default, archive originals, and require a feature flag to enable renames.
- Risk: cost overrun when using external APIs. Mitigation: set a monthly spending cap (example $50) and enforce per-run item caps (example 100 items).

### Next steps

- Verify the repository README and examples: https://github.com/rivradev/recite-agent-skill
- Run a canary: process 10 receipts in dry-run and inspect CSV plus rename suggestions.
- If canary passes your gates, expand to 100 receipts and enable scheduled automation with guard rails.
- Implement production controls: rotate API keys in a secret manager, enable TLS for endpoints, and set role-based access.

Final rollout checklist

- [ ] Dry-run successful on 10 receipts (canary)
- [ ] Originals archived and restore tested
- [ ] Feature flag for rename tested and toggled
- [ ] Budget cap and rate limits configured
- [ ] Monitoring alerts for accuracy thresholds in place

Repository: https://github.com/rivradev/recite-agent-skill
