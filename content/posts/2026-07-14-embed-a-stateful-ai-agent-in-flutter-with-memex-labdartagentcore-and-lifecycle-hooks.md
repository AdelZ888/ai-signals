---
title: "Embed a stateful AI agent in Flutter with memex-lab/dart_agent_core and lifecycle hooks"
date: "2026-07-14"
excerpt: "Hands-on guide to adding a stateful AI agent to Flutter apps with memex-lab/dart_agent_core. Learn planning, tool use, streaming partial outputs and sub-agent delegation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-14-embed-a-stateful-ai-agent-in-flutter-with-memex-labdartagentcore-and-lifecycle-hooks.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "dart"
  - "flutter"
  - "ai-agents"
  - "llm"
  - "mobile"
  - "open-source"
  - "tutorial"
sources:
  - "https://github.com/memex-lab/dart_agent_core"
---

## TL;DR in plain English

- What this teaches: how to add a stateful AI agent to a Flutter app using the dart_agent_core project. The repo describes a Dart framework for stateful agents: tool use, skills, sub-agent delegation, planning, streaming, evals, and multi-provider LLM support. See https://github.com/memex-lab/dart_agent_core.
- Why it matters: the agent can run multi-step logic inside the app, call tools, and stream partial outputs so users see progress quickly. This separates UI code from planning and tool calls.
- Quick actions (first 15–30 minutes):
  - Clone the repo and open the example app.
  - Add the package to your Flutter project and add a small YAML config file as an asset.
  - Expose a streaming callback in the UI to show partial tokens as they arrive.

Checklist (starter):
- [ ] repo cloned: https://github.com/memex-lab/dart_agent_core
- [ ] Flutter SDK installed (stable channel)
- [ ] basic config file added to app assets

Concrete example scenario (short):
- Support-ticket triage: a user pastes a stack trace. The agent summarizes the issue, runs a docs_search tool to find related docs, and returns a short remediation plan. The UI shows partial text immediately while the agent continues planning.

Plain-language explanation before advanced details:
- The agent is a piece of app logic that keeps short-term memory of a conversation or workflow. It decides which steps to run (skills) and which external helpers to call (tools). Streaming means the agent emits tokens or partial text while it composes a response. This improves perceived speed because users see something right away instead of waiting for a full answer.

## What you will build and why it helps

You will build a small Flutter demo that embeds a stateful agent using dart_agent_core. The agent will:
- plan multi-step responses,
- call registered tools (for example, a document search API),
- stream partial outputs to the UI,
- and delegate tasks to sub-skills if needed.

Why this helps teams and users:
- Faster perceived response: users see partial text while the agent finishes.
- Clear separation: UI handles rendering; the agent handles planning and tool orchestration.
- Local state: short-lived context can live in the app lifecycle for multi-turn flows.

Example architecture mapping (simple):

| UI component | Agent responsibility | Example skill/tool |
|---|---:|---|
| Report screen | Summarize stack traces and plan next steps | summarizer skill |
| Search bar | Query internal docs and return hits | docs_search tool |
| Chat pane | Maintain multi-turn context and delegate | dialog_manager sub-agent |

Reference: https://github.com/memex-lab/dart_agent_core

## Before you start (time, cost, prerequisites)

Estimated time and a few cost notes (rough):
- Hands-on time: ~2 hours to reproduce a simple demo. Adding custom tools can take several more hours.
- API cost: varies by provider. Treat any dollar figures as estimates and measure actual spend in staging.
- Performance targets: aim for fast first-token delivery to improve perceived latency. Measure median and tail latencies in staging.

Minimum prerequisites:
- Flutter SDK (stable channel) installed and an emulator or device available.
- A scaffolded Flutter app to add the agent to.
- At least one LLM (large language model) provider API key available and stored securely. "LLM" means large language model.
- Basic familiarity with Dart async/await and widget lifecycle (initState/dispose).

Pre-flight checklist:
- [ ] Flutter channel: stable
- [ ] Clone URL: https://github.com/memex-lab/dart_agent_core
- [ ] pubspec.yaml prepared to include the agent package
- [ ] API keys stored in secure storage (do not hard-code keys)

Reference: https://github.com/memex-lab/dart_agent_core

## Step-by-step setup and implementation

1) Clone the repository and open the example app as a starting point. The example app is a good way to see how the package is intended to be wired into Flutter:

```bash
git clone https://github.com/memex-lab/dart_agent_core.git
cd dart_agent_core
# Open the example Flutter app folder (example or example_flutter_app)
```

2) Add the package to your app:

```bash
flutter pub add dart_agent_core
flutter pub get
```

3) Add a minimal configuration file as an asset. Treat this file as a template. Move secrets into secure storage in production.

```yaml
# assets/agent_config.yaml (example template)
providers:
  default:
    type: multi-provider
    max_tokens: 1000
skills:
  summarizer:
    enabled: true
tools:
  docs_search:
    timeout_ms: 2000
streaming:
  enabled: true
  first_token_warn_ms: 2000
```

