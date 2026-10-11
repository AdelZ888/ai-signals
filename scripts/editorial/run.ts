import "../load-env.mjs";

import { addDays } from "../../src/lib/data/dates.ts";
import { DEFAULT_DATA_DIR, readEvents, readLatest } from "../../src/lib/data/store.ts";
import type { Model, ModelEvent } from "../../src/lib/data/types.ts";
import { buildFactSheet, type FactSheet } from "../../src/lib/editorial/factsheet.ts";
import { checkGrounding, checkLinks, pickTitle } from "../../src/lib/editorial/guards.ts";
import { pickFlashEvent, scoreEvent } from "../../src/lib/editorial/score.ts";
import { articleSlug, renderTemplateArticle, type Article } from "../../src/lib/editorial/template.ts";
import { articleExists, listArticles, writeArticle } from "../../src/lib/site/articles.ts";
import { complete } from "./openai.ts";
import { BODY_SYSTEM, TITLE_SYSTEM, repairPrompt } from "./prompts.ts";

const DRY_RUN = process.env.DRY_RUN === "1";
const MIN_WORDS = 250;

async function writeWithLlm(facts: FactSheet, fallback: Article): Promise<{ article: Article; mode: "llm" | "template" }> {
  try {
    const factsJson = JSON.stringify(facts, null, 2);
    const parsed = JSON.parse(await complete(TITLE_SYSTEM, factsJson, { json: true, maxTokens: 4000 })) as { titles?: unknown };
    const title = pickTitle(Array.isArray(parsed.titles) ? parsed.titles.map(String) : [], facts) ?? fallback.title;

    let body = await complete(BODY_SYSTEM, `Title: ${title}\n\nFact sheet:\n${factsJson}`);
    let check = checkGrounding(body, facts);
    if (!check.ok) {
      body = await complete(BODY_SYSTEM, `Fact sheet:\n${factsJson}\n\nPrevious draft:\n${body}\n\n${repairPrompt(check.unknown)}`);
      check = checkGrounding(body, facts);
    }
    const links = checkLinks(body, facts);
    if (!check.ok || !links.ok || body.split(/\s+/u).length < MIN_WORDS) {
      console.warn(`[editorial] LLM draft rejected (unknown numbers: ${check.unknown.join(", ") || "none"}; bad links: ${links.bad.join(", ") || "none"}), using template`);
      return { article: fallback, mode: "template" };
    }
    return { article: { title, description: fallback.description, body }, mode: "llm" };
  } catch (error) {
    console.warn(`[editorial] LLM unavailable (${(error as Error).message}), using template`);
    return { article: fallback, mode: "template" };
  }
}

function simulate(models: Model[], events: ModelEvent[], days: number, end: string): number {
  const published: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = addDays(end, -i);
    const pick = pickFlashEvent(events.filter((e) => e.date === day).map((e) => scoreEvent(e, models, day)), published, day);
    if (!pick) continue;
    published.push(day);
    console.log(`${day} score=${pick.score} ${renderTemplateArticle(buildFactSheet(pick, models)).title}`);
  }
  console.log(`[editorial] simulation: ${published.length} flash articles over ${days} days`);
  return 0;
}

async function main(): Promise<number> {
  const models = readLatest(DEFAULT_DATA_DIR);
  if (!models) {
    console.error("[editorial] no data/models/latest.json");
    return 1;
  }
  const events = readEvents(DEFAULT_DATA_DIR);
  const today = process.env.EDITORIAL_DATE ?? new Date().toISOString().slice(0, 10);
  const simulateDays = Number(process.env.SIMULATE_DAYS ?? 0);
  if (simulateDays > 0) return simulate(models, events, simulateDays, today);

  const scored = events.filter((e) => e.date === today).map((e) => scoreEvent(e, models, today));
  for (const s of scored) console.log(`[editorial] ${s.event.type} ${s.event.id} score=${s.score}${s.eligible ? " ELIGIBLE" : ""} (${s.reasons.join("; ")})`);

  const flashDates = listArticles().filter((a) => a.kind === "flash").map((a) => a.date);
  const pick = pickFlashEvent(scored, flashDates, today);
  if (!pick) {
    console.log("[editorial] nothing to publish today");
    return 0;
  }
  const slug = articleSlug(pick.event);
  if (articleExists(slug)) {
    console.log(`[editorial] ${slug} already exists`);
    return 0;
  }

  const facts = buildFactSheet(pick, models);
  const fallback = renderTemplateArticle(facts);
  const { article, mode } = DRY_RUN ? { article: fallback, mode: "template" as const } : await writeWithLlm(facts, fallback);
  if (DRY_RUN) {
    console.log(`[editorial] DRY RUN ${slug}\n# ${article.title}\n\n${article.body}`);
    return 0;
  }
  const file = writeArticle({ slug, title: article.title, description: article.description, date: today, kind: "flash", modelId: pick.event.id, body: article.body });
  console.log(`[editorial] wrote ${file} mode=${mode} score=${pick.score}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[editorial] failed:", error);
    process.exit(1);
  },
);
