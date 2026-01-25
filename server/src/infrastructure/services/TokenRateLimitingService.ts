import Redis from "ioredis";
import fs from "fs";
import path from "path";
import { FastifyBaseLogger } from "fastify";
import { ITokenRateLimitingService } from "../../domain/services/ITokenRateLimitingService";
import {
  ITokenQuotaRepository,
  TokenQuotaRepository,
} from "../repositories/TokenQuotaRepository";
import {
  TokenCheckResult,
  TokenConsumeOptions,
  TokenLimits,
  TokenQuotaStatus,
  TokenUsageRecord,
  DEFAULT_TOKEN_LIMITS,
  TOKEN_QUOTA_KEYS,
  calculateWeightedTokens,
} from "../../shared/types/tokenRateLimiting";

/**
 * TokenRateLimitingService
 *
 * Production-ready token rate limiting service for AI calls.
 * Uses Redis for real-time quota checks and Supabase for persistence.
 *
 * Features:
 * - Weighted tokens (prompt*1, completion*4)
 * - Daily and monthly limits
 * - Burst capacity for large document operations
 * - Atomic operations via Lua scripts
 * - Auto-sync between Redis and Supabase
 */
export class TokenRateLimitingService implements ITokenRateLimitingService {
  private redis: Redis;
  private logger: FastifyBaseLogger;
  private tokenQuotaRepository: ITokenQuotaRepository;
  private luaScript: string;

  constructor(
    redis: Redis,
    logger: FastifyBaseLogger,
    tokenQuotaRepository: TokenQuotaRepository
  ) {
    this.redis = redis;
    this.logger = logger;
    this.tokenQuotaRepository = tokenQuotaRepository;

    // Load Lua script for atomic operations
    this.luaScript = fs.readFileSync(
      path.join(__dirname, "../../shared/utils/token_quota.lua"),
      "utf8"
    );
  }

  /**
   * Check if user can make an AI request
   */
  async canConsume(
    userId: string,
    options: TokenConsumeOptions = {}
  ): Promise<TokenCheckResult> {
    try {
      // Ensure user has quota initialized
      await this.ensureQuotaExists(userId);

      // Get limits from cache or database
      const limits = await this.getLimits(userId);

      // If no estimated tokens, just check current usage
      const estimatedTokens = options.estimatedTokens ?? 0;

      // Check burst limit first (for large document operations)
      if (!options.skipBurstCheck && estimatedTokens > limits.burstCapacity) {
        return {
          allowed: false,
          remaining: await this.getRemainingQuota(userId),
          reason: "burst_limit",
        };
      }

      // Get current usage from Redis
      const [dailyUsed, monthlyUsed] = await this.getCurrentUsage(userId);

      // Check daily limit
      if (dailyUsed + estimatedTokens > limits.dailyLimit) {
        const retryAfter = this.getSecondsUntilMidnightUTC();
        return {
          allowed: false,
          remaining: {
            daily: Math.max(0, limits.dailyLimit - dailyUsed),
            monthly: Math.max(0, limits.monthlyLimit - monthlyUsed),
          },
          retryAfter,
          reason: "daily_limit",
        };
      }

      // Check monthly limit
      if (monthlyUsed + estimatedTokens > limits.monthlyLimit) {
        const retryAfter = this.getSecondsUntilFirstOfMonth();
        return {
          allowed: false,
          remaining: {
            daily: Math.max(0, limits.dailyLimit - dailyUsed),
            monthly: Math.max(0, limits.monthlyLimit - monthlyUsed),
          },
          retryAfter,
          reason: "monthly_limit",
        };
      }

      return {
        allowed: true,
        remaining: {
          daily: Math.max(0, limits.dailyLimit - dailyUsed),
          monthly: Math.max(0, limits.monthlyLimit - monthlyUsed),
        },
      };
    } catch (error) {
      this.logger.error({ error, userId }, "Token rate limit check failed");
      // Fail open - allow request but log error
      return {
        allowed: true,
        remaining: { daily: -1, monthly: -1 },
      };
    }
  }

