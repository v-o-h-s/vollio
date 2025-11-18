// TODO pls stop using any
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withRetry, generateSignedUrl } from "@/lib/utils/supabase-helpers";
import type { SupabasePDFListResponse } from "@/lib/types/pdf";

import { AuthError, DatabaseError, GeneralError, withErrorHandler } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";

/**
 * Fetches all user's PDFs with sorting and enhanced error handling
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchUserPDFs(supabaseClient: any) {
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

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    Logger.error("Failed to fetch user PDFs", error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code,
      `Failed to fetch user PDFs: ${error.message}`,
      { operation: "fetch_user_pdfs" },
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

    throw DatabaseError.general(
      `Failed to fetch recent activity: ${error.message}`,
      { operation: "fetch_recent_activity" },
      error
    );
  }

  return data;
}

async function attachFileWithUrls(supabaseClient: any, pdfs: any[]) {
  // for pdfs you may create interface for supabase responses , it would be better if you map the moment you get teh response
  return Promise.all(
    pdfs.map(async (pdf) => {
      const signedUrl = await generateSignedUrl(supabaseClient, pdf.storage_path);
      return {
        ...pdf,
        fileUrl: signedUrl,
      };
    })
  );
}

async function handleGET(request: NextRequest): Promise<NextResponse> {
  Logger.debug("hitting GET request for /api/pdfs");
  const { userId } = await auth();
  if (!userId) {
    throw AuthError.authenticationRequired();
  }

  // Get authenticated Supabase client with proper RLS
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Fetch user's PDFs with retry logic
  const result = await fetchUserPDFs(supabaseClient);
  if (!result) {
    return NextResponse.json({ success: true, data: null }, { status: 200 });

  }
  const { pdfs: pdfRows, totalCount } = result;

  // Generate signed URLs for each PDF with enhanced error handling
  // TODO : The implementation of the code below is not good for performance + recent activity feature is temporarily disabled
  const pdfsWithUrls = await attachFileWithUrls(supabaseClient, pdfRows);

  // Log successful request
  Logger.debug(
    `✅ PDF list fetched successfully for user ${userId}: ${pdfsWithUrls.length} PDFs`
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
export const GET = withErrorHandler(
  handleGET as any
);