import { FastifyInstance } from "fastify";

export default async function settingsRoutes(fastify: FastifyInstance) {
  const settingsController = fastify.diContainer.resolve("settingsController");

  fastify.get(
    "/",
    {
      schema: {
        
        
        
      },
    },
    settingsController.getSettings.bind(settingsController)
  );

  fastify.patch(
    "/",
    {
      schema: {
        
        
        body: { type: "object", additionalProperties: true },
        
      },
    },
    settingsController.updateSettings.bind(settingsController)
  );
}
