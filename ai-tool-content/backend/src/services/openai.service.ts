import OpenAI from "openai";
import { env } from "../env.js";

/**
 * OpenAI service — the only place the OpenAI SDK is instantiated.
 * Treated as a core service (not a util) because every generation path goes through it.
 */

let _client: OpenAI | null = null;

function client(): OpenAI {
  if (_client) return _client;
  if (!env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env before calling openai.service."
    );
  }
  _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return _client;
}

export interface CompleteOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}

export interface CompleteResult {
  text: string;
  model: string;
}

export async function complete(_opts: CompleteOptions): Promise<CompleteResult> {
  // TODO: wire up an actual chat.completions call, with retries + token accounting.
  // Kept as a stub to keep the scaffold runnable without an API key.
  void client;
  throw new Error("openai.complete not implemented");
}
