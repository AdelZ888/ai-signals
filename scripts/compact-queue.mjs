import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const queuePath = path.join(process.cwd(), "data/topics-queue.json");

const REGIONS = new Set(["US", "UK", "FR", "GLOBAL"]);
const STATUS_PRIORITY = { published: 3, queued: 2, failed: 1 };

function normalizeRegion(value) {
  if (!value) return "GLOBAL";
  const region = String(value).trim().toUpperCase();
  return REGIONS.has(region) ? region : "GLOBAL";
}

function normalizeStatus(value) {
  const raw = String(value || "queued").trim().toLowerCase();
  if (raw === "published") return "published";
  if (raw === "queued") return "queued";
  // Preserve a clear intent for automation skips (duplicates, paywalls, etc.).
  if (raw.startsWith("skipped")) return "failed";
  return "failed";
}

function clampInt(value, { min, max }, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.min(max, Math.max(min, rounded));
}

function clampNumber(value, { min, max }, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function toMs(iso) {
  if (!iso) return null;
  const ms = new Date(String(iso)).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function withinDays(iso, days, nowMs) {
  const ms = toMs(iso);
  if (!ms) return false;
  const age = nowMs - ms;
  if (!Number.isFinite(age) || age < 0) return true;
  return age <= days * 24 * 60 * 60 * 1000;
}

function truncate(text, maxChars) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= maxChars) return value;
  return value.slice(0, Math.max(0, maxChars - 1)).trimEnd() + "…";
}

function isManual(item) {
  return String(item?.id || "").startsWith("manual:");
}

function statusKey(item) {
  return STATUS_PRIORITY[normalizeStatus(item?.status)] || 0;
}

function recencyKey(item) {
  return (
    toMs(item?.publishedAtRun) ??
    toMs(item?.failedAtRun) ??
    toMs(item?.publishedAt) ??
    toMs(item?.updatedAt) ??
    0
  );
}

function preferItem(a, b) {
  if (!a) return b;
  if (!b) return a;

  const aStatus = statusKey(a);
  const bStatus = statusKey(b);
  if (aStatus !== bStatus) return aStatus > bStatus ? a : b;

  const aRecency = recencyKey(a);
  const bRecency = recencyKey(b);
  if (aRecency !== bRecency) return aRecency > bRecency ? a : b;

  const aScore = Number(a?.score || 0);
  const bScore = Number(b?.score || 0);
  if (Number.isFinite(aScore) && Number.isFinite(bScore) && aScore !== bScore) return aScore > bScore ? a : b;

  // Stable tie-break: keep the one with a shorter payload.
  const aLen = JSON.stringify(a).length;
  const bLen = JSON.stringify(b).length;
  return aLen <= bLen ? a : b;
}

function compactItem(item, { kind }) {
  const status = normalizeStatus(item.status);
  const out = {
    id: String(item.id || item.link || "").trim(),
    title: truncate(item.title, 220),
    link: String(item.link || item.id || "").trim(),
    summary: "",
    source: truncate(item.source, 120),
    region: normalizeRegion(item.region),
    keywordHits: clampInt(item.keywordHits, { min: 0, max: 50 }, 0),
    publishedAt: item.publishedAt ? String(item.publishedAt) : undefined,
    score: clampNumber(item.score, { min: 0, max: 10000 }, 0),
    status,
  };

  const queuedSummaryMax = 1400;
  const historySummaryMax = 420;
  out.summary = truncate(item.summary, kind === "queued" ? queuedSummaryMax : historySummaryMax);

  if (kind === "queued") {
    if (Array.isArray(item.sourceBundle) && item.sourceBundle.length > 0) {
      out.sourceBundle = item.sourceBundle.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 6);
    }
    return out;
  }

  if (status === "published") {
    out.targetRegion = item.targetRegion ? normalizeRegion(item.targetRegion) : undefined;
    out.editorialTemplate = item.editorialTemplate ? String(item.editorialTemplate) : undefined;
    out.publishedAtRun = item.publishedAtRun ? String(item.publishedAtRun) : undefined;
    out.file = item.file ? String(item.file) : undefined;
    out.fileFr = item.fileFr ? String(item.fileFr) : undefined;
    out.generationMode = item.generationMode ? String(item.generationMode) : undefined;
    out.series = item.series ? String(item.series) : undefined;
    out.difficulty = item.difficulty ? String(item.difficulty) : undefined;
    out.timeToImplementMinutes =
      typeof item.timeToImplementMinutes === "number" && Number.isFinite(item.timeToImplementMinutes)
        ? Math.max(5, Math.min(480, Math.round(item.timeToImplementMinutes)))
        : undefined;
    out.wordsEn =
      typeof item.wordsEn === "number" && Number.isFinite(item.wordsEn) ? Math.max(0, Math.round(item.wordsEn)) : undefined;
    out.wordsFr =
      typeof item.wordsFr === "number" && Number.isFinite(item.wordsFr) ? Math.max(0, Math.round(item.wordsFr)) : undefined;
    return out;
  }

  // failed / skipped
  out.targetRegion = item.targetRegion ? normalizeRegion(item.targetRegion) : undefined;
  out.editorialTemplate = item.editorialTemplate ? String(item.editorialTemplate) : undefined;
  out.failedAtRun = item.failedAtRun ? String(item.failedAtRun) : undefined;
  out.failureReason = truncate(item.failureReason, 520);
  if (item.duplicateOf) out.duplicateOf = String(item.duplicateOf);
  if (item.duplicateSimilarity) out.duplicateSimilarity = clampNumber(item.duplicateSimilarity, { min: 0, max: 1 }, undefined);
  return out;
}

