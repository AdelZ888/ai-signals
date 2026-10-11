const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** USD per 1M tokens: 2 decimals from $0.10, otherwise 3 significant digits. */
export function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "$0";
  if (Math.abs(n) >= 0.1) return `$${n.toFixed(2)}`;
  return `$${Number(n.toPrecision(3))}`;
}

export function fmtUsdCost(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 100) return `$${Math.round(n).toLocaleString("en-US")}`;
  return `$${n.toFixed(2)}`;
}

export function fmtTokens(n: number | null): string {
  if (n === null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${Number((n / 1_000_000).toFixed(2))}M`;
  if (n >= 1_000) return `${Number((n / 1_000).toFixed(1))}K`;
  return String(n);
}

export function fmtPct(p: number): string {
  if (!Number.isFinite(p) || p === 0) return "0%";
  return p > 0 ? `+${p}%` : `−${Math.abs(p)}%`;
}

export function monthYear(isoDay: string): string {
  const [year, month] = isoDay.split("-");
  return `${MONTHS[Number(month) - 1] ?? ""} ${year}`.trim();
}

export const yesNo = (v: boolean) => (v ? "yes" : "no");
