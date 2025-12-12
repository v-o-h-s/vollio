import { ApiBuilder } from "@/lib/store/endpoints/types";
import { GetAllFilesResponse } from "../../../../server/src/shared/types/responses/fileRoutes";
import { ServerErrorResponse } from "../../../../server/src/shared/types/responses/general";
import { UUID } from "crypto";

interface TransformedFile {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}

export const fileEndpoints = (builder: ApiBuilder) => ({
  getAllFiles: builder.query<TransformedFile[], void>({
    query: () => ({
      url: "files/",
      method: "GET",
    }),
    transformResponse: (response: GetAllFilesResponse) => {
      if (!response.data) return [];

      return response.data.pdfs.map(pdf => ({
        id: pdf.id,
        filename: pdf.filename,
        fileSize: pdf.file_size,
        mimeType: pdf.mime_type,
        folderId: pdf.folder_id,
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

  streamFile: builder.query<Blob, string>({
    query: (id) => ({
      url: `files/google-drive/${id}/stream`,
      method: "GET",
      responseHandler: (response) => response.blob(),
    }),
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
