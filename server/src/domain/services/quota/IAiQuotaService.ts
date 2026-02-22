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

  /**
   * Release a consumed quiz slot (e.g. on deletion)
   * @param userId - ID of the user
   * @returns {Promise<void>}
   */
  releaseQuiz(userId: string): Promise<void>;

  /**
   * Release a consumed flashcard set slot (e.g. on deletion)
   * @param userId - ID of the user
   * @returns {Promise<void>}
   */
  releaseFlashcards(userId: string): Promise<void>;

  /**
   * Check if a user can create a new quiz based on their resources
   * @param userId - ID of the user
   * @returns {Promise<boolean>}
   */
  canCreateQuiz(userId: string): Promise<boolean>;

  /**
   * Check if a user can create a new flashcards set based on their resources
   * @param userId - ID of the user
   * @returns {Promise<boolean>}
   */
  canCreateFlashcards(userId: string): Promise<boolean>;
}
