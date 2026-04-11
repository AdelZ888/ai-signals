---
title: "Skilldeck: a local‑first desktop app to centralize and export AI agent skill files"
date: "2026-04-11"
excerpt: "Skilldeck is a local-first desktop app that centralizes AI agent skill files, exports them into tool formats (Claude, Cursor, Copilot and more), and detects drift with two-way sync."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-11-skilldeck-a-localfirst-desktop-app-to-centralize-and-export-ai-agent-skill-files.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "skilldeck"
  - "ai-agents"
  - "developer-tools"
  - "prompt-engineering"
  - "open-source"
  - "local-first"
  - "drift-detection"
  - "sync"
sources:
  - "https://github.com/ali-erfan-dev/skilldeck"
---

## TL;DR in plain English

Skilldeck is described as a desktop app for managing AI agent "skill" files across projects and tools. See the repo: https://github.com/ali-erfan-dev/skilldeck.

What to do, simply:

- Clone the repository. https://github.com/ali-erfan-dev/skilldeck
- Make one local library folder. Put canonical skill files there.
- Export one file into one target project for a smoke test.

Why this helps:

- One source of truth reduces duplicate copies. Edits stay consistent.
- A single export step makes updates easier to roll out.

Quick checklist:

- [ ] clone https://github.com/ali-erfan-dev/skilldeck
- [ ] create one local library folder
- [ ] add one canonical skill file
- [ ] export that file into one target project for a smoke test

Concrete short example: add a rule that masks invoice numbers. Export that rule into a payments repo and run a short smoke test.

## What you will build and why it helps

You will create a small, local "skill library" and a repeatable export step. The repository is described as a desktop app for this purpose: https://github.com/ali-erfan-dev/skilldeck.

Outcome: a workflow that copies or converts skill files from the canonical library into one or more target project folders. This makes audits and updates easier.

Primary benefits (refer to the project description at https://github.com/ali-erfan-dev/skilldeck):

- Centralized edits. One place to edit prompts, rules, or guardrails.
- Fewer stale copies across repositories.
- A repeatable export process that supports small canary rollouts.

Definitions used here:

- "Skill file": a text file that contains a prompt, rule, or small policy the agent uses.
- "Export": the process of copying or converting that skill file into the target project's expected file and format.
- "Canary": a narrow test rollout (e.g., one repo or one branch) before wider release.

## Before you start (time, cost, prerequisites)

Reference repo: https://github.com/ali-erfan-dev/skilldeck.

Time estimate (example): ~45 minutes to perform a first manual export and verify it locally. This estimate should be validated in your environment.

Prerequisites:

- A development machine you control (Windows, macOS, or Linux).
- Git access to the target project(s) and permission to write to a test branch or folder.
- A local backup location for any agent or skill files you will overwrite.

Pre-setup checklist:

- [ ] Confirm you can push to the target branch or write to the target folder.
- [ ] Back up current agent/skill files from the target project.
- [ ] Create a local folder for the canonical library and assign one owner write access.

Methodology note: this guide stays local-first and refers to the repo for UI and scripts: https://github.com/ali-erfan-dev/skilldeck.

## Step-by-step setup and implementation

This minimal path is repeatable. It clones the repo, creates a library, maps a target, exports one file, and runs a smoke test. Keep the first test small: one file, one target.

1) Clone the repo and inspect contents.

```bash
# clone the repo
git clone https://github.com/ali-erfan-dev/skilldeck.git
cd skilldeck
ls -la
```

2) Create a local library folder and add one canonical skill file.

```bash
mkdir -p ~/skilldeck-library
cat > ~/skilldeck-library/01-protect-invoice.md <<'EOF'
# Protect customer invoice numbers
When responding, mask invoice numbers so only the last 4 digits are visible.
EOF
```

3) Create a simple sync-config.json that maps library -> target. Include the repo link in your README: https://github.com/ali-erfan-dev/skilldeck.

```json
{
  "library": "~/skilldeck-library",
  "targets": [
    { "name": "example-project", "path": "../example-project/.skills", "format": "markdown" }
  ],
  "pullPolicy": "manual-review"
}
```

Notes:

- If the repo provides an app or exporter, prefer that. See the project: https://github.com/ali-erfan-dev/skilldeck.
- If no exporter exists, test with a manual copy for the first run.

4) Export one file to the target folder. Use the app UI if present, or copy the file manually:

```bash
cp ~/skilldeck-library/01-protect-invoice.md ../example-project/.skills/
```

5) Run a quick smoke test in the target project. Keep this under 60s for initial verification.

6) If the export looks correct, iterate. Add 1–5 additional skills for the next test.

