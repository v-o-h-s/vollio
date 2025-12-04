import { GoogleOAuthTokenResponse } from "../../shared/types/lms";

export interface IGoogleClassroomService {
  getOAuthUrl(): string;
  exchangeCode(code: string): Promise<GoogleOAuthTokenResponse>;
}
