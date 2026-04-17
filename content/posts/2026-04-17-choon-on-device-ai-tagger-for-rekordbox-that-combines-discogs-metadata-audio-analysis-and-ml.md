---
title: "Choon: on-device AI tagger for Rekordbox that combines Discogs metadata, audio analysis and ML"
date: "2026-04-17"
excerpt: "Choon auto-tags Rekordbox libraries by combining Discogs-backed metadata lookups, local audio DSP and small ML models. Privacy-first: audio never leaves your Mac."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-17-choon-on-device-ai-tagger-for-rekordbox-that-combines-discogs-metadata-audio-analysis-and-ml.jpg"
region: "UK"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "music-tech"
  - "DSP"
  - "ML"
  - "Rekordbox"
  - "metadata"
  - "Discogs"
  - "LLM"
sources:
  - "https://choon.app"
---

## TL;DR in plain English

- What this is: a short, practical plan to auto-tag a Rekordbox music library using Choon's workflow. Choon advertises auto-tagging for genre (50+ sub-genres), region, era (decade), and vibe, plus Rekordbox sync and metadata-only processing: https://choon.app.
- Why it helps: consistent tags let you filter and find the right record in seconds during a set instead of scrolling.
- How to start: run a small, local test (Choon advertises a free 100-track start), inspect results, then expand if you are happy: https://choon.app.

Quick starter checklist

- [ ] Back up your Rekordbox export (XML or CSV).
- [ ] Prepare a 100-track sample on the Mac you will use.
- [ ] Confirm metadata-only, local processing per the product page: https://choon.app.

Goals to keep in mind (high level)

- Canary size shown on the site: 100 tracks.
- Tag dimensions: genre (50+ sub-genres), region, era (decade), vibe: https://choon.app.
- Many libraries tag quickly; Choon notes many finish in under an hour: https://choon.app.

Concrete short scenario

You are two songs into a locked room and hear a four-bar R&B loop you know is in your collection. With consistent sub-genre, region, era, and vibe tags you can filter Rekordbox and find the track in seconds instead of scrolling. See the product page for the feature set: https://choon.app.

## What you will build and why it helps

You will build a simple, local tagging workflow that produces suggested tags for each track and lets a human approve before writing to Rekordbox. Core outputs are a preview CSV of suggested tags and a mapping file to Rekordbox My Tag slots. All core claims below match the product page: https://choon.app.

What you get (simple list)

- Auto-suggested tags for genre (including 50+ sub-genres), region, era (decade), and vibe: https://choon.app.
- Local, metadata-only processing so audio files remain on your Mac: https://choon.app.
- A review step so you control what gets written; Choon says it writes to dedicated fields and preserves cue points and playlists: https://choon.app.

Why it helps (plain language)

- Faster finds: precise tags reduce search time during a set.
- Safer changes: preview and human approval avoid accidental overwrites.
- Privacy: metadata-only processing keeps audio on your machine.

Quick comparison (decision table)

| What it helps with | Choon claim (source) | Notes |
|---|---:|---|
| Sub-genre detail | 50+ sub-genres | Better filtering for specific vibes: https://choon.app |
| Privacy | Metadata-only, local metadata processing | Keeps audio on your Mac: https://choon.app |
| Rekordbox sync | Automatic sync to Rekordbox | Write approved tags into Rekordbox: https://choon.app |

## Before you start (time, cost, prerequisites)

This section keeps things practical and short. See the product page for feature claims: https://choon.app.

Time & quick note

- Start with the free 100-track test Choon advertises to see how tags look: https://choon.app.
- The site says many libraries tag quickly and many finish in under an hour; use that as an informal baseline: https://choon.app.

Cost

- Choon lists a free start (100 tracks) on the product page: https://choon.app. If you later choose paid tools or cloud compute, factor those costs into your plan.

Prerequisites (minimal)

- A Mac with your Rekordbox library and Rekordbox installed.
- A preserved export of your Rekordbox metadata (XML or CSV) so you can restore if needed.
- A spreadsheet app to review preview CSVs.

A small, practical readiness table

| Item | Why it matters |
|---|---|
| Rekordbox export (XML/CSV) | Restore point if you need to roll back |
| 100-track sample | Quick canary to check quality (site shows a 100-track free start) |
| Spreadsheet app | Fast human review of preview_tags.csv |

## Step-by-step setup and implementation

The steps below use only local, metadata-first actions. The product page describing metadata processing and Rekordbox sync is here: https://choon.app.

1) Backup and pick your canary

- Export Rekordbox metadata (XML or CSV) and keep a safe copy.
- Copy a 100-track sample to the Mac you will use.

2) Produce suggested tags (preview)

- Run the tagger in a preview mode that writes only to a CSV (preview_tags.csv). Confirm the tool operates metadata-only as documented: https://choon.app.

3) Human review

- Open preview_tags.csv in a spreadsheet and review suggested tags. Accept, edit, or reject as appropriate. Preserve original metadata fields.

4) Canary write

- After review, write the approved suggestions back to Rekordbox for the 100-track canary and verify in the Rekordbox app.

5) Rollout (only after canary looks good)

- If the canary is acceptable, repeat in larger batches per your comfort level.

Example local command (replace with your tool)

```bash
# Example: run the tagger in local preview mode on a 100-track folder
./choon-tagger --input /Volumes/LibrarySample --sample 100 \
  --mode preview --out preview_tags.csv --privacy local-only
open preview_tags.csv
```

Example simple mapping config

