---
title: "Rewrite Text — iOS app that rewrites, summarizes and extracts key points locally with Apple Foundation Models"
date: "2026-02-26"
excerpt: "A privacy-first iOS app demo that rewrites, summarizes, and extracts key points entirely on device using Apple Foundation Models. Includes SwiftUI app and Share extension that work offline."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-26-rewrite-text-ios-app-that-rewrites-summarizes-and-extracts-key-points-locally-with-apple-foundation-models.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "ios"
  - "on-device-ai"
  - "foundation-models"
  - "swiftui"
  - "share-extension"
  - "privacy"
  - "apple-intelligence"
sources:
  - "https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519"
---

## TL;DR in plain English

- What changed / why it matters / what to do:
  - Rewrite Text is an iOS app that rewrites, summarizes, and extracts key points entirely on the device. It uses Apple Intelligence and on‑device Foundation Models. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
  - The app offers a Share extension so you can transform selected text from Safari, Mail, Notes and other apps without leaving the app you are using. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
  - A practical way to reproduce this behavior is to build a small SwiftUI app plus a Share extension that runs inference locally. Start with one mode — for example: Extract Key Points — and expand later. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

- Quick concrete example: share a 1,200‑word note into the extension, choose "Extract Key Points," and get an editable list of bullets back. You can copy or share those bullets immediately. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

Methodology note: platform and privacy claims below are taken from the App Store listing. Operational numbers (latency targets, pilot sizes, cache sizes) are planning heuristics and are marked as such later. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

## What you will build and why it helps

You will build a small SwiftUI iOS app plus a Share extension that accepts selected text and runs on‑device transforms: rewrite, paraphrase, summarize, and extract key points. The App Store listing explicitly notes on‑device processing and a Share extension. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

Why this helps:
- Privacy-first: text stays on the device, reducing external exposure. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
- Lower operational cost: no per-request cloud fees for typical use.
- Smooth workflow: the Share extension integrates directly with other iOS apps so users can transform text in place. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

Decision table (user need → suggested mode → primary output):

| User need | Suggested mode | Primary output |
|---|---:|---|
| Long article distill | Summarize | 5–8 bullet summary (editable)
| Email polish | Rewrite | 1 revised paragraph
| Meeting notes → shareable | Extract key points | 5 bullets for sharing
| Short social post | Tweet-ready | 1–2 candidate messages

Reference: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519

## Before you start (time, cost, prerequisites)

- Platform targets in the listing: iPhone, iPad, Mac, Vision, Watch, TV. Use this to set which targets you will support first. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

- Minimum prerequisites:
  - A Mac with Xcode to build the app and extension.
  - At least one iOS device for testing the Share extension.
  - An Apple Developer account to publish (example fee: $99/year). (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

- Time and cost heuristics (planning):
  - Prototype scaffold: ~4–6 hours.
  - Pilot release: ~1 week with 3–10 users.
  - Local history: keep up to 50 entries as a default cache.
  - Example binary size shown on the App Store listing: 6.9 MB. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

- Quick preflight checklist:
  - Confirm which OS versions and devices you will support.
  - Install Xcode and register test devices.
  - Review App Store metadata and privacy wording for on‑device claims. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

Plain-language explanation before the advanced details

On-device inference means the language model runs on the user's device instead of on a remote server. This reduces network use and keeps text local. A Share extension is a small piece of your app that appears in the iOS share sheet. It receives the selected text, runs the chosen transform, and returns editable output or copies it to the clipboard. Keep the extension tasks short: move long jobs to the main app.

## Step-by-step setup and implementation

1. Create the app + Share extension skeleton.
   - In Xcode, add a SwiftUI app target and a Share extension target configured to accept text. The listing mentions Share extension support. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

2. Minimal UI and modes.
   - Mode picker: Rewrite / Summarize / Extract Key Points / Tweet‑ready.
   - Input: an editable preview of the selected text.
   - Output: an editable result area, plus Copy and Share buttons.

3. Prompt templates and config.
   - Keep prompt templates in a versioned JSON file for easy updates and auditing.

```json
{
  "rewrite_professional": "Rewrite in a professional tone in 1 paragraph:\n\n{{input}}",
  "summarize_short": "Summarize into 5 bullets:\n\n{{input}}",
  "extract_key_points": "Return up to 5 key points as bullets:\n\n{{input}}"
}
```

4. On‑device inference.
   - Use the platform APIs that run on‑device Foundation Models. The listing states it "Uses on‑device AI language models" and is "Built with iOS Foundation Models." (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
   - Example model settings for planning: temperature 0.7, max_tokens 512, target 5 bullets.

```yaml
model:
  preferred_runtime: auto
  temperature: 0.7
  max_tokens: 512
prompts_file: prompt_templates.json
cache:
  max_history: 50
```

5. Extension flow.
   - Read selected text using NSItemProvider.
   - If input length exceeds a context threshold (example: 80% of model context), auto‑summarize first or prompt the user to trim.
   - Return results in the extension UI or copy to clipboard.
   - Offer an "Open in app" button to handle longer or slower jobs in the main app.

6. Rollout and rollback plan (canary, gates, rollback).
   - Canary: release to a small TestFlight group (10–50 testers) for the first 1–2 weeks.
   - Gates: verify median latency < 3s and 95th percentile < 7s, crash rate < 1%, and user satisfaction >= 4/5 before a full rollout.
   - Rollback: if crash rate > 3% or a privacy audit finds unexpected network calls, remove the build from TestFlight/App Store and issue a hotfix within 24–48 hours.
   - Monitoring: collect opt‑in metrics: successful transforms, extension failures, and satisfaction (1–5). Check these daily during rollout.

7. UX polish and caching.
   - Prewarm the model at app launch to reduce cold-start latency by ~200–800 ms.
   - Cache results up to 50 entries locally to make repeat requests fast and offline-friendly.

Reference: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519

## Common problems and quick fixes

- Share extension times out or is slow
  - Keep prompts short. For long input, hand off processing to the main app via "Open in app".
  - Prewarm the model at app launch to cut cold-start time.

- Truncated context or missing sentences
  - If input is larger than the model context, auto‑summarize first or show a trimming prompt to the user.

- Unexpected network traffic or privacy concerns
  - Audit the extension and app entitlements. Remove any unnecessary network SDKs from the extension target. Make any cloud fallback explicit and opt‑in. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

- Model memory or load failures on older devices
  - Detect device capability at runtime. Fall back to a smaller model, shorter prompt templates, or a simple regex-based simplifier when memory is low.

Reference: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519

## First use case for a small team

Actionable steps for a solo founder or a 2–3 person team (concrete tasks): (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

1) Ship a focused MVP in one sprint (4–6 hours for scaffold)
   - Implement a single Share extension mode: "Extract Key Points" that returns up to 5 bullets.
   - Validate with 3–5 colleagues. Each colleague should run 5 notes (target 15–25 trials).

2) Own prompts and privacy text
   - Keep prompt templates in source control and show the exact prompt wording in the app settings.
   - Publish the on‑device claim clearly in App Store metadata. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

3) Run a tight pilot and telemetry
   - Pilot size: 3–10 users for 1 week.
   - Track: successful transforms, extension failures, and satisfaction (1–5).
   - Make telemetry opt‑in to respect privacy.

