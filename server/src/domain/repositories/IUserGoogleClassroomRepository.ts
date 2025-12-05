import { GoogleOAuthTokenResponse } from "../../shared/types/lms";

export interface IUserGoogleClassroomRepository {
  saveTokens(tokens: GoogleOAuthTokenResponse): Promise<void>;
  getTokens(): Promise<GoogleOAuthTokenResponse | null>;
}
