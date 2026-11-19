---
title: 'Gemini 4 Neon: $6 blended vs. GPT-6.2 Astra at $16'
description: >-
  Google released Gemini 4 Neon on 2026-11-18. It costs $3.00 per million input
  tokens and $15.00 per million output tokens, with a 1.05M-token context
  window.
date: '2026-11-19'
kind: flash
modelId: google/gemini-4-neon
---
Google released [Gemini 4 Neon](/models/google/gemini-4-neon) on November 18, 2026, with input pricing of $3 per million tokens, output pricing of $15 per million tokens, and a listed blended rate of $6. That blended rate is 62.5% below the $16 listed for [GPT-6.2 Astra](/models/openai/gpt-6.2-astra). Neon supports reasoning, tool calling, and vision, with a 1,048,576-token context window. It is not the cheapest model in the comparison set.

## What changed

Gemini 4 Neon is a new model release, rather than a price update to an existing model. Its maximum output is 65,536 tokens, and its weights are not open.

The release combines a context window of 1,048,576 tokens with reasoning, tool-calling, and vision support. Those capabilities are also listed for every model in the competitor set, so their presence alone does not distinguish Neon from the alternatives here.

Pricing puts Neon alongside Claude Sonnet 4.6 and Kimi K3: all have the same listed input, output, and blended rates. The contrast with GPT-6.2 Astra is larger on blended pricing, but the supplied comparison does not include Astra’s context window, output limit, or scenario costs.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens, millions | Output tokens, millions | Gemini 4 Neon | Claude Sonnet 4.6 | Kimi K3 | GPT-5.4 |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $60 | $60 | $60 | $55 |
| RAG app | 50 | 5 | $225 | $225 | $225 | $200 |
| Coding agent | 20 | 10 | $210 | $210 | $210 | $200 |

Neon matches Claude Sonnet 4.6 and Kimi K3 in every supplied workload. GPT-5.4 costs less in each scenario, with a lower input rate and the same output rate as Neon.

The scenario totals also give a workload-specific view beyond the blended headline. The RAG app has the highest monthly Neon bill among the listed examples, while the coding-agent scenario carries more output tokens than either the chatbot or RAG app.

## How it compares

Prices below are per million tokens. Context and maximum output are token limits.

| Model | Input | Output | Blended | Context | Maximum output | Open weights |
|---|---:|---:|---:|---:|---:|---|
| [Claude Sonnet 4.6](/models/anthropic/claude-sonnet-4-6) | $3 | $15 | $6 | 1,000,000 | 128,000 | No |
| [Kimi K3](/models/moonshotai/kimi-k3) · [compare](/compare/gemini-4-neon-vs-kimi-k3) | $3 | $15 | $6 | 1,048,576 | 1,048,576 | Yes |
| [GPT-5.4](/models/openai/gpt-5.4) · [compare](/compare/gemini-4-neon-vs-gpt-5.4) | $2.5 | $15 | $5.625 | 1,050,000 | 128,000 | No |

Neon’s context window matches Kimi K3’s, exceeds Claude Sonnet 4.6’s, and is smaller than GPT-5.4’s. Its maximum output is lower than every competitor listed. Kimi K3 is the only open-weight model in this comparison.

## Who should care

Developers comparing API costs for chatbots, RAG applications, and coding agents have concrete monthly examples for Neon. The supplied workloads show price parity with Claude Sonnet 4.6 and Kimi K3, not a cost advantage over them.

For teams prioritizing context length, output limits, or weight availability, the distinctions are separate from price. Neon offers a 1,048,576-token context window, but its 65,536-token output cap and closed weights remain relevant selection criteria. The fact sheet provides pricing and capability information, not benchmark results establishing relative model quality.
