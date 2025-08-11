/**
 * RTK Query API slice for annotation and PDF management
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Annotation,
  PDFDocument,
  UserActivity,
  SupabaseUploadResponse,
  SupabasePDFListResponse,
  SupabasePDFAccessResponse,
} from "../types";
import {
  annotationNotifications,
  pdfNotifications,
} from "../utils/notifications";

export interface CreateAnnotationRequest {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
  noteContent: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UpdateAnnotationRequest {
  id: string;
  noteContent: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { endpoint }) => {
      // Don't set Content-Type for FormData uploads (let browser set it with boundary)
      if (endpoint !== "uploadPDF") {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  tagTypes: ["Annotation", "PDF"],
  endpoints: (builder) => ({
    // Annotation endpoints
    getAnnotations: builder.query<
      Annotation[],
      { pdfId: string; pageNumber?: number }
    >({
      query: ({ pdfId, pageNumber }) => {
        const params = new URLSearchParams({ pdfId });
        if (pageNumber !== undefined) {
          params.append("page", pageNumber.toString());
        }
        return `annotations?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<Annotation[]>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to fetch annotations");
        }
        return response.data;
      },
      providesTags: (result, error, { pdfId, pageNumber }) => [
        { type: "Annotation", id: "LIST" },
        { type: "Annotation", id: `PDF_${pdfId}` },
        ...(pageNumber !== undefined
          ? [
              {
                type: "Annotation" as const,
                id: `PDF_${pdfId}_PAGE_${pageNumber}`,
              },
            ]
          : []),
      ],
    }),

    createAnnotation: builder.mutation<Annotation, CreateAnnotationRequest>({
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
      invalidatesTags: (result, error, { pdfId, pageNumber }) => [
        { type: "Annotation", id: "LIST" },
        { type: "Annotation", id: `PDF_${pdfId}` },
        { type: "Annotation", id: `PDF_${pdfId}_PAGE_${pageNumber}` },
      ],
      // Optimistic update
      async onQueryStarted(annotationData, { dispatch, queryFulfilled }) {
        // Create optimistic annotation
        const optimisticAnnotation: Annotation = {
          id: `temp_${Date.now()}`,
          userId: "current_user", // Will be set by server
          pdfId: annotationData.pdfId,
          pageNumber: annotationData.pageNumber,
          selectedText: annotationData.selectedText,
          noteContent: annotationData.noteContent,
          coordinates: annotationData.coordinates,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Optimistically update the cache
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            "getAnnotations",
            {
              pdfId: annotationData.pdfId,
              pageNumber: annotationData.pageNumber,
            },
            (draft) => {
              draft.push(optimisticAnnotation);
            }
          )
        );

        try {
          await queryFulfilled;
          annotationNotifications.createSuccess();
        } catch (error) {
          // Revert optimistic update on error
          patchResult.undo();
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create annotation";
          annotationNotifications.createError(message);
        }
      },
    }),

    updateAnnotation: builder.mutation<Annotation, UpdateAnnotationRequest>({
      query: (updateData) => ({
        url: "annotations",
        method: "PUT",
        body: updateData,
      }),
      transformResponse: (response: ApiResponse<Annotation>) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to update annotation");
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Annotation", id: "LIST" },
        { type: "Annotation", id },
      ],
      // Optimistic update
      async onQueryStarted(
        { id, noteContent },
        { dispatch, queryFulfilled, getState }
      ) {
        // Find all queries that might contain this annotation and update them
        const patches: any[] = [];

        // Update all getAnnotations queries that might contain this annotation
        const state = getState() as any;
        const queries = state.api.queries;

        Object.keys(queries).forEach((queryKey) => {
          if (queryKey.startsWith("getAnnotations")) {
            const query = queries[queryKey];
            if (query?.data) {
              const annotationIndex = query.data.findIndex(
                (ann: Annotation) => ann.id === id
              );
              if (annotationIndex !== -1) {
                const patchResult = dispatch(
                  apiSlice.util.updateQueryData(
                    "getAnnotations",
                    query.originalArgs,
                    (draft) => {
                      if (draft[annotationIndex]) {
                        draft[annotationIndex].noteContent = noteContent;
                        draft[annotationIndex].updatedAt = new Date();
                      }
                    }
                  )
                );
                patches.push(patchResult);
              }
            }
          }
        });

        try {
          await queryFulfilled;
          annotationNotifications.updateSuccess();
        } catch (error) {
          // Revert all optimistic updates on error
          patches.forEach((patch) => patch.undo());
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update annotation";
          annotationNotifications.updateError(message);
        }
      },
    }),

    deleteAnnotation: builder.mutation<void, string>({
      query: (annotationId) => ({
        url: `annotations?id=${annotationId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (!response.success) {
          throw new Error(response.error || "Failed to delete annotation");
        }
      },
      invalidatesTags: (result, error, annotationId) => [
        { type: "Annotation", id: "LIST" },
        { type: "Annotation", id: annotationId },
      ],
      // Optimistic update
      async onQueryStarted(
        annotationId,
        { dispatch, queryFulfilled, getState }
      ) {
        // Find all queries that might contain this annotation and remove it
        const patches: any[] = [];

        const state = getState() as any;
        const queries = state.api.queries;

        Object.keys(queries).forEach((queryKey) => {
          if (queryKey.startsWith("getAnnotations")) {
            const query = queries[queryKey];
            if (query?.data) {
              const annotationIndex = query.data.findIndex(
                (ann: Annotation) => ann.id === annotationId
              );
              if (annotationIndex !== -1) {
                const patchResult = dispatch(
                  apiSlice.util.updateQueryData(
                    "getAnnotations",
                    query.originalArgs,
                    (draft) => {
                      draft.splice(annotationIndex, 1);
                    }
                  )
                );
                patches.push(patchResult);
              }
            }
          }
        });

        try {
          await queryFulfilled;
          annotationNotifications.deleteSuccess();
        } catch (error) {
          // Revert all optimistic updates on error
          patches.forEach((patch) => patch.undo());
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete annotation";
          annotationNotifications.deleteError(message);
        }
      },
    }),

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
        // Transform Supabase response to PDFDocument format
        const data = response.data;
        return {
          id: data.id,
          userId: "", // Will be set by server
          filename: data.filename,
          fileSize: data.fileSize,
          storagePath: data.storagePath,
          mimeType: "application/pdf",
          uploadedAt: new Date(data.uploadedAt),
          updatedAt: new Date(data.uploadedAt),
          fileUrl: data.fileUrl,
        } as PDFDocument;
      },
      invalidatesTags: [{ type: "PDF", id: "LIST" }],
      async onQueryStarted(formData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          pdfNotifications.uploadSuccess();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to upload PDF";
          pdfNotifications.uploadError(message);
        }
      },
    }),

    getPDFs: builder.query<
      {
        pdfs: PDFDocument[];
        recentActivity?: UserActivity;
        totalCount: number;
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        return `pdfs?${params.toString()}`;
      },
      transformResponse: (response: SupabasePDFListResponse) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to fetch PDFs");
        }

        const data = response.data;

        // Transform PDF list to PDFDocument format
        const pdfs: PDFDocument[] = data.pdfs.map((pdf) => ({
          id: pdf.id,
          userId: "", // Will be set by server
          filename: pdf.filename,
          fileSize: pdf.fileSize,
          storagePath: "", // Not included in list response
          mimeType: pdf.mimeType,
          uploadedAt: new Date(pdf.uploadedAt),
          updatedAt: new Date(pdf.uploadedAt),
          fileUrl: pdf.fileUrl,
        }));

        // Transform recent activity if present
        let recentActivity: UserActivity | undefined;
        if (data.recentActivity) {
          recentActivity = {
            id: "", // Not provided in response
            userId: "", // Will be set by server
            pdfId: data.recentActivity.pdfId,
            activityType: data.recentActivity.activityType,
            accessedAt: new Date(data.recentActivity.accessedAt),
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
          userId: "", // Will be set by server
          filename: data.filename,
          fileSize: data.fileSize,
          storagePath: "", // Not included in access response
          mimeType: data.mimeType,
          uploadedAt: new Date(data.uploadedAt),
          updatedAt: new Date(data.uploadedAt),
          fileUrl: data.fileUrl,
        } as PDFDocument;
      },
      providesTags: (result, error, pdfId) => [{ type: "PDF", id: pdfId }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAnnotationsQuery,
  useCreateAnnotationMutation,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
  useUploadPDFMutation,
  useGetPDFsQuery,
  useGetPDFQuery,
} = apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
