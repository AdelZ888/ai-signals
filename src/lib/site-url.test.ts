import { test } from "node:test";
import assert from "node:assert/strict";

import { getSiteUrl } from "./site-url.ts";

function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const keys = ["NEXT_PUBLIC_SITE_URL", "VERCEL_ENV", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  Object.assign(process.env, Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined)));
  try {
    fn();
  } finally {
    for (const k of keys) delete process.env[k];
    Object.assign(process.env, Object.fromEntries(Object.entries(saved).filter(([, v]) => v !== undefined)));
  }
}

test("explicit site URL wins", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://aisignals.dev/", VERCEL_URL: "x.vercel.app" }, () => assert.equal(getSiteUrl(), "https://aisignals.dev"));
});

test("Vercel production uses the production domain, not the deployment host", () => {
  withEnv({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "aisignals.dev", VERCEL_URL: "ai-signals-abc.vercel.app" }, () =>
    assert.equal(getSiteUrl(), "https://aisignals.dev"),
  );
  withEnv({ VERCEL_ENV: "preview", VERCEL_PROJECT_PRODUCTION_URL: "aisignals.dev", VERCEL_URL: "ai-signals-abc.vercel.app" }, () =>
    assert.equal(getSiteUrl(), "https://ai-signals-abc.vercel.app"),
  );
  withEnv({}, () => assert.equal(getSiteUrl(), "http://localhost:3000"));
});
