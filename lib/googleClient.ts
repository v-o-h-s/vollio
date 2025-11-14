import { google } from "googleapis";
import { getValidOAuthTokens } from '@/lib/services/school-lms/oauth-token-service';

// Client-side Google Auth utilities
// Note: Server-side Google Auth logic is in /app/api/google/ routes

/**
 * @deprecated Use lib/school-lms/google-client.ts instead
 * Client-side function to get Google Auth URL
 * Calls the server-side API to generate the auth URL
 */
export async function getGoogleAuthUrl(): Promise<string> {
  console.warn('getGoogleAuthUrl is deprecated. Use lib/school-lms/google-client.ts instead');
  try {
    const response = await fetch("/api/school-lms/google/auth-url");

    if (!response.ok) {
      throw new Error(`Failed to get auth URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error("Error getting Google auth URL:", error);
    throw new Error("Failed to get Google authentication URL");
  }
}

/**
 * @deprecated Use lib/school-lms/google-client.ts instead
 * Client-side function to initiate Google OAuth flow
 * Redirects the user to Google's OAuth consent screen
 */
export async function initiateGoogleAuth(): Promise<void> {
  console.warn('initiateGoogleAuth is deprecated. Use lib/school-lms/google-client.ts instead');
  try {
    const authUrl = await getGoogleAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error("Error initiating Google auth:", error);
    throw error;
  }
}

// Server-side Google Auth utilities

/**
 * Create authenticated Google OAuth2 client for a user
 */
export async function getAuthenticatedGoogleClient(userId: string) {
  // Get valid tokens (automatically refreshes if needed)
  const storedTokens = await getValidOAuthTokens(userId, 'google');
  
  if (!storedTokens) {
    throw new Error('No valid Google OAuth tokens found for user. Please re-authenticate.');
  }
  
  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  
  // Set credentials
  oauth2Client.setCredentials({
    access_token: storedTokens.access_token,
    refresh_token: storedTokens.refresh_token,
    token_type: storedTokens.token_type,
    expiry_date: storedTokens.expires_at?.getTime(),
    scope: storedTokens.scope || undefined,
  });
  
  return oauth2Client;
}

/**
 * Get Google Classroom API client for a user
 */
export async function getGoogleClassroomClient(userId: string) {
  const auth = await getAuthenticatedGoogleClient(userId);
  return google.classroom({ version: 'v1', auth });
}

/**
 * Get Google Drive API client for a user
 */
export async function getGoogleDriveClient(userId: string) {
  const auth = await getAuthenticatedGoogleClient(userId);
  return google.drive({ version: 'v3', auth });
}

/**
 * Get Google OAuth2 client for a user (for profile and token operations)
 */
export async function getGoogleOAuth2Client(userId: string) {
  return await getAuthenticatedGoogleClient(userId);
}

/**
 * Get Google People API client for a user
 */
export async function getGooglePeopleClient(userId: string) {
  const auth = await getAuthenticatedGoogleClient(userId);
  return google.people({ version: 'v1', auth });
}

/**
 * Get Google Sheets API client for a user
 */
export async function getGoogleSheetsClient(userId: string) {
  const auth = await getAuthenticatedGoogleClient(userId);
  return google.sheets({ version: 'v4', auth });
}

/**
 * Get Google Docs API client for a user
 */
export async function getGoogleDocsClient(userId: string) {
  const auth = await getAuthenticatedGoogleClient(userId);
  return google.docs({ version: 'v1', auth });
}