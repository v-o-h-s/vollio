import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";

/**
 * Health check routes for load balancer and monitoring
 *
 * These endpoints are public (no auth required) and have
 * IP-based rate limiting to prevent abuse.
 */
const healthRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
): Promise<void> => {
  /**
   * Basic health check - returns 200 if server is running
   * Used for simple uptime monitoring
   */
  fastify.get(
    "/health",
    {
      config: {
        rateLimit: { cost: 1 },
      },
    },
    async (request, reply) => {
      return reply.send({
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    },
  );

  /**
   * Readiness check - verifies critical dependencies are connected
   * Used by Kubernetes/Docker for readiness probes
   */
  fastify.get(
    "/ready",
    {
      config: {
        rateLimit: { cost: 1 },
      },
    },
    async (request, reply) => {
      const checks: Record<string, "ok" | "error"> = {
        redis: "ok",
      };

      // Check Redis connection
      try {
        const redis = request.diScope.resolve<Redis>("redis");
        await redis.ping();
      } catch (error) {
        checks.redis = "error";
        request.log.error({ error }, "Health check: Redis ping failed");
      }

      const allHealthy = Object.values(checks).every((v) => v === "ok");

      return reply.status(allHealthy ? 200 : 503).send({
        status: allHealthy ? "ready" : "not_ready",
        checks,
        timestamp: new Date().toISOString(),
      });
    },
  );

  /**
   * Liveness check - minimal check that app process is alive
   * Used by Kubernetes for liveness probes
   */
  fastify.get(
    "/live",
    {
      config: {
        rateLimit: { cost: 1 },
      },
    },
    async (request, reply) => {
      return reply.send({ status: "alive" });
    },
  );
};

export const healthRoutes = fp(healthRoutesHandler, {
  name: "health-routes",
  fastify: "5.x",
});
