---
title: "AI Game Master Prototype: Real-time voiced, image-driven RPG in Godot and FastAPI"
date: "2026-03-06"
excerpt: "Blueprint for a browser RPG where typed commands go to an AI Game Master that returns structured JSON to change music, move NPCs, give items, trigger cutscenes and real-time TTS."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-06-ai-game-master-prototype-real-time-voiced-image-driven-rpg-in-godot-and-fastapi.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "game-dev"
  - "godot"
  - "fastapi"
  - "websockets"
  - "ai-agents"
  - "tts"
  - "text-to-image"
  - "prototype"
sources:
  - "https://i-am-neon.itch.io/infinit"
---

## TL;DR in plain English

- Goal: build a tiny browser prototype where typed player commands go to an AI Game Master (GM) and the GM returns machine-readable commands the client applies. See the reference project for this pattern: https://i-am-neon.itch.io/infinit.
- Why it helps: the AI controls runtime behavior (music, portraits, items, cutscenes) while the world text and lore remain hand-authored. The Infinit page describes an AI GM that "controls the game" and triggers illustrated cutscenes and a quest journal: https://i-am-neon.itch.io/infinit.
- Quick outcome: one playable loop: type text, send it to a language model (LM), get structured commands back, and apply them. The Infinit page notes a typical session length is "About a half-hour": https://i-am-neon.itch.io/infinit.

Concrete example (short scenario): the player types: persuade the lama to show the map. The GM returns an ordered list like: swap_portrait, give_item(map), show_cutscene. The client applies these commands in order and updates UI, inventory, and music. Infinit shows this design in practice: https://i-am-neon.itch.io/infinit.

Note: the authored world (characters, locations, lore) should remain authoritative on the server; the LM returns suggested JSON commands the game executes. This separation mirrors the Infinit description where the world is hand-crafted and the AI "brings [it] to life": https://i-am-neon.itch.io/infinit.

## What you will build and why it helps

You will build a minimal browser-playable prototype that connects typed player input to an LM-driven GM and applies the GM's structured commands on the client. The Infinit page describes a hand-crafted world made interactive by an AI GM and separate background agents (journal, save summaries): https://i-am-neon.itch.io/infinit.

Minimum pieces (conceptual):

- A JSON command schema and a small set of handlers on the client.
- A server-side authoritative world representation (characters, locations, items).
- An orchestrator that sends the player text plus context to the GM and validates returned commands.

Why this helps (concise):

- Keeps lore consistent by storing authored content server-side. Infinit emphasizes the world is written by hand and the AI does runtime control: https://i-am-neon.itch.io/infinit.
- Limits persistent-state errors by validating model output before applying it.

Quick command examples (illustrative):

| Command type | Example JSON | Client handler |
|---|---:|---|
| move_npc | {"type":"move_npc","npc":"Lama","to":"market"} | animate NPC to 'market' |
| give_item | {"type":"give_item","item":"map","to":"player"} | add item to inventory UI |
| change_music | {"type":"change_music","track":"tension_a.mp3","fade_ms":500} | crossfade music player |

Reference: Infinit mentions a separate journal agent and save summaries as part of the runtime architecture: https://i-am-neon.itch.io/infinit.

## Before you start (time, cost, prerequisites)

Essential prerequisites:

- Basic browser or engine development experience. Infinit notes it was "Made with Godot" and is playable in HTML5: https://i-am-neon.itch.io/infinit.
- A backend capable of receiving player input and returning validated JSON commands.
- API keys or access for any external LM or media services you plan to use.

Practical preflight items (minimal):

- An authoritative world JSON (start with a single world file; Infinit currently exposes one world): https://i-am-neon.itch.io/infinit.
- WebSocket or HTTP endpoint scaffold for the orchestrator.
- Prompt template and JSON schema for GM output.
- An invite list or small tester group so you can gather feedback in alpha.

Operational note: Infinit is an early alpha by a solo developer who covers inference cost while it is live and asks for feedback; use similar expectations in messaging to testers: https://i-am-neon.itch.io/infinit.

## Step-by-step setup and implementation

This section outlines the core steps to a working scaffold. The Infinit page demonstrates the same separation: a GM handles runtime control while background agents handle journaling and summaries: https://i-am-neon.itch.io/infinit.

1) Scaffold the orchestrator (server broker)

- Create an endpoint (WebSocket or HTTP) that accepts player messages and returns validated command envelopes.
- Steps: receive player text, attach a compact context snapshot (current location, visible NPCs, inventory), send to GM agent, validate the JSON response against your schema, then forward to the client.

Commands to set up a minimal Python dev environment:

```bash
# create a python venv and install FastAPI + uvicorn + pydantic
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn websockets pydantic
```

2) Minimal JSON schema (save as command_schema.json)

```json
{
  "type": "object",
  "properties": {
    "type": {"type": "string"},
    "npc": {"type": "string"},
    "to": {"type": "string"},
    "item": {"type": "string"},
    "track": {"type": "string"},
    "fade_ms": {"type": "integer"}
  },
  "required": ["type"]
}
```

3) LM adapter and validation

- Instruct the GM to output only JSON matching your schema. If the response is invalid, retry once with a tighter instruction. If it still fails, return a safe fallback command so the game remains responsive.

4) Client scene

- Build a simple UI: text input, portrait area, music player, inventory list. The client sends raw text to the server and applies the validated command envelope in received order.

5) Background agents

- Implement a journal agent that appends discoveries to server-side journal storage and a save-summary agent that writes short summaries on save. Infinit explicitly references a separate journal agent and save summaries: https://i-am-neon.itch.io/infinit.

6) Media hooks

- Use placeholder images and short audio clips for early testing. Load heavy media asynchronously and replace placeholders when assets are ready.

