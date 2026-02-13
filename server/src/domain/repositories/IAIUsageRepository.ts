import { TokenUsage } from "../../shared/types/generativeAi";

export interface AIUsageLogEntry {
  userId: string;
  actionType: "chat" | "summary" | "flashcards" | "quiz" | "other";
  model: string;
  resourceId?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMultiplier: number;
  metadata?: any;
}

export interface IAIUsageRepository {
  logUsage(entry: AIUsageLogEntry): Promise<void>;
}
