/**
 * Note API Response Types
 * Based on `/api/v1/notes` endpoints
 */

// ============================================================================
// Base Types
// ============================================================================

export interface Note {
  id: string; // UUID
  title: string;
  content: string;
  userId: string; // UUID
  pdfId?: string; // UUID (optional)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface CreateNoteRequest {
  title: string;
  content: string;
  pdfId?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

// ============================================================================
// Endpoint Response Types
// ============================================================================

// 1. Create Note
export type CreateNoteResponse = ApiResponse<Note>;

// 2. Get All Notes
export type GetAllNotesResponse = ApiResponse<Note[]>;

// 3. Get Note by ID
export type GetNoteByIdResponse = ApiResponse<Note>;

// 4. Update Note
export type UpdateNoteResponse = ApiResponse<Note>;

// 5. Delete Note
export interface DeleteNoteResponse extends ApiResponse<never> {
  message: "Note deleted successfully";
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface UnauthorizedError extends ApiErrorResponse {
  error: "Unauthorized";
}

export type NoteErrorResponse = UnauthorizedError | ApiErrorResponse;
