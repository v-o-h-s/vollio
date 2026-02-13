import {
  AiQuotaRemaining,
  IAiQuotaService,
} from "../../domain/services/IAiQuotaService";
import { IRateLimitingService } from "../../domain/services/IRateLimitingService";
import { IdentifierType, PrefixTypes } from "../../shared/utils/rate-limiting";
import { TokenUsage } from "../../shared/types/generativeAi";
import { RateLimitingError } from "../../shared/errors/RateLimitingError";
import { FastifyBaseLogger } from "fastify";

export class AiQuotaService implements IAiQuotaService {
  private ratio: number;
  private minuteLimit: { capacity: number; refillRate: number };
  private dayLimit: { capacity: number; refillRate: number };
  private monthLimit: { capacity: number; refillRate: number };

  constructor(
    private rateLimitingService: IRateLimitingService,
    private logger: FastifyBaseLogger,
  ) {
    this.ratio = Number(process.env.RATIO_REQUEST_RESPONSE_TOKENS) || 1;

    const maxMinute = Number(process.env.MAX_AI_TOKENS_PER_MINUTES) || 100000;
    const maxDay = Number(process.env.MAX_AI_TOKENS_PER_DAY) || 500000;
    const maxMonth = Number(process.env.MAX_AI_TOKENS_PER_MONTH) || 10000000;

    // Formula from docs: Max = C + R * Period
    // Following Scenario 2 ratio (C=100, R=1, Max=160):
    // C = (100/160) * Max = 0.625 * Max
    // R = (60/160) * Max / 60 = 0.375 * Max / 60
    this.minuteLimit = {
      capacity: maxMinute * 0.625, //62500
      refillRate: (maxMinute * 0.375) / 60, //625
    };
    this.dayLimit = {
      capacity: maxDay * 0.625, //312500
      refillRate: (maxDay * 0.375) / 86400, //2163
    };
    this.monthLimit = {
      capacity: maxMonth * 0.625, //6250000
      refillRate: (maxMonth * 0.375) / 2592000, //1446
    };
  }

  /**
   * Calculate effective cost of token usage
   * Based on the ratio between input and output tokens
   */
  private calculateCost(usage: TokenUsage): number {
    return usage.promptTokens + usage.completionTokens * this.ratio;
  }

  async consumeTokens(userId: string, usage: TokenUsage): Promise<void> {
    const cost = this.calculateCost(usage);

    // 1. Per Month (Largest bucket first - fail fast)
    const monthResult = await this.rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      {
        cost,
        ...this.monthLimit,
      },
      PrefixTypes.AI_PER_MONTH,
    );

    if (!monthResult.allowed) {
      throw new RateLimitingError({
        message: "AI monthly token limit exceeded.",
        source: "ai_token_per_month",
        retryAfter: monthResult.retryAfter,
        remaining: Math.floor(monthResult.remaining),
        limit: Math.floor(this.monthLimit.capacity),
      });
    }

    // 2. Per Day (Refills every 24h = 86400s)
    const dayResult = await this.rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      {
        cost,
        ...this.dayLimit,
      },
      PrefixTypes.AI_PER_DAY,
    );

    if (!dayResult.allowed) {
      throw new RateLimitingError({
        message: "AI daily token limit exceeded.",
        source: "ai_token_per_day",
        retryAfter: dayResult.retryAfter,
        remaining: Math.floor(dayResult.remaining),
        limit: Math.floor(this.dayLimit.capacity),
      });
    }

    // 3. Per Minute (Refills every 60s)
    const minuteResult = await this.rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      {
        cost,
        ...this.minuteLimit,
      },
      PrefixTypes.AI_PER_MINUTE,
    );

    if (!minuteResult.allowed) {
      throw new RateLimitingError({
        message: "AI per-minute token limit exceeded.",
        source: "ai_token_per_minute",
        retryAfter: minuteResult.retryAfter,
        remaining: Math.floor(minuteResult.remaining),
        limit: Math.floor(this.minuteLimit.capacity),
      });
    }
  }

  async getRemainingQuota(userId: string): Promise<AiQuotaRemaining> {
    const minuteRemaining = await this.rateLimitingService.getRemaining(
      { type: IdentifierType.USERID, value: userId },
      this.minuteLimit,
      PrefixTypes.AI_PER_MINUTE,
    );

    const dayRemaining = await this.rateLimitingService.getRemaining(
      { type: IdentifierType.USERID, value: userId },
      this.dayLimit,
      PrefixTypes.AI_PER_DAY,
    );

    const monthRemaining = await this.rateLimitingService.getRemaining(
      { type: IdentifierType.USERID, value: userId },
      { ...this.monthLimit },
      PrefixTypes.AI_PER_MONTH,
    );

    return {
      minute: Math.floor(minuteRemaining),
      day: Math.floor(dayRemaining),
      month: Math.floor(monthRemaining),
    };
  }

  async resetQuota(userId: string): Promise<void> {
    await this.rateLimitingService.reset(
      { type: IdentifierType.USERID, value: userId },
      PrefixTypes.AI_PER_MINUTE,
    );
    await this.rateLimitingService.reset(
      { type: IdentifierType.USERID, value: userId },
      PrefixTypes.AI_PER_DAY,
    );
    await this.rateLimitingService.reset(
      { type: IdentifierType.USERID, value: userId },
      PrefixTypes.AI_PER_MONTH,
    );
  }
}
