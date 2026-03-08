/**
 * RTK Query API slice for annotation and Document management
 * Simplified version using basic fetchBaseQuery without custom error handling
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { annotationEndpoints } from "./endpoints/annotationEndpoints";
import { folderEndpoints } from "./endpoints/folderEndpoints";
import { highlightEndpoints } from "./endpoints/highlightEndpoints";
import { notesEndpoints } from "./endpoints/notesEndpoints";
import { googleClassroomEndpoints } from "./endpoints/googleClassroomEndpoints";
import { documentEndpoints } from "./endpoints/documentEndpoint";
import { testEndpoints } from "./endpoints/testEndpoints";
import { quizEndpoints } from "./endpoints/quizEndpoints";
import { flashcardEndpoints } from "./endpoints/flashcardEndpoints";
import { assistantEndpoints } from "./endpoints/assistantEndpoints";
import { settingsEndpoints } from "./endpoints/settingsEndpoints";

import * as Sentry from "@sentry/nextjs";
import { ErrorName } from "@/lib/shared";

// Simple base query configuration with cookie-based authentication
const rawBaseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NODE_ENV === "production"
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/`
      : "http://localhost:3000/api/v1/",
  timeout: 30000, // 30 second timeout
  credentials: "include", // Include cookies for Supabase authentication
  prepareHeaders: (headers, { endpoint }) => {
    // Don't set Content-Type for FormData uploads (let browser set it with boundary)
    // fasity does not like it when you send him post like request without body
    if (
      endpoint !== "uploadDocument" &&
      endpoint !== "uploadDocument" &&
      endpoint !== "deleteDocument" &&
      endpoint !== "deleteFolder" &&
      endpoint !== "deleteNote" &&
      endpoint !== "deleteHighlight" &&
      endpoint !== "deleteHighlightsByTag" &&
      endpoint !== "generateSummary" &&
      endpoint !== "deleteQuiz" &&
      endpoint !== "deleteFlashCardsSet"
    ) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

// Wrap baseQuery with Sentry error reporting
const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const serverError = result.error.data as any;
    const errorName = serverError?.error?.name || serverError?.name;

    // Errors we NEVER want to show in Sentry (Expected business logic)
    const SILENT_ERRORS: (string | undefined)[] = [
      ErrorName.QuotaExceededError,
      ErrorName.RateLimitingError,
      ErrorName.AuthError,
      ErrorName.NotFoundError,
      ErrorName.ConflictError,
      "AbortError", // Common when users navigate away
    ];

    const isNetworkError =
      status === "FETCH_ERROR" || status === "TIMEOUT_ERROR";
    const isServerError = typeof status === "number" && status >= 500;

    // We report:
    // 1. All Server Errors (500+)
    // 2. All Network/Timeout errors
    // 3. Client errors (400) that are NOT in our "Silent" whitelist
    const shouldReport =
      isServerError ||
      isNetworkError ||
      (!SILENT_ERRORS.includes(errorName) &&
        typeof status === "number" &&
        status >= 400);

    if (shouldReport) {
      Sentry.captureException(result.error, {
        extra: {
          path: typeof args === "string" ? args : args.url,
          method: typeof args === "string" ? "GET" : args.method,
          api_endpoint: api.endpoint,
          server_error_name: errorName,
        },
        tags: {
          error_type: isNetworkError ? "network" : "api_error",
          status: status.toString(),
          endpoint: api.endpoint,
        },
      });
    }
  }

  return result;
};

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Annotation",
    "Highlight",
    "Note",
    "Folder",
    "GoogleClassroom",
    "Document",
    "Quiz",
    "Flashcard",
    "Settings",
  ],
  endpoints: (builder) => ({
    ...notesEndpoints(builder),
    ...annotationEndpoints(builder),
    ...highlightEndpoints(builder),
    ...folderEndpoints(builder),
    ...googleClassroomEndpoints(builder),
    ...documentEndpoints(builder),
    ...testEndpoints(builder),
    ...quizEndpoints(builder),
    ...flashcardEndpoints(builder),
    ...assistantEndpoints(builder),
    ...settingsEndpoints(builder),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetAnnotationsQuery,
  useCreateAnnotationMutation,
  useGetHighlightsQuery,
  useGetDocumentHighlightsQuery,
  useCreateHighlightMutation,
  useUpdateHighlightMutation,
  useDeleteHighlightMutation,
  useCountHighlightsByTagQuery,
  useLazyCountHighlightsByTagQuery,
  useDeleteHighlightsByTagMutation,
  useGetAllFoldersQuery,
  useGetFolderByIdQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGenerateSummaryMutation,

  useRefreshGoogleClassroomTokenMutation,
  useDisconnectGoogleClassroomMutation,
  useGetGoogleClassroomConnectionStatusQuery,
  useGetGoogleClassroomCoursesListQuery,
  useGetGoogleClassroomCoursesWithContentQuery,
  useGetGoogleClassroomCourseContentQuery,
  useGetAllDocumentsQuery,
  useGetDocumentByIdQuery,
  useGenerateUploadUrlMutation,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useRenameDocumentMutation,
  useMoveDocumentMutation,
  useAddDocumentFromGoogleDriveMutation,
  useProcessTestMutation,
  //quizzes
  useGetAllQuizzesQuery,
  useGetQuizQuery,
  useCreateQuizMutation,
  useDeleteQuizMutation,
  //flashcards
  useGetAllFlashCardsSetsQuery,
  useGetFlashCardsSetQuery,
  useGetFlashCardsSetsByDocumentIdQuery,
  useCreateFlashCardsSetMutation,
  useGenerateFlashCardsSetMutation,
  useDeleteFlashCardsSetMutation,

  //ai
  useAssistantChatMutation,

  // settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
