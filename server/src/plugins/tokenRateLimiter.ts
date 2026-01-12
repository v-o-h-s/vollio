import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ITokenRateLimitingService } from "../domain/services/ITokenRateLimitingService";

/**
 * Token Rate Limiter Plugin
 *
 * Enforces token-based rate limiting on AI endpoints.
 * Runs as a preHandler hook and checks user token quota before allowing requests.
 *
 * Configuration:
 * - Add `tokenRateLimit: true` to route config to enable
 * - Optionally add `estimatedTokens: number` for pre-check estimation
 *
 * Example:
 * ```typescript
 * fastify.post('/generate', {
 *   config: {
 *     tokenRateLimit: true,
 *     estimatedTokens: 5000  // Optional
 *   }
 * }, handler);
 * ```
 */
export const tokenRateLimiterPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    fastify.addHook("preHandler", async (request, reply) => {
      // Skip if no user is authenticated
      if (!request.user) {
        return;
      }

      // Get token rate limit config for this route
      const tokenRateLimitConfig = request.routeOptions.config.tokenRateLimit;

      // Skip if route doesn't have tokenRateLimit enabled
      if (!tokenRateLimitConfig) {
        return;
      }

      const estimatedTokens =
        typeof tokenRateLimitConfig === "object"
          ? tokenRateLimitConfig.estimatedTokens
          : undefined;

      try {
        const tokenRateLimitingService =
          request.diScope.resolve<ITokenRateLimitingService>(
            "tokenRateLimitingService"
          );

        const result = await tokenRateLimitingService.canConsume(
          request.user.id,
          {
            estimatedTokens,
          }
        );

        // Set rate limit headers
        reply.header("X-Token-Daily-Remaining", result.remaining.daily);
        reply.header("X-Token-Monthly-Remaining", result.remaining.monthly);

        if (!result.allowed) {
          // Log the event for monitoring
          request.log.warn(
            {
              userId: request.user.id,
              reason: result.reason,
              remaining: result.remaining,
            },
            "Token quota exceeded"
          );

          if (result.retryAfter) {
            reply.header("Retry-After", result.retryAfter);
          }

          reply.status(429).send({
            success: false,
            message: "Token Quota Exceeded",
            data: null,
            error: {
              type: "token_quota_exceeded",
              reason: result.reason,
              remaining: result.remaining,
              retryAfter: result.retryAfter,
              message: getQuotaExceededMessage(result.reason),
            },
          });
          return;
        }
      } catch (error) {
        // Log error but don't block request - fail open
        request.log.error({ error }, "Token rate limit check failed");
      }
    });

    // Add response hook to include usage headers on all AI responses
    fastify.addHook("onSend", async (request, reply, payload) => {
      // Only process if user exists and route has tokenRateLimit
      if (!request.user || !request.routeOptions.config.tokenRateLimit) {
        return payload;
      }

      try {
        const tokenRateLimitingService =
          request.diScope.resolve<ITokenRateLimitingService>(
            "tokenRateLimitingService"
          );

        const status = await tokenRateLimitingService.getQuotaStatus(
          request.user.id
        );

        // Update headers with actual remaining after request
        reply.header("X-Token-Daily-Remaining", status.remaining.daily);
        reply.header("X-Token-Monthly-Remaining", status.remaining.monthly);
        reply.header(
          "X-Token-Daily-Reset",
          Math.floor(status.resetTimes.daily.getTime() / 1000)
        );
      } catch (error) {
        request.log.error(
          { error },
          "Failed to get quota status for response headers"
        );
      }

      return payload;
    });
  }
);

/**
 * Get user-friendly message for quota exceeded reason
 */
function getQuotaExceededMessage(reason?: string): string {
  switch (reason) {
    case "daily_limit":
      return "You have reached your daily AI usage limit. Your quota will reset at midnight UTC.";
    case "monthly_limit":
      return "You have reached your monthly AI usage limit. Your quota will reset on the 1st of next month.";
    case "burst_limit":
      return "This request exceeds the maximum allowed tokens per request. Try processing a smaller document or splitting your request.";
    default:
      return "AI usage quota exceeded. Please try again later.";
  }
}
