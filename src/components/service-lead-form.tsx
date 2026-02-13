"use client";

import { useState } from "react";

import type { Locale } from "@/lib/i18n";

type LeadFormStatus = "idle" | "loading" | "success" | "error";

type ServiceLeadFormProps = {
  locale?: Locale;
  source?: string;
};

type Copy = {
  fullName: string;
  email: string;
  company: string;
  role: string;
  website: string;
  budget: string;
  timeline: string;
  objective: string;
  objectivePlaceholder: string;
  needs: string;
  needsPlaceholder: string;
  consent: string;
  submit: string;
  submitLoading: string;
  successTitle: string;
  errorTitle: string;
  successBody: string;
  errorBody: string;
  budgetOptions: { value: string; label: string }[];
  timelineOptions: { value: string; label: string }[];
};

type LeadPayload = {
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  budget: string;
  timeline: string;
  objective: string;
  needs: string;
  consent: boolean;
  hp: string;
};

export function ServiceLeadForm({ locale = "en", source = "services_page" }: ServiceLeadFormProps) {
  const copy: Copy =
    locale === "fr"
      ? {
          fullName: "Prénom et nom",
          email: "Email pro",
          company: "Entreprise",
          role: "Votre activité",
          website: "Site web (optionnel)",
          budget: "Budget mensuel",
          timeline: "Délai souhaité",
          objective: "Priorité n°1",
          objectivePlaceholder: "Ex: générer plus de leads, gagner du temps sur le support, publier plus vite...",
          needs: "Ce qui vous bloque aujourd'hui",
          needsPlaceholder: "Expliquez simplement vos tâches répétitives ou votre objectif. Pas besoin de détails techniques.",
          consent: "J'accepte d'être contacté au sujet de cette demande.",
          submit: "Envoyer la demande",
          submitLoading: "Envoi...",
          successTitle: "Demande reçue",
          errorTitle: "Erreur",
          successBody: "Merci. Nous revenons vers vous rapidement avec une proposition claire.",
          errorBody: "Impossible d'envoyer la demande pour le moment. Réessayez dans quelques minutes.",
          budgetOptions: [
            { value: "under_1k", label: "< 1k EUR / mois" },
            { value: "1k_2k", label: "1k - 2k EUR / mois" },
            { value: "2k_5k", label: "2k - 5k EUR / mois" },
            { value: "5k_plus", label: "5k+ EUR / mois" },
            { value: "unsure", label: "Je ne sais pas encore" },
          ],
          timelineOptions: [
            { value: "asap", label: "Dès que possible (1-2 semaines)" },
            { value: "1_month", label: "Sous 1 mois" },
            { value: "2_3_months", label: "Sous 2-3 mois" },
            { value: "later", label: "Plus tard" },
          ],
        }
      : {
          fullName: "Full name",
          email: "Work email",
          company: "Company",
          role: "What you do",
          website: "Website (optional)",
          budget: "Monthly budget",
          timeline: "Expected timeline",
          objective: "Main goal",
          objectivePlaceholder: "Example: get more leads, save time on support, publish content faster...",
          needs: "What is slowing you down today?",
          needsPlaceholder: "Describe repetitive tasks or your business goal in plain language. No technical details needed.",
          consent: "I agree to be contacted about this request.",
          submit: "Send request",
          submitLoading: "Sending...",
          successTitle: "Request received",
          errorTitle: "Error",
          successBody: "Thanks. We will get back quickly with a scoped plan.",
          errorBody: "Could not send the request right now. Please try again in a few minutes.",
          budgetOptions: [
            { value: "under_1k", label: "< $1k / month" },
            { value: "1k_2k", label: "$1k - $2k / month" },
            { value: "2k_5k", label: "$2k - $5k / month" },
            { value: "5k_plus", label: "$5k+ / month" },
            { value: "unsure", label: "Not sure yet" },
          ],
          timelineOptions: [
            { value: "asap", label: "ASAP (1-2 weeks)" },
            { value: "1_month", label: "Within 1 month" },
            { value: "2_3_months", label: "Within 2-3 months" },
            { value: "later", label: "Later" },
          ],
        };

  const [status, setStatus] = useState<LeadFormStatus>("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<LeadPayload>({
    name: "",
    email: "",
    company: "",
    role: "",
    website: "",
    budget: "1k_2k",
    timeline: "1_month",
    objective: "",
    needs: "",
    consent: false,
    hp: "",
  });

  const isBusy = status === "loading";
  const submitLabel = status === "loading" ? copy.submitLoading : copy.submit;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    let sourceWithPath = source;
    if (typeof window !== "undefined") {
      sourceWithPath = `${source}:${window.location.pathname}`;
    }

    try {
      const res = await fetch("/api/services/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          source: sourceWithPath,
          ...form,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message || copy.successBody);
        return;
      }

      setStatus("error");
      setMessage(data.message || copy.errorBody);
    } catch {
      setStatus("error");
      setMessage(copy.errorBody);
    }
  }

  function updateField<K extends keyof LeadPayload>(key: K, value: LeadPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section className="card-frame motion-card motion-enter motion-delay-3">
      <div className="rounded-[0.95rem] border theme-border theme-surface p-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-semibold theme-text-soft">{copy.fullName}</span>
              <input
                required
                disabled={isBusy}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
                autoComplete="name"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold theme-text-soft">{copy.email}</span>
              <input
                required
                disabled={isBusy}
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
                autoComplete="email"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold theme-text-soft">{copy.company}</span>
              <input
                required
                disabled={isBusy}
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
                autoComplete="organization"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold theme-text-soft">{copy.role}</span>
              <input
                required
                disabled={isBusy}
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
                autoComplete="organization-title"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold theme-text-soft">{copy.budget}</span>
              <select
                required
                disabled={isBusy}
                value={form.budget}
                onChange={(e) => updateField("budget", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
              >
                {copy.budgetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold theme-text-soft">{copy.timeline}</span>
              <select
                required
                disabled={isBusy}
                value={form.timeline}
                onChange={(e) => updateField("timeline", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
              >
                {copy.timelineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-semibold theme-text-soft">{copy.website}</span>
              <input
                disabled={isBusy}
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                className="theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
                autoComplete="url"
              />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-semibold theme-text-soft">{copy.objective}</span>
              <textarea
                required
                disabled={isBusy}
                value={form.objective}
                onChange={(e) => updateField("objective", e.target.value)}
                placeholder={copy.objectivePlaceholder}
                className="theme-input min-h-24 w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
              />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-semibold theme-text-soft">{copy.needs}</span>
              <textarea
                required
                disabled={isBusy}
                value={form.needs}
                onChange={(e) => updateField("needs", e.target.value)}
                placeholder={copy.needsPlaceholder}
                className="theme-input min-h-36 w-full rounded-lg px-3 py-2.5 text-sm outline-none ring-cyan-300/55 transition focus:ring"
              />
            </label>
          </div>

          <input
            value={form.hp}
            onChange={(e) => updateField("hp", e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />

          <input type="hidden" value={source} readOnly />

          <label className="flex items-start gap-2 text-sm theme-text-muted">
            <input
              required
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
              disabled={isBusy}
              className="mt-0.5"
            />
            <span>{copy.consent}</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-lg bg-linear-to-r from-cyan-300 to-amber-300 px-4 py-2.5 text-sm font-extrabold text-zinc-950 transition hover:from-cyan-200 hover:to-amber-200 disabled:opacity-65"
            >
              {submitLabel}
            </button>
          </div>

          {status !== "idle" ? (
            <p className={`text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>
              <strong>{status === "success" ? copy.successTitle : copy.errorTitle}.</strong>{" "}
              {message || (status === "success" ? copy.successBody : copy.errorBody)}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
