---
title: 'GLM-5.3-FlashX-Legal: $0.59 Blended vs. Qwen4 Max at $2.1197'
description: >-
  Z.AI (Zhipu) released GLM-5.3-FlashX-Legal on 2026-11-02. It costs $0.37 per
  million input tokens and $1.25 per million output tokens, with a 1M-token
  contex…
date: '2026-11-24'
kind: flash
modelId: zhipuai/glm-5.3-flashx-legal
---
Z.AI (Zhipu)’s [GLM-5.3-FlashX-Legal](/models/zhipuai/glm-5.3-flashx-legal) has a listed blended price of $0.59 per million tokens, compared with $2.1197 for [Qwen4 Max](/models/alibaba/qwen4-max). That puts its blended price 72.2% below Qwen4 Max. Released November 2, 2026, the model supports reasoning, tool calling, and vision, with a 1,000,000-token context window and a maximum output of 131,072 tokens.

## What changed

GLM-5.3-FlashX-Legal is a new model entry, not a documented price revision. Its base input price is $0.37 per million tokens, and its output price is $1.25 per million tokens. It is not an open-weights model.

The context window, output limit, and supported capabilities are relevant distinctions alongside price. Among the listed alternatives, all share the same context capacity, but their maximum output limits and support for reasoning and vision differ.

The supplied information does not include an earlier price for GLM-5.3-FlashX-Legal. The comparison is therefore between current model listings, rather than a before-and-after change in its pricing.

## What it costs in practice

The following monthly costs use base-tier list prices. Input and output volumes are in millions of tokens per month; each model’s cost reflects the same workload within a row.

| Scenario | Input tokens, millions/month | Output tokens, millions/month | GLM-5.3-FlashX-Legal | Qwen Plus | Qwen3 Coder Flash | Qwen3.6 Flash |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $6.20 | $6.40 | $6.00 | $5.50 |
| RAG app | 50 | 5 | $24.75 | $26.00 | $22.50 | $20.00 |
| Coding agent | 20 | 10 | $19.90 | $20.00 | $21.00 | $20.00 |

GLM-5.3-FlashX-Legal costs less than Qwen Plus in every listed scenario. Qwen3.6 Flash has the lowest cost for the chatbot and RAG app workloads, while GLM-5.3-FlashX-Legal has the lowest cost for the coding-agent workload.

Those results illustrate why the blended price is not a substitute for checking a workload’s input and output mix. Qwen3 Coder Flash has a higher listed blended price than GLM-5.3-FlashX-Legal, yet costs less in the chatbot and RAG app scenarios.

## How it compares

Prices below are per million tokens. All listed competitors have a 1,000,000-token context window and are not open-weights models.

| Competitor | Input | Output | Blended | Maximum output |
|---|---:|---:|---:|---:|
| [Qwen Plus](/models/alibaba/qwen-plus) | $0.40 | $1.20 | $0.60 | 32,768 |
| [Qwen3 Coder Flash](/models/alibaba/qwen3-coder-flash) · [compare](/compare/glm-5.3-flashx-legal-vs-qwen3-coder-flash) | $0.30 | $1.50 | $0.60 | 65,536 |
| [Qwen3.6 Flash](/models/alibaba/qwen3.6-flash) | $0.25 | $1.50 | $0.5625 | 65,536 |

GLM-5.3-FlashX-Legal’s blended price is 1.7% below Qwen Plus and Qwen3 Coder Flash, but 4.9% above Qwen3.6 Flash. It is not the cheapest model in the listed class.

All listed competitors support tool calling. Qwen Plus supports reasoning but not vision; Qwen3 Coder Flash supports neither reasoning nor vision. Qwen3.6 Flash, like GLM-5.3-FlashX-Legal, supports both.

## Who should care

Developers comparing APIs for reasoning, tool use, and vision have a new option with a larger maximum output allowance than the listed competitors. Teams budgeting chatbot, RAG, or coding-agent workloads should compare their token mix against the scenario costs rather than relying only on the Qwen4 Max blended-price gap.

For deployments requiring open weights, GLM-5.3-FlashX-Legal does not meet that requirement.
