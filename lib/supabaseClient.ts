import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { useAuth } from "@clerk/nextjs";
import type { Database } from "@/lib/types/database";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PROJECT_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Basic Supabase client for public operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Using Clerk for auth
  },
});

/**
 * Server-side function to get authenticated Supabase client with Clerk token
 * Use this in API routes and server components
 */
export const getAuthenticatedSupabaseClient = async (): Promise<
  SupabaseClient<Database>
> => {
  try {
    const { getToken, userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Try to get Supabase template token, with fallback to default
    let token;
    try {
      token = await getToken({ template: "supabase" });
      // console.log("Got Supabase template token");
    } catch (templateError) {
      console.warn(
        "Supabase template failed, trying default token:",
        templateError
      );
      try {
        token = await getToken();
        // console.log("Got default token as fallback");
      } catch (defaultError) {
        console.error("Both template and default token failed:", defaultError);
        throw new Error("Failed to get any authentication token");
      }
    }

    if (!token) {
      throw new Error("No JWT token available - make sure you're signed in");
    }

    // console.log("Creating Supabase client for user:", userId);
    // console.log("Token length:", token.length);
    // console.log("Token preview:", token.substring(0, 50) + "...");

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
  } catch (error) {
    console.error("Failed to create authenticated Supabase client:", error);
    throw new Error(
      `Authentication failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Client-side hook to get authenticated Supabase client with Clerk token
 * Use this in client components - must be called within a React component
export const useAuthenticatedSupabaseClient = (): {
  getClient: () => Promise<SupabaseClient<Database>>;
  isLoading: boolean;
} => {
  const { getToken, isLoaded } = useAuth();
  
  const getClient = async (): Promise<SupabaseClient<Database>> => {
    try {
      if (!isLoaded) {
        throw new Error("Auth not loaded yet");
      }
      
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        throw new Error(
          "No authentication token available - user may not be signed in"
        );
      }

      return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
        },
      });
    } catch (error) {
      console.error(
        "Failed to create client-side authenticated Supabase client:",
        error
      );
      throw new Error(
        `Client authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };
  
  return {
    getClient,
    isLoading: !isLoaded,
  };
};

*/
/**
 * Helper function to create a Supabase client with a specific token
 * Useful for API routes when you already have a token
 */
export const createSupabaseClientWithToken = (
  token: string
): SupabaseClient<Database> => {
  if (!token) {
    throw new Error("Token is required to create authenticated client");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
};

/**
 * Helper function to get Clerk token in API routes
 * Returns null if no token is available
 */
export const getClerkToken = async (): Promise<string | null> => {
  try {
    const { getToken } = await auth();
    return await getToken({ template: "supabase" });
  } catch (error) {
    console.error("Failed to get Clerk token:", error);
    return null;
  }
};

/**
 * Helper function to validate if user is authenticated
 * Returns user ID if authenticated, null otherwise
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Failed to get current user ID:", error);
    return null;
  }
};

// Storage configuration constants
export const STORAGE_CONFIG = {
  BUCKET_NAME: "pdfs" as const,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: ["application/pdf"] as string[],
  SIGNED_URL_EXPIRY: 3600, // 1 hour
};

// Table names for type safety
export const TABLES = {
  PDFS: "pdfs",
  USER_ACTIVITY: "user_activity",
  ANNOTATIONS: "annotations",
};

// API configuration constants
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CACHE_TTL: 300000, // 5 minutes
};
