import { SYSTEM_PROMPTS } from "./systemPromts";
import { AiPromptType, PromptTemplate } from "./types";

export const PromptTemplates: Record<AiPromptType, PromptTemplate> = {
  [AiPromptType.EXPLAIN_SHORTLY]: {
    system: SYSTEM_PROMPTS[AiPromptType.EXPLAIN_SHORTLY],
    messagePrefix: "Explain this text:",
  },

  [AiPromptType.EXPLAIN_DETAILED]: {
    system: SYSTEM_PROMPTS[AiPromptType.EXPLAIN_DETAILED],
    messagePrefix: "Explain this text:",
  },
};
