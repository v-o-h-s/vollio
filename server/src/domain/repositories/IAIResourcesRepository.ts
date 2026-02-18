import { IResourcesRepository } from "./IResourcesRepository";
import { TokenUsage } from "../../shared/types/generativeAi";

export interface AIResourceLogEntry {
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

export interface IAIResourcesRepository extends IResourcesRepository {
  logUsage(entry: AIResourceLogEntry): Promise<void>;
}
