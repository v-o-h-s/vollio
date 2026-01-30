// plugins/auth.ts
import fp from "fastify-plugin";
import { createUserClient } from "../infrastructure/database/supabase/supabase";
import { User } from "../shared/types/fastify";

export const authPlugin = fp(async (fastify) => {
  fastify.decorateRequest("user", null);

  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ["/", "/health", "/ready", "/live"];

  fastify.addHook("onRequest", async (req, reply) => {
    // Skip auth check for public routes
    if (PUBLIC_ROUTES.includes(req.url.split("?")[0])) {
      return;
    }
    
    const { supabase } = await createUserClient(req);

    // Verify the JWT token from the cookies
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data || !data.claims) {
      reply.status(401).send({
        success: false,
        status: 401,
        data: null,
        error: { message: "Not authenticated for fun" },
      });
      return;
    }

    const user: User = {
      id: data.claims.sub,
      email: data.claims.email || undefined,
      phone: data.claims.phone || undefined,
      user_metadata: data.claims["user_metadata"] || undefined,
      role: data.claims.role || "",
    };
    req.user = user;

    // DI is now handled automatically by @fastify/awilix
    // request.diScope will have all dependencies available
  });
});
