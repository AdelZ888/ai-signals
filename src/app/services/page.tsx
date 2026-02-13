import type { Metadata } from "next";
import Link from "next/link";

import { ServiceLeadForm } from "@/components/service-lead-form";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const bookingUrl = process.env.NEXT_PUBLIC_SERVICES_BOOKING_URL || process.env.SERVICES_BOOKING_URL || "";

const offers = [
  {
    name: "Starter Automation Pack",
    price: "$990",
    timeline: "Delivered in 7 days",
    fit: "For solo founders and tiny teams who want quick wins.",
    bullets: [
      "2 useful automations set up for your current tools",
      "Simple SOP so you can run it without us",
      "One optimization pass after launch",
    ],
  },
  {
    name: "Growth Content Pack",
    price: "$1,490",
    timeline: "Delivered in 10 days",
    fit: "For teams that need consistent traffic and content output.",
    bullets: [
      "Workflow from idea to published article",
      "Basic SEO structure + internal linking setup",
      "Weekly content operating checklist",
    ],
  },
  {
    name: "Ops Time-Saver Pack",
    price: "$1,990",
    timeline: "Delivered in 14 days",
    fit: "For agencies and small teams drowning in repetitive tasks.",
    bullets: [
      "3-5 automations (support, admin, reporting, CRM)",
      "Tool integration (Notion, Sheets, Gmail, Slack, Zapier/Make)",
      "1h team training call included",
    ],
  },
  {
    name: "Monthly AI Support",
    price: "$390/mo",
    timeline: "Ongoing",
    fit: "For teams that want calm maintenance and steady upgrades.",
    bullets: [
      "Monitoring + fixes + small improvements",
      "Priority support channel",
      "1 strategy call every month",
    ],
  },
];

const useCases = [
  {
    title: "Lead handling",
    detail: "Auto-qualify inbound leads and send clean follow-ups instead of manual copy/paste.",
  },
  {
    title: "Customer support",
    detail: "Draft answers and tag tickets so your team handles more requests in less time.",
  },
  {
    title: "Content workflow",
    detail: "Turn weekly ideas into published posts without blocking your whole team.",
  },
  {
    title: "Admin and reporting",
    detail: "Generate recurring reports and internal updates automatically every week.",
  },
];

const outcomes = [
  {
    metric: "-8h/week",
    label: "Manual work saved",
    detail: "Typical result after replacing repetitive admin tasks.",
  },
  {
    metric: "2x",
    label: "Content output",
    detail: "When a simple publish workflow is in place.",
  },
  {
    metric: "<14 days",
    label: "Time to value",
    detail: "For most small-team projects with clear scope.",
  },
];

const testimonials = [
  {
    quote:
      "We are a 4-person team and had zero process. In one week we got automations that immediately saved us time.",
    role: "Founder, Ecommerce brand (4 people)",
  },
  {
    quote:
      "No technical jargon, just execution. They mapped what was wasting time and fixed it fast.",
    role: "Agency owner (8 people)",
  },
  {
    quote:
      "This was the first AI project that felt practical, not experimental. My team uses it every day.",
    role: "Operations lead, SaaS startup (12 people)",
  },
];

const faqs = [
  {
    q: "I am not technical. Is that a problem?",
    a: "No. This is built for non-technical founders and small teams. We keep setup and handoff very simple.",
  },
  {
    q: "Do I need a senior developer in my team?",
    a: "No. Most clients do not have one. We set up practical systems with your existing tools.",
  },
  {
    q: "Can you work with tools I already use?",
    a: "Yes. We usually work with Notion, Google Sheets, Gmail, Slack, Zapier, Make, and common CRMs.",
  },
  {
    q: "How quickly will I see results?",
    a: "Most clients see first results in 7-14 days when scope is clear.",
  },
  {
    q: "What happens after I submit the form?",
    a: "You get a response within 24h with a simple plan, price range, and next steps.",
  },
];

export const metadata: Metadata = {
  title: "Services",
  description: "Simple AI automation services for solo founders and small teams.",
  alternates: {
    canonical: "/services",
    languages: {
      "en-US": "/services",
      "fr-FR": "/fr/services",
    },
  },
  openGraph: {
    type: "website",
    title: "AI Services for Small Teams | AI Signals",
    description: "Practical AI automations with fixed-price packs and fast delivery.",
    url: "/services",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "AI Services",
          subtitle: "Simple automation packs for solo founders and small teams.",
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
    title: "AI Services for Small Teams | AI Signals",
    description: "Practical AI automations with fixed-price packs and fast delivery.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "AI Services",
        subtitle: "Simple automation packs for solo founders and small teams.",
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
    serviceType: "AI automation services for small businesses",
    provider: {
      "@type": "Organization",
      name: "AI Signals",
      url: siteUrl,
    },
    areaServed: ["US", "UK", "FR"],
    url: `${siteUrl}/services`,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero-shell motion-enter">
        <div className="hero-grid">
          <p className="hero-kicker">Services</p>
          <h1 className="hero-title">AI automations for small teams, without the complexity</h1>
          <p className="hero-subtitle">
            If you vibe-code and run a small business, we help you automate repetitive work, ship faster, and keep things simple.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="hero-cta hero-cta-primary" href="#request">
              Get my action plan
            </a>
            {bookingUrl ? (
              <a className="hero-cta hero-cta-secondary" href={bookingUrl} target="_blank" rel="noreferrer">
                Book a quick call
              </a>
            ) : null}
            <Link className="hero-cta hero-cta-tertiary" href="/start-here">
              Start here first
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="hero-chip">No senior dev required</span>
            <span className="hero-chip">Fixed-price packs</span>
            <span className="hero-chip">First results in 7-14 days</span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <p className="section-kicker">Offers</p>
          <h2 className="section-title">Simple packages you can choose today</h2>
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
          <p className="section-kicker">Use cases</p>
          <h2 className="section-title">Where we usually help first</h2>
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
          <p className="section-kicker">Typical outcomes</p>
          <h2 className="section-title">What clients usually see</h2>
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
        <p className="mt-3 text-xs theme-text-faint">These are representative outcomes and may vary by starting point.</p>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="section-kicker">Feedback</p>
          <h2 className="section-title">From small teams we helped</h2>
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
          <p className="section-kicker">Project request</p>
          <h2 className="section-title">Tell us your goal, we send a clear plan in 24h</h2>
          <p className="mt-2 text-sm theme-text-muted">
            Keep it simple. Tell us what takes too much time today, and what result you want.
          </p>
        </div>
        <ServiceLeadForm locale="en" source="services_page_en" />
      </section>
    </main>
  );
}
