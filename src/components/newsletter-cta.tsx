"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";

type NewsletterCtaProps = {
  locale?: Locale;
};

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterCta({ locale = "en" }: NewsletterCtaProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [hp, setHp] = useState("");

  const copy =
    locale === "fr"
      ? {
          kicker: "Brief Hebdo",
          title: "Recevez AI Signals par email",
          body: "Un digest clair chaque semaine: sorties de modeles, patterns d'agents et tutoriels pratiques.",
          placeholder: "vous@entreprise.com",
          cta: "S'abonner",
          success: "Merci. Verifiez votre email si une confirmation est necessaire.",
          error: "Impossible de vous inscrire. Reessayez.",
          privacy: "Pas de spam. Desinscription en 1 clic.",
        }
      : {
          kicker: "Weekly Brief",
          title: "Get AI Signals by email",
          body: "One concise digest every week: model releases, agent patterns, and practical tutorials.",
          placeholder: "you@company.com",
          cta: "Join",
          success: "Thanks. Check your inbox if confirmation is required.",
          error: "Couldn't subscribe. Please try again.",
          privacy: "No spam. Unsubscribe in one click.",
        };

  const isDisabled = status === "loading" || status === "success";
  const ctaLabel = status === "loading" ? (locale === "fr" ? "..." : "...") : copy.cta;

  const utm = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      const url = new URL(window.location.href);
      const sp = url.searchParams;
      const out: Record<string, string> = {};
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
        const value = sp.get(key);
        if (value) out[key] = value;
      }
      out.referring_site = url.origin + url.pathname;
      return out;
    } catch {
      return {};
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale, hp, ...utm }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message || copy.success);
        return;
      }

      setStatus("error");
      setMessage(data.message || copy.error);
    } catch {
      setStatus("error");
      setMessage(copy.error);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-300/30 bg-linear-to-br from-cyan-500/10 to-amber-400/10 p-6 motion-card motion-enter motion-delay-5 motion-glow">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{copy.kicker}</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">{copy.title}</h3>
      <p className="mt-2 theme-text-muted">{copy.body}</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder={copy.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isDisabled}
          required
          autoComplete="email"
          className="w-full rounded-lg border theme-border-soft theme-surface px-4 py-2 text-sm theme-text-soft outline-none ring-cyan-300 transition focus:ring"
        />
        <input
          tabIndex={-1}
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          autoComplete="off"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={isDisabled}
          className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-cyan-200 disabled:opacity-60"
        >
          {ctaLabel}
        </button>
      </form>
      <div className="mt-3 text-xs theme-text-faint">
        {status === "success" ? <p className="text-emerald-300">{message}</p> : null}
        {status === "error" ? <p className="text-rose-300">{message}</p> : null}
        {status === "idle" || status === "loading" ? <p>{copy.privacy}</p> : null}
      </div>
    </section>
  );
}
