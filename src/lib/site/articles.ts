import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

export type ArticleKind = "flash" | "digest";
export type ArticleFile = {
  slug: string; title: string; description: string; date: string;
  kind: ArticleKind; modelId: string | null; body: string;
};

export const NEWS_DIR = path.join(process.cwd(), "content", "news");
export const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

function toDay(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

export function parseArticle(slug: string, raw: string): ArticleFile {
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: toDay(data.date),
    kind: data.kind === "digest" ? "digest" : "flash",
    modelId: typeof data.modelId === "string" ? data.modelId : null,
    body: content.trim(),
  };
}

export function serializeArticle(a: ArticleFile): string {
  const data: Record<string, string> = { title: a.title, description: a.description, date: a.date, kind: a.kind };
  if (a.modelId) data.modelId = a.modelId;
  return matter.stringify(`${a.body.trim()}\n`, data);
}

export function listArticles(dir = NEWS_DIR): ArticleFile[] {
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return files
    .map((f) => parseArticle(f.slice(0, -3), fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function writeArticle(a: ArticleFile, dir = NEWS_DIR): string {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${a.slug}.md`);
  fs.writeFileSync(file, serializeArticle(a));
  return file;
}

export const articleExists = (slug: string, dir = NEWS_DIR) => fs.existsSync(path.join(dir, `${slug}.md`));

export async function renderMarkdown(md: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeSanitize).use(rehypeStringify).process(md);
  return String(file);
}
