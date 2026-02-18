import { TokenUsage } from "../../../shared/types/generativeAi";

export interface AiQuotaRemaining {
  minute: number;
  day: number;
  month: number;
}

export interface IAiQuotaService {
  /**
   * Consume tokens after an AI request
   * @param userId - ID of the user
   * @param usage - token usage from the AI response
   *
   * @returns {Promise<void>}
   */
  consumeTokens(
    userId: string,
    usage: TokenUsage,
    details?: {
      actionType: "chat" | "summary" | "flashcards" | "quiz" | "other";
      model: string;
      resourceId?: string;
      metadata?: any;
    },
  ): Promise<void>;

  /**
   * Get remaining quota for a user (across all buckets)
   * @param userId - ID of the user
   * @returns {Promise<AiQuotaRemaining>}
   */
  getRemainingQuota(userId: string): Promise<AiQuotaRemaining>;

  /**
   * Reset quota for a user
   * @param userId - ID of the user
   * @returns {Promise<void>}
   */
  resetQuota(userId: string): Promise<void>;
}
