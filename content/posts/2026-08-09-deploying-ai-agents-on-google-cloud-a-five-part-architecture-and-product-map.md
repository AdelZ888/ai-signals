---
title: "Deploying AI agents on Google Cloud: a five-part architecture and product map"
date: "2026-08-09"
excerpt: "Map Google Cloud products to the five parts of an AI agent: model, tools, memory, runtime loop and agent links. Compares managed models versus self-hosted GPU trade-offs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-09-deploying-ai-agents-on-google-cloud-a-five-part-architecture-and-product-map.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "google-cloud"
  - "ai-agents"
  - "gemini"
  - "model-garden"
  - "adk"
  - "agent-runtime"
  - "cloud-run"
  - "gke"
sources:
  - "https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html"
---

## TL;DR in plain English

- An AI agent consists of five parts: a reasoning model (the brain), callable tools, memory, a runtime loop that orchestrates calls, and links to other agents. These five parts and the production concerns around them are described in the guide: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

- Google Cloud options map to those slots: Model Garden (managed models such as Gemini and Flash tiers), self-hosted inference on Cloud Run / GKE with GPUs (NVIDIA L4 24 GB, NVIDIA RTX PRO 6000 Blackwell 96 GB), ADK and Agent Runtime as higher-level frameworks. See the map at the same source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

- Methodology: this note is grounded on the linked snapshot guide and quotes its product mappings and capacity examples.

## What you will build and why it helps

You will convert a laptop prototype (a model + a runtime loop + tools) into a production architecture that keeps the five parts separable so you can swap, scale, or secure each independently. The linked guide frames the stack and trade-offs: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

Why separate the parts

- Replaceability: swap the model without rewriting tools or memory.
- Cost control: managed pay-per-token (Flash) vs. GPU uptime trade-offs are explicit in the guide.
- Security & observability: isolate tool endpoints and runtime to enforce least privilege and capture token counts and errors.

Concrete elements the guide documents (examples from the source)

- The five-part anatomy: model, tools, memory, runtime loop, agent links (5 parts).
- Model Garden exposes 200+ models inside a Google Cloud project (200+ models). See: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.
- Gemini family examples: Gemini 3.x and Gemini 3.1 Pro; Gemma 4 adds function-calling and structured output (3.x, 3.1, Gemma 4).
- Self-hosting hardware examples called out: NVIDIA L4 (24 GB) and NVIDIA RTX PRO 6000 Blackwell (96 GB); ~70B-class model sizing noted with the larger GPU class (24 GB, 96 GB, ~70B).  
- Agent Arena: benchmark data over 1,000,000+ agent sessions to compare tool orchestration performance (1,000,000+ sessions).

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

## Before you start (time, cost, prerequisites)

Prerequisites (minimum to proceed)

- A Google Cloud project with billing enabled and permission to create services and quotas. See product map: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.
- Familiarity with containers and a CI/CD path to Cloud Run or GKE.
- A small, well-defined set of tool endpoints that return structured JSON (authentication and validation in place).

Cost model notes from the guide

- Managed models via Model Garden (Flash tier) are pay-per-token; they are recommended in the guide for low or variable traffic because they avoid GPU uptime costs.
- Self-hosting moves cost to GPU uptime and gives more control for fine-tuning and data residency; the guide cites L4 (24 GB) and RTX PRO 6000 Blackwell (96 GB) as practical GPU targets. See: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

Quick sanity checks before you deploy

- Confirm billing, service account roles, and quota limits.
- Decide whether you will use Model Garden (managed) or run an inference service (Cloud Run/GKE).

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

## Step-by-step setup and implementation

High-level steps (follow, then adapt):

1) Choose model delivery

- Managed: Model Garden (Gemini / Flash) for pay-per-token access and minimal ops.  
- Self-hosted: run vLLM or another inference engine on Cloud Run or GKE, attach GPUs (L4 24 GB or RTX PRO 6000 Blackwell 96 GB) for sustained throughput. See: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

2) Decompose your agent

- Separate model calls, tool calls, memory reads/writes, and the runtime loop into modules or services so each can be scaled or secured independently.

3) Implement minimal, authenticated HTTP tools returning structured JSON (1 service per capability).

4) Select runtime: Cloud Run / Agent Runtime for scale-to-zero and low ops; GKE when you need node-level GPU control.

5) Instrument: token counts, request rate, p50/p95 latencies, tool failures, and task completion signals.

Decision comparison (summary table)

| Aspect | Managed (Model Garden / Flash) | Self-hosted (Cloud Run / GKE + GPUs) |
|---|---:|---|
| Models available | 200+ models in Model Garden | Any self-hosted weights (control over versions) |
| Cost model | Pay-per-token (Flash) | GPU uptime and instance costs (L4 24 GB, RTX 96 GB) |
| Ops overhead | Low (no GPU infra) | Higher (quota, GPU, runtime ops) |
| Use case | Low/spiky traffic, rapid iteration | High sustained throughput or strict data control |

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

