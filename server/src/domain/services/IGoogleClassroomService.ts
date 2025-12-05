import { GoogleOAuthTokenResponse } from "../../shared/types/lms";

export interface IGoogleClassroomService {
  getOAuthUrl(): { url: string; state: string };
  exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokenResponse>;
  refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokenResponse>;
}
