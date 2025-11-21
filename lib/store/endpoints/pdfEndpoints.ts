import type {
  PDFDocument,
  SupabasePDFAccessResponse,
  SupabasePDFListResponse,
  SupabaseUploadResponse,
  UserActivity,
} from "@/lib/types/pdf";
import { pdfNotifications } from "../../utils/notifications";
import type { ApiBuilder } from "./types";

export const pdfEndpoints = (builder: ApiBuilder) => ({
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

     

      return {
        pdfs,
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

  movePDF: builder.mutation<any, { id: string; folderId: string | null }>({
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
});

