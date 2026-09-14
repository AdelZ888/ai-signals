---
title: "Benzi: a publicly benchmarked tree-sitter resolver that returns structured code answers for AI agents"
date: "2026-09-14"
excerpt: "Learn how Benzi uses per-language tree-sitter grammars and a shared query-map to return structured JSON answers to agent queries — includes a quick local setup and benchmark snapshots."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-14-benzi-a-publicly-benchmarked-tree-sitter-resolver-that-returns-structured-code-answers-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Benzi"
  - "tree-sitter"
  - "code-intelligence"
  - "AI agents"
  - "benchmark"
  - "open-source"
  - "query-map"
sources:
  - "https://github.com/oooscoos/Benzi"
---

## TL;DR in plain English

- Benzi is described as an "AI-native code intelligence" layer that runs per-language tree-sitter grammars into a single query map so agents can answer code questions quickly. See the project: https://github.com/oooscoos/Benzi
- It centralizes grammar queries so a resolver can return structured answers instead of relying only on text search (grep) or embeddings.
- Start small: clone the repo, make a tiny query-map, and run a local adapter that calls tree-sitter and returns JSON.

Concrete example (short scenario): you are reviewing a pull request and need to answer "Where is function foo defined and where is it called?" Instead of searching with brittle regexes or calling an LLM for a guess, the agent asks the resolver the intent "find_definition" and the resolver runs a tree-sitter query from the shared query-map and returns a clear JSON list of locations and surrounding context.

Example clone command you can run now:

```bash
git clone https://github.com/oooscoos/Benzi
cd Benzi
ls -la
```

Plain-language explanation before advanced details

- Tree-sitter is a parser generator and parsing library that builds a concrete syntax tree for source code. A grammar tells tree-sitter how to parse one language. Benzi maps intents (like "find_definition") to tree-sitter queries across languages.
- "Agent" here means an automated system or program (often an AI-powered assistant) that asks the resolver for structured code answers. The resolver runs the grammar queries and returns JSON results the agent can trust.
- This approach keeps queries explicit and testable. It reduces guesswork by the agent and makes results reproducible.

## What you will build and why it helps

You will build a small local prototype: a versioned query-map and an adapter (Node.js or Python) that runs tree-sitter queries and returns structured JSON. The adapter acts as the resolver the repo describes. Reference: https://github.com/oooscoos/Benzi

Why this helps

- Central query map: one place to define language-aware queries. The repo frames Benzi as "AI-native code intelligence infrastructure" and notes: "Every language runs its own tree-sitter grammar into the same query map" (https://github.com/oooscoos/Benzi).
- Structured answers: agents receive JSON with locations and context. That is easier to validate and act on than free-text answers.
- Reduced stitching: the resolver role means the agent does not have to combine multiple ad-hoc tools each time it needs a code-intel answer.

Concrete artifacts you'll produce

- A versioned query-map (YAML or JSON).
- A small adapter script (Node or Python) that invokes tree-sitter and returns JSON.
- A benchmark snapshot folder with recorded results from sample runs.

Minimal decision table (example)

| Intent | Language | Grammar identifier | Example query pattern | Expected output |
|--------|----------|--------------------|-----------------------|-----------------|
| find_definition | python | tree-sitter-python | function_definition[name=@id] | location + context |
| find_references | typescript | tree-sitter-typescript | identifier[name=@id] | list of reference locations |

Reference: https://github.com/oooscoos/Benzi

## Before you start (time, cost, prerequisites)

Estimated time and what you need. Inspect the repo before you assume paths or scripts: https://github.com/oooscoos/Benzi

Prerequisites checklist

- [ ] git access and basic shell skills
- [ ] a language runtime: Node.js or Python for the adapter, or Docker if you prefer containers
- [ ] tree-sitter CLI or language bindings for the languages you will test
- [ ] a place to save benchmark outputs (local folder or cloud storage)

Time and cost notes

- Prototype on a single machine: a modest laptop or small VM is enough for a single-language proof of concept.
- If you scale to repo-wide indexing, increase CPU and RAM and expect higher storage for parsed snapshots.
- Hardware suggestion for prototype: 4 CPU cores and 8 GB RAM. For larger repo-scale work, consider 16+ cores and 32+ GB RAM.

## Step-by-step setup and implementation

Reference README and repo description: https://github.com/oooscoos/Benzi

1) Clone and inspect

```bash
git clone https://github.com/oooscoos/Benzi
cd Benzi
# read the top-level README and any docs/ directory
```

2) Inventory grammars

- Look through the repo for a grammars directory or references to tree-sitter grammars. If your target language is not present, plan to add the official tree-sitter grammar or a compatible binding.

3) Create a minimal query-map

- The query-map maps intents to grammar queries. Save it as query-map.yaml or query-map.json in your project.

Example query-map (example only):

```yaml
version: 1
intents:
  find_definition:
    language: python
    grammar: tree-sitter-python
    pattern: "function_definition[name=@id]"
  find_references:
    language: typescript
    grammar: tree-sitter-typescript
    pattern: "identifier[name=@id]"
```

- Keep entries small and precise. Use one language and one intent for your first run.

4) Implement an adapter

- Write a small Node or Python script that:
  - loads the query-map,
  - invokes tree-sitter for the target file,
  - runs the pattern(s), and
  - returns structured JSON (locations, snippet, surrounding node type).
- Keep the adapter minimal: parse -> match -> format. Add a single timeout and clear error codes.

