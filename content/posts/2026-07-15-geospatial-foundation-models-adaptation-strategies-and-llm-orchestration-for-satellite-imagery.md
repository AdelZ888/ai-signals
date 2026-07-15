---
title: "Geospatial Foundation Models: adaptation strategies and LLM orchestration for satellite imagery"
date: "2026-07-15"
excerpt: "How Geospatial Foundation Models let teams skip costly pretraining: compare finetuning vs vision–language zero‑shot, and see how LLMs can orchestrate imagery analysis."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-15-geospatial-foundation-models-adaptation-strategies-and-llm-orchestration-for-satellite-imagery.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "geospatial"
  - "geospatial-foundation-models"
  - "pretraining"
  - "vision-language"
  - "finetuning"
  - "LLM-orchestration"
  - "MLOps"
  - "agentic-reasoning"
sources:
  - "https://arxiv.org/abs/2607.12177"
---

## TL;DR in plain English

- GeoFMs (Geospatial Foundation Models) are large AI models pre-trained on huge collections of satellite and aerial imagery. This lets teams skip the expensive pre-training step and focus on adapting or prompting the model for their task. See https://arxiv.org/abs/2607.12177
- Two common GeoFM types in the paper: finetunable vision models (best for dense, labeled outputs) and vision–language models (VLMs) that enable open‑vocabulary, zero‑shot use. See https://arxiv.org/abs/2607.12177
- Separation of duties: model providers handle pre-training; domain teams adapt or prompt the GeoFM. That speeds iteration and can keep sensitive data local. See https://arxiv.org/abs/2607.12177
- Agentic pattern: use a large language model (LLM) as an orchestrator that calls GeoFMs as tools. The LLM accepts plain‑English queries, runs the right GeoFM, and returns a short actionable report. See https://arxiv.org/abs/2607.12177

Quick scenario (concrete example):
- A small disaster response team asks: “Which roads are likely blocked in the flood area?” The LLM orchestrator runs a VLM to surface candidate tiles. The team labels 50 examples for the highest‑risk roads and trains a small adapter. The orchestrator then ranks tiles and produces a one‑page summary for field teams.

Plain‑language note before advanced details: GeoFMs let you skip costly pre-training. Think of the provider model as a long‑trained camera. You either point it with a short prompt (VLM / zero‑shot) or attach a small lens (adapter/head) and fine‑tune behaviors with a little labeled data. An LLM can be the controller that decides which approach to use for each user query.

## What you will build and why it helps

You will prototype a small pipeline that does three things:
1) Receive a plain‑English query (via an LLM).  
2) Choose a GeoFM tool (a VLM prompt or a finetuned adapter).  
3) Run inference on imagery tiles and return a short actionable report plus ranked tiles.

Definitions (first use):
- GeoFM: Geospatial Foundation Model. A model pre-trained on large geospatial datasets. See https://arxiv.org/abs/2607.12177.  
- LLM: Large Language Model. A model that processes and generates text.  
- VLM: Vision–Language Model. A GeoFM trained to link images and text for open‑vocabulary queries.

Why this helps (from the paper):
- Faster iteration. Providers do the heavy pre-training; your team adapts or prompts for the mission. See https://arxiv.org/abs/2607.12177.  
- Flexibility. Different GeoFM families support different adaptation strategies (prompting vs adapter vs full finetune). See https://arxiv.org/abs/2607.12177.  
- Higher‑level reasoning. An LLM can orchestrate GeoFMs to move from image perception to task‑level decisions. See https://arxiv.org/abs/2607.12177.

Concrete artifacts you will produce:
- A small repo with an adapter config and a short training script.  
- A prompt template set and an agent_main.py that selects tools.  
- A one‑page decision table and a short evaluation CSV.

Reference: https://arxiv.org/abs/2607.12177

## Before you start (time, cost, prerequisites)

Time and cost: expect a quick prototype in a few days to two weeks depending on labeling and compute. Using a hosted GeoFM API cuts initial cost and setup. Running large checkpoints locally raises cost and time.

Prerequisites:
- Basic Python and shell skills.  
- Git and a virtual environment (virtualenv or conda).  
- Access to sample imagery (public Sentinel tiles or aerial images) and a simple label store.  
- Either a hosted GeoFM API or a model checkpoint you can run locally.

Short checklist before you code:
- [ ] API key or model access for a GeoFM provider (VLM or finetunable). See https://arxiv.org/abs/2607.12177
- [ ] A small set of sample tiles and a label store that records provenance.  
- [ ] A plan for evaluation and a place to log per‑query metadata (latency, cost, confidence).

Reference: https://arxiv.org/abs/2607.12177

## Step-by-step setup and implementation

These steps follow the adaptation taxonomy in the paper (finetune, head/adapter tuning, prompt/VLM, agentic orchestration). See https://arxiv.org/abs/2607.12177.

1) Choose an adaptation path.
- Use the taxonomy to decide between quick VLM prompts, adapter/head tuning, or a fuller finetune. See https://arxiv.org/abs/2607.12177.

2) Collect and record data.
- Save tiles and sensor metadata (sensor type, date, band info). Record provenance for each labeled item.

3) Obtain model access.
- Option A: call a hosted GeoFM API (recommended for fast prototypes).  
- Option B: run a released checkpoint locally (more control, higher cost).

4) Implement adaptation.
- Adapter / head tuning path: implement a small adapter module and train with early stopping.  
- VLM zero‑shot path: create a few prompt templates and iterate on held‑out examples.

5) Build the LLM orchestrator.
- Accept the user query in plain English.  
- Select a tool (VLM or adapter) using simple rules or a small selector.  
- Fetch tiles, run GeoFM inference, aggregate results, and produce a short human‑facing summary.

