/**
 * File API Response Types
 * Based on `/api/v1/files` endpoints
 */

// ============================================================================
// Base Types
// ============================================================================

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath?: string;
  googleFileId?: string;
  folderId?: string;
}

export interface FileSource {
  storagePath?: string;
  googleFileId?: string;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface AddFileFromGoogleDriveRequest {
  fileGoogleDriveId: string;
}

// ============================================================================
// Endpoint Response Types
// ============================================================================

// 1. Get File from Google Drive
// Returns binary file stream with headers:
// - Content-Type: File's MIME type (e.g., 'application/pdf')
// - Content-Disposition: 'inline; filename="<filename>"'
export interface GetFileResponse {
  // This is actually a binary stream, not JSON
  // The controller returns raw file content with appropriate headers
  __isBinaryStream: true;
  mimeType: string;
  fileName: string;
}

// 2. Add File from Google Drive
export type AddFileResponse = ApiResponse<null>;

// ============================================================================
// Error Response Types
// ============================================================================

export interface UnauthorizedError {
  success: false;
  message: "User not authenticated";
  data: null;
  error: "Unauthorized";
}

export interface NotFoundError {
  success: false;
  data: null;
  error: string; // Specific error message
  message?: string;
}

export type FileErrorResponse = UnauthorizedError | NotFoundError;

// ============================================================================
// Utility Types
// ============================================================================

export interface FileRequestContext {
  fileId: string;
  fileGoogleDriveId?: string;
}
