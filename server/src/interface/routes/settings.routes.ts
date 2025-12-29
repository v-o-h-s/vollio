import { FastifyInstance } from "fastify";

export default async function settingsRoutes(fastify: FastifyInstance) {
  const settingsController = fastify.diContainer.resolve("settingsController");

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Settings"],
        summary: "Get user settings",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object", additionalProperties: true },
            },
          },
        },
      },
    },
    settingsController.getSettings.bind(settingsController)
  );

  fastify.patch(
    "/",
    {
      schema: {
        tags: ["Settings"],
        summary: "Update user settings",
        body: { type: "object", additionalProperties: true },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object", additionalProperties: true },
            },
          },
        },
      },
    },
    settingsController.updateSettings.bind(settingsController)
  );
}
