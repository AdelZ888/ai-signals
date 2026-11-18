---
title: 'GPT-6.2 Astra: $16 Blended Price vs. Claude Fable 5.1 at $20'
description: >-
  OpenAI released GPT-6.2 Astra on 2026-11-17. It costs $8.00 per million input
  tokens and $40.00 per million output tokens, with a 1.05M-token context
  window.
date: '2026-11-18'
kind: flash
modelId: openai/gpt-6.2-astra
---
OpenAI released [GPT-6.2 Astra](/models/openai/gpt-6.2-astra) on November 17, 2026, with a listed blended token price of $16, compared with $20 for Claude Fable 5.1. Its input and output rates are $8 and $40 per million tokens, respectively. The new model supports reasoning, tool calling, and vision, with a 1,050,000-token context window. The pricing puts Astra below Claude Fable 5.1, but at the same rates as Claude Fable 5.2.

## What changed

Astra is a new model release, rather than a price update to an existing listing. Its maximum output is 128,000 tokens, and its weights are not open.

The context window is larger than the 1,000,000-token windows listed for the Claude Fable models in the comparison. Maximum output is unchanged across those listings: each supports 128,000 tokens.

For developers comparing API specifications, the listed capability flags do not distinguish Astra from these competitors. All support reasoning, tool calling, and vision, and none have open weights. The differences shown here are in pricing, context capacity, and release date—not demonstrated quality or benchmark performance.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month; the dollar amounts are scenario costs, not blended per-token rates.

| Scenario | Input tokens, millions/month | Output tokens, millions/month | GPT-6.2 Astra | Claude Fable 5.2 | Claude Fable 5 | Claude Fable 5.1 |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $160 | $160 | $200 | $200 |
| RAG app | 50 | 5 | $600 | $600 | $750 | $750 |
| Coding agent | 20 | 10 | $560 | $560 | $700 | $700 |

Astra matches Claude Fable 5.2 in every listed workload. Both cost less than Claude Fable 5 and Claude Fable 5.1 in each scenario.

The workload totals also show why the $16 blended figure should not be read as a monthly budget. The chatbot, RAG app, and coding-agent examples have different input and output volumes, producing different bills under the same listed rates.

## How it compares

Input, output, and blended prices below are per million tokens.

| Competitor | Input | Output | Blended | Context tokens | Comparison |
|---|---:|---:|---:|---:|---|
| [Claude Fable 5.2](/models/anthropic/claude-fable-5-2) | $8 | $40 | $16 | 1,000,000 | [compare](/compare/claude-fable-5-2-vs-gpt-6.2-astra) |
| [Claude Fable 5](/models/anthropic/claude-fable-5) | $10 | $50 | $20 | 1,000,000 | — |
| [Claude Fable 5.1](/models/anthropic/claude-fable-5-1) | $10 | $50 | $20 | 1,000,000 | [compare](/compare/claude-fable-5-1-vs-gpt-6.2-astra) |

Astra’s blended price is 20% below Claude Fable 5.1 and Claude Fable 5. Claude Fable 5.2, released November 9, 2026, already matches Astra’s input, output, and blended pricing. Astra is not the cheapest model in its class.

## Who should care

Developers budgeting chatbot, RAG, or coding-agent workloads against Claude Fable 5.1 have a lower-priced option in Astra at the listed rates. Those already considering Claude Fable 5.2 will see no price difference in these scenarios.

Teams evaluating context limits have a separate specification to consider: Astra lists 1,050,000 tokens versus 1,000,000 for the compared models. For open-weight requirements, however, Astra offers no change: its weights remain closed, as do those of the listed competitors.
