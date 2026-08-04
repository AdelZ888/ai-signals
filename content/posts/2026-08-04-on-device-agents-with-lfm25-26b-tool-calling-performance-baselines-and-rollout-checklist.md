---
title: "On-device agents with LFM2.5–2.6B: tool calling, performance baselines, and rollout checklist"
date: "2026-08-04"
excerpt: "Guide to run LFM2.5-2.6B agents on laptops, phones, and small servers. Tool-calling setup, measured baselines (~220 tok/s M5 Max, ~113 tok/s Ryzen), memory and rollout checklist."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-04-on-device-agents-with-lfm25-26b-tool-calling-performance-baselines-and-rollout-checklist.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "LFM2.5"
  - "LFM2.6B"
  - "LiquidAI"
  - "local-agents"
  - "edge-inference"
  - "on-device"
  - "tool-calling"
  - "privacy"
sources:
  - "https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b"
---

## TL;DR in plain English

- LFM2.5–2.6B is a small, agent-focused language model designed to run on-device (laptops, phones). It supports tool calling and multi-step workflows. See the announcement: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Measured baselines to use as acceptance gates: about 220 tok/s (tokens per second) on an Apple M5 Max and about 113 tok/s on an AMD Ryzen CPU. Typical inference memory use is under ~2.5 GB: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Quick checklist (one-minute):
- [ ] model download complete (LFM2.5 or LFM2.6B)
- [ ] runtime chosen and quant/config file saved
- [ ] one tool adapter wired and permission-gated
- [ ] smoke test passed (throughput & memory)

Minimum immediate actions you can take now (use the linked model page for reference):
1. Fetch the LFM2.5 or LFM2.6B weights from the Hugging Face model page: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
2. Choose a runtime/quant format that keeps the model under your device memory ceiling (target the published ~2.5 GB memory range).
3. Wire a single tool adapter (for example, a local file reader) and run a smoke test measuring tokens/s and peak memory against the published baselines.

Concrete example: a solo founder runs LFM2.6B on a laptop, gives the agent permission to read a project folder, then asks it to summarize key points from meeting notes saved as text files. The whole process stays on-device and is measured against the published tok/s and memory baselines.

Reference: model description and baselines: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

## What you will build and why it helps

You will build a simple local agent that:
1. Loads LFM2.5 or LFM2.6B on-device.
2. Exposes one tool adapter (for example, a local file reader or a small search shim).
3. Runs a short multi-step workflow: tool call → aggregation → final answer.

Why this helps small teams and founders:
- Privacy: inference and document processing stay on-device, avoiding cloud inference endpoints. See: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Predictable cost: no per-request cloud bill; costs are mostly one-time (download, storage).
- Practical performance: use the published baselines (~220 tok/s M5 Max, ~113 tok/s AMD Ryzen) and the memory target (~2.5 GB) as acceptance criteria for your pilot. See: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Plain-language note on training lineage (short): the model was pre-trained on a very large corpus (~34 trillion tokens) and then adapted to agent tasks through several post-training steps. Those post-training steps are: supervised fine-tuning (SFT), teacher specialization, multi-domain on-policy distillation (MOPD), and agentic reinforcement learning (Agentic RL). These stages improve tool use and multi-step behavior: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Definitions (first use):
- SFT = supervised fine-tuning.
- MOPD = multi-domain on-policy distillation.
- RL = reinforcement learning.

## Before you start (time, cost, prerequisites)

Every bullet below links back to the model announcement and baselines: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

- Minimum hardware: a modern laptop or small server (Apple M-series or a recent AMD/Intel CPU) that can approach the published baselines.
- Memory target: plan for typical inference memory use under ~2.5 GB when using a suitable quantized format.
- Model scale and context: the model was pre-trained on ~34T tokens and mid-training extended the context window to 128K, which helps longer local contexts: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Post-training pipeline: two SFT rounds, teacher specialization, MOPD, and Agentic RL—these steps improve tool calling and multi-step planning: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Minimal prerequisites checklist:
- [ ] Hugging Face account and model repo access
- [ ] Chosen inference runtime or binary for your platform
- [ ] Quant/config file template ready to commit
- [ ] Tool adapter skeleton (file reader or search shim)

Cost note: storage and bandwidth for model artifacts vary by quantization and format. The model identifier LFM2.6B denotes the ~2.6 billion-parameter family you will fetch from the model page above.

## Step-by-step setup and implementation

Plain-language explanation before advanced details:
This section gives a short, practical runbook. Follow the steps in order: download the model, pick a runtime and quant format that fit your memory target, add one small tool adapter, then run a smoke test and measure throughput and memory. The advanced details (quant config choices, profiling commands) come after the basic steps.

These steps reference the model intent and baselines: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

1) Download the model

```bash
# Authenticate and fetch the repo (replace MODEL_ID)
hf login
git lfs install
git clone https://huggingface.co/your-org/LFM2.5-2.6B-model-repo
```

2) Choose runtime & format

| Constraint | Recommendation | Rationale / published baseline |
|---|---:|---|
| Lowest latency on Apple M5 Max | native optimized runtime | Baseline: ~220 tok/s (published) |
| Lower memory (target <2.5 GB) | aggressive quant + mmap | Published typical inference memory under ~2.5 GB |
| Easier development and debugging | PyTorch runtime | Simpler local debugging, higher memory footprint |

Reference for baselines and on-device intent: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

3) Quantize / convert

Example quant config (save as quant-config.yaml):

```yaml
# quant-config.yaml
format: q4_0
mmap: true
threads: 4
block_size: 128
```

4) Implement a single tool adapter (local file reader)

