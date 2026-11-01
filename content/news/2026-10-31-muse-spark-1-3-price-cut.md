---
title: 'Muse Spark 1.3 Contributor drops 93.7%, now cheaper than Claude Haiku 5.5'
description: >-
  Meta changed the price of Muse Spark 1.3 Contributor on 2026-10-31: input goes
  from $1.25 to $0.10 and output from $4.25 to $0.20 per million tokens, a
  −93.7…
date: '2026-11-01'
kind: flash
modelId: meta/muse-spark-1.3
---
Meta cut the blended price of [Muse Spark 1.3 Contributor](/models/meta/muse-spark-1.3) by 93.7% on October 31, 2026, bringing it to $0.125 per million tokens from $2. The new blended rate is 37.5% below [Claude Haiku 5.5](/models/anthropic/claude-haiku-5-5), which is listed at $0.20. For developers choosing an API, the change substantially lowers Muse’s listed price, though the supplied workload examples show that its cost relative to alternatives still depends on the mix of input and output tokens.

## What changed

Muse Spark 1.3 Contributor now costs $0.10 per million input tokens and $0.20 per million output tokens. Those rates were previously $1.25 for input and $4.25 for output.

The context window remains unchanged at 1,048,576 tokens. The model supports a maximum output of 131,072 tokens, along with reasoning, tool calling, and vision. Its weights are not open.

The model was released on September 2, 2026. This update is a pricing change; the fact sheet does not report a corresponding change to its capabilities. Developers reviewing the new rates should therefore distinguish the lower API cost from any claim about model quality or benchmark performance.

## What it costs in practice

The following scenarios use monthly token volumes in millions and monthly costs at base-tier list prices. They show why the blended-price ranking does not necessarily match the bill for a particular workload.

| Scenario | Input tokens (M/month) | Output tokens (M/month) | Muse Spark | Qwen3 30B A3b fp8 | Qwen Flash | Gemma 4 26B A4B IT |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $1.40 | $1.18 | $1.30 | $1.38 |
| RAG app | 50 | 5 | $6.00 | $4.22 | $4.50 | $5.20 |
| Coding agent | 20 | 10 | $4.00 | $4.37 | $5.00 | $4.80 |

Muse costs more than each listed competitor in the chatbot and RAG examples. In the coding-agent example, it costs less than all of them. Its input rate is higher than each competitor’s, while its output rate is lower.

## How it compares

All prices below are per million tokens. The comparison separates input, output, and blended rates rather than treating the blended figure as a universal workload cost.

| Model | Input | Output | Blended | Context tokens | Open weights |
|---|---:|---:|---:|---:|---|
| [Qwen3 30B A3b fp8](/models/alibaba/qwen3-30b-a3b) | $0.0509 | $0.335 | $0.1219 | 32,768 | Yes |
| [Qwen Flash](/models/alibaba/qwen-flash) | $0.05 | $0.40 | $0.1375 | 1,000,000 | No |
| [Gemma 4 26B A4B IT](/models/google/gemma-4-26b-a4b-it) | $0.07 | $0.34 | $0.1375 | 262,144 | Yes |

Qwen3 has a lower blended rate than Muse. Qwen Flash and Gemma have higher blended rates, despite their lower costs in the supplied chatbot and RAG scenarios.

All listed competitors support reasoning and tool calling. Gemma also supports vision; the listed Qwen models do not. Each competitor has a maximum output of 32,768 tokens, below Muse’s 131,072-token limit.

## Who should care

Developers already using Muse should review budgets against the lower input and output rates. Teams comparing APIs for output-heavy applications should note its lower coding-agent cost in the supplied example, while teams with input-heavy workloads should examine the chatbot and RAG figures before choosing on blended price alone.

The capability differences also remain relevant: Muse combines vision, tool calling, and reasoning with a larger context window and maximum output than the listed competitors. Teams requiring open weights, however, will find that property in Qwen3 and Gemma, not Muse.