```yaml
# rekordbox_mapping.yml
rekordbox_my_tag_1: genre
rekordbox_my_tag_2: sub_genre
rekordbox_my_tag_3: era
rekordbox_my_tag_4: region
```

Verify in Rekordbox and on hardware if needed. Double-check that cue points, playlists, and hot cues were not changed — Choon states it writes to dedicated fields and preserves those items: https://choon.app.

## Common problems and quick fixes

Each item below references the local, metadata-first approach and the product page: https://choon.app.

Slow preview runs

- Quick check: is your preview process reading and re-writing large files? Use a single 100-track pass first.
- Quick fix: cache intermediate metadata and retry only changed records.

Unexpected Rekordbox changes

- Quick check: did you write to the wrong fields? Choon says it writes to dedicated fields; map carefully before writing: https://choon.app.
- Quick fix: restore the Rekordbox export if the write affected playlists or cue points.

Tags look wrong

- Quick check: inspect the provenance column in preview_tags.csv to see which data the suggestion came from.
- Quick fix: edit low-confidence suggestions in the CSV and re-run a canary write.

Small helper script (example)

```bash
# Simple CSV filter to show low-confidence suggestions
python3 filter_low_confidence.py --in preview_tags.csv --out low_confidence.csv --threshold 0.6
```

## First use case for a small team

This plan fits a solo operator or a 2–3 person team. Keep the routine short and human-led.

Operational routine (simple)

1) Run the 100-track canary overnight and produce preview_tags.csv. Use the free start shown on https://choon.app.
2) One reviewer spends 30–60 minutes on the randomized 100-sample and marks edits.
3) If edits are low, proceed to a larger batch; if edits are high, adjust rules and re-run.

What to track (simple metrics)

- Per-batch edit rate (percent of tracks changed by a human).
- Canary completion time (wall-clock minutes per 100 tracks).
- Pass/fail boolean for the canary review.

Example schedule for a 2–3 person team

- Friday night: run the 100-track canary.
- Saturday morning: review 100 tracks (30–60 minutes).
- Sunday: roll out larger batches if canary passes.

Reference for features and privacy: https://choon.app.

## Technical notes (optional)

Move into details only once you need them. Refer to the product page for core feature claims: https://choon.app.

Tag schema and fields

- Dimensions: genre (50+ sub-genres), region, era (decade), vibe as listed on the product page: https://choon.app.
- Mapping file: use a JSON/YAML file to map suggestions into Rekordbox My Tag slots.

Acronyms and short definitions

- DSP = digital signal processing. Define before you use it in scripts or logs.
- CSV = comma-separated values; used for preview files.

Example advanced command (developer mode)

```bash
# Developer: run with debug logging and write a dry-run mapping
./choon-tagger --input /Volumes/Library --dry-run --debug \
  --out debug_preview.csv --map rekordbox_mapping.json
```

Short methodology note: the steps above are a practical pattern. Pick concrete tools and versions when you implement, and keep a Rekordbox export as a restore point.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: Choon provides auto-tagging for genre (50+ sub-genres), region, era, and vibe and supports Rekordbox sync and metadata-only processing as described on the product page: https://choon.app.
- Assumption: you will run tagging locally on a Mac and use a Rekordbox export/import flow for writes.
- Hypothesis: a 100-track canary will reveal the majority of common tagging issues for typical collections.
- Hypothesis: the following operational thresholds are useful starting points (tune them for your library):
  - Canary size: 100 tracks.
  - Next batch size: 500 tracks.
  - Large-run guidance: 1,000 tracks per day as a rollout target for a small team.
  - Confidence thresholds: genre_confidence_threshold = 0.75, vibe_manual_review_threshold = 0.6.
  - Human edit rollback trigger: edits > 10% in a canary.
  - Performance alert: median tagging time > 2 s/track.
  - Audio resampling parameter often used in feature extraction: 44.1 kHz (if you extract audio features locally).

(These numbers are operational hypotheses to tune; if you implement additional feature extraction or cloud compute, adjust costs and timings accordingly.)

### Risks / Mitigations

- Risk: incorrect tags written at scale. Mitigation: require a preview CSV review and gate writes behind a canary and a feature flag; rollback if edits exceed the rollback trigger.
- Risk: Rekordbox write errors affecting playlists or cue points. Mitigation: always back up the Rekordbox export and test canary writes to validate the mapping before full rollout.
- Risk: pipeline slowdowns. Mitigation: cache intermediate metadata, parallelize batch processing, and monitor median tagging time vs. the 2 s/track alert.
- Risk: high manual workload for low-confidence vibes. Mitigation: queue low-confidence vibes for human review and prioritize higher-confidence fields for automated writes.

### Next steps

1. Run a 100-track canary and produce preview_tags.csv. Target: complete within 60 minutes for an initial test.
2. Human QA: review 100 random tracks (30–60 minutes). If edits exceed your rollback trigger (for example, 10%), adjust thresholds (for example, genre_confidence_threshold = 0.75) and re-run the canary.
3. If the canary passes, roll out in larger batches (example next batch: 500 tracks) behind a feature flag and monitor edit rate and latency.
4. Automate rollback and alerts: trigger rollback if human edits exceed the threshold or if median tagging time exceeds your performance alert.
5. Document the privacy configuration, the mapping file, and the review workflow for your team. Keep the Choon product page handy for feature references: https://choon.app.

Good luck. This plan gets a small team from zero to a privacy-first, Rekordbox-ready tagging workflow with a focused 100-track canary and a clear review gate.
