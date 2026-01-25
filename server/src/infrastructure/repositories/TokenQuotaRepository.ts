import { SupabaseClient } from "@supabase/supabase-js";
import { TokenQuota } from "../../domain/entities/TokenQuota";
import {
  DEFAULT_TOKEN_LIMITS,
  TokenLimits,
  TokenQuotaRow,
  TokenUsageLogRow,
  TokenUsageRecord,
  calculateWeightedTokens,
} from "../../shared/types/tokenRateLimiting";
import { FastifyBaseLogger } from "fastify";

/**
 * Repository Interface for Token Quota persistence
 */
export interface ITokenQuotaRepository {
  getQuota(userId: string): Promise<TokenQuota | null>;
  createQuota(
    userId: string,
    limits?: Partial<TokenLimits>
  ): Promise<TokenQuota>;
  updateUsage(
    userId: string,
    dailyUsed: number,
    monthlyUsed: number
  ): Promise<void>;
  updateLimits(userId: string, limits: Partial<TokenLimits>): Promise<void>;
  resetDaily(userId: string): Promise<void>;
  resetMonthly(userId: string): Promise<void>;
  logUsage(userId: string, usage: TokenUsageRecord): Promise<void>;
  getUsageLogs(userId: string, limit?: number): Promise<TokenUsageLogRow[]>;
}

/**
 * TokenQuotaRepository - Supabase implementation
 * Handles persistent storage of token quotas and usage logs
 */
export class TokenQuotaRepository implements ITokenQuotaRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  /**
   * Get quota for a user
   */
  async getQuota(userId: string): Promise<TokenQuota | null> {
    const { data, error } = await this.supabaseClient
      .from("user_token_quotas")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      this.logger.error({ error, userId }, "Failed to get token quota");
      throw error;
    }

    return this.mapRowToEntity(data as TokenQuotaRow);
  }

  /**
   * Create quota for a new user
   */
  async createQuota(
    userId: string,
    limits?: Partial<TokenLimits>
  ): Promise<TokenQuota> {
    const quotaData = {
      user_id: userId,
      monthly_limit: limits?.monthlyLimit ?? DEFAULT_TOKEN_LIMITS.monthlyLimit,
      daily_limit: limits?.dailyLimit ?? DEFAULT_TOKEN_LIMITS.dailyLimit,
      burst_capacity:
        limits?.burstCapacity ?? DEFAULT_TOKEN_LIMITS.burstCapacity,
      monthly_used: 0,
      daily_used: 0,
      last_daily_reset: new Date().toISOString(),
      last_monthly_reset: new Date().toISOString(),
    };

    const { data, error } = await this.supabaseClient
      .from("user_token_quotas")
      .insert(quotaData)
      .select()
      .single();

    if (error) {
      // Handle race condition - quota might have been created by trigger
      if (error.code === "23505") {
        const existing = await this.getQuota(userId);
        if (existing) return existing;
      }
      this.logger.error({ error, userId }, "Failed to create token quota");
      throw error;
    }

    return this.mapRowToEntity(data as TokenQuotaRow);
  }

  /**
   * Update usage counters
   */
  async updateUsage(
    userId: string,
    dailyUsed: number,
    monthlyUsed: number
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from("user_token_quotas")
      .update({
        daily_used: dailyUsed,
        monthly_used: monthlyUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      this.logger.error({ error, userId }, "Failed to update token usage");
      throw error;
    }
  }

  /**
   * Update quota limits
   */
  async updateLimits(
    userId: string,
    limits: Partial<TokenLimits>
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (limits.monthlyLimit !== undefined) {
      updateData.monthly_limit = limits.monthlyLimit;
    }
    if (limits.dailyLimit !== undefined) {
      updateData.daily_limit = limits.dailyLimit;
    }
    if (limits.burstCapacity !== undefined) {
      updateData.burst_capacity = limits.burstCapacity;
    }

    const { error } = await this.supabaseClient
      .from("user_token_quotas")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      this.logger.error({ error, userId }, "Failed to update token limits");
      throw error;
    }
  }

  /**
   * Reset daily usage
   */
  async resetDaily(userId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("user_token_quotas")
      .update({
        daily_used: 0,
        last_daily_reset: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      this.logger.error({ error, userId }, "Failed to reset daily quota");
      throw error;
    }
  }

  /**
   * Reset monthly usage
   */
  async resetMonthly(userId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("user_token_quotas")
      .update({
        monthly_used: 0,
        last_monthly_reset: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      this.logger.error({ error, userId }, "Failed to reset monthly quota");
      throw error;
    }
  }

  /**
   * Log token usage for audit/analytics
   */
  async logUsage(userId: string, usage: TokenUsageRecord): Promise<void> {
    const weightedTokens = calculateWeightedTokens(
      usage.promptTokens,
      usage.completionTokens
    );

    const { error } = await this.supabaseClient
      .from("token_usage_logs")
      .insert({
        user_id: userId,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        weighted_tokens: weightedTokens,
        model: usage.model,
        endpoint: usage.endpoint,
      });

    if (error) {
      // Log error but don't throw - usage logging shouldn't break requests
      this.logger.error({ error, userId }, "Failed to log token usage");
    }
  }

  /**
   * Get usage logs for a user
   */
  async getUsageLogs(
    userId: string,
    limit: number = 100
  ): Promise<TokenUsageLogRow[]> {
    const { data, error } = await this.supabaseClient
      .from("token_usage_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error({ error, userId }, "Failed to get usage logs");
      throw error;
    }

    return (data as TokenUsageLogRow[]) ?? [];
  }

  /**
   * Map database row to domain entity
   */
  private mapRowToEntity(row: TokenQuotaRow): TokenQuota {
    return new TokenQuota(
      row.user_id,
      {
        monthlyLimit: row.monthly_limit,
        dailyLimit: row.daily_limit,
        burstCapacity: row.burst_capacity,
      },
      {
        monthlyUsed: row.monthly_used,
        dailyUsed: row.daily_used,
      },
      {
        lastDailyReset: new Date(row.last_daily_reset),
        lastMonthlyReset: new Date(row.last_monthly_reset),
      },
      {
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    );
  }
}
