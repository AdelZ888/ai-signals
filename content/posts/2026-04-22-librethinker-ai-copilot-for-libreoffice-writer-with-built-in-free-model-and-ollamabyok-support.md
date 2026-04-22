---
title: "LibreThinker — AI copilot for LibreOffice Writer with built-in free model and Ollama/BYOK support"
date: "2026-04-22"
excerpt: "Install LibreThinker to add an AI copilot to LibreOffice Writer's sidebar. It ships with a free online model (no signup), supports provider API keys and local Ollama, and has 10,000+ downloads."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-22-librethinker-ai-copilot-for-libreoffice-writer-with-built-in-free-model-and-ollamabyok-support.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "libreoffice"
  - "librethinker"
  - "ai-assistant"
  - "extension"
  - "llm"
  - "ollama"
  - "open-source"
  - "tutorial"
sources:
  - "https://librethinker.com/"
---

## TL;DR in plain English

- LibreThinker adds an AI writing assistant into the LibreOffice Writer sidebar. It can rephrase, summarize, proofread, translate, and generate drafts. See https://librethinker.com/.
- It includes a free online model that requires no signup. You can also supply your own API keys (BYOK = bring your own key) for providers like OpenAI or Mistral, or point the extension to a local Ollama instance. See the BYOK/Ollama notes at https://librethinker.com/.
- Quick install: download the .oxt from the LibreOffice extensions directory, then in Writer go to Tools > Extension Manager > Add, restart, open View > Sidebar and click the LibreThinker lightbulb. See https://librethinker.com/ for the install flow.

Checklist to get started

- [ ] Download the extension from the LibreOffice extensions directory (link on https://librethinker.com/)
- [ ] Tools > Extension Manager > Add and select the .oxt file
- [ ] Restart LibreOffice Writer
- [ ] View > Sidebar → click the LibreThinker lightbulb

Short example (concrete scenario)

- Scenario: You are writing release notes. Select a dense paragraph, click Summarize in the LibreThinker sidebar, then paste or accept the shorter version into your document. This keeps you inside Writer and avoids copying text into a separate web tool.

Plain-language note before deeper details

- This guide shows simple, repeatable steps to install and test LibreThinker. It explains the basic options (bundled free model, BYOK with provider keys, or local Ollama). If you are not familiar with the terms, see the small glossary below.

### Mini glossary (plain language)

- LLM — large language model. A computer model that generates or edits text.
- BYOK — bring your own key. You paste a provider API key into the extension so requests go through your account.
- Ollama — a tool to run models on your own machine (self-hosted inference).

## What you will build and why it helps

You will install LibreThinker in LibreOffice Writer and verify the built-in free model works for simple edits. Then you will try one alternate backend: either enter a provider API key (BYOK) or connect to a local Ollama model. The goal is to keep editing work inside Writer and cut down on app switching.

Why this helps

- Sidebar integration keeps the assistant in Writer so you avoid copying text into a browser or a separate app. See https://librethinker.com/.
- The extension supports multiple ways to run models: the free online model (no signup), your own provider keys (BYOK), and a self-hosted Ollama instance. See https://librethinker.com/.
- The project reports community adoption: the site lists 10,000+ downloads from the LibreOffice extensions directory. See https://librethinker.com/.

Concrete artifact to produce

- Create a short, shared prompt template for rephrasing (tone + max length). Store it in a shared folder. Team members paste that prompt into the LibreThinker prompt field when they need consistent edits.

## Before you start (time, cost, prerequisites)

Prerequisites

- A desktop install of LibreOffice Writer.
- The LibreThinker .oxt extension file from the LibreOffice extensions directory (link on https://librethinker.com/).
- Optional: an API key from a provider (OpenAI, Mistral, etc.) if you want BYOK. See provider options at https://librethinker.com/.
- Optional: a local Ollama installation and at least one downloaded model if you want to run inference on your own machine. See the Ollama notes at https://librethinker.com/.

Time and cost expectations (simple)

- Install and quick test: about 15–45 minutes per machine.
- If you use a paid provider, expect regular provider billing and quotas. Monitor provider dashboards for usage and costs. The extension itself documents the BYOK fields and supported providers at https://librethinker.com/.
- If you self-host Ollama, allow extra time to install Ollama and to download models. Large models need more disk space and bandwidth.

## Step-by-step setup and implementation

1) Download and install the extension

- Get the .oxt from the LibreOffice extensions directory (link on https://librethinker.com/).
- In Writer: Tools > Extension Manager > Add → select the .oxt → Restart LibreOffice.

2) Open the sidebar and confirm the UI

- View > Sidebar and look for the LibreThinker lightbulb icon. Click it to open the copilot. The project page shows screenshots and onboarding notes: https://librethinker.com/.

3) Try the bundled free model

- Select a short paragraph. Click Rephrase, Summarize, or Proofread in the sidebar. Review the returned text and choose to accept, edit, or reject it.

4) Connect a provider API key (BYOK)

- Open BYOK/Provider settings in the sidebar and paste your API key. The extension supports multiple provider options; see details at https://librethinker.com/.

Example provider config (local file you might keep outside documents):

```json
{
  "provider": "openai",
  "api_key": "sk-REDACTED-xxxxxxxx",
  "model": "gpt-4o",
  "max_tokens": 512
}
```

- Keep keys out of documents. Use the BYOK fields rather than pasting secrets into .odt files.

5) Use a self‑hosted Ollama instance

