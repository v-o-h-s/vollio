import { NextRequest, NextResponse } from "next/server";
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

/**
 * Fetches user's PDFs with pagination and sorting
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchUserPDFs(
  supabaseClient: any,
  page: number = 1,
  limit: number = API_CONFIG.DEFAULT_PAGE_SIZE
) {
  try {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseClient
      .from("pdfs")
      .select("*", { count: "exact" })
      .order("uploaded_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database query error:", error);
      throw mapSupabaseError(error);
    }

    return {
      pdfs: data || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Error in fetchUserPDFs:", error);
    throw error;
  }
}

/**
 * Fetches user's most recent activity
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchRecentActivity(supabaseClient: any) {
  try {
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
      console.error("Recent activity query error:", error);
      throw mapSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchRecentActivity:", error);
    // Don't throw for recent activity - it's not critical
    return null;
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<SupabasePDFListResponse>> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      API_CONFIG.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(
          searchParams.get("limit") || String(API_CONFIG.DEFAULT_PAGE_SIZE)
        )
      )
    );

    // Get authenticated Supabase client
    const supabaseClient = await getAuthenticatedSupabaseClient();

    // Fetch user's PDFs with retry logic
    const { pdfs: pdfRows, totalCount } = await withRetry(() =>
      fetchUserPDFs(supabaseClient, page, limit)
    );

    // Generate signed URLs for each PDF
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
          console.error(
            `Failed to generate signed URL for PDF ${pdfRow.id}:`,
            error
          );
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
      console.error("Failed to fetch recent activity:", error);
      // Continue without recent activity
    }

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
  } catch (error) {
    console.error("Error in PDF listing:", error);

    // Determine error type and appropriate response
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("Authentication failed")) {
        errorMessage = "Authentication failed";
        statusCode = 401;
      } else if (error.message.includes("AUTHENTICATION_ERROR")) {
        errorMessage = "Access denied. Please check your permissions.";
        statusCode = 403;
      } else if (error.message.includes("DATABASE_ERROR")) {
        errorMessage = "Database error occurred. Please try again.";
        statusCode = 500;
      } else if (error.message.includes("NETWORK_ERROR")) {
        errorMessage = "Network error occurred. Please try again.";
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
