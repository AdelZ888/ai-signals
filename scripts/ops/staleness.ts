export function staleness(meta: { lastSuccessAt: string } | null, now: Date, maxHours = 72): { stale: boolean; hours: number | null } {
  if (!meta) return { stale: true, hours: null };
  const hours = Math.round((now.getTime() - Date.parse(meta.lastSuccessAt)) / 3_600_000);
  return { stale: !(hours <= maxHours), hours: Number.isFinite(hours) ? hours : null };
}
