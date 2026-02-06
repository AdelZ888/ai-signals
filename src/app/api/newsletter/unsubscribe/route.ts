import crypto from "node:crypto";

import { NextResponse } from "next/server";

function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

function sign(email: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(normalizeEmail(email)).digest("hex");
}

function html(body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Unsubscribe</title></head><body style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto; background:#0b1220; color:#e2e8f0; padding:24px;"><div style="max-width:720px;margin:0 auto;border:1px solid rgba(148,163,184,0.25);border-radius:16px;padding:20px;background:rgba(15,23,42,0.7)">${body}</div></body></html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

async function unsubscribeWithBeehiiv(email: string) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) throw new Error("not_configured");

  // Official API: update subscription by email (PUT).
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions/by_email/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ unsubscribe: true }),
    },
  );

  if (res.ok) return;

  // If the by_email endpoint is not available or the subscriber is missing, we still respond success to the user.
  throw new Error(`beehiiv_error_${res.status}`);
}

function verifySignature(email: string, sig: string, secret: string): boolean {
  const expected = sign(email, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig || "")));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = normalizeEmail(url.searchParams.get("email") || "");
  const sig = String(url.searchParams.get("sig") || "");

  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || "";
  if (!email || !sig || !secret) {
    return html(`<h1 style="margin:0 0 10px;font-size:20px;">Unsubscribe</h1><p style="margin:0;color:#94a3b8;">Missing parameters.</p>`, 400);
  }

  if (!verifySignature(email, sig, secret)) {
    return html(`<h1 style="margin:0 0 10px;font-size:20px;">Unsubscribe</h1><p style="margin:0;color:#94a3b8;">Invalid link.</p>`, 400);
  }

  try {
    await unsubscribeWithBeehiiv(email);
  } catch {
    // Best-effort; do not leak internals to the user.
  }

  return html(
    `<h1 style="margin:0 0 10px;font-size:20px;">You are unsubscribed</h1><p style="margin:0;color:#94a3b8;">You will no longer receive AI Signals emails.</p><p style="margin:14px 0 0;"><a style="color:#67e8f9;text-decoration:underline;" href="/">Back to AI Signals</a></p>`,
    200,
  );
}

export async function POST(req: Request) {
  // One-click unsubscribe (List-Unsubscribe-Post). We accept query params to match the List-Unsubscribe URL.
  const url = new URL(req.url);
  const email = normalizeEmail(url.searchParams.get("email") || "");
  const sig = String(url.searchParams.get("sig") || "");
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || "";

  if (!email || !sig || !secret) {
    return NextResponse.json({ ok: false }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  if (!verifySignature(email, sig, secret)) {
    return NextResponse.json({ ok: false }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  try {
    await unsubscribeWithBeehiiv(email);
  } catch {
    // ignore
  }

  // For one-click unsubscribe, providers expect an empty 200/202 response.
  return new Response("", { status: 200, headers: { "cache-control": "no-store" } });
}
