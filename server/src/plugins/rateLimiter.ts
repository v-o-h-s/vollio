import "dotenv/config";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IRateLimitingService } from "../domain/services/IRateLimitingService";
import { RateLimitingError } from "../shared/errors/RateLimitingError";
import { getClientIp } from "../shared/utils/rate-limiting";

export const rateLimiterPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    const rateLimitingService = request.diScope.resolve<IRateLimitingService>(
      "rateLimitingService",
    );

    // 1. IP-based rate limiting for public routes (no user)
    if (!request.user) {
      const rateLimitConfig = request.routeOptions.config.rateLimit;
      const capacity = Number(process.env.PUBLIC_ROUTES_LIMIT_CAPACITY) || 10;
      const refillRate = Number(process.env.PUBLIC_ROUTES_REFILL_RATE) || 1;
      const cost = rateLimitConfig?.cost ?? 1;

      const result = await rateLimitingService.tryConsume(
        { ip: getClientIp(request) },
        {
          cost,
          capacity,
          refillRate,
        },
        "request",
      );

      reply.header("X-RateLimit-Limit", capacity);
      reply.header("X-RateLimit-Remaining", Math.floor(result.remaining));

      if (!result.allowed) {
        throw new RateLimitingError({
          message: "Too many requests. Please try again later.",
          source: "ip_rate_limit",
          retryAfter: result.retryAfter,
          remaining: Math.floor(result.remaining),
          limit: capacity,
        });
      }
      return;
    }

    // 2. User-based rate limiting for authenticated routes
    const rateLimitConfig = request.routeOptions.config.rateLimit;
    const cost = rateLimitConfig?.cost ?? 1;
    const bucket = rateLimitConfig?.category ?? "request";

    const capacity = Number(process.env.RATE_LIMIT_CAPACITY) || 100;
    const refillRate = Number(process.env.RATE_LIMIT_REFILL_RATE) || 1;

    const result = await rateLimitingService.tryConsume(
      { user: request.user.id },
      {
        cost,
        capacity,
        refillRate,
      },
      bucket,
    );

    reply.header("X-RateLimit-Limit", capacity);
    reply.header("X-RateLimit-Remaining", Math.floor(result.remaining));

    if (!result.allowed) {
      throw new RateLimitingError({
        message: "Rate limit exceeded. Please try again later.",
        source: bucket,
        retryAfter: result.retryAfter,
        remaining: Math.floor(result.remaining),
        limit: capacity,
        details: { bucket, cost },
      });
    }
  });
});
