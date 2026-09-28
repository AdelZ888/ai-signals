---
title: "Reproducing and Triaging the New Siri’s Failures: wrong message selection, calendar mistakes, and redundant prompts"
date: "2026-09-28"
excerpt: "Short diagnostic guide to reproduce and document new Siri failures. Run 10–15 minute tests and capture video/transcripts to prove when Siri reads old texts, mis-schedules events, or re-asks."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-28-reproducing-and-triaging-the-new-siris-failures-wrong-message-selection-calendar-mistakes-and-redundant-prompts.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "Siri"
  - "LLM"
  - "diagnostics"
  - "voice-UI"
  - "iOS"
  - "UX"
  - "testing"
sources:
  - "https://news.ycombinator.com/item?id=49869237"
---

## TL;DR in plain English

- Multiple users report basic failures in the “new Siri”: it finds older text messages instead of the most recent, creates calendar events at the wrong times, and asks for message text after the user already spoke. Source: https://news.ycombinator.com/item?id=49869237
- Quick reproducible check you can run in 10–15 minutes: send a text to yourself with a live location (for example, “I’m at terminal 2 door B”), then immediately ask Siri for that driver’s location. Reported behavior: Siri returned a message from 5 days earlier instead of the new one. Source: https://news.ycombinator.com/item?id=49869237
- Fast triage policy for small teams: capture a 30–90 second screen+audio video, collect timestamps/console metadata, and write a one-line summary per run (testID, utterance, expected, observed). This gives a 0/1 decision per run and a clear path to escalate. Source: https://news.ycombinator.com/item?id=49869237

Plain-language explanation before advanced details:

This guide turns a customer complaint into repeatable evidence. It favors short, user-visible checks over deep instrumentation at first. That way one person can show a vendor or an internal team what went wrong, and why.

Concrete example / scenario: you receive a live location text from a driver saying “I’m at terminal 2 door B.” You ask Siri “Give me the location of my driver” right away. The expected result is Siri uses that recent text and tells you the live location. The reported result is Siri reads a message from five days ago instead. Source: https://news.ycombinator.com/item?id=49869237

Methodology note: this guide focuses on short, reproducible, user-visible checks and minimal ticket artifacts (video, transcript, decision row). It is not a full post-mortem. It is a fast triage pattern.

## What you will build and why it helps

You will build a small diagnostic harness that turns an anecdote into a reproducible test and a ticketable evidence bundle. The harness is low-friction. One person can create the three artifacts vendors usually ask for: video, transcript, and a short decision row. This reduces time-to-decision from hours to about 2 hours for initial triage and 4–16 hours for deeper debugging. Source: https://news.ycombinator.com/item?id=49869237

Why this helps:

- It converts single-user complaints into objective pass/fail results (0/1 per run).
- It gives consistent acceptance criteria (for example: 95% success over 20 runs) to avoid chasing flaky results.
- It minimizes privacy exposure by defaulting to a UI video and metadata rather than raw message bodies.

Reference failure modes to include in the harness: selecting an older SMS (5 days old), creating a calendar event at the wrong time, and asking for message text after the user already gave it. Source: https://news.ycombinator.com/item?id=49869237

## Before you start (time, cost, prerequisites)

Time:
- Quick smoke test: 10–15 minutes.
- Initial triage: ~2 hours.
- Deeper debugging: 4–16 hours. Source: https://news.ycombinator.com/item?id=49869237

Cost:
- $0–$50 (mostly for storage or simple capture tools).
- Use free local recording where possible.

Device/OS plan:
- Test on at least three device/OS combinations when possible.
- Run each test 3–20 times depending on confidence needed.

Prerequisites:
- A device with the reported Siri instance and the apps involved (Messages, Calendar, Contacts).
- Permissions enabled for Siri to access those apps (verify in Settings).
- A way to capture screen+audio and, if available, console logs.

Must-have artifacts per failing test:
- One short screen+audio video (30–90 seconds).
- A transcript (voice-to-text) or a typed reproduction.
- One timestamped decision row (CSV/JSON or table).