6) Evaluate and gate.
- Choose metrics that match your task (F1, IoU, precision@k).  
- Add canary deployment rules and rollback thresholds before production.

Decision table (high level — match taxonomy in the paper):

| Adaptation intent | Typical approach | When to pick it | Notes |
|---|---|---|---|
| Open‑vocabulary / quick exploration | VLM / prompt | Low labeling effort or broad labels needed | Good for rapid triage. See https://arxiv.org/abs/2607.12177 |
| Dense / structured outputs | Adapter / head tuning | Moderate labeled data and need for higher precision | Aligns with finetunable vision models in https://arxiv.org/abs/2607.12177 |
| High‑accuracy production | Larger finetune | Large labeled budgets and long timelines | Use when sustained accuracy is required. See https://arxiv.org/abs/2607.12177 |

Example commands (bash):

```bash
# clone and set up a venv
git clone https://example.com/geo-proto.git
cd geo-proto
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Example adapter config (adapter.yaml):

```yaml
model: geofm-vision-large
adapter:
  type: bottleneck
  dim: 64
training:
  epochs: 3
  batch_size: 8
  lr: 1e-4
evaluation:
  metrics: [f1, iou]
```

Reference: https://arxiv.org/abs/2607.12177

## Common problems and quick fixes

These issues and mitigations reflect operational points in the paper about capabilities and operationalization. See https://arxiv.org/abs/2607.12177.

- VLM outputs are vague or hallucinate.
  - Fix: add calibration examples, refine prompts, or switch to adapter/head tuning for structured outputs.

- Domain shift (different sensor, season, or geography) reduces accuracy.
  - Fix: add sensor‑specific calibration, augment your training data, or block inputs that fail basic sensor checks.

- Unexpected inference cost.
  - Fix: batch or downsample tiles, enforce per‑query budgets, or use a cheaper adapter model for bulk calls.

- Orchestrator picks the wrong tool.
  - Fix: add rule‑based fallbacks, log every decision, and retrain a small selector with logged examples.

Quick troubleshooting checklist:
- [ ] Per‑query logging enabled (tool choice, latency, confidence).  
- [ ] Canary plan and rollback thresholds defined.

Reference: https://arxiv.org/abs/2607.12177

## First use case for a small team

This is a concise, practical path for a solo founder or a 1–3 person team. It follows the agentic GeoFM pattern and the adaptation taxonomy. See https://arxiv.org/abs/2607.12177.

1) Start with a VLM zero‑shot pass.
- Use a hosted VLM to surface candidate tiles. Treat this as triage to avoid heavy infra and to iterate prompts quickly.

2) Label a narrow priority set.
- Pick 2–4 critical classes and label a focused set of examples. Keep definitions simple and review fast.

3) Move to a small adapter if needed.
- If zero‑shot is too noisy, train a head‑only or adapter module on your labeled set. Use early stopping and low‑epoch runs.

4) Keep the agent minimal.
- Implement a tiny LLM loop: accept query → run VLM probe → optionally call adapter → return ranked tiles and a short summary. Log all decisions.

5) Operational hygiene for small teams.
- Automate ingestion, keep labels and provenance together, and add a simple dashboard with latency and recent accuracy checks.

Team roles for 1–3 people (practical split):
- Solo/founder: product decisions and LLM orchestrator code.  
- Data/labeler: quick labeling and prompt calibration.  
- Ops/dev: run adapter experiments or manage hosted API usage.

Reference: https://arxiv.org/abs/2607.12177

## Technical notes (optional)

- Model families: the paper describes finetunable vision models produced by self‑supervised methods (e.g., masked auto‑encoding) for dense tasks, and contrastive vision–language GeoFMs for open‑vocabulary zero‑shot capabilities. See https://arxiv.org/abs/2607.12177.

- Taxonomy: finetune, head/adapter tuning, prompt/VLM, and agentic orchestration. Use the taxonomy to pick cost‑effective adaptation paths. See https://arxiv.org/abs/2607.12177.

- Monitoring: log per‑query model choice, latency, cost, and confidence so you can trace agent decisions and detect drift early. See https://arxiv.org/abs/2607.12177.

Reference: https://arxiv.org/abs/2607.12177

## What to do next (production checklist)

### Assumptions / Hypotheses

- Core assumption from the paper: providers will handle heavy pretraining, and domain teams will adapt or prompt (separation of duties). See https://arxiv.org/abs/2607.12177.

Operational hypothesis targets to validate in tests:
- Label budgets: 0, 10, 50, 100, 500, 1,000 examples.  
- Latency targets: 200 ms and 500 ms per tile.  
- Cost per query bands: $0.10 and $1.00 USD per query.  
- Summary lengths: 150, 200, 500 tokens.  
- Evaluation thresholds to pilot: F1 ≥ 0.6; precision@10 ≥ 0.7.  
- Canary plan parameters: 5% traffic, 24 hours, automatic rollback within 30 minutes.

These are starting points. Validate them on your data and workflow.

### Risks / Mitigations

- Risk: domain shift causes >10% relative performance drop.  
  - Mitigation: sensor checks, targeted augmentation, tighter canary gates.

- Risk: cost overruns (cost/query above planned bands).  
  - Mitigation: add per‑query budgets, downsample tiles, prefer head‑only inference for bulk calls.

- Risk: sensitive data exposure.  
  - Mitigation: keep downstream labels and provenance on‑premises, and review provider data agreements.

### Next steps

- Prepare a production checklist and privacy signoff.  
- Automate ingestion and reproducible training runs; add CI for agent code and a dashboard for latency (ms), cost ($/query), and accuracy (F1/precision@k).  
- Publish a short decision table and an SLA that states expected latency targets and escalation steps.

Reference and further reading: https://arxiv.org/abs/2607.12177
