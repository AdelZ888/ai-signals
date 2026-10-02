---
title: "Meta announces Horizon Create (mobile) and Horizon Studio (browser) for AI-assisted, phone-first game prototyping and FB/Instagram publishing"
date: "2026-10-02"
excerpt: "Meta's Horizon Create (mobile) and Horizon Studio (browser) let you generate AI-assisted phone-first game prototypes and publish playable titles to Facebook and Instagram; 3–8h workflow."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-02-meta-announces-horizon-create-mobile-and-horizon-studio-browser-for-ai-assisted-phone-first-game-prototyping-and-fbinstagram-publishing.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "meta"
  - "horizon"
  - "horizon-create"
  - "horizon-studio"
  - "game-dev"
  - "ai"
  - "mobile"
  - "facebook"
sources:
  - "https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games"
---

## TL;DR in plain English

- Meta announced a phone-first path for building AI-assisted games and a browser-based studio to continue work. See the report: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games
- What to try now: build a tiny playable prototype aimed at a 60–180 second session length to validate the core loop quickly.
- Quick checklist:
  - [ ] Ship one prototype playable in 3–8 hours
  - [ ] Measure one KPI (median session >= 60 s)
  - [ ] Run a small canary (2%) before wider rollout

Concrete micro-scenario

- Example: "OneTapRun" — a one-button runner built as a phone-first prototype in 3–8 hours, 3 short levels, one score, one share action, targeted median session 90 s. (Meta phone-first + browser studio context: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games)

## What you will build and why it helps

You will build a tiny, phone-first AI-assisted game prototype that demonstrates a single fun loop and a single KPI. The goal is learning, not a full product. Meta's announcement frames a workflow that begins on a phone and can be continued in a browser studio: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games

What to deliver (minimal):

- Playable loop: 60–180 seconds
- Levels: 1–3 short levels
- Social action: 1 share button
- KPI: one metric, for example median_session_sec >= 60

Why this helps:

- Fast feedback: a prototype in 3–8 hours yields early data in 24–72 hours.
- Low cost: initial asset spend typically $50–$500; initial cloud/analytics $0–$100/mo.
- Clear decisions: one KPI removes ambiguity when iterating quickly.

(Report context: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games)

## Before you start (time, cost, prerequisites)

Time and cost summary (targets):

| Phase | Target time | Typical cost |
|---|---:|---:|
| First playable prototype | 3–8 hours | $0–$200 |
| Polishing + studio import | 4–24 hours | $0–$300 |
| Closed beta (collect data) | 7–14 days | $0–$100/month |

Prerequisites:

- A phone capable of modern mobile game prototyping (prefer hardware <3 years old). See source: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games
- A desktop browser for the studio follow-up step.
- A publishing account you will use for analytics and release.

Minimum checklist:

- [ ] Phone ready and charged
- [ ] Desktop browser updated
- [ ] Budget set for art pack ($50–$500)
- [ ] Plan for 3 test devices (low, mid, high)

## Step-by-step setup and implementation

1) Access and sign-in

- Start at the announcement page for the phone-first flow and studio context: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games
- Create the account you will publish from and log in on device and browser.

2) Rapid phone prototype (phone-first generator)

- Use tight constraints in prompts: target play time (60–180 s), controls (tap/tilt), and a clear visual style.
- Iterate 3–5 prompt revisions and test each output on-device.

Example commands for a local test folder and Android logs:

```bash
# create a project dir and metadata
mkdir mini-game && cd mini-game
cat > game_meta.json <<EOF
{"title":"OneTapRun","author":"you@example.com","session_target_sec":90}
EOF
# capture Android device logs while testing
adb logcat -c && adb logcat > device-test.log &
```

3) Import to the browser studio and polish

- Import the phone prototype into the browser editor (the announced flow includes a browser studio step: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games).
- Focus polish on controls, UI readability, and collision correctness.
- Performance targets to aim for during polish: initial download <50 MB, texture max 1024 px, active objects <100.

4) Analytics and safety

- Hook minimal telemetry: session_start, level_complete, share, crash.
- Collect at least 100 sessions before making major product decisions.
- Add a short privacy notice and a basic content moderation path.

5) Staged rollout plan (recommended gates)

- Canary: 2% for 24–48 hours
- Closed beta: ~15% for 7 days
- Ramp: 20% -> 50% -> 100% over 72 hours if thresholds hold
- Triggers: crash_rate >1% or a 24-hour retention drop >20% should pause rollout

