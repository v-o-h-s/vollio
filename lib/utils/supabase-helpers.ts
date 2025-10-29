/**
 * Supabase utility functions and helpers
 * (just saying most of the function in this file are useless so dont worry about
 * the hight number of lines in the file (chill bruh <3) )
 */
import type {
  UserActivity,
  Highlight,
  FileValidationResult,
  PDFDocument,
} from "../types/pdf";
import type { PDFRow, UserActivityRow, FolderRow } from "../types/database";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "../supabaseClient";
import type { Database } from "../types/database";
import { AppError } from "../types/errors";

/**
 * Maps Supabase errors to our application error types
 */
export const mapSupabaseError = (error: any): AppError => {
  let type: string;
  let message: string;
  let retryable = false;

  if (error?.code === "PGRST116") {
    type = "AUTHENTICATION_ERROR";
    message = "Access denied. Please check your permissions.";
  } else if (error?.code === "PGRST301") {
    type = "DATABASE_ERROR";
    message = "Resource not found.";
  } else if (error?.message?.includes("JWT")) {
    type = "AUTHENTICATION_ERROR";
    message = "Authentication token expired. Please sign in again.";
  } else if (error?.message?.includes("network")) {
    type = "NETWORK_ERROR";
    message = "Network error occurred. Please try again.";
    retryable = true;
  } else if (error?.message?.includes("storage")) {
    type = "STORAGE_ERROR";
    message = "File storage error occurred.";
    retryable = true;
  } else {
    type = "DATABASE_ERROR";
    message = error?.message || "An unexpected error occurred.";
    retryable = true;
  }

  return {
    type: type as any,
    message,
    severity: "medium" as any,
    retryable,
    userMessage: message,
    timestamp: new Date(),
    context: {
      component: "supabase-helpers",
      action: "database_operation",
      details: error,
    },
  };
};

/**
 * Type guard for database row types
 */
export const isPDFRow = (
  row: any
): row is Database["public"]["Tables"]["pdfs"]["Row"] => {
  return (
    row &&
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.filename === "string" &&
    typeof row.file_size === "number" &&
    typeof row.storage_path === "string"
  );
};

/**
 * Type guard for user activity row types
 */
export const isUserActivityRow = (
  row: any
): row is Database["public"]["Tables"]["user_activity"]["Row"] => {
  return (
    row &&
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.pdf_id === "string" &&
    typeof row.activity_type === "string"
  );
};

/**
 * Type guard for highlight row types
 */
export const isHighlightRow = (
  row: any
): row is Database["public"]["Tables"]["highlights"]["Row"] => {
  return (
    row &&
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.pdf_id === "string" &&
    typeof row.content === "string" &&
    typeof row.page_number === "number" &&
    typeof row.type === "string" &&
    ["quick", "comment", "note"].includes(row.type) &&
    Array.isArray(row.textbounds)
  );
};

/**
 * Type guard for folder row types
 */
export const isFolderRow = (
  row: any
): row is Database["public"]["Tables"]["folders"]["Row"] => {
  return (
    row &&
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.name === "string" &&
    (row.parent_id === null || typeof row.parent_id === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
};

/**
 * Type guard for OAuth token row types
 */
export const isOAuthTokenRow = (
  row: any
): row is Database["public"]["Tables"]["oauth_tokens"]["Row"] => {
  return (
    row &&
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.provider === "string" &&
    typeof row.encrypted_access_token === "string" &&
    (row.encrypted_refresh_token === null || typeof row.encrypted_refresh_token === "string") &&
    typeof row.token_type === "string" &&
    (row.expires_at === null || typeof row.expires_at === "string") &&
    (row.scope === null || typeof row.scope === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
};

/**
 * Retry configuration for Supabase operations
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelay: 1000,
  retryableErrors: [
    "NETWORK_ERROR",
    "STORAGE_ERROR",
    "DATABASE_ERROR",
  ] as string[],
};

/**
 * Implements exponential backoff retry logic
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config = RETRY_CONFIG
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === config.maxRetries) {
        break;
      }

      const mappedError = mapSupabaseError(error);
      if (
        !mappedError.retryable ||
        !config.retryableErrors.includes(mappedError.type)
      ) {
        throw error;
      }

      const delay =
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Helper to create standardized API responses
 */
export const createAPIResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
) => ({
  success,
  data,
  error,
});

/**
 * Helper to handle Supabase query results
 */
export const handleSupabaseResult = <T>(result: {
  data: T | null;
  error: any;
}) => {
  if (result.error) {
    throw mapSupabaseError(result.error);
  }
  return result.data;
};

/**
 * Helper to check if a user has access to a resource
 */
export const checkUserAccess = async (
  supabaseClient: any,
  table: string,
  resourceId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select("id")
      .eq("id", resourceId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw mapSupabaseError(error);
    }

    return !!data;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
};

/**
 * Helper to format database timestamps to Date objects
 */
export const formatDatabaseTimestamp = (timestamp: string): Date => {
  return new Date(timestamp);
};

/**
 * Helper to format file sizes for display
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

// Helper function to convert database row to PDFDocument
export function mapPDFRowToDocument(row: PDFRow): PDFDocument {
  return {
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    folderId: row.folder_id,
    uploadedAt: row.uploaded_at
      ? new Date(row.uploaded_at).toISOString()
      : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

// Helper function to convert database row to UserActivity
export function mapActivityRowToActivity(row: UserActivityRow): UserActivity {
  return {
    id: row.id,
    userId: row.user_id,
    pdfId: row.pdf_id,
    activityType: row.activity_type as "view" | "upload" | "delete",
    accessedAt: new Date(row.accessed_at).toISOString(),
  };
}

// Helper function to convert database row to Highlight
export function mapHighlightRowToHighlight(
  row: Database["public"]["Tables"]["highlights"]["Row"]
): Highlight {
  return {
    id: row.id,
    user_id: row.user_id,
    pdfId: row.pdf_id,
    noteId: row.note_id,
    content: row.content,
    title: row.title,
    color: row.color,
    opacity: row.opacity,
    pageNumber: row.page_number,
    type: row.type,
    textbounds: row.textbounds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper function to convert database row to Folder
export function mapFolderRowToFolder(row: FolderRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    parent_id: row.parent_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Validate PDF file
export function validateFile(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Validate file type
  if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only PDF files are allowed",
    };
  }

  // Validate file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Additional security checks
  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  // Check filename for security
  const filename = file.name;
  if (!filename || filename.length > 255) {
    return {
      valid: false,
      error: "Invalid filename",
    };
  }

  // Check for potentially malicious filename patterns
  const dangerousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
  ];

  if (dangerousPatterns.some((pattern) => pattern.test(filename))) {
    return {
      valid: false,
      error: "Filename contains invalid characters",
    };
  }

  return { valid: true };
}

export async function generateSignedUrl(
  supabaseClient: any,
  storagePath: string
): Promise<string> {
  try {
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .createSignedUrl(storagePath, STORAGE_CONFIG.SIGNED_URL_EXPIRY);

    if (error) {
      console.error("Signed URL generation error:", error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error("Signed URL generation succeeded but no URL returned");
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in generateSignedUrl:", error);
    throw error;
  }
}
