import { FastifyInstance } from "fastify";

export default async function settingsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      schema: {
        // Add schema if needed
      },
    },
    async (request, reply) => {
      const settingsController = request.diScope.resolve("settingsController");
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
      const settingsController = request.diScope.resolve("settingsController");
      return settingsController.updateSettings(request, reply);
    }
  );
}
