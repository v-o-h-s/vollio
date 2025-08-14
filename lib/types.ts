/**
 * Core types for PDF annotation system
 */


import { ActivityType } from "./types/database";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextSelection {
  text: string;
  pageNumber: number;
  coordinates: Rectangle;
  pdfId: string;
}

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

export interface UserActivity {
  id: string;
  userId: string;
  pdfId: string;
  activityType: "view" | "upload" | "delete";
  accessedAt: string; // ISO string for Redux serialization
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Re-export database types
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

// Re-export theme types
export * from "./types/theme";

// Error handling types
//useless thing
export interface APIError {
  type: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

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

// Additional API response interfaces
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface StorageUploadResult {
  path: string;
  fullPath: string;
  id: string;
}

export interface DatabaseInsertResult {
  id: string;
  created: boolean;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

// Supabase client helper interfaces
export interface AuthenticatedClientResult {
  client: any; // SupabaseClient<Database> - avoiding circular import
  userId: string;
}

export interface ClientAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  error: string | null;
}

// Database operation result interfaces
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export interface StorageOperationResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

// Enhanced API response interfaces with better typing
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

// Supabase-specific API response interfaces
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

// Authentication-related interfaces
export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  expiresAt?: Date;
  error?: string;
}

// Dashboard-specific interfaces
export interface DashboardData {
  pdfs: PDFDocument[];
  recentActivity: UserActivity | null;
  totalFiles: number;
  totalSize: number;
}

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null; // ISO string for Redux serialization
}

// Upload-specific interfaces
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: PDFDocument | null;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (pdf: PDFDocument) => void;
  onError?: (error: string) => void;
}

// Activity tracking interfaces
export interface ActivityTrackingOptions {
  trackView?: boolean;
  trackUpload?: boolean;
  trackDelete?: boolean;
}

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
