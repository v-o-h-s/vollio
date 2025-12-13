/**
 * RTK Query API slice for annotation and PDF management
 * Simplified version using basic fetchBaseQuery without custom error handling
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { annotationEndpoints } from "./endpoints/annotationEndpoints";
import { folderEndpoints } from "./endpoints/folderEndpoints";
import { highlightEndpoints } from "./endpoints/highlightEndpoints";
import { notesEndpoints } from "./endpoints/notesEndpoints";
import { pdfEndpoints } from "./endpoints/pdfEndpoints";
import { summaryEndpoints } from "./endpoints/summaryEndpoints";
import { googleClassroomEndpoints } from "./endpoints/googleClassroomEndpoints";
import { fileEndpoints } from "./endpoints/fileEndpoint";
import { testEndpoints } from "./endpoints/testEndpoints";

// Simple base query configuration with cookie-based authentication
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api/v1/",
  timeout: 30000, // 30 second timeout
  credentials: 'include', // Include cookies for Supabase authentication
  prepareHeaders: (headers, { endpoint }) => {
    // Don't set Content-Type for FormData uploads (let browser set it with boundary)
    // fasity does not like it when you send him post like request without body
    if (endpoint !== "uploadPDF" && endpoint !== "uploadFile" ) {
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
    "PDF",
    "Note",
    "Folder",
    "Summary",
    "GoogleClassroom",
    "File",
  ],
  endpoints: (builder) => ({
    ...pdfEndpoints(builder),
    ...notesEndpoints(builder),
    ...annotationEndpoints(builder),
    ...highlightEndpoints(builder),
    ...folderEndpoints(builder),
    ...summaryEndpoints(builder),
    ...googleClassroomEndpoints(builder),
    ...fileEndpoints(builder),
    ...testEndpoints(builder),
  }),
});

// Export hooks for usage in functional components
export const {
  useUploadPDFMutation,
  useGetPDFsQuery,
  useGetPDFQuery,
  useDeletePDFMutation,
  useRenamePDFMutation,
  useMovePDFMutation,
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetAnnotationsQuery,
  useCreateAnnotationMutation,
  useGetHighlightsQuery,
  useGetPDFHighlightsQuery,
  useCreateHighlightMutation,
  useUpdateHighlightMutation,
  useDeleteHighlightMutation,
  useGetAllFoldersQuery,
  useGetFolderByIdQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetSummaryByPdfIdQuery,
  useCreateOrUpdateSummaryMutation,
  useUpdateSummaryMutation,
  useDeleteSummaryMutation,
  useConnectGoogleClassroomMutation,
  useRefreshGoogleClassroomTokenMutation,
  useDisconnectGoogleClassroomMutation,
  useGetGoogleClassroomConnectionStatusQuery,
  useGetGoogleClassroomCoursesListQuery,
  useGetGoogleClassroomCoursesWithContentQuery,
  useGetGoogleClassroomCourseContentQuery,
  useGetAllFilesQuery,
  useGetFileByIdQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
  useRenameFileMutation,
  useMoveFileMutation,
  useGetFileFromGoogleDriveQuery,

  useAddFileFromGoogleDriveMutation,
  useProcessTestMutation,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
