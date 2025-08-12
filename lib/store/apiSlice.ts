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
import { pdfNotifications } from "../utils/notifications";

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
        recentActivity?: UserActivity & { filename?: string; fileUrl?: string };
        totalCount: number;
      },
      { page?: number; limit?: number } | void
    >({
      query: (params = {}) => {
        if (
          params &&
          typeof params === "object" &&
          ("page" in params || "limit" in params)
        ) {
          const { page = 1, limit = 20 } = params;
          const searchParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          return `pdfs?${searchParams.toString()}`;
        }
        return "pdfs";
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
        let recentActivity:
          | (UserActivity & { filename?: string; fileUrl?: string })
          | undefined;
        if (data.recentActivity) {
          recentActivity = {
            id: "", // Not provided in response
            userId: "", // Will be set by server
            pdfId: data.recentActivity.pdfId,
            activityType: data.recentActivity.activityType,
            accessedAt: new Date(data.recentActivity.accessedAt),
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
export const { useUploadPDFMutation, useGetPDFsQuery, useGetPDFQuery } =
  apiSlice;

// Export the reducer and middleware
export const { reducer: apiReducer, middleware: apiMiddleware } = apiSlice;
