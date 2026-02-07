import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import "./load-env.mjs";

import OpenAI from "openai";
import slugify from "slugify";

const queuePath = path.join(process.cwd(), "data/topics-queue.json");
const postsDir = path.join(process.cwd(), "content/posts");
const postsFrDir = path.join(process.cwd(), "content/posts/fr");
const TARGET_REGIONS = ["US", "UK", "FR"];
const REGIONS = new Set(["US", "UK", "FR", "GLOBAL"]);
const AI_RELEVANCE_REGEX =
  /\b(ai|artificial intelligence|intelligence artificielle|llm|model(s)?|agent(s)?|machine learning|deep learning|reasoning|inference|generative)\b/i;

const MIN_WORDS_EN_DEFAULT = Number(process.env.MIN_WORDS_EN || 900);
const MIN_WORDS_FR_DEFAULT = Number(process.env.MIN_WORDS_FR || 850);
const MAX_WORDS_EN_DEFAULT = Number(process.env.MAX_WORDS_EN || 2200);
// GPT-5 calls can be slow in CI. Default to a safer timeout and allow override.
const OPENAI_TIMEOUT_MS = Math.max(10_000, Math.min(180_000, Number(process.env.OPENAI_TIMEOUT_MS || 90_000)));
const OPENAI_MAX_RETRIES = Math.max(0, Math.min(4, Number(process.env.OPENAI_MAX_RETRIES || 2)));
const STRICT_PUBLISH = String(process.env.STRICT_PUBLISH ?? "1") !== "0";
const ALLOW_FALLBACK_CONTENT = String(process.env.ALLOW_FALLBACK_CONTENT ?? "0") === "1";
const MAX_TOPIC_ATTEMPTS = Math.max(1, Math.min(12, Number(process.env.MAX_TOPIC_ATTEMPTS || 5)));
const LOG_STAGES = String(process.env.LOG_STAGES ?? "1") !== "0";
const SOURCE_FETCH_TIMEOUT_MS = Math.max(3_000, Math.min(30_000, Number(process.env.SOURCE_FETCH_TIMEOUT_MS || 8_000)));
const SOURCE_SNAPSHOT_CHARS = Math.max(1_200, Math.min(8_000, Number(process.env.SOURCE_SNAPSHOT_CHARS || 2_500)));
const SOURCE_FETCH_MAX_BYTES = Math.max(80_000, Math.min(1_500_000, Number(process.env.SOURCE_FETCH_MAX_BYTES || 450_000)));
const MIN_SOURCE_SNAPSHOT_CHARS = Math.max(250, Math.min(4_000, Number(process.env.MIN_SOURCE_SNAPSHOT_CHARS || 650)));
const MIN_SOURCE_SNAPSHOTS = Math.max(1, Math.min(3, Number(process.env.MIN_SOURCE_SNAPSHOTS || 2)));
const DRY_RUN = String(process.env.DRY_RUN || "0") === "1";

const SERIES = [
  {
    id: "agent-playbook",
    label: "Agent Playbook",
    keywords: ["agent", "agents", "agentic", "tool use", "workflow", "orchestration", "planner", "executor", "critic"],
  },
  {
    id: "model-release-brief",
    label: "Model Release Brief",
    keywords: ["release", "launch", "announces", "new model", "checkpoint", "gpt", "gemini", "claude", "mistral", "llama"],
  },
  {
    id: "security-boundary",
    label: "Security Boundary",
    keywords: ["prompt injection", "jailbreak", "exfiltration", "policy", "sandbox", "boundary", "zero trust", "coercion", "security"],
  },
  {
    id: "tooling-deep-dive",
    label: "Tooling Deep Dive",
    keywords: ["sdk", "api", "framework", "library", "runtime", "observability", "eval", "benchmark", "vector", "rag"],
  },
  {
    id: "founder-notes",
    label: "Founder Notes",
    keywords: ["pricing", "roi", "unit economics", "distribution", "gtm", "sales", "founder", "startup"],
  },
];

const SERIES_IDS = new Set(SERIES.map((entry) => entry.id));

const EN_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "about",
  "which",
  "their",
  "there",
  "these",
  "those",
  "while",
  "because",
  "between",
  "without",
  "under",
  "market",
  "teams",
  "model",
  "models",
]);

const FR_STOP_WORDS = new Set([
  "les",
  "des",
  "pour",
  "avec",
  "dans",
  "cette",
  "cet",
  "sur",
  "sans",
  "entre",
  "depuis",
  "comme",
  "leurs",
  "quand",
  "donc",
  "france",
  "equipes",
  "modele",
  "modeles",
]);

// Extra stop words/markers used specifically for short strings (titles/excerpts).
// Keep this separate from the main stop-word sets to avoid impacting similarity scoring.
const EN_META_WORDS = new Set([
  "the",
  "and",
  "or",
  "but",
  "for",
  "with",
  "without",
  "from",
  "into",
  "over",
  "under",
  "about",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "how",
  "what",
  "why",
  "when",
  "will",
  "can",
  "should",
  "new",
  "jobs",
  "job",
  "employment",
  "work",
]);

const FR_META_WORDS = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "de",
  "pour",
  "avec",
  "sans",
  "dans",
  "sur",
  "en",
  "au",
  "aux",
  "comment",
  "quoi",
  "pourquoi",
  "quand",
  "va",
  "peut",
  "doit",
  "emploi",
  "emplois",
  "travail",
  "metier",
  "metiers",
]);

const SIMILARITY_STOP_WORDS = new Set([
  ...EN_STOP_WORDS,
  ...FR_STOP_WORDS,
  // Generic AI/news terms that cause false overlap across unrelated topics.
  "ai",
  "ia",
  "llm",
  "ml",
  "gpt",
  "model",
  "models",
  "modele",
  "modeles",
  "artificial",
  "intelligence",
  "artificielle",
  "news",
  "update",
  "release",
]);

const EDITORIAL_TEMPLATES = {
  NEWS: {
    id: "NEWS",
    category: "News",
    minWordsEn: Math.max(MIN_WORDS_EN_DEFAULT, 950),
    minWordsFr: Math.max(MIN_WORDS_FR_DEFAULT, 900),
    headingsEn: [
      "Builder TL;DR",
      "What changed",
      "Technical teardown (for engineers)",
      "Implementation blueprint (for developers)",
      "Founder lens: cost, moat, and distribution",
      "Regional lens ({region})",
      "US, UK, FR comparison",
      "Ship-this-week checklist",
    ],
    headingsFr: [
      "TL;DR builders",
      "Ce qui a change",
      "Demontage technique (pour ingenieurs)",
      "Plan d'implementation (pour developpeurs)",
      "Vue fondateur: cout, avantage, distribution",
      "Angle regional ({region})",
      "Comparatif US, UK, FR",
      "Checklist a shipper cette semaine",
    ],
  },
  TUTORIAL: {
    id: "TUTORIAL",
    category: "Tutorials",
    minWordsEn: Math.max(MIN_WORDS_EN_DEFAULT, 1200),
    minWordsFr: Math.max(MIN_WORDS_FR_DEFAULT, 1100),
    headingsEn: [
      "Builder TL;DR",
      "Goal and expected outcome",
      "Stack and prerequisites",
      "Step-by-step implementation",
      "Reference architecture",
      "Founder lens: ROI and adoption path",
      "Failure modes and debugging",
      "Production checklist",
    ],
    headingsFr: [
      "TL;DR builders",
      "Objectif et resultat attendu",
      "Stack et prerequis",
      "Implementation pas a pas",
      "Architecture de reference",
      "Vue fondateur: ROI et adoption",
      "Pannes frequentes et debugging",
      "Checklist production",
    ],
  },
  ANALYSIS: {
    id: "ANALYSIS",
    category: "Model Breakdowns",
    minWordsEn: Math.max(MIN_WORDS_EN_DEFAULT, 1100),
    minWordsFr: Math.max(MIN_WORDS_FR_DEFAULT, 1000),
    headingsEn: [
      "Builder TL;DR",
      "Core thesis",
      "Evidence from sources",
      "Technical implications",
      "Founder lens: business consequences",
      "Trade-offs and risks",
      "Decision framework",
      "Metrics to track",
    ],
    headingsFr: [
      "TL;DR builders",
      "These centrale",
      "Evidences issues des sources",
      "Implications techniques",
      "Vue fondateur: consequences business",
      "Compromis et risques",
      "Cadre de decision",
      "Metriques a suivre",
    ],
  },
  SOCIETY: {
    id: "SOCIETY",
    category: "Model Breakdowns",
    minWordsEn: Math.max(MIN_WORDS_EN_DEFAULT, 1100),
    minWordsFr: Math.max(MIN_WORDS_FR_DEFAULT, 1050),
    headingsEn: [
      "TL;DR (jobs + builders)",
      "What the sources actually say",
      "Tasks vs jobs: what's exposed",
      "Three concrete personas (2026 scenarios)",
      "What to do if you're an employee",
      "What to do if you're a founder/manager",
      "France / US / UK lens",
      "Ship-this-week checklist",
    ],
    headingsFr: [
      "TL;DR (emploi + builders)",
      "Ce que disent vraiment les sources",
      "Taches vs emplois: ce qui est expose",
      "Trois personas concrets (scenarios 2026)",
      "Quoi faire si vous etes salarie",
      "Quoi faire si vous etes fondateur/manager",
      "Angle France / US / UK",
      "Checklist a shipper cette semaine",
    ],
  },
};

function resolveForcedTemplate() {
  const raw = String(process.env.FORCE_TEMPLATE || "")
    .trim()
    .toUpperCase();

  if (!raw) return null;

  if (raw in EDITORIAL_TEMPLATES) {
    return EDITORIAL_TEMPLATES[raw];
  }

  console.warn(`Ignoring invalid FORCE_TEMPLATE="${raw}". Expected NEWS, TUTORIAL, ANALYSIS, or SOCIETY.`);
  return null;
}

