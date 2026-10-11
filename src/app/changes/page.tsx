import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EventFeed } from "@/components/event-feed";
import { getCatalog, recentEvents } from "@/lib/site/catalog";

export const metadata: Metadata = {
  title: "AI Model Price Changes & New Releases Log",
  description: "Every tracked AI model launch, price cut, price increase, context change and deprecation, newest first.",
  alternates: { canonical: "/changes" },
};

export default function ChangesPage() {
  const { events } = getCatalog();
  const latest = recentEvents(events, 300);
  return (
    <>
      <Breadcrumbs items={[{ href: "/changes", label: "changes" }]} />
      <h1>AI model changelog</h1>
      <p className="sub">{events.length} recorded changes · showing the latest {latest.length}</p>
      <Box title="changes">
        <EventFeed events={latest} />
      </Box>
    </>
  );
}
