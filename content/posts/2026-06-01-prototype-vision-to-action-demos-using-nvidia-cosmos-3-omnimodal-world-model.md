---
title: "Prototype vision-to-action demos using NVIDIA Cosmos 3 omnimodal world model"
date: "2026-06-01"
excerpt: "How to run NVIDIA Cosmos 3 to prototype vision-to-action demos: give an image or short clip plus a prompt and get text reasoning or pixel-space robot trajectories. Includes code."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-01-prototype-vision-to-action-demos-using-nvidia-cosmos-3-omnimodal-world-model.jpg"
region: "UK"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "cosmos3"
  - "omnimodal"
  - "world-models"
  - "multimodal"
  - "robotics"
  - "vision-language"
  - "NVIDIA"
  - "tutorial"
sources:
  - "https://research.nvidia.com/labs/cosmos-lab/cosmos3/"
---

## TL;DR in plain English

- Cosmos 3 is an "omnimodal" world model. It uses one unified architecture to work with text, images, video, audio, and action outputs. See the project page: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- It can read a visual scene and produce reasoning text or an action plan. Demo outputs include vision-language reasoning and pixel-space trajectories for pick-and-place tasks. The project page shows these capabilities and example prompts: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- Quick next steps: clone the repo, read the model card and examples, download the weights per the model card, and run a supplied demo to see the input/output formats: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- Safety note: use simulation and operator review before any real-world actuation.

Concrete example: In the demos, a prompt like "Put the flower into the red bottle" can produce a pixel-space trajectory. The output format in the demo is a list of (x,y) coordinates describing the gripper path. The project page includes an example trace and reasoning for this task: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

## What you will build and why it helps

You will make a small prototype that turns a camera observation plus a short language prompt into an action output. Inputs can be a single image or a short clip. Outputs can be a text reasoning trace or a pixel-space trajectory for a robot end-effector. The Cosmos 3 project page documents these capabilities and demos: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

Why this is useful for small teams:
- One model that spans perception, language, and action reduces the glue code between separate systems.
- The repo includes demos and example tasks you can adapt. That lowers development time.

Deliverables you will produce:
- One runnable demo output (video + trajectory file).
- A small inference config pointing to the downloaded model weights and device.
- A short decision table mapping input type to the demo task.

Decision table example:

| Input modality | Task type | Output format |
|---|---:|---|
| Single image + prompt | Pick-and-place | Pixel-space trajectory (x,y) list |
| Short clip + prompt | Vision-language reasoning | Text + action suggestion |

Reference: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

### Plain-language explanation of how it works (before advanced details)

Cosmos 3 uses a single model to read different kinds of data. Think of it as a translator that understands words, pictures, videos, sounds, and actions in the same format. That shared understanding lets it answer questions about scenes and suggest actions. For example, given an image and the instruction "put the flower in the red bottle," the model can reason about positions in the image and return a sequence of pixel coordinates for a gripper to follow. The project page describes this multimodal coupling and shows example prompts and outputs: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

## Before you start (time, cost, prerequisites)

- Read the repo README, the model card, and the technical report on the project page: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- Compute: a machine with a Graphics Processing Unit (GPU) is recommended for inference. The project page lists code and model cards as canonical sources: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- Skills: basic Python, shell, and familiarity with running demos and reading model cards.

Prerequisites checklist:
- [ ] Access to a machine where you can install Python and (optionally) GPU drivers.
- [ ] Permission and bandwidth to download model assets per the model card.
- [ ] Ability to run basic Python scripts and inspect logs.

Operational note: confirm numeric budgets (time, GPU memory, latency) in your environment. See Assumptions / Hypotheses below for example operational numbers that must be validated.

## Step-by-step setup and implementation

1. Read the README, the model card, and the technical report to understand interfaces and licensing: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
2. Clone the repo and create a Python environment.

```bash
# clone and prepare environment (example)
git clone https://research.nvidia.com/labs/cosmos-lab/cosmos3.git
cd cosmos3
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Download model weights and assets according to the model card. Keep the weights path in a small YAML or JSON config so demo scripts find them. The project page links the code, model cards, and artifacts: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

```yaml
# example config.yaml
model:
  weights_path: /path/to/cosmos3/weights
  device: cuda:0
  batch_size: 1
inference:
  demo: pick_place
  output_dir: ./outputs
```

4. Run a supplied demo to verify the environment and inspect formats. Example prompt from the demos: "Put the flower into the red bottle." The published demo format returns pixel (x,y) trajectory coordinates as output: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

```bash
# run demo (example)
python demos/run_demo.py --config config.yaml --input examples/flower_bottle.jpg --prompt "Put the flower into the red bottle"
```

5. Inspect saved outputs (video + trajectory list) and logs. Verify the output format matches demo examples.
6. Safety gate: run the model in simulation and require operator review before any live actuation. The project page provides canonical demos and examples you should follow: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

## Common problems and quick fixes

- Model download or license errors: follow the model card and repo instructions exactly; the project page is the authoritative source for code and model-card links: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- Out of memory (OOM): set batch_size to 1, enable mixed precision if supported, or use a larger GPU instance.
- Input format mismatch: validate input shapes and tokenization against the demo examples in the repo.
- Unsafe or unexpected outputs: always gate outputs in simulation. Clamp trajectories to workspace bounds and check for collisions before sending commands to hardware.

Quick config fixes (examples):

```yaml
# quick-tune.yaml
model:
  batch_size: 1
  device: cuda:0
