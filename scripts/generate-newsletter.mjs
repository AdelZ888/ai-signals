import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import "./load-env.mjs";

import OpenAI from "openai";
import matter from "gray-matter";
import slugify from "slugify";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/posts");
const POSTS_FR_DIR = path.join(ROOT, "content/posts/fr");
const OUT_DIR = path.join(ROOT, "content/newsletters");
const OUT_FR_DIR = path.join(ROOT, "content/newsletters/fr");
const QUEUE_PATH = path.join(ROOT, "data/topics-queue.json");

const SITE_URL = String(process.env.NEXT_PUBLIC_SITE_URL || "https://aisignals.dev").replace(/\/+$/u, "");
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const OPENAI_TIMEOUT_MS = Math.max(10_000, Math.min(180_000, Number(process.env.OPENAI_TIMEOUT_MS || 60_000)));
const OPENAI_MAX_RETRIES = Math.max(0, Math.min(4, Number(process.env.OPENAI_MAX_RETRIES || 2)));

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function stripHtml(input) {
  return String(input || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function safeReadJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function listMarkdownSlugs(dir) {
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .map((file) => file.replace(/\.(md|mdx)$/u, ""));
  } catch {
    return [];
  }
}

async function readPostMeta(locale) {
  const dir = locale === "fr" ? POSTS_FR_DIR : POSTS_DIR;
  const slugs = await listMarkdownSlugs(dir);
  const items = [];

  for (const slug of slugs) {
    try {
      const raw = await fs.readFile(path.join(dir, `${slug}.md`), "utf8");
      const parsed = matter(raw);
      const data = parsed.data || {};
      items.push({
        slug,
        title: String(data.title || slug),
        date: String(data.date || "1970-01-01"),
        excerpt: stripHtml(String(data.excerpt || "")).slice(0, 360),
        category: String(data.category || ""),
        region: String(data.region || ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      });
    } catch {
      // ignore file read/parse issues
    }
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

function pickWeek(items, now = new Date()) {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return items.filter((item) => {
    const dt = new Date(item.date);
    return Number.isFinite(dt.getTime()) && dt >= sevenDaysAgo && dt <= now;
  });
}

function toIssueSlug(title) {
  const base = slugify(String(title || "ai-signals-weekly"), { lower: true, strict: true });
  const trimmed = base.length > 60 ? base.slice(0, 60).replace(/-+$/u, "") : base;
  return `${isoDate()}-${trimmed || "ai-signals-weekly"}`;
}

function buildFallbackMarkdown(locale, issueNumber, weeklyPosts, queueItems) {
  const isFr = locale === "fr";
  const intro = isFr
    ? `Voici les signaux les plus importants de la semaine, axes builders.\n`
    : `Here are the most important signals of the week, builder-focused.\n`;

  const postLines = weeklyPosts.slice(0, 6).map((p) => {
    const href = isFr ? `${SITE_URL}/fr/posts/${p.slug}` : `${SITE_URL}/posts/${p.slug}`;
    return `- [${p.title}](${href})${p.excerpt ? `: ${p.excerpt}` : ""}`;
  });

  const queueLines = (queueItems || []).slice(0, 6).map((q) => `- [${q.title}](${q.link}) (${q.source})`);

  return [
    intro,
    "## " + (isFr ? "A lire sur le blog" : "From the blog"),
    postLines.join("\n") || (isFr ? "_Aucun article cette semaine._" : "_No posts this week._"),
    "",
    "## " + (isFr ? "Radar (liens)" : "Radar (links)"),
    queueLines.join("\n") || (isFr ? "_Aucun lien cette semaine._" : "_No links this week._"),
    "",
  ].join("\n");
}

async function runJson(client, model, messages) {
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages,
  });
  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

async function generateIssue(locale, issueNumber, weeklyPosts, queueItems) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const title = locale === "fr" ? `AI Signals Hebdo #${issueNumber}` : `AI Signals Weekly #${issueNumber}`;
    const excerpt =
      locale === "fr"
        ? "Sorties de modeles, patterns d'agents, et tutoriels a shipper."
        : "Model launches, agent patterns, and tutorials you can ship.";
    const markdown = buildFallbackMarkdown(locale, issueNumber, weeklyPosts, queueItems);
    return { title, excerpt, markdown };
  }

  const isFr = locale === "fr";
  const client = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: OPENAI_MAX_RETRIES });

  const postsBlock = weeklyPosts
    .slice(0, 12)
    .map((p, idx) => {
      const href = isFr ? `${SITE_URL}/fr/posts/${p.slug}` : `${SITE_URL}/posts/${p.slug}`;
      return `${idx + 1}. ${p.title}\n   - url: ${href}\n   - date: ${p.date}\n   - region: ${p.region || "GLOBAL"}\n   - category: ${p.category || ""}\n   - excerpt: ${p.excerpt || ""}`;
    })
    .join("\n");

  const queueBlock = (queueItems || [])
    .slice(0, 12)
    .map((q, idx) => {
      return `${idx + 1}. ${q.title}\n   - url: ${q.link}\n   - source: ${q.source}\n   - region: ${q.region || "GLOBAL"}\n   - publishedAt: ${q.publishedAt || ""}\n   - summary: ${stripHtml(q.summary || "").slice(0, 500)}`;
    })
    .join("\n");

  const system = isFr
    ? "Tu es redacteur en chef d'une newsletter IA pour devs, fondateurs, et passionnes IA. Style: clair, dense, sans fluff, axe builders. Pas de promesses marketing."
    : "You are the editor-in-chief of an AI newsletter for devs, founders, and AI enthusiasts. Style: clear, dense, zero fluff, builder-focused. No marketing hype.";

  const user = isFr
    ? `Ecris l'edition hebdo #${issueNumber}.\n\nContraintes:\n- Markdown uniquement.\n- Structure obligatoire avec ces sections H2 dans cet ordre:\n  1) ## TL;DR\n  2) ## Cette semaine sur AI Signals (liens internes)\n  3) ## Modeles: ce qui a bouge\n  4) ## Agents: patterns utiles\n  5) ## Outils & repos\n  6) ## Angle startup\n  7) ## Quoi shipper la semaine prochaine\n- Chaque section doit contenir des bullet points concrets.\n- Dans \"liens internes\", utilise uniquement les URLs internes fournies.\n- Dans les autres sections, mixe liens internes et externes quand utile.\n- Termine par une seule ligne de CTA vers ${SITE_URL}/fr/#newsletter.\n\nDonnees (posts internes):\n${postsBlock || "(aucun)"}\n\nDonnees (radar externe):\n${queueBlock || "(aucun)"}\n\nRetourne du JSON strict avec ces cles:\n- title (string)\n- excerpt (string <= 180 chars)\n- markdown (string)\n`
    : `Write weekly issue #${issueNumber}.\n\nConstraints:\n- Markdown only.\n- Required structure with these H2 sections in this exact order:\n  1) ## TL;DR\n  2) ## This week on AI Signals (internal links)\n  3) ## Model watch\n  4) ## Agent patterns\n  5) ## Tools & repos\n  6) ## Startup lens\n  7) ## What to ship next week\n- Each section must contain concrete bullets.\n- In \"internal links\", only use the internal URLs provided.\n- In other sections, mix internal + external links when useful.\n- End with a single CTA line pointing to ${SITE_URL}/#newsletter.\n\nData (internal posts):\n${postsBlock || "(none)"}\n\nData (external radar):\n${queueBlock || "(none)"}\n\nReturn strict JSON with keys:\n- title (string)\n- excerpt (string <= 180 chars)\n- markdown (string)\n`;

  let json;
  try {
    json = await runJson(client, MODEL, [
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
  } catch {
    const title = isFr ? `AI Signals Hebdo #${issueNumber}` : `AI Signals Weekly #${issueNumber}`;
    const excerpt = isFr ? "Digest hebdo: sorties, agents, tutoriels." : "Weekly digest: models, agents, tutorials.";
    return { title, excerpt, markdown: buildFallbackMarkdown(locale, issueNumber, weeklyPosts, queueItems) };
  }

  const title =
    typeof json.title === "string" && json.title.trim().length > 0
      ? json.title.trim()
      : isFr
        ? `AI Signals Hebdo #${issueNumber}`
        : `AI Signals Weekly #${issueNumber}`;
  const excerpt = typeof json.excerpt === "string" ? json.excerpt.trim().slice(0, 180) : "";
  const markdown = typeof json.markdown === "string" && json.markdown.trim().length > 0 ? json.markdown.trim() : "";

  if (!markdown) {
    return {
      title,
      excerpt: excerpt || (isFr ? "Digest hebdo: sorties, agents, tutoriels." : "Weekly digest: models, agents, tutorials."),
      markdown: buildFallbackMarkdown(locale, issueNumber, weeklyPosts, queueItems),
    };
  }

  return { title, excerpt: excerpt || stripHtml(title).slice(0, 180), markdown };
}

async function writeIssue(locale, slug, frontmatterObj, markdownBody) {
  const dir = locale === "fr" ? OUT_FR_DIR : OUT_DIR;
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.md`);
  const content = matter.stringify(String(markdownBody || "").trim() + "\n", frontmatterObj);
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
}

export async function generateNewsletter() {
  const dryRun = String(process.env.DRY_RUN || "0") === "1";
  const now = new Date();

  const existingEn = await listMarkdownSlugs(OUT_DIR);
  const issueNumber = existingEn.length + 1;

  const [postsEn, postsFr, queue] = await Promise.all([
    readPostMeta("en"),
    readPostMeta("fr"),
    safeReadJson(QUEUE_PATH, { items: [] }),
  ]);

  const weeklyEn = pickWeek(postsEn, now);
  const weeklyFr = pickWeek(postsFr, now);
  const queueItems = Array.isArray(queue.items) ? queue.items.slice(0, 30) : [];

  const issueEn = await generateIssue("en", issueNumber, weeklyEn, queueItems);
  const slug = toIssueSlug(issueEn.title);

  // Avoid duplicate slug per day/title.
  const targetEnPath = path.join(OUT_DIR, `${slug}.md`);
  const targetFrPath = path.join(OUT_FR_DIR, `${slug}.md`);

  const frontmatterBase = {
    date: isoDate(now),
    issueNumber,
    tags: ["Newsletter", "Weekly"],
  };

  if (dryRun) {
    return { slug, issueNumber, en: { ...issueEn, path: targetEnPath }, fr: { path: targetFrPath } };
  }

  const enPath = await writeIssue("en", slug, { ...frontmatterBase, title: issueEn.title, excerpt: issueEn.excerpt }, issueEn.markdown);

  const issueFr = await generateIssue("fr", issueNumber, weeklyFr, queueItems);
  const frPath = await writeIssue("fr", slug, { ...frontmatterBase, title: issueFr.title, excerpt: issueFr.excerpt }, issueFr.markdown);

  return { slug, issueNumber, en: { ...issueEn, path: enPath }, fr: { ...issueFr, path: frPath } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateNewsletter();
}
