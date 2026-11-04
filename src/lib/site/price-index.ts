import { LAB_PROVIDER, isLabId } from "../data/config.ts";
import { pct } from "../data/diff.ts";
import { round } from "../data/normalize.ts";
import type { IndexRow, IndexSnapshot, Model } from "../data/types.ts";

/** January 2026 = 100. The first full calendar year with stable coverage (11+ labs). */
export const BASE_MONTH = "2026-01";
/** Months up to this one were rebuilt from the models.dev git history; later ones are captured at month end. */
export const LAST_RECONSTRUCTED_MONTH = "2026-10";
const RECONSTRUCTED_ON = "2026-11-04";

export type { IndexRow, IndexSnapshot };

export type IndexPoint = {
  month: string; models: number; labs: number;
  median: number; p10: number; p90: number;
  index: number; budgetIndex: number; premiumIndex: number;
  momPct: number | null; sinceBasePct: number;
  added: number; retired: number; repriced: number; cuts: number; hikes: number;
};

export type Repriced = { row: IndexRow; before: IndexRow; pct: number };

export type Comparison = {
  stayers: number; stayerMedian: number | null;
  repriced: Repriced[]; added: IndexRow[]; retired: IndexRow[];
  addedMedian: number | null; retiredMedian: number | null;
};

export type LabChange = { lab: string; beforeCount: number; before: number | null; afterCount: number; after: number | null; pct: number | null };
export type Cohort = { quarter: string; count: number; median: number; partial: boolean };
export type Floor = { id: string; label: string; row: IndexRow };

export function percentile(values: number[], f: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (sorted.length - 1) * f;
  const low = Math.floor(at);
  const high = Math.min(low + 1, sorted.length - 1);
  return sorted[low] + (sorted[high] - sorted[low]) * (at - low);
}

const medianOf = (rows: IndexRow[]): number | null => (rows.length > 0 ? round(percentile(rows.map((r) => r.blended), 0.5)) : null);