Example quick commands (replace PROJECT_ID)

```bash
# clone a starter repo (example)
git clone https://github.com/example/adk-starter.git agent-starter
cd agent-starter
# build and push an image
docker build -t gcr.io/$PROJECT_ID/agent:latest .
gcloud auth configure-docker
```

Illustrative Cloud Run manifest (adapt to your infra)

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: agent-service
spec:
  template:
    spec:
      containers:
        - image: gcr.io/PROJECT_ID/agent:latest
          env:
            - name: MODEL_SELECTION
              value: "modelgarden-gemini-flash"
```

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

## Common problems and quick fixes

The guide emphasizes three cross-cutting production concerns: observability, security, and evaluation. Use them for triage: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

Quick symptom → first action

- 401 / 403 calling the model → Verify service account IAM and Model Garden access roles.
- Unexpected cost spike → Pause heavy jobs; compare token counts (managed) vs. GPU uptime (self-hosted).  
- High p95 latency → Check traces for cold starts; consider different runtime or scaling settings.
- Tool-call flakiness → Add retries with exponential backoff and a circuit breaker.

Operational tips

- Instrument per-request token counts and alert on sudden increases (Flash is pay-per-token).
- Apply least-privilege IAM to model and runtime accounts.
- Limit persisted memory context to reduce token growth and exposure.

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

## First use case for a small team

Target audience: a small group that needs a useful internal agent quickly. The guide’s anatomy maps directly to this runbook: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.

Minimal rollout sketch (conceptual)

- Prototype on a managed model to avoid GPU provisioning while you validate behavior.
- Deploy a single runtime service that orchestrates model and tool calls; keep it lightweight (orchestrator only).
- Keep tool surface narrow and authenticated; return structured JSON for predictability.
- Collect a few key signals: task completion rate, tokens per request, tool-call success.

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

## Technical notes (optional)

Concrete items cited in the guide (quoted or paraphrased from the source):

- A canonical agent has five parts: model, tools, memory, runtime loop, and agent links (5 parts).  
- Model Garden exposes 200+ models to a Google Cloud project (200+).  
- Gemini family: Gemini 3.x and Gemini 3.1 Pro are given as typical brains; Gemma 4 is noted to include function calling and structured output (3.x, 3.1, Gemma 4).  
- Self-hosting: Cloud Run GPUs mentioned; practical GPUs called out include NVIDIA L4 (24 GB) and NVIDIA RTX PRO 6000 Blackwell (96 GB); 70B-class models are associated with larger GPUs (~70B).  
- Benchmarking: Agent Arena evaluates tool orchestration across 1,000,000+ agent sessions (1,000,000+).  

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

## What to do next (production checklist)

### Assumptions / Hypotheses

- I assume the five-part anatomy (model, tools, memory, runtime loop, agent links) fits your workload; this is the mental model in the source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html.
- I assume Gemini Flash (pay-per-token) is available to you and that its latency and token pricing are acceptable for initial experiments (Flash = pay-per-token as documented).
- I assume GPU types called out in the guide (NVIDIA L4 24 GB, NVIDIA RTX PRO 6000 Blackwell 96 GB) are obtainable in your target region; GPU quota or regional availability can vary.
- Optional rollout parameters you may choose (examples only; NOT asserted by the guide): 3–6 hours to spin up a canary, a 1-week canary window, start traffic slice 10%, human-edit gate 20%, task-completion gate 90%, p95 latency gate 300 ms, tool error gate 2%.

### Risks / Mitigations

- Risk: token or GPU cost overrun. Mitigation: set budget alerts, instrument token counts, and have a policy to revert to managed Flash if GPU spend exceeds expectations.
- Risk: data leakage in logs or tool outputs. Mitigation: redact PII in logs, restrict log access, and limit persisted memory context.
- Risk: GPU quota or regional unavailability. Mitigation: request quota increases early and have a multi-region fallback plan; prefer an L4 (24 GB) baseline GPU for portability.

Reference: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html

### Next steps

- [ ] Finalize model decision (Model Garden / Gemini Flash vs self-hosted inference).
- [ ] Create a minimal service account with least-privilege roles for model access.
- [ ] Deploy a small canary and collect metrics for 1 week (task completion, p95 latency, tokens per request).
- [ ] Verify rollout gates (task success, latency, human edits, tool errors) before wider traffic.

Example deployment commands and minimal env (adapt to your infra)

```bash
# build and push (example)
docker build -t gcr.io/$PROJECT_ID/agent:latest .
gcloud auth configure-docker
gcloud run deploy agent-service --image gcr.io/$PROJECT_ID/agent:latest --region=us-central1
```

```yaml
# minimal illustrative env (adapt to your infra)
env:
  - name: MODEL_SELECTION
    value: "modelgarden-gemini-flash"
  - name: TOOL_ENDPOINT_URL
    value: "https://tools.example.internal/api"
```

Final reference and further reading: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html
