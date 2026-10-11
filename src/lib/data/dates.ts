const DAY_MS = 86_400_000;

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function toIsoDay(value: string | null | undefined): string | null {
  const v = String(value ?? "").trim();
  let day: string | null = null;
  if (/^\d{4}-\d{2}-\d{2}$/u.test(v)) day = v;
  else if (/^\d{4}-\d{2}$/u.test(v)) day = `${v}-01`;
  else if (/^\d{4}$/u.test(v)) day = `${v}-01-01`;
  // Round-trip through Date so "2025-13-01" or "2025-02-30" are rejected, not rolled over.
  const parsed = day ? new Date(`${day}T00:00:00Z`) : null;
  return parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day ? day : null;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isoWeek(date: string): string {
  const d = utc(date);
  const dayFromMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayFromMonday + 3); // Thursday of this week
  const year = d.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / DAY_MS - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function lastWeekRange(today: string): { start: string; end: string; weekId: string } {
  const dayFromMonday = (utc(today).getUTCDay() + 6) % 7;
  const thisMonday = addDays(today, -dayFromMonday);
  const start = addDays(thisMonday, -7);
  return { start, end: addDays(thisMonday, -1), weekId: isoWeek(start) };
}
