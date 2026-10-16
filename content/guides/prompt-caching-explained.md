---
title: 'Prompt Caching Explained: How Much Can It Save on LLM API Costs?'
description: 'What prompt caching is, how cached input is billed, when it pays off and how to structure prompts to get the cache hit rate up.'
date: '2026-10-16'
kind: flash
---
If your application sends the same long instructions, documents or code with every request, you are probably paying full price for tokens the provider has already processed. Prompt caching fixes that. On many models it cuts the price of repeated input by around 90%.

## How it works

When a request starts with a prefix the provider has seen recently, it can reuse the work it did on that prefix instead of processing it again. The cached part of the input is billed at a reduced **cache read** price; the rest of the prompt and the output are billed normally.

Some providers also charge a **cache write** price the first time a prefix is stored, slightly above the normal input price. Caches expire after a period of inactivity, typically minutes, sometimes longer on request.

At the time of writing, for example:

| Model | Input / 1M | Cache read / 1M | Cache write / 1M |
|---|---|---|---|
| Claude Haiku 5.5 | $0.10 | $0.01 | $0.125 |
| GPT-6.1 Sol | $2.00 | $0.10 | $2.50 |
| Gemini 3.8 Flash | $0.75 | $0.075 | n/a |

About half of the 250 models AI Signals tracks publish a cache price. Each [model page](/models) shows it in the spec sheet when it exists.

## When caching pays off

Caching only helps when the **same prefix** is reused **often enough** before it expires. Good candidates:

- **Long system prompts** with instructions, examples and policies.
- **RAG over a stable knowledge base**, when the same documents are attached to many questions.
- **Multi-turn chats**, where each turn resends the previous ones.
- **Coding agents**, which send the same files again and again.
- **Batch jobs** that apply one long prompt to many inputs.

It helps little when every request is different, or when traffic is so sparse that the cache expires between calls.

## A quick estimate

Suppose each request carries a 6,000-token prefix that repeats, plus 500 tokens that change, on a model priced at $1 input with cache reads at $0.10:

- without caching: 6,500 input tokens × $1 per million = $0.0065 per request,
- with caching: 6,000 × $0.10 + 500 × $1, per million = $0.0011 per request.

That is about **83% less on input**, before counting the occasional cache write. Output tokens are unaffected, so the saving on the total bill depends on how input-heavy your workload is.

## How to get a high hit rate

1. **Put stable content first.** Caches match from the start of the prompt: system instructions, tool definitions, then documents, then the conversation, then the new question.
2. **Do not inject changing values early.** A timestamp or user ID at the top of the system prompt breaks the prefix for everyone.
3. **Keep tool definitions identical** across calls, in the same order.
4. **Batch similar requests close together** so the cache is still warm.
5. **Check the usage fields** the API returns: most providers report cached input tokens separately, so you can measure the real hit rate.

## Caching vs a cheaper model

Caching and model choice stack. A smaller model with caching can be dramatically cheaper than a flagship without it. Use the [cost calculator](/calculator) to compare base prices, then apply the cache discount to the share of your input that repeats.

Related guides: [How LLM API pricing works](/guides/how-llm-api-pricing-works) and [How to estimate the monthly cost of an LLM app](/guides/estimate-llm-app-cost).
