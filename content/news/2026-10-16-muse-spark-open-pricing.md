---
title: 'Muse Spark Open: $2 blended price vs. Grok 4.7 at $3'
description: >-
  Meta released Muse Spark Open on 2026-10-15. It costs $1.25 per million input
  tokens and $4.25 per million output tokens, with a 1.05M-token context window.
date: '2026-10-16'
kind: flash
modelId: meta/muse-spark-open
---
Meta’s [Muse Spark Open](/models/meta/muse-spark-open), released October 15, 2026, has a listed blended price of $2, compared with $3 for [Grok 4.7](/models/xai/grok-4.7). That puts Muse Spark Open’s blended price 33.3% below Grok’s. The model has open weights and supports reasoning, tool calling, and vision, with a context window of 1,048,576 tokens and a maximum output of 131,072 tokens.

## What changed

Muse Spark Open is a new model release, rather than a price update to an existing model. Its list rates are $1.25 per million input tokens and $4.25 per million output tokens.

The headline blended price places it alongside Qwen3 Coder Plus and Claude Haiku 4.5, both listed at $2. It is below QVQ Max’s $2.10 blended price, but Muse Spark Open is not the cheapest model in its class.

For developers choosing an API, the input and output rates matter alongside the blended figure. Muse Spark Open charges more for input than Qwen3 Coder Plus and Claude Haiku 4.5, but less for output. The supplied workload scenarios show how that difference affects monthly spending.

## What it costs in practice

These are monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens | Output tokens | Muse Spark Open | Qwen3 Coder Plus | Claude Haiku 4.5 | QVQ Max |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $21 | $20 | $20 | $21.60 |
| RAG app | 50 | 5 | $83.75 | $75 | $75 | $84 |
| Coding agent | 20 | 10 | $67.50 | $70 | $70 | $72 |

Muse Spark Open costs more than Qwen3 Coder Plus and Claude Haiku 4.5 in the chatbot and RAG app scenarios, despite their matching blended prices. In the coding-agent scenario, Muse Spark Open costs less than either model.

Against QVQ Max, Muse Spark Open has a lower monthly cost in every supplied scenario. These examples make the pricing distinction concrete: matching blended prices do not necessarily produce matching bills for a particular input-output mix.

## How it compares

Prices below are per million tokens, with the listed blended price shown separately.

| Competitor | Input | Output | Blended | Context tokens | Max output tokens | Open weights | Supported capabilities |
|---|---:|---:|---:|---:|---:|---|---|
| [Qwen3 Coder Plus](/models/alibaba/qwen3-coder-plus) | $1 | $5 | $2 | 1,048,576 | 65,536 | Yes | Tool calling |
| [Claude Haiku 4.5](/models/anthropic/claude-haiku-4-5) | $1 | $5 | $2 | 200,000 | 64,000 | No | Reasoning, tool calling, vision |
| [QVQ Max](/models/alibaba/qvq-max) | $1.20 | $4.80 | $2.10 | 131,072 | 8,192 | No | Reasoning, tool calling, vision |

Muse Spark Open matches Qwen3 Coder Plus’s context window and has a higher maximum output limit. Unlike Qwen3 Coder Plus, it also lists reasoning and vision support. Claude Haiku 4.5 and QVQ Max support the same listed capabilities as Muse Spark Open, but have smaller context windows and lower maximum output limits.

## Who should care

Developers looking for open weights together with reasoning, tool calling, and vision have a new option to evaluate. Teams comparing API costs should focus on their input-output mix rather than the blended price alone: the supplied scenarios favor different models for chatbot, RAG, and coding-agent workloads. Muse Spark Open’s context and output limits are also relevant selection criteria, separate from its lower blended price versus Grok 4.7.
