import fs from "node:fs/promises";
import crypto from "node:crypto";

import "./load-env.mjs";

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ALERT_TO = String(process.env.ALERT_TO || "").trim();
const ALERT_FROM = String(process.env.ALERT_FROM || process.env.NEWSLETTER_FROM || "").trim();
const ALERT_REPLY_TO = String(process.env.ALERT_REPLY_TO || process.env.NEWSLETTER_REPLY_TO || "").trim();

function requiredEnv(name, value) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asText(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function conclusionLabel(conclusion) {
  const raw = String(conclusion || "unknown").toLowerCase();
  if (raw === "success") return "SUCCESS";
  if (raw === "failure") return "FAILURE";
  if (raw === "cancelled") return "CANCELLED";
  if (raw === "timed_out") return "TIMED_OUT";
  return raw.toUpperCase();
}

function buildSubject({ repo, workflowName, conclusion }) {
  const status = conclusionLabel(conclusion);
  const shortRepo = repo ? repo.split("/").slice(-2).join("/") : "repo";
  return `[AI Signals] ${status}: ${workflowName || "automation"} (${shortRepo})`;
}

async function readEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return null;

  try {
    const raw = await fs.readFile(eventPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function githubRunUrl() {
  const server = process.env.GITHUB_SERVER_URL;
  const repo = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;
  if (!server || !repo || !runId) return "";
  return `${server}/${repo}/actions/runs/${runId}`;
}

function buildEmailHtml({ repo, workflowName, conclusion, runUrl, payloadUrl, branch, sha }) {
  const status = conclusionLabel(conclusion);
  const color = status === "SUCCESS" ? "#22c55e" : "#fb7185";
  const shortSha = sha ? String(sha).slice(0, 7) : "";

  const details = [
    repo ? ["Repo", repo] : null,
    workflowName ? ["Workflow", workflowName] : null,
    conclusion ? ["Conclusion", status] : null,
    branch ? ["Branch", branch] : null,
    shortSha ? ["SHA", shortSha] : null,
  ].filter(Boolean);

  const rows = details
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;width:120px;">${escapeHtml(k)}</td>
          <td style="padding:8px 0;color:#e2e8f0;font-size:12px;font-weight:700;">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join("");

  const primaryUrl = payloadUrl || runUrl || "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>AI Signals Alert</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1220;color:#e2e8f0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b1220;">
      <tr>
        <td align="center" style="padding:26px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="680" style="width:100%;max-width:680px;border:1px solid rgba(148,163,184,0.18);border-radius:16px;overflow:hidden;background:rgba(15,23,42,0.82);">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(135deg, rgba(251,113,133,0.16), rgba(34,211,238,0.10));">
                <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#67e8f9;font-weight:900;">AI Signals Automation</div>
                <div style="margin-top:10px;font-size:22px;line-height:28px;font-weight:950;color:#f8fafc;">
                  <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${color};color:#0b1220;font-size:12px;font-weight:950;letter-spacing:0.06em;">${escapeHtml(
                    status,
                  )}</span>
                  <span style="padding-left:10px;">${escapeHtml(workflowName || "Workflow")}</span>
                </div>
                <div style="margin-top:12px;color:#cbd5e1;font-size:13px;line-height:19px;">
                  Your scheduled automation ran with conclusion <strong>${escapeHtml(status)}</strong>.
                </div>
                ${
                  primaryUrl
                    ? `<div style="margin-top:16px;">
                      <a href="${primaryUrl}" style="display:inline-block;background:#22d3ee;color:#0b1220;text-decoration:none;font-weight:950;font-size:13px;padding:11px 14px;border-radius:10px;">Open run logs</a>
                    </div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  ${rows}
                </table>
                <div style="margin-top:14px;color:#94a3b8;font-size:12px;line-height:18px;">
                  Tip: if this repeats, check secrets (OpenAI/Resend) and source availability. The system is configured to fail closed (no low-quality auto-publishes).
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function main() {
  const resend = new Resend(requiredEnv("RESEND_API_KEY", RESEND_API_KEY));
  const to = requiredEnv("ALERT_TO", ALERT_TO);
  const from = requiredEnv("ALERT_FROM (or NEWSLETTER_FROM)", ALERT_FROM);

  const event = await readEvent();

  const workflowRun = event?.workflow_run;
  const workflowName = workflowRun?.name || process.env.ALERT_WORKFLOW_NAME || "Automation";
  const conclusion = workflowRun?.conclusion || process.env.ALERT_CONCLUSION || "unknown";
  const payloadUrl = workflowRun?.html_url || "";
  const repo = workflowRun?.repository?.full_name || process.env.GITHUB_REPOSITORY || "";
  const branch = workflowRun?.head_branch || "";
  const sha = workflowRun?.head_sha || process.env.GITHUB_SHA || "";
  const runUrl = githubRunUrl();

  const subject = buildSubject({ repo, workflowName, conclusion });
  const html = buildEmailHtml({ repo, workflowName, conclusion, runUrl, payloadUrl, branch, sha });
  const text = asText(html);

  // Stable idempotency key: avoid duplicates if re-run.
  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`${repo}:${workflowName}:${conclusion}:${payloadUrl || runUrl}:${sha}`)
    .digest("hex")
    .slice(0, 48);

  await resend.emails.send({
    from,
    to: [to],
    replyTo: ALERT_REPLY_TO ? [ALERT_REPLY_TO] : undefined,
    subject,
    html,
    text,
    headers: {
      "X-AI-Signals-Alert": "1",
      "X-AI-Signals-Idempotency": idempotencyKey,
    },
    tags: [{ name: "workflow", value: String(workflowName || "unknown") }, { name: "conclusion", value: String(conclusion) }],
  });

  console.log(`[send-alert] sent to=${to} subject="${subject}"`);
}

await main();

