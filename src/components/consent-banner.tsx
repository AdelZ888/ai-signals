"use client";

import { useSyncExternalStore } from "react";

import { CONSENT_KEY, consentUpdate, needsConsentPrompt, parseConsent, type Consent } from "@/lib/site/analytics";

const listeners = new Set<() => void>();
let reopened = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function isOpen(): boolean {
  if (reopened) return true;
  try {
    if (parseConsent(window.localStorage.getItem(CONSENT_KEY))) return false;
  } catch {
    return false;
  }
  return needsConsentPrompt(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");
}

/** Withdrawing consent must also remove the cookies GA already set, on the host and the parent domain. */
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of document.cookie.split(";").map((c) => c.trim().split("=")[0])) {
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/** On grant, gtag itself links the earlier cookieless hits to the new client ID (ga_temp_client_id). */
function choose(choice: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  window.gtag?.("consent", "update", consentUpdate(choice));
  if (choice === "denied") clearAnalyticsCookies();
  reopened = false;
  emit();
}

export function openConsentSettings() {
  reopened = true;
  emit();
}

/** Shown to European visitors until they choose; both buttons carry the same weight, as the CNIL requires. */
export function ConsentBanner({ enabled }: { enabled: boolean }) {
  const open = useSyncExternalStore(subscribe, isOpen, () => false);
  if (!enabled || !open) return null;
  return (
    <div className="consent" role="dialog" aria-label="Cookie consent">
      <p>
        <span className="dim">$ cookies --ask</span><br />
        We would like to use Google Analytics cookies to count visits and see which pages are useful. Nothing else, no ads. You can change your mind any time from the footer.
      </p>
      <div>
        <button type="button" className="btn" onClick={() => choose("granted")}>accept</button>
        <button type="button" className="btn" onClick={() => choose("denied")}>reject</button>
      </div>
    </div>
  );
}

export function ConsentSettingsLink() {
  return <button type="button" className="linkish" onClick={openConsentSettings}>cookie settings</button>;
}
