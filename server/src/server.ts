import "dotenv/config";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { containerPlugin } from "./plugins/container";
import { loggerConfig } from "./shared/utils/logger";
import { authPlugin } from "./plugins/auth";
import { errorHandler } from "./shared/utils/errorHanlder";
import { noteRoutes } from "./interface/routes/note.route";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import { googleClassroomRoutes } from "./interface/routes/googleClassroom.route";
import { documentRoutes } from "./interface/routes/document.route";
import { testRoutes } from "./interface/routes/test.route";
import { folderRoutes } from "./interface/routes/folder.route";
import { highlightRoutes } from "./interface/routes/highlight.route";
import { quizRoutes } from "./interface/routes/quiz.route";
import { flashcardRoutes } from "./interface/routes/flashcards.route";
import { summaryRoutes } from "./interface/routes/summary.route";
import { aiRoutes } from "./interface/routes/ai.route";
import settingsRoutes from "./interface/routes/settings.routes";

// CONFIGURATION
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// APP INITIALIZATION
export const app: FastifyInstance = Fastify({
  logger: loggerConfig,
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});

// MIDDLEWARE REGISTRATION
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "dev-secret",
});

// Register sessio8n (depends on cookie)
app.register(fastifySession, {
  secret:
    process.env.SESSION_SECRET ||
    process.env.COOKIE_SECRET ||
    "dev-session-secret-change-in-production",
  cookie: {
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 15, // 15 minutes (enough time for OAuth flow)
  },
  saveUninitialized: false, // Don't save empty sessions
});

app.register(fastifyCors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// Register multipart for document uploads
app.register(fastifyMultipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Register Awilix DI plugin first
app.register(fastifyAwilixPlugin, {
  disposeOnClose: true,
  disposeOnResponse: true,
  strictBooleanEnforced: true,
});

// Register our container configuration after Awilix

app.register(containerPlugin);

// Register auth plugin globally (it will handle public vs protected routes)
app.register(authPlugin);

// Error handler
app.setErrorHandler(errorHandler);

// API ROUTES
app.register(noteRoutes, { prefix: "/api/v1/notes" });
app.register(googleClassroomRoutes, {
  prefix: "/api/v1/integrations/lms/google-classroom",
});
app.register(documentRoutes, {
  prefix: "/api/v1/documents",
});
app.register(folderRoutes, {
  prefix: "/api/v1/folders",
});
app.register(highlightRoutes, {
  prefix: "/api/v1/highlights",
});
app.register(testRoutes, {
  prefix: "/api/v1/test",
});
app.register(quizRoutes, {
  prefix: "/api/v1/quizzes",
});
app.register(flashcardRoutes, {
  prefix: "/api/v1/flashcards",
});
app.register(summaryRoutes, {
  prefix: "/api/v1/summaries",
});
app.register(aiRoutes, {
  prefix: "/api/v1/ai",
});
app.register(settingsRoutes, {
  prefix: "/api/v1/settings",
});

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
