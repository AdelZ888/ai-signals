"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { NewsletterCta } from "@/components/newsletter-cta";
import { getLocaleFromPathname } from "@/lib/i18n";

const STORAGE_KEY = "aisignals_subscribe_modal_v1";
const COOLDOWN_DAYS = 7;

function cooldownMs() {
  return COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

function canShowNow(): boolean {
  try {
    const last = Number(localStorage.getItem(STORAGE_KEY) || "0");
    if (!Number.isFinite(last) || last <= 0) return true;
    return Date.now() - last > cooldownMs();
  } catch {
    return true;
  }
}

function markShown() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function ExitSubscribe() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const [isOpen, setIsOpen] = useState(false);

  const copy = useMemo(() => {
    return locale === "fr"
      ? {
          title: "Recevoir le digest hebdo",
          body: "Une fois par semaine. Sans bruit. Des choses a shipper.",
          close: "Fermer",
        }
      : {
          title: "Get the weekly digest",
          body: "Once a week. No noise. Stuff you can ship.",
          close: "Close",
        };
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't pop the modal on dedicated newsletter pages.
    if (pathname === "/newsletter" || pathname.startsWith("/newsletter/")) return;
    if (pathname === "/fr/newsletter" || pathname.startsWith("/fr/newsletter/")) return;

    if (!canShowNow()) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 10_000);

    const open = () => {
      if (isOpen) return;
      if (!armed) return;
      markShown();
      setIsOpen(true);
    };

    const onMouseLeave = (e: MouseEvent) => {
      // Desktop exit intent: cursor leaves near the top.
      if ((e.clientY ?? 0) <= 0) open();
    };

    const onScroll = () => {
      // Mobile intent: show late in the read.
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const progress = doc.scrollTop / max;
      if (progress > 0.72) open();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(armTimer);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, pathname]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl border theme-border theme-surface p-4 shadow-2xl motion-enter">
        <div className="flex items-start justify-between gap-4 px-2 pt-2">
          <div>
            <p className="text-lg font-black tracking-tight">{copy.title}</p>
            <p className="mt-1 text-sm theme-text-muted">{copy.body}</p>
          </div>
          <button
            type="button"
            className="rounded-lg border theme-border-soft theme-surface px-3 py-2 text-xs font-bold theme-text-soft transition hover:border-cyan-300 hover:text-cyan-300"
            onClick={() => setIsOpen(false)}
          >
            {copy.close}
          </button>
        </div>

        <div className="mt-4 px-2 pb-2">
          <NewsletterCta locale={locale} variant="inline" />
        </div>
      </div>
    </div>
  );
}

