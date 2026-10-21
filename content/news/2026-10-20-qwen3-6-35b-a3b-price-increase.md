---
title: 'Qwen3.6 35B-A3B: $0.8438 blended vs. $0.85 for Gemini 3.5 Flash Lite'
description: >-
  Alibaba (Qwen) changed the price of Qwen3.6 35B-A3B on 2026-10-20: input goes
  from $0.248 to $0.375 and output from $1.485 to $2.25 per million tokens, a
  +51…
date: '2026-10-21'
kind: flash
modelId: alibaba/qwen3.6-35b-a3b
---
Alibaba (Qwen) raised pricing for [Qwen3.6 35B-A3B](/models/alibaba/qwen3.6-35b-a3b) on October 20, 2026, bringing its listed blended rate to $0.8438 from $0.5573, a 51.4% increase. That leaves it just below Gemini 3.5 Flash Lite’s $0.85 blended rate. For developers choosing an API, however, the input and output rates matter more than that narrow blended-price gap: the supplied monthly scenarios put Qwen below Gemini for the coding-agent workload, but above it for chatbot and RAG workloads.

## What changed

Qwen3.6 35B-A3B’s input price increased to $0.375 per million tokens from $0.248. Its output price rose to $2.25 per million tokens from $1.485.

The context window remains unchanged at 262,144 tokens. The model lists a maximum output of 65,536 tokens and supports reasoning, tool calling, and vision. It has open weights and a release date of April 17, 2026.

This update is a pricing change, not a context-window expansion. Existing users assessing the impact should distinguish the higher token rates from the unchanged context allowance. The listed blended rate provides a comparison point, but the workload examples show why it is not a substitute for pricing an application’s actual input and output volume.

## What it costs in practice

The following are monthly costs at base-tier list prices. Input and output volumes are in millions of tokens per month.

| Scenario | Input tokens (M) | Output tokens (M) | Qwen3.6 35B-A3B | Gemini 2.5 Flash | Gemini 3.5 Flash Lite | GLM-4.5V |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $8.25 | $8 | $8 | $9.60 |
| RAG app | 50 | 5 | $30 | $27.50 | $27.50 | $39 |
| Coding agent | 20 | 10 | $30 | $31 | $31 | $30 |

The chatbot and RAG examples favor the Gemini models on cost, despite Qwen’s lower listed blended rate. The coding-agent example reverses that ordering: Qwen costs $30, compared with $31 for either Gemini model, and matches GLM-4.5V.

These scenarios make the input/output split important. Qwen’s input rate is higher than the Gemini rates, while its output rate is lower.

## How it compares

Prices below are per million tokens. Context and maximum output are measured in tokens.

| Competitor | Input | Output | Blended | Context | Maximum output | Open weights |
|---|---:|---:|---:|---:|---:|---|
| [Gemini 2.5 Flash](/models/google/gemini-2.5-flash) | $0.30 | $2.50 | $0.85 | 1,048,576 | 65,536 | No |
| [Gemini 3.5 Flash Lite](/models/google/gemini-3.5-flash-lite) | $0.30 | $2.50 | $0.85 | 1,048,576 | 65,536 | No |
| [GLM-4.5V](/models/zhipuai/glm-4.5v) | $0.60 | $1.80 | $0.90 | 64,000 | 16,384 | Yes |

All listed competitors support reasoning, tool calling, and vision. The Gemini models offer larger context windows than Qwen and the same maximum output. GLM-4.5V has a smaller context window and maximum output, with a higher input rate but a lower output rate than Qwen.

## Who should care

Existing Qwen API users should revisit budgets following the 51.4% blended-price increase. Developers selecting a model should compare token mix alongside context limits and open-weight availability.

Qwen is not the cheapest model in its class. Its listed blended rate remains below those of the competitors shown, but the monthly examples demonstrate that a lower blended rate does not guarantee a lower application bill. These comparisons establish pricing and listed capabilities, not relative model quality.
