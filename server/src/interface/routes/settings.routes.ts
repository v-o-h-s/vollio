import { FastifyInstance } from "fastify";
import { SettingsController } from "../controllers/settings.controller";
import { RateLimitingDegrees } from "../../shared/utils/rate-limiting";

export default async function settingsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.HIGH },
      },
      schema: {
        // Add schema if needed
      },
    },
    async (request, reply) => {
      const settingsController =
        request.diScope.resolve<SettingsController>("settingsController");
      return settingsController.getSettings(request, reply);
    },
  );

  fastify.patch(
    "/",
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.HIGH },
      },
      schema: {
        body: { type: "object", additionalProperties: true },
      },
    },
    async (request, reply) => {
      const settingsController =
        request.diScope.resolve<SettingsController>("settingsController");
      return settingsController.updateSettings(request, reply);
    },
  );
}
