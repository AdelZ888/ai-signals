import { findModel, getCatalog } from "@/lib/site/catalog";
import { badgeSvg, badgeValue } from "@/lib/site/badge";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().models.map((m) => ({ lab: m.lab, file: `${m.slug}.svg` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lab: string; file: string }> }) {
  const { lab, file } = await params;
  const model = file.endsWith(".svg") ? findModel(lab, file.slice(0, -4)) : null;
  if (!model) return new Response("Not found", { status: 404 });
  return new Response(badgeSvg("AI Signals", badgeValue(model)), {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=86400" },
  });
}
