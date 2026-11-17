---
title: 'Qwen4 Max Blended Price: $2.1197 vs Gemini 4 Hydrogen at $3'
description: >-
  Alibaba (Qwen) released Qwen4 Max on 2026-11-16. It costs $1.413 per million
  input tokens and $4.24 per million output tokens, with a 1M-token context
  window.
date: '2026-11-17'
kind: flash
modelId: alibaba/qwen4-max
---
Alibaba (Qwen) released [Qwen4 Max](/models/alibaba/qwen4-max) on November 16, 2026, with a listed blended price of $2.1197, compared with $3 for [Gemini 4 Hydrogen](/models/google/gemini-4-hydrogen). Qwen4 Max’s blended price is 29.3% lower than Gemini’s. Its API pricing is $1.413 per million input tokens and $4.24 per million output tokens. The model supports reasoning, tool calling, and vision, with a 1,000,000-token context window.

## What changed

Qwen4 Max is a new model release, not a price revision to an existing listing. It has a maximum output of 262,144 tokens and does not offer open weights.

For developers evaluating the release, the listed specifications combine vision support with reasoning and tool calling. Its context window matches those of GLM-5.2 and GLM-5.3, while its maximum output is higher than the 131,072-token limit listed for each GLM competitor in the fact sheet.

The price comparison is not uniform across token types: Qwen4 Max’s input rate is higher than the GLM models’ rate, while its output rate is lower.

## What it costs in practice

The following scenarios show monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month; the costs reflect the specified workload rather than the blended-price figure.

| Scenario | Input tokens, millions/month | Output tokens, millions/month | Qwen4 Max | GLM-5.1 | GLM-5.2 | GLM-5.3 |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $22.61 | $22.80 | $22.80 | $22.80 |
| RAG app | 50 | 5 | $91.85 | $92 | $92 | $92 |
| Coding agent | 20 | 10 | $70.66 | $72 | $72 | $72 |

Qwen4 Max costs less than each listed GLM model in every supplied scenario. The RAG app has the highest monthly Qwen4 Max bill among these workloads, followed by the coding agent and chatbot. These are workload-specific totals, not flat monthly subscription prices.

## How it compares

All listed GLM competitors come from Z.AI (Zhipu). Each supports reasoning and tool calling, offers open weights, and lacks vision support. Their input and output prices below are per million tokens.

| Model | Input | Output | Blended | Context tokens | Comparison |
|---|---:|---:|---:|---:|---|
| [GLM-5.1](/models/zhipuai/glm-5.1) | $1.40 | $4.40 | $2.15 | 200,000 | — |
| [GLM-5.2](/models/zhipuai/glm-5.2) | $1.40 | $4.40 | $2.15 | 1,000,000 | [compare](/compare/glm-5.2-vs-qwen4-max) |
| [GLM-5.3](/models/zhipuai/glm-5.3) | $1.40 | $4.40 | $2.15 | 1,000,000 | [compare](/compare/glm-5.3-vs-qwen4-max) |

Each GLM model’s blended price is 1.4% higher than Qwen4 Max’s. That places the listed GLM alternatives closer to Qwen4 Max on blended pricing than Gemini 4 Hydrogen. Qwen4 Max is not identified as the cheapest model in its class.

## Who should care

Developers choosing an API for workloads that require vision, reasoning, and tool calling have Qwen4 Max’s support for those capabilities to consider alongside its token prices. Teams comparing long-context options can also distinguish its 1,000,000-token window from GLM-5.1’s 200,000-token window.

For teams that require open weights, the distinction runs the other way: the listed GLM models offer them, while Qwen4 Max does not. Budget comparisons should retain the input/output split, since Qwen4 Max’s lower blended price coexists with a higher input rate than the GLM alternatives.
