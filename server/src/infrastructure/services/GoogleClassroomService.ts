import qs from "querystring";
import { IGoogleClassroomService } from "../../domain/services/IGoogleClassroomService";
import { GoogleOAuthTokenResponse } from "../../shared/types/lms";
import { ServerError } from "../../shared/errors/ServerError";

export class GoogleClassroomService implements IGoogleClassroomService {
  private clientId = process.env.GOOGLE_CLIENT_ID!;
  private redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  private scopes = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ];
  getOAuthUrl(): string {
    const params = qs.stringify({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: this.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  async exchangeCode(code: string): Promise<GoogleOAuthTokenResponse> {
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
}