Source for the user report: https://news.ycombinator.com/item?id=49869237

## Step-by-step setup and implementation

Follow these numbered steps. Each step lists a time estimate and the artifact you will produce.

1. Prepare the test matrix (10 minutes)
   - Pick three core tests to match the report: T1_recent_sms, T2_calendar_range, T3_send_message_clarify. Source: https://news.ycombinator.com/item?id=49869237
   - Decide runs per test: quick signal = 3 runs; moderate confidence = 20 runs.
   - Plan artifacts per run: screen.mov, transcript.txt, console.log (if possible).

2. Configure device(s) (5–10 minutes)
   - Ensure Messages and Calendar have recent entries. For T1, send a fresh SMS to the device with a location phrase such as “I’m at terminal 2 door B.”
   - Verify Siri permissions in Settings.

3. Start capture (1–2 minutes per run)
   - Start screen+audio recording and note the UTC timestamp in the filename.
   - Example command for macOS capture (start/stop manually as appropriate):

```bash
# Start a screen capture using ffmpeg (example, adjust device/window coordinates)
ffmpeg -f avfoundation -i "1:0" -r 30 -t 00:01:30 ~/Desktop/siri_run_$(date +%s).mp4
```

   - Expected artifact name: siri_run_<epoch>.mp4 (30–90s).

4. Execute the utterance (10–30 seconds per run)
   - Speak the exact phrase from the report, for example: "Give me the location of my driver" immediately after sending the SMS.
   - For the calendar test: "Make an appointment for Monday from 12 to 4 and label it Furniture Delivery." Watch what start/end times are created.
   - For the message-send test: "Send Jane a message saying I’m on my way home." Note whether Siri asks what to say.

5. Stop capture and collect logs (2–5 minutes)
   - Save the UI recording. Copy any available console logs. Save or transcribe the audio.
   - Label each artifact with test_id, device model, OS build, and timestamp.

```json
{
  "test_id": "T1_recent_sms",
  "device": "iPhone-Model-Example",
  "os_build": "iOS-XX.YY",
  "artifacts": ["screen.mov","console.log","transcript.txt"],
  "expected": "most recent SMS used",
  "runs_planned": 3
}
```

6. Summarize and decide (5–15 minutes)
   - Make a one-line decision row per run: testID, utterance, expected, observed, likely_layer.
   - If all 3 quick runs fail the same way, escalate to 20 runs and gather more videos and logs.

7. Optional: compare typed vs voice input (10–30 minutes)
   - Repeat the same utterances typed into the assistant UI. This separates ASR (automatic speech recognition) errors from intent or tool-routing errors. If typed input succeeds while voice fails, the problem is likely in the voice layer (ASR) or the layer that connects ASR to intent routing.

Source and examples: https://news.ycombinator.com/item?id=49869237

## Common problems and quick fixes

Reported failures from the user examples: older SMS chosen (5 days old), calendar event created at wrong time, assistant asks for message text after the user already spoke. Source: https://news.ycombinator.com/item?id=49869237

Quick checks and simple fixes:
- Check Messages UI: confirm the most recent SMS is visible and timestamped within the last five minutes.
- Re-run with phrasing that forces recency: add words like "most recent" or "the latest message" and compare results.
- Try typed input: if typed succeeds and voice fails, investigate ASR (automatic speech recognition) latency or truncation. Target ASR latency threshold for local decisions: <300 ms.
- Verify Calendar timezone and default duration: check that created events match the requested start and end times and are not shifted by timezone or duration defaults.

If artifacts are missing or inconclusive:
- Increase runs to 20 for statistical confidence.
- Collect device Console logs and note timestamps to within ±50 ms if possible.

Source: https://news.ycombinator.com/item?id=49869237

## First use case for a small team

Target user: solo founders or a team of 1–3 engineers or product people who need a fast decision path (escalate or fix) with little overhead. Source: https://news.ycombinator.com/item?id=49869237

