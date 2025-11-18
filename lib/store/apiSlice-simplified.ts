/**
 * RTK Query API slice for annotation and PDF management
 * Simplified version using basic fetchBaseQuery without custom error handling
 */

import {
  createApi,
  fetchBaseQuery,
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
  LMSProvider,
  LMSConnectionResponse,
  LMSCoursesResponse,
  LMSCourseMaterialsResponse,
  LMSImportResponse,
  LMSTokenStatusResponse,
  LMSConnectionStatusResponse,
  ImportFileRequest,
  BatchImportRequest,
  BatchImportResponse,
} from "../types/";
import { pdfNotifications } from "../utils/notifications";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simple base query configuration
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

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Annotation", "Highlight", "PDF", "Note", "Folder", "LMS"],
  endpoints: (builder) => ({
    // PDF endpoints
    uploadPDF: builder.mutation<PDFDocument, FormData>({
      query: (formData) => ({
        url: "pdfs/upload",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: SupabaseUploadResponse) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to upload PDF");
        }

        const data = response.data;
        return {
          id: data.id,
          userId: "",
          filename: data.filename,
          fileSize: data.fileSize,
          storagePath: data.storagePath,
          mimeType: "application/pdf",
          uploadedAt: data.uploadedAt,
          updatedAt: data.uploadedAt,
          fileUrl: data.fileUrl,
        } as PDFDocument;
      },
      invalidatesTags: [{ type: "PDF", id: "LIST" }],
      async onQueryStarted(formData, { queryFulfilled }) {
        const file = formData.get("file") as File;
        const fileName = file?.name || "PDF";

        try {
          await queryFulfilled;
          pdfNotifications.uploadSuccess(fileName);
        } catch (error: any) {
          const message = error?.message || "Failed to upload PDF";
          pdfNotifications.uploadError(message);
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
          throw new Error(response.error || "Failed to fetch PDFs");
        }

        const data = response.data;

        const pdfs: PDFDocument[] = data.pdfs.map((pdf) => ({
          id: pdf.id,
          userId: "",
          filename: pdf.filename,
          fileSize: pdf.fileSize,
          storagePath: "",
          mimeType: pdf.mimeType,
          uploadedAt: pdf.uploadedAt,
          updatedAt: pdf.uploadedAt,
          fileUrl: pdf.fileUrl,
          folderId: pdf.folderId,
          folder: pdf.folder,
        }));

        let recentActivity:
          | (UserActivity & { filename?: string; fileUrl?: string })
          | undefined;
        if (data.recentActivity) {
          recentActivity = {
            id: "",
            userId: "",
            pdfId: data.recentActivity.pdfId,
            activityType: data.recentActivity.activityType,
            accessedAt: data.recentActivity.accessedAt,
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
          throw new Error(response.error || "Failed to fetch PDF");
        }

        const data = response.data;
        return {
          id: data.id,
          userId: "",
          filename: data.filename,
          fileSize: data.fileSize,
          storagePath: "",
          mimeType: data.mimeType,
          uploadedAt: data.uploadedAt,
          updatedAt: data.uploadedAt,
          fileUrl: data.fileUrl,
        } as PDFDocument;
      },
      providesTags: (_result, _error, pdfId) => [{ type: "PDF", id: pdfId }],
    }),

    deletePDF: builder.mutation<{ success: boolean }, string>({
      query: (pdfId) => ({
        url: `pdfs/${pdfId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, pdfId) => [
        { type: "PDF", id: "LIST" },
        { type: "PDF", id: pdfId },
      ],
      async onQueryStarted(_pdfId, { queryFulfilled }) {
        try {
          await queryFulfilled;
          pdfNotifications.deleteSuccess();
        } catch (error: any) {
          const message = error?.message || "Failed to delete PDF";
          pdfNotifications.deleteError(message);
        }
      },
    }),

    renamePDF: builder.mutation<
      { success: boolean; pdf: PDFDocument },
      { id: string; filename: string }
    >({
      query: ({ id, filename }) => ({
        url: `pdfs/${id}/rename`,
        method: "PUT",
        body: { filename },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PDF", id: "LIST" },
        { type: "PDF", id },
      ],
    }),

    // Notes endpoints
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
          throw new Error(response.error || "Failed to fetch notes");
        }
        return response.data;
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
          throw new Error(response.error || "Failed to fetch note");
        }
        return response.data;
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
          throw new Error(response.error || "Failed to create note");
        }
        return response.data;
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
          throw new Error(response.error || "Failed to update note");
        }
        return response.data;
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
          throw new Error(response.error || "Failed to fetch annotations");
        }
        return response.data;
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
          throw new Error(response.error || "Failed to create annotation");
        }
        return response.data;
      },
      invalidatesTags: [
        { type: "Annotation", id: "LIST" },
        { type: "PDF", id: "LIST" },
      ],
    }),

    // Highlights endpoints
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
          throw new Error(response.error || "Failed to fetch highlights");
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
          throw new Error(response.error || "Failed to fetch PDF highlights");
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
          throw new Error(response.error || "Failed to create highlight");
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
          throw new Error(response.error || "Failed to update highlight");
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
          throw new Error(response.error || "Failed to delete highlight");
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: "Highlight", id },
        { type: "Highlight", id: "LIST" },
      ],
    }),

    // Folder endpoints
    getFolders: builder.query<
      { folders: any[]; totalCount: number },
      void
    >({
      query: () => "folders",
      transformResponse: (response: any) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to fetch folders");
        }
        return response.data;
      },
      providesTags: (result) => [
        { type: "Folder", id: "LIST" },
        ...(result?.folders.map((folder) => ({ type: "Folder" as const, id: folder.id })) ||
          []),
      ],
    }),

    createFolder: builder.mutation<
      any,
      { name: string; parentId?: string | null }
    >({
      query: (folderData) => ({
        url: "folders",
        method: "POST",
        body: folderData,
      }),
      transformResponse: (response: any) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to create folder");
        }
        return response.data;
      },
      invalidatesTags: [{ type: "Folder", id: "LIST" }],
    }),

    updateFolder: builder.mutation<
      any,
      { id: string; updates: { name?: string; parentId?: string | null } }
    >({
      query: ({ id, updates }) => ({
        url: `folders/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: any) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to update folder");
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Folder", id: "LIST" },
        { type: "Folder", id },
      ],
    }),

    deleteFolder: builder.mutation<
      void,
      { id: string; moveContentsTo?: string | null }
    >({
      query: ({ id, moveContentsTo }) => ({
        url: `folders/${id}${moveContentsTo ? `?moveContentsTo=${moveContentsTo}` : ''}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Folder", id: "LIST" },
        { type: "Folder", id },
        { type: "PDF", id: "LIST" },
      ],
    }),

    movePDF: builder.mutation<
      any,
      { id: string; folderId: string | null }
    >({
      query: ({ id, folderId }) => ({
        url: `pdfs/${id}/move`,
        method: "PATCH",
        body: { folderId },
      }),
      transformResponse: (response: any) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to move PDF");
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "PDF", id: "LIST" },
        { type: "PDF", id },
        { type: "Folder", id: "LIST" },
      ],
    }),

    // LMS endpoints
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
      providesTags: (result, error, provider) => [
        { type: "LMS", id: `CONNECTION_${provider.toUpperCase()}` }
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
      invalidatesTags: (result, error, provider) => [
        { type: "LMS", id: `CONNECTION_${provider.toUpperCase()}` }
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
      providesTags: (result, error, provider) => [
        { type: "LMS", id: `COURSES_${provider.toUpperCase()}` },
        ...(result?.courses?.map((course) => ({ 
          type: "LMS" as const, 
          id: `COURSE_${course.id}` 
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
      providesTags: (result, error, { provider, courseId }) => [
        { type: "LMS", id: `MATERIALS_${provider.toUpperCase()}_${courseId}` },
        ...(result?.materials?.map((material) => ({ 
          type: "LMS" as const, 
          id: `MATERIAL_${material.id}` 
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
      invalidatesTags: (result, error, provider) => [
        { type: "LMS", id: `CONNECTION_${provider.toUpperCase()}` },
        { type: "LMS", id: `COURSES_${provider.toUpperCase()}` },
      ],
    }),

    getLMSConnectionStatus: builder.query<LMSConnectionStatusResponse, string>({
      query: (provider) => `school-lms/${provider}/status`,
      transformResponse: (response: LMSConnectionStatusResponse) => {
        if (!response.success) {
          throw new Error(response.error || "Failed to get LMS connection status");
        }
        return response;
      },
      providesTags: (result, error, provider) => [
        { type: "LMS", id: `STATUS_${provider.toUpperCase()}` }
      ],
    }),

    importLMSContent: builder.mutation<
      LMSImportResponse,
      { provider: string; courseId: string; contentType: string; contentId: string }
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
  useGetHighlightsQuery,
  useGetPDFHighlightsQuery,
  useCreateHighlightMutation,
  useUpdateHighlightMutation,
  useDeleteHighlightMutation,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useMovePDFMutation,
  useGetLMSProvidersQuery,
  useCheckLMSConnectionQuery,
  useConnectToLMSMutation,
  useGetLMSCoursesQuery,
  useGetLMSCourseMaterialsQuery,
  useImportLMSFileMutation,
  useBatchImportLMSFilesMutation,
  useDisconnectLMSMutation,
  useGetLMSConnectionStatusQuery,
  useImportLMSContentMutation,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
