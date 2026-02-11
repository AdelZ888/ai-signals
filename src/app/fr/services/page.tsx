import type { Metadata } from "next";

import { ServiceLeadForm } from "@/components/service-lead-form";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const bookingUrl = process.env.NEXT_PUBLIC_SERVICES_BOOKING_URL || process.env.SERVICES_BOOKING_URL || "";

export const metadata: Metadata = {
  title: "Services",
  description: "Services d'implémentation IA pour équipes produit: cadrage, delivery, transfert opérationnel.",
  alternates: {
    canonical: "/fr/services",
    languages: {
      "en-US": "/services",
      "fr-FR": "/fr/services",
    },
  },
  openGraph: {
    type: "website",
    title: "Services IA | AI Signals",
    description: "Déployez des workflows IA robustes avec une équipe delivery focalisée.",
    url: "/fr/services",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Services IA",
          subtitle: "Cadrage, build et transfert pour des systèmes IA en production.",
          locale: "fr",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "Services IA | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services IA | AI Signals",
    description: "Déployez des workflows IA robustes avec une équipe delivery focalisée.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Services IA",
        subtitle: "Cadrage, build et transfert pour des systèmes IA en production.",
        locale: "fr",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default function ServicesFrPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Conseil et implémentation IA",
    provider: {
      "@type": "Organization",
      name: "AI Signals",
      url: siteUrl,
    },
    areaServed: ["US", "UK", "FR"],
    url: `${siteUrl}/fr/services`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      description: "Services d'implémentation IA pour équipes produit et engineering.",
    },
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero-shell motion-enter">
        <div className="hero-grid">
          <p className="hero-kicker">Services</p>
          <h1 className="hero-title">De l&apos;idée IA au système en production</h1>
          <p className="hero-subtitle">
            Nous aidons les fondateurs et équipes produit à déployer des workflows IA fiables: cadrage, build, évaluations, observabilité et transfert.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#request">
              Lancer un projet
            </a>
            {bookingUrl ? (
              <a className="hero-cta hero-cta-secondary" href={bookingUrl} target="_blank" rel="noreferrer">
                Réserver un call
              </a>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="hero-chip">US / UK / FR</span>
            <span className="hero-chip">Delivery opérationnel</span>
            <span className="hero-chip">Du pilote à la prod</span>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="aside-card motion-card motion-enter motion-delay-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Sprint</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">Sprint fondation IA</h2>
          <p className="mt-2 text-sm theme-text-muted">
            2 semaines pour identifier les workflows à plus fort ROI, fixer l&apos;architecture cible et livrer une première brique en production.
          </p>
        </article>
        <article className="aside-card motion-card motion-enter motion-delay-2">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Build</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">Implémentation agentique</h2>
          <p className="mt-2 text-sm theme-text-muted">
            Implémentation de bout en bout: orchestration, gates d&apos;évaluation, guardrails, checks de qualité data, dashboards et rollback.
          </p>
        </article>
        <article className="aside-card motion-card motion-enter motion-delay-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Enablement</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">Transfert équipe</h2>
          <p className="mt-2 text-sm theme-text-muted">
            Runbooks et coaching pour produit, engineering et opérations afin que votre équipe puisse reprendre et scaler durablement.
          </p>
        </article>
      </section>

      <section className="mt-8 aside-card motion-card motion-enter motion-delay-4">
        <p className="section-kicker">Méthode</p>
        <ol className="mt-3 grid gap-2 text-sm theme-text-muted">
          <li>1. Call de cadrage et définition du scope.</li>
          <li>2. Pilote rapide avec critères de succès mesurables.</li>
          <li>3. Durcissement prod + observabilité.</li>
          <li>4. Documentation et transfert d&apos;équipe.</li>
        </ol>
      </section>

      <section id="request" className="mt-8 scroll-mt-28">
        <div className="mb-4">
          <p className="section-kicker">Demande projet</p>
          <h2 className="section-title">Décrivez ce que vous voulez livrer</h2>
        </div>
        <ServiceLeadForm locale="fr" source="services_page_fr" />
      </section>
    </main>
  );
}
