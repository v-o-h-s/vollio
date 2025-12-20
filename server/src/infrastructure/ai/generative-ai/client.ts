import { OpenRouter } from "@openrouter/sdk";
export const GENRATIVE_AI_CONFIG = {
  MODEL: "google/gemini-2.0-flash-001",
  BATCH_SIZE: 67,
}   
export const openRouter = new OpenRouter({
  apiKey: process.env.GENERATIVE_AI_API_KEY!,
});
