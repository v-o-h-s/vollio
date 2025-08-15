import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "@/lib/supabaseClient";
import { SupabaseUploadResponse, StorageUploadResult } from "@/lib/types";
import { generateSignedUrl } from "@/lib/utils/supabase-helpers";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
  validateRequired,
  logServerError,
} from "@/lib/utils/server-error-handling";
import {
  validateFileUploadSecurity,
  checkUserQuota,
  checkEnhancedRateLimit,
  generateSecureStoragePath,
} from "@/lib/utils/security-validation";
import {
  requireAuthentication,
  validateAuthentication,
} from "@/lib/utils/auth-validation";
import { randomUUID } from "crypto";

/**
 * Uploads file to Supabase Storage with enhanced error handling
 */
async function uploadToStorage(
  supabaseClient: any,
  file: File,
  userId: string
): Promise<StorageUploadResult> {
  const storagePath = generateSecureStoragePath(userId, file.name);

  try {
    // Convert File to ArrayBuffer for upload
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw createServerError(
        ServerErrorType.STORAGE_ERROR,
        `Storage upload failed: ${error.message}`,
        {
          operation: "storage_upload",
          fileName: file.name,
          fileSize: file.size,
          userId,
        },
        error
      );
    }

    if (!data?.path) {
      throw createServerError(
        ServerErrorType.STORAGE_ERROR,
        "Upload succeeded but no path returned",
        {
          operation: "storage_upload",
          fileName: file.name,
          fileSize: file.size,
          userId,
        }
      );
    }

    return {
      path: data.path,
      fullPath: data.fullPath || data.path,
      id: data.id || randomUUID(),
    };
  } catch (error) {
    // If it's already a ServerError, re-throw it
    if (error && typeof error === "object" && "type" in error) {
      throw error;
    }

    // Otherwise, wrap it
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw createServerError(
      ServerErrorType.STORAGE_ERROR,
      `Storage upload failed: ${errorMessage}`,
      {
        operation: "storage_upload",
        fileName: file.name,
        fileSize: file.size,
        userId,
      },
      error
    );
  }
}

// Generate storage path for user's PDF (deprecated - use generateSecureStoragePath)
export function generateStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${timestamp}_${sanitizedFilename}`;
}
/**
 * Stores PDF metadata in database with enhanced error handling
 */
async function storePDFMetadata(
  supabaseClient: any,
  userId: string,
  file: File,
  storagePath: string
): Promise<string> {
  try {
    const { data, error } = await supabaseClient
      .from("pdfs")
      .insert({
        user_id: userId,
        filename: file.name,
        file_size: file.size,
        storage_path: storagePath,
        mime_type: file.type,
      })
      .select("id")
      .single();

    if (error) {
      throw createServerError(
        ServerErrorType.DATABASE_ERROR,
        `Failed to store PDF metadata: ${error.message}`,
        {
          operation: "database_insert",
          fileName: file.name,
          fileSize: file.size,
          userId,
        },
        error
      );
    }

    if (!data?.id) {
      throw createServerError(
        ServerErrorType.DATABASE_ERROR,
        "PDF metadata stored but no ID returned",
        {
          operation: "database_insert",
          fileName: file.name,
          fileSize: file.size,
          userId,
        }
      );
    }

    return data.id;
  } catch (error) {
    // If it's already a ServerError, re-throw it
    if (error && typeof error === "object" && "type" in error) {
      throw error;
    }

    // Otherwise, wrap it
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Database operation failed: ${errorMessage}`,
      {
        operation: "database_insert",
        fileName: file.name,
        fileSize: file.size,
        userId,
      },
      error
    );
  }
}

/**
 * Records upload activity in user_activity table with enhanced error handling
 */
