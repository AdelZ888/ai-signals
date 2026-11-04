import { buildLineChart } from "@/lib/site/chart";
import type { IndexPoint } from "@/lib/site/price-index";
import { axisLabels } from "@/lib/site/price-index-chart";

const W = 720;
const H = 240;
const STYLE: Record<string, string> = { median: "s-input", premium: "s-output", budget: "s-muted" };

export function IndexChart({ series }: { series: IndexPoint[] }) {
  const g = buildLineChart(
    [
      { id: "premium", values: series.map((p) => p.premiumIndex) },
      { id: "budget", values: series.map((p) => p.budgetIndex) },
      { id: "median", values: series.map((p) => p.index) },
    ],
    W,
    H,
    { top: 8, right: 8, bottom: 20, left: 34 },
  );
  const latest = series.at(-1);
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`AI Price Index by month, latest value ${latest?.index ?? ""}, January 2026 = 100`}>
        {g.ticks.map((t) => (
          <g key={t.value}>
            <line className="grid" x1={g.margin.left} x2={W - g.margin.right} y1={t.y} y2={t.y} />
            <text x={g.margin.left - 6} y={t.y + 3} textAnchor="end">{t.value}</text>
          </g>
        ))}
        {g.paths.map((p) => <path key={p.id} d={p.d} className={STYLE[p.id]} fill="none" strokeWidth={p.id === "median" ? 2.5 : 1.5} />)}
        {axisLabels(series.map((p) => p.month)).map(({ i, label }) => <text key={i} x={g.xs[i]} y={H - 4} textAnchor="middle">{label}</text>)}
      </svg>
      <figcaption className="legend">
        <span className="k-in">median (the index)</span>
        <span className="k-out">premium, 90th percentile</span>
        <span className="k-muted">budget, 10th percentile</span>
        <span className="dim">January 2026 = 100</span>
      </figcaption>
    </figure>
  );
}
