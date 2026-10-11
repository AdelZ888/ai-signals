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
