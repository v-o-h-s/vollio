// TODO pls stop using any
import { NextRequest, NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/utils/supabase-helpers";
import type { SupabasePDFListResponse } from "@/lib/types/pdf";

import { AuthError, DatabaseError } from "@/lib/error-handling";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { Logger } from "@/lib/utils/logger";
import { createClient } from "@/lib/supabase/server";

/**
 * Fetches all user's PDFs with sorting and enhanced error handling
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchUserPDFs(supabaseClient: any) {
  Logger.debug("Fetching user PDFs from database");
  const startTime = performance.now();

  const { data, error, count } = await supabaseClient
    .from("pdfs")
    .select(
      `
      *,
      folders (
        id,
        name,
        parent_id
      )
    `,
      { count: "exact" }
    )
    .order("uploaded_at", { ascending: false })
    .limit(50);

  const duration = performance.now() - startTime;

  if (error) {
    if (error.code === "PGRST116") {
      Logger.debug("No PDFs found for user (PGRST116)");
      return null;
    }
    Logger.error("Database query failed for fetchUserPDFs", {
      error,
      duration,
    });
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error.code,
      `Failed to fetch user PDFs: ${error.message}`,
      { operation: "fetch_user_pdfs" }
    );
  }

  const pdfCount = data?.length || 0;
  Logger.debug(`Successfully fetched ${pdfCount} PDFs`, {
    duration,
    totalCount: count,
  });

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
  Logger.debug("Fetching recent activity from database");
  const startTime = performance.now();

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

  const duration = performance.now() - startTime;

  if (error) {
    if (error.code === "PGRST116") {
      Logger.debug("No recent activity found (PGRST116)");
      return null;
    }

    Logger.error("Database query failed for fetchRecentActivity", {
      error,
      duration,
    });
    throw DatabaseError.general(
      `Failed to fetch recent activity: ${error.message}`,
      { operation: "fetch_recent_activity" },
      error
    );
  }

  Logger.debug("Successfully fetched recent activity", { duration });
  return data;
}

async function attachFileWithUrls(supabaseClient: any, pdfs: any[]) {
  Logger.debug(`Generating signed URLs for ${pdfs.length} PDFs`);
  const startTime = performance.now();

  try {
    const result = await Promise.all(
      pdfs.map(async (pdf, index) => {
        // Handle Google Drive files (they have google_file_id but no storage_path)
        if (!pdf.storage_path) {
          if (pdf.google_file_id) {
            Logger.debug(`PDF ${pdf.id} is a Google Drive file`, {
              pdfId: pdf.id,
              filename: pdf.filename,
              googleFileId: pdf.google_file_id,
            });
            // For Google Drive files, we'll use a special URL or fetch it via API
            return {
              ...pdf,
              fileUrl: `/api/files/google-drive/${pdf.google_file_id}`,
              isGoogleDriveFile: true,
            };
          } else {
            Logger.warn(`PDF ${pdf.id} has null storage_path and no google_file_id`, {
              pdfId: pdf.id,
              filename: pdf.filename,
            });
            return {
              ...pdf,
              fileUrl: null,
            };
          }
        }

        try {
          const signedUrl = await generateSignedUrl(
            supabaseClient,
            pdf.storage_path
          );
          return {
            ...pdf,
            fileUrl: signedUrl,
            isGoogleDriveFile: false,
          };
        } catch (error) {
          Logger.error(`Failed to generate signed URL for PDF ${pdf.id}`, {
            error,
            pdfId: pdf.id,
            filename: pdf.filename,
            storagePath: pdf.storage_path,
          });
          // Return the PDF without a signed URL rather than failing entirely
          return {
            ...pdf,
            fileUrl: null,
          };
        }
      })
    );

    const duration = performance.now() - startTime;
    Logger.debug(`Generated signed URLs in ${duration}ms`);
    return result;
  } catch (error) {
    Logger.error("Failed to attach file URLs", {
      error,
      pdfCount: pdfs.length,
    });
    throw error;
  }
}

async function handleGET(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  Logger.info("GET /api/pdfs request received");

  // Get authenticated Supabase client with proper RLS
  Logger.debug("Initializing authenticated Supabase client");
  const supabaseClient = await createClient();

  // Fetch user's PDFs with retry logic
  Logger.debug("Starting PDF fetch operation");
  const result = await fetchUserPDFs(supabaseClient);
  if (!result) {
    Logger.info(`No PDFs found for user`);
    return NextResponse.json({ success: true, data: null }, { status: 200 });
  }

  const { pdfs: pdfRows, totalCount } = result;

  // Generate signed URLs for each PDF with enhanced error handling
  // TODO : The implementation of the code below is not good for performance + recent activity feature is temporarily disabled
  Logger.debug(`Attaching file URLs to ${pdfRows.length} PDFs`);
  const pdfsWithUrls = await attachFileWithUrls(supabaseClient, pdfRows);

  const totalDuration = performance.now() - startTime;

  // Log successful request
  Logger.info(
    `✅ PDF list fetched successfully for user: ${pdfsWithUrls.length} PDFs`,
    { totalCount, duration: totalDuration }
  );

  // Return success response
  const response: SupabasePDFListResponse = {
    success: true,
    data: {
      pdfs: pdfsWithUrls,
      totalCount,
    },
  };
  return NextResponse.json(response, { status: 200 });
}

// Enhanced GET handler with comprehensive error handling
export const GET = withErrorHandling(handleGET);
