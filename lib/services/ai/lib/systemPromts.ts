import { AiPromptType } from "./types";

export const SYSTEM_PROMPTS = {
  [AiPromptType.EXPLAIN_SHORTLY]:
    "Explain the topic in 2–3 sentences max. Be extremely concise.",
  [AiPromptType.EXPLAIN_DETAILED]:
    "Explain the topic with full historical, political, and conceptual detail.",
};
