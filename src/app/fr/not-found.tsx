import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="card-frame motion-enter">
        <div className="rounded-2xl border theme-border theme-surface p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">404</p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight">Page introuvable</h1>
          <p className="mt-3 text-sm theme-text-faint">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/fr" className="hero-cta hero-cta-primary">
              Accueil
            </Link>
            <Link href="/fr/news" className="hero-cta hero-cta-secondary">
              Actualités
            </Link>
            <Link href="/fr/search" className="hero-cta hero-cta-tertiary">
              Recherche
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

