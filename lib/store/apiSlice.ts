/**
 * RTK Query API slice for annotation and PDF management with comprehensive error handling
 */

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import {
  Annotation,
  Highlight,
  TextBounds,
  PDFDocument,
  UserActivity,
  Note,
  SupabaseUploadResponse,
  SupabasePDFListResponse,
  SupabasePDFAccessResponse,
  SupabaseNotesResponse,
  SupabaseNoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  DocumentProcessingRequest,
  DocumentProcessingResponse,
  ProcessingStatusResponse,
  Quiz,
  QuizQuestion,
  QuizAttempt,
} from "../types/";
import { AppError, ErrorType } from "../types/errors";
import {
  createAppError,
  mapErrorToAppError,
  withRetry,
  createUploadErrorContext,
  createNetworkErrorContext,
  logError,
} from "../utils/error-handling";
import { pdfNotifications } from "../utils/notifications";


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Enhanced base query with error handling and retry logic
const baseQueryWithRetry: BaseQueryFn = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: "/api",
    timeout: 30000, // 30 second timeout
    prepareHeaders: (headers, { endpoint }) => {
      // Don't set Content-Type for FormData uploads (let browser set it with boundary)
      if (endpoint !== "uploadPDF") {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  });

  // Extract request details for error context
  const url = typeof args === "string" ? args : args.url;
  const method = typeof args === "string" ? "GET" : args.method || "GET";

  try {
    const result = await withRetry(
      async () => await baseQuery(args, api, extraOptions),
      {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 10000,
        retryableErrors: [
          ErrorType.NETWORK_ERROR,
          ErrorType.TIMEOUT_ERROR,
          ErrorType.CONNECTION_ERROR,
          ErrorType.INTERNAL_SERVER_ERROR,
          ErrorType.SERVICE_UNAVAILABLE,
        ],
      },
      createNetworkErrorContext(url, method)
    );

    // Handle successful response
    if (result.error) {
      const appError = mapErrorToAppError(
        result.error,
        createNetworkErrorContext(url, method)
      );
      logError(appError);
      return { error: appError };
    }

    return result;
  } catch (error) {
    const appError = mapErrorToAppError(
      error,
      createNetworkErrorContext(url, method)
    );
    logError(appError);
    return { error: appError };
  }
};

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    "Annotation",
    "Highlight",
    "PDF",
    "Note",
    "Quiz",
    "ProcessingStatus",
  ],
  endpoints: (builder) => ({
    // PDF endpoints with enhanced error handling
    uploadPDF: builder.mutation<PDFDocument, FormData>({
      query: (formData) => ({
        url: "pdfs/upload",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: SupabaseUploadResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.STORAGE_UPLOAD_FAILED,
            response.error || "Failed to upload PDF",
            { component: "FileUpload", action: "upload" }
          );
        }

        // Transform Supabase response to PDFDocument format
        const data = response.data;
        return {
          id: data.id,
          userId: "", // Not provided by server due to RLS - will be populated by component
          filename: data.filename,
          fileSize: data.fileSize,
          storagePath: data.storagePath,
          mimeType: "application/pdf",
          uploadedAt: data.uploadedAt, // Keep as ISO string
          updatedAt: data.uploadedAt, // Keep as ISO string
          fileUrl: data.fileUrl, // the url used to accessed the document in the database
        } as PDFDocument;
      },
      transformErrorResponse: (response: any, _meta, arg) => {
        // Extract file information for error context
        const file = arg.get("file") as File;
        const fileName = file?.name || "unknown";
        const fileSize = file?.size || 0;
        const fileType = file?.type || "unknown";

        const context = createUploadErrorContext(fileName, fileSize, fileType);

        if (response.status === 413) {
          return createAppError(
            ErrorType.FILE_TOO_LARGE,
            "File too large",
            context
          );
        } else if (response.status === 415) {
          return createAppError(
            ErrorType.INVALID_FILE_TYPE,
            "Invalid file type",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [{ type: "PDF", id: "LIST" }],
      async onQueryStarted(formData, { dispatch, queryFulfilled }) {
        const file = formData.get("file") as File;
        const fileName = file?.name || "PDF";

        try {
          const result = await queryFulfilled;
          pdfNotifications.uploadSuccess(fileName);
        } catch (error: any) {
          const appError = error.error as AppError;
          const message =
            appError?.userMessage ||
            appError?.message ||
            "Failed to upload PDF";
          pdfNotifications.uploadError(message);

          // Log detailed error for debugging
          logError(appError || mapErrorToAppError(error));
        }
      },
    }),

    getPDFs: builder.query<
      {
        pdfs: PDFDocument[];
        recentActivity?: UserActivity & { filename?: string; fileUrl?: string };
        totalCount: number;
      },
      void
    >({
      query: () => "pdfs",
      transformResponse: (response: SupabasePDFListResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch PDFs",
            { component: "PDFList", action: "fetch" }
          );
        }

        const data = response.data;

        // Transform PDF list to PDFDocument format
        const pdfs: PDFDocument[] = data.pdfs.map((pdf) => ({
          id: pdf.id,
          userId: "", // Not provided by server due to RLS - will be populated by component
          filename: pdf.filename,
          fileSize: pdf.fileSize,
          storagePath: "", // Not included in list response
          mimeType: pdf.mimeType,
          uploadedAt: pdf.uploadedAt, // Keep as ISO string
          updatedAt: pdf.uploadedAt, // Keep as ISO string
          fileUrl: pdf.fileUrl,
        }));

        // Transform recent activity if present
        let recentActivity:
          | (UserActivity & { filename?: string; fileUrl?: string })
          | undefined;
        if (data.recentActivity) {
          recentActivity = {
            id: "", // Not provided in response
            userId: "", // Not provided by server due to RLS - will be populated by component
            pdfId: data.recentActivity.pdfId,
            activityType: data.recentActivity.activityType,
            accessedAt: data.recentActivity.accessedAt, // Keep as ISO string
            filename: data.recentActivity.filename,
            fileUrl: data.recentActivity.fileUrl,
          };
        }

        return {
          pdfs,
          recentActivity,
          totalCount: data.totalCount,
        };
      },
      transformErrorResponse: (response: any) => {
        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            { component: "PDFList", action: "fetch" }
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            { component: "PDFList", action: "fetch" }
          );
        }

        return mapErrorToAppError(response, {
          component: "PDFList",
          action: "fetch",
        });
      },
      providesTags: (result) => [
        { type: "PDF", id: "LIST" },
        ...(result?.pdfs.map((pdf) => ({ type: "PDF" as const, id: pdf.id })) ||
          []),
      ],
    }),

    getPDF: builder.query<PDFDocument, string>({
      query: (pdfId) => `pdfs/${pdfId}`,
      transformResponse: (response: SupabasePDFAccessResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.PDF_LOADING_ERROR,
            response.error || "Failed to fetch PDF",
            { component: "PDFViewer", action: "load", pdfId: response.data?.id }
          );
        }

        const data = response.data;
        return {
          id: data.id,
          userId: "", // Not provided by server due to RLS - will be populated by component
          filename: data.filename,
          fileSize: data.fileSize,
          storagePath: "", // Not included in access response
          mimeType: data.mimeType,
          uploadedAt: data.uploadedAt, // Keep as ISO string
          updatedAt: data.uploadedAt, // Keep as ISO string
          fileUrl: data.fileUrl,
        } as PDFDocument;
      },
      transformErrorResponse: (response: any, meta, pdfId) => {
        const context = { component: "PDFViewer", action: "load", pdfId };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "PDF not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (_result, _error, pdfId) => [{ type: "PDF", id: pdfId }],
    }),

    // Delete PDF endpoint with error handling
    deletePDF: builder.mutation<{ success: boolean }, string>({
      query: (pdfId) => ({
        url: `pdfs/${pdfId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to delete PDF",
            { component: "PDFList", action: "delete" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any, meta, pdfId) => {
        const context = { component: "PDFList", action: "delete", pdfId };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "PDF not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (_result, _error, pdfId) => [
        { type: "PDF", id: "LIST" },
        { type: "PDF", id: pdfId },
      ],
      async onQueryStarted(_pdfId, { queryFulfilled }) {
        try {
          await queryFulfilled;
          pdfNotifications.deleteSuccess();
        } catch (error: any) {
          const appError = error.error as AppError;
          const message =
            appError?.userMessage ||
            appError?.message ||
            "Failed to delete PDF";
          pdfNotifications.deleteError(message);

          logError(appError || mapErrorToAppError(error));
        }
      },
    }),

    // Rename PDF endpoint with error handling
    renamePDF: builder.mutation<
      { success: boolean; pdf: PDFDocument },
      { id: string; filename: string }
    >({
      query: ({ id, filename }) => ({
        url: `pdfs/${id}/rename`,
        method: "PUT",
        body: { filename },
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to rename PDF",
            { component: "PDFList", action: "rename" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any, meta, { id }) => {
        const context = { component: "PDFList", action: "rename", pdfId: id };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "PDF not found",
            context
          );
        } else if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid filename",
            context
          );
        } else if (response.status === 409) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "A PDF with this filename already exists",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PDF", id: "LIST" },
        { type: "PDF", id },
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          pdfNotifications.renameSuccess();
        } catch (error: any) {
          const appError = error.error as AppError;
          const message =
            appError?.userMessage ||
            appError?.message ||
            "Failed to rename PDF";
          pdfNotifications.renameError(message);

          logError(appError || mapErrorToAppError(error));
        }
      },
    }),

    // Notes endpoints with error handling
    getNotes: builder.query<
      Note[],
      { pdfAnnotationId?: string; highlightId?: string }
    >({
      query: ({ pdfAnnotationId, highlightId } = {}) => ({
        url: "notes",
        params: {
          ...(pdfAnnotationId && { pdfAnnotationId }),
          ...(highlightId && { highlightId }),
        },
      }),
      transformResponse: (response: SupabaseNotesResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch notes",
            { component: "NotesList", action: "fetch" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            { component: "NotesList", action: "fetch" }
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            { component: "NotesList", action: "fetch" }
          );
        }
        return mapErrorToAppError(response, {
          component: "NotesList",
          action: "fetch",
        });
      },
      providesTags: (result) => [
        { type: "Note", id: "LIST" },
        ...(result?.map((note) => ({ type: "Note" as const, id: note.id })) ||
          []),
      ],
    }),

    getNote: builder.query<Note, string>({
      query: (noteId) => `notes/${noteId}`,
      transformResponse: (response: SupabaseNoteResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch note",
            { component: "NoteEditor", action: "load" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any, meta, noteId) => {
        const context = { component: "NoteEditor", action: "load", noteId };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Note not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result, error, noteId) => [{ type: "Note", id: noteId }],
    }),

    createNote: builder.mutation<Note, CreateNoteRequest>({
      query: (noteData) => ({
        url: "notes",
        method: "POST",
        body: noteData,
      }),
      transformResponse: (response: SupabaseNoteResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to create note",
            { component: "NoteEditor", action: "create" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "NoteEditor", action: "create" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid note data",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [{ type: "Note", id: "LIST" }],
    }),

    updateNote: builder.mutation<
      Note,
      { id: string; updates: UpdateNoteRequest }
    >({
      query: ({ id, updates }) => ({
        url: `notes/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: SupabaseNoteResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to update note",
            { component: "NoteEditor", action: "update" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any, meta, { id }) => {
        const context = {
          component: "NoteEditor",
          action: "update",
          noteId: id,
        };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid note data",
            context
          );
        } else if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Note not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Note", id: "LIST" },
        { type: "Note", id },
      ],
    }),

    deleteNote: builder.mutation<{ success: boolean }, string>({
      query: (noteId) => ({
        url: `notes/${noteId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to delete note",
            { component: "NoteEditor", action: "delete" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any, meta, noteId) => {
        const context = { component: "NoteEditor", action: "delete", noteId };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Note not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, noteId) => [
        { type: "Note", id: "LIST" },
        { type: "Note", id: noteId },
      ],
    }),

    // Annotation endpoints
    getAnnotations: builder.query<Annotation[], string | void>({
      query: (pdfId) => ({
        url: "annotations",
        params: pdfId ? { pdfId } : undefined,
      }),
      transformResponse: (response: ApiResponse<Annotation[]>) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch annotations",
            { component: "PDFAnnotationViewer", action: "fetch" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "PDFAnnotationViewer", action: "fetch" };

        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result) => [
        { type: "Annotation", id: "LIST" },
        ...(result?.map((annotation) => ({
          type: "Annotation" as const,
          id: annotation.id,
        })) || []),
      ],
    }),

    createAnnotation: builder.mutation<
      Annotation,
      {
        pdfId: string;
        noteId: string;
        selectedText: string;
        pageNumber: number;
        coordinates: { x: number; y: number; width: number; height: number };
        noteContent?: string;
      }
    >({
      query: (annotationData) => ({
        url: "annotations",
        method: "POST",
        body: annotationData,
      }),
      transformResponse: (response: ApiResponse<Annotation>) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to create annotation",
            { component: "PDFAnnotationViewer", action: "create" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "PDFAnnotationViewer", action: "create" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid annotation data",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        } else if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "PDF or note not found",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [
        { type: "Annotation", id: "LIST" },
        { type: "PDF", id: "LIST" },
      ],
    }),

    // Highlights endpoints - new system replacing annotations
    getHighlights: builder.query<
      Highlight[],
      { pdfId?: string; noteId?: string; page?: number; limit?: number }
    >({
      query: ({ pdfId, noteId, page = 1, limit = 50 } = {}) => ({
        url: "highlights",
        params: {
          ...(pdfId && { pdfId }),
          ...(noteId && { noteId }),
          page,
          limit,
        },
      }),
      transformResponse: (
        response: ApiResponse<{ highlights: Highlight[]; total: number }>
      ) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch highlights",
            { component: "PDFAnnotationViewer", action: "fetch" }
          );
        }
        return response.data.highlights;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "PDFAnnotationViewer", action: "fetch" };

        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result) => [
        { type: "Highlight", id: "LIST" },
        ...(result?.map((highlight) => ({
          type: "Highlight" as const,
          id: highlight.id,
        })) || []),
      ],
    }),

    getHighlightsWithPagination: builder.query<
      { highlights: Highlight[]; total: number; pagination: any },
      { pdfId?: string; noteId?: string; page?: number; limit?: number }
    >({
      query: ({ pdfId, noteId, page = 1, limit = 50 } = {}) => ({
        url: "highlights",
        params: {
          ...(pdfId && { pdfId }),
          ...(noteId && { noteId }),
          page,
          limit,
        },
      }),
      transformResponse: (
        response: ApiResponse<{
          highlights: Highlight[];
          total: number;
          pagination: any;
        }>
      ) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch highlights",
            { component: "PDFAnnotationViewer", action: "fetch" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "PDFAnnotationViewer", action: "fetch" };

        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result) => [
        { type: "Highlight", id: "LIST" },
        ...(result?.highlights?.map((highlight) => ({
          type: "Highlight" as const,
          id: highlight.id,
        })) || []),
      ],
    }),

    getHighlight: builder.query<Highlight, string>({
      query: (highlightId) => `highlights/${highlightId}`,
      transformResponse: (response: ApiResponse<{ highlight: Highlight }>) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch highlight",
            { component: "PDFAnnotationViewer", action: "fetch" }
          );
        }
        return response.data.highlight;
      },
      transformErrorResponse: (response: any, meta, highlightId) => {
        const context = {
          component: "PDFAnnotationViewer",
          action: "fetch",
          highlightId,
        };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Highlight not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result, error, highlightId) => [
        { type: "Highlight", id: highlightId },
      ],
    }),

    createHighlight: builder.mutation<
      Highlight,
      {
        pdfId: string;
        noteId?: string;
        content: string;
        title?: string;
        color?: string;
        opacity?: number;
        pageNumber: number;
        textbounds: TextBounds[];
      }
    >({
      query: (highlightData) => ({
        url: "highlights",
        method: "POST",
        body: highlightData,
      }),
      transformResponse: (response: ApiResponse<{ highlight: Highlight }>) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to create highlight",
            { component: "PDFAnnotationViewer", action: "create" }
          );
        }
        return response.data.highlight;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "PDFAnnotationViewer", action: "create" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid highlight data",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        } else if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "PDF or note not found",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [
        { type: "Highlight", id: "LIST" },
        { type: "PDF", id: "LIST" },
      ],
    }),

    updateHighlight: builder.mutation<
      Highlight,
      {
        id: string;
        updates: {
          textbounds?: TextBounds[];
          content?: string;
          title?: string;
          color?: string;
          opacity?: number;
          noteId?: string;
        };
      }
    >({
      query: ({ id, updates }) => ({
        url: `highlights/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: ApiResponse<{ highlight: Highlight }>) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to update highlight",
            { component: "PDFAnnotationViewer", action: "update" }
          );
        }
        return response.data.highlight;
      },
      transformErrorResponse: (response: any, meta, { id }) => {
        const context = {
          component: "PDFAnnotationViewer",
          action: "update",
          highlightId: id,
        };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid highlight data",
            context
          );
        } else if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Highlight not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Highlight", id: "LIST" },
        { type: "Highlight", id },
      ],
    }),

    deleteHighlight: builder.mutation<{ success: boolean }, string>({
      query: (highlightId) => ({
        url: `highlights/${highlightId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to delete highlight",
            { component: "PDFAnnotationViewer", action: "delete" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any, meta, highlightId) => {
        const context = {
          component: "PDFAnnotationViewer",
          action: "delete",
          highlightId,
        };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Highlight not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, highlightId) => [
        { type: "Highlight", id: "LIST" },
        { type: "Highlight", id: highlightId },
      ],
    }),

    bulkDeleteHighlights: builder.mutation<
      { success: boolean; deletedCount: number },
      string[]
    >({
      query: (highlightIds) => ({
        url: "highlights/bulk-delete",
        method: "DELETE",
        body: { ids: highlightIds },
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to delete highlights",
            { component: "PDFAnnotationViewer", action: "bulkDelete" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        const context = {
          component: "PDFAnnotationViewer",
          action: "bulkDelete",
        };

        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [{ type: "Highlight", id: "LIST" }],
    }),

    searchHighlights: builder.query<
      Highlight[],
      { query: string; pdfId?: string; limit?: number }
    >({
      query: ({ query, pdfId, limit = 20 }) => ({
        url: "highlights/search",
        params: {
          q: query,
          ...(pdfId && { pdfId }),
          limit,
        },
      }),
      transformResponse: (
        response: ApiResponse<{ highlights: Highlight[] }>
      ) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to search highlights",
            { component: "PDFAnnotationViewer", action: "search" }
          );
        }
        return response.data.highlights;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "PDFAnnotationViewer", action: "search" };

        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: ["Highlight"],
    }),

    // ============================================================================
    // QUIZ ENDPOINTS - Enhanced RTK Query integration with proper types
    // ============================================================================

    // Document processing for RAG quiz generation
    processDocument: builder.mutation<
      DocumentProcessingResponse,
      DocumentProcessingRequest
    >({
      query: (requestData) => ({
        url: "quiz/process-document",
        method: "POST",
        body: requestData,
      }),
      transformResponse: (response: DocumentProcessingResponse) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.PROCESSING_ERROR,
            response.message || "Failed to process document",
            { component: "QuizGenerator", action: "process" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "QuizGenerator", action: "process" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid processing request",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [
        { type: "PDF", id: "LIST" },
        { type: "ProcessingStatus", id: "LIST" },
      ],
    }),

    // Get document processing status with polling support
    getProcessingStatus: builder.query<
      ProcessingStatusResponse["data"],
      string
    >({
      query: (statusId) => `quiz/processing-status/${statusId}`,
      transformResponse: (response: ProcessingStatusResponse) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            "Failed to fetch processing status",
            { component: "QuizGenerator", action: "status" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any, meta, statusId) => {
        const context = {
          component: "QuizGenerator",
          action: "status",
          statusId,
        };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Processing status not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result, error, statusId) => [
        { type: "ProcessingStatus", id: statusId },
        { type: "ProcessingStatus", id: "LIST" },
      ],
      // Enable polling for active processing status
      pollingInterval: (result) => {
        if (result?.status === "processing" || result?.status === "pending") {
          return 2000; // Poll every 2 seconds for active processing
        }
        return 0; // Stop polling when completed or failed
      },
    }),

    // Vector search for content retrieval
    searchContent: builder.mutation<
      ContentSearchResponse,
      ContentSearchRequest
    >({
      query: (searchData) => ({
        url: "quiz/search-content",
        method: "POST",
        body: searchData,
      }),
      transformResponse: (response: ContentSearchResponse) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.PROCESSING_ERROR,
            response.error || "Failed to search content",
            { component: "QuizGenerator", action: "search" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "QuizGenerator", action: "search" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid search request",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
    }),

    // RAG-enhanced quiz generation
    generateQuiz: builder.mutation<
      {
        success: boolean;
        quizId: string;
        questions: QuizQuestion[];
        metadata: RAGQuizMetadata;
        sourceChunks: ChunkReference[];
      },
      RAGQuizGenerationRequest & { title?: string }
    >({
      query: (quizData) => ({
        url: "quiz/generate-rag",
        method: "POST",
        body: quizData,
      }),
      transformResponse: (response: {
        success: boolean;
        quizId: string;
        questions: QuizQuestion[];
        metadata: RAGQuizMetadata;
        sourceChunks: ChunkReference[];
        error?: string;
      }) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.PROCESSING_ERROR,
            response.error || "Failed to generate quiz",
            { component: "QuizGenerator", action: "generate" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "QuizGenerator", action: "generate" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid quiz generation request",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        } else if (response.status === 429) {
          return createAppError(
            ErrorType.RATE_LIMIT_ERROR,
            "Rate limit exceeded. Please try again later.",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: [{ type: "Quiz", id: "LIST" }],
      // Optimistic update for better UX
      async onQueryStarted(quizData, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // Optimistically add the new quiz to the list
          dispatch(
            apiSlice.util.updateQueryData("getQuizzes", undefined, (draft) => {
              if (draft?.quizzes) {
                const newQuiz: Quiz = {
                  id: data.quizId,
                  userId: "", // Will be populated by server
                  title:
                    quizData.title ||
                    `Quiz from ${data.metadata.sourceDocumentTitles.join(
                      ", "
                    )}`,
                  sourceDocumentIds: quizData.documentIds,
                  pageRange: quizData.pageRange,
                  questionCount: quizData.questionCount,
                  difficulty: quizData.difficulty,
                  questionTypes: quizData.questionTypes,
                  notes: quizData.notes,
                  focusAreas: quizData.focusAreas,
                  learningObjectives: quizData.learningObjectives,
                  generationMethod: "rag",
                  metadata: data.metadata,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                draft.quizzes.unshift(newQuiz);
                draft.totalCount += 1;
              }
            })
          );
        } catch (error) {
          // Optimistic update will be reverted automatically on error
        }
      },
    }),

    // Get all quizzes with pagination and filtering
    getQuizzes: builder.query<
      {
        quizzes: Quiz[];
        totalCount: number;
        statistics: {
          totalQuizzes: number;
          totalAttempts: number;
          averageScore: number;
          bestScore: number;
          mostRecentAttempt: string | null;
          difficultyBreakdown: Record<QuizDifficulty, number>;
          questionTypeBreakdown: Record<QuizQuestionType, number>;
        };
      },
      {
        page?: number;
        limit?: number;
        difficulty?: QuizDifficulty;
        questionType?: QuizQuestionType;
        sortBy?: "createdAt" | "updatedAt" | "title" | "difficulty";
        sortOrder?: "asc" | "desc";
      } | void
    >({
      query: (params = {}) => ({
        url: "quiz",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...(params.difficulty && { difficulty: params.difficulty }),
          ...(params.questionType && { questionType: params.questionType }),
          sortBy: params.sortBy || "createdAt",
          sortOrder: params.sortOrder || "desc",
        },
      }),
      transformResponse: (response: {
        success: boolean;
        data?: {
          quizzes: Quiz[];
          totalCount: number;
          statistics: {
            totalQuizzes: number;
            totalAttempts: number;
            averageScore: number;
            bestScore: number;
            mostRecentAttempt: string | null;
            difficultyBreakdown: Record<QuizDifficulty, number>;
            questionTypeBreakdown: Record<QuizQuestionType, number>;
          };
        };
        error?: string;
      }) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch quizzes",
            { component: "QuizList", action: "fetch" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "QuizList", action: "fetch" };

        if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result) => [
        { type: "Quiz", id: "LIST" },
        ...(result?.quizzes.map((quiz) => ({
          type: "Quiz" as const,
          id: quiz.id,
        })) || []),
      ],
    }),

    // Get single quiz with questions and attempts
    getQuiz: builder.query<
      {
        quiz: Quiz;
        questions: QuizQuestion[];
        attempts: QuizAttempt[];
        statistics: {
          totalAttempts: number;
          averageScore: number;
          bestScore: number;
          lastAttempt: string | null;
        };
      },
      string
    >({
      query: (quizId) => `quiz/${quizId}`,
      transformResponse: (response: {
        success: boolean;
        data?: {
          quiz: Quiz;
          questions: QuizQuestion[];
          attempts: QuizAttempt[];
          statistics: {
            totalAttempts: number;
            averageScore: number;
            bestScore: number;
            lastAttempt: string | null;
          };
        };
        error?: string;
      }) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.PROCESSING_ERROR,
            response.error || "Failed to fetch quiz",
            { component: "QuizPlayer", action: "fetch" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any, meta, quizId) => {
        const context = { component: "QuizPlayer", action: "fetch", quizId };

        if (response.status === 404) {
          return createAppError(
            ErrorType.NOT_FOUND_ERROR,
            "Quiz not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result, error, quizId) => [
        { type: "Quiz", id: quizId },
        { type: "Quiz", id: "LIST" },
      ],
    }),

    // Update quiz metadata and configuration
    updateQuiz: builder.mutation<
      Quiz,
      {
        id: string;
        updates: {
          title?: string;
          notes?: string;
          focusAreas?: string[];
          learningObjectives?: string[];
        };
      }
    >({
      query: ({ id, updates }) => ({
        url: `quiz/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: {
        success: boolean;
        data?: Quiz;
        error?: string;
      }) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to update quiz",
            { component: "QuizEditor", action: "update" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any, meta, { id }) => {
        const context = {
          component: "QuizEditor",
          action: "update",
          quizId: id,
        };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid quiz data",
            context
          );
        } else if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Quiz not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Quiz", id },
        { type: "Quiz", id: "LIST" },
      ],
      // Optimistic update
      async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getQuiz", id, (draft) => {
            Object.assign(draft.quiz, updates, {
              updatedAt: new Date().toISOString(),
            });
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Delete quiz
    deleteQuiz: builder.mutation<{ success: boolean }, string>({
      query: (quizId) => ({
        url: `quiz/${quizId}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to delete quiz",
            { component: "QuizList", action: "delete" }
          );
        }
        return response;
      },
      transformErrorResponse: (response: any, meta, quizId) => {
        const context = { component: "QuizList", action: "delete", quizId };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Quiz not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, quizId) => [
        { type: "Quiz", id: "LIST" },
        { type: "Quiz", id: "STATISTICS" },
        { type: "Quiz", id: quizId },
      ],
      // Optimistic update
      async onQueryStarted(quizId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getQuizzes", undefined, (draft) => {
            if (draft?.quizzes) {
              const index = draft.quizzes.findIndex(
                (quiz) => quiz.id === quizId
              );
              if (index !== -1) {
                draft.quizzes.splice(index, 1);
                draft.totalCount -= 1;
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Submit quiz attempt with detailed results
    submitQuizAttempt: builder.mutation<
      {
        attemptId: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        results: Array<{
          questionId: string;
          correct: boolean;
          userAnswer: string;
          correctAnswer: string;
          explanation: string;
        }>;
      },
      {
        quizId: string;
        answers: Record<string, string>;
        timeTaken?: number;
      }
    >({
      query: (attemptData) => ({
        url: "quiz/attempts",
        method: "POST",
        body: attemptData,
      }),
      transformResponse: (response: {
        success: boolean;
        data?: {
          attemptId: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          results: Array<{
            questionId: string;
            correct: boolean;
            userAnswer: string;
            correctAnswer: string;
            explanation: string;
          }>;
        };
        error?: string;
      }) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.PROCESSING_ERROR,
            response.error || "Failed to submit quiz attempt",
            { component: "QuizPlayer", action: "submit" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        const context = { component: "QuizPlayer", action: "submit" };

        if (response.status === 400) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            response.data?.error || "Invalid quiz attempt data",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        } else if (response.status === 404) {
          return createAppError(
            ErrorType.NOT_FOUND_ERROR,
            "Quiz not found",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      invalidatesTags: (result, error, { quizId }) => [
        { type: "Quiz", id: quizId },
        { type: "Quiz", id: "LIST" },
      ],
    }),

    // Get quiz generation status for long-running operations
    getQuizGenerationStatus: builder.query<
      {
        id: string;
        status: "pending" | "processing" | "completed" | "failed";
        progress: number;
        currentStep: string;
        estimatedTimeRemaining?: number;
        error?: string;
      },
      string
    >({
      query: (generationId) => `quiz/generation-status/${generationId}`,
      transformResponse: (response: {
        success: boolean;
        data?: {
          id: string;
          status: "pending" | "processing" | "completed" | "failed";
          progress: number;
          currentStep: string;
          estimatedTimeRemaining?: number;
          error?: string;
        };
        error?: string;
      }) => {
        if (!response.success || !response.data) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch generation status",
            { component: "QuizGenerator", action: "status" }
          );
        }
        return response.data;
      },
      transformErrorResponse: (response: any, meta, generationId) => {
        const context = {
          component: "QuizGenerator",
          action: "status",
          generationId,
        };

        if (response.status === 404) {
          return createAppError(
            ErrorType.VALIDATION_ERROR,
            "Generation status not found",
            context
          );
        } else if (response.status === 401) {
          return createAppError(
            ErrorType.AUTHENTICATION_ERROR,
            "Authentication required",
            context
          );
        } else if (response.status === 403) {
          return createAppError(
            ErrorType.AUTHORIZATION_ERROR,
            "Access denied",
            context
          );
        }

        return mapErrorToAppError(response, context);
      },
      providesTags: (result, error, generationId) => [
        { type: "Quiz", id: `GENERATION_${generationId}` },
      ],
      // Enable polling for active generation
      pollingInterval: (result) => {
        if (result?.status === "processing" || result?.status === "pending") {
          return 3000; // Poll every 3 seconds for active generation
        }
        return 0; // Stop polling when completed or failed
      },
    }),

    // Highlight endpoints
    getHighlights: builder.query<
      {
        highlights: Highlight[];
        total: number;
        pagination: {
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      },
      {
        pdfId?: string;
        noteId?: string;
        type?: "quick" | "comment" | "note";
        page?: number;
        limit?: number;
      }
    >({
      query: ({ pdfId, noteId, type, page = 1, limit = 50 }) => {
        const params = new URLSearchParams();
        if (pdfId) params.append("pdfId", pdfId);
        if (noteId) params.append("noteId", noteId);
        if (type) params.append("type", type);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return `highlights?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch highlights"
          );
        }
        return response.data;
      },
      providesTags: (result) => [
        { type: "Highlight", id: "LIST" },
        ...(result?.highlights || []).map((highlight) => ({
          type: "Highlight" as const,
          id: highlight.id,
        })),
      ],
    }),

    getPDFHighlights: builder.query<
      {
        highlights: Highlight[];
        total: number;
        pdfId: string;
        pagination: {
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      },
      {
        pdfId: string;
        type?: "quick" | "comment" | "note";
        page?: number;
        limit?: number;
      }
    >({
      query: ({ pdfId, type, page = 1, limit = 50 }) => {
        const params = new URLSearchParams();
        if (type) params.append("type", type);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return `pdfs/${pdfId}/highlights?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to fetch PDF highlights"
          );
        }
        return response.data;
      },
      providesTags: (result, error, { pdfId }) => [
        { type: "Highlight", id: "LIST" },
        { type: "PDF", id: pdfId },
        ...(result?.highlights || []).map((highlight) => ({
          type: "Highlight" as const,
          id: highlight.id,
        })),
      ],
    }),

    createHighlight: builder.mutation<
      { highlight: Highlight },
      {
        pdfId: string;
        noteId?: string;
        content: string;
        title?: string;
        color?: string;
        opacity?: number;
        pageNumber: number;
        type?: "quick" | "comment" | "note";
        textbounds: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
        }>;
      }
    >({
      query: (highlightData) => ({
        url: "highlights",
        method: "POST",
        body: highlightData,
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to create highlight"
          );
        }
        return response.data;
      },
      invalidatesTags: [
        { type: "Highlight", id: "LIST" },
        { type: "PDF", id: "LIST" },
      ],
    }),

    updateHighlight: builder.mutation<
      { highlight: Highlight },
      {
        id: string;
        updates: {
          content?: string;
          title?: string;
          color?: string;
          opacity?: number;
          type?: "quick" | "comment" | "note";
          noteId?: string;
          textbounds?: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
          }>;
        };
      }
    >({
      query: ({ id, updates }) => ({
        url: `highlights/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to update highlight"
          );
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Highlight", id },
        { type: "Highlight", id: "LIST" },
      ],
    }),

    deleteHighlight: builder.mutation<void, string>({
      query: (id) => ({
        url: `highlights/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw createAppError(
            ErrorType.DATABASE_ERROR,
            response.error || "Failed to delete highlight"
          );
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: "Highlight", id },
        { type: "Highlight", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useUploadPDFMutation,
  useGetPDFsQuery,
  useGetPDFQuery,
  useDeletePDFMutation,
  useRenamePDFMutation,
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetAnnotationsQuery,
  useCreateAnnotationMutation,
  // Highlights hooks
  useGetHighlightsQuery,
  useGetPDFHighlightsQuery,
  useCreateHighlightMutation,
  useUpdateHighlightMutation,
  useDeleteHighlightMutation,
  // Quiz endpoints - Enhanced RTK Query hooks
  useProcessDocumentMutation,
  useGetProcessingStatusQuery,
  useSearchContentMutation,
  useGenerateQuizMutation,
  useGetQuizzesQuery,
  useGetQuizQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useSubmitQuizAttemptMutation,
  useGetQuizGenerationStatusQuery,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
