///////////////////////////////////////////////////
// google
////////////////////////////////////////////////////

export interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_expiry: string;
  token_type: string;
}

// Error response from Google OAuth API
export interface GoogleOAuthErrorResponse {
  error: string;
  error_description?: string;
}

// Raw response from Google token endpoint (before we add token_expiry)
export type GoogleOAuthRawResponse =
  | Omit<GoogleOAuthTokenResponse, "token_expiry">
  | GoogleOAuthErrorResponse;


export interface ClassroomCourse {
  id?: string;
  name?: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED" | "SUSPENDED";
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  guardiansEnabled?: boolean;
  calendarId?: string;
  gradebookSettings?: {
    calculationType?: "TOTAL_POINTS" | "WEIGHTED_BY_CATEGORY";
    displaySetting?: "SHOW_OVERALL_GRADE" | "HIDE_OVERALL_GRADE";
  };
}

export interface ClassroomCourseResponse {
  id: string;
  name: string;
  updateTime: string;
  courseState: string;
  alternateLink: string;
}