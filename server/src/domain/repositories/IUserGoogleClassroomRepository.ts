import { GoogleOAuthTokenResponse } from "../../shared/types/lms";

export interface IUserGoogleClassroomRepository {
  saveTokens(tokens: GoogleOAuthTokenResponse): Promise<void>;
  updateTokens(tokens: Partial<GoogleOAuthTokenResponse>): Promise<void>;
  getTokens(): Promise<GoogleOAuthTokenResponse | null>;
  deleteTokens(): Promise<void>;
  isTokenValid(): Promise<boolean>;
}
