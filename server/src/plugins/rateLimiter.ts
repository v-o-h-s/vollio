import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IRateLimitingService } from "../domain/services/IRateLimitingService";
import { RateLimitingError } from "../shared/errors/RateLimitingError";

// In-memory IP rate limit store (fallback if Redis unavailable for unauthenticated routes)
const ipRateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipRateLimitStore) {
    if (value.resetAt < now) {
      ipRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client IP from request (considering proxies)
 */
function getClientIp(request: any): string {
  return (
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.headers["x-real-ip"] ||
    request.ip ||
    "unknown"
  );
}

export const rateLimiterPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    // Handle IP-based rate limiting for public routes
    const ipRateLimitConfig = request.routeOptions.config.ipRateLimit;
    if (ipRateLimitConfig) {
      const ip = getClientIp(request);
      const maxRequests = ipRateLimitConfig.maxRequests ?? 60;
      const windowSeconds = ipRateLimitConfig.windowSeconds ?? 60;
      const key = `ip:${ip}:${request.url.split("?")[0]}`;
      const now = Date.now();

      let entry = ipRateLimitStore.get(key);
      if (!entry || entry.resetAt < now) {
        entry = { count: 0, resetAt: now + windowSeconds * 1000 };
      }

      entry.count++;
      ipRateLimitStore.set(key, entry);

      const remaining = Math.max(0, maxRequests - entry.count);
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

      reply.header("X-RateLimit-Limit", maxRequests);
      reply.header("X-RateLimit-Remaining", remaining);
      reply.header("X-RateLimit-Reset", Math.floor(entry.resetAt / 1000));

      if (entry.count > maxRequests) {
        throw new RateLimitingError({
          message: "Too many requests. Please try again later.",
          source: "ip_rate_limit",
          retryAfter,
          remaining: 0,
          limit: maxRequests,
          reset: entry.resetAt,
        });
      }
      return;
    }

    // Skip user-based rate limiting if no user is authenticated
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
