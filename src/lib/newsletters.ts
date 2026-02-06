import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { remark } from "remark";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";

import type { Locale } from "@/lib/i18n";
import type { TocItem } from "@/lib/posts";

const NEWSLETTERS_DIR = path.join(process.cwd(), "content/newsletters");
const NEWSLETTERS_DIR_BY_LOCALE: Record<Locale, string> = {
  en: NEWSLETTERS_DIR,
  fr: path.join(NEWSLETTERS_DIR, "fr"),
};

export type NewsletterMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  issueNumber?: number;
  readingTimeMinutes: number;
};

export type Newsletter = NewsletterMeta & {
  contentHtml: string;
  contentMarkdown: string;
  toc: TocItem[];
};

type Frontmatter = Record<string, unknown>;

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

function normalizeMeta(slug: string, data: Frontmatter, markdown = ""): NewsletterMeta {
  const title = String(data.title ?? slug);
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const issueRaw = typeof data.issueNumber === "number" ? data.issueNumber : Number(data.issueNumber);
  const issueNumber = Number.isFinite(issueRaw) && issueRaw > 0 ? Math.round(issueRaw) : undefined;

  return {
    slug,
    title,
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    tags,
    issueNumber,
    readingTimeMinutes: getReadingTimeMinutes(markdown),
  };
}

async function getNewsletterSlugs(locale: Locale = "en"): Promise<string[]> {
  const localeDir = NEWSLETTERS_DIR_BY_LOCALE[locale];
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
  const localeDir = NEWSLETTERS_DIR_BY_LOCALE[locale];
  const localePathMd = path.join(localeDir, `${slug}.md`);
  const localePathMdx = path.join(localeDir, `${slug}.mdx`);

  try {
    return await fs.readFile(localePathMd, "utf8");
  } catch {
    return fs.readFile(localePathMdx, "utf8");
  }
}

export async function getAllNewslettersMeta(locale: Locale = "en"): Promise<NewsletterMeta[]> {
  const slugs = await getNewsletterSlugs(locale);
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const raw = await readLocalizedFile(slug, locale);
      const parsed = matter(raw);
      return normalizeMeta(slug, parsed.data as Frontmatter, parsed.content);
    }),
  );

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNewsletter(slug: string, locale: Locale = "en"): Promise<Newsletter> {
  const raw = await readLocalizedFile(slug, locale);
  const parsed = matter(raw);

  const contentMarkdown = String(parsed.content || "").trim();
  const processed = await remark().use(remarkRehype).use(rehypeSlug).use(rehypeStringify).process(contentMarkdown);
  const contentHtml = String(processed.value);
  const meta = normalizeMeta(slug, parsed.data as Frontmatter, contentMarkdown);

  return {
    ...meta,
    contentHtml,
    contentMarkdown,
    toc: buildToc(contentMarkdown),
  };
}
