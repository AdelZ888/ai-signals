---
title: "Vectorise.Me developer API — REST and MCP-compatible image-to-SVG conversion with export options"
date: "2026-08-08"
excerpt: "Use Vectorise.Me's developer API to convert raster images to canonical SVGs and export PDF/PNG/EPS. Learn key setup, presets (logo/photo/illustration), and MCP integration tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-08-vectoriseme-developer-api-rest-and-mcp-compatible-image-to-svg-conversion-with-export-options.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "vectorisation"
  - "svg"
  - "api"
  - "mcp"
  - "image-processing"
  - "integration"
  - "tutorial"
  - "export"
sources:
  - "https://vectorise.me/developers"
---

## TL;DR in plain English

- Vectorise.Me exposes a simple REST API to convert raster images (JPG/PNG) to SVG and to export that SVG to PDF, EPS, DXF, PNG, JPG, WEBP, or AVIF. Docs: https://vectorise.me/developers
- Get an API key in the dashboard, then call POST /api/v1/convert with a single X-API-Key header and an image file. There is no OAuth or token refresh. The API returns JSON including an "svg" field. See: https://vectorise.me/developers
- Save the returned SVG as the canonical asset. If you need a raster or printable file, call POST /api/v1/export with that SVG and a format (e.g., pdf). Reference: https://vectorise.me/developers

Quick numbers you should know: test an end-to-end flow in under 15 minutes; basic convert requests complete in ~10–30 seconds for small images; hosts may be 2 GB and can cap working resolution under memory pressure (for example, target under 4096×4096). Source: https://vectorise.me/developers

## What you will build and why it helps

You will build a single backend endpoint (serverless or small service) that:
- accepts an uploaded raster image,
- calls POST /api/v1/convert with X-API-Key and a chosen preset,
- stores the returned SVG (canonical), and
- optionally requests exported formats via POST /api/v1/export when a PDF/PNG/JPG is required. See: https://vectorise.me/developers

Why this helps:
- Automate manual tracing and save staff time (estimate: reduce manual vector work by >50% depending on volume).
- Centralize assets: store one SVG and generate raster/print outputs on demand to avoid storing duplicate files.
- Simplify infra: you do not ship models or require client GPUs; the server runs a shared model and serializes heavy work on 2 GB hosts. Source: https://vectorise.me/developers

Preset quick reference (table):

| Preset | Best for | Recommended quick flag(s) |
|---|---:|---|
| auto | General; engine detects type | None (default) |
| logo | Logos, icons, text — sharp edges, brand colours | preset=logo, edge_recovery=auto |
| illustration | Drawings, cartoons, clipart | preset=illustration |
| photo | Photographs, gradients | preset=photo, recovery_detail=high |
| pixel_art | Pixel art, retro graphics | preset=pixel_art |
| technical_drawing | Blueprints, schematics, line art | preset=technical_drawing, edge_recovery=off |

Source and examples: https://vectorise.me/developers

## Before you start (time, cost, prerequisites)

Time: expect 5 minutes to create a key and ~15 minutes to test an end-to-end flow. Docs: https://vectorise.me/developers

Cost: check pricing in the dashboard. Plan for export bandwidth and storage; store one SVG per asset to reduce duplication. See: https://vectorise.me/developers

Prerequisites:
- Account and API key: sign in at vectorise.me, Dashboard → API Keys panel, create a key. The API expects a single X-API-Key header, no OAuth. Source: https://vectorise.me/developers
- Ability to POST multipart/form-data from your server (curl, Node.js, Python). See: https://vectorise.me/developers
- Secret storage for the X-API-Key. Do not embed keys in client code.

Supported endpoints (concrete):
- POST /api/v1/convert — multipart/form-data with imageFile (JPG, PNG, etc.) and preset. Docs: https://vectorise.me/developers
- POST /api/v1/export — JSON with "svg" and "format" (pdf|png|jpg|webp|avif|eps|dxf). Docs: https://vectorise.me/developers

Secret config example:

