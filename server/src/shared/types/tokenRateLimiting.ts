/**
 * Token Rate Limiting Types
 * Defines types for the weighted token-based rate limiting system
 */

/**
 * Token weight multipliers for calculating weighted tokens
 * Completion tokens are weighted higher as they're more expensive
 */
export const TOKEN_WEIGHTS = {
  PROMPT: 1,
  COMPLETION: 4,
} as const;

/**
 * Default token limits for new users
 */
export const DEFAULT_TOKEN_LIMITS: TokenLimits = {
  monthlyLimit: 10_000_000, // 10M tokens/month
  dailyLimit: 500_000, // 500K tokens/day
  burstCapacity: 500_000, // 500K burst (handles large docs up to 25MB)
};

/**
 * Configurable token limits per user
 */
export interface TokenLimits {
  monthlyLimit: number;
  dailyLimit: number;
  burstCapacity: number;
}

/**
 * Token usage record from an AI request
 */
export interface TokenUsageRecord {
  promptTokens: number;
  completionTokens: number;
  model: string;
  endpoint: string;
}

/**
 * Result of pre-request token quota check
 */
export interface TokenCheckResult {
  allowed: boolean;
  remaining: {
    daily: number;
    monthly: number;
  };
  retryAfter?: number; // Seconds until next reset
  reason?: TokenLimitReason;
}

/**
 * Reason for token limit rejection
 */
export type TokenLimitReason = "daily_limit" | "monthly_limit" | "burst_limit";

/**
 * Full token quota status for a user
 */
export interface TokenQuotaStatus {
  userId: string;
  limits: TokenLimits;
  used: {
    daily: number;
    monthly: number;
  };
  remaining: {
    daily: number;
    monthly: number;
  };
  percentage: {
    daily: number;
    monthly: number;
  };
  resetTimes: {
    daily: Date;
    monthly: Date;
  };
}

/**
 * Options for token consumption check
 */
export interface TokenConsumeOptions {
  /** Estimated tokens for pre-check (optional) */
  estimatedTokens?: number;
  /** Skip burst check if true */
  skipBurstCheck?: boolean;
}

/**
 * Database row for user_token_quotas table
 */
export interface TokenQuotaRow {
  user_id: string;
  monthly_limit: number;
  daily_limit: number;
  burst_capacity: number;
  monthly_used: number;
  daily_used: number;
  last_daily_reset: string;
  last_monthly_reset: string;
  created_at: string;
  updated_at: string;
}

/**
 * Database row for token_usage_logs table
 */
export interface TokenUsageLogRow {
  id: string;
  user_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  weighted_tokens: number;
  model: string;
  endpoint: string;
  created_at: string;
}

/**
 * Calculate weighted tokens from raw token counts
 */
export function calculateWeightedTokens(
  promptTokens: number,
  completionTokens: number
): number {
  return (
    promptTokens * TOKEN_WEIGHTS.PROMPT +
    completionTokens * TOKEN_WEIGHTS.COMPLETION
  );
}

/**
 * Redis key generators for token quota data
 */
export const TOKEN_QUOTA_KEYS = {
  daily: (userId: string) => `token:quota:${userId}:daily`,
  monthly: (userId: string) => `token:quota:${userId}:monthly`,
  limits: (userId: string) => `token:quota:${userId}:limits`,
  lastSync: (userId: string) => `token:quota:${userId}:last_sync`,
} as const;
