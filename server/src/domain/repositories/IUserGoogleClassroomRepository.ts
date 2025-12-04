import { GoogleOAuthTokenResponse } from "../../shared/types/lms";

export interface IUserGoogleClassroomRepository {
  saveTokens(userId: string, tokens: GoogleOAuthTokenResponse): Promise<void>;
  getTokens(userId: string): Promise<GoogleOAuthTokenResponse | null>;
}