function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function tokenizeLanguage(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function scoreLanguage(text, language) {
  const tokens = tokenizeLanguage(text);
  if (tokens.length === 0) return 0;

  const stopWords = language === "fr" ? FR_STOP_WORDS : EN_STOP_WORDS;
  const stopHits = tokens.filter((token) => stopWords.has(token)).length;

  if (language === "fr") {
    const frMarkers = String(text || "").match(/[àâçéèêëîïôùûüœ]/gi)?.length || 0;
    return stopHits + frMarkers * 0.4;
  }

  return stopHits;
}

function detectLanguage(text) {
  const enScore = scoreLanguage(text, "en");
  const frScore = scoreLanguage(text, "fr");

  if (enScore >= frScore * 1.2 && enScore >= 4) return "en";
  if (frScore >= enScore * 1.2 && frScore >= 4) return "fr";
  return "unknown";
}

function detectLanguageLoose(text) {
  const tokens = tokenizeLanguage(text);
  if (tokens.length === 0) return "unknown";

  let enHits = 0;
  let frHits = 0;
  for (const token of tokens) {
    if (EN_META_WORDS.has(token)) enHits += 1;
    if (FR_META_WORDS.has(token)) frHits += 1;
  }

  const raw = String(text || "").toLowerCase();
  const accentHits = raw.match(/[àâçéèêëîïôùûüœ]/gi)?.length || 0;
  if (accentHits > 0) frHits += accentHits * 0.4;

  // French contractions ("l'", "d'", "qu'") show up often in headlines.
  if (/(^|\s)(l|d|qu|j|c|t|n|s|m)'[a-z]/i.test(raw)) frHits += 1;

  if (enHits >= frHits + 2 && enHits >= 2) return "en";
  if (frHits >= enHits + 2 && frHits >= 2) return "fr";
  return detectLanguage(text);
}

function tokenizeForSimilarity(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\\s]/g, " ")
    .split(/\\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => {
      if (SIMILARITY_STOP_WORDS.has(token)) return false;
      if (token.length >= 3) return true;
      return token.length >= 2 && /\\d/.test(token);
    });
}

function topicSimilarity(a, b) {
  const aTokens = new Set(tokenizeForSimilarity(`${a.title || ""} ${a.summary || ""} ${a.source || ""}`));
  const bTokens = new Set(tokenizeForSimilarity(`${b.title || ""} ${b.summary || ""} ${b.source || ""}`));
  if (aTokens.size === 0 || bTokens.size === 0) return { overlap: 0, jaccard: 0 };

  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }

  const union = aTokens.size + bTokens.size - overlap;
  const jaccard = union > 0 ? overlap / union : 0;
  return { overlap, jaccard };
}

function normalizeRegion(value) {
  if (!value) return "GLOBAL";
  const region = String(value).trim().toUpperCase();
  return REGIONS.has(region) ? region : "GLOBAL";
}

function detectSeriesId(topic, template) {
  const haystack = `${topic.title || ""} ${topic.summary || ""} ${topic.source || ""} ${topic.link || ""}`.toLowerCase();

  const scoreFor = (series) => series.keywords.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 1 : 0), 0);
  const scored = SERIES.map((series) => ({ id: series.id, score: scoreFor(series) })).sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (top && top.score > 0) return top.id;

  if (template.id === "TUTORIAL") return "tooling-deep-dive";
  if (template.id === "ANALYSIS") return "founder-notes";
  if (template.id === "SOCIETY") return "founder-notes";
  return "model-release-brief";
}

function sanitizeSeriesId(value, fallback) {
  const normalized = String(value || "").trim().toLowerCase();
  return SERIES_IDS.has(normalized) ? normalized : fallback;
}

function clampInt(value, { min, max }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return Math.min(max, Math.max(min, rounded));
}

