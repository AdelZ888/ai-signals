import type { Metadata } from "next";
import Link from "next/link";

import { ServiceLeadForm } from "@/components/service-lead-form";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const bookingUrl = process.env.NEXT_PUBLIC_SERVICES_BOOKING_URL || process.env.SERVICES_BOOKING_URL || "";

const offers = [
  {
    name: "AI Foundation Sprint",
    timeline: "2 weeks",
    fit: "Best for teams that need a sharp plan and first production win.",
    price: "From $6k",
    bullets: [
      "Workflow prioritization by ROI",
      "Target architecture and tool stack",
      "1 production-ready workflow shipped",
      "Risk map and rollout plan",
    ],
  },
  {
    name: "Agent Build Program",
    timeline: "4 to 8 weeks",
    fit: "Best for teams shipping customer-facing or internal agent workflows.",
    price: "From $18k",
    bullets: [
      "End-to-end implementation",
      "Evaluation harness and quality gates",
      "Guardrails, observability, fallback paths",
      "Handoff docs and team training",
    ],
  },
  {
    name: "Scale and Reliability",
    timeline: "Ongoing",
    fit: "Best for teams already live and needing better reliability and economics.",
    price: "Retainer",
    bullets: [
      "Latency and cost optimization",
      "Regression prevention and release checks",
      "Incident playbooks and runbooks",
      "Roadmap advisory with product leaders",
    ],
  },
];

const outcomes = [
  {
    metric: "-62%",
    label: "Manual support workload",
    detail: "Representative outcome for AI-assisted support triage and reply drafting.",
  },
  {
    metric: "4.1x",
    label: "Faster time-to-first prototype",
    detail: "By structuring delivery in short, validated build slices.",
  },
  {
    metric: "<12 min",
    label: "Median incident triage time",
    detail: "After adding quality gates, traces, and runbooks.",
  },
];

const testimonials = [
  {
    quote:
      "They turned our AI roadmap from a slide deck into a production system with clear KPIs in under six weeks.",
    role: "Head of Product, B2B SaaS (UK)",
  },
  {
    quote:
      "We stopped guessing. Every prompt and model change now ships behind evals and rollback controls.",
    role: "CTO, Fintech Scale-up (France)",
  },
  {
    quote:
      "Strong execution quality. The handoff was clean and our internal team can run it without external dependency.",
    role: "VP Engineering, Marketplace (US)",
  },
];

const faqs = [
  {
    q: "How fast can we start?",
    a: "Usually within 7 to 10 days depending on scope. If it is urgent, we can prioritize a compact sprint.",
  },
  {
    q: "Do you work with existing stack choices?",
    a: "Yes. We work with your current LLM providers, orchestration tools, and deployment platform unless a migration is clearly justified.",
  },
  {
    q: "Can you help without replacing our team?",
    a: "Yes. The default mode is co-build: we ship with your team and transfer ownership through documentation, training, and release routines.",
  },
  {
    q: "What makes projects fail most often?",
    a: "Missing eval gates, vague success metrics, and no rollback strategy. We enforce all three from day one.",
  },
  {
    q: "Do you support US, UK, and French teams?",
    a: "Yes. The service workflow and reporting is designed for multi-region teams.",
  },
  {
    q: "What happens after I submit the form?",
    a: "You get a reply within 24h with fit assessment, suggested scope, timeline options, and next call slots.",
  },
];

export const metadata: Metadata = {
  title: "Services",
  description: "AI implementation services for startups and product teams: strategy, build, and operational handoff.",
  alternates: {
    canonical: "/services",
    languages: {
      "en-US": "/services",
      "fr-FR": "/fr/services",
    },
  },
  openGraph: {
    type: "website",
    title: "AI Services | AI Signals",
    description: "Deploy production AI workflows with a focused delivery team.",
    url: "/services",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "AI Services",
          subtitle: "Strategy, build, and handoff for production AI systems.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "AI Services | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Services | AI Signals",
    description: "Deploy production AI workflows with a focused delivery team.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "AI Services",
        subtitle: "Strategy, build, and handoff for production AI systems.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default function ServicesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "AI consulting and implementation",
    provider: {
      "@type": "Organization",
      name: "AI Signals",
      url: siteUrl,
    },
    areaServed: ["US", "UK", "FR"],
    url: `${siteUrl}/services`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      description: "AI implementation services for product and engineering teams.",
    },
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero-shell motion-enter">
        <div className="hero-grid">
          <p className="hero-kicker">Services</p>
          <h1 className="hero-title">Ship AI that actually survives production</h1>
          <p className="hero-subtitle">
            We partner with startups and product teams to design, build, and operationalize AI workflows with real reliability, measurable value, and full team handoff.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#request">
              Get a scoped plan
            </a>
            {bookingUrl ? (
              <a className="hero-cta hero-cta-secondary" href={bookingUrl} target="_blank" rel="noreferrer">
                Book a call
              </a>
            ) : null}
            <Link className="hero-cta hero-cta-tertiary" href="/newsletter">
              See how we think
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="aside-card">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Speed</p>
              <p className="mt-2 text-xl font-black tracking-tight">7-10 days</p>
              <p className="mt-1 text-sm theme-text-muted">Typical kickoff window</p>
            </div>
            <div className="aside-card">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Focus</p>
              <p className="mt-2 text-xl font-black tracking-tight">US / UK / FR</p>
              <p className="mt-1 text-sm theme-text-muted">Cross-region delivery context</p>
            </div>
            <div className="aside-card">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Response</p>
              <p className="mt-2 text-xl font-black tracking-tight">&lt; 24h</p>
              <p className="mt-1 text-sm theme-text-muted">On qualified requests</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <p className="section-kicker">Packages</p>
          <h2 className="section-title">Choose the engagement style</h2>
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
          <p className="section-kicker">Best fit</p>
          <ul className="mt-3 grid gap-2 text-sm theme-text-muted">
            <li>1. You want measurable business outcomes, not a generic AI demo.</li>
            <li>2. You can allocate product + engineering ownership internally.</li>
            <li>3. You value quality gates, observability, and release discipline.</li>
          </ul>
        </article>
        <article className="aside-card motion-card motion-enter motion-delay-4">
          <p className="section-kicker">Not a fit</p>
          <ul className="mt-3 grid gap-2 text-sm theme-text-muted">
            <li>1. You need instant hype content with no implementation work.</li>
            <li>2. You cannot assign one decision-maker for scope and rollout.</li>
            <li>3. You want to skip evaluation and reliability safeguards.</li>
          </ul>
        </article>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Representative outcomes</p>
          <h2 className="section-title">Performance we aim to deliver</h2>
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
        <p className="mt-3 text-xs theme-text-faint">Results vary by baseline. Numbers above are anonymized, representative project outcomes.</p>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Client feedback</p>
          <h2 className="section-title">What teams say after delivery</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article key={item.role} className={`aside-card motion-card motion-enter motion-delay-${Math.min(index + 5, 8)}`}>
              <p className="text-sm leading-relaxed theme-text-muted">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300">{item.role}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs theme-text-faint">Names are withheld under NDA. We share references during live discussions when available.</p>
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
          <p className="section-kicker">Project request</p>
          <h2 className="section-title">Tell us what you want to ship next quarter</h2>
          <p className="mt-2 text-sm theme-text-muted">
            The more specific your business objective and constraints, the faster we can send a useful scope.
          </p>
        </div>
        <ServiceLeadForm locale="en" source="services_page_en" />
      </section>
    </main>
  );
}