```json
{
  "VECTORISE_API_KEY": "<store-in-secret-manager-or-env>"
}
```

## Step-by-step setup and implementation

Overview: backend receives upload → call /api/v1/convert with X-API-Key and preset → save SVG → optionally call /api/v1/export to obtain desired format. The heavy model work runs server-side; your client needs no GPU or model files. Source: https://vectorise.me/developers

1) Create an API key (5 minutes)
- Sign in at https://vectorise.me/developers, open Dashboard → API Keys, create and store the key in a secret manager. The API uses one header: X-API-Key.

2) Basic convert test (10–30 seconds to run for small inputs)

```bash
export VECTORISE_API_KEY="sk_live_xxx"
curl -X POST "https://vectorise.me/api/v1/convert" \
  -H "X-API-Key: $VECTORISE_API_KEY" \
  -F imageFile=@sample-logo.png \
  -F preset=logo \
  -F edge_recovery=auto
```

- Response JSON contains an "svg" string and a colorPalette array. Save the SVG blob to your object store. Docs: https://vectorise.me/developers

3) Optional: export the SVG to PDF/PNG (fast for small assets)

```bash
curl -X POST "https://vectorise.me/api/v1/export" \
  -H "X-API-Key: $VECTORISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "svg": "<svg...>", "format": "pdf" }'
```

- Supported export formats: pdf, eps, dxf, png, jpg, webp, avif. See: https://vectorise.me/developers

4) Control recovery and diagnostics
- Use flags: edge_recovery=(off|auto|real_esrgan), preprocess_sharpen=(true|false), recovery_detail=(low|med|high|ultra). Inspect qualityDiagnostics.edgeRecoveryResolved in the response to confirm what ran. The server serializes heavy work on 2 GB hosts and may cap working resolution under memory pressure. Source: https://vectorise.me/developers

5) Integrate into your pipeline (deploy in ~30–90 minutes):
- Expose one endpoint (serverless function or small service) that accepts uploads, calls /api/v1/convert, stores the SVG, and returns a canonical URL.
- For printable outputs, call /api/v1/export on-demand; avoid storing every exported raster to save costs. Docs: https://vectorise.me/developers

6) Rollout plan (simple):
- Start with a 10% internal canary. Visual-review gates before increasing to 100% traffic.

## Common problems and quick fixes

- 401 / 403 (authentication): verify the X-API-Key header is present, correct, and active. Docs: https://vectorise.me/developers

- Large images / memory pressure: hosts may be 2 GB and the service can cap resolution. Fix: client-side resize (try 50% reduction or cap under 4096×4096), or retry with edge_recovery=off. Source: https://vectorise.me/developers

- Unexpected recovery results: set edge_recovery and recovery_detail explicitly and read qualityDiagnostics.edgeRecoveryResolved to confirm what actually ran. Docs: https://vectorise.me/developers

- Visual mismatch vs web UI: confirm you used the same preset and flags. Web, REST, and MCP use the same engine and settings. See: https://vectorise.me/developers

Quick debug command (CI-friendly):

```bash
curl -s -X POST "https://vectorise.me/api/v1/convert" \
  -H "X-API-Key: $VECTORISE_API_KEY" \
  -F imageFile=@sample.png -F preset=logo | jq -r '.svg' > out.svg
```

## First use case for a small team

Scenario: a solo founder or a 2–3 person startup needs fast, low-cost vectorisation for customer logos and on-demand PDF exports. Docs: https://vectorise.me/developers

Concrete, actionable plan for solo founders / small teams:

1) Minimal deploy (single serverless function, 30–90 minutes):
- Implement a single serverless function (Lambda/Cloud Run/Vercel) that accepts uploads, calls POST /api/v1/convert with preset=logo, stores SVG in a bucket, and returns a secure URL. This keeps infra to 1 function + 1 storage bucket. See: https://vectorise.me/developers

2) Credential hygiene and cost control (5–15 minutes to set up):
- Store X-API-Key in a secret manager (rotate every 90 days). Do not expose the key in client code. Monitor export counts and storage to keep monthly cost predictable. Reference: https://vectorise.me/developers

