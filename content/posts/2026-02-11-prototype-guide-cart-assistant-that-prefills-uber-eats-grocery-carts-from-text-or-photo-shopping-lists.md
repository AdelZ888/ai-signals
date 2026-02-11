---
title: "Prototype guide: Cart Assistant that prefills Uber Eats grocery carts from text or photo shopping lists"
date: "2026-02-11"
excerpt: "Hands-on prototype: build a Cart Assistant that uses text or photo shopping lists, OCR, and user order history to prefill Uber Eats grocery carts for review before checkout."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-11-prototype-guide-cart-assistant-that-prefills-uber-eats-grocery-carts-from-text-or-photo-shopping-lists.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 480
editorialTemplate: "TUTORIAL"
tags:
  - "ai"
  - "ecommerce"
  - "grocery"
  - "personalization"
  - "computer-vision"
  - "llm"
  - "product"
  - "deployment"
sources:
  - "https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping"
---

## Builder TL;DR

What you’ll build: an MVP Cart Assistant that accepts free-text prompts or an uploaded shopping‑list photo, extracts items (OCR + NLU), maps to SKUs using user order history to pick preferred brands, and populates the cart for review before checkout. This mirrors the UX pattern announced by Uber Eats on Feb 11, 2026: an AI assistant for grocery shopping that "works with text or image prompts" and surfaces results that users must "double-check your order before putting it through" (https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).

Key flows: text prompt → suggested cart; image upload → OCR → suggested cart; explicit review/confirm step before placing order.

MVP component checklist: UI input, image uploader, OCR pipeline, LLM NLU with prompt templates, brand‑mapping service (uses user order history), cart‑population API, telemetry hooks.

Quick architecture snapshot (counts & thresholds): target parsing accuracy > 90%, OCR confidence threshold 0.85, LLM parsing latency < 1s for text prompts and < 500 ms for lightweight cache lookups, user override rate early warning at > 20%, canary rollout at 1% of grocery users.

Methodology note: this tutorial is a hands‑on prototype guide inspired by Uber Eats’ Feb 11, 2026 announcement and uses that article as the reference for behavior (text + image inputs and the UX requirement to double‑check) — https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.

## Goal and expected outcome

Primary goal: deliver a prototype that reliably converts text or image inputs into a populated grocery cart while using each user’s order history to prefer familiar brands. See the original announcement behavior: text/image inputs are supported and the UI requires users to confirm before checkout (https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).

Expected outcome: users can provide a short list (e.g., "milk, eggs, cereal") or upload a photo of a handwritten/printed list and get a prefilled cart for review. Acceptance criteria (artifact):

- Parsing accuracy on test set ≥ 90% (items correctly extracted and normalized).
- OCR median confidence ≥ 0.85; trigger re‑capture below 0.60.
- Brand match rate (preferred from order history) ≥ 70% when history exists.
- User override rate target < 20% in the first 30 days.

Non‑goals for MVP: advanced recipe planning, multi‑person collaborative lists, or inventory negotiation across multiple stores.

## Stack and prerequisites

Minimal stack:

- Frontend: Web or mobile UI with text input and image upload + review modal.
- OCR: Tesseract or cloud OCR (Azure/Google/AWS). 
- LLM/Instruction model: hosted LLM for NLU and list normalization (prompt‑engineered). Budget example: 100K tokens/month budgeted; tune to ~50–200 tokens per item for parsing/clarification flows.
- Backend: Orchestration service, Product catalog & SKU resolver, Personalization service (order history read), Cart API.
- Observability: metrics + logs (SLOs), tracing.

Security & privacy prerequisites: consent flag to read order history, role‑based access control for PERSONALIZATION_READ_ROLE, retention policy for temporary images (e.g., purge after 24 hours), and PII redaction in logs.

Example required env keys:

```yaml
OCR_API_KEY: "${OCR_API_KEY}"
LLM_API_KEY: "${LLM_API_KEY}"
CART_API_ENDPOINT: "https://api.example.com/cart"
PERSONALIZATION_READ_ROLE: "personalization-reader"
OCR_CONF_THRESHOLD: 0.85
```

(https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping)

## Step-by-step implementation

1. Wire the UI

   - Add a text prompt box and an image uploader. Show a clear hint: "You can type a list or upload a photo." Require an explicit review modal before checkout (matching the announcement guidance to double‑check). Include the Verge link in the help tooltip: https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.

2. Implement image pipeline

   - Upload → temporary storage (TTL 24h) → OCR. Reject images with OCR confidence < 0.60 and prompt user to retake. Default accept at ≥ 0.85. Retry up to 3 times on transient OCR errors.

   Example upload command (bash):

```bash
# upload image and request OCR
curl -X POST "https://storage.example.com/upload" \
  -H "Authorization: Bearer $UPLOAD_KEY" \
  -F "file=@list.jpg" \
  -F "ttl=86400"
# then
curl -X POST "https://ocr.example.com/parse" -H "API-Key: $OCR_API_KEY" -d '{"url":"https://storage.example.com/obj/abc"}'
```

3. NLU parsing with LLM

   - Send the OCR text (or raw text prompt) to an LLM with a strict extraction instruction: return JSON list of items with quantity, unit, and uncertainty score. Keep the prompt small: budget 50–150 tokens per request. Cache frequent prompts.

```json
{
  "prompt": "Extract items from this list. Return JSON [{\"name\":..., \"qty\":..., \"unit\":..., \"confidence\":...}].",
  "max_tokens": 300
}
```

4. Personalization & SKU mapping

   - For each canonical item, query personalization service for preferred brand/SKU (if user has ≥ 1 prior purchase for that canonical). If no history, fall back to best‑selling SKU in the region.

   Decision thresholds:

   - Prefer SKU from history if count >= 2 purchases in last 180 days.
   - If SKU price delta > 30% vs best‑seller, surface both and default to cheaper option.

5. Cart population and review

   - Call cart API to add SKUs and return a review modal showing brand, price, qty, and an "edit" button.
   - Do an inventory pre‑check (synchronous): any out‑of‑stock SKU triggers replacement attempt; if replacement not available, mark item as unavailable and require user action.

6. Telemetry and metrics

   - Log OCR confidence, LLM parse confidence, personalization reason (history vs fallback), latency breakdown, and user override count. SLOs: parsing time <1s for text, overall feature path median latency < 2s. Alert if user override rate > 20% or add‑to‑cart failure rate > 1% for canary.

7. Iterate

   - Run A/B tests for different prompt wording, and collect top 100 failure examples for model/prompt tuning.

(https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping)

## Reference architecture

High-level components and data flow (image/text → OCR/LLM → canonical items → personalization → SKU resolution → cart → review):

- UI (Web/Mobile)
- Upload storage (TTL 24h)
- OCR Service (cloud or self‑hosted)
- LLM/NLU Service (hosted)
- Personalization Service (order history read)
- Product Catalog & SKU Resolver
- Cart API
- Observability (metrics, tracing, logs)

Metrics table:

| Metric | Target | Alert threshold |
|---|---:|---:|
| Parsing accuracy | ≥ 90% | < 85% |
| OCR median confidence | ≥ 0.85 | < 0.70 |
| User override rate | < 20% | > 30% |
| Add‑to‑cart success | ≥ 99% | < 98% |
| Median total latency (text) | < 1s | > 2s |