function dedupeUrls(urls) {
  const seen = new Set();
  const unique = [];

  for (const url of urls) {
    const normalized = String(url || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

function stripHtmlToText(input) {
  return String(input || "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateChars(text, maxChars) {
  const value = String(text || "");
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trim()}…`;
}

function isLikelyPaywalled(text, url) {
  const value = String(text || "").toLowerCase();
  if (!value) return false;

  let host = "";
  try {
    host = new URL(String(url || "")).hostname.toLowerCase();
  } catch {
    host = "";
  }

  const markers = [
    "abonnez-vous",
    "abonnez vous",
    "abonnement",
    "se connecter",
    "connectez-vous",
    "pour lire la suite",
    "deja abonne",
    "déjà abonné",
    "inscrivez-vous",
    "subscribe",
    "sign in",
    "log in",
    "register to continue",
    "create an account",
  ];

  const hasMarker = markers.some((marker) => value.includes(marker));
  if (!hasMarker) return false;

  // Heuristic: paywall stubs tend to be short and repetitive.
  if (host.endsWith("lemonde.fr")) return value.length < 2_000;
  return value.length < 1_200;
}

async function fetchSourceSnapshot(url) {
  const target = String(url || "").trim();
  if (!target) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOURCE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(target, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "blog-auto/1.0 (+https://localhost)",
        accept: "text/html,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) return null;
    const contentType = String(res.headers.get("content-type") || "");
    if (!/text\/html|text\/plain|application\/xml|application\/rss\+xml|application\/atom\+xml/i.test(contentType)) return null;

    const reader = res.body?.getReader();
    if (!reader) {
      const raw = await res.text();
      const text = stripHtmlToText(raw);
      if (!text || text.length < MIN_SOURCE_SNAPSHOT_CHARS) return null;
      if (isLikelyPaywalled(text, target)) return null;
      return { url: target, text: truncateChars(text, SOURCE_SNAPSHOT_CHARS) };
    }

    let received = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > SOURCE_FETCH_MAX_BYTES) break;
        chunks.push(Buffer.from(value));
      }
    }

    const raw = Buffer.concat(chunks).toString("utf8");
    const text = stripHtmlToText(raw);
    if (!text || text.length < MIN_SOURCE_SNAPSHOT_CHARS) return null;
    if (isLikelyPaywalled(text, target)) return null;
    return { url: target, text: truncateChars(text, SOURCE_SNAPSHOT_CHARS) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function getSourceSnapshots(urls) {
  const unique = dedupeUrls(urls).slice(0, 6);
  const snapshots = await Promise.all(unique.map((url) => fetchSourceSnapshot(url)));
  return snapshots.filter(Boolean);
}

function formatSourceSnapshots(snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return "No snapshots available (fetch failed).";
  return snapshots
    .map((snap, idx) => `Source ${idx + 1}: ${snap.url}\nExcerpt: ${snap.text}`)
    .join("\n\n");
}

function getPublishedCounts(queue) {
  const counts = Object.fromEntries(TARGET_REGIONS.map((region) => [region, 0]));

  for (const item of queue.items || []) {
    if (item.status !== "published") continue;
    const region = normalizeRegion(item.targetRegion || item.region);
    if (region in counts) counts[region] += 1;
  }

  return counts;
}

function pickTargetRegion(queue) {
  const counts = getPublishedCounts(queue);
  return TARGET_REGIONS.sort((a, b) => counts[a] - counts[b])[0];
}

function pickTopic(queue, targetRegion) {
  const forcedId = String(process.env.FORCE_TOPIC_ID || "").trim();
  if (forcedId) {
    const match = (queue.items || []).find((item) => String(item.id || "").trim() === forcedId);
    if (match) return match;
    console.warn(`FORCE_TOPIC_ID did not match any topic: ${forcedId}`);
  }

  const queued = (queue.items || [])
    .filter((item) => item.status === "queued")
    .filter((item) => {
      const text = `${item.title || ""} ${item.summary || ""}`;
      return Number(item.keywordHits || 0) >= 2 || AI_RELEVANCE_REGEX.test(text);
    });

  const byScore = (a, b) => (b.score || 0) - (a.score || 0);

  const exact = queued.filter((item) => normalizeRegion(item.region) === targetRegion).sort(byScore);
  if (exact.length > 0) return exact[0];

  const global = queued.filter((item) => normalizeRegion(item.region) === "GLOBAL").sort(byScore);
  if (global.length > 0) return global[0];

  return queued.sort(byScore)[0];
}

function pickSupportingSources(queue, topic, targetRegion, limit = 3) {
  const target = normalizeRegion(targetRegion);

  const candidates = (queue.items || [])
    .filter((item) => item && item.id && item.link)
    .filter((item) => item.id !== topic.id)
    .filter((item) => ["queued", "published"].includes(String(item.status || "queued")));

  const scored = candidates
    .map((item) => {
      const sim = topicSimilarity(topic, item);
      const sameRegion = [target, "GLOBAL"].includes(normalizeRegion(item.region)) ? 1 : 0;
      const sameSource = String(item.source || "") && String(item.source || "") === String(topic.source || "") ? 1 : 0;
      const score = sim.overlap * 10 + sim.jaccard * 12 + sameRegion * 1.5 + sameSource * 1 + Number(item.score || 0) / 150;
      return { item, sim, score };
    })
    .filter(({ sim }) => sim.overlap >= 3 || (sim.overlap >= 2 && sim.jaccard >= 0.08) || sim.jaccard >= 0.14)
    .sort((a, b) => b.score - a.score);

  return dedupeUrls(scored.map(({ item }) => item.link)).slice(0, limit);
}

function buildSourceBundle(queue, topic, targetRegion, template) {
  const primary = String(topic.link || topic.id || "").trim();
  const urls = [];

  if (primary) urls.push(primary);

  const supporting = pickSupportingSources(queue, topic, targetRegion, 4);
  urls.push(...supporting);

  // For SOCIETY posts, keep the bundle smaller to avoid mixing angles.
  const maxSources = template.id === "SOCIETY" ? 2 : 3;
  return dedupeUrls(urls).slice(0, maxSources);
}

function detectEditorialTemplate(topic) {
  const forced = resolveForcedTemplate();
  if (forced) return forced;

  const haystack = `${topic.title || ""} ${topic.summary || ""} ${topic.source || ""}`.toLowerCase();

  // Societal / labor-market topics need a different structure than builder release notes.
  if (/(job|jobs|employment|labor market|labour market|workforce|layoff|layoffs|unemployment|career|reskill|reskilling|upskill|union|workers|wages|productivity|emploi|emplois|travail|chomage|licenciement|reconversion|metier|metiers)/.test(haystack)) {
    return EDITORIAL_TEMPLATES.SOCIETY;
  }

  if (/(tutorial|how to|step-by-step|guide|build|implementation|walkthrough)/.test(haystack)) {
    return EDITORIAL_TEMPLATES.TUTORIAL;
  }

  if (/(arxiv|paper|benchmark|study|analysis|evaluation|reasoning|ablation|research)/.test(haystack)) {
    return EDITORIAL_TEMPLATES.ANALYSIS;
  }

  return EDITORIAL_TEMPLATES.NEWS;
}

function resolveHeadings(headings, targetRegion) {
  return headings.map((heading) => heading.replace("{region}", targetRegion));
}

function getWordTargets(template) {
  const envEn = process.env[`MIN_WORDS_EN_${template.id}`];
  const envFr = process.env[`MIN_WORDS_FR_${template.id}`];

  return {
    minWordsEn: Number(envEn || template.minWordsEn || MIN_WORDS_EN_DEFAULT),
    minWordsFr: Number(envFr || template.minWordsFr || MIN_WORDS_FR_DEFAULT),
    maxWordsEn: MAX_WORDS_EN_DEFAULT,
  };
}

function buildFrontmatter(post, sources, targetRegion, template) {
  const tags = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : ["AI", "News", targetRegion, template.id];
  const safeTitle = String(post.title || "Automated AI update").replace(/"/g, "\\\"");
  const safeExcerpt = String(post.excerpt || "Automated AI update").replace(/"/g, "\\\"");
  const region = normalizeRegion(post.region || targetRegion);
  const category = String(post.category || template.category).replace(/"/g, "\\\"");
  const series = post.series ? String(post.series).replace(/"/g, "\\\"") : "";
  const difficulty = post.difficulty ? String(post.difficulty).replace(/"/g, "\\\"") : "";
  const timeToImplementMinutes =
    typeof post.timeToImplementMinutes === "number" && Number.isFinite(post.timeToImplementMinutes)
      ? Math.max(5, Math.min(480, Math.round(post.timeToImplementMinutes)))
      : null;

  const date = new Date().toISOString().slice(0, 10);

  const extra =
    (series ? `\nseries: "${series}"` : "") +
    (difficulty ? `\ndifficulty: "${difficulty}"` : "") +
    (timeToImplementMinutes ? `\ntimeToImplementMinutes: ${timeToImplementMinutes}` : "");

  return `---\ntitle: "${safeTitle}"\ndate: "${date}"\nexcerpt: "${safeExcerpt}"\nregion: "${region}"\ncategory: "${category}"${extra}\neditorialTemplate: "${template.id}"\ntags:\n${tags
    .map((tag) => `  - "${String(tag).replace(/"/g, "\\\"")}"`)
    .join("\n")}\nsources:\n${sources.map((source) => `  - "${source}"`).join("\n")}\n---\n`;
}

function padToMinWords(content, minWords, mode) {
  // Fallback-only padding: keep it short and varied (avoid repeated filler).
  const padParagraphs =
    mode === "fr"
      ? [
          "\n\nNote: ajoutez des metriques mesurables (latence, cout, taux d'erreur) et des gates de release pour transformer l'analyse en execution.",
          "\n\nConcretement, liez chaque recommandation a une decision d'architecture, un signal observable, et un plan de rollback.",
          "\n\nSi vous manquez de preuves, marquez clairement ce qui est confirme vs hypothese, et renvoyez vers les sources.",
        ]
      : [
          "\n\nNote: add measurable metrics (latency, cost, error rate) and release gates to turn analysis into execution.",
          "\n\nConcretely, tie each recommendation to an architecture choice, an observable signal, and a rollback plan.",
          "\n\nIf evidence is thin, clearly separate confirmed facts vs hypotheses, and point to sources.",
        ];

  let result = content;
  let index = 0;
  while (countWords(result) < minWords) {
    result += padParagraphs[index % padParagraphs.length];
    index += 1;
  }

  return result;
}

function splitByH2(markdown) {
  // Prepend newline so a leading "## ..." at the start of the document is parsed as a section.
  const parts = `\n${String(markdown || "")}`.split(/\n##\s+/);
  if (parts.length <= 1) return [];

  const sections = [];
  for (let i = 1; i < parts.length; i += 1) {
    const chunk = parts[i];
    const firstLineBreak = chunk.indexOf("\n");
    const heading = (firstLineBreak === -1 ? chunk : chunk.slice(0, firstLineBreak)).trim();
    const body = (firstLineBreak === -1 ? "" : chunk.slice(firstLineBreak + 1)).trim();
    sections.push({ heading, body });
  }
  return sections;
}

function normalizeHeadingKey(heading) {
  return String(heading || "")
    .trim()
    .toLowerCase()
    .replace(/[:.]+$/g, "")
    .replace(/\s+/g, " ");
}

function validateDraft(markdown, headings, sources, templateId) {
  const issues = [];
  const sections = splitByH2(markdown);
  const byHeading = new Map(sections.map((s) => [normalizeHeadingKey(s.heading), s.body]));

  for (const heading of headings) {
    const body = byHeading.get(normalizeHeadingKey(heading));
    if (!body) {
      issues.push(`Missing section: ${heading}`);
      continue;
    }
    const usedSources = sources.filter((source) => body.includes(source));
    const hasSourceLink = usedSources.length > 0;
    if (!hasSourceLink) {
      issues.push(`Section "${heading}" is missing an inline source link (must include one of the provided URLs).`);
    }
  }

  const sourcesUsedInDoc = sources.filter((source) => String(markdown || "").includes(source));
  if (sourcesUsedInDoc.length < Math.min(2, sources.length)) {
    issues.push("Not enough distinct sources are referenced across the draft. Use at least two different provided URLs.");
  }

  const missingSources = sources.filter((source) => !String(markdown || "").includes(source));
  if (missingSources.length > 0 && sources.length > 1) {
    issues.push(
      `Some provided sources are never cited inline: ${missingSources.slice(0, 2).join(", ")}${missingSources.length > 2 ? "..." : ""}`,
    );
  }

  const codeBlocks = String(markdown || "").match(/```[\s\S]*?```/g) || [];
  if (templateId === "TUTORIAL" && codeBlocks.length < 2) issues.push("Tutorial should include at least two code blocks (commands + config/code).");
  if (templateId === "SOCIETY" && codeBlocks.length > 0) issues.push("Society post should not include code blocks.");
  if (!/\|[^\n]*\|\n\| *-+/.test(markdown)) issues.push("Missing at least one markdown table (decision frame or comparison).");
  if (!/\n- \[ \]/.test(markdown)) issues.push("Missing a checklist with task boxes ('- [ ]').");

  const minNumbers = templateId === "TUTORIAL" ? 8 : templateId === "SOCIETY" ? 5 : 6;
  const numbers = (markdown.match(/\b\d+(\.\d+)?\b/g) || []).length;
  if (numbers < minNumbers) issues.push("Too few concrete numbers/thresholds. Add more measurable targets (%, ms, $, counts).");

  const disclaimerMatches =
    String(markdown || "").match(
      /(not present in the excerpt|excerpt does not|cannot confirm|not provided in the excerpt|l['’]extrait ne|pas present dans l['’]extrait|impossible de confirmer)/gi,
    ) || [];
  const maxDisclaimers = templateId === "SOCIETY" ? 1 : 2;
  if (disclaimerMatches.length > maxDisclaimers) {
    issues.push(
      "Too many source-disclaimer sentences (e.g. 'not present in the excerpt'). Keep methodology to one short note; omit unsupported details or move them to the final assumptions section.",
    );
  }

  const lastHeading = headings[headings.length - 1];
  const lastBody = lastHeading ? byHeading.get(normalizeHeadingKey(lastHeading)) || "" : "";
  if (lastBody) {
    const hasAssumptions = /###\s+(assumptions|hypotheses|hypoth[eè]ses|assumptions & unknowns)/i.test(lastBody);
    const hasRisks = /###\s+(risks|risk|risques|risque|mitigations|mitigation)/i.test(lastBody);
    const hasNext = /###\s+(next steps|next actions|actions|prochaines etapes|prochaines actions|a shipper|a faire)/i.test(lastBody);
    if (!hasAssumptions) issues.push(`Last section "${lastHeading}" should include a '### Assumptions / Hypotheses' subsection.`);
    if (!hasRisks) issues.push(`Last section "${lastHeading}" should include a '### Risks / Mitigations' subsection.`);
    if (!hasNext) issues.push(`Last section "${lastHeading}" should include a '### Next steps' subsection.`);
  }

  if (templateId === "TUTORIAL") {
    const hasCommandBlock = /```bash|```sh|```shell/i.test(markdown) || /\n\$\s+/.test(markdown);
    if (!hasCommandBlock) issues.push("Tutorial missing a command-line snippet (```bash``` or '$ ...').");

    const hasConfigHint = /```ya?ml|```json|\.env|dockerfile|compose\.ya?ml/i.test(markdown);
    if (!hasConfigHint) issues.push("Tutorial missing a concrete config artifact (YAML/JSON/.env/Dockerfile).");

    const hasRollout = /(rollout|rollback|canary|feature flag|release gate|gates)/i.test(markdown);
    if (!hasRollout) issues.push("Tutorial should include a rollout/rollback plan (canary, gates, rollback).");

    const stepHeading = headings.find((heading) => /step-by-step|pas a pas/i.test(heading));
    if (stepHeading) {
      const stepBody = byHeading.get(normalizeHeadingKey(stepHeading)) || "";
      const hasNumberedSteps = /^\s*1\.\s+/m.test(stepBody) || /^\s*1\)\s+/m.test(stepBody);
      if (!hasNumberedSteps) issues.push(`Tutorial missing clear numbered steps inside "${stepHeading}".`);
    }
  }

  if (templateId === "SOCIETY") {
    const personaHeading = headings.find((heading) => /persona/i.test(heading)) || "";
    if (personaHeading) {
      const personaBody = byHeading.get(normalizeHeadingKey(personaHeading)) || "";
      const personaHits = (personaBody.match(/\b(persona|profil)\b/gi) || []).length;
      const hasThree = personaHits >= 3 || (personaBody.match(/^\s*-\s+/gm) || []).length >= 6;
      if (!hasThree) issues.push(`Society post should include 3 distinct personas inside "${personaHeading}".`);
    }

    const jobMentions =
      String(markdown || "").match(
        /\b(job|jobs|employment|workforce|worker|workers|wage|wages|layoff|layoffs|reskill|reskilling|upskill|career|profession|role|roles|task|tasks|emploi|emplois|travail|salarie|salari[eé]s|metier|metiers|reconversion|licenciement|chomage|taches)\b/gi,
      ) || [];
    if (jobMentions.length < 10) {
      issues.push("Society post must explicitly cover jobs/work/tasks throughout (add more concrete job/employment vocabulary and examples).");
    }

    const employeeHeading = headings.find((heading) => /employee|salarie/i.test(heading));
    if (employeeHeading) {
      const employeeBody = byHeading.get(normalizeHeadingKey(employeeHeading)) || "";
      const bulletCount = (employeeBody.match(/^\s*-\s+/gm) || []).length;
      if (bulletCount < 4) issues.push(`Society post should include a concrete bullet list in "${employeeHeading}".`);
    }

    const founderHeading = headings.find((heading) => /founder|manager|fondateur/i.test(heading));
    if (founderHeading) {
      const founderBody = byHeading.get(normalizeHeadingKey(founderHeading)) || "";
      const bulletCount = (founderBody.match(/^\s*-\s+/gm) || []).length;
      if (bulletCount < 4) issues.push(`Society post should include a concrete bullet list in "${founderHeading}".`);
    }

    const hasFileArtifacts = /\.(py|ya?ml|json|ts|tsx|js|mjs|sh|bash|sql)\b/i.test(markdown);
    if (hasFileArtifacts) issues.push("Society post should not invent file names or repo artifacts (e.g. *.py, *.yaml).");
  }

  return issues;
}

function shouldRepairMeta({ locale, title, excerpt, topic }) {
  const desired = locale === "fr" ? "fr" : "en";
  const titleLang = detectLanguageLoose(title);
  const excerptLang = detectLanguageLoose(excerpt);

  if (desired === "en" && (titleLang === "fr" || excerptLang === "fr")) {
    return { reason: "meta language mismatch", titleLang, excerptLang };
  }
  if (desired === "fr" && (titleLang === "en" || excerptLang === "en")) {
    return { reason: "meta language mismatch", titleLang, excerptLang };
  }

  const sim = topicSimilarity({ title, summary: excerpt, source: "" }, topic);
  if (sim.overlap <= 1 && sim.jaccard < 0.06) {
    return { reason: "meta drift from topic", sim };
  }

  return null;
}

async function repairMeta(client, model, { locale, topic, template, currentTitle, currentExcerpt, currentTags, content, sourceSnapshots }) {
  const language = locale === "fr" ? "French" : "English";
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);
  const contentPreview = truncateChars(String(content || "").trim(), 3_000);
  const tagsBlock = Array.isArray(currentTags) && currentTags.length > 0 ? currentTags.slice(0, 8).join(", ") : "";

  const extraRule =
    template.id === "SOCIETY"
      ? "- This is a jobs/work topic. Keep the framing about tasks, roles, work, and employment outcomes.\n"
      : "";

  const response = await runJsonCompletion(
    client,
    model,
    [
      {
        role: "system",
        content: `You are a senior editor. Return strict JSON with keys: title, excerpt, tags (array). Write in ${language}.`,
      },
      {
        role: "user",
        content:
          `Rewrite the title and excerpt so they match the article content AND the source snapshots.\n\n` +
          `Rules:\n` +
          `- Language: ${language} only.\n` +
          `- Title: specific and non-clickbait; avoid hype and avoid pure translation of a French headline into EN.\n` +
          `- Excerpt: 140-190 characters; describe the value and create curiosity that encourages reading the full post.\n` +
          extraRule +
          `- Avoid infra jargon unless it is clearly supported by the snapshots.\n\n` +
          `Topic (RSS): ${topic.title}\n` +
          `Topic summary: ${topic.summary}\n\n` +
          `Current title: ${currentTitle}\n` +
          `Current excerpt: ${currentExcerpt}\n` +
          (tagsBlock ? `Current tags: ${tagsBlock}\n\n` : "\n") +
          `Article content preview:\n${contentPreview}\n\n` +
          `Snapshot excerpts:\n${snapshotBlock}`,
      },
    ],
    0.15,
  );

  const nextTitle = String(response.title || currentTitle || "").trim() || String(currentTitle || "").trim();
  const nextExcerpt = String(response.excerpt || currentExcerpt || "").trim() || String(currentExcerpt || "").trim();
  const nextTags = Array.isArray(response.tags) ? response.tags.slice(0, 8) : Array.isArray(currentTags) ? currentTags.slice(0, 8) : [];

  return { title: nextTitle, excerpt: nextExcerpt, tags: nextTags };
}

