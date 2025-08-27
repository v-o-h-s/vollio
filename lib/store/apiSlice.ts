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
  PDFDocument,
  UserActivity,
  Note,
  JSONContent,
  SupabaseUploadResponse,
  SupabasePDFListResponse,
  SupabasePDFAccessResponse,
  SupabaseNotesResponse,
  SupabaseNoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
} from "../types";
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
  tagTypes: ["Annotation", "PDF", "Note"],
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
      transformErrorResponse: (response: any, meta, arg) => {
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
      providesTags: (result, error, pdfId) => [{ type: "PDF", id: pdfId }],
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
      invalidatesTags: (result, error, pdfId) => [
        { type: "PDF", id: "LIST" },
        { type: "PDF", id: pdfId },
      ],
      async onQueryStarted(pdfId, { dispatch, queryFulfilled }) {
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

    // Notes endpoints with error handling
    getNotes: builder.query<Note[], { pdfAnnotationId?: string }>({
      query: ({ pdfAnnotationId } = {}) => ({
        url: "notes",
        params: pdfAnnotationId ? { pdfAnnotationId } : undefined,
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
  }),
});

// Export hooks for usage in functional components
export const {
  useUploadPDFMutation,
  useGetPDFsQuery,
  useGetPDFQuery,
  useDeletePDFMutation,
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
