import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

type Provider = "openrouter" | "google";

const OPENROUTER_DEFAULT_MODEL = "google/gemini-2.5-flash-lite";
const GOOGLE_DEFAULT_MODEL = "gemini-2.5-flash-lite";

function getProvider(): Provider {
  const provider = process.env.AI_PROVIDER as Provider | undefined;
  if (provider === "google") return "google";
  return "openrouter";
}

export function getAIModel(modelId?: string): LanguageModel {
  const provider = getProvider();

  if (provider === "google") {
    const model = modelId ?? GOOGLE_DEFAULT_MODEL;
    return google(model);
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const model = modelId ?? OPENROUTER_DEFAULT_MODEL;
  return openrouter(model);
}

export function isAIConfigured(): boolean {
  const provider = getProvider();
  if (provider === "google") return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  return !!process.env.OPENROUTER_API_KEY;
}
