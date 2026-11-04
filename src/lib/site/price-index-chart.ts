import { buildLineChart } from "./chart.ts";
import { monthYear } from "./format.ts";
import { monthLabel, type IndexPoint } from "./price-index.ts";
import { xmlEscape } from "./seo.ts";

export const INDEX_CHART_SIZE = { width: 640, height: 320 } as const;

/** Every nth label, so the axis stays readable as the series grows. */
export function axisLabels(months: string[], max = 6): { i: number; label: string }[] {
  const step = Math.max(1, Math.ceil(months.length / max));
  return months.flatMap((m, i) => (i % step === 0 ? [{ i, label: monthYear(`${m}-01`) }] : []));
}

/** Self-contained SVG for other sites to embed: it carries its own colours, title and source. */
export function indexChartSvg(series: IndexPoint[]): string {
  const { width, height } = INDEX_CHART_SIZE;
  const latest = series.at(-1);
  const g = buildLineChart(
    [{ id: "premium", values: series.map((p) => p.premiumIndex) }, { id: "budget", values: series.map((p) => p.budgetIndex) }, { id: "median", values: series.map((p) => p.index) }],
    width,
    height,
    { top: 62, right: 16, bottom: 44, left: 40 },
  );
  const colors: Record<string, string> = { median: "#22c55e", premium: "#f59e0b", budget: "#7ea58c" };
  const font = 'font-family="DejaVu Sans Mono,Menlo,Consolas,monospace"';
  const title = latest ? `AI Price Index, ${monthLabel(latest.month)}: ${latest.index} (January 2026 = 100)` : "AI Price Index";
  const grid = g.ticks
    .map((t) => `<line x1="${g.margin.left}" x2="${width - g.margin.right}" y1="${t.y}" y2="${t.y}" stroke="#1d2a21"/><text x="${g.margin.left - 6}" y="${t.y + 3}" fill="#7ea58c" font-size="10" text-anchor="end" ${font}>${t.value}</text>`)
    .join("");
  const axis = axisLabels(series.map((p) => p.month))
    .map(({ i, label }) => `<text x="${g.xs[i]}" y="${height - 28}" fill="#7ea58c" font-size="10" text-anchor="middle" ${font}>${xmlEscape(label)}</text>`)
    .join("");
  const lines = g.paths.map((p) => `<path d="${p.d}" fill="none" stroke="${colors[p.id]}" stroke-width="${p.id === "median" ? 2.5 : 1.5}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${xmlEscape(title)}">
<title>${xmlEscape(title)}</title>
<rect width="${width}" height="${height}" fill="#0a0e0b"/>
<text x="16" y="26" fill="#e9fff1" font-size="15" font-weight="700" ${font}>${xmlEscape(title)}</text>
<text x="16" y="46" font-size="11" ${font}><tspan fill="#22c55e">median</tspan><tspan fill="#f59e0b" dx="14">premium (P90)</tspan><tspan fill="#7ea58c" dx="14">budget (P10)</tspan></text>
${grid}${lines}${axis}
<text x="16" y="${height - 10}" fill="#7ea58c" font-size="10" ${font}>List prices on labs' own APIs. Source: aisignals.dev/price-index</text>
</svg>
`;
}
