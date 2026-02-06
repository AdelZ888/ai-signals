---
date: '2026-02-06'
issueNumber: 1
tags:
  - Newsletter
  - Weekly
title: 'AI Signals — Issue #1'
excerpt: >-
  Boundary-first agent security, practical agentic-RL to ship, Codex App Server
  how‑to, plus key papers (Empirical-MCTS, Agent-Omit) and 4 concrete builds for
  next week.
---
## TL;DR

- Rules at the prompt are brittle; enforce policies at the boundary (policy engine + sandbox + attested channels) to reduce agentic compromise risk. See tutorial for configs and metrics. 
- Agentic RL is now practically deployable for OSS GPT-style stacks — prioritize cheap baselines, dataset curation, and ROI checks before large compute runs. 
- Codex App Server pattern (bidirectional JSON-RPC) is a proven way to get streaming progress, tool use, approvals, and diffs into production agent workflows. 
- Paper highlights: Empirical-MCTS (reuse reasoning traces), Agent-Omit (selective thought/observation), and Active Epistemic Control (epistemic planning) are the near-term algorithmic levers to improve efficiency and reliability.
- Ship small, test boundaries: three infra integrations + one experiment will materially reduce risk and surface runbook gaps.

## This week on AI Signals (internal links)

- [Rules fail at the prompt, succeed at the boundary](https://aisignals.dev/posts/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary) — deployable boundary strategy with code, metrics, and founder cost/risk frame. 
- [GPT-OSS Agentic RL: What Builders Can Actually Ship](https://aisignals.dev/posts/2026-02-06-unlocking-agentic-rl-training-for-gpt-oss-a-practical-retrospective) — practical roadmap for agentic RL on open stacks; what to build first. 
- [Unlocking the Codex harness: how we built the App Server](https://aisignals.dev/posts/2026-02-06-unlocking-the-codex-harness-how-we-built-the-app-server) — implementation plan, infra, rollout gates, and monitoring artifacts for embedding a Codex agent.

## Model watch

- Empirical-MCTS — https://arxiv.org/abs/2602.04248: reuse successful reasoning traces across problems (stateful inference). Implication: add a persistent reasoning cache and MCTS loop to improve complex-plan success rates without linear compute scaling.
- Agent-Omit — https://arxiv.org/abs/2602.04284: learn when to omit thoughts/observations to save compute. Implication: implement turn-level utility signals and gated thinking to cut cost by focusing compute where it matters.
- Active Epistemic Control — https://arxiv.org/abs/2602.03974: epistemic planning for partial observability. Implication: add a planning layer that explicitly queries or probes to reduce uncertainty before committing to actions.
- From Assumptions to Actions (embodied planning under uncertainty) — https://arxiv.org/abs/2602.04326: uncertainty-aware planning techniques for embodied agents; useful if you operate robots or multi-agent systems.
- Knowledge Model & Execution-driven reasoning improvements — https://arxiv.org/abs/2602.03900 and https://arxiv.org/abs/2602.03950: combine knowledge-model prompting with execution traces for better planning and math/problem-solving.

## Agent patterns

- Boundary enforcement (deploy first): policy engine -> isolated sandbox -> attested channels for outputs. Enforce on RPC layer, not just in prompts. See boundary tutorial for configs and metrics: https://aisignals.dev/posts/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary.
- Attested channel pattern: sign/verify tool outputs and user approvals; keep a minimal, auditable provenance header on every action/side-effect.
- Codex App Server pattern: bidirectional JSON-RPC streaming; separate "plan/think" stream from "effect" stream; gate side-effects behind explicit approval flows. Guide and templates: https://aisignals.dev/posts/2026-02-06-unlocking-the-codex-harness-how-we-built-the-app-server.
- Agentic-RL incremental pattern: 1) collect small offline trajectories, 2) train cheap behavior clones, 3) run short-policy RL with clipped rewards, 4) scale only after ROI checks. Roadmap: https://aisignals.dev/posts/2026-02-06-unlocking-agentic-rl-training-for-gpt-oss-a-practical-retrospective.
- Thought/Observation gating: implement a lightweight utility estimator per turn (Agent-Omit) to decide when to compute internal chains-of-thought or fetch extra observations.
- Stateful inference cache (Empirical-MCTS): store and index successful subplans; replay during MCTS-guided expansion to reduce redundant verifiers and calls.

## Tools & repos

- Internal: boundary tutorial repo + configs (see post) — deploy the policy engine and sandbox artifacts first: https://aisignals.dev/posts/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary.
- Internal: Codex App Server reference implementation and rollout artifacts — clone and run the JSON-RPC harness in a dev environment: https://aisignals.dev/posts/2026-02-06-unlocking-the-codex-harness-how-we-built-the-app-server.
- Internal: Agentic-RL checklist & baselines — baseline scripts and economics checklist: https://aisignals.dev/posts/2026-02-06-unlocking-agentic-rl-training-for-gpt-oss-a-practical-retrospective.
- LangChain — https://github.com/langchain-ai/langchain: orchestration primitives for agent-tool patterns; useful as wiring but not as a security boundary.
- Ray (RLlib) — https://github.com/ray-project/ray: scalable RL training and rollout infrastructure; use for short-agentic-RL experiments.
- MCTS libs / examples — pick a small MCTS implementation and instrument it to store traces (integrate with your reasoning cache). Example starter: https://github.com/john-hewitt/mcts (replace with your internal choice).
- Monitoring & provenance: use structured logs (JSON), signed action envelopes, and end-to-end latency SLOs; export traces to a searchable store (Elasticsearch/ClickHouse).

## Startup lens

- Prioritize risk-reduction over feature velocity for agentic products: boundary enforcement reduces catastrophic exposure faster than extra capabilities.
- Founder cost/risk frame: small infra + human-in-loop gating often yields the best ROI vs. running larger agentic-RL at scale—validate with low-cost pilots first (see boundary tutorial economics section).
- GTM: productize the App Server as an integration bundle (streaming + approvals + diffing) for developer tooling or internal automation teams.
- Hiring: hire one infra engineer (security/sandbox expertise) and one ML engineer (agentic-RL/online eval) before expanding the team.
- Metrics to track: agent side-effect failures, boundary bypass attempts, per-task cost (token + compute), success rate post-verifier, human-approval latency.

## What to ship next week

- Ship a boundary pilot (3 days): deploy the policy engine + sandbox for one high-risk agent workflow; record bypass attempts and metrics. Guide: https://aisignals.dev/posts/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary. Owner: infra lead.
- Integrate the Codex App Server for one tool (4 days): wire a single tool (code edit or ticketing) behind JSON-RPC streaming with an approval gate. Repo & rollout plan: https://aisignals.dev/posts/2026-02-06-unlocking-the-codex-harness-how-we-built-the-app-server. Owner: backend lead.
- Run an agentic-RL smoke experiment (5 days): collect 1–2k trajectories, train a behavior-clone baseline, run 100 short RL episodes with clipped rewards to validate signal. Checklist: https://aisignals.dev/posts/2026-02-06-unlocking-agentic-rl-training-for-gpt-oss-a-practical-retrospective. Owner: ML engineer.
- Experiment with Empirical-MCTS replay (2 days): add a persistent reasoning trace cache to an existing planner and run A/B on one task to measure verifier call reduction. Paper: https://arxiv.org/abs/2602.04248. Owner: research engineer.

https://aisignals.dev/#newsletter
