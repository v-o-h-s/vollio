import {
  AiQuotaRemaining,
  IAiQuotaService,
} from "../../../domain/services/quota/IAiQuotaService";
import { IRateLimitingService } from "../../../domain/services/IRateLimitingService";
import {
  IdentifierType,
  PrefixTypes,
} from "../../../shared/utils/rate-limiting";
import { TokenUsage } from "../../../shared/types/generativeAi";
import { FastifyBaseLogger } from "fastify";
import { IAIResourcesRepository } from "../../../domain/repositories/IAIResourcesRepository";

/**
 * @description this class interacts with db logs/resources and redis for rate limiting
 */
export class AiQuotaService implements IAiQuotaService {
  private ratio: number;
  private minuteLimit: { capacity: number; refillRate: number };
  private dayLimit: { capacity: number; refillRate: number };
  private monthLimit: { capacity: number; refillRate: number };

  constructor(
    private rateLimitingService: IRateLimitingService,
    private aiResourcesRepository: IAIResourcesRepository,
    private logger: FastifyBaseLogger,
  ) {
    this.ratio = Number(process.env.RATIO_REQUEST_RESPONSE_TOKENS) || 1;

    const maxMinute = Number(process.env.MAX_AI_TOKENS_PER_MINUTES) || 100000;
    const maxDay = Number(process.env.MAX_AI_TOKENS_PER_DAY) || 500000;
    const maxMonth = Number(process.env.MAX_AI_TOKENS_PER_MONTH) || 10000000;

    this.minuteLimit = {
      capacity: maxMinute * 0.625,
      refillRate: (maxMinute * 0.375) / 60,
    };
    this.dayLimit = {
      capacity: maxDay * 0.625,
      refillRate: (maxDay * 0.375) / 86400,
    };
    this.monthLimit = {
      capacity: maxMonth * 0.625,
      refillRate: (maxMonth * 0.375) / 2592000,
    };
  }

  private calculateCost(usage: TokenUsage): number {
    return usage.promptTokens + usage.completionTokens * this.ratio;
  }

  async consumeTokens(
    userId: string,
    usage: TokenUsage,
    details?: {
      actionType: "chat" | "summary" | "flashcards" | "quiz" | "other";
      model: string;
      resourceId?: string;
      metadata?: any;
    },
  ): Promise<void> {
    const cost = this.calculateCost(usage);
    this.logger.info(
      { userId, usage, cost, action: details?.actionType },
      "Consuming AI tokens in AiQuotaService",
    );

    const resources = await this.aiResourcesRepository.getByUserId(userId);
    if (resources) {
      try {
        resources.consumeAiTokens(cost);
        await this.aiResourcesRepository.upsert(resources);
      } catch (err) {
        this.logger.error(
          { err, userId, cost },
          "Failed to update AI resources tally in DB",
        );
      }
    }

    if (details) {
      this.aiResourcesRepository
        .logUsage({
          userId,
          actionType: details.actionType,
          model: details.model,
          resourceId: details.resourceId,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          costMultiplier: usage.totalTokens > 0 ? cost / usage.totalTokens : 1,
          metadata: details.metadata,
        })
        .catch((err: any) =>
          this.logger.error({ err }, "Background AI usage logging failed"),
        );
    }

    await this.rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      {
        cost,
        ...this.monthLimit,
        force: true,
      },
      PrefixTypes.AI_PER_MONTH,
    );

    await this.rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      {
        cost,
        ...this.dayLimit,
        force: true,
      },
      PrefixTypes.AI_PER_DAY,
    );

    await this.rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      {
        cost,
        ...this.minuteLimit,
        force: true,
      },
      PrefixTypes.AI_PER_MINUTE,
    );
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