- Install and run Ollama on your machine. Download a model you want to use (the extension lists examples). In BYOK/Ollama settings set the model ID to the extension format, for example: sh/ollama/gemma3:1b.
- By default, the extension sends requests to http://localhost:11434/api/chat. You can change that URL in the Model URL input. See https://librethinker.com/ for the example model id and endpoint.

Health‑check command (bash):

```bash
# Quick POST to the default Ollama chat endpoint (adjust payload as needed)
curl -s -X POST http://localhost:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"gemma3:1b","messages":[{"role":"user","content":"Hello"}]}' | jq .
```

6) Basic test plan

- Run three quick tasks: rephrase, summarize, proofread. Confirm the sidebar responds and can insert or copy the returned text. Note latency and quality to decide whether to continue with the free model, BYOK, or Ollama. See https://librethinker.com/.

## Common problems and quick fixes

- Extension not visible after install
  - Fix: Restart LibreOffice. Open Tools > Extension Manager and confirm LibreThinker is enabled. Then use View > Sidebar and click the lightbulb. See https://librethinker.com/.

- No response / network errors with the free model
  - Fix: Check internet connectivity. If your connection is unreliable, consider using BYOK (provider key) or a local Ollama instance. Connection options are documented at https://librethinker.com/.

- API key errors or rate limits
  - Fix: Re‑paste the key in the BYOK settings. Check your provider dashboard for quota and errors. Rotate the key if needed. LibreThinker supports multiple providers—see https://librethinker.com/.

- Ollama connection failures
  - Fix: Confirm Ollama is running and the model is downloaded. Use the curl health check above to confirm http://localhost:11434/api/chat is reachable. See https://librethinker.com/.

Quick troubleshooting checklist

- [ ] Restart LibreOffice
- [ ] Confirm extension enabled in Extension Manager
- [ ] Test internet connectivity
- [ ] Run curl health check for Ollama
- [ ] Verify provider dashboard for quota/errors

## First use case for a small team

Use case summary

- A solo founder or a small team (1–3 people) wants faster, consistent first drafts and fewer context switches while working in LibreOffice Writer. LibreThinker keeps the assistant inside Writer. See https://librethinker.com/ for features and connection options.

Actionable steps for a small-team pilot

1) Single‑machine canary
- Install LibreThinker on one machine and test the bundled free model on three real edits (rephrase, summarize, proofread). Note any UI or reliability issues and keep a one‑page checklist.

2) Decide backend and privacy
- If you need private inference, install Ollama and download a small model. In LibreThinker BYOK/Ollama, set Model ID to sh/ollama/<model> and Model URL to http://localhost:11434/api/chat. See https://librethinker.com/.

3) Share two simple templates
- Create (a) a rephrase prompt (tone + max length) and (b) a summarize prompt (bullet list, target length). Store them in a shared folder and paste into the sidebar when needed.

4) Keep secrets out of documents
- Use the BYOK fields for API keys. Do not paste provider keys into .odt files.

5) Lightweight metrics
- Track a few signals for one week: time‑to‑first‑draft (minutes), whether the output required heavy edits (yes/no), and user satisfaction (1–5). Use these signals to decide on backend changes.

## Technical notes (optional)

- LibreThinker injects an assistant into the Writer sidebar. It supports a free online model (no signup), provider API keys (BYOK), and a self‑hosted Ollama option. See https://librethinker.com/.
- Ollama specifics shown in the extension docs: model IDs are prefixed with sh/ollama/ (for example sh/ollama/gemma3:1b). The default chat endpoint is http://localhost:11434/api/chat. See https://librethinker.com/.
- The project page lists 10,000+ downloads from the LibreOffice extensions directory. See https://librethinker.com/.

| Topic | Where to look | Example / default |
|---|---:|---:|
| Extension home | Project page | https://librethinker.com/ |
| Reported downloads | Project page | 10,000+ |
| Ollama default URL | Extension docs | http://localhost:11434/api/chat |
| Example Ollama model id | Extension docs | sh/ollama/gemma3:1b |

## What to do next (production checklist)

See https://librethinker.com/ for the installation and BYOK/Ollama reference while you carry out the checklist below.

### Assumptions / Hypotheses
- The built‑in free model is usable for light edits (based on the extension’s free online model listing on https://librethinker.com/).
- Pilot time estimates to validate: roughly 15–45 minutes to install and test per machine; additional time to set up Ollama if you choose self‑hosting.
- If you use a paid provider, expect provider billing and quotas; plan monitoring of usage on the provider dashboard.
- Goals for a pilot might include measurable improvements such as shorter time‑to‑first‑draft and reduced heavy edits for simple tasks.

### Risks / Mitigations
- Risk: API keys leaked in documents. Mitigation: do not store keys in .odt files; use the BYOK fields and a secret manager. See https://librethinker.com/.
- Risk: unexpected provider cost. Mitigation: monitor provider dashboards and set alerts or limits on usage.
- Risk: local Ollama operations overhead. Mitigation: pilot on one machine, document steps, and use the extension’s default Model URL (http://localhost:11434/api/chat) from the docs to reproduce. See https://librethinker.com/.
- Risk: low output quality. Mitigation: compare the free model baseline vs one provider model or one local model and choose the backend that meets your quality gate.

### Next steps
- Run a canary: enable LibreThinker for 1 writer for 3 days. Collect metrics: time‑to‑first‑draft (minutes), edits per draft (count), and satisfaction (1–5).
- If the canary looks good, expand to a small pilot (for example, 3 writers for 2 weeks) and monitor usage and costs.
- Operationalize: choose a production backend (free model, BYOK provider, or Ollama), store API keys in a secret manager, add monitoring/alerts, and document rollback triggers such as error rate thresholds or user feedback criteria.
