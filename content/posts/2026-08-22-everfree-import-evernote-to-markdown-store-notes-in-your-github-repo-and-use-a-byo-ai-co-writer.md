---
title: "EverFree: import Evernote to Markdown, store notes in your GitHub repo, and use a BYO AI co-writer"
date: "2026-08-22"
excerpt: "EverFree imports Evernote notebooks to Markdown, stores notes as commits in a GitHub repo you control, and includes a BYO-key AI co-writer plus an MCP agent server."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-22-everfree-import-evernote-to-markdown-store-notes-in-your-github-repo-and-use-a-byo-ai-co-writer.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "everfree"
  - "evernote-migration"
  - "github"
  - "notes"
  - "ai-cowriter"
  - "open-source"
  - "BYO-key"
  - "sync"
sources:
  - "https://everfree.vercel.app/"
---

## TL;DR in plain English

- EverFree is a free, open-source note app that stores notes as plain Markdown files in a GitHub repo you control. See the product homepage: https://everfree.vercel.app/.
- It runs on Mac (DMG), in the browser, and on mobile; the app advertises a single synced workspace across platforms (https://everfree.vercel.app/).
- Each save is recorded as a git commit in your repo; the site repeatedly states “every save is a commit” and “notes stored in own github repo” (https://everfree.vercel.app/).
- The editor includes an inline AI assistant that uses a model key you supply (bring-your-own key / BYO key) so model usage is billed to your account (https://everfree.vercel.app/).
- The Mac app ships an MCP server for agent integrations; agents that speak MCP can search notes and — with appropriate configuration — write back to them (https://everfree.vercel.app/).

Plain-language summary: EverFree gives you a file-first note workspace (Markdown in your GitHub repo), editors on Mac/web/mobile, an embedded BYO AI assistant, and an MCP server for agents (https://everfree.vercel.app/).

## What changed

- File-first export: EverFree converts Evernote notebooks into plain Markdown files as part of import (“Import your Evernote notebooks as Markdown”) (https://everfree.vercel.app/).
- Git-backed sync: the product advertises that every save becomes a git commit in your repo, giving diffs and history you control (https://everfree.vercel.app/).
- Multi-platform packaging: the product page lists a Mac DMG, a web editor, and mobile capture that share the same workspace (https://everfree.vercel.app/).
- BYO AI and agent support: the editor runs an inline assistant using a key you provide, and the Mac app includes an MCP server to enable agent search/write-back patterns (https://everfree.vercel.app/).

## Why this matters (for real teams)

- Ownership: notes are ordinary files in a repo you control; you can clone, back up, or migrate them using standard Git tools (https://everfree.vercel.app/).
- Auditability: git commits create a readable history and diffs, which supports lightweight reviews and rollbacks compared with opaque vendor stores (https://everfree.vercel.app/).
- Cost control: EverFree advertises “Free forever” and positions model usage as billed to the key-holder, so the app itself is $0 while model costs sit on your account (https://everfree.vercel.app/).
- Operational tradeoffs: shifting to file-first sync reduces vendor lock-in but increases responsibility for repo access, secret handling, and governance of any BYO AI keys or agent write-back (https://everfree.vercel.app/).

## Concrete example: what this looks like in practice

Scenario: a founder moves one Evernote notebook into a Git-backed EverFree workspace and tests the inline AI.

1. Create a private GitHub repository (keep it private by default).
2. Open EverFree on Mac or the web editor and confirm the same workspace appears on both devices (https://everfree.vercel.app/).
3. Import one Evernote notebook. EverFree converts notes to Markdown and commits them to your repo — verify file structure and that saves map to git commits (https://everfree.vercel.app/).
4. Configure a BYO AI key in app settings; use the inline assistant to tighten or continue a paragraph.
5. If you want agents, run them against the MCP server in read-only mode first; only enable write-back after validation.

Quick feature table (claims taken from the product homepage):

| Feature | What EverFree advertises |
|---|---|
| Evernote import | Converts notebooks to Markdown (https://everfree.vercel.app/) |
| Storage model | Plain files in your GitHub repo; every save is a commit |
| Platforms | Mac (DMG), web editor, mobile capture |
| AI | Inline assistant; BYO model key |
| Agents | Mac app ships an MCP server for agent search/write-back |

## What small teams and solo founders should do now

For a solo founder or a small team (1–5 people), follow these concrete steps to validate EverFree safely and cheaply:

- Step 1 — scoped import and inspection: import a single Evernote notebook (1 notebook) into a private repo. Inspect the Markdown files, confirm at least one commit per save, and check that content fidelity meets your needs before importing more (https://everfree.vercel.app/).

- Step 2 — secure your BYO AI key: never commit keys to Git. Store the key in a local encrypted store, a password manager, or GitHub Secrets (for CI). Add a pre-commit hook or use secrets-scanning to block accidental commits of keys (https://everfree.vercel.app/).

- Step 3 — agent safety and gating: run the MCP server in read-only mode for an initial pilot. Allow up to 3 team members to review agent queries and responses before enabling any automatic write-back; require a human approval workflow for the first 50 automated edits (https://everfree.vercel.app/).

- Operational tips (quick):
  - Limit collaborators to the minimum — start with 1 owner + up to 2 reviewers (3 people).  
  - Keep the repo private and enable branch protection if you plan to allow multiple editors.  
  - Back up your repo with a local clone and document a rollback command (for example, git reset --hard <commit>) in your README (https://everfree.vercel.app/).

These steps map to features called out on the homepage: Evernote-to-Markdown import, git-backed saves, BYO AI key, and an MCP server (https://everfree.vercel.app/).

## Regional lens (UK)

- Treat the GitHub repo and any model inputs as potential personal data if notes include PII; the product page shows notes are files in your repo, so repository contents should be assessed under UK GDPR (https://everfree.vercel.app/).
- Use private repos, minimize collaborators (start with 1–3 people), and document lawful basis and retention for any personal data processed by model calls that use your BYO key (https://everfree.vercel.app/).
- Avoid committing sensitive PII in plain text. If necessary, apply client-side encryption before import or store high-sensitivity items outside the repo (https://everfree.vercel.app/).

## US, UK, FR comparison

| Jurisdiction | Main concern | Minimum controls |
|---|---:|---|
| US | Sector/state rules (e.g., healthcare, finance) | Private repo + key secrecy; audit via git commits (https://everfree.vercel.app/) |
| UK | UK GDPR and data subject rights | Private repo, documented legal basis, minimize PII sent to external models (https://everfree.vercel.app/) |
| FR | CNIL emphasis on protection and logging | Private repo, strong access logging, avoid storing sensitive PII in plain files (https://everfree.vercel.app/) |

Common controls: do not commit secrets, keep repos private by default, and use commit history as an audit trail (https://everfree.vercel.app/).

## Technical notes + this-week checklist

Short product facts taken from the homepage snapshot: EverFree converts Evernote notebooks to Markdown, syncs as git commits, ships a Mac DMG, provides a web editor and mobile capture, exposes an inline AI assistant, and includes an MCP server for agent integrations (https://everfree.vercel.app/).

This-week checklist

- [ ] Import one Evernote notebook into a private repo. Verify Markdown fidelity and confirm commit history (https://everfree.vercel.app/).
- [ ] Configure your BYO AI key in a secure local store or secrets manager. Run simple prompts and validate outputs.
- [ ] Test the MCP server in read-only mode; review agent queries before allowing write-back (https://everfree.vercel.app/).

### Assumptions / Hypotheses

- Pricing: the core app is advertised as $0 / “Free forever” on the homepage; model costs are billed to the key-holder (https://everfree.vercel.app/).
- Pilot gates to validate (operational hypotheses): pilot length = 2 weeks; rollback gate = revert after first 50 automatic commits; import accuracy target = 95% content fidelity.
- Performance / cost hypotheses to test: target UI latency <500 ms for typical edits; plan a token budget of 10,000–50,000 tokens during a 2-week pilot; model spend estimate $5–$50 during initial testing depending on prompts and model chosen.

(Methodology: product claims above are taken from the EverFree homepage snapshot at https://everfree.vercel.app/.)

### Risks / Mitigations

- Risk: committing API keys or secrets. Mitigation: use pre-commit hooks, secrets scanning, and store keys in GitHub Secrets or a local encrypted vault.
- Risk: agents making unwanted edits. Mitigation: keep MCP write disabled until agents pass a read-only pilot; require human approval for automated commits and cap automated edits to 50 before review.
- Risk: sensitive PII stored in repo files. Mitigation: identify PII before import, use client-side encryption for high-sensitivity notes, and limit collaborators during pilot.

### Next steps

- [ ] Run a scoped import: pick one Evernote notebook, import it into a private repo, and inspect Markdown fidelity and git commit history (https://everfree.vercel.app/).
- [ ] Configure your BYO AI key in a secure store and run simple prompts in the UI to validate output quality.
- [ ] Test the MCP server in read-only mode and inspect agent queries before allowing write-back.

Reference: EverFree product homepage and feature summary — https://everfree.vercel.app/.