async function runRepairPass(
  client,
  model,
  { locale, headings, sources, draft, issues, targetWordCount, sourceSnapshots, templateId },
) {
  const language = locale === "fr" ? "French" : "English";
  const sourceBlock = sources.map((source) => `- ${source}`).join("\n");
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);
  const requiredSubheads =
    locale === "fr"
      ? ["### Hypotheses / inconnues", "### Risques / mitigations", "### Prochaines etapes"]
      : ["### Assumptions / Hypotheses", "### Risks / Mitigations", "### Next steps"];
  const minNumbers = templateId === "TUTORIAL" ? 8 : templateId === "SOCIETY" ? 5 : 6;
  const codeRule =
    templateId === "TUTORIAL"
      ? "- Include at least two fenced code blocks (commands + config/code).\n"
      : templateId === "SOCIETY"
        ? "- Do NOT include code blocks.\n"
        : "- Code blocks are optional; avoid invented filenames or fake repos.\n";

  const response = await runJsonCompletion(
    client,
    model,
    [
      {
        role: "system",
        content:
          `You are a meticulous technical editor. Rewrite the article in ${language} to fix issues without adding filler. ` +
          "Return strict JSON with keys: content (markdown). Use exactly the provided H2 headings in order. " +
          `In the last H2 section, include these exact H3 subheads:\n${requiredSubheads.join("\n")}`,
      },
      {
        role: "user",
        content:
          `Fix the following issues:\n- ${issues.join("\n- ")}\n\n` +
          `Requirements:\n` +
          `- Keep exactly these H2 headings in order:\n${headings.map((h) => `## ${h}`).join("\n")}\n` +
          `- Every required section must start with '## ' exactly. Do not use H1. Do not add extra H2 headings.\n` +
          `- Every section must include at least one inline source URL from this bundle:\n${sourceBlock}\n` +
          `- Ground factual claims in the snapshot excerpts below. If a detail is not supported, omit it or move it to the final "Assumptions / Hypotheses" subsection.\n` +
          `Snapshot excerpts:\n${snapshotBlock}\n` +
          `${codeRule}` +
          `- Include at least one markdown table and one checklist ('- [ ]').\n` +
          `- Include at least ${minNumbers} concrete numbers/thresholds across the doc (%, ms, $, tokens, counts).\n` +
          `- Avoid repeating "not present in the excerpt" disclaimers. One short methodology note max.\n` +
          `- In the last H2 section, include these exact H3 subheads:\n${requiredSubheads.join("\n")}\n` +
          `- Keep total length around ${targetWordCount} to ${targetWordCount + 500} words.\n\n` +
          `Draft:\n${draft}`,
      },
    ],
    0.2,
  );

  return String(response.content || draft).trim();
}

async function generateOutline(client, model, { locale, topic, targetRegion, sources, template, seriesId, sourceSnapshots }) {
  const language = locale === "fr" ? "French" : "English";
  const headings = resolveHeadings(locale === "fr" ? template.headingsFr : template.headingsEn, targetRegion);
  const seriesList = SERIES.map((entry) => `- ${entry.id}: ${entry.label}`).join("\n");
  const sourceBlock = sources.map((source) => `- ${source}`).join("\n");
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);
  const audience =
    template.id === "SOCIETY"
      ? "a mixed audience (employees, managers, founders, builders) who care about AI and work"
      : "developers, startup founders, and AI enthusiasts";
  const societyRules =
    template.id === "SOCIETY"
      ? "- For SOCIETY: avoid code talk, repo artifacts, filenames, CI/CD jargon, and internal checklists that feel like engineering memos. Focus on jobs/tasks, concrete personas, and practical guidance.\n"
      : "";

  const response = await runJsonCompletion(
    client,
    model,
    [
      {
        role: "system",
        content:
          `You are an editor-in-chief writing for ${audience}. ` +
          `Return strict JSON with keys: title, excerpt, tags (array), series (string), difficulty (string), timeToImplementMinutes (number), sectionBullets (object).\n` +
          `Write in ${language}.`,
      },
      {
        role: "user",
        content:
          `Create a crisp outline for a ${template.id} post.\n\n` +
          `Constraints:\n` +
          `- Use this exact H2 heading list (keys of sectionBullets):\n${headings.map((h) => `- ${h}`).join("\n")}\n` +
          `- Series must be one of:\n${seriesList}\n` +
          `- Prefer series="${seriesId}" unless clearly wrong.\n` +
          `- difficulty must be one of: beginner, intermediate, advanced.\n` +
          `- timeToImplementMinutes should be realistic (for tutorials) and can be 0 for non-tutorials.\n` +
          `- Title and excerpt must be written in ${language}. Do not copy a French headline verbatim into an English title.\n` +
          `- Every section bullet list must include at least one bullet that references a concrete artifact (checklist, decision table, metric threshold, config, rollout gate). For SOCIETY topics, prefer worksheets/checklists over code.\n` +
          societyRules +
          `- Do not invent unsupported claims. Ground bullets in the snapshot excerpts below.\n\n` +
          `Topic title: ${topic.title}\n` +
          `Topic summary: ${topic.summary}\n` +
          `Source bundle:\n${sourceBlock}\n\n` +
          `Snapshot excerpts:\n${snapshotBlock}`,
      },
    ],
    0.2,
  );

  return {
    title: response.title,
    excerpt: response.excerpt,
    tags: Array.isArray(response.tags) ? response.tags : [],
    series: sanitizeSeriesId(response.series, seriesId),
    difficulty: ["beginner", "intermediate", "advanced"].includes(String(response.difficulty || "").toLowerCase())
      ? String(response.difficulty).toLowerCase()
      : "intermediate",
    timeToImplementMinutes: clampInt(response.timeToImplementMinutes, { min: 0, max: 600 }) ?? 0,
    sectionBullets: typeof response.sectionBullets === "object" && response.sectionBullets ? response.sectionBullets : {},
    headings,
  };
}

