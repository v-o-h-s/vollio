import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { FastifyRequest } from "fastify";

// Service client: Used on the server for admin operations (no user context)
// This is used to initialize the DI container
export function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );  
}

// User client: Created per-request with user's cookies
// this function creates a Supabase client with the user's cookies , it does not verify auth or anything ,just keep this in mind pls
export async function createUserClient(req: FastifyRequest) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => {
          return Object.entries(req.cookies || {})
            .filter(([name]) => name.startsWith("sb-"))
            .map(([name, value]) => ({ name, value: value || "" }));
        },
      },
    }
  );

  return { supabase };
}

