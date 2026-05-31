---
title: "Compress macOS screenshots and copy compressed images to the clipboard for AI coding UIs"
date: "2026-05-31"
excerpt: "How to use or build mgranados/screenshotter on macOS to compress screenshots and copy the result to the clipboard—reducing upload bytes and token costs when pasting into AI coding UIs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-31-compress-macos-screenshots-and-copy-compressed-images-to-the-clipboard-for-ai-coding-uis.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 20
editorialTemplate: "TUTORIAL"
tags:
  - "macOS"
  - "screenshots"
  - "compression"
  - "clipboard"
  - "ai-agents"
  - "bandwidth"
  - "open-source"
  - "cost-savings"
sources:
  - "https://github.com/mgranados/screenshotter"
---

## TL;DR in plain English

- Get or build the small macOS tool at https://github.com/mgranados/screenshotter. It compresses screenshots and copies the result to the clipboard.
- Run the binary or build it from source, then connect it to one of these: an Automator Quick Action, a Shortcuts action, or a simple folder watcher. Test with 5–10 screenshots and confirm paste behavior.
- Start with one canary user for three days. Aim for most compressed images under 200 KB and an average size reduction of at least 20%. If that looks good, expand to a two-week pilot.

Concrete example (short scenario): a team member takes a screenshot on macOS, the watcher detects the new file, the tool compresses it and replaces the clipboard image. The user pastes into a chat or web form and the upload is faster because the file is smaller.

Reference: https://github.com/mgranados/screenshotter

## What you will build and why it helps

You will obtain or build the small macOS utility in the repository https://github.com/mgranados/screenshotter. The project is a utility that compresses screenshots and copies the compressed image to the clipboard.

Why this helps (concrete):

- Saves upload bytes. Smaller images use less bandwidth on constrained links (for example, when someone is on mobile tethering). 
- Avoids UI/file limits. Large screenshots can hit web form or chat size limits. 
- Faster paste and upload. Smaller files usually upload faster and feel snappier to users.

Decision heuristics (example rules you can apply):

| Trigger (count) | Action | Target / threshold |
|---|---|---:|
| Screenshot > 500 KB | Compress before clipboard | Aim < 200 KB |
| Screenshot ≤ 500 KB | Skip compression | Keep original fidelity |
| Text-heavy image | Use conservative compression | Retain readability for 3–5 screenshots test |

Repo: https://github.com/mgranados/screenshotter

Plain-language explanation before advanced details

This tool runs on macOS. You can run it manually: point it at a screenshot file and it will compress that file and put the compressed image on the clipboard. For convenience, you can connect the tool to a watcher that observes the screenshot folder, or to an Automator/Shortcuts action that you trigger by hotkey. If a screenshot is sensitive, the watcher or wrapper script can skip compression and copy the original instead.

## Before you start (time, cost, prerequisites)

Time estimates:

- 20 minutes if a usable binary is available in the repo or supplied by your build process.
- 30–90 minutes if you need to build locally and test integration.

Cost:

- The tool itself is open source (no cost). You may need one developer hour (or two) to wire automation and test.

Prerequisites:

- A macOS machine with a user account.
- Git installed, or the ability to download the repository. See https://github.com/mgranados/screenshotter.
- Permission to run local scripts and to allow clipboard access when macOS prompts for permission.

Pre-install checklist:

- [ ] macOS machine ready
- [ ] Git or alternative download method
- [ ] Ability to create an Automator Quick Action or Shortcuts automation

Repo: https://github.com/mgranados/screenshotter

## Step-by-step setup and implementation

1) Clone and inspect the repo

```bash
git clone https://github.com/mgranados/screenshotter.git
cd screenshotter
ls -la
# open README.md to confirm build/run instructions
```

Open README.md in the cloned folder and confirm whether the repository includes a ready binary or requires a build. Follow any build instructions there.

2) Build or run the tool

- If the project ships a binary, run it with --help to confirm usage. Example:

```bash
# example check (adjust if binary name differs)
./screenshotter --help
```

- If it requires building, follow the README steps. After building, confirm the executable accepts a file path argument or prints usage with --help.

3) Concrete integration artifacts (one example JSON config + shell wrapper)

Save this JSON as watcher-config.json next to your watcher script. It documents thresholds and the command to run.

```json
{
  "watch_folder": "~/Pictures/Screenshots",
  "max_original_size_bytes": 500000,
  "target_max_bytes": 200000,
  "compress_command": "~/bin/screenshotter",
  "retry_ms": 500
}
```

A minimal wrapper script that reads the JSON and runs the tool (save as ~/bin/screenshotter-watcher.sh):

```bash
#!/usr/bin/env bash
CONFIG="$HOME/screenshotter/watcher-config.json"
WATCH_DIR=$(jq -r .watch_folder <<< "$(cat $CONFIG)")
CMD=$(jq -r .compress_command <<< "$(cat $CONFIG)")
LATEST=$(ls -t "$WATCH_DIR" | head -n1)
FILE="$WATCH_DIR/$LATEST"
# run compress command with the file
"$CMD" "$FILE"
```

