// TODO pls stop using any
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { generateSignedUrl, getTokenForTesting } from "@/lib/utils/supabase-helpers";
import type { SupabasePDFListResponse } from "@/lib/types/pdf";

import { AuthError, DatabaseError } from "@/lib/utils/error-handling";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { Logger } from "@/lib/utils/logger";

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
    Logger.error("Database query failed for fetchUserPDFs", { error, duration });
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code,
      `Failed to fetch user PDFs: ${error.message}`,
      { operation: "fetch_user_pdfs" },
    );
  }

  const pdfCount = data?.length || 0;
  Logger.debug(`Successfully fetched ${pdfCount} PDFs`, { duration, totalCount: count });

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

    Logger.error("Database query failed for fetchRecentActivity", { error, duration });
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
        
        const signedUrl = await generateSignedUrl(supabaseClient, pdf.storage_path);
        return {
          ...pdf,
          fileUrl: signedUrl,
        };
      })
    );


    return result;
  } catch (error) {
    Logger.error("Failed to attach file URLs", { error, pdfCount: pdfs.length });
    throw error;
  }
}

async function handleGET(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  Logger.info("GET /api/pdfs request received");

  // Get auth session with token
  const { userId, getToken, sessionId } = await auth();

  //testing
  //const supabaseToken = await getTokenForTesting(getToken,sessionId);
  //Logger.debug("Supabase token obtained for testing", { supabaseToken });

  if (!userId) {
    Logger.warn("GET /api/pdfs: Authentication failed - no userId");
    throw AuthError.authenticationRequired();
  }



  Logger.debug(`Authenticated user: ${userId}`);

  // Get authenticated Supabase client with proper RLS
  Logger.debug("Initializing authenticated Supabase client");
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Fetch user's PDFs with retry logic
  Logger.debug("Starting PDF fetch operation");
  const result = await fetchUserPDFs(supabaseClient);
  if (!result) {
    Logger.info(`No PDFs found for user ${userId}`);
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
    `✅ PDF list fetched successfully for user ${userId}: ${pdfsWithUrls.length} PDFs`,
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