4) Monetization experiment
   - Mirror the Free/Pro pattern shown in the listing: Free = 2 rewrites/day and Pro = unlimited as one possible experiment. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

Reference: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519

## Technical notes (optional)

- Prompt design: ask the model to return exactly N bullets (for example: "Return exactly 5 bullets") to reduce variability.
- Template versioning: increment a version number in prompt_templates.json on each change so you can roll back if needed.
- Extension lifecycle: keep Share extension tasks short; proxy long-running or memory-heavy jobs to the main app.

Sample local config and quick command to bootstrap:

```bash
# bootstrap project
mkdir rewrite-text && cd rewrite-text
git init
open -a Xcode .
```

Reference: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519

## What to do next (production checklist)

### Assumptions / Hypotheses
- The App Store listing states: "Rewrite text on device, secure", "Uses on‑device AI language models" and "Built with iOS Foundation Models." These claims form the basis for a local‑first design. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
- Planning heuristics used here (to be validated in pilot): prototype 4–6 hours; pilot 3–10 users; cache history 50 entries; median latency target < 3s; 95th percentile latency < 7s; context warning at 80% of model context; developer fee $99/yr; binary size example 6.9 MB; free limit example 2 rewrites/day and Pro = unlimited; example model config: temperature 0.7 and max_tokens 512.

### Risks / Mitigations
- Risk: claiming "on‑device" while unintentionally sending data to cloud. Mitigation: audit network calls, remove network SDKs from extension targets, and make any cloud fallback explicit and opt‑in. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
- Risk: Share extension timeouts. Mitigation: add an "Open in app" handoff, prewarm models at app launch, and gate rollout on latency targets.
- Risk: older devices run out of memory. Mitigation: detect device capability, switch to a smaller model or a lightweight fallback, and warn users when required memory exceeds device limits.

### Next steps
- Run a 1‑week pilot with 3–10 users and collect median/95th latency, crash rate, and satisfaction (1–5).
- Finalize App Store privacy text to match actual on‑device behavior and keep it up to date. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)
- Prepare in‑app purchase IDs and App Store assets if you plan a Pro tier; consider the Free = 2 rewrites/day, Pro = unlimited pattern as one test. (Source: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519)

Release checklist:
- [ ] Performance: median latency < 3s on target devices
- [ ] Stability: crash rate < 1% in pilot
- [ ] Privacy: audit confirms no unintended network calls
- [ ] UX: Share extension provides an "Open in app" fallback
- [ ] Billing: in‑app purchase tested end‑to‑end

Final reference: https://apps.apple.com/us/app/rewrite-text-ai-writing-tool/id6758913519
