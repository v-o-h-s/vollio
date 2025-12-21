import { ServerSuccessResponse } from "./general";
import {
  CourseListResponse,
  ClassroomAnnouncementResponse,
  ClassroomCourseWorkResponse,
  CourseContent,
  CourseWithContent,
} from "../lms/classroom";

// Payload types (useful for client-side state/props)
export interface TokenStatus {
  isValid: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
}

// POST /api/v1/integrations/lms/google-classroom/callback
export type ConnectCallbackResponse = ServerSuccessResponse<null>;

// POST /api/v1/integrations/lms/google-classroom/refresh-token
export type RefreshAccessTokenResponse = ServerSuccessResponse<null>;

// GET /api/v1/integrations/lms/google-classroom/check-token
export type CheckTokenStatusResponse = ServerSuccessResponse<TokenStatus>;

// POST /api/v1/integrations/lms/google-classroom/disconnect
export type DisconnectResponse = ServerSuccessResponse<null>;

// GET /api/v1/integrations/lms/google-classroom/connection-status
export type GetConnectionStatusResponse =
  ServerSuccessResponse<ConnectionStatus>;

// GET /api/v1/integrations/lms/google-classroom/courses
export type GetCoursesResponse = ServerSuccessResponse<CourseListResponse[]>;

// GET /api/v1/integrations/lms/google-classroom/courses-with-content
export type GetCoursesWithContentResponse = ServerSuccessResponse<
  CourseWithContent[]
>;

// GET /api/v1/integrations/lms/google-classroom/courses/:courseId/content
export type GetCourseContentResponse = ServerSuccessResponse<CourseContent>;
