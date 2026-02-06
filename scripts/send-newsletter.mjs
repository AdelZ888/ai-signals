import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import "./load-env.mjs";

import matter from "gray-matter";
import { Resend } from "resend";
import { remark } from "remark";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";

const ROOT = process.cwd();
const SITE_URL = String(process.env.NEXT_PUBLIC_SITE_URL || "https://aisignals.dev").replace(/\/+$/u, "");

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM; // e.g. "AI Signals <newsletter@aisignals.dev>"
const NEWSLETTER_REPLY_TO = process.env.NEWSLETTER_REPLY_TO || "";
const NEWSLETTER_ADDRESS = process.env.NEWSLETTER_ADDRESS || "";
const UNSUBSCRIBE_SECRET = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;

const DRY_RUN = String(process.env.DRY_RUN || "0") === "1";
const TEST_TO = String(process.env.NEWSLETTER_TEST_TO || "").trim(); // if set: only send to this address
const MAX_SEND = Math.max(1, Math.min(10_000, Number(process.env.NEWSLETTER_MAX_SEND || 500)));

const OUT_DIR = path.join(ROOT, "content/newsletters");
const OUT_FR_DIR = path.join(ROOT, "content/newsletters/fr");
const SENT_LOG_PATH = path.join(ROOT, "data/newsletter-sent.json");

function requiredEnv(name, value) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function signUnsubscribe(email) {
  const secret = requiredEnv("NEWSLETTER_UNSUBSCRIBE_SECRET", UNSUBSCRIBE_SECRET);
  return crypto.createHmac("sha256", secret).update(normalizeEmail(email)).digest("hex");
}

function buildUnsubscribeUrl(email) {
  const sig = signUnsubscribe(email);
  const params = new URLSearchParams({ email: normalizeEmail(email), sig });
  return `${SITE_URL}/api/newsletter/unsubscribe?${params.toString()}`;
}

