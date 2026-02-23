import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import "./load-env.mjs";

import matter from "gray-matter";
import OpenAI from "openai";
import { TwitterApi } from "twitter-api-v2";

const ROOT = process.cwd();
const SITE_URL = String(process.env.NEXT_PUBLIC_SITE_URL || "https://aisignals.dev").replace(/\/+$/u, "");
const POSTS_INDEX_EN_PATH = path.join(ROOT, "data/posts-index.en.json");
const NEWSLETTERS_DIR = path.join(ROOT, "content/newsletters");
const STATE_PATH = path.join(ROOT, "data/x-posted.json");

const MODE = String(process.env.X_MODE || "new-posts").trim().toLowerCase(); // new-posts | engagement | weekly-thread
const DRY_RUN = String(process.env.DRY_RUN || "0") === "1";
const X_TIMEZONE = String(process.env.X_TIMEZONE || "Europe/Paris").trim();
const X_NEW_POST_LIMIT = Math.max(1, Math.min(4, Number(process.env.X_NEW_POST_LIMIT || 2)));
const X_ENGAGEMENT_LIMIT = Math.max(1, Math.min(2, Number(process.env.X_ENGAGEMENT_LIMIT || 1)));
const X_THREAD_MAX_POSTS = Math.max(3, Math.min(8, Number(process.env.X_THREAD_MAX_POSTS || 5)));
const X_POST_SLUGS = String(process.env.X_POST_SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const FORCED_WEEKLY_KEY = String(process.env.X_WEEKLY_KEY || "").trim(); // optional manual override

const X_API_KEY = process.env.X_API_KEY;
const X_API_SECRET = process.env.X_API_SECRET;
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET;
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN; // optional / reserved

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function ensureEnv(name, value) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function clamp(text, max) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  return value.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

function estimateXLength(text) {
  return String(text || "")
    .replace(/https?:\/\/\S+/gi, "x".repeat(23))
    .length;
}

function clampByXLength(text, max) {
  let value = String(text || "").replace(/\s+/g, " ").trim();
  if (estimateXLength(value) <= max) return value;

  value = value.replace(/\s+$/g, "");
  while (value.length > 0 && estimateXLength(`${value}…`) > max) {
    value = value.slice(0, -1).trimEnd();
  }
  return value ? `${value}…` : "";
}

function slugToUrl(slug) {
  return `${SITE_URL}/posts/${slug}`;
}

function withUtm(rawUrl, campaign, content = "") {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("utm_source", "x");
    url.searchParams.set("utm_medium", "social");
    url.searchParams.set("utm_campaign", campaign);
    if (content) url.searchParams.set("utm_content", content);
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function sanitizeExcerpt(excerpt) {
  return String(excerpt || "")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim();
}

function extractTakeaway(excerpt, max = 130) {
  const cleaned = sanitizeExcerpt(excerpt)
    .replace(/^AI Signals[:\-\s]+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "What matters, what changes, and what to do next.";
  return clamp(cleaned, max);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function ensureStateShape(raw) {
  const state = raw && typeof raw === "object" ? raw : {};
  return {
    version: 1,
    posts: state.posts && typeof state.posts === "object" ? state.posts : {},
    engagement: state.engagement && typeof state.engagement === "object" ? state.engagement : {},
    weeklyThreads: state.weeklyThreads && typeof state.weeklyThreads === "object" ? state.weeklyThreads : {},
  };
}

async function readPostsIndexEn() {
  const raw = await readJson(POSTS_INDEX_EN_PATH, { posts: [] });
  const posts = safeArray(raw.posts)
    .map((post) => ({
      slug: String(post.slug || "").trim(),
      title: String(post.title || "").trim(),
      date: String(post.date || "").trim(),
      excerpt: sanitizeExcerpt(post.excerpt || ""),
      category: String(post.category || "").trim(),
      region: String(post.region || "").trim(),
      editorialTemplate: String(post.editorialTemplate || "").trim(),
      readingTimeMinutes:
        typeof post.readingTimeMinutes === "number" && Number.isFinite(post.readingTimeMinutes)
          ? post.readingTimeMinutes
          : Number(post.readingTimeMinutes || 0),
      tags: safeArray(post.tags).map(String),
    }))
    .filter((post) => post.slug && post.title);

  posts.sort((a, b) => {
    const dtA = new Date(a.date).getTime();
    const dtB = new Date(b.date).getTime();
    return dtB - dtA;
  });
  return posts;
}

function getDateKey(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function isoWeekKeyFromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime())) return Number.POSITIVE_INFINITY;
  return Math.abs(Math.round((a.getTime() - b.getTime()) / 86400000));
}

function classifyPost(post) {
  const template = String(post.editorialTemplate || "").toUpperCase();
  if (template === "TUTORIAL" || /tutorial/i.test(post.category || "")) return "tutorial";
  return "article";
}

function composeContentTweet(post) {
  const kind = classifyPost(post);
  const url = withUtm(slugToUrl(post.slug), "x_new_post", kind);
  const title = clamp(post.title, 96);
  const takeaway = extractTakeaway(post.excerpt, 118);
  const reading = post.readingTimeMinutes > 0 ? `${Math.max(1, Math.round(post.readingTimeMinutes))} min read` : null;

  const lead =
    kind === "tutorial"
      ? "New tutorial on AI Signals"
      : "New post on AI Signals";

  const lines = [
    `${lead}: ${title}`,
    "",
    takeaway,
  ];

  if (reading) lines.push("", reading);
  lines.push("", url);

  return hardClampTweet(lines.join("\n"), { urlIncluded: true });
}

function composeEngagementTweetFromPost(post) {
  const title = clamp(post.title, 84);
  const takeaway = extractTakeaway(post.excerpt, 100);
  const prompts = [
    `Quick question after covering "${title}": what's the first thing you'd test before trusting this in production?`,
    `If this was in your stack tomorrow, what would you measure first: quality, latency, cost, or risk?\n\n${takeaway}`,
    `Builders: where do you still prefer human review over AI automation in this kind of workflow?\n\nContext: ${title}`,
    `One practical debate for small teams:\n\nShip early with guardrails, or wait for more reliability data?\n\nContext: ${title}`,
    `What's the bigger mistake right now: over-automating too soon, or waiting too long to test?\n\nWe just covered: ${title}`,
  ];

  // Deterministic daily variation using the post slug hash.
  let hash = 0;
  for (const ch of post.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const body = prompts[hash % prompts.length];
  return hardClampTweet(body, { urlIncluded: false, hardMax: 280 });
}

async function maybeImproveTweetWithLlm(text, mode, context = {}) {
  if (!OPENAI_API_KEY) return text;
  const hadUrl = /https?:\/\//.test(text);

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const instruction =
    mode === "weekly-thread"
      ? "Rewrite this tweet thread item for X. Keep it clear, sharp, English-only, and useful for builders/small teams. Keep facts unchanged."
      : mode === "engagement"
        ? "Rewrite this engagement post for X. English-only. Keep it conversational, specific, and non-cringe. No hype."
        : "Rewrite this post for X. English-only. Clear, concise, useful, non-clickbait.";

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: "Return only the final X post text. No quotes. No markdown fences." },
        {
          role: "user",
          content:
            `${instruction}\n` +
            `Hard limit: 280 chars.\n` +
            `Keep URLs unchanged if present.\n` +
            `Text:\n${text}\n\n` +
            `Context:\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    });
    const out = String(completion.choices?.[0]?.message?.content || "").trim();
    if (!out) return text;
    if (hadUrl && !/https?:\/\//.test(out)) return text;
    return hardClampTweet(out, { urlIncluded: /https?:\/\//.test(out) });
  } catch (error) {
    console.warn(`[send-x] LLM rewrite skipped (${mode}): ${error.message}`);
    return text;
  }
}

function hardClampTweet(text, { urlIncluded = false, hardMax = 280 } = {}) {
  const compact = String(text || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const targetMax = urlIncluded ? Math.min(hardMax, 270) : hardMax;
  if (estimateXLength(compact) <= targetMax) return compact;

  // Preserve final URL line if present.
  const lines = compact.split("\n");
  const urlLineIndex = lines.findIndex((line) => /https?:\/\/\S+/i.test(line));
  if (urlLineIndex !== -1) {
    const urlLine = lines[urlLineIndex];
    const otherLines = lines.filter((_, idx) => idx !== urlLineIndex).join("\n");
    const maxWithoutUrl = Math.max(40, targetMax - estimateXLength(urlLine) - 1);
    return `${clampByXLength(otherLines, maxWithoutUrl)}\n${urlLine}`.trim();
  }

  return clampByXLength(compact, targetMax);
}

async function readLatestNewsletterIssue() {
  try {
    const files = (await fs.readdir(NEWSLETTERS_DIR)).filter((f) => f.endsWith(".md") || f.endsWith(".mdx")).sort();
    if (files.length === 0) return null;
    const fileName = files[files.length - 1];
    const slug = fileName.replace(/\.(md|mdx)$/u, "");
    const raw = await fs.readFile(path.join(NEWSLETTERS_DIR, fileName), "utf8");
    const parsed = matter(raw);
    return {
      slug,
      title: String(parsed.data?.title || slug),
      date: String(parsed.data?.date || slug.slice(0, 10)),
      issueNumber:
        typeof parsed.data?.issueNumber === "number" && Number.isFinite(parsed.data.issueNumber)
          ? parsed.data.issueNumber
          : Number(parsed.data?.issueNumber || 0),
      excerpt: sanitizeExcerpt(parsed.data?.excerpt || ""),
    };
  } catch {
    return null;
  }
}

function createTwitterClient() {
  if (DRY_RUN) return null;
  ensureEnv("X_API_KEY", X_API_KEY);
  ensureEnv("X_API_SECRET", X_API_SECRET);
  ensureEnv("X_ACCESS_TOKEN", X_ACCESS_TOKEN);
  ensureEnv("X_ACCESS_TOKEN_SECRET", X_ACCESS_TOKEN_SECRET);

  const client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  });
  return client.readWrite;
}

async function sendTweet(rwClient, text, { replyToId = null } = {}) {
  if (DRY_RUN) {
    console.log(`[send-x] DRY_RUN tweet${replyToId ? ` replyTo=${replyToId}` : ""}:\n${text}\n---`);
    return { id: `dry_${Math.random().toString(36).slice(2, 10)}` };
  }

  const payload = replyToId ? { text, reply: { in_reply_to_tweet_id: replyToId } } : { text };
  const res = await rwClient.v2.tweet(payload);
  const id = res?.data?.id;
  if (!id) throw new Error("X API did not return tweet id");
  return { id, raw: res };
}

function pickUnpostedContentPosts(posts, state) {
  const selected = [];
  const forced = X_POST_SLUGS.length > 0;
  const candidates = forced ? posts.filter((p) => X_POST_SLUGS.includes(p.slug)) : posts;

  for (const post of candidates) {
    if (selected.length >= X_NEW_POST_LIMIT) break;
    if (!post.slug) continue;
    if (state.posts[post.slug]) continue;

    // Prioritize recent content for autonomous posting.
    if (!forced) {
      const ageDays = daysBetween(post.date, new Date().toISOString().slice(0, 10));
      if (ageDays > 14) continue;
    }

    selected.push(post);
  }

  return selected;
}

async function runNewPostsMode({ rwClient, posts, state }) {
  const selected = pickUnpostedContentPosts(posts, state);
  if (selected.length === 0) {
    console.log("[send-x] new-posts: no eligible unposted EN posts found.");
    return { changed: false, posted: 0 };
  }

  let posted = 0;
  for (const post of selected) {
    let text = composeContentTweet(post);
    text = await maybeImproveTweetWithLlm(text, "new-posts", {
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      template: post.editorialTemplate,
      region: post.region,
    });
    const sent = await sendTweet(rwClient, text);
    state.posts[post.slug] = {
      tweetId: sent.id,
      postedAt: new Date().toISOString(),
      mode: "new-posts",
      category: classifyPost(post),
      title: post.title,
    };
    posted += 1;
  }

  console.log(`[send-x] new-posts: posted=${posted}`);
  return { changed: posted > 0, posted };
}

function pickEngagementSourcePost(posts, state) {
  const todayKey = getDateKey(X_TIMEZONE);
  if (state.engagement[todayKey]) return null;

  const recent = posts.filter((post) => daysBetween(post.date, todayKey) <= 21);
  for (const post of recent) {
    const previousEntries = Object.values(state.engagement || {}).filter((entry) => entry && entry.sourceSlug === post.slug);
    const recentlyUsed = previousEntries.some((entry) => daysBetween(entry.dateKey || todayKey, todayKey) < 14);
    if (!recentlyUsed) return post;
  }
  return recent[0] || null;
}

async function runEngagementMode({ rwClient, posts, state }) {
  let posted = 0;

  for (let i = 0; i < X_ENGAGEMENT_LIMIT; i += 1) {
    const sourcePost = pickEngagementSourcePost(posts, state);
    if (!sourcePost) {
      if (i === 0) console.log("[send-x] engagement: no eligible source post (already posted today or no posts).");
      break;
    }

    const dateKey = getDateKey(X_TIMEZONE);
    let text = composeEngagementTweetFromPost(sourcePost);
    text = await maybeImproveTweetWithLlm(text, "engagement", {
      title: sourcePost.title,
      excerpt: sourcePost.excerpt,
      region: sourcePost.region,
      audience: "builders and small teams",
    });
    const sent = await sendTweet(rwClient, text);

    state.engagement[dateKey] = {
      tweetId: sent.id,
      postedAt: new Date().toISOString(),
      dateKey,
      sourceSlug: sourcePost.slug,
      title: sourcePost.title,
    };

    posted += 1;
    // One/day by default. If >1 configured, we still only mark current date once; avoid duplicates.
    break;
  }

  console.log(`[send-x] engagement: posted=${posted}`);
  return { changed: posted > 0, posted };
}

function pickWeeklyPosts(posts, nowKey) {
  return posts.filter((post) => daysBetween(post.date, nowKey) <= 7).slice(0, X_THREAD_MAX_POSTS);
}

function composeWeeklyThreadTweets(posts, newsletterIssue) {
  const dateKey = getDateKey(X_TIMEZONE);
  const weekKey = FORCED_WEEKLY_KEY || isoWeekKeyFromDateKey(dateKey);
  const intro =
    `AI Signals weekly recap (${weekKey})\n\n` +
    `What mattered in AI this week for builders + small teams 👇`;

  const tweets = [hardClampTweet(intro, { hardMax: 260 })];

  for (const post of posts.slice(0, X_THREAD_MAX_POSTS)) {
    const url = withUtm(slugToUrl(post.slug), "x_weekly_thread", "thread");
    const title = clamp(post.title, 86);
    const takeaway = extractTakeaway(post.excerpt, 92);
    const label = classifyPost(post) === "tutorial" ? "Tutorial" : "Signal";
    const line = `${label}: ${title}\n\n${takeaway}\n\n${url}`;
    tweets.push(hardClampTweet(line, { urlIncluded: true, hardMax: 280 }));
  }

  let cta = `Full posts + tutorials: ${SITE_URL}/newsletter`;
  if (newsletterIssue?.slug) {
    const issueUrl = withUtm(`${SITE_URL}/newsletter/${newsletterIssue.slug}`, "x_weekly_thread", "newsletter");
    cta =
      `Want the full weekly breakdown?\n` +
      `${clamp(newsletterIssue.title || "AI Signals Weekly", 110)}\n\n${issueUrl}`;
  }
  tweets.push(hardClampTweet(cta, { urlIncluded: true, hardMax: 280 }));

  return tweets;
}

async function runWeeklyThreadMode({ rwClient, posts, state }) {
  const dateKey = getDateKey(X_TIMEZONE);
  const weekKey = FORCED_WEEKLY_KEY || isoWeekKeyFromDateKey(dateKey);

  if (state.weeklyThreads[weekKey]) {
    console.log(`[send-x] weekly-thread: already posted for ${weekKey} at ${state.weeklyThreads[weekKey].postedAt}`);
    return { changed: false, posted: 0 };
  }

  const weeklyPosts = pickWeeklyPosts(posts, dateKey);
  if (weeklyPosts.length === 0) {
    console.log("[send-x] weekly-thread: no posts in the last 7 days.");
    return { changed: false, posted: 0 };
  }

  const newsletterIssue = await readLatestNewsletterIssue();
  let tweets = composeWeeklyThreadTweets(weeklyPosts, newsletterIssue);
  const improved = [];
  for (let i = 0; i < tweets.length; i += 1) {
    improved.push(
      await maybeImproveTweetWithLlm(tweets[i], "weekly-thread", {
        index: i + 1,
        total: tweets.length,
        kind: i === 0 ? "intro" : i === tweets.length - 1 ? "cta" : "post",
      }),
    );
  }
  tweets = improved;

  let rootId = null;
  const tweetIds = [];
  for (let i = 0; i < tweets.length; i += 1) {
    const sent = await sendTweet(rwClient, tweets[i], { replyToId: i === 0 ? null : tweetIds[i - 1] });
    if (i === 0) rootId = sent.id;
    tweetIds.push(sent.id);
  }

  state.weeklyThreads[weekKey] = {
    tweetId: rootId,
    tweetIds,
    postedAt: new Date().toISOString(),
    weekKey,
    slugs: weeklyPosts.map((post) => post.slug),
    newsletterSlug: newsletterIssue?.slug || null,
  };

  console.log(`[send-x] weekly-thread: posted=${tweetIds.length} tweets week=${weekKey}`);
  return { changed: true, posted: tweetIds.length };
}

async function main() {
  // Keep bearer token optional but surface if configured for diagnostics.
  if (X_BEARER_TOKEN) {
    console.log("[send-x] X_BEARER_TOKEN configured (unused for write path).");
  }

  const [rawState, posts] = await Promise.all([readJson(STATE_PATH, {}), readPostsIndexEn()]);
  const state = ensureStateShape(rawState);
  const rwClient = createTwitterClient();

  let result = { changed: false, posted: 0 };
  if (MODE === "new-posts") {
    result = await runNewPostsMode({ rwClient, posts, state });
  } else if (MODE === "engagement") {
    result = await runEngagementMode({ rwClient, posts, state });
  } else if (MODE === "weekly-thread") {
    result = await runWeeklyThreadMode({ rwClient, posts, state });
  } else {
    throw new Error(`Unsupported X_MODE="${MODE}". Expected new-posts | engagement | weekly-thread`);
  }

  if (result.changed && !DRY_RUN) {
    await writeJson(STATE_PATH, state);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