async function draftFromOutline(
  client,
  model,
  { locale, outline, targetRegion, sources, template, wordTargets, sourceSnapshots },
) {
  const language = locale === "fr" ? "French" : "English";
  const sourceBlock = sources.map((source) => `- ${source}`).join("\n");
  const headings = outline.headings;
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);
  const requiredSubheads =
    locale === "fr"
      ? ["### Hypotheses / inconnues", "### Risques / mitigations", "### Prochaines etapes"]
      : ["### Assumptions / Hypotheses", "### Risks / Mitigations", "### Next steps"];
  const minNumbers = template.id === "TUTORIAL" ? 8 : template.id === "SOCIETY" ? 5 : 6;
  const codeRule =
    template.id === "TUTORIAL"
      ? "- Include at least two fenced code blocks (commands + config/code).\n"
      : template.id === "SOCIETY"
        ? "- Do NOT include code blocks.\n"
        : "- Code blocks are optional; avoid invented filenames or fake repos.\n";

  const tutorialRules =
    template.id === "TUTORIAL"
      ? `\nTutorial rules:\n` +
        `- Include at least two code blocks: one with commands (bash) and one with config/code (yaml/json/ts).\n` +
        `- Provide a rollout/rollback plan with explicit gates (canary, feature flags, rollback).\n` +
        `- In the "Step-by-step implementation" section, include clearly numbered steps (1., 2., 3., ...).\n`
      : "";

  const societyRules =
    template.id === "SOCIETY"
      ? `\nSociety rules:\n` +
        `- Write for a mixed audience (employees, founders, builders). Avoid infra jargon.\n` +
        `- In the personas section, include 3 distinct personas with role + context (FR/US/UK when relevant), each with a short before/after scenario.\n` +
        `- In employee/founder sections, provide distinct bullet lists (do not repeat the same advice).\n` +
        `- Do not invent file names, internal scripts, or repo artifacts.\n`
      : "";

  const response = await runJsonCompletion(
    client,
    model,
    [
      {
        role: "system",
        content:
          (template.id === "SOCIETY"
            ? `You write clear, rigorous long-form content for a mixed audience (employees, managers, founders, builders) who care about AI and work. Write in ${language}. `
            : `You write builder-grade long-form content for developers and founders. Write in ${language}. `) +
          "Return strict JSON with keys: content (markdown).",
      },
      {
        role: "user",
        content:
          `Write the full ${template.id} article for ${targetRegion}.\n` +
          `Word count target: ${locale === "fr" ? wordTargets.minWordsFr : wordTargets.minWordsEn} to ${wordTargets.maxWordsEn}.\n` +
          `Use exactly these H2 headings in this order:\n${headings.map((h) => `## ${h}`).join("\n")}\n\n` +
          `Hard rules:\n` +
          `- Use only these H2 headings (each must start with '## ' exactly). Do not use H1. Do not add extra H2 headings; use H3 for subsections.\n` +
          `- Each section must include at least one inline source URL from this bundle (paste the URL in the text, not only in a Sources section):\n${sourceBlock}\n` +
          `- Ground factual claims in the snapshot excerpts below. If a detail is not supported, omit it or move it to the final "Assumptions / Hypotheses" subsection.\n` +
          `Snapshot excerpts:\n${snapshotBlock}\n` +
          `${codeRule}` +
          `- Include at least one markdown table and at least one checklist with '- [ ]'.\n` +
          `- Include at least ${minNumbers} concrete numbers/thresholds across the doc (%, ms, $, tokens, counts).\n` +
          `- Avoid repeating "not present in the excerpt" disclaimers. One short methodology note max.\n` +
          `- In the last H2 section ("${headings[headings.length - 1]}"), include these exact H3 subheads:\n${requiredSubheads.join("\n")}\n` +
          `- Avoid filler; if you need more words, add deeper technical detail, examples, and constraints.\n` +
          `- Do not invent claims that are not supported by the sources.\n` +
          tutorialRules +
          societyRules +
          "\n" +
          `Outline title: ${outline.title}\n` +
          `Outline excerpt: ${outline.excerpt}\n` +
          `Series: ${outline.series}\n` +
          `Difficulty: ${outline.difficulty}\n` +
          `Section bullets (guidance):\n${JSON.stringify(outline.sectionBullets, null, 2)}`,
      },
    ],
    0.25,
  );

  return String(response.content || "").trim();
}