## Common problems and quick fixes

See the repo for implementation details and any built-in tooling: https://github.com/ali-erfan-dev/skilldeck.

Common issues and quick actions:

| Problem | Likely cause | Quick fix |
|---|---:|---|
| Exported files don't match target format | Bad mapping or format setting | Update sync-config and re-export one file |
| Too many drift alerts | Diff rules too strict | Loosen diff threshold or whitelist headers |
| Accidental overwrites | Auto-pull without approvals | Set pullPolicy to manual-review and require approval |
| Tests fail after export | Export changed runtime inputs | Block auto-pull until smoke tests pass |

Troubleshooting steps:

- Check your mapping in sync-config.json and re-run a single-file export. https://github.com/ali-erfan-dev/skilldeck
- Restore your archived backup if needed.
- Tighten or loosen diff/detection rules depending on noise levels.

Quick decision checklist:

- [ ] Format mismatch: fix mapping, re-export single file.
- [ ] Noisy alerts: adjust diff settings.
- [ ] Accidental overwrite: require manual review and revert if needed.

## First use case for a small team

Repo reference: https://github.com/ali-erfan-dev/skilldeck.

Target audience: solo founders and teams of 1–4 people who need a lightweight, local-first workflow.

Quick plan to get value in 1–2 days:

1. Create a single-owner library folder. Start with 3 canonical files: safety, personal-data masking, and tone. Keep filenames short and add a version line inside each file.
2. Export manually to one target repo or branch. Add a CI job that runs a <60s smoke test. Block merges if the smoke test fails.
3. Maintain daily backups and keep the last 7 commits on a backup branch. If a bad export occurs, revert to the most recent known-good commit within 30 minutes.
4. Require manual-review for pulls into the library to avoid accidental overwrites.
5. Start small: pick 1 high-impact rule, test for 7 days, then expand to 3–5 rules.

Small-team checklist:

- [ ] Create library and assign an owner
- [ ] Add 3 canonical skill files
- [ ] Export to one canary repo and run a smoke test (<60s)
- [ ] Keep daily backups for 7 days

## Technical notes (optional)

- The repository title and description indicate a desktop app for managing AI agent skill files across projects and tools. See: https://github.com/ali-erfan-dev/skilldeck.
- Keep a versioned sync-config alongside your library so mappings are tracked with the library itself.
- If the repo includes scripts or binaries, prefer those over ad-hoc copy commands. Inspect releases and README: https://github.com/ali-erfan-dev/skilldeck.

Example metadata to embed in exported files (YAML):

```yaml
---
skill_id: protect-invoice
version: 1
exported_at_ms: 1712800000000
canary: false
```

Advanced notes (when ready): consider format converters for JSON/YAML targets and track library commit hashes so every export can be traced back.

## What to do next (production checklist)

See the repository for code and UI details: https://github.com/ali-erfan-dev/skilldeck.

### Assumptions / Hypotheses

- The repository at https://github.com/ali-erfan-dev/skilldeck is described as a desktop app for managing AI agent skill files across projects and tools.
- Deployment and automation thresholds below are proposed hypotheses to validate against your environment and any tooling found in the repo.
- Suggested quantitative thresholds to validate:
  - 45 minutes: time to perform a first manual export (estimate).
  - 60s: target smoke-test runtime for quick verification.
  - 3 files: initial canonical set to start with.
  - 1 owner: single owner for the canonical library at first.
  - 7 days: canary observation window before wider rollout.
  - 30 minutes: target rollback time to revert a bad export.
  - 90%: suggested pass-rate threshold for automated merges (example).
  - 5%: example diff threshold to reduce noisy alerts.
  - 2..50: plausible range of target repositories to plan for in early growth.

### Risks / Mitigations

- Risk: accidental overwrite of project files. Mitigation: set pullPolicy=manual-review, keep daily backups on a separate branch for 7 days, and require at least one human approver.
- Risk: alert fatigue from noisy diffs. Mitigation: tune diff thresholds (e.g., 5%) and whitelist harmless metadata changes.
- Risk: regressions after export. Mitigation: block auto-pull until smoke tests pass (target >=90% pass rate) and use a 7-day canary before broad rollout.

### Next steps

- Inspect https://github.com/ali-erfan-dev/skilldeck for available exporters, UI binaries, and sample configs.
- Create 3–5 high-value canonical skill files and run a canary export to one project.
- Add a CI smoke test that runs in <60s and a nightly regression suite that completes in <30 minutes.
- If you share your target repo layout, I can generate a starter sync-config.json and a minimal CI smoke-test script tailored to that layout.
