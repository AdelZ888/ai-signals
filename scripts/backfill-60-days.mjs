import { pathToFileURL } from "node:url";

import "./load-env.mjs";

import { compactQueue } from "./compact-queue.mjs";
import { discoverTopics } from "./discover-topics.mjs";
import { generatePost } from "./generate-post.mjs";

function clampInt(value, { min, max }, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.min(max, Math.max(min, rounded));
}

function toUtcDateString(date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoMs(iso) {
  const ms = new Date(String(iso || "")).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function withinRangeMs(ms, startMs, endMsInclusive) {
  if (!Number.isFinite(ms)) return false;
  return ms >= startMs && ms <= endMsInclusive;
}

function addUtcDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function pickBackfillCandidates(queue, { startMs, endMsInclusive }) {
  const items = Array.isArray(queue?.items) ? queue.items : [];

  return items
    .filter((item) => item && item.status === "queued" && item.id && item.link)
    .map((item) => {
      const ms = parseIsoMs(item.publishedAt);
      return { item, ms };
    })
    .filter(({ ms }) => ms !== null && withinRangeMs(ms, startMs, endMsInclusive))
    .map(({ item, ms }) => ({ ...item, __ms: ms }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

function selectSpreadAcrossDays(candidates, { count, startUtc, days }) {
  if (candidates.length === 0) return [];

  const binSizeDays = Math.max(1, Math.floor(days / count));
  const used = new Set();
  const selected = [];

  for (let i = 0; i < count; i += 1) {
    const binStart = addUtcDays(startUtc, i * binSizeDays);
    const binEndExclusive = i === count - 1 ? addUtcDays(startUtc, days) : addUtcDays(startUtc, (i + 1) * binSizeDays);
    const startMs = binStart.getTime();
    const endMsExclusive = binEndExclusive.getTime();

    const bin = candidates.filter((c) => !used.has(c.id) && c.__ms >= startMs && c.__ms < endMsExclusive);
    if (bin.length === 0) continue;
    const best = bin[0];
    used.add(best.id);
    selected.push(best);
  }

  if (selected.length >= count) return selected.slice(0, count);

  for (const c of candidates) {
    if (selected.length >= count) break;
    if (used.has(c.id)) continue;
    used.add(c.id);
    selected.push(c);
  }

  return selected.slice(0, count);
}

async function backfill60Days() {
  const count = clampInt(process.env.BACKFILL_COUNT ?? 30, { min: 5, max: 120 }, 30);
  const days = clampInt(process.env.BACKFILL_DAYS ?? 60, { min: 14, max: 120 }, 60);

  // End at "yesterday" (UTC) to avoid publishing backfill on the same day as the daily automation.
  const now = new Date();
  const endUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endDateUtc = addUtcDays(endUtc, -1);
  const startDateUtc = addUtcDays(endDateUtc, -(days - 1));

  const endMsInclusive = endDateUtc.getTime() + 24 * 60 * 60 * 1000 - 1;
  const startMs = startDateUtc.getTime();

  console.log(`[backfill] Target: ${count} posts across last ${days} days (${toUtcDateString(startDateUtc)} → ${toUtcDateString(endDateUtc)})`);

  // Temporarily widen queue retention + feed depth so we can sample topics across the full window.
  const prev = {
    DISCOVER_FEED_ITEMS: process.env.DISCOVER_FEED_ITEMS,
    QUEUE_TTL_DAYS_QUEUED: process.env.QUEUE_TTL_DAYS_QUEUED,
    QUEUE_MAX_QUEUED: process.env.QUEUE_MAX_QUEUED,
  };
  process.env.DISCOVER_FEED_ITEMS = String(process.env.DISCOVER_FEED_ITEMS || 80);
  process.env.QUEUE_TTL_DAYS_QUEUED = String(process.env.QUEUE_TTL_DAYS_QUEUED || Math.max(90, days + 10));
  process.env.QUEUE_MAX_QUEUED = String(process.env.QUEUE_MAX_QUEUED || 400);

  const discovered = await discoverTopics();

  const candidates = pickBackfillCandidates(discovered, { startMs, endMsInclusive });
  if (candidates.length === 0) {
    throw new Error("[backfill] No queued topics found in the requested date range. Try increasing DISCOVER_FEED_ITEMS or adjusting feeds.");
  }

  const selected = selectSpreadAcrossDays(candidates, { count, startUtc: startDateUtc, days });
  console.log(`[backfill] Selected topics: ${selected.length}/${count}`);

  let published = 0;
  const attempted = new Set();

  for (const topic of selected) {
    const publishDate = String(topic.publishedAt || "").slice(0, 10) || toUtcDateString(new Date(topic.__ms));
    console.log(`[backfill] Publishing ${publishDate} topic="${topic.title}" source="${topic.source}"`);

    attempted.add(topic.id);

    process.env.PUBLISH_DATE = publishDate;
    process.env.FORCE_TOPIC_ID = String(topic.id);
    delete process.env.FORCE_TEMPLATE;

    const out = await generatePost();
    delete process.env.FORCE_TOPIC_ID;

    if (out) {
      published += 1;
      continue;
    }
  }

  // Fill any gaps with remaining candidates.
  if (published < count) {
    console.log(`[backfill] Filling gaps: need ${count - published} more posts`);

    for (const topic of candidates) {
      if (published >= count) break;
      if (attempted.has(topic.id)) continue;

      const publishDate = String(topic.publishedAt || "").slice(0, 10) || toUtcDateString(new Date(topic.__ms));
      console.log(`[backfill] Publishing (fill) ${publishDate} topic="${topic.title}" source="${topic.source}"`);

      attempted.add(topic.id);
      process.env.PUBLISH_DATE = publishDate;
      process.env.FORCE_TOPIC_ID = String(topic.id);
      delete process.env.FORCE_TEMPLATE;

      const out = await generatePost();
      delete process.env.FORCE_TOPIC_ID;

      if (out) published += 1;
    }
  }

  delete process.env.PUBLISH_DATE;

  // Restore env overrides and compact the queue back to normal defaults.
  process.env.DISCOVER_FEED_ITEMS = prev.DISCOVER_FEED_ITEMS;
  process.env.QUEUE_TTL_DAYS_QUEUED = prev.QUEUE_TTL_DAYS_QUEUED;
  process.env.QUEUE_MAX_QUEUED = prev.QUEUE_MAX_QUEUED;

  // Ensure undefined values don't linger as the string "undefined".
  for (const key of Object.keys(prev)) {
    if (prev[key] === undefined) delete process.env[key];
  }

  await compactQueue();

  if (published < count) {
    throw new Error(`[backfill] Backfill incomplete: published ${published}/${count}. See topics-queue.json for failures.`);
  }

  console.log(`[backfill] Done: published ${published}/${count}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await backfill60Days();
}

