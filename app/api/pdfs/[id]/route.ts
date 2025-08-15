import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "@/lib/supabaseClient";
import type { SupabasePDFAccessResponse } from "@/lib/types";
import {
  mapSupabaseError,
  withRetry,
  generateSignedUrl,
} from "@/lib/utils/supabase-helpers";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
  validateRequired,
  validateUUID,
  checkRateLimit,
  logServerError,
} from "@/lib/utils/server-error-handling";

/**
 * Fetches PDF by ID using RLS for automatic user access validation with enhanced error handling
 */
async function fetchPDFById(supabaseClient: any, pdfId: string) {
  const { data, error } = await supabaseClient
    .from("pdfs")
    .select("*")
    .eq("id", pdfId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // PDF not found or access denied by RLS
    }

    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch PDF: ${error.message}`,
      { operation: "fetch_pdf_by_id" },
      { originalError: error, pdfId }
    );
  }

  return data;
}

/**
 * Records view activity when PDF is accessed with enhanced error handling
 */
async function recordViewActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  const { error } = await supabaseClient.from("user_activity").insert({
    user_id: userId,
    pdf_id: pdfId,
    activity_type: "view",
  });

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to record view activity: ${error.message}`,
      { operation: "record_view_activity", userId },
      { originalError: error, pdfId }
    );
  }
}

// Enhanced GET handler with comprehensive error handling
async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SupabasePDFAccessResponse>> {
  const context = extractRequestContext(request, "/api/pdfs/[id]");

  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw createServerError(
      ServerErrorType.AUTHENTICATION_ERROR,
      "User not authenticated",
      { ...context, userId: undefined }
    );
  }

  const { id } = await params;

  // Enhanced validation
  validateRequired(id, "PDF ID", { ...context, userId });
  validateUUID(id, "PDF ID", { ...context, userId });

  // Rate limiting - 120 requests per minute per user
  checkRateLimit(`access:${userId}`, 120, 60000, { ...context, userId });

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Fetch PDF with retry logic (RLS automatically filters by user)
  const pdfData = await withRetry(() => fetchPDFById(supabaseClient, id));

  if (!pdfData) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "PDF not found or access denied",
      { ...context, userId, operation: "fetch_pdf" },
      { pdfId: id }
    );
  }

  // Generate fresh signed URL
  const signedUrl = await generateSignedUrl(
    supabaseClient,
    pdfData.storage_path
  );

  // Record view activity (non-critical, don't fail if this fails)
  try {
    await recordViewActivity(supabaseClient, userId, id);
  } catch (activityError) {
    // Log but don't fail the request
    const activityServerError = createServerError(
      ServerErrorType.DATABASE_ERROR,
      "Failed to record view activity",
      { ...context, userId, operation: "record_activity" },
      { originalError: activityError, pdfId: id }
    );
    logServerError(activityServerError);
  }

  // Log successful access
  console.log(
    `✅ PDF accessed successfully: ${pdfData.filename} by user ${userId}`
  );

  // Return success response
  const response: SupabasePDFAccessResponse = {
    success: true,
    data: {
      id: pdfData.id,
      filename: pdfData.filename,
      fileUrl: signedUrl,
      fileSize: pdfData.file_size,
      mimeType: pdfData.mime_type,
      uploadedAt: pdfData.uploaded_at,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handler
export const GET = withErrorHandling(handleGET, {
  endpoint: "/api/pdfs/[id]",
  method: "GET",
});

/**
 * Deletes PDF from storage with enhanced error handling
 */
async function deleteFromStorage(
  supabaseClient: any,
  storagePath: string
): Promise<void> {
  const { error } = await supabaseClient.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    throw createServerError(
      ServerErrorType.STORAGE_ERROR,
      `Failed to delete file from storage: ${error.message}`,
      { operation: "delete_from_storage" },
      { originalError: error, storagePath }
    );
  }
}

/**
 * Deletes PDF metadata from database using RLS for automatic user access validation with enhanced error handling
 */
async function deletePDFFromDatabase(supabaseClient: any, pdfId: string) {
  const { data, error } = await supabaseClient
    .from("pdfs")
    .delete()
    .eq("id", pdfId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // PDF not found or access denied by RLS
    }

    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to delete PDF from database: ${error.message}`,
      { operation: "delete_pdf_from_database" },
      { originalError: error, pdfId }
    );
  }

  return data;
}

/**
 * Records delete activity with enhanced error handling
 */
async function recordDeleteActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  const { error } = await supabaseClient.from("user_activity").insert({
    user_id: userId,
    pdf_id: pdfId,
    activity_type: "delete",
  });

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to record delete activity: ${error.message}`,
      { operation: "record_delete_activity", userId },
      { originalError: error, pdfId }
    );
  }
}

// Enhanced DELETE handler with comprehensive error handling
async function handleDELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SupabasePDFAccessResponse>> {
  const context = extractRequestContext(request, "/api/pdfs/[id]");

  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw createServerError(
      ServerErrorType.AUTHENTICATION_ERROR,
      "User not authenticated",
      { ...context, userId: undefined }
    );
  }

  const { id } = await params;

  // Enhanced validation
  validateRequired(id, "PDF ID", { ...context, userId });
  validateUUID(id, "PDF ID", { ...context, userId });

  // Rate limiting - 10 deletes per minute per user
  checkRateLimit(`delete:${userId}`, 10, 60000, { ...context, userId });

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // First, fetch the PDF to get storage path (RLS automatically verifies ownership)
  const pdfData = await withRetry(() => fetchPDFById(supabaseClient, id));

  if (!pdfData) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "PDF not found or access denied",
      { ...context, userId, operation: "fetch_for_delete" },
      { pdfId: id }
    );
  }

  // Delete from database first (RLS ensures user can only delete their own PDFs)
  const deletedPDF = await withRetry(() =>
    deletePDFFromDatabase(supabaseClient, id)
  );

  if (!deletedPDF) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "PDF not found or access denied",
      { ...context, userId, operation: "delete_from_database" },
      { pdfId: id }
    );
  }

  // Delete from storage
  await deleteFromStorage(supabaseClient, pdfData.storage_path);

  // Record delete activity (non-critical, don't fail if this fails)
  try {
    await recordDeleteActivity(supabaseClient, userId, id);
  } catch (activityError) {
    // Log but don't fail the deletion
    const activityServerError = createServerError(
      ServerErrorType.DATABASE_ERROR,
      "Failed to record delete activity",
      { ...context, userId, operation: "record_delete_activity" },
      { originalError: activityError, pdfId: id }
    );
    logServerError(activityServerError);
  }

  // Log successful deletion
  console.log(
    `✅ PDF deleted successfully: ${deletedPDF.filename} by user ${userId}`
  );

  // Return success response
  const response: SupabasePDFAccessResponse = {
    success: true,
    data: {
      id: deletedPDF.id,
      filename: deletedPDF.filename,
      fileUrl: "", // No URL needed for deleted file
      fileSize: deletedPDF.file_size,
      mimeType: deletedPDF.mime_type,
      uploadedAt: deletedPDF.uploaded_at,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handler
export const DELETE = withErrorHandling(handleDELETE, {
  endpoint: "/api/pdfs/[id]",
  method: "DELETE",
});
