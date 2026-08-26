---
title: "On-site AI chat using Gemini, a single Google Cloud Function, and Firestore ($5-15/month)"
date: "2026-08-26"
excerpt: "A practical guide to add an on-site AI chat that cites your posts. Uses Gemini embeddings, one Google Cloud Function, Firestore, and hourly RSS. Costs ~$5-15/month."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-26-on-site-ai-chat-using-gemini-a-single-google-cloud-function-and-firestore-dollar5-15month.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ai-chat"
  - "rag"
  - "gemini"
  - "firestore"
  - "cloud-functions"
  - "rss"
  - "embeddings"
  - "serverless"
sources:
  - "https://emergencemachine.com/building-an-ai-chat-for-my-blog/"
---

## TL;DR in plain English

- Add an on-site AI chat that cites and summarizes your blog posts. See the reference build and architecture: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.
- The reference uses a single serverless function on Google Cloud, an hourly RSS pass for fresh posts, and Firestore as the only database. Estimated monthly run cost: $5–15. Frontend hosting example: $4/month. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Prototype time: about 4 hours (~240 minutes). Start with RSS-only retrieval to get most value quickly. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Quick checklist (artifact):
- [ ] Vanilla JS frontend (Server-Sent Events / SSE client) — reference is ~2,000 lines with no external deps
- [ ] One Cloud Function (Python 3.12) doing verification, rate limits, RAG, model streaming, and session management
- [ ] Firestore collections: embeddings, sessions, rate_limits, security_analytics
- [ ] Hourly RSS job that injects up to 15 recent articles

Concrete example / short scenario
- A founder asks the chat: “How does competition theory affect our SaaS pricing?” The chat RAGs relevant blog posts, summarizes them, and links back to the exact posts it used. The reference author built this flow to let readers apply blog frameworks to their own context. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Plain-language explanation before advanced details
- This system gives readers an on-site assistant that answers questions using your published content. It uses two retrieval layers: a fast RSS layer for freshness and a vector (embedding) layer for precise matches. Start simple (RSS only). Add the vector layer when you need more accurate citations.

## What you will build and why it helps

You will build a lightweight, serverless AI chat that answers questions using your blog text. It returns short, sourced answers and lets readers bring their own context to your ideas. The reference implementation and architecture are here: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.

Two retrieval layers (why both):
- Layer 1 — Freshness (RSS): fetch your blog RSS every 60 minutes and inject up to 15 recent posts as context. New posts are available within about one hour. This keeps answers up to date without indexing every publish event. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Layer 2 — Precision (vector store): chunk core posts (~1,500 characters per chunk), embed them with gemini-embedding-001 (768 dimensions), and store vectors in Firestore. On each query, embed the question and return the top 4 chunks by cosine similarity. This gives precise, relevant passages for the model to cite. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Why this helps small teams:
- Low operations: a single Google Cloud Function (Python 3.12) can handle verification (reCAPTCHA Enterprise), IP rate limiting (recorded in Firestore), retrieval, model streaming (Gemini), session state, and alerts. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Cheap baseline: the reference stack ran at roughly $5–15/month. For many blogs, RSS-only retrieval gives ~80% of the value. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Definitions (short):
- RAG: retrieval-augmented generation — the model answers using retrieved text.
- SSE: Server-Sent Events — a streaming HTTP technique the frontend uses to receive answer tokens in real time.
- Embedding: a numeric vector representation of text. Cosine similarity measures closeness between vectors.

## Before you start (time, cost, prerequisites)

Estimated time and cost (concrete):
- Prototype time: ~4 hours (240 minutes) to a working demo. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Running cost: roughly $5–15/month; example frontend hosting was $4/month. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Expected payloads: embedding vectors are 768-dimensional; use top 4 chunks per query; chunk size ~1,500 characters; RSS injects up to 15 articles every 60 minutes.

