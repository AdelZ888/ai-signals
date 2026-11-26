import Link from "next/link";

import { samePriceSource } from "@/lib/data/diff";
import type { ModelEvent } from "@/lib/data/types";
import { fmtPct, fmtProvider, fmtTokens, fmtUsd } from "@/lib/site/format";
import { modelUrl } from "@/lib/site/urls";

const LABEL: Record<ModelEvent["type"], { text: string; cls: string }> = {
  new_model: { text: "NEW", cls: "tag" },
  price_change: { text: "PRICE", cls: "tag price" },
  provider_change: { text: "PROVIDER SWITCH", cls: "tag" },
  context_change: { text: "CTX", cls: "tag" },
  deprecated: { text: "DEPR", cls: "tag warn" },
  removed: { text: "GONE", cls: "tag dim" },
};

function detail(e: ModelEvent): string {
  if (e.before && e.after && (e.type === "price_change" || e.type === "provider_change")) {
    const prices = `${fmtUsd(e.before.input)} → ${fmtUsd(e.after.input)} in · ${fmtUsd(e.before.output)} → ${fmtUsd(e.after.output)} out · ${fmtPct(e.pctChange ?? 0)} blended`;
    return e.type === "provider_change"
      ? `${fmtProvider(e.before.priceSource)} → ${fmtProvider(e.after.priceSource)} · ${prices} · context ${fmtTokens(e.before.context)} → ${fmtTokens(e.after.context)}`
      : `${fmtProvider(samePriceSource(e))} · ${prices}`;
  }
  if (e.type === "new_model" && e.after) return `${fmtUsd(e.after.input)} in / ${fmtUsd(e.after.output)} out`;
  if (e.type === "context_change" && e.before && e.after) return `${fmtProvider(samePriceSource(e))} · ${fmtTokens(e.before.context)} → ${fmtTokens(e.after.context)}`;
  return "";
}

export function EventFeed({ events, showDate = true }: { events: ModelEvent[]; showDate?: boolean }) {
  if (events.length === 0) return <p className="dim">No changes recorded yet.</p>;
  return (
    <ul className="feed">
      {events.map((e) => (
        <li key={`${e.date}-${e.id}-${e.type}`}>
          {showDate ? <span className="dim">{e.date} </span> : null}
          <span className={LABEL[e.type].cls}>{e.type === "price_change" && !samePriceSource(e) ? "PRICE HISTORY" : LABEL[e.type].text}</span>
          {e.type === "removed" ? <span>{e.name}</span> : <Link href={modelUrl(e)}>{e.name}</Link>}{" "}
          <span className={e.type === "price_change" && samePriceSource(e) ? ((e.pctChange ?? 0) < 0 ? "dn" : "up") : "muted"}>{detail(e)}</span>
        </li>
      ))}
    </ul>
  );
}
