---
title: 'How to Estimate the Monthly Cost of an LLM App (Step by Step)'
description: 'A practical method to estimate the API cost of a chatbot, RAG app or AI agent before launch: count tokens per request, multiply by volume, add overhead.'
date: '2026-10-16'
kind: flash
---
Most LLM budgets go wrong for the same reason: teams look at the price per million tokens and never translate it into requests. This guide gives you a method you can do on a napkin in five minutes, then refine with the [cost calculator](/calculator).

## The formula

Monthly cost = requests per month × (input tokens per request × input price + output tokens per request × output price) ÷ 1,000,000

Everything else in this guide is about getting those three numbers right: requests per month, input tokens per request and output tokens per request.

## Step 1: count requests, not users

Start from usage, not audience. A support chatbot does not cost "per customer", it costs per message. Estimate:

- conversations per month,
- turns (user messages) per conversation,
- model calls per turn: a single answer, or several calls if you classify first, call tools, or verify the answer.

Example: 50,000 conversations × 4 turns × 1.5 calls per turn = **300,000 requests per month**.

## Step 2: measure input tokens per request

Input is usually the bigger number. Add up:

| Part | Typical size |
|---|---|
| System prompt and instructions | 300 to 2,000 tokens |
| Conversation history | grows each turn |
| Retrieved documents (RAG) | 1,000 to 8,000 tokens |
| Tool definitions | 100 to 1,500 tokens |
| The user's message | 20 to 200 tokens |

The best estimate is a real one: log a few hundred requests from a prototype and read the token counts the API returns. If you cannot, take the middle of each range. Remember that history is resent on every turn, so the fourth turn of a conversation carries the three previous ones.

Example: 1,500 tokens of system prompt and tools, 2,000 of retrieved context, 500 of history and message = **4,000 input tokens per request**.

## Step 3: estimate output tokens per request

Output is easier to control: it is the length of the answer, plus any hidden reasoning on reasoning models. A short support answer is 100 to 300 tokens, a code change can be several thousand. Set a maximum output length in your API calls so a runaway answer cannot blow the budget.

Example: **250 output tokens per request**.

## Step 4: multiply

With 300,000 requests, 4,000 input and 250 output tokens per request, you send 1.2 billion input tokens and receive 75 million output tokens per month. For a hypothetical model priced at $1 input and $4 output per million tokens:

- input: 1,200 × $1 = $1,200
- output: 75 × $4 = $300
- **total: about $1,500 per month**

The same workload on a model ten times cheaper costs about $150; on a model ten times more expensive, $15,000. That spread is why model choice is the biggest lever on an LLM budget, and why the [cheapest compatible model](/best/cheapest-llm-api) is worth checking before you default to a flagship.

## Step 5: add overhead

Real traffic is messier than a spreadsheet. Add:

- **10 to 20%** for retries, failed calls and invalid outputs,
- **growth**: if usage doubles in six months, so does the bill,
- **evaluation and testing traffic**, which can be surprisingly large during development.

## Step 6: look for the big savings

Once you have a number, the usual wins, in order of impact, are:

1. **A cheaper model for the easy part.** Route simple requests to a small model and keep the expensive one for hard cases. Each model page lists [cheaper alternatives](/models) with the same capabilities.
2. **Prompt caching.** If your system prompt or documents repeat, cached input can cost a tenth of the normal price or less. See [Prompt caching explained](/guides/prompt-caching-explained).
3. **Shorter context.** Retrieve fewer, better chunks; summarize old conversation turns.
4. **Batch processing** for anything that does not need an instant answer, usually around half price. See [Batch APIs vs real-time](/guides/batch-api-vs-real-time).
5. **Output limits** and concise answer instructions.

## Use real prices

List prices move often. The [cost calculator](/calculator) lets you enter your monthly input and output tokens and ranks every tracked model by monthly cost, using prices refreshed daily. For a quick comparison between two candidates, each [comparison page](/compare) shows the monthly cost of three standard workloads side by side.