Prerequisites:
- Google Cloud project with Cloud Functions and Firestore enabled (GCP = Google Cloud Platform).
- Gemini API access for gemini-embedding-001 and streaming responses. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- A blog with an RSS feed and a place to add a PHP page template or static injection.
- Basic JavaScript and PHP skills to paste the SSE client (the reference frontend is ~2,000 LOC). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Minimum checklist:
- [ ] GCP project ID
- [ ] GEMINI_API_KEY
- [ ] RECAPTCHA Enterprise keys
- [ ] Firestore rules draft
- [ ] Hosting credentials (e.g., Hostinger)

## Step-by-step setup and implementation

1. Frontend
   - Add a vanilla JavaScript SSE streaming client and a PHP page template if you use WordPress. The reference frontend is dependency-free and about 2,000 lines. SSE lets tokens stream as the model generates them. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

2. Backend: single Cloud Function (Python 3.12)
   - Responsibilities: reCAPTCHA Enterprise verification, IP rate limiting (stored in Firestore), RAG retrieval (RSS + vector search), a simple question classifier to route to cheaper models, Gemini streaming for long answers, session management, and async alerts (Telegram if you want). The reference uses one function to keep operations small. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

3. Firestore schema (collections)
   - embeddings/{docId} — stores vectors (768 dims) and metadata
   - sessions/{sessionId} — chat state
   - rate_limits/{ip} — counters for IP throttling
   - security_analytics/{eventId} — logged security events
   - Firestore is the only database used in the reference build. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

4. RAG ingestion & runtime
   - Hourly RSS job: fetch the RSS every 60 minutes, extract up to 15 posts, and inject them into the prompt as context. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
   - Vector store: chunk foundational posts at ~1,500 characters, call gemini-embedding-001 to create 768-d vectors, and store them. On query, embed the question and return the top 4 chunks by cosine similarity. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
   - Fallback: if vector search times out or is unavailable, use the RSS-only context so the chat still answers. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

5. Smart model routing
   - Use a small classifier to decide when a cheap model or cached answer suffices (e.g., simple FAQs). Use a streaming Gemini model for complex or multi-step questions. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

6. Security & quotas
   - Deploy a second Cloud Function for security monitoring and budget backstops. Use reCAPTCHA Enterprise and IP-based rate limiting stored in Firestore. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

7. Deploy and config
   - Store env vars in Cloud Function config and deploy with gcloud or your CI pipeline.

Bash (deploy example):

```bash
gcloud functions deploy blogChat --runtime=python312 \
  --trigger-http --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,FIRESTORE_PROJECT=$PROJECT_ID,RECAPTCHA_KEY=$RECAPTCHA_KEY"
```

Env vars (sample JSON config):

```json
{
  "GEMINI_API_KEY": "your_key_here",
  "FIRESTORE_PROJECT": "your-project-id",
  "RECAPTCHA_KEY": "recaptcha_key",
  "TELEGRAM_ALERT_TOKEN": "optional_alert_token"
}
```

Observability: log embedding latency (ms), model latency (ms), SSE errors, and budget alerts. Set budget thresholds (for example, $10/month alert) and use the secondary function to pause model calls when you hit that threshold. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Rollout gates:
- Canary: internal audience of ≤10 users.
- Ramp: staged rollout (internal → beta readers → public).
- Rollback: disable the feature flag and block model calls if abuse or costs spike. The security function acts as a backstop. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

## Common problems and quick fixes

- Cold starts / missing embeddings: keep an RSS-only fallback path so the chat returns useful answers even if the vector index is cold. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- SSE streaming hangs: send heartbeat SSE messages from the function every 15–30 seconds. On the client, reconnect after 5 seconds and back off up to 1 minute.
- reCAPTCHA failures: verify the server-side token check and monitor rate_limits/{ip}; reject bursts above your policy (e.g., >100 requests/min per IP).
- Vector search timeouts: retry up to 3 times with exponential backoff (200ms → 500ms → 1,000ms). If still failing, fall back to RSS and enqueue a reindex job.
- Unexpected bills: use the secondary Cloud Function to pause model calls at a budget threshold (for example, pause at $15/month) and send alerts.

