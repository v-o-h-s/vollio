import { ApiBuilder } from "@/lib/store/endpoints/types";
import { GetAllFilesResponse } from "@shared/types/responses/fileRoutes";
import { GetFileByIdResponse } from "@shared/types/responses/fileRoutes";
export interface TransformedFile {
  id: string;
  filename: string;
  fileUrl?: string;
  fileSize: number;
  mimeType: string;
  uploadedAt?: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}

export const fileEndpoints = (builder: ApiBuilder) => ({
  getAllFiles: builder.query<TransformedFile[], void>({
    query: () => ({
      url: "files/",
      method: "GET",
    }),
    transformResponse: (response: GetAllFilesResponse): TransformedFile[] => {
      if (!response.data) return [];

      return response.data.pdfs.map((pdf) => ({
        id: pdf.id,
        filename: pdf.filename,
        fileSize: pdf.fileSize,
        mimeType: pdf.mimeType,
        folderId: pdf.folderId,
        isGoogleDriveFile: pdf.isGoogleDriveFile,
      }));
    },

    providesTags: ["File"],
  }),

  getFileById: builder.query<TransformedFile, string>({
    query: (id) => ({
      url: `files/${id}`,
      method: "GET",
    }),
    transformResponse: (baseQueryReturnValue: GetFileByIdResponse) => {
      const file = baseQueryReturnValue.data;
      if (!file) {
        throw new Error("File not found");
      }
      return {
        id: file.id,
        filename: file.filename,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        fileUrl: file.fileUrl,
        uploadedAt: file.uploadedAt,
        folderId: null,
        isGoogleDriveFile: false,
      };
    },
    providesTags: (_result, _error, id) => [{ type: "File", id }],
  }),

  uploadFile: builder.mutation<TransformedFile, FormData>({
    query: (formData) => ({
      url: "files/upload",
      method: "POST",
      body: formData,
    }),
    invalidatesTags: [{ type: "File", id: "LIST" }],
  }),

  deleteFile: builder.mutation<{ success: boolean }, string>({
    query: (id) => ({
      url: `files/${id}`,
      method: "DELETE",
      body: undefined,
      headers: {
        "Content-Type": undefined,
      },
    }),
    invalidatesTags: (_result, _error, id) => [
      { type: "File", id: "LIST" },
      { type: "File", id },
    ],
  }),

  renameFile: builder.mutation<any, { id: string; name: string }>({
    query: ({ id, name }) => ({
      url: `files/${id}/rename`,
      method: "PUT",
      body: { name },
    }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "File", id: "LIST" },
      { type: "File", id },
    ],
  }),

  moveFile: builder.mutation<any, { id: string; folderId: string | null }>({
    query: ({ id, folderId }) => ({
      url: `files/${id}/move`,
      method: "PATCH",
      body: { folderId },
    }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "File", id: "LIST" },
      { type: "File", id },
      { type: "Folder", id: "LIST" },
    ],
  }),

  getFileFromGoogleDrive: builder.query<any, string>({
    query: (id) => ({
      url: `files/google-drive/${id}`,
      method: "GET",
    }),
    providesTags: (_result, _error, id) => [{ type: "File", id }],
  }),

  addFileFromGoogleDrive: builder.mutation<any, { fileGoogleDriveId: string }>({
    query: (data) => ({
      url: "files/google-drive",
      method: "POST",
      body: data,
    }),
    invalidatesTags: [{ type: "File", id: "LIST" }],
  }),
});
