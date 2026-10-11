import Link from "next/link";

import type { ModelEvent } from "@/lib/data/types";
import { fmtPct, fmtTokens, fmtUsd } from "@/lib/site/format";
import { modelUrl } from "@/lib/site/urls";

const LABEL: Record<ModelEvent["type"], { text: string; cls: string }> = {
  new_model: { text: "NEW", cls: "tag" },
  price_change: { text: "PRICE", cls: "tag price" },
  context_change: { text: "CTX", cls: "tag" },
  deprecated: { text: "DEPR", cls: "tag warn" },
  removed: { text: "GONE", cls: "tag dim" },
};

function detail(e: ModelEvent): string {
  if (e.type === "price_change" && e.before && e.after) return `${fmtUsd(e.before.input)} → ${fmtUsd(e.after.input)} in · ${fmtPct(e.pctChange ?? 0)}`;
  if (e.type === "new_model" && e.after) return `${fmtUsd(e.after.input)} in / ${fmtUsd(e.after.output)} out`;
  if (e.type === "context_change" && e.before && e.after) return `${fmtTokens(e.before.context)} → ${fmtTokens(e.after.context)}`;
  return "";
}

export function EventFeed({ events, showDate = true }: { events: ModelEvent[]; showDate?: boolean }) {
  if (events.length === 0) return <p className="dim">No changes recorded yet.</p>;
  return (
    <ul className="feed">
      {events.map((e) => (
        <li key={`${e.date}-${e.id}-${e.type}`}>
          {showDate ? <span className="dim">{e.date} </span> : null}
          <span className={LABEL[e.type].cls}>{LABEL[e.type].text}</span>
          {e.type === "removed" ? <span>{e.name}</span> : <Link href={modelUrl(e)}>{e.name}</Link>}{" "}
          <span className={e.type === "price_change" ? ((e.pctChange ?? 0) < 0 ? "dn" : "up") : "muted"}>{detail(e)}</span>
        </li>
      ))}
    </ul>
  );
}
