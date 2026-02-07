import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import "./load-env.mjs";

import { generateAndUploadCover } from "./cover-images.mjs";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const POSTS_FR_DIR = path.join(POSTS_DIR, "fr");

function escapeYamlDoubleQuotes(value) {
  return String(value || "").replace(/"/g, "\\\"");
}

function upsertCoverImageFrontmatter(markdown, url) {
  const raw = String(markdown || "");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return raw;

  const yaml = match[1];
  const rest = raw.slice(match[0].length);
  const safeUrl = escapeYamlDoubleQuotes(url);

  let nextYaml = yaml;

  if (/^coverImage:\s*/m.test(nextYaml)) {
    nextYaml = nextYaml.replace(/^coverImage:\s*.*$/m, `coverImage: "${safeUrl}"`);
  } else if (/^excerpt:\s*/m.test(nextYaml)) {
    nextYaml = nextYaml.replace(/^excerpt:\s*.*$/m, (line) => `${line}\ncoverImage: "${safeUrl}"`);
  } else if (/^date:\s*/m.test(nextYaml)) {
    nextYaml = nextYaml.replace(/^date:\s*.*$/m, (line) => `${line}\ncoverImage: "${safeUrl}"`);
  } else {
    nextYaml = `coverImage: "${safeUrl}"\n${nextYaml}`;
  }

  return `---\n${nextYaml}\n---\n${rest}`;
}

function hasCoverImage(markdown) {
  return /^---\n[\s\S]*?\ncoverImage:\s*.+\n[\s\S]*?\n---\n/m.test(String(markdown || ""));
}

function parseFrontmatterValue(markdown, key) {
  const raw = String(markdown || "");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return "";
  const yaml = match[1];
  const line = yaml.split("\n").find((row) => row.trimStart().startsWith(`${key}:`));
  if (!line) return "";
  const value = line.slice(line.indexOf(":") + 1).trim();
  if (!value) return "";
  return value.replace(/^"(.*)"$/u, "$1").replace(/^'(.*)'$/u, "$1");
}

function parseYamlArray(markdown, key) {
  const raw = String(markdown || "");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return [];
  const yaml = match[1];
  const lines = yaml.split("\n");
  const idx = lines.findIndex((line) => line.trim() === `${key}:`);
  if (idx === -1) return [];

  const out = [];
  for (let i = idx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!/^\s+-\s+/.test(line)) break;
    const value = line.replace(/^\s+-\s+/, "").trim();
    out.push(value.replace(/^"(.*)"$/u, "$1").replace(/^'(.*)'$/u, "$1"));
  }
  return out.filter(Boolean);
}

async function backfillCoverImages() {
  const force = String(process.env.FORCE_REGENERATE_COVERS ?? "0") === "1";

  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")))
    .map((entry) => entry.name.replace(/\.(md|mdx)$/u, ""));

  let updated = 0;

  for (const slug of slugs) {
    const enPathMd = path.join(POSTS_DIR, `${slug}.md`);
    const enPathMdx = path.join(POSTS_DIR, `${slug}.mdx`);

    let enPath = enPathMd;
    let enRaw;
    try {
      enRaw = await fs.readFile(enPathMd, "utf8");
    } catch {
      enPath = enPathMdx;
      enRaw = await fs.readFile(enPathMdx, "utf8");
    }

    const already = hasCoverImage(enRaw);
    if (already && !force) {
      continue;
    }

    const title = parseFrontmatterValue(enRaw, "title") || slug;
    const excerpt = parseFrontmatterValue(enRaw, "excerpt") || "";
    const category = parseFrontmatterValue(enRaw, "category") || "";
    const region = parseFrontmatterValue(enRaw, "region") || "";
    const tags = parseYamlArray(enRaw, "tags");

    console.log(`[backfill-covers] Generating cover for ${slug}`);
    const url = await generateAndUploadCover({
      slug,
      title,
      excerpt,
      tags,
      category,
      region,
      force,
    });

    if (!url) {
      console.warn(`[backfill-covers] Cover generation skipped/failed for ${slug}`);
      continue;
    }

    const nextEn = upsertCoverImageFrontmatter(enRaw, url);
    await fs.writeFile(enPath, nextEn, "utf8");

    // Mirror the same cover URL to the FR version if present.
    const frPathMd = path.join(POSTS_FR_DIR, `${slug}.md`);
    const frPathMdx = path.join(POSTS_FR_DIR, `${slug}.mdx`);
    try {
      const frRaw = await fs.readFile(frPathMd, "utf8");
      const nextFr = upsertCoverImageFrontmatter(frRaw, url);
      await fs.writeFile(frPathMd, nextFr, "utf8");
    } catch {
      try {
        const frRaw = await fs.readFile(frPathMdx, "utf8");
        const nextFr = upsertCoverImageFrontmatter(frRaw, url);
        await fs.writeFile(frPathMdx, nextFr, "utf8");
      } catch {
        // no FR file; ignore
      }
    }

    updated += 1;
  }

  console.log(`[backfill-covers] Done. Updated ${updated}/${slugs.length} posts.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await backfillCoverImages();
}

