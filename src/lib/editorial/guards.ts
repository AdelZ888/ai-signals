import { remark } from "remark";
import remarkGfm from "remark-gfm";

import type { FactSheet } from "./factsheet.ts";

const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/gu;
const INTERNAL_PATH = /^\/(models|providers|compare|best|news|changes|calculator)(\/[a-z0-9._-]+)*\/?$/u;
const BANNED = /you won'?t believe|shocking|insane|mind[- ]?blowing|game[- ]?changer|jaw[- ]?dropping|!|\?\?/iu;

export function extractNumbers(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(NUMBER_RE)) {
    const n = Number(m[0].replace(/,/gu, ""));
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

function walk(value: unknown, onNumber: (n: number) => void, onString: (s: string) => void): void {
  if (typeof value === "number") onNumber(value);
  else if (typeof value === "string") onString(value);
  else if (Array.isArray(value)) value.forEach((v) => walk(v, onNumber, onString));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => walk(v, onNumber, onString));
}

const roundTo = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Numbers of the fact sheet with their usual display forms (M/K units, rounding). */
export function allowedNumbers(facts: unknown): number[] {
  const set = new Set<number>();
  walk(
    facts,
    (n) => {
      const a = Math.abs(n);
      for (const v of [a, a / 1_000_000, a / 1_000]) {
        set.add(v);
        set.add(roundTo(v, 2));
        set.add(roundTo(v, 1));
        set.add(Math.round(v));
      }
    },
    (s) => extractNumbers(s).forEach((n) => set.add(n)),
  );
  return [...set];
}

/** Every number in `text` must exist in the facts (0.5% tolerance). Integers up to 10 are always allowed. */
export function checkGrounding(text: string, facts: unknown): { ok: boolean; unknown: number[] } {
  const allowed = allowedNumbers(facts);
  const unknown = new Set<number>();
  for (const n of extractNumbers(text)) {
    if (Number.isInteger(n) && n <= 10) continue;
    if (!allowed.some((a) => a === n || Math.abs(a - n) <= Math.abs(a) * 0.005)) unknown.add(n);
  }
  return { ok: unknown.size === 0, unknown: [...unknown] };
}

export function pickTitle(titles: string[], facts: FactSheet): string | null {
  const name = facts.model.name.toLowerCase();
  const valid = titles
    .map((t) => t.trim().replace(/^["']|["']$/gu, ""))
    .filter(
      (t) =>
        t.length >= 20 && t.length <= 90 && !BANNED.test(t) && t.toLowerCase().includes(name) &&
        checkGrounding(t, facts).ok && (!/\bcheapest\b/iu.test(t) || facts.isCheapestInClass),
    );
  const score = (t: string) => (/\d/u.test(t) ? 2 : 0) + (/\b(vs\.?|than|undercuts|beats)\b/iu.test(t) ? 2 : 0) + (/[$%]/u.test(t) ? 1 : 0);
  return valid.map((t, i) => ({ t, s: score(t), i })).sort((a, b) => b.s - a.s || a.i - b.i)[0]?.t ?? null;
}

type MdNode = { type: string; url?: string; value?: string; children?: MdNode[] };

/** Allowed link targets: only the url fields of the fact sheet, and only strict internal paths. */
export function factUrls(facts: FactSheet): string[] {
  const urls = [facts.model.url, facts.rival?.url, ...facts.competitors.map((c) => c.url)];
  return [...new Set(urls.filter((u): u is string => typeof u === "string" && INTERNAL_PATH.test(u)))];
}

/**
 * LLM output may only link to allowed internal URLs: the text is parsed like the site renders it
 * (Markdown + GFM), so inline, reference, autolink, www. and image links are all caught, and raw HTML is rejected.
 */
export function checkLinks(text: string, allowedUrls: string[]): { ok: boolean; bad: string[] } {
  const allowed = new Set(allowedUrls.filter((u) => INTERNAL_PATH.test(u)));
  const bad = new Set<string>();
  const visit = (node: MdNode) => {
    if ((node.type === "link" || node.type === "image" || node.type === "definition") && !allowed.has(node.url ?? "")) bad.add(node.url ?? "");
    if (node.type === "html") bad.add(`html:${node.value ?? ""}`);
    node.children?.forEach(visit);
  };
  visit(remark().use(remarkGfm).parse(text) as unknown as MdNode);
  return { ok: bad.size === 0, bad: [...bad] };
}
