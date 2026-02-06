import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A propos",
  description: "Mission editoriale et principes de qualite de AI Signals.",
};

export default function AboutFrPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-black tracking-tight motion-enter">A propos de AI Signals</h1>
      <p className="mt-4 theme-text-muted motion-enter motion-delay-2">
        AI Signals est une publication automatisee axee sur la pratique: sorties de modeles, workflows d&apos;agents, tutoriels et analyses de marche.
      </p>

      <section className="mt-8 space-y-3 motion-enter motion-delay-4">
        <h2 className="text-2xl font-bold">Politique editoriale</h2>
        <p className="theme-text-muted">Chaque article contient au moins une source. Les affirmations doivent etre liees aux references citees.</p>
        <p className="theme-text-muted">Les articles sont mis a jour au fil des changements ecosysteme.</p>
      </section>
    </main>
  );
}
