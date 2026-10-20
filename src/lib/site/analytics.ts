/** Google Analytics 4: consent defaults, the stored consent choice and the pre-hydration bootstrap. */

export type Consent = "granted" | "denied";

export const CONSENT_KEY = "ais-consent";

/** Countries where Google tags start with consent denied: the EEA, the UK and Switzerland. */
export const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI",
  "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
];

const EUROPEAN_ZONES_OUTSIDE_EUROPE = new Set([
  "Arctic/Longyearbyen", "Asia/Famagusta", "Asia/Nicosia", "Atlantic/Azores", "Atlantic/Canary",
  "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik",
]);

/** The banner is shown to visitors in a European time zone, a client-side proxy for the consent regions. */
export function needsConsentPrompt(timeZone: string): boolean {
  return timeZone.startsWith("Europe/") || EUROPEAN_ZONES_OUTSIDE_EUROPE.has(timeZone);
}

export function parseConsent(value: string | null | undefined): Consent | null {
  return value === "granted" || value === "denied" ? value : null;
}

/** Accepting enables analytics only; ads need a certified CMP. Rejecting turns everything off, worldwide. */
export function consentUpdate(choice: Consent): Record<string, Consent> {
  if (choice === "granted") return { analytics_storage: "granted" };
  return { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
}

/**
 * Runs before hydration so consent is set before gtag.js loads. `config` sends the landing page_view; client-side
 * navigations are counted by GA4 enhanced measurement ("page changes based on browser history events"), which must
 * stay on. Never call `config` again for page views: a second one queued before gtag.js loads is dropped, and after
 * load it double-counts with enhanced measurement.
 */
export function gaBootstrap(measurementId: string): string {
  return [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)}, wait_for_update: 500 });`,
    "gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });",
    `try { var c = localStorage.getItem(${JSON.stringify(CONSENT_KEY)}); if (c === 'granted') gtag('consent', 'update', ${JSON.stringify(consentUpdate("granted"))}); if (c === 'denied') gtag('consent', 'update', ${JSON.stringify(consentUpdate("denied"))}); } catch (e) {}`,
    "gtag('js', new Date());",
    `gtag('config', ${JSON.stringify(measurementId)});`,
  ].join("\n");
}
