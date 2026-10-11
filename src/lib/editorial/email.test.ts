import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import { renderEmailHtml, unsubscribeUrl } from "./email.ts";

test("unsubscribe links use the same HMAC as the API route", () => {
  const sig = crypto.createHmac("sha256", "s3cret").update("ann@example.com").digest("hex");
  assert.equal(unsubscribeUrl("https://aisignals.dev", " Ann@Example.com ", "s3cret"), `https://aisignals.dev/api/newsletter/unsubscribe?email=ann%40example.com&sig=${sig}`);
});

test("email html escapes the title and carries the unsubscribe link and address", () => {
  const html = renderEmailHtml({ title: "A <b> & C", contentHtml: "<p>body</p>", url: "https://aisignals.dev/news/x", unsubscribeUrl: "https://u", address: "AI Signals, 1 Street" });
  assert.match(html, /A &lt;b&gt; &amp; C/u);
  assert.match(html, /<p>body<\/p>/u);
  assert.match(html, /href="https:\/\/u"/u);
  assert.match(html, /AI Signals, 1 Street/u);
});
