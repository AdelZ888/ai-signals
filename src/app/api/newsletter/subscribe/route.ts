import { NextResponse } from "next/server";

type SubscribePayload = {
  email?: string;
  locale?: "en" | "fr";
  hp?: string; // honeypot
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referring_site?: string;
};

function isValidEmail(email: string): boolean {
  const value = email.trim();
  if (!value || value.length > 320) return false;
  // Pragmatic validation (enough to block obvious junk).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim();
  return ip || "unknown";
}

// Basic in-memory throttling (best-effort; serverless instances may reset).
const globalForRateLimit = globalThis as unknown as {
  __newsletterRateLimit?: Map<string, number[]>;
  __newsletterRateLimitLastPurge?: number;
};
const RATE_LIMIT: Map<string, number[]> = (globalForRateLimit.__newsletterRateLimit ??=
  new Map<string, number[]>());

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxHits = 8;

  // Keep the map bounded in long-running environments (dev/self-hosted).
  // In serverless, this is best-effort since instances can restart.
  const lastPurge = globalForRateLimit.__newsletterRateLimitLastPurge || 0;
  if (now - lastPurge > 10 * 60 * 1000) {
    for (const [key, hits] of RATE_LIMIT.entries()) {
      const prunedHits = hits.filter((t) => now - t < windowMs);
      if (prunedHits.length === 0) RATE_LIMIT.delete(key);
      else RATE_LIMIT.set(key, prunedHits);
    }
    globalForRateLimit.__newsletterRateLimitLastPurge = now;
  }

  const hits = RATE_LIMIT.get(ip) || [];
  const pruned = hits.filter((t) => now - t < windowMs);
  pruned.push(now);
  RATE_LIMIT.set(ip, pruned);
  return pruned.length > maxHits;
}

function json(locale: "en" | "fr", payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";

  let payload: SubscribePayload;
  try {
    payload = (await req.json()) as SubscribePayload;
  } catch {
    return json("en", { ok: false, error: "invalid_json" }, 400);
  }

  const locale: "en" | "fr" = payload.locale === "fr" ? "fr" : "en";

  if (!ua) {
    return json(locale, { ok: false, error: "missing_user_agent" }, 400);
  }

  if (payload.hp) {
    // Honeypot hit: pretend success.
    return json(locale, { ok: true, message: locale === "fr" ? "Merci, vous êtes inscrit." : "Thanks, you are subscribed." }, 200);
  }

  if (isRateLimited(ip)) {
    return json(
      locale,
      {
        ok: false,
        error: "rate_limited",
        message:
          locale === "fr"
            ? "Trop de tentatives. Réessayez dans une heure."
            : "Too many attempts. Please try again in an hour.",
      },
      429,
    );
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return json(
      locale,
      {
        ok: false,
        error: "invalid_email",
        message: locale === "fr" ? "Email invalide." : "Invalid email.",
      },
      400,
    );
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    return json(
      locale,
      {
        ok: false,
        error: "not_configured",
        message:
          locale === "fr" ? "Newsletter non configurée pour le moment." : "Newsletter is not configured yet.",
      },
      503,
    );
  }

  const sendWelcomeEmail = String(process.env.BEEHIIV_SEND_WELCOME_EMAIL || "0") === "1";

  const body = {
    email,
    reactivate_existing: false,
    send_welcome_email: sendWelcomeEmail,
    ...(payload.utm_source ? { utm_source: payload.utm_source } : null),
    ...(payload.utm_medium ? { utm_medium: payload.utm_medium } : null),
    ...(payload.utm_campaign ? { utm_campaign: payload.utm_campaign } : null),
    ...(payload.utm_content ? { utm_content: payload.utm_content } : { utm_content: `locale_${locale}` }),
    ...(payload.utm_term ? { utm_term: payload.utm_term } : null),
    ...(payload.referring_site ? { referring_site: payload.referring_site } : null),
  };

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return json(
        locale,
        {
          ok: true,
          message: locale === "fr" ? "Inscription confirmée. Bienvenue." : "You're subscribed. Welcome.",
        },
        200,
      );
    }

    // Beehiiv returns structured JSON errors; we avoid leaking internals to the client.
    if (res.status === 409) {
      return json(
        locale,
        {
          ok: true,
          message: locale === "fr" ? "Vous êtes déjà inscrit." : "You're already subscribed.",
        },
        200,
      );
    }

    return json(
      locale,
      {
        ok: false,
        error: "upstream_error",
        message:
          locale === "fr"
            ? "Impossible de vous inscrire pour le moment. Réessayez plus tard."
            : "Couldn't subscribe right now. Please try again later.",
      },
      502,
    );
  } catch {
    return json(
      locale,
      {
        ok: false,
        error: "network_error",
        message:
          locale === "fr"
            ? "Erreur réseau. Réessayez dans quelques minutes."
            : "Network error. Please try again in a few minutes.",
      },
      502,
    );
  }
}
