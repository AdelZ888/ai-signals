---
title: "Auditing LLM Negotiators in Supply Chains: Private-Information Bargaining across 9,840 Trials"
date: "2026-08-12"
excerpt: "9,840 LLM-to-LLM procurement negotiations show capability, provider identity, and prompted strategic patience drive surplus division and irrational acceptances; includes practical audit checks."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-12-auditing-llm-negotiators-in-supply-chains-private-information-bargaining-across-9840-trials.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "LLM"
  - "agents"
  - "negotiation"
  - "supply-chain"
  - "procurement"
  - "benchmarking"
  - "prompt-engineering"
  - "audit"
sources:
  - "https://arxiv.org/abs/2608.07538"
---

## TL;DR in plain English

- LLMs can act as automated negotiators. The paper ran 9,840 LLM-to-LLM negotiations across nine models to measure outcomes (https://arxiv.org/abs/2608.07538).
- Main facts: agents agreed in 98.9% of runs. They captured 95.4% of the first-best surplus when time is not discounted. Average negotiation length was 2.98 rounds versus the benchmark 1.25 rounds. Time delay reduced surplus by 21–34%. Baseline models accepted irrational deals ~19.2% of the time; mid/flagship models did so 0.0–0.6% of the time. Provider identity shifted who captured surplus (self-play buyer-share ≈ 40% OpenAI, 50% Google, 70% Qwen) (https://arxiv.org/abs/2608.07538).
- Quick actions: log each round and offer, run an automated profit check before any autonomous acceptance, and test provider-role swaps. Prompted “strategic patience” is a high-leverage control to change surplus division (≈90% of explained variance) (https://arxiv.org/abs/2608.07538).

## What you will build and why it helps

You will build a compact negotiation stack for buyer and seller agents. It will:
- run turn-based LLM agents; record every round, offer, and timestamp; and persist logs for audits (9,840-run scale in the paper is a useful reference) (https://arxiv.org/abs/2608.07538).
- verify economic rationality with an automated profit check and block or flag irrational acceptances (the study found baseline irrational rates near 19.2%) (https://arxiv.org/abs/2608.07538).
- produce audit metrics covering agreement rate, rounds per negotiation, undiscounted and discounted surplus capture, irrational-offer rate, and provider-specific buyer-share (https://arxiv.org/abs/2608.07538).

Why this helps small teams:
- It automates repetitive bargaining while producing clear, numeric audit signals. These signals match the paper’s evaluation dimensions: discounted efficiency, distributional profile, and operational reliability (https://arxiv.org/abs/2608.07538).

## Before you start (time, cost, prerequisites)

Time and scale guidance:
- Use the paper’s 9,840 negotiations and nine-model sweep as an inspiration for breadth, but start with a pilot of 100–1,000 runs in a narrow domain to get stable signals (https://arxiv.org/abs/2608.07538).
- Expect a small pilot wall time of ~120 minutes for a single batch plus analysis and a pilot cost estimate of $50–$200 depending on provider and token usage (assumptions listed in final section) (https://arxiv.org/abs/2608.07538).

Prerequisites:
- Basic scripting (Python or similar).
- Access to at least one LLM API and keys.
- A sandboxed test environment and legal sign-off for experiments.
- A reproducible set of contract cases or demand draws.

Quick methodology note: log prompts, seeds, inputs, and full responses so each run is auditable and reproducible (https://arxiv.org/abs/2608.07538).

## Step-by-step setup and implementation

1) Prepare the repo and environment.

```bash
git clone https://example.com/negotiation-starter.git
cd negotiation-starter
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# export API_KEY before running
```

2) Implement clear prompts. Define private buyer demand and public seller cost. Specify format: price, quantity, accept/reject, and a single-line justification. Make round cap explicit (example: 4 rounds).

3) Build the negotiation loop.
- Turn-based loop that records: round index, full messages, offer structure, accept/decline, timestamps (millisecond if available), provider, prompt version, seed, and role assignment.
- Make round cap configurable (suggested default: 4 rounds).

4) Add automated profit verification.
- Compute expected profit for seller and expected surplus for buyer using agreed price and expected quantity before any acceptance is executed. Block or flag offers that violate rules.

```json
{
  "profit_verifier": {
    "mode": "flag-or-block",
    "expected_profit_expression": "(price - cost) * expected_quantity",
    "block_threshold_margin_pct": 0
  },
  "experiment": {
    "round_cap": 4,
    "log_level": "debug"
  }
}
```

5) Instrument metrics and logging.
- Persist per-run JSON and aggregate CSV rollups.
- Track: agreement rate (%), avg rounds (count), undiscounted surplus capture (%), discounted surplus (%, with modeled discount rate), irrational-offer rate (%), and provider buyer-share (% by provider). Compare to benchmark values from the paper: 98.9% agreement, 95.4% undiscounted capture, 2.98 avg rounds vs 1.25 benchmark (https://arxiv.org/abs/2608.07538).

6) Run provider-swap and prompt-patience experiments.
- Swap provider assignments and measure buyer-share by provider. The paper finds provider identity predicts surplus division and that prompted strategic patience explains roughly 90% of explained variance (https://arxiv.org/abs/2608.07538).

7) Safety gating before autonomous acceptance.
- Start human-in-the-loop. Require human approval for any flagged acceptance or for any deal when irrational-offer rate >1% in your domain.

## Common problems and quick fixes

- Negotiations oscillate or fail to converge.
  - Fix: clarify convergence rules in the prompt, add a deterministic fallback offer, and force a concession after N rounds (N default 4).

- Agents accept money-losing contracts.
  - Fix: enforce a profit verifier. Block or route flagged acceptances to human review. The study’s baseline irrational acceptance was ~19.2%; mid/flagship models fell to 0.0–0.6% (https://arxiv.org/abs/2608.07538).

- Large outcome differences across providers.
  - Fix: run provider-swap experiments, fill a provider decision table, and assign roles based on empirical buyer-share (paper reports approx. 40% OpenAI, 50% Google, 70% Qwen) (https://arxiv.org/abs/2608.07538).

- API rate limits or latency spikes.
  - Fix: batch calls for non-critical requests, add exponential backoff, and monitor tail latencies (measure 95th and 99th percentile ms).

Quick troubleshooting checklist (minimum items to confirm):
- [ ] reproducible seed and logged test dataset
- [ ] logging enabled for every run
- [ ] profit-verifier unit tests
- [ ] provider-swap experiments recorded

## First use case for a small team

Target: solo founders or teams of 1–3 automating low-risk, repetitive negotiations.

Minimum viable approach:
- Human-in-the-loop: let the LLM draft offers but require human approval. This yields labeled data and prevents exposure to bad deals.
- Automated profit check: block any proposed acceptance with negative expected profit and route flagged items to human review.
- Domain limits: restrict to standard SKUs, fixed-cost suppliers, or low-complexity items to keep prompts simple.

Three concrete pilot actions (A/B pilot of 10–50 deals):
1) Use the LLM to draft the first offer in a fixed template. Save model output and human decision (accept/modify/reject).
2) Gate sends with the profit verifier. If flagged, require human sign-off.
3) Run an A/B of 10–50 deals comparing assistant-suggested offers to manual offers. Track irrational-offer count, avg rounds, and agreement rate. Compare to the paper’s reference metrics: 98.9% agreement; 95.4% undiscounted surplus capture; avg rounds 2.98 vs 1.25 benchmark; 21–34% surplus erosion under discounting (https://arxiv.org/abs/2608.07538).

## Technical notes (optional)

Key reproducible benchmarks from the paper (for alignment and audits):
- 9,840 total negotiations across nine models.
- Agreement rate: 98.9%.
- Undiscounted first-best surplus capture: 95.4%.
- Average rounds per negotiation: 2.98 (benchmark equilibrium: 1.25).
- Discounting cost: 21–34% surplus erosion depending on time preference.
- Irrational-offer acceptance: baseline ~19.2% vs 0.0–0.6% for stronger models.
- Provider self-play buyer-share (approx): OpenAI 40%, Google 50%, Qwen 70% (https://arxiv.org/abs/2608.07538).

Provider buyer-share table:

| Provider | Self-play buyer share (approx) | Source |
|---------:|:------------------------------:|--------|
| OpenAI  | 40%                            | https://arxiv.org/abs/2608.07538 |
| Google  | 50%                            | https://arxiv.org/abs/2608.07538 |
| Qwen (Alibaba) | 70%                    | https://arxiv.org/abs/2608.07538 |

Implementation tips:
- Use millisecond timestamps for round timing where possible. Track 95th/99th percentile response times in ms for production readiness.
- Keep a configurable round cap (4 suggested) and a strict block threshold for negative expected margin (0%).

## What to do next (production checklist)

### Assumptions / Hypotheses

- Pilot sample: 100–1,000 runs to get stable signals in a narrow domain. This is an operational hypothesis; the paper used 9,840 runs for broad conclusions (https://arxiv.org/abs/2608.07538).
- Wall time: expect ~120 minutes for a small batch plus analysis.
- Pilot cost estimate: $50–$200 depending on token usage and provider.
- Rollout gates (example thresholds to validate): irrational-offer rate <1%, agreement rate >95%, avg rounds ≤2, round cap = 4.
- Profit margin fallback: block offers with expected margin <0% (strict) or <5% (conservative).

### Risks / Mitigations

- Risk: weaker models accept money-losing contracts (~19.2% baseline).
  - Mitigation: mandatory profit verifier and human sign-off on flagged deals.
- Risk: delegation or prompt settings shift surplus to the counterparty (provider-dependent buyer-share 40/50/70).
  - Mitigation: run cross-provider role swaps and assign roles by empirical buyer-share.
- Risk: legal/contract exposure from autonomous acceptance.
  - Mitigation: legal review and limit autonomous acceptance to low-risk items during rollout.
- Risk: operational outage or latency spikes (monitor 95th/99th percentile ms).
  - Mitigation: deploy behind flags, monitor key metrics, and have rollback runbooks.

### Next steps

- Run a two-provider pilot with the profit verifier on. Log all rounds and compare buyer-share, irrational-offer rate, and avg rounds to your human baseline and to the paper’s reference points (https://arxiv.org/abs/2608.07538).
- Tune prompted "strategic patience" and measure its effect; the paper reports it explains ~90% of explained variance in surplus division (https://arxiv.org/abs/2608.07538).
- If gates pass (irrational-offer rate <1%, agreement rate >95%, avg rounds ≤2), expand to a larger test and run an A/B with human-in-the-loop for safety.
- Maintain an incident runbook, preserve full logs (prompts, seeds, responses), and periodically audit agent outcomes against human outcomes and the theoretical benchmark (1.25 rounds equilibrium) (https://arxiv.org/abs/2608.07538).

References

- When LLM Agents Negotiate: Private Information and Dynamic Bargaining in Supply Chains — Chen Liang, Fasheng Xu (arXiv:2608.07538) — https://arxiv.org/abs/2608.07538
