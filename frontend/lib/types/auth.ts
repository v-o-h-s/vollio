/**
 * Authentication-related types for user management and security
 */

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication operation result
 */
export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

/**
 * JWT token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Client authentication state
 */
export interface ClientAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  error: string | null;
}

/**
 * Authenticated Supabase client result
 */
export interface AuthenticatedClientResult {
  client: any; // SupabaseClient<Database> - avoiding circular import
  userId: string;
}