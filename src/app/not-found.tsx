import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="card-frame motion-enter">
        <div className="rounded-2xl border theme-border theme-surface p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">404</p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight">Page not found</h1>
          <p className="mt-3 text-sm theme-text-faint">
            The page you are looking for does not exist or was moved.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="hero-cta hero-cta-primary">
              Home
            </Link>
            <Link href="/news" className="hero-cta hero-cta-secondary">
              Latest news
            </Link>
            <Link href="/search" className="hero-cta hero-cta-tertiary">
              Search
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

