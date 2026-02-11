import { NextResponse } from "next/server";

type Locale = "en" | "fr";

type LeadPayload = {
  locale?: Locale;
  source?: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  website?: string;
  budget?: string;
  timeline?: string;
  objective?: string;
  needs?: string;
  consent?: boolean;
  hp?: string;
};

function json(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, { status, headers: { "cache-control": "no-store" } });
}

function localeMessage(locale: Locale, en: string, fr: string) {
  return locale === "fr" ? fr : en;
}

function asLocale(value: unknown): Locale {
  return value === "fr" ? "fr" : "en";
}

function clean(value: unknown, max: number) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

function isValidEmail(value: string) {
  if (!value || value.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function extractEmailFromFromHeader(from: string) {
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] || from).trim();
}

function buildLeadHtml(locale: Locale, lead: Required<Omit<LeadPayload, "locale" | "consent" | "hp">>) {
  const title = locale === "fr" ? "Nouveau lead services" : "New services lead";
  const labels =
    locale === "fr"
      ? {
          source: "Source",
          name: "Nom",
          email: "Email",
          company: "Entreprise",
          role: "Rôle",
          website: "Site",
          budget: "Budget",
          timeline: "Délai",
          objective: "Objectif",
          needs: "Contexte",
        }
      : {
          source: "Source",
          name: "Name",
          email: "Email",
          company: "Company",
          role: "Role",
          website: "Website",
          budget: "Budget",
          timeline: "Timeline",
          objective: "Objective",
          needs: "Needs",
        };

  const rows = [
    [labels.source, lead.source],
    [labels.name, lead.name],
    [labels.email, lead.email],
    [labels.company, lead.company],
    [labels.role, lead.role],
    [labels.website, lead.website || "-"],
    [labels.budget, lead.budget],
    [labels.timeline, lead.timeline],
    [labels.objective, lead.objective],
    [labels.needs, lead.needs],
  ]
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 10px;border:1px solid #334155;font-weight:700;color:#e2e8f0;vertical-align:top;">${escapeHtml(
          key,
        )}</td><td style="padding:8px 10px;border:1px solid #334155;color:#cbd5e1;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `
  <div style="background:#0b1220;padding:20px;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
    <h2 style="margin:0 0 12px;font-size:20px;">${escapeHtml(title)}</h2>
    <table style="border-collapse:collapse;width:100%;max-width:860px;background:#111827;">
      ${rows}
    </table>
  </div>`;
}

function buildLeadText(locale: Locale, lead: Required<Omit<LeadPayload, "locale" | "consent" | "hp">>) {
  const header = locale === "fr" ? "Nouveau lead services" : "New services lead";
  return [
    header,
    "",
    `source: ${lead.source}`,
    `name: ${lead.name}`,
    `email: ${lead.email}`,
    `company: ${lead.company}`,
    `role: ${lead.role}`,
    `website: ${lead.website || "-"}`,
    `budget: ${lead.budget}`,
    `timeline: ${lead.timeline}`,
    `objective: ${lead.objective}`,
    "",
    "needs:",
    lead.needs,
  ].join("\n");
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua) {
    return json({ ok: false, error: "missing_user_agent" }, 400);
  }

  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const locale = asLocale(payload.locale);
  if (payload.hp) {
    return json({ ok: true, message: localeMessage(locale, "Request received.", "Demande reçue.") }, 200);
  }

  if (!payload.consent) {
    return json(
      {
        ok: false,
        error: "consent_required",
        message: localeMessage(locale, "Consent is required.", "Le consentement est requis."),
      },
      400,
    );
  }

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 320).toLowerCase();
  const company = clean(payload.company, 160);
  const role = clean(payload.role, 120);
  const website = clean(payload.website, 250);
  const budget = clean(payload.budget, 60);
  const timeline = clean(payload.timeline, 60);
  const objective = clean(payload.objective, 500);
  const needs = clean(payload.needs, 3000);
  const source = clean(payload.source, 180) || "services_form";

  if (!name || !company || !role || !budget || !timeline || !objective || !needs || !isValidEmail(email) || !isValidUrl(website)) {
    return json(
      {
        ok: false,
        error: "invalid_payload",
        message: localeMessage(locale, "Please complete all required fields.", "Merci de remplir les champs requis."),
      },
      400,
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.SERVICES_FROM || process.env.NEWSLETTER_FROM || "AI Signals <newsletter@aisignals.dev>";
  const to = process.env.SERVICES_LEAD_TO || process.env.NEWSLETTER_REPLY_TO || extractEmailFromFromHeader(from);
  const replyTo = process.env.SERVICES_REPLY_TO || email;

  if (!resendApiKey || !from || !to) {
    return json(
      {
        ok: false,
        error: "service_unavailable",
        message: localeMessage(
          locale,
          "Lead endpoint is not configured yet. Set RESEND_API_KEY and SERVICES_LEAD_TO.",
          "Le formulaire n'est pas encore configuré. Ajoutez RESEND_API_KEY et SERVICES_LEAD_TO.",
        ),
      },
      503,
    );
  }

  const lead = { source, name, email, company, role, website, budget, timeline, objective, needs };
  const subject =
    locale === "fr" ? `Nouveau lead services - ${company} (${name})` : `New services lead - ${company} (${name})`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject,
        html: buildLeadHtml(locale, lead),
        text: buildLeadText(locale, lead),
      }),
    });

    if (!res.ok) {
      return json(
        {
          ok: false,
          error: "upstream_error",
          message: localeMessage(locale, "Email provider error. Please retry.", "Erreur du provider email. Réessayez."),
        },
        502,
      );
    }

    return json(
      {
        ok: true,
        message: localeMessage(
          locale,
          "Request received. You will get a response within 24h.",
          "Demande reçue. Vous recevrez une réponse sous 24h.",
        ),
      },
      200,
    );
  } catch {
    return json(
      {
        ok: false,
        error: "network_error",
        message: localeMessage(locale, "Network error. Please retry.", "Erreur réseau. Réessayez."),
      },
      502,
    );
  }
}
