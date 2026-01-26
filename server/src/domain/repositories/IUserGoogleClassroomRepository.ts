import { GoogleOAuthTokenResponse } from "@vollio/shared";

export interface IUserGoogleClassroomRepository {
  saveTokens(tokens: GoogleOAuthTokenResponse): Promise<void>;
  updateTokens(tokens: Partial<GoogleOAuthTokenResponse>): Promise<void>;
  getTokens(userId?: string): Promise<GoogleOAuthTokenResponse | null>;
  deleteTokens(): Promise<void>;
  isTokenValid(userId?: string): Promise<boolean>;
}
