import "dotenv/config";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { containerPlugin } from "./plugins/container";
import { loggerConfig } from "./shared/utils/logger";
import { authPlugin } from "./plugins/auth";
import { errorHandler } from "./shared/utils/errorHanlder";
import { noteRoutes } from "./interface/routes/note.route";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import qs from "querystring";

// CONFIGURATION
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// APP INITIALIZATION
export const app: FastifyInstance = Fastify({ logger: loggerConfig });

// MIDDLEWARE REGISTRATION
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "dev-secret",
});

// Enable CORS for frontend
app.register(fastifyCors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
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

// //testing
// app.get("/auth/google-classroom", (req, reply) => {
//   const params = qs.stringify({
//     client_id: process.env.GOOGLE_CLIENT_ID,
//     redirect_uri: process.env.GOOGLE_CLASSROOM_REDIRECT_URI,
//     response_type: "code",
//     scope: [
//       "https://www.googleapis.com/auth/classroom.courses.readonly",
//       "https://www.googleapis.com/auth/drive.readonly",
//     ].join(" "),
//     access_type: "offline",
//     prompt: "consent",
//   }); 

//   reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
// });
// app.get("/auth/google-classroom/callback", async (req, reply) => {
//     const code = req.query.code;
//   if (!code) {
//     return reply.status(400).send({ error: "Missing code" });
//   }

//   try {
//     const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         code,
//         client_id: process.env.GOOGLE_CLIENT_ID!,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//         redirect_uri: process.env.GOOGLE_CLASSROOM_REDIRECT_URI!,
//         grant_type: "authorization_code",
//       }),
//     });

//     const tokens = await tokenRes.json();

//     if (tokens.error) {
//       console.error("Google token error:", tokens);
//       return reply.status(400).send(tokens);
//     }

//     // Decode email from id_token
//     const email =
//       JSON.parse(
//         Buffer.from(tokens.id_token.split(".")[1], "base64").toString()
//       ).email;

//     // Save tokens to DB
//     await fastify.supabase
//       .from("user_google_classroom")
//       .upsert({
//         user_id: req.user.userId, // clerk user
//         google_email: email,
//         access_token: tokens.access_token,
//         refresh_token: tokens.refresh_token,
//         token_expiry: new Date(Date.now() + tokens.expires_in * 1000),
//       })
//       .select();

//     return reply.redirect("/dashboard?classroom=connected");
//   } catch (err) {
//     console.error(err);
//     return reply.status(500).send({ error: "Failed to exchange code" });
//   }
// });

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
