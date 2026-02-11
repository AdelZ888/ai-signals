import type { Metadata } from "next";
import Link from "next/link";

import { ServiceLeadForm } from "@/components/service-lead-form";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const bookingUrl = process.env.NEXT_PUBLIC_SERVICES_BOOKING_URL || process.env.SERVICES_BOOKING_URL || "";

const offers = [
  {
    name: "Sprint fondation IA",
    timeline: "2 semaines",
    fit: "Idéal pour les équipes qui veulent un plan clair et un premier résultat en production.",
    price: "À partir de 6k EUR",
    bullets: [
      "Priorisation des workflows selon le ROI",
      "Architecture cible et stack recommandée",
      "1 workflow prêt prod livré",
      "Cartographie des risques + plan de déploiement",
    ],
  },
  {
    name: "Programme build agentique",
    timeline: "4 à 8 semaines",
    fit: "Idéal pour les équipes qui livrent des workflows agents internes ou orientés client.",
    price: "À partir de 18k EUR",
    bullets: [
      "Implémentation de bout en bout",
      "Harness d'évaluation et quality gates",
      "Guardrails, observabilité, fallback",
      "Documentation de transfert + training équipe",
    ],
  },
  {
    name: "Scale et fiabilité",
    timeline: "Continu",
    fit: "Idéal pour les équipes déjà live qui veulent optimiser coût, latence et robustesse.",
    price: "Retainer",
    bullets: [
      "Optimisation latence et coûts",
      "Prévention de régressions et checks release",
      "Runbooks incidents et exploitation",
      "Advisory roadmap avec leadership produit",
    ],
  },
];

const outcomes = [
  {
    metric: "-62%",
    label: "Charge support manuelle",
    detail: "Résultat représentatif sur des workflows IA de triage et préparation de réponse.",
  },
  {
    metric: "4.1x",
    label: "Vitesse de prototypage",
    detail: "Grâce à un delivery découpé en slices validées.",
  },
  {
    metric: "<12 min",
    label: "Temps médian de triage incident",
    detail: "Après ajout de quality gates, traces et runbooks.",
  },
];

const testimonials = [
  {
    quote:
      "L'équipe a transformé notre roadmap IA en système réellement exploitable, avec des KPIs clairs en quelques semaines.",
    role: "Head of Product, B2B SaaS (UK)",
  },
  {
    quote:
      "On a arrêté de deviner. Chaque changement prompt/modèle passe maintenant avec des evals et des contrôles de rollback.",
    role: "CTO, Fintech Scale-up (France)",
  },
  {
    quote:
      "Exécution solide. Le transfert était propre et notre équipe interne peut opérer le système sans dépendance externe.",
    role: "VP Engineering, Marketplace (US)",
  },
];

