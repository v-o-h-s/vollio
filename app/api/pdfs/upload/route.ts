import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "@/lib/supabaseClient";
import { SupabaseUploadResponse, StorageUploadResult } from "@/lib/types";
import { validateFile, generateSignedUrl } from "@/lib/utils/supabase-helpers";
import { 
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
  validateRequired,
  validateFileUpload,
  checkRateLimit,
  logServerError
} from "@/lib/utils/server-error-handling";
import { randomUUID } from "crypto";

/**
 * Uploads file to Supabase Storage with enhanced error handling
 */
async function uploadToStorage(
  supabaseClient: any,
  file: File,
  userId: string
): Promise<StorageUploadResult> {
  const storagePath = generateStoragePath(userId, file.name);
  
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
          operation: 'storage_upload',
          fileName: file.name,
          fileSize: file.size,
          userId 
        },
        error
      );
    }

    if (!data?.path) {
      throw createServerError(
        ServerErrorType.STORAGE_ERROR,
        'Upload succeeded but no path returned',
        { 
          operation: 'storage_upload',
          fileName: file.name,
          fileSize: file.size,
          userId 
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
    if (error.type) {
      throw error;
    }
    
    // Otherwise, wrap it
    throw createServerError(
      ServerErrorType.STORAGE_ERROR,
      `Storage upload failed: ${error.message || 'Unknown error'}`,
      { 
        operation: 'storage_upload',
        fileName: file.name,
        fileSize: file.size,
        userId 
      },
      error
    );
  }
}

// Generate storage path for user's PDF
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
          operation: 'database_insert',
          fileName: file.name,
          fileSize: file.size,
          userId 
        },
        error
      );
    }

    if (!data?.id) {
      throw createServerError(
        ServerErrorType.DATABASE_ERROR,
        'PDF metadata stored but no ID returned',
        { 
          operation: 'database_insert',
          fileName: file.name,
          fileSize: file.size,
          userId 
        }
      );
    }

    return data.id;
  } catch (error) {
    // If it's already a ServerError, re-throw it
    if (error.type) {
      throw error;
    }
    
    // Otherwise, wrap it
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Database operation failed: ${error.message || 'Unknown error'}`,
      { 
        operation: 'database_insert',
        fileName: file.name,
        fileSize: file.size,
        userId 
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
        operation: 'record_activity',
        userId,
        pdfId 
      },
      error
    );
  }
}

// Enhanced POST handler with comprehensive error handling
async function handlePOST(request: NextRequest): Promise<NextResponse<SupabaseUploadResponse>> {
  let uploadedStoragePath: string | null = null;
  let supabaseClient: any = null;
  const context = extractRequestContext(request, '/api/pdfs/upload');

  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw createServerError(
      ServerErrorType.AUTHENTICATION_ERROR,
      'User not authenticated',
      { ...context, userId }
    );
  }

  // Rate limiting - 10 uploads per minute per user
  checkRateLimit(`upload:${userId}`, 10, 60000, { ...context, userId });

  // Parse form data
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // Enhanced file validation
  validateRequired(file, 'file', { ...context, userId });
  validateFileUpload(
    file,
    STORAGE_CONFIG.MAX_FILE_SIZE,
    STORAGE_CONFIG.ALLOWED_MIME_TYPES,
    { ...context, userId, fileName: file?.name, fileSize: file?.size }
  );

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
        'Failed to record upload activity',
        { ...context, userId, operation: 'record_activity' },
        activityError
      );
      logServerError(activityServerError);
    }

    // Log successful upload
    console.log(`✅ PDF uploaded successfully: ${file.name} (${file.size} bytes) for user ${userId}`);

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
        console.log(`🧹 Cleaned up uploaded file after error: ${uploadedStoragePath}`);
      } catch (cleanupError) {
        const cleanupServerError = createServerError(
          ServerErrorType.STORAGE_ERROR,
          'Failed to cleanup uploaded file after error',
          { ...context, userId, operation: 'cleanup', fileName: file?.name },
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
export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/pdfs/upload', method: 'POST' }
);
