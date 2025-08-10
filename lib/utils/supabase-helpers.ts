/**
 * Supabase utility functions and helpers
 * (just saying most of the function in this file are useless so dont worry about
 * the hight number of lines in the file (chill bruh <3) )
 */
import type {
  PDFDocument,
  UserActivity,
  PDFRow,
  UserActivityRow,
} from "../types";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "../supabaseClient";
import type { Database } from "../types/database";
import { APIError } from "../types";

/**
 * Maps Supabase errors to our application error types
 */
export const mapSupabaseError = (error: any): APIError => {
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
    type,
    message,
    details: error,
    retryable,
  };
};

/**
 * Validates file upload constraints
 */
export const validateFileUpload = (file: File): APIError | null => {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ["application/pdf"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      type: "INVALID_FILE_TYPE",
      message: "Only PDF files are allowed.",
      retryable: false,
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      type: "FILE_TOO_LARGE",
      message: `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB.`,
      retryable: false,
    };
  }

  return null;
};

/**
 * Extracts user ID from Clerk JWT claims
 * maybe will be deleted in the future
 */
export const extractUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.user_id || null;
  } catch (error) {
    console.error("Failed to extract user ID from token:", error);
    return null;
  }
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

/**
 * Database utility functions for PDF and user activity operations
 */

// Helper function to convert database row to PDFDocument
export function mapPDFRowToDocument(row: PDFRow): PDFDocument {
  return {
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    uploadedAt: new Date(row.uploaded_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Helper function to convert database row to UserActivity
export function mapActivityRowToActivity(row: UserActivityRow): UserActivity {
  return {
    id: row.id,
    userId: row.user_id,
    pdfId: row.pdf_id,
    activityType: row.activity_type as "view" | "upload" | "delete",
    accessedAt: new Date(row.accessed_at),
  };
}

// Generate storage path for user's PDF
export function generateStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${timestamp}_${sanitizedFilename}`;
}

// Generate signed URL for PDF access
export async function generateSignedUrl(storagePath: string): Promise<string> {
  const supabase = await getAuthenticatedSupabaseClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .createSignedUrl(storagePath, STORAGE_CONFIG.SIGNED_URL_EXPIRY);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Validate PDF file
export function validatePDFFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "File must be a PDF" };
  }

  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check filename
  if (!file.name || file.name.trim().length === 0) {
    return { valid: false, error: "File must have a valid name" };
  }

  return { valid: true };
}

// Database operations
export class PDFDatabase {
  private static async getClient() {
    return await getAuthenticatedSupabaseClient();
  }

  // Insert new PDF record
  static async insertPDF(data: {
    userId: string;
    filename: string;
    fileSize: number;
    storagePath: string;
    mimeType: string;
  }): Promise<PDFDocument> {
    const supabase = await this.getClient();

    const { data: result, error } = await supabase
      .from("pdfs")
      .insert({
        user_id: data.userId,
        filename: data.filename,
        file_size: data.fileSize,
        storage_path: data.storagePath,
        mime_type: data.mimeType,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert PDF record: ${error.message}`);
    }

    return mapPDFRowToDocument(result);
  }

  // Get user's PDFs
  static async getUserPDFs(userId: string): Promise<PDFDocument[]> {
    const supabase = await this.getClient();

    const { data, error } = await supabase
      .from("pdfs")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user PDFs: ${error.message}`);
    }

    return data.map(mapPDFRowToDocument);
  }

  // Get PDF by ID
  static async getPDFById(id: string): Promise<PDFDocument | null> {
    const supabase = await this.getClient();

    const { data, error } = await supabase
      .from("pdfs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch PDF: ${error.message}`);
    }

    return mapPDFRowToDocument(data);
  }

  // Record user activity
  static async recordActivity(data: {
    userId: string;
    pdfId: string;
    activityType: "view" | "upload" | "delete";
  }): Promise<UserActivity> {
    const supabase = await this.getClient();

    const { data: result, error } = await supabase
      .from("user_activity")
      .insert({
        user_id: data.userId,
        pdf_id: data.pdfId,
        activity_type: data.activityType,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record activity: ${error.message}`);
    }

    return mapActivityRowToActivity(result);
  }

  // Get user's recent activity
  static async getRecentActivity(
    userId: string,
    limit: number = 1
  ): Promise<UserActivity[]> {
    const supabase = await this.getClient();

    const { data, error } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("accessed_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent activity: ${error.message}`);
    }

    return data.map(mapActivityRowToActivity);
  }
}
