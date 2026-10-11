import { test } from "node:test";
import assert from "node:assert/strict";

import { isLegacyPath } from "./legacy.ts";

test("old blog URLs are legacy", () => {
  for (const p of [
    "/posts/2026-01-05-x", "/posts", "/fr", "/fr/", "/fr/posts/x", "/tags/ai", "/regions/us",
    "/tutorials", "/search", "/start-here", "/services", "/api/services/lead",
    "/newsletter/2026-02-06-ai-signals-issue-1", "/newsletter/rss.xml",
  ]) {
    assert.equal(isLegacyPath(p), true, p);
  }
});

test("new site URLs are not legacy", () => {
  for (const p of [
    "/", "/models", "/models/openai/gpt-6.1-sol", "/news", "/news/x", "/newsletter", "/newsletter/",
    "/api/newsletter/subscribe", "/compare/a-vs-b", "/fresh-models",
  ]) {
    assert.equal(isLegacyPath(p), false, p);
  }
});