Sample rollout JSON (save as rollout_config.json):

```json
{
  "rollout": {"canary_percent": 2, "closed_beta_percent": 15, "ramp_days": 3},
  "thresholds": {"crash_rate_pct": 1, "median_session_sec": 60, "retention_day1_pct": 15}
}
```

(Reference: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games)

## Common problems and quick fixes

- Access delays: initial sign-in or account setup may require steps; start setup early and verify sign-in on both phone and browser (see: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games).
- AI output off-target: add strict numeric constraints and iterate 3–5 times; keep asset size and polycount limits in the prompt.
- Performance issues: reduce texture sizes, combine sprites, and keep active objects <100. Target 30–60 FPS and avoid spikes >200 ms for main-thread work.
- Publish errors: validate account permissions and re-run studio publishing checklist.

Quick troubleshooting checklist:

- [ ] Confirm access via the announcement URL
- [ ] Capture device logs (keep last 5 MB of logs)
- [ ] Keep last 10 prompt revisions saved
- [ ] Asset size audit (target initial download <50 MB)

(Source: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games)

## First use case for a small team

This is aimed at solo founders or very small teams (<3 people) who want rapid validation.

Actionable plan for a tiny team:

1) Pick one KPI (examples): median_session_seconds >= 60 or day-1 retention >= 10–15%.
2) Use short sprints: 90–180 minute iterations; aim for a playable loop within 3–8 hours on Day 0.
3) Ship minimal telemetry and a privacy notice; gather at least 100 sessions before big decisions.
4) Minimize asset spend: use one art pack ($50–$200) and test on 3 devices (low/mid/high). Target textures <=1024 px and initial download <50 MB.
5) Rollout: start with a 2% canary for 24–48 hours, expand to ~15% closed beta if thresholds hold.

Suggested solo timeline:

- Day 0: Prompt + phone prototype (3–8 hours) — 60–180 s playable loop
- Day 1: Import & polish in studio (4–16 hours) — controls + analytics
- Day 3–7: Closed beta collect 100–500 sessions

(Reference: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games)

## Technical notes (optional)

- Prompt strategy: prefer precise numeric constraints: texture_max_dimension = 1024 px, max_active_objects = 100, polycount_per_model <= 5,000, target FPS 30–60.
- Telemetry thresholds to monitor early: crash_rate <1%, median_session_sec >=60, retention_day1_pct target 10–15%.

Example asset optimization YAML (save as asset_policy.yml):

```yaml
assets:
  max_initial_download_mb: 50
  texture_max_dimension: 1024
  compress_quality_pct: 80
  max_active_objects: 100
```

Methodology note: this guide is based on reporting that Meta intends a phone-first creation flow with a browser studio follow-up (source: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games).

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: Meta's announced flow allows creators to begin prototypes on phones and continue in a browser-based studio (source: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games).
- Hypothesis: onboarding steps, waitlists, or access windows may exist; plan a 3–14 day buffer for access-related scheduling and verification before committing paid resources.
- Hypothesis: specific platform limits (file size, tokens, exact API limits) are not detailed in the cited excerpt and must be verified in the platform documentation.

### Risks / Mitigations

- Risk: account or access delays (>7 days). Mitigation: begin sign-up early and verify sign-in on both phone and desktop.
- Risk: mobile performance regressions (FPS drops below 30, spikes >200 ms). Mitigation: enforce targets (initial download <50 MB, active objects <100), and test on 3 devices.
- Risk: AI-generated content requiring moderation. Mitigation: add a moderator role, a 24–48 hour review window, and a short content policy.

### Next steps

- Run a 2% canary for 24–48 hours. Verify crash_rate <1% and median_session >=60 s before expanding to ~15% closed beta.
- Collect at least 100 sessions in closed beta to compute median session and day-1 retention with initial confidence.
- Prepare production artifacts: privacy policy, analytics dashboard, and content moderation flow.

Production go/no-go checklist:

- [ ] Legal & privacy signoff
- [ ] Analytics dashboard live and collecting >=100 sessions
- [ ] Canary passed thresholds (crash_rate <1%, median_session >=60 s)
- [ ] Staged rollout plan documented (2% -> 15% -> 100%)

(Primary context and report: https://www.theverge.com/games/999972/meta-horizon-create-studio-ai-games)
