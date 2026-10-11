import { blendedPrice } from "./normalize.ts";
import type { Model } from "./types.ts";

export function makeModel(over: Partial<Model> & { id: string }): Model {
  const [lab, ...rest] = over.id.split("/");
  const price = over.price ?? { input: 1, output: 2 };
  return {
    slug: rest.join("-"),
    lab,
    name: rest.join("-"),
    family: null,
    releaseDate: "2026-09-01",
    knowledgeCutoff: null,
    status: "active",
    openWeights: false,
    priceSource: lab,
    context: 128_000,
    maxOutput: 8_192,
    modalitiesIn: ["text"],
    capabilities: { reasoning: false, toolCall: true, structuredOutput: false },
    hosts: [],
    aliases: [],
    ...over,
    price,
    blended: over.blended ?? blendedPrice(price.input, price.output),
  };
}
