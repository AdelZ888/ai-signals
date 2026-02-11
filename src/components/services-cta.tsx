import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { localePrefix } from "@/lib/i18n";

type ServicesCtaProps = {
  locale?: Locale;
  variant?: "sidebar" | "inline";
};

export function ServicesCta({ locale = "en", variant = "sidebar" }: ServicesCtaProps) {
  const prefix = localePrefix(locale);
  const copy =
    locale === "fr"
      ? {
          kicker: "Services",
          title: "Vous voulez aller plus vite ?",
          body: "Nous aidons les équipes à déployer des workflows IA fiables: cadrage, implémentation, runbook, transfert.",
          ctaPrimary: "Demander un plan",
          ctaSecondary: "Voir les offres",
        }
      : {
          kicker: "Services",
          title: "Need this shipped faster?",
          body: "We help teams deploy production AI workflows end-to-end: scoping, implementation, runbooks, and handoff.",
          ctaPrimary: "Request a plan",
          ctaSecondary: "View offers",
        };

  return (
    <div className={`aside-card motion-card ${variant === "inline" ? "motion-enter motion-delay-4" : "motion-enter motion-delay-5"}`}>
      <p className="section-kicker">{copy.kicker}</p>
      <h3 className="mt-2 text-lg font-black tracking-tight">{copy.title}</h3>
      <p className="mt-2 text-sm theme-text-muted">{copy.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`${prefix}/services#request`} className="hero-cta hero-cta-primary">
          {copy.ctaPrimary}
        </Link>
        <Link href={`${prefix}/services`} className="hero-cta hero-cta-tertiary">
          {copy.ctaSecondary}
        </Link>
      </div>
    </div>
  );
}