Sample Kubernetes deployment fragment (env & probes):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cart-assistant
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: assistant
        image: registry.example.com/cart-assistant:v1.2.0
        envFrom:
        - secretRef:
            name: cart-assistant-secrets
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 15
```

(https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping)

## Founder lens: ROI and adoption path

Primary ROI levers:

- Reduced friction → conversion uplift. Target conversion delta +5–15% in early A/B tests.
- Personalization → higher AOV. Goal: +3–8% AOV when brand matches preferred SKU.
- Retention: convert frequent grocery buyers to weekly users; measure retention at 7 and 30 days.

Adoption rollout path:

- Closed beta: 1% of grocery users (canary). Promote if canary meets gates within 14 days.
- Broader pilot: 10% for 30 days with improved telemetry.
- Full rollout: promote via feature flag to 100% after meeting success metrics.

Rollout gates (explicit):

- Gate 1 (canary 1%): add‑to‑cart success ≥ 99%, user override rate ≤ 20%, conversion delta ≥ +3%.
- Gate 2 (pilot 10%): maintain Gate 1 metrics for 14 days and UX NPS ≥ 40.

Rollback plan: immediate feature flag off on any gate breach; roll back to previous stable UI within 15 minutes and run post‑mortem.

(https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping)

## Failure modes and debugging

Common failure modes and mitigations:

- OCR failures: blurry handwriting → detect via OCR confidence < 0.60. Remediation: prompt retake, offer manual text entry. Retry limit: 3 attempts.
- NLU hallucination: model invents items or quantities. Mitigation: enforce strict JSON schema in response parsing, log confidence < 0.5 and fall back to ask clarifying question.
- Personalization mismatch: stale history selects wrong brand. Mitigation: require at least 2 purchases in last 180 days, otherwise prefer best‑seller.
- Inventory/price mismatch: item added but out of stock at checkout. Mitigation: inventory pre‑check at cart populate and final pre‑checkout revalidate.
- Latency spikes: LLM/OCR slow. Mitigation: circuit breaker & degraded UX that falls back to text‑only quick parse; alert on median latency > 2s.

Debugging checklist (quick):
- Reproduce with the same photo/text & check OCR confidence and raw OCR output.
- Inspect LLM prompt/response and confidence; run with higher temperature=0.0 for deterministic output.
- Confirm personalization query returned historical SKU counts and timestamps.
- Verify add‑to‑cart API logs and inventory checks.

(https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping)

## Production checklist

### Assumptions / Hypotheses

- Users prefer brands shown in their order history and will accept replacements when clearly labeled.
- Parsing accuracy target > 90% is achievable with combined OCR + prompt engineering and a small curated training set.
- A canary at 1% of grocery users will surface major UX and reliability issues within 14 days.

### Risks / Mitigations

- Privacy risk: using order history is PII‑sensitive. Mitigation: explicit consent, access roles, and 24h TTL for uploaded images.
- UX risk: high user override rate (> 20%). Mitigation: surface brand selection prominently and allow quick change; collect override reason.
- Cost risk: LLM/OCR spend. Mitigation: cache common prompts, batch requests, and cap tokens per request (e.g., 300 tokens max per parse).

### Next steps

- Build a 1% canary with feature flags and monitor the gates for 14 days.
- Run a 2‑arm A/B test measuring conversion lift, AOV delta, and override rate. Track retention at 7 and 30 days.
- Iterate prompts and OCR heuristics using top 100 failure examples.

- [ ] Implement text + image UI and opt‑in consent flow
- [ ] Wire OCR pipeline with 24h TTL for images
- [ ] Add LLM parser and JSON schema validation
- [ ] Implement personalization decision table and SKU resolver
- [ ] Add telemetry dashboards and alerts

(https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping)

Rollout/rollback summary:

- Canary: 1% users for 14 days. Promote to pilot (10%) if Gate 1 satisfied.
- Feature flag toggle for instant rollback; full rollback timeline targeted at ≤ 15 minutes to disable and redirect.

Example prompt template (TS snippet):

```ts
export const parsePrompt = (text: string) => `Extract items from the user list. Return ONLY valid JSON array of {name, qty, unit, confidence}. Input: "${text}"`;
```

Final note: follow the UX sanity check described in the source — always require users to double‑check the populated cart before checkout (https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).
