---
title: "LiquidAI d1-3B and d1-omni-600M: multimodal decision models built for edge devices"
date: "2026-10-07"
excerpt: "Overview and benchmarks for LiquidAI's d1-3B and d1-omni-600M: multimodal decision models that return a single answer, with Jetson latencies (16-50 ms) and deployment guidance."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-07-liquidai-d1-3b-and-d1-omni-600m-multimodal-decision-models-built-for-edge-devices.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "multimodal"
  - "edge-ai"
  - "decision-model"
  - "d1-3B"
  - "d1-omni-600M"
  - "NVIDIA Jetson"
  - "LiquidAI"
  - "open-models"
sources:
  - "https://huggingface.co/blog/LiquidAI/open-d1"
---

## TL;DR in plain English

- What this is: LiquidAI published two open decision models on 2026-10-07: d1-3B (3 billion parameters; accepts text + images) and d1-omni-600M (600 million parameters; accepts text + images or text + audio; experimental). Source: https://huggingface.co/blog/LiquidAI/open-d1
- What a "decision model" means: the model returns a single answer in one forward pass. It does not generate token streams like a chat model. This gives lower latency and simpler timeout logic. See: https://huggingface.co/blog/LiquidAI/open-d1
- Key reported latencies for d1-3B: 16 ms on an NVIDIA Jetson AGX Thor, 26 ms on a Jetson AGX Orin, and 50 ms on a Jetson Orin Nano. Use these as sanity gates, not guarantees. Source: https://huggingface.co/blog/LiquidAI/open-d1
- Quick action: pick the right model for your inputs (d1-3B for text+image; d1-omni-600M if you need audio), run device benchmarks, and roll out with a small canary (example: 5%). See: https://huggingface.co/blog/LiquidAI/open-d1

Concrete example: run d1-3B on an Orin Nano to build a text+image safety checker. Aim to reproduce the ~50 ms median before wider rollout. Source: https://huggingface.co/blog/LiquidAI/open-d1

Methodology note: statements above reflect the LiquidAI release. Operational thresholds (like 50 ms) are suggested team gates, not vendor guarantees. Source: https://huggingface.co/blog/LiquidAI/open-d1

## What you will build and why it helps

You will build a minimal on-device inference pipeline. It accepts text + image input and returns a single decision output. That output can be a class label or a short answer. Use d1-3B for text+image work. Use d1-omni-600M only if you need text+audio; it is experimental. See: https://huggingface.co/blog/LiquidAI/open-d1

Why this matters for small teams and solo founders:

- Lower latency. Reported medians are 16 ms, 26 ms, and 50 ms on the devices above. Lower latency helps meet sub-100 ms UX targets and supports many control loops. Source: https://huggingface.co/blog/LiquidAI/open-d1
- Simpler logic. A single answer per forward pass removes streaming token handling and reduces timeout complexity.
- Better on-device fit. Decision models avoid autoregressive decoding. That usually means fewer compute cycles and lower energy use than token-generating models.

Short definitions:

- LFM: Liquid Foundation Models, the base family LiquidAI used to train these decision models. See: https://huggingface.co/blog/LiquidAI/open-d1
- VLM: Vision-Language Model (used in the release name LFM2.5-VL-3B).
- Decision model: a model that returns one answer per forward pass (not a token stream). See: https://huggingface.co/blog/LiquidAI/open-d1

### Plain-language explanation (before advanced details)

These decision models are not chat AIs. You give them input. They run once. They give one answer. This is simpler when you need a fast yes/no or a short label on a device. It is also easier to measure and harden because you do not watch a stream of tokens. If you need audio input, use d1-omni-600M but treat it as experimental and test audio preprocessing carefully. Source: https://huggingface.co/blog/LiquidAI/open-d1

## Before you start (time, cost, prerequisites)

- Models & modalities: d1-3B supports text + images. d1-omni-600M supports text + images or text + audio (experimental). Source: https://huggingface.co/blog/LiquidAI/open-d1
- Model sizes: 3,000,000,000 parameters (d1-3B) and 600,000,000 parameters (d1-omni-600M). Source: https://huggingface.co/blog/LiquidAI/open-d1
- Reported benchmark summaries: d1-3B mean score 82.9; d1-omni-600M mean score 78.4. d1-3B's Decision Index = 48.57 (best under 10B) on Decision Index 0.2.1. Source: https://huggingface.co/blog/LiquidAI/open-d1