  /**
   * Record actual token usage after AI request completes
   */
  async recordUsage(userId: string, usage: TokenUsageRecord): Promise<void> {
    const weightedTokens = calculateWeightedTokens(
      usage.promptTokens,
      usage.completionTokens
    );

    this.logger.info(
      {
        userId,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        weightedTokens,
        model: usage.model,
        endpoint: usage.endpoint,
      },
      "Recording token usage"
    );

    try {
      // Get limits for Lua script
      const limits = await this.getLimits(userId);

      // Calculate reset timestamps
      const now = Math.floor(Date.now() / 1000);
      const dailyResetTs = this.getStartOfDayUTC();
      const monthlyResetTs = this.getStartOfMonthUTC();

      // Execute atomic Lua script
      const result = (await this.redis.eval(
        this.luaScript,
        2,
        TOKEN_QUOTA_KEYS.daily(userId),
        TOKEN_QUOTA_KEYS.monthly(userId),
        weightedTokens,
        limits.dailyLimit,
        limits.monthlyLimit,
        now,
        dailyResetTs,
        monthlyResetTs
      )) as [number, number, number, number];

      const [allowed, dailyUsed, monthlyUsed] = result;

      // Sync to database (async, don't wait)
      this.syncToDatabase(userId, dailyUsed, monthlyUsed).catch((err) => {
        this.logger.error(
          { error: err, userId },
          "Failed to sync usage to database"
        );
      });

      // Log usage for audit (async, don't wait)
      this.tokenQuotaRepository.logUsage(userId, usage).catch((err) => {
        this.logger.error({ error: err, userId }, "Failed to log usage");
      });

      if (allowed === 0) {
        this.logger.warn(
          { userId, dailyUsed, monthlyUsed },
          "User exceeded token quota during consumption"
        );
      }
    } catch (error) {
      this.logger.error({ error, userId }, "Failed to record token usage");
      // Don't throw - usage recording shouldn't break the request
    }
  }

  /**
   * Get full quota status for a user
   */
  async getQuotaStatus(userId: string): Promise<TokenQuotaStatus> {
    await this.ensureQuotaExists(userId);

    const limits = await this.getLimits(userId);
    const [dailyUsed, monthlyUsed] = await this.getCurrentUsage(userId);

    const dailyRemaining = Math.max(0, limits.dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, limits.monthlyLimit - monthlyUsed);

    return {
      userId,
      limits,
      used: {
        daily: dailyUsed,
        monthly: monthlyUsed,
      },
      remaining: {
        daily: dailyRemaining,
        monthly: monthlyRemaining,
      },
      percentage: {
        daily:
          limits.dailyLimit > 0
            ? Math.round((dailyUsed / limits.dailyLimit) * 100)
            : 0,
        monthly:
          limits.monthlyLimit > 0
            ? Math.round((monthlyUsed / limits.monthlyLimit) * 100)
            : 0,
      },
      resetTimes: {
        daily: this.getNextMidnightUTC(),
        monthly: this.getNextFirstOfMonth(),
      },
    };
  }

  /**
   * Initialize quota for a new user
   */
  async initializeQuota(
    userId: string,
    limits?: Partial<TokenLimits>
  ): Promise<void> {
    // Create in database
    await this.tokenQuotaRepository.createQuota(userId, limits);

    // Initialize Redis
    const finalLimits = {
      ...DEFAULT_TOKEN_LIMITS,
      ...limits,
    };

    await this.cacheLimits(userId, finalLimits);

    this.logger.info(
      { userId, limits: finalLimits },
      "Initialized token quota"
    );
  }

  /**
   * Update limits for a user
   */
  async updateLimits(
    userId: string,
    limits: Partial<TokenLimits>
  ): Promise<void> {
    // Update in database
    await this.tokenQuotaRepository.updateLimits(userId, limits);

    // Update Redis cache
    const currentLimits = await this.getLimits(userId);
    const newLimits = { ...currentLimits, ...limits };
    await this.cacheLimits(userId, newLimits);

    this.logger.info({ userId, limits: newLimits }, "Updated token limits");
  }

