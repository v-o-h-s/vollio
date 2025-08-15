import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
  API_CONFIG,
} from "@/lib/supabaseClient";
import type { SupabasePDFListResponse } from "@/lib/types";
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
  checkRateLimit,
  logServerError
} from "@/lib/utils/server-error-handling";

/**
 * Fetches all user's PDFs with sorting and enhanced error handling
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchUserPDFs(supabaseClient: any, userId: string) {
  const { data, error, count } = await supabaseClient
    .from("pdfs")
    .select("*", { count: "exact" })
    .order("uploaded_at", { ascending: false })
    .limit(50);

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch user PDFs: ${error.message}`,
      { 
        operation: 'fetch_user_pdfs',
        userId 
      },
      error
    );
  }

  return {
    pdfs: data || [],
    totalCount: count || 0,
  };
}

/**
 * Fetches user's most recent activity with enhanced error handling
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchRecentActivity(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from("user_activity")
    .select(
      `
      *,
      pdfs (
        id,
        filename,
        storage_path
      )
    `
    )
    .eq("activity_type", "view")
    .order("accessed_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // If no recent activity found, return null instead of throwing
    if (error.code === "PGRST116") {
      return null;
    }
    
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch recent activity: ${error.message}`,
      { operation: 'fetch_recent_activity' },
      error
    );
  }

  return data;
}

// Enhanced GET handler with comprehensive error handling
async function handleGET(): Promise<NextResponse<SupabasePDFListResponse>> {
  const context = { endpoint: '/api/pdfs', method: 'GET' };

  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw createServerError(
      ServerErrorType.AUTHENTICATION_ERROR,
      'User not authenticated',
      { ...context, userId: undefined }
    );
  }

  // Rate limiting - 60 requests per minute per user
  checkRateLimit(`list:${userId}`, 60, 60000, { ...context, userId });

  // Get authenticated Supabase client with proper RLS
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Fetch user's PDFs with retry logic
  const { pdfs: pdfRows, totalCount } = await withRetry(() =>
    fetchUserPDFs(supabaseClient, userId)
  );

  // Generate signed URLs for each PDF with enhanced error handling
  const pdfsWithUrls = await Promise.all(
    pdfRows.map(async (pdfRow: any) => {
      try {
        const signedUrl = await generateSignedUrl(
          supabaseClient,
          pdfRow.storage_path
        );
        return {
          id: pdfRow.id,
          filename: pdfRow.filename,
          fileSize: pdfRow.file_size,
          uploadedAt: pdfRow.uploaded_at,
          fileUrl: signedUrl,
          mimeType: pdfRow.mime_type,
        };
      } catch (error) {
        // Log the error but don't fail the entire request
        const signedUrlError = createServerError(
          ServerErrorType.STORAGE_ERROR,
          `Failed to generate signed URL for PDF ${pdfRow.id}`,
          { ...context, userId, operation: 'generate_signed_url', fileName: pdfRow.filename },
          error
        );
        logServerError(signedUrlError);

        // Return PDF without URL rather than failing the entire request
        return {
          id: pdfRow.id,
          filename: pdfRow.filename,
          fileSize: pdfRow.file_size,
          uploadedAt: pdfRow.uploaded_at,
          fileUrl: "", // Empty URL indicates error
          mimeType: pdfRow.mime_type,
        };
      }
    })
  );

  // Fetch recent activity (non-critical, don't fail if this fails)
  let recentActivity = null;
  try {
    const activityData = await fetchRecentActivity(supabaseClient);
    if (activityData && activityData.pdfs) {
      const activitySignedUrl = await generateSignedUrl(
        supabaseClient,
        activityData.pdfs.storage_path
      );
      recentActivity = {
        pdfId: activityData.pdf_id,
        filename: activityData.pdfs.filename,
        accessedAt: activityData.accessed_at,
        fileUrl: activitySignedUrl,
        activityType: activityData.activity_type as
          | "view"
          | "upload"
          | "delete",
      };
    }
  } catch (error) {
    // Log but don't fail the request
    const activityError = createServerError(
      ServerErrorType.DATABASE_ERROR,
      'Failed to fetch recent activity',
      { ...context, userId, operation: 'fetch_recent_activity' },
      error
    );
    logServerError(activityError);
  }

  // Log successful request
  console.log(`✅ PDF list fetched successfully for user ${userId}: ${pdfsWithUrls.length} PDFs`);

  // Return success response
  const response: SupabasePDFListResponse = {
    success: true,
    data: {
      pdfs: pdfsWithUrls,
      recentActivity: recentActivity || undefined,
      totalCount,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handler
export const GET = withErrorHandling(
  handleGET,
  { endpoint: '/api/pdfs', method: 'GET' }
);
