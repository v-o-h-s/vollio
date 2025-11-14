import { google } from "googleapis";
import { getOAuthTokens, areTokensExpired } from '@/lib/services/school-lms/oauth-token-service';

/**
 * Client-side function to get Google Auth URL
 */
export async function getGoogleAuthUrl(): Promise<string> {
  try {
    const response = await fetch("/api/school-lms/google/auth-url");

    if (!response.ok) {
      throw new Error(`Failed to get Google auth URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error("Error getting Google auth URL:", error);
    throw new Error("Failed to get Google authentication URL");
  }
}

/**
 * Client-side function to initiate Google OAuth flow
 */
export async function initiateGoogleAuth(): Promise<void> {
  try {
    const authUrl = await getGoogleAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error("Error initiating Google auth:", error);
    throw error;
  }
}

/**
 * Get Google Classroom API client for a user
 */
export async function getGoogleClassroomClient(userId: string) {
  const storedTokens = await getOAuthTokens(userId, 'google');
  
  if (!storedTokens) {
    throw new Error('No Google OAuth tokens found for user');
  }
  
  if (areTokensExpired(storedTokens)) {
    throw new Error('Google OAuth tokens have expired');
  }
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  
  oauth2Client.setCredentials({
    access_token: storedTokens.access_token,
    refresh_token: storedTokens.refresh_token,
    token_type: storedTokens.token_type,
    expiry_date: storedTokens.expires_at?.getTime(),
    scope: storedTokens.scope || undefined,
  });
  
  return google.classroom({ version: 'v1', auth: oauth2Client });
}