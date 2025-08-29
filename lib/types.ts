/**
 * Core types for PDF annotation system
 */

import { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { ActivityType } from "./types/database";

// ============================================================================
// EDITOR TYPES
// ============================================================================

/**
 * Editor mode for different viewing experiences
 */
export type EditorMode = 'normal' | 'fullscreen' | 'focus';

/**
 * Re-export JSONContent from TipTap for convenience
 */
export type { JSONContent };

/**
 * Props for the main NotionEditor component
 */
export interface NotionEditorProps {
  content?: JSONContent | string;
  onChange?: (content: JSONContent) => void;
  onUpdate?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autoFocus?: boolean;
  customToolbar?: (editor: Editor) => React.ReactNode;

  showWordCount?: boolean;
  showReadingTime?: boolean;
  // Auto-save props
  autoSave?: boolean;
  noteId?: string;
  onAutoSave?: (content: JSONContent, noteId: string) => Promise<void>;
  autoSaveDelay?: number;
}

/**
 * Props for editor toolbar components
 */
export interface EditorToolbarProps {
  editor: Editor | null;
  className?: string;
}

/**
 * Configuration for editor commands (buttons, shortcuts, etc.)
 */
export interface EditorCommand {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

/**
 * Configuration for TipTap extensions
 */
export interface EditorExtensionConfig {
  heading?: {
    levels: number[];
  };
  table?: {
    resizable: boolean;
    handleWidth: number;
  };
  image?: {
    inline: boolean;
    allowBase64: boolean;
  };
}

/**
 * Editor state for context management
 */
export interface EditorState {
  editor: Editor | null;
  content: JSONContent | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Editor context value with state and actions
 */
export interface EditorContextValue extends EditorState {
  setEditor: (editor: Editor | null) => void;
  updateContent: (content: JSONContent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetEditor: () => void;
}

// ============================================================================
// PDF ANNOTATION TYPES
// ============================================================================

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
  noteContent: string;
  coordinates: Rectangle;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

/**
 * Note entity with rich text content
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: JSONContent; // TipTap JSONContent format
  pdfAnnotationId?: string | null;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  isDeleted: boolean;
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
// DATABASE TYPES
// ============================================================================

/**
 * Re-export database types from Supabase schema
 */
export type {
  Database,
  PDFRow,
  PDFInsert,
  PDFUpdate,
  UserActivityRow,
  UserActivityInsert,
  UserActivityUpdate,
  AnnotationRow,
  AnnotationInsert,
  AnnotationUpdate,
  ActivityType,
} from "./types/database";

/**
 * Re-export error types
 */
export * from "./types/errors";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

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
 * Database insert operation result
 */
export interface DatabaseInsertResult {
  id: string;
  created: boolean;
}

/**
 * Signed URL generation result
 */
export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

// ============================================================================
// SUPABASE CLIENT TYPES
// ============================================================================

/**
 * Authenticated Supabase client result
 */
export interface AuthenticatedClientResult {
  client: any; // SupabaseClient<Database> - avoiding circular import
  userId: string;
}

/**
 * Client authentication state
 */
export interface ClientAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  error: string | null;
}

/**
 * Database operation result wrapper
 */
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Storage operation result wrapper
 */
export interface StorageOperationResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * Bulk operation response with individual results
 */
export interface BulkOperationResponse<T> {
  success: boolean;
  results?: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  error?: string;
}

// ============================================================================
// SUPABASE API RESPONSE TYPES
// ============================================================================

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

/**
 * Supabase activity tracking response
 */
export interface SupabaseActivityResponse {
  success: boolean;
  data?: {
    activities: Array<{
      id: string;
      pdfId: string;
      activityType: ActivityType;
      accessedAt: string;
      pdf?: {
        filename: string;
        fileUrl: string;
      };
    }>;
    summary: {
      totalViews: number;
      totalUploads: number;
      totalDeletes: number;
      lastActivity: string | null;
    };
  };
  error?: string;
}

/**
 * Supabase notes list response
 */
export interface SupabaseNotesResponse {
  success: boolean;
  data?: Note[];
  error?: string;
}

/**
 * Supabase single note response
 */
export interface SupabaseNoteResponse {
  success: boolean;
  data?: Note;
  error?: string;
}

/**
 * Create note request payload
 */
export interface CreateNoteRequest {
  title?: string;
  content: JSONContent;
  pdfAnnotationId?: string;
}

/**
 * Update note request payload
 */
export interface UpdateNoteRequest {
  title?: string;
  content?: JSONContent;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication operation result
 */
export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

/**
 * JWT token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  expiresAt?: Date;
  error?: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard data aggregation
 */
export interface DashboardData {
  pdfs: PDFDocument[];
  recentActivity: UserActivity | null;
  totalFiles: number;
  totalSize: number;
}

/**
 * Dashboard component state
 */
export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null; // ISO string for Redux serialization
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

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

// ============================================================================
// ACTIVITY TRACKING TYPES
// ============================================================================

/**
 * Activity tracking configuration
 */
export interface ActivityTrackingOptions {
  trackView?: boolean;
  trackUpload?: boolean;
  trackDelete?: boolean;
}

/**
 * User activity summary statistics
 */
export interface ActivitySummary {
  totalViews: number;
  totalUploads: number;
  totalDeletes: number;
  lastActivity: string | null; // ISO string for Redux serialization
  mostViewedPdf: {
    id: string;
    filename: string;
    viewCount: number;
  } | null;
}
// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Re-export theme types for convenience
 */
export type {
  ThemeMode,
  ThemeConfig,
  ThemeContextValue,
  ThemeProviderProps,
  ThemeState,
} from "./types/theme";