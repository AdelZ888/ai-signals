---
title: "Testing Anthropic Claude's Code and Cowork on macOS: a safe one-machine setup"
date: "2026-03-24"
excerpt: "Step-by-step 60-minute guide to try Anthropic Claude's Code and Cowork macOS automation safely. Set up a one-machine canary, grant minimal permissions, and log actions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-24-testing-anthropic-claudes-code-and-cowork-on-macos-a-safe-one-machine-setup.jpg"
region: "US"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "anthropic"
  - "claude"
  - "macOS"
  - "autonomous-ai"
  - "security"
  - "devtools"
  - "tutorial"
  - "cowork"
sources:
  - "https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer"
---

## TL;DR in plain English

- What changed: Anthropic’s Claude (Code and Cowork) can now ask for permission to run actions on your Mac. This is a research preview and is limited to macOS (Apple’s desktop operating system): https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer
- Why it matters: Claude can request permission to open apps, run developer tools, and save files. That can remove repetitive mouse-and-keyboard steps for small tasks. Treat any granted access like a human account: give the least privilege needed and log everything.
- Quick action (30–60 minutes): pick one macOS test machine, create a tiny test project, opt into the research preview, grant only the Automation/Accessibility permission when Claude asks, and run one safe task. Keep the pilot to one machine for one week.
- Safety rule: use a dedicated test user, limit permissions, and keep an audit log for at least 30 days.

Example scenario: a solo founder sets up a single Mac to run nightly tests and save a small timestamped log file. Claude runs the tests after you grant a one-time permission. You check the log and revoke permission if anything looks wrong.

Plain-language explanation before advanced details:
Claude’s macOS feature asks you for permission before it does anything. Think of it like giving a helper temporary access to a single folder and a few apps. Start small, watch what it does, and only expand when you trust it.

## What you will build and why it helps

- Short goal: enable Claude’s macOS autonomous mode on one machine and run a constrained test job: open a small project, run a test command, and save a timestamped output file. See the Verge announcement: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer
- Tangible output: a file such as `test-output-YYYYMMDD.txt` (small, typically a few KB) and a local audit entry with a timestamp. Keep the summary line under 200 characters.
- Simple benefit: automating repeatable, low-risk steps reduces context switching. Example metric targets you can try: save 5–10 minutes per manual task; run jobs overnight at 02:00; keep interactive prompt latency low.

Decision rule (simple): start with read-only tasks, then tests, and only later let automation edit source code.

| Risk level | Example task | Automation gate |
|---:|---|---|
| Low | Gather logs, create a test-output file | 1-machine canary; human review |
| Medium | Run tests that write cache | feature flag; require ≥90% success |
| High | Modify or commit source code | manual approval required |

Reference: the feature’s macOS research-preview status and permission prompt are reported here: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

## Before you start (time, cost, prerequisites)

- Time: about 60 minutes to set up one machine and run a single safe test. Expanding the pilot to a few machines takes 1–2 days.
- Cost: likely $0 to try the client, but confirm any account or subscription requirements in the product UI. (This enrollment detail is not specified in the Verge excerpt.)
- Required: one macOS device and local admin rights to grant Accessibility/Automation when Claude asks. The Verge excerpt notes the research-preview is macOS-only and that Claude requests permission: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

Short preflight checklist:
- [ ] Enroll the test machine in your asset inventory (count: 1)
- [ ] Create a dedicated test user account on the Mac
- [ ] Back up important files (Time Machine snapshot or similar)
- [ ] Prevent sleep during the pilot (Energy Saver / System Settings)

Pilot gate: do not enable this on production machines. Start with one canary machine and require ≥90% success and ≤5% false positives over 7 days before expanding.

## Step-by-step setup and implementation

1. Sign in and opt in to the research preview. Look for a macOS research-preview option in your Claude/Anthropic account: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

2. Prepare a very small test project and a minimal test script. (CLI = command-line interface.)

```bash
# create a sample project and a minimal test script
mkdir -p ~/TestProject
cat > ~/TestProject/package.json <<'JSON'
{ "name": "testproject", "scripts": { "test": "node test.js" } }
JSON
cat > ~/TestProject/test.js <<'JS'
console.log('TEST RUN', new Date().toISOString());
JS
```

3. Open the Claude client or web UI and request a single, clearly scoped action.
   - When Claude asks for permission, grant only the specific Accessibility or Automation permission it requests. The Verge report confirms Claude will ask for permission: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

4. Send a short, auditable instruction (prompt). Keep prompts under 300 characters.
   - Example instruction (plain text):
     "Open ~/TestProject, run `npm test`, save stdout to ~/TestProject/test-output.txt, do not modify other files. Grant permission for this one task only."

5. Verify outputs and logs.
   - Confirm `~/TestProject/test-output.txt` exists and includes the timestamp.
   - Check your local audit log for an entry with the action and a timestamp. Keep logs for at least 30 days.

6. Record the permissions and pilot metadata in a small JSON file.

