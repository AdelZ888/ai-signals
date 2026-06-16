---
title: "Zehn: Zig CLI to fuzzy-search and reopen prompts across Claude, Codex, Pi and Opencode histories"
date: "2026-06-16"
excerpt: "Zehn is a small Zig CLI that reads Claude, Codex, Pi and Opencode histories, normalizes and deduplicates prompts, then offers an fzf-style fuzzy search that reopens the original session."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-16-zehn-zig-cli-to-fuzzy-search-and-reopen-prompts-across-claude-codex-pi-and-opencode-histories.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "zehn"
  - "zig"
  - "cli"
  - "fuzzy-search"
  - "agent-history"
  - "fzf"
  - "sqlite"
sources:
  - "https://www.al3rez.com/building-zehn"
---

## TL;DR in plain English

- Problem: your prompts are scattered across multiple agent histories (claude, codex, pi, opencode). Each agent stores history in a different format, so manual search is slow. Source: https://www.al3rez.com/building-zehn
- Solution: use or build "zehn", a small CLI that reads each agent's history, normalizes entries into a common record, deduplicates, and presents an fzf-style fuzzy search. Select an entry and zehn restores the original session in the owning agent. Source: https://www.al3rez.com/building-zehn
- Quick actions: install Zig to build the reference binary; optionally install sqlite3 so opencode histories are included; build and run the binary to search across all agents. See https://www.al3rez.com/building-zehn for reference behavior.

Short scenario: you used 3–4 agents last week, can’t remember where you asked for a specific prompt, type a few letters in zehn, pick a match, and you are returned to that session in the original agent. See https://www.al3rez.com/building-zehn.

Methodology: the following consolidates behavior described in the referenced writeup; example configs and commands are illustrative.

## What you will build and why it helps

You will have a compact CLI that does these things (from the reference):

1. Read histories from multiple agents (the reference supports 4: claude, codex, pi, opencode). Source: https://www.al3rez.com/building-zehn
2. Normalize each raw item into a single Record (prompt, project, session id, timestamp, source agent).
3. Deduplicate repeated prompts, keeping the most recent occurrence.
4. Rank matches with a fuzzy matcher that feels like fzf (bonuses for word starts and consecutive matches).
5. Run an open action so selecting a result returns you to that exact session in the owning agent.

Why it helps: one UI replaces digging through 4 different history formats and saves time when reconstructing context. See https://www.al3rez.com/building-zehn.

Agent storage comparison (decision table):

| Agent     | Storage type      | Prompt field / shape                     | Note |
|-----------|-------------------|-------------------------------------------|------|
| claude    | history.jsonl     | prompt under `display`                    | JSON Lines (1 object per line) |
| codex     | history.jsonl     | prompt under `text`                       | JSON Lines |
| pi        | per-session .jsonl | first line = session metadata, later lines = messages | session folder per session |
| opencode  | SQLite DB         | query via sqlite3                          | reference shells out to sqlite3 |

Source: https://www.al3rez.com/building-zehn

## Before you start (time, cost, prerequisites)

- Time: prototype in a few hours; plan several days to harden for team use. See https://www.al3rez.com/building-zehn.
- Cost: open-source toolchain only unless you opt for hosted indexes.
- Skills: basic CLI programming, JSON/JSONL parsing, and simple shell usage.
- Software prerequisites:
  - Zig toolchain to build the reference Zig binary. Source: https://www.al3rez.com/building-zehn
  - sqlite3 (optional). If sqlite3 is absent, the reference skips opencode and explains why. Source: https://www.al3rez.com/building-zehn
- Permissions: read access to history files or databases.

Quick checklist before you begin:
- [ ] Zig installed
- [ ] Read permission to agent history files
- [ ] sqlite3 installed (optional for opencode)

Example minimal build and run (adjust repo URL to your fork):

```bash
git clone https://example.com/your/zehn.git
cd zehn
zig build -Drelease-safe
./zig-out/bin/zehn --help
```

Reference: https://www.al3rez.com/building-zehn

## Step-by-step setup and implementation

Plain explanation: implement small readers for each agent that yield a common Record. Once records are uniform, the rest of the app (dedupe, index, matcher, open-action) is format-agnostic. See https://www.al3rez.com/building-zehn.

High-level flow: readers → normalize → dedupe → fuzzy match → open-action.

1) Define the Record shape and Reader contract
- Record fields (minimum): prompt (string), project (optional), session_id (optional), timestamp (optional), source_agent (string), session_path (optional).
- Readers should stream Records so you can add agents later without changing core logic. See https://www.al3rez.com/building-zehn.

2) Implement the four readers described in the reference (claude, codex, pi, opencode)
- claude: stream history.jsonl, extract prompt from `display`.
- codex: stream history.jsonl, extract prompt from `text`.
- pi: iterate session folders and parse per-session .jsonl files where first line is metadata and subsequent lines are messages.
- opencode: run `sqlite3` to query rows; if sqlite3 is missing, skip opencode and print why. See https://www.al3rez.com/building-zehn.

Message note: a message's content can be a plain string or an array of typed blocks; flatten arrays into a single string (join blocks with newlines). Source: https://www.al3rez.com/building-zehn.

3) Normalize, dedupe, and scoring
- Normalize each reader's output into the Record shape.
- Dedupe by a stable key (for example prompt+project+source). When timestamps exist, keep the most recent record.
- Implement an fzf-like fuzzy matcher: prefer matches at word starts and consecutive character matches. Make weights tunable.

