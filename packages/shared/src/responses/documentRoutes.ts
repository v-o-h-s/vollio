import { ServerSuccessResponse } from "./general";

export interface DocumentDetails {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  folderId: string | null;
  isGoogleDriveDocument: boolean;
}

// GET /api/v1/documents
export type GetAllDocumentsResponse = ServerSuccessResponse<{
  documents: DocumentDetails[];
  totalCount: number;
}>;

// GET /api/v1/documents/:id (this is for stored documents)
export type GetDocumentByIdResponse = ServerSuccessResponse<{
  id: string;
  name: string;
  documentUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  folderId: string | null;
  isGoogleDriveDocument: boolean;
}>;

// POST /api/v1/documents/upload
export type UploadDocumentResponse = ServerSuccessResponse<{
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  documentUrl: string;
  storagePath: string;
}>;

// DELETE /api/v1/documents/:id
export type DeleteDocumentResponse = ServerSuccessResponse<null>;
// PATCH /api/v1/documents/:id/move
export type MoveDocumentResponse = ServerSuccessResponse<null>;

// PUT /api/v1/documents/:id/rename
export type RenameDocumentResponse = ServerSuccessResponse<null>;

// GET /api/v1/documents/google-drive/:documentId
export type GetDocumentFromGoogleDriveResponse = ServerSuccessResponse<Buffer>;

// POST /api/v1/documents/google-drive
export interface AddDocumentFromGoogleDriveResponse {
  success: true;
  message: string;
  data: null;
  error: null;
}

// GET /api/v1/documents/:id/stream
export type StreamDocumentResponse =
  ServerSuccessResponse<NodeJS.ReadableStream>;

// POST /api/v1/documents/:id/signed-url
export type CreateSignedUrlResponse = ServerSuccessResponse<{
  url: string;
}>;

// GET /api/v1/documents/storage-url
export interface GetStorageUrlData {
  storageUrl: string;
  storagePath: string;
}
export type GetStorageUrlResponse = ServerSuccessResponse<GetStorageUrlData>;