export function compactQueuePayload(payload, options = {}) {
  const nowMs = options.nowMs ?? Date.now();

  const maxQueued = clampInt(process.env.QUEUE_MAX_QUEUED, { min: 40, max: 400 }, 180);
  const maxPublished = clampInt(process.env.QUEUE_MAX_PUBLISHED, { min: 40, max: 500 }, 220);
  const maxFailed = clampInt(process.env.QUEUE_MAX_FAILED, { min: 20, max: 500 }, 200);

  const queuedTtlDays = clampInt(process.env.QUEUE_TTL_DAYS_QUEUED, { min: 3, max: 90 }, 21);
  const publishedTtlDays = clampInt(process.env.QUEUE_TTL_DAYS_PUBLISHED, { min: 30, max: 365 }, 180);
  const failedTtlDays = clampInt(process.env.QUEUE_TTL_DAYS_FAILED, { min: 3, max: 120 }, 30);

  const rawItems = Array.isArray(payload?.items) ? payload.items : [];

  // First pass: merge duplicates by id with a stable preference order.
  const mergedById = new Map();
  for (const raw of rawItems) {
    if (!raw) continue;
    const id = String(raw.id || raw.link || "").trim();
    if (!id) continue;
    const next = {
      ...raw,
      id,
      link: raw.link || id,
      status: normalizeStatus(raw.status),
      region: normalizeRegion(raw.region),
      keywordHits: clampInt(raw.keywordHits, { min: 0, max: 50 }, 0),
    };
    mergedById.set(id, preferItem(mergedById.get(id), next));
  }

  const merged = [...mergedById.values()];

  const queued = [];
  const published = [];
  const failed = [];

  for (const item of merged) {
    const status = normalizeStatus(item.status);
    const manual = isManual(item);

    if (status === "published") {
      if (manual || withinDays(item.publishedAtRun || item.publishedAt, publishedTtlDays, nowMs)) published.push(item);
      continue;
    }

    if (status === "queued") {
      // Drop stale queued topics so the bot doesn't try to publish a week-old item forever.
      if (!manual && item.publishedAt && !withinDays(item.publishedAt, queuedTtlDays, nowMs)) continue;
      queued.push(item);
      continue;
    }

    if (manual || withinDays(item.failedAtRun || item.publishedAt, failedTtlDays, nowMs)) failed.push(item);
  }

  published.sort((a, b) => recencyKey(b) - recencyKey(a));
  queued.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  failed.sort((a, b) => recencyKey(b) - recencyKey(a));

  const nextPublished = published.slice(0, maxPublished).map((item) => compactItem(item, { kind: "published" }));
  const nextQueued = queued.slice(0, maxQueued).map((item) => compactItem(item, { kind: "queued" }));
  const nextFailed = failed.slice(0, maxFailed).map((item) => compactItem(item, { kind: "failed" }));

  return {
    generatedAt: new Date(nowMs).toISOString(),
    items: [...nextPublished, ...nextQueued, ...nextFailed],
  };
}

export async function compactQueue() {
  const raw = await fs.readFile(queuePath, "utf8");
  const parsed = JSON.parse(raw);
  const compacted = compactQueuePayload(parsed);

  await fs.mkdir(path.dirname(queuePath), { recursive: true });
  await fs.writeFile(queuePath, JSON.stringify(compacted, null, 2));

  return compacted;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await compactQueue();
}

