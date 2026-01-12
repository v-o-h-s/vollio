import {
  TokenCheckResult,
  TokenConsumeOptions,
  TokenLimits,
  TokenQuotaStatus,
  TokenUsageRecord,
} from "../../shared/types/tokenRateLimiting";

/**
 * Interface for Token Rate Limiting Service
 * Handles weighted token consumption for AI calls with daily/monthly limits
 */
export interface ITokenRateLimitingService {
  /**
   * Check if user can make an AI request (pre-request check)
   * Uses estimated tokens if provided, otherwise just checks current usage
   * @param userId - The user's ID
   * @param options - Optional parameters including estimated token count
   * @returns Whether the request is allowed and remaining quota
   */
  canConsume(
    userId: string,
    options?: TokenConsumeOptions
  ): Promise<TokenCheckResult>;

  /**
   * Record actual token usage after a successful AI request
   * Updates both Redis (real-time) and Supabase (persistent)
   * @param userId - The user's ID
   * @param usage - Token usage details from OpenRouter response
   */
  recordUsage(userId: string, usage: TokenUsageRecord): Promise<void>;

  /**
   * Get current quota status for a user
   * @param userId - The user's ID
   * @returns Full quota status including limits, usage, and reset times
   */
  getQuotaStatus(userId: string): Promise<TokenQuotaStatus>;

  /**
   * Initialize quota for a new user with default or custom limits
   * Called automatically when user makes first AI request
   * @param userId - The user's ID
   * @param limits - Optional custom limits (uses defaults if not provided)
   */
  initializeQuota(userId: string, limits?: Partial<TokenLimits>): Promise<void>;

  /**
   * Update limits for a user (admin operation)
   * @param userId - The user's ID
   * @param limits - New limits to set
   */
  updateLimits(userId: string, limits: Partial<TokenLimits>): Promise<void>;

  /**
   * Sync Redis state with Supabase (call periodically or on startup)
   * Ensures Redis reflects persistent state after restart
   * @param userId - The user's ID
   */
  syncFromDatabase(userId: string): Promise<void>;
}
