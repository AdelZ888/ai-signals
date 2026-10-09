---
title: "ASTRO — an offline, self-improving voice assistant for Raspberry Pi 5"
date: "2026-10-09"
excerpt: "Guide to running ASTRO locally on a Raspberry Pi 5: wake-word, on-device STT/TTS, optional Hailo NPU support, and LoRA-based self-training for private, offline voice assistants."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-09-astro-an-offline-self-improving-voice-assistant-for-raspberry-pi-5.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "raspberry-pi"
  - "raspberry-pi-5"
  - "edge-ai"
  - "voice-ai"
  - "self-hosted"
  - "hailo"
  - "stt"
  - "tts"
sources:
  - "https://github.com/mobium-app/ai_astro_public"
---

## TL;DR in plain English

- What this is: ASTRO is an offline‑first, self‑hosted voice agent you can run on a Raspberry Pi. It is open source: https://github.com/mobium-app/ai_astro_public.
- Why try it: raw audio can stay on the device. You can prototype a privacy‑first assistant quickly. The project advertises support for Raspberry Pi + Hailo NPU, wake word, speech‑to‑text (STT), text‑to‑speech (TTS), vision, and LoRA self‑training (see repo). Source: https://github.com/mobium-app/ai_astro_public.
- Quick next actions: clone the repo, check audio in/out, run the demo pipeline (wake → speech → response), and keep all automatic model updates behind a conservative canary gate (start with 1 device or 5% rollout).

Concrete short targets you can use now:
- Time: 4–8 hours to get a working prototype.
- Capture: aim for 16 kHz audio.
- Latency: target <300 ms total response for simple confirmations.
- Pilot goal: for a 2‑week pilot, 2 people / 1 kiosk / 100 approved interactions / false wakes <5%.

Example scenario: set up one Raspberry Pi at a kiosk. A customer says the wake word. The device captures audio locally, converts speech to text, runs simple logic, and replies with on‑device speech. No raw audio leaves the device unless you explicitly export it.

Plain-language note before advanced details: this guide shows what pieces you need, how to check them, and one safe rollout pattern for on‑device fine‑tuning. If you want more advanced options later (accelerators, LoRA updates), those steps are below. Start simple and verify basic audio roundtrip first.

## What you will build and why it helps

Plain explanation first: you will assemble a small device that listens for a wake word, records a short clip, turns speech into text on the device, and sends spoken replies from the device. Optionally, it can capture images for later fine‑tuning. This keeps private data local and reduces cloud costs and latency.

You will make a single‑board device that:
- Listens for a wake word and opens the microphone briefly.
- Runs on‑device speech recognition (STT) and local speech output (TTS).
- Optionally watches a camera and saves examples for later fine‑tuning with LoRA (low‑rank adapter) updates.

Why this pattern helps:
- The repository advertises Raspberry Pi + Hailo NPU support, wake‑word, STT, TTS, vision, and LoRA self‑training — an offline, privacy‑first approach that reduces cloud dependence. Source: https://github.com/mobium-app/ai_astro_public.

Comparison (high level):

| Dimension | Cloud service | Offline ASTRO prototype |
|---|---:|---:|
| Raw audio exposure | sent to cloud | kept local (0% required cloud) |
| Typical cost per interaction | $0.001–$0.05+ | mostly fixed hardware cost ($70–200) |
| Typical latency | 100–300 ms+ (network) | local target <200–300 ms |
| Setup time | varies | prototype in 4–8 hours |

Notes on terms: STT = speech‑to‑text. TTS = text‑to‑speech. LoRA = low‑rank adapter (a parameter‑efficient fine‑tuning method). NPU = neural processing unit (hardware accelerator, e.g., Hailo).

## Before you start (time, cost, prerequisites)

- Estimated time to prototype: 4–8 hours.
- Hardware cost ranges: Raspberry Pi 5 ~$70–100, microphone + speaker ~$20–50, optional Hailo NPU ~$100–200, microSD 32–128 GB.
- Minimum skills: basic Linux (SSH), Git, and Python familiarity. Also basic audio troubleshooting skills (arecord/aplay or ALSA knowledge).
- Network: you need internet to clone and install dependencies. Runtime can run offline after setup.

Checklist:
- [ ] Clone the ASTRO repo: https://github.com/mobium-app/ai_astro_public
- [ ] Have one Raspberry Pi prepared (Pi 5 recommended)
- [ ] Plug in and test a USB mic and a speaker
- [ ] Prepare a 32–128 GB microSD card with Raspberry Pi OS
- [ ] Optional: Hailo NPU installed if you plan to accelerate inference
- [ ] Python 3.10+ (or repo‑specified) and virtualenv available

Minimum software examples: Python 3.x, pip, git, ALSA (arecord/aplay). See the repository for full setup details: https://github.com/mobium-app/ai_astro_public.

## Step-by-step setup and implementation

1) Clone the repository and inspect docs.

```bash
git clone https://github.com/mobium-app/ai_astro_public.git
cd ai_astro_public
ls -la
```

2) Flash Raspberry Pi OS to a 32–128 GB microSD card and enable SSH/audio.
- Update packages after first boot:

```bash
sudo apt update && sudo apt upgrade -y
```

3) Verify audio devices.

```bash
arecord -l   # list capture devices
aplay -l     # list playback devices
```

Recommended capture sample rate: 16 kHz for many on‑device speech models. If device listing fails, add the pi user to the audio group and replug.