3) Fast QA loop and acceptance set (immediate):
- Keep an acceptance set of 20–50 logos for quick visual checks and ~200 images for nightly regression. Use simple path-count or pixel-diff rules to auto-fail obviously broken outputs. Source: https://vectorise.me/developers

4) Lightweight rate limiting and retry defaults (production-safe):
- Local token-bucket: bucket size = 10 tokens, refill = 1 token/sec. On 5xx, retry with exponential backoff up to 3 attempts. These defaults limit bursts while keeping latency reasonable. See: https://vectorise.me/developers

Checklist for launch (small team):
- [ ] Store X-API-Key in a secret manager and do not expose it client-side (Docs: https://vectorise.me/developers)
- [ ] Implement serverless convert function and object storage for SVGs
- [ ] Build an acceptance set of 20–50 logos and run 10% canary
- [ ] Implement retries (3 attempts) and token-bucket rate limiting (10 tokens, 1 token/sec)

Operational tip: treat returned SVG as canonical and generate raster exports on demand to reduce storage duplication. Docs: https://vectorise.me/developers

## Technical notes (optional)

- Engine parity: Web, REST, and MCP clients use the exact same engine and presets; matching settings yield matching results. Source: https://vectorise.me/developers
- Recovery model: recovery runs on the server only when requested. The shared server keeps one model, serializes heavy work on 2 GB hosts, caps resolution under memory pressure, and may fall back to the direct VTracer profile. Check qualityDiagnostics.edgeRecoveryResolved to see what actually ran. See: https://vectorise.me/developers
- Knobs: preset, edge_recovery, preprocess_sharpen, recovery_detail (low|med|high|ultra). Use these to trade speed vs fidelity. Docs: https://vectorise.me/developers
- Export formats: pdf, eps, dxf, png, jpg, webp, avif. Source: https://vectorise.me/developers

Methodology note: all protocol details and presets referenced above are grounded in the Vectorise.Me developer docs. See: https://vectorise.me/developers

## What to do next (production checklist)

### Assumptions / Hypotheses

- API surface: two primary endpoints are available: POST /api/v1/convert and POST /api/v1/export. Presets include auto, logo, illustration, photo, pixel_art, technical_drawing. Source: https://vectorise.me/developers
- Operational hypotheses to validate in staging:
  - Start canary at 10% of new uploads and increase only after visual acceptance.
  - Use 20–50 logos for fast checks and ~200 images for regression.
  - Key rotation cadence example: 90 days.
  - Alert gates: 5xx rate > 1% or median latency > 2,000 ms should trigger review.

### Risks / Mitigations

- Risk: memory-pressure fallbacks change output. Mitigation: detect qualityDiagnostics.edgeRecoveryResolved; if fallbacks occurred, retry with a lower-resolution upload (e.g., 50% reduction) or flag for manual review. See: https://vectorise.me/developers
- Risk: credential leakage. Mitigation: store X-API-Key in a secret manager, grant least privilege, rotate keys every 90 days, and never embed keys client-side. Docs: https://vectorise.me/developers
- Risk: service outage or rate limits. Mitigation: fallback to original raster, cached pre-vectorised SVG, or queue jobs with exponential backoff and a circuit breaker. Use monitoring to detect >1% 5xx rate or median latency > 2,000 ms.

### Next steps

- Implement monitoring: log /api/v1/convert and /api/v1/export latency, 4xx/5xx rates, and export counts. Create dashboards and alerts for the numeric gates above (1% 5xx, 2,000 ms median latency). See: https://vectorise.me/developers
- Automate visual acceptance: run pixel-diff or path-count heuristics on the 20–50 acceptance images; expand to ~200 for nightly regression.
- Integrate into your asset pipeline and agent playbooks so automation can call the API and store outputs in your object store.
- Run a 10% canary for 7–14 days, then increase in 10% increments after passing visual checks.

For API references, request examples, and presets, see: https://vectorise.me/developers
