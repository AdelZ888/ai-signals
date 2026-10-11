import "../load-env.mjs";

import { lastWeekRange } from "../../src/lib/data/dates.ts";
import { DEFAULT_DATA_DIR, readEvents } from "../../src/lib/data/store.ts";
import { buildDigest, digestFacts, digestSlug } from "../../src/lib/editorial/digest.ts";
import { checkGrounding } from "../../src/lib/editorial/guards.ts";
import { articleExists, writeArticle } from "../../src/lib/site/articles.ts";
import { complete } from "./openai.ts";
import { DIGEST_INTRO_SYSTEM } from "./prompts.ts";

const DRY_RUN = process.env.DRY_RUN === "1";

async function main(): Promise<number> {
  const today = process.env.DIGEST_DATE ?? new Date().toISOString().slice(0, 10);
  const range = lastWeekRange(today);
  const slug = digestSlug(range.weekId);
  if (articleExists(slug)) {
    console.log(`[digest] ${slug} already exists`);
    return 0;
  }
  const events = readEvents(DEFAULT_DATA_DIR);
  const fallback = buildDigest(events, range);
  if (!fallback) {
    console.log(`[digest] no changes in ${range.weekId}`);
    return 0;
  }

  let digest = fallback;
  if (!DRY_RUN) {
    const facts = digestFacts(events, range);
    try {
      const intro = await complete(DIGEST_INTRO_SYSTEM, JSON.stringify(facts, null, 2), { maxTokens: 1500 });
      if (intro && !intro.includes("!") && checkGrounding(intro, facts).ok) digest = buildDigest(events, range, intro) ?? fallback;
      else console.warn("[digest] LLM intro rejected, using the default intro");
    } catch (error) {
      console.warn(`[digest] LLM unavailable (${(error as Error).message}), using the default intro`);
    }
  }

  if (DRY_RUN) {
    console.log(`[digest] DRY RUN ${digest.slug}\n# ${digest.title}\n\n${digest.body}`);
    return 0;
  }
  const file = writeArticle({ slug: digest.slug, title: digest.title, description: digest.description, date: today, kind: "digest", modelId: null, body: digest.body });
  console.log(`[digest] wrote ${file}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[digest] failed:", error);
    process.exit(1);
  },
);