```json
{
  "machine": "dev-mac-01",
  "granted_permissions": ["Accessibility","Automation:Terminal","Automation:Finder"],
  "pilot_start": "2026-03-24",
  "notes": "Least-privilege: only Terminal and Finder granted"
}
```

7. Gates and rollback:
   - Canary: 1 machine, human reviewer present. Metric: ≥90% success over 24 hours.
   - Expand to 1–2 teams only after 7 days and meeting thresholds.
   - Rollback: immediately revoke Automation/Accessibility in System Settings and disable autonomous mode in the Claude client.

## Common problems and quick fixes

- No permission prompt: bring the Claude client to the foreground and restart it. macOS may delay or batch prompts. See: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer
- Permission denied writing files: check the test user’s file ownership and permissions (use `chmod` / `chown`). Confirm the Automation permission was granted to the exact client process.
- Preview option missing: sign out and sign back in, verify account status, and check product enrollment notices. (Subscription gating is not detailed in the excerpt.)
- Automation fails silently: inspect the local audit log, and run a simple manual command (for example, create a file) to isolate the issue. Plan for longer timeouts on long tasks; expect UI prompts to respond quickly when interactive.

Quick fixes checklist:
- [ ] Restart Claude client
- [ ] Revoke and re-grant Automation permission
- [ ] Verify file ownership and mode (`chmod` / `chown`)
- [ ] Check local audit log and client network connectivity

## First use case for a small team

Scenario: a solo founder or a team of up to four people wants nightly test runs and log collection on one dedicated macOS machine. The Verge excerpt notes the feature is a macOS research preview and that Claude asks permission: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

Pilot parameters:
- Duration: 1-week pilot (7 days)
- Machines: 1 canary machine
- Schedule: nightly run at 02:00
- Metrics: success ≥90%, false positives ≤5%, retention ≥30 days

Concrete steps for small teams (three or more actions you can do now):
1. Use a single isolated macOS machine and a dedicated test user. Place the machine on a separate VLAN or firewall rule to limit network reach.
2. Start with read-only tasks for the first 3 days: gather logs and produce a summary file. Only after that add `npm test` runs that write small outputs.
3. Rotate any automation credentials weekly during the pilot. Record rotations in your asset inventory.
4. Keep prompts templated and short (≤300 chars). Include an explicit "do not modify" instruction to reduce accidental edits.
5. Configure notifications so Claude posts results to one Slack channel and only notifies people on failures. Require manual approval before opening or editing failing files.

Small-team tips:
- Limit file paths Claude can access. Prefer a single output pattern such as `test-output-*.txt`.
- Schedule runs at low-traffic hours to avoid interfering with active work.
- Track manual overrides and aim to keep overrides low (for example, ≤2 per week during pilot).

Reference: feature context and macOS limit per Verge: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

## Technical notes (optional)

- Likely implementation detail: the client requests macOS Accessibility/Automation permissions and then performs UI automation or runs local commands. Treat this as a hypothesis to verify in the product UI: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer
- Keep the per-machine permission list small (target ≤5 entries).
- Useful metrics: automated run success rate (%), average task latency (ms), manual override count (per week). Example thresholds: success ≥90%, latency target <2000 ms for end-to-end operations, retention_days = 30.

Optional YAML config for pilot gates:

```yaml
pilot:
  machines: 1
  success_threshold: 0.90   # 90%
  false_positive_threshold: 0.05  # 5%
  retention_days: 30
canary:
  enabled: true
  gate: human_review_present
```

## What to do next (production checklist)

### Assumptions / Hypotheses

- Assumption: Anthropic’s Claude can ask permission and operate on macOS; this is described in the Verge research-preview article: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer
- Hypothesis: subscription requirements or exact enrollment steps are not detailed in the excerpt. Confirm your account/subscription status in the product UI before starting.
- Hypothesis: which logs are sent to Anthropic versus kept locally is not stated in the excerpt. Verify telemetry and retention settings in the product before production.

### Risks / Mitigations

- Risk: Granting too many permissions allows unwanted file changes. Mitigation: grant only specific Accessibility/Automation rights; avoid full-disk access.
- Risk: Silent failures or mis-executions. Mitigation: require human approval for risky tasks and set alerts when success <90%.
- Risk: Machine compromise via automation. Mitigation: isolate the test machine on a VLAN, keep the OS patched, run endpoint protection, and rotate credentials weekly.

### Next steps

- Run a 1-week pilot on 1 machine (metrics: success ≥90%, false positives ≤5%).
- If thresholds pass, run a 2-week pilot across 2–3 machines before broader rollout.
- Document and test rollback steps: revoke Automation permissions, disable autonomous mode, and validate that the client cannot act after revocation.

Rollout quick checklist:
- [ ] Pilot start (1 machine)
- [ ] Metric tracking enabled (success rate, latency in ms, overrides)
- [ ] Rollback procedure documented and tested
- [ ] Decision to expand only after meeting gates (canary → feature-flag group → full)

Reference and context: the Verge article describing the macOS research preview and the permission prompt: https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer

If you want, I can produce exact prompt templates, a JSON audit parser, or a small CI script to rotate/revoke permissions automatically.
