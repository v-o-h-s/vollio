import { FastifyInstance } from "fastify";
import { SettingsController } from "../controllers/settings.controller";

export default async function settingsRoutes(fastify: FastifyInstance) {
  const settingsController = fastify.diContainer.resolve("settingsController");

  fastify.get("/", settingsController.getSettings.bind(settingsController));

  fastify.patch(
    "/",
    settingsController.updateSettings.bind(settingsController)
  );
}