inference:
  precision: amp  # enable automatic mixed precision if available
```

Practical tips:
- Reduce batch_size to 1 to lower GPU memory use (VRAM).
- Use logs and sample outputs from the repo demos as ground truth for format expectations: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

## First use case for a small team

Scenario: a 3-person robotics startup wants a camera-based pick-and-place prototype. The goal is a quick prototype that outputs pixel-space trajectories from single images or short clips. The Cosmos 3 project page documents vision-language reasoning and action outputs you can adapt: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

Roles & responsibilities:

| Role | Main tasks | Artifact |
|---|---|---|
| Developer | Repo setup, demo runs, integration | config.yaml, demo run logs |
| Researcher | Prompt design, evaluation set | prompts.txt, eval results |
| Operator | Simulation tests, safety checklist | sim reports, go/no-go checklist |

Evaluation metric example: require simulated pick success ≥ 70% before live tests (see Assumptions / Hypotheses for validation numbers).

Practical checklist for the team:
- [ ] Clone repo and run an official demo to confirm environment (follow project page: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)
- [ ] Download weights as the model card requires
- [ ] Build a small held-out evaluation set (10–50 examples) to iterate quickly
- [ ] Validate simulated success ≥ 70% on that set before live actuation
- [ ] Approve actuation only when sim metrics pass and operator signs off

Solo founder advice: run official demos on a cloud GPU first. One demo run can take minutes to verify outputs. Keep hardware tests last and small; use strict feature flags and a 10% canary for early rollouts.

## Technical notes (optional)

- Architecture summary (from the project page): Cosmos 3 is a unified "Mixture of Tokens" (MoT)-style architecture. It couples autoregressive and diffusion techniques to operate across language, images, video, audio, and actions. The project page lists example capabilities: vision-language reasoning, generation, and forward/inverse dynamics for robot policies: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
- Testable capabilities from demos: vision-language reasoning, image and audio-visual generation, forward/inverse dynamics, and pixel-space action outputs.
- Artifacts to fetch: repo code, model card, technical report (all linked on the project page).

Methodology note: any numeric or performance claims should be validated in your environment and against the model card.

## What to do next (production checklist)

### Assumptions / Hypotheses

The following numeric items are operational assumptions to validate in your environment. They are examples and not guaranteed measurements from the project page. The canonical references are the repo and the model card at https://research.nvidia.com/labs/cosmos-lab/cosmos3/:

- Estimated first-demo setup time: 4 hours.
- Team example: 3 people (developer, researcher, operator).
- Minimum simulated success gate recommended: 70%.
- Prototype GPU count assumed: 1 GPU.
- Typical comfortable GPU memory (VRAM) assumed for inference: 24 GB.
- Safe batch_size for constrained GPU memory: 1.
- Canary rollout fraction: 10% of devices/robots.
- Short monitoring window for canary: 5 minutes.
- Latency SLO example for interactive tasks: 500 ms median inference.
- Fast rollback response window: 60 seconds to flip a feature flag and revert.
- Evaluation set size for quick iteration: 10–50 examples.

Validate these numbers against your hardware, network, and the model card from the repo: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

### Risks / Mitigations

- Risk: model outputs unsafe or out-of-bounds trajectories.
  - Mitigation: always simulate, clamp workspace positions, and require operator sign-off.
- Risk: license or weight-access restrictions.
  - Mitigation: read and follow the model card and repo licensing before downloading weights.
- Risk: OOM or high latency.
  - Mitigation: reduce batch size, enable mixed precision, or provision larger instances.
- Risk: regression after updates.
  - Mitigation: pin model artifacts, use versioned configs, and run a regression test set (10–50 examples) before promotion.
- Monitoring gates to define: success rate threshold (e.g., >= 70% during sim), error rate threshold (e.g., <= 5% for safety checks), latency SLO (e.g., 500 ms median). Validate these thresholds during testing.

### Next steps

1. Verify repo demos locally; produce a small artifact bundle: demo outputs + config + logs (reference: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
2. Run a 10–50 sample simulated evaluation and record success rate; iterate prompts and safety clamps.
3. Implement rollout with a feature flag and a 10% canary. Monitor the short window (e.g., 5 minutes) and rollback if metrics fall below thresholds.
4. Audit model-card compliance and licensing before any commercial use; consult the model card in the repo: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.

Final note: use the Cosmos 3 demos to learn input/output formats before designing custom integrations. The project page and technical report are the canonical references for capabilities and example outputs: https://research.nvidia.com/labs/cosmos-lab/cosmos3/.