Make the script executable:

```bash
chmod +x ~/bin/screenshotter-watcher.sh
```

4) Example watcher (fswatch) to process new screenshots

```bash
# requires fswatch (install via brew). This watches the folder and runs the wrapper.
fswatch -0 ~/Pictures/Screenshots | while read -d "" event; do
  ~/bin/screenshotter-watcher.sh
done
```

This starts a loop that runs your wrapper each time a new file appears in the Screenshots folder.

5) Automator / Quick Action alternative

- Create an Automator Quick Action that runs a shell script.
- The script should call the built binary with the path to the latest screenshot.
- Assign a hotkey in System Settings if desired. Keep testing with one screenshot first.

6) Test the flow

- Take 5–10 screenshots. Verify compressed sizes using ls -l or Finder > Get Info.
- Targets: most compressed images < 200 KB and average reduction ≥20%.

Repo: https://github.com/mgranados/screenshotter

## Common problems and quick fixes

- Binary won't run: check permissions with chmod +x and run from Terminal to capture stderr. Rebuild if required. See README in https://github.com/mgranados/screenshotter for build notes.
- Clipboard not updated: macOS may require you to grant clipboard or automation permissions. Open System Settings when macOS prompts and allow access. Run the tool from Terminal to see error messages.
- Hotkey conflicts: check System Settings > Keyboard > Shortcuts and adjust Automator or Shortcuts bindings.
- Crash while compressing: run the tool manually and inspect stderr. Check the repository issue list at https://github.com/mgranados/screenshotter/issues for similar reports.

Quick troubleshooting checklist:

- [ ] Run the tool from Terminal and capture output
- [ ] Confirm macOS privacy prompts and grant permissions
- [ ] Verify hotkey or Automator bindings are enabled

Repo: https://github.com/mgranados/screenshotter

## First use case for a small team

Audience: solo founders and very small teams (1–3 people).

Steps to roll out quickly:

1) Canary (1 user, 3 days)
- Install the tool locally. Create an alternate hotkey or use a watcher. Keep the default screenshot hotkey unchanged.
- Collect 5–10 screenshots and measure sizes before and after. Aim for ≥20% reduction.

2) Short pilot (1–3 people, 14 days)
- Expand to a couple of team members. Each user supplies 5–10 sample screenshots. Confirm no more than one critical readability complaint.
- Acceptance gate: ≥20% average size reduction across pilot samples.

3) Rollback plan (24 hours)
- If a critical issue appears, remove the Quick Action or disable the watcher within 24 hours.

Wrapper example (simple opt-out) — put next to the binary:

```bash
#!/bin/bash
FILE="$1"
# basic opt-out by filename pattern
if [[ "$FILE" == *"sensitive"* ]]; then
  pbcopy < "$FILE"
  exit 0
fi
~/bin/screenshotter "$FILE"
```

Repo: https://github.com/mgranados/screenshotter

## Technical notes (optional)

- The repository describes a macOS utility that compresses screenshots and copies the compressed image to the clipboard. See README: https://github.com/mgranados/screenshotter.
- Before running third-party binaries, inspect repository files and README to confirm how the tool is invoked and whether build steps are required.

Methodology note: this guide assumes the repo provides either a runnable executable or clear build instructions. Confirm those details in the project README at https://github.com/mgranados/screenshotter before proceeding.

Repo: https://github.com/mgranados/screenshotter

## What to do next (production checklist)

### Assumptions / Hypotheses

- The upstream repo supplies either a runnable executable or clear build instructions: https://github.com/mgranados/screenshotter.
- Time to install and validate locally: ~20 minutes if a ready binary exists; ~30–90 minutes if a local build is required.
- Pilot sizing: 1 canary user for 3 days, pilot of 14 days with 1–3 people, and a longer 30-day monitoring window on rollout.
- Pilot numeric targets to validate: target compressed image < 200 KB, average reduction ≥20%, sample size 5–10 screenshots per user.

### Risks / Mitigations

- Risk: loss of readability on text-heavy screenshots. Mitigation: use a conservative compression profile and test with 3–5 real screenshots before wider rollout.
- Risk: macOS privacy prompts block clipboard access. Mitigation: document the permission steps and include a manual copy fallback in the wrapper.
- Risk: accidental processing of sensitive screenshots. Mitigation: add filename or folder exclusion rules and an opt-out wrapper.

### Next steps

- Run a 3-day canary with one user. Collect 5–10 screenshot pairs and measure size reduction with ls -l.
- If canary passes, run a 14-day pilot with 1–3 users and aim for ≥20% average reduction.
- Create a one-page install and rollback guide that references https://github.com/mgranados/screenshotter and lists permission steps, target thresholds (200 KB, 20%), and a 24-hour rollback time.

Rollout quick metrics table

| Phase | Duration (days) | Success gate |
|---|---:|---:|
| Canary | 3 | No blocking bug reported |
| Pilot | 14 | ≥20% avg size reduction |
| Org rollout | 30 | Monitor for regressions |

Repository and issues: https://github.com/mgranados/screenshotter
