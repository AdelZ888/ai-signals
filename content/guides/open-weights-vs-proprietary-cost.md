---
title: 'Open-Weights vs Proprietary LLMs: What They Really Cost to Use'
description: 'How the pricing of open-weights models like Llama, Qwen, Gemma or GLM differs across inference hosts, and when they beat proprietary APIs on cost.'
date: '2026-10-16'
kind: flash
---
Proprietary models such as GPT, Claude or Gemini are sold by one company at one price. Open-weights models such as Llama, Qwen, Gemma, GLM or DeepSeek can be run by anyone, so the same model is often available from several inference providers, at different prices. That competition is good news for your budget, as long as you know where to look.

## The same model, different prices

When a model's weights are public, cloud platforms and specialized inference companies race to serve it. Amazon Bedrock, Google Vertex AI, Azure, Together AI, Fireworks AI, DeepInfra, Groq, Cerebras, Nebius, Baseten, Novita AI and others each set their own price per million tokens.

On AI Signals, every open-weights model page lists the price at each tracked host, and the [inference hosts](/hosts) section shows every model a provider serves, flagging where it is the cheapest option. The gap between the cheapest and the most expensive host for the same model can be large, so it pays to compare before you integrate.

## What else changes between hosts

Price is not the only difference. When you pick a host for an open-weights model, check:

- **Speed**: some providers specialize in very fast token generation, which matters for chat and agents.
- **Context length**: a host may serve a shorter context window than the model supports.
- **Quantization**: some hosts run compressed versions of a model, which can be cheaper and faster but slightly less accurate.
- **Rate limits and reliability** for production traffic.
- **Data handling and regions**, if you have compliance requirements.

## When open-weights models win on cost

Open-weights models tend to be the cheapest option when:

- **the task is well defined** (extraction, classification, summarization, routing) and a mid-sized model is good enough,
- **volume is high**, so a lower price per token adds up quickly,
- **you can switch hosts**, because the API format is usually OpenAI-compatible and the same model is available elsewhere if prices or reliability change.

The [cheapest open-weights models](/best/best-open-weights-models) ranking lists them by their lowest tracked price.

## When proprietary models win

Proprietary APIs often make sense when:

- **you need frontier quality** on hard reasoning, coding or multimodal tasks,
- **you rely on features** like prompt caching, batch discounts, built-in tools or very long context,
- **simplicity matters** more than squeezing the last cent out of each request.

Many proprietary labs also sell small, cheap models that compete directly with open-weights ones. Compare both on the [cheapest LLM APIs](/best/cheapest-llm-api) ranking rather than assuming open-weights is always cheaper.

## What about self-hosting?

Running open-weights models on your own GPUs removes the per-token price but replaces it with infrastructure cost: GPUs, engineering time, monitoring and idle capacity. It tends to make sense only at sustained high volume, for strict data-residency needs, or when you need full control over the model. For most teams, a pay-per-token host is cheaper until traffic is large and steady.

## How to decide

1. List the capabilities you need: context length, image input, tool calling, reasoning.
2. Shortlist proprietary and open-weights models that meet them, for example from a model's [alternatives page](/models).
3. Compare the cheapest host for each open-weights candidate on its [model page](/models).
4. Estimate monthly cost on your real token volume with the [cost calculator](/calculator).

Related guides: [How LLM API pricing works](/guides/how-llm-api-pricing-works) and [Context windows explained](/guides/context-windows-explained).
