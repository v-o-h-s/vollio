import "reflect-metadata"; // Required for tsyringe
import "dotenv/config";
import fastifyCookie from "@fastify/cookie";
import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { loggerConfig } from "./shared/utils/logger";
import { authPlugin } from "./plugins/auth";
import { errorHandler } from "./shared/utils/errorHanlder";
import { noteRoutes } from "./interface/routes/note.route";

// CONFIGURATION
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// APP INITIALIZATION
export const app: FastifyInstance = Fastify({ logger: loggerConfig });

// MIDDLEWARE REGISTRATION
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "dev-secret",
});

// Register auth plugin globally (it will handle public vs protected routes)
app.register(authPlugin);

// Error handler
app.setErrorHandler(errorHandler);

// PUBLIC ROUTES
app.get("/", async () => {
  return { ok: true, message: "Hello from Fastify" };
});

// API ROUTES
app.register(noteRoutes, { prefix: "/api/notes" });

// SERVER STARTUP
async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

// GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
  app.log.info("Stopping server");
  await app.close();
  process.exit(0);
});