async function recordUploadActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  const { error } = await supabaseClient.from("user_activity").insert({
    user_id: userId,
    pdf_id: pdfId,
    activity_type: "upload",
  });

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to record upload activity: ${error.message}`,
      {
        operation: "record_activity",
        userId,
      },
      { originalError: error, pdfId }
    );
  }
}

// Enhanced POST handler with comprehensive error handling
async function handlePOST(
  request: NextRequest
): Promise<NextResponse<SupabaseUploadResponse>> {
  let uploadedStoragePath: string | null = null;
  let supabaseClient: any = null;
  const context = extractRequestContext(request, "/api/pdfs/upload");

  // Enhanced authentication validation
  const authContext = await requireAuthentication(request, ['upload', 'write']);
  const userId = authContext.userId;

  // Additional validation check
  const authValidation = await validateAuthentication(request);
  if (authValidation.shouldRefresh) {
    console.warn(`⚠️ User ${userId} should refresh their authentication token`);
  }

  // Enhanced rate limiting with multiple violation tracking
  checkEnhancedRateLimit(userId, 'UPLOAD', { ...context, userId });

  // Parse form data
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // Basic validation
  validateRequired(file, "file", { ...context, userId });

  // Comprehensive security validation
  const securityValidation = await validateFileUploadSecurity(file);
  if (!securityValidation.valid) {
    throw createServerError(
      securityValidation.severity === 'critical' ? ServerErrorType.VALIDATION_ERROR : ServerErrorType.VALIDATION_ERROR,
      securityValidation.error || 'File validation failed',
      { ...context, userId, fileName: file?.name, fileSize: file?.size },
      securityValidation.details
    );
  }

  // Check user quota limits
  const quotaInfo = await checkUserQuota(supabaseClient || await getAuthenticatedSupabaseClient(), userId);
  if (!quotaInfo.canUpload) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Upload quota exceeded: ${quotaInfo.quotaExceeded.join(', ')}`,
      { ...context, userId, fileName: file?.name, fileSize: file?.size },
      { quotaInfo }
    );
  }

  try {
    // Get authenticated Supabase client
    supabaseClient = await getAuthenticatedSupabaseClient();

    // Upload file to storage
    const uploadResult = await uploadToStorage(supabaseClient, file, userId);
    uploadedStoragePath = uploadResult.path;

    // Generate signed URL for file access
    const signedUrl = await generateSignedUrl(
      supabaseClient,
      uploadResult.path
    );

    // Store PDF metadata in database
    const pdfId = await storePDFMetadata(
      supabaseClient,
      userId,
      file,
      uploadResult.path
    );

    // Record upload activity (non-critical, don't fail if this fails)
    try {
      await recordUploadActivity(supabaseClient, userId, pdfId);
    } catch (activityError) {
      // Log but don't fail the upload
      const activityServerError = createServerError(
        ServerErrorType.DATABASE_ERROR,
        "Failed to record upload activity",
        { ...context, userId, operation: "record_activity" },
        { originalError: activityError, pdfId }
      );
      logServerError(activityServerError);
    }

    // Log successful upload
    console.log(
      `✅ PDF uploaded successfully: ${file.name} (${file.size} bytes) for user ${userId}`
    );

    // Return success response
    const response: SupabaseUploadResponse = {
      success: true,
      data: {
        id: pdfId,
        filename: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        fileUrl: signedUrl,
        storagePath: uploadResult.path,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    // Enhanced cleanup with better error handling
    if (uploadedStoragePath && supabaseClient) {
      try {
        await supabaseClient.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .remove([uploadedStoragePath]);
        console.log(
          `🧹 Cleaned up uploaded file after error: ${uploadedStoragePath}`
        );
      } catch (cleanupError) {
        const cleanupServerError = createServerError(
          ServerErrorType.STORAGE_ERROR,
          "Failed to cleanup uploaded file after error",
          { ...context, userId, operation: "cleanup", fileName: file?.name },
          cleanupError
        );
        logServerError(cleanupServerError);
      }
    }

    // Re-throw to be handled by withErrorHandling wrapper
    throw error;
  }
}

// Export the wrapped handler
export const POST = withErrorHandling(handlePOST, {
  endpoint: "/api/pdfs/upload",
  method: "POST",
});
