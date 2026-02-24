---
title: "neuron v0.3 — independent, composable Rust crates for AI agents"
date: "2026-02-24"
excerpt: "neuron v0.3 splits the agent stack into independent Rust crates—Provider, Tool, ContextStrategy, AgentLoop and MCP—so you can pick only the pieces you need and compose agents."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-24-neuron-v03-independent-composable-rust-crates-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "Rust"
  - "AI agents"
  - "neuron"
  - "agent framework"
  - "MCP"
  - "context compaction"
  - "OpenAI"
  - "Anthropic"
sources:
  - "https://secbear.github.io/neuron/"
---

## TL;DR in plain English

What changed / why it matters / what to do

- neuron provides composable building blocks for AI agents in Rust: core traits (Provider, Tool, ContextStrategy), provider adapters, tool registry and macros, context compaction, an AgentLoop, MCP (Model Context Protocol), runtime primitives, and OpenTelemetry hooks. See the project intro at https://secbear.github.io/neuron/.
- Why it matters: most Rust and Python agent frameworks converge on the same ~300-line while loop, so the differentiation is in the blocks around the loop. neuron publishes those blocks as independent, versioned crates so you can pick just the pieces you need (see the crate list at https://secbear.github.io/neuron/).
- What to do now: pick one Provider crate (neuron-provider-openai, neuron-provider-anthropic, or neuron-provider-ollama), add neuron-tool and neuron-tool-macros to register tools, choose a ContextStrategy from neuron-context, and run an AgentLoop with optional MCP and OTEL hooks. Reference: https://secbear.github.io/neuron/.

Quick starter example (command + one-line intent):

```bash
cargo new my-neuron-agent && cd my-neuron-agent
```

- Goal: a small code-review assistant that runs a linter and test runner as tools, uses a token-aware compaction strategy from neuron-context, and streams responses via the AgentLoop. See the building blocks at https://secbear.github.io/neuron/.

Practical advice for small teams / solo founders

- Start with the single provider you need; pull one crate instead of the umbrella. The crate list and philosophy are at https://secbear.github.io/neuron/.
- Prototype locally (Ollama adapter is available) before provisioning cloud API keys.
- Assign ownership early for session durability and guardrails (neuron-runtime).

## What you will build and why it helps

You will build a minimal, modular Rust agent composed of independent crates documented at https://secbear.github.io/neuron/:

- Provider: implements the Provider trait (neuron-provider-openai, neuron-provider-anthropic, neuron-provider-ollama).
- Tools: registered with neuron-tool and #[neuron_tool] from neuron-tool-macros.
- ContextStrategy: compaction and token counting from neuron-context.
- AgentLoop: a configurable loop that supports streaming, cancellation, parallel tools and hooks (neuron-loop).

Why this helps

- Swap pieces without rewriting the core loop because neuron defines the core traits in neuron-types. See the design notes at https://secbear.github.io/neuron/.
- Each block is a separate crate so you can pull only what you need and upgrade independently.

Decision comparison (compact frame)

| Use case | Compaction approach | When to pick | Notes |
|---|---:|---|---|
| Low-latency, low-memory | Aggressive truncation | Small short-lived sessions or tight memory budgets | Minimal context, risk of lost long-tail context |
| Balanced | Token-aware compaction | Typical interactive agents where token accounting matters | neuron-context supplies token counting; see https://secbear.github.io/neuron/ |
| High-recall | Server-side compaction / DurableContext | When you need to preserve semantic state across long sessions | Use durable context in neuron-runtime and consider MCP for shared context |

Source: crate descriptions at https://secbear.github.io/neuron/.

## Before you start (time, cost, prerequisites)

- Time estimates (very rough): prototype in a few hours; a production demo with telemetry in a day or more. See the crate and trait overview at https://secbear.github.io/neuron/.
- Cost: neuron crates are open-source; provider API costs depend on the provider you choose (OpenAI, Anthropic, or a local Ollama runtime). Documentation: https://secbear.github.io/neuron/.
- Prerequisites: Rust toolchain (stable), cargo, git, and familiarity with async Rust. The project targets composition via traits in neuron-types (see https://secbear.github.io/neuron/).

Preflight checklist

- [ ] rustup and cargo installed
- [ ] Git repo initialized
- [ ] Provider API key (or local Ollama runtime) available
- [ ] Decide which provider crate to include (only enable what you need)

Minimum Cargo manifest snippet (example)

```toml
[dependencies]
neuron-types = "0.3"
neuron-tool = "0.3"
neuron-tool-macros = { version = "0.3", features = ["proc-macro"] }
# pick one provider:
neuron-provider-openai = { version = "0.3", default-features = false }
```

Reference: https://secbear.github.io/neuron/.

## Step-by-step setup and implementation

1. Create a new project and add dependencies

```bash
cargo new my-neuron-agent && cd my-neuron-agent
```

2. Choose composition

- Read the crate list and pick the provider(s) you actually need: neuron-provider-openai, neuron-provider-anthropic, or neuron-provider-ollama. Keep features minimal. See the crate list at https://secbear.github.io/neuron/.

3. Implement tools

- Use #[neuron_tool] from neuron-tool-macros to register functions as tools. The tool registry lives in neuron-tool.

Example tool (Rust pseudo-code):

```rust
#[neuron_tool]
async fn run_linter(ctx: ToolContext, req: LintRequest) -> ToolResult<LintResponse> {
    // run linter and return structured result
}
```

4. Pick a ContextStrategy

- neuron-context provides token counting and compaction strategies. Choose token-aware compaction when you must account for tokens; choose server-side compaction if you want the provider or a compaction service to reduce context. See https://secbear.github.io/neuron/.

5. Configure AgentLoop

- Configure streaming, cancellation, and parallel tool limits via neuron-loop. Keep feature flags lean and enable only the hooks you need.

Example YAML fragment for loop config:

```yaml
agent_loop:
  timeout_ms: 30000
  parallel_tools: 4
  enable_cancellation: true
```

6. Optional: enable MCP (Model Context Protocol)

- neuron-mcp implements MCP for stdio and Streamable HTTP. Use it when you need cross-process Model Context coordination. See the MCP section at https://secbear.github.io/neuron/.

7. Runtime and observability

- neuron-runtime provides DurableContext, GuardrailHook, and TracingHook. neuron-otel emits GenAI semantic spans prefixed with gen_ai.* for mapping into traces and SLOs. Documentation: https://secbear.github.io/neuron/.

8. Run and test

```bash
NEURON_OPENAI_KEY=... cargo run --bin my-neuron-agent
```

9. Iterate: validate middleware, compaction behavior, and streaming/cancellation based on your tests. See project intro at https://secbear.github.io/neuron/.

## Common problems and quick fixes

- Token accounting mismatch
  - Symptom: model rejects input or important context is missing.
  - Fix: enable neuron-context token counting and use token-aware compaction. See token and compaction notes at https://secbear.github.io/neuron/.

- Proc-macro / #[neuron_tool] not expanding
  - Symptom: compile errors pointing at the macro.
  - Fix: ensure neuron-tool-macros appears in Cargo.toml and your edition supports proc-macros.

- Provider auth failures
  - Symptom: 401/403 from provider.
  - Fix: verify env vars and test connectivity with a minimal request; refer to the provider adapter docs at https://secbear.github.io/neuron/.

- MCP handshake issues
  - Symptom: client/server incompatibility over stdio or HTTP.
  - Fix: confirm protocol version with neuron-mcp examples and enable MCP verbose logging. See MCP docs at https://secbear.github.io/neuron/.

Quick rollback gate (example): if error rate or high-percentile latency exceeds your allowable SLOs, flip the feature flag and revert to the last known-good config. For design rationale see the project's emphasis on modular blocks at https://secbear.github.io/neuron/.

## First use case for a small team

Scenario: a 3-engineer team building a code assistant that runs linters and tests as tools and asks a provider for suggestions. The building blocks and crate list are at https://secbear.github.io/neuron/.

Plan

1. Pick a provider: neuron-provider-openai or neuron-provider-anthropic, or start local with neuron-provider-ollama.
2. Implement lint and test-runner tools with #[neuron_tool].
3. Use a token-aware ContextStrategy from neuron-context to preserve recent diffs.
4. Add DurableContext from neuron-runtime to persist sessions across restarts.
5. Canary rollout and expand based on observed stability.

Small-team tips

- Keep provider crates isolated per environment (staging vs prod).
- Automate session backups and document the DurableContext restore steps.
- Replace a provider or tool without touching the core loop because neuron separates traits and implementations. See the intro at https://secbear.github.io/neuron/.

Solo-founder variant

- Start with neuron-provider-ollama for local inference to avoid early API spend; later migrate to a cloud provider adapter with the same traits and wiring. Reference: https://secbear.github.io/neuron/.

## Technical notes (optional)

- neuron defines core traits and types in neuron-types: Provider, Tool, ContextStrategy, Message. Implement a provider by implementing the Provider trait in your crate; see https://secbear.github.io/neuron/.
- neuron-loop supports streaming, cancellation, and parallel tool execution and is intended to be composed with the other crates rather than becoming an opinionated monolith.
- neuron-mcp implements MCP over stdio and Streamable HTTP for cross-process orchestration.
- neuron-otel emits GenAI semantic spans under gen_ai.* for mapping to observability systems.

Methodology note: this guide follows the project's crate-level decomposition and focuses on composition rather than imposing an opinionated framework.

Reference: https://secbear.github.io/neuron/.

## What to do next (production checklist)

### Assumptions / Hypotheses

- Prototype time: 1–2 hours for a minimal demo.
- Robust demo with telemetry and guardrails: 3–6 hours.
- Canary rollout plan: start at 5% of traffic, then 25%, then 100%.
- Rollback triggers (examples): error rate > 2% or 95th-percentile latency > 500 ms.
- Desired operational SLOs (example): error rate < 1%, 95p latency < 500 ms.
- Parallel tools default target: 4 concurrent executions.
- The core agent loop is ~300 lines of code in most frameworks (project intro: https://secbear.github.io/neuron/).
- Number of independent crates in the umbrella: ~12 crates listed in the docs (see https://secbear.github.io/neuron/).

### Risks / Mitigations

- Risk: provider API spend escalates quickly. Mitigation: start local with Ollama, add throttling, and monitor spend closely.
- Risk: token loss during compaction. Mitigation: use token-aware compaction from neuron-context and add acceptance tests that assert critical context persists.
- Risk: macro or dependency mismatch. Mitigation: pin neuron-tool-macros version and confirm Rust edition compatibility.
- Risk: cross-process MCP incompatibility. Mitigation: test stdio and Streamable HTTP flows in staging with verbose MCP logs.

### Next steps

- Implement a single tool and run a local session with DurableContext and tracing enabled.
- Add basic OTEL export and map gen_ai.* spans to your traces and dashboards.
- Create the feature flag for the new AgentLoop and perform the canary rollout described above.
- Automate provider key rotation and access controls.

Read the crate descriptions and getting-started material at https://secbear.github.io/neuron/ to align your implementation with the project's traits and recommended building blocks.