Actionable steps for a small team:
1. Reproduce and capture once (10–20 minutes): run the exact user utterance, record a 30–90 second video, and save a transcript. One artifact often shows whether the issue is device-level or user-level.
2. Run a 3x quick sample (30–60 minutes): execute three runs per core test (T1..T3). If all three fail the same way, escalate to 20 runs or open a vendor ticket. Record device model and OS build for each run.
3. Use typed input as a fast isolation test (5–10 minutes): if typed input works while voice fails, treat it as an ASR/voice-layer issue rather than app integration.
4. Minimize privacy exposure: redact message bodies; attach UI video + timestamps instead. Get explicit consent before sharing message contents.
5. Escalation checklist (minimum): three videos + one console log + one decision row per failing test before filing. Set an initial acceptance gate like: 95% pass over 20 runs to close a ticket.

Budget tip for solo founders: use local device recording and free cloud storage (1–5 GB). Do the three-run quick signal before spending money on tooling.

Reference user report: https://news.ycombinator.com/item?id=49869237

## Technical notes (optional)

- Focus tests on the three concrete failure modes reported: wrong SMS selection (5 days old), calendar range mishandled, and redundant clarification after explicit text. Source: https://news.ycombinator.com/item?id=49869237
- If you have developer access, collect intent routing logs, timestamps, and API call IDs. Correlate the assistant's chosen tool with the UI timestamp within ±100 ms where possible.
- Suggested standardization: 6 core tests, 3 runs for a quick signal, 20 runs for confidence, 95% acceptance gate. Use canary rollout steps like 5% → 25% → 100% for production fixes.

Source: https://news.ycombinator.com/item?id=49869237

## What to do next (production checklist)

### Assumptions / Hypotheses

- Hypothesis: the reported failures reflect tool-routing or recency-selection issues rather than purely ASR errors; the user examples (5 days vs current) support focusing on recency. Source: https://news.ycombinator.com/item?id=49869237
- Test plan assumptions: run a set of 6 core tests (T1..T6), each with 3 quick runs and an optional 20-run suite for statistical confidence.
- Acceptance thresholds: 95% success across 20 runs to approve a vendor fix or internal patch.
- Time/cost assumptions: initial triage ~2 hours; deeper debugging 4–16 hours; tooling/storage $0–$50.

### Risks / Mitigations

- Risk: privacy limits prevent sharing message bodies. Mitigation: share UI video + timestamps and redact contents; request consent if needed.
- Risk: flakiness due to network or ASR variance. Mitigation: increase sample size to 20+ runs and compare typed vs voice input.
- Risk: misattribution (assuming vendor bug when it’s an integration issue). Mitigation: verify app permissions, test explicit app naming in utterances, and collect console logs to show routing decisions.

### Next steps

Short term (0–48 hours): run the three core tests (T1..T3) with three runs each, collect one video per failing symptom, and fill the decision row. Source: https://news.ycombinator.com/item?id=49869237

Mid term (48–168 hours): if failures persist and permissions/typed input checks are clear, prepare a vendor ticket with three videos + transcripts + logs and state the acceptance criteria (95% over 20 runs). If the issue is internal, add unit and integration tests and a canary rollout (5% → 25% → 100%) with Service Level Objective (SLO) checks and a rollback trigger for regressions.

Escalation checklist before filing:
- [ ] Reproduced the failure at least once on a device.
- [ ] Captured a short screen+audio video of the failing run.
- [ ] Collected available device/Console logs and noted timestamps.
- [ ] Filled a decision row (testID, utterance, expected, observed, likely layer).

Decision table example (for triage use):

| testID | utterance | expected | observed | likely_layer | artifact_link |
|---|---:|---|---|---|---|
| T1 | "Give me the location of my driver" | most recent SMS used | older SMS (5 days old) | tool‑routing / recency | link/to/artifact.mov |

Useful reference (original user report): https://news.ycombinator.com/item?id=49869237
