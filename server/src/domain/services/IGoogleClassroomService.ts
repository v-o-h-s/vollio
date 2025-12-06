import { GoogleOAuthTokenResponse } from "../../shared/types/lms/classroom";

export interface IGoogleClassroomService {
  getOAuthUrl(): { url: string; state: string };
  exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokenResponse>;
  refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokenResponse>;
  getCourses(accessToken: string): Promise<any>;
  getCourseWorkMaterialsByCourseId(
    accessToken: string,
    courseId: string
  ): Promise<any[]>;
  getAnnouncementsByCourseId(
    accessToken: string,
    courseId: string
  ): Promise<any[]>;
}
