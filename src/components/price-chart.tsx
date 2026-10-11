import { buildStepChart } from "@/lib/site/chart";
import { fmtUsd } from "@/lib/site/format";

const W = 600;
const H = 140;

export function PriceChart({ points }: { points: { date: string; input: number; output: number }[] }) {
  const g = buildStepChart(
    [
      { id: "input", points: points.map((p) => ({ date: p.date, value: p.input })) },
      { id: "output", points: points.map((p) => ({ date: p.date, value: p.output })) },
    ],
    W,
    H,
    10,
  );
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Price history from ${g.startDate} to ${g.endDate}`}>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} className="grid" x1="0" x2={W} y1={H * f} y2={H * f} />)}
        {g.paths.map((p) => <path key={p.id} d={p.d} className={`s-${p.id}`} fill="none" strokeWidth="2" />)}
        <text x="4" y="12">{fmtUsd(g.yMax)}</text>
      </svg>
      <figcaption className="legend">
        <span className="k-in">input $/1M</span>
        <span className="k-out">output $/1M</span>
        <span className="dim">{g.startDate} → {g.endDate}</span>
      </figcaption>
    </figure>
  );
}
