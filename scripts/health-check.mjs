import "./load-env.mjs";

const BASE_URL = String(process.env.HEALTHCHECK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://aisignals.dev").replace(
  /\/+$/u,
  "",
);

const TIMEOUT_MS = Math.max(3_000, Math.min(30_000, Number(process.env.HEALTHCHECK_TIMEOUT_MS || 8_000)));

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "aisignals-healthcheck/1.0" },
    });
    const text = await res.text();
    return { res, text };
  } finally {
    clearTimeout(timer);
  }
}

async function check({ name, path, expect, expectContentType }) {
  const url = `${BASE_URL}${path}`;
  const started = Date.now();

  try {
    const { res, text } = await fetchText(url);
    const elapsed = Date.now() - started;

    if (!res.ok) {
      return { ok: false, name, url, status: res.status, elapsed, reason: `HTTP ${res.status}` };
    }

    const ct = String(res.headers.get("content-type") || "");
    if (expectContentType && !ct.toLowerCase().includes(expectContentType)) {
      return { ok: false, name, url, status: res.status, elapsed, reason: `content-type mismatch: ${ct}` };
    }

    if (expect && !expect.test(text)) {
      return { ok: false, name, url, status: res.status, elapsed, reason: "body did not match expected pattern" };
    }

    return { ok: true, name, url, status: res.status, elapsed };
  } catch (error) {
    const elapsed = Date.now() - started;
    return { ok: false, name, url, status: 0, elapsed, reason: error?.message || String(error) };
  }
}

async function main() {
  required(BASE_URL, "Missing HEALTHCHECK_BASE_URL or NEXT_PUBLIC_SITE_URL.");

  console.log(`[health-check] base=${BASE_URL} timeoutMs=${TIMEOUT_MS}`);

  const checks = [
    { name: "Home (EN)", path: "/", expect: /AI Signals/i, expectContentType: "text/html" },
    { name: "Home (FR)", path: "/fr", expect: /AI Signals/i, expectContentType: "text/html" },
    { name: "RSS (EN)", path: "/rss.xml", expect: /<rss|<feed/i, expectContentType: "xml" },
    { name: "RSS (FR)", path: "/fr/rss.xml", expect: /<rss|<feed/i, expectContentType: "xml" },
    { name: "Sitemap", path: "/sitemap.xml", expect: /<urlset/i, expectContentType: "xml" },
  ];

  const results = await Promise.all(checks.map((c) => check(c)));
  const failures = results.filter((r) => !r.ok);

  for (const r of results) {
    const label = r.ok ? "OK  " : "FAIL";
    const extra = r.ok ? "" : ` reason="${r.reason}"`;
    console.log(`${label} ${String(r.status).padStart(3, " ")} ${String(r.elapsed).padStart(5, " ")}ms ${r.url}${extra}`);
  }

  if (failures.length > 0) {
    console.error(`[health-check] failures=${failures.length}/${results.length}`);
    process.exitCode = 1;
    return;
  }

  console.log("[health-check] all checks passed");
}

await main();

