import Link from "next/link";

import { Box } from "@/components/box";
import { EventFeed } from "@/components/event-feed";
import { ModelTable } from "@/components/model-table";
import { TIER1_LABS } from "@/lib/data/config";
import { daysBetween } from "@/lib/data/dates";
import { getCatalog, getPairs, labSummaries, recentEvents } from "@/lib/site/catalog";
import { modelRows } from "@/lib/site/rows";
import { BEST_LISTS, notablePool } from "@/lib/site/selection";
import { bestUrl, compareUrl } from "@/lib/site/urls";

export default function Home() {
  const { models, events, meta, today } = getCatalog();
  const popular = notablePool(models, today, 1)
    .filter((m) => TIER1_LABS.has(m.lab))
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))
    .slice(0, 15);
  const movers = events
    .filter((e) => e.type === "price_change" && daysBetween(e.date, today) <= 30)
    .sort((a, b) => Math.abs(b.pctChange ?? 0) - Math.abs(a.pctChange ?? 0))
    .slice(0, 5);
  const sync = meta ? `${meta.lastSuccessAt.slice(0, 16).replace("T", " ")} UTC` : "pending";

  return (
    <>
      <section className="hero">
        <h1>Every AI model&apos;s price, tracked daily.</h1>
        <p className="sub">
          {models.length} models · {labSummaries(models).length} labs · <span className="ok">● last sync {sync}</span>
        </p>
      </section>
      <div className="grid-2">
        <Box title="popular models">
          <ModelTable rows={modelRows(popular)} initialSort={null} />
          <Link className="btn" href="/models">search all {models.length} models →</Link>
        </Box>
        <div>
          <Box title="latest changes">
            <EventFeed events={recentEvents(events, 8)} />
            <Link className="btn" href="/changes">full changelog →</Link>
          </Box>
          <Box title="biggest price moves (30 days)">
            <EventFeed events={movers} />
          </Box>
        </div>
      </div>
      <Box title="popular comparisons">
        {getPairs().slice(0, 12).map((p) => (
          <Link key={p.key} className="btn" href={compareUrl(p.key)}>{p.a.name} vs {p.b.name}</Link>
        ))}
        <br />
        <Link className="btn" href="/compare">all comparisons →</Link>
      </Box>
      <Box title="rankings">
        <ul className="feed">
          {BEST_LISTS.map((l) => (
            <li key={l.slug}><Link href={bestUrl(l.slug)}>{l.title}</Link> <span className="dim">{l.description}</span></li>
          ))}
        </ul>
      </Box>
    </>
  );
}
