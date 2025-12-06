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

export const googleClassroomEndpoints = (builder: ApiBuilder) => ({
  // 1. Connect to Google Classroom (OAuth)
  connectGoogleClassroom: builder.mutation<void, void>({
    query: () => ({
      url: "v1/integrations/lms/google-classroom/connect",
      method: "GET",
    }),
  }),



  // 4. Check Token Status
  checkGoogleClassroomTokenStatus: builder.query<CheckTokenStatusResponse, void>({
    query: () => ({
      url: "v1/integrations/lms/google-classroom/check",
      method: "GET",
    }),
    providesTags: [{ type: "GoogleClassroom", id: "TOKEN_STATUS" }],
  }),

  // 5. Disconnect from Google Classroom
  disconnectGoogleClassroom: builder.mutation<DisconnectResponse, void>({
    query: () => ({
      url: "v1/integrations/lms/google-classroom/disconnect",
      method: "DELETE",
    }),
    invalidatesTags: [
      { type: "GoogleClassroom", id: "TOKEN_STATUS" },
      { type: "GoogleClassroom", id: "COURSES" },
    ],
  }),



  // 7. List Courses (lightweight, without content)
  getGoogleClassroomCoursesList: builder.query<ListCoursesResponse, void>({
    query: () => ({
      url: "v1/integrations/lms/google-classroom/courses/list",
      method: "GET",
    }),
    providesTags: [{ type: "GoogleClassroom", id: "COURSES" }],
  }),



  // 9. Get Course Content by Course ID
  getGoogleClassroomCourseContent: builder.query<GetCourseContentResponse, string>({
    query: (courseId) => ({
      url: `v1/integrations/lms/google-classroom/courses/${courseId}/content`,
      method: "GET",
    }),
    providesTags: (_result, _error, courseId) => [
      { type: "GoogleClassroom", id: courseId },
    ],
  }),
});