Estimate time and quick cost items (team gate estimates):

- Setup & early validation: 4–8 hours to download, run 100 warmup + 1,000 timed runs, and collect medians/p95s per device.
- Optimization pass: 1–3 days for FP16 (16-bit floating point) quantization and input-size tuning.
- Canary rollout: 1–3 days of monitoring at small percentages.

Prerequisites:

- Target device such as an NVIDIA Jetson AGX Thor, Jetson AGX Orin, or Jetson Orin Nano with a compatible JetPack/CUDA stack.
- An inference runtime that supports FP16 (for example ONNX Runtime, Torch-TRT, or vendor-optimized runtimes).
- Access to the model files via the release. See: https://huggingface.co/blog/LiquidAI/open-d1

Minimum checklist:

- [ ] Model choice confirmed (d1-3B or d1-omni-600M). See: https://huggingface.co/blog/LiquidAI/open-d1
- [ ] Target device identified and latency gate set (example: ≤50 ms on Orin Nano).
- [ ] Inference runtime selected and environment pinned.

## Step-by-step setup and implementation

Follow these steps to run a working on-device decision pipeline. Reference: https://huggingface.co/blog/LiquidAI/open-d1

1) Prepare device
- Install the vendor container or match the JetPack/CUDA version required by your Jetson model. Use the vendor docs.

2) Download model
- Pick d1-3B or d1-omni-600M. Verify the checksum after download. The release page lists the model files: https://huggingface.co/blog/LiquidAI/open-d1

Example download (replace with the specific CLI or URL from the release):

```bash
MODEL=d1-3B
mkdir -p /opt/models/$MODEL
# Example placeholder: use huggingface-cli or curl with the release URL
# huggingface-cli repo download user/$MODEL --revision main --output /opt/models/$MODEL
# sha256sum /opt/models/$MODEL/model.bin
```

3) Install an inference runtime
- Use ONNX Runtime, Torch-TRT, or the vendor-optimized runtime. Ensure it supports FP16/Tensor Cores on your device.

4) Preprocess inputs
- Images: resize to the model's target resolution, center-crop, convert to FP16 if supported, and normalize.
- Text: use the tokenizer consistent with the base LFM used to train the model. See release notes about the backbones. Source: https://huggingface.co/blog/LiquidAI/open-d1

5) Run baseline inference and measure
- Batch size = 1.
- Warmup: 100 runs. Timed: 1,000 runs. Record median, p95, and success rate.
- Compare medians to the device references (16 ms, 26 ms, 50 ms) as sanity checks. Source: https://huggingface.co/blog/LiquidAI/open-d1

6) Optimize if needed
- Try FP16, lower input resolution, and runtime-specific graph optimizations. Track accuracy vs latency.

7) Containerize and add rollout gates
- Provide a small HTTP or gRPC endpoint with health and metrics (latency_ms, p95_ms, success_rate).
- Add feature-flag routing for a canary. Start at 5%.

Example config snippet:

```yaml
model:
  name: d1-3B
  modalities: [text, image]
  batch_size: 1
device:
  type: AGX-Orin
  fp_mode: FP16
rollout:
  canary_percent: 5    # 5% initial canary
  latency_gate_ms: 50  # gate example
metrics:
  capture: [latency_ms, p95_ms, success_rate]
```

## Common problems and quick fixes

- Runtime load errors (CUDA/JetPack mismatch).
  - Fix: use the vendor container or pin JetPack/CUDA versions. Check device docs.

- Latency higher than expected (reported medians: 16 ms / 26 ms / 50 ms).
  - Quick fixes: batch_size = 1, enable FP16, reduce image resolution, disable debug logging.

- Corrupted or partial model files.
  - Fix: re-download and verify checksum.

- Audio preprocessing errors with d1-omni-600M (experimental).
  - Fix: confirm sample rate, mono conversion, and encoder expectations.

Latency sanity table (use as a rough guide):

