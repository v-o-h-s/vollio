import type {
  BatchImportResponse,
  ImportFileRequest,
  LMSConnectionResponse,
  LMSConnectionStatusResponse,
  LMSCourseMaterialsResponse,
  LMSCoursesResponse,
  LMSImportResponse,
  LMSProvider,
  LMSTokenStatusResponse,
} from "../../types";
import type { ApiBuilder } from "./types";

export const lmsEndpoints = (builder: ApiBuilder) => ({
  getLMSProviders: builder.query<LMSProvider[], void>({
    query: () => "school-lms/providers",
    transformResponse: (response: any) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch LMS providers");
      }
      return response.data.providers;
    },
    providesTags: [{ type: "LMS", id: "PROVIDERS" }],
  }),

  checkLMSConnection: builder.query<LMSTokenStatusResponse, string>({
    query: (provider) => `school-lms/${provider}/tokens`,
    transformResponse: (response: LMSTokenStatusResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to check LMS connection");
      }
      return response;
    },
    providesTags: (_result, _error, provider) => [
      { type: "LMS", id: `CONNECTION_${provider.toUpperCase()}` },
    ],
  }),

  connectToLMS: builder.mutation<LMSConnectionResponse, string>({
    query: (provider) => ({
      url: `school-lms/${provider}/auth-url`,
      method: "GET",
    }),
    transformResponse: (response: LMSConnectionResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to get LMS connection URL");
      }
      return response;
    },
    invalidatesTags: (_result, _error, provider) => [
      { type: "LMS", id: `CONNECTION_${provider.toUpperCase()}` },
    ],
  }),

  getLMSCourses: builder.query<LMSCoursesResponse, string>({
    query: (provider) => `school-lms/${provider}/courses`,
    transformResponse: (response: LMSCoursesResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch LMS courses");
      }
      return response;
    },
    providesTags: (result, _error, provider) => [
      { type: "LMS", id: `COURSES_${provider.toUpperCase()}` },
      ...(result?.courses?.map((course) => ({
        type: "LMS" as const,
        id: `COURSE_${course.id}`,
      })) || []),
    ],
  }),

  getLMSCourseMaterials: builder.query<
    LMSCourseMaterialsResponse,
    { provider: string; courseId: string }
  >({
    query: ({ provider, courseId }) =>
      `school-lms/${provider}/course-materials?courseId=${courseId}`,
    transformResponse: (response: LMSCourseMaterialsResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch course materials");
      }
      return response;
    },
    providesTags: (result, _error, { provider, courseId }) => [
      { type: "LMS", id: `MATERIALS_${provider.toUpperCase()}_${courseId}` },
      ...(result?.materials?.map((material) => ({
        type: "LMS" as const,
        id: `MATERIAL_${material.id}`,
      })) || []),
    ],
  }),

  importLMSFile: builder.mutation<
    LMSImportResponse,
    { provider: string; fileId: string; fileName: string; folderId?: string }
  >({
    query: ({ provider, ...data }) => ({
      url: `school-lms/${provider}/import-file`,
      method: "POST",
      body: data,
    }),
    transformResponse: (response: LMSImportResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to import file from LMS");
      }
      return response;
    },
    invalidatesTags: [
      { type: "PDF", id: "LIST" },
      { type: "Folder", id: "LIST" },
    ],
  }),

  batchImportLMSFiles: builder.mutation<
    BatchImportResponse,
    { provider: string; files: ImportFileRequest[] }
  >({
    query: ({ provider, files }) => ({
      url: `school-lms/${provider}/batch-import`,
      method: "POST",
      body: { files },
    }),
    transformResponse: (response: BatchImportResponse) => {
      if (!response.success) {
        throw new Error("Failed to batch import files from LMS");
      }
      return response;
    },
    invalidatesTags: [
      { type: "PDF", id: "LIST" },
      { type: "Folder", id: "LIST" },
    ],
  }),

  disconnectLMS: builder.mutation<{ success: boolean }, string>({
    query: (provider) => ({
      url: `school-lms/${provider}/disconnect`,
      method: "DELETE",
    }),
    transformResponse: (response: any) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to disconnect from LMS");
      }
      return response;
    },
    invalidatesTags: (_result, _error, provider) => [
      { type: "LMS", id: `CONNECTION_${provider.toUpperCase()}` },
      { type: "LMS", id: `COURSES_${provider.toUpperCase()}` },
    ],
  }),

  getLMSConnectionStatus: builder.query<
    LMSConnectionStatusResponse,
    string
  >({
    query: (provider) => `school-lms/${provider}/status`,
    transformResponse: (response: LMSConnectionStatusResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to get LMS connection status");
      }
      return response;
    },
    providesTags: (_result, _error, provider) => [
      { type: "LMS", id: `STATUS_${provider.toUpperCase()}` },
    ],
  }),

  importLMSContent: builder.mutation<
    LMSImportResponse,
    {
      provider: string;
      courseId: string;
      contentType: string;
      contentId: string;
    }
  >({
    query: ({ provider, courseId, contentType, contentId }) => ({
      url: `school-lms/${provider}/import`,
      method: "POST",
      body: { courseId, contentType, contentId },
    }),
    transformResponse: (response: LMSImportResponse) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to import LMS content");
      }
      return response;
    },
    invalidatesTags: [
      { type: "PDF", id: "LIST" },
      { type: "Folder", id: "LIST" },
    ],
  }),
});

