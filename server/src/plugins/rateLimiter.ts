import "dotenv/config";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IRateLimitingService } from "../domain/services/IRateLimitingService";
import { RateLimitingError } from "../shared/errors/RateLimitingError";
import { estimateCost, getClientIp } from "../shared/utils/rate-limiting";
import { IdentifierType, PrefixTypes } from "../shared/utils/rate-limiting";

export const rateLimiterPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    const rateLimitingService = request.diScope.resolve<IRateLimitingService>(
      "rateLimitingService",
    );
    const config = request.routeOptions.config.rateLimit;

    // 1. IP-based general rate limiting for NO user or default
    if (!request.user) {
      const publicCapacity =
        Number(process.env.PUBLIC_ROUTES_LIMIT_CAPACITY) || 10;
      const publicRefill = Number(process.env.PUBLIC_ROUTES_REFILL_RATE) || 1;
      const cost = config?.request?.cost ?? 1;

      const result = await rateLimitingService.tryConsume(
        { type: IdentifierType.IP, value: getClientIp(request) },
        { cost, capacity: publicCapacity, refillRate: publicRefill },
        PrefixTypes.REQUEST,
      );

      if (!result.allowed) {
        throw new RateLimitingError({
          message: "Too many requests. Please try again later.",
          source: PrefixTypes.REQUEST,
          retryAfter: result.retryAfter,
          remaining: Math.floor(result.remaining),
          limit: publicCapacity,
        });
      }

      // Add Headers for IP-based limits
      reply.header("X-RateLimit-Limit", publicCapacity);
      reply.header("X-RateLimit-Remaining", Math.floor(result.remaining));
      return;
    }

    // 2. Authenticated user logic
    const userId = request.user.id;
    const capacity = Number(process.env.RATE_LIMIT_CAPACITY) || 100;
    const refillRate = Number(process.env.RATE_LIMIT_REFILL_RATE) || 1;

    // A. Check General Request Bucket
    const requestCost = config?.request?.cost ?? 1;
    const requestResult = await rateLimitingService.tryConsume(
      { type: IdentifierType.USERID, value: userId },
      { cost: requestCost, capacity, refillRate },
      PrefixTypes.REQUEST,
    );

    if (!requestResult.allowed) {
      throw new RateLimitingError({
        message: "General request limit exceeded.",
        source: PrefixTypes.REQUEST,
        retryAfter: requestResult.retryAfter,
        remaining: Math.floor(requestResult.remaining),
        limit: capacity,
      });
    }

    // B. Check AI Bucket if configured
    if (config?.ai) {
      const estimatedCost = estimateCost(request);

      // 1. Month check (Largest bucket first - fail fast)
      const aiMaxMonth =
        Number(process.env.MAX_AI_TOKENS_PER_MONTH) || 10000000;
      const aiMonthRefill = aiMaxMonth / (30 * 24 * 60 * 60);

      const remainingMonth = await rateLimitingService.getRemaining(
        { type: IdentifierType.USERID, value: userId },
        { capacity: aiMaxMonth, refillRate: aiMonthRefill },
        PrefixTypes.AI_PER_MONTH,
      );

      if (remainingMonth < estimatedCost) {
        throw new RateLimitingError({
          message: "Monthly AI quota reached.",
          source: PrefixTypes.AI_PER_MONTH,
          retryAfter: Math.ceil(
            (estimatedCost - remainingMonth) / aiMonthRefill,
          ),
          remaining: Math.floor(remainingMonth),
          limit: aiMaxMonth,
        });
      }

      // 2. Day check
      const aiMaxDay = Number(process.env.MAX_AI_TOKENS_PER_DAY) || 1000000;
      const aiDayRefill = aiMaxDay / (24 * 60 * 60); // Tokens per second

      const remainingDay = await rateLimitingService.getRemaining(
        { type: IdentifierType.USERID, value: userId },
        { capacity: aiMaxDay, refillRate: aiDayRefill },
        PrefixTypes.AI_PER_DAY,
      );

      if (remainingDay < estimatedCost) {
        throw new RateLimitingError({
          message: "Daily AI quota reached.",
          source: PrefixTypes.AI_PER_DAY,
          retryAfter: Math.ceil((estimatedCost - remainingDay) / aiDayRefill),
          remaining: Math.floor(remainingDay),
          limit: aiMaxDay,
        });
      }

      // 3. Minute check (Smallest bucket last)
      const aiMaxMinute =
        Number(process.env.MAX_AI_TOKENS_PER_MINUTES) || 100000;
      const aiMinuteCap = aiMaxMinute * 0.625;
      const aiMinuteRefill = (aiMaxMinute * 0.375) / 60;

      const remainingMin = await rateLimitingService.getRemaining(
        { type: IdentifierType.USERID, value: userId },
        { capacity: aiMinuteCap, refillRate: aiMinuteRefill },
        PrefixTypes.AI_PER_MINUTE,
      );

      if (remainingMin < estimatedCost) {
        throw new RateLimitingError({
          message:
            "Insufficient AI tokens (Minute limit). Please wait a moment.",
          source: PrefixTypes.AI_PER_MINUTE,
          retryAfter: Math.ceil(
            (estimatedCost - remainingMin) / aiMinuteRefill,
          ),
          remaining: Math.floor(remainingMin),
        });
      }

      // Add Headers for AI Quota (Effective Remaining)
      // Since we check Month -> Day -> Minute, we can set headers for transparency
      reply.header("X-AI-Remaining-Month", Math.floor(remainingMonth));
      reply.header("X-AI-Remaining-Day", Math.floor(remainingDay));
      reply.header("X-AI-Remaining-Minute", Math.floor(remainingMin));
    }

    // C. Check Upload Bucket if configured (Placeholder for future)
    if (config?.upload) {
      // similar logic for uploads
    }

    // Headers (using the general request result for simplicity)
    reply.header("X-RateLimit-Limit", capacity);
    reply.header("X-RateLimit-Remaining", Math.floor(requestResult.remaining));
  });
});
