import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IRateLimitingService } from "../domain/services/IRateLimitingService";
import { RateLimitingError } from "../shared/errors/RateLimitingError";

export const rateLimiterPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    // Skip if no user is authenticated
    if (!request.user) {
      return;
    }

    // Get rate limit config for this route
    const rateLimitConfig = request.routeOptions.config.rateLimit;

    // Default cost is 1 if not specified
    const cost = rateLimitConfig?.cost ?? 1;
    const bucket = rateLimitConfig?.category ?? "request";

    const rateLimitingService = request.diScope.resolve<IRateLimitingService>(
      "rateLimitingService"
    );

    const result = await rateLimitingService.tryConsume(
      request.user.id,
      { cost },
      bucket
    );

    // Set standard rate limit headers
    reply.header("X-RateLimit-Remaining", Math.floor(result.remaining));

    if (!result.allowed) {
      throw new RateLimitingError({
        message: "Rate limit exceeded. Please try again later.",
        source: bucket,
        retryAfter: result.retryAfter,
        remaining: Math.floor(result.remaining),
        details: {
          bucket,
          cost,
        },
      });
    }
  });
});
