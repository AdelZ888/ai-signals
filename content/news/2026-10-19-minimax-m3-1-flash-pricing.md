---
title: 'MiniMax-M3.1-Flash: 12.5% lower blended price than DeepSeek V4.1 Flash'
description: >-
  MiniMax released MiniMax-M3.1-Flash on 2026-10-19. It costs $0.15 per million
  input tokens and $0.60 per million output tokens, with a 1M-token context
  window.
date: '2026-10-19'
kind: flash
modelId: minimax/MiniMax-M3.1-Flash
---
MiniMax released [MiniMax-M3.1-Flash](/models/minimax/minimax-m3.1-flash) on October 19, 2026, with a listed blended price of $0.2625 per million tokens, 12.5% below [DeepSeek V4.1 Flash](/models/deepseek/deepseek-v4.1-flash) at $0.30. The new model has open weights and supports reasoning, tool calling, and vision. Its pricing matches the listed competitors below, including the separately named DeepSeek V4.1 Flash 1017.

## What changed

MiniMax-M3.1-Flash is a new model release, rather than a price update to an existing entry. Input tokens cost $0.15 per million, and output tokens cost $0.60 per million.

The model has a 1,000,000-token context window and a maximum output of 512,000 tokens. Those limits accompany its listed reasoning, tool-calling, and vision support.

The distinction between the DeepSeek entries matters for the price comparison. The 12.5% lower blended price applies to DeepSeek V4.1 Flash. DeepSeek V4.1 Flash 1017, released October 17, 2026, has the same input, output, and blended prices as MiniMax-M3.1-Flash. The new MiniMax model therefore does not have a price advantage over that dated entry at the listed rates.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens, millions/month | Output tokens, millions/month | MiniMax monthly cost | Monthly cost for each listed competitor |
|---|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $2.70 | $2.70 |
| RAG app | 50 | 5 | $10.50 | $10.50 |
| Coding agent | 20 | 10 | $9.00 | $9.00 |

The competitor costs apply to Qwen3 VL 30B A3B Instruct, Command R, and DeepSeek V4.1 Flash 1017. All match MiniMax in every supplied scenario because their listed input and output rates are identical.

These are workload-specific monthly figures, separate from the blended price used in the headline comparison. The chatbot, RAG app, and coding-agent examples each have their own supplied input and output volumes.

## How it compares

All prices below are per million tokens. Each listed competitor has open weights and supports tool calling.

| Competitor | Input | Output | Blended | Context tokens | Maximum output tokens |
|---|---:|---:|---:|---:|---:|
| [Qwen3 VL 30B A3B Instruct](/models/alibaba/qwen3-vl-30b-a3b-instruct) | $0.15 | $0.60 | $0.2625 | 262,144 | 32,768 |
| [Command R](/models/cohere/command-r-08-2024) | $0.15 | $0.60 | $0.2625 | 128,000 | 4,000 |
| [DeepSeek V4.1 Flash 1017](/models/deepseek/deepseek-v4.1-flash-1017) · [compare](/compare/deepseek-v4.1-flash-1017-vs-minimax-m3.1-flash) | $0.15 | $0.60 | $0.2625 | 1,000,000 | 393,216 |

Qwen3 VL 30B A3B Instruct supports vision but does not list reasoning support. Command R lists neither reasoning nor vision support. DeepSeek V4.1 Flash 1017 supports both, matching MiniMax on those capabilities and context length, while listing a lower maximum output limit.

## Who should care

Developers comparing APIs for reasoning, tool calling, or vision have another open-weight option at these listed rates. Those evaluating context and output limits can compare MiniMax’s 1,000,000-token context and 512,000-token maximum output against the entries above.

For budget-focused buyers, the key distinction is the comparison target: MiniMax is lower-priced than DeepSeek V4.1 Flash on the supplied blended measure, but ties every listed competitor on both token rates and scenario costs. The supplied specifications do not establish differences in response quality or benchmark performance.
