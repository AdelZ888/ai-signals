---
title: Kimi K2.7 Code Halves Prices; $1.7125 Blended Cost Undercuts Muse Spark Open
description: >-
  Moonshot AI changed the price of Kimi K2.7 Code on 2026-10-24: input goes from
  $1.90 to $0.95 and output from $8.00 to $4.00 per million tokens, a −50%
  chang…
date: '2026-10-25'
kind: flash
modelId: moonshotai/kimi-k2.7-code
---
Moonshot AI cut prices for [Kimi K2.7 Code](/models/moonshotai/kimi-k2.7-code) by 50% on October 24, 2026, bringing its listed blended cost to $1.7125 from $3.425. That puts it 14.4% below [Muse Spark Open](/models/meta/muse-spark-open), whose blended cost is $2. The reduction changes Kimi’s position on API pricing, but it does not make the model the cheapest option among the listed competitors.

## What changed

Kimi K2.7 Code’s input price fell to $0.95 from $1.90, while its output price dropped to $4 from $8. Both rates are per million tokens. The blended price also fell by 50%.

The context window remains 262,144 tokens. The model lists a maximum output of 262,144 tokens, open weights, reasoning, tool calling, and vision support. Its release date is June 12, 2026; this event is a price change rather than a new model release.

For API buyers, the distinction between input and output pricing matters. Kimi’s new input rate is higher than GPT-5.4 mini’s but lower than the rates for DeepSeek V4 Pro and Grok 4.20 (Non-Reasoning). Its output rate reverses that relationship: it is below GPT-5.4 mini’s and above the other listed alternatives.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens (M) | Output tokens (M) | Kimi K2.7 Code | GPT-5.4 mini | DeepSeek V4 Pro | Grok 4.20 (Non-Reasoning) |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $17.50 | $16.50 | $18.20 | $17.50 |
| RAG app | 50 | 5 | $67.50 | $60 | $78 | $75 |
| Coding agent | 20 | 10 | $59 | $60 | $52 | $50 |

The workload mix changes the ordering. In the chatbot scenario, Kimi matches Grok’s monthly cost, costs more than GPT-5.4 mini, and costs less than DeepSeek V4 Pro. In the RAG scenario, only GPT-5.4 mini is cheaper.

The coding-agent scenario produces a different result. Kimi costs less than GPT-5.4 mini, while DeepSeek V4 Pro and Grok both have lower monthly bills. These examples make the scenario costs more useful for budgeting than the blended figure alone.

## How it compares

All prices below are per million tokens. The blended column uses the supplied blended prices.

| Competitor | Input | Output | Blended | Context tokens | Open weights |
|---|---:|---:|---:|---:|---|
| [GPT-5.4 mini](/models/openai/gpt-5.4-mini) | $0.75 | $4.50 | $1.6875 | 400,000 | No |
| [DeepSeek V4 Pro](/models/deepseek/deepseek-v4-pro) | $1.30 | $2.60 | $1.625 | 1,048,576 | Yes |
| [Grok 4.20 (Non-Reasoning)](/models/xai/grok-4.20-0309-non-reasoning) | $1.25 | $2.50 | $1.5625 | 1,000,000 | No |

Each listed competitor has a lower blended price and a larger context window than Kimi. Kimi, however, lists a higher maximum output than any of them: GPT-5.4 mini supports 128,000 tokens, DeepSeek V4 Pro supports 16,384, and Grok supports 30,000.

Feature requirements also separate the options. All listed competitors support tool calling. GPT-5.4 mini supports reasoning and vision; DeepSeek V4 Pro supports reasoning but not vision; Grok’s listed variant supports vision but not reasoning.

## Who should care

Developers already budgeting for Kimi K2.7 Code should revisit their cost estimates using the reduced input and output rates. Teams comparing APIs should focus on their expected token mix: Kimi’s position differs between the RAG and coding-agent examples.

For buyers requiring open weights alongside reasoning, tool calling, and vision, Kimi lists that combination. The price cut makes that configuration less expensive, without changing its listed context limit.
