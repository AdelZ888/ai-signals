import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { remark } from "remark";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";

import type { Locale } from "@/lib/i18n";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const POSTS_DIR_BY_LOCALE: Record<Locale, string> = {
  en: POSTS_DIR,
  fr: path.join(POSTS_DIR, "fr"),
};

export const REGION_CODES = ["US", "UK", "FR", "GLOBAL"] as const;
export const PRIMARY_REGIONS = ["US", "UK", "FR"] as const;

export type RegionCode = (typeof REGION_CODES)[number];

const REGION_PATH_BY_CODE: Record<RegionCode, string> = {
  US: "us",
  UK: "uk",
  FR: "fr",
  GLOBAL: "global",
};

const REGION_LABEL_BY_CODE: Record<RegionCode, string> = {
  US: "United States",
  UK: "United Kingdom",
  FR: "France",
  GLOBAL: "Global",
};

const REGION_LABEL_BY_CODE_FR: Record<RegionCode, string> = {
  US: "Etats-Unis",
  UK: "Royaume-Uni",
  FR: "France",
  GLOBAL: "Monde",
};

const REGION_BY_PATH: Record<string, RegionCode> = Object.fromEntries(
  Object.entries(REGION_PATH_BY_CODE).map(([code, pathValue]) => [pathValue, code]),
) as Record<string, RegionCode>;

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  sources: string[];
  category: string;
  region: RegionCode;
  series?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  timeToImplementMinutes?: number;
  editorialTemplate?: string;
  readingTimeMinutes: number;
};

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type Post = PostMeta & {
  contentHtml: string;
  contentMarkdown: string;
  toc: TocItem[];
};

type Frontmatter = Record<string, unknown>;

const SERIES_LABELS: Record<string, { en: string; fr: string }> = {
  "agent-playbook": { en: "Agent Playbook", fr: "Playbook Agents" },
  "model-release-brief": { en: "Model Release Brief", fr: "Brief sortie modele" },
  "security-boundary": { en: "Security Boundary", fr: "Securite & Frontieres" },
  "tooling-deep-dive": { en: "Tooling Deep Dive", fr: "Deep dive outillage" },
  "founder-notes": { en: "Founder Notes", fr: "Notes fondateur" },
};

const DIFFICULTY_LABELS: Record<NonNullable<PostMeta["difficulty"]>, { en: string; fr: string }> = {
  beginner: { en: "Beginner", fr: "Debutant" },
  intermediate: { en: "Intermediate", fr: "Intermediaire" },
  advanced: { en: "Advanced", fr: "Avance" },
};

const DIFFICULTY_VALUES = ["beginner", "intermediate", "advanced"] as const;

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeRegion(input: unknown): RegionCode {
  if (!input) return "GLOBAL";

  const value = String(input).trim().toUpperCase();
  if (REGION_CODES.includes(value as RegionCode)) return value as RegionCode;

  if (["UNITED STATES", "USA"].includes(value)) return "US";
  if (["UNITED KINGDOM", "BRITAIN", "GREAT BRITAIN"].includes(value)) return "UK";
  if (["FRANCE", "FRENCH"].includes(value)) return "FR";

  return "GLOBAL";
}

function inferRegion(tags: string[], title: string, sources: string[]): RegionCode {
  const haystack = `${title} ${tags.join(" ")} ${sources.join(" ")}`.toLowerCase();

  if (/(bbc|\.co\.uk|united kingdom|uk\b|britain|british|london)/.test(haystack)) return "UK";
  if (/(lemonde|\.fr|france|french|paris|mistral)/.test(haystack)) return "FR";
  if (/(openai|google|mit|usa|us\b|america|anthropic)/.test(haystack)) return "US";

  return "GLOBAL";
}

function getReadingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function buildToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];
  const slugger = new GithubSlugger();

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    if (!text) continue;

    toc.push({
      id: slugger.slug(text),
      text,
      level: level === 2 ? 2 : 3,
    });
  }

  return toc;
}