export function indexRows(models: Model[]): IndexRow[] {
  return models
    .filter((m) => isLabId(m.lab) && m.priceSource === LAB_PROVIDER[m.lab] && m.blended > 0)
    .map((m) => ({
      id: m.id, lab: m.lab, slug: m.slug, name: m.name,
      input: m.price.input, output: m.price.output, blended: m.blended,
      releaseDate: m.releaseDate, context: m.context, status: m.status,
      tools: m.capabilities.toolCall, reasoning: m.capabilities.reasoning,
      vision: m.modalitiesIn.some((v) => v.startsWith("image")),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function compareSnapshots(a: IndexSnapshot, b: IndexSnapshot): Comparison {
  const before = new Map(a.rows.map((r) => [r.id, r]));
  const after = new Set(b.rows.map((r) => r.id));
  const stayers = b.rows.filter((r) => before.has(r.id));
  const added = b.rows.filter((r) => !before.has(r.id));
  const retired = a.rows.filter((r) => !after.has(r.id));
  const repriced = stayers
    .filter((r) => {
      const p = before.get(r.id)!;
      return p.input !== r.input || p.output !== r.output;
    })
    .map((row) => ({ row, before: before.get(row.id)!, pct: pct(before.get(row.id)!.blended, row.blended) }))
    .sort((x, y) => x.pct - y.pct || x.row.id.localeCompare(y.row.id));
  return { stayers: stayers.length, stayerMedian: medianOf(stayers), repriced, added, retired, addedMedian: medianOf(added), retiredMedian: medianOf(retired) };
}

export function buildSeries(snapshots: IndexSnapshot[], baseMonth = BASE_MONTH): IndexPoint[] {
  const ordered = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  if (ordered.length === 0) return [];
  const stat = (s: IndexSnapshot, f: number) => round(percentile(s.rows.map((r) => r.blended), f));
  const base = ordered.find((s) => s.month === baseMonth) ?? ordered[0];
  const rebase = (value: number, of: number) => round((value / of) * 100, 1);
  const [baseMedian, baseP10, baseP90] = [stat(base, 0.5), stat(base, 0.1), stat(base, 0.9)];

  return ordered.map((s, i) => {
    const prev = ordered[i - 1];
    const cmp = prev ? compareSnapshots(prev, s) : null;
    const [median, p10, p90] = [stat(s, 0.5), stat(s, 0.1), stat(s, 0.9)];
    return {
      month: s.month,
      models: s.rows.length,
      labs: new Set(s.rows.map((r) => r.lab)).size,
      median, p10, p90,
      index: rebase(median, baseMedian),
      budgetIndex: rebase(p10, baseP10),
      premiumIndex: rebase(p90, baseP90),
      momPct: prev ? pct(stat(prev, 0.5), median) : null,
      sinceBasePct: pct(baseMedian, median),
      added: cmp?.added.length ?? 0,
      retired: cmp?.retired.length ?? 0,
      repriced: cmp?.repriced.length ?? 0,
      cuts: cmp?.repriced.filter((r) => r.pct < 0).length ?? 0,
      hikes: cmp?.repriced.filter((r) => r.pct > 0).length ?? 0,
    };
  });
}

export function labChanges(a: IndexSnapshot, b: IndexSnapshot): LabChange[] {
  const of = (s: IndexSnapshot, lab: string) => s.rows.filter((r) => r.lab === lab);
  const labs = [...new Set([...a.rows, ...b.rows].map((r) => r.lab))].sort();
  return labs.map((lab) => {
    const [x, y] = [of(a, lab), of(b, lab)];
    const [before, after] = [medianOf(x), medianOf(y)];
    return { lab, beforeCount: x.length, before, afterCount: y.length, after, pct: before !== null && after !== null ? pct(before, after) : null };
  });
}

/** How much one lab drives the result: the change in the median when each lab is left out in turn. */
export function leaveOneLabOut(a: IndexSnapshot, b: IndexSnapshot, minRows = 10): Range | null {
  const labs = [...new Set([...a.rows, ...b.rows].map((r) => r.lab))].sort();
  const results = labs.flatMap((lab) => {
    const [before, after] = [a.rows.filter((r) => r.lab !== lab), b.rows.filter((r) => r.lab !== lab)];
    if (before.length < minRows || after.length < minRows) return [];
    return [{ lab, pct: pct(medianOf(before)!, medianOf(after)!) }];
  });
  if (results.length === 0) return null;
  const sorted = [...results].sort((x, y) => x.pct - y.pct);
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}

const quarterOf = (day: string) => `${day.slice(0, 4)}-Q${Math.ceil(Number(day.slice(5, 7)) / 3)}`;

/** Median launch price by release quarter, from the first price each model was seen at (survivorship-free). */
export function launchCohorts(snapshots: IndexSnapshot[], opts: { minCount?: number; fromQuarter?: string } = {}): Cohort[] {
  const ordered = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  if (ordered.length === 0) return [];
  const first = new Map<string, IndexRow>();
  for (const s of ordered) for (const r of s.rows) if (!first.has(r.id)) first.set(r.id, r);

  const latest = ordered[ordered.length - 1].month;
  const running = Number(latest.slice(5, 7)) % 3 !== 0 ? quarterOf(`${latest}-01`) : null;
  const from = opts.fromQuarter ?? quarterOf(`${ordered[0].month}-01`);
  const groups = new Map<string, IndexRow[]>();
  for (const r of first.values()) {
    if (!r.releaseDate) continue;
    const q = quarterOf(r.releaseDate);
    if (q >= from) groups.set(q, [...(groups.get(q) ?? []), r]);
  }
  return [...groups.entries()]
    .filter(([, rows]) => rows.length >= (opts.minCount ?? 5))
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([quarter, rows]) => ({ quarter, count: rows.length, median: medianOf(rows)!, partial: quarter === running }));
}

const FLOORS: { id: string; label: string; test: (r: IndexRow) => boolean }[] = [
  { id: "tools", label: "tool calling, 128K+ context", test: (r) => r.tools && r.context >= 128_000 },
  { id: "reasoning", label: "reasoning and tool calling", test: (r) => r.reasoning && r.tools },
  { id: "long-context", label: "1M+ context", test: (r) => r.context >= 1_000_000 },
  { id: "vision", label: "image input", test: (r) => r.vision },
];

export function floorsOf(s: IndexSnapshot): Floor[] {
  const live = s.rows.filter((r) => r.status !== "deprecated");
  return FLOORS.flatMap(({ id, label, test }) => {
    const [cheapest] = live.filter(test).sort((a, b) => a.blended - b.blended || a.id.localeCompare(b.id));
    return cheapest ? [{ id, label, row: cheapest }] : [];
  });
}

export function previousMonth(today: string): string {
  const [y, m] = today.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/** The day a month's index is published: the first of the following month. */
export function closingDate(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

export const isReconstructed = (month: string) => month <= LAST_RECONSTRUCTED_MONTH;

/** The real publication date: rebuilt months did not exist before the index launched. */
export const publishedOn = (month: string) => (isReconstructed(month) ? RECONSTRUCTED_ON : closingDate(month));

export function monthsAround(months: string[], month: string): { prev: string | null; next: string | null } {
  const i = months.indexOf(month);
  return { prev: months[i - 1] ?? null, next: months[i + 1] ?? null };
}

export type Trend = "up" | "down" | "flat";

export function trendWord(change: number): Trend {
  if (Math.abs(change) < 1) return "flat";
  return change > 0 ? "up" : "down";
}

export type Range = { min: { lab: string; pct: number }; max: { lab: string; pct: number } };

/** The sentence that opens the index: it never claims a direction that one lab alone could reverse. */
export function verdict(sinceBasePct: number, range: Range | null): string {
  const trend = trendWord(sinceBasePct);
  if (trend === "flat") return "AI API list prices are flat.";
  if (!range) return `AI API list prices are ${trend}.`;
  if (trend === "up") return range.min.pct >= -1 ? "AI API list prices are not falling." : "AI API list prices are up, but the result depends on which labs you count.";
  return range.max.pct <= 1 ? "AI API list prices are falling." : "AI API list prices are down, but the result depends on which labs you count.";
}

export function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** The month to freeze today, or null once last month's snapshot exists. */
export function monthToClose(today: string, closed: string[]): string | null {
  const month = previousMonth(today);
  return closed.includes(month) ? null : month;
}
