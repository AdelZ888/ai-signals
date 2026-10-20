"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type Params = Record<string, string | number | boolean>;

/** No-op until the GA bootstrap has run (no measurement ID, blocked, or server render). Page views are automatic. */
export function track(name: string, params: Params = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** Sends a `search` event once the visitor stops typing. */
export function useSearchTracking(query: string, context: string): void {
  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return;
    const timer = window.setTimeout(() => track("search", { search_term: term, search_context: context }), 1500);
    return () => window.clearTimeout(timer);
  }, [query, context]);
}
