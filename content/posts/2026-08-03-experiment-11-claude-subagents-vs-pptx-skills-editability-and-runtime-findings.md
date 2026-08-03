---
title: "Experiment: 11 Claude Subagents vs PPTX Skills — Editability and Runtime Findings"
date: "2026-08-03"
excerpt: "I ran 11 Claude subagents to run 11 PPTX skills on the same 5-slide brief. Many skills rasterize tables/charts; experiment shows which ones produce editable, fast decks."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-03-experiment-11-claude-subagents-vs-pptx-skills-editability-and-runtime-findings.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "pptx"
  - "claude"
  - "anthropic"
  - "agents"
  - "automation"
  - "slides"
  - "tooling"
  - "libreoffice"
sources:
  - "https://www.bulaev.net/p/i-had-11-ai-subagents-test-every"
---

## TL;DR in plain English

- Serge Bulaev ran 11 isolated Claude subagents to build the same 5‑slide investor pitch for Publora (Publora: social publishing API, 10 platforms, $2.99/account). Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Measured totals: 11 subagents, 11 output decks, ~1.3M agent tokens consumed, ~60 minutes wall‑clock for the whole experiment, and one SKILL.md reached ~82,000 tokens. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Main operational problem: many third‑party PPTX skills render tables/charts as flattened images instead of native, editable PPTX objects, blocking quick edits. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Quick rule to apply now (operational gate): require editability >= 7/10 (70%), runtime < 10 minutes for a 5‑slide brief, and 3 consecutive successful sample runs before promoting a skill. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Concrete micro‑scenario: a solo founder in a taxi needs to change one number on slide 4. If the table is an image they cannot edit it; with a native PPTX table they can update the number in under 2 minutes. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Methodology (short): one fixed 5‑slide brief; eleven parallel Claude subagents; each cloned a repo and executed its SKILL.md verbatim; outputs normalized via LibreOffice → PNG for visual review. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## What changed

- Setup summary: one 5‑slide brief, eleven parallel Claude subagents, each following the candidate repo's SKILL.md exactly. Outputs passed through LibreOffice → PNG to make visual comparison deterministic. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Data captured per run: stdout/stderr, exact error strings, screenshots, and numeric scores (1–10) for ease, output quality, editability, and docs. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- One SKILL.md can be very large: example observed ~82,000 tokens, which increases token consumption, cost sensitivity, and runtime variance. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Repro pipeline (short): clone repo → run SKILL.md exactly → capture logs → export via LibreOffice → PNG → visual review. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## Why this matters (for real teams)

- Editability is practical: if a table is a raster image you cannot edit cells, change formatting, or copy rows for last‑minute fixes.
- Predictability and cost: very long SKILL.md files (tens of thousands of tokens) drive token usage and make runtime unpredictable as you scale. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Technical debt: non‑editable outputs force manual post‑processing and slow down quick turnarounds for founders and small teams.
- Lightweight rollout gates you can adopt immediately: editability >= 7/10; runtime < 10 minutes for a 5‑slide brief; 3 consecutive successful runs with no critical errors. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## Concrete example: what this looks like in practice

Scenario: a solo founder is in a taxi on the way to a 09:00 investor pitch. They need to update today's revenue on slide 4 in under 2 minutes.

- Requirement: slide 4 must contain a real table (example: 4 rows × 3 numeric columns) built as a native PPTX table object so numbers can be edited and formatted. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Failure mode observed: several skills flattened the table into an image; the founder cannot edit cells and must rebuild the table manually. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Success mode observed: skills that created native PPTX table objects preserved an editable structure and passed the LibreOffice export for comparison. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Acceptance testing decision table (example columns to record during evaluation):

| Candidate skill | Editability (1–10) | Docs quality (1–10) | Typical runtime (mins) | Known errors / notes |
|---|---:|---:|---:|---|
| Skill A | 8 | 7 | 4 | Builds native PPTX tables; passes export |
| Skill B | 3 | 6 | 12 | Paints tables as images; manual edit required |
| Skill C | 6 | 9 | 7 | Good docs; occasional font differences |

Notes: run each candidate 3 times; target editability >= 7 and runtime < 10 minutes for a 5‑slide brief. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## What small teams and solo founders should do now

Two-step rapid acceptance test (fast):

