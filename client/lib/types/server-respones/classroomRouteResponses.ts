/**
 * Google Classroom API Response Types
 * Based on `/api/v1/integrations/lms/google-classroom` endpoints
 */

// ============================================================================
// Enums
// ============================================================================

export enum CourseState {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  PROVISIONED = "PROVISIONED",
  DECLINED = "DECLINED",
  SUSPENDED = "SUSPENDED",
}

export enum AnnouncementState {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
  DELETED = "DELETED",
}

export enum CourseWorkState {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
  DELETED = "DELETED",
}

// ============================================================================
// Base Types
// ============================================================================

export interface DriveFile {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

export interface CourseListResponse {
  id: string;
  name: string;
  updateTime: string; // ISO 8601
  courseState: CourseState;
  alternateLink?: string;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  state: AnnouncementState;
  alternateLink: string;
  updatedAt: string; // ISO 8601
  materials: {
    driveFiles: DriveFile[];
  };
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title?: string;
  state: CourseWorkState;
  alternateLink: string;
  updatedAt: string; // ISO 8601
  materials: {
    driveFiles: DriveFile[];
  };
}

export interface CourseContent {
  announcements: ClassroomAnnouncement[];
  materials: ClassroomCourseWork[];
}

export interface CourseWithContent extends CourseListResponse {
  content: CourseContent;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

// ============================================================================
// Endpoint Response Types
// ============================================================================

// 1. Connect
// No response body - 302 redirect to Google OAuth

// 2. Callback
export type CallbackResponse = ApiResponse<null>;

// 3. Refresh Token
export type RefreshTokenResponse = ApiResponse<null>;

// 4. Check Token Status
export interface TokenStatus {
  isValid: boolean;
}

export type CheckTokenStatusResponse = ApiResponse<TokenStatus>;

// 5. Disconnect
export type DisconnectResponse = ApiResponse<null>;

// 6. Get Connection Status
export interface ConnectionStatus {
  isConnected: boolean;
}

export type GetConnectionStatusResponse = ApiResponse<ConnectionStatus>;

// 7. List Courses
export type ListCoursesResponse = ApiResponse<CourseListResponse[]>;

// 8. Get Courses with Content
export type GetCoursesWithContentResponse = ApiResponse<CourseWithContent[]>;

// 9. Get Course Content
export type GetCourseContentResponse = ApiResponse<CourseContent>;

// ============================================================================
// Error Response Types
// ============================================================================

export interface UnauthorizedError {
  success: false;
  message: "User not authenticated";
  data: null;
  error: "Unauthorized";
}

export interface CsrfValidationError {
  success: false;
  message: "Invalid state parameter - possible CSRF attack detected";
  data: null;
  error: "CSRF validation failed";
}

export type GoogleClassroomErrorResponse = UnauthorizedError | CsrfValidationError;

// ============================================================================
// Utility Types
// ============================================================================

export interface GoogleClassroomRequest {
  courseId?: string;
  code?: string;
  state?: string;
}
