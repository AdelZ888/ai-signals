import type { Model } from "../data/types.ts";
import { getCatalog, labName } from "./catalog.ts";
import { change30d } from "./history.ts";
import { modelUrl } from "./urls.ts";

export type ModelRow = {
  id: string; href: string; name: string; labName: string;
  input: number; output: number; context: number; change30d: number | null; status: string;
};

export function modelRows(models: Model[]): ModelRow[] {
  const { events, today } = getCatalog();
  return models.map((m) => ({
    id: m.id, href: modelUrl(m), name: m.name, labName: labName(m.lab),
    input: m.price.input, output: m.price.output, context: m.context,
    change30d: change30d(m, events, today), status: m.status,
  }));
}
