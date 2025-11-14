import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { encryptOAuthTokens, decryptOAuthTokens } from "@/lib/utils/encryption";
import type { OAuthTokenInsert, OAuthTokenRow } from "@/lib/types/database";

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export interface DecryptedOAuthToken {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: Date | null;
  scope: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Save encrypted OAuth tokens to database
 */
export async function saveOAuthTokens(
  userId: string,
  tokens: GoogleOAuthTokens,
  provider: string = "google"
): Promise<OAuthTokenRow> {
  const supabase = await getAuthenticatedSupabaseClient();

  // Encrypt the tokens
  const encryptedTokens = encryptOAuthTokens({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  // Calculate expiration time
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const tokenData: OAuthTokenInsert = {
    user_id: userId,
    provider,
    encrypted_access_token: encryptedTokens.encrypted_access_token,
    encrypted_refresh_token: encryptedTokens.encrypted_refresh_token,
    token_type: tokens.token_type || "Bearer",
    expires_at: expiresAt,
    scope: tokens.scope || null,
  };

  // Use upsert to handle existing tokens
  const { data, error } = await supabase
    .from("oauth_tokens")
    .upsert(tokenData, {
      onConflict: "user_id,provider",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving OAuth tokens:", error);
    throw new Error("Failed to save OAuth tokens");
  }

  return data;
}

/**
 * Get and decrypt OAuth tokens from database
 */
export async function getOAuthTokens(
  userId: string,
  provider: string = "google"
): Promise<DecryptedOAuthToken | null> {
  const supabase =await  getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No tokens found
      return null;
    }
    console.error("Error fetching OAuth tokens:", error);
    throw new Error("Failed to fetch OAuth tokens");
  }

  if (!data) {
    return null;
  }

  try {
    // Decrypt the tokens
    const decryptedTokens = decryptOAuthTokens({
      encrypted_access_token: data.encrypted_access_token,
      encrypted_refresh_token: data.encrypted_refresh_token,
    });

    return {
      id: data.id,
      user_id: data.user_id,
      provider: data.provider,
      access_token: decryptedTokens.access_token,
      refresh_token: decryptedTokens.refresh_token,
      token_type: data.token_type,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
      scope: data.scope,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (decryptionError) {
    console.error("Error decrypting OAuth tokens:", decryptionError);
    throw new Error("Failed to decrypt OAuth tokens");
  }
}

/**
 * Delete OAuth tokens from database
 */
export async function deleteOAuthTokens(
  userId: string,
  provider: string = "google"
): Promise<void> {
  const supabase =await getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from("oauth_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);

  if (error) {
    console.error("Error deleting OAuth tokens:", error);
    throw new Error("Failed to delete OAuth tokens");
  }
}

/**
 * Check if OAuth tokens are expired
 */
export function areTokensExpired(token: DecryptedOAuthToken): boolean {
  if (!token.expires_at) {
    return false; // No expiration set
  }

  // Add 5 minute buffer for token refresh
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= token.expires_at.getTime() - bufferTime;
}

/**
 * Refresh OAuth tokens using refresh token
 */
export async function refreshOAuthTokens(
  userId: string,
  provider: string = "google"
): Promise<DecryptedOAuthToken | null> {
  const currentTokens = await getOAuthTokens(userId, provider);

  if (!currentTokens || !currentTokens.refresh_token) {
    throw new Error("No refresh token available");
  }

  if (provider === "google") {
    return await refreshGoogleTokens(userId, currentTokens);
  }

  throw new Error(`Token refresh not implemented for provider: ${provider}`);
}

/**
 * Refresh Google OAuth tokens
 */
async function refreshGoogleTokens(
  userId: string,
  currentTokens: DecryptedOAuthToken
): Promise<DecryptedOAuthToken> {
  const refreshUrl = "https://oauth2.googleapis.com/token";
  
  const refreshData = {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: currentTokens.refresh_token!,
    grant_type: "refresh_token",
  };

  try {
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(refreshData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Google token refresh failed:", errorData);
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // Google refresh response includes new access token and optionally new refresh token
    const newTokens: GoogleOAuthTokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || currentTokens.refresh_token, // Keep old refresh token if new one not provided
      token_type: tokenData.token_type || currentTokens.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope || currentTokens.scope,
    };

    // Save the refreshed tokens
    await saveOAuthTokens(userId, newTokens, "google");

    // Return the updated tokens
    return await getOAuthTokens(userId, "google") as DecryptedOAuthToken;
  } catch (error) {
    console.error("Error refreshing Google tokens:", error);
    throw new Error("Failed to refresh Google OAuth tokens");
  }
}

/**
 * Get valid OAuth tokens, refreshing if necessary
 */
export async function getValidOAuthTokens(
  userId: string,
  provider: string = "google"
): Promise<DecryptedOAuthToken | null> {
  const tokens = await getOAuthTokens(userId, provider);

  if (!tokens) {
    return null;
  }

  // If tokens are expired, try to refresh them
  if (areTokensExpired(tokens)) {
    try {
      return await refreshOAuthTokens(userId, provider);
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      // If refresh fails, delete the expired tokens
      await deleteOAuthTokens(userId, provider);
      return null;
    }
  }

  return tokens;
}
