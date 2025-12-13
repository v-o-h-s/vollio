import { ApiBuilder } from "./types";
import {
  CallbackResponse,
  CheckTokenStatusResponse,
  ConnectionStatus,
  CourseContent,
  CourseListResponse,
  CourseWithContent,
  DisconnectResponse,
  GetConnectionStatusResponse,
  GetCoursesWithContentResponse,
  RefreshTokenResponse,
  TokenStatus,
} from "@/lib/types/server-respones/classroomRouteResponses";
import {
  GetCourseContentResponse,
  ListCoursesResponse,
} from "@/lib/types/server-respones/classroomRouteResponses";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const googleClassroomEndpoints = (builder: ApiBuilder) => ({
  // 1. Connect to Google Classroom (OAuth)
  connectGoogleClassroom: builder.mutation<void, void>({
    query: () => ({
      url: "/integrations/lms/google-classroom/connect",
      method: "GET",
    }),
  }),



  // 3. Refresh Access Token
  refreshGoogleClassroomToken: builder.mutation<RefreshTokenResponse, void>({
    query: () => ({
      url: "/integrations/lms/google-classroom/refresh",
      method: "GET",
    }),
    invalidatesTags: [{ type: "GoogleClassroom", id: "TOKEN_STATUS" }],
  }),



  // 5. Disconnect from Google Classroom
  disconnectGoogleClassroom: builder.mutation<DisconnectResponse, void>({
    query: () => ({
      url: "/integrations/lms/google-classroom/disconnect",
      method: "DELETE",
    }),
    invalidatesTags: [
      { type: "GoogleClassroom", id: "TOKEN_STATUS" },
      { type: "GoogleClassroom", id: "COURSES" },
    ],
  }),



  // 6. Get Connection Status
  getGoogleClassroomConnectionStatus: builder.query<GetConnectionStatusResponse, void>({
    query: () => ({
      url: "/integrations/lms/google-classroom/status",
      method: "GET",
    }),
    providesTags: [{ type: "GoogleClassroom", id: "CONNECTION_STATUS" }],
  }),

  // 7. List Courses (lightweight, without content)
  getGoogleClassroomCoursesList: builder.query<ListCoursesResponse, void>({
    query: () => ({
      url: "/integrations/lms/google-classroom/courses/list",
      method: "GET",
    }),
    providesTags: [{ type: "GoogleClassroom", id: "COURSES" }],
  }),

  // 8. Get Courses with Content (deprecated, uses Promise.all)
  getGoogleClassroomCoursesWithContent: builder.query<GetCoursesWithContentResponse, void>({
    query: () => ({
      url: "/integrations/lms/google-classroom/courses",
      method: "GET",
    }),
    providesTags: [{ type: "GoogleClassroom", id: "COURSES_CONTENT" }],
  }),



  // 10. Get Course Content by Course ID
  getGoogleClassroomCourseContent: builder.query<GetCourseContentResponse, string>({
    query: (courseId) => ({
      url: `/integrations/lms/google-classroom/courses/${courseId}/content`,
      method: "GET",
    }),
    providesTags: (_result, _error, courseId) => [
      { type: "GoogleClassroom", id: courseId },
    ],
  }),
});
