"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";

type NewsletterVariant = "sidebar" | "inline";

type NewsletterCtaProps = {
  locale?: Locale;
  variant?: NewsletterVariant;
};

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterCta({ locale = "en", variant = "sidebar" }: NewsletterCtaProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [hp, setHp] = useState("");

  const copy =
    locale === "fr"
      ? {
          kicker: "Brief hebdo",
          title: "Recevez AI Signals par email",
          body: "Un digest clair, axe builders, pour suivre les sorties de modeles, les agents, et les patterns qui comptent.",
          bullets: [
            "Modeles et outils: ce qui change vraiment",
            "Agents: architectures, evals, observabilite",
            "Tutoriels actionnables pour devs et startups",
          ],
          placeholder: "vous@entreprise.com",
          cta: "S'abonner",
          successTitle: "Inscription confirmee",
          successBody: "Bienvenue. Verifiez votre inbox si une confirmation est necessaire.",
          errorTitle: "Echec de l'inscription",
          error: "Impossible de vous inscrire. Reessayez dans quelques minutes.",
          privacy: "1 email par semaine. Pas de spam. Desinscription en 1 clic.",
          reset: "Changer d'email",
          ctaLoading: "Inscription...",
          ctaSuccess: "Inscrit",
        }
      : {
          kicker: "Weekly Brief",
          title: "Get AI Signals by email",
          body: "A builder-focused weekly digest: model launches, agent patterns, and the practical details that move the needle.",
          bullets: ["Models and tools: what actually matters", "Agents: architectures, evals, observability", "Actionable tutorials for devs and startups"],
          placeholder: "you@company.com",
          cta: "Join",
          successTitle: "You're in",
          successBody: "Welcome. Check your inbox if confirmation is required.",
          errorTitle: "Subscription failed",
          error: "Couldn't subscribe. Please try again in a few minutes.",
          privacy: "One email per week. No spam. Unsubscribe in one click.",
          reset: "Use a different email",
          ctaLoading: "Joining...",
          ctaSuccess: "Subscribed",
        };

  const isBusy = status === "loading";
  const ctaLabel = status === "loading" ? copy.ctaLoading : status === "success" ? copy.ctaSuccess : copy.cta;

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
        setMessage(data.message || copy.successBody);
        try {
          if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: unknown }).gtag === "function") {
            (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "newsletter_subscribe", {
              status: "success",
              locale,
              variant,
            });
          }
        } catch {
          // best-effort analytics
        }
        return;
      }

      setStatus("error");
      setMessage(data.message || copy.error);
    } catch {
      setStatus("error");
      setMessage(copy.error);
    }
  }

  function onReset() {
    setStatus("idle");
    setMessage("");
    setEmail("");
    setHp("");
  }

  return (
    <section className="card-frame motion-card motion-enter motion-delay-5">
      <div className="relative overflow-hidden rounded-[0.95rem] border theme-border theme-surface p-6">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 -top-28 h-64 w-64 rounded-full bg-cyan-400/15 blur-2xl" />
          <div className="absolute -right-24 -bottom-28 h-72 w-72 rounded-full bg-amber-400/12 blur-2xl" />
        </div>

        <div
          className={
            variant === "inline"
              ? "relative grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-start"
              : "relative grid gap-5"
          }
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{copy.kicker}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">{copy.title}</h3>
            <p className="mt-2 theme-text-muted">{copy.body}</p>

            <ul className="mt-4 grid gap-2 text-sm theme-text-muted">
              {copy.bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-2 inline-flex h-2 w-2 flex-none rounded-full bg-cyan-300/80"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {status === "success" ? (
              <div className="rounded-xl border theme-border-soft theme-surface px-4 py-4">
                <p className="text-sm font-extrabold tracking-tight text-emerald-300">{copy.successTitle}</p>
                <p className="mt-1 text-sm theme-text-muted">{message || copy.successBody}</p>
                <button
                  type="button"
                  onClick={onReset}
                  className="mt-4 w-full rounded-lg border theme-border-soft theme-surface px-4 py-2 text-sm font-semibold theme-text-soft transition hover:border-cyan-300/60 hover:text-cyan-300"
                >
                  {copy.reset}
                </button>
              </div>
            ) : (
              <form className="grid gap-3" onSubmit={onSubmit}>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="email"
                    placeholder={copy.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isBusy}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border theme-border-soft theme-surface px-4 py-2.5 text-sm theme-text-soft outline-none ring-cyan-300/60 transition focus:ring"
                  />
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="rounded-lg bg-linear-to-r from-cyan-300 to-amber-300 px-4 py-2.5 text-sm font-extrabold text-zinc-950 transition hover:from-cyan-200 hover:to-amber-200 disabled:opacity-60"
                  >
                    {ctaLabel}
                  </button>
                </div>

                <input
                  tabIndex={-1}
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  className="hidden"
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="text-xs theme-text-faint" aria-live="polite">
                  {status === "error" ? (
                    <>
                      <p className="font-semibold text-rose-300">{copy.errorTitle}</p>
                      <p className="mt-1">{message}</p>
                    </>
                  ) : (
                    <p>{copy.privacy}</p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