function inferCategory(tags: string[], title: string): string {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();

  if (haystack.includes("tutorial") || haystack.includes("how to") || haystack.includes("tutoriel")) return "Tutorials";
  if (haystack.includes("news") || haystack.includes("release") || haystack.includes("update")) return "News";
  if (haystack.includes("agent")) return "Agent Playbooks";
  return "Model Breakdowns";
}

const CATEGORY_TRANSLATIONS: Record<string, { en: string; fr: string }> = {
  news: { en: "News", fr: "Actualites" },
  actualites: { en: "News", fr: "Actualites" },
  tutorials: { en: "Tutorials", fr: "Tutoriels" },
  tutoriels: { en: "Tutorials", fr: "Tutoriels" },
  "agent playbooks": { en: "Agent Playbooks", fr: "Playbooks Agents" },
  "playbooks agents": { en: "Agent Playbooks", fr: "Playbooks Agents" },
  "model breakdowns": { en: "Model Breakdowns", fr: "Analyses de modeles" },
  "analyses de modeles": { en: "Model Breakdowns", fr: "Analyses de modeles" },
  "ai/ml": { en: "AI/ML", fr: "IA/ML" },
  "ia/ml": { en: "AI/ML", fr: "IA/ML" },
};

function normalizeCategoryKey(category: string): string {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function canonicalCategory(category: string): string {
  const key = normalizeCategoryKey(category);
  const translated = CATEGORY_TRANSLATIONS[key];
  if (!translated) return key;
  return normalizeCategoryKey(translated.en);
}

async function getPostSlugs(locale: Locale = "en"): Promise<string[]> {
  const localeDir = POSTS_DIR_BY_LOCALE[locale];
  let files: string[];
  try {
    files = await fs.readdir(localeDir);
  } catch {
    return [];
  }
  return files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.(md|mdx)$/u, ""));
}

async function readLocalizedFile(slug: string, locale: Locale): Promise<string> {
  const localeDir = POSTS_DIR_BY_LOCALE[locale];
  const localePathMd = path.join(localeDir, `${slug}.md`);
  const localePathMdx = path.join(localeDir, `${slug}.mdx`);

  try {
    return await fs.readFile(localePathMd, "utf8");
  } catch {
    return fs.readFile(localePathMdx, "utf8");
  }
}

async function readPostRaw(slug: string, locale: Locale = "en"): Promise<string> {
  try {
    return await readLocalizedFile(slug, locale);
  } catch {
    throw new Error(`Post ${slug} not found for locale ${locale}`);
  }
}

function normalizeMeta(slug: string, data: Frontmatter, markdown = ""): PostMeta {
  const title = String(data.title ?? slug);
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const sources = Array.isArray(data.sources) ? data.sources.map(String) : [];
  const series = typeof data.series === "string" ? data.series.trim() : "";
  const difficultyRaw = typeof data.difficulty === "string" ? data.difficulty.trim().toLowerCase() : "";
  const difficulty = DIFFICULTY_VALUES.includes(difficultyRaw as (typeof DIFFICULTY_VALUES)[number])
    ? (difficultyRaw as (typeof DIFFICULTY_VALUES)[number])
    : undefined;
  const timeRaw = typeof data.timeToImplementMinutes === "number" ? data.timeToImplementMinutes : Number(data.timeToImplementMinutes);
  const timeToImplementMinutes = Number.isFinite(timeRaw) && timeRaw > 0 ? Math.min(480, Math.max(5, Math.round(timeRaw))) : undefined;
  const editorialTemplate = typeof data.editorialTemplate === "string" ? data.editorialTemplate.trim() : undefined;

  return {
    slug,
    title,
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    tags,
    sources,
    category: String(data.category ?? inferCategory(tags, title)),
    region: normalizeRegion(data.region ?? inferRegion(tags, title, sources)),
    series: series || undefined,
    difficulty,
    timeToImplementMinutes,
    editorialTemplate,
    readingTimeMinutes: getReadingTimeMinutes(markdown),
  };
}

export function getRegionLabel(region: RegionCode, locale: Locale = "en"): string {
  return locale === "fr" ? REGION_LABEL_BY_CODE_FR[region] : REGION_LABEL_BY_CODE[region];
}

