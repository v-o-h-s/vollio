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

/**
 * Fetches all user's PDFs with sorting
 * Uses RLS policies to automatically filter by authenticated user
 */
async function fetchUserPDFs(supabaseClient: any, userId: string) {
  try {
    // Test the requesting_user_id function first
    // try {
    //   const { data: userIdData, error: userIdError } = await supabaseClient.rpc(
    //     "requesting_user_id"
    //   );
    //   console.log("requesting_user_id result:", userIdData);
    //   if (userIdError) {
    //     console.error("requesting_user_id error:", userIdError);
    //   }

    //   // Debug: Let's see what's actually in the JWT claims
    //   const { data: jwtClaims, error: jwtError } = await supabaseClient.rpc(
    //     "get_jwt_claims"
    //   );
    //   console.log("JWT claims debug:", JSON.stringify(jwtClaims, null, 2));
    //   if (jwtError) {
    //     console.error("JWT claims error:", jwtError);
    //   }
    // } catch (rpcError) {
    //   console.error("RPC call failed:", rpcError);
    // }

    // Now try the query with RLS (no manual user_id filter needed)
    console.log("Attempting to query pdfs table with RLS...");

    const { data, error, count } = await supabaseClient
      .from("pdfs")
      .select("*", { count: "exact" })
      .order("uploaded_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Database query error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw mapSupabaseError(error);
    }

    // console.log("Successfully fetched PDFs:", data?.length || 0);

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

export async function GET(): Promise<NextResponse<SupabasePDFListResponse>> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get authenticated Supabase client with proper RLS
    const supabaseClient = await getAuthenticatedSupabaseClient();

    // Fetch user's PDFs with retry logic
    const { pdfs: pdfRows, totalCount } = await withRetry(() =>
      fetchUserPDFs(supabaseClient, userId)
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
