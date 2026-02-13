import type { Metadata } from "next";
import Link from "next/link";

import { ServiceLeadForm } from "@/components/service-lead-form";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const bookingUrl = process.env.NEXT_PUBLIC_SERVICES_BOOKING_URL || process.env.SERVICES_BOOKING_URL || "";

const offers = [
  {
    name: "Pack Démarrage IA",
    price: "990 EUR",
    timeline: "Livré en 7 jours",
    fit: "Pour solo founders et petites équipes qui veulent des gains rapides.",
    bullets: [
      "2 automatisations utiles sur vos outils actuels",
      "SOP simple pour rester autonome",
      "1 passe d'optimisation après lancement",
    ],
  },
  {
    name: "Pack Acquisition",
    price: "1 490 EUR",
    timeline: "Livré en 10 jours",
    fit: "Pour les équipes qui veulent plus de trafic et plus de contenu publié.",
    bullets: [
      "Workflow idée -> article -> publication",
      "Structure SEO de base + maillage interne",
      "Checklist hebdo d'exécution",
    ],
  },
  {
    name: "Pack Opérations",
    price: "1 990 EUR",
    timeline: "Livré en 14 jours",
    fit: "Pour agences et petites structures avec trop de tâches répétitives.",
    bullets: [
      "3 à 5 automatisations (support, admin, reporting, CRM)",
      "Intégration outils (Notion, Sheets, Gmail, Slack, Zapier/Make)",
      "1h de formation équipe incluse",
    ],
  },
  {
    name: "Support Mensuel",
    price: "390 EUR / mois",
    timeline: "En continu",
    fit: "Pour garder vos automatisations fiables et les faire évoluer sans stress.",
    bullets: [
      "Monitoring + corrections + petites améliorations",
      "Canal support prioritaire",
      "1 call stratégie par mois",
    ],
  },
];

const useCases = [
  {
    title: "Gestion des leads",
    detail: "Qualification automatique et relances propres au lieu de faire du copier/coller.",
  },
  {
    title: "Support client",
    detail: "Préparation de réponses et tri des demandes pour traiter plus vite.",
  },
  {
    title: "Production de contenu",
    detail: "Passer d'idées en vrac à des publications régulières sans y passer vos soirées.",
  },
  {
    title: "Admin et reporting",
    detail: "Rapports récurrents et updates internes générés automatiquement chaque semaine.",
  },
];

const outcomes = [
  {
    metric: "-8h/semaine",
    label: "Temps manuel économisé",
    detail: "Résultat typique après automatisation des tâches admin répétitives.",
  },
  {
    metric: "2x",
    label: "Volume de contenu",
    detail: "Quand le workflow de publication est structuré simplement.",
  },
  {
    metric: "<14 jours",
    label: "Délai avant résultats",
    detail: "Sur la majorité des projets petite structure avec scope clair.",
  },
];

const testimonials = [
  {
    quote:
      "Nous sommes 4 et on n'avait aucun process. En une semaine on a des automatisations qui nous font gagner un temps énorme.",
    role: "Fondatrice, marque e-commerce (4 personnes)",
  },
  {
    quote:
      "Zéro jargon. Ils ont identifié ce qui nous faisait perdre du temps et l'ont réglé rapidement.",
    role: "Dirigeant d'agence (8 personnes)",
  },
  {
    quote:
      "Premier projet IA vraiment utile pour notre quotidien, pas un test de labo.",
    role: "Responsable opérations, startup SaaS (12 personnes)",
  },
];

