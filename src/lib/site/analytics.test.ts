import { test } from "node:test";
import assert from "node:assert/strict";

import { CONSENT_KEY, consentUpdate, gaBootstrap, needsConsentPrompt, parseConsent } from "./analytics.ts";

type Call = unknown[];

function runBootstrap(stored: string | null): Call[] {
  const calls: Call[] = [];
  const window = { dataLayer: calls };
  const localStorage = { getItem: (key: string) => (key === CONSENT_KEY ? stored : null) };
  new Function("window", "dataLayer", "localStorage", gaBootstrap("G-TEST"))(window, calls, localStorage);
  return calls.map((args) => Array.from(args as ArrayLike<unknown>));
}

test("needsConsentPrompt covers European time zones only", () => {
  assert.equal(needsConsentPrompt("Europe/Paris"), true);
  assert.equal(needsConsentPrompt("Europe/London"), true);
  assert.equal(needsConsentPrompt("Atlantic/Canary"), true);
  assert.equal(needsConsentPrompt("Asia/Nicosia"), true);
  assert.equal(needsConsentPrompt("America/New_York"), false);
  assert.equal(needsConsentPrompt("Asia/Tokyo"), false);
  assert.equal(needsConsentPrompt(""), false);
});

test("parseConsent accepts only the two stored values", () => {
  assert.equal(parseConsent("granted"), "granted");
  assert.equal(parseConsent("denied"), "denied");
  assert.equal(parseConsent("yes"), null);
  assert.equal(parseConsent(null), null);
});

test("consentUpdate grants analytics only and denies everything on reject", () => {
  assert.deepEqual(consentUpdate("granted"), { analytics_storage: "granted" });
  assert.deepEqual(consentUpdate("denied"), {
    analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
});

test("gaBootstrap sets consent defaults, then a single config that sends the landing page view", () => {
  const calls = runBootstrap(null);
  assert.deepEqual(calls.map((c) => c[0]), ["consent", "consent", "js", "config"]);
  const regional = calls[0][2] as { analytics_storage: string; region: string[] };
  assert.equal(regional.analytics_storage, "denied");
  assert.ok(regional.region.includes("FR") && regional.region.includes("GB"));
  assert.deepEqual(calls[3], ["config", "G-TEST"]);
});

test("gaBootstrap replays a stored choice before config", () => {
  const granted = runBootstrap("granted");
  assert.deepEqual(granted[2], ["consent", "update", { analytics_storage: "granted" }]);
  assert.equal(granted[4][0], "config");
  const denied = runBootstrap("denied");
  assert.deepEqual(denied[2], ["consent", "update", consentUpdate("denied")]);
  assert.equal(runBootstrap("garbage").length, 4);
});
