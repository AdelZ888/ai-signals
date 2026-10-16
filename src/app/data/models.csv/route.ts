import { getSiteUrl } from "@/lib/site-url";
import { getCatalog } from "@/lib/site/catalog";
import { datasetRows, toCsv } from "@/lib/site/dataset";

export const dynamic = "force-static";

export function GET() {
  const csv = toCsv(datasetRows(getCatalog().models, getSiteUrl()));
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'inline; filename="ai-model-prices.csv"',
      link: '<https://github.com/sst/models.dev/blob/dev/LICENSE>; rel="license"',
    },
  });
}
