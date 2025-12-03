import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Logger } from "@/lib/utils/logger";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "@/supabase/supabase";
import { SupabaseUploadResponse, StorageUploadResult } from "@/lib/types/pdf";
import { generateSignedUrl } from "@/lib/utils/supabase-helpers";
import { StorageError } from "@/lib/error-handling/StorageError";
import { DatabaseError } from "@/lib/error-handling/DatabaseError";
import { AuthError } from "@/lib/error-handling/AuthError";
import { FileValidationError } from "@/lib/error-handling/files/FileValidationError";
import { randomUUID } from "crypto";

/**
 * Generate a secure storage path for PDF files
 */
function generateSecureStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Validate PDF file upload
 */
function validatePdfFile(file: File | null): void {
  if (!file) {
    throw FileValidationError.fileRequired();
  }

  // Validate file type
  const validMimeTypes = ["application/pdf"];
  if (!validMimeTypes.includes(file.type)) {
    throw FileValidationError.invalidFileType(
      `Invalid file type: ${file.type}. Only PDF files are allowed.`,
      { fileName: file.name, fileType: file.type }
    );
  }

  // Validate file size (50MB limit)
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSizeBytes) {
    throw FileValidationError.fileTooLarge(
      `File size ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB exceeds the maximum allowed size of 50MB.`,
      { fileName: file.name, fileSize: file.size, maxSize: maxSizeBytes }
    );
  }
}

/**
 * Upload PDF file to Supabase Storage
 */
async function uploadToStorage(
  supabaseClient: any,
  file: File,
  userId: string
): Promise<StorageUploadResult> {
  const storagePath = generateSecureStoragePath(userId, file.name);

  Logger.info(`📤 Uploading file to storage: ${storagePath}`);

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
      throw StorageError.uploadFailed(
        `Storage upload failed: ${error.message}`,
        {
          fileName: file.name,
          fileSize: file.size,
          userId,
          storageError: error,
        }
      );
    }

    if (!data?.path) {
      throw StorageError.uploadFailed("Upload succeeded but no path returned", {
        fileName: file.name,
        fileSize: file.size,
        userId,
      });
    }

    Logger.success(`✅ File uploaded successfully: ${data.path}`);

    return {
      path: data.path,
      fullPath: data.fullPath || data.path,
      id: data.id || randomUUID(),
    };
  } catch (error) {
    // If it's already a StorageError, re-throw it
    if (error instanceof StorageError) {
      throw error;
    }

    // Otherwise, wrap it
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw StorageError.uploadFailed(`Storage upload failed: ${errorMessage}`, {
      fileName: file.name,
      fileSize: file.size,
      userId,
      originalError: error,
    });
  }
}

/**
 * Store PDF metadata in database
 */
async function storePDFMetadata(
  supabaseClient: any,
  userId: string,
  file: File,
  storagePath: string,
  folderId?: string | null
): Promise<string> {
  Logger.info(`💾 Storing PDF metadata in database`);

  try {
    const insertData: any = {
      user_id: userId,
      filename: file.name,
      file_size: file.size,
      storage_path: storagePath,
      mime_type: file.type,
    };

    // Add folder_id if provided
    if (folderId) {
      insertData.folder_id = folderId;
    }

    const { data, error } = await supabaseClient
      .from("pdfs")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code);
    }

    if (!data?.id) {
      throw DatabaseError.insertFailed(
        "PDF metadata stored but no ID returned",
        { fileName: file.name, fileSize: file.size, userId }
      );
    }

    Logger.success(`✅ PDF metadata stored with ID: ${data.id}`);
    return data.id;
  } catch (error) {
    // If it's already a DatabaseError, re-throw it
    if (error instanceof DatabaseError) {
      throw error;
    }

    // Otherwise, wrap it
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw DatabaseError.insertFailed(
      `Failed to store PDF metadata: ${errorMessage}`,
      { fileName: file.name, fileSize: file.size, userId, originalError: error }
    );
  }
}

/**
 * Record upload activity in user_activity table
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
    // Log but don't throw - this is non-critical
    Logger.warn(`⚠️ Failed to record upload activity`, {
      userId,
      pdfId,
      error,
    });
  }
}

/**
 * Upload PDF handler
 */
export const uploadPdfHandler = async (request: NextRequest) => {
  Logger.info("📤 Uploading PDF");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to upload PDF");
    throw AuthError.authenticationRequired();
  }

  Logger.info(`👤 Uploading PDF for user: ${userId}`);

  let uploadedStoragePath: string | null = null;
  let supabaseClient: any = null;

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    // Validate file
    validatePdfFile(file);

    // Get authenticated Supabase client
    supabaseClient = await getAuthenticatedSupabaseClient();

    // Validate folder exists and belongs to user if folderId is provided
    if (folderId) {
      const { data: folder, error: folderError } = await supabaseClient
        .from("folders")
        .select("id")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (folderError || !folder) {
        throw DatabaseError.notFound("Folder not found or access denied", {
          userId,
          folderId,
        });
      }
    }

    // Upload file to storage
    const uploadResult = await uploadToStorage(supabaseClient, file!, userId);
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
      file!,
      uploadResult.path,
      folderId
    );

    // Record upload activity (non-critical, don't fail if this fails)
    try {
      await recordUploadActivity(supabaseClient, userId, pdfId);
    } catch (activityError) {
      Logger.warn(`⚠️ Failed to record upload activity`, { activityError });
    }

    Logger.success(`📄 PDF uploaded successfully`, {
      pdfId,
      filename: file!.name,
      userId,
    });

    // Return success response
    const response: SupabaseUploadResponse = {
      success: true,
      data: {
        id: pdfId,
        filename: file!.name,
        fileSize: file!.size,
        uploadedAt: new Date().toISOString(),
        fileUrl: signedUrl,
        storagePath: uploadResult.path,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    // Enhanced cleanup: remove uploaded file if metadata storage failed
    if (uploadedStoragePath && supabaseClient) {
      try {
        await supabaseClient.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .remove([uploadedStoragePath]);
        Logger.info(
          `🧹 Cleaned up uploaded file after error: ${uploadedStoragePath}`
        );
      } catch (cleanupError) {
        Logger.error(`❌ Failed to cleanup uploaded file`, {
          uploadedStoragePath,
          cleanupError,
        });
      }
    }

    // Re-throw to be handled by withErrorHandling wrapper
    throw error;
  }
};
