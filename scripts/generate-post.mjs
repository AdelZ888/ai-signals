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
};

function resolveForcedTemplate() {
  const raw = String(process.env.FORCE_TEMPLATE || "")
    .trim()
    .toUpperCase();

  if (!raw) return null;

  if (raw in EDITORIAL_TEMPLATES) {
    return EDITORIAL_TEMPLATES[raw];
  }

  console.warn(`Ignoring invalid FORCE_TEMPLATE="${raw}". Expected NEWS, TUTORIAL, or ANALYSIS.`);
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
      return text ? { url: target, text: truncateChars(text, SOURCE_SNAPSHOT_CHARS) } : null;
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
    return text ? { url: target, text: truncateChars(text, SOURCE_SNAPSHOT_CHARS) } : null;
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
  const candidates = (queue.items || [])
    .filter((item) => item.id !== topic.id)
    .filter((item) => [targetRegion, "GLOBAL"].includes(normalizeRegion(item.region)))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return dedupeUrls(candidates.map((item) => item.link)).slice(0, limit);
}

function detectEditorialTemplate(topic) {
  const forced = resolveForcedTemplate();
  if (forced) return forced;

  const haystack = `${topic.title || ""} ${topic.summary || ""} ${topic.source || ""}`.toLowerCase();

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
  if (codeBlocks.length < 1) issues.push("Missing at least one fenced code block (```...```)");
  if (!/\|[^\n]*\|\n\| *-+/.test(markdown)) issues.push("Missing at least one markdown table (decision frame or comparison).");
  if (!/\n- \[ \]/.test(markdown)) issues.push("Missing a checklist with task boxes ('- [ ]').");

  const numbers = (markdown.match(/\b\d+(\.\d+)?\b/g) || []).length;
  if (numbers < 8) issues.push("Too few concrete numbers/thresholds. Add more measurable targets (%, ms, $, counts).");

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
    if (codeBlocks.length < 2) issues.push("Tutorial should include at least two code blocks (commands + config/code).");

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

  return issues;
}

