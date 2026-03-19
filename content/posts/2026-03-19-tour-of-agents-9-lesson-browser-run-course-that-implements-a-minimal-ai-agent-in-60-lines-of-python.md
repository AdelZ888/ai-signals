---
title: "Tour of Agents: 9-lesson, browser-run course that implements a minimal AI agent in ~60 lines of Python"
date: "2026-03-19"
excerpt: "Nine lessons implement a minimal agent loop—tool calls, memory, state, policy gates, self-scheduling—in about 60 lines of Python. Run in-browser via Pyodide with mock or Groq LLM."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-19-tour-of-agents-9-lesson-browser-run-course-that-implements-a-minimal-ai-agent-in-60-lines-of-python.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 30
editorialTemplate: "TUTORIAL"
tags:
  - "agents"
  - "tutorial"
  - "python"
  - "pyodide"
  - "llm"
  - "open-source"
  - "education"
  - "groq"
sources:
  - "https://news.ycombinator.com/item?id=47426730"
---

## TL;DR in plain English

- What this is: a short, interactive course that demonstrates how a minimal AI agent is built and runs. The Hacker News post describes it as a 30-minute walkthrough across 9 short lessons implemented in roughly ~60 lines of Python that runs in the browser via Pyodide. Source: https://news.ycombinator.com/item?id=47426730
- What you get: a readable, incremental implementation exposing the AgentExecutor control loop (essentially a while loop). Each lesson adds one idea: tool calling, memory, state, policy gates, and self-scheduling. Source: https://news.ycombinator.com/item?id=47426730
- How to start fast: open the linked repo, launch the browser demo in mock mode (cost $0, no signup), and step through lessons 1→9. Optionally paste a free Groq API key for live LLM responses. Source: https://news.ycombinator.com/item?id=47426730

Quick checklist to start now

- [ ] Open the Hacker News post and follow the repo link: https://news.ycombinator.com/item?id=47426730
- [ ] Launch the Pyodide demo in your browser in mock mode (instant, $0)
- [ ] Step through lessons 1 → 9 in order
- [ ] Optional: paste a free Groq API key to test live LLM replies

Plain-language summary: the project strips an "agent" to the minimum working pieces so you can see the decision loop (AgentExecutor) in action inside a ~60-line Python file that runs in the browser. Source: https://news.ycombinator.com/item?id=47426730

Methodology: this note is derived from the Hacker News snapshot linked above.

## What you will build and why it helps

Concrete outcome

By the end you'll have read and executed a short, incremental agent implementation composed across 9 lessons and about ~60 lines of Python, running in the browser via Pyodide. Source: https://news.ycombinator.com/item?id=47426730

Why this matters

- The exercise exposes the AgentExecutor control loop as a simple while loop so you can see how prompts, tool calls, memory and state interleave. Source: https://news.ycombinator.com/item?id=47426730
- Lessons add one concept at a time, helping you link each idea to live behavior instead of learning only from opaque frameworks. Source: https://news.ycombinator.com/item?id=47426730
- Mock mode is immediate and free, which lets you iterate without incurring API cost while you learn. Source: https://news.ycombinator.com/item?id=47426730

Decision frame (short)

| Question | Recommended first step | Why (per the HN snapshot) |
|---|---:|---|
| Learn internals quickly | Run the 30-minute course in mock mode | The course shows the while-loop AgentExecutor and builds features one lesson at a time. Source: https://news.ycombinator.com/item?id=47426730 |
| Prototype production-ready system | Consider a full framework after learning | The demo is minimal and educational; frameworks provide production features. Source: https://news.ycombinator.com/item?id=47426730 |

## Before you start (time, cost, prerequisites)

- Time: the author describes the course as a ~30-minute walkthrough across 9 lessons. Source: https://news.ycombinator.com/item?id=47426730
- Cost: mock mode is free ($0) and needs no signup; a free Groq API key is optional for live replies. Source: https://news.ycombinator.com/item?id=47426730
- Prerequisites: an ability to read short Python snippets and a browser that can run WebAssembly (the demo runs in the browser via Pyodide). Source: https://news.ycombinator.com/item?id=47426730

Prep checklist

- [ ] Ensure you have a modern browser that supports WebAssembly
- [ ] Open the Hacker News post and follow the repo link: https://news.ycombinator.com/item?id=47426730
- [ ] (Optional) Register for a free Groq API key if you want live responses

## Step-by-step setup and implementation

Follow these compact steps to run the lessons in your browser and inspect the code. Source: https://news.ycombinator.com/item?id=47426730

1) Open the Hacker News post and follow the repo link to the project.

2) If you prefer a local copy, clone and serve the repo locally:

```bash
# clone the repo if you want a local copy
git clone https://github.com/ahumblenerd/tour-of-agents.git
cd tour-of-agents
# serve locally and open http://localhost:8000
python -m http.server 8000
```

3) Launch the Pyodide demo in your browser. Start in mock mode (instant, $0) and step through lessons 1→9. Source: https://news.ycombinator.com/item?id=47426730

