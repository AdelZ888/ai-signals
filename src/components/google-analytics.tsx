"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleAnalyticsProps = {
  measurementId?: string;
};

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    // SPA navigation: report page views on route changes.
    window.gtag("config", measurementId, { page_path: pathname });
  }, [measurementId, pathname]);

  return null;
}
