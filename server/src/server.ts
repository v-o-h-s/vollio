import "dotenv/config";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyHelmet from "@fastify/helmet";
import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { containerPlugin } from "./plugins/container";
import { loggerConfig } from "./shared/utils/logger";
import { authPlugin } from "./plugins/auth";
import { errorHandler } from "./plugins/errorHandler";
import { noteRoutes } from "./interface/routes/note.route";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import { googleClassroomRoutes } from "./interface/routes/googleClassroom.route";
import { documentRoutes } from "./interface/routes/document.route";
import { folderRoutes } from "./interface/routes/folder.route";
import { highlightRoutes } from "./interface/routes/highlight.route";
import { quizRoutes } from "./interface/routes/quiz.route";
import { flashcardRoutes } from "./interface/routes/flashcards.route";
import { assistantRoutes } from "./interface/routes/assistant.route";
import settingsRoutes from "./interface/routes/settings.routes";
import { healthRoutes } from "./interface/routes/health.route";
import { rateLimiterPlugin } from "./plugins/rateLimiter";

import { SentryService } from "./infrastructure/services/SentryService";
import { sentryPlugin } from "./plugins/sentry";

// CONFIGURATION
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Initialize Sentry early
SentryService.initialize();

// APP INITIALIZATION
// Always use loggerConfig - Fastify only accepts configuration objects, not logger instances
export const app: FastifyInstance = Fastify({
  logger: loggerConfig,
  trustProxy: true,
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});

// MIDDLEWARE REGISTRATION
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "dev-secret",
});

// Register session (depends on cookie)
app.register(fastifySession, {
  secret:
    process.env.SESSION_SECRET ||
    process.env.COOKIE_SECRET ||
    "dev-session-secret-change-in-production",
  cookie: {
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in prod
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 15, // 15 minutes (enough time for OAuth flow)
    domain: process.env.NODE_ENV === "production" ? ".vollio.xyz" : undefined,
  },
  saveUninitialized: false, // Don't save empty sessions
});

// CORS Configuration
const allowedOrigins =
  process.env.NODE_ENV !== "production"
    ? ["http://localhost:3001"]
    : (process.env.CLIENT_BASE_URL || "").split(",").map((url) => url.trim());

app.register(fastifyCors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      cb(null, true);
      return;
    }

    // DEBUG LOGGING
    // console.log(`[CORS] Checking origin: ${origin}, Env: ${process.env.NODE_ENV}`);

    // Always allow localhost/127.0.0.1 regardless of NODE_ENV for now to fix local dev issues
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      cb(null, true);
      return;
    }

    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours - browsers can cache preflight
});

// Register multipart for document uploads
app.register(fastifyMultipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Register helmet for security headers
app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for editor
      imgSrc: ["'self'", "data:", "blob:", "*.supabase.co"],
      connectSrc: [
        "'self'",
        "*.supabase.co",
        "openrouter.ai",
        "api.voyageai.com",
      ],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for PDF.js and external resources
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  frameguard: { action: "deny" },
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

// Register sentry plugin
app.register(sentryPlugin);

// Register rate limiter plugin (must be after authPlugin to access request.user)
app.register(rateLimiterPlugin);

// Error handler
app.setErrorHandler(errorHandler);

// HEALTH CHECK ROUTES (public, no prefix)
app.register(healthRoutes);

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
app.register(quizRoutes, {
  prefix: "/api/v1/quizzes",
});
app.register(flashcardRoutes, {
  prefix: "/api/v1/flashcards",
});

app.register(assistantRoutes, {
  prefix: "/api/v1/assistant",
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

  // Flush Sentry events before shutdown
  await SentryService.flush(2000);

  await app.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  app.log.info("SIGTERM received, shutting down gracefully");

  // Flush Sentry events before shutdown
  await SentryService.flush(2000);

  await app.close();
  process.exit(0);
});
