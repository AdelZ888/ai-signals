import crypto from "node:crypto";

const escapeHtml = (s: string) => s.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

/** Must match `sign()` in src/app/api/newsletter/unsubscribe/route.ts. */
export function unsubscribeUrl(siteUrl: string, email: string, secret: string): string {
  const normalized = email.trim().toLowerCase();
  const sig = crypto.createHmac("sha256", secret).update(normalized).digest("hex");
  return `${siteUrl}/api/newsletter/unsubscribe?${new URLSearchParams({ email: normalized, sig }).toString()}`;
}

export function renderEmailHtml(opts: { title: string; contentHtml: string; url: string; unsubscribeUrl: string; address: string }): string {
  const mono = "ui-monospace,Menlo,Consolas,monospace";
  return `<!doctype html><html><body style="margin:0;background:#0a0e0b;color:#c8f5d8;font-family:${mono};font-size:14px;line-height:1.6">
<div style="max-width:640px;margin:0 auto;padding:24px 16px">
<p style="color:#22c55e;font-weight:700;margin:0 0 16px">&gt; ai_signals_</p>
<h1 style="color:#e9fff1;font-size:20px;margin:0 0 16px">${escapeHtml(opts.title)}</h1>
<div style="color:#c8f5d8">${opts.contentHtml}</div>
<p style="margin:24px 0"><a href="${escapeHtml(opts.url)}" style="color:#22c55e">Read on the web →</a></p>
<p style="color:#4f6e5a;font-size:12px;border-top:1px solid #1d2a21;padding-top:12px">${escapeHtml(opts.address)}<br><a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#7ea58c">Unsubscribe</a></p>
</div></body></html>`;
}
