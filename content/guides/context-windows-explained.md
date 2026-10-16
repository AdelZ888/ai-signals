---
title: 'Context Windows Explained: Do You Really Need 1 Million Tokens?'
description: 'What an LLM context window is, how it affects cost, when long context beats RAG, and how to keep long prompts affordable.'
date: '2026-10-16'
kind: flash
---
Context windows have grown from a few thousand tokens to a million and more. Dozens of models now accept over a million tokens in a single request. That is a powerful capability, but it is also the fastest way to multiply your API bill if you use it carelessly.

## What a context window is

The context window is the maximum number of tokens a model can consider in one request: your instructions, the conversation, any documents, and the answer it writes. As a rough guide, a million tokens is about 750,000 English words, several long books or a sizeable codebase.

Two limits matter, and model pages list both:

- **Context window**: the total the model can read and write in one call.
- **Maximum output**: how long the answer can be, usually much smaller.

## Long context is billed in full, every time

You pay for every input token on every request. If you send a 500,000-token document with each question, every question costs 500,000 input tokens, even if the answer only needed one paragraph.

Some models also charge a **higher rate above a threshold**. At the time of writing, Claude Haiku 5.5 bills prompts above 100K tokens at $0.50 input and $2.50 output instead of $0.10 and $0.50, and GPT-6.1 Sol moves to $4 and $15 above 272K tokens. Check the spec sheet on each [model page](/models) before you plan around a giant context.

## Long context vs RAG

There are two ways to give a model the information it needs:

| | Long context | Retrieval (RAG) |
|---|---|---|
| How | Put the whole corpus in the prompt | Search the corpus, send only relevant chunks |
| Cost per request | High: you pay for everything | Low: you pay for a few chunks |
| Setup effort | Minimal | Needs indexing and search |
| Best for | One-off analysis of a large document, cross-referencing a whole codebase | Repeated questions over a large, stable knowledge base |

A common middle ground is to retrieve a generous set of chunks, tens of thousands of tokens rather than five, and let a long-context model sort them out.

## Keeping long prompts affordable

1. **Cache the stable part.** If the same document is reused across questions, prompt caching can cut the cost of that input by around 90% on supporting models. See [Prompt caching explained](/guides/prompt-caching-explained).
2. **Summarize history.** In long chats, replace old turns with a running summary instead of resending everything.
3. **Pick the context you need, not the biggest available.** A 128K model is often enough, and cheaper models are more common at that size.
4. **Stay under pricing thresholds** where a model charges more for long prompts.
5. **Use a cheaper model for the first pass**, for example to find the relevant sections, then send only those to a stronger model.

## Finding the right model

- [AI models with the longest context window](/best/longest-context-window)
- [Cheapest models with a 1M-token context](/best/cheapest-1m-context-model)
- [Cost calculator](/calculator) to see what your real token volume costs on each model

Related guides: [How LLM API pricing works](/guides/how-llm-api-pricing-works) and [How to estimate the monthly cost of an LLM app](/guides/estimate-llm-app-cost).
