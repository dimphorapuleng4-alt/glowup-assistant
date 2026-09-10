import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const MODEL = "openai/gpt-6-astra";

function getProvider() {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet. Missing LOVABLE_API_KEY.");

  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

const providerOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
};

/** Shared responsible-AI framing appended to every system prompt. */
export const RESPONSIBLE_AI_RULES = `
Responsible AI rules you must always follow:
- You only know what the salon owner has typed into this app. Never invent customer names, prices, appointment times, promises, guarantees or results.
- If required information is missing, say what is missing or leave a clearly marked placeholder such as [add date].
- Present business advice as suggestions to review, never as guaranteed outcomes.
- Never claim to have looked anything up, checked a calendar, or contacted anyone.
- Keep the language warm, clear and professional for a small beauty salon.`;

export async function runAI(system: string, prompt: string): Promise<string> {
  const provider = getProvider();
  const result = streamText({
    model: provider.responses(MODEL),
    system: `${system}\n${RESPONSIBLE_AI_RULES}`,
    prompt,
    providerOptions,
  });
  const text = await result.text;
  return text.trim();
}

export async function runAIChat(system: string, messages: ModelMessage[]): Promise<string> {
  const provider = getProvider();
  const result = streamText({
    model: provider.responses(MODEL),
    system: `${system}\n${RESPONSIBLE_AI_RULES}`,
    messages,
    providerOptions,
  });
  const text = await result.text;
  return text.trim();
}

/** Pull a JSON object out of a model reply, tolerating code fences or stray prose. */
export function parseJson<T>(raw: string, fallback: T): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return fallback;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}
