import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/utils/error-handling/server-error-handling";
import {
  requireAuthentication,
  validateAuthentication,
} from "@/lib/utils/auth-validation";
import { checkEnhancedRateLimit } from "@/lib/utils/security-validation";

interface MovePDFRequest {
  folderId: string | null;
}

interface MovePDFResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Moves a PDF to a different folder
 */
async function movePDF(
  supabaseClient: any,
  userId: string,
  pdfId: string,
  folderId: string | null
): Promise<any> {
  // Validate PDF exists and belongs to user
  const { data: existingPDF, error: fetchError } = await supabaseClient
    .from("pdfs")
    .select("*")
    .eq("id", pdfId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingPDF) {
    throw createServerError(
      ServerErrorType.NOT_FOUND_ERROR,
      "PDF not found or access denied",
      { operation: 'validate_pdf', userId, pdfId }
    );
  }

  // Validate folder exists and belongs to user if folderId is provided
  if (folderId) {
    const { data: targetFolder, error: folderError } = await supabaseClient
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single();

    if (folderError || !targetFolder) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "Target folder not found or access denied",
        { operation: 'validate_folder', userId, folderId }
      );
    }
  }

  // Update the PDF's folder
  const { data, error } = await supabaseClient
    .from("pdfs")
    .update({ folder_id: folderId })
    .eq("id", pdfId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to move PDF: ${error.message}`,
      { 
        operation: 'move_pdf',
        userId,
        pdfId,
        folderId
      },
      error
    );
  }

  return data;
}

// PATCH handler - Move PDF to folder
async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<MovePDFResponse>> {
  const resolvedParams = await params;
  const pdfId = resolvedParams.id;
  const context = extractRequestContext(request, `/api/pdfs/${pdfId}/move`);

  // Enhanced authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Enhanced rate limiting for API calls
  checkEnhancedRateLimit(userId, 'API_CALLS', { ...context, userId });

  // Parse request body
  const body: MovePDFRequest = await request.json();

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Move the PDF
  const updatedPDF = await movePDF(supabaseClient, userId, pdfId, body.folderId);

  // Log successful move
  console.log(`✅ PDF moved successfully: ${pdfId} to folder ${body.folderId || 'root'} for user ${userId}`);

  // Return success response
  const response: MovePDFResponse = {
    success: true,
    data: updatedPDF,
    message: "PDF moved successfully",
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handler
export const PATCH = withErrorHandling(
  handlePATCH,
  { endpoint: '/api/pdfs/[id]/move', method: 'PATCH' }
);