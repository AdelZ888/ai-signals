"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "";

/** Renders nothing until AdSense is configured. Never place it above the key stats. */
export function AdSlot({ minHeight = 250 }: { minHeight?: number }) {
  useEffect(() => {
    if (!CLIENT || !SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked by the browser */
    }
  }, []);

  if (!CLIENT || !SLOT) return null;
  return (
    <div className="ad-slot" style={{ minHeight }}>
      <ins className="adsbygoogle" style={{ display: "block", minHeight }} data-ad-client={CLIENT} data-ad-slot={SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