4) Wire a controller or manager into a State object and expose streaming callbacks. The package exposes events for partial tokens so the UI can render text as tokens arrive. Call setState in your listener to update visible text quickly.

5) Implement at least one simple tool adapter. For tests keep tool timeouts short (e.g., 2,000 ms) and increase for flaky endpoints. Start with small per-session token caps while developing.

6) Run locally and stage tests. Try a small batch of requests in staging before a larger canary rollout. Monitor helpfulness and latency.

Rollout guidance (example gates):
- Canary: 10% of users.
- Mid rollout: 50% when metrics pass.
- Success target: measure helpfulness and latency before wider rollout.
- Rollback: prepare criteria such as rising error rates or unexpected cost spikes.

Reference: https://github.com/memex-lab/dart_agent_core

## Common problems and quick fixes

- No provider response: check that the API key is present in secure storage and valid. Run a short probe request to confirm connectivity.
- Streaming not appearing: ensure streaming.enabled is true in your config and your UI subscribes to token events and calls setState when tokens arrive.
- Tool timeouts / 504s: increase timeout_ms (e.g., from 2000 ms to 5000 ms) and add retries with exponential backoff.
- High cost: set per-session token caps during development and add budget alerts for production.

Quick fixes summary:

| Symptom | Quick check | Fix |
|---|---:|---|
| No response | API key present and valid? | Add key to secure storage and restart app |
| No streaming | streaming.enabled false | Set true and re-run |
| Tool 504 | timeout_ms too low | Increase from 2000 ms to 5000 ms |

Reference: https://github.com/memex-lab/dart_agent_core

## First use case for a small team

Target reader: solo founders and teams of 1–3 people. Goal: deliver a minimal in-app QA triage assistant quickly and cheaply.

Concrete, actionable steps:
1) Start minimal: implement one skill (summarizer) and one tool (search). Limit max_tokens during early tests to control cost and latency. Aim to wire a bare flow in a 2-hour sprint.
2) Cost control: use per-session token caps and low initial quotas in staging. Start with a small canary to limit spend while you gather feedback.
3) Fast feedback: enable streaming and show partial text immediately to improve perceived latency.
4) Keep secrets safe: store API keys in platform secure storage and never hard-code them. Validate keys with a short probe.
5) Lightweight evaluation: stage with a sample set of real reports, measure helpfulness and latency, and gate expansion on your metrics.

Operational checklist for a solo founder:
- [ ] Implement one skill and one tool in 2–8 hours
- [ ] Limit session tokens during dev
- [ ] Canary to a small percentage of users and monitor costs
- [ ] Run a small staging run and collect helpfulness labels

Reference: https://github.com/memex-lab/dart_agent_core

## Technical notes (optional)

- What the project states: dart_agent_core is a Dart framework for stateful AI agents. It lists tool use, skills, sub-agent delegation, planning, streaming, evals, and multi-provider LLM support. See https://github.com/memex-lab/dart_agent_core.

- Persistence: the project focuses on in-app agent state. If you need session persistence across restarts, store transcripts in encrypted storage or a backend. Decide early whether state should be ephemeral or persisted.

- Eval hooks and metrics: capture transcripts, labels, and latency. Run periodic evaluations and set simple SLOs (service-level objectives). "SLO" means service-level objective.

Example Dart-style snippet (conceptual):

```dart
// conceptual example: instantiate controller and listen for tokens
final controller = /* package-specific constructor using config */;
controller.onToken.listen((token) {
  setState(() => partialText += token);
});
controller.dispose();
```

Reference: https://github.com/memex-lab/dart_agent_core

## What to do next (production checklist)

### Assumptions / Hypotheses
- Assumption: the project provides a framework for tool use, skills, sub-agent delegation, planning, streaming, evals, and multi-provider LLM support (source: https://github.com/memex-lab/dart_agent_core).
- Hypothesis: enabling streaming will reduce perceived latency compared to waiting for full responses; measure this in staging with median and p95 latencies.

### Risks / Mitigations
- Risk: unexpected LLM cost. Mitigation: cap tokens per session, set daily budget alerts, and monitor spend.
- Risk: sensitive data leakage. Mitigation: redact personally identifiable information (PII) before tool calls, route calls through a proxy if needed, and audit payloads.
- Risk: bad agent outputs. Mitigation: run evals on a sample set, require helpfulness thresholds before wider rollout.

### Next steps
- Add monitoring and logs for agent decisions, tool calls, and errors. Define SLOs such as high success rates and target latencies.
- Production hardening checklist:
  - [ ] Move API keys to platform secure storage
  - [ ] Remove debug logs and test-only tokens
  - [ ] Set max_tokens appropriate for production
  - [ ] Configure provider quotas and daily budget alerts
  - [ ] Implement feature flags and staged rollout (10% -> 50% -> 100%)
  - [ ] Schedule periodic evals (for example, every 30 days) and adjust skills

Repo and reference: https://github.com/memex-lab/dart_agent_core
