import { getPriceIndex } from "@/lib/site/catalog";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPriceIndex().snapshots.map((s) => ({ file: `${s.month}.json` }));
}

/** The frozen month behind each index value: every model, so anyone can recompute it. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const snapshot = getPriceIndex().snapshots.find((s) => `${s.month}.json` === file);
  if (!snapshot) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(snapshot), { headers: { "content-type": "application/json; charset=utf-8" } });
}
