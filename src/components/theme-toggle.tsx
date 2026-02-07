"use client";

import { useSyncExternalStore } from "react";

import type { Locale } from "@/lib/i18n";

type Theme = "light" | "dark";

const THEME_EVENT = "aisignals-theme-change";

function readThemeFromDom(): Theme {
  if (typeof document === "undefined") return "dark";
  const current = document.documentElement.getAttribute("data-theme");
  return current === "light" ? "light" : "dark";
}

function emitThemeChange() {
  try {
    window.dispatchEvent(new Event(THEME_EVENT));
  } catch {
    // ignore
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(theme === "light" ? "theme-light" : "theme-dark");

  if (document.body) {
    document.body.setAttribute("data-theme", theme);
  }

  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures and still apply theme for this session.
  }

  emitThemeChange();
}

function subscribeTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === "theme") onStoreChange();
  };
  const onCustom = () => onStoreChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onCustom);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onCustom);
  };
}

export function ThemeToggle({ locale = "en" }: { locale?: Locale }) {
  const theme = useSyncExternalStore(subscribeTheme, readThemeFromDom, () => "dark");

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  const isLight = theme === "light";
  const next = isLight ? "dark" : "light";
  const label = locale === "fr" ? (isLight ? "Clair" : "Sombre") : isLight ? "Light" : "Dark";
  const title = locale === "fr" ? `Passer en mode ${next === "light" ? "clair" : "sombre"}` : `Switch to ${next}`;
  const ariaLabel = locale === "fr" ? `Thème: ${label}. Basculer.` : `Theme: ${label}. Toggle.`;

  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label={ariaLabel} title={title}>
      <span className="theme-toggle-icon" aria-hidden="true">
        {isLight ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M4.93 19.07l1.41-1.41" />
            <path d="M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 13.2A8.2 8.2 0 1 1 10.8 3a6.5 6.5 0 1 0 10.2 10.2Z" />
          </svg>
        )}
      </span>
      <span className="theme-toggle-text">{label}</span>
    </button>
  );
}
