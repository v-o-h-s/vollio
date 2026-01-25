import { TokenLimits } from "../../shared/types/tokenRateLimiting";

/**
 * TokenQuota Domain Entity
 * Represents a user's token quota state and limits
 */
export class TokenQuota {
  private userId: string;
  private monthlyLimit: number;
  private dailyLimit: number;
  private burstCapacity: number;
  private monthlyUsed: number;
  private dailyUsed: number;
  private lastDailyReset: Date;
  private lastMonthlyReset: Date;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    userId: string,
    limits: TokenLimits,
    usage: { monthlyUsed: number; dailyUsed: number },
    resetTimes: { lastDailyReset: Date; lastMonthlyReset: Date },
    timestamps?: { createdAt?: Date; updatedAt?: Date }
  ) {
    this.userId = userId;
    this.monthlyLimit = limits.monthlyLimit;
    this.dailyLimit = limits.dailyLimit;
    this.burstCapacity = limits.burstCapacity;
    this.monthlyUsed = usage.monthlyUsed;
    this.dailyUsed = usage.dailyUsed;
    this.lastDailyReset = resetTimes.lastDailyReset;
    this.lastMonthlyReset = resetTimes.lastMonthlyReset;
    this.createdAt = timestamps?.createdAt ?? new Date();
    this.updatedAt = timestamps?.updatedAt ?? new Date();
  }

  // Getters
  getUserId(): string {
    return this.userId;
  }

  getLimits(): TokenLimits {
    return {
      monthlyLimit: this.monthlyLimit,
      dailyLimit: this.dailyLimit,
      burstCapacity: this.burstCapacity,
    };
  }

  getMonthlyUsed(): number {
    return this.monthlyUsed;
  }

  getDailyUsed(): number {
    return this.dailyUsed;
  }

  getMonthlyRemaining(): number {
    return Math.max(0, this.monthlyLimit - this.monthlyUsed);
  }

  getDailyRemaining(): number {
    return Math.max(0, this.dailyLimit - this.dailyUsed);
  }

  getBurstCapacity(): number {
    return this.burstCapacity;
  }

  getLastDailyReset(): Date {
    return this.lastDailyReset;
  }

  getLastMonthlyReset(): Date {
    return this.lastMonthlyReset;
  }

  // Business logic

  /**
   * Check if the user can consume a given number of tokens
   */
  canConsume(weightedTokens: number): { allowed: boolean; reason?: string } {
    // Check burst limit
    if (weightedTokens > this.burstCapacity) {
      return {
        allowed: false,
        reason: `Request exceeds burst capacity (${weightedTokens} > ${this.burstCapacity})`,
      };
    }

    // Check daily limit
    if (this.dailyUsed + weightedTokens > this.dailyLimit) {
      return {
        allowed: false,
        reason: "daily_limit",
      };
    }

    // Check monthly limit
    if (this.monthlyUsed + weightedTokens > this.monthlyLimit) {
      return {
        allowed: false,
        reason: "monthly_limit",
      };
    }

    return { allowed: true };
  }

  /**
   * Consume tokens (mutates state)
   */
  consume(weightedTokens: number): void {
    this.dailyUsed += weightedTokens;
    this.monthlyUsed += weightedTokens;
    this.updatedAt = new Date();
  }

  /**
   * Check if daily quota needs reset
   */
  needsDailyReset(): boolean {
    const now = new Date();
    const resetDate = new Date(this.lastDailyReset);
    resetDate.setUTCHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    return resetDate < today;
  }

  /**
   * Check if monthly quota needs reset
   */
  needsMonthlyReset(): boolean {
    const now = new Date();
    return (
      this.lastMonthlyReset.getUTCMonth() !== now.getUTCMonth() ||
      this.lastMonthlyReset.getUTCFullYear() !== now.getUTCFullYear()
    );
  }

  /**
   * Reset daily usage
   */
  resetDaily(): void {
    this.dailyUsed = 0;
    this.lastDailyReset = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Reset monthly usage
   */
  resetMonthly(): void {
    this.monthlyUsed = 0;
    this.lastMonthlyReset = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update limits
   */
  setLimits(limits: Partial<TokenLimits>): void {
    if (limits.monthlyLimit !== undefined) {
      this.monthlyLimit = limits.monthlyLimit;
    }
    if (limits.dailyLimit !== undefined) {
      this.dailyLimit = limits.dailyLimit;
    }
    if (limits.burstCapacity !== undefined) {
      this.burstCapacity = limits.burstCapacity;
    }
    this.updatedAt = new Date();
  }

  /**
   * Get percentage of quota used
   */
  getUsagePercentage(): { daily: number; monthly: number } {
    return {
      daily:
        this.dailyLimit > 0
          ? Math.round((this.dailyUsed / this.dailyLimit) * 100)
          : 0,
      monthly:
        this.monthlyLimit > 0
          ? Math.round((this.monthlyUsed / this.monthlyLimit) * 100)
          : 0,
    };
  }

  /**
   * Calculate seconds until next daily reset (midnight UTC)
   */
  getSecondsUntilDailyReset(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    midnight.setUTCHours(0, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  }

  /**
   * Calculate seconds until next monthly reset (1st of next month)
   */
  getSecondsUntilMonthlyReset(): number {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    nextMonth.setUTCHours(0, 0, 0, 0);
    return Math.ceil((nextMonth.getTime() - now.getTime()) / 1000);
  }
}
