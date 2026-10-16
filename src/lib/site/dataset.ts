import type { Model } from "../data/types.ts";
import { isIndexable } from "./selection.ts";
import { modelUrl } from "./urls.ts";

/** models.dev is MIT-licensed: redistributing derived data must carry its notice. */
export const DATA_LICENSE =
  "Derived from models.dev (https://models.dev), MIT License, Copyright (c) models.dev contributors. Compiled daily by AI Signals (https://aisignals.dev). Free to reuse with attribution.";

export type DatasetRow = {
  id: string; name: string; lab: string; status: string;
  input_usd_per_1m: number; output_usd_per_1m: number; blended_usd_per_1m: number;
  context_tokens: number; max_output_tokens: number | null; release_date: string | null;
  input_modalities: string; reasoning: boolean; tool_calling: boolean; structured_output: boolean;
  open_weights: boolean; url: string;
};

export function datasetRows(models: Model[], baseUrl: string): DatasetRow[] {
  return models.filter(isIndexable).map((m) => ({
    id: m.id, name: m.name, lab: m.lab, status: m.status,
    input_usd_per_1m: m.price.input, output_usd_per_1m: m.price.output, blended_usd_per_1m: m.blended,
    context_tokens: m.context, max_output_tokens: m.maxOutput, release_date: m.releaseDate,
    input_modalities: m.modalitiesIn.join("|"), reasoning: m.capabilities.reasoning, tool_calling: m.capabilities.toolCall,
    structured_output: m.capabilities.structuredOutput, open_weights: m.openWeights, url: `${baseUrl}${modelUrl(m)}`,
  }));
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/u.test(s) ? `"${s.replace(/"/gu, '""')}"` : s;
};

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  return `${[cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n")}\n`;
}
