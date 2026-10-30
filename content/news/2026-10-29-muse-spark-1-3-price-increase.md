---
title: 'Muse Spark 1.3: $1.25 Input vs. $1 for Claude Haiku 4.5'
description: >-
  Meta changed the price of Muse Spark 1.3 on 2026-10-29: input goes from $0.10
  to $1.25 and output from $0.20 to $4.25 per million tokens, a +1500% change
  in…
date: '2026-10-30'
kind: flash
modelId: meta/muse-spark-1.3
---
Meta’s [Muse Spark 1.3](/models/meta/muse-spark-1.3) pricing changed on October 29, 2026, to $1.25 per million input tokens and $4.25 per million output tokens. Its listed blended rate is now $2, matching Claude Haiku 4.5 and GPT-6.1 Terra. The input rate is higher than those rivals’ $1, while its output rate is lower than their $5. For developers choosing an API, the cost comparison depends on the balance of input and output traffic.

## What changed

Muse Spark 1.3 previously cost $0.10 per million input tokens and $0.20 per million output tokens, with a listed blended rate of $0.125. The new blended rate represents a 1,500% increase.

The context window remains unchanged at 1,048,576 tokens. The model lists a maximum output of 131,072 tokens and supports reasoning, tool calling, and vision. Its weights are not open.

Released on September 2, 2026, Muse Spark 1.3 is no longer the cheapest option in the listed comparison group. Its new prices place it alongside models with the same listed blended rate, rather than below them. That blended-rate parity does not mean identical bills: the individual input and output rates differ.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens (M/month) | Output tokens (M/month) | Muse Spark 1.3 | Claude Haiku 4.5 | GPT-6.1 Terra | GLM-5-Turbo |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $21 | $20 | $20 | $20 |
| RAG app | 50 | 5 | $83.75 | $75 | $75 | $80 |
| Coding agent | 20 | 10 | $67.50 | $70 | $70 | $64 |

Muse Spark costs more than every listed competitor in the chatbot and RAG app scenarios. In the coding-agent scenario, it costs less than Claude Haiku and GPT-6.1 Terra, but more than GLM-5-Turbo.

These examples make the input-output distinction concrete. The RAG app’s heavier input volume produces a higher Muse Spark bill than either rival with a $1 input rate. The coding-agent scenario has more output traffic, and Muse Spark’s lower output rate puts its bill below those same rivals.

## How it compares

All prices below are per million tokens. Context and maximum output are token limits.

| Competitor | Input | Output | Blended | Context | Maximum output |
|---|---:|---:|---:|---:|---:|
| [Claude Haiku 4.5](/models/anthropic/claude-haiku-4-5) | $1 | $5 | $2 | 200,000 | 64,000 |
| [GPT-6.1 Terra](/models/openai/gpt-6.1-terra) | $1 | $5 | $2 | 1,050,000 | 128,000 |
| [GLM-5-Turbo](/models/zhipuai/glm-5-turbo) | $1.20 | $4 | $1.90 | 200,000 | 131,072 |

All listed competitors support reasoning and tool calling, and none has open weights. Claude Haiku and GPT-6.1 Terra also support vision; GLM-5-Turbo does not.

Muse Spark’s context window exceeds those of Claude Haiku and GLM-5-Turbo, while GPT-6.1 Terra’s is larger. Its maximum output matches GLM-5-Turbo and exceeds the other listed models.

## Who should care

Developers already budgeting around Muse Spark’s previous rates should revisit their monthly estimates. The price change leaves the context window intact but substantially changes the listed cost.

For teams comparing APIs, the supplied scenarios favor different alternatives depending on traffic mix. Input-heavy applications should pay particular attention to input rates, while output-heavy workloads should compare output charges separately. Context limits, maximum output, and vision support also distinguish these options; their similar blended prices do not make them interchangeable.