const faqs = [
  {
    q: "Je ne suis pas technique. C'est bloquant ?",
    a: "Non. L'offre est pensée pour fondateurs non-tech et petites équipes. On fait simple du début à la fin.",
  },
  {
    q: "Faut-il un développeur senior dans mon équipe ?",
    a: "Non. La plupart des clients n'en ont pas. On s'appuie sur vos outils actuels.",
  },
  {
    q: "Vous pouvez travailler avec mes outils existants ?",
    a: "Oui. On travaille souvent avec Notion, Google Sheets, Gmail, Slack, Zapier, Make et des CRM classiques.",
  },
  {
    q: "En combien de temps je vois des résultats ?",
    a: "Généralement entre 7 et 14 jours quand le besoin est clair.",
  },
  {
    q: "Que se passe-t-il après le formulaire ?",
    a: "Vous recevez une réponse sous 24h avec un plan simple, une fourchette de prix et les prochaines étapes.",
  },
];

export const metadata: Metadata = {
  title: "Services",
  description: "Services d'automatisation IA simples pour solo founders et petites équipes.",
  alternates: {
    canonical: "/fr/services",
    languages: {
      "en-US": "/services",
      "fr-FR": "/fr/services",
    },
  },
  openGraph: {
    type: "website",
    title: "Services IA pour petites équipes | AI Signals",
    description: "Automatisations IA concrètes, offres claires, livraison rapide.",
    url: "/fr/services",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "Services IA",
          subtitle: "Offres simples pour solo founders et petites équipes.",
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
    title: "Services IA pour petites équipes | AI Signals",
    description: "Automatisations IA concrètes, offres claires, livraison rapide.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "Services IA",
        subtitle: "Offres simples pour solo founders et petites équipes.",
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
    serviceType: "Services d'automatisation IA pour petites entreprises",
    provider: {
      "@type": "Organization",
      name: "AI Signals",
      url: siteUrl,
    },
    areaServed: ["US", "UK", "FR"],
    url: `${siteUrl}/fr/services`,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero-shell motion-enter">
        <div className="hero-grid">
          <p className="hero-kicker">Services</p>
          <h1 className="hero-title">Automatisations IA pour petites équipes, sans complexité</h1>
          <p className="hero-subtitle">
            Si vous vibe-codez et gérez une petite structure, on vous aide à automatiser le répétitif, livrer plus vite et rester simple.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#request">
              Obtenir mon plan d&apos;action
            </a>
            {bookingUrl ? (
              <a className="hero-cta hero-cta-secondary" href={bookingUrl} target="_blank" rel="noreferrer">
                Réserver un appel rapide
              </a>
            ) : null}
            <Link className="hero-cta hero-cta-tertiary" href="/fr/start-here">
              Commencer ici
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="hero-chip">Pas besoin de dev senior</span>
            <span className="hero-chip">Packs prix fixes</span>
            <span className="hero-chip">Premiers résultats en 7-14 jours</span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <p className="section-kicker">Offres</p>
          <h2 className="section-title">Des packs simples à choisir aujourd&apos;hui</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Cas d&apos;usage</p>
          <h2 className="section-title">Là où on aide en premier</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map((item, index) => (
            <article key={item.title} className={`aside-card motion-card motion-enter motion-delay-${Math.min(index + 3, 8)}`}>
              <h3 className="text-lg font-black tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm theme-text-muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Résultats typiques</p>
          <h2 className="section-title">Ce que les clients constatent souvent</h2>
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
        <p className="mt-3 text-xs theme-text-faint">Résultats représentatifs, variables selon le point de départ.</p>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Retours clients</p>
          <h2 className="section-title">Des petites équipes qu&apos;on a aidées</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article key={item.role} className={`aside-card motion-card motion-enter motion-delay-${Math.min(index + 5, 8)}`}>
              <p className="text-sm leading-relaxed theme-text-muted">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300">{item.role}</p>
            </article>
          ))}
        </div>
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
          <h2 className="section-title">Dites votre objectif, on répond avec un plan clair sous 24h</h2>
          <p className="mt-2 text-sm theme-text-muted">
            Restez simple: dites ce qui vous prend trop de temps aujourd&apos;hui et le résultat voulu.
          </p>
        </div>
        <ServiceLeadForm locale="fr" source="services_page_fr" />
      </section>
    </main>
  );
}
