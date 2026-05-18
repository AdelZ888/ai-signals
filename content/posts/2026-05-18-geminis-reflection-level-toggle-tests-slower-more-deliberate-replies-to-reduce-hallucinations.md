---
title: "Gemini's 'Reflection Level' toggle tests slower, more deliberate replies to reduce hallucinations"
date: "2026-05-18"
excerpt: "Google is testing a 'Reflection Level' toggle in the Gemini app (Standard vs Extended). Extended slows replies to allow extra internal reasoning and may reduce hallucinations."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-18-geminis-reflection-level-toggle-tests-slower-more-deliberate-replies-to-reduce-hallucinations.jpg"
region: "FR"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "Google"
  - "Gemini"
  - "product-update"
  - "hallucinations"
  - "model-behavior"
  - "rollout"
  - "app"
sources:
  - "https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html"
---

## TL;DR in plain English

- Google is testing a new "Reflection Level" control in the Gemini app. It appears as a toggle with two settings: Standard and Extended. Seen on Gemini 3 Flash and 3.1 Pro. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Extended makes Gemini take more internal reasoning steps. Replies are slower but may be more accurate on complex, multi-step prompts. The rollout is partial and not yet confirmed officially. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Practical idea: run the same hard prompts in Standard and Extended and compare hallucination counts and latency. A small test of 50 prompts gives a quick read; 200 gives stronger confidence. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

Concrete example (short scenario): your two-person startup uses Gemini to power support replies. Some answers invent details. Try a 100-prompt holdout from real tickets. Run half in Standard and half in Extended. Compare how many answers invent facts and how much slower Extended is.

Plain-language explanation before advanced details

This change is a UI toggle that asks the model to "think more" before answering. Think of it as telling the assistant to slow down and double-check itself. That can reduce made-up facts (hallucinations). But it usually uses more compute and takes longer. The rest of this note turns that observation into practical steps teams can use to test and decide when to enable the slower, more careful mode.

## What changed

- UI: a new in-app control called "Reflection Level" appears in the Gemini app. The control has two positions: Standard and Extended. It has been observed on Gemini 3 Flash and 3.1 Pro. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Behavior: Extended appears to increase internal reasoning steps and intentionally slows answers. The goal reported is to improve performance on complex, multi-step prompts that often cause hallucinations. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Scope: the feature is rolling out in waves. Many users do not yet see the option. The report does not confirm API or SDK exposure. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

## Why this matters (for real teams)

- Product tradeoff: Extended likely increases per-request compute and latency in exchange for better factual stability. That affects latency budgets and cost per call. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- User experience (UX) impact: slower replies can feel worse unless you tell users why. UX means "user experience." Add a short status line like "Taking longer for a more-checked answer." Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Observability: log the Reflection Level per request. Track simple metrics: median response time, 95th percentile response time (p95), hallucination rate, and task completion rate. This lets you see the real tradeoff between delay and accuracy. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Decision gates: require a minimum test sample before a rollout. For a quick read use n >= 50. For stronger confidence use n >= 200. Define acceptable latency increases before enabling Extended broadly. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

## Concrete example: what this looks like in practice

Scenario: two-person startup runs a customer support assistant. Some replies invent order numbers or dates.

Plan (step-by-step):
1. Confirm Reflection Level is visible in your Gemini app for Gemini 3 Flash or 3.1 Pro. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
2. Build an evaluation set of 200 hard prompts from real logs. If you need speed, start with 50. Aim for ~30% multi-step or citation-required queries.
3. Run Standard on the set. Record median_response_ms and p95_response_ms. Manually label outputs for hallucinations (true/false).
4. Run Extended on the same prompts. Compare hallucination count and latency. You can set an internal acceptance rule such as: hallucination_count must fall while median latency increase stays within team limits.

Decision grid (example):

| Setting    | Expected tradeoff                  | Use-cases                                  |
|------------|------------------------------------|--------------------------------------------|
| Standard   | Faster, lower compute, more risk   | Quick lookups, chatty flows                |
| Extended   | Slower, higher compute, fewer halluc.| Multi-step reasoning, citation-required answers |

Feature-flag idea: FEATURE_GEMINI_REFLECTION={off,standard,extended}. In logs include: mode, model_version (e.g., "Gemini 3 Flash"), prompt_id, response_time_ms.

