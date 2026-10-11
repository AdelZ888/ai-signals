export type Stat = { label: string; value: string; note?: string };

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stats">
      {stats.map((s) => (
        <div key={s.label}>
          <small>{s.label}</small>
          <b>{s.value}</b>
          {s.note ? <em>{s.note}</em> : null}
        </div>
      ))}
    </div>
  );
}
