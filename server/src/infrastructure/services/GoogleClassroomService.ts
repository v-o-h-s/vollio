import "dotenv/config";
import qs from "querystring";
import { randomBytes } from "crypto";
import { IGoogleClassroomService } from "../../domain/services/IGoogleClassroomService";
import {
  GoogleOAuthTokenResponse,
  GoogleOAuthRawResponse,
} from "../../shared/types/lms";
import { ServerError } from "../../shared/errors/ServerError";

export class GoogleClassroomService implements IGoogleClassroomService {
  private clientId = process.env.GOOGLE_CLIENT_ID!;
  private redirectUri =
    process.env.GOOGLE_CLASSROOM_REDIRECT_URI! ||
    "http://localhost:3000/api/v1/integrations/lms/google-classroom/callback";
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  private scopes = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  getOAuthUrl(): { url: string; state: string } {
    // Generate a cryptographically secure random state for CSRF protection
    const state = randomBytes(32).toString("hex");

    const params = qs.stringify({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: this.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state, // Include state parameter for CSRF protection
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      state,
    };
  }
  async exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokenResponse> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = (await res.json()) as GoogleOAuthTokenResponse;
    if (!res.ok)
      throw new ServerError(
        `Google token exchange failed: ${JSON.stringify(data)}`
      );
    return data;
  }
  async refreshAccessToken(
    refreshToken: string
  ): Promise<GoogleOAuthTokenResponse> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
      }),
    });

    const data = (await res.json()) as GoogleOAuthRawResponse;

    if (!res.ok || "error" in data) {
      if ("error" in data && data.error === "invalid_grant") {
        // refresh token is dead — user must reconnect Google Classroom
        throw new ServerError("Google refresh token expired or revoked.");
      }

      throw new ServerError(
        `Google token refresh failed: ${JSON.stringify(data)}`
      );
    }

    // Calculate token expiry timestamp
    const tokenExpiry = new Date(
      Date.now() + data.expires_in * 1000
    ).toISOString();

    // refresh_token is usually NOT returned again
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: refreshToken, // keep the old one
      scope: data.scope,
      token_type: data.token_type,
      token_expiry: tokenExpiry,
    };
  }
  async getCourses(accessToken: string): Promise<any> {
    const res = await fetch("https://classroom.googleapis.com/v1/courses", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const data = await res.json() as any;

    if (!res.ok) {
      throw new ServerError(
        `Failed to fetch Google Classroom courses: ${JSON.stringify(data)}`
      );
    }

    return data.courses ?? [];
  }
}
