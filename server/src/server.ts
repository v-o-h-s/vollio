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
import { errorHandler } from "./shared/utils/errorHanlder";
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
import { tokenRateLimiterPlugin } from "./plugins/tokenRateLimiter";

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

// Register session (depends on cookie)
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

// CORS Configuration
const allowedOrigins = [
  "https://dashboard.vollio.xyz",
  // Development
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3001"] : []),
];

app.register(fastifyCors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      cb(null, true);
      return;
    }

    // In development, allow all origins
    if (process.env.NODE_ENV !== "production") {
      cb(null, true);
      return;
    }

    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,  // 24 hours - browsers can cache preflight
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

// Register rate limiter plugin (must be after authPlugin to access request.user)
app.register(rateLimiterPlugin);

// Register token rate limiter plugin for AI endpoints
app.register(tokenRateLimiterPlugin);

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
  await app.close();
  process.exit(0);
});
