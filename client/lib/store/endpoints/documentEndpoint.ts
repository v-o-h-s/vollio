import { ApiBuilder } from "@/lib/store/endpoints/types";
import {
  GetAllDocumentsResponse,
  GetDocumentByIdResponse,
  GetStorageUrlData,
  GetStorageUrlDto,
  GetStorageUrlResponse,
  CreateDocumentDto,
  NoteData,
} from "@vollio/shared";

export interface TransformedDocument {
  id: string;
  name: string;
  documentUrl?: string;
  size: number;
  mimeType: string;
  uploadedAt?: string;
  folderId: string | null;
  isGoogleDriveDocument: boolean;
}

export const documentEndpoints = (builder: ApiBuilder) => ({
  getAllDocuments: builder.query<TransformedDocument[], void>({
    query: () => ({
      url: "documents/",
      method: "GET",
    }),
    transformResponse: (
      response: GetAllDocumentsResponse
    ): TransformedDocument[] => {
      if (!response.data) return [];

      return response.data.documents.map((document) => ({
        id: document.id,
        name: document.name,
        size: document.size,
        mimeType: document.mimeType,
        folderId: document.folderId,
        isGoogleDriveDocument: document.isGoogleDriveDocument,
      }));
    },
    providesTags: ["Document"],
  }),

  getDocumentById: builder.query<TransformedDocument, string>({
    query: (id: string) => ({
      url: `documents/${id}`,
      method: "GET",
    }),
    transformResponse: (baseQueryReturnValue: GetDocumentByIdResponse) => {
      const document = baseQueryReturnValue.data;
      if (!document) {
        throw new Error("Document not found");
      }
      return {
        id: document.id,
        name: document.name,
        size: document.size,
        mimeType: document.mimeType,
        documentUrl: document.documentUrl,
        uploadedAt: document.uploadedAt,
        folderId: document.folderId,
        isGoogleDriveDocument: document.isGoogleDriveDocument,
      };
    },
    providesTags: (_result, _error, id) => [{ type: "Document", id }],
  }),

  generateUploadUrl: builder.mutation<GetStorageUrlData, GetStorageUrlDto>({
    query: (data: GetStorageUrlDto) => ({
      url: "documents/upload-url",
      method: "POST",
      body: data,
    }),
    transformResponse: (response: GetStorageUrlResponse) => {
      if (!response.data) {
        throw new Error("No data returned from server");
      }
      return response.data;
    },
    invalidatesTags: [{ type: "Document", id: "LIST" }],
  }),

  createDocument: builder.mutation<{ id: string }, CreateDocumentDto>({
    query: (data: CreateDocumentDto) => ({
      url: "documents/finish-upload",
      method: "POST",
      body: data,
    }),
    invalidatesTags: [{ type: "Document", id: "LIST" }],
  }),

  deleteDocument: builder.mutation<{ success: boolean }, string>({
    query: (id: string) => ({
      url: `documents/${id}`,
      method: "DELETE",
      body: undefined,
      headers: {
        "Content-Type": undefined,
      },
    }),
    invalidatesTags: (_result, _error, id) => [
      { type: "Document", id: "LIST" },
      { type: "Document", id },
    ],
  }),

  renameDocument: builder.mutation<any, { id: string; name: string }>({
    query: ({ id, name }: { id: string; name: string }) => ({
      url: `documents/${id}/rename`,
      method: "PUT",
      body: { name },
    }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Document", id: "LIST" },
      { type: "Document", id },
    ],
  }),

  moveDocument: builder.mutation<any, { id: string; folderId: string | null }>({
    query: ({ id, folderId }: { id: string; folderId: string | null }) => ({
      url: `documents/${id}/move`,
      method: "PATCH",
      body: { folderId },
    }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Document", id: "LIST" },
      { type: "Document", id },
      { type: "Folder", id: "LIST" },
    ],
  }),

  getDocumentFromGoogleDrive: builder.query<Blob, string>({
    query: (id: string) => ({
      url: `documents/google-drive/${id}`,
      method: "GET",
      responseHandler: (response) => response.blob(),
    }),
    providesTags: (_result, _error, id) => [{ type: "Document", id }],
  }),

  addDocumentFromGoogleDrive: builder.mutation<
    any,
    { documentGoogleDriveId: string }
  >({
    query: (data: { documentGoogleDriveId: string }) => ({
      url: "documents/google-drive",
      method: "POST",
      body: data,
    }),
    invalidatesTags: [{ type: "Document", id: "LIST" }],
  }),

  generateSummary: builder.mutation<NoteData, string>({
    query: (documentId: string) => ({
      url: `documents/${documentId}/generate-summary`,
      method: "POST",
    }),
    transformResponse: (response: { success: boolean; data: NoteData }) => {
      return response.data;
    },
    invalidatesTags: [{ type: "Note", id: "LIST" }],
  }),
});
