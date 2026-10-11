import type { FactSheet } from "./factsheet.ts";

const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/gu;
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
