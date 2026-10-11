export const LAB_IDS = [
  "openai", "anthropic", "google", "xai", "mistral", "deepseek",
  "alibaba", "zhipuai", "moonshotai", "minimax", "cohere", "meta",
] as const;
export type LabId = (typeof LAB_IDS)[number];

export function isLabId(value: string): value is LabId {
  return (LAB_IDS as readonly string[]).includes(value);
}

/** models.dev provider id that sells the lab's own API. */
export const LAB_PROVIDER: Record<LabId, string> = {
  openai: "openai", anthropic: "anthropic", google: "google", xai: "xai", mistral: "mistral",
  deepseek: "deepseek", alibaba: "alibaba", zhipuai: "zai", moonshotai: "moonshotai",
  minimax: "minimax", cohere: "cohere", meta: "meta",
};

export const LAB_NAMES: Record<LabId, string> = {
  openai: "OpenAI", anthropic: "Anthropic", google: "Google", xai: "xAI", mistral: "Mistral",
  deepseek: "DeepSeek", alibaba: "Alibaba (Qwen)", zhipuai: "Z.AI (Zhipu)", moonshotai: "Moonshot AI",
  minimax: "MiniMax", cohere: "Cohere", meta: "Meta",
};

export const TIER1_LABS: ReadonlySet<string> = new Set([
  "openai", "anthropic", "google", "xai", "deepseek", "meta", "mistral", "alibaba",
]);

export const HOST_IDS = [
  "amazon-bedrock", "azure", "google-vertex", "togetherai", "fireworks-ai", "deepinfra", "groq",
  "cerebras", "nebius", "baseten", "novita-ai", "cloudflare-workers-ai", "nvidia", "scaleway",
] as const;

export const HOST_NAMES: Record<string, string> = {
  "amazon-bedrock": "Amazon Bedrock", azure: "Azure", "google-vertex": "Google Vertex AI",
  togetherai: "Together AI", "fireworks-ai": "Fireworks AI", deepinfra: "DeepInfra", groq: "Groq",
  cerebras: "Cerebras", nebius: "Nebius", baseten: "Baseten", "novita-ai": "Novita AI",
  "cloudflare-workers-ai": "Cloudflare Workers AI", nvidia: "NVIDIA", scaleway: "Scaleway",
};

export const MODELS_DEV_URL = "https://models.dev/api.json";
export const GENAI_PRICES_URL = "https://raw.githubusercontent.com/pydantic/genai-prices/main/prices/data_slim.json";

export const GUARDS = { maxCountDropPct: 20, maxPricePerM: 1000, maxChangedPct: 30, minCommonForChangeCheck: 10 } as const;
