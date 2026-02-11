import type { Metadata } from "next";

import { ServiceLeadForm } from "@/components/service-lead-form";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const bookingUrl = process.env.NEXT_PUBLIC_SERVICES_BOOKING_URL || process.env.SERVICES_BOOKING_URL || "";

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
          <h1 className="hero-title">From AI ideas to shipped systems</h1>
          <p className="hero-subtitle">
            We help founders and product teams implement reliable AI workflows: discovery, build, evaluation, observability, and operational handoff.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#request">
              Start a project
            </a>
            {bookingUrl ? (
              <a className="hero-cta hero-cta-secondary" href={bookingUrl} target="_blank" rel="noreferrer">
                Book a call
              </a>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="hero-chip">US / UK / FR</span>
            <span className="hero-chip">Hands-on delivery</span>
            <span className="hero-chip">Fast pilot to production</span>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="aside-card motion-card motion-enter motion-delay-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Sprint</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">AI Foundation Sprint</h2>
          <p className="mt-2 text-sm theme-text-muted">2 weeks to scope highest-ROI workflows, define architecture, and ship the first production slice.</p>
        </article>
        <article className="aside-card motion-card motion-enter motion-delay-2">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Build</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">Agent Workflow Build</h2>
          <p className="mt-2 text-sm theme-text-muted">
            End-to-end implementation: orchestration, eval gates, guardrails, data quality checks, dashboards, and rollback paths.
          </p>
        </article>
        <article className="aside-card motion-card motion-enter motion-delay-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Enablement</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">Team Handoff</h2>
          <p className="mt-2 text-sm theme-text-muted">
            Playbooks and coaching for product, engineering, and operations so your team can own and scale the system.
          </p>
        </article>
      </section>

      <section className="mt-8 aside-card motion-card motion-enter motion-delay-4">
        <p className="section-kicker">How we work</p>
        <ol className="mt-3 grid gap-2 text-sm theme-text-muted">
          <li>1. Discovery call and scope definition.</li>
          <li>2. Fast pilot with measurable success criteria.</li>
          <li>3. Production hardening and observability setup.</li>
          <li>4. Documentation and team transfer.</li>
        </ol>
      </section>

      <section id="request" className="mt-8 scroll-mt-28">
        <div className="mb-4">
          <p className="section-kicker">Project request</p>
          <h2 className="section-title">Tell us what you want to ship</h2>
        </div>
        <ServiceLeadForm locale="en" source="services_page_en" />
      </section>
    </main>
  );
}