Reference: observed feature behavior: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

## What small teams and solo founders should do now

A concrete 48–72 hour checklist with low effort:

1) Check availability and surface the control.
- Open the Gemini app and look for "Reflection Level" when using Gemini 3 Flash or 3.1 Pro. Note which account and OS see it. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

2) Build a minimal eval set (50–200 prompts).
- Export 50–200 representative hard prompts from logs or common tickets. Include at least 30% multi-step or citation-required queries.

3) Run a quick A/B and manual label.
- Baseline: run 50 prompts in Standard. Record median and p95 latencies. Label outputs for hallucinations (simple true/false). Start with 50 labels; push to 200 if possible.
- Test: run same prompts in Extended (if available). Compare hallucination counts and latency delta.

4) Small-team rollout rules.
- Gate Extended by intent: use it for high-risk prompts (support answers, policy text). Keep Standard for casual chat.
- Budget cap: set a soft rate limit during evaluation (for example: <= 100 Extended calls/day for a solo founder).

Quick checklist:
- [ ] Check Reflection Level in Gemini app (Gemini 3 Flash / 3.1 Pro). https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- [ ] Export 50–200 representative hard prompts (>=30% multi-step).
- [ ] Run Standard baseline: record median/p95 latencies and label 50 outputs.
- [ ] Run Extended (if available) and compare hallucination counts and latency deltas.
- [ ] Draft short UX copy explaining longer replies (e.g., "Answer is taking longer for verification").

## Regional lens (FR)

- Test in French: run a 50–200 prompt French-only holdout. Language and idioms can change hallucination patterns. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- UX copy in French: provide a short line such as "Réponse plus lente pour une vérification approfondie" so users expect the delay. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Operational trace: keep a simple worksheet logging Date, Account, Model (Gemini 3 Flash / 3.1 Pro), Reflection Level, sample prompts, and test notes for audits.

Reference: Numerama coverage of the test: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

## US, UK, FR comparison

Note: the Numerama article documents the feature. The regional notes below are operational guidance for teams in these markets. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

| Region | Immediate focus                      | Quick artifact to produce               |
|--------|--------------------------------------|-----------------------------------------|
| US     | Measure hallucination reduction and cost | A/B test + cost-per-call estimate ($)   |
| UK     | Safety & consumer-protection records | Product safety log entry                |
| FR     | Localization and traceability        | FR test worksheet + localized UX copy   |

Practical thresholds: start small (n = 50) and scale to n >= 200 per arm for stronger confidence. Source for feature observation: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html

## Technical notes + this-week checklist

### Assumptions / Hypotheses

- Assumption: the reported toggle is an in-app control for Gemini 3 Flash and 3.1 Pro that increases internal reasoning steps when set to Extended. Source: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- Hypothesis: API or SDK (software development kit) exposure and billing differences are not confirmed in the report. Plan for the setting to be app-only until Google announces otherwise.
- Methodology note: this brief follows the published observation in the cited article and converts it into practical, minimal tests for small teams.

### Risks / Mitigations

- Risk: users think the product got worse because replies are slower. Mitigation: show a short badge or tooltip explaining Extended.
- Risk: higher per-request compute and cost. Mitigation: gate Extended by intent and set hard daily caps during evaluation.
- Risk: inability to attribute changes if mode is not logged. Mitigation: add per-request logging fields: mode (standard|extended), model_version, response_time_ms, prompt_id.

### Next steps

Short-term (this week):
- [ ] Check the Gemini app for Reflection Level on your accounts. https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
- [ ] Assemble 50–200 representative prompts (>=30% multi-step).
- [ ] Define simple hallucination labeling rules and label an initial batch of 50 outputs in Standard mode.
- [ ] If Extended is available, run the same labeled prompts under Extended and collect median_response_ms and p95_response_ms.
- [ ] Draft a one-page Rollout Gate with required reduction in hallucination_count and maximum allowed median latency increase.

Medium-term (2–6 weeks): add per-request logging fields, run a powered A/B test (n >= 200 per arm if you need statistical confidence), and update UX copy for production users.

Reference for the observed feature and behavior: https://www.numerama.com/tech/2254829-google-gemini-va-soffrir-un-mode-plus-cerebral-pour-arreter-de-vous-repondre-a-cote.html
