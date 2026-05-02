import OpenAI from "openai";
import { z } from "zod";
import { env } from "../env.js";

let _client: OpenAI | null = null;

function client(): OpenAI {
  if (_client) return _client;
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env before calling openai.service.");
  }
  _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return _client;
}

export interface CompleteOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
}

export interface CompleteResult {
  text: string;
  model: string;
}

export async function complete(opts: CompleteOptions): Promise<CompleteResult> {
  const c = client();
  const resp = await c.chat.completions.create({
    model: opts.model ?? env.OPENAI_MODEL,
    temperature: opts.temperature ?? 0.2,
    response_format: opts.jsonMode ? { type: "json_object" } : { type: "text" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user",   content: opts.user },
    ],
  });
  const text = resp.choices[0]?.message?.content ?? "";
  return { text, model: resp.model };
}

export async function completeJson<T>(
  opts: Omit<CompleteOptions, "jsonMode">,
  schema: z.ZodSchema<T>,
): Promise<{ data: T; model: string; rawText: string }> {
  const result = await complete({ ...opts, jsonMode: true });

  // Strip markdown fences in case the model wraps its output
  const clean = result.text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(
      `OpenAI returned non-JSON output. First 300 chars: ${result.text.slice(0, 300)}`,
    );
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `OpenAI response failed schema validation:\n${validated.error.message}`,
    );
  }

  return { data: validated.data, model: result.model, rawText: result.text };
}