function formatDate(dateIso, locale) {
  try {
    const language = locale === "fr" ? "fr-FR" : "en-US";
    return new Date(dateIso).toLocaleDateString(language, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateIso;
  }
}

async function markdownToHtml(markdown) {
  const processed = await remark().use(remarkRehype).use(rehypeSlug).use(rehypeStringify).process(String(markdown || ""));
  return String(processed.value);
}

function stripTags(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapEmailHtml({ locale, title, excerpt, dateIso, issueNumber, contentHtml, issueUrl, unsubscribeUrl }) {
  const isFr = locale === "fr";
  const heading = isFr ? "AI Signals Hebdo" : "AI Signals Weekly";
  const preheader = excerpt ? excerpt.slice(0, 140) : isFr ? "Les signaux IA de la semaine." : "This week’s AI signals.";
  const dateLabel = formatDate(dateIso, locale);
  const issueLabel = issueNumber ? (isFr ? `Edition #${issueNumber}` : `Issue #${issueNumber}`) : "";
  const footerAddress = NEWSLETTER_ADDRESS ? `<div style="margin-top:10px;color:#94a3b8;font-size:12px;line-height:18px">${NEWSLETTER_ADDRESS}</div>` : "";

  // Email clients are hostile. Keep it simple: table layout + inline styles.
  return `<!doctype html>
<html lang="${isFr ? "fr" : "en"}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1220;color:#e2e8f0;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b1220;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="680" style="width:100%;max-width:680px;border:1px solid rgba(34,211,238,0.18);border-radius:18px;overflow:hidden;background:rgba(15,23,42,0.75);">
            <tr>
              <td style="padding:26px 26px 18px;background:linear-gradient(135deg, rgba(34,211,238,0.18), rgba(245,158,11,0.14));">
                <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#67e8f9;font-weight:800;">${heading}</div>
                <div style="margin-top:10px;font-size:30px;line-height:34px;font-weight:900;color:#f8fafc;">${escapeHtml(title)}</div>
                <div style="margin-top:10px;color:#cbd5e1;font-size:14px;line-height:20px;">${escapeHtml(excerpt || "")}</div>
                <div style="margin-top:16px;display:block;color:#94a3b8;font-size:12px;line-height:18px;">
                  <span>${escapeHtml(dateLabel)}</span>
                  ${issueLabel ? `<span style="padding:0 8px;">•</span><span>${escapeHtml(issueLabel)}</span>` : ""}
                </div>
                <div style="margin-top:18px;">
                  <a href="${issueUrl}" style="display:inline-block;background:#22d3ee;color:#0b1220;text-decoration:none;font-weight:900;font-size:13px;padding:11px 14px;border-radius:10px;">${isFr ? "Lire en ligne" : "Read on the web"}</a>
                  <a href="${SITE_URL}${isFr ? "/fr/#newsletter" : "/#newsletter"}" style="display:inline-block;margin-left:10px;border:1px solid rgba(148,163,184,0.35);color:#e2e8f0;text-decoration:none;font-weight:800;font-size:13px;padding:11px 14px;border-radius:10px;">${isFr ? "Partager" : "Share"}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 26px 10px;">
                <div style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                  ${sanitizeContent(contentHtml)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 26px 26px;border-top:1px solid rgba(148,163,184,0.18);">
                <div style="color:#94a3b8;font-size:12px;line-height:18px;">
                  ${isFr ? "Vous recevez cet email car vous vous etes inscrit sur AI Signals." : "You’re receiving this because you subscribed on AI Signals."}
                  <div style="margin-top:10px;">
                    <a href="${unsubscribeUrl}" style="color:#67e8f9;text-decoration:underline;">${isFr ? "Se desabonner" : "Unsubscribe"}</a>
                    <span style="padding:0 8px;">•</span>
                    <a href="${SITE_URL}${isFr ? "/fr" : ""}" style="color:#67e8f9;text-decoration:underline;">${isFr ? "Ouvrir le site" : "Open site"}</a>
                  </div>
                  ${footerAddress}
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

function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeContent(html) {
  // Basic cleanup: remove <h1> inside the body and clamp images.
  let out = String(html || "");
  out = out.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, "");
  out = out.replace(/<img\b/gi, '<img style="max-width:100%;height:auto;border-radius:12px;"');
  out = out.replaceAll('href="/', `href="${SITE_URL}/`);
  out = out.replaceAll("href='/", `href='${SITE_URL}/`);
  return out;
}

async function readLatestIssue(locale) {
  const dir = locale === "fr" ? OUT_FR_DIR : OUT_DIR;
  const files = await fs.readdir(dir);
  const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx")).sort();
  if (mdFiles.length === 0) throw new Error(`No newsletter issues found in ${dir}`);

  // Slugs start with YYYY-MM-DD, lexicographic sort is fine.
  const fileName = mdFiles[mdFiles.length - 1];
  const slug = fileName.replace(/\.(md|mdx)$/u, "");
  const raw = await fs.readFile(path.join(dir, fileName), "utf8");
  const parsed = matter(raw);

  const fm = parsed.data || {};
  const title = String(fm.title || slug);
  const excerpt = String(fm.excerpt || "");
  const dateIso = String(fm.date || slug.slice(0, 10));
  const issueNumber = typeof fm.issueNumber === "number" ? fm.issueNumber : Number(fm.issueNumber || "");
  const markdown = String(parsed.content || "").trim();
  const contentHtml = await markdownToHtml(markdown);

  return {
    slug,
    title,
    excerpt,
    dateIso,
    issueNumber: Number.isFinite(issueNumber) ? issueNumber : undefined,
    contentHtml,
  };
}

async function readSentLog() {
  try {
    const raw = await fs.readFile(SENT_LOG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch {
    return {};
  }
}

async function writeSentLog(payload) {
  await fs.mkdir(path.dirname(SENT_LOG_PATH), { recursive: true });
  await fs.writeFile(SENT_LOG_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

async function fetchBeehiivSubscriptions() {
  requiredEnv("BEEHIIV_API_KEY", BEEHIIV_API_KEY);
  requiredEnv("BEEHIIV_PUBLICATION_ID", BEEHIIV_PUBLICATION_ID);

  const out = [];
  let page = 1;
  let cursor = "";

  while (page < 200) {
    const url = new URL(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Beehiiv list subscriptions failed: ${res.status}`);
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];
    out.push(...data);

    cursor = String(json.next_cursor || "");
    if (!cursor) break;
    page += 1;
  }

  return out;
}

function inferLocaleFromSubscription(sub) {
  const referring = String(sub.referring_site || "").toLowerCase();
  const utmContent = String(sub.utm_content || "").toLowerCase();

  if (utmContent.includes("locale_fr") || utmContent.includes("fr")) return "fr";
  if (referring.includes("/fr")) return "fr";
  return "en";
}

async function main() {
  requiredEnv("RESEND_API_KEY", RESEND_API_KEY);
  requiredEnv("NEWSLETTER_FROM", NEWSLETTER_FROM);
  requiredEnv("NEWSLETTER_UNSUBSCRIBE_SECRET", UNSUBSCRIBE_SECRET);

  const resend = new Resend(RESEND_API_KEY);

  const [issueEn, issueFr, sentLog, subs] = await Promise.all([
    readLatestIssue("en"),
    readLatestIssue("fr"),
    readSentLog(),
    fetchBeehiivSubscriptions(),
  ]);

  // Prevent duplicate sends per issue slug (autonomous safety).
  if (sentLog && sentLog[issueEn.slug] && !TEST_TO) {
    console.log(`[send-newsletter] Already sent issue=${issueEn.slug} at ${sentLog[issueEn.slug].sentAt}`);
    return;
  }

  const activeSubs = subs.filter((s) => String(s.status || "").toLowerCase() === "active");
  const recipients = TEST_TO ? activeSubs.filter((s) => normalizeEmail(s.email) === normalizeEmail(TEST_TO)) : activeSubs;

  const batches = recipients.slice(0, MAX_SEND);
  let sentCount = 0;

  for (const sub of batches) {
    const email = normalizeEmail(sub.email);
    if (!email) continue;

    const locale = inferLocaleFromSubscription(sub);
    const issue = locale === "fr" ? issueFr : issueEn;
    const issueUrl = `${SITE_URL}${locale === "fr" ? "/fr" : ""}/newsletter/${issue.slug}`;
    const unsubscribeUrl = buildUnsubscribeUrl(email);

    const html = wrapEmailHtml({
      locale,
      title: issue.title,
      excerpt: issue.excerpt,
      dateIso: issue.dateIso,
      issueNumber: issue.issueNumber,
      contentHtml: issue.contentHtml,
      issueUrl,
      unsubscribeUrl,
    });

    const text = stripTags(html);

    if (DRY_RUN) {
      console.log(`[send-newsletter] DRY_RUN -> ${email} locale=${locale} issue=${issue.slug}`);
      sentCount += 1;
      continue;
    }

    await resend.emails.send({
      from: NEWSLETTER_FROM,
      to: [email],
      replyTo: NEWSLETTER_REPLY_TO ? [NEWSLETTER_REPLY_TO] : undefined,
      subject: issue.title,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [{ name: "locale", value: locale }, { name: "issue", value: issue.slug }],
    });

    sentCount += 1;
  }

  if (!TEST_TO) {
    sentLog[issueEn.slug] = { sentAt: new Date().toISOString(), recipients: sentCount };
    await writeSentLog(sentLog);
  }

  console.log(`[send-newsletter] sent=${sentCount} issue=${issueEn.slug}${TEST_TO ? " (test mode)" : ""}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
