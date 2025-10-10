/**
 * PDF-related types for document handling and annotation system
 */

import { ActivityType } from "./database";

// ============================================================================
// PDF ANNOTATION TYPES
// ============================================================================

/**
 * Text bounds interface for PDF annotations and highlights
 * Used for both individual text fragments and coordinate arrays
 */
export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Rectangle coordinates for PDF annotations
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Text selection data from PDF viewer
 */
export interface TextSelection {
  text: string;
  pageNumber: number;
  coordinates: Rectangle;
  pdfId: string;
}

/**
 * PDF annotation with coordinates and note content
 */
export interface Annotation {
  id: string;
  userId: string;
  pdfId: string;
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
  pdfId: string;
  noteId: string | null;
  content: string;
  title: string | null;
  color: string;
  opacity: number;
  pageNumber: number;
  textbounds: TextBounds[];
  createdAt: string;
  updatedAt: string;
}

/**
 * PDF document metadata and storage information
 */
export interface PDFDocument {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  storagePath: string;
  mimeType: string;
  uploadedAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  fileUrl?: string; // Signed URL for frontend use
}

/**
 * User activity tracking for PDF interactions
 */
export interface UserActivity {
  id: string;
  userId: string;
  pdfId: string;
  activityType: "view" | "upload" | "delete";
  accessedAt: string; // ISO string for Redux serialization
}

/**
 * File upload progress tracking
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================================================
// PDF API RESPONSE TYPES
// ============================================================================

/**
 * PDF upload API response
 */
export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    fileUrl: string; // Signed URL for viewing
  };
  error?: string;
}

/**
 * PDF list API response
 */
export interface PDFListResponse {
  success: boolean;
  data?: {
    pdfs: Array<{
      id: string;
      filename: string;
      fileSize: number;
      uploadedAt: string;
      fileUrl: string; // Signed URL
    }>;
    recentActivity?: {
      pdfId: string;
      filename: string;
      accessedAt: string;
      fileUrl: string;
    };
  };
  error?: string;
}

/**
 * PDF access API response
 */
export interface PDFAccessResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileUrl: string; // Fresh signed URL
    fileSize: number;
  };
  error?: string;
}

/**
 * Supabase PDF upload response
 */
export interface SupabaseUploadResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    fileUrl: string;
    storagePath: string;
  };
  error?: string;
}

/**
 * Supabase PDF list response
 */
export interface SupabasePDFListResponse {
  success: boolean;
  data?: {
    pdfs: Array<{
      id: string;
      filename: string;
      fileSize: number;
      uploadedAt: string;
      fileUrl: string;
      mimeType: string;
    }>;
    recentActivity?: {
      pdfId: string;
      filename: string;
      accessedAt: string;
      fileUrl: string;
      activityType: ActivityType;
    };
    totalCount: number;
  };
  error?: string;
}

/**
 * Supabase PDF access response
 */
export interface SupabasePDFAccessResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
  error?: string;
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * File validation result
 */
export interface FileValidationResult {
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
 * File upload component state
 */
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: PDFDocument | null;
}

/**
 * Upload operation configuration
 */
export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (pdf: PDFDocument) => void;
  onError?: (error: string) => void;
}
