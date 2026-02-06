import type { Locale } from "@/lib/i18n";

type NewsletterCtaProps = {
  locale?: Locale;
};

export function NewsletterCta({ locale = "en" }: NewsletterCtaProps) {
  const copy =
    locale === "fr"
      ? {
          kicker: "Brief Hebdo",
          title: "Recevez AI Signals par email",
          body: "Un digest clair chaque semaine: sorties de modeles, patterns d'agents et tutoriels pratiques.",
          placeholder: "vous@entreprise.com",
          cta: "S'abonner",
        }
      : {
          kicker: "Weekly Brief",
          title: "Get AI Signals by email",
          body: "One concise digest every week: model releases, agent patterns, and practical tutorials.",
          placeholder: "you@company.com",
          cta: "Join",
        };

  return (
    <section className="rounded-2xl border border-cyan-300/30 bg-linear-to-br from-cyan-500/10 to-amber-400/10 p-6 motion-card motion-enter motion-delay-5 motion-glow">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{copy.kicker}</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">{copy.title}</h3>
      <p className="mt-2 theme-text-muted">{copy.body}</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" action="#" method="post">
        <input
          type="email"
          placeholder={copy.placeholder}
          className="w-full rounded-lg border theme-border-soft theme-surface px-4 py-2 text-sm theme-text-soft outline-none ring-cyan-300 transition focus:ring"
        />
        <button className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-cyan-200">
          {copy.cta}
        </button>
      </form>
    </section>
  );
}
