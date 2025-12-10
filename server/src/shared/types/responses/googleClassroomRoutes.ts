import { ServerSuccessResponse } from "./general";
import {
  CourseListResponse,
  ClassroomAnnouncementResponse,
  ClassroomCourseWorkResponse,
} from "../lms/classroom";

// POST /api/v1/integrations/lms/google-classroom/callback
export type ConnectCallbackResponse = ServerSuccessResponse<null>;

// POST /api/v1/integrations/lms/google-classroom/refresh-token
export type RefreshAccessTokenResponse = ServerSuccessResponse<null>;

// GET /api/v1/integrations/lms/google-classroom/check-token
export type CheckTokenStatusResponse = ServerSuccessResponse<{
    isValid: boolean;
}>;

// POST /api/v1/integrations/lms/google-classroom/disconnect
export type DisconnectResponse = ServerSuccessResponse<null>;

// GET /api/v1/integrations/lms/google-classroom/connection-status
export type GetConnectionStatusResponse = ServerSuccessResponse<{
    isConnected: boolean;
}>;

// GET /api/v1/integrations/lms/google-classroom/courses
export type GetCoursesResponse = ServerSuccessResponse<CourseListResponse[]>;

// GET /api/v1/integrations/lms/google-classroom/courses-with-content
export type GetCoursesWithContentResponse = ServerSuccessResponse<CourseListResponse[]>;

// GET /api/v1/integrations/lms/google-classroom/courses/:courseId/content
export type GetCourseContentResponse = ServerSuccessResponse<{
  announcements: ClassroomAnnouncementResponse[];
  materials: ClassroomCourseWorkResponse[];
}>;