export function getCategoryLabel(category: string, locale: Locale = "en"): string {
  const key = normalizeCategoryKey(category);
  const match = CATEGORY_TRANSLATIONS[key];
  if (!match) return category;
  return locale === "fr" ? match.fr : match.en;
}

export function getSeriesLabel(series: string, locale: Locale = "en"): string {
  const key = String(series || "").trim().toLowerCase();
  const match = SERIES_LABELS[key];
  if (!match) return series;
  return locale === "fr" ? match.fr : match.en;
}

export function getDifficultyLabel(difficulty: NonNullable<PostMeta["difficulty"]>, locale: Locale = "en"): string {
  const match = DIFFICULTY_LABELS[difficulty];
  return locale === "fr" ? match.fr : match.en;
}

export function regionCodeToPath(region: RegionCode): string {
  return REGION_PATH_BY_CODE[region];
}

export function regionPathToCode(regionPath: string): RegionCode | null {
  return REGION_BY_PATH[regionPath.toLowerCase()] ?? null;
}

export async function getAllPostsMeta(locale: Locale = "en"): Promise<PostMeta[]> {
  const slugs = await getPostSlugs(locale);

  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const fileContent = await readPostRaw(slug, locale);
      const { data, content } = matter(fileContent);
      return normalizeMeta(slug, data as Frontmatter, content);
    }),
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string, locale: Locale = "en"): Promise<Post> {
  const fileContent = await readPostRaw(slug, locale);
  const { data, content } = matter(fileContent);
  const processed = await remark().use(remarkRehype).use(rehypeSlug).use(rehypeStringify).process(content);

  return {
    ...normalizeMeta(slug, data as Frontmatter, content),
    contentHtml: processed.toString(),
    contentMarkdown: content,
    toc: buildToc(content),
  };
}

export async function getPostsByCategory(category: string, locale: Locale = "en"): Promise<PostMeta[]> {
  const posts = await getAllPostsMeta(locale);
  const target = canonicalCategory(category);
  return posts.filter((post) => canonicalCategory(post.category) === target);
}

export async function getPostsByRegion(region: RegionCode, locale: Locale = "en"): Promise<PostMeta[]> {
  const posts = await getAllPostsMeta(locale);

  if (region === "GLOBAL") return posts.filter((post) => post.region === "GLOBAL");

  return posts.filter((post) => post.region === region || post.region === "GLOBAL");
}

export async function getRegionCounts(locale: Locale = "en"): Promise<Record<RegionCode, number>> {
  const posts = await getAllPostsMeta(locale);

  return posts.reduce(
    (acc, post) => {
      acc[post.region] += 1;
      return acc;
    },
    {
      US: 0,
      UK: 0,
      FR: 0,
      GLOBAL: 0,
    } as Record<RegionCode, number>,
  );
}

export async function getPostsByTag(tag: string, locale: Locale = "en"): Promise<PostMeta[]> {
  const posts = await getAllPostsMeta(locale);
  return posts.filter((post) => post.tags.some((entry) => entry.toLowerCase() === tag.toLowerCase()));
}

export async function getAllTags(locale: Locale = "en"): Promise<string[]> {
  const posts = await getAllPostsMeta(locale);
  return [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));
}

export async function getRelatedPosts(slug: string, limit = 3, locale: Locale = "en"): Promise<PostMeta[]> {
  const posts = await getAllPostsMeta(locale);
  const current = posts.find((post) => post.slug === slug);
  if (!current) return [];

  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const overlap = post.tags.filter((tag) => current.tags.includes(tag)).length;
      const sameCategory = canonicalCategory(post.category) === canonicalCategory(current.category) ? 2 : 0;
      const sameRegion = post.region === current.region ? 2 : 0;
      return { post, score: overlap * 3 + sameCategory + sameRegion };
    })
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map((entry) => entry.post);
}

export function formatTagForPath(tag: string): string {
  return toSlug(tag);
}

export function parseTagFromPath(tag: string): string {
  return tag.replace(/-/g, " ");
}