4) UI and open-action
- Present results with matched-character highlights and scores. On Enter, run a configured template command that restores the session in the original agent. The referenced prototype describes returning you to the exact session. See https://www.al3rez.com/building-zehn.

5) Optional indexing
- Offer an optional JSONL index (one Record per line) to avoid rescanning many files on each run. Indexing enables quick incremental updates.

Example config (illustrative):

```json
{
  "paths": {
    "claude": "/home/user/.config/claude/history.jsonl",
    "codex": "/home/user/.config/codex/history.jsonl",
    "pi_dir": "/home/user/.local/share/pi/sessions",
    "opencode_db": "/home/user/.local/share/opencode/history.sqlite"
  }
}
```

Example run that builds an index and launches the UI:

```bash
./zig-out/bin/zehn --config ./zehn.json --index ./data/index.jsonl
```

Reference: https://www.al3rez.com/building-zehn

## Common problems and quick fixes

- opencode results missing
  - Fix: install sqlite3 or supply an exported opencode DB. The reference shells out to sqlite3 and skips opencode if sqlite3 is missing. See https://www.al3rez.com/building-zehn.

- Duplicates remain after dedupe
  - Fix: ensure timestamps are parsed and included in the dedupe key. If timestamps are missing, choose a consistent tie-breaker such as file modification time.

- Fuzzy ranking feels wrong
  - Fix: expose scorer weights in config. Increase word-start weight or consecutive-match bonus until behavior matches expectations.

- Permission errors reading histories
  - Fix: run with appropriate read permissions or copy histories to a secure, readable folder and index those copies.

Performance tip: persist a prebuilt JSONL index to avoid rescanning many files on each run. See https://www.al3rez.com/building-zehn.

## First use case for a small team

This fits a 2–4 person team or a solo founder. Start local-only and optionally share sanitized exports later. Source: https://www.al3rez.com/building-zehn.

Pilot plan for a 3-person team (concrete):
1. Each developer runs a local zehn instance with local paths in config.
2. Run a 48–72 hour canary pilot and collect qualitative feedback.
3. If sharing an index, sanitize exports and require explicit opt-in.

Practical guidance:
- Start local-only. No sharing by default.
- Sanitize exports to remove emails, API keys, and token-like strings.
- Keep shared exports short-lived and rotate them regularly.

Pilot checklist:
- [ ] Local-only start
- [ ] Sanitizer enabled for any export
- [ ] Retention/rotation configured (e.g., 90 days max)
- [ ] Canary test run (48–72 hours)

Reference: https://www.al3rez.com/building-zehn

## Technical notes (optional)

- Message shapes: content may be a string or an array of typed blocks; flatten arrays by joining blocks with newlines. See https://www.al3rez.com/building-zehn.
- SQLite tradeoff: reference shells out to the host's sqlite3 instead of embedding a SQLite reader in Zig; that avoids writing a SQLite reader in Zig but requires sqlite3 to be installed for opencode support. If sqlite3 is not present, zehn skips opencode and reports why. Source: https://www.al3rez.com/building-zehn.
- Matching: aim for fzf-like scoring with weights for word starts and consecutive matches; expose these weights so users can tune their muscle memory. See https://www.al3rez.com/building-zehn.
- Index format: JSONL is append-friendly and simple: one record per line.

Reference: https://www.al3rez.com/building-zehn

## What to do next (production checklist)

### Assumptions / Hypotheses

- The implementation follows the field mappings in the referenced writeup: claude uses `display`, codex uses `text`, pi uses per-session .jsonl (first line metadata), opencode is stored in SQLite. Source: https://www.al3rez.com/building-zehn
- Performance and numerical thresholds are implementation goals to validate with CI and telemetry:
  - cold start target: <5s
  - median search latency target: <200ms
  - acceptable median degradation gate: 500ms
  - duplicate-rate target after dedupe: <1%
  - alert duplicate-rate threshold: 5%
  - pilot adoption target: 50%–90% weekly usage during a 2-week trial
  - pilot window for canary: 48–72 hours
  - index test size for CI: 10,000 records
  - retention suggestion for shared exports: 90 days

### Risks / Mitigations

- Risk: privacy exposure when sharing indices.
  - Mitigation: require explicit opt-in; run a sanitizer that strips emails, API keys, and token-like strings; limit retention windows.

- Risk: missing sqlite3 prevents opencode indexing.
  - Mitigation: detect sqlite3 at startup and print a clear message. Accept prebuilt opencode exports as a fallback.

- Risk: fuzzy scoring returns unexpected top results.
  - Mitigation: expose scorer weights in config and iterate with a canary user until results are reliable.

- Risk: large index slows searches.
  - Mitigation: persist a prebuilt JSONL index, use incremental updates, and test on ~10,000-record samples in CI.

### Next steps

- Add CI that runs integration tests against sample history files for the supported agents (≥4 agents).
- Package release binaries (tar.gz) and consider OS packaging or a Homebrew formula.
- Implement a privacy audit and a sanitized-export tool.
- Set up monitoring for median search latency and duplicate-rate; create alerts for median > 500ms or duplicate-rate > 5%.

Final ship checklist (copy/paste):
- [ ] Zig build in CI
- [ ] Integration tests with sample history files (≥4 agents)
- [ ] Privacy audit complete
- [ ] Canary deployment to 1 user for 72 hours

Source and reference: https://www.al3rez.com/building-zehn
