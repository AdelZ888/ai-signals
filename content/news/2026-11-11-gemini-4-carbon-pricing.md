---
title: 'Gemini 4 Carbon: $4 Blended Price vs. Claude Fable 5.2 at $16'
description: >-
  Google released Gemini 4 Carbon on 2026-11-10. It costs $2.00 per million
  input tokens and $10.00 per million output tokens, with a 1.05M-token context
  window.
date: '2026-11-11'
kind: flash
modelId: google/gemini-4-carbon
---
Google’s [Gemini 4 Carbon](/models/google/gemini-4-carbon), released November 10, 2026, carries a $4 blended token price, compared with $16 for [Claude Fable 5.2](/models/anthropic/claude-fable-5-2). That puts Carbon’s listed blended price 75% below Fable’s. For developers choosing an API, however, Carbon’s pricing matches the listed rates for Claude Sonnet 5, Claude Sonnet 5.5, and Kimi K3.1 Pro rather than establishing a lower price.

## What changed

Gemini 4 Carbon is a new Google model with listed input pricing of $2 per million tokens and output pricing of $10 per million tokens. Its context window is 1,048,576 tokens, and its maximum output is 32,768 tokens.

The model supports reasoning, tool calling, and vision. Its weights are not open. The fact sheet does not provide a previous version or a prior price, so this release should not be read as a price cut.

The distinction between context capacity and output capacity matters here: Carbon accepts a context window matching Kimi K3.1 Pro’s listed capacity, but its maximum output is lower than that of every model in the competitor table.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens, millions | Output tokens, millions | Gemini 4 Carbon | Claude Sonnet 5 | Claude Sonnet 5.5 | Kimi K3.1 Pro |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $40 | $40 | $40 | $40 |
| RAG app | 50 | 5 | $150 | $150 | $150 | $150 |
| Coding agent | 20 | 10 | $140 | $140 | $140 | $140 |

Carbon has no listed cost advantage over these competitors in the supplied workloads. The chatbot scenario costs $40 monthly across the table, while the RAG app costs $150 and the coding agent costs $140.

These workload-specific totals are separate from the $4 blended price headline. They reflect the input and output volumes specified for each scenario. The fact sheet does not include corresponding scenario costs for Claude Fable 5.2.

## How it compares

All listed competitors share Carbon’s $2 input, $10 output, and $4 blended pricing. They also support reasoning, tool calling, and vision. The documented differences are in context capacity, maximum output, and whether weights are open.

| Competitor | Input / output per million | Blended | Context tokens | Maximum output tokens | Open weights | Comparison |
|---|---:|---:|---:|---:|---|---|
| [Claude Sonnet 5](/models/anthropic/claude-sonnet-5) | $2 / $10 | $4 | 1,000,000 | 128,000 | No | [compare](/compare/claude-sonnet-5-vs-gemini-4-carbon) |
| [Claude Sonnet 5.5](/models/anthropic/claude-sonnet-5-5) | $2 / $10 | $4 | 1,000,000 | 128,000 | No | [compare](/compare/claude-sonnet-5-5-vs-gemini-4-carbon) |
| [Kimi K3.1 Pro](/models/moonshotai/kimi-k3.1-pro) | $2 / $10 | $4 | 1,048,576 | 1,048,576 | Yes | [compare](/compare/gemini-4-carbon-vs-kimi-k3.1-pro) |

Carbon’s context window exceeds the listed Sonnet windows, while both Sonnet models allow longer outputs. Kimi matches Carbon’s context capacity, lists a larger maximum output, and offers open weights.

## Who should care

Developers comparing Carbon with Claude Fable 5.2 should note the lower listed blended price. Those choosing among Carbon, the Sonnet models, and Kimi face identical listed token rates and scenario costs.

For applications requiring long generated responses, Carbon’s 32,768-token output limit is a relevant constraint. For teams requiring open weights, Carbon does not meet that requirement; Kimi K3.1 Pro does. The supplied facts do not establish a quality or benchmark advantage for any model.
