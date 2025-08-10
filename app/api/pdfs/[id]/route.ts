import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAuthenticatedSupabaseClient,
  STORAGE_CONFIG,
} from "@/lib/supabaseClient";
import type { SupabasePDFAccessResponse } from "@/lib/types";
import { mapSupabaseError, withRetry,generateSignedUrl } from "@/lib/utils/supabase-helpers";

/**
 * Fetches PDF by ID using RLS for automatic user access validation
 */
async function fetchPDFById(supabaseClient: any, pdfId: string) {
  try {
    const { data, error } = await supabaseClient
      .from("pdfs")
      .select("*")
      .eq("id", pdfId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // PDF not found or access denied by RLS
      }
      console.error("Database query error:", error);
      throw mapSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchPDFById:", error);
    throw error;
  }
}

/**
 * Records view activity when PDF is accessed
 */
async function recordViewActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  try {
    const { error } = await supabaseClient.from("user_activity").insert({
      user_id: userId,
      pdf_id: pdfId,
      activity_type: "view",
    });

    if (error) {
      console.error("Activity recording error:", error);
      // Don't throw here - activity recording failure shouldn't fail the request
      console.warn("Failed to record view activity, but PDF access succeeded");
    }
  } catch (error) {
    console.error("Error in recordViewActivity:", error);
    // Don't throw - this is non-critical
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SupabasePDFAccessResponse>> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "PDF ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid PDF ID format" },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const supabaseClient = await getAuthenticatedSupabaseClient();

    // Fetch PDF with retry logic (RLS automatically filters by user)
    const pdfData = await withRetry(() => fetchPDFById(supabaseClient, id));

    if (!pdfData) {
      return NextResponse.json(
        { success: false, error: "PDF not found" },
        { status: 404 }
      );
    }

    // Generate fresh signed URL
    const signedUrl = await generateSignedUrl(
      supabaseClient,
      pdfData.storage_path
    );

    // Record view activity (non-critical, don't fail if this fails)
    await recordViewActivity(supabaseClient, userId, id);

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
  } catch (error) {
    console.error("Error fetching PDF:", error);

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
      } else if (error.message.includes("Failed to generate signed URL")) {
        errorMessage = "File access error. Please try again.";
        statusCode = 500;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Deletes PDF from storage
 */
async function deleteFromStorage(
  supabaseClient: any,
  storagePath: string
): Promise<void> {
  try {
    const { error } = await supabaseClient.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error("Storage deletion error:", error);
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in deleteFromStorage:", error);
    throw error;
  }
}

/**
 * Deletes PDF metadata from database using RLS for automatic user access validation
 */
async function deletePDFFromDatabase(supabaseClient: any, pdfId: string) {
  try {
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
      console.error("Database deletion error:", error);
      throw mapSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error("Error in deletePDFFromDatabase:", error);
    throw error;
  }
}

/**
 * Records delete activity
 */
async function recordDeleteActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  try {
    const { error } = await supabaseClient.from("user_activity").insert({
      user_id: userId,
      pdf_id: pdfId,
      activity_type: "delete",
    });

    if (error) {
      console.error("Delete activity recording error:", error);
      // Don't throw here - activity recording failure shouldn't fail the deletion
      console.warn("Failed to record delete activity, but deletion succeeded");
    }
  } catch (error) {
    console.error("Error in recordDeleteActivity:", error);
    // Don't throw - this is non-critical
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SupabasePDFAccessResponse>> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "PDF ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid PDF ID format" },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const supabaseClient = await getAuthenticatedSupabaseClient();

    // First, fetch the PDF to get storage path (RLS automatically verifies ownership)
    const pdfData = await withRetry(() => fetchPDFById(supabaseClient, id));

    if (!pdfData) {
      return NextResponse.json(
        { success: false, error: "PDF not found" },
        { status: 404 }
      );
    }

    // Delete from database first (RLS ensures user can only delete their own PDFs)
    const deletedPDF = await withRetry(() =>
      deletePDFFromDatabase(supabaseClient, id)
    );

    if (!deletedPDF) {
      return NextResponse.json(
        { success: false, error: "PDF not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    await deleteFromStorage(supabaseClient, pdfData.storage_path);

    // Record delete activity (non-critical, don't fail if this fails)
    await recordDeleteActivity(supabaseClient, userId, id);

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
  } catch (error) {
    console.error("Error deleting PDF:", error);

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
      } else if (error.message.includes("Failed to delete file from storage")) {
        errorMessage = "File deletion error. Please try again.";
        statusCode = 500;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
