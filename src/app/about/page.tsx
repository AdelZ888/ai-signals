import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Editorial policy and mission of AI Signals.",
  alternates: {
    canonical: "/about",
    languages: {
      "en-US": "/about",
      "fr-FR": "/fr/about",
    },
  },
  openGraph: {
    type: "website",
    title: "About AI Signals",
    description: "Editorial policy and mission of AI Signals.",
    url: "/about",
    images: [
      {
        url: `/api/og?${new URLSearchParams({
          title: "About",
          subtitle: "Mission and editorial policy.",
          locale: "en",
          kind: "page",
        }).toString()}`,
        width: 1200,
        height: 630,
        alt: "About | AI Signals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AI Signals",
    description: "Editorial policy and mission of AI Signals.",
    images: [
      `/api/og?${new URLSearchParams({
        title: "About",
        subtitle: "Mission and editorial policy.",
        locale: "en",
        kind: "page",
      }).toString()}`,
    ],
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-black tracking-tight motion-enter">About AI Signals</h1>
      <p className="mt-4 theme-text-muted motion-enter motion-delay-2">
        AI Signals is an automated publication focused on practical AI coverage: model releases, agent workflows,
        tutorials, and ecosystem shifts.
      </p>

      <section className="mt-8 space-y-3 motion-enter motion-delay-4">
        <h2 className="text-2xl font-bold">Editorial policy</h2>
        <p className="theme-text-muted">Each article includes at least one source URL. News claims should map to cited sources.</p>
        <p className="theme-text-muted">Posts are updated as information changes, with publication dates visible in each article.</p>
      </section>
    </main>
  );
}
