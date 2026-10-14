---
title: 'Gemini 4 Argon: $4 Blended Price vs. Muse Wonder''s $8'
description: >-
  Google released Gemini 4 Argon on 2026-10-13. It costs $2.00 per million input
  tokens and $10.00 per million output tokens, with a 1.05M-token context
  window.
date: '2026-10-14'
kind: flash
modelId: google/gemini-4-argon
---
Google released [Gemini 4 Argon](/models/google/gemini-4-argon) on October 13, 2026, with input pricing of $2 per million tokens, output pricing of $10 per million tokens, and a listed blended price of $4. That blended figure is 50% below [Muse Wonder](/models/meta/muse-wonder-1.0)’s $8. For developers comparing API options, however, Argon’s pricing matches the listed rates for Claude Sonnet 5, Claude Sonnet 5.5, and GPT-6 Sol.

## What changed

Gemini 4 Argon is a new model release, not a documented price reduction. The fact sheet provides no previous model pricing or percentage change against an earlier version.

The model supports reasoning, tool calling, and vision. Its context window is 1,048,576 tokens, and its maximum output is 32,768 tokens. It does not have open weights.

Those specifications establish the main points for API selection: supported capabilities, token limits, and input and output charges. The lower blended price relative to Muse Wonder is a pricing comparison; it does not establish a difference in model quality or benchmark performance.

Argon is also not identified as the cheapest model in its class. Its listed rates put it alongside the competitors below rather than below them.

## What it costs in practice

These scenarios show monthly costs at base-tier list prices. Input and output token volumes are in millions per month. Each workload has the same listed cost for Argon and the comparison models.

| Scenario | Input tokens, millions/month | Output tokens, millions/month | Gemini 4 Argon | Claude Sonnet 5 | Claude Sonnet 5.5 | GPT-6 Sol |
|---|---:|---:|---:|---:|---:|---:|
| Chatbot | 10 | 2 | $40 | $40 | $40 | $40 |
| RAG app | 50 | 5 | $150 | $150 | $150 | $150 |
| Coding agent | 20 | 10 | $140 | $140 | $140 | $140 |

For budgeting, the scenario totals are more directly applicable than the blended headline price because they specify the monthly input and output volumes. The fact sheet does not provide equivalent scenario costs for Muse Wonder, so the $8 comparison should remain a blended-price comparison rather than a workload-specific monthly estimate.

## How it compares

The listed competitors share Argon’s $2 input, $10 output, and $4 blended pricing.

| Competitor | Input price per million tokens | Output price per million tokens | Blended price | Context tokens | Maximum output tokens |
|---|---:|---:|---:|---:|---:|
| [Claude Sonnet 5](/models/anthropic/claude-sonnet-5) | $2 | $10 | $4 | 1,000,000 | 128,000 |
| [Claude Sonnet 5.5](/models/anthropic/claude-sonnet-5-5) | $2 | $10 | $4 | 1,000,000 | 128,000 |
| [GPT-6 Sol](/models/openai/gpt-6-sol) | $2 | $10 | $4 | 1,050,000 | 128,000 |

Argon’s context window is larger than those of the listed Claude models and smaller than GPT-6 Sol’s. Its maximum output is lower than every competitor shown. All of these models support reasoning, tool calling, and vision, and none has open weights.

## Who should care

Developers budgeting chatbot, RAG, or coding-agent applications have concrete monthly examples to compare. In the supplied scenarios, choosing Argon instead of the listed Anthropic or OpenAI models does not change the token bill.

Teams whose applications depend on context capacity or maximum response length should examine those limits separately from pricing. Argon’s supported capabilities match the listed competitors, but its output ceiling differs. For buyers considering Muse Wonder, the documented distinction is Argon’s lower blended price—not a demonstrated quality advantage or a supplied monthly workload saving.