5) Run a local parse/resolve loop

- Use a few real example files and exercise the intents. Run the adapter on one file and inspect JSON output.
- Save results to a results/ folder for reproducibility.

6) Integrate the adapter with your agent flow

- Agent => adapter (intent + params) => resolver => structured JSON answer.
- Add a short cache and a fallback: return a cached or partial answer quickly and continue full resolution in the background if needed.

Reference: https://github.com/oooscoos/Benzi

## Common problems and quick fixes

Reference: https://github.com/oooscoos/Benzi

Missing grammar

- Symptom: parser cannot parse files in the target language.
- Quick fix: add the official tree-sitter grammar repo or bindings and pin to a commit.

Parser failures on odd syntax

- Symptom: parser errors for generated or partial files.
- Quick fix: add a pre-step that strips or normalizes unknown constructs, or fall back to text search for that file.

High resource use during indexing

- Symptom: CPU or memory spikes when indexing many files.
- Quick fix: index in small batches, limit concurrency, and use cached parse trees.

Agent timeouts

- Symptom: agent waits too long for a resolver response and returns an empty or low-confidence answer.
- Quick fix: return a fast cached answer or a short summary and continue full-resolution asynchronously.

Quick commands to check basics

```bash
# check tree-sitter present
tree-sitter --version
# quick parse (example adapter invocation; replace with your script name)
node adapter/run_parse.js sample_file.py
```

## First use case for a small team

Reference: https://github.com/oooscoos/Benzi

Use case: triage pull requests by finding definitions and references across a small mono-repo.

Minimal, actionable plan for a small team (solo founder or 2–3 people)

1) Start with one language and one intent. Create a single query-map entry and run it on files changed in a PR.
2) Run the adapter only on changed files rather than the whole repo. This reduces CPU and complexity.
3) Create 5–10 representative sample queries (real PR questions). Run them manually and save outputs in git for repeatability.
4) Automate a tiny harness that runs the adapter on each new PR and posts the structured result as a PR comment or bot message.
5) Iterate: if a query misses answers, edit the query-map and re-run the test set until outputs match expected examples.

Operational checklist (minimum)

- [ ] Single-language query-map committed
- [ ] 5–10 sample queries stored in repo
- [ ] Adapter script that runs locally and prints JSON

Why this works for small teams

- Low infra: only local or small cloud VMs are needed.
- Fast feedback: query-map edits give predictable changes to outputs.
- Reproducible: saved sample runs let you detect regressions quickly.

## Technical notes (optional)

Reference: https://github.com/oooscoos/Benzi

- The repository frames Benzi as a resolver that unifies tree-sitter grammars into a single query map and claims O(1) resolution characteristics in its description. The project positions Benzi as complementary to other approaches: the repo text notes other tools with shorthand examples: "Claude Code greps; Cursor embeds; Aider maps signatures; Benzi resolves" (https://github.com/oooscoos/Benzi).
- Testing: add unit tests per query-map entry and run end-to-end tests on representative files. Store outputs so regressions are observable.
- Integration: expose JSON from the resolver so agents receive structured answers instead of free text. Use clear schemas for location, node type, and surrounding context.

## What to do next (production checklist)

Reference: https://github.com/oooscoos/Benzi

### Assumptions / Hypotheses

- The repository description and top-level README summarize the project's intent: a unified query map over tree-sitter grammars and a resolver role (https://github.com/oooscoos/Benzi).
- Prototype time estimate: 90 minutes for a minimal single-machine proof-of-concept.
- Minimal scope to start: 1 language and 1 intent.
- Pilot team size assumption: 3–4 people for an initial pilot; solo founders can run the same prototype with more manual steps.
- Suggested sample size for a basic benchmark: N = 50 queries across 5 intents (example guidance).
- Example runtime/correctness gates for planning: 95th percentile latency target < 200 ms and correctness target ≥ 99% (these are planning targets to evaluate against; verify in your environment).
- Canary rollout parameters for planning: 10% traffic for 48 hours before wider rollout.
- Small pilot cloud cost range (planning): $5–$200 per month depending on usage and scale.
- Minimal dev machine suggestion: 4 CPU cores and 8 GB RAM; for repo-scale indexing consider 16+ cores and 32+ GB RAM.
- If adding LLM (large language model) calls in the pipeline, a dev guardrail might be 10,000 tokens/day as a budget example.

### Risks / Mitigations

- Risk: grammar drift or incompatible grammar versions.
  - Mitigation: pin grammar commits and require test updates when grammars change.
- Risk: resource costs rise at scale.
  - Mitigation: limit concurrency, cap monthly spend alerts, and use small canaries first.
- Risk: wrong answers lead to agent mistrust.
  - Mitigation: require validated correctness on critical intents before broad rollout; keep regression logs and simple rollback criteria.

### Next steps

- Commit a versioned query-map (YAML/JSON) to your repo and tag it.
- Produce at least one benchmark snapshot (scripted run) and store results in results/benchmark_results.json for traceability.
- Define SLOs and gates (use the planning targets above as starting points) and document them in your runbook.
- Roll out via feature flag: canary at 10% for 48 hours, monitor, then increase to larger cohorts only if gates hold.

Minimal rollout checklist

- [ ] Query-map committed and tagged
- [ ] Baseline benchmark saved and reproducible
- [ ] Feature flag and canary configured
- [ ] Monitoring on latency, error rate, and parser failures
- [ ] Rollback procedure documented

Reference: https://github.com/oooscoos/Benzi
