---
title: 'How LLM API Pricing Works: Tokens, Input vs Output and Hidden Costs'
description: 'A plain-English guide to LLM API pricing: what a token is, why output costs more than input, long-context tiers, caching, batch discounts and reasoning tokens.'
date: '2026-10-16'
kind: flash
---
Every major AI model API, from OpenAI and Anthropic to Google, Mistral and DeepSeek, bills the same way: you pay for **tokens**, priced **per million**, with separate prices for what you send and what the model writes back. Once you understand the handful of rules below, any price sheet becomes easy to read, and you can predict your bill before you ship.

## What is a token?

A token is the unit a model reads and writes. It is usually a piece of a word: common words are a single token, rarer words are split into several. As a rule of thumb, **one token is about three quarters of an English word**, so a million tokens is roughly 750,000 words. Code, non-English text and numbers often use more tokens per word.

Everything you send counts as input tokens, not just the user's message:

- the system prompt and any instructions,
- the conversation history you resend on every turn,
- retrieved documents in a RAG pipeline,
- tool and function definitions,
- images, PDFs and audio, which are converted into tokens too.

## Input and output are priced separately

Price sheets show two numbers, for example **$0.10 input / $0.50 output per 1M tokens** (Claude Haiku 5.5 at the time of writing). Output is almost always more expensive, typically three to five times the input price, because generating text one token at a time takes far more compute than reading a prompt.

This is why the mix matters as much as the price. A RAG assistant that reads long documents and answers in two sentences is input-heavy; a coding agent that writes long diffs is output-heavy. Two models with the same input price can produce very different bills.

To compare models with a single number, AI Signals uses a **blended price**: (3 × input + output) / 4. The 3:1 weighting reflects a typical chat or RAG workload. It is a comparison tool, not a bill: always plug your real token mix into the [cost calculator](/calculator).

## Long-context tiers

Some models charge more once a single request goes beyond a threshold. Claude Haiku 5.5, for example, bills prompts above 100K tokens at $0.50 input and $2.50 output instead of $0.10 and $0.50. GPT-6.1 Sol switches to $4 and $15 above 272K tokens. About 30 of the 250 models we track have a tier like this; each [model page](/models) lists it in the spec sheet.

A big context window is a capability, not a free resource: you pay for every token you put in it, on every request.

## Prompt caching

When the beginning of your prompt repeats across requests (a long system prompt, a product catalog, a codebase), many providers let you cache it. Cached input is billed at a fraction of the normal rate: on Claude Haiku 5.5, a cached read costs $0.01 per 1M tokens instead of $0.10. Some providers also charge a one-time premium to write the cache. Half of the models we track publish a cache price. We cover the details in [Prompt caching explained](/guides/prompt-caching-explained).

## Batch discounts

If you do not need an answer immediately, batch APIs process requests asynchronously, usually within a day, at a large discount, commonly around half price. They are ideal for evaluations, classification, embeddings backfills and nightly reports. See [Batch APIs vs real-time](/guides/batch-api-vs-real-time).

## Reasoning tokens

Reasoning models think before they answer. That hidden reasoning is generated text, and providers generally bill it as **output tokens**, even when you never see it. A short answer can therefore cost more than its length suggests. If a model lets you set a reasoning effort level, lowering it for simple tasks is one of the easiest savings available.

## Hidden costs to watch

- **Resent history**: in a chat, every turn resends the whole conversation, so input grows with each message. Trim or summarize old turns.
- **Retries and failures**: timeouts, invalid JSON and guardrail retries are billed like normal calls.
- **Verbose prompts**: a 2,000-token system prompt sent a million times is 2 billion input tokens.
- **Tool schemas**: large function definitions are input tokens on every call that includes them.

## How to choose a model on price

1. Estimate your monthly input and output tokens (see [How to estimate the monthly cost of an LLM app](/guides/estimate-llm-app-cost)).
2. Filter by what you actually need: image input, tool calling, context length, reasoning.
3. Compare the cheapest models that meet those needs, for example with the [cheapest LLM APIs](/best/cheapest-llm-api) or the [cheapest vision models](/best/cheapest-vision-model).
4. Check caching and batch options before you commit; they often matter more than the list price.

Prices change often, sometimes weekly. Every price on AI Signals is refreshed daily, and every change is logged in the [changelog](/changes).