const faqs = [
  {
    q: "En combien de temps peut-on démarrer ?",
    a: "En général sous 7 à 10 jours selon le scope. En urgence, on peut prioriser un sprint compact.",
  },
  {
    q: "Vous travaillez avec notre stack actuelle ?",
    a: "Oui. On s'intègre à vos providers LLM, outils d'orchestration et plateforme de déploiement, sauf si une migration est vraiment justifiée.",
  },
  {
    q: "Pouvez-vous travailler avec notre équipe plutôt qu'à sa place ?",
    a: "Oui. Le mode standard est co-build: delivery commun puis transfert complet via docs, training et routines de release.",
  },
  {
    q: "Pourquoi les projets IA échouent le plus souvent ?",
    a: "Absence d'evals, critères de succès flous et aucun plan de rollback. On sécurise ces points dès le premier sprint.",
  },
  {
    q: "Vous couvrez bien US, UK et France ?",
    a: "Oui. Le process de delivery et le reporting sont pensés pour les équipes multi-régions.",
  },
  {
    q: "Que se passe-t-il après l'envoi du formulaire ?",
    a: "Réponse sous 24h avec fit assessment, proposition de scope, options de timeline et créneaux d'appel.",
  },
];

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
          <h1 className="hero-title">Livrez de l&apos;IA qui tient en production</h1>
          <p className="hero-subtitle">
            Nous accompagnons les startups et équipes produit pour concevoir, build et opérer des workflows IA robustes avec impact business mesurable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#request">
              Obtenir un plan chiffré
            </a>
            {bookingUrl ? (
              <a className="hero-cta hero-cta-secondary" href={bookingUrl} target="_blank" rel="noreferrer">
                Réserver un call
              </a>
            ) : null}
            <Link className="hero-cta hero-cta-tertiary" href="/fr/newsletter">
              Voir notre approche
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="aside-card">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Vitesse</p>
              <p className="mt-2 text-xl font-black tracking-tight">7-10 jours</p>
              <p className="mt-1 text-sm theme-text-muted">Délai de démarrage typique</p>
            </div>
            <div className="aside-card">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Contexte</p>
              <p className="mt-2 text-xl font-black tracking-tight">US / UK / FR</p>
              <p className="mt-1 text-sm theme-text-muted">Delivery multi-régions</p>
            </div>
            <div className="aside-card">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Réponse</p>
              <p className="mt-2 text-xl font-black tracking-tight">&lt; 24h</p>
              <p className="mt-1 text-sm theme-text-muted">Sur les demandes qualifiées</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <p className="section-kicker">Packages</p>
          <h2 className="section-title">Choisir le format d&apos;engagement</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer, index) => (
            <article key={offer.name} className={`aside-card motion-card motion-enter motion-delay-${Math.min(index + 1, 8)}`}>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">{offer.timeline}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight">{offer.name}</h3>
              <p className="mt-1 text-sm text-amber-300">{offer.price}</p>
              <p className="mt-2 text-sm theme-text-muted">{offer.fit}</p>
              <ul className="mt-4 grid gap-2 text-sm theme-text-muted">
                {offer.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-2 inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="aside-card motion-card motion-enter motion-delay-3">
          <p className="section-kicker">Bon fit</p>
          <ul className="mt-3 grid gap-2 text-sm theme-text-muted">
            <li>1. Vous cherchez un impact business mesurable, pas une démo gadget.</li>
            <li>2. Vous pouvez mobiliser un owner produit + engineering.</li>
            <li>3. Vous valorisez evals, observabilité et discipline de release.</li>
          </ul>
        </article>
        <article className="aside-card motion-card motion-enter motion-delay-4">
          <p className="section-kicker">Mauvais fit</p>
          <ul className="mt-3 grid gap-2 text-sm theme-text-muted">
            <li>1. Vous voulez du contenu hype sans implémentation réelle.</li>
            <li>2. Aucun décideur n&apos;est disponible pour piloter le scope.</li>
            <li>3. Vous ne souhaitez pas de quality gates ni de fallback.</li>
          </ul>
        </article>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Résultats représentatifs</p>
          <h2 className="section-title">Performance visée en delivery</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {outcomes.map((item, index) => (
            <article key={item.label} className={`aside-card motion-card motion-enter motion-delay-${Math.min(index + 4, 8)}`}>
              <p className="text-3xl font-black tracking-tight text-cyan-300">{item.metric}</p>
              <p className="mt-2 font-bold">{item.label}</p>
              <p className="mt-2 text-sm theme-text-muted">{item.detail}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs theme-text-faint">
          Les résultats varient selon le contexte de départ. Les chiffres sont anonymisés et représentatifs.
        </p>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Retours clients</p>
          <h2 className="section-title">Ce que disent les équipes après delivery</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article key={item.role} className={`aside-card motion-card motion-enter motion-delay-${Math.min(index + 5, 8)}`}>
              <p className="text-sm leading-relaxed theme-text-muted">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300">{item.role}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs theme-text-faint">Noms masqués pour NDA. Références partagées en call quand disponible.</p>
      </section>

      <section className="mt-8 aside-card motion-card motion-enter motion-delay-6">
        <p className="section-kicker">FAQ</p>
        <div className="mt-3 grid gap-2">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-xl border theme-border p-3">
              <summary className="cursor-pointer text-sm font-bold theme-text-soft">{faq.q}</summary>
              <p className="mt-2 text-sm theme-text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="request" className="mt-8 scroll-mt-28">
        <div className="mb-4">
          <p className="section-kicker">Demande projet</p>
          <h2 className="section-title">Décrivez ce que vous voulez livrer au prochain trimestre</h2>
          <p className="mt-2 text-sm theme-text-muted">
            Plus l&apos;objectif business et les contraintes sont précis, plus notre proposition est utile dès la première réponse.
          </p>
        </div>
        <ServiceLeadForm locale="fr" source="services_page_fr" />
      </section>
    </main>
  );
}
