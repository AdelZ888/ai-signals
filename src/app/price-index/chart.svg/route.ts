import { getPriceIndex } from "@/lib/site/catalog";
import { indexChartSvg } from "@/lib/site/price-index-chart";

export const dynamic = "force-static";

export function GET() {
  return new Response(indexChartSvg(getPriceIndex().series), {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=86400" },
  });
}