- Keep the adapter small and permission-gated. Treat it as the single trusted integration point.
- Wire minimal I/O and an explicit allow-list for file paths.
- Return parsed text only. Do not send raw binary or metadata the agent does not need.

5) Smoke test and measure

- Run a short multi-step prompt that calls the adapter and synthesizes results. Measure tokens/s and peak memory and compare to the published baselines (~220 tok/s M5 Max; ~113 tok/s AMD Ryzen; memory <= ~2.5 GB): https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

6) Canary & rollout

- Canary on 1–3 devices and collect telemetry (latency, error rate, memory). Use the published baselines as gates.

7) Store reproducible artifacts

- Commit exact quant/config files and a model snapshot or bucketed artifact for reproducibility.

Quick commands to profile during tests:

```bash
# sample: profile memory and CPU during inference
ps aux | grep your-runtime
# capture peak memory via /usr/bin/time
/usr/bin/time -v python run_agent.py --prompt "Summarize file X"
```

## Common problems and quick fixes

Reference for on-device constraints and baselines: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

- OOM (out of memory) on-device
  - Fix: re-quantize with a smaller format, enable mmap, or switch to a runtime with lower memory overhead. Aim to meet the published ~2.5 GB inference memory figure.
- Slow throughput
  - Fix: use an optimized runtime for your CPU/GPU and compare against 220 tok/s (Apple M5 Max) and 113 tok/s (AMD Ryzen) published baselines.
- Tool-call failures or timeouts
  - Fix: isolate the tool adapter behind a feature flag and explicit permission list; add retries and short timeouts in the adapter implementation.
- Unexpected agent behavior for multi-step flows
  - Fix: unit-test each adapter, run end-to-end harness traces, and log each tool call and model output for traceability.

Common troubleshooting commands (useful probes):

```bash
# check runtime threads and CPU affinity
top -H -p $(pidof your-runtime)
# save a trace of model outputs for an example prompt
python run_agent.py --prompt-file sample_prompt.txt --dump-trace trace.json
```

## First use case for a small team

Target scenario: a solo founder or a 1–3 person team who want an on-device research assistant that reads local documents and drafts summaries without sending text to a cloud endpoint. See the model announcement and baselines: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Concrete, actionable steps for small teams:
1. Start with LFM2.5 or LFM2.6B locally and a single adapter: implement a minimal file-reader adapter that returns plain text snippets to the agent. The model was trained for on-device tool use and multi-step workflows: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
2. Quantize to hit the device memory target (published typical inference memory under ~2.5 GB). Measure tokens/s on your machine and compare to published baselines (~220 tok/s M5 Max or ~113 tok/s AMD Ryzen) before adding features: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
3. Keep the chain short at first: file read → extract → summarize. This reduces debugging surface and uses the model’s agentic training for tool calls: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
4. Log every tool call and model response for the first 7 days of pilot use; review logs daily to detect hallucinations or adapter failures.

Operational tip: commit quant/config files to a git tag and use a single canary device to smoke test before giving access to others. Use the model page above as your single source of truth: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

## Technical notes (optional)

Short methodology note: baseline throughput and memory figures used above come from the upstream announcement and published measurements: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Key technical facts from the source:
- Pre-training scale: ~34T tokens.
- Extended context window in mid-training: 128K.
- Post-training pipeline: four stages — two SFT rounds (supervised fine-tuning), teacher specialization, MOPD (multi-domain on-policy distillation), and Agentic RL (agentic reinforcement learning).
- Reported inference baselines: ~220 tok/s on Apple M5 Max; ~113 tok/s on AMD Ryzen; typical inference memory use under ~2.5 GB.

Compatibility note: the model was trained in popular agent harnesses to improve tool-calling behavior. Keep tight interface contracts and unit tests per adapter: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

## What to do next (production checklist)

### Assumptions / Hypotheses
- Pilot time per developer: 60–120 minutes to produce a single-laptop proof-of-concept (download, quantize, wire one tool, smoke tests). (Operational assumption.)
- Canary duration: 48–72 hours on 1–3 canary machines to gather telemetry (latency, errors). (Operational assumption.)
- Retry/backoff design for adapters: 3 retries with short exponential backoff (100 ms → 500 ms → 1 s) for transient I/O failures. (Operational assumption.)
- Acceptance gates you will apply: throughput at or above the published baselines (>=220 tok/s on Apple M-series, >=113 tok/s on AMD), peak memory <= ~2.5 GB, and error rate <5% during the canary. (Derived from published baselines.)

### Risks / Mitigations
- Risk: OOM or excessive latency when running the model on small devices.
  - Mitigation: re-quantize to a smaller format, enable mmap, reduce thread count, or move to a device with more RAM. Target peak memory <= ~2.5 GB where feasible.
- Risk: tool adapter leaks data off-device.
  - Mitigation: strict permission gating, code review, and unit tests that assert no outbound network calls from the adapter.
- Risk: unexpected multi-step behavior or hallucinations.
  - Mitigation: log each step, require human review for production answers initially, and run end-to-end harness traces to reproduce failures.

### Next steps
- Implement the single-adapter prototype and commit quant/config artifacts to a tag or bucket for rollback.
- Run the smoke test and capture metrics: tokens/s, peak memory, latency percentiles, and error rate.
- Canary rollout: deploy to 1–3 machines for 48–72 hours and compare telemetry to acceptance gates above.
- Rollback criteria: revert to the previous model snapshot if latency exceeds 2x baseline or error rate >5% during the canary.
- Maintenance: store exact quant/config artifacts, run weekly checks for the first 4 weeks, then monthly. Keep a human-in-the-loop approval for high-risk outputs during early production.

Reference and full details: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
