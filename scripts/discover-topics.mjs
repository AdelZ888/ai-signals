import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import Parser from "rss-parser";
import { compactQueuePayload } from "./compact-queue.mjs";

const FEEDS = [
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml", region: "US" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", region: "US" },
  { name: "Google DeepMind News", url: "https://deepmind.google/blog/rss.xml", region: "UK" },
  { name: "Microsoft AI Blog", url: "https://blogs.microsoft.com/ai/feed/", region: "US" },
  { name: "NVIDIA Blog", url: "https://blogs.nvidia.com/blog/category/deep-learning/feed/", region: "US" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", region: "US" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/tag/artificial-intelligence/feed/", region: "US" },
  { name: "Ars Technica AI", url: "https://arstechnica.com/tag/artificial-intelligence/feed/", region: "US" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", region: "US" },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", region: "UK" },
  { name: "Hacker News (AI)", url: "https://hnrss.org/newest?q=ai", region: "GLOBAL" },
  // Prefer open-access sources; paywalled stubs produce thin snapshots and low-trust posts.
  { name: "ActuIA", url: "https://www.actuia.com/feed/", region: "FR" },
  { name: "Numerama IA", url: "https://www.numerama.com/tag/intelligence-artificielle/feed/", region: "FR" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", region: "FR" },
  { name: "ArXiv cs.AI", url: "https://export.arxiv.org/rss/cs.AI", region: "GLOBAL" },
];

const FEED_ITEM_LIMIT = Math.max(8, Math.min(120, Number(process.env.DISCOVER_FEED_ITEMS || 16)));

const KEYWORDS = [
  "ai",
  "artificial intelligence",
  "intelligence artificielle",
  "agent",
  "agents",
  "model",
  "models",
  "llm",
  "openai",
  "anthropic",
  "gemini",
  "hugging face",
  "machine learning",
  "deep learning",
  "reasoning",
  "benchmark",
  "inference",
  "token",
  "alignment",
  "automation",
  "copilot",
  "prompt",
  "foundation model",
  "generative",
  "chatbot",
  "robotics",
];
const RELEVANCE_REGEX =
  /\b(ai|artificial intelligence|intelligence artificielle|llm|model(s)?|agent(s)?|machine learning|deep learning|reasoning|inference|generative)\b/i;

const REGIONS = new Set(["US", "UK", "FR", "GLOBAL"]);
const queuePath = path.join(process.cwd(), "data/topics-queue.json");

function normalizeRegion(value) {
  if (!value) return "GLOBAL";
  const region = String(value).trim().toUpperCase();
  return REGIONS.has(region) ? region : "GLOBAL";
}

function stripHtml(input) {
  return String(input || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countKeywordHits(text) {
  const haystack = text.toLowerCase();
  return KEYWORDS.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 1 : 0), 0);
}

function scoreItem(item) {
  const published = item.isoDate ? new Date(item.isoDate) : new Date();
  const ageHours = Math.max(1, (Date.now() - published.getTime()) / (1000 * 60 * 60));
  const recencyScore = 120 / ageHours;

  const cleanTitle = stripHtml(item.title);
  const cleanSnippet = stripHtml(item.contentSnippet || item.content || item.summary || "");
  const text = `${cleanTitle} ${cleanSnippet}`;

  const keywordHits = countKeywordHits(text);
  const keywordScore = keywordHits * 12;
  const titleBoost = countKeywordHits(cleanTitle) * 6;

  return {
    score: Number((recencyScore + keywordScore + titleBoost).toFixed(2)),
    keywordHits,
    cleanSnippet,
  };
}

function isAiRelevant(item) {
  const text = `${item.title || ""} ${item.summary || ""}`.toLowerCase();
  const keywordHits = Number(item.keywordHits || 0);
  return keywordHits >= 2 || RELEVANCE_REGEX.test(text);
}

async function safeReadQueue() {
  try {
    const raw = await fs.readFile(queuePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export async function discoverTopics() {
  const parser = new Parser({ timeout: 20_000 });
  const existingItems = await safeReadQueue();

  const discovered = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, FEED_ITEM_LIMIT);

      for (const item of items) {
        const title = stripHtml(item.title).trim();
        const link = item.link?.trim();
        if (!title || !link) continue;

        const scored = scoreItem(item);

        // Hard relevance gate to avoid non-AI generic tech news.
        if (scored.keywordHits < 2) continue;

        discovered.push({
          id: link,
          title,
          link,
          summary: scored.cleanSnippet.slice(0, 1400),
          source: feed.name,
          region: feed.region,
          keywordHits: scored.keywordHits,
          publishedAt: item.isoDate || new Date().toISOString(),
          score: scored.score,
          status: "queued",
        });
      }
    } catch (error) {
      console.warn(`Skipping feed ${feed.name}: ${error.message}`);
    }
  }

  const mergedById = new Map();
  for (const rawItem of [...existingItems, ...discovered]) {
    const item = {
      ...rawItem,
      region: normalizeRegion(rawItem.region),
      keywordHits: Number(rawItem.keywordHits || 0),
    };
    if (!mergedById.has(item.id)) mergedById.set(item.id, item);
  }

  const merged = [...mergedById.values()]
    .filter((item) => isAiRelevant(item))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const payload = compactQueuePayload({
    generatedAt: new Date().toISOString(),
    items: merged,
  });

  await fs.mkdir(path.dirname(queuePath), { recursive: true });
  await fs.writeFile(queuePath, JSON.stringify(payload, null, 2));

  return payload;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const payload = await discoverTopics();
  console.log(`Queued topics: ${payload.items.length}`);
  process.exit(0);
}
