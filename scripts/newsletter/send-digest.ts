import "../load-env.mjs";

import fs from "node:fs";
import path from "node:path";

import { Resend } from "resend";

import { renderEmailHtml, unsubscribeUrl } from "../../src/lib/editorial/email.ts";
import { listArticles, renderMarkdown } from "../../src/lib/site/articles.ts";

const LOG_PATH = path.join(process.cwd(), "data", "newsletter-log.json");
const DRY_RUN = process.env.DRY_RUN === "1";
type SendLog = Record<string, { sentAt: string; recipients: number }>;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function listSubscribers(): Promise<string[]> {
  const apiKey = required("BEEHIIV_API_KEY");
  const publication = required("BEEHIIV_PUBLICATION_ID");
  const emails: string[] = [];
  let cursor = "";
  for (let page = 0; page < 200; page += 1) {
    const url = new URL(`https://api.beehiiv.com/v2/publications/${publication}/subscriptions`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("status", "active");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`Beehiiv list subscriptions failed: HTTP ${res.status}`);
    const json = (await res.json()) as { data?: { email?: string }[]; next_cursor?: string | null };
    for (const sub of json.data ?? []) if (sub.email) emails.push(sub.email);
    cursor = String(json.next_cursor ?? "");
    if (!cursor) break;
  }
  return emails;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<number> {
  const digest = listArticles().find((a) => a.kind === "digest");
  if (!digest) {
    console.log("[newsletter] no digest to send");
    return 0;
  }
  const log: SendLog = fs.existsSync(LOG_PATH) ? (JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) as SendLog) : {};
  const testTo = process.env.NEWSLETTER_TEST_TO?.trim();
  if (!testTo && log[digest.slug]) {
    console.log(`[newsletter] ${digest.slug} already sent`);
    return 0;
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://aisignals.dev").replace(/\/+$/u, "");
  const secret = required("NEWSLETTER_UNSUBSCRIBE_SECRET");
  const from = required("NEWSLETTER_FROM");
  const resend = new Resend(required("RESEND_API_KEY"));
  const recipients = testTo ? [testTo] : (await listSubscribers()).slice(0, Number(process.env.NEWSLETTER_MAX_SEND || 500));
  const contentHtml = await renderMarkdown(digest.body.replace(/\]\(\//gu, `](${site}/`));

  let sent = 0;
  for (const to of recipients) {
    const unsub = unsubscribeUrl(site, to, secret);
    if (DRY_RUN) {
      sent += 1;
      continue;
    }
    const { error } = await resend.emails.send({
      from,
      to,
      subject: digest.title,
      html: renderEmailHtml({ title: digest.title, contentHtml, url: `${site}/news/${digest.slug}`, unsubscribeUrl: unsub, address: process.env.NEWSLETTER_ADDRESS ?? "" }),
      replyTo: process.env.NEWSLETTER_REPLY_TO || undefined,
      headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
    if (error) console.warn(`[newsletter] one send failed: ${error.message}`);
    else sent += 1;
    await sleep(600);
  }

  if (!testTo && !DRY_RUN) {
    log[digest.slug] = { sentAt: new Date().toISOString(), recipients: sent };
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.writeFileSync(LOG_PATH, `${JSON.stringify(log, null, 2)}\n`);
  }
  console.log(`[newsletter] ${digest.slug} ${DRY_RUN ? "would send" : "sent"} ${sent}/${recipients.length}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[newsletter] failed:", error);
    process.exit(1);
  },
);
