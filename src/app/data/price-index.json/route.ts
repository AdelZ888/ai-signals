import { getSiteUrl } from "@/lib/site-url";
import { getPriceIndex } from "@/lib/site/catalog";
import { BASE_MONTH, LAST_RECONSTRUCTED_MONTH } from "@/lib/site/price-index";
import { priceIndexUrl } from "@/lib/site/urls";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const { series } = getPriceIndex();
  const body = {
    name: "AI Price Index",
    url: `${base}${priceIndexUrl()}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    attribution: "AI Signals (aisignals.dev), data derived from models.dev",
    baseMonth: BASE_MONTH,
    unit: "USD per 1M tokens, blended 3:1 input:output, list prices on labs' own APIs",
    lastReconstructedMonth: LAST_RECONSTRUCTED_MONTH,
    series,
  };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json; charset=utf-8" } });
}