- Step 1 — Run the candidate skill on your real brief, following SKILL.md exactly and capture stdout/stderr. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Step 2 — Open the resulting PPTX in your target PowerPoint and edit slide 4: change a cell value and verify formatting. Pass/fail.

Three concrete, actionable items for solo founders / small teams:

1. Keep a 1–2 slide manual fallback template you can populate by hand in under 5 minutes if automation fails. Practice doing this once so it takes < 5 minutes on a phone or laptop. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
2. Enforce a simple gate: require editability >= 7/10 and 3 successful runs before promoting a skill. If a SKILL.md exceeds ~20k tokens or runtime > 30 minutes, fork and extract only the minimal steps into a thin wrapper (target < 10k tokens) and re‑test. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
3. Create a one‑page pre‑meeting checklist founders can run in 5–10 minutes: run the skill once, open slide 4, change one cell, confirm fonts and logos. If the edit fails, switch to the manual fallback. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Optional quick automation: add a tiny script that updates a single table cell in PPTX via a lightweight PPTX API so one metric can be swapped in < 2 minutes during transit. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Reference: full experiment notes and screenshots: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## Regional lens (UK)

- Rendering compatibility: the write‑up used LibreOffice → PNG for deterministic visual comparison; corporate PowerPoint on Windows/Mac can render fonts, padding, and table widths differently — validate on your target client. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Procurement and security: treat each third‑party skill as an external supplier. Log where generated PPTX files are stored, who can access them, and whether corporate DLP allows automated external generation. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Quick UK checklist before rollout:

- [ ] Test generated PPTX on corporate PowerPoint (Windows/Mac) and confirm visual parity. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] Verify editable objects remain editable and fonts match corporate templates. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] Confirm storage and access policies meet internal compliance. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## US, UK, FR comparison

- High level: the GitHub ecosystem for PPTX skills is global; the experiment observed similar behaviors across multiple third‑party skills. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- US teams: prioritize CI integration, token/cost monitoring, and speed gates (editability >= 7; runtime < 10 mins) as part of rollout automation. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- UK teams: add corporate PowerPoint compatibility and file‑handling checks as acceptance steps (see Regional lens). Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- FR (France) teams: add localization checks for French labels, date/number formats, and require one localized sample deck to verify wrapping and formatting. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Cross‑region columns to record: editability, token count per run, corporate PowerPoint compatibility, localization support. Use the decision table above to record each metric. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- The published experiment is a single controlled run: 11 subagents, one brief, identical render pipeline (LibreOffice → PNG). Your environment (native PowerPoint, fonts, DLP) may differ. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Hypothesis: reducing SKILL.md length (from tens of thousands of tokens toward < 10k tokens) will lower token consumption and reduce runtime variance. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Assumed thresholds (to be validated in your environment): API latency target 500 ms median (assumption), cost alert at $X per 1k tokens (assumption); move these into site tests before enforcement.

### Risks / Mitigations

- Risk: third‑party skills often "paint" tables/charts as raster images, producing non‑editable artifacts. Mitigation: require an editability test per candidate and enforce editability >= 7/10 before promotion. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Risk: very long SKILL.md files increase token use and runtime. Mitigation: fork and extract the minimal pipeline; set token caps and runtime alerts (example caps: flag > 20k tokens; target < 10k tokens). Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- Risk: rendering differences between LibreOffice and corporate PowerPoint. Mitigation: include final validation on your target PowerPoint build before approving a skill for production. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

### Next steps

This‑week checklist (60–120 minutes per candidate skill):

- [ ] Prepare your real brief (example: a 5‑slide investor pitch). Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] For each candidate: clone the repo and run SKILL.md exactly once; capture stdout/stderr and error messages. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] Export output via your chosen pipeline (LibreOffice → PPTX or native PPTX) and open in your target PowerPoint to attempt edits on slide 4. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] Fill the decision table with scores for editability, docs quality, runtime (mins), token count, and known errors. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] Approve a skill only if editability >= 7 AND 3 consecutive successful runs with no critical errors. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
- [ ] If SKILL.md > 20k tokens or runtime consistently > 10 minutes, extract a minimal wrapper and re‑test to reduce token usage. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Reference: full experiment write‑up and screenshots: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every

Methodology note (short): the author ran 11 isolated Claude subagents, each following SKILL.md verbatim, exporting via LibreOffice → PNG, and scoring outputs 1–10 for ease, quality, editability, and docs. Source: https://www.bulaev.net/p/i-had-11-ai-subagents-test-every
