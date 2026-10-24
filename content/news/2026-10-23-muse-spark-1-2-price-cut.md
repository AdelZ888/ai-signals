---
title: 'Muse Spark 1.2 Contributor: $0.125 vs DeepSeek V4.1 Flash 1017 at $0.2625'
description: >-
  Meta changed the price of Muse Spark 1.2 Contributor on 2026-10-23: input goes
  from $1.25 to $0.10 and output from $4.25 to $0.20 per million tokens, a
  −93.7…
date: '2026-10-24'
kind: flash
modelId: meta/muse-spark-1.2
---
Meta’s [Muse Spark 1.2 Contributor](/models/meta/muse-spark-1.2) received a price cut on October 23, 2026, bringing its listed blended rate to $0.125 from $2, a reported decrease of 93.7%. That puts it below [DeepSeek V4.1 Flash 1017](/models/deepseek/deepseek-v4.1-flash-1017), whose blended rate is $0.2625. For developers choosing an API, the distinction is between that headline blended rate and the monthly bill for a particular input-and-output workload.

## What changed

The listed input rate fell from $1.25 to $0.10, while the output rate dropped from $4.25 to $0.20. The context window remains at 1,048,576 tokens.

Muse Spark 1.2 Contributor was released on August 5, 2026. It supports reasoning, tool calling, and vision, with a maximum output of 131,072 tokens. Its weights are not open. The price-change record does not identify a change to those capabilities.

Against DeepSeek V4.1 Flash 1017, Muse’s blended rate is 52.4% lower. That comparison concerns pricing; the supplied information does not establish a difference in model quality or benchmark performance.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens, millions | Output tokens, millions | Muse Spark 1.2 Contributor | Qwen3 30B A3b fp8 | Qwen Flash | Gemma 4 26B A4B IT |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $1.40 | $1.18 | $1.30 | $1.38 |
| RAG app | 50 | 5 | $6 | $4.22 | $4.50 | $5.20 |
| Coding agent | 20 | 10 | $4 | $4.37 | $5 | $4.80 |

Muse has the lowest listed cost in the coding-agent scenario, but not in the chatbot or RAG-app scenarios. Qwen3 30B A3b fp8 is the least expensive option in those latter workloads.

The scenarios illustrate why the blended rate alone is not enough to select the lowest-cost API. Muse’s listed input rate is higher than those of the competitors shown, while its output rate is lower. The workload’s input-and-output balance therefore matters when comparing the supplied monthly totals.

## How it compares

These competitors have listed blended rates close to Muse’s $0.125.

| Model | Input rate | Output rate | Blended rate | Context tokens | Open weights |
|---|---:|---:|---:|---:|---|
| [Qwen3 30B A3b fp8](/models/alibaba/qwen3-30b-a3b) | $0.0509 | $0.335 | $0.1219 | 32,768 | Yes |
| [Qwen Flash](/models/alibaba/qwen-flash) | $0.05 | $0.40 | $0.1375 | 1,000,000 | No |
| [Gemma 4 26B A4B IT](/models/google/gemma-4-26b-a4b-it) | $0.07 | $0.34 | $0.1375 | 262,144 | Yes |

All the listed competitors support reasoning and tool calling. Gemma also supports vision; the Qwen models listed here do not. Each competitor has a maximum output of 32,768 tokens, compared with Muse’s 131,072.

Qwen3’s blended rate is 2.5% below Muse’s. Qwen Flash and Gemma each have a blended rate 10% above Muse’s, despite costing less in the supplied chatbot and RAG-app scenarios.

## Who should care

Developers already using Muse should revisit their cost estimates following the reduction. Teams evaluating coding-agent workloads should note its lower monthly cost in the supplied scenario, alongside its tool-calling support and output limit.

For chatbot and RAG applications, the competing monthly totals deserve attention even when Muse’s blended rate looks lower. Developers requiring vision, open weights, or a particular context window also have concrete differences to weigh. The price cut changes the cost comparison, but the fact sheet provides no basis for a quality ranking.
