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
import { aiEndpoints } from "./endpoints/aiEndpoints";
import { settingsEndpoints } from "./endpoints/settingsEndpoints";

// Simple base query configuration with cookie-based authentication
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api/v1/",
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
      endpoint !== "generateSummary"
    ) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

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
    ...aiEndpoints(builder),
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

  useConnectGoogleClassroomMutation,
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
  useGetDocumentFromGoogleDriveQuery,
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
  useExplainTextQuery,
  useLazyExplainTextQuery,
  useAssistantChatMutation,

  // settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