7) Integration test (conceptual)

- Verify the loop: send a test prompt and assert a validated command envelope is returned and applied. Infinit is distributed as an alpha and suggests testing in the open for feedback: https://i-am-neon.itch.io/infinit.

## Common problems and quick fixes

- LM returns prose instead of JSON
  - Fix: re-prompt with "Output only JSON matching this schema." Retry once; on repeated failure apply a safe fallback command.

- Image/TTS latency
  - Fix: show low-resolution placeholders immediately; replace with final assets asynchronously and gate heavy media behind a feature flag.

- Agent hallucinates world facts
  - Fix: keep authoritative world state on the server. Reject mutations that reference unknown NPCs or locations.

- WebSocket disconnects or out-of-order commands
  - Fix: include a monotonic sequence_id on each command envelope so the client can replay or reconcile on reconnect.

Note: Infinit explicitly warns the AI will occasionally hallucinate and that the alpha will break sometimes; design your messaging and test expectations accordingly: https://i-am-neon.itch.io/infinit.

## First use case for a small team

Target audience and team split: a solo founder or a 2–3 person indie team running an invite-only alpha on itch.io—mirroring Infinit's early-alpha approach and request for feedback: https://i-am-neon.itch.io/infinit.

Suggested responsibilities:

- 1 full-stack developer: server, orchestrator, validation, cost telemetry.
- 1 designer/developer: client scene, authored world JSON, UI.
- Optional writer: prompts, lore, and test scenarios.

Three practical tips:

1) Scope sharply: ship a single interaction path through a small authored area first. Infinit presents a single authored world that the AI brings to life: https://i-am-neon.itch.io/infinit.
2) Run invite-only playtests and gather concise feedback via itch.io and Discord links.
3) Protect budget and telemetry: log per-turn metrics and set hard caps on inference spend.

Operational checklist for alpha launch (short):

- itch.io invite page + Discord link
- Budget cap and automated throttles
- Per-turn telemetry and save/replay logs

## Technical notes (optional)

Simple architecture sketch:

client (browser or engine) <-> WebSocket broker <-> orchestrator -> agents

Agents: primary GM agent, journal agent, media agents. Keep the authored world JSON authoritative on the server; Infinit describes this split and the journal/save agents explicitly: https://i-am-neon.itch.io/infinit.

Validation and instrumentation notes:

- Use JSON Schema or a Pydantic layer between LM output and state mutation. Retry parsing up to 1–2 times before using a fallback.
- Capture per-turn metrics such as latency_ms, validation_fail_count, tokens_in, tokens_out, and cost_usd.

Example metrics config snippet:

```json
{
  "metrics": ["latency_ms","validation_fail_count","tokens_in","tokens_out","cost_usd"],
  "alerts": {"validation_fail_rate": 0.10, "mean_latency_ms": 500}
}
```

Implementation note: Infinit is a hand-authored world brought to life by an AI GM with background agents for journaling and saves; use that as a design reference: https://i-am-neon.itch.io/infinit.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Prototype-time and thresholds used elsewhere in this guide are planning hypotheses. Example values to validate in your environment:
  - Prototype wiring time: 6 hours (estimate).
  - Per-turn command response timeout target: 3,000 ms.
  - Desired mean text-only latency target: 500 ms.
  - Authoring scope for first ship: 2 locations, 2 NPCs, and 3–6 command types.
  - Canary rollout sizes: 5 users or 5% of an invite list.
  - Playtest session reference: 30 minutes (Infinit notes "About a half-hour" for average session) — see https://i-am-neon.itch.io/infinit.
  - Telemetry thresholds: validation_failure_rate target 10% (0.10), alert mean_latency_ms 500.
  - Token tracking examples: monitor tokens_in and tokens_out per turn and cap per-session tokens at a value you choose (example cap placeholder: 20,000 tokens).

Methodology note: numbers above are operational hypotheses to be validated against your model vendor pricing and real playtests. The design-level grounding (AI GM controls runtime, authored world remains hand-written, journal and save-summary agents exist) is taken from the Infinit page: https://i-am-neon.itch.io/infinit.

### Risks / Mitigations

- Cost risk: inference costs can grow rapidly. Mitigations: hard daily caps, per-session budgets, and feature flags to disable heavy media.
- Hallucination risk: models may invent facts. Mitigations: server-side clamping of state, strict JSON schema validation, and fallback commands.
- Latency risk: heavy media and TTS add delay. Mitigations: asynchronous media loading, low-res placeholders, and optional gating of assets.
- Safety/moderation risk: unfiltered user input can be unsafe. Mitigations: pre-send content filters and moderation pipelines.

### Next steps

- Harden validation and telemetry. Suggested operational targets to aim for and then validate: mean_latency_ms < 500; validation_failure_rate < 10%; set a per_session_cost target based on vendor pricing.
- Build a small authoring UI so non-technical designers can add locations and NPCs; plan for ~10 authored scenes before public beta as a medium-term goal.
- Run iterative playtests with small groups (5–20 users) and collect logs to tune prompts and schema based on real failures.

Production checklist (task boxes):

- [ ] Harden JSON schema and server-side validation
- [ ] Implement per-turn telemetry (latency_ms, tokens_in, tokens_out, cost_usd)
- [ ] Add budget caps and per-session throttles
- [ ] Build basic authoring UI for world JSON
- [ ] Run invite-only playtests and collect feedback
- [ ] Implement journal and save-summary agents in production
- [ ] Add feature flags for heavy media and enable gradual rollout

Reference: Infinit's alpha description demonstrates the pattern of a hand-authored world plus an AI GM and background agents; use that page as a product-design reference: https://i-am-neon.itch.io/infinit.
