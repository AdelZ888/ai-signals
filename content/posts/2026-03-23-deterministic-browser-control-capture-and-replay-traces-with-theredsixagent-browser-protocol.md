---
title: "Deterministic browser control: capture and replay traces with theredsix/agent-browser-protocol"
date: "2026-03-23"
excerpt: "Use theredsix/agent-browser-protocol to record deterministic browser command traces that can be replayed for reproducible debugging, QA, and audits. Start by running the repo example."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-23-deterministic-browser-control-capture-and-replay-traces-with-theredsixagent-browser-protocol.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "deterministic"
  - "browser-automation"
  - "agent-browser-protocol"
  - "AI-agents"
  - "replay-traces"
  - "reproducibility"
  - "QA"
sources:
  - "https://github.com/theredsix/agent-browser-protocol"
---

## TL;DR in plain English

- What this repo is: a project for deterministic browser automation. See https://github.com/theredsix/agent-browser-protocol.
- What that means: an agent issues explicit browser commands that are recorded as a trace. Those traces can be replayed to repeat the same browser interactions.
- Why try it: replayable traces make debugging, QA, and audits easier because you can reproduce the exact sequence of actions an agent took.
- Quick first steps (10 minutes):
  - git clone the repo and open its README at the URL above.
  - Run the example the README points to.
  - Capture one short flow (e.g., open a page, fill a form, click submit) and save the trace JSON.

Example scenario: you have a signup form that intermittently fails. Capture one successful interaction as a trace. Replay that trace repeatedly to see when and how the UI differs.

Short methodology note: this guide follows the repository headline and examples at https://github.com/theredsix/agent-browser-protocol and keeps operational estimates in the Assumptions section.

## What you will build and why it helps

You will connect a large language model (LLM) driven agent to a deterministic browser-control endpoint that records each browser command the agent sends. The repository at https://github.com/theredsix/agent-browser-protocol is the starting point. The goal is not heuristic scraping, but producing repeatable command traces that can be replayed exactly.

Why this helps:
- Reproducibility: engineers can replay the same sequence of commands to reproduce bugs without guessing about timing or selectors.
- Auditability: traces are machine-readable artifacts you can store and inspect for QA or compliance.
- Fault isolation: deterministic control helps you tell whether a problem is a model decision or a UI interaction.

How this works in simple terms (plain-language explanation):
- The agent sends explicit browser commands (navigate, type, click) to a controlled endpoint.
- The endpoint records those commands in order as a JSON trace file.
- A replay tool reads that JSON and issues the same commands in the same order, so the browser performs the same steps.

Simple decision table (high level):

| Need | Use case | Recommendation |
|---|---|---|
| High reproducibility | Critical payment or onboarding flows | Capture-and-replay with strict trace storage |
| Broad coverage | Exploratory or many pages | Headless automation with sampling |
| Fast iteration | Prototyping | Lightweight agents + manual checks |

Reference: repository page and README at https://github.com/theredsix/agent-browser-protocol.

## Before you start (time, cost, prerequisites)

Time estimate (conservative): inspect the repo, run the example, and validate one flow. Plan for at least an hour to get a working trace and several hours to iterate.

Minimum prerequisites:
- A workstation or VM with git and a shell.
- Network access to fetch the repo from https://github.com/theredsix/agent-browser-protocol.
- Basic knowledge of JSON and shell commands.
- (Optional) API access to the LLM or agent runtime you plan to use if you want a live agent rather than a recorded example.

Checklist before you proceed:
- [ ] git available and authenticated if needed
- [ ] Local shell and text editor ready
- [ ] A repo clone of https://github.com/theredsix/agent-browser-protocol
- [ ] A plan for storing trace JSON files securely

Cost note: cloning the repo is free. If you use a hosted model API for live agent runs, you will incur provider costs.

## Step-by-step setup and implementation

1) Clone the repository and inspect the README at the project URL.

```bash
# clone the repo
git clone https://github.com/theredsix/agent-browser-protocol
cd agent-browser-protocol
# open the README to see exact runtime steps
cat README.md | sed -n '1,120p'
```

2) Follow the repository README for starting the example harness. The README is the authoritative source for commands and runtime requirements: https://github.com/theredsix/agent-browser-protocol.

3) Capture a short canonical flow. Conceptually: have the agent execute a simple interaction (for example: navigate, fill, click) and save the resulting command trace as JSON.

4) Replay the saved trace using the repository's replay mechanism (see README). Verify the replay produces the same sequence of commands.

5) Compare traces and log any differences. Keep traces for audit and debugging.

Example placeholder template (validate keys and schema against the repo README):

```yaml
# example-config.yaml (illustrative; check the repo README for exact keys)
agent_endpoint: "http://localhost:PORT"
agent_name: "example-agent"
trace_output_dir: "./traces"
```

Note: the YAML above is a template. Validate all fields and schema against the repository README at https://github.com/theredsix/agent-browser-protocol.