4) (Optional) Attach a Hailo NPU and follow vendor driver instructions. The repo lists Pi + Hailo support (https://github.com/mobium-app/ai_astro_public). Keep a CPU/quantized fallback if drivers fail.

5) Create a Python virtual environment and install requirements.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

6) Example config (edit paths and flags as needed):

```yaml
# config.yaml
microphone_device: hw:1,0
sample_rate: 16000
wakeword_model: models/wake.tflite
stt_model: models/stt_quant.tflite
tts_model: models/tts.tflite
npu_enabled: false
lora_enabled: true
lora_learning_rate: 1e-4
retention_days: 30
```

7) Run a wake listener demo and confirm audio roundtrip.

```bash
python tools/wake_listener.py --config config.yaml
```

8) Safe LoRA adaptation gates (summary): archive approved audio→transcript pairs locally. For rollout, start with 1 canary device or 5% of fleet. Require 100 approved interactions and ensure word‑error‑rate (WER) does not worsen by more than 2% before wider deployment. The repository advertises self‑training features; use conservative validation for production changes. Source: https://github.com/mobium-app/ai_astro_public.

## Common problems and quick fixes

- Audio device not found
  - Fix: add user to audio group and recheck devices.

```bash
sudo usermod -aG audio pi
arecord -l
```

- Too many false wakeups (>5%)
  - Fixes: lower microphone gain, add a 1–2 s suppression window after activation, or switch to a different wake model.

- Hailo NPU driver issues
  - Fix: test kernel and driver compatibility on a lab canary; set npu_enabled: false to fall back to CPU/quantized models.

- LoRA updates degrade accuracy
  - Fix: stop automatic rollouts, revert to the last snapshot, validate on a held‑out set of at least 100 interactions before retrying.

- Storage fills from recordings
  - Fix: set retention_days to 7–30 days, enable daily rotation, and purge or offload archives when disk >80% full.

Performance checks to run now: measure per‑stage latency in ms (wake detection, STT, LM processing, TTS). Targets: confirmation under 300 ms for simple replies, and false wake rate under 5%.

Reference for features: https://github.com/mobium-app/ai_astro_public.

## First use case for a small team

Scenario: two people run ASTRO at a single retail kiosk for a 2‑week pilot.

Minimum rollout steps and targets:
1. Setup prototype on one Pi in 4–8 hours and confirm basic audio loop.
2. Collect 1–2 days of interactions; aim for 100 approved samples before automated adapter application.
3. Enable a canary: 1 device or 5% of fleet; require manual approval after canary validation.
4. Pilot length: 1–2 weeks. Success metrics: recognition accuracy >85%, avg response latency <300 ms, false wakeups <5% per day.

Roles & responsibilities:
- Operator (1): installs hardware and checks power.
- Developer (1): manages logs, trains LoRA adapters, and runs validation.

Advice for solo founders: keep LoRA adaptation manual for the first 20–100 updates and use a single device while tuning.

Source and capabilities: https://github.com/mobium-app/ai_astro_public.

## Technical notes (optional)

Acronym definitions:
- STT = speech‑to‑text (converts audio to text).
- TTS = text‑to‑speech (converts text to spoken audio).
- NPU = neural processing unit (hardware accelerator such as Hailo).
- LoRA = low‑rank adapter (a parameter‑efficient fine‑tuning technique).

LoRA guidance: use small learning rates (example: 1e‑4) and validate on a held‑out set of at least 100 interactions. Store adapters separately and keep base weights immutable.

Example model layout recommendation:

```text
/models/
  base-stt.bin        # base speech model
  base-tts.bin        # base TTS model
  adapters/
    lora-2026-10-01-001.zip
    lora-2026-10-08-005.zip
```

NPU tradeoffs: Hailo support can reduce latency and power use but adds driver and kernel complexity. Keep a CPU/quantized fallback for reliability.

Privacy note: keep raw audio local, encrypt backups, and require operator approval before uploading raw data off‑device. See the repository for stated features: https://github.com/mobium-app/ai_astro_public.

## What to do next (production checklist)

### Assumptions / Hypotheses

- The repository at https://github.com/mobium-app/ai_astro_public provides the ASTRO codebase and advertises support for Raspberry Pi + Hailo NPU, wake word, STT/TTS, vision, and LoRA self‑training.
- Time and cost estimates (4–8 hours; $70–200 hardware ranges), capture rate (16 kHz), and operational thresholds (100 approved interactions; false wake <5%; latency <300 ms; WER change <2%) are conservative recommendations and must be validated on your hardware and in your environment.

### Risks / Mitigations

- Risk: LoRA adapters degrade user experience.
  - Mitigation: require 100 approved interactions and non‑worsening validation (WER change <2%) in a canary before wider rollout.
- Risk: storage grows unbounded.
  - Mitigation: set retention_days (7–30), purge daily, and offload when disk >80% full.
- Risk: NPU drivers cause instability.
  - Mitigation: keep a tested CPU/quantized fallback and validate driver updates on a lab canary (1 device) before fleet deployment.

### Next steps

- Harden device: enable unattended security updates, set disk and CPU alerts, and consider read‑only rootfs for critical kiosks.
- Monitoring & alerts: collect uptime, false‑positive rate (>5% alert), command success rate (<85% incident), inference latency (>300 ms alert), and storage (>80% full alert).
- Backup & rollback: snapshot base weights and adapters before applying changes; keep quick rollback scripts available.
- Scale path: for many devices, centralize non‑sensitive telemetry, sign artifacts for updates, and start broader rollouts at 5% then 25% before full fleet.

Quick references and source material: https://github.com/mobium-app/ai_astro_public.
