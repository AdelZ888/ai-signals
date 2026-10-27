---
title: 'GPT-6.1 Terra: $2 Blended Price vs. Grok 4.7 at $3'
description: >-
  OpenAI released GPT-6.1 Terra on 2026-10-26. It costs $1.00 per million input
  tokens and $5.00 per million output tokens, with a 1.05M-token context window.
date: '2026-10-27'
kind: flash
modelId: openai/gpt-6.1-terra
---
OpenAI released [GPT-6.1 Terra](/models/openai/gpt-6.1-terra) on October 26, 2026, with a listed blended token price of $2, compared with $3 for [Grok 4.7](/models/xai/grok-4.7). Terra’s blended price is 33.3% lower than Grok’s, but it is not the cheapest model in its class. For developers choosing an API, the relevant details include its separate input and output rates, large context window, and how those rates translate into monthly workload costs.

## What changed

Terra is a new model release, with input pricing of $1 and output pricing of $5 per million tokens. It supports a context window of 1,050,000 tokens and a maximum output of 128,000 tokens.

The model supports reasoning, tool calling, and vision. Its weights are not open. Those capabilities place it alongside the listed Anthropic and Meta alternatives, which also support reasoning, tool calling, and vision and do not offer open weights.

There is no prior Terra pricing entry in the supplied data, so this release should not be read as a price cut. The pricing comparison is between the newly listed model and other available models, rather than between old and new Terra rates.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens | Output tokens | GPT-6.1 Terra | Claude Haiku 4.5 | Muse Spark 1.1 | Muse Spark 1.2 |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $20 | $20 | $21 | $21 |
| RAG app | 50 | 5 | $75 | $75 | $83.75 | $83.75 |
| Coding agent | 20 | 10 | $70 | $70 | $67.5 | $67.5 |

Terra matches Claude Haiku 4.5 in every listed scenario. Against the Muse Spark models, the result depends on the workload: Terra costs less in the chatbot and RAG examples, while both Muse Spark versions cost less in the coding-agent example.

That distinction matters because the same listed blended price does not produce the same bill for every input-output mix. Terra and Haiku share identical input and output rates; the Muse Spark models have higher input rates but lower output rates.

## How it compares

Prices below are per million tokens. Context and maximum output figures are token counts.

| Model | Input | Output | Blended | Context | Maximum output |
|---|---:|---:|---:|---:|---:|
| GPT-6.1 Terra | $1 | $5 | $2 | 1,050,000 | 128,000 |
| [Claude Haiku 4.5](/models/anthropic/claude-haiku-4-5) · [compare](/compare/claude-haiku-4-5-vs-gpt-6.1-terra) | $1 | $5 | $2 | 200,000 | 64,000 |
| [Muse Spark 1.1](/models/meta/muse-spark-1.1) | $1.25 | $4.25 | $2 | 1,048,576 | 131,072 |
| [Muse Spark 1.2](/models/meta/muse-spark-1.2) | $1.25 | $4.25 | $2 | 1,048,576 | 131,072 |

Terra has a larger context window than each listed competitor. Its maximum output exceeds Haiku’s but is below the maximum supported by either Muse Spark version. All of these models share the $2 blended price, so that headline figure alone does not distinguish them.

## Who should care

Developers comparing long-context APIs should note Terra’s context limit alongside its input rate. Teams budgeting chatbot or RAG workloads can use the supplied scenarios as concrete list-price examples, while coding-agent developers should note the lower Muse Spark costs in that scenario.

For buyers comparing Terra with Grok 4.7, the supplied distinction is blended price. The fact sheet provides no benchmark results, so the price gap does not establish a quality or performance advantage.
