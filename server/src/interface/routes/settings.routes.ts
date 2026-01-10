import { FastifyInstance } from "fastify";
import { SettingsController } from "../controllers/settings.controller";

export default async function settingsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      schema: {
        // Add schema if needed
      },
    },
    async (request, reply) => {
      const settingsController = request.diScope.resolve<SettingsController>("settingsController");
      return settingsController.getSettings(request, reply);
    }
  );

  fastify.patch(
    "/",
    {
      schema: {
        body: { type: "object", additionalProperties: true },
      },
    },
    async (request, reply) => {
      const settingsController = request.diScope.resolve<SettingsController>("settingsController");
      return settingsController.updateSettings(request, reply);
    }
  );
}