function buildFallbackContent(topic, targetRegion, sources, template, locale = "en") {
  const headings =
    locale === "fr" ? resolveHeadings(template.headingsFr, targetRegion) : resolveHeadings(template.headingsEn, targetRegion);
  const bundle = Array.isArray(sources) ? sources.filter(Boolean) : [];
  const sourceFor = (idx) => bundle[idx % Math.max(1, bundle.length)] || bundle[0] || "";
  const bundleList = bundle.map((url) => `- ${url}`).join("\n");

  const requiredSubheads =
    locale === "fr"
      ? ["### Hypotheses / inconnues", "### Risques / mitigations", "### Prochaines etapes"]
      : ["### Assumptions / Hypotheses", "### Risks / Mitigations", "### Next steps"];

  const baseTable =
    locale === "fr"
      ? `| Decision | Option par defaut | Quand changer |\n|---|---|---|\n| Mesure | 3 KPI (cout, latence, qualite) | Ajoutez securite / legal selon secteur |\n| Rollout | Canary 10% pendant 7 jours | Montez a 50% si 0 regression |\n| Stop | 15% de regression qualite = rollback | Re-testez avant relance |`
      : `| Decision | Default | When to change |\n|---|---|---|\n| Measurement | 3 KPIs (cost, latency, quality) | Add safety/legal metrics by sector |\n| Rollout | 10% canary for 7 days | Move to 50% if 0 regressions |\n| Stop | 15% quality regression = rollback | Re-test before re-launch |`;

  const lastSection =
    locale === "fr"
      ? `Checklist:\n- [ ] Definir 3 KPI mesurables (cout, latence, qualite)\n- [ ] Ajouter 1 gate de rollout (canary 10% pendant 7 jours)\n- [ ] Mettre un rollback et un plan incident\n- [ ] Ecrire 5 tests adversariaux\n\n${requiredSubheads[0]}\n- Ce billet est un fallback (pas de generation LLM).\n- Les extraits sources peuvent etre incomplets.\n\n${requiredSubheads[1]}\n- Risque: sur-interpretation. Mitigation: limiter aux faits des sources.\n- Risque: mauvaise region. Mitigation: comparer US/UK/FR.\n\n${requiredSubheads[2]}\n- Re-lancer la generation avec des sources plus solides.\n- Ajouter 1 source locale (FR/US/UK) et republier.`
      : `Checklist:\n- [ ] Define 3 measurable KPIs (cost, latency, quality)\n- [ ] Add 1 rollout gate (10% canary for 7 days)\n- [ ] Implement rollback + incident plan\n- [ ] Write 5 adversarial tests\n\n${requiredSubheads[0]}\n- This post is a fallback (no LLM generation).\n- Source snapshots may be incomplete.\n\n${requiredSubheads[1]}\n- Risk: over-interpretation. Mitigation: stick to source facts.\n- Risk: wrong region lens. Mitigation: compare US/UK/FR.\n\n${requiredSubheads[2]}\n- Re-run generation with stronger sources.\n- Add 1 local (FR/US/UK) source and republish.`;

  const blocksEn = {
    NEWS: [
      `${topic.summary || "Fallback post (LLM unavailable)."}\n\n${baseTable}\n\nSource bundle:\n${bundleList}`,
      `What changed (quick read): focus on the delta, why it matters, and a 7-day validation plan. Use a single owner and a single metric gate before scaling.\n\nSource: ${sourceFor(1)}`,
      `Technical teardown: measure cost per successful task, p95 latency, and human override rate. Start with 3 thresholds (e.g., p95 < 900ms, override < 10%, cost < $0.08/task) and tighten weekly.\n\nSource: ${sourceFor(2)}`,
      `Implementation blueprint: ship one narrow workflow first, add evals, and gate rollout (10% canary for 7 days). Avoid broad rewrites.\n\nSource: ${sourceFor(0)}`,
      `Founder lens: treat this as a distribution + reliability game. If quality is unstable, do not scale. If retention improves by 3-5% after 2 weeks, invest.\n\nSource: ${sourceFor(1)}`,
      `Regional lens (${targetRegion}): map compliance and buyer expectations into technical proof (logging, eval docs, incident response). Turn reliability into trust signals.\n\nSource: ${sourceFor(2)}`,
      `US/UK/FR comparison:\n\n| Region | Buyer expectation | What you must show |\n|---|---|---|\n| US | speed + UX | fast iteration + hard metrics |\n| UK | accountability | audit trail + clear ownership |\n| FR | traceability | documentation + resilience |\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
    ANALYSIS: [
      `${topic.summary || "Fallback post (LLM unavailable)."}\n\n${baseTable}\n\nSource bundle:\n${bundleList}`,
      `Core thesis: the real change is practical capability under constraints (latency, cost, safety), not a headline. Your edge comes from integration + eval discipline.\n\nSource: ${sourceFor(1)}`,
      `Evidence from sources: list 3 claims you can defend, 2 claims you suspect, and 1 claim you will not state. Keep numbers explicit.\n\nSource: ${sourceFor(2)}`,
      `Technical implications: define a small eval set (50-200 examples), track p95 latency, and set a rollback trigger (15% quality regression).\n\nSource: ${sourceFor(0)}`,
      `Founder lens: if CAC is unchanged but conversion lifts 2-4% and support tickets drop 10-20%, you have a wedge. Otherwise, pause.\n\nSource: ${sourceFor(1)}`,
      `Trade-offs and risks: reliability vs capability, cost vs accuracy, speed vs governance. Treat unknowns as assumptions, not facts.\n\nSource: ${sourceFor(2)}`,
      `Decision framework:\n\n| Question | Green light | Red flag |\n|---|---|---|\n| Is it stable? | override < 10% | override > 25% |\n| Is it cheap enough? | <$0.08/task | >$0.25/task |\n| Is it faster? | p95 < 900ms | p95 > 2s |\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
    TUTORIAL: [
      `${topic.summary || "Fallback tutorial (LLM unavailable)."}\n\n${baseTable}\n\nSource bundle:\n${bundleList}`,
      `Goal: ship a minimal agent workflow with evals and a safe rollout in 60-120 minutes.\n\nSource: ${sourceFor(1)}`,
      `Stack and prerequisites:\n- Node 20+\n- A staging environment\n- A logging sink (even a CSV is fine)\n\nQuick check:\n\`\`\`bash\nnode -v\nnpm -v\n\`\`\`\n\nSource: ${sourceFor(2)}`,
      `Step-by-step implementation:\n1. Pick 1 workflow (support triage, report draft, lead qualification).\n2. Write 50-200 eval examples.\n3. Add a canary gate (10% for 7 days).\n4. Add rollback trigger (15% quality regression).\n\nExample config:\n\`\`\`yaml\nrollout:\n  canary_percent: 10\n  canary_days: 7\n  rollback_on_quality_regression_percent: 15\nmetrics:\n  p95_latency_ms_target: 900\n  max_cost_per_task_usd: 0.08\n\`\`\`\n\nSource: ${sourceFor(0)}`,
      `Reference architecture: request -> policy -> tool calls -> eval -> store. Keep prompts versioned and logs queryable.\n\nSource: ${sourceFor(1)}`,
      `Founder lens: do not scale headcount until you see a 2-4% conversion lift or a 10-20% support load drop in 2 weeks.\n\nSource: ${sourceFor(2)}`,
      `Failure modes and debugging: timeouts, tool errors, hallucinated fields, and silent regressions. Track override rate and add adversarial tests.\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
    SOCIETY: [
      `${topic.summary || "Fallback post (LLM unavailable)."}\n\n${baseTable}\n\nSource bundle:\n${bundleList}`,
      `What the sources say: separate (1) task automation, (2) job redesign, and (3) displacement risk. Most change is task-level first, then roles.\n\nSource: ${sourceFor(1)}`,
      `Tasks vs jobs: list the top 5 tasks exposed (drafting, summarizing, routing, QA) and the 5 tasks that stay human-heavy (accountability, negotiation, responsibility).\n\nSource: ${sourceFor(2)}`,
      `Three concrete personas (2026 scenarios):\n- Persona 1: customer support agent (tickets, macros, escalation) -> 30-50% task automation, higher bar on judgment.\n- Persona 2: accountant/analyst (reconciliation, reporting) -> faster cycles, more review + audit burden.\n- Persona 3: junior developer (boilerplate, tests) -> productivity gain, more code review and system understanding.\n\nSource: ${sourceFor(0)}`,
      `What to do if you're an employee:\n- Map your job into 20-40 tasks; label which are automatable.\n- Build a "review skill": verification, edge-cases, and accountability.\n- Negotiate for training time (2h/week) and measurable outcomes.\n- Track 3 metrics: time saved, error rate, and escalations.\n\nSource: ${sourceFor(1)}`,
      `What to do if you're a founder/manager:\n- Communicate the intent (augmentation vs replacement) and the rollout gates.\n- Measure impact on quality before headcount decisions.\n- Define ownership when AI makes mistakes.\n- Invest in reskilling for the most exposed roles.\n\nSource: ${sourceFor(2)}`,
      `France / US / UK lens: France emphasizes works council + documentation; UK emphasizes accountability; US emphasizes speed. Translate that into governance and training programs.\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
  };

  const blocksFr = {
    NEWS: [
      `${topic.summary || "Article fallback (LLM indisponible)."}\n\n${baseTable}\n\nSources:\n${bundleList}`,
      `Ce qui a change: allez droit au delta, pourquoi c'est important, et comment valider en 7 jours. Un owner unique, un gate unique avant de scaler.\n\nSource: ${sourceFor(1)}`,
      `Demontage technique: mesurez cout par tache reussie, latence p95, et taux de correction humaine. Fixez 3 seuils (ex: p95 < 900ms, override < 10%, cout < $0.08/tache).\n\nSource: ${sourceFor(2)}`,
      `Plan d'implementation: ship un workflow etroit, ajoutez des evals, et gatez le rollout (canary 10% pendant 7 jours). Evitez les gros refactors.\n\nSource: ${sourceFor(0)}`,
      `Vue fondateur: distribution + fiabilite. Si la qualite est instable, ne scalez pas. Si la retention monte de 3-5% apres 2 semaines, investissez.\n\nSource: ${sourceFor(1)}`,
      `Angle regional (${targetRegion}): transformez conformite et attentes buyers en preuves techniques (logs, eval docs, plan incident).\n\nSource: ${sourceFor(2)}`,
      `Comparatif US/UK/FR:\n\n| Region | Attente buyer | Preuve a montrer |\n|---|---|---|\n| US | vitesse + UX | iteration rapide + metriques |\n| UK | accountability | audit trail + ownership |\n| FR | tracabilite | documentation + resilience |\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
    ANALYSIS: [
      `${topic.summary || "Article fallback (LLM indisponible)."}\n\n${baseTable}\n\nSources:\n${bundleList}`,
      `These: la vraie rupture est la capacite en conditions reelles (latence, cout, securite), pas le headline. L'avantage vient de l'integration + discipline d'eval.\n\nSource: ${sourceFor(1)}`,
      `Evidences: 3 assertions defendables, 2 hypotheses, 1 point que vous ne dites pas. Gardez les chiffres explicites.\n\nSource: ${sourceFor(2)}`,
      `Implications techniques: set d'eval de 50-200 exemples, latence p95, trigger rollback (15% de regression qualite).\n\nSource: ${sourceFor(0)}`,
      `Vue fondateur: si conversion +2-4% et tickets -10-20% en 2 semaines, wedge valide. Sinon, pause.\n\nSource: ${sourceFor(1)}`,
      `Compromis: fiabilite vs capacite, cout vs precision, vitesse vs gouvernance. Les inconnues vont dans "Hypotheses".\n\nSource: ${sourceFor(2)}`,
      `Cadre de decision:\n\n| Question | Vert | Rouge |\n|---|---|---|\n| Stable ? | override < 10% | override > 25% |\n| Cout ok ? | <$0.08/tache | >$0.25/tache |\n| Rapide ? | p95 < 900ms | p95 > 2s |\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
    TUTORIAL: [
      `${topic.summary || "Tutoriel fallback (LLM indisponible)."}\n\n${baseTable}\n\nSources:\n${bundleList}`,
      `Objectif: ship un workflow agentique minimal avec evals + rollout safe en 60-120 minutes.\n\nSource: ${sourceFor(1)}`,
      `Stack et prerequis:\n- Node 20+\n- Environnement de staging\n- Un log (meme CSV)\n\nCheck:\n\`\`\`bash\nnode -v\nnpm -v\n\`\`\`\n\nSource: ${sourceFor(2)}`,
      `Implementation pas a pas:\n1. Choisir 1 workflow (tri tickets, rapport, qualification lead).\n2. Ecrire 50-200 exemples d'eval.\n3. Ajouter gate canary (10% pendant 7 jours).\n4. Ajouter trigger rollback (15% regression qualite).\n\nConfig example:\n\`\`\`yaml\nrollout:\n  canary_percent: 10\n  canary_days: 7\n  rollback_on_quality_regression_percent: 15\nmetrics:\n  p95_latency_ms_target: 900\n  max_cost_per_task_usd: 0.08\n\`\`\`\n\nSource: ${sourceFor(0)}`,
      `Architecture de reference: request -> policy -> tools -> eval -> store. Versionnez les prompts et gardez des logs requetables.\n\nSource: ${sourceFor(1)}`,
      `Vue fondateur: ne scalez pas avant un lift conversion +2-4% ou une baisse support -10-20% sur 2 semaines.\n\nSource: ${sourceFor(2)}`,
      `Pannes et debugging: timeouts, erreurs tool, champs inventes, regressions silencieuses. Suivez override rate et ajoutez tests adversariaux.\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
    SOCIETY: [
      `${topic.summary || "Article fallback (LLM indisponible)."}\n\n${baseTable}\n\nSources:\n${bundleList}`,
      `Ce que disent les sources: distinguez (1) automatisation de taches, (2) redesign de poste, (3) risque de remplacement. Souvent: taches d'abord, roles ensuite.\n\nSource: ${sourceFor(1)}`,
      `Taches vs emplois: top 5 taches exposees (draft, resume, routage, QA) et 5 taches encore humaines (responsabilite, negociation, jugement, accountability).\n\nSource: ${sourceFor(2)}`,
      `Trois personas (scenarios 2026):\n- Persona 1: support client -> 30-50% automatisable, plus d'escalade et de jugement.\n- Persona 2: compta/analyste -> cycles plus rapides, plus de controle/audit.\n- Persona 3: dev junior -> gain productivite, plus de code review et de comprehension systeme.\n\nSource: ${sourceFor(0)}`,
      `Si vous etes salarie:\n- Decoupez votre job en 20-40 taches; marquez celles automatisables.\n- Renforcez "review skill": verification, cas limites, responsabilite.\n- Negociez 2h/semaine de formation + objectifs mesurables.\n- Suivez 3 metriques: temps gagne, erreurs, escalades.\n\nSource: ${sourceFor(1)}`,
      `Si vous etes fondateur/manager:\n- Communiquez l'intention (augmentation vs remplacement) + gates.\n- Mesurez la qualite avant toute decision headcount.\n- Definissez l'ownership quand l'IA se trompe.\n- Investissez reskilling sur les roles exposes.\n\nSource: ${sourceFor(2)}`,
      `Angle France / US / UK: FR = documentation + dialogue social; UK = accountability; US = vitesse. Traduisez cela en gouvernance + training.\n\nSource: ${sourceFor(0)}`,
      `${lastSection}\n\nSource: ${sourceFor(1)}`,
    ],
  };

  const templateId = template.id in blocksEn ? template.id : "NEWS";
  const blocks = locale === "fr" ? blocksFr[templateId] : blocksEn[templateId];
  const sections = headings.map((heading, index) => `## ${heading}\n\n${blocks[index] || ""}`.trim());
  return sections.join("\n\n");
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function convertHeadings(content, headingsEn, headingsFr) {
  let converted = content;

  for (let i = 0; i < headingsEn.length; i += 1) {
    const regex = new RegExp(`^##\\s+${escapeRegExp(headingsEn[i])}$`, "gm");
    converted = converted.replace(regex, `## ${headingsFr[i]}`);
  }

  return converted;
}

async function runJsonCompletion(client, model, messages, temperature = 0.3) {
  const request = {
    model,
    response_format: { type: "json_object" },
    messages,
  };

  if (!String(model).startsWith("gpt-5")) {
    request.temperature = temperature;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(request, {
      signal: controller.signal,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: OPENAI_MAX_RETRIES,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(raw);
  } finally {
    clearTimeout(timer);
  }
}

async function generateWithLLM(topic, targetRegion, sources, template, wordTargets, sourceSnapshots) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      title: topic.title,
      excerpt: `Deep-dive analysis: ${topic.title}`,
      region: targetRegion,
      category: template.category,
      tags: ["AI", "News", targetRegion, template.id],
      content: padToMinWords(buildFallbackContent(topic, targetRegion, sources, template, "en"), wordTargets.minWordsEn, "en"),
      generationMode: "fallback",
    };
  }

  const client = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: OPENAI_MAX_RETRIES });
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const seriesId = detectSeriesId(topic, template);
  const headings = resolveHeadings(template.headingsEn, targetRegion);
  const sourceBlock = sources.map((source) => `- ${source}`).join("\n");
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);

  try {
    if (LOG_STAGES) console.log("[generate-post] EN: outline");
    const outline = await generateOutline(client, model, {
      locale: "en",
      topic,
      targetRegion,
      sources,
      template,
      seriesId,
      sourceSnapshots,
    });

    if (LOG_STAGES) console.log("[generate-post] EN: draft");
    let content = await draftFromOutline(client, model, {
      locale: "en",
      outline,
      targetRegion,
      sources,
      template,
      wordTargets,
      sourceSnapshots,
    });

    // QA/repair loop (keeps headings stable and enforces inline citations).
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const issues = validateDraft(content, headings, sources, template.id);
      if (issues.length === 0) break;
      if (LOG_STAGES) console.log(`[generate-post] EN: repair pass ${attempt + 1} issues=${issues.length}`);
      content = await runRepairPass(client, model, {
        locale: "en",
        headings,
        sources,
        draft: content,
        issues,
        targetWordCount: wordTargets.minWordsEn,
        sourceSnapshots,
        templateId: template.id,
      });
    }

    if (countWords(content) < wordTargets.minWordsEn) {
      if (LOG_STAGES) console.log("[generate-post] EN: expand (min words)");
      const expanded = await runJsonCompletion(
        client,
        model,
        [
          {
            role: "system",
            content:
              "You are an editor expanding depth without filler. Return strict JSON with keys: content (markdown). Keep headings unchanged.",
          },
          {
            role: "user",
            content:
              `Expand this article to at least ${wordTargets.minWordsEn} words by adding deeper technical detail, examples, and concrete thresholds. Do not add generic filler.\n\n` +
              `Keep these exact H2 headings:\n${headings.map((h) => `## ${h}`).join("\n")}\n\n` +
              `Source bundle:\n${sourceBlock}\n\n` +
              `Snapshot excerpts:\n${snapshotBlock}\n\n` +
              `Draft:\n${content}`,
          },
        ],
        0.2,
      );
      content = String(expanded.content || content).trim();
    }

    let candidate = {
      title: String(outline.title || topic.title).trim() || topic.title,
      excerpt: String(outline.excerpt || `Deep-dive update: ${topic.title}`).trim(),
      region: targetRegion,
      category: template.category,
      series: outline.series,
      difficulty: outline.difficulty,
      timeToImplementMinutes: outline.timeToImplementMinutes,
      tags: outline.tags.length > 0 ? outline.tags.slice(0, 8) : ["AI", template.category, targetRegion, template.id],
      content,
      generationMode: "llm",
    };

    const metaSignal = shouldRepairMeta({
      locale: "en",
      title: candidate.title,
      excerpt: candidate.excerpt,
      topic,
    });
    if (metaSignal) {
      if (LOG_STAGES) console.log(`[generate-post] EN: meta repair (${metaSignal.reason})`);
      const fixed = await repairMeta(client, model, {
        locale: "en",
        topic,
        template,
        currentTitle: candidate.title,
        currentExcerpt: candidate.excerpt,
        currentTags: candidate.tags,
        content: candidate.content,
        sourceSnapshots,
      });
      candidate = {
        ...candidate,
        title: fixed.title || candidate.title,
        excerpt: fixed.excerpt || candidate.excerpt,
        tags: Array.isArray(fixed.tags) && fixed.tags.length > 0 ? fixed.tags : candidate.tags,
      };
    }

    const detected = detectLanguage(`${candidate.title}\n${candidate.excerpt}\n${candidate.content}`);
    if (detected === "fr") {
      if (LOG_STAGES) console.log("[generate-post] EN: language repair");
      const corrected = await runJsonCompletion(
        client,
        model,
        [
          {
            role: "system",
            content:
              "Rewrite in professional English. Return strict JSON with keys: title, excerpt, tags (array), content (markdown).",
          },
          {
            role: "user",
            content:
              "This draft is not in English. Rewrite it fully in English while preserving the same factual meaning and structure.\n" +
              `Keep these exact H2 headings in order:\n${headings.map((heading) => `## ${heading}`).join("\n")}\n\n` +
              `Minimum words: ${wordTargets.minWordsEn}.\n\n` +
              `Draft title: ${candidate.title}\nDraft excerpt: ${candidate.excerpt}\n\nDraft content:\n${candidate.content}`,
          },
        ],
        0.15,
      );

      candidate = {
        ...candidate,
        title: corrected.title || candidate.title,
        excerpt: corrected.excerpt || candidate.excerpt,
        tags: Array.isArray(corrected.tags) ? corrected.tags.slice(0, 8) : candidate.tags,
        content: String(corrected.content || candidate.content).trim(),
      };
    }

    if (detectLanguage(`${candidate.title}\n${candidate.excerpt}\n${candidate.content}`) === "fr") {
      return {
        title: topic.title,
        excerpt: `Deep-dive analysis: ${topic.title}`,
        region: targetRegion,
        category: template.category,
        tags: ["AI", "News", targetRegion, template.id],
        content: padToMinWords(buildFallbackContent(topic, targetRegion, sources, template, "en"), wordTargets.minWordsEn, "en"),
        generationMode: "fallback",
      };
    }

    return candidate;
  } catch (error) {
    const message = error?.message || String(error);
    console.warn(`Falling back to EN template due to LLM error: ${message}`);

    // In strict mode, fail the whole run instead of "poisoning" the queue by marking topics as failed
    // due to transient OpenAI / network issues.
    if (STRICT_PUBLISH && !ALLOW_FALLBACK_CONTENT) {
      throw new Error(`OpenAI generation failed: ${message}`);
    }

    return {
      title: topic.title,
      excerpt: `Deep-dive analysis: ${topic.title}`,
      region: targetRegion,
      category: template.category,
      tags: ["AI", "News", targetRegion, template.id],
      content: padToMinWords(buildFallbackContent(topic, targetRegion, sources, template, "en"), wordTargets.minWordsEn, "en"),
      generationMode: "fallback",
    };
  }
}

