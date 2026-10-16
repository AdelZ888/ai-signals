---
title: 'Batch APIs vs Real-Time Calls: When Half-Price LLM Inference Is Worth the Wait'
description: 'How LLM batch APIs work, what they typically cost compared with real-time calls, and which workloads should move to batch processing.'
date: '2026-10-16'
kind: flash
---
Not every LLM call needs an answer in two seconds. If a job can wait a few hours, most major providers will run it through a **batch API** at a steep discount, commonly around half the normal price. For workloads like evaluations, classification or content processing, that is the easiest saving available.

## How batch APIs work

Instead of sending requests one by one and waiting for each answer, you upload a file containing many requests. The provider processes them when it has spare capacity and returns a results file, usually within 24 hours and often much sooner. You pay per token as usual, at the discounted batch rate.

The trade-offs:

- **Latency**: results arrive later, with no guaranteed order of completion.
- **No streaming**: you get complete answers, not tokens as they are generated.
- **Workflow changes**: you need to prepare input files, poll for completion and match results back to your records.

Discounts and limits differ by provider and change over time, so check the provider's documentation before planning around a specific number.

## Workloads that belong in batch

| Workload | Why batch fits |
|---|---|
| Model evaluations and benchmarks | Thousands of prompts, no user waiting |
| Classification and tagging | Labeling tickets, reviews or documents overnight |
| Data extraction | Turning PDFs or emails into structured JSON |
| Content generation pipelines | Product descriptions, summaries, translations |
| Embedding and enrichment backfills | One-off processing of a large corpus |
| Daily or weekly reports | Results needed by morning, not instantly |

If a person is waiting on the other side of the request, keep it real-time.

## Estimating the saving

With a typical 50% batch discount, the maths is simple: whatever share of your token volume can move to batch, you save half of its cost. If 40% of your monthly tokens are offline jobs, moving them to batch cuts the total bill by about 20%.

Batch discounts also stack with other levers:

- **a cheaper model**: offline jobs are often simpler and do not need a flagship, see the [cheapest LLM APIs](/best/cheapest-llm-api),
- **prompt caching**, where the provider supports it on batch requests, see [Prompt caching explained](/guides/prompt-caching-explained),
- **shorter prompts**: batch jobs often repeat one long instruction block thousands of times, so trimming it pays off at scale.

## A practical rollout

1. **Tag your traffic** by whether a user is waiting. Most teams discover that a large share of their volume is background work.
2. **Move the easiest job first**, usually evaluations or a nightly enrichment script.
3. **Keep the prompt identical** to the real-time version and compare outputs on a sample before switching fully.
4. **Handle partial failures**: batch results can include errors for individual requests, so retry those, not the whole file.
5. **Track cost per job**, not just per month, so you can see which pipelines still deserve optimization.

## Real-time still has a cost floor

For interactive features you pay list price, so model choice and context size remain the main levers. Use the [cost calculator](/calculator) to compare models on your real token volume, and check each [model page](/models) for cheaper alternatives with the same capabilities.

Related guides: [How LLM API pricing works](/guides/how-llm-api-pricing-works) and [How to estimate the monthly cost of an LLM app](/guides/estimate-llm-app-cost).
