---
title: 'Claude Fable 5.2: $16 Blended Price vs. GPT-6 Astra at $20'
description: >-
  Anthropic released Claude Fable 5.2 on 2026-11-09. It costs $8.00 per million
  input tokens and $40.00 per million output tokens, with a 1M-token context
  window.
date: '2026-11-10'
kind: flash
modelId: anthropic/claude-fable-5-2
---
Anthropic released [Claude Fable 5.2](/models/anthropic/claude-fable-5-2) on November 9, 2026, with a listed blended token price of $16, compared with $20 for OpenAI’s GPT-6 Astra. Fable’s blended price is 20% lower than Astra’s, but it is not the cheapest model in this comparison. The release supports reasoning, tool calling and vision, with a 1,000,000-token context window.

## What changed

Fable 5.2 is a new model release, rather than a price update to an existing listing. Its input price is $8 per million tokens, and its output price is $40 per million tokens. The maximum output is 128,000 tokens, and the model does not have open weights.

The combination of reasoning, tool calling and vision puts Fable alongside the listed competitors on those capability flags. Context capacity and output limits differ, however, so the models are not identical on the specifications provided.

For developers evaluating the release, the pricing distinction is straightforward: Fable sits below GPT-6 Astra on input, output and blended pricing, while GPT-5.5 and Muse Wonder have lower prices across those categories.

## What it costs in practice

The scenarios below show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month; the costs reflect each scenario’s stated token mix rather than applying the blended price to every workload.

| Scenario | Input tokens, millions/month | Output tokens, millions/month | Fable 5.2 | GPT-6 Astra | GPT-5.5 | Muse Wonder |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $160 | $200 | $110 | $80 |
| RAG app | 50 | 5 | $600 | $750 | $400 | $300 |
| Coding agent | 20 | 10 | $560 | $700 | $400 | $280 |

Fable costs less than Astra in every listed scenario, but more than GPT-5.5 and Muse Wonder. The RAG app has the highest Fable bill among these workloads, at $600 per month. The coding agent scenario costs $560, while the chatbot scenario costs $160.

These examples also keep input and output volumes separate, making them more directly applicable to a workload budget than the blended headline price alone.

## How it compares

The competitor prices below are per million tokens. Context and maximum output figures are token limits.

| Competitor | Input | Output | Blended | Context | Max output | Comparison |
|---|---:|---:|---:|---:|---:|---|
| [GPT-6 Astra](/models/openai/gpt-6-astra) | $10 | $50 | $20 | 1,050,000 | 128,000 | [compare](/compare/claude-fable-5-2-vs-gpt-6-astra) |
| [GPT-5.5](/models/openai/gpt-5.5) | $5 | $30 | $11.25 | 1,050,000 | 128,000 | [compare](/compare/claude-fable-5-2-vs-gpt-5.5) |
| [Muse Wonder](/models/meta/muse-wonder-1.0) | $4 | $20 | $8 | 1,048,576 | 131,072 | — |

All listed competitors support reasoning, tool calling and vision, and none has open weights. Each has a larger context window than Fable. Astra and GPT-5.5 match Fable’s maximum output, while Muse Wonder has a higher output limit.

On blended pricing, Fable is 42.2% more expensive than GPT-5.5 and 100% more expensive than Muse Wonder.

## Who should care

Developers comparing Fable with GPT-6 Astra have a lower-priced option with the same listed capability flags and maximum output limit, though Fable’s context window is smaller.

Teams prioritizing the lowest listed API bill should also consider GPT-5.5 and Muse Wonder: both cost less in every supplied workload. For chatbot, RAG and coding-agent budgets, the scenario table provides a concrete starting point, while context limits, output limits and the absence of open weights remain separate selection criteria.