async function translateToFrench(postEn, topic, targetRegion, sources, template, wordTargets, sourceSnapshots) {
  const headingsEn = resolveHeadings(template.headingsEn, targetRegion);
  const headingsFr = resolveHeadings(template.headingsFr, targetRegion);

  const fallbackFr = padToMinWords(
    buildFallbackContent(
      {
        ...topic,
        title: postEn.title,
        summary: postEn.excerpt,
      },
      targetRegion,
      sources,
      template,
      "fr",
    ),
    wordTargets.minWordsFr,
    "fr",
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      title: `Version FR: ${postEn.title}`,
      excerpt: `Analyse detaillee: ${postEn.excerpt}`,
      tags: [...postEn.tags, "FR"].slice(0, 8),
      content: fallbackFr,
    };
  }

  const client = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: OPENAI_MAX_RETRIES });
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const sourceBlock = sources.map((source) => `- ${source}`).join("\n");
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);
  const requiredSubheadsFr = ["### Hypotheses / inconnues", "### Risques / mitigations", "### Prochaines etapes"];

  try {
    if (LOG_STAGES) console.log("[generate-post] FR: translate");
    let parsed = await runJsonCompletion(
      client,
      model,
      [
        {
          role: "system",
          content:
            "Translate and localize this article into professional French for developers, startup founders, and AI enthusiasts. Return strict JSON with keys: title, excerpt, tags (array), content (markdown).",
        },
        {
          role: "user",
          content:
            `Translate for ${targetRegion} context. Keep depth and preserve factual fidelity.\n` +
            `French text must be at least ${wordTargets.minWordsFr} words.\n` +
            "Use these exact H2 headings in this order:\n" +
            headingsFr.map((heading) => `## ${heading}`).join("\n") +
            "\n\n" +
            "Every required section must start with '## ' exactly. Do not use H1. Do not add extra H2 headings; use H3 for subsections.\n\n" +
            `In the last H2 section ("${headingsFr[headingsFr.length - 1]}"), include these exact H3 subheads:\n${requiredSubheadsFr.join("\n")}\n\n` +
            "Preserve code blocks and practical implementation details.\n\n" +
            `Sources:\n${sourceBlock}\n\n` +
            `Snapshot excerpts (ground claims only in these excerpts; if a detail is not supported, rewrite it as a clearly labeled hypothesis):\n${snapshotBlock}\n\n` +
            `English title: ${postEn.title}\n` +
            `English excerpt: ${postEn.excerpt}\n\n` +
            `English content:\n${postEn.content}`,
        },
      ],
      0.25,
    );

    let content = String(parsed.content || "").trim();

    if (countWords(content) < wordTargets.minWordsFr) {
      if (LOG_STAGES) console.log("[generate-post] FR: expand (min words)");
      const expanded = await runJsonCompletion(
        client,
        model,
        [
          {
            role: "system",
            content:
              "You are a French AI editor. Return strict JSON with keys: excerpt, tags (array), content (markdown).",
          },
          {
            role: "user",
            content:
              `Develop this French draft to at least ${wordTargets.minWordsFr} words with concrete detail and no filler. Keep headings unchanged.\n\nDraft:\n${content}`,
          },
        ],
        0.2,
      );

      content = String(expanded.content || content).trim();
      parsed = {
        ...parsed,
        excerpt: expanded.excerpt || parsed.excerpt,
        tags: Array.isArray(expanded.tags) ? expanded.tags : parsed.tags,
        content,
      };
    }

    let candidate = {
      title: parsed.title || postEn.title,
      excerpt: parsed.excerpt || postEn.excerpt,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [...postEn.tags, "FR"].slice(0, 8),
      content: convertHeadings(String(parsed.content || content).trim(), headingsEn, headingsFr),
    };

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const issues = validateDraft(candidate.content, headingsFr, sources, template.id);
      if (issues.length === 0) break;
      if (LOG_STAGES) console.log(`[generate-post] FR: repair pass ${attempt + 1} issues=${issues.length}`);
      candidate.content = await runRepairPass(client, model, {
        locale: "fr",
        headings: headingsFr,
        sources,
        draft: candidate.content,
        issues,
        targetWordCount: wordTargets.minWordsFr,
        sourceSnapshots,
        templateId: template.id,
      });
    }

    const detected = detectLanguage(`${candidate.title}\n${candidate.excerpt}\n${candidate.content}`);
    if (detected === "en") {
      if (LOG_STAGES) console.log("[generate-post] FR: language repair");
      const corrected = await runJsonCompletion(
        client,
        model,
        [
          {
            role: "system",
            content:
              "Translate and localize into professional French. Return strict JSON with keys: title, excerpt, tags (array), content (markdown).",
          },
          {
            role: "user",
            content:
              `French text must be at least ${wordTargets.minWordsFr} words.\n` +
              "Use these exact H2 headings in this order:\n" +
              headingsFr.map((heading) => `## ${heading}`).join("\n") +
              "\n\n" +
              `In the last H2 section ("${headingsFr[headingsFr.length - 1]}"), include these exact H3 subheads:\n${requiredSubheadsFr.join("\n")}\n\n` +
              `English title: ${postEn.title}\nEnglish excerpt: ${postEn.excerpt}\n\nEnglish content:\n${postEn.content}`,
          },
        ],
        0.15,
      );

      candidate = {
        title: corrected.title || candidate.title,
        excerpt: corrected.excerpt || candidate.excerpt,
        tags: Array.isArray(corrected.tags) ? corrected.tags.slice(0, 8) : candidate.tags,
        content: convertHeadings(String(corrected.content || candidate.content).trim(), headingsEn, headingsFr),
      };
    }

    if (detectLanguage(`${candidate.title}\n${candidate.excerpt}\n${candidate.content}`) === "en") {
      return {
        title: `Version FR: ${postEn.title}`,
        excerpt: `Analyse detaillee: ${postEn.excerpt}`,
        tags: [...postEn.tags, "FR"].slice(0, 8),
        content: fallbackFr,
      };
    }

    return candidate;
  } catch (error) {
    console.warn(`Falling back to FR template due to translation error: ${error.message}`);
    return {
      title: `Version FR: ${postEn.title}`,
      excerpt: `Analyse detaillee: ${postEn.excerpt}`,
      tags: [...postEn.tags, "FR"].slice(0, 8),
      content: fallbackFr,
    };
  }
}