| Device             | Median (ms) | p95 (ms) | Gate (ms) |
|--------------------|------------:|---------:|----------:|
| Jetson AGX Thor    | 16          | 22       | 20        |
| Jetson AGX Orin    | 26          | 40       | 50        |
| Jetson Orin Nano   | 50          | 90       | 100       |

Reference: https://huggingface.co/blog/LiquidAI/open-d1

## First use case for a small team

Scenario: you are a solo founder or a 2–3 person team building an image+text safety checker on Orin Nano with a latency gate ≤50 ms.

Actionable, prioritized steps:

1) Start with d1-3B on a single dev Orin Nano. Measure baseline with 100 warmup runs + 1,000 timed runs. Save median and p95 in a CSV. Aim to reproduce the ~50 ms median reference before committing to scale. Source: https://huggingface.co/blog/LiquidAI/open-d1

2) Use prebuilt vendor containers and a tested runtime (ONNX Runtime or vendor-optimized) to avoid environment debugging. Keep batch_size = 1. Enable FP16 early and measure the effect.

3) Canary and rollback: deploy to 5% of devices for 24 hours. Use these gate criteria:
   - median latency ≤50 ms (Orin Nano gate),
   - p95 latency ≤100 ms,
   - error rate increase ≤0.5 percentage points.
   If a gate fails, rollback within 5 minutes.

4) Keep scope small: return short labels or single-sentence answers. Keep postprocessing tiny.

5) Automate metrics: a CSV with columns [device, model, fp_mode, median_ms, p95_ms, runs=1000]. Store one artifact per build.

6) If you later need audio, treat d1-omni-600M as experimental. Validate audio preprocessing independently before adding it to canary traffic. Source: https://huggingface.co/blog/LiquidAI/open-d1

MVP deliverables (concrete counts):
- 1 Docker image or systemd unit,
- 1 metrics CSV with a 1,000-run summary per device,
- 1 decision mapping table (input → expected output).

Reference: https://huggingface.co/blog/LiquidAI/open-d1

## Technical notes (optional)

- Training backbones: d1-3B was trained from LFM2.5-VL-3B, a decoder-only vision-language model. d1-omni-600M was trained from LFM2.5-Encoder-350M, a bidirectional encoder with added vision and audio encoders. This explains the modality support differences. Source: https://huggingface.co/blog/LiquidAI/open-d1
- Decision-model behavior: single forward pass → one answer. Design timeouts and health checks for single-response semantics rather than streaming tokens.
- Benchmarks: both models were tested on seven public datasets across tasks like reading comprehension, toxicity detection, intent classification, medical QA, and cross-lingual understanding. Reported mean scores: 82.9 (d1-3B) and 78.4 (d1-omni-600M). Source: https://huggingface.co/blog/LiquidAI/open-d1

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: device medians (16 ms, 26 ms, 50 ms) are representative for similar image+text inputs on the same device classes. Your real workload may vary with image resolution and token count. Source: https://huggingface.co/blog/LiquidAI/open-d1
- Hypothesis: FP16 or runtime graph optimizations will reduce median latency by ~20–40% on GPUs with Tensor Cores. Measure this per device.

### Risks / Mitigations

- Risk: d1-omni-600M is an early research release for audio. Mitigation: limit it to canary traffic and validate audio preprocessing thoroughly before wider rollout. Source: https://huggingface.co/blog/LiquidAI/open-d1
- Risk: JetPack/CUDA mismatch causes runtime failures. Mitigation: pin environment and use vendor containers for reproducibility.
- Risk: increased error rate after deployment. Mitigation: automatic rollback if error rate rises >2 percentage points or if latency gates fail for 10 consecutive minutes.

### Next steps

- Run device benchmarks: 100 warmup runs + 1,000 timed runs per target device. Commit median and p95 to your metrics CSV (include device, model version, FP mode).
- Implement canary rollout: 5% for 24 hours → 25% for 6 hours → 100% if gates pass. Example gates: median_latency ≤50 ms (Orin Nano), p95 ≤2× median gate (fail if >100 ms), error_rate increase ≤2 percentage points.
- Containerize with pinned model checksum and add a /health endpoint that reports median_ms, p95_ms, and success_rate.

Reference and full release details: https://huggingface.co/blog/LiquidAI/open-d1
