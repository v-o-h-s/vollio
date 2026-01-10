import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IRateLimitingService } from "../domain/services/IRateLimitingService";

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
      if (result.retryAfter) {
        reply.header("Retry-After", result.retryAfter);
      }

      reply.status(429).send({
        success: false,
        message: "Too Many Requests",
        data: null,
        error: {
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: result.retryAfter,
        },
      });
      return;
    }
  });
});