Debug checklist:
- [ ] Reproduce the issue with a saved sessionId and a sample query
- [ ] Check Firestore: embeddings/{id} vector length == 768
- [ ] Confirm RSS job ran within the last 60 minutes and fetched ≤15 posts

## First use case for a small team

This section gives a minimal path for solo founders or teams of 1–3 people. The reference implementation is here: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.

Three-step actionable path for a solo founder:

1) Launch an RSS-only prototype (fast, cheap)
   - Time: ~2–4 hours to wire an hourly RSS fetch and a minimal SSE frontend.
   - How: run a Cloud Function that fetches the RSS every 60 minutes and serves the latest ≤15 posts as the chat’s context. For many blogs, this yields about 80% of the value. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

2) Add minimal analytics and cost controls
   - Track queries/sec and model-call counts. Set a hard monthly spend alert at $10 and an automatic pause at $15 to match the $5–15/month baseline observed. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
   - Enable reCAPTCHA Enterprise and IP rate limiting in Firestore; reject IPs with >100 requests in 10 minutes.

3) Gradually add a small vector index
   - Index 5–20 foundational posts first, chunked at ~1,500 characters, embedded with gemini-embedding-001 (768 dims). Verify the top 4 retrievals are relevant before indexing the rest. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Practical tips for small teams:
- Keep infra small: run the RSS job and main logic in the same Cloud Function or split into one scheduler and one handler — aim for 1–2 functions total.
- Use feature flags and a ≤10-user canary before public rollout.
- Keep the frontend dependency-free to reduce maintenance. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Small-team checklist:
- [ ] RSS-only prototype live
- [ ] Cloud Function deployed (Python 3.12)
- [ ] Firestore collections initialized (embeddings, sessions, rate_limits)
- [ ] Budget backstop function active (pause at $15/month)

## Technical notes (optional)

- Embeddings: gemini-embedding-001, 768 dimensions. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Chunking: ~1,500 characters per chunk for foundational posts. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Retrieval: return top 4 chunks by cosine similarity for precision. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Runtime: Cloud Function uses Python 3.12; frontend is vanilla JS (≈2,000 LOC) on shared hosting ($4/mo example). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

Component at-a-glance

| Component | Role | Example numbers |
|---|---:|---:|
| Frontend (vanilla JS) | SSE client, UI | ~2,000 LOC, Hostinger $4/mo |
| Cloud Function #1 | Runtime logic | Python 3.12, handles RAG, streaming |
| Cloud Function #2 | Security & budget | Alerts, pauses model calls |
| Firestore | Single DB | embeddings (768-d), sessions, rate_limits |
| RSS layer | Fresh context | hourly fetch, ≤15 articles injected |

## What to do next (production checklist)

### Assumptions / Hypotheses

- This guide assumes you have Gemini API access and a usable RSS feed. Numbers such as $5–15/month and the 60-minute RSS cadence are taken from the reference implementation: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.

### Risks / Mitigations

- Risk: runaway model costs. Mitigation: secondary Cloud Function to throttle or pause model calls, set alerts at $10 and automatic pause at $15/month. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Risk: cold-starts or missing embeddings. Mitigation: RSS-only fallback path and a background reindex queue. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Risk: abuse or spam. Mitigation: reCAPTCHA Enterprise verification and IP rate limiting recorded in Firestore. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)

### Next steps

- Create a canary: enable the chat for ≤10 internal users behind a feature flag.
- Index 5–20 key posts first (chunked at ~1,500 chars) and verify top 4 retrieval quality before broad indexing. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/.)
- Instrument: track query latency (ms), model call latency (ms), and monthly model spend against a $5–15/month baseline.
- Optional: I can generate starter Cloud Function code (Python 3.12) and a minimal SSE frontend tuned to this architecture if you want to move from prototype to deploy.
