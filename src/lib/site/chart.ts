export type ChartPoint = { date: string; value: number };
export type ChartSeries = { id: string; points: ChartPoint[] };
export type ChartGeometry = { paths: { id: string; d: string }[]; yMax: number; startDate: string; endDate: string };

const DAY_MS = 86_400_000;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Step-line geometry (prices change in steps) on a shared time/price scale. */
export function buildStepChart(series: ChartSeries[], width: number, height: number, pad = 8): ChartGeometry {
  const valid = (p: ChartPoint) => Number.isFinite(Date.parse(`${p.date}T00:00:00Z`)) && Number.isFinite(p.value);
  series = series.map((s) => ({ ...s, points: s.points.filter(valid) }));
  const all = series.flatMap((s) => s.points);
  if (all.length === 0) return { paths: [], yMax: 0, startDate: "", endDate: "" };
  const times = all.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const span = Math.max(t1 - t0, DAY_MS);
  const yMax = Math.round(Math.max(...all.map((p) => p.value), 0.0001) * 1.15 * 10_000) / 10_000;
  const x = (date: string) => r1(pad + ((Date.parse(`${date}T00:00:00Z`) - t0) / span) * (width - 2 * pad));
  const y = (v: number) => r1(height - pad - (v / yMax) * (height - 2 * pad));

  const paths = series.map((s) => {
    const pts = [...s.points].sort((a, b) => a.date.localeCompare(b.date));
    const d = pts.map((p, i) => (i === 0 ? `M${x(p.date)} ${y(p.value)}` : `H${x(p.date)}V${y(p.value)}`)).join("");
    return { id: s.id, d };
  });
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  return { paths, yMax, startDate: iso(t0), endDate: iso(t1) };
}

export type LineSeries = { id: string; values: number[] };
export type LineMargin = { top: number; right: number; bottom: number; left: number };
export type LineChart = { paths: { id: string; d: string }[]; ticks: { value: number; y: number }[]; xs: number[]; margin: LineMargin };

const DEFAULT_MARGIN: LineMargin = { top: 10, right: 10, bottom: 20, left: 32 };

function niceStep(span: number): number {
  const rough = span / 4;
  return [1, 2, 5, 10, 25, 50, 100, 250, 500].find((s) => s >= rough) ?? Math.ceil(rough);
}

/** Straight-line chart over evenly spaced periods, with round y ticks (not zero-based: it plots an index). */
export function buildLineChart(series: LineSeries[], width: number, height: number, margin = DEFAULT_MARGIN): LineChart {
  const all = series.flatMap((s) => s.values).filter(Number.isFinite);
  const count = Math.max(0, ...series.map((s) => s.values.length));
  if (all.length === 0) return { paths: [], ticks: [], xs: [], margin };

  const step = niceStep(Math.max(...all) - Math.min(...all));
  const yMin = Math.floor(Math.min(...all) / step) * step;
  const yMax = Math.max(Math.ceil(Math.max(...all) / step) * step, yMin + step);
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const xs = Array.from({ length: count }, (_, i) => r1(margin.left + (count > 1 ? (i / (count - 1)) * plotW : plotW / 2)));
  const y = (v: number) => r1(margin.top + (1 - (v - yMin) / (yMax - yMin)) * plotH);

  const ticks: LineChart["ticks"] = [];
  for (let v = yMin; v <= yMax; v += step) ticks.push({ value: v, y: y(v) });
  const paths = series.map((s) => ({ id: s.id, d: s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xs[i]} ${y(v)}`).join("") }));
  return { paths, ticks, xs, margin };
}

