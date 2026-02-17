---
title: "Voicetest: Open-source test harness that unifies Retell, VAPI, LiveKit and Bland via an AgentGraph IR"
date: "2026-02-17"
excerpt: "Simulate conversations across Retell, VAPI, LiveKit and Bland with Voicetest. It normalizes configs via an AgentGraph IR, scores turns with LLM judges, and adds compliance checks."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-17-voicetest-open-source-test-harness-that-unifies-retell-vapi-livekit-and-bland-via-an-agentgraph-ir.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "voicetest"
  - "voice"
  - "testing"
  - "AgentGraph"
  - "LLM"
  - "CI"
  - "DuckDB"
  - "compliance"
sources:
  - "https://news.ycombinator.com/item?id=47048811"
---

## Builder TL;DR

Voicetest in one line: import an AgentGraph from Retell/VAPI/LiveKit/Bland, write scenario tests, simulate conversations, and evaluate each turn with LLM judges that emit a score between 0.0–1.0 and written reasoning (source: https://news.ycombinator.com/item?id=47048811).

Quick start (artifact):

```bash
uv tool install voicetest
voicetest demo --serve
# open http://localhost:3000 (web UI)
```

Components at a glance: CLI, TUI, and REST API; DuckDB for persistence; Docker Compose dev stack that includes LiveKit, Whisper STT, and Kokoro TTS; optional Claude Code pass-through for judge evaluations (source: https://news.ycombinator.com/item?id=47048811).

Where to find code and docs: https://github.com/voicetestdev/voicetest and https://voicetest.dev (see the repo for sample AgentGraph files and CI workflow templates).

Methodology note: this tutorial follows the project snapshot and uses only supported features from the source link above.

## Goal and expected outcome

Goal: get a working local Voicetest environment, import or author one AgentGraph, write and run at least one scenario test, and produce automated evaluation output you can assert on in CI (source: https://news.ycombinator.com/item?id=47048811).

Expected deliverables:

- agent_graph.json or agent_graph.yaml (AgentGraph IR)
- one or more scenario test files with pass/fail threshold
- evaluation results persisted in DuckDB and exported as CSV
- a sample GitHub Actions workflow (.github/workflows/voicetest.yml) to gate PRs

Concrete success criteria (examples you can adopt):

- Each test turn emits a score between 0.0 and 1.0 and written reasoning.
- Define a pass_score per scenario; e.g., pass_score = 0.80 (80%).
- CI fails the PR if >5% of scenario turns fall below pass_score, or if mean turn score drops more than 10% vs baseline.

Reference: basic project features and CI integration described in the source snapshot (https://news.ycombinator.com/item?id=47048811).

## Stack and prerequisites

Required:

- uv tool (used to install voicetest) and Git
- Docker and Docker Compose (for the provided dev environment)
- A modern web browser to view the demo UI
- Local disk for DuckDB persistence (the demo stores results in a DuckDB file)

Optional:

- Claude Code subscription for pass-through judge evaluations (avoids configuring separate API keys) — see project notes (https://news.ycombinator.com/item?id=47048811).

Supported import targets (normalized via the AgentGraph IR): Retell, VAPI, LiveKit, Bland (source: https://news.ycombinator.com/item?id=47048811).

Recommended local resource targets for the demo:

- CPU: 4 cores
- RAM: 8 GB
- Disk: 5 GB free for DuckDB and audio samples

## Step-by-step implementation

1. Install and run the demo locally.

```bash
# install via uv tool
uv tool install voicetest
# run the bundled demo web server
voicetest demo --serve --port 3000
```

Open http://localhost:3000 and inspect the sample agent and scenario tests (source: https://news.ycombinator.com/item?id=47048811).

2. Import or author an AgentGraph.

- If you have platform config (Retell/VAPI/LiveKit/Bland), use the converters in the repo to transform it into agent_graph.json.
- Or author a minimal AgentGraph and save as agent_graph.json in your project.

3. Author a scenario test file.

Example scenario in YAML (place under tests/scenarios/sample_scenario.yaml):

```yaml
name: billing_flow_smoke
pass_score: 0.80
turns:
  - user: "What is my current balance?"
    expect: "agent-provide-balance"
  - user: "How do I pay my bill?"
    expect: "agent-provide-payments-info"
```

4. Run a local simulation and evaluation (CLI):

```bash
# run a single scenario and write results to the local DuckDB
voicetest run --scenario tests/scenarios/sample_scenario.yaml --agent agent_graph.json --output results/voicetest.db
```

5. Inspect results.

- Open the DuckDB file (results/voicetest.db) with DuckDB CLI or export to CSV.
- Each turn will have score (0.0–1.0), judge reasoning, timestamps, and metadata.

6. Integrate into CI (GitHub Actions).

- Add .github/workflows/voicetest.yml from the repo; run voicetest in the job and fail on thresholds. Keep secrets in your CI secrets store if using external LLMs or Claude Code.

7. Iterate judge configuration.

- Switch judge backend between local LLM and Claude Code pass-through. Validate with focused test scenarios to detect score drift.

8. Rollout / rollback plan (explicit gates):

- Canary: start at 5% of production traffic, run voicetest as a pre-deploy gate for those releases.
- Feature flag: gate agent changes behind a feature flag before full rollout.
- Metrics gate: block rollout if mean turn score drops >10% or if >5% of turns fall below pass_score.
- Rollback: revert feature flag immediately; run targeted scenario suite to confirm baseline restored; redeploy previous container image within 15 minutes.

9. Observability and retries:

- Set STT/TTS call timeout to 60s and retries to 3 for flaky infra.
- Log raw judge responses for at least 30 days for debugging.

10. Export policy and backup:

- Periodic DuckDB backups: daily full export, keep 7 days on disk, archive 90 days offsite.

Source for demo features and dev stack: https://news.ycombinator.com/item?id=47048811.

## Reference architecture

The core abstraction is the AgentGraph IR which normalizes platform-specific configs (Retell, VAPI, LiveKit, Bland) so Voicetest can test them uniformly (source: https://news.ycombinator.com/item?id=47048811).

Components table:

| Component | Responsibility | Notes |
|---|---:|---|
| Voicetest core | Simulator + evaluator | Runs scenarios, calls judge backends |
| Judge backend | LLM scoring 0.0–1.0 + reasoning | Can pass through to Claude Code or use other LLMs |
| STT/TTS | Whisper / Kokoro in Docker Compose | Audio input/output for full voice flow |
| Persistence | DuckDB | Stores runs, scores, reasoning, timestamps |
| CI | GitHub Actions | Run scenario suite on PRs and gate merges |

Operational expectations / sample thresholds:

- Judge latency target: 500–2000 ms per turn (depends on backend).
- STT latency target: <10s for demo flows.
- Scenario run time: aim for <60s per short scenario (2–4 turns).

Diagram note: use the repo's Docker Compose as a template to map LiveKit, Whisper, Kokoro, Voicetest core, and DuckDB in your deployment (source: https://news.ycombinator.com/item?id=47048811).

## Founder lens: ROI and adoption path

Adoption path (practical phases):

1. Developer exploration: run local demo and author first scenario (developer-level onboarding).
2. Pilot: onboard a single pilot agent and keep AgentGraph + scenario tests in the repo.
3. CI gate: add GitHub Actions voicetest job to PR checks and require a pass_score threshold for merges.
4. Rollout: expand to additional agents and mission-critical flows once the CI gate shows stability.

Signals to monitor (qualitative; move to assumptions if you need exact targets): baseline pass_rate by agent, regression count per week, and manual QA time saved per team.

Source for adoption mechanics and CI integration: https://news.ycombinator.com/item?id=47048811.

## Failure modes and debugging

Common failure modes and steps to debug (based on project notes):

- AgentGraph import mismatch: reproduce locally by loading the same agent_graph.json and run a minimal scenario. Inspect converter logs for mapping issues (source: https://news.ycombinator.com/item?id=47048811).

- Judge instability or hallucination: add a deterministic debugging scenario that logs raw LLM outputs and compare multiple runs. Consider reducing judge temperature or switching to Claude Code pass-through for stability.

- STT/TTS timing errors: run docker-compose logs for Whisper/Kokoro and re-run the failing scenario via the TUI to capture audio artifacts.

- CI flakes: isolate flaky scenarios and mark them for quarantine; enforce a max 3 retry policy in CI, and require a minimum of 3 successful runs before promoting a change.

Debugging checklist:

- [ ] Reproduce failing scenario locally within 10 minutes
- [ ] Capture raw audio and raw judge response
- [ ] Compare scores across 3 runs (median/mean)
- [ ] If judge drift > 0.10 (10%), open an investigation ticket

Include the HN source link in any postmortem and attach the original AgentGraph and scenario files (https://news.ycombinator.com/item?id=47048811).

## Production checklist

### Assumptions / Hypotheses

- Voicetest provides an AgentGraph IR that normalizes Retell, VAPI, LiveKit, and Bland configs (source: https://news.ycombinator.com/item?id=47048811).
- The demo includes a web UI, CLI, TUI, REST API, DuckDB persistence, and a Docker Compose dev stack with LiveKit, Whisper STT, and Kokoro TTS (source: https://news.ycombinator.com/item?id=47048811).
- Hypothesis: pass_score = 0.80 is a reasonable starting threshold; canary rollout at 5% traffic will surface regressions with minimal user impact. These numeric targets are recommendations for your org and should be validated in pilot.

### Risks / Mitigations

- Risk: Judge variability causes false positives/negatives. Mitigation: log raw responses, lower LLM temperature, use Claude Code pass-through if available, and require >3 successful runs before promotion.
- Risk: STT/TTS flakiness under load. Mitigation: configure timeouts at 60s and retries = 3; scale Whisper/Kokoro or move to managed services.
- Risk: Secrets leakage for LLM keys. Mitigation: store keys in CI secrets manager and prefer Claude Code pass-through where allowed (source: https://news.ycombinator.com/item?id=47048811).

### Next steps

- Add the sample .github/workflows/voicetest.yml to the repo and set an initial soft gate (warning on PRs) for 2 weeks.
- Onboard one critical agent and collect baseline metrics for 14 days: mean turn score, per-turn failure rate, and time-to-detect regressions.
- Expand to hard CI gate (fail PRs) once regression rate drops below your internal threshold (e.g., <5% failing turns).

Checklist for launch: 

- [ ] Demo run locally and inspected (DuckDB results verified)
- [ ] One AgentGraph + 5+ scenario tests committed
- [ ] GitHub Actions workflow added and secrets configured
- [ ] Canary rollout plan documented (5% traffic, rollback <15min)
- [ ] Backups for DuckDB automated (daily)

Reference and primary snapshot: https://news.ycombinator.com/item?id=47048811