async function runRepairPass(
  client,
  model,
  { locale, headings, sources, draft, issues, targetWordCount, sourceSnapshots },
) {
  const language = locale === "fr" ? "French" : "English";
  const sourceBlock = sources.map((source) => `- ${source}`).join("\n");
  const snapshotBlock = formatSourceSnapshots(sourceSnapshots);
  const requiredSubheads =
    locale === "fr"
      ? ["### Hypotheses / inconnues", "### Risques / mitigations", "### Prochaines etapes"]
      : ["### Assumptions / Hypotheses", "### Risks / Mitigations", "### Next steps"];

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
          `- Ground claims only in the snapshot excerpts below; if a detail is not supported, rewrite it as a clearly labeled hypothesis.\n` +
          `Snapshot excerpts:\n${snapshotBlock}\n` +
          `- Include at least one fenced code block, one markdown table, and one checklist ('- [ ]').\n` +
          `- Include at least 8 concrete numbers/thresholds across the doc (%, ms, $, tokens, counts).\n` +
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

  const response = await runJsonCompletion(
    client,
    model,
    [
      {
        role: "system",
        content:
          `You are an editor-in-chief writing for developers, startup founders, and AI enthusiasts. ` +
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
          `- Every section bullet list must include at least one bullet that references a concrete artifact (config, metric threshold, code, rollout gate).\n` +
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

  const tutorialRules =
    template.id === "TUTORIAL"
      ? `\nTutorial rules:\n` +
        `- Include at least two code blocks: one with commands (bash) and one with config/code (yaml/json/ts).\n` +
        `- Provide a rollout/rollback plan with explicit gates (canary, feature flags, rollback).\n` +
        `- In the "Step-by-step implementation" section, include clearly numbered steps (1., 2., 3., ...).\n`
      : "";

  const response = await runJsonCompletion(
    client,
    model,
    [
      {
        role: "system",
        content:
          `You write builder-grade long-form content for developers and founders. Write in ${language}. ` +
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
          `- Ground claims only in the snapshot excerpts below; if a detail is not supported, say so explicitly.\n` +
          `Snapshot excerpts:\n${snapshotBlock}\n` +
          `- Include at least one fenced code block and at least one checklist with '- [ ]'.\n` +
          `- Include at least one markdown table for a founder decision frame.\n` +
          `- Include at least 8 concrete numbers/thresholds across the doc (%, ms, $, tokens, counts).\n` +
          `- In the last H2 section ("${headings[headings.length - 1]}"), include these exact H3 subheads:\n${requiredSubheads.join("\n")}\n` +
          `- Avoid filler; if you need more words, add deeper technical detail, examples, and constraints.\n` +
          `- Do not invent claims that are not supported by the sources.\n` +
          tutorialRules +
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

  const sourceMarkdown = sources.map((source, index) => `[Source ${index + 1}](${source})`).join(", ");

  const bodyByIndex = (idx) => {
    if (locale === "fr") {
      const blocks = [
        `${topic.summary || "Ce signal IA doit etre analyse comme une decision produit, pas comme un buzz."}\n\n- Pour devs: identifier le changement d'architecture ou de stack.\n- Pour fondateurs: estimer impact marge, vitesse de livraison, et risque execution.\n- Pour passionnes IA: verifier ce qui est prouve vs ce qui est encore experimental.`,
        `Ce qui change concretement: nouveaux patterns d'agent, gains attendus sur taches multi-etapes, et nouvelles contraintes de monitoring. Le but n'est pas de refaire toute la stack, mais de trouver 1 workflow rentable a optimiser en premier.`,
        `Lecture technique minimale:\n- Baseline SFT stable avant RL.\n- Reward model calibre sur set hold-out.\n- Contrainte KL explicite pour limiter la derive policy.\n- Observabilite: latence, taux d'erreur outil, taux de correction humaine.\n\nUn gain offline n'est valide que s'il tient en conditions reelles (timeouts, prompts adversariaux, cout/token).`,
        `Blueprint implementation (MVP) :\n\n\`\`\`yaml\npipeline:\n  stage_1: sft_baseline\n  stage_2: reward_model_training\n  stage_3: ppo_with_kl_constraint\n  stage_4: canary_release\nrelease_gates:\n  - no_safety_regression\n  - latency_delta_lt_15_percent\n  - rollback_ready\n\`\`\`\n\nCommencez avec un cas d'usage unique, 2 semaines de mesures, puis extension progressive.`,
        `Vue fondateur (decision rapide):\n- Cout initial augmente (annotation + eval + monitoring).\n- Defensibilite augmente si la qualite de sortie reste stable en production.\n- Risque principal: equipe trop large trop tot.\n\nCadre simple: lancer petit, mesurer marge/qualite, couper vite si pas d'avantage net.`,
        `Pour ${targetRegion}, la difference se joue sur conformite, attentes clients et vitesse d'adoption. Priorites operationnelles: journalisation exploitable, preuves d'evaluation, et messaging clair sur limites du systeme.`,
        `Comparatif pratique:\n- US: vitesse d'iteration et distribution produit.\n- UK: gouvernance et accountability.\n- FR: robustesse, tracabilite, et contraintes conformite.\n\nStrategie gagnante: un noyau technique commun + adaptation locale du go-to-market.`,
        `Checklist de la semaine:\n- Choisir 1 use case agentique avec KPI business.\n- Definir seuils go/no-go (qualite, latence, cout).\n- Ecrire tests adversariaux obligatoires.\n- Mettre rollback one-command.\n- Documenter decisions + hypothese invalidee.\n\nSources: ${sourceMarkdown}.`,
      ];
      return blocks[idx] || blocks[blocks.length - 1];
    }

    const blocks = [
      `${topic.summary || "Treat this AI update as an execution decision, not a headline."}\n\n- For developers: identify architecture implications and integration effort.\n- For founders: estimate margin impact, shipping speed, and defensibility.\n- For AI enthusiasts: separate proven results from speculative claims.`,
      `The practical shift is usually a new agent pattern, not a full stack reset. The winning move is to pick one high-frequency workflow and validate whether quality and latency improve under real traffic constraints.`,
      `Technical teardown essentials:\n- Stable SFT baseline before RL loops.\n- Reward model calibrated on hold-out data.\n- Explicit KL control to prevent policy drift.\n- Online metrics: tool error rate, human override rate, and cost per successful task.\n\nIf gains only appear offline, treat them as unproven.`,
      `Implementation blueprint (MVP):\n\n\`\`\`yaml\npipeline:\n  stage_1: sft_baseline\n  stage_2: reward_model_training\n  stage_3: ppo_with_kl_constraint\n  stage_4: canary_release\nrelease_gates:\n  - no_safety_regression\n  - latency_delta_lt_15_percent\n  - rollback_ready\n\`\`\`\n\nStart with one workflow, run a two-week canary, and expand only after passing gates.`,
      `Founder lens:\n- Costs rise first (labeling, eval, monitoring).\n- Moat improves only if output quality remains stable in production.\n- Biggest risk is scaling the team before unit economics improve.\n\nDecision frame: small pilot, hard metrics, fast rollback, no sunk-cost bias.`,
      `For ${targetRegion}, adoption speed depends on compliance expectations, procurement behavior, and trust signals. Translate technical reliability into buyer-facing proof: evaluation docs, rollback policy, and incident response readiness.`,
      `US/UK/FR operating contrast:\n- US: product velocity and distribution pressure.\n- UK: accountability and auditability.\n- FR: traceability, resilience, and compliance depth.\n\nBest strategy: one core technical stack, localized governance and GTM messaging.`,
      `Ship-this-week checklist:\n- Pick 1 agentic use case with a business KPI.\n- Define go/no-go thresholds (quality, latency, cost).\n- Add mandatory adversarial tests.\n- Implement one-command rollback.\n- Log decisions and invalidated assumptions.\n\nSource bundle: ${sourceMarkdown}.`,
    ];

    return blocks[idx] || blocks[blocks.length - 1];
  };

  const sections = headings.map((heading, index) => `## ${heading}\n\n${bodyByIndex(index)}`);
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

  const updateItem = (topicId, patch) => {
    queue.items = (queue.items || []).map((item) => (item.id === topicId ? { ...item, ...patch } : item));
  };

  for (let attempt = 0; attempt < MAX_TOPIC_ATTEMPTS; attempt += 1) {
    const targetRegion = pickTargetRegion(queue);
    const topic = pickTopic(queue, targetRegion);

    if (!topic) {
      console.log("No queued topic available.");
      if (!DRY_RUN) await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
      return null;
    }

    const template = detectEditorialTemplate(topic);
    const wordTargets = getWordTargets(template);

    const sourceBundle = dedupeUrls([topic.link, ...pickSupportingSources(queue, topic, targetRegion)]).slice(0, 3);
    if (sourceBundle.length < 2) {
      updateItem(topic.id, {
        status: "failed",
        targetRegion,
        region: normalizeRegion(topic.region),
        editorialTemplate: template.id,
        failedAtRun: nowIso,
        failureReason: "insufficient source bundle (need at least 2 URLs)",
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

    if (sourceSnapshots.length < MIN_SOURCE_SNAPSHOTS) {
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
