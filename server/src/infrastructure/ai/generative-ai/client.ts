import { OpenRouter } from "@openrouter/sdk";
export const GENRATIVE_AI_CONFIG = {
  MODEL: "minimax/minimax-m2.5",
  BATCH_SIZE: 67,
}   
export const openRouter = new OpenRouter({
  apiKey: process.env.GENERATIVE_AI_API_KEY!,
});
