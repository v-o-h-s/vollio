import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "@/lib/supabaseClient";
import {
  SupabaseUploadResponse,
  FileValidationResult,
  StorageUploadResult,
} from "@/lib/types";

/**
 * Validates uploaded file for security and format requirements
 */
function validateFile(file: File): FileValidationResult {
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

/**
 * Uploads file to Supabase Storage
 */
async function uploadToStorage(
  supabaseClient: any,
  file: File,
  userId: string
): Promise<StorageUploadResult> {
  try {
    // Generate unique storage path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 11);
    const fileExtension = file.name.split(".").pop() || "pdf";
    const storagePath = `${userId}/${timestamp}_${randomId}.${fileExtension}`;

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
      console.error("Storage upload error:", error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error("Upload succeeded but no path returned");
    }

    return {
      path: data.path,
      fullPath: data.fullPath || data.path,
      id: data.id || randomId,
    };
  } catch (error) {
    console.error("Error in uploadToStorage:", error);
    throw error;
  }
}

/**
 * Generates signed URL for file access
 */
async function generateSignedUrl(
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

/**
 * Stores PDF metadata in database
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
      console.error("Database insert error:", error);
      throw new Error(`Failed to store PDF metadata: ${error.message}`);
    }

    if (!data?.id) {
      throw new Error("PDF metadata stored but no ID returned");
    }

    return data.id;
  } catch (error) {
    console.error("Error in storePDFMetadata:", error);
    throw error;
  }
}

/**
 * Records upload activity in user_activity table
 */
async function recordUploadActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  try {
    const { error } = await supabaseClient.from("user_activity").insert({
      user_id: userId,
      pdf_id: pdfId,
      activity_type: "upload",
    });

    if (error) {
      console.error("Activity recording error:", error);
      // Don't throw here - activity recording failure shouldn't fail the upload
      console.warn("Failed to record upload activity, but upload succeeded");
    }
  } catch (error) {
    console.error("Error in recordUploadActivity:", error);
    // Don't throw - this is non-critical
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SupabaseUploadResponse>> {
  let uploadedStoragePath: string | null = null;
  let supabaseClient: any = null;

  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    supabaseClient = await getAuthenticatedSupabaseClient();

    // Upload file to storage
    const uploadResult = await uploadToStorage(supabaseClient, file, userId);
    uploadedStoragePath = uploadResult.path;

    // Store PDF metadata in database
    const pdfId = await storePDFMetadata(
      supabaseClient,
      userId,
      file,
      uploadResult.path
    );

    // Record upload activity (non-critical, don't fail if this fails)
    await recordUploadActivity(supabaseClient, userId, pdfId);

    // Generate signed URL for immediate access
    const signedUrl = await generateSignedUrl(
      supabaseClient,
      uploadResult.path
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
    console.error("Error in PDF upload:", error);

    // Cleanup: If storage upload succeeded but database insert failed,
    // attempt to delete the uploaded file
    if (uploadedStoragePath && supabaseClient) {
      try {
        await supabaseClient.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .remove([uploadedStoragePath]);
        console.log("Cleaned up uploaded file after database error");
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded file:", cleanupError);
      }
    }

    // Determine error type and appropriate response
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("Authentication failed")) {
        errorMessage = "Authentication failed";
        statusCode = 401;
      } else if (error.message.includes("Storage upload failed")) {
        errorMessage = "File upload failed. Please try again.";
        statusCode = 500;
      } else if (error.message.includes("Failed to store PDF metadata")) {
        errorMessage =
          "File uploaded but failed to save metadata. Please try again.";
        statusCode = 500;
      } else if (error.message.includes("Failed to generate signed URL")) {
        errorMessage =
          "File uploaded successfully but access URL generation failed";
        statusCode = 500;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
