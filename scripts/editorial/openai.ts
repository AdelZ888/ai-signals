import OpenAI from "openai";

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6.1-sol";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  client ??= new OpenAI({ apiKey, timeout: 120_000, maxRetries: 3 });
  return client;
}

export async function complete(system: string, user: string, opts: { json?: boolean; maxTokens?: number } = {}): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: OPENAI_MODEL,
    reasoning_effort: "medium",
    max_completion_tokens: opts.maxTokens ?? 8000,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  const choice = res.choices[0];
  const content = choice?.message?.content?.trim() ?? "";
  if (!content) throw new Error(`empty completion from ${OPENAI_MODEL} (finish_reason=${choice?.finish_reason ?? "none"})`);
  return content;
}
