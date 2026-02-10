import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const DATA_DIR = path.join(process.cwd(), "data");

const REGION_CODES = new Set(["US", "UK", "FR", "GLOBAL"]);
const DIFFICULTY_VALUES = new Set(["beginner", "intermediate", "advanced"]);

const INDEX_PATH_BY_LOCALE = {
  en: path.join(DATA_DIR, "posts-index.en.json"),
  fr: path.join(DATA_DIR, "posts-index.fr.json"),
};

function clampInt(value, { min, max }, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.min(max, Math.max(min, rounded));
}

function normalizeRegion(value) {
  if (!value) return "GLOBAL";
  const region = String(value).trim().toUpperCase();
  return REGION_CODES.has(region) ? region : "GLOBAL";
}

function normalizeDifficulty(value) {
  const raw = String(value || "").trim().toLowerCase();
  return DIFFICULTY_VALUES.has(raw) ? raw : undefined;
}

function normalizeStringArray(value, { max = 64, maxItemChars = 280 } = {}) {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .map((v) => (v.length <= maxItemChars ? v : v.slice(0, maxItemChars - 1).trimEnd() + "…"))
    .slice(0, max);
}

export function getReadingTimeMinutes(markdown) {
  const words = String(markdown || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function normalizePostMeta(input) {
  if (!input) return null;
  const slug = String(input.slug || "").trim();
  if (!slug) return null;

  const title = String(input.title || slug).trim() || slug;
  const date = String(input.date || "1970-01-01").trim() || "1970-01-01";
  const excerpt = String(input.excerpt || "").trim();
  const coverImage = typeof input.coverImage === "string" ? input.coverImage.trim() : "";
  const tags = normalizeStringArray(input.tags, { max: 24, maxItemChars: 64 });
  const sources = normalizeStringArray(input.sources, { max: 12, maxItemChars: 520 });
  const category = String(input.category || "").trim() || "News";
  const region = normalizeRegion(input.region);
  const series = typeof input.series === "string" ? input.series.trim() : "";
  const difficulty = normalizeDifficulty(input.difficulty);
  const timeToImplementMinutes = clampInt(input.timeToImplementMinutes, { min: 0, max: 600 }, undefined);
  const editorialTemplate = typeof input.editorialTemplate === "string" ? input.editorialTemplate.trim() : undefined;
  const readingTimeMinutes = clampInt(input.readingTimeMinutes, { min: 1, max: 120 }, getReadingTimeMinutes(input.contentMarkdown || ""));

  return {
    slug,
    title,
    date,
    excerpt,
    coverImage: coverImage || undefined,
    tags,
    sources,
    category,
    region,
    series: series || undefined,
    difficulty,
    timeToImplementMinutes: typeof timeToImplementMinutes === "number" && timeToImplementMinutes > 0 ? timeToImplementMinutes : undefined,
    editorialTemplate,
    readingTimeMinutes,
  };
}

async function safeReadIndex(locale) {
  const indexPath = INDEX_PATH_BY_LOCALE[locale] || INDEX_PATH_BY_LOCALE.en;
  try {
    const raw = await fs.readFile(indexPath, "utf8");
    const parsed = JSON.parse(raw);
    const posts = Array.isArray(parsed?.posts) ? parsed.posts : [];
    return posts.map(normalizePostMeta).filter(Boolean);
  } catch {
    return [];
  }
}

async function writeIndex(locale, posts) {
  const indexPath = INDEX_PATH_BY_LOCALE[locale] || INDEX_PATH_BY_LOCALE.en;
  await fs.mkdir(path.dirname(indexPath), { recursive: true });

  const sorted = [...posts].sort((a, b) => {
    const byDate = String(b.date).localeCompare(String(a.date));
    if (byDate !== 0) return byDate;
    return String(a.slug).localeCompare(String(b.slug));
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    locale,
    posts: sorted,
  };

  await fs.writeFile(indexPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

export async function upsertPostsIndex(locale, meta) {
  const next = normalizePostMeta(meta);
  if (!next) return null;

  const existing = await safeReadIndex(locale);
  const bySlug = new Map(existing.map((post) => [post.slug, post]));
  bySlug.set(next.slug, next);
  return writeIndex(locale, [...bySlug.values()]);
}

function postsDirForLocale(locale) {
  if (locale === "fr") return path.join(process.cwd(), "content/posts/fr");
  return path.join(process.cwd(), "content/posts");
}

export async function rebuildPostsIndex(locale) {
  const dir = postsDirForLocale(locale);
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return writeIndex(locale, []);
  }

  const slugs = files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.(md|mdx)$/u, ""))
    .filter(Boolean);

  const posts = [];
  for (const slug of slugs) {
    const filePathMd = path.join(dir, `${slug}.md`);
    const filePathMdx = path.join(dir, `${slug}.mdx`);
    let raw = "";
    try {
      raw = await fs.readFile(filePathMd, "utf8");
    } catch {
      try {
        raw = await fs.readFile(filePathMdx, "utf8");
      } catch {
        continue;
      }
    }

    const parsed = matter(raw);
    const data = parsed.data || {};
    const contentMarkdown = String(parsed.content || "");
    const meta = normalizePostMeta({
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      tags: data.tags,
      sources: data.sources,
      category: data.category,
      region: data.region,
      series: data.series,
      difficulty: data.difficulty,
      timeToImplementMinutes: data.timeToImplementMinutes,
      editorialTemplate: data.editorialTemplate,
      readingTimeMinutes: getReadingTimeMinutes(contentMarkdown),
    });
    if (meta) posts.push(meta);
  }

  return writeIndex(locale, posts);
}

export async function rebuildAllPostsIndex() {
  const [en, fr] = await Promise.all([rebuildPostsIndex("en"), rebuildPostsIndex("fr")]);
  return { en, fr };
}