export async function generatePost() {
  if (!process.env.OPENAI_API_KEY && STRICT_PUBLISH && !ALLOW_FALLBACK_CONTENT) {
    throw new Error(
      "OPENAI_API_KEY is missing. STRICT_PUBLISH is enabled and ALLOW_FALLBACK_CONTENT is disabled; refusing to publish fallback posts.",
    );
  }

  const rawQueue = await fs.readFile(queuePath, "utf8");
  const queue = JSON.parse(rawQueue);

  const nowIso = new Date().toISOString();
  const regionOrder = (() => {
    const counts = getPublishedCounts(queue);
    return TARGET_REGIONS.slice().sort((a, b) => counts[a] - counts[b]);
  })();

  const updateItem = (topicId, patch) => {
    queue.items = (queue.items || []).map((item) => (item.id === topicId ? { ...item, ...patch } : item));
  };

  for (let attempt = 0; attempt < MAX_TOPIC_ATTEMPTS; attempt += 1) {
    // Don't get stuck trying the same region repeatedly if sources are paywalled or generation fails.
    const targetRegion = regionOrder[attempt % regionOrder.length] || pickTargetRegion(queue);
    const topic = pickTopic(queue, targetRegion);

    if (!topic) {
      console.log("No queued topic available.");
      if (!DRY_RUN) await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
      return null;
    }

    const template = detectEditorialTemplate(topic);
    const wordTargets = getWordTargets(template);

    const sourceBundle = buildSourceBundle(queue, topic, targetRegion, template);
    if (sourceBundle.length < 1) {
      updateItem(topic.id, {
        status: "failed",
        targetRegion,
        region: normalizeRegion(topic.region),
        editorialTemplate: template.id,
        failedAtRun: nowIso,
        failureReason: "insufficient source bundle (need at least 1 URL)",
        sourceBundle,
      });
      console.warn(`Skipped topic ${topic.id} (${topic.title}) because: insufficient source bundle`);
      continue;
    }

    console.log(
      `[generate-post] Attempt ${attempt + 1}/${MAX_TOPIC_ATTEMPTS} region=${targetRegion} template=${template.id} topic="${topic.title}" sources=${sourceBundle.length}`,
    );
    const sourceSnapshots = await getSourceSnapshots(sourceBundle);
    console.log(`[generate-post] Snapshots fetched: ${sourceSnapshots.length}/${sourceBundle.length}`);

    const requiredSnapshots = Math.min(MIN_SOURCE_SNAPSHOTS, sourceBundle.length);
    if (sourceSnapshots.length < requiredSnapshots) {
      updateItem(topic.id, {
        status: "failed",
        targetRegion,
        region: normalizeRegion(topic.region),
        editorialTemplate: template.id,
        failedAtRun: nowIso,
        failureReason: `insufficient source snapshots (${sourceSnapshots.length}/${sourceBundle.length})`,
        sourceBundle,
        sourceSnapshotsCount: sourceSnapshots.length,
      });
      console.warn(
        `Skipped topic ${topic.id} (${topic.title}) because: insufficient source snapshots (${sourceSnapshots.length}/${sourceBundle.length})`,
      );
      continue;
    }

    const postEn = await generateWithLLM(topic, targetRegion, sourceBundle, template, wordTargets, sourceSnapshots);
    const generationMode = String(postEn.generationMode || "llm");
    const isFallback = generationMode !== "llm";

    if (STRICT_PUBLISH && !ALLOW_FALLBACK_CONTENT && isFallback) {
      updateItem(topic.id, {
        status: "failed",
        targetRegion,
        region: normalizeRegion(topic.region),
        editorialTemplate: template.id,
        failedAtRun: nowIso,
        failureReason: `strict publish refused generationMode="${generationMode}"`,
        sourceBundle,
        sourceSnapshotsCount: sourceSnapshots.length,
        generationMode,
      });
      console.warn(
        `Skipped topic ${topic.id} (${topic.title}) because: strict publish refused generationMode="${generationMode}"`,
      );
      continue;
    }

    const postFr = await translateToFrench(postEn, topic, targetRegion, sourceBundle, template, wordTargets, sourceSnapshots);

    const headingsEn = resolveHeadings(template.headingsEn, targetRegion);
    const headingsFr = resolveHeadings(template.headingsFr, targetRegion);

    const enIssues = validateDraft(postEn.content, headingsEn, sourceBundle, template.id);
    const frIssues = validateDraft(postFr.content, headingsFr, sourceBundle, template.id);

    const publishAllowed = !STRICT_PUBLISH ? true : !isFallback || ALLOW_FALLBACK_CONTENT;
    const meetsLength = countWords(postEn.content) >= wordTargets.minWordsEn && countWords(postFr.content) >= wordTargets.minWordsFr;
    const issues = [...enIssues.map((v) => `EN: ${v}`), ...frIssues.map((v) => `FR: ${v}`)];

    if (!publishAllowed || !meetsLength || issues.length > 0) {
      console.warn(
        `[generate-post] Rejecting draft. generationMode=${generationMode} wordsEn=${countWords(postEn.content)} wordsFr=${countWords(
          postFr.content,
        )} issues=${issues.length}`,
      );
      const reasonParts = [];
      if (!publishAllowed) reasonParts.push(`strict publish refused generationMode="${generationMode}"`);
      if (!meetsLength) reasonParts.push("below min word targets");
      if (issues.length > 0) reasonParts.push(`validation issues: ${issues.slice(0, 8).join(" | ")}`);

      updateItem(topic.id, {
        status: "failed",
        targetRegion,
        region: normalizeRegion(topic.region),
        editorialTemplate: template.id,
        failedAtRun: nowIso,
        failureReason: reasonParts.join("; ").slice(0, 1800),
        sourceBundle,
      });

      console.warn(`Skipped topic ${topic.id} (${topic.title}) because: ${reasonParts.join("; ")}`);
      continue;
    }

    const date = new Date().toISOString().slice(0, 10);
    const slug = `${date}-${slugify(postEn.title, { lower: true, strict: true })}`;

    const targetPathEn = path.join(postsDir, `${slug}.md`);
    const targetPathFr = path.join(postsFrDir, `${slug}.md`);

    const frontmatterEn = buildFrontmatter(postEn, sourceBundle, targetRegion, template);
    const bodyEn = `${frontmatterEn}\n${postEn.content.trim()}\n`;

    const frontmatterFr = buildFrontmatter(
      {
        ...postEn,
        ...postFr,
        category: template.category,
        tags: postFr.tags,
        region: targetRegion,
      },
      sourceBundle,
      targetRegion,
      template,
    );
    const bodyFr = `${frontmatterFr}\n${postFr.content.trim()}\n`;

    if (!DRY_RUN) {
      await fs.mkdir(postsDir, { recursive: true });
      await fs.mkdir(postsFrDir, { recursive: true });
      await fs.writeFile(targetPathEn, bodyEn, "utf8");
      await fs.writeFile(targetPathFr, bodyFr, "utf8");
    }

    updateItem(topic.id, {
      status: "published",
      targetRegion,
      region: normalizeRegion(topic.region),
      editorialTemplate: template.id,
      publishedAtRun: new Date().toISOString(),
      file: path.relative(process.cwd(), targetPathEn),
      fileFr: path.relative(process.cwd(), targetPathFr),
      sourceBundle,
      sourceSnapshotsCount: sourceSnapshots.length,
      generationMode,
      series: postEn.series,
      difficulty: postEn.difficulty,
      timeToImplementMinutes: postEn.timeToImplementMinutes,
      wordsEn: countWords(postEn.content),
      wordsFr: countWords(postFr.content),
    });

    if (!DRY_RUN) await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));

    console.log(
      `Generated ${path.relative(process.cwd(), targetPathEn)} (${countWords(postEn.content)} words EN) and ${path.relative(
        process.cwd(),
        targetPathFr,
      )} (${countWords(postFr.content)} words FR) for ${targetRegion} with ${template.id} template`,
    );

    return DRY_RUN ? null : targetPathEn;
  }

  if (!DRY_RUN) await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
  console.warn(`Failed to generate a publishable post after ${MAX_TOPIC_ATTEMPTS} attempts.`);
  return null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generatePost();
}