  /**
   * Sync Redis state from database
   */
  async syncFromDatabase(userId: string): Promise<void> {
    const quota = await this.tokenQuotaRepository.getQuota(userId);
    if (!quota) {
      await this.initializeQuota(userId);
      return;
    }

    // Check for needed resets
    if (quota.needsDailyReset()) {
      await this.tokenQuotaRepository.resetDaily(userId);
      quota.resetDaily();
    }
    if (quota.needsMonthlyReset()) {
      await this.tokenQuotaRepository.resetMonthly(userId);
      quota.resetMonthly();
    }

    // Sync to Redis
    await this.cacheLimits(userId, quota.getLimits());

    const now = Math.floor(Date.now() / 1000);
    await this.redis.hmset(
      TOKEN_QUOTA_KEYS.daily(userId),
      "used",
      quota.getDailyUsed(),
      "reset_ts",
      now
    );
    await this.redis.hmset(
      TOKEN_QUOTA_KEYS.monthly(userId),
      "used",
      quota.getMonthlyUsed(),
      "reset_ts",
      now
    );

    this.logger.debug({ userId }, "Synced quota from database");
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Ensure user has quota record (initialize if not exists)
   */
  private async ensureQuotaExists(userId: string): Promise<void> {
    const limitsKey = TOKEN_QUOTA_KEYS.limits(userId);
    const exists = await this.redis.exists(limitsKey);

    if (!exists) {
      await this.syncFromDatabase(userId);
    }
  }

  /**
   * Get limits from Redis cache
   */
  private async getLimits(userId: string): Promise<TokenLimits> {
    const limitsKey = TOKEN_QUOTA_KEYS.limits(userId);
    const data = await this.redis.hmget(
      limitsKey,
      "monthly_limit",
      "daily_limit",
      "burst_capacity"
    );

    if (data[0] === null) {
      // Not in cache, sync from database
      await this.syncFromDatabase(userId);
      return this.getLimits(userId);
    }

    return {
      monthlyLimit: parseInt(
        data[0] ?? String(DEFAULT_TOKEN_LIMITS.monthlyLimit)
      ),
      dailyLimit: parseInt(data[1] ?? String(DEFAULT_TOKEN_LIMITS.dailyLimit)),
      burstCapacity: parseInt(
        data[2] ?? String(DEFAULT_TOKEN_LIMITS.burstCapacity)
      ),
    };
  }

  /**
   * Cache limits in Redis
   */
  private async cacheLimits(
    userId: string,
    limits: TokenLimits
  ): Promise<void> {
    const limitsKey = TOKEN_QUOTA_KEYS.limits(userId);
    await this.redis.hmset(
      limitsKey,
      "monthly_limit",
      limits.monthlyLimit,
      "daily_limit",
      limits.dailyLimit,
      "burst_capacity",
      limits.burstCapacity
    );
    // Set 7 day expiry on limits cache
    await this.redis.expire(limitsKey, 604800);
  }

  /**
   * Get current usage from Redis
   */
  private async getCurrentUsage(userId: string): Promise<[number, number]> {
    const dailyKey = TOKEN_QUOTA_KEYS.daily(userId);
    const monthlyKey = TOKEN_QUOTA_KEYS.monthly(userId);

    const [dailyData, monthlyData] = await Promise.all([
      this.redis.hmget(dailyKey, "used", "reset_ts"),
      this.redis.hmget(monthlyKey, "used", "reset_ts"),
    ]);

    let dailyUsed = parseInt(dailyData[0] ?? "0");
    let monthlyUsed = parseInt(monthlyData[0] ?? "0");

    const dailyResetTs = parseInt(dailyData[1] ?? "0");
    const monthlyResetTs = parseInt(monthlyData[1] ?? "0");

    // Check for needed resets
    const startOfDay = this.getStartOfDayUTC();
    const startOfMonth = this.getStartOfMonthUTC();

    if (dailyResetTs < startOfDay) {
      dailyUsed = 0;
    }
    if (monthlyResetTs < startOfMonth) {
      monthlyUsed = 0;
    }

    return [dailyUsed, monthlyUsed];
  }

  /**
   * Get remaining quota
   */
  private async getRemainingQuota(
    userId: string
  ): Promise<{ daily: number; monthly: number }> {
    const limits = await this.getLimits(userId);
    const [dailyUsed, monthlyUsed] = await this.getCurrentUsage(userId);

    return {
      daily: Math.max(0, limits.dailyLimit - dailyUsed),
      monthly: Math.max(0, limits.monthlyLimit - monthlyUsed),
    };
  }

  /**
   * Sync usage to database (called after Redis update)
   */
  private async syncToDatabase(
    userId: string,
    dailyUsed: number,
    monthlyUsed: number
  ): Promise<void> {
    await this.tokenQuotaRepository.updateUsage(userId, dailyUsed, monthlyUsed);
  }

  // ============================================================================
  // Time Utilities
  // ============================================================================

  private getStartOfDayUTC(): number {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / 1000);
  }

  private getStartOfMonthUTC(): number {
    const now = new Date();
    now.setUTCDate(1);
    now.setUTCHours(0, 0, 0, 0);
    return Math.floor(now.getTime() / 1000);
  }

  private getSecondsUntilMidnightUTC(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    midnight.setUTCHours(0, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  }

  private getSecondsUntilFirstOfMonth(): number {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    nextMonth.setUTCHours(0, 0, 0, 0);
    return Math.ceil((nextMonth.getTime() - now.getTime()) / 1000);
  }

  private getNextMidnightUTC(): Date {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() + 1);
    now.setUTCHours(0, 0, 0, 0);
    return now;
  }

  private getNextFirstOfMonth(): Date {
    const now = new Date();
    now.setUTCMonth(now.getUTCMonth() + 1);
    now.setUTCDate(1);
    now.setUTCHours(0, 0, 0, 0);
    return now;
  }
}