4) Observe the AgentExecutor loop (a while loop) as each lesson adds a feature: tool calls, memory writes, state persistence, policy gates, self-scheduling. Source: https://news.ycombinator.com/item?id=47426730

5) To try live LLM replies, paste a Groq API key into the demo config and switch mode to "live":

```json
{
  "mode": "live",
  "provider": "groq",
  "api_key": "<YOUR_FREE_GROQ_KEY_HERE>"
}
```

6) Export the minimal agent file (the final ~60-line Python) as your learning artifact to port into a server runtime later. Source: https://news.ycombinator.com/item?id=47426730

## Common problems and quick fixes

All fixes are general troubleshooting steps you can apply while running the browser demo. Source: https://news.ycombinator.com/item?id=47426730

- Demo page stalls while loading Pyodide
  - Fix: hard refresh (Ctrl/Cmd+Shift+R), clear the browser cache, or try another modern browser. Ensure WebAssembly and JavaScript are enabled.

- Live replies do not appear after adding a Groq key
  - Fix: check the API key for typos, open the browser console for CORS or network errors, and re-run the lesson that triggers the call.

- Behavior differs between mock and live modes
  - Fix: run identical prompts in both modes and compare transcripts. Keep learning and early UX work in mock mode (cost $0) before moving to live testing.

- Hard to see what the loop is doing
  - Fix: instrument the while loop with simple logging statements that print prompt text, tool calls, and memory writes. For production, move to a server runtime and add structured observability.

## First use case for a small team

Who benefits most (per the author's intent)

The snapshot describes an educational tool aimed at engineers who want to understand what agent frameworks do under the hood. It is intended to help people avoid blindly relying on frameworks without knowing the internals. Source: https://news.ycombinator.com/item?id=47426730

A minimal afternoon path (learning-focused)

1. Run the demo in mock mode and complete lessons 1→9 to see the full loop (about 30 minutes, per the post). Source: https://news.ycombinator.com/item?id=47426730
2. Use the final short Python file (~60 lines) as a single-file reference for the control loop. Source: https://news.ycombinator.com/item?id=47426730
3. If desired, add one toy tool and compare behavior mock vs. live by switching to a Groq API key (optional). Source: https://news.ycombinator.com/item?id=47426730

Deliverables you can expect from this exercise

- A working browser demo session demonstrating the AgentExecutor loop
- The final minimal agent Python file (~60 lines) exported for offline study
- A direct, lesson-by-lesson understanding of how tool calls and memory interact in the control loop

## Technical notes (optional)

- Core pattern: the AgentExecutor is represented as a simple control loop (a while loop) that sequences thinking, tool calls, memory updates, and actions. The course surfaces this in minimal Python. Source: https://news.ycombinator.com/item?id=47426730
- Runtime: runs in the browser with Pyodide, which avoids local installs and lowers setup friction. Source: https://news.ycombinator.com/item?id=47426730
- Components covered in lessons: tool calling interfaces, memory, state persistence, policy gates, and self-scheduling, each introduced incrementally. Source: https://news.ycombinator.com/item?id=47426730

## What to do next (production checklist)

### Assumptions / Hypotheses

The following operational thresholds, counts and limits are proposed as hypotheses to validate during canary testing (these are not claimed in the HN snapshot and should be tested):

- Canary exposure: 5% of validation runs
- Validation set size: 10–30 prompts per feature or lesson
- Median local validation latency guard: < 2,000 ms (2s)
- Acceptance error-rate target: < 1% unacceptable responses
- Rollback trigger: > 5% failures in canary
- Time-to-escalate goal: 15 minutes from detection to triage
- Experiment iteration budget: 60–90 minutes per prototype cycle
- Prototyping cost: $0 if you stay in mock mode; live costs depend on provider and token usage

(These numbers are operational suggestions and should be validated in your environment.)

### Risks / Mitigations

- Risk: confusing mock behavior with live behavior.
  - Mitigation: keep recorded transcripts and run identical prompts in both modes to compare outputs.
- Risk: exposing API keys in a browser-hosted demo.
  - Mitigation: use ephemeral/test keys and move secrets server-side for production.
- Risk: relying on a browser runtime for production (memory, latency, key safety).
  - Mitigation: port the AgentExecutor loop to a server runtime, add structured logging, monitoring, and secure key management.

### Next steps

- Run the demo end-to-end in mock mode now: https://news.ycombinator.com/item?id=47426730
- Produce a short validation set and run it in mock and (optionally) live modes to compare behavior.
- Export the minimal ~60-line agent file and document per-lesson behavior as you step through.
- If live testing meets your validated thresholds, plan a production migration: move the loop server-side, secure keys, add observability, monitor latency and error rates, and prepare a rollback plan.

Sources

- Primary course reference: https://news.ycombinator.com/item?id=47426730
- Repo (mentioned in the course description): https://github.com/ahumblenerd/tour-of-agents
