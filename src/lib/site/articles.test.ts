import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { articleExists, listArticles, parseArticle, renderMarkdown, serializeArticle, writeArticle } from "./articles.ts";

test("articles round-trip through front matter, newest first", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ais-news-"));
  writeArticle({ slug: "a", title: "Old: 1", description: "d", date: "2026-10-01", kind: "flash", modelId: "openai/x", body: "Hello" }, dir);
  writeArticle({ slug: "b", title: "New", description: "d", date: "2026-10-05", kind: "digest", modelId: null, body: "World" }, dir);
  assert.deepEqual(listArticles(dir).map((a) => [a.slug, a.kind, a.date]), [["b", "digest", "2026-10-05"], ["a", "flash", "2026-10-01"]]);
  assert.equal(listArticles(dir)[1].title, "Old: 1");
  assert.equal(articleExists("a", dir), true);
  assert.deepEqual(listArticles(path.join(dir, "missing")), []);
});

test("unquoted YAML dates are read as days", () => {
  const a = parseArticle("x", "---\ntitle: T\ndate: 2026-10-11\nkind: flash\n---\nBody\n");
  assert.equal(a.date, "2026-10-11");
  assert.match(serializeArticle(a), /^---\n/u);
});

test("markdown renders GFM tables and strips scripts", async () => {
  const html = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |\n\n<script>alert(1)</script>");
  assert.match(html, /<table>/u);
  assert.doesNotMatch(html, /<script>/u);
});