Plain-language explanation before advanced details:
- Start small: pick one short flow (3–7 steps) and make sure you can record and replay it locally.
- Use replay runs to discover non-determinism (timing, selectors, flaky elements).
- Fix one thing at a time (selectors, waits, input data) and measure improvement by repeating the replay.

## Common problems and quick fixes

Problem: the example harness won't start or the agent can't connect.
- Check that you followed the repo README for installation and startup. Confirm your network allows local connections to the harness.

Problem: replayed traces behave differently than live runs.
- Verify that the trace contains command IDs and sequencing fields used by the harness. If timestamps or ephemeral IDs are present, normalize them before comparing.

Problem: sensitive data appears in traces.
- Redact secrets at capture time. Treat traces as sensitive logs and apply access controls.

Quick troubleshooting checklist:
- [ ] README followed for install and run steps (see https://github.com/theredsix/agent-browser-protocol)
- [ ] Harness reachable from your agent process
- [ ] Traces saved as JSON and backed up
- [ ] Sensitive fields redacted or filtered before storage

For protocol-specific debugging, consult the repository README and examples at https://github.com/theredsix/agent-browser-protocol.

## First use case for a small team

Focus: practical steps a solo founder or a 1–3 person team can execute quickly.

Concrete, actionable items (solo / small-team friendly):

1) Start with one failing flow. Pick a single user action that fails most often (example: a signup form). Keep the scope to 1 page and 3–7 critical steps.
   - Action: run the flow once and save the trace JSON from the harness.

2) Reproduce by replaying the saved trace. Do this N=10 times locally to see variance. Record the number of exact-sequence matches vs. mismatches.
   - Action: run the replay loop and write a small script that stores each trace with a timestamp.

3) Iterate to stabilize selectors and timing. If mismatches appear, try: 1) stronger selectors, 2) explicit waits where the UI reports readiness, and 3) reduce non-deterministic inputs.
   - Action: change one factor at a time, then re-run the 10-run replay to measure improvement.

Practical checklist for a solo founder:
- [ ] Define the single canonical flow (1 page, 3–7 steps)
- [ ] Capture one trace and commit it to a secure folder
- [ ] Create a replay script and run it N=10 times
- [ ] Apply one fix (selector or wait) and re-run to measure change
- [ ] Keep a short log of results (timestamped) for each experiment

Why this is doable for small teams: the scope is small, tooling is local, and each iteration is short. See the repo at https://github.com/theredsix/agent-browser-protocol for the harness and trace format.

## Technical notes (optional)

- The repository describes deterministic browser automation and advertises compatibility with Claude, Codex and OpenCode. See the project page: https://github.com/theredsix/agent-browser-protocol.
- Look for command IDs, sequencing tokens, and explicit replay semantics in the README and examples in the repo. Those fields determine how deterministic replay works.
- Pin to a specific commit or tag for production use to avoid unexpected schema changes.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository advertises deterministic browser automation and claims compatibility with Claude/Codex/OpenCode: https://github.com/theredsix/agent-browser-protocol.
- The following numeric values are conservative operational estimates for evaluation and must be validated in staging:
  - Run count for sanity checks: N = 10 runs
  - Initial repeatability acceptance target: 80%–95%
  - Strict rollback threshold: repeatability < 60%
  - Recommended explicit wait per UI readiness event: up to 500 ms
  - Canary windows used in examples: 24 hours, 48 hours, 72 hours
  - Canary traffic fractions used in examples: 1%, 5%, 10%
  - Error budget thresholds in examples: <= 1% for canary; rollback if > 2%
  - Typical trace retention suggestion: 30 days (policy example)

These numbers are estimates for planning. Validate exact behavior, fields, and message formats against the repository README and code at https://github.com/theredsix/agent-browser-protocol.

### Risks / Mitigations

- Risk: repository schema or message formats change and break replay. Mitigation: pin to a commit or tag; add automated schema-validation tests.
- Risk: low reproducibility in important flows. Mitigation: tighten selectors, introduce deterministic waits, increase logging, and iterate with N=10 replay batches.
- Risk: sensitive data leaked into traces. Mitigation: redact or filter secrets at capture time and restrict trace storage access.

### Next steps

- [ ] Run the repository example and capture a canonical trace (N=10 replay runs to collect baseline).
- [ ] Define acceptance criteria: target repeatability (example: 80%+), allowed error rates, and rollback thresholds.
- [ ] Create simple automation to replay traces and compute exact-sequence match counts.
- [ ] Pin the integration to a commit/tag and add a schema-validation CI test.
- [ ] Document a 30-minute rollback playbook and an alert rule for repeatability drops.

Example replay-check script (illustrative; adapt to the repo's actual CLI):

```bash
# run replay N=10 and save results
for i in {1..10}; do
  ./tools/replay --trace ./traces/canonical.json --out ./results/run-$i.json
done
python3 tools/compare_traces.py --dir ./results --out summary.json
```

Final reference: consult the repository README and examples at https://github.com/theredsix/agent-browser-protocol for protocol-level details and exact message formats.
