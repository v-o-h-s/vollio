/**
 * Document-related types for document handling and annotation system
 */

import { ActivityType } from "./database";

// ============================================================================
// Document ANNOTATION TYPES
// ============================================================================

/**
 * Text bounds interface for Document annotations and highlights
 * Used for both individual text fragments and coordinate arrays
 */
export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Rectangle coordinates for Document annotations
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Text selection data from Document viewer
 */
export interface TextSelection {
  text: string;
  pageNumber: number;
  coordinates: Rectangle;
  documentId: string;
}

/**
 * Document annotation with coordinates and note content
 */
export interface Annotation {
  id: string;
  userId: string;
  documentId: string;
  pageNumber: number;
  selectedText: string;
  content: string;
  coordinates: Rectangle;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

/**
 * Highlight data structure matching the database schema
 */
export interface Highlight {
  id: string;
  user_id: string;
  documentId: string;
  noteId: string | null;
  content: string;
  title: string | null;
  color: string;
  opacity: number;
  pageNumber: number;
  type: "quick" | "comment" | "note";
  textbounds: TextBounds[];
  createdAt: string;
  updatedAt: string;
}

/**
 * document metadata and storage information
 */
export interface DocumentDocument {
  id: string;
  userId: string;
  name: string;
  size: number;
  storagePath: string | null;
  mimeType: string;
  uploadedAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  documentUrl?: string | null; // Signed URL for frontend use
  folderId?: string | null; // Folder association
  folder?: {
    id: string;
    name: string;
    parent_id: string | null;
  } | null; // Folder details from join
  googleDocumentId?: string | null; // Google Drive document ID for Classroom integration
  isGoogleDriveDocument?: boolean; // Flag to indicate if this is a Google Drive document
}

/**
 * User activity tracking for Document interactions
 */
export interface UserActivity {
  id: string;
  userId: string;
  documentId: string;
  activityType: "view" | "upload" | "delete";
  accessedAt: string; // ISO string for Redux serialization
}

/**
 * Folder structure for organizing Documents
 */
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  document_count?: number; // Computed field for UI
}

/**
 * Document upload progress tracking
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================================================
// Document API RESPONSE TYPES
// ============================================================================

/**
 * Document upload API response
 */
export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
    documentUrl: string; // Signed URL for viewing
  };
  error?: string;
}

/**
 * Document list API response
 */
export interface DocumentListResponse {
  success: boolean;
  data?: {
    documents: Array<{
      id: string;
      name: string;
      size: number;
      uploadedAt: string;
      documentUrl: string; // Signed URL
    }>;
    recentActivity?: {
      documentId: string;
      name: string;
      accessedAt: string;
      documentUrl: string;
    };
  };
  error?: string;
}

/**
 * Document access API response
 */
export interface DocumentAccessResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    documentUrl: string; // Fresh signed URL
    size: number;
  };
  error?: string;
}

/**
 * Supabase Document upload response
 */
export interface SupabaseUploadResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
    documentUrl: string;
    storagePath: string;
  };
  error?: string;
}

/**
 * Supabase Document list response
 */
export interface SupabaseDocumentListResponse {
  success: boolean;
  data?: {
    documents: Array<{
      id: string;
      name: string;
      size: number;
      uploadedAt: string;
      documentUrl: string | null;
      mimeType: string;
      folderId?: string | null;
      folder?: {
        id: string;
        name: string;
        parent_id: string | null;
      } | null;
      storage_path?: string | null;
      storagePath?: string | null;
      google_document_id?: string | null;
      googleDocumentId?: string | null;
      isGoogleDriveDocument?: boolean;
    }>;
    recentActivity?: {
      documentId: string;
      name: string;
      accessedAt: string;
      documentUrl: string;
      activityType: ActivityType;
    };
    totalCount: number;
  };
  error?: string;
}

/**
 * Supabase Document access response
 */
export interface SupabaseDocumentAccessResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    documentUrl: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
  error?: string;
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Document validation result
 */
export interface DocumentValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Storage upload operation result
 */
export interface StorageUploadResult {
  path: string;
  fullPath: string;
  id: string;
}

/**
 * Signed URL generation result
 */
export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

/**
 * Document upload component state
 */
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedDocument: DocumentDocument | null;
}

/**
 * Upload operation configuration
 */
export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (document: DocumentDocument) => void;
  onError?: (error: string) => void;
}
